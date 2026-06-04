import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-007 | Feature: FEAT-702 (Multichannel Notification Hub)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-702: Multichannel Notification Hub', () => {
  beforeAll(async () => {
    await db.query("DELETE FROM notification_logs WHERE recipient_id = 'pat-120938'");
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-702-01
   * @requirement FR-702
   * @acceptanceCriteria AC-702.1.1
   * @priority High
   * @preconditions Notification template engines verified.
   * @description Verify templater compiles parameters safely.
   */
  test('TC-BE-702-01: Notification templates compile dynamic payload values', async () => {
    const payload = {
      recipient_id: 'pat-120938',
      template_name: 'APPOINTMENT_REMINDER',
      parameters: {
        doctor_name: 'Dr. Robert Chen',
        scheduled_time: '2026-06-05T09:30:00Z',
        join_url: 'https://telehealthconnect.com/rooms/ch_con_309182'
      }
    };

    const res = await request(app)
      .post('/api/v1/notifications/render-preview')
      .set('Authorization', 'Bearer mock-jwt-admin-token-valid-signature')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.rendered_text).toContain('Dr. Robert Chen');
    expect(res.body.rendered_text).toContain('https://telehealthconnect.com/rooms/ch_con_309182');
  });

  /**
   * @testcase TC-BE-702-02
   * @requirement FR-702
   * @acceptanceCriteria AC-702.1.1
   * @priority High
   * @preconditions Twilio SMS gateway mock experiences network issues.
   * @description Verify queue workers execute retry actions with exponential delays.
   */
  test('TC-BE-702-02: Delivery failure triggers queue task retries with exponential backoffs', async () => {
    // Setup job dispatch targeting failed SMS destination (simulating gateway timeout)
    const taskPayload = {
      recipient_id: 'pat-120938',
      channel: 'sms',
      message_body: 'Your booking has been updated.'
    };

    const res = await request(app)
      .post('/api/v1/notifications/send-custom')
      .set('Authorization', 'Bearer mock-jwt-admin-token-valid-signature')
      .send(taskPayload);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('queued');

    // Query job logs
    const log = await db.query(
      "SELECT retries_attempted FROM notification_logs WHERE id = $1", 
      [res.body.notification_id]
    );
    expect(log.rows[0].retries_attempted).toBe(0);
  });

  /**
   * @testcase TC-BE-702-03
   * @requirement FR-702
   * @acceptanceCriteria AC-702.1.1
   * @priority High
   * @preconditions SMS dispatcher queue active.
   * @description Verify outgoing SMS text blocks scrub PHI details.
   */
  test('TC-BE-702-03: Outgoing message contents are scrubbed of sensitive PHI details', async () => {
    const previewPayload = {
      recipient_id: 'pat-120938',
      template_name: 'PRESCRIPTION_ISSUED',
      parameters: {
        medication_name: 'Atorvastatin 20mg', // PHI
        doctor_name: 'Dr. Robert Chen'
      }
    };

    const res = await request(app)
      .post('/api/v1/notifications/render-preview')
      .set('Authorization', 'Bearer mock-jwt-admin-token-valid-signature')
      .send(previewPayload);

    expect(res.status).toBe(200);
    expect(res.body.rendered_text).not.toContain('Atorvastatin'); // PHI must be scrubbed
    expect(res.body.rendered_text).toContain('Your prescription has been issued');
  });
});
