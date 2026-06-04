const { test, expect } = require('@playwright/test');

test.describe('Shared Travel Notes (FE-203) - E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'editor@example.com');
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await page.goto('/trips/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed');
    await page.click('[data-testid="tab-notes"]');
  });

  test('TC-FE-203.1: Functional & Integration - Markdown Rendering & Save (AC-203.1, AC-203.3)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-2.5
    // Steps: Create a packing list note, enter markdown syntax, toggle preview
    await page.click('[data-testid="btn-create-note"]');
    await page.fill('[data-testid="input-note-title"]', 'Gear Checklist');
    
    const editor = page.locator('[data-testid="textarea-note-editor"]');
    await editor.fill('# Gear Checklist\n- [ ] Camera Charger\n- [x] Extra Battery');
    
    // Auto-saves (debounce wait 1.2s)
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-testid="notes-save-status"]')).toContainText(/saved/i);

    // Toggle Preview Mode
    await page.click('[data-testid="btn-toggle-preview"]');
    
    // Expected Result: Heading 1 renders as H1 tag, checkable elements render checkbox inputs
    await expect(page.locator('[data-testid="note-rendered-view"] h1')).toHaveText('Gear Checklist');
    const checkedBox = page.locator('[data-testid="note-rendered-view"] input[type="checkbox"]');
    await expect(checkedBox.nth(1)).toBeChecked();
  });

  test('TC-FE-203.2: Security - XSS Input Purged in Note View (AC-203.1)', async ({ page }) => {
    // Priority: High
    // Requirement Mapping: FR-2.5
    // Steps: Write script tag to textarea note, trigger preview rendering
    await page.click('[data-testid="btn-create-note"]');
    await page.fill('[data-testid="input-note-title"]', 'Malicious Note');
    
    const editor = page.locator('[data-testid="textarea-note-editor"]');
    await editor.fill('hello world <script data-testid="malicious-script">alert(1)</script>');
    await page.click('[data-testid="btn-toggle-preview"]');

    // Expected Result: Script tag gets stripped or escaped (does not exist in preview DOM)
    const script = page.locator('[data-testid="malicious-script"]');
    await expect(script).not.toBeAttached();
  });
});
