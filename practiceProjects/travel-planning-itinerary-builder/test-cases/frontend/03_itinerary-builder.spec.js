const { test, expect } = require('@playwright/test');

test.describe('Drag-and-Drop Itinerary Builder (FE-201) - E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Precondition: User logged in, loaded active trip board
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await page.goto('/trips/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed');
  });

  test('TC-FE-201.1: Functional - Drag-and-drop Card Move (AC-201.2)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-2.2
    // Steps: Identify activity card on Day 1, drag it onto Day 2 timeline column
    const sourceCard = page.locator('[data-testid="itinerary-item-card"]:has-text("Visit Louvre Museum")');
    const targetColumn = page.locator('[data-testid="timeline-column-day-2"]');
    
    await expect(sourceCard).toBeVisible();
    await sourceCard.dragTo(targetColumn);

    // Expected Result: Card changes location and timeline saves state
    await expect(targetColumn.locator('[data-testid="itinerary-item-card"]:has-text("Visit Louvre Museum")')).toBeVisible();
    await expect(page.locator('[data-testid="save-status-label"]')).toContainText(/saved/i);
  });

  test('TC-FE-201.2: Validation & Negative - Invalid End Time Rejected (AC-201.1)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-2.1
    // Steps: Open add-activity dialog, select end time prior to start time
    await page.click('[data-testid="timeline-column-day-1"] [data-testid="btn-add-activity"]');
    await page.fill('[data-testid="input-activity-title"]', 'Invalid Dinner');
    await page.fill('[data-testid="input-start-time"]', '19:00');
    await page.fill('[data-testid="input-end-time"]', '18:00'); // Earlier than start
    await page.click('[data-testid="btn-submit-activity"]');

    // Expected Result: Submission blocked, display error label
    const errorAlert = page.locator('[data-testid="error-message-activity"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/ERR_TIME_FLIP/);
  });

  test('TC-FE-201.3: Edge Case - Time Slot Collision Display (AC-201.2)', async ({ page }) => {
    // Priority: Low
    // Requirement Mapping: FR-2.2
    // Steps: Create two activities on Day 1 sharing the same time slot (13:00 - 15:00)
    // Confirm overlap warnings render without locking timeline saving
    const conflictCard1 = page.locator('[data-testid="itinerary-item-card"]:has-text("Tour Eiffel")');
    const conflictCard2 = page.locator('[data-testid="itinerary-item-card"]:has-text("Eiffel Souvenirs Shopping")');

    await expect(conflictCard1.locator('[data-testid="warning-collision"]')).toBeVisible();
    await expect(conflictCard2.locator('[data-testid="warning-collision"]')).toBeVisible();
  });
});
