const { test, expect } = require('@playwright/test');

test.describe('Notification System (FE-502) - E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await page.goto('/trips/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed');
  });

  test('TC-FE-502.1: Functional & UI - Render Notifications Bell Dropdown (AC-502.1)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-5.3
    // Steps: Click bell icon in header bar, view notifications list
    const bellIcon = page.locator('[data-testid="btn-notifications-bell"]');
    await expect(bellIcon).toBeVisible();

    // Verify unread dot exists
    await expect(bellIcon.locator('[data-testid="unread-notification-dot"]')).toBeVisible();
    await bellIcon.click();

    // Verify unread notification appears inside dropdown panel
    const notificationItem = page.locator('[data-testid="notification-item"]').first();
    await expect(notificationItem).toBeVisible();
    await expect(notificationItem).toContainText(/budget|flight/i);

    // Click "Mark as Read"
    await notificationItem.locator('[data-testid="btn-mark-read"]').click();
    await expect(bellIcon.locator('[data-testid="unread-notification-dot"]')).not.toBeVisible();
  });

  test('TC-FE-502.2: Functional & Integration - Settings Toggles (AC-502.3)', async ({ page }) => {
    // Priority: Medium
    // Requirement Mapping: FR-5.3
    // Steps: Navigate to Settings, disable email alerts, verify success message
    await page.click('[data-testid="btn-user-profile"]');
    await page.click('[data-testid="menu-settings"]');

    const emailToggle = page.locator('[data-testid="toggle-email-alerts"]');
    await expect(emailToggle).toBeChecked();
    
    // Uncheck toggle and save
    await emailToggle.uncheck();
    await page.click('[data-testid="btn-save-settings"]');

    // Expected Result: Settings successfully persisted
    await expect(page.locator('[data-testid="toast-notification"]')).toContainText(/settings saved/i);
    await page.reload();
    await expect(emailToggle).not.toBeChecked();
  });
});
