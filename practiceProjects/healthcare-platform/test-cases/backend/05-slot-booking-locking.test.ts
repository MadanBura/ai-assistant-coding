import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-002 | Feature: FEAT-201 (Slot Booking & Locking)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-201: Slot Booking & Locking Operations', () => {
  let patientToken: string;

  beforeAll(async () => {
    patientToken = 'mock-jwt-patient-token-valid-signature';
    // Clear locks and slots from mock database
    await db.query("DELETE FROM appointments WHERE doctor_id = 'doc-robert-chen-77'");
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-201-01
   * @requirement FR-103
   * @acceptanceCriteria AC-201.1.1
   * @priority High
   * @preconditions Redis cache server is running.
   * @description Verify POST /api/v1/appointments/lock writes Redis lock key with 10-minute TTL.
   */
  test('TC-BE-201-01: API lock request sets Redis keys with 10-minute TTL', async () => {
    const payload = {
      doctor_id: 'doc-robert-chen-77',
      scheduled_time: '2026-06-05T09:30:00Z'
    };

    const res = await request(app)
      .post('/api/v1/appointments/lock')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.lock_id).toBeDefined();

    // Verify Redis key
    const lockKey = `lock:doctor:${payload.doctor_id}:slot:2026-06-05T09:30:00Z`;
    const exists = await redis.exists(lockKey);
    expect(exists).toBe(1);

    const ttl = await redis.ttl(lockKey);
    expect(ttl).toBeGreaterThan(580);
    expect(ttl).toBeLessThanOrEqual(600);
  });

  /**
   * @testcase TC-BE-201-02
   * @requirement FR-103
   * @acceptanceCriteria AC-201.1.2
   * @priority High
   * @preconditions User A has locked slot X.
   * @description Verify concurrent locking requests on locked slots are blocked.
   */
  test('TC-BE-201-02: Concurrent locking requests trigger HTTP 409 Conflict', async () => {
    const payload = {
      doctor_id: 'doc-robert-chen-77',
      scheduled_time: '2026-06-05T14:00:00Z'
    };

    // User A lock
    const resA = await request(app)
      .post('/api/v1/appointments/lock')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(payload);

    expect(resA.status).toBe(200);

    // User B lock targeting same slot
    const userBToken = 'mock-jwt-patient-B-token-valid';
    const resB = await request(app)
      .post('/api/v1/appointments/lock')
      .set('Authorization', `Bearer ${userBToken}`)
      .send(payload);

    expect(resB.status).toBe(409);
    expect(resB.body.message).toContain('Slot locked by another user');
  });

  /**
   * @testcase TC-BE-201-03
   * @requirement FR-103
   * @acceptanceCriteria AC-201.2.1
   * @priority High
   * @preconditions A slot is locked in Redis. No payment confirm request is sent.
   * @description Verify that after 10 minutes lock is released.
   */
  test('TC-BE-201-03: Lock releases automatically post-expiration and slots become bookable', async () => {
    const payload = {
      doctor_id: 'doc-robert-chen-77',
      scheduled_time: '2026-06-05T16:00:00Z'
    };

    // 1. Lock slot
    await request(app)
      .post('/api/v1/appointments/lock')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(payload);

    const lockKey = `lock:doctor:${payload.doctor_id}:slot:2026-06-05T16:00:00Z`;

    // 2. Mock Redis Expiration by deleting key
    await redis.del(lockKey);

    // 3. Verify it is bookable again by locking it with user B
    const userBToken = 'mock-jwt-patient-B-token-valid';
    const res = await request(app)
      .post('/api/v1/appointments/lock')
      .set('Authorization', `Bearer ${userBToken}`)
      .send(payload);

    expect(res.status).toBe(200);
  });
});
