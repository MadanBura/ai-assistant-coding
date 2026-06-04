import { test, expect } from '@playwright/test';

test.describe('FEAT-202: Post Scheduler Engine & Queue (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
    await page.goto('/posts/new');
  });

  /**
   * TC ID: TC-FE-401
   * Requirement Mapping: FR-202-3
   * AC Mapping: AC-203-2
   * Test Type: Validation / Negative / UI
   * Preconditions: Composer page is active, Twitter/X platform target selected.
   * Steps:
   *   1. Click on Twitter/X target logo checkbox.
   *   2. In post text area, input a string containing 285 characters.
   * Expected Result: The visual character counter displays: "285 / 280", changes font color to red, and disables "Save Draft" / "Submit" button controls.
   * Priority: HIGH
   */
  test('TC-FE-401: Enforce Platform Character Limitations inside Post Composer', async ({ page }) => {
    await page.click('[data-testid="platform-checkbox-twitter"]');

    const textarea = page.locator('[data-testid="post-caption-textarea"]');
    // Fill 285 chars
    const overflowText = 'a'.repeat(285);
    await textarea.fill(overflowText);

    // Verify visual validation flags
    const charCounter = page.locator('[data-testid="char-counter"]');
    await expect(charCounter).toContainText('285/280');
    await expect(charCounter).toHaveClass(/text-danger/); // check color formatting class

    const submitBtn = page.locator('[data-testid="post-submit-btn"]');
    await expect(submitBtn).toBeDisabled();
  });

  /**
   * TC ID: TC-FE-402
   * Requirement Mapping: FR-202-1, FR-202-2
   * AC Mapping: AC-203-1, AC-203-3
   * Test Type: Functional / UI / Integration
   * Preconditions: Composer page contains valid details, date selected.
   * Steps:
   *   1. Select LinkedIn platform card.
   *   2. Input copy "Our new product launch update!".
   *   3. Open schedule picker, select date tomorrow, set hour to 14:00.
   *   4. Click "Submit for Review".
   * Expected Result: Renders redirect spinner, navigates user to Calendar board, displaying a card with yellow vertical badge indicator on target date cell.
   * Priority: HIGH
   */
  test('TC-FE-402: Schedule Valid Post and Assert Queue Timeline Status', async ({ page }) => {
    await page.click('[data-testid="platform-checkbox-linkedin"]');
    await page.locator('[data-testid="post-caption-textarea"]').fill('Our new product launch update!');

    // Open date picker modal
    await page.click('[data-testid="date-picker-trigger"]');
    await page.locator('[data-testid="calendar-day-tomorrow"]').click();
    await page.fill('[data-testid="time-input-field"]', '14:00');
    await page.click('[data-testid="confirm-time-btn"]');

    await page.click('[data-testid="submit-review-btn"]');

    // Confirm redirected to calendar page
    await expect(page).toHaveURL('/calendar');
    
    // Check card details
    const calendarCard = page.locator('[data-testid="calendar-card-pending"]').first();
    await expect(calendarCard).toBeVisible();
    await expect(calendarCard).toContainText('Our new product launch update!');
  });

  /**
   * TC ID: TC-FE-403
   * Requirement Mapping: FR-202-4
   * AC Mapping: AC-204-1, AC-204-2
   * Test Type: Functional / UI / Accessibility
   * Preconditions: Navigated to Timeline queue page.
   * Steps:
   *   1. Click on "Timeline" Tab in sub-navigation.
   *   2. Select "LinkedIn" filter badge.
   * Expected Result: Post lists filter to show only pending posts targeted for LinkedIn release. Active filters state is accessible by keyboard toggles.
   * Priority: MEDIUM
   */
  test('TC-FE-403: Verify Filter Behaviors on Content Queue Grid List', async ({ page }) => {
    await page.goto('/posts/timeline');

    // Select platform filters
    const filterBadge = page.locator('[data-testid="filter-badge-linkedin"]');
    await filterBadge.click();

    // Verify visible cards strictly matching filter
    const visibleCards = page.locator('[data-testid="timeline-item"]');
    const counts = await visibleCards.count();
    
    for (let i = 0; i < counts; i++) {
      const platformIndicator = visibleCards.nth(i).locator('[data-testid="item-platform-icon"]');
      await expect(platformIndicator).toHaveAttribute('data-platform', 'linkedin');
    }
  });
});
