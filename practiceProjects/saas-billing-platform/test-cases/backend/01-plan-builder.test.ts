/**
 * @file Plan Builder Backend TypeScript Jest Tests
 * @feature FEAT-SUB-01
 */

import request from 'supertest';
import app from '../../src/app';

describe('Plan Builder - Backend [FEAT-SUB-01]', () => {
  
  /**
   * @id TC-BE-SUB-01-01
   * @requirement FR-SUB-01-01, FR-SUB-01-02
   * @acceptance AC-SUB-01-01
   * @priority CRITICAL
   * @precondition Admin authenticated
   * @type Functional
   */
  test('TC-BE-SUB-01-01: Create flat-rate plan', async () => {
    const response = await request(app)
      .post('/v1/plans')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        name: 'Standard Pro Plan',
        description: 'Standard flat pricing',
        currency: 'USD',
        interval: 'month',
        pricing_type: 'flat',
        base_price: 29.00,
        trial_days: 14
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Standard Pro Plan');
    expect(response.body.is_active).toBe(true);
  });

  /**
   * @id TC-BE-SUB-01-02
   * @requirement FR-SUB-01-03
   * @acceptance AC-SUB-01-02
   * @priority HIGH
   * @type Functional
   */
  test('TC-BE-SUB-01-02: Create graduated tiered pricing plan', async () => {
    const response = await request(app)
      .post('/v1/plans')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        name: 'API Metered Plan',
        currency: 'USD',
        interval: 'month',
        pricing_type: 'tiered',
        base_price: 0.00,
        pricing_tiers: [
          { up_to: 100, unit_amount: 0.10 },
          { up_to: 1000, unit_amount: 0.08 },
          { up_to: -1, unit_amount: 0.05 }
        ],
        tier_mode: 'graduated'
      });

    expect(response.status).toBe(201);
    expect(response.body.pricing_type).toBe('tiered');
  });

  /**
   * @id TC-BE-SUB-01-03
   * @requirement VAL-SUB-01-01
   * @priority MEDIUM
   * @type Validation / Negative
   */
  test('TC-BE-SUB-01-03: Reject creation with empty plan name', async () => {
    const response = await request(app)
      .post('/v1/plans')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        name: '',
        currency: 'USD',
        interval: 'month',
        pricing_type: 'flat',
        base_price: 10.00
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('VALIDATION_FAILED');
  });

  /**
   * @id TC-BE-SUB-01-04
   * @requirement VAL-SUB-01-03
   * @priority HIGH
   * @type Validation
   */
  test('TC-BE-SUB-01-04: Reject negative pricing values', async () => {
    const response = await request(app)
      .post('/v1/plans')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        name: 'Invalid Negative Plan',
        currency: 'USD',
        interval: 'month',
        pricing_type: 'flat',
        base_price: -10.00
      });

    expect(response.status).toBe(400);
  });

  /**
   * @id TC-BE-SUB-01-05
   * @requirement SEC-SUB-01-01
   * @priority CRITICAL
   * @type Security / RBAC
   */
  test('TC-BE-SUB-01-05: Reject write operations from non-admin keys', async () => {
    const response = await request(app)
      .post('/v1/plans')
      .set('Authorization', 'Bearer sk_live_support456')
      .send({
        name: 'Support Restricted Plan',
        currency: 'USD',
        interval: 'month',
        pricing_type: 'flat',
        base_price: 15.00
      });

    expect(response.status).toBe(403);
  });
});
