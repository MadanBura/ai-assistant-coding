/**
 * @file Retry & Dunning Backend TypeScript Jest Tests
 * @feature FEAT-PAY-02
 */

import request from 'supertest';
import app from '../../src/app';
import crypto from 'crypto';
import { Subscription, DunningLog } from '../../src/models';

describe('Retry & Dunning - Backend [FEAT-PAY-02]', () => {
  
  const webhookSecret = 'whsec_test_secret_key';

  /**
   * @id TC-BE-PAY-02-01
   * @requirement FR-PAY-02-01, FR-PAY-02-02
   * @acceptance AC-PAY-02-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-PAY-02-01: Gateway webhook failed payment events schedules dunning and sets status to past_due', async () => {
    const payload = JSON.stringify({
      id: 'evt_failed_charge_123',
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_invoice_reference_90',
          customer: 'cus_stripe_id_8f',
          subscription: 'sub_active_555'
        }
      }
    });

    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    const response = await request(app)
      .post('/v1/webhooks/gateway')
      .set('X-Aura-Signature', signature)
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('dunning_scheduled');

    const sub = await Subscription.findByPk('sub_active_555');
    expect(sub.status).toBe('past_due');
  });

  /**
   * @id TC-BE-PAY-02-02
   * @requirement SEC-PAY-02-01
   * @priority CRITICAL
   * @type Security
   */
  test('TC-BE-PAY-02-02: Reject webhook requests with invalid signatures', async () => {
    const response = await request(app)
      .post('/v1/webhooks/gateway')
      .set('X-Aura-Signature', 'invalid_signature_hash')
      .send({ type: 'invoice.payment_failed' });

    expect(response.status).toBe(401);
  });

  /**
   * @id TC-BE-PAY-02-03
   * @requirement FR-PAY-02-04
   * @acceptance AC-PAY-02-02
   * @priority CRITICAL
   * @type Integration
   */
  test('TC-BE-PAY-02-03: Success on retry updates status and restores active state', async () => {
    const sub = await Subscription.findByPk('sub_active_555');
    await sub.update({ status: 'past_due' });

    const dunningProcessor = require('../../src/workers/dunningWorker');
    const result = await dunningProcessor.executeRetryAttempt('in_invoice_reference_90', 'pm_valid_card');

    expect(result.charge_succeeded).toBe(true);
    
    const updatedSub = await Subscription.findByPk('sub_active_555');
    expect(updatedSub.status).toBe('active');
  });

  /**
   * @id TC-BE-PAY-02-04
   * @requirement FR-PAY-02-05
   * @acceptance AC-PAY-02-02
   * @priority CRITICAL
   * @type Edge Case / Exhaustion
   */
  test('TC-BE-PAY-02-04: Exceeding dunning retries triggers cancellation of subscription', async () => {
    await DunningLog.create({ subscription_id: 'sub_active_555', attempt_number: 4, status: 'completed', gateway_response_code: 'card_declined' });

    const dunningProcessor = require('../../src/workers/dunningWorker');
    const result = await dunningProcessor.evaluateDunningStatus('sub_active_555');

    expect(result.action_taken).toBe('subscription_canceled');

    const updatedSub = await Subscription.findByPk('sub_active_555');
    expect(updatedSub.status).toBe('canceled');
  });
});
