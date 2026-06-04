import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';

/**
 * FEATURE ID: FT-4.1 (Property Comparison Matrix)
 * MAPPED REQUIREMENTS: FR-401, BRL-004
 * ACCEPTANCE CRITERIA: AC-401, AC-402
 */

describe('FT-4.1: Property Comparison Matrix Integration tests', () => {

  beforeAll(async () => {
    await pool.query('DELETE FROM properties WHERE id LIKE \'comp_%\'');
    await pool.query(`
      INSERT INTO properties (id, title, price, status)
      VALUES 
      ('comp_1', 'Comp Villa 1', 400000, 'APPROVED'),
      ('comp_2', 'Comp Villa 2', 420000, 'APPROVED'),
      ('comp_3', 'Comp Villa 3', 380000, 'DRAFT')
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-801
   * Type: API / SQL performance
   * Preconditions: Reference properties loaded in postgres
   * Priority: High
   */
  it('TC-BE-801: GET /api/v1/properties/compare should fetch parameters using IN-clauses correctly', async () => {
    const res = await request(app)
      .get('/api/v1/properties/compare')
      .query({ ids: 'comp_1,comp_2' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].title).toBe('Comp Villa 1');
  });

  /**
   * TC ID: TC-BE-802
   * Type: Integration / Validation checks
   * Preconditions: Query IDs array contains non-approved items
   * Priority: Medium
   */
  it('TC-BE-802: GET /api/v1/properties/compare should omit non-approved property IDs', async () => {
    const res = await request(app)
      .get('/api/v1/properties/compare')
      .query({ ids: 'comp_1,comp_3' }); // comp_3 is status DRAFT

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1); // Only comp_1 returns
    expect(res.body.data.find((p: any) => p.propertyId === 'comp_3')).toBeUndefined();
  });

});
