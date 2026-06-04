import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-006 | Feature: FEAT-602 (Verified Consultation Review System)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-602-01
 * @requirement FR-602
 * @acceptanceCriteria AC-602.1.2
 * @priority High
 * @preconditions Patient completed consultation call.
 * @description Verify patient can input review ratings and write comment details.
 */
test('TC-FE-602-01: Verify review submission form fields and numeric star choices', async ({ page }) => {
  await page.goto('/appointments/appt-449102/review');
  
  // Assert review form contains inputs
  const feedbackInput = page.locator('[data-testid="review-comment-textarea"]');
  await expect(feedbackInput).toBeVisible();

  // Click 5 stars
  const starBtn = page.locator('[data-testid="rating-star-btn-5"]');
  await expect(starBtn).toBeVisible();
  await starBtn.click();
  await expect(starBtn).toHaveClass(/selected-star-state/);

  // Fill in comment
  await feedbackInput.fill('Dr. Robert Chen was extremely thorough and helpful.');
  
  // Submit and verify redirection
  await page.click('[data-testid="submit-review-btn"]');
  await expect(page).toHaveURL(/\/patient\/dashboard/);
  
  const successToast = page.locator('[data-testid="success-toast"]');
  await expect(successToast).toBeVisible();
  await expect(successToast).toContainText('Review submitted successfully');
});

/**
 * @testcase TC-FE-602-02
 * @requirement FR-602
 * @acceptanceCriteria AC-602.2.1
 * @priority Medium
 * @preconditions Doctor has reviews submitted in DB.
 * @description Verify doctor profile lists public review cards.
 */
test('TC-FE-602-02: Verify public doctor profile aggregates star ratings and comments', async ({ page }) => {
  await page.goto('/doctors/doc-robert-chen-77');
  
  // Verify ratings indicators load
  const averageHeader = page.locator('[data-testid="doctor-average-rating-header"]');
  await expect(averageHeader).toBeVisible();
  await expect(averageHeader).toContainText('4.8');

  // Verify review card detail rows load
  const firstReviewCard = page.locator('[data-testid="review-card-element"]').first();
  await expect(firstReviewCard).toBeVisible();
  await expect(firstReviewCard.locator('[data-testid="reviewer-name-label"]')).toHaveText('Sarah C.');
});
