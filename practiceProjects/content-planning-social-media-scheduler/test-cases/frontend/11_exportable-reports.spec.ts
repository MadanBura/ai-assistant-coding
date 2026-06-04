import { test, expect } from '@playwright/test';

test.describe('FEAT-602: Exportable Reports (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
    await page.goto('/analytics');
  });

  /**
   * TC ID: TC-FE-1101
   * Requirement Mapping: FR-602-1, FR-602-2
   * AC Mapping: AC-602-1
   * Test Type: Functional / UI
   * Preconditions: Navigated to Analytics dashboard page.
   * Steps:
   *   1. Click on "Export Report" button.
   *   2. Select format choice "PDF".
   *   3. Enter email address "client@acme-brand.com".
   *   4. Click "Generate & Send" button.
   * Expected Result: Renders report processing dialog alert: "Report compilation has started. A download link will be emailed to client@acme-brand.com shortly."
   * Priority: HIGH
   */
  test('TC-FE-1101: Trigger PDF Report Generation Modal Flow', async ({ page }) => {
    await page.click('[data-testid="export-report-trigger-btn"]');
    
    const modal = page.locator('[data-testid="export-report-modal"]');
    await expect(modal).toBeVisible();

    await page.click('[data-testid="format-select-PDF"]');
    await page.fill('[data-testid="export-email-input"]', 'client@acme-brand.com');
    await page.click('[data-testid="export-submit-btn"]');

    // Assert loading/processing alert triggers
    const statusMsg = page.locator('.toast-info');
    await expect(statusMsg).toBeVisible();
    await expect(statusMsg).toContainText('Report compilation has started');
  });

  /**
   * TC ID: TC-FE-1102
   * Requirement Mapping: FR-602-6
   * AC Mapping: AC-602-2, AC-602-3
   * Test Type: Functional / UI / Integration
   * Preconditions: Report generation completes.
   * Steps:
   *   1. Navigate to Settings -> Exports history list.
   *   2. Click on "Download PDF" button card element.
   * Expected Result: Browser triggers download thread targeting the secure AWS S3 pre-signed link.
   * Priority: HIGH
   */
  test('TC-FE-1102: Download Compiled PDF Report via Expiring S3 Link', async ({ page }) => {
    await page.goto('/settings/exports');

    // Confirm presence of completed report row
    const firstRow = page.locator('[data-testid="exports-history-table"] tbody tr').first();
    await expect(firstRow.locator('.status-cell')).toContainText('COMPLETED');

    const downloadLink = firstRow.locator('[data-testid="download-report-link"]');
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute('href', /s3.amazonaws.com\/.*\.pdf/);
  });

  /**
   * TC ID: TC-FE-1103
   * Requirement Mapping: FR-602-2
   * AC Mapping: AC-602-1
   * Test Type: Validation / Negative / UI
   * Preconditions: Export modal parameter checks.
   * Steps:
   *   1. Open Export Modal.
   *   2. Pick start date today, end date yesterday.
   * Expected Result: Renders input validation warnings: "End date must be after start date" and disables submit button.
   * Priority: MEDIUM
   */
  test('TC-FE-1103: Enforce Date Picker Range Limits in Export Form', async ({ page }) => {
    await page.click('[data-testid="export-report-trigger-btn"]');
    
    // Pick invalid date ranges
    await page.fill('[data-testid="start-date-input"]', '2026-06-04');
    await page.fill('[data-testid="end-date-input"]', '2026-06-03'); // end date before start

    const warning = page.locator('[data-testid="date-range-error-msg"]');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('End date must be after start date');

    const submitBtn = page.locator('[data-testid="export-submit-btn"]');
    await expect(submitBtn).toBeDisabled();
  });
});
