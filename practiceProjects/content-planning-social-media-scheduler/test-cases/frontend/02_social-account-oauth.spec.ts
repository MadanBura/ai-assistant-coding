import { test, expect } from '@playwright/test';

test.describe('FEAT-102: Social Account OAuth Integration (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
  });

  /**
   * TC ID: TC-FE-201
   * Requirement Mapping: FR-102-1, FR-102-2
   * AC Mapping: AC-103-1
   * Test Type: Functional / UI / Integration
   * Preconditions: Admin is in Integration Settings page.
   * Steps:
   *   1. Navigate to Settings -> Integrations.
   *   2. Click "Connect LinkedIn" integration card button.
   * Expected Result: Renders redirect spinner and transitions browser context URL safely to provider OAuth consent page (`https://linkedin.com/oauth/...`).
   * Priority: HIGH
   */
  test('TC-FE-201: Verify Direct Redirect to Provider OAuth Gateway', async ({ page }) => {
    await page.goto('/settings/integrations');
    
    // Check elements
    const card = page.locator('[data-testid="integration-card-linkedin"]');
    await expect(card).toBeVisible();

    const connectBtn = card.locator('[data-testid="connect-btn"]');
    await connectBtn.click();

    // Verify redirection sequence
    await page.waitForURL(/linkedin.com\/oauth\/v2/);
    expect(page.url()).toContain('response_type=code');
    expect(page.url()).toContain('state=');
  });

  /**
   * TC ID: TC-FE-202
   * Requirement Mapping: FR-102-6
   * AC Mapping: AC-103-2
   * Test Type: Functional / UI / Validation
   * Preconditions: OAuth callback finishes success.
   * Steps:
   *   1. Visit callback URL `/oauth/linkedin/callback?code=mock_code&state=mock_state`.
   * Expected Result: Success toast banner triggers, UI displays connected card badge: "Connected as @AcmeBrandOfficial", and disconnect controls display.
   * Priority: HIGH
   */
  test('TC-FE-202: Verify Post-OAuth Callback UI Updates', async ({ page }) => {
    // Inject mock session storage nonce to bypass security state checks
    await page.addInitScript(() => {
      window.sessionStorage.setItem('oauth_state_linkedin', 'mock_state');
    });

    await page.goto('/oauth/linkedin/callback?code=mock_code&state=mock_state');

    // Confirm redirected to settings with active badge
    await expect(page).toHaveURL('/settings/integrations');
    
    const statusText = page.locator('[data-testid="linkedin-status-badge"]');
    await expect(statusText).toContainText('Connected as Acme Brand');
    
    const disconnectBtn = page.locator('[data-testid="linkedin-disconnect-btn"]');
    await expect(disconnectBtn).toBeVisible();
  });

  /**
   * TC ID: TC-FE-203
   * Requirement Mapping: FR-102-4
   * AC Mapping: AC-103-3
   * Test Type: Negative / Edge Cases / UI
   * Preconditions: User declines scope permissions on OAuth consent screens.
   * Steps:
   *   1. Visit callback URL `/oauth/linkedin/callback?error=user_cancelled_login&state=mock_state`.
   * Expected Result: Displays custom alert message: "Integration setup cancelled. Please accept all scopes to connect.", and returns user back to connection control center.
   * Priority: MEDIUM
   */
  test('TC-FE-203: Handle User Denied Consent and Cancel Redirection', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('oauth_state_linkedin', 'mock_state');
    });

    await page.goto('/oauth/linkedin/callback?error=user_cancelled_login&state=mock_state');

    // Asserts warning container triggers
    await expect(page).toHaveURL('/settings/integrations');
    const warningAlert = page.locator('.alert-warning');
    await expect(warningAlert).toBeVisible();
    await expect(warningAlert).toContainText('Integration setup cancelled');
  });
});
