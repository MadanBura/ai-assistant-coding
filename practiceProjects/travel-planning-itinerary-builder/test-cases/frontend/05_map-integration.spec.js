const { test, expect } = require('@playwright/test');

test.describe('Interactive Map Integration (FE-202) - E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await page.goto('/trips/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed');
    await page.click('[data-testid="tab-map"]');
  });

  test('TC-FE-202.1: Functional & UI - Render Markers on Map Canvas (AC-202.1)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-2.3
    // Steps: Validate map canvas is loaded and markers are plotted for geocoded stops
    const mapCanvas = page.locator('[data-testid="trip-map-canvas"]');
    await expect(mapCanvas).toBeVisible();

    // Check presence of markers
    const marker = page.locator('[data-testid="map-marker-Louvre-Museum"]');
    await expect(marker).toBeVisible();
    await marker.click();

    // Click marker opens detail popup card
    const popup = page.locator('[data-testid="map-marker-popup"]');
    await expect(popup).toBeVisible();
    await expect(popup).toContainText('Louvre Museum');
  });

  test('TC-FE-202.2: Edge Case & Validation - Unresolved Address warning card (AC-202.1)', async ({ page }) => {
    // Priority: Medium
    // Requirement Mapping: FR-2.3
    // Preconditions: Activity has an invalid unresolvable street address: "FakeLandia Address"
    // Steps: Verify card has warning flag, map does not break.
    await page.click('[data-testid="tab-itinerary"]');
    const warningItem = page.locator('[data-testid="itinerary-item-card"]:has-text("FakeLandia Destination")');
    
    // Renders visual warning indicators
    await expect(warningItem.locator('[data-testid="warning-unresolved-address"]')).toBeVisible();
    
    // Switch to map view, check that map canvas remains responsive
    await page.click('[data-testid="tab-map"]');
    await expect(page.locator('[data-testid="trip-map-canvas"]')).toBeVisible();
  });
});
