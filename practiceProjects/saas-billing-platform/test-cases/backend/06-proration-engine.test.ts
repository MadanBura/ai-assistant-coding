/**
 * @file Proration Engine Backend TypeScript Jest Tests
 * @feature FEAT-SUB-03
 */

import request from 'supertest';
import app from '../../src/app';
import { Customer } from '../../src/models';

describe('Proration Engine - Backend [FEAT-SUB-03]', () => {
  
  /**
   * @id TC-BE-SUB-03-01
   * @requirement FR-SUB-03-01, FR-SUB-03-02
   * @acceptance AC-SUB-03-01
   * @priority CRITICAL
   * @type Functional
   */
  test('TC-BE-SUB-03-01: Calculate exact proration credit/debit for mid-cycle plan upgrade', async () => {
    const response = await request(app)
      .post('/v1/subscriptions/sub_active_555/preview')
      .send({
        new_plan_id: 'plan_gold_monthly'
      });

    expect(response.status).toBe(200);
    expect(response.body.credit_amount).toBe(50.00);
    expect(response.body.debit_amount).toBe(150.00);
    expect(response.body.net_due).toBe(100.00);
  });

  /**
   * @id TC-BE-SUB-03-02
   * @requirement FR-SUB-03-04
   * @acceptance AC-SUB-03-02
   * @priority CRITICAL
   * @type Functional / Database
   */
  test('TC-BE-SUB-03-02: Downgrade subscription, generate credit notes, and append to customer credit balance ledger', async () => {
    await Customer.update({ credit_balance: 0.00 }, { where: { id: 'cust_8f9024j94j' } });

    const response = await request(app)
      .post('/v1/subscriptions/sub_active_555/change')
      .send({
        new_plan_id: 'plan_basic_monthly'
      });

    expect(response.status).toBe(200);
    expect(response.body.net_due).toBe(0.00);
    
    const updatedCustomer = await Customer.findByPk('cust_8f9024j94j');
    expect(Number(updatedCustomer.credit_balance)).toBe(35.00);
  });

  /**
   * @id TC-BE-SUB-03-03
   * @requirement VAL-SUB-03-01
   * @priority HIGH
   * @type Validation / Negative
   */
  test('TC-BE-SUB-03-03: Block upgrades between plans with mismatched currencies', async () => {
    const response = await request(app)
      .post('/v1/subscriptions/sub_active_555/change')
      .send({
        new_plan_id: 'plan_gold_eur'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('CURRENCY_MISMATCH');
  });
});
