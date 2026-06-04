const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');

describe('Smart Hotel Recommendations API (FE-302) - Test Suite', () => {
  let ownerToken, tripId;

  beforeAll(async () => {
    await db.migrate.latest();
    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@example.com', password: 'SecurePassword123!' });
    ownerToken = ownerRes.body.token;

    const tripRes = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Hotels Trip',
        destination: 'Munich, Germany',
        start_date: '2026-12-10',
        end_date: '2026-12-15'
      });
    tripId = tripRes.body.tripId;
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('TC-BE-302.1: Functional & Integration - Fetch lodging recommendations near coordinates (AC-302.2)', async () => {
    // Priority: High
    // Requirement Mapping: FR-3.2
    // Steps: Query recommendation proxy endpoint
    const res = await request(app)
      .get(`/api/trips/${tripId}/lodging-recommendations?radius=5`)
      .set('Authorization', `Bearer ${ownerToken}`);

    // Expected Result: Returns status 200 with lists of hotels
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('hotel_name');
      expect(res.body[0]).toHaveProperty('booking_url');
      expect(res.body[0].booking_url).toContain('aff=globetrotter'); // Affiliate tag exists
    }
  });
});
