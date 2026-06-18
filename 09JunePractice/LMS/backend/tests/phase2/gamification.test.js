// File: backend/tests/phase2/gamification.test.js

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
const Badge = require('../../src/models/Badge');
const UserBadge = require('../../src/models/UserBadge');
const { JWT_SECRET } = require('../../src/config/environment');

describe('MOD-05: Gamification and Custom Badges', () => {
  let instructorToken;
  let nonOwnerInstructorToken;
  let learnerToken;

  let course;
  let topic;
  let badge;

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

    course = new Course({ title: 'Course WebGL', description: 'desc', category: 'Graphics', instructorId: instructor._id });
    await course.save();

    const moduleObj = new Module({ title: 'Module 1', courseId: course._id, sequenceIndex: 1 });
    await moduleObj.save();

    topic = new Topic({ title: 'Topic 1', moduleId: moduleObj._id, sequenceIndex: 1 });
    await topic.save();

    const progress = new Progress({ userId: learner._id, courseId: course._id, progressPercent: 0, completedTopics: [] });
    await progress.save();

    // Create a default quiz for topic
    const quiz = new Quiz({
      topicId: topic._id,
      passingThreshold: 70,
      releaseRule: 'Always',
      questions: [
        {
          questionText: 'What is WebGL?',
          options: ['Graphics library', 'Text editor'],
          correctOptionIndex: 0,
          explanation: 'It uses GPU.'
        }
      ]
    });
    await quiz.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Feature 01: Custom Badge Designer', () => {

    it('@DisplayName("TC-GM-01-01: Should create custom badge successfully")', async () => {
      const res = await request(app)
        .post('/api/gamification/badges')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          courseId: course._id.toString(),
          title: 'Speed Demon',
          description: 'Complete all modules fast.',
          iconUrl: 'https://s3.amazonaws.com/lms/badges/speed.png',
          triggerType: 'PerfectQuizzes'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Speed Demon');

      badge = res.body.data;
    });

    it('@DisplayName("TC-GM-01-02: Should reject requests with invalid trigger types")', async () => {
      const res = await request(app)
        .post('/api/gamification/badges')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          courseId: course._id.toString(),
          title: 'Speed Demon',
          iconUrl: 'https://s3.amazonaws.com/lms/badges/speed.png',
          triggerType: 'InvalidTrigger'
        });

      expect(res.status).toBe(400);
    });

    it('@DisplayName("TC-GM-01-03: Should reject request if caller lacks Instructor role")', async () => {
      const res = await request(app)
        .post('/api/gamification/badges')
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          courseId: course._id.toString(),
          title: 'Speed Demon',
          iconUrl: 'https://s3.amazonaws.com/lms/badges/speed.png',
          triggerType: 'PerfectQuizzes'
        });

      expect(res.status).toBe(403);
    });

    it('@DisplayName("TC-GM-01-04: Should reject badge creation if instructor does not own the course")', async () => {
      const res = await request(app)
        .post('/api/gamification/badges')
        .set('Authorization', `Bearer ${nonOwnerInstructorToken}`)
        .send({
          courseId: course._id.toString(),
          title: 'Speed Demon',
          iconUrl: 'https://s3.amazonaws.com/lms/badges/speed.png',
          triggerType: 'PerfectQuizzes'
        });

      expect(res.status).toBe(403);
    });

  });

  describe('Feature 02: Milestone Badge Awards & User Profile Gallery', () => {

    it('@DisplayName("TC-GM-02-01: Should unlock Quiz Genius badge upon scoring 100% on a quiz")', async () => {
      const quizDoc = await Quiz.findOne({ topicId: topic._id });
      const qId = quizDoc.questions[0]._id.toString();

      // Submit 100% correct answers
      const res = await request(app)
        .post(`/api/topics/${topic._id.toString()}/assessment/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          answers: [
            {
              questionId: qId,
              selectedOptionIndex: 0 // correct
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify the badge is now unlocked in the database
      const userBadge = await UserBadge.findOne({ userId: learnerToken ? jwt.decode(learnerToken).id : null, badgeId: badge.id });
      expect(userBadge).not.toBeNull();
    });

    it('@DisplayName("TC-GM-02-02: Should display badge gallery grid on the profile page")', async () => {
      const res = await request(app)
        .get('/api/users/badges')
        .set('Authorization', `Bearer ${learnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].badgeId.title).toBe('Speed Demon');
    });

    it('@DisplayName("TC-GM-02-03: Should ensure badge unlock check handles duplicate achievements")', async () => {
      // Simulate calling the unlock routine twice
      const userId = jwt.decode(learnerToken).id;
      const gamificationService = require('../../src/services/gamificationService');

      // First unlock is already done via the quiz submission. Let's call evaluateQuizBadge again
      await gamificationService.evaluateQuizBadge(userId, topic._id, 100);

      // Verify still only one record exists
      const count = await UserBadge.countDocuments({ userId, badgeId: badge.id });
      expect(count).toBe(1);
    });

    it('@DisplayName("TC-GM-02-04: Should reject profile badges request if token is missing or invalid")', async () => {
      const res = await request(app)
        .get('/api/users/badges');

      expect(res.status).toBe(401);
    });

  });

});
