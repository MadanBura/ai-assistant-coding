import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-3.1 (Interactive Map Interface)
 * MAPPED REQUIREMENTS: FR-301
 * ACCEPTANCE CRITERIA: AC-301, AC-302
 */

test.describe('FT-3.1: Interactive Map Interface E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to Search Map pane split-screen viewport
    await page.goto('/search?view=map');
  });

  /**
   * TC ID: TC-FE-401
   * Type: Integration / UI
   * Preconditions: Browser geolocation capabilities granted, Map canvas active
   * Priority: High
   */
  test('TC-FE-401: Dragging map viewport bounds dynamically refreshes property results card list', async ({ page }) => {
    // Wait for Mapbox canvas elements to mount
    await page.waitForSelector('.mapboxgl-map');

    // Store starting counts of results cards in side-panel
    const initialCardsCount = await page.locator('[data-testid="property-card"]').count();

    // Mock map drag actions using mouse movements controls
    const mapBoundingBox = await page.locator('.mapboxgl-map').boundingBox();
    expect(mapBoundingBox).toBeDefined();

    if (mapBoundingBox) {
      const centerX = mapBoundingBox.x + mapBoundingBox.width / 2;
      const centerY = mapBoundingBox.y + mapBoundingBox.height / 2;
      
      // Perform Drag & Drop
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + 150, centerY + 150, { steps: 10 });
      await page.mouse.up();
    }

    // Wait for listing data fetch requests to resolve
    await page.waitForResponse(response => response.url().includes('/api/v1/properties') && response.status() === 200);

    // Verify cards listing reloads
    const updatedCardsCount = await page.locator('[data-testid="property-card"]').count();
    expect(updatedCardsCount).not.toBe(initialCardsCount);
  });

  /**
   * TC ID: TC-FE-402
   * Type: Performance / UI Interaction
   * Preconditions: Map zoomed out to cluster triggers
   * Priority: Medium
   */
  test('TC-FE-402: Verify markers cluster dynamically into grouping numbers when zooming map canvas out', async ({ page }) => {
    await page.waitForSelector('.mapboxgl-map');

    // Trigger zoom-out action click 3 times
    for (let i = 0; i < 3; i++) {
      await page.click('.mapboxgl-ctrl-zoom-out');
    }

    // Wait for layout updates
    await page.waitForTimeout(1000);

    // Verify cluster icons render
    const clusterIcons = page.locator('.mapboxgl-marker.cluster-pin');
    await expect(clusterIcons.first()).toBeVisible();
    
    // Assert clicking a cluster changes zoom states
    const initialZoom = await page.evaluate(() => window.location.search); // Mock parameter check or check coordinates
    await clusterIcons.first().click();
    await page.waitForTimeout(500);
    // Cluster splits into pins or tighter zooms
    await expect(clusterIcons.first()).not.toBeAttached();
  });

});
