/**
 * @file Coupon Code Manager Backend TypeScript Jest Tests
 * @feature FEAT-COUP-01
 */

import request from 'supertest';
import app from '../../src/app';

describe('Coupon Code Manager - Backend [FEAT-COUP-01]', () => {
  
  /**
   * @id TC-BE-COUP-01-01
   * @requirement FR-COUP-01-01, FR-COUP-01-02
   * @acceptance AC-COUP-01-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-COUP-01-01: Create and validate percentage coupon', async () => {
    const response = await request(app)
      .post('/v1/coupons')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        code: 'WINTER30',
        discount_type: 'percentage',
        discount_value: 30.00,
        duration: 'repeating',
        duration_in_months: 3
      });

    expect(response.status).toBe(201);
    expect(response.body.code).toBe('WINTER30');
  });

  /**
   * @id TC-BE-COUP-01-02
   * @requirement FR-COUP-01-04
   * @acceptance AC-COUP-01-03
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-COUP-01-02: Apply percentage discount and calculate tax accurately', async () => {
    const response = await request(app)
      .post('/v1/admin/invoices/test_calc')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        subtotal: 100.00,
        coupon_code: 'WINTER30',
        tax_rate: 19.00
      });

    expect(response.status).toBe(200);
    expect(response.body.discount_amount).toBe(30.00);
    expect(response.body.tax_amount).toBe(13.30);
    expect(response.body.total).toBe(83.30);
  });

  /**
   * @id TC-BE-COUP-01-03
   * @requirement FR-COUP-01-04
   * @priority HIGH
   * @type Edge Case
   */
  test('TC-BE-COUP-01-03: Cap total due at exactly $0.00 when coupon exceeds subtotal', async () => {
    await request(app).post('/v1/coupons').set('Authorization', 'Bearer sk_live_admin123').send({
      code: 'OFF50', discount_type: 'flat', discount_value: 50.00, currency: 'USD'
    });

    const response = await request(app)
      .post('/v1/admin/invoices/test_calc')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        subtotal: 30.00,
        coupon_code: 'OFF50',
        tax_rate: 0.00
      });

    expect(response.status).toBe(200);
    expect(response.body.discount_amount).toBe(30.00);
    expect(response.body.total).toBe(0.00);
  });
});
