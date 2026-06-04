import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';
import crypto from 'crypto';

/**
 * FEATURE ID: FT-4.2 (Listing Analytics & Trends)
 * MAPPED REQUIREMENTS: FR-402, SEC-402
 * ACCEPTANCE CRITERIA: AC-403, AC-404
 */

describe('FT-4.2: Listing Analytics & Trends Integration tests', () => {

  let agentToken: string;
  let buyerToken: string;

  beforeAll(async () => {
    agentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9hZ2VudDEyMyIsInJvbGUiOiJBZ2VudCJ9...';
    buyerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9idXllcjEyMyIsInJvbGUiOiJCdXllciJ9...';

    // Clear logs test tables
    await pool.query('DELETE FROM analytics_logs WHERE property_id = \'prop_test123\'');
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-1101
   * Type: Security / Privacy SHA-256 IP check
   * Preconditions: User views property detail page
   * Priority: High
   */
  it('TC-BE-1101: Detail page requests should write anonymized SHA-256 IP hash to analytics database logs', async () => {
    const testIp = '192.168.1.50';
    const expectedHash = crypto.createHash('sha256').update(testIp).digest('hex');

    const res = await request(app)
      .get('/api/v1/properties/prop_test123')
      .set('X-Forwarded-For', testIp); // Mock header IP source

    expect(res.status).toBe(200);

    // Verify DB contains log row containing the hashed IP, not plain text
    const dbRes = await pool.query('SELECT * FROM analytics_logs WHERE property_id = $1', ['prop_test123']);
    expect(dbRes.rows.length).toBeGreaterThan(0);
    expect(dbRes.rows[0].ip_hash).toBe(expectedHash);
    expect(dbRes.rows[0].ip_address).toBeUndefined(); // Verify plain text IP field is absent/null
  });

  /**
   * TC ID: TC-BE-1102
   * Type: API / Security Boundaries
   * Preconditions: Non-owner agent attempts to request private analytics details
   * Priority: High
   */
  it('TC-BE-1102: GET /api/v1/analytics/properties/{id} should restrict metrics data to the property owner', async () => {
    // Assert buyer is forbidden
    const resBuyer = await request(app)
      .get('/api/v1/analytics/properties/prop_test123')
      .set('Authorization', `Bearer ${buyerToken}`);
    
    expect(resBuyer.status).toBe(403);

    // Set owner ID of property to usr_agent123
    await pool.query('UPDATE properties SET owner_id = \'usr_agent123\' WHERE id = \'prop_test123\'');

    // Assert agent (owner) is authorized
    const resOwner = await request(app)
      .get('/api/v1/analytics/properties/prop_test123')
      .set('Authorization', `Bearer ${agentToken}`);
    
    expect(resOwner.status).toBe(200);
    expect(resOwner.body.success).toBe(true);
  });

});
