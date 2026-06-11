const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Module = require('../../src/models/Module');
const Topic = require('../../src/models/Topic');
const Progress = require('../../src/models/Progress');

describe('Feature 3.2: Learner Progress Tracking', () => {
  let learnerToken;
  let learnerId;
  let courseId;
  let topicId1;
  let topicId2;

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
      title: 'Course title',
      description: 'Course description',
      category: 'Software Engineering',
      instructorId: instructor._id
    });
    courseId = course._id.toString();

    const mod = await Module.create({
      courseId: courseId,
      title: 'Module 1',
      sequenceIndex: 0
    });

    const t1 = await Topic.create({
      moduleId: mod._id,
      title: 'Topic 1',
      sequenceIndex: 0
    });
    topicId1 = t1._id.toString();

    const t2 = await Topic.create({
      moduleId: mod._id,
      title: 'Topic 2',
      sequenceIndex: 1
    });
    topicId2 = t2._id.toString();

    await Progress.create({
      userId: learnerId,
      courseId: courseId,
      progressPercent: 0,
      completedTopics: []
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: Complete Topic Happy Path
  it('BE-03-02-001: Should mark a topic complete and update progress successfully with status 200', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId1}/complete`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progressPercent).toBe(50); // 1 out of 2 topics
  });

  // Test 2: GET progress Happy Path
  it('BE-03-02-002: Should retrieve learner course progress with status 200', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/progress`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progressPercent).toBe(0);
    expect(res.body.data.completedTopics.length).toBe(0);
  });

  // Test 3: GET progress Unauthenticated
  it('BE-03-02-003: Should reject progress query if token is missing with status 401', async () => {
    const res = await request(app).get(`/api/courses/${courseId}/progress`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 4: POST complete Unauthenticated
  it('BE-03-02-004: Should reject complete updates if token is missing with status 401', async () => {
    const res = await request(app).post(`/api/topics/${topicId1}/complete`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 5: Pre-requisite locks (skipping topics)
  it('BE-03-02-005: Should reject completing Topic N if Topic N-1 is not completed with status 403', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId2}/complete`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Pre-requisite topics are not completed');
  });

  // Test 6: Duplicate complete calls handling
  it('BE-03-02-006: Submitting completion twice should not duplicate array elements or over-inflate percentage', async () => {
    // Complete first time
    await request(app)
      .post(`/api/topics/${topicId1}/complete`)
      .set('Authorization', `Bearer ${learnerToken}`);

    // Complete second time
    const res = await request(app)
      .post(`/api/topics/${topicId1}/complete`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.progressPercent).toBe(50); // Still 50%, not 100%
  });

  // Test 7: Completing all topics unlocks final exam state
  it('BE-03-02-007: Completing the final topic should update progressPercent to 100', async () => {
    await request(app)
      .post(`/api/topics/${topicId1}/complete`)
      .set('Authorization', `Bearer ${learnerToken}`);

    const res = await request(app)
      .post(`/api/topics/${topicId2}/complete`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.progressPercent).toBe(100);
  });

  // Test 8: GET progress Course Not Found
  it('BE-03-02-008: Should return 404 if retrieving progress for a non-existent course ID', async () => {
    const fakeCourseId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/courses/${fakeCourseId}/progress`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(404);
  });

  // Test 9: GET progress not enrolled
  it('BE-03-02-009: Should return 403 if learner queries progress on a course they are not enrolled in', async () => {
    await Progress.deleteMany({});
    const res = await request(app)
      .get(`/api/courses/${courseId}/progress`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
  });

  // Test 10: Complete Topic Not Found
  it('BE-03-02-010: Should return 404 if marking complete on a non-existent topic ID', async () => {
    const fakeTopicId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/topics/${fakeTopicId}/complete`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(404);
  });
});
