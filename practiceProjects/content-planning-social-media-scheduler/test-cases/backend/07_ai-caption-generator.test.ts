import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';

describe('FEAT-301: AI Caption Generator (Backend)', () => {
  let adminToken: string;
  let workspaceId: string;

  beforeAll(async () => {
    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    const ws = await db.query(
      "INSERT INTO workspace (name) VALUES ('Test AI Workspace') RETURNING id"
    );
    workspaceId = ws.rows[0].id;

    // Seed AI Quota record
    await db.query(
      "INSERT INTO workspace_ai_quota (workspace_id, ai_quota_limit, ai_quota_used, reset_date) VALUES ($1, 50000, 0, NOW() + INTERVAL '1 month')",
      [workspaceId]
    );
  });

  afterAll(async () => {
    await db.query('DELETE FROM ai_generation_log');
    await db.query('DELETE FROM workspace_ai_quota');
    await db.query('DELETE FROM workspace');
    await db.end();
  });

  /**
   * TC ID: TC-BE-701
   * Requirement Mapping: FR-301-1, FR-301-2, FR-301-5
   * AC Mapping: AC-301-1
   * Test Type: Functional / API / Database
   * Preconditions: Workspace contains active token credits.
   * Steps:
   *   1. Post payload to `/api/v1/ai/generate-caption`: `{"prompt": "Sustainability initiative", "tone": "BOLD", "platform": "linkedin", "length": "MEDIUM"}`.
   * Expected Result: Status returns 200, response returns array of mock options, database increments `ai_quota_used` by token counts and appends record in `ai_generation_log`.
   * Priority: HIGH
   */
  test('TC-BE-701: Verify AI Caption Generation and Quota Token Decrementing', async () => {
    const res = await request(app)
      .post('/api/v1/ai/generate-caption')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        prompt: 'Sustainability initiative launch',
        tone: 'BOLD',
        platform: 'linkedin',
        length: 'MEDIUM'
      });

    expect(res.status).toBe(200);
    expect(res.body.options.length).toBeGreaterThan(0);

    // Verify database limits incremented
    const quotaCheck = await db.query('SELECT ai_quota_used FROM workspace_ai_quota WHERE workspace_id = $1', [workspaceId]);
    expect(quotaCheck.rows[0].ai_quota_used).toBeGreaterThan(0);

    // Verify log table
    const logCheck = await db.query('SELECT tokens_billed FROM ai_generation_log WHERE workspace_id = $1', [workspaceId]);
    expect(logCheck.rows[0].tokens_billed).toBeGreaterThan(0);
  });

  /**
   * TC ID: TC-BE-702
   * Requirement Mapping: FR-301-4
   * AC Mapping: AC-301-3
   * Test Type: Security / Negative / Validation
   * Preconditions: Token usage limit exceeded.
   * Steps:
   *   1. Force quota record in database to exceed limits: `ai_quota_used = 55000` (where limit is 50000).
   *   2. Issue POST `/api/v1/ai/generate-caption` call.
   * Expected Result: Status returns 402 Payment Required. LLM calls are skipped, data stays unmutated.
   * Priority: HIGH
   */
  test('TC-BE-702: Reject AI Generation Requests when Quota Limits are Exceeded', async () => {
    await db.query(
      'UPDATE workspace_ai_quota SET ai_quota_used = 55000 WHERE workspace_id = $1',
      [workspaceId]
    );

    const res = await request(app)
      .post('/api/v1/ai/generate-caption')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        prompt: 'Sustainability initiative launch',
        tone: 'BOLD',
        platform: 'linkedin',
        length: 'MEDIUM'
      });

    expect(res.status).toBe(402);
    expect(res.body.error).toContain('AI quota limit reached');
  });

  /**
   * TC ID: TC-BE-703
   * Requirement Mapping: FR-301-1
   * AC Mapping: AC-301-4
   * Test Type: Validation / API / Negative
   * Preconditions: Invalid API parameter tone fields.
   * Steps:
   *   1. Post to `/api/v1/ai/generate-caption` with invalid tone parameter values: `{"tone": "SARCSTATIC"}`.
   * Expected Result: Status returns 400 Bad Request. Parameter checks block payload parse.
   * Priority: MEDIUM
   */
  test('TC-BE-703: Block AI Requests containing Invalid Input Parameters', async () => {
    const res = await request(app)
      .post('/api/v1/ai/generate-caption')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({
        prompt: 'Valid prompt copy text',
        tone: 'SARCASTIC', // Invalid tone enum parameter
        platform: 'linkedin',
        length: 'MEDIUM'
      });

    expect(res.status).toBe(400);
  });
});
