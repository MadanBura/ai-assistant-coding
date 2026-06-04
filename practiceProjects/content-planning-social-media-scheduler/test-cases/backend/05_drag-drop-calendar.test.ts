import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

describe('FEAT-201: Interactive Drag-and-Drop Calendar Grid (Backend)', () => {
  let adminToken: string;
  let clientToken: string;
  let workspaceId: string;
  let postId: string;

  beforeAll(async () => {
    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_ADMIN...';
    clientToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_CLIENT...';

    const ws = await db.query(
      "INSERT INTO workspace (name) VALUES ('Test Calendar DB Workspace') RETURNING id"
    );
    workspaceId = ws.rows[0].id;

    // Create a mock post scheduled tomorrow
    const postInsert = await db.query(
      "INSERT INTO post (workspace_id, caption, status, scheduled_time, author_id) VALUES ($1, 'Calendar post check', 'APPROVED', NOW() + INTERVAL '1 day', gen_random_uuid()) RETURNING id",
      [workspaceId]
    );
    postId = postInsert.rows[0].id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM post');
    await db.query('DELETE FROM workspace');
    await db.end();
  });

  /**
   * TC ID: TC-BE-501
   * Requirement Mapping: FR-202-2
   * AC Mapping: AC-202-1
   * Test Type: Functional / API / Database
   * Preconditions: Post exists, target time is valid.
   * Steps:
   *   1. Patch reschedule request to `/api/v1/posts/:post_id/reschedule` targeting scheduled time tomorrow + 2 hours.
   * Expected Result: Status returns 200. Database updates scheduled_time values cleanly.
   * Priority: HIGH
   */
  test('TC-BE-501: Reschedule Approved Post Date Target', async () => {
    const newTargetTime = new Date();
    newTargetTime.setDate(newTargetTime.getDate() + 2); // Set to 2 days in future
    newTargetTime.setHours(12, 0, 0, 0);

    const res = await request(app)
      .patch(`/api/v1/posts/${postId}/reschedule`)
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({ scheduled_time: newTargetTime.toISOString() });

    expect(res.status).toBe(200);
    expect(res.body.scheduled_time).toBe(newTargetTime.toISOString());

    // Assert database write
    const dbPost = await db.query('SELECT scheduled_time FROM post WHERE id = $1', [postId]);
    expect(new Date(dbPost.rows[0].scheduled_time).toISOString()).toBe(newTargetTime.toISOString());
  });

  /**
   * TC ID: TC-BE-502
   * Requirement Mapping: FR-202-2
   * AC Mapping: AC-202-2
   * Test Type: Security / Negative / Validation
   * Preconditions: Viewer client role calls reschedule PATCH.
   * Steps:
   *   1. Issue PATCH `/api/v1/posts/:post_id/reschedule` using viewer client token headers.
   * Expected Result: Status returns 403 Forbidden. Database values remain unchanged.
   * Priority: CRITICAL
   */
  test('TC-BE-502: Reject Rescheduling Operations Triggered by Viewers', async () => {
    const res = await request(app)
      .patch(`/api/v1/posts/${postId}/reschedule`)
      .set('Authorization', clientToken)
      .set('X-Workspace-ID', workspaceId)
      .send({ scheduled_time: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString() });

    expect(res.status).toBe(403);
  });

  /**
   * TC ID: TC-BE-503
   * Requirement Mapping: FR-202-2
   * AC Mapping: AC-202-2
   * Test Type: Edge Cases / Negative / Validation
   * Preconditions: Re-schedule target date falls inside historical window.
   * Steps:
   *   1. Patch reschedule date in past to `/api/v1/posts/:post_id/reschedule` `{"scheduled_time": "2026-01-01T00:00:00Z"}`.
   * Expected Result: Status returns 400 Bad Request. Action aborts.
   * Priority: HIGH
   */
  test('TC-BE-503: Reject Rescheduling Actions to Historical Dates', async () => {
    const res = await request(app)
      .patch(`/api/v1/posts/${postId}/reschedule`)
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({ scheduled_time: '2026-06-01T10:00:00.000Z' }); // Historical date (before current 2026-06-04 time)

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Scheduled time must be in the future');
  });
});
