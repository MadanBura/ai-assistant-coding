import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-007 | Feature: FEAT-702 (Multichannel Notification Hub)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-702-01
 * @requirement FR-702
 * @acceptanceCriteria AC-702.2.1
 * @priority High
 * @preconditions Patient is in dashboard view.
 * @description Verify notifications popover displays alerts lists.
 */
test('TC-FE-702-01: Verify notification center popover renders lists and triggers read-status changes', async ({ page }) => {
  await page.goto('/patient/dashboard');
  
  // Locate notification bell and verify active unread indicators displays
  const bellBtn = page.locator('[data-testid="notifications-bell-icon"]');
  await expect(bellBtn).toBeVisible();
  await expect(bellBtn.locator('[data-testid="unread-badge-count"]')).toHaveText(/\d+/);

  // Click to open popover drawer
  await bellBtn.click();
  
  const popover = page.locator('[data-testid="notifications-popover-panel"]');
  await expect(popover).toBeVisible();
  
  // Verify first alert contains text
  const alertRow = popover.locator('[data-testid="notification-item"]').first();
  await expect(alertRow).toBeVisible();
  
  // Click dismiss 'Mark all as read'
  await page.click('[data-testid="mark-all-read-link"]');
  
  // Verify unread badge hides
  await expect(bellBtn.locator('[data-testid="unread-badge-count"]')).not.toBeVisible();
});

/**
 * @testcase TC-FE-702-02
 * @requirement FR-702
 * @acceptanceCriteria AC-702.1.2
 * @priority Medium
 * @preconditions Patient settings panel is open.
 * @description Verify changing alert preferences switches config flags.
 */
test('TC-FE-702-02: Verify alerts preferences sliders save configuration flags', async ({ page }) => {
  await page.goto('/patient/settings');
  
  const smsToggle = page.locator('[data-testid="sms-alerts-switch"]');
  await expect(smsToggle).toBeVisible();
  
  // Toggle switches
  await smsToggle.uncheck();
  
  // Click save
  await page.click('[data-testid="save-preferences-btn"]');
  
  // Verify success confirmation displays
  const toast = page.locator('[data-testid="success-toast"]');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('Preferences updated');
});
