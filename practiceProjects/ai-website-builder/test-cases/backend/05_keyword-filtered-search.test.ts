import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

/**
 * FEATURE: Keyword and Filtered Search (FEAT-301)
 * COVERAGE: API, Database, Validation, Performance
 */

describe('FEAT-301: Search Query Parsers and Saved Searches API', () => {
  let userToken: string;

  beforeAll(async () => {
    // Clean and seed
    await db.query('DELETE FROM saved_searches');
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

    // Seed test listings
    const ownerId = loginRes.body.user.id;
    await db.query(`
      INSERT INTO properties (owner_id, title, description, category, transaction, price, address, latitude, longitude, status, bedrooms, bathrooms, square_footage, images, amenities)
      VALUES 
      ($1, 'Modern Downtown Studio Loft', 'Luxury studio apartment in core downtown. Close to light rail, features gym and central AC.', 'residential', 'sale', 350000.00, '100 Pike St, Seattle, WA 98101', 47.6080, -122.3400, 'published', 1, 1.0, 600.00, '["img1.webp"]', '["Gym","AC"]'),
      ($1, 'Commercial Downtown Office Warehouse', 'Spacious downtown warehouse with storage capacity and high ceilings. Complete AC units.', 'commercial', 'rent', 4500.00, '200 Main St, Seattle, WA 98104', 47.6010, -122.3300, 'published', 0, 2.0, 4500.00, '["img2.webp"]', '["AC"]')
    `, [ownerId]);
  });

  afterAll(async () => {
    await db.close();
  });

  /**
   * TC-BE-301-01 (API & Search Parameters)
   * Requirement Mapping: FR-301-2, BR-004
   * Priority: High
   */
  test('TC-BE-301-01: Query properties filters category and amenities matching parameters', async () => {
    const res = await request(app)
      .get('/api/properties')
      .query({
        category: 'residential',
        amenities: 'Gym,AC'
      })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.results.length).toBe(1);
    expect(res.body.results[0].title).toContain('Studio Loft');
  });

  /**
   * TC-BE-301-02 (Database & Full-Text Search)
   * Requirement Mapping: FR-301-1
   * Priority: High
   */
  test('TC-BE-301-02: Query matches keyword using full-text search database query index', async () => {
    const res = await request(app)
      .get('/api/properties')
      .query({ query: 'warehouse storage' })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.results.length).toBe(1);
    expect(res.body.results[0].category).toBe('commercial');
  });

  /**
   * TC-BE-301-03 (API & Saved Searches)
   * Requirement Mapping: US-301-2
   * Priority: Medium
   */
  test('TC-BE-301-03: Register saved search details, linking records to profile', async () => {
    const payload = {
      searchName: 'Seattle Commercial Rentals with AC',
      filters: {
        category: 'commercial',
        transaction: 'rent',
        amenities: ['AC']
      },
      frequency: 'daily'
    };

    const res = await request(app)
      .post('/api/properties/saved-searches')
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.savedSearchId).toBeDefined();

    // DB verification
    const dbSearch = await db.query('SELECT * FROM saved_searches WHERE id = $1', [res.body.savedSearchId]);
    expect(dbSearch.rows.length).toBe(1);
    expect(dbSearch.rows[0].frequency).toBe('daily');
    expect(dbSearch.rows[0].filters.category).toBe('commercial');
  });
});
