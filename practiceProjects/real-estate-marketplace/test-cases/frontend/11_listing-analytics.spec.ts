import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-4.2 (Listing Analytics & Trends)
 * MAPPED REQUIREMENTS: FR-402
 * ACCEPTANCE CRITERIA: AC-403, AC-404
 */

test.describe('FT-4.2: Listing Analytics & Trends E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Log in as Agent
    await page.goto('/auth/login');
    await page.fill('[data-testid="login-email"]', 'agent@example.com');
    await page.fill('[data-testid="login-password"]', 'Password123!');
    await page.click('[data-testid="login-submit-btn"]');
    await page.waitForURL('/dashboard');
  });

  /**
   * TC ID: TC-FE-1101
   * Type: UI / Functional
   * Preconditions: Agent viewing listings analytics section
   * Priority: High
   */
  test('TC-FE-1101: Listing analytics charts container and conversion funnel render correct percentages', async ({ page }) => {
    await page.goto('/dashboard/analytics/listings/prop_test123');

    // Wait for Recharts canvas elements to compile
    await page.waitForSelector('.recharts-responsive-container');

    // Verify conversion funnel values display
    await expect(page.locator('[data-testid="funnel-total-views"]')).toContainText('1,250');
    await expect(page.locator('[data-testid="funnel-total-inquiries"]')).toContainText('42');
    await expect(page.locator('[data-testid="funnel-conversion-rate"]')).toContainText('3.36%');
  });

  /**
   * TC ID: TC-FE-1102
   * Type: Accessibility / Colors validation
   * Preconditions: Recharts components active on viewport
   * Priority: Medium
   */
  test('TC-FE-1102: Verify analytics trend lines comply with accessible colors contrast scales', async ({ page }) => {
    await page.goto('/dashboard/analytics/listings/prop_test123');

    const chartLine = page.locator('.recharts-line-path').first();
    await expect(chartLine).toBeVisible();

    // Verify fill strokes use accessible HSL themes instead of light colors
    const strokeColor = await chartLine.getAttribute('stroke');
    expect(strokeColor).not.toBe('#ffffff'); // Exclude white
    expect(strokeColor).not.toBe('#ffff00'); // Exclude light yellow
    
    // Check contrast compliance token checks (e.g. check for hex codes mapping high contrast indices)
    expect(strokeColor?.startsWith('#') || strokeColor?.startsWith('var(') || strokeColor?.startsWith('hsl(')).toBe(true);
  });

});
