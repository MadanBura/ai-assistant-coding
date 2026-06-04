import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

describe('FEAT-602: Exportable Reports (Backend)', () => {
  let adminToken: string;
  let workspaceId: string;

  beforeAll(async () => {
    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    const ws = await db.query(
      "INSERT INTO workspace (name) VALUES ('Test Export DB Workspace') RETURNING id"
    );
    workspaceId = ws.rows[0].id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM report_log');
    await db.query('DELETE FROM workspace');
    await db.end();
  });

  /**
   * TC ID: TC-BE-1101
   * Requirement Mapping: FR-602-1, FR-602-2, FR-602-7
   * AC Mapping: AC-602-1
   * Test Type: Functional / API / Database
   * Preconditions: Workspace metrics data present.
   * Steps:
   *   1. Post to `/api/v1/analytics/export` payload `{"format": "PDF", "start_date": "2026-05-01", "end_date": "2026-06-01", "email_to": "client@acme.com"}`.
   * Expected Result: Status returns 202 Accepted. Queue creates task, database logs `PROCESSING` report state.
   * Priority: HIGH
   */
  test('TC-BE-1101: Submit Report Export Request and Verify Queue Processing', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/export')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        format: 'PDF',
        start_date: '2026-05-01',
        end_date: '2026-06-01',
        email_to: 'client@acme.com'
      });

    expect(res.status).toBe(202);
    expect(res.body.status).toBe('PROCESSING');
    const reportId = res.body.report_id;

    // Database lookup verification
    const dbReport = await db.query('SELECT status, report_format FROM report_log WHERE id = $1', [reportId]);
    expect(dbReport.rows[0].status).toBe('PROCESSING');
    expect(dbReport.rows[0].report_format).toBe('PDF');
  });

  /**
   * TC ID: TC-BE-1102
   * Requirement Mapping: FR-602-6
   * AC Mapping: AC-602-3
   * Test Type: Security / Functional / API
   * Preconditions: Report job finishes processing.
   * Steps:
   *   1. Insert a complete report log row in DB.
   *   2. Query GET `/api/v1/analytics/export/:report_id` using completed report ID.
   * Expected Result: Status returns 200, response body returns download_url containing AWS pre-signed signature.
   * Priority: HIGH
   */
  test('TC-BE-1102: Retrieve Expiring Download Links for Completed Reports', async () => {
    const mockUserRes = await db.query(
      "INSERT INTO \"user\" (email, password_hash, display_name) VALUES ('requester@sandbox.com', 'hash', 'Requester') RETURNING id"
    );
    const userId = mockUserRes.rows[0].id;

    const reportRes = await db.query(
      "INSERT INTO report_log (workspace_id, requested_by, report_format, start_date, end_date, status, s3_key) VALUES ($1, $2, 'PDF', '2026-05-01', '2026-06-01', 'COMPLETED', 'uuid_mock_report.pdf') RETURNING id",
      [workspaceId, userId]
    );
    const reportId = reportRes.rows[0].id;

    const res = await request(app)
      .get(`/api/v1/analytics/export/${reportId}`)
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
    expect(res.body.download_url).toBeDefined();
    // Validate expiring signatures parameters
    expect(res.body.download_url).toContain('Expires=');

    // Cleanup mock data
    await db.query('DELETE FROM report_log WHERE id = $1', [reportId]);
    await db.query('DELETE FROM "user" WHERE id = $1', [userId]);
  });

  /**
   * TC ID: TC-BE-1103
   * Requirement Mapping: FR-602-2
   * AC Mapping: AC-602-1
   * Test Type: Validation / API / Negative
   * Preconditions: Exceeds date boundaries.
   * Steps:
   *   1. Post to `/api/v1/analytics/export` with range exceeding 12 months (e.g. 2 years).
   * Expected Result: Status returns 400 Bad Request. Date validator blocks request.
   * Priority: MEDIUM
   */
  test('TC-BE-1103: Reject Report Requests Exceeding 12-Month Ranges', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/export')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        format: 'PDF',
        start_date: '2024-06-01',
        end_date: '2026-06-01', // 2 year date range limit block
        email_to: 'client@acme.com'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Date range cannot exceed 12 months');
  });
});
