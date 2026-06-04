/**
 * @file Usage Ingestion API Backend TypeScript Jest Tests
 * @feature FEAT-MTR-01
 */

import request from 'supertest';
import app from '../../src/app';
import redis from '../../src/lib/redis';

describe('Usage Ingestion API - Backend [FEAT-MTR-01]', () => {
  
  beforeEach(async () => {
    await redis.flushall();
  });

  /**
   * @id TC-BE-MTR-01-01
   * @requirement FR-MTR-01-01, FR-MTR-01-02
   * @acceptance AC-MTR-01-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-MTR-01-01: Ingest valid usage log event payload', async () => {
    const response = await request(app)
      .post('/v1/usage')
      .set('Authorization', 'Bearer sk_live_admin123')
      .set('Idempotency-Key', 'idemp_key_unique_100')
      .send({
        subscription_id: 'sub_92k02kasj8',
        usage_metric: 'api_calls',
        quantity: 25,
        timestamp: Math.floor(Date.now() / 1000)
      });

    expect(response.status).toBe(202);
    expect(response.body.status).toBe('accepted');
  });

  /**
   * @id TC-BE-MTR-01-02
   * @requirement FR-MTR-01-03
   * @acceptance AC-MTR-01-02
   * @priority CRITICAL
   * @type Idempotency
   */
  test('TC-BE-MTR-01-02: Enforce idempotency on duplicate submissions', async () => {
    const payload = {
      subscription_id: 'sub_92k02kasj8',
      usage_metric: 'api_calls',
      quantity: 10,
      timestamp: Math.floor(Date.now() / 1000)
    };

    await request(app)
      .post('/v1/usage')
      .set('Authorization', 'Bearer sk_live_admin123')
      .set('Idempotency-Key', 'idemp_key_unique_100')
      .send(payload);

    const response = await request(app)
      .post('/v1/usage')
      .set('Authorization', 'Bearer sk_live_admin123')
      .set('Idempotency-Key', 'idemp_key_unique_100')
      .send(payload);

    expect(response.status).toBe(202);
    const queueSize = await redis.llen('usage_ingest_queue');
    expect(queueSize).toBe(1);
  });

  /**
   * @id TC-BE-MTR-01-03
   * @requirement VAL-MTR-01-01
   * @priority HIGH
   * @type Validation / Negative
   */
  test('TC-BE-MTR-01-03: Reject negative quantity variables', async () => {
    const response = await request(app)
      .post('/v1/usage')
      .set('Authorization', 'Bearer sk_live_admin123')
      .set('Idempotency-Key', 'idemp_key_unique_101')
      .send({
        subscription_id: 'sub_92k02kasj8',
        usage_metric: 'api_calls',
        quantity: -5,
        timestamp: Math.floor(Date.now() / 1000)
      });

    expect(response.status).toBe(400);
  });
});
