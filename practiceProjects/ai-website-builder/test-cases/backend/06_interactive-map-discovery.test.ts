import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

/**
 * FEATURE: Interactive Map Discovery (FEAT-302)
 * COVERAGE: API, Database, Validation, Performance
 */

describe('FEAT-302: Geospatial Coordinates and Boundary Queries', () => {

  beforeAll(async () => {
    // Clear properties and user records
    await db.query('DELETE FROM properties');
    await db.query('DELETE FROM users');

    // Seed test users and coordinates properties
    await db.query(`
      INSERT INTO users (id, email, password_hash, full_name, role, phone, is_verified)
      VALUES ('owner_90210', 'owner@test.com', 'hashed_pass', 'David Owner', 'owner', '+12065550001', true)
    `);

    // Insert geocoded properties
    await db.query(`
      INSERT INTO properties (id, owner_id, title, description, category, transaction, price, address, coordinates, status, bedrooms, bathrooms, square_footage, images)
      VALUES 
      ('prop_inside_seattle', 'owner_90210', 'Downtown Condo', 'Inside Seattle coordinates...', 'residential', 'sale', 350000.00, 'Seattle', ST_GeomFromText('POINT(-122.3321 47.6062)', 4326), 'published', 1, 1, 600, '["img1.webp"]'),
      ('prop_outside_seattle', 'owner_90210', 'Bellevue Mansion', 'Outside Seattle coordinates...', 'residential', 'sale', 1200000.00, 'Bellevue', ST_GeomFromText('POINT(-122.2015 47.6101)', 4326), 'published', 4, 4, 3200, '["img2.webp"]')
    `);
  });

  afterAll(async () => {
    await db.close();
  });

  /**
   * TC-BE-302-01 (API & PostGIS Bounding Box query)
   * Requirement Mapping: FR-302-2
   * Priority: High
   */
  test('TC-BE-302-01: Retrieve property pins located within viewport bounding box', async () => {
    // Coordinate bbox covering Seattle area specifically (excluding Bellevue)
    const bboxParam = '-122.3500,47.5900,-122.3200,47.6200';

    const res = await request(app)
      .get('/api/properties/map')
      .query({ bbox: bboxParam })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.points.length).toBe(1);
    expect(res.body.points[0].id).toBe('prop_inside_seattle');
  });

  /**
   * TC-BE-302-02 (API & Validation & Negative)
   * Requirement Mapping: FR-302-2
   * Priority: Medium
   */
  test('TC-BE-302-02: Returns 400 bad request for invalid bbox format', async () => {
    await request(app)
      .get('/api/properties/map')
      .query({ bbox: 'invalid-string-format' })
      .expect(400);
  });

  /**
   * TC-BE-302-03 (Performance Speed check)
   * Requirement Mapping: NFR-001
   * Priority: Medium
   */
  test('TC-BE-302-03: Spatial coordinates search query runs under 50ms performance limit', async () => {
    const bboxParam = '-122.5000,47.4000,-122.0000,47.8000';
    
    const startTime = Date.now();
    await request(app)
      .get('/api/properties/map')
      .query({ bbox: bboxParam });
    
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(50); // Under 50ms threshold
  });
});
