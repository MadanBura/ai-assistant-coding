const { test, expect } = require('@playwright/test');

test.describe('Collaborative Workspace (FE-102) - E2E Tests', () => {

  test('TC-FE-102.1: Functional & Security - Revoked Write Mid-Session (AC-102.2)', async ({ browser }) => {
    // Priority: High
    // Requirement Mapping: FR-1.5
    // Preconditions: Owner creates trip. Collaborator is active Editor.
    
    // Step 1: Open Owner Browser Session
    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    await ownerPage.goto('/login');
    await ownerPage.fill('input[type="email"]', 'owner@example.com');
    await ownerPage.fill('input[type="password"]', 'SecurePassword123!');
    await ownerPage.click('button[type="submit"]');
    await ownerPage.goto('/trips/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed');

    // Step 2: Open Editor Browser Session
    const editorContext = await browser.newContext();
    const editorPage = await editorContext.newPage();
    await editorPage.goto('/login');
    await editorPage.fill('input[type="email"]', 'collaborator@example.com');
    await editorPage.fill('input[type="password"]', 'SecurePassword123!');
    await editorPage.click('button[type="submit"]');
    await editorPage.goto('/trips/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed');

    // Verify collaborator sees typing interface
    await expect(editorPage.locator('[data-testid="btn-add-activity"]')).toBeEnabled();

    // Step 3: Owner demotes Collaborator to Read-Only Viewer
    await ownerPage.click('[data-testid="btn-share-modal"]');
    await ownerPage.selectOption('[data-testid="select-role-collaborator"]', 'viewer');
    await ownerPage.click('[data-testid="btn-save-permissions"]');

    // Expected Result: Collaborator's UI updates, editor buttons are disabled, toast is shown
    await expect(editorPage.locator('[data-testid="toast-notification"]')).toBeVisible();
    await expect(editorPage.locator('[data-testid="toast-notification"]')).toContainText(/Read-Only/);
    await expect(editorPage.locator('[data-testid="btn-add-activity"]')).toBeDisabled();
    
    await ownerContext.close();
    await editorContext.close();
  });

  test('TC-FE-102.2: Edge Case - Accessing Expired Invite Link (AC-102.1)', async ({ page }) => {
    // Priority: Medium
    // Requirement Mapping: FR-1.4
    // Preconditions: Collaborator visits a link with an expired token
    await page.goto('/login');
    await page.fill('input[type="email"]', 'collaborator@example.com');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Step: Go to expired invite URL
    await page.goto('/trips/join/expired_invite_token_123');

    // Expected Result: Render 410 Gone / Expired invite view
    await expect(page.locator('[data-testid="expired-invite-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="expired-invite-message"]')).toContainText(/expired/i);
  });
});
