import { test, expect } from '@playwright/test';

/**
 * FEATURE: Agent Profile & Branding (FEAT-102)
 * COVERAGE: Functional, UI, Validation, Edge Cases
 */

test.describe('FEAT-102: Agent Profile & Branding - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Pre-condition: Login as Agent
    await page.goto('/login');
    await page.getByLabel('Email').fill('marcus.agent@example.com');
    await page.getByLabel('Password').fill('SecureAgent123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');
  });

  /**
   * TC-FE-102-01 (Functional & UI)
   * Requirement Mapping: FR-102-1
   * Acceptance Criteria Mapping: AC-102-1
   * Priority: High
   */
  test('TC-FE-102-01: Agent edits bio, agency logo and saves changes', async ({ page }) => {
    await page.goto('/dashboard/settings');

    // Fill settings inputs
    await page.getByLabel('Bio').fill('Marcus Vance is a premier real estate specialist operating in downtown Seattle...');
    await page.getByLabel('Agency Name').fill('Vance & Associates');
    await page.getByLabel('LinkedIn Profile').fill('https://linkedin.com/in/marcus-vance');

    // Upload logo image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.logo-upload-zone').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('test-cases/mocks/logo.png');

    // Submit changes
    await page.locator('button:has-text("Save Settings")').click();
    await expect(page.locator('.success-toast')).toHaveText('Profile updated successfully');

    // Navigate to public page and verify content displays
    await page.goto('/agents/marcus-vance');
    await expect(page.locator('.agent-bio')).toContainText('Marcus Vance is a premier');
    await expect(page.locator('.agency-logo')).toBeVisible();
    await expect(page.locator('.social-links a[href*="linkedin.com/in/marcus-vance"]')).toBeVisible();
  });

  /**
   * TC-FE-102-02 (Edge Case & UI)
   * Requirement Mapping: US-102-1
   * Acceptance Criteria Mapping: AC-102-2
   * Priority: High
   */
  test('TC-FE-102-02: Suspended Agent profile details page displays 404 block', async ({ page }) => {
    // Navigate to known suspended agent profile URL
    await page.goto('/agents/suspended-agent-id');

    // Expected Result: Profile unavailable message and hidden contact channels
    await expect(page.locator('h1')).toHaveText('Profile Unavailable');
    await expect(page.locator('.agent-contact-form')).not.toBeVisible();
  });
});
