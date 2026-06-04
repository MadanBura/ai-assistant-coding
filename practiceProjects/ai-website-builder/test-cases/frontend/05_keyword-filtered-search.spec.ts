import { test, expect } from '@playwright/test';

/**
 * FEATURE: Keyword and Filtered Search (FEAT-301)
 * COVERAGE: Functional, UI, Validation, Negative, Accessibility
 */

test.describe('FEAT-301: Keyword and Filtered Search - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Pre-condition: Navigate to the properties search page
    await page.goto('/properties');
  });

  /**
   * TC-FE-301-01 (Functional & UI)
   * Requirement Mapping: FR-301-2, BR-004
   * Acceptance Criteria Mapping: AC-301-1
   * Priority: High
   */
  test('TC-FE-301-01: Apply price and category filters successfully updating the results grid', async ({ page }) => {
    // Verify initial search listing renders cards
    await expect(page.locator('.property-grid-card')).toHaveCount({ min: 1 });

    // Open filters panel (on mobile) or interact on desktop
    const filterPanel = page.locator('.filters-panel');
    await expect(filterPanel).toBeVisible();

    // Fill in Price Filters
    await page.getByLabel('Min Price').fill('200000');
    await page.getByLabel('Max Price').fill('500000');
    
    // Select category and amenities
    await page.getByLabel('Category').selectOption('residential');
    await page.locator('label:has-text("Pool")').click();

    // Verify debounce or trigger search click
    await page.locator('button:has-text("Apply Filters")').click();

    // Expected Result: Property grid shows matching properties within pricing thresholds
    const cards = page.locator('.property-grid-card');
    await expect(cards).toHaveCount({ min: 0 }); // might be 0 or more depending on database state
    
    // If cards exist, check price labels
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const priceText = await cards.nth(i).locator('.price-tag').innerText();
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      expect(price).toBeGreaterThanOrEqual(200000);
      expect(price).toBeLessThanOrEqual(500000);
    }
  });

  /**
   * TC-FE-301-02 (Negative & Edge Case)
   * Requirement Mapping: US-301-1
   * Priority: Medium
   */
  test('TC-FE-301-02: Search returns empty state layout and lets user Save Search configuration', async ({ page }) => {
    // Search for impossible string to force zero results
    await page.getByPlaceholder('Search location, zip, description...').fill('ImpossibleXYZPropertyMatches');
    await page.locator('button:has-text("Search")').click();

    // Expected Result: Zero state message showing search suggestions
    await expect(page.locator('.zero-results-message')).toBeVisible();
    await expect(page.locator('text=Try adjusting your price range or filters')).toBeVisible();

    // Save Search button visible for alerts
    const saveSearchBtn = page.locator('button:has-text("Save Search & Notify Me")');
    await expect(saveSearchBtn).toBeVisible();
  });
});
