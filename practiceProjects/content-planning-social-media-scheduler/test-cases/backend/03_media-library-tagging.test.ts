import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

describe('FEAT-401: Media Library & Asset Tagging (Backend)', () => {
  let adminToken: string;
  let workspaceId: string;
  let assetId: string;

  beforeAll(async () => {
    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    // Create seed workspace row
    const ws = await db.query(
      "INSERT INTO workspace (name) VALUES ('Test Media Workspace') RETURNING id"
    );
    workspaceId = ws.rows[0].id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM media_asset');
    await db.query('DELETE FROM workspace');
    await db.end();
  });

  /**
   * TC ID: TC-BE-301
   * Requirement Mapping: FR-401-1
   * AC Mapping: AC-401-1
   * Test Type: Functional / API
   * Preconditions: Workspace exists, valid authorization header.
   * Steps:
   *   1. Post metadata to `/api/v1/media/presign` requesting pre-signed S3 parameters.
   * Expected Result: Status returns 200, response body contains S3 key parameter prefix and a secure upload target URL.
   * Priority: HIGH
   */
  test('TC-BE-301: Request AWS S3 Pre-signed Upload URL', async () => {
    const res = await request(app)
      .post('/api/v1/media/presign')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        filename: 'banner_ad.png',
        mime_type: 'image/png',
        file_size_bytes: 409600
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('upload_url');
    expect(res.body).toHaveProperty('s3_key');
    expect(res.body.s3_key).toContain(`${workspaceId}/assets/`);
  });

  /**
   * TC ID: TC-BE-302
   * Requirement Mapping: FR-401-4, FR-401-5
   * AC Mapping: AC-401-2
   * Test Type: Functional / API / Database
   * Preconditions: S3 upload completes.
   * Steps:
   *   1. Post asset mapping parameters to `/api/v1/media` to register file in workspace database.
   * Expected Result: Status returns 201, db registers row in `MEDIA_ASSET` containing filename tags array details.
   * Priority: HIGH
   */
  test('TC-BE-302: Register Uploaded Media Metadata and Assert Database Writes', async () => {
    const res = await request(app)
      .post('/api/v1/media')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        filename: 'banner_ad.png',
        s3_key: `${workspaceId}/assets/uuid_banner_ad.png`,
        mime_type: 'image/png',
        file_size_bytes: 409600,
        tags: ['marketing', 'display']
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('asset_id');
    assetId = res.body.asset_id;

    // Database lookup verification
    const dbAsset = await db.query('SELECT filename, tags FROM media_asset WHERE id = $1', [assetId]);
    expect(dbAsset.rows[0].filename).toBe('banner_ad.png');
    expect(dbAsset.rows[0].tags).toContain('marketing');
  });

  /**
   * TC ID: TC-BE-303
   * Requirement Mapping: FR-401-7
   * AC Mapping: AC-401-3
   * Test Type: Edge Cases / Security / Database
   * Preconditions: Media asset is linked to a scheduled post.
   * Steps:
   *   1. Insert link row in `POST_MEDIA` table connecting assetId to active scheduled post.
   *   2. Issue DELETE `/api/v1/media/:asset_id` endpoint call.
   * Expected Result: Status returns 409 Conflict. Database check validates that the record deletion was rolled back due to active post connections.
   * Priority: CRITICAL
   */
  test('TC-BE-303: Block Deletion of Assets Linked to Scheduled Posts', async () => {
    // Inject mock post and link asset to it
    const postRes = await db.query(
      "INSERT INTO post (workspace_id, caption, status, scheduled_time, author_id) VALUES ($1, 'Mock Post', 'APPROVED', NOW() + INTERVAL '1 hour', gen_random_uuid()) RETURNING id",
      [workspaceId]
    );
    const postId = postRes.rows[0].id;

    await db.query(
      "INSERT INTO post_media (post_id, media_asset_id, display_order) VALUES ($1, $2, 0)",
      [postId, assetId]
    );

    // Call DELETE API
    const res = await request(app)
      .delete(`/api/v1/media/${assetId}`)
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId);

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('Asset is currently in use');

    // Confirm DB row is still present
    const assetCheck = await db.query('SELECT * FROM media_asset WHERE id = $1', [assetId]);
    expect(assetCheck.rows.length).toBe(1);

    // Cleanup mock data manually for subsequent runs
    await db.query('DELETE FROM post_media WHERE post_id = $1', [postId]);
    await db.query('DELETE FROM post WHERE id = $1', [postId]);
  });
});
