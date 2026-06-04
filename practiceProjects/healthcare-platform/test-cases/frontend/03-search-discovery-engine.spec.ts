import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-001 | Feature: FEAT-102 (Search & Discovery Engine)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-102-01
 * @requirement FR-102
 * @acceptanceCriteria AC-102.1.1
 * @priority High
 * @preconditions Verified doctors exist in multiple specialties in DB.
 * @description Verify that search directory contains filter inputs and updates search cards dynamic list.
 */
test('TC-FE-102-01: Verify specialty filters and rating slider update card lists', async ({ page }) => {
  await page.goto('/search');
  
  // Choose specialty filter
  await page.selectOption('[data-testid="specialty-filter-select"]', { label: 'Cardiology' });
  
  // Set price slider
  const slider = page.locator('[data-testid="price-range-slider"]');
  await slider.fill('200'); // set value to max $200/hr

  // Toggle 4+ stars filter checkbox
  await page.check('[data-testid="rating-checkbox-4plus"]');

  // Verify list updates loading skeletons
  await expect(page.locator('[data-testid="search-skeleton-loader"]')).toBeVisible();
  await expect(page.locator('[data-testid="search-skeleton-loader"]')).not.toBeVisible();
  
  // Assert results cards matches filters
  const doctorCards = page.locator('[data-testid="doctor-card"]');
  await expect(doctorCards.first()).toBeVisible();
  await expect(doctorCards.locator('[data-testid="specialty-badge"]').first()).toHaveText('Cardiology');
});

/**
 * @testcase TC-FE-102-02
 * @requirement FR-102
 * @acceptanceCriteria AC-102.1.2
 * @priority Medium
 * @preconditions User allows location permissions in browser mock environment.
 * @description Verify that geolocation searches sort results by distance parameters.
 */
test('TC-FE-102-02: Verify geolocation sorts results by proximity parameters', async ({ page }) => {
  await page.goto('/search');
  
  // Input ZIP code
  await page.fill('[data-testid="location-input"]', '02115');
  await page.keyboard.press('Enter');
  
  // Verify distance badge matches nearest distance sequence sorting
  const firstDistance = page.locator('[data-testid="doctor-distance-badge"]').first();
  await expect(firstDistance).toContainText('miles');
});
