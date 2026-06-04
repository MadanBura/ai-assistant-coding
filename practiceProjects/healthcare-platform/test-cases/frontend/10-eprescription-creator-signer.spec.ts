import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-004 | Feature: FEAT-402 (E-Prescription Creator & Signer)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-402-01
 * @requirement FR-402
 * @acceptanceCriteria AC-402.1.1
 * @priority High
 * @preconditions Doctor is in active consultation call.
 * @description Verify doctor can add multiple medication lines in prescription builder.
 */
test('TC-FE-402-01: Verify doctor can compose diagnosis and medication entries', async ({ page }) => {
  await page.goto('/rooms/ch_con_309182?role=doctor');
  
  // Open composer drawer
  await page.click('[data-testid="write-prescription-btn"]');
  const drawer = page.locator('[data-testid="prescription-drawer"]');
  await expect(drawer).toBeVisible();

  // Enter Diagnosis details
  await page.fill('[data-testid="rx-diagnosis-input"]', 'Stage 2 Hypertension');

  // Input first medication
  await page.fill('[data-testid="med-name-input-0"]', 'Lisinopril');
  await page.fill('[data-testid="med-dosage-input-0"]', '10mg');
  await page.fill('[data-testid="med-duration-input-0"]', '90');

  // Click Add row and enter second item
  await page.click('[data-testid="add-medication-row-btn"]');
  await page.fill('[data-testid="med-name-input-1"]', 'Atorvastatin');
  await page.fill('[data-testid="med-dosage-input-1"]', '20mg');
  await page.fill('[data-testid="med-duration-input-1"]', '30');

  // Verify elements are visible
  await expect(page.locator('[data-testid="med-name-input-1"]')).toHaveValue('Atorvastatin');
});

/**
 * @testcase TC-FE-402-02
 * @requirement FR-402
 * @acceptanceCriteria AC-402.2.1
 * @priority High
 * @preconditions Doctor has written a draft prescription.
 * @description Verify doctor can submit MFA validation code to sign prescription.
 */
test('TC-FE-402-02: Verify MFA signature code modal processes e-signing transitions', async ({ page }) => {
  await page.goto('/rooms/ch_con_309182?role=doctor&state=draft-rx');
  
  // Click sign button
  await page.click('[data-testid="sign-prescription-btn"]');
  
  // Verify verification code popup displays
  const otpModal = page.locator('[data-testid="mfa-verification-modal"]');
  await expect(otpModal).toBeVisible();
  
  // Fill invalid token code check
  await page.fill('[data-testid="mfa-token-input"]', '000000');
  await page.click('[data-testid="confirm-sign-btn"]');
  const errorMsg = page.locator('[data-testid="mfa-token-error-message"]');
  await expect(errorMsg).toBeVisible();
  await expect(errorMsg).toContainText('Invalid verification code');

  // Fill valid mock token code
  await page.fill('[data-testid="mfa-token-input"]', '887321');
  await page.click('[data-testid="confirm-sign-btn"]');
  
  // Verify success layout renders signed badges
  await expect(otpModal).not.toBeVisible();
  await expect(page.locator('[data-testid="rx-signed-stamp-badge"]')).toBeVisible();
});
