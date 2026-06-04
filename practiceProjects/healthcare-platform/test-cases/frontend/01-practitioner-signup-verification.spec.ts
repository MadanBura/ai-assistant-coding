import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-001 | Feature: FEAT-101 (Practitioner Signup & Verification)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-101-01
 * @requirement FR-101
 * @acceptanceCriteria AC-101.1.1
 * @priority High
 * @preconditions User navigation to the practitioner registration workspace is open.
 * @description Verify that a doctor can fill in the multistep registration wizard, upload files, and complete submission.
 */
test('TC-FE-101-01: Verify doctor can fill in signup wizard and upload files', async ({ page }) => {
  // Step 1: Navigate and enter account credentials
  await page.goto('/register/doctor');
  await page.fill('[data-testid="email-input"]', 'dr.robert.chen@bostonclinic.org');
  await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
  await page.fill('[data-testid="phone-input"]', '+16175550192');
  await page.click('[data-testid="next-btn"]');

  // Step 2: Input Professional Details
  await page.fill('[data-testid="first-name-input"]', 'Robert');
  await page.fill('[data-testid="last-name-input"]', 'Chen');
  await page.selectOption('[data-testid="specialty-select"]', { label: 'Cardiology' });
  await page.fill('[data-testid="clinic-address-input"]', 'Boston, MA');
  await page.click('[data-testid="next-btn"]');

  // Step 3: Input License Details
  await page.fill('[data-testid="license-state-input"]', 'MA');
  await page.fill('[data-testid="license-number-input"]', 'MA-908123');
  await page.fill('[data-testid="license-expiry-input"]', '2028-12-31');
  await page.click('[data-testid="next-btn"]');

  // Step 4: Upload Document File
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('[data-testid="file-upload-zone"]');
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: 'license.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('PDF mock content data')
  });

  // Verify progress bar reaches 100%
  const progressBar = page.locator('[data-testid="upload-progress-bar"]');
  await expect(progressBar).toHaveAttribute('aria-valuenow', '100');

  // Submit and verify redirection
  await page.click('[data-testid="submit-btn"]');
  await expect(page).toHaveURL(/\/success-registration/);
  await expect(page.locator('[data-testid="success-header"]')).toBeVisible();
});

/**
 * @testcase TC-FE-101-02
 * @requirement FR-101
 * @acceptanceCriteria AC-101.1.2
 * @priority Medium
 * @preconditions User has opened Step 4 (Document Upload) of the signup form.
 * @description Verify that document files exceeding the 15MB size limit are rejected with an inline validation warning.
 */
test('TC-FE-101-02: Verify document files exceeding 15MB limit are rejected', async ({ page }) => {
  await page.goto('/register/doctor?step=4');
  
  // Attempt uploading oversized file
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('[data-testid="file-upload-zone"]');
  const fileChooser = await fileChooserPromise;
  
  // Construct 16MB file buffer
  const largeBuffer = Buffer.alloc(16 * 1024 * 1024);
  await fileChooser.setFiles({
    name: 'large_license.pdf',
    mimeType: 'application/pdf',
    buffer: largeBuffer
  });

  // Assert file is rejected and warning is displayed
  const errorLabel = page.locator('[data-testid="file-upload-error"]');
  await expect(errorLabel).toBeVisible();
  await expect(errorLabel).toHaveText('File exceeds 15MB limit');
  await expect(page.locator('[data-testid="submit-btn"]')).toBeDisabled();
});

/**
 * @testcase TC-FE-101-03
 * @requirement BR-006
 * @acceptanceCriteria UIC-005
 * @priority Medium
 * @preconditions User accesses registration wizard using keyboard tab navigation.
 * @description Verify that all form fields and upload inputs support visible focus indicators and tab indexing controls (WCAG AA).
 */
test('TC-FE-101-03: Verify keyboard focus navigation on Step 1 form fields', async ({ page }) => {
  await page.goto('/register/doctor');
  
  // Set focus on email field
  await page.focus('[data-testid="email-input"]');
  await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
  
  // Press tab to password
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

  // Press tab to phone number
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-testid="phone-input"]')).toBeFocused();
});
