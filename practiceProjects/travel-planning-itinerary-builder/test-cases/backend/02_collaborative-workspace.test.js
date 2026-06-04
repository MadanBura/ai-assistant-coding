const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');

describe('Collaborative Workspace API (FE-102) - Test Suite', () => {
  let ownerToken, collaboratorToken, tripId;

  beforeAll(async () => {
    await db.migrate.latest();
    // Preconditions: Establish logged-in users and create trip
    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@example.com', password: 'SecurePassword123!' });
    ownerToken = ownerRes.body.token;

    const collabRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'collaborator@example.com', password: 'SecurePassword123!' });
    collaboratorToken = collabRes.body.token;

    const tripRes = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Collab Test Trip',
        destination: 'Berlin, Germany',
        start_date: '2026-08-01',
        end_date: '2026-08-05'
      });
    tripId = tripRes.body.tripId;
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('TC-BE-102.1: Functional & Security - Invite Token Generation (AC-102.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-1.4
    // Steps: Request invite link using Owner JWT, check tokens fields
    const res = await request(app)
      .post(`/api/trips/${tripId}/invite`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('invite_url');
    expect(res.body.invite_url).toContain('/trips/join/');
  });

  test('TC-BE-102.2: Security - Non-owner permissions updates blocked (AC-102.2)', async () => {
    // Priority: High
    // Requirement Mapping: FR-1.5
    // Steps: Collaborator attempts to change permissions parameters on workspace
    const res = await request(app)
      .patch(`/api/trips/${tripId}/permissions`)
      .set('Authorization', `Bearer ${collaboratorToken}`)
      .send({
        user_id: 'some-user-id',
        role: 'editor'
      });

    // Expected Result: Returns 403 Forbidden (RBAC holds)
    expect(res.statusCode).toEqual(403);
  });
});
