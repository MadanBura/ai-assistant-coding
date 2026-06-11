const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Module = require('../../src/models/Module');
const Topic = require('../../src/models/Topic');

describe('Feature 2.2: Curriculum Design (Modules & Topics)', () => {
  let instructorToken;
  let anotherInstructorToken;
  let instructorId;
  let courseId;
  let moduleId;

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }

    const instructor = await User.create({
      name: 'Instructor Bob',
      email: 'bob@example.com',
      password: 'hashedpassword',
      role: 'Instructor'
    });
    instructorId = instructor._id.toString();

    const anotherInstructor = await User.create({
      name: 'Instructor Alice',
      email: 'alice@example.com',
      password: 'hashedpassword',
      role: 'Instructor'
    });

    instructorToken = jwt.sign(
      { id: instructorId, role: 'Instructor' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    anotherInstructorToken = jwt.sign(
      { id: anotherInstructor._id.toString(), role: 'Instructor' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    const course = await Course.create({
      title: 'Course title',
      description: 'Course description',
      category: 'Software Engineering',
      instructorId: instructorId
    });
    courseId = course._id.toString();

    const mod = await Module.create({
      courseId: courseId,
      title: 'Module 1',
      sequenceIndex: 1
    });
    moduleId = mod._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: Add Module Happy Path
  it('BE-02-02-001: Should allow the course owner to add a module and return status 201', async () => {
    const res = await request(app)
      .post(`/api/courses/${courseId}/modules`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Module 2: Advanced Backend',
        sequenceIndex: 2
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Module 2: Advanced Backend');
    expect(res.body.data.sequenceIndex).toBe(2);
  });

  // Test 2: Add Module Forbidden to Non-Owner
  it('BE-02-02-002: Should prevent non-owner instructor from adding modules with status 403', async () => {
    const res = await request(app)
      .post(`/api/courses/${courseId}/modules`)
      .set('Authorization', `Bearer ${anotherInstructorToken}`)
      .send({
        title: 'Bypassed Module',
        sequenceIndex: 2
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 3: Add Module Missing Title
  it('BE-02-02-003: Should reject module creation if title is missing with status 400', async () => {
    const res = await request(app)
      .post(`/api/courses/${courseId}/modules`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        sequenceIndex: 2
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 4: Add Topic Happy Path
  it('BE-02-02-004: Should allow course owner to add a topic under a module and return status 201', async () => {
    const res = await request(app)
      .post(`/api/modules/${moduleId}/topics`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Topic 1.1: Express Setup',
        sequenceIndex: 0
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Topic 1.1: Express Setup');
    expect(res.body.data.moduleId).toBe(moduleId);
  });

  // Test 5: Add Topic Forbidden to Non-Owner
  it('BE-02-02-005: Should prevent non-owner from adding topics to a module with status 403', async () => {
    const res = await request(app)
      .post(`/api/modules/${moduleId}/topics`)
      .set('Authorization', `Bearer ${anotherInstructorToken}`)
      .send({
        title: 'Bypassed Topic',
        sequenceIndex: 0
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 6: Add Topic Missing Title
  it('BE-02-02-006: Should reject topic creation if title is missing with status 400', async () => {
    const res = await request(app)
      .post(`/api/modules/${moduleId}/topics`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        sequenceIndex: 0
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 7: Reorder Curriculum Happy Path
  it('BE-02-02-007: Should reorder modules successfully with status 200', async () => {
    const anotherMod = await Module.create({
      courseId: courseId,
      title: 'Module 2',
      sequenceIndex: 0
    });

    const res = await request(app)
      .put(`/api/courses/${courseId}/curriculum/reorder`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        modules: [
          { id: moduleId, sequenceIndex: 0 },
          { id: anotherMod._id.toString(), sequenceIndex: 1 }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedModule = await Module.findById(moduleId);
    expect(updatedModule.sequenceIndex).toBe(0);
  });

  // Test 8: Reorder Forbidden to Non-Owner
  it('BE-02-02-008: Should prevent non-owners from reordering the curriculum with status 403', async () => {
    const res = await request(app)
      .put(`/api/courses/${courseId}/curriculum/reorder`)
      .set('Authorization', `Bearer ${anotherInstructorToken}`)
      .send({
        modules: [{ id: moduleId, sequenceIndex: 0 }]
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 9: Get Course returns sorted curriculum
  it('BE-02-02-009: Retrieving course details should return modules in ascending sequence index order', async () => {
    await Module.create({
      courseId: courseId,
      title: 'Module 0 (First)',
      sequenceIndex: 0
    });

    const res = await request(app)
      .get(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${instructorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.modules[0].title).toBe('Module 0 (First)');
    expect(res.body.data.modules[1].title).toBe('Module 1');
  });

  // Test 10: Add Module under non-existing Course
  it('BE-02-02-010: Should fail to add a module if the course ID does not exist with status 404', async () => {
    const fakeCourseId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/courses/${fakeCourseId}/modules`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        title: 'Module',
        sequenceIndex: 0
      });
    expect(res.status).toBe(404);
  });
});
