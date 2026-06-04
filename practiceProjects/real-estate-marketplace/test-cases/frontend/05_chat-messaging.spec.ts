import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-5.1 (Monitored Chat System)
 * MAPPED REQUIREMENTS: FR-501
 * ACCEPTANCE CRITERIA: AC-501, AC-502
 */

test.describe('FT-5.1: Monitored Chat System E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Log in as Buyer
    await page.goto('/auth/login');
    await page.fill('[data-testid="login-email"]', 'buyer@example.com');
    await page.fill('[data-testid="login-password"]', 'Password123!');
    await page.click('[data-testid="login-submit-btn"]');
    await page.waitForURL('/dashboard');
  });

  /**
   * TC ID: TC-FE-501
   * Type: Integration / UI
   * Preconditions: Direct chat thread established with an Agent
   * Priority: Critical
   */
  test('TC-FE-501: Send chat message and verify instant rendering in message bubble panel', async ({ page }) => {
    await page.goto('/dashboard/inbox');

    // Select the first thread in lists panel
    await page.click('[data-testid="inbox-thread-card-0"]');

    // Verify chat header matches listing contexts
    await expect(page.locator('[data-testid="chat-header-listing-title"]')).toBeVisible();

    // Input message
    const messagePayload = 'Are pets allowed in the property?';
    await page.fill('[data-testid="chat-input-textarea"]', messagePayload);

    // Send
    await page.click('[data-testid="chat-send-btn"]');

    // Assert bubble renders containing message payload
    const lastMessageBubble = page.locator('[data-testid="message-bubble-sent"]').last();
    await expect(lastMessageBubble).toContainText(messagePayload);
    await expect(lastMessageBubble.locator('[data-testid="message-status-tick"]')).toHaveText('Delivered');
  });

  /**
   * TC ID: TC-FE-502
   * Type: Edge Case / Validation
   * Preconditions: Internet network socket disconnected mid-flight
   * Priority: High
   */
  test('TC-FE-502: Offline state renders retry UI icon next to failed messages', async ({ page }) => {
    await page.goto('/dashboard/inbox');
    await page.click('[data-testid="inbox-thread-card-0"]');

    // Force context offline state client-side
    await page.evaluate(() => {
      // Mock navigator connection parameters
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
    });

    // Enter message
    await page.fill('[data-testid="chat-input-textarea"]', 'Offline text message test');
    await page.click('[data-testid="chat-send-btn"]');

    // Assert retry triggers indicator icon
    const errorBubble = page.locator('[data-testid="message-bubble-error"]').last();
    await expect(errorBubble).toBeVisible();
    await expect(errorBubble.locator('[data-testid="message-retry-btn"]')).toBeVisible();
  });

});
