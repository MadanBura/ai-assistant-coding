import { test, expect } from '@playwright/test';

test.describe('FEAT-302: Smart Hashtag Generator (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
    await page.goto('/posts/new');
  });

  /**
   * TC ID: TC-FE-801
   * Requirement Mapping: FR-302-1, FR-302-3
   * AC Mapping: AC-302-1
   * Test Type: Functional / UI
   * Preconditions: Content text is populated in composer area.
   * Steps:
   *   1. Fill textarea: "We are recruiting engineers for our remote database team".
   *   2. Click "Suggest Hashtags" tool button.
   * Expected Result: Renders tag loader, then displays a horizontal badges grid containing hashtag recommendations (e.g. `#Database`, `#RemoteJob`).
   * Priority: HIGH
   */
  test('TC-FE-801: Generate Hashtag Recommendations from Caption Text', async ({ page }) => {
    const composerTextarea = page.locator('[data-testid="post-caption-textarea"]');
    await composerTextarea.fill('We are recruiting engineers for our remote database team');

    await page.click('[data-testid="suggest-hashtags-btn"]');

    // Confirm suggestion badges exist
    const badgeContainer = page.locator('[data-testid="hashtag-suggestions-tray"]');
    await expect(badgeContainer).toBeVisible();

    const badges = badgeContainer.locator('.hashtag-badge');
    await expect(badges.first()).toBeVisible();
    await expect(badges).toHaveCount(5);
  });

  /**
   * TC ID: TC-FE-802
   * Requirement Mapping: FR-302-5, FR-302-6
   * AC Mapping: AC-302-2, AC-302-3
   * Test Type: Functional / UI / Validation
   * Preconditions: Suggestion badges are displayed.
   * Steps:
   *   1. Click on first hashtag suggestion badge `#RemoteJob`.
   *   2. Verify tag appends to textarea text stream.
   *   3. Click on the same hashtag suggestion badge again.
   * Expected Result: Hashtag appends on first click. Second click is ignored to prevent duplicating `#RemoteJob #RemoteJob`.
   * Priority: HIGH
   */
  test('TC-FE-802: Append Selected Tag and Enforce Duplicate Checks', async ({ page }) => {
    const composerTextarea = page.locator('[data-testid="post-caption-textarea"]');
    await composerTextarea.fill('We are recruiting engineers for our remote database team');
    await page.click('[data-testid="suggest-hashtags-btn"]');

    const badge = page.locator('.hashtag-badge', { hasText: '#RemoteJob' }).first();
    await expect(badge).toBeVisible();

    // Click 1: Appends tag
    await badge.click();
    await expect(composerTextarea).toHaveValue(/#RemoteJob/);

    // Click 2: Verify duplicate suppression
    const textBefore = await composerTextarea.inputValue();
    await badge.click();
    const textAfter = await composerTextarea.inputValue();
    expect(textBefore).toBe(textAfter);
  });

  /**
   * TC ID: TC-FE-803
   * Requirement Mapping: FR-302-1
   * AC Mapping: AC-302-4
   * Test Type: Negative / UI / Validation
   * Preconditions: Input string is too short.
   * Steps:
   *   1. Input "Short" (5 characters) in composer textarea.
   *   2. Click "Suggest Hashtags".
   * Expected Result: Blocks execution and fires warning toast: "Caption text too short for tag suggestions."
   * Priority: MEDIUM
   */
  test('TC-FE-803: Enforce Minimum Caption Length for Suggestion Requests', async ({ page }) => {
    await page.locator('[data-testid="post-caption-textarea"]').fill('Short');
    await page.click('[data-testid="suggest-hashtags-btn"]');

    const toast = page.locator('.toast-warning');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Caption text too short');
  });
});
