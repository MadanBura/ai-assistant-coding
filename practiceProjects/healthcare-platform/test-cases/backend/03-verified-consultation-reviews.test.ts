import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-006 | Feature: FEAT-602 (Verified Consultation Review System)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-602: Verified Consultation Review System Operations', () => {
  let patientToken: string;

  beforeAll(async () => {
    patientToken = 'mock-jwt-patient-token-valid-signature';
    
    await db.query("DELETE FROM doctor_reviews WHERE appointment_id = 'appt-449102'");
    await db.query(`
      INSERT INTO appointments (id, patient_id, doctor_id, scheduled_time, duration_minutes, status)
      VALUES ('appt-449102', 'pat-120938', 'doc-robert-chen-77', '2026-06-05T09:30:00Z', 45, 'completed')
      ON CONFLICT (id) DO UPDATE SET status = 'completed'
    `);
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-602-01
   * @requirement FR-602
   * @acceptanceCriteria AC-602.1.1
   * @priority High
   * @preconditions Appointment status is not completed.
   * @description Verify reviews require completed status.
   */
  test('TC-BE-602-01: Review submittals are blocked on uncompleted appointment records', async () => {
    // Seed uncompleted appointment
    await db.query(`
      INSERT INTO appointments (id, patient_id, doctor_id, scheduled_time, duration_minutes, status)
      VALUES ('appt-uncompleted-99', 'pat-120938', 'doc-robert-chen-77', '2026-06-05T10:00:00Z', 45, 'confirmed')
      ON CONFLICT (id) DO UPDATE SET status = 'confirmed'
    `);

    const payload = {
      appointment_id: 'appt-uncompleted-99',
      rating: 5,
      comment: 'Excellent doctor consultation.'
    };

    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Cannot review non-completed appointment');
  });

  /**
   * @testcase TC-BE-602-02
   * @requirement FR-602
   * @acceptanceCriteria SECC-003
   * @priority High
   * @preconditions Filter tools active.
   * @description Verify automated review text checks scrub private details.
   */
  test('TC-BE-602-02: Privacy filters catch HIPAA leaks and flag reviews for moderation', async () => {
    const payload = {
      appointment_id: 'appt-449102',
      rating: 4,
      comment: 'Contact email is robert.chen@gmail.com and phone is 617-555-0192.' // contains PHI leaks
    };

    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending_moderation'); // Flagged for review

    // Assert status is pending_moderation in database
    const rx = await db.query('SELECT status FROM doctor_reviews WHERE appointment_id = $1', [payload.appointment_id]);
    expect(rx.rows[0].status).toBe('pending_moderation');
  });

  /**
   * @testcase TC-BE-602-03
   * @requirement FR-602
   * @acceptanceCriteria AC-602.2.1
   * @priority High
   * @preconditions Doctor has existing review ratings database values.
   * @description Verify submitting new reviews recalculates rating averages.
   */
  test('TC-BE-602-03: Submitting reviews recalculates doctor average ratings metrics', async () => {
    // Clean old reviews for clean arithmetic testing
    await db.query("DELETE FROM doctor_reviews WHERE doctor_id = 'doc-robert-chen-77'");
    await db.query("UPDATE doctors SET rating_average = 0, review_count = 0 WHERE id = 'doc-robert-chen-77'");

    // Seed Completed Appointments
    await db.query(`
      INSERT INTO appointments (id, patient_id, doctor_id, scheduled_time, duration_minutes, status)
      VALUES 
        ('appt-review-1', 'pat-120938', 'doc-robert-chen-77', NOW(), 45, 'completed'),
        ('appt-review-2', 'pat-120938', 'doc-robert-chen-77', NOW(), 45, 'completed')
      ON CONFLICT (id) DO NOTHING
    `);

    // Submit first review (rating 4)
    await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ appointment_id: 'appt-review-1', rating: 4, comment: 'Very professional clinic.' });

    // Submit second review (rating 5)
    await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ appointment_id: 'appt-review-2', rating: 5, comment: 'Thorough evaluation check.' });

    // Verify rating average in DB is 4.5
    const docRes = await db.query('SELECT rating_average, review_count FROM doctors WHERE id = $1', ['doc-robert-chen-77']);
    expect(Number(docRes.rows[0].rating_average)).toBe(4.5);
    expect(Number(docRes.rows[0].review_count)).toBe(2);
  });
});
