import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';

/**
 * FEATURE ID: FT-2.2 (Advanced Search & Filtering)
 * MAPPED REQUIREMENTS: FR-202, VAL-202, SEC-202, NFR-101
 * ACCEPTANCE CRITERIA: AC-203, AC-204
 */

describe('FT-2.2: Advanced Search & Filtering Integration tests', () => {

  beforeAll(async () => {
    // Seed standard mock properties inside database mapping specific metrics
    await pool.query('DELETE FROM properties WHERE title LIKE \'FiltVilla%\'');
    await pool.query(`
      INSERT INTO properties (id, title, price, property_type, beds, baths, sqft, street_address, city, state, zipcode, status)
      VALUES 
      ('f1', 'FiltVilla Uptown', 350000, 'Residential', 3, 2, 1400, '100 Main St', 'New York', 'NY', '10001', 'APPROVED'),
      ('f2', 'FiltVilla Downtown', 150000, 'Residential', 1, 1, 700, '200 Main St', 'New York', 'NY', '10002', 'APPROVED'),
      ('f3', 'FiltVilla Draft', 350000, 'Residential', 3, 2, 1400, '300 Main St', 'New York', 'NY', '10001', 'DRAFT')
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-301
   * Type: API / Database filtering matches
   * Preconditions: Mock listings loaded into postgres
   * Priority: Critical
   */
  it('TC-BE-301: GET /api/v1/properties should execute filters matching criteria and omit non-approved listings', async () => {
    const res = await request(app)
      .get('/api/v1/properties')
      .query({
        q: 'FiltVilla',
        minPrice: 200000,
        maxPrice: 400000,
        beds: 3
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Check search output size
    expect(res.body.data.totalMatches).toBe(1); // 'f1' matches. 'f3' matches filters but is status DRAFT, so excluded
    expect(res.body.data.listings[0].propertyId).toBe('f1');
  });

  /**
   * TC ID: TC-BE-302
   * Type: Performance Latency / Scale Check
   * Preconditions: High concurrency requests mimicking search
   * Priority: High
   */
  it('TC-BE-302: GET /api/v1/properties should respond under the SLA limit of 200ms for concurrent requests', async () => {
    const requestsCount = 10;
    const start = Date.now();

    const promises = Array.from({ length: requestsCount }).map(() => 
      request(app).get('/api/v1/properties').query({ q: 'FiltVilla' })
    );

    const responses = await Promise.all(promises);
    const duration = Date.now() - start;
    const averageTime = duration / requestsCount;

    responses.forEach(res => {
      expect(res.status).toBe(200);
    });

    // Verify system latency metrics mapping NFR performance goals
    expect(averageTime).toBeLessThan(200);
  });

});
