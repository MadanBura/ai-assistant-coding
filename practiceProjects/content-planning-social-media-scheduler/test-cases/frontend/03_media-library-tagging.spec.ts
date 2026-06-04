import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('FEAT-401: Media Library & Asset Tagging (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
    await page.goto('/media-library');
  });

  /**
   * TC ID: TC-FE-301
   * Requirement Mapping: FR-401-2, FR-401-3
   * AC Mapping: AC-402-1, AC-402-2
   * Test Type: Validation / Negative / UI
   * Preconditions: Navigated to Media Library.
   * Steps:
   *   1. Select upload area.
   *   2. Upload a file exceeding limits (e.g. 20MB image file) or invalid extension (e.g., `script.exe`).
   * Expected Result: Upload action aborts, client error notification triggers: "File exceeds maximum size limits (10MB)" or "Invalid file format".
   * Priority: HIGH
   */
  test('TC-FE-301: Validate Client-side Media Size and Format Constraints', async ({ page }) => {
    // Set file upload buffer configuration using Playwright's helper
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="file-upload-dropzone"]');
    const fileChooser = await fileChooserPromise;

    // Simulate selecting forbidden file format
    await fileChooser.setFiles({
      name: 'malicious_script.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('mock binary execution script content')
    });

    const errorAlert = page.locator('[data-testid="upload-error-banner"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Unsupported file format');
  });

  /**
   * TC ID: TC-FE-302
   * Requirement Mapping: FR-401-1, FR-401-4
   * AC Mapping: AC-401-1, AC-401-2
   * Test Type: Functional / UI / Integration
   * Preconditions: Uploading a valid image file.
   * Steps:
   *   1. Upload valid 2MB JPEG image.
   * Expected Result: Progress loading bar renders, completes to 100%, and thumbnail card renders in active media asset grid.
   * Priority: HIGH
   */
  test('TC-FE-302: Verify Successful Image Upload and Card Grid Renders', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="file-upload-dropzone"]');
    const fileChooser = await fileChooserPromise;

    // Select valid image file
    await fileChooser.setFiles({
      name: 'summer_promo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mock binary image content data')
    });

    // Check loading state animation indicator
    const progressBar = page.locator('[data-testid="upload-progress-bar"]');
    await expect(progressBar).toBeVisible();

    // Check thumbnail card elements in media list
    const firstAssetCard = page.locator('[data-testid="media-card-summer_promo.jpg"]').first();
    await expect(firstAssetCard).toBeVisible();
  });

  /**
   * TC ID: TC-FE-303
   * Requirement Mapping: FR-401-5, FR-401-6
   * AC Mapping: AC-401-3
   * Test Type: Functional / UI / Accessibility
   * Preconditions: Media card list is visible.
   * Steps:
   *   1. Click on newly uploaded asset card.
   *   2. Open tag editing field in side drawer.
   *   3. Enter tag "campaign2026" and press Enter.
   * Expected Result: Tag is added as a visual chip containing a delete button. Keyboard focus cycles correctly inside form fields.
   * Priority: MEDIUM
   */
  test('TC-FE-303: Apply Asset Tags and Verify Badge Renders', async ({ page }) => {
    // Select first asset card to open details drawer
    await page.click('[data-testid="media-card-summer_promo.jpg"]');
    const drawer = page.locator('[data-testid="media-details-drawer"]');
    await expect(drawer).toBeVisible();

    const tagInput = page.locator('[data-testid="media-tag-input"]');
    await tagInput.fill('campaign2026');
    await page.keyboard.press('Enter');

    // Asserts tag chip component exists
    const chip = page.locator('[data-testid="tag-chip-campaign2026"]');
    await expect(chip).toBeVisible();
    await expect(chip.locator('[data-testid="remove-tag-btn"]')).toBeVisible();
  });
});
