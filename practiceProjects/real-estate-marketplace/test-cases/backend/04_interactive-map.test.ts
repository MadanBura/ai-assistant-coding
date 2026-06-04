import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';

/**
 * FEATURE ID: FT-3.1 (Interactive Map Interface)
 * MAPPED REQUIREMENTS: FR-301, SEC-301
 * ACCEPTANCE CRITERIA: AC-301, AC-302
 */

describe('FT-3.1: Interactive Map Interface Integration tests', () => {

  beforeAll(async () => {
    // Seed properties containing coordinates fields inside DB
    await pool.query('DELETE FROM properties WHERE title LIKE \'MapVilla%\'');
    await pool.query(`
      INSERT INTO properties (id, title, price, latitude, longitude, status)
      VALUES 
      ('m1', 'MapVilla San Francisco', 750000, 37.7749, -122.4194, 'APPROVED'),
      ('m2', 'MapVilla Oakland', 520000, 37.8044, -122.2712, 'APPROVED'),
      ('m3', 'MapVilla Los Angeles', 890000, 34.0522, -118.2437, 'APPROVED')
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-401
   * Type: Spatial API / Database Queries
   * Preconditions: Postgres DB containing PostGIS functions active
   * Priority: Critical
   */
  it('TC-BE-401: GET /api/v1/properties should return items within spatial envelope boundaries coordinates', async () => {
    // Coordinate box covering SF and Oakland, excluding LA
    const res = await request(app)
      .get('/api/v1/properties')
      .query({
        latMin: 37.70,
        latMax: 37.90,
        lngMin: -122.50,
        lngMax: -122.20
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // SF (m1) and Oakland (m2) match boundaries
    const ids = res.body.data.properties.map((p: any) => p.propertyId);
    expect(ids).toContain('m1');
    expect(ids).toContain('m2');
    expect(ids).not.toContain('m3'); // LA is outside coordinates limits box
  });

  /**
   * TC ID: TC-BE-402
   * Type: Security / Coordinates Obfuscation
   * Preconditions: Unauthenticated session requests property coordinate values
   * Priority: High
   */
  it('TC-BE-402: GET /api/v1/properties should obfuscate precise coordinate coordinates for guests', async () => {
    // Seed listing configured for address obfuscation
    await pool.query('UPDATE properties SET street_address = \'Confidential Address\', status = \'APPROVED\' WHERE id = \'m1\'');

    const res = await request(app)
      .get('/api/v1/properties')
      .query({
        latMin: 37.70,
        latMax: 37.90,
        lngMin: -122.50,
        lngMax: -122.20
      });

    expect(res.status).toBe(200);
    const m1Data = res.body.data.properties.find((p: any) => p.propertyId === 'm1');
    expect(m1Data).toBeDefined();

    // Verify coordinates returned are NOT the exact DB coordinate mappings (37.7749, -122.4194)
    expect(m1Data.coordinates.lat).not.toBe(37.7749);
    expect(m1Data.coordinates.lng).not.toBe(-122.4194);
    
    // Coordinates must fall within 200m radius threshold boundary difference
    const latDiff = Math.abs(m1Data.coordinates.lat - 37.7749);
    const lngDiff = Math.abs(m1Data.coordinates.lng - -122.4194);
    expect(latDiff).toBeLessThan(0.005);
    expect(lngDiff).toBeLessThan(0.005);
  });

});
