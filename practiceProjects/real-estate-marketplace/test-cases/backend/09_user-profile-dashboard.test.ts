import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';

/**
 * FEATURE ID: FT-1.3 (User Profile Dashboard)
 * MAPPED REQUIREMENTS: FR-103, SEC-103
 * ACCEPTANCE CRITERIA: AC-105, AC-106
 */

describe('FT-1.3: User Profile Dashboard Integration tests', () => {

  let buyerToken: string;
  let buyerToken2: string;

  beforeAll(async () => {
    buyerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9idXllcjEyMyIsInJvbGUiOiJCdXllciJ9...';
    buyerToken2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9idXllcjQ1NiIsInJvbGUiOiJCdXllciJ9...';

    await pool.query('DELETE FROM user_favorites WHERE user_id = \'usr_buyer123\'');
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-901
   * Type: API / Database update matches
   * Preconditions: Reference property exists in DB index
   * Priority: High
   */
  it('TC-BE-901: POST /api/v1/profile/favorites should insert relation and toggle actions cleanly', async () => {
    // 1. Add favorite
    const resAdd = await request(app)
      .post('/api/v1/profile/favorites')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ propertyId: 'prop_test123' });

    expect(resAdd.status).toBe(200);
    expect(resAdd.body.favorited).toBe(true);

    // Verify DB contains link record
    const dbRes = await pool.query('SELECT * FROM user_favorites WHERE user_id = $1 AND property_id = $2', ['usr_buyer123', 'prop_test123']);
    expect(dbRes.rows.length).toBe(1);

    // 2. Remove favorite
    const resRemove = await request(app)
      .post('/api/v1/profile/favorites')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ propertyId: 'prop_test123' });

    expect(resRemove.status).toBe(200);
    expect(resRemove.body.favorited).toBe(false);

    const dbResRemoved = await pool.query('SELECT * FROM user_favorites WHERE user_id = $1 AND property_id = $2', ['usr_buyer123', 'prop_test123']);
    expect(dbResRemoved.rows.length).toBe(0);
  });

  /**
   * TC ID: TC-BE-902
   * Type: Security / Profile Insulation check
   * Preconditions: User token attempts to request favorites of a different account ID
   * Priority: High
   */
  it('TC-BE-902: GET /api/v1/profile/favorites should reject requests targeting another user ID key', async () => {
    const res = await request(app)
      .get('/api/v1/profile/favorites')
      .set('Authorization', `Bearer ${buyerToken}`)
      .query({ userId: 'usr_buyer456' }); // Requesting buyer 456 details with token of buyer 123

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

});
