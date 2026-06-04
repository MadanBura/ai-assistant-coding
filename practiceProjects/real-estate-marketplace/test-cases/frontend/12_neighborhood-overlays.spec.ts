import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-3.2 (Neighborhood Data Overlays)
 * MAPPED REQUIREMENTS: FR-302
 * ACCEPTANCE CRITERIA: AC-303, AC-304
 */

test.describe('FT-3.2: Neighborhood Data Overlays E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to maps view pane
    await page.goto('/search?view=map');
  });

  /**
   * TC ID: TC-FE-1201
   * Type: Integration / UI
   * Preconditions: Maps canvas ready
   * Priority: Medium
   */
  test('TC-FE-1201: Toggle overlays layer selectors renders schools pins and badged grades markers', async ({ page }) => {
    await page.waitForSelector('.mapboxgl-map');

    // Float layer settings panels must exist
    const layersBox = page.locator('[data-testid="map-overlays-panel"]');
    await expect(layersBox).toBeVisible();

    // Select schools overlay checkbox
    await page.click('[data-testid="overlay-cb-schools"]');

    // Wait for geoJSON endpoints returns
    await page.waitForResponse(r => r.url().includes('/api/v1/neighborhoods/overlays') && r.status() === 200);

    // Verify school specific pins render on Mapbox canvas container
    const schoolMarker = page.locator('.mapboxgl-marker.school-badge-pin');
    await expect(schoolMarker.first()).toBeVisible();

    // Click school pin to inspect popover contents
    await schoolMarker.first().click();
    await expect(page.locator('[data-testid="school-popover-grade"]')).toContainText('Grade: A');
  });

  /**
   * TC ID: TC-FE-1202
   * Type: Accessibility / UI
   * Preconditions: Map layers active
   * Priority: Medium
   */
  test('TC-FE-1202: Map legend panel details contain appropriate contrast tags matching theme color variables', async ({ page }) => {
    await page.goto('/search?view=map');
    await page.click('[data-testid="overlay-cb-schools"]');

    // Legend panel displays
    const legendPanel = page.locator('[data-testid="map-legend-panel"]');
    await expect(legendPanel).toBeVisible();

    // Verify label keys exist with clear contrast indicators
    const legendLabel = legendPanel.locator('[data-testid="legend-label-schools"]');
    await expect(legendLabel).toContainText('Schools');
    const colorIndicator = legendLabel.locator('.legend-color-box');
    await expect(colorIndicator).toHaveCSS('background-color', 'rgb(0, 0, 255)'); // Verify bright blue representation index matches specs
  });

});
