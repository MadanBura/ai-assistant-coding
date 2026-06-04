import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-4.1 (Property Comparison Matrix)
 * MAPPED REQUIREMENTS: FR-401
 * ACCEPTANCE CRITERIA: AC-401, AC-402
 */

test.describe('FT-4.1: Property Comparison Matrix E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  /**
   * TC ID: TC-FE-801
   * Type: UI / Functional
   * Preconditions: Properties exist in results grid
   * Priority: High
   */
  test('TC-FE-801: Verify grid specs row alignment and Highlight Differences visual overlays', async ({ page }) => {
    // Add 2 listings to comparison basket
    const cards = page.locator('[data-testid="property-card"]');
    await cards.nth(0).locator('[data-testid="compare-checkbox-label"]').click();
    await cards.nth(1).locator('[data-testid="compare-checkbox-label"]').click();

    // Floating comparison drawer bar displays
    const floatingBar = page.locator('[data-testid="compare-floating-drawer"]');
    await expect(floatingBar).toBeVisible();
    await expect(floatingBar.locator('[data-testid="compare-count-badge"]')).toHaveText('2 Selected');

    // Go to comparison screen
    await page.click('[data-testid="compare-now-btn"]');
    await page.waitForURL('/compare');

    // Check alignment rows are visible
    await expect(page.locator('[data-testid="compare-row-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="compare-row-sqft"]')).toBeVisible();

    // Toggle Highlight Differences
    await page.click('[data-testid="highlight-diffs-switch"]');

    // Confirm diff rows receive contrast highlight class styles
    const diffPriceRow = page.locator('[data-testid="compare-row-price"]');
    await expect(diffPriceRow).toHaveClass(/highlight-row/);
  });

  /**
   * TC ID: TC-FE-802
   * Type: Validation / UI Alert
   * Preconditions: 4 items already added to comparison
   * Priority: Medium
   */
  test('TC-FE-802: Adding a 5th property to compare must show toast warning blocker', async ({ page }) => {
    const cards = page.locator('[data-testid="property-card"]');
    
    // Check comparison box on 4 listings
    for (let i = 0; i < 4; i++) {
      await cards.nth(i).locator('[data-testid="compare-checkbox-label"]').click();
    }

    // Try check 5th
    await cards.nth(4).locator('[data-testid="compare-checkbox-label"]').click();

    // Verify warning alert message shows
    const warningToast = page.locator('[data-testid="comparison-error-toast"]');
    await expect(warningToast).toBeVisible();
    await expect(warningToast).toContainText('You can compare a maximum of 4 properties');
  });

});
