const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');

describe('Flight Tracker API (FE-501) - Test Suite', () => {
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
        title: 'Flights Trip',
        destination: 'Frankfurt, Germany',
        start_date: '2026-07-10',
        end_date: '2026-07-20'
      });
    tripId = tripRes.body.tripId;
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('TC-BE-501.1: Functional & Integration - Add Flight validation & API check (AC-501.2)', async () => {
    // Priority: High
    // Requirement Mapping: FR-5.1
    // Steps: Post flight tracking code to workspace
    const res = await request(app)
      .post(`/api/trips/${tripId}/flights`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        flight_code: 'LH430',
        departure_date: '2026-07-10'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('itemId');
    expect(res.body).toHaveProperty('status');
    expect(res.body.departure.airport).toEqual('EWR');
  });

  test('TC-BE-501.2: Validation - Format validation checks format regex rules (AC-501.1)', async () => {
    // Priority: Medium
    // Requirement Mapping: FR-5.1
    // Steps: Post invalid flight code to backend endpoint
    const res = await request(app)
      .post(`/api/trips/${tripId}/flights`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        flight_code: 'INVALID_CODE_123',
        departure_date: '2026-07-10'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('Invalid flight code format');
  });
});
