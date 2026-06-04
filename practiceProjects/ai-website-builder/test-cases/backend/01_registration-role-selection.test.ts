import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

/**
 * FEATURE: Registration and Role Selection (FEAT-101)
 * COVERAGE: API, Database, Security, Validation, Negative, Edge Cases
 */

describe('FEAT-101: Registration API and Data Storage Integration', () => {
  
  beforeEach(async () => {
    // Clear test database users table before executions
    await db.query('DELETE FROM users');
  });

  afterAll(async () => {
    await db.close();
  });

  /**
   * TC-BE-101-01 (API & Database & Security)
   * Requirement Mapping: FR-101-1, SEC-003, SEC-002
   * Priority: High
   */
  test('TC-BE-101-01: Successful Register creates User in Database and Hashes Password', async () => {
    const payload = {
      email: 'sarah.j.test@example.com',
      password: 'ComplexPass123!',
      fullName: 'Sarah Jenkins',
      role: 'buyer',
      phone: '+12065550192'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(payload)
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.tokenReferenceId).toBeDefined();

    // Verify row persistence in Database
    const dbUserQuery = await db.query('SELECT * FROM users WHERE email = $1', [payload.email]);
    expect(dbUserQuery.rows.length).toBe(1);
    const user = dbUserQuery.rows[0];

    // Verification check: User status is initialized correct
    expect(user.is_verified).toBe(false);
    expect(user.role).toBe('buyer');
    expect(user.phone).toBe('+12065550192');

    // Security check: Verify password hash is stored, NOT the cleartext
    expect(user.password_hash).not.toBe(payload.password);
    expect(user.password_hash.startsWith('$2b$')).toBe(true); // check bcrypt signature
  });

  /**
   * TC-BE-101-02 (API & Validation & Negative)
   * Requirement Mapping: FR-101-1, SEC-003
   * Priority: High
   */
  test('TC-BE-101-02: Register fails validation on invalid inputs', async () => {
    const payloads = [
      { email: 'bad-email', password: 'ComplexPass123!', fullName: 'Sarah', role: 'buyer', phone: '+12065550192' },
      { email: 'sarah@test.com', password: 'short', fullName: 'Sarah', role: 'buyer', phone: '+12065550192' },
      { email: 'sarah@test.com', password: 'ComplexPass123!', fullName: 'Sarah', role: 'unsupported', phone: '+12065550192' }
    ];

    for (const data of payloads) {
      const res = await request(app)
        .post('/api/auth/register')
        .send(data)
        .expect(400);

      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_FAILED');
    }
  });

  /**
   * TC-BE-101-03 (Edge Case & Token Expiry)
   * Requirement Mapping: FR-102
   * Priority: Medium
   */
  test('TC-BE-101-03: Token verification fails if token expired or mismatch', async () => {
    // 1. Manually insert user with expired token metadata
    const userRefId = 'verification_uuid_102938';
    await db.query(`
      INSERT INTO users (id, email, password_hash, full_name, role, phone, is_verified, verification_code_hash, verification_expiry)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      'user_90210',
      'expired@example.com',
      '$2b$12$ExampleHashValues...',
      'Expired User',
      'buyer',
      '+12065550199',
      false,
      'hashed_token_value',
      new Date(Date.now() - 1000 * 60 * 5) // Expired 5 minutes ago
    ]);

    // 2. Attempt verification check via API
    const res = await request(app)
      .post('/api/auth/verify')
      .send({
        tokenReferenceId: userRefId,
        code: '582910'
      })
      .expect(410); // Gone / Expired status

    expect(res.body.status).toBe('error');
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });

  /**
   * TC-BE-101-04 (Security & Rate Limiting)
   * Requirement Mapping: SEC-006
   * Priority: High
   */
  test('TC-BE-101-04: Verify register endpoint rate limiter activates on abuse', async () => {
    const payload = {
      email: 'bruteforce@example.com',
      password: 'ComplexPass123!',
      fullName: 'Attacker',
      role: 'buyer',
      phone: '+12065550000'
    };

    // Trigger rapid requests to register path
    for (let i = 0; i < 6; i++) {
      const res = await request(app)
        .post('/api/auth/register')
        .send(payload);

      if (i >= 5) {
        expect(res.status).toBe(429); // Too Many Requests
        expect(res.body.message).toContain('Too many requests');
      }
    }
  });
});
