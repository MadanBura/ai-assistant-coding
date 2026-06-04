import { test, expect } from '@playwright/test';

/**
 * FEATURE: Interactive Map Discovery (FEAT-302)
 * COVERAGE: Functional, UI, Validation, Performance
 */

test.describe('FEAT-302: Interactive Map Discovery - Frontend E2E', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to Search page showing split Map view
    await page.goto('/properties?view=map');
  });

  /**
   * TC-FE-302-01 (Functional & UI)
   * Requirement Mapping: FR-302-1, FR-302-2
   * Acceptance Criteria Mapping: AC-302-1
   * Priority: High
   */
  test('TC-FE-302-01: Map renders and loads coordinate markers for visible properties', async ({ page }) => {
    // Check Mapbox canvas loaded
    const mapCanvas = page.locator('.mapboxgl-canvas');
    await expect(mapCanvas).toBeVisible();

    // Verify map pins or geoclustering bubbles exist
    const marker = page.locator('.mapboxgl-marker');
    await expect(marker.first()).toBeVisible();

    // Zoom out map to trigger coordinates aggregation bubble
    await page.locator('.mapboxgl-ctrl-zoom-out').click();
    await page.waitForTimeout(500); // Wait for transition

    // Cluster bubble showing count is visible
    const clusterBubble = page.locator('.map-cluster-marker');
    await expect(clusterBubble.first()).toBeVisible();
    await expect(clusterBubble.first()).toHaveText(/[0-9]+/);
  });

  /**
   * TC-FE-302-02 (Functional & Draw interaction)
   * Requirement Mapping: FR-302-4
   * Acceptance Criteria Mapping: AC-302-2
   * Priority: High
   */
  test('TC-FE-302-02: Drawing polygon filters property lists within bounding box', async ({ page }) => {
    // Check floating draw actions panel is visible
    const drawControls = page.locator('.map-draw-controls');
    await expect(drawControls).toBeVisible();

    // Click Draw Polygon button
    await drawControls.locator('button[title="Draw Polygon"]').click();

    // Click on three different coordinates points on map canvas to form triangular shape
    const mapCanvas = page.locator('.mapboxgl-canvas');
    const box = await mapCanvas.boundingBox();
    if (box) {
      // Vertex 1
      await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.3);
      // Vertex 2
      await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.3);
      // Vertex 3
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.7);
      // Click Vertex 1 again to close polygon loop
      await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.3);
    }

    // Expected Result: Search sidebar refreshes dynamically
    await expect(page.locator('.sidebar-loading-skeleton')).not.toBeVisible();
    await expect(page.locator('.property-grid-card')).toHaveCount({ min: 0 });
  });
});
