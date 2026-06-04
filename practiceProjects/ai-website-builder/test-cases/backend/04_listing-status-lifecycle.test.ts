import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

/**
 * FEATURE: Listing Status Lifecycle (FEAT-202)
 * COVERAGE: API, Database, Validation, Security, Edge Cases
 */

describe('FEAT-202: Listing Lifecycle State Transitions and Authorization Rules', () => {
  let ownerToken: string;
  let hackerToken: string;
  let propertyId: string;

  beforeAll(async () => {
    // Clean and seed
    await db.query('DELETE FROM properties');
    await db.query('DELETE FROM users');

    // Create Owner
    await request(app).post('/api/auth/register').send({
      email: 'owner@test.com',
      password: 'ComplexPass123!',
      fullName: 'David Owner',
      role: 'owner',
      phone: '+12065550001'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'owner@test.com'");
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'owner@test.com',
      password: 'ComplexPass123!'
    });
    ownerToken = loginRes.body.token;

    // Create Hacker (unauthorized owner)
    await request(app).post('/api/auth/register').send({
      email: 'hacker@test.com',
      password: 'ComplexPass123!',
      fullName: 'Hacker User',
      role: 'owner',
      phone: '+12065550007'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'hacker@test.com'");
    const hackerLogin = await request(app).post('/api/auth/login').send({
      email: 'hacker@test.com',
      password: 'ComplexPass123!'
    });
    hackerToken = hackerLogin.body.token;

    // Seed property
    const propRes = await db.query(`
      INSERT INTO properties (owner_id, title, description, category, transaction, price, address, latitude, longitude, status, bedrooms, bathrooms, square_footage, images)
      VALUES ((SELECT id FROM users WHERE email = 'owner@test.com'), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [
      'Suburban Mansion',
      'Mansion details for lifecycle state machine testing...',
      'residential',
      'sale',
      1200000.00,
      '789 Wealthy Way, Bellevue, WA 98004',
      47.6101,
      -122.2015,
      'draft', // Start in draft status
      5,
      6.0,
      6200.00,
      JSON.stringify(['image1.webp'])
    ]);
    propertyId = propRes.rows[0].id;
  });

  afterAll(async () => {
    await db.close();
  });

  /**
   * TC-BE-202-01 (API & State Machine validation)
   * Requirement Mapping: FR-202-1
   * Priority: High
   */
  test('TC-BE-202-01: Owner transitions property from Draft to Pending successfully', async () => {
    const res = await request(app)
      .put(`/api/properties/${propertyId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'pending' })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.currentStatus).toBe('pending');
  });

  /**
   * TC-BE-202-02 (API & Validation & Negative)
   * Requirement Mapping: FR-202-1
   * Priority: High
   */
  test('TC-BE-202-02: Returns 422 for invalid state machine transitions', async () => {
    // Attempt invalid transition: pending -> sold directly
    const res = await request(app)
      .put(`/api/properties/${propertyId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'sold' })
      .expect(422);

    expect(res.body.code).toBe('INVALID_STATE_TRANSITION');
  });

  /**
   * TC-BE-202-03 (Security & Authorization)
   * Requirement Mapping: SEC-004
   * Priority: High
   */
  test('TC-BE-202-03: Blocks non-owners from editing listing status', async () => {
    await request(app)
      .put(`/api/properties/${propertyId}/status`)
      .set('Authorization', `Bearer ${hackerToken}`)
      .send({ status: 'archived' })
      .expect(403);
  });
});
