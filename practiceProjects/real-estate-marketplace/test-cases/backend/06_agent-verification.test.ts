import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';

/**
 * FEATURE ID: FT-1.2 (Agent Verification System)
 * MAPPED REQUIREMENTS: FR-102, BRL-002, SEC-102
 * ACCEPTANCE CRITERIA: AC-103, AC-104
 */

describe('FT-1.2: Agent Verification System Integration tests', () => {

  let unverifiedToken: string;
  let adminToken: string;

  beforeAll(() => {
    unverifiedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl91bnZlcmlmaWVkMTIzIiwicm9sZSI6IkFnZW50In0...';
    adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9hZG1pbjk5OSIsInJvbGUiOiJBZG1pbiJ9...';
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-601
   * Type: API / File validation checks
   * Preconditions: Unverified agent submits form
   * Priority: High
   */
  it('TC-BE-601: POST /api/v1/agents/verify should reject unsupported file formats', async () => {
    const res = await request(app)
      .post('/api/v1/agents/verify')
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .field('licenseNumber', 'RE-88219-N')
      .field('licenseState', 'CA')
      .field('brokerageName', 'Alliance Real Estate')
      .attach('verificationDocument', Buffer.from([77, 90, 144, 0, 3, 0, 0, 0]), 'run_script.exe'); // EXE Magic Bytes

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Unsupported file format');
  });

  /**
   * TC ID: TC-BE-602
   * Type: Security / Private storage auth checks
   * Preconditions: Non-admin user tries to access private license files
   * Priority: High
   */
  it('TC-BE-602: GET /api/v1/agents/license-doc/{id} should restrict access to Admin roles', async () => {
    // Assert agent cannot read their own deed document directly without a presigned URL expiration query
    const resAgent = await request(app)
      .get('/api/v1/agents/license-doc/usr_unverified123')
      .set('Authorization', `Bearer ${unverifiedToken}`);
    
    expect(resAgent.status).toBe(403); // Forbidden

    // Assert admin successfully fetches access presigned payload
    const resAdmin = await request(app)
      .get('/api/v1/agents/license-doc/usr_unverified123')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(resAdmin.status).toBe(200);
    expect(resAdmin.body.data.presignedUrl).toBeDefined();
    expect(resAdmin.body.data.presignedUrl).toContain('X-Amz-Expires=900'); // Max 15 minutes validity
  });

});
