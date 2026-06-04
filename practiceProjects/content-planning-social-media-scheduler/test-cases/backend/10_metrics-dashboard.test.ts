import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

describe('FEAT-601: Metrics Dashboard (Backend)', () => {
  let adminToken: string;
  let workspaceId: string;

  beforeAll(async () => {
    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    const ws = await db.query(
      "INSERT INTO workspace (name) VALUES ('Test Analytics Workspace') RETURNING id"
    );
    workspaceId = ws.rows[0].id;

    // Seed daily metrics history
    await db.query(
      "INSERT INTO daily_metric_aggregate (workspace_id, platform, record_date, follower_count, impressions_count, clicks_count, likes_count, comments_count, shares_count) VALUES ($1, 'LINKEDIN', '2026-06-01', 1000, 5000, 200, 50, 10, 5)",
      [workspaceId]
    );
    await db.query(
      "INSERT INTO daily_metric_aggregate (workspace_id, platform, record_date, follower_count, impressions_count, clicks_count, likes_count, comments_count, shares_count) VALUES ($1, 'TWITTER', '2026-06-01', 500, 3000, 100, 30, 5, 2)",
      [workspaceId]
    );
  });

  afterAll(async () => {
    await db.query('DELETE FROM daily_metric_aggregate');
    await db.query('DELETE FROM workspace');
    await db.end();
  });

  /**
   * TC ID: TC-BE-1001
   * Requirement Mapping: FR-601-3, FR-601-4
   * AC Mapping: AC-601-1
   * Test Type: Functional / API / Database
   * Preconditions: Metrics records loaded in Database.
   * Steps:
   *   1. Query GET `/api/v1/analytics/summary` range='30d'.
   * Expected Result: Status returns 200. Aggregated total metrics sums are accurate: total_impressions = 8000, total_clicks = 300.
   * Priority: HIGH
   */
  test('TC-BE-1001: Query Analytics Summary and Validate Database Sum Formulas', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/summary')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .query({ range: '30d' });

    expect(res.status).toBe(200);
    expect(res.body.summary.total_impressions).toBe(8000); // 5000 + 3000
    expect(res.body.summary.total_clicks).toBe(300);       // 200 + 100
  });

  /**
   * TC ID: TC-BE-1002
   * Requirement Mapping: FR-601-4
   * AC Mapping: AC-601-4
   * Test Type: Negative / Validation / Database
   * Preconditions: Impressions totals are 0 for the queried date range.
   * Steps:
   *   1. Insert a metric aggregate record for a new platform with 0 impressions.
   *   2. Request summary analytics for that platform.
   * Expected Result: Average Engagement Rate returns `0.0%` rather than crashing the backend controller with Division-by-Zero errors.
   * Priority: HIGH
   */
  test('TC-BE-1002: Assert Division-by-Zero Protection inside Engagement Rate Calculations', async () => {
    await db.query(
      "INSERT INTO daily_metric_aggregate (workspace_id, platform, record_date, follower_count, impressions_count, clicks_count, likes_count, comments_count, shares_count) VALUES ($1, 'INSTAGRAM', '2026-06-02', 100, 0, 0, 0, 0, 0)",
      [workspaceId]
    );

    const res = await request(app)
      .get('/api/v1/analytics/summary')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .query({ range: '30d', platforms: 'instagram' });

    expect(res.status).toBe(200);
    expect(res.body.summary.total_impressions).toBe(0);
    expect(res.body.summary.average_engagement_rate).toBe(0); // Safely defaulted to 0
  });

  /**
   * TC ID: TC-BE-1003
   * Requirement Mapping: FR-601-1
   * AC Mapping: AC-601-1
   * Test Type: Functional / Integration / Scraper
   * Preconditions: Daily scheduler runs.
   * Steps:
   *   1. Trigger metrics daily scraper cron task function.
   * Expected Result: Cron calls mock social network SDKs, processes updates successfully, updates active workspace daily records.
   * Priority: MEDIUM
   */
  test('TC-BE-1003: Execute Automated Daily Metrics Scraper Tasks', async () => {
    const { runDailyMetricsScraper } = require('../../src/queue/scraper');
    
    // Trigger scraper function
    let scraperStatus = true;
    try {
      await runDailyMetricsScraper();
    } catch (e) {
      scraperStatus = false;
    }
    expect(scraperStatus).toBe(true);
  });
});
