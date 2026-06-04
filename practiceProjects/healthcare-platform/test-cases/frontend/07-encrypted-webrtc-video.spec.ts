import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-003 | Feature: FEAT-301 (Encrypted WebRTC Video Rooms)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-301-01
 * @requirement FR-301
 * @acceptanceCriteria AC-301.1.3
 * @priority High
 * @preconditions WebRTC consultation call is active.
 * @description Verify call screen control widgets load and trigger mute and share camera states.
 */
test('TC-FE-301-01: Verify video room rendering and track controllers', async ({ page }) => {
  await page.goto('/rooms/ch_con_309182');
  
  // Assert video frames load
  const mainVideo = page.locator('[data-testid="remote-video-viewport"]');
  await expect(mainVideo).toBeVisible();

  const previewVideo = page.locator('[data-testid="local-preview-viewport"]');
  await expect(previewVideo).toBeVisible();

  // Mute audio
  const muteBtn = page.locator('[data-testid="toggle-audio-btn"]');
  await expect(muteBtn).toBeVisible();
  await muteBtn.click();
  await expect(muteBtn).toHaveClass(/muted-state/);

  // Stop video
  const videoBtn = page.locator('[data-testid="toggle-video-btn"]');
  await expect(videoBtn).toBeVisible();
  await videoBtn.click();
  await expect(videoBtn).toHaveClass(/stopped-state/);
});

/**
 * @testcase TC-FE-301-02
 * @requirement FR-301
 * @acceptanceCriteria AC-301.1.2
 * @priority Medium
 * @preconditions User has camera permissions disabled in system settings.
 * @description Verify system displays validation error screen on hardware block.
 */
test('TC-FE-301-02: Verify hardware permission blocker triggers modal guidelines', async ({ page }) => {
  // Access room route
  await page.goto('/rooms/ch_con_309182');
  
  // Trigger mock device permission failure in browser window bindings
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError'));
  });
  
  // Click Join Call
  await page.click('[data-testid="join-call-btn"]');
  
  // Verify modal displays warning details
  const troubleshootingModal = page.locator('[data-testid="hardware-diagnostics-modal"]');
  await expect(troubleshootingModal).toBeVisible();
  await expect(troubleshootingModal.locator('[data-testid="troubleshoot-instructions"]')).toContainText('enable camera permissions');
});
