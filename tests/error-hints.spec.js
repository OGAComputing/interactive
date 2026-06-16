import { test, expect } from '@playwright/test';

// Exercises the opt-in just-in-time error helper wired through the shared editor
// (code-editor.js + python-error-hints.js). Uses the Run-stage editor of the
// Unit 1 L0 Strings PRIMM activity, which enables { errorHints: true }.
const ACTIVITY = '/Y8/Python%20Unit%201/L0_Output/1_Strings_PRIMM.html';

async function gotoRunEditor(page) {
  await page.goto(ACTIVITY);
  await page.locator('[data-stage="R"]').click();
  const container = page.locator('#stage-R .editor-container');
  await expect(container).not.toHaveClass(/loading/, { timeout: 30000 });
}

test('shows a friendly hint + recipe below the editor after a failed run', async ({ page }) => {
  await gotoRunEditor(page);

  // Introduce the classic Year-8 error: a missing closing speech mark.
  await page.locator('#r_editor').fill('print("This is fun!)');
  await page.locator('#stage-R .checker-footer button:has-text("Run code")').click();

  // The raw error appears immediately; the helper is deliberately delayed ~3s.
  const helper = page.locator('#stage-R .error-helper');
  await expect(helper).toBeVisible({ timeout: 30000 });
  await expect(helper).toContainText('speech marks');
  await expect(helper).toContainText('Debugging Recipe');
  // The key takeaway is emphasised within the plain-English line.
  await expect(helper.locator('.eh-plain strong')).toContainText('missing one of the pair of speech marks');
});

test('hides the helper once the error is fixed', async ({ page }) => {
  await gotoRunEditor(page);

  await page.locator('#r_editor').fill('print("This is fun!)');
  await page.locator('#stage-R .checker-footer button:has-text("Run code")').click();
  await expect(page.locator('#stage-R .error-helper')).toBeVisible({ timeout: 30000 });

  // Fix it and re-run — the helper should disappear.
  await page.locator('#r_editor').fill('print("This is fun!")');
  await page.locator('#stage-R .checker-footer button:has-text("Run code")').click();
  await expect(page.locator('#stage-R .error-helper')).toBeHidden({ timeout: 30000 });
});

test('does not appear for code that runs cleanly', async ({ page }) => {
  await gotoRunEditor(page);

  await page.locator('#r_editor').fill('print("Hello, World!")');
  await page.locator('#stage-R .checker-footer button:has-text("Run code")').click();
  await expect(page.locator('#stage-R .py-status, #r_fb_run')).toBeVisible({ timeout: 30000 });

  // Give the (would-be) delayed helper longer than its reveal delay to be sure.
  await page.waitForTimeout(4000);
  await expect(page.locator('#stage-R .error-helper')).toBeHidden();
});
