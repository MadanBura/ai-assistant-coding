/**
 * @file Financial Analytics Backend TypeScript Jest Tests
 * @feature FEAT-ADMN-01
 */

import request from 'supertest';
import app from '../../src/app';
import { Subscription } from '../../src/models';

describe('Financial Analytics - Backend [FEAT-ADMN-01]', () => {
  
  beforeEach(async () => {
    await Subscription.destroy({ where: {} });
  });

  /**
   * @id TC-BE-ADMN-01-01
   * @requirement FR-ADMN-01-01
   * @acceptance AC-ADMN-01-01
   * @priority CRITICAL
   * @type Functional / Mathematics
   */
  test('TC-BE-ADMN-01-01: Normalize monthly and yearly plan prices to MRR', async () => {
    await Subscription.bulkCreate([
      { id: 'sub_monthly_1', plan_id: 'plan_monthly_100', status: 'active', customer_id: 'cust_1' },
      { id: 'sub_yearly_2', plan_id: 'plan_yearly_1200', status: 'active', customer_id: 'cust_2' }
    ]);

    const response = await request(app)
      .get('/v1/analytics/mrr')
      .set('Authorization', 'Bearer sk_live_admin123');

    expect(response.status).toBe(200);
    expect(response.body.total_mrr).toBe(200.00);
  });

  /**
   * @id TC-BE-ADMN-01-02
   * @requirement FR-ADMN-01-02
   * @priority HIGH
   * @type Functional
   */
  test('TC-BE-ADMN-01-02: Compute churn percentage correctly', async () => {
    const analyticsService = require('../../src/services/analyticsService');
    const churn = await analyticsService.calculateChurnRate(10, 2);

    expect(churn).toBe(20.00);
  });

  /**
   * @id TC-BE-ADMN-01-03
   * @requirement VAL-ADMN-01-01
   * @priority HIGH
   * @type Validation / Dates
   */
  test('TC-BE-ADMN-01-03: standardizes date query parameters to UTC bounds', async () => {
    const response = await request(app)
      .get('/v1/analytics/mrr')
      .set('Authorization', 'Bearer sk_live_admin123')
      .query({
        start_date: '2026-06-01T10:00:00+05:30',
        end_date: '2026-06-03T10:00:00+05:30'
      });

    expect(response.status).toBe(200);
    expect(response.body.query_parameters.utc_start_date).toBe('2026-06-01T04:30:00.000Z');
  });
});
