const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');

describe('Itinerary Builder API (FE-201) - Test Suite', () => {
  let ownerToken, viewerToken, tripId;

  beforeAll(async () => {
    await db.migrate.latest();
    // Preconditions
    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@example.com', password: 'SecurePassword123!' });
    ownerToken = ownerRes.body.token;

    const viewerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@example.com', password: 'SecurePassword123!' });
    viewerToken = viewerRes.body.token;

    const tripRes = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Itinerary Test Trip',
        destination: 'Madrid, Spain',
        start_date: '2026-09-01',
        end_date: '2026-09-05'
      });
    tripId = tripRes.body.tripId;
    
    // Set up viewer user to trip member directory
    await db('trip_members').insert({
      trip_id: tripId,
      user_id: 'viewer-uuid',
      role: 'viewer'
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('TC-BE-201.1: Functional - Add Activity Card (AC-201.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-2.1
    // Steps: Send POST payload containing activity fields
    const res = await request(app)
      .post(`/api/trips/${tripId}/itinerary`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Louvre Tour',
        start_time: '2026-09-02T10:00:00Z',
        end_time: '2026-09-02T13:00:00Z',
        location_name: 'Madrid, Spain',
        category: 'activity'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('itemId');
  });

  test('TC-BE-201.2: Security - Viewer role blocked from adding items (AC-102.2)', async () => {
    // Priority: High
    // Requirement Mapping: FR-2.1
    // Steps: Execute POST call using Viewer JWT
    const res = await request(app)
      .post(`/api/trips/${tripId}/itinerary`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        title: 'Hacked Meal Stop',
        start_time: '2026-09-02T12:00:00Z',
        end_time: '2026-09-02T13:00:00Z',
        category: 'food'
      });

    // Expected Result: Returns 403 Forbidden
    expect(res.statusCode).toEqual(403);
  });
});
