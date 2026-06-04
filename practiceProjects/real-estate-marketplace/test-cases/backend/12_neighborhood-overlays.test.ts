import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';

/**
 * FEATURE ID: FT-3.2 (Neighborhood Data Overlays)
 * MAPPED REQUIREMENTS: FR-302, SEC-302
 * ACCEPTANCE CRITERIA: AC-303, AC-304
 */

describe('FT-3.2: Neighborhood Data Overlays Integration tests', () => {

  beforeAll(async () => {
    // Seed static spatial datasets (schools and transits tables mapping CA boundaries)
    await pool.query('DELETE FROM school_nodes WHERE name LIKE \'Test School%\'');
    await pool.query(`
      INSERT INTO school_nodes (id, name, rating, coordinates)
      VALUES 
      ('s1', 'Test School SF', 'A', ST_SetSRID(ST_Point(-122.4201, 37.7738), 4326))
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-1201
   * Type: Spatial API / geoJSON integration
   * Preconditions: Reference spatial reference sets seeded
   * Priority: High
   */
  it('TC-BE-1201: GET /api/v1/neighborhoods/overlays should return standard geoJSON features collection arrays', async () => {
    const res = await request(app)
      .get('/api/v1/neighborhoods/overlays')
      .query({
        latMin: 37.70,
        latMax: 37.80,
        lngMin: -122.50,
        lngMax: -122.40,
        layerType: 'Schools'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('FeatureCollection');
    expect(res.body.data.features.length).toBeGreaterThan(0);
    
    const schoolFeature = res.body.data.features[0];
    expect(schoolFeature.properties.name).toBe('Test School SF');
    expect(schoolFeature.properties.rating).toBe('A');
    expect(schoolFeature.geometry.type).toBe('Point');
  });

  /**
   * TC ID: TC-BE-1202
   * Type: Security / Rate Limiting checks
   * Preconditions: High-velocity API loops target overlays
   * Priority: Medium
   */
  it('TC-BE-1202: GET /api/v1/neighborhoods/overlays should enforce rate limiting limits after 10 requests per minute', async () => {
    const requestsCount = 12;
    let hitRateLimit = false;

    for (let i = 0; i < requestsCount; i++) {
      const res = await request(app)
        .get('/api/v1/neighborhoods/overlays')
        .query({
          latMin: 37.70,
          latMax: 37.80,
          lngMin: -122.50,
          lngMax: -122.40,
          layerType: 'Schools'
        });

      if (res.status === 429) {
        hitRateLimit = true;
        break;
      }
    }

    expect(hitRateLimit).toBe(true);
  });

});
