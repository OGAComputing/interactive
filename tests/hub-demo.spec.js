import { test, expect } from '@playwright/test';

// index.html?demo (hub-demo.js): made-up classes in the Live view, nothing sent to Google,
// and the real hub's storage left alone. hub-live.test.js covers the Live view's logic.

test('demo mode fills the Live view without Google and leaves the real hub alone', async ({ page }) => {
  const google = [];
  page.on('request', r => { if (/(^|\.)(googleapis|google)\.com$/.test(new URL(r.url()).hostname)) google.push(r.url()); });

  await page.goto('/index.html?demo');
  await expect(page.locator('#demo-badge')).toContainText('nothing is sent to Google');
  await expect(page.locator('#btn-live')).toBeVisible();
  await page.locator('#btn-live').click();

  await expect(page.locator('#live-course option')).toHaveText(['8X Computing (demo)', '9Y Computing (demo)', '9F Computing (demo)']);
  await expect(page.locator('#live-work')).toHaveValue('demo-8x-3');
  await expect.poll(() => page.locator('.live-card').count()).toBeGreaterThan(15);
  await expect(page.locator('.live-chip.idle').first()).toBeVisible();   // the two stuck students

  await page.locator('#live-tab-board').click();
  await expect(page.locator('.live-board-title')).toHaveText('Hex Rush X7');
  await expect.poll(() => page.locator('.live-board li').count()).toBeGreaterThan(1);   // 12 minutes in: the first few playing

  // Students 3 and 11 turned a corner this week.
  await page.locator('#live-tab-improved').click();
  await expect(page.locator('#live-compare')).toHaveValue('demo-8x-2');
  await expect(page.locator('.live-improved li').first()).toBeVisible();

  // A Y9 Python class takes the Station Zero skin.
  await page.locator('#live-course').selectOption('demo-9y');
  await expect(page.locator('#live-panel')).toHaveAttribute('data-skin', 'station-zero');

  expect(google).toEqual([]);   // every call was answered in the page

  // Without ?demo, the hub is signed out, as before: the demo kept to its own storage.
  await page.goto('/index.html');
  await expect(page.locator('#btn-live')).toBeHidden();
  const real = await page.evaluate(() => ['oga_hub_autosignin', 'oga_hub_last_course', 'oga_live_course', 'oga_live_hidden']
    .map(k => localStorage.getItem(k)).concat(sessionStorage.getItem('oga_hub_token')));
  expect(real).toEqual([null, null, null, null, null]);
});
