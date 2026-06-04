import { test, expect } from '@playwright/test';

/**
 * FEATURE: Property Creation Wizard (FEAT-201)
 * COVERAGE: Functional, UI, Validation, Negative, Edge Cases, Accessibility
 */

test.describe('FEAT-201: Property Creation Wizard - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Pre-condition: Login as Owner and navigate to creation portal
    await page.goto('/login');
    await page.getByLabel('Email').fill('david.owner@example.com');
    await page.getByLabel('Password').fill('SecureOwner123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');
    await page.goto('/properties/create');
  });

  /**
   * TC-FE-201-01 (Functional & Wizard Flow)
   * Requirement Mapping: FR-201-1, FR-201-2, FR-201-3, FR-201-4
   * Acceptance Criteria Mapping: AC-201-1
   * Priority: High
   */
  test('TC-FE-201-01: Successful Multi-step Residential Property Submission', async ({ page }) => {
    // Step 1: Basic Info
    await expect(page.locator('text=Step 1: Basics')).toBeVisible();
    await page.getByLabel('Property Title').fill('Beautiful 3-Bed Suburban House');
    await page.getByLabel('Description').fill('Stunning three bedroom home located in a quiet family-friendly cul-de-sac. Features open plan living area, massive modern kitchen, private deck, and mature landscaped backyard.');
    await page.getByLabel('Category').selectOption('residential');
    await page.getByLabel('Listing Type').selectOption('sale');
    await page.getByLabel('Price').fill('650000');
    await page.locator('button:has-text("Next")').click();

    // Step 2: Specs & Map Coordinates
    await expect(page.locator('text=Step 2: Specs & Map')).toBeVisible();
    await page.getByLabel('Bedrooms').fill('3');
    await page.getByLabel('Bathrooms').fill('2.5');
    await page.getByLabel('Square Footage').fill('2100');
    await page.getByLabel('Address').fill('456 Oak Lane, Seattle, WA 98122');
    
    // Interact with coordinates pin locator map
    const mapContainer = page.locator('.mapboxgl-map');
    await expect(mapContainer).toBeVisible();
    await mapContainer.click(); // simulate dragging/clicking pin
    await expect(page.getByLabel('Latitude')).not.toHaveValue('');

    await page.locator('button:has-text("Next")').click();

    // Step 3: Media Upload & Amenities
    await expect(page.locator('text=Step 3: Media')).toBeVisible();
    
    // Choose amenities
    await page.locator('label:has-text("Garage")').click();
    await page.locator('label:has-text("Pool")').click();

    // Upload mock image assets (using Playwright file chooser)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('.drag-drop-zone').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([
      'test-cases/mocks/image1.jpg',
      'test-cases/mocks/image2.jpg',
      'test-cases/mocks/image3.jpg'
    ]);

    // Wait for thumbnail load indicator
    await expect(page.locator('.thumbnail-preview')).toHaveCount(3);
    await page.locator('button:has-text("Next")').click();

    // Step 4: Preview and Submit
    await expect(page.locator('text=Step 4: Preview')).toBeVisible();
    await page.locator('button:has-text("Submit for Moderation")').click();

    // Check redirection to dashboard showing pending state
    await page.waitForURL('/dashboard');
    await expect(page.locator('.status-badge')).toHaveText('Pending Moderation');
  });

  /**
   * TC-FE-201-02 (Validation & Negative)
   * Requirement Mapping: FR-201-1, BRL-003
   * Priority: High
   */
  test('TC-FE-201-02: Prevent wizard progression on missing details', async ({ page }) => {
    // Attempt next with empty title and small description
    await page.getByLabel('Property Title').fill('Short Title');
    await page.getByLabel('Description').fill('Too short description.');
    await page.getByLabel('Price').fill('-50'); // Negative price

    await page.locator('button:has-text("Next")').click();

    // Expected Result: Form block errors display, wizard stays on Step 1
    await expect(page.locator('text=Step 1: Basics')).toBeVisible();
    await expect(page.locator('.error-title')).toContainText('Title must be at least 15 characters');
    await expect(page.locator('.error-description')).toContainText('Description must be at least 100 characters');
    await expect(page.locator('.error-price')).toContainText('Price must be a positive number');
  });

  /**
   * TC-FE-201-03 (Edge Case & Auto-save)
   * Requirement Mapping: US-201-2
   * Acceptance Criteria Mapping: AC-201-2
   * Priority: Medium
   */
  test('TC-FE-201-03: Form progress auto-saves locally and handles restoration', async ({ page }) => {
    await page.getByLabel('Property Title').fill('Autosaved Draft Title Check');
    await page.getByLabel('Description').fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.');
    await page.getByLabel('Price').fill('340000');

    // Simulate timer ticks (30s) or check local storage directly
    await page.waitForTimeout(1000); // Wait for auto-save trigger
    
    // Reload page
    await page.reload();

    // Expected Result: Modal prompts user to restore draft
    const restoreModal = page.locator('.restore-draft-modal');
    await expect(restoreModal).toBeVisible();
    await restoreModal.locator('button:has-text("Restore")').click();

    // Verify values restored
    await expect(page.getByLabel('Property Title')).toHaveValue('Autosaved Draft Title Check');
  });
});
