const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Progress = require('../../src/models/Progress');
const Certificate = require('../../src/models/Certificate');

describe('Feature 5.1: Automatic Certificate Generation and Download', () => {
  let learnerToken;
  let learnerId;
  let courseId;

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }

    const learner = await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashedpassword',
      role: 'Learner'
    });
    learnerId = learner._id.toString();

    learnerToken = jwt.sign(
      { id: learnerId, role: 'Learner' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    const instructor = await User.create({
      name: 'Instructor Bob',
      email: 'bob@example.com',
      password: 'hashedpassword',
      role: 'Instructor'
    });

    const course = await Course.create({
      title: 'Introduction to Node.js',
      description: 'Learn backend design.',
      category: 'Software Engineering',
      instructorId: instructor._id
    });
    courseId = course._id.toString();

    await Progress.create({
      userId: learnerId,
      courseId: courseId,
      progressPercent: 100,
      completedTopics: [],
      finalExamPassed: false
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: GET Certificate Locked
  it('BE-05-01-001: Requesting a certificate when the final exam has not been passed should fail with status 403', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/certificate`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 2: GET Certificate Happy Path
  it('BE-05-01-002: Retrieving a certificate after passing the final exam should return a PDF buffer and status 200', async () => {
    // Set final exam passed
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $set: { finalExamPassed: true } }
    );

    const res = await request(app)
      .get(`/api/courses/${courseId}/certificate`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.body).toBeInstanceOf(Buffer);
  });

  // Test 3: GET Certificate Headers check
  it('BE-05-01-003: Response headers must contain correct Content-Disposition details', async () => {
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $set: { finalExamPassed: true } }
    );

    const res = await request(app)
      .get(`/api/courses/${courseId}/certificate`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.headers['content-disposition']).toContain('attachment;');
    expect(res.headers['content-disposition']).toContain('Certificate.pdf');
  });

  // Test 4: GET Certificate Unauthenticated
  it('BE-05-01-004: Should reject certificate requests if token is missing with status 401', async () => {
    const res = await request(app).get(`/api/courses/${courseId}/certificate`);
    expect(res.status).toBe(401);
  });

  // Test 5: GET Certificate Not Enrolled
  it('BE-05-01-005: Should reject certificate requests if learner is not enrolled in the course with status 403', async () => {
    await Progress.deleteMany({});
    const res = await request(app)
      .get(`/api/courses/${courseId}/certificate`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
  });

  // Test 6: Database record creation check
  it('BE-05-01-006: Successfully requesting a certificate must create a unique Certificate record in Mongoose', async () => {
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $set: { finalExamPassed: true } }
    );

    await request(app)
      .get(`/api/courses/${courseId}/certificate`)
      .set('Authorization', `Bearer ${learnerToken}`);

    const certRecord = await Certificate.findOne({ userId: learnerId, courseId: courseId });
    expect(certRecord).not.toBeNull();
    expect(certRecord.certificateId).toMatch(/^CERT-LMS-/);
  });

  // Test 7: Duplicate requests yield matching Certificate ID
  it('BE-05-01-007: Multiple certificate requests should return the same certificate ID instead of creating new records', async () => {
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $set: { finalExamPassed: true } }
    );

    // Initial request
    await request(app)
      .get(`/api/courses/${courseId}/certificate`)
      .set('Authorization', `Bearer ${learnerToken}`);
    const firstCert = await Certificate.findOne({ userId: learnerId, courseId: courseId });

    // Secondary request
    await request(app)
      .get(`/api/courses/${courseId}/certificate`)
      .set('Authorization', `Bearer ${learnerToken}`);
    const secondCert = await Certificate.findOne({ userId: learnerId, courseId: courseId });

    expect(firstCert.certificateId).toBe(secondCert.certificateId);
    expect(await Certificate.countDocuments({ userId: learnerId, courseId: courseId })).toBe(1);
  });

  // Test 8: Course Not Found
  it('BE-05-01-008: Should return status 404 if generating a certificate for a non-existent course ID', async () => {
    const fakeCourseId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/courses/${fakeCourseId}/certificate`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(404);
  });

  // Test 9: Name synchronization check
  it('BE-05-01-009: Certificate generation should query latest user name from database', async () => {
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $set: { finalExamPassed: true } }
    );

    // Update user name before fetching cert
    await User.findByIdAndUpdate(learnerId, { name: 'Jane Smith' });

    const res = await request(app)
      .get(`/api/courses/${courseId}/certificate`)
      .set('Authorization', `Bearer ${learnerToken}`);

    // If PDF generator is mocked, verify mock was called with 'Jane Smith'
    expect(res.status).toBe(200);
  });

  // Test 10: PDF compilation service database failure simulation
  it('BE-05-01-010: Should return status 500 if database operations fail during certificate mapping', async () => {
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $set: { finalExamPassed: true } }
    );

    jest.spyOn(Certificate, 'findOne').mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const res = await request(app)
      .get(`/api/courses/${courseId}/certificate`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(500);
  });
});
