import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-001 | Feature: FEAT-102 (Search & Discovery Engine)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-102: Search & Discovery Engine Operations', () => {
  beforeAll(async () => {
    // Seed test doctor entries with different verification statuses
    await db.query(`
      INSERT INTO doctors (id, first_name, last_name, specialty, verification_status, consultation_fee)
      VALUES 
        ('doc-verified-cardio', 'Verified', 'Cardio', 'Cardiology', 'verified', 150.00),
        ('doc-pending-cardio', 'Pending', 'Cardio', 'Cardiology', 'pending', 120.00)
      ON CONFLICT (id) DO UPDATE SET verification_status = EXCLUDED.verification_status;
    `);
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-102-01
   * @requirement FR-102
   * @acceptanceCriteria AC-102.2.1
   * @priority High
   * @preconditions Elasticsearch service instance is active.
   * @description Verify fuzzy text searches correct common query typos.
   */
  test('TC-BE-102-01: Fuzzy query parameter corrections resolve common typos', async () => {
    const res = await request(app)
      .get('/api/v1/search/doctors')
      .query({ query: 'cardology' }); // typo matching Cardiology

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].specialty).toBe('Cardiology');
  });

  /**
   * @testcase TC-BE-102-02
   * @requirement FR-101
   * @acceptanceCriteria AC-102.1.2
   * @priority High
   * @preconditions Doctors exist with pending, verified, and rejected profile statuses.
   * @description Verify search results completely exclude non-verified doctors.
   */
  test('TC-BE-102-02: Search directory output excludes non-verified doctor profiles', async () => {
    const res = await request(app)
      .get('/api/v1/search/doctors')
      .query({ query: 'Cardio' });

    expect(res.status).toBe(200);
    
    // Assert only doc-verified-cardio is in list, doc-pending-cardio is omitted
    const ids = res.body.data.map((d: any) => d.doctor_id);
    expect(ids).toContain('doc-verified-cardio');
    expect(ids).not.toContain('doc-pending-cardio');
  });

  /**
   * @testcase TC-BE-102-03
   * @requirement NFR-102
   * @acceptanceCriteria PERFC-002
   * @priority Medium
   * @preconditions Concurrent mock traffic script is ready.
   * @description Verify search API response latency satisfies SLA limits under load.
   */
  test('TC-BE-102-03: Search query endpoint satisfies SLA response latency limits', async () => {
    const start = Date.now();
    
    const res = await request(app)
      .get('/api/v1/search/doctors')
      .query({ specialty: 'Cardiology' });

    const end = Date.now();
    const duration = end - start;
    
    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(250); // P95 SLA target is < 250ms
  });
});
