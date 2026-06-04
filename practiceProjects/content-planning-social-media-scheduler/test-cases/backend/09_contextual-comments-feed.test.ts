import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

describe('FEAT-502: Contextual Comments Feed (Backend)', () => {
  let adminToken: string;
  let workspaceId: string;
  let postId: string;

  beforeAll(async () => {
    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    const ws = await db.query(
      "INSERT INTO workspace (name) VALUES ('Test Comments Workspace') RETURNING id"
    );
    workspaceId = ws.rows[0].id;

    // Create a mock post
    const postRes = await db.query(
      "INSERT INTO post (workspace_id, caption, status, author_id) VALUES ($1, 'Comment test post', 'DRAFT', gen_random_uuid()) RETURNING id",
      [workspaceId]
    );
    postId = postRes.rows[0].id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM comment');
    await db.query('DELETE FROM post');
    await db.query('DELETE FROM workspace');
    await db.end();
  });

  /**
   * TC ID: TC-BE-901
   * Requirement Mapping: FR-502-1, FR-502-6
   * AC Mapping: AC-503-1
   * Test Type: Functional / API / Database
   * Preconditions: Post exists in target workspace.
   * Steps:
   *   1. Post to `/api/v1/posts/:post_id/comments` with payload `{"body": "Simple comment details"}`.
   * Expected Result: Status returns 201. Comment registers in `COMMENT` table and binds user reference.
   * Priority: HIGH
   */
  test('TC-BE-901: Create Comment and Validate Database Registry Entries', async () => {
    const res = await request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({ body: 'Simple comment details' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('comment_id');
    const commentId = res.body.comment_id;

    // Assert database write
    const dbComment = await db.query('SELECT body FROM comment WHERE id = $1', [commentId]);
    expect(dbComment.rows[0].body).toBe('Simple comment details');
  });

  /**
   * TC ID: TC-BE-902
   * Requirement Mapping: FR-502-1
   * AC Mapping: AC-503-4
   * Test Type: Security / Negative / Workspace Isolation
   * Preconditions: Guest user attempts to post comments to post inside another workspace.
   * Steps:
   *   1. Authenticate User B token.
   *   2. Issue POST `/api/v1/posts/:post_id/comments` targeting postId using User B token.
   * Expected Result: Status returns 403 Forbidden. Database remains unmutated.
   * Priority: CRITICAL
   */
  test('TC-BE-902: Block Comments posted to Cross-Workspace Assets', async () => {
    const userBToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_USER_B...';
    
    const res = await request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .set('Authorization', userBToken)
      .set('X-Workspace-ID', 'another-workspace-uuid-123')
      .send({ body: 'Intruder comment attempts' });

    expect(res.status).toBe(403);

    // DB verify no row is inserted matching text
    const checkRow = await db.query("SELECT * FROM comment WHERE body = 'Intruder comment attempts'");
    expect(checkRow.rows.length).toBe(0);
  });

  /**
   * TC ID: TC-BE-903
   * Requirement Mapping: FR-502-1
   * AC Mapping: AC-503-2
   * Test Type: Security / Validation / Negative
   * Preconditions: Comment contains malicious Javascript tags.
   * Steps:
   *   1. Post to `/api/v1/posts/:post_id/comments` payload `{"body": "<script>alert('xss');</script>Bold comment text"}`.
   * Expected Result: Status returns 201. Input sanitization wrapper strips script tags prior to database insertion. Text is stored as raw escaped/cleaned format: "Bold comment text".
   * Priority: CRITICAL
   */
  test('TC-BE-903: Sanitize Malicious HTML Scripts inside Comment Payloads', async () => {
    const res = await request(app)
      .post(`/api/v1/posts/${postId}/comments`)
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({ body: "<script>alert('xss');</script>Bold comment text" });

    expect(res.status).toBe(201);
    const commentId = res.body.comment_id;

    // Verify script tags were stripped out prior to DB save
    const dbComment = await db.query('SELECT body FROM comment WHERE id = $1', [commentId]);
    expect(dbComment.rows[0].body).not.toContain('<script>');
    expect(dbComment.rows[0].body).toBe('Bold comment text');
  });
});
