import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-001 | Feature: FEAT-101 (Practitioner Signup & Verification)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-101: Practitioner Signup & Verification Operations', () => {
  beforeAll(async () => {
    // Clean database records
    await db.query('DELETE FROM doctor_documents');
    await db.query('DELETE FROM doctors');
    await db.query('DELETE FROM users WHERE email = $1', ['dr.robert.chen@bostonclinic.org']);
  });

  afterAll(async () => {
    // Release active pool connections
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-101-01
   * @requirement FR-101
   * @acceptanceCriteria AC-101.1.1
   * @priority High
   * @preconditions Database seed has empty records for target registration email.
   * @description Verify POST /api/v1/auth/register/doctor registers doctor with status pending_verification.
   */
  test('TC-BE-101-01: API registration route registers doctor with pending_verification status', async () => {
    const payload = {
      email: 'dr.robert.chen@bostonclinic.org',
      password: 'SecurePassword123!',
      first_name: 'Robert',
      last_name: 'Chen',
      specialty: 'Cardiology',
      license_state: 'MA',
      license_number: 'MA-908123',
      license_expiry: '2028-12-31',
      phone_number: '+16175550192'
    };

    const res = await request(app)
      .post('/api/v1/auth/register/doctor')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending_verification');
    expect(res.body.doctor_id).toBeDefined();

    // Verify DB insertion
    const userRes = await db.query('SELECT role FROM users WHERE email = $1', [payload.email]);
    expect(userRes.rows[0].role).toBe('doctor');

    const doctorRes = await db.query('SELECT verification_status FROM doctors WHERE license_number = $1', [payload.license_number]);
    expect(doctorRes.rows[0].verification_status).toBe('pending_verification');
  });

  /**
   * @testcase TC-BE-101-02
   * @requirement FR-101
   * @acceptanceCriteria AC-101.1.2
   * @priority High
   * @preconditions ClamAV virus checking service mock is active.
   * @description Verify that uploaded files containing virus signatures are quarantined and rejected with HTTP 400.
   */
  test('TC-BE-101-02: Uploaded files containing virus signatures are rejected', async () => {
    const mockVirusBuffer = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');

    const res = await request(app)
      .post('/api/v1/doctors/doc-robert-chen-77/documents')
      .attach('license_file', mockVirusBuffer, 'license.pdf');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Virus signature detected');
  });

  /**
   * @testcase TC-BE-101-03
   * @requirement FR-101
   * @acceptanceCriteria AC-101.1.3
   * @priority Medium
   * @preconditions License ID already exists in DB.
   * @description Verify DB unique constraint rejects duplicate license registrations.
   */
  test('TC-BE-101-03: DB unique constraint rejects duplicate license registrations', async () => {
    // Attempt duplicate signup with same license number
    const payload = {
      email: 'dr.duplicate@bostonclinic.org',
      password: 'SecurePassword123!',
      first_name: 'Dupe',
      last_name: 'Doctor',
      specialty: 'Cardiology',
      license_state: 'MA',
      license_number: 'MA-908123', // Same as Robert Chen
      license_expiry: '2028-12-31',
      phone_number: '+16175550000'
    };

    const res = await request(app)
      .post('/api/v1/auth/register/doctor')
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('License number already registered');
  });
});
