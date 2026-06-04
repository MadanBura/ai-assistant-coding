import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-007 | Feature: FEAT-701 (Back-Office Admin Operations)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-701-01
 * @requirement FR-101
 * @acceptanceCriteria AC-101.2.1
 * @priority High
 * @preconditions Admin is logged in and navigated to administrative operations console.
 * @description Verify that admin dashboard renders doctor verification queue list, pagination indicators, and file preview details.
 */
test('TC-FE-701-01: Verify admin queue list rendering and document preview', async ({ page }) => {
  await page.goto('/admin/dashboard');
  
  // Assert dashboard load
  const header = page.locator('[data-testid="admin-header"]');
  await expect(header).toBeVisible();
  
  // Navigate to Verifications Tab
  await page.click('[data-testid="tab-verifications"]');
  
  // Assert details grid displays rows
  const queueTable = page.locator('[data-testid="pending-verifications-table"]');
  await expect(queueTable).toBeVisible();
  
  const pendingRows = queueTable.locator('tbody tr');
  await expect(pendingRows.first()).toBeVisible();

  // Click document review link
  await page.click('[data-testid="review-doc-doc-robert-chen-77"]');
  
  // Verify split side preview modal pops up
  const sidePreview = page.locator('[data-testid="document-side-preview"]');
  await expect(sidePreview).toBeVisible();
  
  const licensePdfEmbed = sidePreview.locator('embed[type="application/pdf"]');
  await expect(licensePdfEmbed).toBeVisible();
});

/**
 * @testcase TC-FE-701-02
 * @requirement FR-101
 * @acceptanceCriteria AC-101.2.2
 * @priority High
 * @preconditions A pending doctor registration exists in the review list.
 * @description Verify admin can reject a doctor profile, enforcing rejection comment constraints.
 */
test('TC-FE-701-02: Verify rejection action enforces comment validation checks', async ({ page }) => {
  await page.goto('/admin/dashboard?tab=verifications');
  
  // Click reject button
  await page.click('[data-testid="reject-btn-doc-robert-chen-77"]');
  
  // Assert modal overlays open
  const rejectModal = page.locator('[data-testid="rejection-modal"]');
  await expect(rejectModal).toBeVisible();
  
  // Click submit without comment
  await page.click('[data-testid="submit-rejection-btn"]');
  const validationError = page.locator('[data-testid="rejection-comment-error"]');
  await expect(validationError).toBeVisible();
  await expect(validationError).toHaveText('Reason comment is required');
  
  // Fill comment and submit
  await page.selectOption('[data-testid="rejection-reason-select"]', { label: 'Invalid License' });
  await page.fill('[data-testid="rejection-comment-input"]', 'License ID search returned empty results on state registry list.');
  await page.click('[data-testid="submit-rejection-btn"]');
  
  // Verify modal is closed and row disappears
  await expect(rejectModal).not.toBeVisible();
  const targetRow = page.locator('text=Robert Chen');
  await expect(targetRow).not.toBeVisible();
});
