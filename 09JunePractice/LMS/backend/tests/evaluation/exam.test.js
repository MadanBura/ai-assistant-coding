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
const FinalExamAttempt = require('../../src/models/FinalExamAttempt');

describe('Feature 4.2: Course-Level Final Examination', () => {
  let learnerToken;
  let learnerId;
  let courseId;
  let topicId;
  let examId;

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

    const t = await Topic.create({
      moduleId: mod._id,
      title: 'Topic 1',
      sequenceIndex: 0
    });
    topicId = t._id.toString();

    const exam = await FinalExam.create({
      courseId: courseId,
      passingThreshold: 75,
      questions: [
        {
          questionText: 'What is Express?',
          options: ['A database', 'A router framework'],
          correctOptionIndex: 1
        }
      ]
    });
    examId = exam._id.toString();

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

  // Test 1: GET Exam Locked
  it('BE-04-02-001: Retrieving final exam should fail with status 403 if curriculum topics are incomplete', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/final-exam`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 2: GET Exam Unlocked Happy Path
  it('BE-04-02-002: Retrieving final exam should succeed with status 200 and hide answer keys when topics are complete', async () => {
    // Complete topics in progress
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $addToSet: { completedTopics: topicId } }
    );

    const res = await request(app)
      .get(`/api/courses/${courseId}/final-exam`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions[0]).not.toHaveProperty('correctOptionIndex');
  });

  // Test 3: POST Submit Passed (Score 100)
  it('BE-04-02-003: Submitting correct final exam answers should pass grading with status 200, enabling certificate flags', async () => {
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $addToSet: { completedTopics: topicId } }
    );

    const res = await request(app)
      .post(`/api/courses/${courseId}/final-exam/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        answers: [
          { questionId: examId + '_q0', selectedOptionIndex: 1 }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(true);
    expect(res.body.score).toBe(100);
    expect(res.body.certificateEligible).toBe(true);

    const progress = await Progress.findOne({ userId: learnerId, courseId: courseId });
    expect(progress.finalExamPassed).toBe(true);
  });

  // Test 4: POST Submit Failed (Score 0)
  it('BE-04-02-004: Submitting incorrect final exam answers should fail grading with status 200, leaving certificate false', async () => {
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $addToSet: { completedTopics: topicId } }
    );

    const res = await request(app)
      .post(`/api/courses/${courseId}/final-exam/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        answers: [
          { questionId: examId + '_q0', selectedOptionIndex: 0 } // Wrong index
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(false);
    expect(res.body.score).toBe(0);

    const progress = await Progress.findOne({ userId: learnerId, courseId: courseId });
    expect(progress.finalExamPassed).toBe(false);
  });

  // Test 5: Final Exam attempt tracking
  it('BE-04-02-005: Submitting final exam should record a document in the FinalExamAttempts collection', async () => {
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $addToSet: { completedTopics: topicId } }
    );

    await request(app)
      .post(`/api/courses/${courseId}/final-exam/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        answers: [{ questionId: examId + '_q0', selectedOptionIndex: 1 }]
      });

    const attempt = await FinalExamAttempt.findOne({ userId: learnerId, courseId: courseId });
    expect(attempt).not.toBeNull();
    expect(attempt.score).toBe(100);
  });

  // Test 6: Retakes logic
  it('BE-04-02-006: Learners must be allowed to submit a final exam multiple times, generating multiple attempt records', async () => {
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $addToSet: { completedTopics: topicId } }
    );

    await request(app)
      .post(`/api/courses/${courseId}/final-exam/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({ answers: [{ questionId: examId + '_q0', selectedOptionIndex: 0 }] });

    await request(app)
      .post(`/api/courses/${courseId}/final-exam/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({ answers: [{ questionId: examId + '_q0', selectedOptionIndex: 1 }] });

    const attemptsCount = await FinalExamAttempt.countDocuments({ userId: learnerId, courseId: courseId });
    expect(attemptsCount).toBe(2);
  });

  // Test 7: Missing Answers List Validation
  it('BE-04-02-007: Submitting final exam with missing answers body field returns status 400', async () => {
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $addToSet: { completedTopics: topicId } }
    );

    const res = await request(app)
      .post(`/api/courses/${courseId}/final-exam/submit`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  // Test 8: Course Not Found
  it('BE-04-02-008: Should return status 404 if retrieving final exam for a non-existent course ID', async () => {
    const fakeCourseId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/courses/${fakeCourseId}/final-exam`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(404);
  });

  // Test 9: No Exam Associated
  it('BE-04-02-009: Should return status 404 if course exists but does not have a final exam configured', async () => {
    await FinalExam.deleteMany({});
    await Progress.updateOne(
      { userId: learnerId, courseId: courseId },
      { $addToSet: { completedTopics: topicId } }
    );

    const res = await request(app)
      .get(`/api/courses/${courseId}/final-exam`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(404);
  });

  // Test 10: Learner not enrolled
  it('BE-04-02-010: Should return status 403 if learner queries final exam for a course they are not enrolled in', async () => {
    await Progress.deleteMany({});
    const res = await request(app)
      .get(`/api/courses/${courseId}/final-exam`)
      .set('Authorization', `Bearer ${learnerToken}`);
    expect(res.status).toBe(403);
  });
});
