import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';
import path from 'path';
import fs from 'fs';

/**
 * FEATURE: Property Creation Wizard (FEAT-201)
 * COVERAGE: API, Database, Validation, Security, Performance
 */

describe('FEAT-201: Property Creation API and Media Storage', () => {
  let ownerToken: string;
  let buyerToken: string;

  beforeAll(async () => {
    // Clear properties and seed test users
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
    // Verify user to activate
    await db.query("UPDATE users SET is_verified = true WHERE email = 'owner@test.com'");
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'owner@test.com',
      password: 'ComplexPass123!'
    });
    ownerToken = loginRes.body.token;

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
  });

  afterAll(async () => {
    await db.close();
  });

  /**
   * TC-BE-201-01 (API & Database & Multipart)
   * Requirement Mapping: FR-201-1, FR-201-2, FR-202
   * Priority: High
   */
  test('TC-BE-201-01: Successful Multipart upload inserts pending property with WebP images', async () => {
    // Generate dummy test files for upload if they don't exist
    const mockFileDir = path.join(__dirname, '../mocks');
    if (!fs.existsSync(mockFileDir)) fs.mkdirSync(mockFileDir, { recursive: true });
    const mockFilePath = path.join(mockFileDir, 'image1.jpg');
    fs.writeFileSync(mockFilePath, 'fake-jpeg-data');

    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('title', 'Beautiful 3-Bed Suburban House')
      .field('description', 'Stunning three bedroom home located in a quiet family-friendly cul-de-sac. Features open plan living area, massive modern kitchen...')
      .field('price', '650000.00')
      .field('category', 'residential')
      .field('transaction', 'sale')
      .field('address', '456 Oak Lane, Seattle, WA 98122')
      .field('latitude', '47.6062')
      .field('longitude', '-122.3321')
      .field('bedrooms', '3')
      .field('bathrooms', '2.5')
      .field('squareFootage', '2100.00')
      .field('amenities', JSON.stringify(['Garage', 'Pool']))
      .attach('images', mockFilePath)
      .attach('images', mockFilePath)
      .attach('images', mockFilePath)
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.propertyId).toBeDefined();
    expect(res.body.listingStatus).toBe('pending');

    // DB Assertions
    const dbProp = await db.query('SELECT * FROM properties WHERE id = $1', [res.body.propertyId]);
    expect(dbProp.rows.length).toBe(1);
    const row = dbProp.rows[0];
    
    // Check PostGIS coordinates parsing
    expect(row.latitude).toBe(47.6062);
    expect(row.longitude).toBe(-122.3321);
    
    // Verify WebP image compression output (filenames in json list must end in .webp)
    const imagesArray = row.images; // parsed as JSON array
    expect(imagesArray.length).toBe(3);
    expect(imagesArray[0].endsWith('.webp')).toBe(true);
  });

  /**
   * TC-BE-201-02 (Security & RBAC)
   * Requirement Mapping: SEC-004
   * Priority: High
   */
  test('TC-BE-201-02: Block property creation if user role is Buyer', async () => {
    await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        title: 'Modern Downtown Loft',
        description: 'Stunning downtown loft apartment...',
        price: 350000.00,
        category: 'residential',
        transaction: 'sale'
      })
      .expect(403); // Forbidden
  });

  /**
   * TC-BE-201-03 (Validation & Edge Cases)
   * Requirement Mapping: FR-201-1, BRL-003
   * Priority: High
   */
  test('TC-BE-201-03: Create fails validation when less than 3 photos are uploaded', async () => {
    const mockFilePath = path.join(__dirname, '../mocks/image1.jpg');

    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('title', 'Beautiful 3-Bed Suburban House')
      .field('description', 'Stunning three bedroom home located in a quiet family-friendly cul-de-sac. Features open plan living area, massive modern kitchen...')
      .field('price', '650000.00')
      .field('category', 'residential')
      .field('transaction', 'sale')
      .field('address', '456 Oak Lane, Seattle, WA 98122')
      .field('latitude', '47.6062')
      .field('longitude', '-122.3321')
      .field('bedrooms', '3')
      .field('bathrooms', '2.5')
      .field('squareFootage', '2100.00')
      .field('amenities', JSON.stringify(['Garage']))
      .attach('images', mockFilePath) // Only 1 photo attached
      .expect(400);

    expect(res.body.code).toBe('VALIDATION_FAILED');
  });
});
