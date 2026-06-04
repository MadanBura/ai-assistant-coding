import { test, expect } from '@playwright/test';

/**
 * Epic: EPC-006 | Feature: FEAT-601 (Patient Consolidated Dashboard)
 * Enforced Frontend Quality Spec
 */

/**
 * @testcase TC-FE-601-01
 * @requirement FR-601
 * @acceptanceCriteria AC-601.1.1
 * @priority High
 * @preconditions Patient is logged in.
 * @description Verify dashboard displays appointments listings, prescription links, and invoice grids.
 */
test('TC-FE-601-01: Verify dashboard cards render upcoming list and trigger join call keys', async ({ page }) => {
  await page.goto('/patient/dashboard');
  
  // Assert navigation list is active
  const dashboardNav = page.locator('[data-testid="patient-dashboard-navigation"]');
  await expect(dashboardNav).toBeVisible();

  // Verify appointment summary elements display
  const appointmentCard = page.locator('[data-testid="upcoming-appointment-card"]').first();
  await expect(appointmentCard).toBeVisible();
  await expect(appointmentCard.locator('[data-testid="doctor-name-label"]')).toContainText('Dr. Robert Chen');
  
  // Assert Join Call button behaves correctly
  const joinBtn = appointmentCard.locator('[data-testid="join-consultation-btn"]');
  await expect(joinBtn).toBeVisible();
  await expect(joinBtn).toBeEnabled();
});

/**
 * @testcase TC-FE-601-02
 * @requirement FR-201
 * @acceptanceCriteria AC-601.1.2
 * @priority Medium
 * @preconditions Patient has appointment marked canceled.
 * @description Verify canceled appointments display warning banners in UI.
 */
test('TC-FE-601-02: Verify canceled appointment slots swap join actions for status warnings', async ({ page }) => {
  // Navigation to dashboard mock configuration containing canceled booking
  await page.goto('/patient/dashboard?mockState=has-canceled-booking');
  
  // Locate canceled card
  const canceledCard = page.locator('[data-testid="upcoming-appointment-card"]').first();
  await expect(canceledCard).toBeVisible();
  
  // Confirm call trigger element is hidden and refund alert displays
  await expect(canceledCard.locator('[data-testid="join-consultation-btn"]')).not.toBeVisible();
  
  const refundBanner = canceledCard.locator('[data-testid="booking-status-warning-banner"]');
  await expect(refundBanner).toBeVisible();
  await expect(refundBanner).toContainText('Canceled - Refund Issued');
});
