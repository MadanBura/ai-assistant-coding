const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Feature 1.2: User Login', () => {
  beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: Happy Path
  it('BE-01-02-001: Should login successfully with valid credentials returning token and 200', async () => {
    // Note: Password hashing will be implemented using bcrypt. Here we simulate creation
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
        role: 'Learner'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'Password123'
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.email).toBe('jane@example.com');
  });

  // Test 2: Unregistered Email
  it('BE-01-02-002: Should fail login if email is not registered with status 410', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unregistered@example.com',
        password: 'Password123'
      });
    expect(res.status).toBe(410);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  // Test 3: Incorrect Password
  it('BE-01-02-003: Should fail login if password is incorrect with status 410', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
        role: 'Learner'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'WrongPassword'
      });
    expect(res.status).toBe(410);
    expect(res.body.success).toBe(false);
  });

  // Test 4: Missing Email
  it('BE-01-02-004: Should fail if email parameter is missing with status 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'Password123'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 5: Missing Password
  it('BE-01-02-005: Should fail if password parameter is missing with status 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 6: Verify Token Decoded Payload
  it('BE-01-02-006: The returned JWT should contain correct user ID and role', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
        role: 'Learner'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'Password123'
      });

    const token = loginRes.body.token;
    const decoded = jwt.decode(token);
    expect(decoded).toHaveProperty('id');
    expect(decoded.role).toBe('Learner');
  });

  // Test 7: NoSQL Injection Block
  it('BE-01-02-007: Should reject login requests attempting NoSQL operator queries in email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: { $gt: '' },
        password: 'Password123'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 8: Empty payload
  it('BE-01-02-008: Should fail on empty request payload with status 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 9: Expired token handling check (indirectly via routing)
  it('BE-01-02-009: Should reject expired JWT tokens with status 401', async () => {
    const expiredToken = jwt.sign(
      { id: '60d0fe4f5311236168a109ca', role: 'Learner' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '-1s' }
    );

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 10: Server error simulation
  it('BE-01-02-010: Should return status 500 if server throws an internal error during credentials lookup', async () => {
    jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
      throw new Error('Internal DB search failed');
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'Password123'
      });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
