const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Progress = require('../../src/models/Progress');

describe('Feature 2.1: Course Creation and Management', () => {
  let instructorToken;
  let learnerToken;
  let anotherInstructorToken;
  let instructorId;
  let anotherInstructorId;
  let courseId;

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }

    const instructor = await User.create({
      name: 'Instructor Bob',
      email: 'bob@example.com',
      password: 'hashedpassword',
      role: 'Instructor'
    });
    instructorId = instructor._id.toString();

    const anotherInstructor = await User.create({
      name: 'Instructor Alice',
      email: 'alice@example.com',
      password: 'hashedpassword',
      role: 'Instructor'
    });
    anotherInstructorId = anotherInstructor._id.toString();

    const learner = await User.create({
      name: 'Learner Jane',
      email: 'jane@example.com',
      password: 'hashedpassword',
      role: 'Learner'
    });

    instructorToken = jwt.sign(
      { id: instructorId, role: 'Instructor' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    anotherInstructorToken = jwt.sign(
      { id: anotherInstructorId, role: 'Instructor' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    learnerToken = jwt.sign(
      { id: learner._id.toString(), role: 'Learner' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    const course = await Course.create({
      title: 'Introduction to Node.js',
      description: 'Learn backend design.',
      category: 'Software Engineering',
      instructorId: instructorId
    });
    courseId = course._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: POST Course Happy Path
  it('BE-02-01-001: Should create a course successfully as an Instructor with status 201', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'React 19 Advanced',
        description: 'Deep dive into rendering.',
        category: 'Frontend Development'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('React 19 Advanced');
    expect(res.body.data.instructorId).toBe(instructorId);
  });

  // Test 2: POST Course Learner Forbidden
  it('BE-02-01-002: Should block course creation for Learners with status 403', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        title: 'Bypassed Title',
        description: 'Description.',
        category: 'Category'
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 3: POST Course Missing Fields
  it('BE-02-01-003: Should reject course creation if required fields are missing with status 400', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'React 19 Advanced'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 4: GET all courses
  it('BE-02-01-04: Should fetch all courses successfully with status 200', async () => {
    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Introduction to Node.js');
  });

  // Test 5: GET course by ID Happy Path
  it('BE-02-01-005: Should retrieve a single course detail successfully with status 200', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Introduction to Node.js');
  });

  // Test 6: GET course by ID Not Found
  it('BE-02-01-006: Should return status 404 if the requested course ID does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/courses/${fakeId}`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // Test 7: PUT Course Happy Path
  it('BE-02-01-007: Should allow the course owner to update course metadata successfully with status 200', async () => {
    const res = await request(app)
      .put(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Node.js Mastery'
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Node.js Mastery');
  });

  // Test 8: PUT Course Forbidden to Non-Owner
  it('BE-02-01-008: Should prevent a non-owner instructor from updating the course with status 403', async () => {
    const res = await request(app)
      .put(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${anotherInstructorToken}`)
      .send({
        title: 'Hacked Node.js'
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 9: DELETE Course Happy Path + Cascade Check
  it('BE-02-01-009: Should allow owner to delete course, returning status 200, and delete enrollments', async () => {
    // Mock user enrollment in this course
    await Progress.create({
      userId: new mongoose.Types.ObjectId(),
      courseId: courseId,
      progressPercent: 10
    });

    const res = await request(app)
      .delete(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify Course deletion from DB
    const course = await Course.findById(courseId);
    expect(course).toBeNull();

    // Verify Progress cascade deletion
    const progressRecords = await Progress.find({ courseId: courseId });
    expect(progressRecords.length).toBe(0);
  });

  // Test 10: DELETE Course Forbidden to Non-Owner
  it('BE-02-01-010: Should reject deletion attempts from non-owners with status 403', async () => {
    const res = await request(app)
      .delete(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${anotherInstructorToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
