import { test, expect } from '@playwright/test';

// Exercises the opt-in just-in-time error helper wired through the shared editor
// (code-editor.js + python-error-hints.js). Uses the Run-stage editor of the
// Unit 1 L0 Strings PRIMM activity, which enables { errorHints: true }.
//
// Two reveal paths:
//   • Syntax errors  → a "Get help" button on the live syntax-hint (on demand).
//   • Run-time errors → auto-popup ~3s after a failed run (no syntax-hint exists).
const ACTIVITY = '/Y8/Python%20Unit%201/L0_Output/1_Strings_PRIMM.html';

async function gotoRunEditor(page) {
  await page.goto(ACTIVITY);
  await page.locator('[data-stage="R"]').click();
  const container = page.locator('#stage-R .editor-container');
  await expect(container).not.toHaveClass(/loading/, { timeout: 30000 });
}

test('syntax error: "Get help" on the hint opens the friendly explanation + recipe', async ({ page }) => {
  await gotoRunEditor(page);

  // Missing closing speech mark — caught by static analysis before any run.
  await page.locator('#r_editor').fill('print("This is fun!)');

  const helpBtn = page.locator('#stage-R .syntax-hint .syntax-hint-help');
  await expect(helpBtn).toBeVisible({ timeout: 30000 });

  // Help window stays closed until the student asks for it.
  const helper = page.locator('#stage-R .error-helper');
  await expect(helper).toBeHidden();

  await helpBtn.click();
  await expect(helper).toBeVisible();
  await expect(helper).toContainText('Debugging Recipe');
  await expect(helper.locator('.eh-plain strong')).toContainText('missing one of the pair of speech marks');
});

test('fixing the syntax error closes the hint and the help window', async ({ page }) => {
  await gotoRunEditor(page);

  await page.locator('#r_editor').fill('print("This is fun!)');
  const helpBtn = page.locator('#stage-R .syntax-hint .syntax-hint-help');
  await expect(helpBtn).toBeVisible({ timeout: 30000 });
  await helpBtn.click();
  await expect(page.locator('#stage-R .error-helper')).toBeVisible();

  await page.locator('#r_editor').fill('print("This is fun!")');
  await expect(page.locator('#stage-R .syntax-hint')).toBeHidden({ timeout: 30000 });
  await expect(page.locator('#stage-R .error-helper')).toBeHidden();
});

test('run-time error (NameError) auto-reveals the help window after the failed run', async ({ page }) => {
  await gotoRunEditor(page);

  // Valid syntax (no syntax-hint), but fails at run-time with NameError.
  await page.locator('#r_editor').fill('print(mystery)');
  await expect(page.locator('#stage-R .syntax-hint')).toBeHidden();

  await page.locator('#stage-R .checker-footer button:has-text("Run code")').click();

  const helper = page.locator('#stage-R .error-helper');
  await expect(helper).toBeVisible({ timeout: 30000 });
  await expect(helper).toContainText('recognise');
  await expect(helper).toContainText('Debugging Recipe');
});

test('clean code shows no hint and no help window', async ({ page }) => {
  await gotoRunEditor(page);

  await page.locator('#r_editor').fill('print("Hello, World!")');
  await page.locator('#stage-R .checker-footer button:has-text("Run code")').click();
  await expect(page.locator('#stage-R .py-status, #r_fb_run')).toBeVisible({ timeout: 30000 });

  await page.waitForTimeout(4000); // longer than the auto-reveal delay
  await expect(page.locator('#stage-R .error-helper')).toBeHidden();
  await expect(page.locator('#stage-R .syntax-hint')).toBeHidden();
});
