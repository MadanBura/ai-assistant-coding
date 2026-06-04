import request from 'supertest';
import app from '../../src/app'; // Mock import matching typical node projects
import pool from '../../src/db'; // Mock postgres connection pool

/**
 * FEATURE ID: FT-1.1 (Multi-role Registration & Authentication)
 * MAPPED REQUIREMENTS: FR-101, SEC-101, SEC-104
 * ACCEPTANCE CRITERIA: AC-101, AC-102
 */

describe('FT-1.1: Multi-role Registration & Authentication Integration tests', () => {

  beforeAll(async () => {
    // Clear test table records
    await pool.query('DELETE FROM users WHERE email LIKE \'test_%\'');
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * TC ID: TC-BE-101
   * Type: API / Database Insertion
   * Preconditions: DB is accessible and test tables empty of target email
   * Priority: Critical
   */
  it('TC-BE-101: POST /api/v1/auth/register should successfully hash password and save record', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test_agent@example.com',
        password: 'SecurePassword1!',
        fullName: 'Test Agent',
        role: 'Agent',
        phoneNumber: '+15550199'
      });

    expect(res.status).toBe(211); // Matches created status code
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('Agent');

    // Confirm database record has hashed password (not plain text)
    const dbRes = await pool.query('SELECT password_hash FROM users WHERE email = $1', ['test_agent@example.com']);
    expect(dbRes.rows.length).toBe(1);
    expect(dbRes.rows[0].password_hash).not.toBe('SecurePassword1!');
    expect(dbRes.rows[0].password_hash.startsWith('$2b$')).toBe(true); // bcrypt indicator
  });

  /**
   * TC ID: TC-BE-102
   * Type: Security / JWT Lifecycle
   * Preconditions: Registered user exists in database
   * Priority: High
   */
  it('TC-BE-102: POST /api/v1/auth/login should return valid JWT inside httpOnly cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test_agent@example.com',
        password: 'SecurePassword1!'
      });

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    
    // Parse cookie keys
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toContain('token=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Strict');
  });

  /**
   * TC ID: TC-BE-103
   * Type: Negative Validation
   * Preconditions: User account already registered in database
   * Priority: Medium
   */
  it('TC-BE-103: POST /api/v1/auth/register should reject duplicate email submissions with generic message', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test_agent@example.com',
        password: 'AnotherPassword1!',
        fullName: 'Test Agent Duplicate',
        role: 'Agent'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('An account with this email already exists');
  });

});
