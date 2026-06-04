const { test, expect } = require('@playwright/test');

test.describe('Budget & Expense Tracker (FE-401) - E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'owner@example.com');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await page.goto('/trips/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed');
    await page.click('[data-testid="tab-budget"]');
  });

  test('TC-FE-401.1: Functional & UI - Add Expense and Split (AC-401.1, AC-401.2)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-4.1
    // Steps: Click add expense button, enter details (amount = $99.00), split equally among three
    await page.click('[data-testid="btn-add-expense"]');
    await page.fill('[data-testid="input-expense-title"]', 'Group Dinner at Cafe');
    await page.fill('[data-testid="input-expense-amount"]', '99.00');
    await page.selectOption('[data-testid="select-expense-currency"]', 'USD');
    await page.selectOption('[data-testid="select-expense-category"]', 'food');
    
    // Equal split toggle on
    await page.click('[data-testid="toggle-equal-split"]');
    await page.click('[data-testid="btn-submit-expense"]');

    // Expected Result: Expense appears in ledger list, shows splits ($33.00 each)
    const ledgerItem = page.locator('[data-testid="expense-item"]:has-text("Group Dinner at Cafe")');
    await expect(ledgerItem).toBeVisible();
    await expect(ledgerItem).toContainText('$99.00');
    
    // Check total spent summary increases
    const totalSpent = page.locator('[data-testid="text-total-spent"]');
    await expect(totalSpent).toContainText('$99.00');
  });

  test('TC-FE-401.2: Validation - Negative Amounts Blocked (AC-401.1)', async ({ page }) => {
    // Priority: Medium
    // Requirement Mapping: FR-4.1
    // Steps: Enter negative cost value, verify validation errors block submission
    await page.click('[data-testid="btn-add-expense"]');
    await page.fill('[data-testid="input-expense-title"]', 'Invalid Tickets');
    await page.fill('[data-testid="input-expense-amount"]', '-50.00');
    await page.click('[data-testid="btn-submit-expense"]');

    // Expected Result: Form alert displays, submission blocked
    const errorAlert = page.locator('[data-testid="error-message-expense"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/must be greater than/i);
  });

  test('TC-FE-401.3: UI & Performance - Budget Bar Colors (AC-401.4)', async ({ page }) => {
    // Priority: Low
    // Requirement Mapping: FR-4.1
    // Preconditions: Base budget limit is $1000. Add expense of $950 (95% budget).
    // Steps: View budget bar widget
    const budgetBar = page.locator('[data-testid="budget-utilization-bar"]');
    await expect(budgetBar).toHaveClass(/bg-color-red|danger/);
  });
});
