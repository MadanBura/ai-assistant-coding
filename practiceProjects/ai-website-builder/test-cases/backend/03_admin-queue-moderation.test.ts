import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

/**
 * FEATURE: Admin Queue & Moderation (FEAT-801)
 * COVERAGE: API, Database, Security, Edge Cases
 */

describe('FEAT-801: Admin Moderation API and Lock Collision Handling', () => {
  let adminToken: string;
  let ownerToken: string;
  let propertyId: string;

  beforeAll(async () => {
    // Clear databases and insert admin and owner users
    await db.query('DELETE FROM admin_audit_logs');
    await db.query('DELETE FROM properties');
    await db.query('DELETE FROM users');

    // Create Admin
    await request(app).post('/api/auth/register').send({
      email: 'elena.admin@test.com',
      password: 'ComplexPass123!',
      fullName: 'Elena Admin',
      role: 'admin',
      phone: '+12065550009'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'elena.admin@test.com'");
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'elena.admin@test.com',
      password: 'ComplexPass123!'
    });
    adminToken = adminLogin.body.token;

    // Create Owner
    await request(app).post('/api/auth/register').send({
      email: 'owner@test.com',
      password: 'ComplexPass123!',
      fullName: 'David Owner',
      role: 'owner',
      phone: '+12065550001'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'owner@test.com'");
    const ownerLogin = await request(app).post('/api/auth/login').send({
      email: 'owner@test.com',
      password: 'ComplexPass123!'
    });
    ownerToken = ownerLogin.body.token;

    // Seed pending property listing
    const propRes = await db.query(`
      INSERT INTO properties (owner_id, title, description, category, transaction, price, address, latitude, longitude, status, bedrooms, bathrooms, square_footage, images)
      VALUES ((SELECT id FROM users WHERE email = 'owner@test.com'), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, updated_at
    `, [
      'Suburban Mansion Pending',
      'Pending mansion details for moderation queue tests...',
      'residential',
      'sale',
      1200000.00,
      '789 Wealthy Way, Bellevue, WA 98004',
      47.6101,
      -122.2015,
      'pending',
      5,
      6.0,
      6200.00,
      JSON.stringify(['image1.webp', 'image2.webp', 'image3.webp'])
    ]);
    propertyId = propRes.rows[0].id;
  });

  afterAll(async () => {
    await db.close();
  });

  /**
   * TC-BE-801-01 (API & Database & Audit Log)
   * Requirement Mapping: FR-801, BR-008
   * Priority: High
   */
  test('TC-BE-801-01: Admin approves listing, transitions status, and updates audit logs', async () => {
    const res = await request(app)
      .post(`/api/admin/properties/${propertyId}/moderate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        action: 'approve',
        reason: 'Listing passes visual and details validation.'
      })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.auditLogId).toBeDefined();

    // Verify property transitions to published status in DB
    const propQuery = await db.query('SELECT status FROM properties WHERE id = $1', [propertyId]);
    expect(propQuery.rows[0].status).toBe('published');

    // Verify audit logs creation
    const logQuery = await db.query('SELECT * FROM admin_audit_logs WHERE id = $1', [res.body.auditLogId]);
    expect(logQuery.rows.length).toBe(1);
    expect(logQuery.rows[0].action).toBe('approve');
  });

  /**
   * TC-BE-801-02 (Security & RBAC)
   * Requirement Mapping: SEC-004
   * Priority: High
   */
  test('TC-BE-801-02: Prevent listing owner from moderating their own listing', async () => {
    await request(app)
      .post(`/api/admin/properties/${propertyId}/moderate`)
      .set('Authorization', `Bearer ${ownerToken}`) // Non-admin user
      .send({
        action: 'approve'
      })
      .expect(403);
  });

  /**
   * TC-BE-801-03 (Edge Case & Locking Collision)
   * Requirement Mapping: US-801-1
   * Priority: High
   */
  test('TC-BE-801-03: Return 409 Conflict if admin attempts to moderate a modified record', async () => {
    // Reset property to pending and get initial update timestamp
    const resetQuery = await db.query(`
      UPDATE properties SET status = 'pending', updated_at = NOW() - INTERVAL '5 minutes'
      WHERE id = $1 RETURNING updated_at
    `, [propertyId]);
    
    const staleTimestamp = resetQuery.rows[0].updated_at;

    // Simulate another process modifying the property details (updating the updated_at timestamp)
    await db.query(`
      UPDATE properties SET updated_at = NOW() WHERE id = $1
    `, [propertyId]);

    // Attempt moderation passing the stale timestamp in body
    const res = await request(app)
      .post(`/api/admin/properties/${propertyId}/moderate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        action: 'approve',
        reason: 'Review verification check',
        lastFetchedAt: staleTimestamp // Pass stale time to trigger optimistic lock check
      })
      .expect(409); // Conflict

    expect(res.body.code).toBe('RECORD_MODIFIED');
  });
});
