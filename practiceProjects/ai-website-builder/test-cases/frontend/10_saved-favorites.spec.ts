import { test, expect } from '@playwright/test';

/**
 * FEATURE: Saved Favorites (FEAT-402)
 * COVERAGE: Functional, UI, Edge Cases
 */

test.describe('FEAT-402: Saved Favorites - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Pre-condition: Login as Buyer
    await page.goto('/login');
    await page.getByLabel('Email').fill('sarah.buyer@example.com');
    await page.getByLabel('Password').fill('SecureBuyer123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');
  });

  /**
   * TC-FE-402-01 (Functional & UI)
   * Requirement Mapping: FR-402-1, BR-004
   * Acceptance Criteria Mapping: AC-402-1
   * Priority: High
   */
  test('TC-FE-402-01: Toggle property heart icon adding listing to user favorites list', async ({ page }) => {
    await page.goto('/properties');

    const firstCard = page.locator('.property-grid-card').first();
    const heartBtn = firstCard.locator('.favorite-heart-toggle');

    // Confirm initial state is unfilled
    await expect(heartBtn).toHaveClass(/heart-empty/);

    // Click heart to save
    await heartBtn.click();

    // Expected Result: Heart shifts to solid filled state
    await expect(heartBtn).toHaveClass(/heart-filled/);

    // Verify it appears in user profile dashboard
    await page.goto('/dashboard/favorites');
    await expect(page.locator('.favorites-grid-card')).toHaveCount(1);
  });

  /**
   * TC-FE-402-02 (UI & Animations)
   * Requirement Mapping: FR-402-2
   * Acceptance Criteria Mapping: AC-402-2
   * Priority: High
   */
  test('TC-FE-402-02: De-favoriting property card animates removal from dashboard grid', async ({ page }) => {
    await page.goto('/dashboard/favorites');
    const favCard = page.locator('.favorites-grid-card').first();
    await expect(favCard).toBeVisible();

    // Click heart to remove
    await favCard.locator('.favorite-heart-toggle').click();

    // Expected Result: Card animates opacity/transform change and vanishes
    await expect(favCard).toHaveClass(/fade-out/);
    await expect(favCard).not.toBeVisible();
    await expect(page.locator('.favorites-empty-state')).toBeVisible();
  });
});
