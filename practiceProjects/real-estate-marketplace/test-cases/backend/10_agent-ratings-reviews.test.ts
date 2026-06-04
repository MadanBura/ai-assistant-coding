import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';

/**
 * FEATURE ID: FT-5.2 (Agent Ratings & Reviews)
 * MAPPED REQUIREMENTS: FR-502, BRL-004, SEC-502
 * ACCEPTANCE CRITERIA: AC-503, AC-504
 */

describe('FT-5.2: Agent Ratings & Reviews Integration tests', () => {

  let buyerToken: string;
  let buyerTokenNoHistory: string;
  let agentToken: string;

  beforeAll(async () => {
    buyerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9idXllcjEyMyIsInJvbGUiOiJCdXllciJ9...';
    buyerTokenNoHistory = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9idXllcjQ1NiIsInJvbGUiOiJCdXllciJ9...';
    agentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9hZ2VudDEyMyIsInJvbGUiOiJBZ2VudCJ9...';

    // Clear target test DB relations
    await pool.query('DELETE FROM reviews WHERE agent_id = \'usr_agent123\'');
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-1001
   * Type: API / Eligibility Verification check
   * Preconditions: User token has no chat thread with target agent
   * Priority: Critical
   */
  it('TC-BE-1001: POST /api/v1/agents/{id}/reviews should reject requests when no verified interaction history exists', async () => {
    // Assert user buyer456 has no chat history with agent123
    await pool.query('DELETE FROM inquiries WHERE buyer_id = \'usr_buyer456\' AND property_id IN (SELECT id FROM properties WHERE owner_id = \'usr_agent123\')');

    const res = await request(app)
      .post('/api/v1/agents/usr_agent123/reviews')
      .set('Authorization', `Bearer ${buyerTokenNoHistory}`)
      .send({
        ratingCommunication: 5,
        ratingKnowledge: 5,
        ratingHelpfulness: 5,
        reviewText: 'This is a mock validation test review text body'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('interaction history required');
  });

  /**
   * TC ID: TC-BE-1002
   * Type: Database / Cached Aggregate Updates
   * Preconditions: Valid review submitted by buyer with history
   * Priority: High
   */
  it('TC-BE-1002: POST /api/v1/agents/{id}/reviews should recalculate and update aggregate caches columns on users', async () => {
    // Seed verified interaction thread
    await pool.query('INSERT INTO inquiries (id, property_id, buyer_id) VALUES (\'inq_rec1\', \'prop_test123\', \'usr_buyer123\')');
    await pool.query('UPDATE properties SET owner_id = \'usr_agent123\' WHERE id = \'prop_test123\'');

    const res = await request(app)
      .post('/api/v1/agents/usr_agent123/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        ratingCommunication: 5,
        ratingKnowledge: 4,
        ratingHelpfulness: 3,
        reviewText: 'Agent rating updates verify test body'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify aggregate fields are cached in the users profile record
    const dbAgent = await pool.query('SELECT overall_rating, comm_rating FROM users WHERE id = $1', ['usr_agent123']);
    expect(dbAgent.rows[0].overall_rating).toBeCloseTo(4.0, 1); // (5+4+3)/3 = 4.0
    expect(dbAgent.rows[0].comm_rating).toBeCloseTo(5.0, 1);
  });

});
