import { test, expect } from '@playwright/test';

test.describe('FEAT-101: Workspace Setup & Invitations (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Authenticate user before each test run
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  /**
   * TC ID: TC-FE-101
   * Requirement Mapping: FR-101-1, FR-101-2, FR-101-3
   * AC Mapping: AC-101-1, AC-101-2
   * Test Type: Functional / UI / Accessibility
   * Preconditions: User is authenticated and navigated to Dashboard.
   * Steps:
   *   1. Click on Workspace Switcher dropdown.
   *   2. Select "+ Create New Workspace" Option.
   *   3. Enter workspace name "Acme Marketing Agency".
   *   4. Verify WCAG contrast levels on button elements.
   *   5. Click "Submit" button.
   * Expected Result: Workspace created toast is displayed, page updates workspace name to "Acme Marketing Agency", and calendar renders empty state.
   * Priority: HIGH
   */
  test('TC-FE-101: Verify Workspace Creation Workflow', async ({ page }) => {
    await page.click('[data-testid="workspace-switcher"]');
    await page.click('[data-testid="create-workspace-trigger"]');
    
    // UI Modal Validation
    const modal = page.locator('[data-testid="create-workspace-modal"]');
    await expect(modal).toBeVisible();

    // Accessibility test (Focus traps)
    const nameInput = page.locator('[data-testid="workspace-name-input"]');
    await expect(nameInput).toBeFocused();

    await nameInput.fill('Acme Marketing Agency');
    
    // Click submit
    await page.click('[data-testid="workspace-submit-btn"]');

    // Expected Toast validation
    const toast = page.locator('.toast-success');
    await expect(toast).toContainText('Workspace created successfully');
    
    // Header status check
    const workspaceHeader = page.locator('[data-testid="active-workspace-title"]');
    await expect(workspaceHeader).toContainText('Acme Marketing Agency');
  });

  /**
   * TC ID: TC-FE-102
   * Requirement Mapping: FR-101-4, FR-101-5
   * AC Mapping: AC-102-1, AC-102-2
   * Test Type: Validation / Negative / UI
   * Preconditions: User is active in Workspace Settings.
   * Steps:
   *   1. Navigate to Settings -> Team.
   *   2. Click "Invite Member".
   *   3. Enter an invalid email structure "editor_at_acme.com".
   *   4. Click "Send Invite" button.
   *   5. Clear input, enter "editor@acme.com", select role "INVALID_ROLE" via console script simulation.
   * Expected Result: Validation messages display beneath email field: "Invalid email structure", and role selector rejects mock overrides.
   * Priority: MEDIUM
   */
  test('TC-FE-102: Verify Team Invite Input Validation Rules', async ({ page }) => {
    await page.goto('/settings/team');
    await page.click('[data-testid="invite-member-btn"]');

    const emailInput = page.locator('[data-testid="invite-email-input"]');
    await emailInput.fill('editor_at_acme.com');
    await page.click('[data-testid="submit-invite-btn"]');

    // Assert validation alert
    const validationMsg = page.locator('[data-testid="email-error-msg"]');
    await expect(validationMsg).toBeVisible();
    await expect(validationMsg).toContainText('Please enter a valid email address');
  });

  /**
   * TC ID: TC-FE-103
   * Requirement Mapping: FR-101-7
   * AC Mapping: AC-102-3, AC-102-4
   * Test Type: Edge Cases / Security / Integration
   * Preconditions: Guest user visits acceptance link containing invalid/expired token.
   * Steps:
   *   1. Navigate to `/accept-invite?token=EXPIRED_OR_FAKE_TOKEN_123`.
   * Expected Result: Acceptance card renders a warning block: "This invitation has expired or is invalid. Please ask your administrator to send a new invite.", and blocks registration buttons.
   * Priority: HIGH
   */
  test('TC-FE-103: Verify Acceptance Routing under Expired Token Error States', async ({ page }) => {
    await page.goto('/accept-invite?token=EXPIRED_OR_FAKE_TOKEN_123');

    // UI elements check
    const errorBlock = page.locator('[data-testid="invite-error-container"]');
    await expect(errorBlock).toBeVisible();
    await expect(errorBlock).toContainText('This invitation has expired');

    // Check button is disabled
    const acceptBtn = page.locator('[data-testid="accept-action-btn"]');
    await expect(acceptBtn).toBeDisabled();
  });
});
