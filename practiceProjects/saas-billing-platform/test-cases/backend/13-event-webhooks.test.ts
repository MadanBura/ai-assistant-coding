/**
 * @file Event Stream & Webhooks Backend TypeScript Jest Tests
 * @feature FEAT-API-01
 */

import request from 'supertest';
import app from '../../src/app';
import crypto from 'crypto';
import nock from 'nock';

describe('Event Stream & Webhooks - Backend [FEAT-API-01]', () => {
  
  /**
   * @id TC-BE-API-01-01
   * @requirement FR-API-01-02
   * @acceptance AC-API-01-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-API-01-01: Register webhook configuration endpoint successfully', async () => {
    const response = await request(app)
      .post('/v1/webhooks/endpoints')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        url: 'https://api.merchant.com/v1/billing-webhooks',
        enabled_events: ['invoice.paid', 'subscription.canceled']
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('secret_key');
  });

  /**
   * @id TC-BE-API-01-02
   * @requirement VAL-API-01-01
   * @priority HIGH
   * @type Validation / Negative
   */
  test('TC-BE-API-01-02: Block registrations attempting HTTP endpoints', async () => {
    const response = await request(app)
      .post('/v1/webhooks/endpoints')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        url: 'http://api.merchant.com/unsecured-endpoint',
        enabled_events: ['invoice.paid']
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('HTTPS_REQUIRED');
  });

  /**
   * @id TC-BE-API-01-03
   * @requirement FR-API-01-03, FR-API-01-04
   * @acceptance AC-API-01-01
   * @priority CRITICAL
   * @type Security
   */
  test('TC-BE-API-01-03: Webhook payload includes verified HMAC signature header', async () => {
    const mockSecret = 'whsec_test_secret_key';
    const mockPayload = { id: 'evt_test_001', type: 'invoice.paid' };

    const scope = nock('https://api.merchant.com')
      .post('/v1/billing-webhooks', (body) => body.id === 'evt_test_001')
      .matchHeader('X-Aura-Signature', (val) => {
        const expectedSig = crypto
          .createHmac('sha256', mockSecret)
          .update(JSON.stringify(mockPayload))
          .digest('hex');
        return val === expectedSig;
      })
      .reply(200);

    const webhookService = require('../../src/services/webhookService');
    await webhookService.dispatchDirect('https://api.merchant.com/v1/billing-webhooks', mockPayload, mockSecret);

    expect(scope.isDone()).toBe(true);
  });
});
