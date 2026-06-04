import request from 'supertest';
import app from '../../src/app';
import db from '../../src/db';
import crypto from 'crypto';

describe('FEAT-102: Social Account OAuth Integration (Backend)', () => {
  let adminToken: string;
  let workspaceId: string;

  beforeAll(async () => {
    adminToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    // Create seed workspace row
    const ws = await db.query(
      "INSERT INTO workspace (name) VALUES ('Test Integration Workspace') RETURNING id"
    );
    workspaceId = ws.rows[0].id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM social_channel');
    await db.query('DELETE FROM workspace');
    await db.end();
  });

  /**
   * TC ID: TC-BE-201
   * Requirement Mapping: FR-102-3, FR-102-5
   * AC Mapping: AC-103-1, AC-103-2
   * Test Type: Functional / API / Database / Security
   * Preconditions: Valid state nonce matches. Code parameter present.
   * Steps:
   *   1. Post OAuth payload to `/api/v1/integrations/oauth/linkedin/callback` with code and state parameters.
   * Expected Result: API intercepts call, exchanges mock code for credentials, runs AES-256-GCM encryption on token, and saves encrypted data in `SOCIAL_CHANNEL` table. Key values read from database are encrypted.
   * Priority: HIGH
   */
  test('TC-BE-201: Exchange Code for Access Token and Verify Encrypted Storage', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/oauth/linkedin/callback')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({ code: 'mock_valid_auth_code_999', state: 'mock_secure_nonce' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ACTIVE');

    // Retrieve database record to verify encryption
    const channelRow = await db.query(
      'SELECT encrypted_access_token FROM social_channel WHERE workspace_id = $1',
      [workspaceId]
    );
    expect(channelRow.rows[0].encrypted_access_token).toBeDefined();
    // Validate text encryption prefix format (iv:authtag:encryptedText)
    const tokenParts = channelRow.rows[0].encrypted_access_token.split(':');
    expect(tokenParts.length).toBe(3);
    
    // Attempting manual plaintext parse fails
    expect(channelRow.rows[0].encrypted_access_token).not.toContain('mock_valid_auth_code_999');
  });

  /**
   * TC ID: TC-BE-202
   * Requirement Mapping: FR-102-2
   * AC Mapping: AC-103-3
   * Test Type: Security / Negative / Validation
   * Preconditions: OAuth callback triggers state parameter mismatch.
   * Steps:
   *   1. Post callback credentials with wrong state token `{"code": "auth_code", "state": "corrupted_state"}`.
   * Expected Result: Status returns 400 Bad Request. Action logs warning, database remains unmutated.
   * Priority: CRITICAL
   */
  test('TC-BE-202: Reject Redirection Callbacks with Mismatched Nonce State', async () => {
    const res = await request(app)
      .post('/api/v1/integrations/oauth/linkedin/callback')
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId)
      .send({ code: 'code_xyz', state: 'corrupted_state' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('State parameter validation failed');
  });

  /**
   * TC ID: TC-BE-203
   * Requirement Mapping: FR-102-7
   * AC Mapping: AC-103-3
   * Test Type: Functional / API / Database
   * Preconditions: Connected channel row exists in DB.
   * Steps:
   *   1. Execute DELETE `/api/v1/integrations/channels/:channel_id`.
   * Expected Result: Status returns 204 No Content. Channel details are dropped from PostgreSQL tables.
   * Priority: HIGH
   */
  test('TC-BE-203: Revoke Social Channel and Remove Credentials from DB', async () => {
    // Get existing channel id
    const channel = await db.query('SELECT id FROM social_channel LIMIT 1');
    const channelId = channel.rows[0].id;

    const res = await request(app)
      .delete(`/api/v1/integrations/channels/${channelId}`)
      .set('Authorization', adminToken)
      .set('X-Workspace-ID', workspaceId);

    expect(res.status).toBe(204);

    // Verify database row is deleted
    const checkRow = await db.query('SELECT * FROM social_channel WHERE id = $1', [channelId]);
    expect(checkRow.rows.length).toBe(0);
  });
});
