import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-005 | Feature: FEAT-501 (Patient Payment Escrow)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-501: Patient Payment Escrow Operations', () => {
  let patientToken: string;

  beforeAll(async () => {
    patientToken = 'mock-jwt-patient-token-valid-signature';
    await db.query("DELETE FROM transactions WHERE appointment_id = 'appt-449102'");
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-501-01
   * @requirement FR-501
   * @acceptanceCriteria AC-501.1.1
   * @priority High
   * @preconditions Stripe Connect merchant configurations are verified.
   * @description Verify PaymentIntent creation configuration triggers manual capture settings.
   */
  test('TC-BE-501-01: PaymentIntent creation defaults to manual capture parameters', async () => {
    const payload = {
      appointment_id: 'appt-449102',
      currency: 'usd'
    };

    const res = await request(app)
      .post('/api/v1/payments/create-intent')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.payment_intent_id).toBeDefined();
    expect(res.body.client_secret).toBeDefined();

    // Verify mock database records update
    const tx = await db.query('SELECT status, amount_total FROM transactions WHERE stripe_intent_id = $1', [res.body.payment_intent_id]);
    expect(tx.rows[0].status).toBe('authorized');
    expect(Number(tx.rows[0].amount_total)).toBe(150.00);
  });

  /**
   * @testcase TC-BE-501-02
   * @requirement FR-501
   * @acceptanceCriteria SECC-004
   * @priority High
   * @preconditions Stripe webhook endpoint is public.
   * @description Verify webhook endpoint rejects request payloads containing invalid signatures.
   */
  test('TC-BE-501-02: Webhooks reject payloads with unverified HMAC signatures', async () => {
    const payload = {
      id: 'evt_1N238HFDSH',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_1G238HFDSH',
          amount: 15000
        }
      }
    };

    const res = await request(app)
      .post('/api/v1/payments/stripe-webhook')
      .set('stripe-signature', 't=1780651800,v1=bad_signature_checksum_here')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Webhook signature verification failed');
  });

  /**
   * @testcase TC-BE-501-03
   * @requirement FR-501
   * @acceptanceCriteria AC-501.2.1
   * @priority High
   * @preconditions Escrow transaction holds $150 USD on active booking.
   * @description Verify execution of cancellation refund triggers Stripe API void request.
   */
  test('TC-BE-501-03: Cancellation actions trigger refund dispatches via Stripe gateway', async () => {
    // Seed an authorized transaction
    await db.query(`
      INSERT INTO transactions (id, appointment_id, patient_id, doctor_id, stripe_intent_id, amount_total, commission_amount, doctor_amount, status)
      VALUES ('tx_test_refund', 'appt-refund-99', 'pat-120938', 'doc-robert-chen-77', 'pi_test_refund', 150.00, 22.50, 127.50, 'authorized')
      ON CONFLICT (id) DO NOTHING
    `);

    // Trigger admin cancel refund override route
    const adminToken = 'mock-jwt-admin-token-valid-signature';
    const res = await request(app)
      .post('/api/v1/admin/payments/override-refund')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        appointment_id: 'appt-refund-99',
        refund_percentage: 100,
        reason_code: 'ADMIN_CANCEL'
      });

    expect(res.status).toBe(200);
    expect(res.body.refund_status).toBe('succeeded');

    // Confirm state changes
    const tx = await db.query('SELECT status FROM transactions WHERE appointment_id = $1', ['appt-refund-99']);
    expect(tx.rows[0].status).toBe('refunded');
  });
});
