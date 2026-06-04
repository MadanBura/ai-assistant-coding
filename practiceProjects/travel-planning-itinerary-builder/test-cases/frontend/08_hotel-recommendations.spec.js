const { test, expect } = require('@playwright/test');

test.describe('Smart Hotel Recommendations (FE-302) - E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await page.goto('/trips/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed');
    await page.click('[data-testid="tab-hotels"]');
  });

  test('TC-FE-302.1: Functional & UI - Render Curated hotel list (AC-302.2)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-3.2
    // Steps: Verify recommendation panel loads items matching budget and proximity
    const hotelsPanel = page.locator('[data-testid="hotels-recommendations-panel"]');
    await expect(hotelsPanel).toBeVisible();

    const hotelItem = page.locator('[data-testid="hotel-card"]:has-text("Hotel Lutece")');
    await expect(hotelItem).toBeVisible();
    await expect(hotelItem.locator('[data-testid="hotel-distance"]')).toContainText('0.4 miles');
  });

  test('TC-FE-302.2: Integration - Outbound Affiliate links open new tab (AC-302.3)', async ({ page, context }) => {
    // Priority: Medium
    // Requirement Mapping: FR-3.2
    // Steps: Click booking link, verify redirect parameters
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('[data-testid="hotel-card"]:has-text("Hotel Lutece") [data-testid="btn-view-deal"]').click()
    ]);

    await newPage.waitForLoadState();
    
    // Expected Result: Target URL contains affiliate trackers
    const url = newPage.url();
    expect(url).toContain('aff=globetrotter');
    expect(url).toContain('booking.com');
    await newPage.close();
  });
});
