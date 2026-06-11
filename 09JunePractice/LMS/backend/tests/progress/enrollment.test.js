const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Progress = require('../../src/models/Progress');

describe('Feature 3.1: Course Discovery and Enrollment', () => {
  let learnerToken;
  let instructorToken;
  let courseId;
  let learnerId;

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }

    const learner = await User.create({
      name: 'Learner Jane',
      email: 'jane@example.com',
      password: 'hashedpassword',
      role: 'Learner'
    });
    learnerId = learner._id.toString();

    const instructor = await User.create({
      name: 'Instructor Bob',
      email: 'bob@example.com',
      password: 'hashedpassword',
      role: 'Instructor'
    });

    learnerToken = jwt.sign(
      { id: learnerId, role: 'Learner' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    instructorToken = jwt.sign(
      { id: instructor._id.toString(), role: 'Instructor' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    const course = await Course.create({
      title: 'Introduction to Node.js',
      description: 'Learn backend design.',
      category: 'Software Engineering',
      instructorId: instructor._id
    });
    courseId = course._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: GET Courses Happy Path
  it('BE-03-01-001: Should list all courses for learners with status 200', async () => {
    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  // Test 2: GET Courses Unauthenticated
  it('BE-03-01-002: Should reject courses catalog access if token is missing with status 401', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 3: POST Enroll Happy Path
  it('BE-03-01-003: Should enroll an authenticated learner successfully with status 201', async () => {
    const res = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progressPercent).toBe(0);
    expect(res.body.data.userId).toBe(learnerId);
    expect(res.body.data.courseId).toBe(courseId);
  });

  // Test 4: POST Enroll Unauthenticated
  it('BE-03-01-004: Should reject enrollment requests if token is missing with status 401', async () => {
    const res = await request(app).post(`/api/courses/${courseId}/enroll`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 5: POST Enroll Duplicate Enrollment
  it('BE-03-01-005: Should reject duplicate enrollment requests with status 409', async () => {
    await Progress.create({
      userId: learnerId,
      courseId: courseId,
      progressPercent: 0
    });

    const res = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Already enrolled');
  });

  // Test 6: POST Enroll Instructor Block
  it('BE-03-01-006: Should prevent Instructors from enrolling in courses with status 403', async () => {
    const res = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 7: POST Enroll Course Not Found
  it('BE-03-01-007: Should return status 404 if enrolling in a non-existent course ID', async () => {
    const fakeCourseId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/courses/${fakeCourseId}/enroll`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // Test 8: Progress initialization fields check
  it('BE-03-01-008: Enrolling must create a Progress document with empty completed collections', async () => {
    const res = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(201);

    const record = await Progress.findOne({ userId: learnerId, courseId: courseId });
    expect(record.progressPercent).toBe(0);
    expect(record.completedTopics.length).toBe(0);
    expect(record.completedQuizzes.length).toBe(0);
    expect(record.finalExamPassed).toBe(false);
  });

  // Test 9: Get Courses returns empty array if no records
  it('BE-03-01-009: Should return status 200 and an empty array if no courses are in database', async () => {
    await Course.deleteMany({});
    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  // Test 10: DB failure handling
  it('BE-03-01-010: Should return status 500 if DB save throws an error during enrollment', async () => {
    jest.spyOn(Progress.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const res = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(500);
  });
});
