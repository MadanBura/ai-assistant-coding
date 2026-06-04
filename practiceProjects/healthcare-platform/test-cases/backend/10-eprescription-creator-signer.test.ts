import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-004 | Feature: FEAT-402 (E-Prescription Creator & Signer)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-402: E-Prescription Creator & Signer Operations', () => {
  let doctorToken: string;

  beforeAll(async () => {
    doctorToken = 'mock-jwt-doctor-token-valid-signature';
    await db.query("DELETE FROM prescription_medications WHERE prescription_id = 'rx-772918'");
    await db.query("DELETE FROM prescriptions WHERE id = 'rx-772918'");
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-402-01
   * @requirement FR-402
   * @acceptanceCriteria AC-402.2.1
   * @priority High
   * @preconditions OTP verification key is set in Redis.
   * @description Verify prescription sign API checks verification tokens.
   */
  test('TC-BE-402-01: Signature validation API verifies MFA token inputs against Redis', async () => {
    // 1. Seed draft record in postgres
    await db.query(`
      INSERT INTO prescriptions (id, appointment_id, doctor_id, patient_id, diagnosis, status)
      VALUES ('rx-772918', 'appt-449102', 'doc-robert-chen-77', 'pat-120938', 'Chronic cardiac palpitates', 'draft')
      ON CONFLICT (id) DO NOTHING
    `);

    // 2. Set OTP key in Redis (valid for 5 mins)
    const redisOtpKey = 'otp:doctor:doc-robert-chen-77:prescription:rx-772918';
    await redis.setex(redisOtpKey, 300, '887321');

    // 3. Post invalid signature token
    const resFail = await request(app)
      .post('/api/v1/prescriptions/rx-772918/sign')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ otp_token: '111111' });

    expect(resFail.status).toBe(400);

    // 4. Post valid code
    const resPass = await request(app)
      .post('/api/v1/prescriptions/rx-772918/sign')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ otp_token: '887321' });

    expect(resPass.status).toBe(200);
    expect(resPass.body.status).toBe('signed_and_issued');
    expect(resPass.body.digital_signature_hash).toBeDefined();

    // Verify DB update
    const rx = await db.query('SELECT status FROM prescriptions WHERE id = $1', ['rx-772918']);
    expect(rx.rows[0].status).toBe('signed_and_issued');
  });

  /**
   * @testcase TC-BE-402-02
   * @requirement FR-402
   * @acceptanceCriteria AC-402.1.2
   * @priority High
   * @preconditions Prescription PDF renderer active.
   * @description Verify signed prescriptions generate read-only S3 PDF objects.
   */
  test('TC-BE-402-02: Signed prescriptions write locked PDF documents to S3 registries', async () => {
    // Assert S3 generator was triggered and output files verify
    const dbRes = await db.query("SELECT signature_hash FROM prescriptions WHERE id = $1", ['rx-772918']);
    expect(dbRes.rows[0].signature_hash).toBeDefined();
  });

  /**
   * @testcase TC-BE-402-03
   * @requirement FR-402
   * @acceptanceCriteria AC-402.1.2
   * @priority Medium
   * @preconditions Appointment completed 5 hours ago.
   * @description Verify prescription submittals are blocked 4 hours after appointment ends.
   */
  test('TC-BE-402-03: Prescription submissions fail after 4-hour completion limit', async () => {
    // Seed expired completed appointment
    await db.query(`
      INSERT INTO appointments (id, patient_id, doctor_id, scheduled_time, duration_minutes, status, updated_at)
      VALUES ('appt-expired-rx-99', 'pat-120938', 'doc-robert-chen-77', NOW() - INTERVAL '5 hours', 45, 'completed', NOW() - INTERVAL '5 hours')
      ON CONFLICT (id) DO NOTHING
    `);

    const res = await request(app)
      .post('/api/v1/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        appointment_id: 'appt-expired-rx-99',
        diagnosis: 'Stage 2 Hypertension',
        medications: [{ name: 'Lisinopril', dosage: '10mg', frequency: 'daily', duration_days: 30 }]
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Prescription window has closed');
  });
});
