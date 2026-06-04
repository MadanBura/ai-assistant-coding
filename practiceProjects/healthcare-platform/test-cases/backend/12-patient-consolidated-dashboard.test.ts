import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-006 | Feature: FEAT-601 (Patient Consolidated Dashboard)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-601: Patient Consolidated Dashboard', () => {
  let patientToken: string;

  beforeAll(async () => {
    patientToken = 'mock-jwt-patient-token-valid-signature';
    
    // Seed DB records for patient dashboard queries
    await db.query(`
      INSERT INTO appointments (id, patient_id, doctor_id, scheduled_time, duration_minutes, status)
      VALUES ('appt-dashboard-99', 'pat-120938', 'doc-robert-chen-77', '2026-06-05T09:30:00Z', 45, 'confirmed')
      ON CONFLICT (id) DO NOTHING
    `);
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-601-01
   * @requirement FR-601
   * @acceptanceCriteria AC-601.2.1
   * @priority High
   * @preconditions Patient DB record has multiple items.
   * @description Verify GET /api/v1/patients/:id/dashboard compiles queries in SLA limit.
   */
  test('TC-BE-601-01: API composite query aggregates calendar, prescription, and vault tables', async () => {
    const res = await request(app)
      .get('/api/v1/patients/pat-120938/dashboard')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.upcoming_appointments).toBeDefined();
    expect(res.body.recent_prescriptions).toBeDefined();
    expect(res.body.recent_vault_documents).toBeDefined();

    // Verify first row contains the seeded appointment
    const appointmentsIds = res.body.upcoming_appointments.map((a: any) => a.appointment_id);
    expect(appointmentsIds).toContain('appt-dashboard-99');
  });

  /**
   * @testcase TC-BE-601-02
   * @requirement FR-601
   * @acceptanceCriteria SECC-001
   * @priority High
   * @preconditions User A and User B session tokens are set.
   * @description Verify accessing other patient dashboards is blocked.
   */
  test('TC-BE-601-02: Multi-tenant checks block queries targeting other patient files', async () => {
    const userBToken = 'mock-jwt-patient-B-token-valid';

    const res = await request(app)
      .get('/api/v1/patients/pat-120938/dashboard') // Target Patient A's file
      .set('Authorization', `Bearer ${userBToken}`); // Using Patient B's JWT

    expect(res.status).toBe(403);
  });
});
