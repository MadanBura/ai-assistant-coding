import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';
import crypto from 'crypto';

/**
 * Epic: EPC-004 | Feature: FEAT-401 (Patient Secure EHR Vault)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-401: Patient Secure EHR Vault Operations', () => {
  let patientToken: string;
  let doctorToken: string;

  beforeAll(async () => {
    patientToken = 'mock-jwt-patient-token-valid-signature';
    doctorToken = 'mock-jwt-doctor-token-valid-signature';
    
    await db.query("DELETE FROM ehr_permissions WHERE doctor_id = 'doc-robert-chen-77'");
    await db.query("DELETE FROM ehr_documents WHERE patient_id = 'pat-120938'");
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-401-01
   * @requirement FR-401
   * @acceptanceCriteria AC-401.1.1
   * @priority High
   * @preconditions S3 buckets active.
   * @description Verify document upload registers file and stores checksum hash.
   */
  test('TC-BE-401-01: Uploading records registers SHA256 checksum and S3 coordinates', async () => {
    const fileBuffer = Buffer.from('mock pdf file payload data content check');
    const targetHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const res = await request(app)
      .post('/api/v1/ehr/upload')
      .set('Authorization', `Bearer ${patientToken}`)
      .field('document_name', 'Blood_Test_May_2026.pdf')
      .attach('document_file', fileBuffer, 'Blood_Test_May_2026.pdf');

    expect(res.status).toBe(201);
    expect(res.body.document_id).toBeDefined();
    expect(res.body.sha256_hash).toBe(targetHash);

    // Assert row in database
    const dbRes = await db.query("SELECT file_hash, s3_object_uri FROM ehr_documents WHERE id = $1", [res.body.document_id]);
    expect(dbRes.rows[0].file_hash).toBe(targetHash);
  });

  /**
   * @testcase TC-BE-401-02
   * @requirement FR-401
   * @acceptanceCriteria AC-401.2.1
   * @priority High
   * @preconditions A temporary 48h permission exists for doctor A on document X.
   * @description Verify temporary permissions expire 48 hours after appointment end.
   */
  test('TC-BE-401-02: Temporary doctor access permissions expire after 48 hours', async () => {
    // 1. Seed document
    const docId = 'doc_test_expiry_99';
    await db.query(`
      INSERT INTO ehr_documents (id, patient_id, document_name, s3_object_uri, file_hash, file_size)
      VALUES ('${docId}', 'pat-120938', 'Expired.pdf', 's3://vault/expired.pdf', 'fake_hash', 1024)
      ON CONFLICT (id) DO NOTHING
    `);

    // 2. Seed expired permission (expires in the past)
    await db.query(`
      INSERT INTO ehr_permissions (document_id, doctor_id, expires_at)
      VALUES ('${docId}', 'doc-robert-chen-77', NOW() - INTERVAL '1 minute')
    `);

    // 3. Request download from doctor profile
    const res = await request(app)
      .get(`/api/v1/ehr/documents/${docId}/download`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Access permission has expired');
  });

  /**
   * @testcase TC-BE-401-03
   * @requirement SEC-104
   * @acceptanceCriteria SECC-005
   * @priority Medium
   * @preconditions Audit logging active.
   * @description Verify file downloads record access audits.
   */
  test('TC-BE-401-03: Signed S3 URL generation dispatches audit logs entries', async () => {
    // Seed valid permission
    const docId = 'doc_test_audit_99';
    await db.query(`
      INSERT INTO ehr_documents (id, patient_id, document_name, s3_object_uri, file_hash, file_size)
      VALUES ('${docId}', 'pat-120938', 'Audit.pdf', 's3://vault/audit.pdf', 'fake_hash_2', 1024)
      ON CONFLICT (id) DO NOTHING
    `);

    await db.query(`
      INSERT INTO ehr_permissions (document_id, doctor_id, expires_at)
      VALUES ('${docId}', 'doc-robert-chen-77', NOW() + INTERVAL '1 hour')
    `);

    // Trigger URL retrieval
    const res = await request(app)
      .get(`/api/v1/ehr/documents/${docId}/download`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.download_url).toBeDefined();

    // Verify audit record exists
    const logs = await db.query("SELECT details FROM admin_audit_logs ORDER BY created_at DESC LIMIT 1");
    expect(logs.rows[0].details.document_id).toBe(docId);
  });
});
