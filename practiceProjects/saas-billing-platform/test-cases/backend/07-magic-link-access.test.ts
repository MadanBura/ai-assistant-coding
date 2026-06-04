/**
 * @file Passwordless Magic-Link Access Backend TypeScript Jest Tests
 * @feature FEAT-PORT-01
 */

import request from 'supertest';
import app from '../../src/app';
import redis from '../../src/lib/redis';

describe('Passwordless Magic-Link Access - Backend [FEAT-PORT-01]', () => {
  
  beforeEach(async () => {
    await redis.flushall();
  });

  /**
   * @id TC-BE-PORT-01-01
   * @requirement FR-PORT-01-01, FR-PORT-01-02
   * @acceptance AC-PORT-01-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-PORT-01-01: Generate token and dispatch magic link email successfully', async () => {
    const response = await request(app)
      .post('/v1/portal/session/request')
      .send({
        email: 'customer@company.com',
        merchant_id: 'merch_19f38f9024'
      });

    expect(response.status).toBe(202);
    expect(response.body.status).toBe('sent');
  });

  /**
   * @id TC-BE-PORT-01-02
   * @requirement SEC-PORT-01-01
   * @priority CRITICAL
   * @type Security
   */
  test('TC-BE-PORT-01-02: Store SHA-256 hash of tokens in cache, never plaintext', async () => {
    const tokenGenerator = require('../../src/services/tokenService');
    const { token, tokenHash } = tokenGenerator.generatePortalToken('cust_8f9024j94j');

    const value = await redis.get(`portal_token:${tokenHash}`);
    expect(value).toBe('cust_8f9024j94j');

    const rawCheck = await redis.get(`portal_token:${token}`);
    expect(rawCheck).toBeNull();
  });

  /**
   * @id TC-BE-PORT-01-03
   * @requirement FR-PORT-01-03, FR-PORT-01-05
   * @acceptance AC-PORT-01-03
   * @priority HIGH
   * @type Expiry
   */
  test('TC-BE-PORT-01-03: Invalidate magic links older than 15 minutes', async () => {
    const tokenGenerator = require('../../src/services/tokenService');
    const { token, tokenHash } = tokenGenerator.generatePortalToken('cust_8f9024j94j');

    await redis.pexpire(`portal_token:${tokenHash}`, 1);

    const response = await request(app)
      .post('/v1/portal/session/confirm')
      .send({ token });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('TOKEN_EXPIRED');
  });

  /**
   * @id TC-BE-PORT-01-04
   * @requirement FR-PORT-01-05
   * @acceptance AC-PORT-01-02
   * @priority CRITICAL
   * @type Security / Functional
   */
  test('TC-BE-PORT-01-04: Confirming magic link issues cookie and revokes token', async () => {
    const tokenGenerator = require('../../src/services/tokenService');
    const { token, tokenHash } = tokenGenerator.generatePortalToken('cust_8f9024j94j');

    const response = await request(app)
      .post('/v1/portal/session/confirm')
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie'][0]).toContain('portal_session=');
    
    const cachedToken = await redis.get(`portal_token:${tokenHash}`);
    expect(cachedToken).toBeNull();
  });
});
