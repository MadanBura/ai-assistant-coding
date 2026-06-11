const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Course = require('../../src/models/Course');
const Module = require('../../src/models/Module');
const Topic = require('../../src/models/Topic');
const Resource = require('../../src/models/Resource');

describe('Feature 2.3: Content & Resource Management (Videos, Notes, PDFs)', () => {
  let instructorToken;
  let anotherInstructorToken;
  let instructorId;
  let courseId;
  let topicId;
  let resourceId;

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

    const topic = await Topic.create({
      moduleId: mod._id,
      title: 'Topic 1',
      sequenceIndex: 1
    });
    topicId = topic._id.toString();

    const resource = await Resource.create({
      topicId: topicId,
      type: 'Notes',
      content: '# Initial Content'
    });
    resourceId = resource._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: Video Happy Path
  it('BE-02-03-001: Should attach a video link to a topic successfully and return status 201', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId}/resources`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'Video',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('Video');
    expect(res.body.data.url).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  // Test 2: Video Invalid URL
  it('BE-02-03-002: Should fail video resource creation if the URL format is invalid with status 400', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId}/resources`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'Video',
        url: 'invalid-url-string'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 3: Notes Happy Path
  it('BE-02-03-003: Should attach notes (markdown content) to a topic successfully and return status 201', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId}/resources`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'Notes',
        content: '# Heading\nThis is notes content'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toContain('# Heading');
  });

  // Test 4: Document Happy Path
  it('BE-02-03-004: Should attach document reference link successfully and return status 201', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId}/resources`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'Document',
        url: 'https://example.com/guide.pdf'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe('https://example.com/guide.pdf');
  });

  // Test 5: Missing Required Fields
  it('BE-02-03-005: Should reject resource creation if resource type is missing with status 400', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId}/resources`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        url: 'https://example.com/guide.pdf'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 6: Forbidden to Non-Owner
  it('BE-02-03-006: Should prevent non-owner instructor from adding resources with status 403', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId}/resources`)
      .set('Authorization', `Bearer ${anotherInstructorToken}`)
      .send({
        type: 'Notes',
        content: '# Bypassed'
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 7: PUT Resource Happy Path
  it('BE-02-03-007: Should allow course owner to update a resource successfully with status 200', async () => {
    const res = await request(app)
      .put(`/api/resources/${resourceId}`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'Notes',
        content: '# Updated Notes Content'
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('# Updated Notes Content');
  });

  // Test 8: PUT Resource Forbidden to Non-Owner
  it('BE-02-03-008: Should prevent non-owner instructor from updating a resource with status 403', async () => {
    const res = await request(app)
      .put(`/api/resources/${resourceId}`)
      .set('Authorization', `Bearer ${anotherInstructorToken}`)
      .send({
        content: '# Hacked Notes'
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 9: Document Invalid URL format
  it('BE-02-03-009: Should fail document creation if PDF link is not a valid absolute URL with status 400', async () => {
    const res = await request(app)
      .post(`/api/topics/${topicId}/resources`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'Document',
        url: 'invalidpdfurl'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 10: Topic Not Found
  it('BE-02-03-010: Should fail to add a resource if the topic ID does not exist with status 404', async () => {
    const fakeTopicId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/topics/${fakeTopicId}/resources`)
      .set('Authorization', `Bearer ${instructorToken}`)
      .send({
        type: 'Notes',
        content: '# Content'
      });
    expect(res.status).toBe(404);
  });
});
