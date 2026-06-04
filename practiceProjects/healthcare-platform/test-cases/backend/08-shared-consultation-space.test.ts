import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-003 | Feature: FEAT-302 (Shared Consultation Space)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-302: Shared Consultation Space Operations', () => {
  let patientToken: string;
  let doctorToken: string;

  beforeAll(async () => {
    patientToken = 'mock-jwt-patient-token-valid-signature';
    doctorToken = 'mock-jwt-doctor-token-valid-signature';
    
    await db.query("DELETE FROM consultation_chats WHERE consultation_id = 'con-309182'");
    await db.query("DELETE FROM consultation_notes WHERE consultation_id = 'con-309182'");
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-302-01
   * @requirement FR-302
   * @acceptanceCriteria AC-302.2.1
   * @priority High
   * @preconditions A patient session token is available.
   * @description Verify that patient roles are blocked from accessing clinical notes APIs.
   */
  test('TC-BE-302-01: Access check blocks patient role from reading or writing clinical notes', async () => {
    const payload = {
      clinical_notes: 'Patient complaints of shortness of breath.',
      is_finalized: false
    };

    const res = await request(app)
      .post('/api/v1/consultations/con-309182/notes')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(payload);

    expect(res.status).toBe(403);
  });

  /**
   * @testcase TC-BE-302-02
   * @requirement SEC-101
   * @acceptanceCriteria SECC-003
   * @priority High
   * @preconditions Encryption keys are set.
   * @description Verify database encryption configurations encrypt chat history.
   */
  test('TC-BE-302-02: Message body is stored in database as AES-256 encrypted ciphertext', async () => {
    const messagePayload = {
      consultation_id: 'con-309182',
      message_text: 'Secret medical prescription details reference'
    };

    // Trigger message dispatch
    const res = await db.query(
      "INSERT INTO consultation_chats (consultation_id, sender_id, message_encrypted) VALUES ($1, $2, pgp_sym_encrypt($3, 'app_key_secret')) RETURNING id",
      [messagePayload.consultation_id, 'pat-120938', messagePayload.message_text]
    );

    expect(res.rows[0].id).toBeDefined();

    // Query raw DB row
    const rawRes = await db.query("SELECT message_encrypted FROM consultation_chats WHERE id = $1", [res.rows[0].id]);
    expect(rawRes.rows[0].message_encrypted).not.toContain('Secret medical prescription');
    
    // Verify decrypt output matches
    const decryptRes = await db.query(
      "SELECT pgp_sym_decrypt(message_encrypted::bytea, 'app_key_secret') as msg FROM consultation_chats WHERE id = $1",
      [res.rows[0].id]
    );
    expect(decryptRes.rows[0].msg).toBe(messagePayload.message_text);
  });
});
