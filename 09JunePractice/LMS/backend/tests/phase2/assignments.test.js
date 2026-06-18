// File: backend/tests/phase2/assignments.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Module = require('../../src/models/Module');
const Topic = require('../../src/models/Topic');
const Progress = require('../../src/models/Progress');
const Assignment = require('../../src/models/Assignment');
const Submission = require('../../src/models/Submission');
const { JWT_SECRET } = require('../../src/config/environment');

describe('MOD-02: Assignment Grading & Feedback Portal', () => {
  let instructorToken;
  let nonOwnerInstructorToken;
  let learnerToken;
  let unenrolledLearnerToken;

  let course;
  let topic;
  let assignment;
  let submission;

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

    course = new Course({ title: 'Course WebGL', description: 'desc', category: 'Graphics', instructorId: instructor._id });
    await course.save();

    const moduleObj = new Module({ title: 'Module 1', courseId: course._id, sequenceIndex: 1 });
    await moduleObj.save();

    topic = new Topic({ title: 'Topic 1', moduleId: moduleObj._id, sequenceIndex: 1 });
    await topic.save();

    const progress = new Progress({ userId: learner._id, courseId: course._id, progressPercent: 0, completedTopics: [] });
    await progress.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Feature 01: Assignment Creation', () => {

    it('@DisplayName("TC-AS-01-01: Should create assignment under owned topic successfully")', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          topicId: topic._id.toString(),
          title: 'WebGL Shaders Assignment',
          description: 'Write vertex shader scripts.',
          maxScore: 100,
          dueDate: tomorrow.toISOString()
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('WebGL Shaders Assignment');

      assignment = res.body.data;
    });

    it('@DisplayName("TC-AS-01-02: Should fail creation if due date is in the past")', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          topicId: topic._id.toString(),
          title: 'WebGL Shaders Assignment',
          maxScore: 100,
          dueDate: yesterday.toISOString()
        });

      expect(res.status).toBe(400);
    });

    it('@DisplayName("TC-AS-01-03: Should reject request if requester is a Learner")', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          topicId: topic._id.toString(),
          title: 'WebGL Shaders Assignment',
          maxScore: 100
        });

      expect(res.status).toBe(403);
    });

    it('@DisplayName("TC-AS-01-04: Should reject creation if instructor does not own the course")', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${nonOwnerInstructorToken}`)
        .send({
          topicId: topic._id.toString(),
          title: 'WebGL Shaders Assignment',
          maxScore: 100
        });

      expect(res.status).toBe(403);
    });

  });

  describe('Feature 02: Assignment Submission', () => {

    it('@DisplayName("TC-AS-02-01: Should accept PDF files under 10MB before due date")', async () => {
      // PDF mock starts with standard "%PDF-" header
      const mockPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj');

      const res = await request(app)
        .post(`/api/assignments/${assignment.id}/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .attach('submissionFile', mockPdfBuffer, 'submission.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Submitted');

      submission = res.body.data;
    });

    it('@DisplayName("TC-AS-02-02: Should reject uploads exceeding 10MB size limits")', async () => {
      // Simulate file exceeds 10MB by creating a large buffer
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const res = await request(app)
        .post(`/api/assignments/${assignment.id}/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .attach('submissionFile', largeBuffer, 'huge.pdf');

      expect(res.status).toBe(413);
    });

    it('@DisplayName("TC-AS-02-03: Should reject uploads if requester lacks Learner role")', async () => {
      const mockPdfBuffer = Buffer.from('%PDF-1.4\n1 0');
      const res = await request(app)
        .post(`/api/assignments/${assignment.id}/submit`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .attach('submissionFile', mockPdfBuffer, 'submission.pdf');

      expect(res.status).toBe(403);
    });

    it('@DisplayName("TC-AS-02-04: Should reject uploads past the due date deadline")', async () => {
      // Force expired date on assignment
      await Assignment.findByIdAndUpdate(assignment.id, { dueDate: new Date(Date.now() - 1000) });

      const mockPdfBuffer = Buffer.from('%PDF-1.4\n1 0');
      const res = await request(app)
        .post(`/api/assignments/${assignment.id}/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .attach('submissionFile', mockPdfBuffer, 'submission.pdf');

      expect(res.status).toBe(403);

      // Restore dueDate
      await Assignment.findByIdAndUpdate(assignment.id, { dueDate: new Date(Date.now() + 24 * 3600 * 1000) });
    });

  });

  describe('Feature 03: Assignment Grading and Feedback', () => {

    it('@DisplayName("TC-AS-03-01: Should grade submission successfully with valid score and comments")', async () => {
      const res = await request(app)
        .post(`/api/submissions/${submission.id}/grade`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          grade: 90,
          feedback: 'Great shader organization!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.grade).toBe(90);
      expect(res.body.data.status).toBe('Graded');
    });

    it('@DisplayName("TC-AS-03-02: Should reject grading if score exceeds maximum limits")', async () => {
      const res = await request(app)
        .post(`/api/submissions/${submission.id}/grade`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          grade: 110, // Exceeds maxScore 100
          feedback: 'Too high'
        });

      expect(res.status).toBe(400);
    });

    it('@DisplayName("TC-AS-03-03: Should reject grading request if requester is a Learner")', async () => {
      const res = await request(app)
        .post(`/api/submissions/${submission.id}/grade`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({
          grade: 85,
          feedback: 'Self grading'
        });

      expect(res.status).toBe(403);
    });

    it('@DisplayName("TC-AS-03-04: Should reject grading request if instructor does not own the course")', async () => {
      const res = await request(app)
        .post(`/api/submissions/${submission.id}/grade`)
        .set('Authorization', `Bearer ${nonOwnerInstructorToken}`)
        .send({
          grade: 85,
          feedback: 'Non-owner grading'
        });

      expect(res.status).toBe(403);
    });

  });

});
