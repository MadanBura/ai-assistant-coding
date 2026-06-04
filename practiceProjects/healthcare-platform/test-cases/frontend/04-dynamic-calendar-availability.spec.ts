import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-001 | Feature: FEAT-103 (Dynamic Calendar Availability Builder)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-103-01
 * @requirement FR-103
 * @acceptanceCriteria AC-103.1.1
 * @priority High
 * @preconditions Doctor is logged in and navigates to calendar planner settings.
 * @description Verify doctor can save custom weekly templates with multiple daily intervals.
 */
test('TC-FE-103-01: Verify doctor can save recurring weekly intervals template', async ({ page }) => {
  await page.goto('/doctor/settings/availability');
  
  // Set default slot duration
  await page.selectOption('[data-testid="slot-duration-select"]', '30');

  // Toggle Monday template settings
  await page.check('[data-testid="day-toggle-monday"]');
  
  // Click Add Interval
  await page.click('[data-testid="add-interval-monday"]');
  
  // Input ranges
  await page.fill('[data-testid="monday-interval-0-start"]', '09:00');
  await page.fill('[data-testid="monday-interval-0-end"]', '12:00');

  await page.click('[data-testid="add-interval-monday"]');
  await page.fill('[data-testid="monday-interval-1-start"]', '13:00');
  await page.fill('[data-testid="monday-interval-1-end"]', '17:00');

  // Save changes
  await page.click('[data-testid="save-schedule-btn"]');
  
  // Assert success notification
  const successToast = page.locator('[data-testid="success-toast"]');
  await expect(successToast).toBeVisible();
  await expect(successToast).toContainText('Settings saved successfully');
});

/**
 * @testcase TC-FE-103-02
 * @requirement FR-103
 * @acceptanceCriteria AC-103.1.2
 * @priority Medium
 * @preconditions Doctor has existing weekly schedule template configured.
 * @description Verify doctor can block a specific date on the exclusion calendar grid.
 */
test('TC-FE-103-02: Verify calendar exclusion date blocks slots on calendar grid', async ({ page }) => {
  await page.goto('/doctor/settings/availability');
  
  // Open date exclusions picker modal
  await page.click('[data-testid="exclusions-calendar-day-2026-07-04"]');
  
  // Verify modal is active
  const modal = page.locator('[data-testid="exclusion-modal"]');
  await expect(modal).toBeVisible();
  
  // Fill details and submit
  await page.check('[data-testid="block-all-day-checkbox"]');
  await page.fill('[data-testid="exclusion-reason-input"]', 'Independence Day Holiday');
  await page.click('[data-testid="save-exclusion-btn"]');
  
  // Assert date displays blocked indicators
  const blockedDay = page.locator('[data-testid="exclusions-calendar-day-2026-07-04"]');
  await expect(blockedDay).toHaveClass(/blocked-date/);
});
