import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-001 | Feature: FEAT-103 (Dynamic Calendar Availability Builder)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-103: Dynamic Calendar Availability Operations', () => {
  let doctorToken: string;

  beforeAll(async () => {
    doctorToken = 'mock-jwt-doctor-token-valid-signature';
    await db.query("DELETE FROM doctor_exclusions WHERE doctor_id = 'doc-robert-chen-77'");
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-103-01
   * @requirement FR-103
   * @acceptanceCriteria AC-103.1.2
   * @priority High
   * @preconditions Doctor session token is set.
   * @description Verify saving overlapping intervals triggers validation failure.
   */
  test('TC-BE-103-01: Overlapping intervals templates trigger API validation errors', async () => {
    const overlappingPayload = {
      slot_duration_minutes: 30,
      weekly_hours: [
        {
          day_of_week: 1, // Monday
          is_active: true,
          intervals: [
            { start: '09:00', end: '12:00' },
            { start: '11:30', end: '15:00' } // overlapping
          ]
        }
      ]
    };

    const res = await request(app)
      .put('/api/v1/doctors/doc-robert-chen-77/availability/settings')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(overlappingPayload);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Intervals cannot overlap');
  });

  /**
   * @testcase TC-BE-103-02
   * @requirement FR-103
   * @acceptanceCriteria AC-103.1.3
   * @priority High
   * @preconditions Weekly templates and exclusions are written in DB.
   * @description Verify GET /api/v1/doctors/:id/availability compiles free slots accurately, subtracting active exclusions.
   */
  test('TC-BE-103-02: Scheduler builder drops slots covered by active exclusions templates', async () => {
    // 1. Seed Weekly Template (Monday 09:00-12:00)
    await db.query(`
      UPDATE doctors 
      SET availability_settings = '{"slot_duration_minutes": 60, "weekly_hours": [{"day_of_week": 1, "is_active": true, "intervals": [{"start": "09:00", "end": "12:00"}]}]}'
      WHERE id = 'doc-robert-chen-77'
    `);

    // 2. Seed All-Day Exclusion for target Monday date (July 6, 2026)
    await db.query(`
      INSERT INTO doctor_exclusions (id, doctor_id, exclusion_date, all_day, reason)
      VALUES ('excl-9912', 'doc-robert-chen-77', '2026-07-06', true, 'Vacation Day')
    `);

    // 3. Query slots compiler endpoint for that date range
    const res = await request(app)
      .get('/api/v1/doctors/doc-robert-chen-77/availability/slots')
      .query({ start_date: '2026-07-06', end_date: '2026-07-06' });

    expect(res.status).toBe(200);
    expect(res.body.slots.length).toBe(0); // Zero slots on July 6 (Excluded)
  });

  /**
   * @testcase TC-BE-103-03
   * @requirement FR-103
   * @acceptanceCriteria AC-103.1.1
   * @priority Medium
   * @preconditions Doctor operates in local timezone America/New_York.
   * @description Verify timezone compiler converts settings intervals to UTC database keys safely.
   */
  test('TC-BE-103-03: Calendar compilers parse localized inputs into UTC settings keys', async () => {
    const payload = {
      slot_duration_minutes: 30,
      weekly_hours: [
        {
          day_of_week: 1,
          is_active: true,
          intervals: [
            { start: '09:00', end: '12:00' }
          ]
        }
      ],
      timezone: 'America/New_York' // Summer offset: UTC-4
    };

    const res = await request(app)
      .put('/api/v1/doctors/doc-robert-chen-77/availability/settings')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(payload);

    expect(res.status).toBe(200);

    const dbRes = await db.query('SELECT availability_settings FROM doctors WHERE id = $1', ['doc-robert-chen-77']);
    const settings = dbRes.rows[0].availability_settings;
    expect(settings.weekly_hours[0].intervals[0].start_utc).toBeDefined();
  });
});
