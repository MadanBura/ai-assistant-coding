import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-005 | Feature: FEAT-502 (Doctor Wallet & Split Payouts)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-502-01
 * @requirement FR-502
 * @acceptanceCriteria AC-502.2.1
 * @priority High
 * @preconditions Doctor is logged in and navigates to wallet.
 * @description Verify wallet page displays available vs pending balances and transaction tables.
 */
test('TC-FE-502-01: Verify wallet panel displays pending and available balances', async ({ page }) => {
  await page.goto('/doctor/wallet');
  
  // Assert balances metrics
  const availableBal = page.locator('[data-testid="wallet-available-balance"]');
  await expect(availableBal).toBeVisible();
  await expect(availableBal).toContainText('$1,275.00');

  const pendingBal = page.locator('[data-testid="wallet-pending-balance"]');
  await expect(pendingBal).toBeVisible();
  await expect(pendingBal).toContainText('$300.00');

  // Verify list loads payouts history
  const historyGrid = page.locator('[data-testid="payouts-history-table"]');
  await expect(historyGrid).toBeVisible();
  await expect(historyGrid.locator('tbody tr').first()).toContainText('Available');
});

/**
 * @testcase TC-FE-502-02
 * @requirement FR-502
 * @acceptanceCriteria AC-502.1.1
 * @priority High
 * @preconditions Doctor has not linked a bank account.
 * @description Verify linking bank account button triggers Stripe Connect redirects.
 */
test('TC-FE-502-02: Verify link account button redirects to Stripe onboarding URL flow', async ({ page }) => {
  await page.goto('/doctor/wallet?state=no-bank');
  
  const setupBtn = page.locator('[data-testid="stripe-onboard-link"]');
  await expect(setupBtn).toBeVisible();
  await setupBtn.click();
  
  // Verify redirecting URL contains stripe portal domains
  await expect(page).toHaveURL(/connect.stripe.com/);
});
