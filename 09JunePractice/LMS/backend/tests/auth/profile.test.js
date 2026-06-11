const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Feature 1.3: User Profile Management', () => {
  let token;
  let userId;

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }

    const user = await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashedpassword',
      role: 'Learner'
    });
    userId = user._id.toString();

    token = jwt.sign(
      { id: userId, role: 'Learner' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: GET Profile Happy Path
  it('BE-01-03-001: Should retrieve user profile details with a valid token and status 200', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('jane@example.com');
    expect(res.body.data.role).toBe('Learner');
  });

  // Test 2: GET Profile Unauthenticated
  it('BE-01-03-002: Should reject GET profile if Authorization header is missing with status 401', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 3: GET Profile Malformed Token
  it('BE-01-03-003: Should reject GET profile if token format is invalid with status 401', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtokenstring');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 4: PUT Profile Happy Path
  it('BE-01-03-004: Should update name and email successfully and return status 200', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Jane Smith',
        email: 'janesmith@example.com'
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Jane Smith');
    expect(res.body.data.email).toBe('janesmith@example.com');
  });

  // Test 5: PUT Profile Email Collision
  it('BE-01-03-005: Should fail profile update if email matches another existing user with status 400', async () => {
    await User.create({
      name: 'Bob Rossi',
      email: 'bob@example.com',
      password: 'hashedpassword',
      role: 'Learner'
    });

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'bob@example.com'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 6: PUT Profile Bypass Role Elevation
  it('BE-01-03-006: Should prevent role elevation modification attempts with status 403', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        role: 'Instructor'
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);

    // Assert DB role was not updated
    const updatedUser = await User.findById(userId);
    expect(updatedUser.role).toBe('Learner');
  });

  // Test 7: PUT Profile Email format validation
  it('BE-01-03-007: Should reject profile update if email format is invalid with status 400', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'invalid-email'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 8: PUT Profile Unauthenticated
  it('BE-01-03-008: Should reject PUT profile if Authorization header is missing with status 401', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .send({ name: 'Jane Smith' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 9: PUT Profile Empty Payload (No changes)
  it('BE-01-03-009: Should respond with status 200 and return original data on empty payload', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Jane Doe');
  });

  // Test 10: DB error simulation
  it('BE-01-03-010: Should return status 500 if DB update operation fails', async () => {
    jest.spyOn(User, 'findByIdAndUpdate').mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Jane Smith' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
