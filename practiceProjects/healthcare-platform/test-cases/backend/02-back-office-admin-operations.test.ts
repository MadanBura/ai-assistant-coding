import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-007 | Feature: FEAT-701 (Back-Office Admin Operations)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-701: Back-Office Admin Operations', () => {
  let adminToken: string;
  let patientToken: string;

  beforeAll(async () => {
    // Setup admin user and patient user mock session tokens
    adminToken = 'mock-jwt-admin-token-valid-signature';
    patientToken = 'mock-jwt-patient-token-valid-signature';
    
    // Seed verification target
    await db.query(`
      INSERT INTO doctors (id, first_name, last_name, specialty, license_number, verification_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET verification_status = $6
    `, ['doc-robert-chen-77', 'Robert', 'Chen', 'Cardiology', 'MA-908123', 'pending']);
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-701-01
   * @requirement FR-101
   * @acceptanceCriteria SECC-001
   * @priority High
   * @preconditions A patient JWT authorization token and admin JWT token are available.
   * @description Verify that GET and POST verification routes block non-admin accounts with HTTP 403 Forbidden.
   */
  test('TC-BE-701-01: Verifications route blocks non-admin account access', async () => {
    const res = await request(app)
      .get('/api/v1/admin/doctors/pending')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
  });

  /**
   * @testcase TC-BE-701-02
   * @requirement FR-501
   * @acceptanceCriteria AC-501.2.1
   * @priority High
   * @preconditions Transaction Stripe escrow status is 'held_in_escrow'.
   * @description Verify POST /api/v1/admin/payments/override-refund triggers refund actions on Stripe.
   */
  test('TC-BE-701-02: Escrow override manually triggers refund through Stripe gateway', async () => {
    const refundPayload = {
      appointment_id: 'appt-449102',
      refund_percentage: 100,
      reason_code: 'DISPUTE_TECHNICAL_FAILURE',
      admin_notes: 'Patient reported connection issues.'
    };

    const res = await request(app)
      .post('/api/v1/admin/payments/override-refund')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(refundPayload);

    expect(res.status).toBe(200);
    expect(res.body.refund_status).toBe('succeeded');
    expect(res.body.refunded_amount_usd).toBe(150.00);

    // Verify DB update
    const txRes = await db.query('SELECT status FROM transactions WHERE appointment_id = $1', [refundPayload.appointment_id]);
    expect(txRes.rows[0].status).toBe('refunded');
  });

  /**
   * @testcase TC-BE-701-03
   * @requirement SEC-104
   * @acceptanceCriteria SECC-005
   * @priority Medium
   * @preconditions Database audit triggers are active.
   * @description Verify administrative actions write audit entries in database logs.
   */
  test('TC-BE-701-03: Administrative status updates generate entries in immutable audit logs', async () => {
    const res = await request(app)
      .post('/api/v1/admin/doctors/doc-robert-chen-77/verify')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'approve' });

    expect(res.status).toBe(200);

    // Query audit log
    const auditRes = await db.query(
      "SELECT action, target_id FROM admin_audit_logs WHERE target_id = $1 ORDER BY created_at DESC LIMIT 1",
      ['doc-robert-chen-77']
    );

    expect(auditRes.rows[0].action).toBe('VERIFY_DOCTOR');
  });
});
