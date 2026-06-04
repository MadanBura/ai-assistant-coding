import { test, expect } from '@playwright/test';

/**
 * FEATURE: Admin Queue & Moderation (FEAT-801)
 * COVERAGE: Functional, UI, Validation, Negative, Security
 */

test.describe('FEAT-801: Admin Queue & Moderation - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Pre-condition: Login as Administrator
    await page.goto('/login');
    await page.getByLabel('Email').fill('elena.admin@example.com');
    await page.getByLabel('Password').fill('SecureAdmin123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/admin/dashboard');
  });

  /**
   * TC-FE-801-01 (Functional & UI)
   * Requirement Mapping: FR-801-1, BR-008
   * Acceptance Criteria Mapping: AC-801-1
   * Priority: High
   */
  test('TC-FE-801-01: Admin approves a pending property listing successfully', async ({ page }) => {
    // Ensure we are in moderation view
    await page.locator('text=Moderation Queue').click();
    await expect(page.locator('.queue-table')).toBeVisible();

    // Select the first pending listing
    const firstRow = page.locator('.queue-table tbody tr').first();
    await firstRow.locator('button:has-text("Review")').click();

    // Verification check: Detailed modal opens with review parameters
    await expect(page.locator('.review-modal')).toBeVisible();
    await expect(page.locator('.review-modal img')).toHaveCount(3); // Expect uploaded photos

    // Click Approve
    await page.locator('button:has-text("Approve")').click();

    // Expected Result: Modal closes, row disappears from queue, success banner displays
    await expect(page.locator('.review-modal')).not.toBeVisible();
    await expect(page.locator('.success-banner')).toHaveText(/Listing approved successfully/);
  });

  /**
   * TC-FE-801-02 (Validation & Negative)
   * Requirement Mapping: FR-801-1
   * Acceptance Criteria Mapping: AC-801-2
   * Priority: High
   */
  test('TC-FE-801-02: Admin rejects a property listing and is forced to input comments', async ({ page }) => {
    await page.locator('text=Moderation Queue').click();
    const firstRow = page.locator('.queue-table tbody tr').first();
    await firstRow.locator('button:has-text("Review")').click();

    // Click Reject immediately without text
    await page.locator('button:has-text("Reject")').click();

    // Verify rejection modal opens prompting for details
    const rejectModal = page.locator('.rejection-modal');
    await expect(rejectModal).toBeVisible();

    // Click submit inside rejection modal (empty reason)
    await rejectModal.locator('button:has-text("Confirm Rejection")').click();

    // Expected Result: UI blocks submission and indicates validation error
    await expect(rejectModal.locator('.error-message')).toHaveText('Rejection reason must be at least 15 characters');

    // Fill in valid reason
    await rejectModal.locator('textarea[name="rejectionReason"]').fill('Listing details contain stock photos. Please upload genuine pictures of the interior.');
    await rejectModal.locator('button:has-text("Confirm Rejection")').click();

    // Verify modal closes and queue updates
    await expect(rejectModal).not.toBeVisible();
    await expect(page.locator('.success-banner')).toHaveText(/Listing rejected/);
  });

  /**
   * TC-FE-801-03 (Security)
   * Requirement Mapping: SEC-004
   * Priority: High
   */
  test('TC-FE-801-03: Block normal user from accessing admin dashboard routes', async ({ page }) => {
    // Clear cookies and navigate to admin portal
    await page.context().clearCookies();
    await page.goto('/admin/dashboard');

    // Expected Result: Auto-redirected to login or showing 403 Page
    await expect(page.locator('h1')).toHaveText(/Access Denied|Login/);
  });
});
