const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');

describe('Shared Travel Notes API (FE-203) - Test Suite', () => {
  let ownerToken, tripId, noteId;

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
        title: 'Notes Test Trip',
        destination: 'Barcelona, Spain',
        start_date: '2026-10-01',
        end_date: '2026-10-05'
      });
    tripId = tripRes.body.tripId;
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('TC-BE-203.1: Functional - Create Note (AC-203.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-2.5
    const res = await request(app)
      .post(`/api/trips/${tripId}/notes`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Hotel Info',
        content: '# Lodging Details'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('noteId');
    noteId = res.body.noteId;
  });

  test('TC-BE-203.2: Validation - Character Limit enforcement (AC-203.1)', async () => {
    // Priority: Low
    // Requirement Mapping: FR-2.5
    // Steps: Send PUT payload exceeding character limit boundaries
    const heavyString = 'A'.repeat(50001); // > 50k characters limit
    const res = await request(app)
      .put(`/api/trips/${tripId}/notes/${noteId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        content: heavyString
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('limit exceeded');
  });
});
