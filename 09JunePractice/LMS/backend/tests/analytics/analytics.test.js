const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Progress = require('../../src/models/Progress');
const QuizAttempt = require('../../src/models/QuizAttempt');
const FinalExamAttempt = require('../../src/models/FinalExamAttempt');

describe('Feature 6.1: Instructor Progress & Performance Analytics', () => {
  let instructorToken;
  let anotherInstructorToken;
  let learnerToken;
  let instructorId;
  let courseId;
  let learnerId;

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

    const learner = await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashedpassword',
      role: 'Learner'
    });
    learnerId = learner._id.toString();

    instructorToken = jwt.sign(
      { id: instructorId, role: 'Instructor' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    anotherInstructorToken = jwt.sign(
      { id: anotherInstructor._id.toString(), role: 'Instructor' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    learnerToken = jwt.sign(
      { id: learnerId, role: 'Learner' },
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

    // Populate mock progress data for learners
    await Progress.create({
      userId: learnerId,
      courseId: courseId,
      progressPercent: 50,
      completedTopics: []
    });

    // Populate mock quiz/exam performance data
    await QuizAttempt.create({
      userId: learnerId,
      topicId: new mongoose.Types.ObjectId(),
      score: 80,
      passed: true
    });

    await FinalExamAttempt.create({
      userId: learnerId,
      courseId: courseId,
      score: 90,
      passed: true
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: GET Analytics Happy Path
  it('BE-06-01-001: Should retrieve course analytics successfully as the owning instructor with status 200', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/analytics`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalEnrolled).toBe(1);
    expect(res.body.data.learners[0].name).toBe('Jane Doe');
  });

  // Test 2: GET Analytics Unauthenticated
  it('BE-06-01-002: Should reject analytics queries if token is missing with status 401', async () => {
    const res = await request(app).get(`/api/courses/${courseId}/analytics`);
    expect(res.status).toBe(401);
  });

  // Test 3: GET Analytics Learner Block
  it('BE-06-01-003: Should block Learners from viewing course analytics with status 403', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/analytics`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
  });

  // Test 4: GET Analytics Non-Owner Instructor Block
  it('BE-06-01-004: Should block non-owning instructors from viewing course analytics with status 403', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/analytics`)
      .set('Authorization', `Bearer ${anotherInstructorToken}`);
    expect(res.status).toBe(403);
  });

  // Test 5: Response Schema Validation
  it('BE-06-01-005: Analytics response payload must contain key aggregation statistics properties', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/analytics`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.body.data).toHaveProperty('totalEnrolled');
    expect(res.body.data).toHaveProperty('completionRate');
    expect(res.body.data).toHaveProperty('averageQuizScore');
    expect(res.body.data).toHaveProperty('averageFinalExamScore');
    expect(res.body.data).toHaveProperty('learners');
  });

  // Test 6: Aggregated Enrollments Count verification
  it('BE-06-01-006: Analytics enrollment count should correctly match database records', async () => {
    // Add another student
    const student2 = await User.create({
      name: 'Bob Rossi',
      email: 'bob@example.com',
      password: 'hashedpassword',
      role: 'Learner'
    });
    await Progress.create({
      userId: student2._id,
      courseId: courseId,
      progressPercent: 20
    });

    const res = await request(app)
      .get(`/api/courses/${courseId}/analytics`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.body.data.totalEnrolled).toBe(2);
  });

  // Test 7: Average progress calculation math verification
  it('BE-06-01-007: Completion rate calculation should output correct percentage average', async () => {
    // Student 1 (Jane Doe) is 100% complete
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $set: { progressPercent: 100 } }
    );
    // Add student 2 who is 0% complete
    const student2 = await User.create({
      name: 'Bob Rossi',
      email: 'bob@example.com',
      password: 'hashedpassword',
      role: 'Learner'
    });
    await Progress.create({
      userId: student2._id,
      courseId: courseId,
      progressPercent: 0
    });

    const res = await request(app)
      .get(`/api/courses/${courseId}/analytics`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.body.data.completionRate).toBe(50); // (100 + 0) / 2 = 50%
  });

  // Test 8: Quiz score average calculation math verification
  it('BE-06-01-008: Average quiz score calculation should output correct score average', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/analytics`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.body.data.averageQuizScore).toBe(80);
  });

  // Test 9: GET Analytics Course Not Found
  it('BE-06-01-009: Should return status 404 if requested course ID does not exist', async () => {
    const fakeCourseId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/courses/${fakeCourseId}/analytics`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.status).toBe(404);
  });

  // Test 10: DB Pipeline failure simulation
  it('BE-06-01-010: Should return status 500 if aggregation pipeline throws an execution error', async () => {
    jest.spyOn(Progress, 'aggregate').mockImplementationOnce(() => {
      throw new Error('Pipeline error');
    });

    const res = await request(app)
      .get(`/api/courses/${courseId}/analytics`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.status).toBe(500);
  });
});
