import { test, expect } from '@playwright/test';

/**
 * FEATURE: Inquiry Messaging System (FEAT-501)
 * COVERAGE: Functional, UI, WebSockets, Edge Cases
 */

test.describe('FEAT-501: Inquiry Messaging System - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Pre-condition: Login as Buyer
    await page.goto('/login');
    await page.getByLabel('Email').fill('sarah.buyer@example.com');
    await page.getByLabel('Password').fill('SecureBuyer123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');
  });

  /**
   * TC-FE-501-01 (Functional & E2E Chat flow)
   * Requirement Mapping: FR-501, US-501-1
   * Acceptance Criteria Mapping: AC-501-1, AC-501-2
   * Priority: High
   */
  test('TC-FE-501-01: Buyer submits property inquiry and initiates live chat session', async ({ page }) => {
    // Go to property listing details page
    await page.goto('/properties/suburban-house-details-id');

    // Confirm contact widget is visible
    const contactForm = page.locator('.listing-contact-widget');
    await expect(contactForm).toBeVisible();

    // Fill message and submit
    await contactForm.locator('textarea[name="inquiryMessage"]').fill('Hello, is this property available for viewing this Saturday?');
    await contactForm.locator('button:has-text("Send Inquiry")').click();

    // Expected Result: Redirection to inbox thread dashboard
    await page.waitForURL(/\/inbox\/thread_.*/);
    
    // Validate live chat input window loading
    const chatTimeline = page.locator('.chat-timeline-messages');
    await expect(chatTimeline).toBeVisible();
    await expect(chatTimeline.locator('.message-bubble').first()).toContainText('Hello, is this property available');

    // Simulate sending follow-up text via WebSocket
    await page.locator('textarea[name="chatReply"]').fill('Also, are there parking charges?');
    await page.locator('button:has-text("Send")').click();

    // Check message immediately appended without reload
    await expect(chatTimeline.locator('.message-bubble')).toHaveCount(2);
  });

  /**
   * TC-FE-501-02 (Edge Case & UI Block)
   * Requirement Mapping: US-501-1
   * Priority: Medium
   */
  test('TC-FE-501-02: Message panel displays block message if property status is archived', async ({ page }) => {
    // Navigate to thread of archived property
    await page.goto('/inbox/thread-archived-property-id');

    // Expected Result: Input textarea is disabled, error banner displayed
    const inputArea = page.locator('textarea[name="chatReply"]');
    await expect(inputArea).toBeDisabled();

    const banner = page.locator('.chat-locked-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveText('This property listing is no longer active. Conversions are locked.');
  });
});
