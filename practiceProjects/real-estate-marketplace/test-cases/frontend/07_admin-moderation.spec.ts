import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-6.1 (Admin Moderation Console)
 * MAPPED REQUIREMENTS: FR-601
 * ACCEPTANCE CRITERIA: AC-601, AC-602
 */

test.describe('FT-6.1: Admin Moderation Console E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Log in as Admin
    await page.goto('/auth/login');
    await page.fill('[data-testid="login-email"]', 'admin@propconnect.com');
    await page.fill('[data-testid="login-password"]', 'AdminSecure123!');
    await page.click('[data-testid="login-submit-btn"]');
    await page.waitForURL('/admin/dashboard');
  });

  /**
   * TC ID: TC-FE-701
   * Type: Functional / UI
   * Preconditions: Listings queue contains items awaiting resolution
   * Priority: Critical
   */
  test('TC-FE-701: Admin approves a pending listing and updates search status', async ({ page }) => {
    await page.goto('/admin/moderation/listings');

    // Locate first pending item card
    const firstListingRow = page.locator('[data-testid="pending-listing-row-0"]');
    await expect(firstListingRow).toBeVisible();
    await expect(firstListingRow.locator('[data-testid="status-indicator"]')).toHaveText('Pending Approval');

    // Click quick details view
    await firstListingRow.locator('[data-testid="preview-deed-btn"]').click();
    await expect(page.locator('[data-testid="deed-preview-modal"]')).toBeVisible();

    // Click Approve
    await page.click('[data-testid="approve-listing-btn"]');
    
    // Assert row removed from pending queues list
    await expect(firstListingRow).not.toBeAttached();
    await expect(page.locator('[data-testid="moderation-success-toast"]')).toBeVisible();
  });

  /**
   * TC ID: TC-FE-702
   * Type: Validation / Negative
   * Preconditions: Admin rejects listing without note input details
   * Priority: High
   */
  test('TC-FE-702: Rejecting a listing without notes details triggers input highlight validation error', async ({ page }) => {
    await page.goto('/admin/moderation/listings');
    await page.click('[data-testid="pending-listing-row-0"] [data-testid="reject-listing-trigger"]');

    // Reject Modal pops up
    const rejectModal = page.locator('[data-testid="reject-justification-modal"]');
    await expect(rejectModal).toBeVisible();

    // Try submit empty notes fields
    await page.click('[data-testid="submit-rejection-btn"]');

    // Verify system warning states
    await expect(page.locator('[data-testid="reject-notes-error"]')).toContainText('Rejection justification notes must contain at least 10 characters');
  });

});
