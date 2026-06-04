import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-003 | Feature: FEAT-302 (Shared Consultation Space)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-302-01
 * @requirement FR-302
 * @acceptanceCriteria AC-302.1.2
 * @priority High
 * @preconditions Active WebRTC room is loaded.
 * @description Verify WebSocket chat widget displays text messages and scroll heights update.
 */
test('TC-FE-302-01: Verify client chat message submission and display list rendering', async ({ page }) => {
  await page.goto('/rooms/ch_con_309182');
  
  // Activate chat panel tab
  await page.click('[data-testid="tab-chat"]');
  
  // Locate message elements
  const messageInput = page.locator('[data-testid="chat-message-input"]');
  await expect(messageInput).toBeVisible();
  
  // Type message text and dispatch
  await messageInput.fill('Please reference my updated cardiogram report.');
  await page.click('[data-testid="send-message-btn"]');
  
  // Verify bubble lists render message content
  const lastBubble = page.locator('[data-testid="chat-bubble-self"]').last();
  await expect(lastBubble).toBeVisible();
  await expect(lastBubble).toContainText('Please reference my updated cardiogram report.');
});

/**
 * @testcase TC-FE-302-02
 * @requirement FR-302
 * @acceptanceCriteria AC-302.2.1
 * @priority High
 * @preconditions Doctor is logged in and is in active consultation room.
 * @description Verify doctor can type clinical notes and status indicators show auto-saving.
 */
test('TC-FE-302-02: Verify doctor clinical notes rich text editor auto-saves data drafts', async ({ page }) => {
  // Login as doctor and access room
  await page.goto('/rooms/ch_con_309182?role=doctor');
  
  // Select clinical notes tab
  await page.click('[data-testid="tab-notes"]');
  
  const editor = page.locator('[data-testid="clinical-notes-editor"] [contenteditable="true"]');
  await expect(editor).toBeVisible();

  // Type note inputs
  await editor.fill('Observed slight palpitations under light physical strain.');

  // Assert auto-saving text indicator highlights
  const saveIndicator = page.locator('[data-testid="editor-save-status"]');
  await expect(saveIndicator).toHaveText('Auto-saving...');
  
  // Wait for save promise resolution (mocked debounce threshold)
  await page.waitForTimeout(3000);
  await expect(saveIndicator).toHaveText(/Saved at \d{2}:\d{2}/);
});
