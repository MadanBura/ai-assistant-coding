import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

describe('FEAT-302: Smart Hashtag Generator (Backend)', () => {
  let adminToken: string;
  let workspaceId: string;

  beforeAll(async () => {
    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    const ws = await db.query(
      "INSERT INTO workspace (name) VALUES ('Test Hashtag Workspace') RETURNING id"
    );
    workspaceId = ws.rows[0].id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM workspace');
    await db.end();
  });

  /**
   * TC ID: TC-BE-801
   * Requirement Mapping: FR-302-1, FR-302-3
   * AC Mapping: AC-302-1
   * Test Type: Functional / API
   * Preconditions: API online.
   * Steps:
   *   1. Post text to `/api/v1/ai/suggest-hashtags` with payload `{"caption": "We are recruiting remote database engineers", "platform": "linkedin"}`.
   * Expected Result: Status returns 200, response returns array of 5-10 unique hashtag strings.
   * Priority: HIGH
   */
  test('TC-BE-801: Generate Hashtags and Verify List Formats', async () => {
    const res = await request(app)
      .post('/api/v1/ai/suggest-hashtags')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        caption: 'We are recruiting remote database engineers for our team',
        platform: 'linkedin'
      });

    expect(res.status).toBe(200);
    expect(res.body.hashtags).toBeDefined();
    expect(res.body.hashtags.length).toBeGreaterThanOrEqual(5);

    // Validate that output tags start with #
    res.body.hashtags.forEach((tag: string) => {
      expect(tag.startsWith('#')).toBe(true);
      expect(tag).not.toContain(' '); // check format bounds
    });
  });

  /**
   * TC ID: TC-BE-802
   * Requirement Mapping: FR-302-1
   * AC Mapping: AC-302-4
   * Test Type: Negative / API / Validation
   * Preconditions: Caption text parameter is empty.
   * Steps:
   *   1. Post payload to `/api/v1/ai/suggest-hashtags` with empty string.
   * Expected Result: Status returns 400 Bad Request. Action logs warning.
   * Priority: MEDIUM
   */
  test('TC-BE-802: Reject Hashtag Requests with Missing Captions', async () => {
    const res = await request(app)
      .post('/api/v1/ai/suggest-hashtags')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        caption: '',
        platform: 'linkedin'
      });

    expect(res.status).toBe(400);
  });

  /**
   * TC ID: TC-BE-803
   * Requirement Mapping: FR-302-1
   * AC Mapping: AC-302-1
   * Test Type: Edge Cases / Functional / Integration
   * Preconditions: Prompt contains random strings or unresolvable keywords.
   * Steps:
   *   1. Post gibberish payload: `{"caption": "asdfasdfasdfasdfasdf", "platform": "linkedin"}`.
   * Expected Result: Status returns 200. Fallback tags based on workspace metadata (e.g. `#marketing`) are returned to prevent empty screens.
   * Priority: MEDIUM
   */
  test('TC-BE-803: Return Fallback Category Hashtags on Generic Inputs', async () => {
    const res = await request(app)
      .post('/api/v1/ai/suggest-hashtags')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        caption: 'asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf',
        platform: 'linkedin'
      });

    expect(res.status).toBe(200);
    expect(res.body.hashtags).toContain('#marketing'); // Fallback tag assertion
  });
});
