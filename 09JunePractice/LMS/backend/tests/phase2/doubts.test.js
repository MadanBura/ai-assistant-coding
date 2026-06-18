// File: backend/tests/phase2/doubts.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Module = require('../../src/models/Module');
const Topic = require('../../src/models/Topic');
const Progress = require('../../src/models/Progress');
const Doubt = require('../../src/models/Doubt');
const { JWT_SECRET } = require('../../src/config/environment');

describe('MOD-03: Topic-Specific Q&A & Doubt Resolver', () => {
  let instructorToken;
  let nonOwnerInstructorToken;
  let learnerToken;
  let unenrolledLearnerToken;

  let course;
  let topic1;
  let topic2;
  let doubt;

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

    const unenrolledLearner = new User({ name: 'Learner Two', email: 'lrn2@example.com', password: 'Password123', role: 'Learner' });
    await unenrolledLearner.save();
    unenrolledLearnerToken = jwt.sign({ id: unenrolledLearner._id.toString(), role: unenrolledLearner.role }, JWT_SECRET);

    course = new Course({ title: 'Course Doubt', description: 'desc', category: 'Tech', instructorId: instructor._id });
    await course.save();

    const moduleObj = new Module({ title: 'Module 1', courseId: course._id, sequenceIndex: 1 });
    await moduleObj.save();

    topic1 = new Topic({ title: 'Topic 1', moduleId: moduleObj._id, sequenceIndex: 1 });
    await topic1.save();

    topic2 = new Topic({ title: 'Topic 2', moduleId: moduleObj._id, sequenceIndex: 2 });
    await topic2.save();

    const progress = new Progress({ userId: learner._id, courseId: course._id, progressPercent: 0, completedTopics: [] });
    await progress.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Feature 01: In-context Doubt Submission (Doubt Drawer)', () => {

    it('@DisplayName("TC-DB-01-01: Should post doubt under unlocked topic successfully")', async () => {
      const res = await request(app)
        .post('/api/doubts')
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          topicId: topic1._id.toString(),
          question: 'How do we write a Mongoose transaction hook?'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.question).toBe('How do we write a Mongoose transaction hook?');

      doubt = res.body.data;
    });

    it('@DisplayName("TC-DB-01-02: Should reject empty query body payload")', async () => {
      const res = await request(app)
        .post('/api/doubts')
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          topicId: topic1._id.toString(),
          question: ''
        });

      expect(res.status).toBe(400);
    });

    it('@DisplayName("TC-DB-01-03: Should reject doubt post if token is missing or invalid")', async () => {
      const res = await request(app)
        .post('/api/doubts')
        .send({
          topicId: topic1._id.toString(),
          question: 'Is there anyone here?'
        });

      expect(res.status).toBe(401);
    });

    it('@DisplayName("TC-DB-01-04: Should reject doubt post if topic is locked")', async () => {
      // topic2 is locked because topic1 is not completed in progress
      const res = await request(app)
        .post('/api/doubts')
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          topicId: topic2._id.toString(),
          question: 'Why is it locked?'
        });

      expect(res.status).toBe(403);
    });

  });

  describe('Feature 02: Doubt Thread Management & Official Responses', () => {

    it('@DisplayName("TC-DB-02-01: Should post instructor answer successfully")', async () => {
      const res = await request(app)
        .post(`/api/doubts/${doubt.id}/answers`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          content: 'You can use connection.startSession().',
          isOfficial: false
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answers.length).toBeGreaterThan(0);
    });

    it('@DisplayName("TC-DB-02-02: Should pin answer as official and set resolved status")', async () => {
      const res = await request(app)
        .post(`/api/doubts/${doubt.id}/answers`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          content: 'Here is the official resolution.',
          isOfficial: true
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isResolved).toBe(true);
      expect(res.body.data.answers[0].isOfficial).toBe(true);
      expect(res.body.data.answers[0].content).toBe('Here is the official resolution.');
    });

    it('@DisplayName("TC-DB-02-03: Should reject answer update if requester has Learner role")', async () => {
      const res = await request(app)
        .post(`/api/doubts/${doubt.id}/answers`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          content: 'My learner answer tries to be official.',
          isOfficial: true
        });

      expect(res.status).toBe(403);
    });

    it('@DisplayName("TC-DB-02-04: Should reject answer post if Instructor does not own the course")', async () => {
      const res = await request(app)
        .post(`/api/doubts/${doubt.id}/answers`)
        .set('Authorization', `Bearer ${nonOwnerInstructorToken}`)
        .send({
          content: 'I do not teach this course.',
          isOfficial: true
        });

      expect(res.status).toBe(403);
    });

  });

});
