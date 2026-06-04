const request = require('supertest');
const app = require('../../src/app'); // Target application gateway entry
const db = require('../../src/db');   // Database adapter reference

describe('Trip Creator & Planner API (FE-101) - Test Suite', () => {
  let userToken;

  beforeAll(async () => {
    // Preconditions: Seed database with dummy user and retrieve valid JWT token
    await db.migrate.latest();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@example.com', password: 'SecurePassword123!' });
    userToken = loginRes.body.token;
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('TC-BE-101.1: Functional - Create Trip POST endpoint (AC-101.3)', async () => {
    // Priority: High
    // Requirement Mapping: FR-1.1
    // Steps: Send POST payload containing destination, title, dates, budget
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Paris Summer Getaway',
        destination: 'Paris, France',
        start_date: '2026-07-10',
        end_date: '2026-07-20',
        budget_limit: 5000.00
      });

    // Expected Result: Returns 201 Created and inserts trip entry
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('tripId');
    expect(res.body).toHaveProperty('cover_url');
    
    // Database Verification: Check trip exists in schema
    const trip = await db('trips').where('id', res.body.tripId).first();
    expect(trip).toBeDefined();
    expect(trip.title).toEqual('Paris Summer Getaway');
  });

  test('TC-BE-101.2: Validation - End Date prior to Start Date (AC-101.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-1.1
    // Steps: Send POST payload with inverted chronological dates
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Invalid Dates Trip',
        destination: 'London, UK',
        start_date: '2026-07-20',
        end_date: '2026-07-10' // Inverted
      });

    // Expected Result: Returns 400 Bad Request with target error codes
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('ERR_TRIP_DATE_01');
  });

  test('TC-BE-101.3: Security - Unauthorized post attempts (AC-101.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-1.1
    // Steps: Execute POST call omitting JWT header
    const res = await request(app)
      .post('/api/trips')
      .send({
        title: 'Hack Trip',
        destination: 'Unknown',
        start_date: '2026-08-01',
        end_date: '2026-08-10'
      });

    // Expected Result: Returns 401 Unauthorized
    expect(res.statusCode).toEqual(401);
  });
});
