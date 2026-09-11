import { test, expect } from '@playwright/test';

// Exercises the top progress-bar's "stuck" and "skipped" signals shared by
// PRIMM_Python_Y8-based activities:
//   • #progressFill turns amber once a student has sat on the same stage past
//     its threshold (P/R/I = 5 min, M1 = 10 min); M2 (Make) is exempt. Uses
//     Playwright's clock API to fast-forward real time so the 15s polling
//     interval and Date.now() both advance, without reaching into the page's
//     module-scoped internals.
//   • #progressFill flashes red once when a stage is marked skipped
//     (markStageSkipped, called from skipStep after 3 failed attempts).
const ACTIVITY = '/Y8/Python%20Unit%201/L2_Variables/1_Variables_PRIMM.html';

async function gotoActivity(page) {
  await page.clock.install();
  await page.goto(ACTIVITY);
  await expect(page.locator('#progressFill')).toBeVisible();
}

test('stuck indicator appears on Predict after 5 minutes with no progress', async ({ page }) => {
  await gotoActivity(page);
  const fill = page.locator('#progressFill');
  await expect(fill).not.toHaveClass(/stuck/);

  await page.clock.fastForward('05:01');
  await expect(fill).toHaveClass(/stuck/);
});

test('changing stage resets the stuck timer', async ({ page }) => {
  await gotoActivity(page);
  const fill = page.locator('#progressFill');

  await page.clock.fastForward('06:00');
  await expect(fill).toHaveClass(/stuck/);

  await page.locator('[data-stage="R"]').click();
  await expect(fill).not.toHaveClass(/stuck/);
});

test('Modify (M1) only flags stuck after 10 minutes, not 5', async ({ page }) => {
  await gotoActivity(page);
  const fill = page.locator('#progressFill');

  await page.locator('[data-stage="M1"]').click();
  await page.clock.fastForward('06:00');
  await expect(fill).not.toHaveClass(/stuck/);

  await page.clock.fastForward('04:01');
  await expect(fill).toHaveClass(/stuck/);
});

test('Make (M2) never shows the stuck indicator', async ({ page }) => {
  await gotoActivity(page);
  const fill = page.locator('#progressFill');

  await page.locator('[data-stage="M2"]').click();
  await page.clock.fastForward('30:00');
  await expect(fill).not.toHaveClass(/stuck/);
});

test('skipping a stage flashes the progress bar red', async ({ page }) => {
  await gotoActivity(page);
  const fill = page.locator('#progressFill');
  await expect(fill).not.toHaveClass(/skip-flash/);

  // skipStep is exposed on window for onclick handlers — exercising it directly
  // isolates the flash behaviour from the separate "3 failed attempts" flow.
  await page.evaluate(() => skipStep('I'));
  await expect(fill).toHaveClass(/skip-flash/);
  // and it marks the stage's nav button, same as before this feature existed.
  await expect(page.locator('[data-stage="I"]')).toHaveClass(/skipped/);
});
