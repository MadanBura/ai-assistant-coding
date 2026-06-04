const { test, expect } = require('@playwright/test');

test.describe('Destination Discovery Feed (FE-301) - E2E Tests', () => {

  test('TC-FE-301.1: Functional & Public Access - Anonymous visitor can search (AC-301.2)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-3.1
    // Preconditions: Visitor is not logged in.
    // Steps: Navigate to /discover search page, type "Kyoto", select filter
    await page.goto('/discover');
    await page.fill('[data-testid="input-discover-search"]', 'Kyoto');
    await page.selectOption('[data-testid="select-discover-budget"]', 'moderate');
    await page.click('[data-testid="btn-discover-search"]');

    // Expected Result: Detail card for Kyoto displays, listing tags and average costs
    const resultCard = page.locator('[data-testid="destination-card"]:has-text("Kyoto")');
    await expect(resultCard).toBeVisible();
    await expect(resultCard.locator('[data-testid="destination-cost"]')).toContainText('$120');
  });

  test('TC-FE-301.2: Validation & Security - CTA Redirects Unauthenticated Users (AC-301.3)', async ({ page }) => {
    // Priority: Medium
    // Requirement Mapping: FR-3.1
    // Steps: Click "Plan This Trip" CTA on public destination page
    await page.goto('/discover');
    await page.fill('[data-testid="input-discover-search"]', 'Kyoto');
    await page.click('[data-testid="btn-discover-search"]');
    
    const resultCard = page.locator('[data-testid="destination-card"]:has-text("Kyoto")');
    await resultCard.locator('[data-testid="btn-plan-trip-cta"]').click();

    // Expected Result: User is redirected to login page
    await expect(page).toHaveURL(/\/login|\/register/);
  });
});
