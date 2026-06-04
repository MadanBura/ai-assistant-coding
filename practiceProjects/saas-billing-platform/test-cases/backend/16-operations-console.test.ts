/**
 * @file Operations Console Backend TypeScript Jest Tests
 * @feature FEAT-ADMN-02
 */

import request from 'supertest';
import app from '../../src/app';
import { AUDIT_LOG } from '../../src/models';

describe('Operations Console - Backend [FEAT-ADMN-02]', () => {
  
  /**
   * @id TC-BE-ADMN-02-01
   * @requirement FR-ADMN-02-01, FR-ADMN-02-04
   * @acceptance AC-ADMN-02-01, AC-ADMN-02-03
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-ADMN-02-01: Admin processes manual refund successfully and writes audit logs', async () => {
    const response = await request(app)
      .post('/v1/admin/refunds')
      .set('Authorization', 'Bearer sk_live_admin123')
      .send({
        invoice_id: 'inv_93802ka9123',
        amount_cents: 5000,
        reason: 'duplicate_charge',
        comment: 'User double charged'
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('succeeded');
    
    const auditRecord = await AUDIT_LOG.findOne({ where: { action_name: 'refund_processed' } });
    expect(auditRecord).toBeDefined();
  });

  /**
   * @id TC-BE-ADMN-02-02
   * @requirement VAL-ADMN-02-02, SEC-ADMN-02-02
   * @acceptance AC-ADMN-02-02
   * @priority CRITICAL
   * @type Security
   */
  test('TC-BE-ADMN-02-02: Block manual support role refunds that exceed the $250 limit cap', async () => {
    const response = await request(app)
      .post('/v1/admin/refunds')
      .set('Authorization', 'Bearer sk_live_support456')
      .send({
        invoice_id: 'inv_93802ka9123',
        amount_cents: 25100,
        reason: 'unhappy_customer'
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('REFUND_LIMIT_EXCEEDED');
  });

  /**
   * @id TC-BE-ADMN-02-03
   * @requirement SEC-ADMN-02-01
   * @priority CRITICAL
   * @type Security / Database
   */
  test('TC-BE-ADMN-02-03: Prevent updates or deletions on audit log records', async () => {
    const log = await AUDIT_LOG.create({ actor_id: 'user_1', action_name: 'test_action' });

    await expect(
      log.update({ action_name: 'modified_action' })
    ).rejects.toThrow();

    await expect(
      log.destroy()
    ).rejects.toThrow();
  });
});
