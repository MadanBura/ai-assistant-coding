import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-003 | Feature: FEAT-301 (Encrypted WebRTC Video Rooms)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-301: Encrypted WebRTC Video Rooms', () => {
  let patientToken: string;
  let doctorToken: string;

  beforeAll(async () => {
    patientToken = 'mock-jwt-patient-token-valid-signature';
    doctorToken = 'mock-jwt-doctor-token-valid-signature';
    
    // Seed target appointment
    await db.query(`
      INSERT INTO appointments (id, patient_id, doctor_id, scheduled_time, duration_minutes, status)
      VALUES ('appt-449102', 'pat-120938', 'doc-robert-chen-77', '2026-06-05T09:30:00Z', 45, 'confirmed')
      ON CONFLICT (id) DO NOTHING
    `);
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-301-01
   * @requirement FR-301
   * @acceptanceCriteria AC-301.1.1
   * @priority High
   * @preconditions Agora signal key parameters are set.
   * @description Verify WebRTC token generator maps access rights to appointment participants only.
   */
  test('TC-BE-301-01: Token distribution validates user parameters against appointments table', async () => {
    const invalidToken = 'mock-jwt-unrelated-user-token';
    
    // Send join room request with unrelated user token
    const resFail = await request(app)
      .post('/api/v1/consultations/join')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send({ appointment_id: 'appt-449102' });

    expect(resFail.status).toBe(403);

    // Send request with valid patient token
    const resPass = await request(app)
      .post('/api/v1/consultations/join')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ appointment_id: 'appt-449102' });

    expect(resPass.status).toBe(200);
    expect(resPass.body.webrtc_token).toBeDefined();
    expect(resPass.body.webrtc_channel).toBe('ch_con_309182');
  });

  /**
   * @testcase TC-BE-301-02
   * @requirement FR-301
   * @acceptanceCriteria AC-301.1.2
   * @priority High
   * @preconditions Meeting room has been active for 60 minutes.
   * @description Verify call room session scheduler terminates room access after duration caps.
   */
  test('TC-BE-301-02: Video rooms reject join requests post duration expiration thresholds', async () => {
    // Seed expired appointment (scheduled 5 hours ago)
    await db.query(`
      INSERT INTO appointments (id, patient_id, doctor_id, scheduled_time, duration_minutes, status)
      VALUES ('appt-expired-99', 'pat-120938', 'doc-robert-chen-77', NOW() - INTERVAL '5 hours', 45, 'confirmed')
      ON CONFLICT (id) DO NOTHING
    `);

    const res = await request(app)
      .post('/api/v1/consultations/join')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ appointment_id: 'appt-expired-99' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Room has expired');
  });
});
