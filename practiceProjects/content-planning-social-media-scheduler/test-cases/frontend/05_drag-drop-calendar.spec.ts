import { test, expect } from '@playwright/test';

test.describe('FEAT-201: Interactive Drag-and-Drop Calendar Grid (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
    await page.goto('/calendar');
  });

  /**
   * TC ID: TC-FE-501
   * Requirement Mapping: FR-201-1, FR-201-2, FR-201-3
   * AC Mapping: AC-201-1, AC-201-2
   * Test Type: Functional / UI / Accessibility
   * Preconditions: Navigated to Calendar page.
   * Steps:
   *   1. Verify default view maps current month.
   *   2. Click "Week" view button selector.
   *   3. Audit component layout contrast and labels.
   * Expected Result: Calendar updates columns grid to map week days, shows hourly slots, and renders existing card markers correctly.
   * Priority: HIGH
   */
  test('TC-FE-501: Render Calendar Views and Confirm Element Placements', async ({ page }) => {
    // Audit grid render
    const monthGrid = page.locator('[data-testid="calendar-grid-month"]');
    await expect(monthGrid).toBeVisible();

    // Toggle views
    await page.click('[data-testid="view-toggle-week"]');
    const weekGrid = page.locator('[data-testid="calendar-grid-week"]');
    await expect(weekGrid).toBeVisible();

    // Elements inside calendar card
    const card = page.locator('[data-testid="calendar-card-post"]').first();
    await expect(card.locator('.platform-icon')).toBeVisible();
    await expect(card.locator('.card-caption-snippet')).toBeVisible();
  });

  /**
   * TC ID: TC-FE-502
   * Requirement Mapping: FR-201-4, FR-201-5
   * AC Mapping: AC-202-1, AC-202-2
   * Test Type: Functional / UI / Integration
   * Preconditions: Calendar contains a drag-enabled card.
   * Steps:
   *   1. Grab calendar post card scheduled for tomorrow.
   *   2. Drag card to cell representing the day after tomorrow.
   *   3. Drop card.
   * Expected Result: Card snaps into destination grid cell, launches api save, and renders success confirmation check.
   * Priority: HIGH
   */
  test('TC-FE-502: Reschedule Post Card via Drag and Drop Actions', async ({ page }) => {
    // Select source and destination cells
    const card = page.locator('[data-testid="calendar-card-post"]').first();
    const targetCell = page.locator('[data-testid="calendar-day-cell-target"]').first();

    // Simulate HTML5 drag drop sequence
    await card.dragTo(targetCell);

    // Assert update toast messages
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Post rescheduled successfully');
  });

  /**
   * TC ID: TC-FE-503
   * Requirement Mapping: FR-201-6
   * AC Mapping: AC-201-4
   * Test Type: Negative / Edge Cases / UI
   * Preconditions: User triggers a drag update while backend returns network errors.
   * Steps:
   *   1. Intercept `PATCH /api/v1/posts/:id/reschedule` endpoint to force abort/500 returns.
   *   2. Drag a card from cell A to cell B.
   * Expected Result: API failure triggers rollback script. Visual card reverts cleanly back to cell A, displays alert banner.
   * Priority: HIGH
   */
  test('TC-FE-503: Revert Card Drag Gesture to Source Cell on Server Failure', async ({ page }) => {
    // Intercept endpoint calls
    await page.route('**/api/v1/posts/*/reschedule', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database transaction failure' })
      });
    });

    const card = page.locator('[data-testid="calendar-card-post"]').first();
    const sourceCell = page.locator('[data-testid="calendar-day-cell-source"]').first();
    const targetCell = page.locator('[data-testid="calendar-day-cell-target"]').first();

    // Drag action
    await card.dragTo(targetCell);

    // Asserts warning dialog alerts user and card snaps back to origin position
    const errorBanner = page.locator('.toast-error');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('Database transaction failure');

    // Confirm visual card is restored inside source cell container
    await expect(sourceCell.locator('[data-testid="calendar-card-post"]').first()).toBeVisible();
  });
});
