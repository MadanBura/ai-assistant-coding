const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');

describe('Notification System API (FE-502) - Test Suite', () => {
  let ownerToken, notificationId;

  beforeAll(async () => {
    await db.migrate.latest();
    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@example.com', password: 'SecurePassword123!' });
    ownerToken = ownerRes.body.token;

    // Seed mock notification in database
    const [id] = await db('notifications').insert({
      user_id: 'd3b07384-d113-4956-a511-2d480574719d', // Owner ID
      trip_id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
      event_type: 'budget_limit',
      message: 'Warning: Trip expenditures have crossed 90% of your budget.',
      read_state: false,
      created_at: new Date()
    }).returning('id');
    
    notificationId = id;
  });

  afterAll(async () => {
    await db.destroy();
  });

  test('TC-BE-502.1: Functional - Fetch Notifications (AC-502.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-5.3
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].read_state).toBe(false);
  });

  test('TC-BE-502.2: Functional & Database - Mark Notification as Read (AC-502.1)', async () => {
    // Priority: High
    // Requirement Mapping: FR-5.3
    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.read_state).toBe(true);

    // Database Verification: Verify read_state update inside database schema
    const row = await db('notifications').where('id', notificationId).first();
    expect(row.read_state).toBe(true);
  });
});
