import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

/**
 * FEATURE: Property Comparison Matrix (FEAT-401)
 * COVERAGE: API, Database, Validation, Security
 */

describe('FEAT-401: Property Comparison Matrix API Endpoint', () => {
  let propId1: string;
  let propId2: string;
  let draftPropId: string;

  beforeAll(async () => {
    // Clear databases
    await db.query('DELETE FROM properties');
    await db.query('DELETE FROM users');

    // Create Owner
    await db.query(`
      INSERT INTO users (id, email, password_hash, full_name, role, phone, is_verified)
      VALUES ('owner_90210', 'owner@test.com', 'hashed_pass', 'David Owner', 'owner', '+12065550001', true)
    `);

    // Seed properties
    const res1 = await db.query(`
      INSERT INTO properties (owner_id, title, description, category, transaction, price, address, latitude, longitude, status, bedrooms, bathrooms, square_footage, images)
      VALUES ('owner_90210', 'Condo A', 'Condo details...', 'residential', 'sale', 300000.00, 'Seattle', ST_GeomFromText('POINT(-122.33 47.60)', 4326), 'published', 2, 1.5, 900, '["img1.webp"]')
      RETURNING id
    `);
    propId1 = res1.rows[0].id;

    const res2 = await db.query(`
      INSERT INTO properties (owner_id, title, description, category, transaction, price, address, latitude, longitude, status, bedrooms, bathrooms, square_footage, images)
      VALUES ('owner_90210', 'Condo B', 'Condo details...', 'residential', 'sale', 350000.00, 'Seattle', ST_GeomFromText('POINT(-122.34 47.61)', 4326), 'published', 2, 2.0, 1050, '["img2.webp"]')
      RETURNING id
    `);
    propId2 = res2.rows[0].id;

    const res3 = await db.query(`
      INSERT INTO properties (owner_id, title, description, category, transaction, price, address, latitude, longitude, status, bedrooms, bathrooms, square_footage, images)
      VALUES ('owner_90210', 'Draft Condo', 'Draft condo details...', 'residential', 'sale', 400000.00, 'Seattle', ST_GeomFromText('POINT(-122.34 47.61)', 4326), 'draft', 2, 2.0, 1050, '["img2.webp"]')
      RETURNING id
    `);
    draftPropId = res3.rows[0].id;
  });

  afterAll(async () => {
    await db.close();
  });

  /**
   * TC-BE-401-01 (API & Database Fetch)
   * Requirement Mapping: FR-401
   * Priority: High
   */
  test('TC-BE-401-01: Successfully retrieve matching details array for list of active IDs', async () => {
    const res = await request(app)
      .get('/api/properties/compare')
      .query({ ids: `${propId1},${propId2}` })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.properties.length).toBe(2);
    expect(res.body.properties[0].title).toBe('Condo A');
  });

  /**
   * TC-BE-401-02 (Security & State filter)
   * Requirement Mapping: SEC-004
   * Priority: High
   */
  test('TC-BE-401-02: Excludes draft or pending listings from comparison output payload', async () => {
    const res = await request(app)
      .get('/api/properties/compare')
      .query({ ids: `${propId1},${draftPropId}` }) // Querying 1 active, 1 draft property
      .expect(200);

    // Expected Result: Only return the active property in list
    expect(res.body.properties.length).toBe(1);
    expect(res.body.properties[0].id).toBe(propId1);
  });

  /**
   * TC-BE-401-03 (API & Validation & Negative)
   * Requirement Mapping: FR-401
   * Priority: Medium
   */
  test('TC-BE-401-03: Returns 400 for empty IDs list', async () => {
    await request(app)
      .get('/api/properties/compare')
      .query({ ids: '' })
      .expect(400);
  });
});
