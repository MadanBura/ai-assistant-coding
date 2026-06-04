const { test, expect } = require('@playwright/test');

test.describe('Trip Creator & Planner (FE-101) - E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Precondition: User is registered and logged in, navigating to dashboard
    await page.goto('/login');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('TC-FE-101.1: Functional - Successfully Create a Trip (AC-101.3)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-1.1
    // Steps: Click wizard button, fill fields, verify card displays on grid
    await page.click('[data-testid="btn-create-trip"]');
    await page.fill('[data-testid="input-trip-title"]', 'Paris Summer Getaway');
    await page.fill('[data-testid="input-trip-destination"]', 'Paris, France');
    await page.fill('[data-testid="input-start-date"]', '2026-07-10');
    await page.fill('[data-testid="input-end-date"]', '2026-07-20');
    await page.selectOption('[data-testid="select-trip-style"]', 'moderate');
    await page.click('[data-testid="btn-submit-trip"]');
    
    // Expected Result: Dashboard displays new card with correct title and cover image
    const card = page.locator('[data-testid="trip-card"]:has-text("Paris Summer Getaway")');
    await expect(card).toBeVisible();
    await expect(card.locator('img')).toHaveAttribute('src', /unsplash\.com|default-cover/);
  });

  test('TC-FE-101.2: Validation & Edge Case - Past Dates Rejected (AC-101.1)', async ({ page }) => {
    // Priority: Medium
    // Requirement Mapping: FR-1.1, FR-1.3
    // Steps: Input past start date and check submission failure
    await page.click('[data-testid="btn-create-trip"]');
    await page.fill('[data-testid="input-trip-title"]', 'Past Trip');
    await page.fill('[data-testid="input-trip-destination"]', 'London, UK');
    await page.fill('[data-testid="input-start-date"]', '2020-01-01'); // Past date
    await page.fill('[data-testid="input-end-date"]', '2020-01-10');
    await page.click('[data-testid="btn-submit-trip"]');

    // Expected Result: Wizard blocks submit and renders error label
    const errorAlert = page.locator('[data-testid="error-message-trip"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/ERR_TRIP_DATE_01|ERR_PAST_DATE/);
  });

  test('TC-FE-101.3: Negative - Duration Exceeds 90 Days Limit (AC-101.1)', async ({ page }) => {
    // Priority: Low
    // Requirement Mapping: FR-1.3
    // Steps: Choose dates > 90 days apart, check validation alert
    await page.click('[data-testid="btn-create-trip"]');
    await page.fill('[data-testid="input-trip-title"]', 'Long Journey');
    await page.fill('[data-testid="input-trip-destination"]', 'Tokyo, Japan');
    await page.fill('[data-testid="input-start-date"]', '2026-07-01');
    await page.fill('[data-testid="input-end-date"]', '2026-11-01'); // > 90 days
    await page.click('[data-testid="btn-submit-trip"]');

    // Expected Result: Validation error locks submission
    const errorAlert = page.locator('[data-testid="error-message-trip"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/ERR_TRIP_LIMIT/);
  });
});
