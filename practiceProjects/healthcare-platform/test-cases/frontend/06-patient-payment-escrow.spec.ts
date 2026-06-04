import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-005 | Feature: FEAT-501 (Patient Payment Escrow)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-501-01
 * @requirement FR-501
 * @acceptanceCriteria AC-201.1.2
 * @priority High
 * @preconditions Stripe mock provider configurations active.
 * @description Verify Stripe checkout inputs load elements and handle card validation warnings.
 */
test('TC-FE-501-01: Verify Stripe card input renders and handles validation messages', async ({ page }) => {
  await page.goto('/checkout?appointment_id=appt-449102');
  
  // Assert Stripe container renders
  const cardFrame = page.locator('#stripe-card-element iframe').first();
  await expect(cardFrame).toBeVisible();

  // Focus and type invalid details into input iframe
  const cardInput = page.frameLocator('#stripe-card-element iframe').locator('input[name="cardnumber"]');
  await cardInput.fill('4242 4242'); // partial invalid card
  
  // Focus away
  await page.click('[data-testid="billing-name-input"]');
  
  // Assert warning message
  const stripeError = page.locator('[data-testid="stripe-input-error-label"]');
  await expect(stripeError).toBeVisible();
  await expect(stripeError).toHaveText('Your card number is incomplete.');
});

/**
 * @testcase TC-FE-501-02
 * @requirement BR-004
 * @acceptanceCriteria UIC-004
 * @priority Medium
 * @preconditions User is on payment details input screen.
 * @description Verify escrow security info badge is visible.
 */
test('TC-FE-501-02: Verify checkout page displays escrow information badge', async ({ page }) => {
  await page.goto('/checkout?appointment_id=appt-449102');
  
  // Locate escrow info badge
  const escrowBadge = page.locator('[data-testid="escrow-security-info-badge"]');
  await expect(escrowBadge).toBeVisible();
  await expect(escrowBadge).toContainText('Your payment is secured and held in escrow until consultation completion.');
});
