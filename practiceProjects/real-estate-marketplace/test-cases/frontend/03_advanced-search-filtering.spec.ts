import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-2.2 (Advanced Search & Filtering)
 * MAPPED REQUIREMENTS: FR-202
 * ACCEPTANCE CRITERIA: AC-203, AC-204
 */

test.describe('FT-2.2: Advanced Search & Filtering E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  /**
   * TC ID: TC-FE-301
   * Type: Functional / UI
   * Preconditions: Multiple listings populate active index
   * Priority: Critical
   */
  test('TC-FE-301: Verify multi-parameter query combinations restrict results grid correctly', async ({ page }) => {
    // Input keyword
    await page.fill('[data-testid="search-input-field"]', 'Uptown');
    
    // Toggle advanced filter panel
    await page.click('[data-testid="filter-toggle-btn"]');
    
    // Fill sliders
    await page.fill('[data-testid="filter-min-price"]', '200000');
    await page.fill('[data-testid="filter-max-price"]', '500000');
    
    // Select rooms
    await page.selectOption('[data-testid="filter-beds-select"]', '3');
    
    // Select amenity tags
    await page.click('[data-testid="tag-Pool-cb"]');
    await page.click('[data-testid="tag-Parking-cb"]');
    
    // Assert chips render correctly in panel header
    await expect(page.locator('[data-testid="filter-chip-beds"]')).toHaveText('Beds: 3+');
    await expect(page.locator('[data-testid="filter-chip-Pool"]')).toBeVisible();

    // Verify search matches listings count
    const propertyCards = page.locator('[data-testid="property-card"]');
    const cardsCount = await propertyCards.count();
    expect(cardsCount).toBeGreaterThan(0);
    
    // Assert all rendered properties price fields fall within the limits
    for (let i = 0; i < cardsCount; i++) {
      const priceText = await propertyCards.nth(i).locator('[data-testid="card-price-label"]').innerText();
      const price = parseInt(priceText.replace(/[^0-9]/g, ''));
      expect(price).toBeGreaterThanOrEqual(200000);
      expect(price).toBeLessThanOrEqual(500000);
    }
  });

  /**
   * TC ID: TC-FE-302
   * Type: Edge Case / UI Fallback
   * Preconditions: Searching extreme filter variables returning 0 listings
   * Priority: Medium
   */
  test('TC-FE-302: Verify zero matches renders appropriate fallback suggestions panel', async ({ page }) => {
    // Input impossible price parameters
    await page.click('[data-testid="filter-toggle-btn"]');
    await page.fill('[data-testid="filter-min-price"]', '10000000');
    await page.fill('[data-testid="filter-max-price"]', '10000001');

    // Submit
    await page.click('[data-testid="apply-filters-btn"]');

    // Assert zero message and coordinates expansion tip displays
    await expect(page.locator('[data-testid="zero-results-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="expand-search-suggestions"]')).toContainText('Try broadening your radius or removing price limits');
  });

});
