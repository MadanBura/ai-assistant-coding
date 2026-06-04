import { test, expect } from '@playwright/test';

/**
 * FEATURE: Agent and Property Reviews (FEAT-701)
 * COVERAGE: Functional, UI, Validation, Negative
 */

test.describe('FEAT-701: Agent and Property Reviews - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Pre-condition: Login as Buyer
    await page.goto('/login');
    await page.getByLabel('Email').fill('sarah.buyer@example.com');
    await page.getByLabel('Password').fill('SecureBuyer123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');
  });

  /**
   * TC-FE-701-01 (Functional & UI)
   * Requirement Mapping: FR-701, US-701-1
   * Acceptance Criteria Mapping: AC-701-1
   * Priority: High
   */
  test('TC-FE-701-01: Submit star rating and written review for agent successfully', async ({ page }) => {
    // Navigate to Agent profile
    await page.goto('/agents/marcus-vance-id');

    // Click write review button
    await page.locator('button:has-text("Write Review")').click();

    // Verify modal overlay loads
    const modal = page.locator('.review-creation-modal');
    await expect(modal).toBeVisible();

    // Select 5 stars
    const starRating = modal.locator('.star-rating-selector span').nth(4); // 5th star
    await starRating.click();
    
    // Fill comment
    await modal.locator('textarea[name="comment"]').fill('Marcus was incredibly helpful. Walked us through three different condos and helped us close in two weeks!');
    
    // Submit review form
    await modal.locator('button:has-text("Submit Review")').click();

    // Expected Result: Modal closes, success message shows, timeline updates
    await expect(modal).not.toBeVisible();
    await expect(page.locator('.success-toast')).toHaveText('Review published successfully');
    
    // Confirm new review shows on top of list
    const firstReview = page.locator('.reviews-timeline-item').first();
    await expect(firstReview.locator('.review-comment')).toHaveText(/Marcus was incredibly helpful/);
  });

  /**
   * TC-FE-701-02 (Validation & UI error)
   * Requirement Mapping: FR-701
   * Priority: High
   */
  test('TC-FE-701-02: Display inline warnings when review comment contains links', async ({ page }) => {
    await page.goto('/agents/marcus-vance-id');
    await page.locator('button:has-text("Write Review")').click();

    const modal = page.locator('.review-creation-modal');
    await modal.locator('.star-rating-selector span').nth(3).click();
    
    // Type comment containing links
    await modal.locator('textarea[name="comment"]').fill('Please check my site at http://maliciousspam.com for cheaper rates.');

    // Expected Result: Alert badge immediately updates warning user links are blocked
    await expect(modal.locator('.warning-block')).toHaveText('Links and promotional content are not permitted in reviews.');
    await expect(modal.locator('button:has-text("Submit Review")')).toBeDisabled();
  });
});
