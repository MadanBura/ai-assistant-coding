import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-002 | Feature: FEAT-201 (Slot Booking & Locking)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-201-01
 * @requirement FR-103
 * @acceptanceCriteria AC-201.2.1
 * @priority High
 * @preconditions Patient is on doctor calendar slot selection grid.
 * @description Verify selecting a slot locks it and starts the checkout countdown timer.
 */
test('TC-FE-201-01: Verify slot selection redirects to checkout and starts countdown timer', async ({ page }) => {
  await page.goto('/doctors/doc-robert-chen-77');
  
  // Click open slot element
  await page.click('[data-testid="slot-card-2026-06-05T09-30-00Z"]');
  
  // Verify redirect to checkout screen
  await expect(page).toHaveURL(/\/checkout/);
  
  // Assert countdown timer contains '10:00' and starts ticking
  const timer = page.locator('[data-testid="checkout-countdown-timer"]');
  await expect(timer).toBeVisible();
  await expect(timer).toContainText('10:00');
  
  // Wait for dynamic tick
  await page.waitForTimeout(1100);
  await expect(timer).toHaveText(/09:\d{2}/);
});

/**
 * @testcase TC-FE-201-02
 * @requirement FR-202
 * @acceptanceCriteria AC-201.1.2
 * @priority Medium
 * @preconditions Patient has existing appointment scheduled for June 5, 10:00.
 * @description Verify UI blocks booking overlapping slots.
 */
test('TC-FE-201-02: Verify booking overlap dialog blocks checkout operations', async ({ page }) => {
  // Login as user with existing booking
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'sarah.connor@gmail.com');
  await page.fill('[data-testid="password-input"]', 'Password123!');
  await page.click('[data-testid="login-btn"]');
  
  // Navigate to another doctor profile
  await page.goto('/doctors/doc-alternative-99');
  
  // Click slot that overlaps with the existing appointment
  await page.click('[data-testid="slot-card-2026-06-05T10-30-00Z"]');
  
  // Assert booking conflict modal warnings block flow
  const warningModal = page.locator('[data-testid="overlap-warning-modal"]');
  await expect(warningModal).toBeVisible();
  await expect(warningModal.locator('[data-testid="modal-error-message"]')).toContainText('Scheduling conflict detected');
  await expect(page.locator('[data-testid="proceed-to-checkout-btn"]')).toBeDisabled();
});
