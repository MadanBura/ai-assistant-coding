import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

/**
 * FEATURE: Saved Favorites (FEAT-402)
 * COVERAGE: API, Database, Validation, Security
 */

describe('FEAT-402: User Favorites Storage and Endpoint Toggles', () => {
  let userToken: string;
  let propertyId: string;
  let userId: string;

  beforeAll(async () => {
    // Clean and seed
    await db.query('DELETE FROM favorites');
    await db.query('DELETE FROM properties');
    await db.query('DELETE FROM users');

    // Create Buyer User
    await request(app).post('/api/auth/register').send({
      email: 'buyer@test.com',
      password: 'ComplexPass123!',
      fullName: 'Sarah Jenkins',
      role: 'buyer',
      phone: '+12065550192'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'buyer@test.com'");
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'buyer@test.com',
      password: 'ComplexPass123!'
    });
    userToken = loginRes.body.token;
    userId = loginRes.body.user.id;

    // Seed property
    const propRes = await db.query(`
      INSERT INTO properties (owner_id, title, description, category, transaction, price, address, latitude, longitude, status, bedrooms, bathrooms, square_footage, images)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [
      userId,
      'Downtown Flat',
      'Flat details for favorites testing...',
      'residential',
      'sale',
      300000.00,
      'Seattle',
      47.60,
      -122.33,
      'published',
      1,
      1,
      600,
      '["img1.webp"]'
    ]);
    propertyId = propRes.rows[0].id;
  });

  afterAll(async () => {
    await db.close();
  });

  /**
   * TC-BE-402-01 (API & Toggle On & Off)
   * Requirement Mapping: FR-402
   * Priority: High
   */
  test('TC-BE-402-01: Toggle favorites POST creates row and then deletes row on second execution', async () => {
    // 1. Toggle On
    const onRes = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ propertyId: propertyId })
      .expect(201);

    expect(onRes.body.status).toBe('success');
    expect(onRes.body.favorited).toBe(true);

    // Verify row in database
    let dbFav = await db.query('SELECT * FROM favorites WHERE user_id = $1 AND property_id = $2', [userId, propertyId]);
    expect(dbFav.rows.length).toBe(1);

    // 2. Toggle Off
    const offRes = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ propertyId: propertyId })
      .expect(200);

    expect(offRes.body.status).toBe('success');
    expect(offRes.body.favorited).toBe(false);

    // Verify row deleted from database
    dbFav = await db.query('SELECT * FROM favorites WHERE user_id = $1 AND property_id = $2', [userId, propertyId]);
    expect(dbFav.rows.length).toBe(0);
  });

  /**
   * TC-BE-402-02 (Security & Authentication)
   * Requirement Mapping: SEC-002
   * Priority: High
   */
  test('TC-BE-402-02: Returns 401 Unauthorized when adding favorite without JWT token', async () => {
    await request(app)
      .post('/api/favorites')
      .send({ propertyId: propertyId })
      .expect(401);
  });
});
