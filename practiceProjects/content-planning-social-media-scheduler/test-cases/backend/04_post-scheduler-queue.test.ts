import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';
import Redis from 'ioredis'; // Redis mock queue verify

describe('FEAT-202: Post Scheduler Engine & Queue (Backend)', () => {
  let adminToken: string;
  let workspaceId: string;
  let redisClient: Redis;

  beforeAll(async () => {
    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    
    const ws = await db.query(
      "INSERT INTO workspace (name) VALUES ('Test Queue Workspace') RETURNING id"
    );
    workspaceId = ws.rows[0].id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM post_publishing_log');
    await db.query('DELETE FROM post_media');
    await db.query('DELETE FROM post');
    await db.query('DELETE FROM workspace');
    await redisClient.quit();
    await db.end();
  });

  /**
   * TC ID: TC-BE-401
   * Requirement Mapping: FR-202-3
   * AC Mapping: AC-203-1
   * Test Type: Validation / API / Negative
   * Preconditions: API active.
   * Steps:
   *   1. Post to `/api/v1/posts` with schedule time in past `{"caption": "Past post", "scheduled_time": "2020-01-01T00:00:00Z"}`.
   * Expected Result: Status returns 400 Bad Request. Error message reads "Scheduled time must be in the future".
   * Priority: HIGH
   */
  test('TC-BE-401: Block Post Creation Requests with Historical Schedule Timestamps', async () => {
    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        platforms: ['linkedin'],
        caption: 'This post is already old news.',
        scheduled_time: '2020-06-04T12:00:00.000Z'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Scheduled time must be in the future');
  });

  /**
   * TC ID: TC-BE-402
   * Requirement Mapping: FR-202-4, FR-202-5, FR-202-6
   * AC Mapping: AC-202-2
   * Test Type: Functional / Integration / Database
   * Preconditions: Post exists in database with status 'APPROVED' and scheduled_time is now.
   * Steps:
   *   1. Insert post record in DB marked status='APPROVED', scheduled_time = current time.
   *   2. Manually trigger the background scheduler worker tick callback script.
   * Expected Result: Worker fetches the post, queries mock external publishing handlers, transitions post status to `PUBLISHED` in database, and appends reference details inside log table.
   * Priority: HIGH
   */
  test('TC-BE-402: Process Queue Scheduler Polling and Verify Post State Transitions', async () => {
    const authorRes = await db.query(
      "INSERT INTO \"user\" (email, password_hash, display_name) VALUES ('author@sandbox.com', 'hash', 'Author') RETURNING id"
    );
    const authorId = authorRes.rows[0].id;

    const postInsert = await db.query(
      "INSERT INTO post (workspace_id, caption, status, scheduled_time, author_id) VALUES ($1, 'Mock publishing check', 'APPROVED', NOW() - INTERVAL '1 minute', $2) RETURNING id",
      [workspaceId, authorId]
    );
    const postId = postInsert.rows[0].id;

    // Trigger mock worker runner script manually
    // under tests we call the background function directly
    const { processPublishingQueue } = require('../../src/queue/worker');
    await processPublishingQueue();

    // Verify post transitions to PUBLISHED
    const updatedPost = await db.query('SELECT status, published_time FROM post WHERE id = $1', [postId]);
    expect(updatedPost.rows[0].status).toBe('PUBLISHED');
    expect(updatedPost.rows[0].published_time).toBeDefined();

    // Verify Log entries
    const logCheck = await db.query('SELECT status, platform FROM post_publishing_log WHERE post_id = $1', [postId]);
    expect(logCheck.rows[0].status).toBe('SUCCESS');

    // Cleanup mock user
    await db.query('DELETE FROM "user" WHERE id = $1', [authorId]);
  });

  /**
   * TC ID: TC-BE-403
   * Requirement Mapping: FR-202-5
   * AC Mapping: AC-202-2
   * Test Type: Database / Security / Edge Cases
   * Preconditions: Parallel workers request locks on the identical scheduled post.
   * Steps:
   *   1. Start transaction 1: Run `SELECT * FROM post WHERE id = $1 FOR UPDATE` lock query.
   *   2. Start transaction 2: Attempt concurrent lock fetch query.
   * Expected Result: Transaction 2 locks/waits until Transaction 1 completes (`COMMIT`/`ROLLBACK`), preventing simultaneous dual dispatches of same scheduled post.
   * Priority: CRITICAL
   */
  test('TC-BE-403: Verify Database Transactions Exclusively Lock Processing Rows', async () => {
    const client1 = await db.connect();
    const client2 = await db.connect();

    const postRes = await db.query(
      "INSERT INTO post (workspace_id, caption, status, author_id) VALUES ($1, 'Locked post check', 'APPROVED', gen_random_uuid()) RETURNING id",
      [workspaceId]
    );
    const postId = postRes.rows[0].id;

    try {
      // Transaction 1 gets lock
      await client1.query('BEGIN');
      await client1.query('SELECT * FROM post WHERE id = $1 FOR UPDATE', [postId]);

      // Transaction 2 tries lock (with small timeout to force failure check)
      await client2.query('BEGIN');
      await client2.query('SET LOCAL lock_timeout = 100'); // Timeout lock in 100ms
      
      let errorThrown = false;
      try {
        await client2.query('SELECT * FROM post WHERE id = $1 FOR UPDATE', [postId]);
      } catch (err: any) {
        errorThrown = true;
        expect(err.message).toContain('canceling statement due to lock timeout');
      }
      expect(errorThrown).toBe(true);

      // Rollback and release
      await client1.query('ROLLBACK');
      await client2.query('ROLLBACK');
    } finally {
      client1.release();
      client2.release();
    }
  });
});
