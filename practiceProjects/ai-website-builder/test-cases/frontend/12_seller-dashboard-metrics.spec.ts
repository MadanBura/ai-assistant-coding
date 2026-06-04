import { test, expect } from '@playwright/test';

/**
 * FEATURE: Property Analytics (FEAT-601)
 * COVERAGE: Functional, UI, Edge Cases
 */

test.describe('FEAT-601: Property Analytics - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Pre-condition: Login as Owner
    await page.goto('/login');
    await page.getByLabel('Email').fill('david.owner@example.com');
    await page.getByLabel('Password').fill('SecureOwner123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');
  });

  /**
   * TC-FE-601-01 (Functional & UI)
   * Requirement Mapping: FR-601, US-601-1
   * Acceptance Criteria Mapping: AC-601-1
   * Priority: High
   */
  test('TC-FE-601-01: Load property analytics and toggle date range views successfully', async ({ page }) => {
    // Navigate to Analytics page
    await page.goto('/dashboard/analytics?propertyId=suburban-house-details-id');

    // Expected Result: Total metric cards are visible
    await expect(page.locator('.analytics-metric-card')).toHaveCount(3); // Views, Saves, Inquiries
    
    // Check charts display canvas
    const chartArea = page.locator('.recharts-responsive-container');
    await expect(chartArea).toBeVisible();

    // Toggle range selection to 90 Days
    await page.getByLabel('Select Range').selectOption('90days');
    
    // Verify chart reload animation skeleton or data points load
    await expect(page.locator('.chart-loading-skeleton')).not.toBeVisible();
    await expect(chartArea).toBeVisible();
  });

  /**
   * TC-FE-601-02 (UI & Edge Case)
   * Requirement Mapping: US-601-1
   * Priority: Medium
   */
  test('TC-FE-601-02: Zero metrics screen shows recommendations details to help user improve listing', async ({ page }) => {
    // Navigate to a newly created property listing with zero analytics views
    await page.goto('/dashboard/analytics?propertyId=new-empty-property-id');

    // Expected Result: Metrics cards display 0. Suggestion block details are visible
    await expect(page.locator('.metric-value').first()).toHaveText('0');
    
    const recommendations = page.locator('.analytics-tips-card');
    await expect(recommendations).toBeVisible();
    await expect(recommendations).toContainText('Consider lowering price by 5% or adding more high-quality photos');
  });
});
