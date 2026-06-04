import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright'; // Axe accessibility verification package

test.describe('RBAC Frontend E2E Test Suite (FE-TAS-2)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from clean dashboard login URL
    await page.goto('/login');
  });

  /**
   * @TestCaseID TC-RBAC-F-001
   * @RequirementMapping FR-RBAC-001
   * @AcceptanceCriteriaMapping AC-RBAC-001
   * @Type Functional / UI
   * @Priority High
   * @Description Verify that login forms render all visual components and support typing interactions.
   * @Preconditions Login page is loaded.
   * @Steps
   *   1. Assert visibility of email, password inputs, and submit button.
   *   2. Fill in login credentials fields.
   *   3. Click login submit card button.
   *   4. Verify redirection to home dashboard path.
   * @ExpectedResults
   *   - Inputs are visible.
   *   - Button text displays "Sign In".
   *   - Redirects to "/dashboard" upon submitting valid credentials.
   */
  test('TC-RBAC-F-001: Success Login Flow and Redirect', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toHaveText('Sign In');

    await emailInput.fill('rep1@apexsales.com');
    await passwordInput.fill('Password123!');
    await submitBtn.click();

    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  /**
   * @TestCaseID TC-RBAC-F-002
   * @RequirementMapping FR-RBAC-001
   * @AcceptanceCriteriaMapping AC-RBAC-001
   * @Type Negative / UI
   * @Priority High
   * @Description Verify client-side visual validation warnings are shown for missing inputs.
   * @Preconditions Login page loaded.
   * @Steps
   *   1. Leave email empty, write password "Password!".
   *   2. Click Sign In.
   *   3. Check error banners.
   * @ExpectedResults
   *   - Input border turns red.
   *   - Error text block displays "Email is required".
   */
  test('TC-RBAC-F-002: Validation Warnings on Empty Forms', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');
    await page.locator('input[type="password"]').fill('Password123!');
    await submitBtn.click();

    const emailError = page.locator('[data-testid="email-error-text"]');
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText('Email is required');
  });

  /**
   * @TestCaseID TC-RBAC-F-003
   * @RequirementMapping FR-RBAC-004
   * @AcceptanceCriteriaMapping None
   * @Type Functional / UI
   * @Priority High
   * @Description Verify that the sidebar menu items are restricted based on logged-in user role.
   * @Preconditions Authenticated as Sales Representative "rep1@apexsales.com".
   * @Steps
   *   1. Log in.
   *   2. Navigate to Dashboard home.
   *   3. Inspect the sidebar link selector nodes.
   * @ExpectedResults
   *   - "Dashboard", "Leads", "Contacts", "Kanban Board" links are visible.
   *   - "Team Management" or "Quota Setup" links are strictly hidden.
   */
  test('TC-RBAC-F-003: Sidebar Link Visibility for Sales Reps', async ({ page }) => {
    // Authenticate user
    await page.locator('input[type="email"]').fill('rep1@apexsales.com');
    await page.locator('input[type="password"]').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');

    // Confirm core menus
    await expect(page.locator('a[href="/leads"]')).toBeVisible();
    await expect(page.locator('a[href="/kanban"]')).toBeVisible();

    // Confirm admin structures are omitted from DOM
    await expect(page.locator('a[href="/admin/teams"]')).not.toBeVisible();
    await expect(page.locator('a[href="/admin/quotas"]')).not.toBeVisible();
  });

  /**
   * @TestCaseID TC-RBAC-F-004
   * @RequirementMapping FR-RBAC-004
   * @AcceptanceCriteriaMapping AC-RBAC-002
   * @Type Negative / UI
   * @Priority Critical
   * @Description Verify client-side routing blocks manual URL redirection by unauthorized users.
   * @Preconditions Authenticated as Sales Representative.
   * @Steps
   *   1. Explicitly type "/admin/teams" into route navigation execution.
   *   2. Inspect page layout and URL state.
   * @ExpectedResults
   *   - Navigation is intercepted.
   *   - User is redirected to "/403" Access Denied layout view.
   */
  test('TC-RBAC-F-004: Direct URL Access Interception Redirects to 403', async ({ page }) => {
    // Authenticate rep
    await page.locator('input[type="email"]').fill('rep1@apexsales.com');
    await page.locator('input[type="password"]').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('/dashboard');

    // Attempt direct URL navigate
    await page.goto('/admin/teams');

    // Verify redirected page is 403 error
    await page.waitForURL('/403');
    const headerError = page.locator('h1');
    await expect(headerError).toHaveText('Access Denied');
  });

  /**
   * @TestCaseID TC-RBAC-F-005
   * @RequirementMapping UI Standards
   * @AcceptanceCriteriaMapping None
   * @Type Accessibility
   * @Priority Medium
   * @Description Verify that the Login Form passes WCAG 2.1 AA accessibility contrast rules.
   * @Preconditions Login page loaded.
   * @Steps
   *   1. Instantiate AxeBuilder on the current web page template.
   *   2. Execute accessibility checks.
   * @ExpectedResults
   *   - Contrast ratios and HTML semantic rules pass standard validation with 0 failures.
   */
  test('TC-RBAC-F-005: Login Accessibility Audit Checks', async ({ page }) => {
    const accessibilityResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag21aa'])
      .analyze();

    expect(accessibilityResults.violations.length).toBe(0);
  });

  /**
   * @TestCaseID TC-RBAC-F-006
   * @RequirementMapping FR-RBAC-002, FR-RBAC-003
   * @AcceptanceCriteriaMapping AC-RBAC-003
   * @Type Integration / Redirection
   * @Priority Critical
   * @Description Verify that the system handles session expiration (invalid refresh token) by redirecting to login.
   * @Preconditions Active browser session. Backend mocks token expiration.
   * @Steps
   *   1. Backend mock server returns 401 token-expired response during timeline request.
   *   2. Application client intercepts, fires refresh request, which returns 401 refresh-token-invalid.
   *   3. Inspect frontend UI state.
   * @ExpectedResults
   *   - Active session clears.
   *   - Page redirects automatically to "/login".
   *   - Error banner shows "Session expired. Please log in again".
   */
  test('TC-RBAC-F-006: Auto-Redirect to Login on Session Expiration', async ({ page }) => {
    // Setup initial mock token in localStorage/state
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'expired_access_token');
    });

    await page.goto('/leads');

    // Mock API requests responses
    await page.route('/api/v1/leads', async route => {
      await route.fulfill({ status: 401, body: JSON.stringify({ message: 'Token Expired' }) });
    });

    await page.route('/api/v1/auth/refresh', async route => {
      await route.fulfill({ status: 401, body: JSON.stringify({ message: 'Invalid Refresh Session' }) });
    });

    // Verify redirected page back to login page
    await page.waitForURL('/login');
    const toastError = page.locator('[data-testid="session-expired-alert"]');
    await expect(toastError).toBeVisible();
    await expect(toastError).toContainText('Session expired');
  });
});
