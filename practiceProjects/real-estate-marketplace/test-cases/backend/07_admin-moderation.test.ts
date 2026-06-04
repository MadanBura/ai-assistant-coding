import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';

/**
 * FEATURE ID: FT-6.1 (Admin Moderation Console)
 * MAPPED REQUIREMENTS: FR-601, BRL-003, SEC-601, SEC-602
 * ACCEPTANCE CRITERIA: AC-601, AC-602
 */

describe('FT-6.1: Admin Moderation Console Integration tests', () => {

  let adminToken: string;
  let buyerToken: string;

  beforeAll(async () => {
    adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9hZG1pbjk5OSIsInJvbGUiOiJBZG1pbiJ9...';
    buyerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9idXllcjEyMyIsInJvbGUiOiJCdXllciJ9...';

    // Set initial test states
    await pool.query('DELETE FROM properties WHERE id = \'mod_prop_1\'');
    await pool.query('INSERT INTO properties (id, title, price, status) VALUES (\'mod_prop_1\', \'Mod Villa\', 500000, \'PENDING_APPROVAL\')');
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-701
   * Type: Security / Role Validation checks
   * Preconditions: Non-admin tries to hit /admin/ endpoints
   * Priority: Critical
   */
  it('TC-BE-701: POST /api/v1/admin/moderation/listings/{id}/resolve should reject non-admin request with 403', async () => {
    const res = await request(app)
      .post('/api/v1/admin/moderation/listings/mod_prop_1/resolve')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ action: 'APPROVE' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  /**
   * TC ID: TC-BE-702
   * Type: Integration / Lock Checks / Database State Updates
   * Preconditions: Admin processes a resolution check
   * Priority: High
   */
  it('TC-BE-702: POST /api/v1/admin/moderation/listings/{id}/resolve should write audit logs and update status', async () => {
    const res = await request(app)
      .post('/api/v1/admin/moderation/listings/mod_prop_1/resolve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        action: 'REJECT',
        reason: 'Incorrect coordinates, listing deed scan contains mismatches.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify property status switched to REJECTED in database
    const dbProp = await pool.query('SELECT status FROM properties WHERE id = $1', ['mod_prop_1']);
    expect(dbProp.rows[0].status).toBe('REJECTED');

    // Verify immutable audit log record created
    const dbAudit = await pool.query('SELECT * FROM moderation_logs WHERE target_id = $1', ['mod_prop_1']);
    expect(dbAudit.rows.length).toBe(1);
    expect(dbAudit.rows[0].action).toBe('REJECT');
    expect(dbAudit.rows[0].reason).toContain('Incorrect coordinates');
  });

});
