/**
 * @file Subscription Lifecycle Engine Backend TypeScript Jest Tests
 * @feature FEAT-SUB-02
 */

import request from 'supertest';
import app from '../../src/app';
import { Subscription } from '../../src/models';

describe('Subscription Lifecycle Engine - Backend [FEAT-SUB-02]', () => {
  
  /**
   * @id TC-BE-SUB-02-01
   * @requirement FR-SUB-02-01, FR-SUB-02-02
   * @acceptance AC-SUB-02-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-SUB-02-01: Create subscription and verify trialing status', async () => {
    const response = await request(app)
      .post('/v1/subscriptions')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        customer_id: 'cust_8f9024j94j',
        plan_id: 'plan_9aj98f82ja',
        payment_method_id: 'pm_1H2'
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('trialing');
  });

  /**
   * @id TC-BE-SUB-02-02
   * @requirement VAL-SUB-02-01
   * @priority HIGH
   * @type Validation / Negative
   */
  test('TC-BE-SUB-02-02: Block invalid state transition from Canceled to Active', async () => {
    const response = await request(app)
      .patch('/v1/admin/subscriptions/sub_canceled_123')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        status: 'active'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_STATE_TRANSITION');
  });

  /**
   * @id TC-BE-SUB-02-03
   * @requirement FR-SUB-02-04
   * @acceptance AC-SUB-02-03
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-SUB-02-03: Period-end cancellations transitions to pending_cancellation', async () => {
    const response = await request(app)
      .post('/v1/subscriptions/sub_active_555/cancel')
      .send({
        cancel_at_period_end: true
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('pending_cancellation');
  });

  /**
   * @id TC-BE-SUB-02-04
   * @requirement FR-SUB-02-03
   * @acceptance AC-SUB-02-02
   * @priority CRITICAL
   * @type Integration / Cron
   */
  test('TC-BE-SUB-02-04: Daily lifecycle worker transitions trialing to active on trial end', async () => {
    await Subscription.create({
      id: 'sub_expired_trial_99',
      customer_id: 'cust_8f9024j94j',
      plan_id: 'plan_9aj98f82ja',
      status: 'trialing',
      trial_end: new Date(Date.now() - 300000)
    });

    const lifecycleProcessor = require('../../src/workers/lifecycleWorker');
    const result = await lifecycleProcessor.processExpiredTrials();

    expect(result.processed).toBeGreaterThanOrEqual(1);
    
    const updatedSub = await Subscription.findByPk('sub_expired_trial_99');
    expect(updatedSub.status).toBe('active');
  });
});
