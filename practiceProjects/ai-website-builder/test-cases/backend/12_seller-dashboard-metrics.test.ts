import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

/**
 * FEATURE: Property Analytics (FEAT-601)
 * COVERAGE: API, Database, Validation, Security, Edge Cases
 */

describe('FEAT-601: Analytics Fetch Permissions and Increment Logic', () => {
  let ownerToken: string;
  let buyerToken: string;
  let propertyId: string;
  let ownerId: string;

  beforeAll(async () => {
    // Clear databases
    await db.query('DELETE FROM analytics_daily');
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
    ownerId = loginRes.body.user.id;

    // Create Buyer
    await request(app).post('/api/auth/register').send({
      email: 'buyer@test.com',
      password: 'ComplexPass123!',
      fullName: 'Sarah Buyer',
      role: 'buyer',
      phone: '+12065550002'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'buyer@test.com'");
    const buyerLogin = await request(app).post('/api/auth/login').send({
      email: 'buyer@test.com',
      password: 'ComplexPass123!'
    });
    buyerToken = buyerLogin.body.token;

    // Seed property
    const propRes = await db.query(`
      INSERT INTO properties (owner_id, title, description, category, transaction, price, address, latitude, longitude, status, bedrooms, bathrooms, square_footage, images)
      VALUES ($1, 'Downtown Loft', 'Details...', 'residential', 'sale', 350000.00, 'Seattle', 47.60, -122.33, 'published', 1, 1, 600, '["img.webp"]')
      RETURNING id
    `, [ownerId]);
    propertyId = propRes.rows[0].id;

    // Seed daily analytics history values
    await db.query(`
      INSERT INTO analytics_daily (property_id, date, views_count, save_count, inquiry_count)
      VALUES 
      ($1, CURRENT_DATE - INTERVAL '1 day', 45, 3, 1),
      ($1, CURRENT_DATE, 52, 4, 0)
    `, [propertyId]);
  });

  afterAll(async () => {
    await db.close();
  });

  /**
   * TC-BE-601-01 (API & Database Fetch)
   * Requirement Mapping: FR-601, US-601-1
   * Acceptance Criteria Mapping: AC-601-1
   * Priority: High
   */
  test('TC-BE-601-01: Successfully retrieve daily statistics timeline for property owner', async () => {
    const res = await request(app)
      .get(`/api/properties/${propertyId}/analytics`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .query({ range: '30days' })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.aggregates.totalViews).toBe(97); // 45 + 52
    expect(res.body.timeline.length).toBe(2);
  });

  /**
   * TC-BE-601-02 (Security & Authorization)
   * Requirement Mapping: SEC-004
   * Acceptance Criteria Mapping: AC-601-2
   * Priority: High
   */
  test('TC-BE-601-02: Block non-owners from retrieving property analytics', async () => {
    await request(app)
      .get(`/api/properties/${propertyId}/analytics`)
      .set('Authorization', `Bearer ${buyerToken}`) // Non-owner credential
      .query({ range: '30days' })
      .expect(403);
  });

  /**
   * TC-BE-601-03 (API & Validation & Negative)
   * Requirement Mapping: FR-601
   * Priority: Medium
   */
  test('TC-BE-601-03: Returns 400 validation error for invalid range criteria parameters', async () => {
    await request(app)
      .get(`/api/properties/${propertyId}/analytics`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .query({ range: 'invalid-range' })
      .expect(400);
  });
});
