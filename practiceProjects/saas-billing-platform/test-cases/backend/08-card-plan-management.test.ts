/**
 * @file Card & Plan Management Backend TypeScript Jest Tests
 * @feature FEAT-PORT-02
 */

import request from 'supertest';
import app from '../../src/app';

describe('Card & Plan Management - Backend [FEAT-PORT-02]', () => {
  
  const token = 'bearer_mock_jwt_customer_8f';

  /**
   * @id TC-BE-PORT-02-01
   * @requirement FR-PORT-02-01, FR-PORT-02-02
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-PORT-02-01: Retrieve authenticated customer dashboard data successfully', async () => {
    const response = await request(app)
      .get('/v1/portal/me')
      .set('Cookie', `portal_session=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('customer');
    expect(response.body.subscription.id).toBe('sub_92k02kasj8');
  });

  /**
   * @id TC-BE-PORT-02-02
   * @requirement FR-PORT-02-03
   * @acceptance AC-PORT-02-01
   * @priority CRITICAL
   * @type Functional / Database
   */
  test('TC-BE-PORT-02-02: Update default card token successfully', async () => {
    const response = await request(app)
      .put('/v1/portal/payment-method')
      .set('Cookie', `portal_session=${token}`)
      .send({
        payment_method_id: 'pm_new_token_993k'
      });

    expect(response.status).toBe(200);
    expect(response.body.default_card.last4).toBe('1111');
  });

  /**
   * @id TC-BE-PORT-02-03
   * @requirement VAL-PORT-02-02, SEC-PORT-02-01
   * @acceptance AC-PORT-02-02
   * @priority CRITICAL
   * @type Security
   */
  test('TC-BE-PORT-02-03: Block access to invoices belonging to other customers', async () => {
    const response = await request(app)
      .get('/v1/invoices/inv_customerB_999')
      .set('Cookie', `portal_session=${token}`);

    expect(response.status).toBe(403);
  });
});
