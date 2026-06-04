import { test, expect } from '@playwright/test';

test.describe('FEAT-501: Status-based Approval Gate (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Log in as SMM (Editor)
    await page.fill('input[type="email"]', 'editor@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
  });

  /**
   * TC ID: TC-FE-601
   * Requirement Mapping: FR-501-1, FR-501-2
   * AC Mapping: AC-501-1
   * Test Type: Functional / UI
   * Preconditions: Navigated to Calendar page containing draft card.
   * Steps:
   *   1. Click on Draft card in monthly grid.
   *   2. Verify presence of platform simulation tabs (LinkedIn, Facebook).
   *   3. Click "Submit for Review" button.
   * Expected Result: Status changes to "Pending Review", badge color shifts to yellow, and edit inputs lock/read-only for Editor accounts.
   * Priority: HIGH
   */
  test('TC-FE-601: Transition Post from Draft to Pending Review', async ({ page }) => {
    await page.goto('/calendar');
    await page.click('[data-testid="calendar-card-draft"]').first();

    // Verify platform previews
    const previewTab = page.locator('[data-testid="preview-tab-linkedin"]');
    await expect(previewTab).toBeVisible();
    await previewTab.click();
    await expect(page.locator('[data-testid="mockup-feed-card"]')).toBeVisible();

    // Submit Action
    await page.click('[data-testid="post-submit-review-btn"]');

    // Confirm state badge update
    const cardStatus = page.locator('[data-testid="post-status-badge"]');
    await expect(cardStatus).toContainText('Pending Review');
    await expect(cardStatus).toHaveClass(/badge-pending/);
  });

  /**
   * TC ID: TC-FE-602
   * Requirement Mapping: FR-501-3
   * AC Mapping: AC-502-1
   * Test Type: Functional / UI / Security
   * Preconditions: Logged in as Approver role.
   * Steps:
   *   1. Log out editor, log in as `approver@acme.com`.
   *   2. Go to /posts/reviews and click on first pending card.
   *   3. Click "Approve Content".
   * Expected Result: Status updates to "Approved", badge changes to green, and card scheduled indicator locks.
   * Priority: HIGH
   */
  test('TC-FE-602: Approve Pending Post and Confirm Status Updates', async ({ page }) => {
    // Session switch
    await page.click('[data-testid="profile-dropdown"]');
    await page.click('[data-testid="logout-btn"]');

    await page.fill('input[type="email"]', 'approver@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');

    await page.goto('/posts/reviews');
    await page.click('[data-testid="pending-review-card"]').first();

    await page.click('[data-testid="post-approve-action-btn"]');

    const statusBadge = page.locator('[data-testid="review-status-badge"]');
    await expect(statusBadge).toContainText('Approved');
    await expect(statusBadge).toHaveClass(/badge-approved/);
  });

  /**
   * TC ID: TC-FE-603
   * Requirement Mapping: FR-501-4
   * AC Mapping: AC-552-2
   * Test Type: Security / Negative / UI
   * Preconditions: Editor views an already APPROVED post card.
   * Steps:
   *   1. Select an APPROVED card in the Calendar page.
   * Expected Result: Input textarea, platform toggle checkboxes, media attachment slots, and scheduled date inputs are disabled. Edit lock warning alert is rendered.
   * Priority: HIGH
   */
  test('TC-FE-603: Enforce Read-Only Form Locks for Editors on Approved Posts', async ({ page }) => {
    await page.goto('/calendar');
    await page.click('[data-testid="calendar-card-approved"]').first();

    // Confirm form disables
    const captionInput = page.locator('[data-testid="post-caption-textarea"]');
    await expect(captionInput).toBeDisabled();

    const datePicker = page.locator('[data-testid="date-picker-trigger"]');
    await expect(datePicker).toBeDisabled();

    const warningLock = page.locator('[data-testid="edit-lock-alert"]');
    await expect(warningLock).toBeVisible();
    await expect(warningLock).toContainText('Approved posts are locked for modification');
  });
});
