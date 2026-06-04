import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-2.1 (Rich Property Listing Builder)
 * MAPPED REQUIREMENTS: FR-201
 * ACCEPTANCE CRITERIA: AC-201, AC-202
 */

test.describe('FT-2.1: Rich Property Listing Builder E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Log in as Agent first
    await page.goto('/auth/login');
    await page.fill('[data-testid="login-email"]', 'agent@example.com');
    await page.fill('[data-testid="login-password"]', 'Password123!');
    await page.click('[data-testid="login-submit-btn"]');
    await page.waitForURL('/dashboard');
    await page.goto('/listings/create');
  });

  /**
   * TC ID: TC-FE-201
   * Type: Functional / UI
   * Preconditions: User logged in as Agent, on Step 1 of listing form
   * Priority: Critical
   */
  test('TC-FE-201: Successfully submit a residential listing through the step-by-step form wizard', async ({ page }) => {
    // STEP 1: Basic Details
    await page.fill('[data-testid="listing-title"]', 'Beautiful Suburban Villa');
    await page.fill('[data-testid="listing-description"]', 'Exquisite 3 bed 2 bath house located in high rating school district.');
    await page.selectOption('[data-testid="listing-type"]', 'Residential');
    await page.fill('[data-testid="listing-price"]', '450000');
    await page.click('[data-testid="wizard-next-btn"]');

    // STEP 2: Specifications
    await expect(page.locator('[data-testid="wizard-step-header"]')).toContainText('Step 2: Specifications');
    await page.fill('[data-testid="listing-beds"]', '3');
    await page.fill('[data-testid="listing-baths"]', '2.5');
    await page.fill('[data-testid="listing-sqft"]', '1850');
    await page.fill('[data-testid="listing-year"]', '2018');
    await page.click('[data-testid="amenity-pool-cb"]');
    await page.click('[data-testid="wizard-next-btn"]');

    // STEP 3: Media & Location
    await expect(page.locator('[data-testid="wizard-step-header"]')).toContainText('Step 3: Media & Location');
    await page.fill('[data-testid="listing-address-autocomplete"]', '123 Maple Street');
    // Select autocomplete option from list
    await page.click('[data-testid="address-suggest-0"]');

    // Drag and drop mock image uploads and PDF deed uploads
    await page.setInputFiles('[data-testid="media-dropzone"]', [
      { name: 'living_room.png', mimeType: 'image/png', buffer: Buffer.from('') },
      { name: 'kitchen.png', mimeType: 'image/png', buffer: Buffer.from('') },
      { name: 'garden.png', mimeType: 'image/png', buffer: Buffer.from('') }
    ]);
    await page.setInputFiles('[data-testid="deed-pdf-uploader"]', {
      name: 'title_deed.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 ...')
    });

    await page.click('[data-testid="listing-submit-btn"]');
    await expect(page.locator('[data-testid="listing-success-toast"]')).toBeVisible();
    await page.waitForURL('/dashboard/listings');
  });

  /**
   * TC ID: TC-FE-202
   * Type: Edge Case / Validation
   * Preconditions: Agent filling form, loses network connection
   * Priority: Medium
   */
  test('TC-FE-202: Verify LocalStorage autosave recovery on page crash or refresh', async ({ page }) => {
    // Fill out Step 1 fields
    await page.fill('[data-testid="listing-title"]', 'Temporary Beach House');
    await page.fill('[data-testid="listing-price"]', '850000');

    // Wait for autosave trigger
    await page.waitForTimeout(6000);

    // Refresh page to mock crash
    await page.reload();

    // Verify fields are restored from LocalStorage
    await expect(page.locator('[data-testid="listing-title"]')).toHaveValue('Temporary Beach House');
    await expect(page.locator('[data-testid="listing-price"]')).toHaveValue('850000');
  });

});
