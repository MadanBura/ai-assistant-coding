import request from 'supertest';
import app from '../../src/app';
import pool from '../../src/db';

/**
 * FEATURE ID: FT-2.1 (Rich Property Listing Builder)
 * MAPPED REQUIREMENTS: FR-201, BRL-001, SEC-201
 * ACCEPTANCE CRITERIA: AC-201, AC-104
 */

describe('FT-2.1: Rich Property Listing Builder Integration tests', () => {

  let agentToken: string;
  let ownerToken: string;

  beforeAll(async () => {
    // Generate valid JWT tokens for test roles
    agentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9hZ2VudDEyMyIsInJvbGUiOiJBZ2VudCJ9...'; // Mock token
    ownerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9vd25lcjQ1NiIsInJvbGUiOiJPd25lciJ9...'; // Mock token
    
    // Setup initial DB states
    await pool.query('DELETE FROM properties WHERE title LIKE \'Test Villa%\'');
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-201
   * Type: API / Functional
   * Preconditions: Valid Agent Token
   * Priority: Critical
   */
  it('TC-BE-201: POST /api/v1/properties should save details with geocoded coordinates and set state to PENDING_APPROVAL', async () => {
    const res = await request(app)
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${agentToken}`)
      .field('title', 'Test Villa 99')
      .field('description', 'An upscale residential building')
      .field('price', 650000)
      .field('propertyType', 'Residential')
      .field('beds', 4)
      .field('baths', 3)
      .field('sqft', 2400)
      .field('streetAddress', '1600 Amphitheatre Pkwy')
      .field('city', 'Mountain View')
      .field('state', 'CA')
      .field('zipcode', '94043')
      .attach('deedFile', Buffer.from('%PDF-1.5 title deed...'), 'deed.pdf');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING_APPROVAL');
    
    // Spatial verification: assert coordinate fields resolved geocoding
    expect(res.body.data.coordinates).toBeDefined();
    expect(res.body.data.coordinates.lat).toBeCloseTo(37.422, 1);
    expect(res.body.data.coordinates.lng).toBeCloseTo(-122.084, 1);
  });

  /**
   * TC ID: TC-BE-202
   * Type: Integration / Upload processing
   * Preconditions: Property record exists
   * Priority: High
   */
  it('TC-BE-202: POST /api/v1/properties/{id}/media should compress and save images in S3 bucket', async () => {
    const propertyId = 'prop_test123';
    
    const res = await request(app)
      .post(`/api/v1/properties/${propertyId}/media`)
      .set('Authorization', `Bearer ${agentToken}`)
      .attach('images', Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), 'test_photo.png'); // Mock PNG magic bytes

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.media[0].url).toContain('.webp'); // Confirms media parser output extension webp compression format
  });

  /**
   * TC ID: TC-BE-203
   * Type: Validation / Capabilities Cap Check
   * Preconditions: Owner has 2 active properties in database
   * Priority: High
   */
  it('TC-BE-203: POST /api/v1/properties should reject submission if owner has hit the 2 active listings cap limit', async () => {
    // Seed 2 properties under Owner usr_owner456
    await pool.query('INSERT INTO properties (id, owner_id, title, status) VALUES (\'p1\', \'usr_owner456\', \'Test Villa 1\', \'APPROVED\'), (\'p2\', \'usr_owner456\', \'Test Villa 2\', \'APPROVED\')');

    const res = await request(app)
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Test Villa 3',
        price: 300000,
        propertyType: 'Residential',
        streetAddress: '789 Oak Ave'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Listing cap reached');
  });

});
