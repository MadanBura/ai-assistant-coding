import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-5.2 (Agent Ratings & Reviews)
 * MAPPED REQUIREMENTS: FR-502
 * ACCEPTANCE CRITERIA: AC-503, AC-504
 */

test.describe('FT-5.2: Agent Ratings & Reviews E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Log in as Buyer
    await page.goto('/auth/login');
    await page.fill('[data-testid="login-email"]', 'buyer@example.com');
    await page.fill('[data-testid="login-password"]', 'Password123!');
    await page.click('[data-testid="login-submit-btn"]');
    await page.waitForURL('/dashboard');
  });

  /**
   * TC ID: TC-FE-1001
   * Type: UI / Functional
   * Preconditions: Verified conversation exists with Agent
   * Priority: Critical
   */
  test('TC-FE-1001: Submit star ratings and verify validated badges render on public reviews log', async ({ page }) => {
    await page.goto('/agents/usr_agent123/reviews/new');

    // Click rating stars (e.g. 5 stars on communication, 4 on knowledge)
    await page.click('[data-testid="star-comm-5"]');
    await page.click('[data-testid="star-know-4"]');
    await page.click('[data-testid="star-help-5"]');

    // Write review text
    await page.fill('[data-testid="review-body-text"]', 'Highly professional agent, coordinated viewings promptly.');
    await page.click('[data-testid="submit-review-btn"]');

    // Verify redirected back to public profile reviews list
    await page.waitForURL('/agents/usr_agent123');
    
    // Assert review appears with 'Verified Interaction' tick
    const firstReviewCard = page.locator('[data-testid="agent-review-card-0"]');
    await expect(firstReviewCard).toBeVisible();
    await expect(firstReviewCard.locator('[data-testid="verified-interaction-tick"]')).toBeVisible();
    await expect(firstReviewCard.locator('[data-testid="review-card-body"]')).toContainText('Highly professional agent');
  });

  /**
   * TC ID: TC-FE-1002
   * Type: Validation / UI
   * Preconditions: Buyer attempts to submit review with less than 20 characters
   * Priority: Medium
   */
  test('TC-FE-1002: Review text less than 20 characters must disable submission button', async ({ page }) => {
    await page.goto('/agents/usr_agent123/reviews/new');

    // Enter very short text
    await page.fill('[data-testid="review-body-text"]', 'Too short');
    
    // Check remaining characters alert or error text displays
    await expect(page.locator('[data-testid="char-countdown-label"]')).toContainText('Minimum 20 characters required');
    await expect(page.locator('[data-testid="submit-review-btn"]')).toBeDisabled();
  });

});
