import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-1.2 (Agent Verification System)
 * MAPPED REQUIREMENTS: FR-102
 * ACCEPTANCE CRITERIA: AC-103, AC-104
 */

test.describe('FT-1.2: Agent Verification System E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Log in as Unverified Agent
    await page.goto('/auth/login');
    await page.fill('[data-testid="login-email"]', 'unverified_agent@example.com');
    await page.fill('[data-testid="login-password"]', 'Password123!');
    await page.click('[data-testid="login-submit-btn"]');
    await page.waitForURL('/dashboard');
  });

  /**
   * TC ID: TC-FE-601
   * Type: Validation / UI
   * Preconditions: Unverified agent navigating to credentials upload section
   * Priority: High
   */
  test('TC-FE-601: Submit credentials with file size exceeding 5MB must trigger error visual alerts', async ({ page }) => {
    await page.goto('/dashboard/verification');

    await page.fill('[data-testid="verification-license-id"]', 'RE-9921-X');
    await page.fill('[data-testid="verification-state"]', 'NY');
    await page.fill('[data-testid="verification-brokerage"]', 'Sotheby Properties');

    // Create a mock large document buffer exceeding 5MB
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB file
    await page.setInputFiles('[data-testid="verification-doc-input"]', {
      name: 'large_credential_scan.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });

    // Assert submit button is disabled and warning shows
    const warningLabel = page.locator('[data-testid="file-upload-error-msg"]');
    await expect(warningLabel).toBeVisible();
    await expect(warningLabel).toContainText('Filesize exceeds maximum limit of 5MB');
    await expect(page.locator('[data-testid="verification-submit-btn"]')).toBeDisabled();
  });

  /**
   * TC ID: TC-FE-602
   * Type: Functional / Boundary Check
   * Preconditions: Agent account status is set to PENDING_VERIFICATION
   * Priority: High
   */
  test('TC-FE-602: Verify interface blocks credentials fields modification while status is PENDING_VERIFICATION', async ({ page }) => {
    // Mock user database update to PENDING_VERIFICATION
    await page.goto('/dashboard/verification');

    // Assert status display banner is visible
    const statusBadge = page.locator('[data-testid="verification-status-badge"]');
    await expect(statusBadge).toHaveText('Pending Verification');

    // Confirm form inputs are read-only
    await expect(page.locator('[data-testid="verification-license-id"]')).toBeDisabled();
    await expect(page.locator('[data-testid="verification-submit-btn"]')).not.toBeVisible();
  });

});
