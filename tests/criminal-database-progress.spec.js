import { test, expect } from '@playwright/test';

const URL = '/Y9/Databases/Criminal_Database_Investigation.html';

test('progress survives a page refresh', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => {
    gotoStage(1); setTeachStep(4); markDone(0); gotoStage(2);
    ['dz-a','dz-b','dz-c','dz-d'].forEach(id => {
      dragTerm = DZ_ANSWERS[id];
      dzDrop({ preventDefault() {}, currentTarget: document.getElementById(id) });
    });
    gotoStage(3);
  });
  await page.fill('#s1-name', 'Burton');
  await page.click('#stage-3 button:has-text("EXECUTE SEARCH")');
  await page.click('#s1-tbody button');
  await page.click('#nav3 button');
  await page.click('#mcq-2a .mcq-opt:has-text("Full Name")');

  await page.reload();

  await expect(page.locator('#stage-4')).toHaveClass(/active/);
  await expect(page.locator('#mcq-2a .mcq-opt.correct')).toHaveCount(1);
  await expect(page.locator('#mcq-2b')).toBeVisible();
  await expect(page.locator('#cf-clues .cf-clue')).toHaveCount(2);
  expect(await page.evaluate(() => completed.slice(0, 4))).toEqual([true, true, true, true]);

  await page.evaluate(() => gotoStage(3));
  await expect(page.locator('#mia-card')).toHaveClass(/on/);
  await expect(page.locator('#s1-name')).toHaveValue('Burton');
  await page.evaluate(() => gotoStage(2));
  await expect(page.locator('#dz-success')).toHaveClass(/on/);
});

test('extension keeps the fastest time across shifts', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => {
    localStorage.setItem('crimdb-ext-shifts', JSON.stringify([{ total: 95000, wrong: 0, when: Date.now() }]));
    gotoStage(11);
  });
  await expect(page.locator('#ext-history .ext-pb-val')).toHaveText('1:35.0');

  // Finish a slower shift: best stays, both shown on the summary
  await page.evaluate(() => { extStartShift(); ext.times = Array(10).fill(12000); extShowSummary(); });
  await expect(page.locator('#ext-pb .ext-pb-cell.best .ext-pb-val')).toHaveText('1:35.0');
  await expect(page.locator('#ext-pb .ext-pb-cell:not(.best) .ext-pb-val')).toHaveText('2:00.0');

  // Finish a faster shift: becomes the new best and shows during the next shift
  await page.evaluate(() => { extStartShift(); ext.times = Array(10).fill(8000); extShowSummary(); });
  await expect(page.locator('#ext-pb .ext-pb-cell.best')).toHaveClass(/new/);
  await expect(page.locator('#ext-pb .ext-pb-cell.best .ext-pb-val')).toHaveText('1:20.0');
  await page.evaluate(() => extStartShift());
  await expect(page.locator('#ext-best-chip')).toContainText('1:20.0');
});
