const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');

describe('Map Integration API (FE-202) - Test Suite', () => {
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
        title: 'Map Route Trip',
        destination: 'Rome, Italy',
        start_date: '2026-11-01',
        end_date: '2026-11-05'
      });
    tripId = tripRes.body.tripId;

    // Seed mock activities in database
    await db('itinerary_items').insert([
      {
        trip_id: tripId,
        title: 'Colosseum',
        start_time: new Date('2026-11-02T09:00:00Z'),
        end_time: new Date('2026-11-02T11:00:00Z'),
        latitude: 41.8902,
        longitude: 12.4922,
        category: 'activity'
      },
      {
        trip_id: tripId,
        title: 'Trevi Fountain',
        start_time: new Date('2026-11-02T12:00:00Z'),
        end_time: new Date('2026-11-02T13:00:00Z'),
        latitude: 41.9009,
        longitude: 12.4833,
        category: 'activity'
      }
    ]);
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('TC-BE-202.1: Functional - Fetch plotted map points (AC-202.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-2.3
    const res = await request(app)
      .get(`/api/trips/${tripId}/itinerary/map-points`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0]).toHaveProperty('latitude');
    expect(res.body[0].latitude).toEqual(41.8902);
  });

  test('TC-BE-202.2: Integration - Route calculations Matrix response (AC-202.2)', async () => {
    // Priority: Medium
    // Requirement Mapping: FR-2.4
    const res = await request(app)
      .get(`/api/trips/${tripId}/itinerary/routes?day=2026-11-02&mode=walking`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('route_legs');
    expect(res.body.route_legs[0]).toHaveProperty('distance_meters');
  });
});
