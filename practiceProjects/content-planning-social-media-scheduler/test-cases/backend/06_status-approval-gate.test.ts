import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

describe('FEAT-501: Status-based Approval Gate (Backend)', () => {
  let editorToken: string;
  let approverToken: string;
  let workspaceId: string;
  let postId: string;

  beforeAll(async () => {
    editorToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_EDITOR...';
    approverToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_APPROVER...';

    const ws = await db.query(
      "INSERT INTO workspace (name) VALUES ('Test Approval Workspace') RETURNING id"
    );
    workspaceId = ws.rows[0].id;

    // Insert draft post
    const postRes = await db.query(
      "INSERT INTO post (workspace_id, caption, status, scheduled_time, author_id) VALUES ($1, 'Approval workflow test', 'DRAFT', NOW() + INTERVAL '1 day', gen_random_uuid()) RETURNING id",
      [workspaceId]
    );
    postId = postRes.rows[0].id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM post_rejection_history');
    await db.query('DELETE FROM post');
    await db.query('DELETE FROM workspace');
    await db.end();
  });

  /**
   * TC ID: TC-BE-601
   * Requirement Mapping: FR-501-2
   * AC Mapping: AC-501-1
   * Test Type: Functional / API / Database
   * Preconditions: Post in DRAFT status.
   * Steps:
   *   1. Post submit request to `/api/v1/posts/:post_id/submit`.
   * Expected Result: Status returns 200. Post status field updates to `PENDING_REVIEW` in Postgres.
   * Priority: HIGH
   */
  test('TC-BE-601: Transition Post Status from Draft to Pending Review', async () => {
    const res = await request(app)
      .post(`/api/v1/posts/${postId}/submit`)
      .set('Authorization', editorToken)
      .set('X-Workspace-ID', workspaceId);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PENDING_REVIEW');

    const dbPost = await db.query('SELECT status FROM post WHERE id = $1', [postId]);
    expect(dbPost.rows[0].status).toBe('PENDING_REVIEW');
  });

  /**
   * TC ID: TC-BE-602
   * Requirement Mapping: FR-501-3
   * AC Mapping: AC-501-2, AC-501-3
   * Test Type: Functional / API / Database
   * Preconditions: Post in PENDING_REVIEW. User has APPROVER role.
   * Steps:
   *   1. Post rejection request to `/api/v1/posts/:post_id/reject` with payload `{"rejection_reason": "Correct logo alignment"}`.
   * Expected Result: Status returns 200. Post reverts to status `DRAFT`. Database inserts rejection notes into history table.
   * Priority: HIGH
   */
  test('TC-BE-602: Reject Pending Post and Assert Rejection Log Writes', async () => {
    const res = await request(app)
      .post(`/api/v1/posts/${postId}/reject`)
      .set('Authorization', approverToken)
      .set('X-Workspace-ID', workspaceId)
      .send({ rejection_reason: 'Correct logo alignment' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('DRAFT');

    // Verify rejection history database logs
    const historyCheck = await db.query(
      'SELECT rejection_reason FROM post_rejection_history WHERE post_id = $1',
      [postId]
    );
    expect(historyCheck.rows[0].rejection_reason).toBe('Correct logo alignment');
  });

  /**
   * TC ID: TC-BE-603
   * Requirement Mapping: FR-501-5
   * AC Mapping: AC-502-3
   * Test Type: Edge Cases / Negative / Validation
   * Preconditions: Post status is APPROVED and publication is scheduled to release in less than 10 minutes.
   * Steps:
   *   1. Update scheduled time to current time + 5 minutes.
   *   2. Force status to APPROVED.
   *   3. Issue update PUT `/api/v1/posts/:id` trying to edit text copy.
   * Expected Result: Status returns 400 Bad Request. Update rejects, text remains unmutated.
   * Priority: CRITICAL
   */
  test('TC-BE-603: Enforce Update Blocker during 10-Minute Publishing Lockout Window', async () => {
    const lockTime = new Date();
    lockTime.setMinutes(lockTime.getMinutes() + 5); // 5 minutes in future

    await db.query(
      "UPDATE post SET status = 'APPROVED', scheduled_time = $1 WHERE id = $2",
      [lockTime.toISOString(), postId]
    );

    const res = await request(app)
      .put(`/api/v1/posts/${postId}`)
      .set('Authorization', approverToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        caption: 'Hacked caption update',
        scheduled_time: lockTime.toISOString(),
        platforms: ['linkedin']
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Post is locked for publishing');
  });
});
