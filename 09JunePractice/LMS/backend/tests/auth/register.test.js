const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Feature 1.1: User Registration', () => {
  beforeEach(async () => {
    // Mock database connection cleanups before each test
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
  it('BE-01-01-001: Should register a new learner successfully with status 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
        role: 'Learner'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe('jane@example.com');
    expect(res.body.data.role).toBe('Learner');
    expect(res.body.data).not.toHaveProperty('password');
  });

  // Test 2: Happy Path for Instructor
  it('BE-01-01-002: Should register a new instructor successfully with status 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Instructor',
        email: 'john@example.com',
        password: 'Password123',
        role: 'Instructor'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('Instructor');
  });

  // Test 3: Missing Fields Validation
  it('BE-01-01-003: Should fail registration if name field is missing with status 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'jane@example.com',
        password: 'Password123',
        role: 'Learner'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 4: Email Duplicate Error
  it('BE-01-01-004: Should fail if the email is already registered with status 400', async () => {
    await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashedpassword',
      role: 'Learner'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'AnotherPassword',
        role: 'Learner'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already in use');
  });

  // Test 5: Invalid Email Format
  it('BE-01-01-005: Should fail if the email format is invalid with status 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'invalid-email-format',
        password: 'Password123',
        role: 'Learner'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 6: Password Length boundary
  it('BE-01-01-006: Should fail if the password is under 8 characters with status 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'pass',
        role: 'Learner'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 7: Invalid Role selection
  it('BE-01-01-007: Should fail if role is not Learner or Instructor with status 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
        role: 'Admin'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 8: Empty Request Body
  it('BE-01-01-008: Should fail if request body is empty with status 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 9: NoSQL Injection Guard
  it('BE-01-01-009: Should sanitize email parameter to prevent NoSQL operator injection', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Attacker',
        email: { $ne: '' },
        password: 'Password123',
        role: 'Learner'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 10: Server Error Handling simulation
  it('BE-01-01-010: Should return 500 if the database save operation fails', async () => {
    jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database connection failure');
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
        role: 'Learner'
      });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
