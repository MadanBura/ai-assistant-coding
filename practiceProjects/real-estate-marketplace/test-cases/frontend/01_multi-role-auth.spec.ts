import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-1.1 (Multi-role Registration & Authentication)
 * MAPPED REQUIREMENTS: FR-101
 * ACCEPTANCE CRITERIA: AC-101, AC-102
 */

test.describe('FT-1.1: Multi-role Registration & Authentication E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to registration page
    await page.goto('/auth/register');
  });

  /**
   * TC ID: TC-FE-101
   * Type: Validation / UI
   * Preconditions: Guest user on signup screen
   * Priority: High
   */
  test('TC-FE-101: Verify registration validation errors under weak inputs', async ({ page }) => {
    // Fill weak password and invalid email
    await page.fill('[data-testid="register-email"]', 'invalidemail');
    await page.fill('[data-testid="register-password"]', 'abc');
    await page.fill('[data-testid="register-fullname"]', 'Jane Doe');
    
    // Choose Role
    await page.click('[data-testid="role-buyer-btn"]');
    
    // Try submit
    await page.click('[data-testid="register-submit-btn"]');

    // Assert UI shows validation warnings
    await expect(page.locator('[data-testid="email-error-msg"]')).toContainText('Email must conform to standard format');
    await expect(page.locator('[data-testid="password-error-msg"]')).toContainText('Password must be a minimum of 8 characters');
  });

  /**
   * TC ID: TC-FE-102
   * Type: Functional / Auth
   * Preconditions: Guest user on signup screen, unique email details
   * Priority: Critical
   */
  test('TC-FE-102: Successfully register as Buyer and verify session cookies', async ({ page, context }) => {
    const uniqueEmail = `buyer_${Date.now()}@example.com`;

    await page.fill('[data-testid="register-fullname"]', 'Jane Doe');
    await page.fill('[data-testid="register-email"]', uniqueEmail);
    await page.fill('[data-testid="register-password"]', 'StrongPass123!');
    await page.fill('[data-testid="register-phone"]', '+15550199');
    
    // Choose Role
    await page.click('[data-testid="role-buyer-btn"]');
    await page.click('[data-testid="register-submit-btn"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    // Check that cookies contain JWT token
    const cookies = await context.cookies();
    const jwtCookie = cookies.find(c => c.name === 'token');
    expect(jwtCookie).toBeDefined();
    expect(jwtCookie?.httpOnly).toBe(true);
    expect(jwtCookie?.secure).toBe(true);
  });

  /**
   * TC ID: TC-FE-103
   * Type: Security / Route guarding
   * Preconditions: Guest user attempts to traverse private route
   * Priority: High
   */
  test('TC-FE-103: Verify route guard intercepts and redirects unauthenticated user', async ({ page }) => {
    // Attempt to access user profile dashboard direct link
    await page.goto('/dashboard');
    
    // Assert redirect back to login page
    await page.waitForURL('/auth/login');
    const warningMessage = page.locator('[data-testid="auth-warning-banner"]');
    await expect(warningMessage).toBeVisible();
  });

});
