import { test, expect } from '@playwright/test';

/**
 * FEATURE: Property Comparison Matrix (FEAT-401)
 * COVERAGE: Functional, UI, Edge Cases
 */

test.describe('FEAT-401: Property Comparison Matrix - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Pre-condition: Navigate to property search page
    await page.goto('/properties');
  });

  /**
   * TC-FE-401-01 (Functional & UI)
   * Requirement Mapping: FR-401, US-401-1
   * Acceptance Criteria Mapping: AC-401-1
   * Priority: High
   */
  test('TC-FE-401-01: Select properties, toggle compare footer, and verify side-by-side attributes', async ({ page }) => {
    // Select the first property checkbox
    const firstCard = page.locator('.property-grid-card').first();
    await firstCard.locator('label:has-text("Compare")').click();

    // Verify compare footer bar rolls up
    const footer = page.locator('.floating-compare-bar');
    await expect(footer).toBeVisible();
    await expect(footer.locator('.compare-counter')).toHaveText('1/4 selected');

    // Select second property checkbox
    const secondCard = page.locator('.property-grid-card').nth(1);
    await secondCard.locator('label:has-text("Compare")').click();
    await expect(footer.locator('.compare-counter')).toHaveText('2/4 selected');

    // Trigger matrix redirect
    await footer.locator('button:has-text("Compare Now")').click();

    // Verify redirected and matrix layout displays
    await page.waitForURL(/\/properties\/compare\?ids=.*/);
    const comparisonTable = page.locator('.comparison-matrix-table');
    await expect(comparisonTable).toBeVisible();
    
    // Check columns match count of selected items
    await expect(comparisonTable.locator('thead th')).toHaveCount(3); // 1 header column + 2 properties columns

    // Toggle difference highlighting
    const highlightBtn = page.locator('button:has-text("Highlight Differences")');
    await highlightBtn.click();
    await expect(comparisonTable.locator('.highlighted-row').first()).toBeVisible();
  });

  /**
   * TC-FE-401-02 (Validation & Negative)
   * Requirement Mapping: FR-401
   * Acceptance Criteria Mapping: AC-401-2
   * Priority: Medium
   */
  test('TC-FE-401-02: Enforce maximum selection limit of 4 properties', async ({ page }) => {
    // Click compare check on 5 cards sequentially
    const cards = page.locator('.property-grid-card');
    for (let i = 0; i < 5; i++) {
      await cards.nth(i).locator('label:has-text("Compare")').click();
    }

    // Expected Result: Toast warning triggers blocking execution
    await expect(page.locator('.toast-warning-message')).toHaveText('You can compare up to 4 properties.');
  });
});
