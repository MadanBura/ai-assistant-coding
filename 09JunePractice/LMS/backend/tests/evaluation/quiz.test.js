const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Module = require('../../src/models/Module');
const Topic = require('../../src/models/Topic');
const Progress = require('../../src/models/Progress');
const Quiz = require('../../src/models/Quiz');
const QuizAttempt = require('../../src/models/QuizAttempt');

describe('Feature 4.1: Topic-Level Quiz Assessments', () => {
  let learnerToken;
  let learnerId;
  let courseId;
  let topicId1;
  let topicId2;
  let quizId;

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

    const quiz = await Quiz.create({
      topicId: topicId1,
      passingThreshold: 70,
      questions: [
        {
          questionText: 'What hook handles state?',
          options: ['useState', 'useEffect'],
          correctOptionIndex: 0
        }
      ]
    });
    quizId = quiz._id.toString();

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

  // Test 1: GET Quiz Happy Path (no answers leaked)
  it('BE-04-01-001: Should retrieve quiz questions without correctOptionIndex and status 200', async () => {
    const res = await request(app)
      .get(`/api/topics/${topicId1}/assessment`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions[0]).not.toHaveProperty('correctOptionIndex');
    expect(res.body.data.passingThreshold).toBe(70);
  });

  // Test 2: GET Quiz Locked (topic locked)
  it('BE-04-01-002: Should block quiz retrieval if the topic is locked with status 403', async () => {
    // Create quiz for topic 2 which is locked
    await Quiz.create({
      topicId: topicId2,
      passingThreshold: 70,
      questions: [{ questionText: 'Q2', options: ['A', 'B'], correctOptionIndex: 0 }]
    });

    const res = await request(app)
      .get(`/api/topics/${topicId2}/assessment`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 3: POST Submit Passed (Score 100)
  it('BE-04-01-003: Submitting correct quiz answers should result in a pass status 200 and unlock topic', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId1}/assessment/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        answers: [
          { questionId: quizId + '_q0', selectedOptionIndex: 0 } // Assuming ID generation scheme
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(true);
    expect(res.body.score).toBe(100);

    // Verify progress update
    const progress = await Progress.findOne({ userId: learnerId, courseId: courseId });
    expect(progress.completedTopics).toContain(topicId1);
  });

  // Test 4: POST Submit Failed (Score 0)
  it('BE-04-01-004: Submitting incorrect quiz answers should fail grading with status 200, leaving topic locked', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId1}/assessment/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        answers: [
          { questionId: quizId + '_q0', selectedOptionIndex: 1 } // Wrong answer
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(false);
    expect(res.body.score).toBe(0);

    // Verify progress is still locked
    const progress = await Progress.findOne({ userId: learnerId, courseId: courseId });
    expect(progress.completedTopics).not.toContain(topicId1);
  });

  // Test 5: Quiz attempt tracking
  it('BE-04-01-005: Submitting a quiz should record a document in the QuizAttempts collection', async () => {
    await request(app)
      .post(`/api/topics/${topicId1}/assessment/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        answers: [{ questionId: quizId + '_q0', selectedOptionIndex: 0 }]
      });

    const attempt = await QuizAttempt.findOne({ userId: learnerId, topicId: topicId1 });
    expect(attempt).not.toBeNull();
    expect(attempt.score).toBe(100);
  });

  // Test 6: Retakes logic
  it('BE-04-01-006: Learners must be allowed to submit a quiz multiple times, generating multiple attempt records', async () => {
    await request(app)
      .post(`/api/topics/${topicId1}/assessment/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({ answers: [{ questionId: quizId + '_q0', selectedOptionIndex: 1 }] });

    await request(app)
      .post(`/api/topics/${topicId1}/assessment/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({ answers: [{ questionId: quizId + '_q0', selectedOptionIndex: 0 }] });

    const attemptsCount = await QuizAttempt.countDocuments({ userId: learnerId, topicId: topicId1 });
    expect(attemptsCount).toBe(2);
  });

  // Test 7: Missing Answers List Validation
  it('BE-04-01-007: Submitting quiz with missing answers body field returns status 400', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId1}/assessment/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  // Test 8: Invalid Question ID parameters
  it('BE-04-01-008: Submitting answer list with malformed or missing question IDs returns status 400', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId1}/assessment/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        answers: [{ selectedOptionIndex: 0 }]
      });
    expect(res.status).toBe(400);
  });

  // Test 9: Topic Not Found
  it('BE-04-01-009: Should return status 404 if retrieving quiz for a non-existent topic ID', async () => {
    const fakeTopicId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/topics/${fakeTopicId}/assessment`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(404);
  });

  // Test 10: No Quiz Associated
  it('BE-04-01-010: Should return status 404 if topic exists but does not have a quiz configured', async () => {
    // topicId2 does not have a quiz attached
    const res = await request(app)
      .get(`/api/topics/${topicId2}/assessment`)
      .set('Authorization', `Bearer ${learnerToken}`);
    // Unlocking first so we bypass sequential lock to check association error
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $addToSet: { completedTopics: topicId1 } }
    );

    const res2 = await request(app)
      .get(`/api/topics/${topicId2}/assessment`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res2.status).toBe(404);
  });
});
