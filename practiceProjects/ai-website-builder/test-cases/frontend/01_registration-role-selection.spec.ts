import { test, expect } from '@playwright/test';

/**
 * FEATURE: Registration and Role Selection (FEAT-101)
 * COVERAGE: Functional, UI, Validation, Negative, Security, Accessibility
 */

test.describe('FEAT-101: Registration and Role Selection - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Precondition: Navigate to the registration page and clear session
    await page.goto('/register');
    await page.evaluate(() => localStorage.clear());
  });

  /**
   * TC-FE-101-01 (Functional & UI)
   * Requirement Mapping: FR-101-1, BR-001
   * Acceptance Criteria Mapping: AC-101-1
   * Priority: High
   */
  test('TC-FE-101-01: Successful Buyer Registration with Email Verification Flow', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Sarah Jenkins');
    await page.getByLabel('Email').fill('sarah.j.test@example.com');
    await page.getByLabel('Password').fill('ComplexPass123!');
    await page.getByLabel('Phone').fill('+12065550192');
    
    // Select Buyer Role card UI
    const buyerCard = page.locator('data-testid=role-buyer');
    await buyerCard.click();
    await expect(buyerCard).toHaveClass(/active/);

    // Verify Agent License Number input is hidden
    await expect(page.getByLabel('Agent License Number')).not.toBeVisible();

    // Click submit
    await page.locator('button[type="submit"]').click();

    // Expected Result: Redirected to Verification Screen with inline token inputs
    await expect(page).toHaveURL(/\/verify-token/);
    await expect(page.locator('text=Verification code sent')).toBeVisible();
    await expect(page.locator('data-testid=token-input-0')).toBeFocused();
  });

  /**
   * TC-FE-101-02 (Validation & Negative)
   * Requirement Mapping: FR-101-1
   * Acceptance Criteria Mapping: AC-101-2
   * Priority: High
   */
  test('TC-FE-101-02: Registration Fails due to Weak Password', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Sarah Jenkins');
    await page.getByLabel('Email').fill('sarah.j.test@example.com');
    
    // Type weak password
    const passwordInput = page.getByLabel('Password');
    await passwordInput.fill('12345');
    await page.getByLabel('Phone').fill('+12065550192');
    await page.locator('data-testid=role-buyer').click();

    // Expect password strength indicator to show "Weak"
    const strengthIndicator = page.locator('.password-strength-indicator');
    await expect(strengthIndicator).toHaveText('Weak');

    // Click submit
    await page.locator('button[type="submit"]').click();

    // Expected Result: Blocked on page, inline error displays validation constraints
    await expect(page).toHaveURL('/register');
    const errorText = page.locator('.error-message-password');
    await expect(errorText).toContainText('Password must contain at least 8 characters');
  });

  /**
   * TC-FE-101-03 (Validation & UI)
   * Requirement Mapping: FR-101-1, BRL-002
   * Acceptance Criteria Mapping: AC-101-3
   * Priority: Medium
   */
  test('TC-FE-101-03: Agent Registration displays and validates License Number Input', async ({ page }) => {
    // Select Agent role
    const agentCard = page.locator('data-testid=role-agent');
    await agentCard.click();

    // Expected Result: Agent License Number is now visible and mandatory
    const licenseInput = page.getByLabel('Agent License Number');
    await expect(licenseInput).toBeVisible();

    // Attempt submit with empty license
    await page.getByLabel('Full Name').fill('Marcus Vance');
    await page.getByLabel('Email').fill('marcus.v.test@example.com');
    await page.getByLabel('Password').fill('ComplexPass123!');
    await page.getByLabel('Phone').fill('+12065550193');
    await page.locator('button[type="submit"]').click();

    // Verification check: Error displays on license input
    await expect(page.locator('.error-message-license')).toHaveText('License number is required for agents');
  });

  /**
   * TC-FE-101-04 (Accessibility)
   * Requirement Mapping: NFR-005
   * Priority: Medium
   */
  test('TC-FE-101-04: Onboarding Form accessibility standards compliance', async ({ page }) => {
    // Inputs must have corresponding labels and ARIA attributes
    await expect(page.getByLabel('Full Name')).toHaveAttribute('aria-required', 'true');
    await expect(page.getByLabel('Email')).toHaveAttribute('type', 'email');
    
    // Tab navigation focus order checks
    await page.focus('input[name="fullName"]');
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="email"]')).toBeFocused();
  });

  /**
   * TC-FE-101-05 (Edge Case & Session)
   * Requirement Mapping: FR-102
   * Priority: Medium
   */
  test('TC-FE-101-05: Verification Code Countdown and Resend interaction', async ({ page }) => {
    // Pre-condition: Navigate to active token entry page
    await page.goto('/verify-token?refId=verification_uuid_102938');

    // Confirm resend link is disabled during countdown
    const resendBtn = page.locator('button:has-text("Resend Code")');
    await expect(resendBtn).toBeDisabled();

    // Simulate timer expiration by overriding countdown values
    await page.evaluate(() => {
      (window as any).setCountdown(0);
    });

    // Expected: Resend button is now clickable
    await expect(resendBtn).toBeEnabled();
  });
});
