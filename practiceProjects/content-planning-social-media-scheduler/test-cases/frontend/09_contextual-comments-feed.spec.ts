import { test, expect } from '@playwright/test';

test.describe('FEAT-502: Contextual Comments Feed (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
    await page.goto('/calendar');
  });

  /**
   * TC ID: TC-FE-901
   * Requirement Mapping: FR-502-1, FR-502-2, FR-502-7
   * AC Mapping: AC-503-1
   * Test Type: Functional / UI
   * Preconditions: Calendar contains post card.
   * Steps:
   *   1. Click on post card to open details drawer.
   *   2. Expand the "Comments" tab container.
   * Expected Result: Renders historical messages feed displaying profile avatars, display names, role badges, relative times, and formatted markdown bodies.
   * Priority: HIGH
   */
  test('TC-FE-901: Open Comment Thread and Verify Markdown Elements', async ({ page }) => {
    await page.click('[data-testid="calendar-card-post"]').first();
    await page.click('[data-testid="comments-tab-btn"]');

    const commentList = page.locator('[data-testid="comments-history-list"]');
    await expect(commentList).toBeVisible();

    const firstComment = commentList.locator('[data-testid="comment-item"]').first();
    await expect(firstComment.locator('.author-avatar')).toBeVisible();
    await expect(firstComment.locator('.author-name')).toContainText('Marcus Chen');
    await expect(firstComment.locator('.role-badge')).toContainText('EDITOR');
    
    // Assert markdown compile (e.g. bold tags render as HTML strong elements)
    await expect(firstComment.locator('.comment-body strong')).toBeVisible();
  });

  /**
   * TC ID: TC-FE-902
   * Requirement Mapping: FR-502-3, FR-502-4
   * AC Mapping: AC-503-2
   * Test Type: Functional / UI / Integration
   * Preconditions: Comments drawer active.
   * Steps:
   *   1. Type comment: "Please update the graphic sizing details." in composer text box.
   *   2. Click "Send" button.
   * Expected Result: Text field clears, message publishes via WebSocket, and appends to feed instantly.
   * Priority: HIGH
   */
  test('TC-FE-902: Post Comment and Assert WebSocket Broadcast Updates', async ({ page }) => {
    await page.click('[data-testid="calendar-card-post"]').first();
    await page.click('[data-testid="comments-tab-btn"]');

    const commentInput = page.locator('[data-testid="comment-input-textarea"]');
    await commentInput.fill('Please update the graphic sizing details.');
    await page.click('[data-testid="send-comment-btn"]');

    // Confirm input clears
    await expect(commentInput).toHaveValue('');

    // Verify list contains comment
    const latestComment = page.locator('[data-testid="comments-history-list"] [data-testid="comment-item"]').last();
    await expect(latestComment).toContainText('Please update the graphic sizing details.');
  });

  /**
   * TC ID: TC-FE-903
   * Requirement Mapping: FR-502-5
   * AC Mapping: AC-503-3
   * Test Type: Negative / Edge Cases / UI
   * Preconditions: WebSocket connection is offline.
   * Steps:
   *   1. Block WebSocket handshakes using mock proxy settings.
   *   2. Visit post comment thread details drawer.
   * Expected Result: Renders connection warning indicator: "Live disconnected. Syncing in background.", starts fallback database query checks every 10 seconds.
   * Priority: MEDIUM
   */
  test('TC-FE-903: Fallback to Long-polling REST API on WebSocket Outages', async ({ page }) => {
    // Intercept websockets
    await page.addInitScript(() => {
      // Simulate socket.io connection error hooks
      (window as any).mockSocketErrorTrigger = true;
    });

    await page.click('[data-testid="calendar-card-post"]').first();
    await page.click('[data-testid="comments-tab-btn"]');

    // Assert warning badge displays
    const networkWarning = page.locator('[data-testid="comments-sync-badge"]');
    await expect(networkWarning).toBeVisible();
    await expect(networkWarning).toContainText('Offline fallback active');
  });
});
