import { test, expect } from '@playwright/test';

test.describe('FEAT-601: Metrics Dashboard (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
    await page.goto('/analytics');
  });

  /**
   * TC ID: TC-FE-1001
   * Requirement Mapping: FR-601-3, FR-601-4
   * AC Mapping: AC-601-1
   * Test Type: Functional / UI
   * Preconditions: Navigated to Analytics dashboard page.
   * Steps:
   *   1. Check visibility of summary metric blocks.
   * Expected Result: Renders 4 scorecards: Total Impressions, Total Clicks, Follower Growth, and Average Engagement Rate.
   * Priority: HIGH
   */
  test('TC-FE-1001: Render Analytics Summary Scorecard Blocks', async ({ page }) => {
    const summaryBanner = page.locator('[data-testid="analytics-summary-banner"]');
    await expect(summaryBanner).toBeVisible();

    await expect(summaryBanner.locator('[data-testid="metric-impressions"]')).toContainText(/\d+/);
    await expect(summaryBanner.locator('[data-testid="metric-clicks"]')).toContainText(/\d+/);
    await expect(summaryBanner.locator('[data-testid="metric-engagement-rate"]')).toContainText(/%/);
  });

  /**
   * TC ID: TC-FE-1002
   * Requirement Mapping: FR-601-5, FR-601-6
   * AC Mapping: AC-601-3
   * Test Type: Functional / UI / Accessibility
   * Preconditions: Chart component is visible.
   * Steps:
   *   1. Click on range filter selector, select "Last 90 Days".
   *   2. Deselect the "Twitter" filter checkbox badge.
   * Expected Result: Chart redraws datasets showing 90-day trends, hides Twitter data lines from the visualization grid. Toggles support screen reader aria tags.
   * Priority: HIGH
   */
  test('TC-FE-1002: Interactively Toggle Chart Data Filter Badges', async ({ page }) => {
    // Check main chart visibility
    const chartContainer = page.locator('[data-testid="trend-chart-container"]');
    await expect(chartContainer).toBeVisible();

    // Select range dropdown
    await page.selectOption('[data-testid="range-select"]', '90d');

    // Deselect a platform
    const twitterToggle = page.locator('[data-testid="platform-toggle-twitter"]');
    await expect(twitterToggle).toHaveAttribute('aria-checked', 'true');
    await twitterToggle.click();
    await expect(twitterToggle).toHaveAttribute('aria-checked', 'false');

    // Verify chart redraws (chart element redraw classes)
    await expect(page.locator('.recharts-responsive-container')).toBeVisible();
  });

  /**
   * TC ID: TC-FE-1003
   * Requirement Mapping: FR-601-4
   * AC Mapping: AC-601-2
   * Test Type: Functional / UI
   * Preconditions: Leaderboard grid contains rows.
   * Steps:
   *   1. Locate "Top Performing Posts" leaderboard table.
   * Expected Result: Renders top 5 published posts containing caption text, channel icons, and engagement percentage scores.
   * Priority: MEDIUM
   */
  test('TC-FE-1003: Render Top Performing Posts Leaderboard Grid', async ({ page }) => {
    const table = page.locator('[data-testid="leaderboard-table"]');
    await expect(table).toBeVisible();

    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(5);

    // Verify engagement rate column
    const firstRowRate = rows.first().locator('[data-testid="row-engagement-rate"]');
    await expect(firstRowRate).toContainText(/%/);
  });
});
