import { test, expect } from '@playwright/test';

test.describe('FEAT-301: AI Caption Generator (Frontend)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'SecurePassword123');
    await page.click('button[type="submit"]');
    await page.goto('/posts/new');
  });

  /**
   * TC ID: TC-FE-701
   * Requirement Mapping: FR-301-1, FR-301-3, FR-301-6
   * AC Mapping: AC-301-1, AC-301-2
   * Test Type: Functional / UI
   * Preconditions: Navigated to Post Composer page.
   * Steps:
   *   1. Click on "AI Helper" toolbar button.
   *   2. In prompt input, type "Sustainable energy solutions launch".
   *   3. Click tone button "BOLD".
   *   4. Click "Generate Captions".
   * Expected Result: Panel shows spinner, then renders 3 text card results. Clicking "Use Caption" overwrites main post textarea.
   * Priority: HIGH
   */
  test('TC-FE-701: Generate AI Captions and Populate Composer Area', async ({ page }) => {
    await page.click('[data-testid="ai-drawer-trigger-btn"]');
    const drawer = page.locator('[data-testid="ai-assistant-drawer"]');
    await expect(drawer).toBeVisible();

    await page.fill('[data-testid="ai-prompt-input"]', 'Sustainable energy solutions launch');
    await page.click('[data-testid="tone-btn-BOLD"]');
    await page.click('[data-testid="ai-generate-btn"]');

    // Confirm spinner loading state
    const spinner = page.locator('[data-testid="ai-loading-indicator"]');
    await expect(spinner).toBeVisible();
    await expect(spinner).toBeHidden({ timeout: 10000 }); // Wait for Mock API response

    // Verify option cards
    const optionCards = page.locator('[data-testid="ai-option-card"]');
    await expect(optionCards).toHaveCount(3);

    // Apply first suggestion
    const firstOptionText = await optionCards.nth(0).locator('.option-text').textContent();
    await optionCards.nth(0).locator('[data-testid="use-caption-btn"]').click();

    // Check textarea updates
    const composerTextarea = page.locator('[data-testid="post-caption-textarea"]');
    await expect(composerTextarea).toHaveValue(firstOptionText || '');
  });

  /**
   * TC ID: TC-FE-702
   * Requirement Mapping: FR-301-4
   * AC Mapping: AC-301-3
   * Test Type: Negative / Edge Cases / UI
   * Preconditions: Workspace monthly token limits are exhausted.
   * Steps:
   *   1. Mock AI token status to return quota error response (402).
   *   2. Fill prompts and click "Generate".
   * Expected Result: Displays quota limit error block alert: "AI quota limit reached for this month. Upgrade your plan." and blocks input fields.
   * Priority: HIGH
   */
  test('TC-FE-702: Handle Token Limit Quota Exceeded Warnings', async ({ page }) => {
    // Intercept endpoint to return mock quota error
    await page.route('**/api/v1/ai/generate-caption', async (route) => {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'AI quota limit reached for this month' })
      });
    });

    await page.click('[data-testid="ai-drawer-trigger-btn"]');
    await page.fill('[data-testid="ai-prompt-input"]', 'Promo launch text');
    await page.click('[data-testid="ai-generate-btn"]');

    // Verification
    const quotaWarning = page.locator('[data-testid="quota-warning-block"]');
    await expect(quotaWarning).toBeVisible();
    await expect(quotaWarning).toContainText('Upgrade your plan to unlock more tokens');
  });

  /**
   * TC ID: TC-FE-703
   * Requirement Mapping: FR-301-1
   * AC Mapping: AC-301-4
   * Test Type: Validation / Negative / UI
   * Preconditions: Inputs empty text prompt values.
   * Steps:
   *   1. Open AI Drawer.
   *   2. Leave Prompt empty.
   *   3. Verify state of "Generate Captions" Button.
   * Expected Result: "Generate Captions" button is disabled. Fill parameter validation states flash.
   * Priority: MEDIUM
   */
  test('TC-FE-703: Enforce Prompt Character Limit Form Constraints', async ({ page }) => {
    await page.click('[data-testid="ai-drawer-trigger-btn"]');
    const generateBtn = page.locator('[data-testid="ai-generate-btn"]');
    await expect(generateBtn).toBeDisabled();

    // Fill 3 chars (less than min boundary: 5 chars)
    await page.fill('[data-testid="ai-prompt-input"]', 'Eco');
    await expect(generateBtn).toBeDisabled();
    
    // Add text to reach valid boundary
    await page.fill('[data-testid="ai-prompt-input"]', 'Eco Packaging Launch');
    await expect(generateBtn).toBeEnabled();
  });
});
