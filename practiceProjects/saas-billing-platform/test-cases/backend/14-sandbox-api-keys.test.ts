/**
 * @file Sandbox & API Keys Backend TypeScript Jest Tests
 * @feature FEAT-API-02
 */

import request from 'supertest';
import app from '../../src/app';
import { MERCHANT_API_KEY } from '../../src/models';
import crypto from 'crypto';

describe('Dev Sandbox & API Keys - Backend [FEAT-API-02]', () => {
  
  /**
   * @id TC-BE-API-02-01
   * @requirement FR-API-02-01
   * @acceptance AC-API-02-02
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-API-02-01: Generate API credentials containing environment prefixes', async () => {
    const response = await request(app)
      .post('/v1/developer/keys/rotate')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        key_environment: 'test',
        safe_migration_mode: false
      });

    expect(response.status).toBe(200);
    expect(response.body.publishable_key).toMatch(/^pk_test_/);
    expect(response.body.new_secret_key).toMatch(/^sk_test_/);
  });

  /**
   * @id TC-BE-API-02-02
   * @requirement FR-API-02-02, FR-API-02-03
   * @acceptance AC-API-02-01
   * @priority CRITICAL
   * @type Sandbox Isolation
   */
  test('TC-BE-API-02-02: Test keys restrict actions to sandbox tables and mock gateways', async () => {
    const response = await request(app)
      .post('/v1/subscriptions')
      .set('Authorization', 'Bearer sk_test_mock_sandbox_key')
      .send({
        customer_id: 'cust_8f9024j94j',
        plan_id: 'plan_9aj98f82ja'
      });

    expect(response.status).toBe(201);
    expect(response.body.gateway_environment).toBe('test_sandbox');
  });

  /**
   * @id TC-BE-API-02-03
   * @requirement SEC-API-02-01
   * @acceptance AC-API-02-03
   * @priority CRITICAL
   * @type Security / Database
   */
  test('TC-BE-API-02-03: API keys database columns save only SHA-256 hashes of private secrets', async () => {
    const rotationResponse = await request(app)
      .post('/v1/developer/keys/rotate')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({ key_environment: 'test', safe_migration_mode: false });

    const rawSecret = rotationResponse.body.new_secret_key;
    const hashedSecret = crypto.createHash('sha256').update(rawSecret).digest('hex');

    const keyRecord = await MERCHANT_API_KEY.findOne({ where: { key_hash: hashedSecret } });
    expect(keyRecord).toBeDefined();

    const rawCheck = await MERCHANT_API_KEY.findOne({ where: { key_hash: rawSecret } });
    expect(rawCheck).toBeNull();
  });
});
