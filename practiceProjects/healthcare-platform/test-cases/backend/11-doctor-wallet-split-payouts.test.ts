import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import redis from '../../src/redis';

/**
 * Epic: EPC-005 | Feature: FEAT-502 (Doctor Wallet & Split Payouts)
 * Enforced Backend API & DB Logic Spec
 */

describe('FEAT-502: Doctor Wallet & Split Payouts', () => {
  let doctorToken: string;

  beforeAll(async () => {
    doctorToken = 'mock-jwt-doctor-token-valid-signature';
    await db.query("DELETE FROM payout_history WHERE wallet_id = 'wallet_chen'");
    await db.query(`
      INSERT INTO doctor_wallets (id, doctor_id, stripe_connect_account_id, available_balance, pending_balance, payout_status)
      VALUES ('wallet_chen', 'doc-robert-chen-77', 'acct_1N2938JFDSO', 1000.00, 300.00, 'active')
      ON CONFLICT (id) DO UPDATE SET available_balance = 1000.00
    `);
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  /**
   * @testcase TC-BE-502-01
   * @requirement FR-502
   * @acceptanceCriteria AC-502.2.1
   * @priority High
   * @preconditions Automated payouts scheduling engine is active.
   * @description Verify payout tasks calculate split sums and route payouts on intervals.
   */
  test('TC-BE-502-01: Automated payout scheduler correctly transfers available sums to Stripe bank accounts', async () => {
    // Manually trigger internal payout worker logic
    const res = await request(app)
      .post('/api/v1/admin/payouts/trigger-batch')
      .set('Authorization', 'Bearer mock-jwt-admin-token-valid-signature')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.processed_payouts_count).toBeGreaterThan(0);

    // Verify wallet Available Balance was cleared to 0
    const wallet = await db.query("SELECT available_balance FROM doctor_wallets WHERE id = 'wallet_chen'");
    expect(Number(wallet.rows[0].available_balance)).toBe(0.00);

    // Verify record written to payout history
    const payout = await db.query("SELECT amount_payout, status FROM payout_history WHERE wallet_id = 'wallet_chen'");
    expect(Number(payout.rows[0].amount_payout)).toBe(1000.00);
  });

  /**
   * @testcase TC-BE-502-02
   * @requirement FR-502
   * @acceptanceCriteria AC-502.2.1
   * @priority Medium
   * @preconditions Doctor available wallet balance is under limit ($45 USD).
   * @description Verify payout scheduler skips wallets containing less than $50 minimum.
   */
  test('TC-BE-502-02: Payout schedules skip wallet balances falling under the $50 limit minimum', async () => {
    // Set wallet to $45 available balance
    await db.query("UPDATE doctor_wallets SET available_balance = 45.00 WHERE id = 'wallet_chen'");

    const res = await request(app)
      .post('/api/v1/admin/payouts/trigger-batch')
      .set('Authorization', 'Bearer mock-jwt-admin-token-valid-signature')
      .send({});

    expect(res.status).toBe(200);

    // Verify wallet balance remains unchanged (payout skipped)
    const wallet = await db.query("SELECT available_balance FROM doctor_wallets WHERE id = 'wallet_chen'");
    expect(Number(wallet.rows[0].available_balance)).toBe(45.00);
  });
});
