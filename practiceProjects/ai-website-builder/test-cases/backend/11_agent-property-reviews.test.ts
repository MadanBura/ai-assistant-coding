import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

/**
 * FEATURE: Agent and Property Reviews (FEAT-701)
 * COVERAGE: API, Database, Validation, Security, Edge Cases
 */

describe('FEAT-701: Agent Rating and Review Integrity Rules', () => {
  let buyerToken: string;
  let hackerToken: string;
  let agentToken: string;
  let agentId: string;
  let agentUserId: string;
  let propertyId: string;

  beforeAll(async () => {
    // Clear databases
    await db.query('DELETE FROM reviews');
    await db.query('DELETE FROM messages');
    await db.query('DELETE FROM inquiries');
    await db.query('DELETE FROM agents');
    await db.query('DELETE FROM properties');
    await db.query('DELETE FROM users');

    // Create Agent User and Agent record
    await request(app).post('/api/auth/register').send({
      email: 'marcus@vance.com',
      password: 'ComplexPass123!',
      fullName: 'Marcus Vance',
      role: 'agent',
      phone: '+12065550193',
      licenseNumber: 'RE-12345678'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'marcus@vance.com'");
    const loginAgent = await request(app).post('/api/auth/login').send({
      email: 'marcus@vance.com',
      password: 'ComplexPass123!'
    });
    agentToken = loginAgent.body.token;
    agentUserId = loginAgent.body.user.id;
    const aQuery = await db.query('SELECT id FROM agents WHERE user_id = $1', [agentUserId]);
    agentId = aQuery.rows[0].id;

    // Create Property
    const propRes = await db.query(`
      INSERT INTO properties (owner_id, title, description, category, transaction, price, address, latitude, longitude, status, bedrooms, bathrooms, square_footage, images)
      VALUES ($1, 'Downtown Loft', 'Details...', 'residential', 'sale', 350000.00, 'Seattle', 47.60, -122.33, 'published', 1, 1, 600, '["img.webp"]')
      RETURNING id
    `, [agentUserId]);
    propertyId = propRes.rows[0].id;

    // Create Verified Buyer (who has messaged the agent)
    await request(app).post('/api/auth/register').send({
      email: 'buyer@test.com',
      password: 'ComplexPass123!',
      fullName: 'Sarah Buyer',
      role: 'buyer',
      phone: '+12065550002'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'buyer@test.com'");
    const loginBuyer = await request(app).post('/api/auth/login').send({
      email: 'buyer@test.com',
      password: 'ComplexPass123!'
    });
    buyerToken = loginBuyer.body.token;

    // Setup active conversation thread between Buyer and Agent
    const inqRes = await db.query(`
      INSERT INTO inquiries (property_id, buyer_id, message, status)
      VALUES ($1, $2, 'Inquiry text message', 'read') RETURNING id
    `, [propertyId, loginBuyer.body.user.id]);
    
    // Insert 3 messages to verify conversation activity criteria
    const inqId = inqRes.rows[0].id;
    await db.query(`
      INSERT INTO messages (inquiry_id, sender_id, content) VALUES
      ($1, $2, 'Msg 1'), ($1, $3, 'Msg 2'), ($1, $2, 'Msg 3')
    `, [inqId, loginBuyer.body.user.id, agentUserId]);

    // Create Hacker (unverified buyer who hasn't messaged the agent)
    await request(app).post('/api/auth/register').send({
      email: 'hacker@test.com',
      password: 'ComplexPass123!',
      fullName: 'Hacker User',
      role: 'buyer',
      phone: '+12065550007'
    });
    await db.query("UPDATE users SET is_verified = true WHERE email = 'hacker@test.com'");
    const loginHacker = await request(app).post('/api/auth/login').send({
      email: 'hacker@test.com',
      password: 'ComplexPass123!'
    });
    hackerToken = loginHacker.body.token;
  });

  afterAll(async () => {
    await db.close();
  });

  /**
   * TC-BE-701-01 (API & Database trigger)
   * Requirement Mapping: FR-701-3, BRL-006
   * Priority: High
   */
  test('TC-BE-701-01: Valid review modifies rating averages via DB trigger services', async () => {
    const res = await request(app)
      .post(`/api/agents/${agentId}/reviews`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        rating: 5,
        comment: 'Marcus was incredibly helpful. Walked us through three different condos.'
      })
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.reviewId).toBeDefined();

    // Verify rating average recalculation on database agent record
    const agentQuery = await db.query('SELECT rating_avg, reviews_count FROM agents WHERE id = $1', [agentId]);
    expect(agentQuery.rows[0].rating_avg).toBe(5.0);
    expect(agentQuery.rows[0].reviews_count).toBe(1);
  });

  /**
   * TC-BE-701-02 (Security & Verification check)
   * Requirement Mapping: US-701-1
   * Acceptance Criteria Mapping: AC-701-2
   * Priority: High
   */
  test('TC-BE-701-02: Block review submission if reviewer has no conversation history', async () => {
    await request(app)
      .post(`/api/agents/${agentId}/reviews`)
      .set('Authorization', `Bearer ${hackerToken}`) // Mismatch
      .send({
        rating: 4,
        comment: 'I am attempting to write a review without ever messaging this agent.'
      })
      .expect(403);
  });

  /**
   * TC-BE-701-03 (Security & Self-Review)
   * Requirement Mapping: FR-701
   * Priority: High
   */
  test('TC-BE-701-03: Block agent from submitting a self-review', async () => {
    await request(app)
      .post(`/api/agents/${agentId}/reviews`)
      .set('Authorization', `Bearer ${agentToken}`) // Self token
      .send({
        rating: 5,
        comment: 'Writing an amazing review about myself to boost score.'
      })
      .expect(403);
  });

  /**
   * TC-BE-701-04 (Validation & Profanity Check)
   * Requirement Mapping: FR-701-2
   * Priority: Medium
   */
  test('TC-BE-701-04: Review text containing URLs is automatically flagged for review', async () => {
    const res = await request(app)
      .post(`/api/agents/${agentId}/reviews`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        rating: 2,
        comment: 'Visit http://cheapspamlink.com to see better properties.'
      })
      .expect(201); // Created but flagged

    expect(res.body.isModerated).toBe(true);

    const reviewDb = await db.query('SELECT is_moderated FROM reviews WHERE id = $1', [res.body.reviewId]);
    expect(reviewDb.rows[0].is_moderated).toBe(true);
  });
});
