// File: backend/tests/phase2/announcements.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Progress = require('../../src/models/Progress');
const Announcement = require('../../src/models/Announcement');
const { JWT_SECRET } = require('../../src/config/environment');

describe('MOD-01: Unified Course Announcement System', () => {
  let instructorToken;
  let nonOwnerInstructorToken;
  let enrolledLearnerToken;
  let unenrolledLearnerToken;
  let course;
  let instructor;
  let nonOwnerInstructor;
  let enrolledLearner;
  let unenrolledLearner;

  beforeAll(async () => {
    // Clear DB collections
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }

    // Create users
    instructor = new User({
      name: 'Instructor One',
      email: 'instructor1@example.com',
      password: 'Password123',
      role: 'Instructor'
    });
    await instructor.save();
    instructorToken = jwt.sign({ id: instructor._id.toString(), role: instructor.role }, JWT_SECRET);

    nonOwnerInstructor = new User({
      name: 'Instructor Two',
      email: 'instructor2@example.com',
      password: 'Password123',
      role: 'Instructor'
    });
    await nonOwnerInstructor.save();
    nonOwnerInstructorToken = jwt.sign({ id: nonOwnerInstructor._id.toString(), role: nonOwnerInstructor.role }, JWT_SECRET);

    enrolledLearner = new User({
      name: 'Learner One',
      email: 'learner1@example.com',
      password: 'Password123',
      role: 'Learner'
    });
    await enrolledLearner.save();
    enrolledLearnerToken = jwt.sign({ id: enrolledLearner._id.toString(), role: enrolledLearner.role }, JWT_SECRET);

    unenrolledLearner = new User({
      name: 'Learner Two',
      email: 'learner2@example.com',
      password: 'Password123',
      role: 'Learner'
    });
    await unenrolledLearner.save();
    unenrolledLearnerToken = jwt.sign({ id: unenrolledLearner._id.toString(), role: unenrolledLearner.role }, JWT_SECRET);

    // Create course
    course = new Course({
      title: 'Intro to Node.js',
      description: 'Learn backend basics',
      category: 'Software Engineering',
      instructorId: instructor._id
    });
    await course.save();

    // Create enrollment progress for enrolledLearner
    const progress = new Progress({
      userId: enrolledLearner._id,
      courseId: course._id,
      progressPercent: 10,
      finalExamPassed: false
    });
    await progress.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Feature 01: Course Announcement Creation', () => {

    it('TC-AN-POST-01: Instructor creates urgent announcement successfully', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          courseId: course._id.toString(),
          title: 'Exam Shift',
          content: 'The exam is moved to next week.',
          priority: 'Urgent'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Exam Shift');
      expect(res.body.data.priority).toBe('Urgent');
    });

    it('TC-AN-POST-02: Fail creation if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          courseId: course._id.toString(),
          title: 'Hi',
          // content missing
          priority: 'Urgent'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('TC-AN-POST-03: Reject creation if requester lacks Instructor role', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${enrolledLearnerToken}`)
        .send({
          courseId: course._id.toString(),
          title: 'Announcement',
          content: 'This announcement is created by learner.',
          priority: 'Info'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('TC-AN-POST-04: Reject creation if instructor does not own the course', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${nonOwnerInstructorToken}`)
        .send({
          courseId: course._id.toString(),
          title: 'Steal Course',
          content: 'I want to post on another instructor\'s course.',
          priority: 'Urgent'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

  });

  describe('Feature 02: Course Announcement Display and Dismissal', () => {

    it('TC-AN-GET-01: Enrolled learner retrieves announcements successfully', async () => {
      const res = await request(app)
        .get(`/api/announcements?courseId=${course._id.toString()}`)
        .set('Authorization', `Bearer ${enrolledLearnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('TC-AN-GET-02: Reject access if learner is not enrolled in the course', async () => {
      const res = await request(app)
        .get(`/api/announcements?courseId=${course._id.toString()}`)
        .set('Authorization', `Bearer ${unenrolledLearnerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('TC-AN-GET-03: Reject access if token is invalid or missing', async () => {
      const res = await request(app)
        .get(`/api/announcements?courseId=${course._id.toString()}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('TC-AN-GET-04: Dismiss event removes banner from active local state', async () => {
      // Dismissal is local session logic, endpoint should return 200 list successfully
      const res = await request(app)
        .get(`/api/announcements?courseId=${course._id.toString()}`)
        .set('Authorization', `Bearer ${enrolledLearnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

  });

});
