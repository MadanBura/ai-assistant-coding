import { test, expect } from '@playwright/test';

/**
 * FEATURE: Listing Status Lifecycle (FEAT-202)
 * COVERAGE: Functional, UI, Edge Cases
 */

test.describe('FEAT-202: Listing Status Lifecycle - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Pre-condition: Login as Owner and load properties dashboard
    await page.goto('/login');
    await page.getByLabel('Email').fill('david.owner@example.com');
    await page.getByLabel('Password').fill('SecureOwner123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');
  });

  /**
   * TC-FE-202-01 (Functional & UI)
   * Requirement Mapping: FR-202-1, BR-003
   * Acceptance Criteria Mapping: AC-202-1
   * Priority: High
   */
  test('TC-FE-202-01: Owner transitions property listing status to Sold', async ({ page }) => {
    // Select property card dropdown menu
    const propertyCard = page.locator('data-testid=property-card-suburban-house');
    await expect(propertyCard).toBeVisible();

    // Confirm initial badge displays Published
    await expect(propertyCard.locator('.status-badge')).toHaveText('Published');

    // Trigger action menu
    await propertyCard.locator('.action-menu-trigger').click();
    await page.locator('text=Mark as Sold').click();

    // Expected Result: Badge turns purple and displays Sold. Action menu shifts options
    await expect(propertyCard.locator('.status-badge')).toHaveText('Sold');
    await propertyCard.locator('.action-menu-trigger').click();
    await expect(page.locator('text=Mark as Sold')).not.toBeVisible();
    await expect(page.locator('text=Relist Property')).toBeVisible();
  });

  /**
   * TC-FE-202-02 (Functional & Redirect Verification)
   * Requirement Mapping: FR-202-2
   * Acceptance Criteria Mapping: AC-202-2
   * Priority: High
   */
  test('TC-FE-202-02: Editing key variables changes status badge back to Pending', async ({ page }) => {
    const propertyCard = page.locator('data-testid=property-card-suburban-house');
    await propertyCard.locator('.action-menu-trigger').click();
    await page.locator('text=Edit Details').click();

    // Verify redirected to edit form and modify Price
    await expect(page).toHaveURL(/\/properties\/.*\/edit/);
    await page.getByLabel('Price').fill('620000'); // reduce price
    await page.locator('button:has-text("Save Changes")').click();

    // Expected Result: Dashboard displays badge reverted to Pending
    await page.waitForURL('/dashboard');
    await expect(propertyCard.locator('.status-badge')).toHaveText('Pending Moderation');
  });
});
