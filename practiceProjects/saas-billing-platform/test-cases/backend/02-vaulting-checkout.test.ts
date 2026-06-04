/**
 * @file Vaulting & Checkout Backend TypeScript Jest Tests
 * @feature FEAT-PAY-01
 */

import request from 'supertest';
import app from '../../src/app';

describe('Vaulting & Checkout - Backend [FEAT-PAY-01]', () => {
  
  /**
   * @id TC-BE-PAY-01-01
   * @requirement FR-PAY-01-01, FR-PAY-01-02
   * @acceptance AC-PAY-01-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-PAY-01-01: Initialize secure checkout session', async () => {
    const response = await request(app)
      .post('/v1/checkout/sessions')
      .send({
        customer_id: 'cust_8f9024j94j',
        plan_id: 'plan_9aj98f82ja',
        success_url: 'https://merchant.com/success',
        cancel_url: 'https://merchant.com/cancel'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('session_id');
    expect(response.body).toHaveProperty('client_secret');
  });

  /**
   * @id TC-BE-PAY-01-02
   * @requirement FR-PAY-01-03
   * @acceptance AC-PAY-01-03
   * @priority CRITICAL
   * @type Database / Functional
   */
  test('TC-BE-PAY-01-02: Save billing token properties to client profile', async () => {
    const response = await request(app)
      .post('/v1/payment-methods')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        customer_id: 'cust_8f9024j94j',
        gateway_token: 'pm_1H2i3o4k5j',
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2028,
        is_default: true
      });

    expect(response.status).toBe(201);
    expect(response.body.last4).toBe('4242');
  });

  /**
   * @id TC-BE-PAY-01-03
   * @requirement FR-PAY-01-04
   * @acceptance AC-PAY-01-02
   * @priority HIGH
   * @type Integration
   */
  test('TC-BE-PAY-01-03: Process 3DS redirect routes on high-risk checkout simulations', async () => {
    const response = await request(app)
      .post('/v1/subscriptions')
      .send({
        customer_id: 'cust_8f9024j94j',
        plan_id: 'plan_9aj98f82ja',
        payment_method_id: 'pm_trigger_3ds'
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('requires_action');
    expect(response.body).toHaveProperty('redirect_url');
  });

  /**
   * @id TC-BE-PAY-01-04
   * @requirement SEC-001, SEC-PAY-01-01
   * @priority CRITICAL
   * @type Security
   */
  test('TC-BE-PAY-01-04: Reject checkout payloads containing raw card strings', async () => {
    const response = await request(app)
      .post('/v1/payment-methods')
      .send({
        customer_id: 'cust_8f9024j94j',
        card_number: '4242424242424242',
        cvv: '123'
      });

    expect(response.status).toBe(400);
  });
});
