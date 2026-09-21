import { test, expect } from '@playwright/test';

// error-reporter.js prints unexpected page errors in a footer panel, because there
// is no dev console on student computers. Exercised here on the Unit 1 activities
// (the template loads it the same way).
//
//   • Healthy pages never show the panel.
//   • Uncaught errors, unhandled rejections and failed resource loads appear in it.
//   • A Pyodide load failure (previously swallowed by a bare .catch) appears in it.
//   • Repeats collapse into one entry with a count.

const UNIT1 = [
  '/Y8/Python%20Unit%201/L1_Output/1_Strings_PRIMM.html',
  '/Y8/Python%20Unit%201/L2_Variables/1_Variables_PRIMM.html',
  '/Y8/Python%20Unit%201/L3_Input/1_Input_PRIMM.html',
  '/Y8/Python%20Unit%201/L4_Data_Types_Casting/1_Casting_PRIMM.html',
];
const ACTIVITY = UNIT1[0];
const PANEL = '#error-reporter';

// Pyodide's start-up blocks the page's main thread for seconds when several pages load
// at once, which would delay the panel past an assertion timeout. Errors are injected
// only once the Python engine is ready, so the tests measure the reporter, not the load.
async function gotoReady(page, url = ACTIVITY) {
  await page.goto(url);
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
}

for (const url of UNIT1) {
  test(`no error panel on a healthy page: ${decodeURIComponent(url.split('/').pop())}`, async ({ page }) => {
    await gotoReady(page, url);
    // Give any late-firing error handler time to render.
    await page.waitForTimeout(500);
    await expect(page.locator(PANEL)).toHaveCount(0);
  });
}

test('an uncaught JavaScript error is shown at the bottom of the page', async ({ page }) => {
  await gotoReady(page);
  await page.evaluate(() => setTimeout(() => { throw new TypeError('boom from a student PC'); }, 0));

  const panel = page.locator(PANEL);
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Something went wrong on this page (1 error)');
  await expect(panel.locator('.er-log')).toContainText('JavaScript error');
  await expect(panel.locator('.er-log')).toContainText('TypeError: boom from a student PC');
  await expect(panel.locator('.er-log')).toContainText('1_Strings_PRIMM.html');

  // It sits after everything else on the page.
  const isLast = await page.evaluate(() => document.body.lastElementChild.id === 'error-reporter');
  expect(isLast).toBe(true);
});

test('an unhandled promise rejection is shown', async ({ page }) => {
  await gotoReady(page);
  await page.evaluate(() => { Promise.reject(new Error('async failure')); });

  await expect(page.locator(`${PANEL} .er-log`)).toContainText('Unhandled promise rejection');
  await expect(page.locator(`${PANEL} .er-log`)).toContainText('async failure');
});

test('a script that fails to load is shown with its URL', async ({ page }) => {
  // Abort in the browser so the test doesn't depend on the test server's 404 handling.
  await page.route('**/definitely-missing-file.js', route => route.abort());
  await gotoReady(page);
  await page.evaluate(() => {
    const s = document.createElement('script');
    s.src = '/definitely-missing-file.js';
    document.body.appendChild(s);
  });

  await expect(page.locator(`${PANEL} .er-log`)).toContainText('Resource failed to load');
  await expect(page.locator(`${PANEL} .er-log`)).toContainText('<script> /definitely-missing-file.js');
});

test('repeated identical errors collapse into one entry with a count', async ({ page }) => {
  await gotoReady(page);
  await page.evaluate(() => {
    // Same message thrown from the same place three times.
    for (let i = 0; i < 3; i++) window.ErrorReporter.report('Test source', new Error('same again'));
  });

  const log = page.locator(`${PANEL} .er-log`);
  await expect(log).toContainText('happened 3 times');
  await expect(page.locator(PANEL)).toContainText('(3 errors)');
  expect(await log.innerText()).toMatch(/#1 /);
  expect(await log.innerText()).not.toMatch(/#2 /);
});

test('a Pyodide load failure is reported instead of swallowed', async ({ page }) => {
  // Block both the self-hosted copy and the CDN fallback.
  await page.route(/\/pyodide\//, route => route.abort());
  await page.goto(ACTIVITY);

  await expect(page.locator('#pyStatusText')).toHaveText(/unavailable/, { timeout: 30000 });
  const log = page.locator(`${PANEL} .er-log`);
  await expect(log).toContainText('Python engine failed to load');
});

test('"Copy report" puts the full report text on the clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await gotoReady(page);
  await page.evaluate(() => window.ErrorReporter.report('Test source', new Error('copy me')));

  await page.locator(`${PANEL} .er-copy`).click();
  await expect(page.locator(`${PANEL} .er-copy`)).toHaveText('Copied ✓');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toContain('Page error report');
  expect(clip).toContain('copy me');
  expect(clip).toContain('Browser:');
});
