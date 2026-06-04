import { test, expect } from '@playwright/test';

/**
 * FEATURE ID: FT-1.3 (User Profile Dashboard)
 * MAPPED REQUIREMENTS: FR-103
 * ACCEPTANCE CRITERIA: AC-105, AC-106
 */

test.describe('FT-1.3: User Profile Dashboard E2E Tests', () => {

  /**
   * TC ID: TC-FE-901
   * Type: UI / Role-based Adaptations
   * Preconditions: Accounts registered under distinct roles
   * Priority: High
   */
  test('TC-FE-901: Dashboard adapts panel columns depending on user authentication role (Buyer vs Agent)', async ({ page }) => {
    // 1. Log in as Buyer
    await page.goto('/auth/login');
    await page.fill('[data-testid="login-email"]', 'buyer@example.com');
    await page.fill('[data-testid="login-password"]', 'Password123!');
    await page.click('[data-testid="login-submit-btn"]');
    await page.waitForURL('/dashboard');

    // Assert Buyer dashboard features
    await expect(page.locator('[data-testid="nav-buyer-favorites"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-buyer-saved-searches"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-agent-analytics"]')).not.toBeVisible();

    // Log out
    await page.click('[data-testid="logout-btn"]');

    // 2. Log in as Agent
    await page.fill('[data-testid="login-email"]', 'agent@example.com');
    await page.fill('[data-testid="login-password"]', 'Password123!');
    await page.click('[data-testid="login-submit-btn"]');
    await page.waitForURL('/dashboard');

    // Assert Agent dashboard features
    await expect(page.locator('[data-testid="nav-agent-listings"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-agent-analytics"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-buyer-saved-searches"]')).not.toBeVisible();
  });

  /**
   * TC ID: TC-FE-902
   * Type: Functional / saved filters alerts
   * Preconditions: Buyer has active filters set in search panel
   * Priority: Medium
   */
  test('TC-FE-902: Verify saving search filters from results pane creates list preset with email toggle', async ({ page }) => {
    // Log in as Buyer
    await page.goto('/auth/login');
    await page.fill('[data-testid="login-email"]', 'buyer@example.com');
    await page.fill('[data-testid="login-password"]', 'Password123!');
    await page.click('[data-testid="login-submit-btn"]');
    
    // Go to search
    await page.goto('/search?city=NewYork&minPrice=300000');
    await page.click('[data-testid="save-search-trigger"]');

    // Name search popup modal
    const saveModal = page.locator('[data-testid="save-search-modal"]');
    await expect(saveModal).toBeVisible();
    await page.fill('[data-testid="save-search-name-input"]', 'NY 300k+ Listings');
    await page.click('[data-testid="save-search-submit-btn"]');

    // Assert item displays in User Dashboard list
    await page.goto('/dashboard/saved-searches');
    const savedCard = page.locator('[data-testid="saved-search-item-0"]');
    await expect(savedCard).toContainText('NY 300k+ Listings');
    
    // Verify toggle button behaves correctly
    const emailToggle = savedCard.locator('[data-testid="email-alert-toggle"]');
    await expect(emailToggle).toBeChecked();
    await emailToggle.uncheck();
    await expect(emailToggle).not.toBeChecked();
  });

});
