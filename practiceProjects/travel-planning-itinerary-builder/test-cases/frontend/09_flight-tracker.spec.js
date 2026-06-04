const { test, expect } = require('@playwright/test');

test.describe('Flight Tracker (FE-501) - E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await page.goto('/trips/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed');
  });

  test('TC-FE-501.1: Functional & Integration - Add Flight Code and Sync Itinerary (AC-501.2)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-5.1, FR-5.2
    // Steps: Click add flight, input valid IATA code, save
    await page.click('[data-testid="timeline-column-day-1"] [data-testid="btn-add-activity"]');
    await page.selectOption('[data-testid="select-activity-category"]', 'flight');
    await page.fill('[data-testid="input-flight-code"]', 'UA101');
    await page.click('[data-testid="btn-submit-activity"]');

    // Expected Result: Flight block is created, labeled flight, shows airports EWR -> CDG
    const flightCard = page.locator('[data-testid="itinerary-item-card"]:has-text("UA101")');
    await expect(flightCard).toBeVisible();
    await expect(flightCard.locator('[data-testid="flight-routing"]')).toHaveText('EWR ➔ CDG');
    await expect(flightCard.locator('[data-testid="flight-status-badge"]')).toContainText('Scheduled');
  });

  test('TC-FE-501.2: Validation - Reject Invalid Flight Format (AC-501.1)', async ({ page }) => {
    // Priority: Medium
    // Requirement Mapping: FR-5.1
    // Steps: Enter malformed flight number
    await page.click('[data-testid="timeline-column-day-1"] [data-testid="btn-add-activity"]');
    await page.selectOption('[data-testid="select-activity-category"]', 'flight');
    await page.fill('[data-testid="input-flight-code"]', 'INVALID_123');
    await page.click('[data-testid="btn-submit-activity"]');

    // Expected Result: Local format regex triggers validation error alert
    const errorAlert = page.locator('[data-testid="error-message-activity"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/invalid/i);
  });
});
