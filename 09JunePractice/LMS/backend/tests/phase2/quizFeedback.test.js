// File: backend/tests/phase2/quizFeedback.test.js

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
const { JWT_SECRET } = require('../../src/config/environment');

describe('MOD-04: Interactive Quiz Feedback & Explanations', () => {
  let instructorToken;
  let nonOwnerInstructorToken;
  let learnerToken;
  let otherLearnerToken;

  let course;
  let topic;
  let quiz;
  let attemptId;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }

    const instructor = new User({ name: 'Instructor One', email: 'inst1@example.com', password: 'Password123', role: 'Instructor' });
    await instructor.save();
    instructorToken = jwt.sign({ id: instructor._id.toString(), role: instructor.role }, JWT_SECRET);

    const nonOwnerInstructor = new User({ name: 'Instructor Two', email: 'inst2@example.com', password: 'Password123', role: 'Instructor' });
    await nonOwnerInstructor.save();
    nonOwnerInstructorToken = jwt.sign({ id: nonOwnerInstructor._id.toString(), role: nonOwnerInstructor.role }, JWT_SECRET);

    const learner = new User({ name: 'Learner One', email: 'lrn1@example.com', password: 'Password123', role: 'Learner' });
    await learner.save();
    learnerToken = jwt.sign({ id: learner._id.toString(), role: learner.role }, JWT_SECRET);

    const otherLearner = new User({ name: 'Learner Two', email: 'lrn2@example.com', password: 'Password123', role: 'Learner' });
    await otherLearner.save();
    otherLearnerToken = jwt.sign({ id: otherLearner._id.toString(), role: otherLearner.role }, JWT_SECRET);

    course = new Course({ title: 'Course WebGL', description: 'desc', category: 'Graphics', instructorId: instructor._id });
    await course.save();

    const moduleObj = new Module({ title: 'Module 1', courseId: course._id, sequenceIndex: 1 });
    await moduleObj.save();

    topic = new Topic({ title: 'Topic 1', moduleId: moduleObj._id, sequenceIndex: 1 });
    await topic.save();

    const progress = new Progress({ userId: learner._id, courseId: course._id, progressPercent: 0, completedTopics: [] });
    await progress.save();

    const progressOther = new Progress({ userId: otherLearner._id, courseId: course._id, progressPercent: 0, completedTopics: [] });
    await progressOther.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Feature 01: Quiz Question Rationale Setup', () => {

    it('@DisplayName("TC-QF-01-01: Should create quiz questions with explanations and release rule values")', async () => {
      const res = await request(app)
        .post('/api/quiz-feedback/setup')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          topicId: topic._id.toString(),
          releaseRule: 'OnPassing',
          questions: [
            {
              questionText: 'What is JWT secret used for?',
              options: ['Symmetric encryption', 'Signing tokens', 'Payload hashing'],
              correctOptionIndex: 1,
              explanation: 'The secret is used to generate the signature component of the JWT.'
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.releaseRule).toBe('OnPassing');
      expect(res.body.data.questions[0].explanation).toBe('The secret is used to generate the signature component of the JWT.');

      quiz = res.body.data;
    });

    it('@DisplayName("TC-QF-01-02: Should validate option bounds checks correctly")', async () => {
      const res = await request(app)
        .post('/api/quiz-feedback/setup')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          topicId: topic._id.toString(),
          releaseRule: 'OnPassing',
          questions: [
            {
              questionText: 'What is JWT secret used for?',
              options: ['Symmetric encryption', 'Signing tokens', 'Payload hashing'],
              correctOptionIndex: 5, // Out of bounds
              explanation: 'The secret is used to generate the signature component of the JWT.'
            }
          ]
        });

      expect(res.status).toBe(400);
    });

    it('@DisplayName("TC-QF-01-03: Should reject quiz updates if requester is not the course instructor")', async () => {
      const res = await request(app)
        .post('/api/quiz-feedback/setup')
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          topicId: topic._id.toString(),
          releaseRule: 'Always',
          questions: []
        });

      expect(res.status).toBe(403);
    });

    it('@DisplayName("TC-QF-01-04: Should reject setup if instructor does not own the course")', async () => {
      const res = await request(app)
        .post('/api/quiz-feedback/setup')
        .set('Authorization', `Bearer ${nonOwnerInstructorToken}`)
        .send({
          topicId: topic._id.toString(),
          releaseRule: 'Always',
          questions: [
            {
              questionText: 'What is JWT secret used for?',
              options: ['Symmetric encryption', 'Signing tokens', 'Payload hashing'],
              correctOptionIndex: 1,
              explanation: 'The secret is used to generate the signature component of the JWT.'
            }
          ]
        });

      expect(res.status).toBe(403);
    });

  });

  describe('Feature 02: Quiz Attempt Review with Explanations', () => {

    it('@DisplayName("TC-QF-02-01: Should return rationales if release rule is set to Always")', async () => {
      // Set releaseRule to Always
      await Quiz.findOneAndUpdate({ topicId: topic._id }, { releaseRule: 'Always' });

      // First query quiz ID in database to extract the Mongoose question _id
      const quizDoc = await Quiz.findOne({ topicId: topic._id });
      const qId = quizDoc.questions[0]._id.toString();

      const res = await request(app)
        .post(`/api/topics/${topic._id.toString()}/assessment/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          answers: [
            {
              questionId: qId,
              selectedOptionIndex: 1 // correct
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.passed).toBe(true);
      expect(res.body.questions[0].explanation).not.toBeNull();

      attemptId = res.body.attemptId;
    });

    it('@DisplayName("TC-QF-02-02: Should hide rationales if rule is OnPassing and learner fails the quiz")', async () => {
      // Set releaseRule to OnPassing
      await Quiz.findOneAndUpdate({ topicId: topic._id }, { releaseRule: 'OnPassing' });

      const quizDoc = await Quiz.findOne({ topicId: topic._id });
      const qId = quizDoc.questions[0]._id.toString();

      const res = await request(app)
        .post(`/api/topics/${topic._id.toString()}/assessment/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          answers: [
            {
              questionId: qId,
              selectedOptionIndex: 0 // incorrect
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.passed).toBe(false);
      expect(res.body.questions[0].explanation).toBeNull();
    });

    it('@DisplayName("TC-QF-02-03: Should ensure pre-submission queries block explanations")', async () => {
      const res = await request(app)
        .get(`/api/topics/${topic._id.toString()}/assessment`)
        .set('Authorization', `Bearer ${learnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.questions[0].explanation).toBeUndefined();
    });

    it('@DisplayName("TC-QF-02-04: Should reject attempt details retrieval belonging to another student")', async () => {
      const res = await request(app)
        .get(`/api/attempts/${attemptId}`)
        .set('Authorization', `Bearer ${otherLearnerToken}`);

      expect(res.status).toBe(403);
    });

  });

});
