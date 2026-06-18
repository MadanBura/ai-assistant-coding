const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Module = require('../../src/models/Module');
const Topic = require('../../src/models/Topic');
const Progress = require('../../src/models/Progress');
const FinalExam = require('../../src/models/FinalExam');

describe('Feature 3.3: Sequential Access & Locking System', () => {
  let learnerToken;
  let learnerId;
  let courseId;
  let topicId1;
  let topicId2;
  let module2TopicId;

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

    const mod1 = await Module.create({
      courseId: courseId,
      title: 'Module 1',
      sequenceIndex: 0
    });

    const t1 = await Topic.create({
      moduleId: mod1._id,
      title: 'Topic 1.1',
      sequenceIndex: 0
    });
    topicId1 = t1._id.toString();

    const t2 = await Topic.create({
      moduleId: mod1._id,
      title: 'Topic 1.2',
      sequenceIndex: 1
    });
    topicId2 = t2._id.toString();

    const mod2 = await Module.create({
      courseId: courseId,
      title: 'Module 2',
      sequenceIndex: 1
    });

    const t3 = await Topic.create({
      moduleId: mod2._id,
      title: 'Topic 2.1',
      sequenceIndex: 0
    });
    module2TopicId = t3._id.toString();

    await Progress.create({
      userId: learnerId,
      courseId: courseId,
      progressPercent: 0,
      completedTopics: []
    });

    await FinalExam.create({
      courseId: courseId,
      passingThreshold: 75,
      questions: [
        {
          questionText: "What is 2+2?",
          options: ["3", "4", "5"],
          correctOptionIndex: 1
        }
      ]
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: First topic unlocked by default
  it('BE-03-03-001: Module 1, Topic 1 should be unlocked by default upon enrollment, returning status 200', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/topics/${topicId1}`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // Test 2: Second topic locked
  it('BE-03-03-002: Module 1, Topic 2 should be locked initially, returning status 403', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/topics/${topicId2}`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('locked');
  });

  // Test 3: Unlocked after completion
  it('BE-03-03-003: Module 1, Topic 2 should unlock after completing Topic 1, returning status 200', async () => {
    // Complete Topic 1 first
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $addToSet: { completedTopics: topicId1 } }
    );

    const res = await request(app)
      .get(`/api/courses/${courseId}/topics/${topicId2}`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // Test 4: Unauthenticated blocker
  it('BE-03-03-004: Should reject topic detail queries if token is missing with status 401', async () => {
    const res = await request(app).get(`/api/courses/${courseId}/topics/${topicId1}`);
    expect(res.status).toBe(401);
  });

  // Test 5: Not enrolled blocker
  it('BE-03-03-005: Should reject topic detail queries if learner is not enrolled in the course with status 403', async () => {
    await Progress.deleteMany({});
    const res = await request(app)
      .get(`/api/courses/${courseId}/topics/${topicId1}`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
  });

  // Test 6: Final Exam Locked
  it('BE-03-03-006: Final exam retrieval should fail with status 403 if curriculum topics are incomplete', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/final-exam`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('locked');
  });

  // Test 7: Final Exam Unlocked
  it('BE-03-03-007: Final exam should be accessible with status 200 when all curriculum topics are completed', async () => {
    // Complete all topics in DB
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $set: { completedTopics: [topicId1, topicId2, module2TopicId] } }
    );

    const res = await request(app)
      .get(`/api/courses/${courseId}/final-exam`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // Test 8: Sequential module boundary locks
  it('BE-03-03-008: Topic 1 of Module 2 should be locked until final Topic of Module 1 is complete with status 403', async () => {
    // Only topicId1 is completed, topicId2 is pending
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $set: { completedTopics: [topicId1] } }
    );

    const res = await request(app)
      .get(`/api/courses/${courseId}/topics/${module2TopicId}`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
  });

  // Test 9: Topic Not Found
  it('BE-03-03-009: Should return status 404 if the requested topic ID does not exist', async () => {
    const fakeTopicId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/courses/${courseId}/topics/${fakeTopicId}`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(404);
  });

  // Test 10: Course Not Found
  it('BE-03-03-010: Should return status 404 if the requested course ID does not exist', async () => {
    const fakeCourseId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/courses/${fakeCourseId}/topics/${topicId1}`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(404);
  });
});
