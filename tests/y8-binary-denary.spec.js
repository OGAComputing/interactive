import { test, expect } from '@playwright/test';
import { expectPageTitle, expectNoClassroomBanner } from './helpers/activityHelpers.js';
import { toBinary, HEADINGS4, HEADINGS8, leftAfter, BASICS_POOL, PLENARY_POOL } from '../Y8/Data_Representation/L1_Binary_And_Denary/checkers.js';

const URL = '/Y8/Data_Representation/L1_Binary_And_Denary/1_Binary_And_Denary.html';
const KEY = 'y8_datarep_l1_binary_denary';

async function openTab(page, i) {
  await page.locator(`.tab[data-idx="${i}"]`).click();
  await expect(page.locator(`#panel-${i}`)).toHaveClass(/active/);
}

// Read the current ladder question from the card's data attributes and answer it.
async function fillLadder(page, i, { wrong = false } = {}) {
  const card = page.locator(`#qc-${i}`);
  const kind = await card.getAttribute('data-kind');
  const value = +(await card.getAttribute('data-value'));
  const width = +(await card.getAttribute('data-width'));
  const blank = (await card.getAttribute('data-show')) === 'blank';
  const guided = (await card.getAttribute('data-guided')) === '1';
  const heads = width === 8 ? HEADINGS8 : HEADINGS4;
  if (blank) for (let k = 0; k < width; k++) await card.locator(`[data-field="headings"][data-k="${k}"]`).fill(String(heads[k]));

  if (kind === 'b2d') {
    if (blank) {
      const bits = toBinary(value, width);
      for (let k = 0; k < width; k++) await card.locator(`[data-field="bits"][data-k="${k}"]`).fill(bits[k]);
    }
    await card.locator('[data-field="total"]').fill(String(wrong ? value + 1 : value));
  } else if (kind === 'd2b') {
    const bits = toBinary(wrong ? value ^ 1 : value, width);
    for (let k = 0; k < width; k++) {
      const btn = card.locator(`[data-action="toggle"][data-k="${k}"]`);
      await btn.click();                         // ? → 0
      if (bits[k] === '1') await btn.click();    // 0 → 1
      await expect(btn).toHaveText(bits[k]);
    }
    if (guided) {
      await expect(card.locator('.cell.start')).toHaveText(String(value));   // the first Left box holds the start number
      const left = leftAfter(value, heads);
      for (let k = 0; k < width; k++) await card.locator(`[data-field="left"][data-k="${k}"]`).fill(String(left[k]));
    }
  } else {
    for (const [k, h] of [128, 64, 32, 16].entries()) {
      await page.locator(`.dd-tile[data-val="${h}"]`).click();
      await page.locator(`.dd-slot[data-slot="h${k}"]`).click();
    }
  }
  await page.locator(`#check-${i}`).click();
}

async function passLadder(page, i) {
  await openTab(page, i);
  for (;;) {
    if (await page.locator(`#area-${i} .cp-done`).count()) break;
    const head = await page.locator(`#area-${i} .step-head span`).first().textContent();
    await fillLadder(page, i);
    await expect(page.locator(`#msg-${i}`)).toHaveClass(/good/);
    await expect(async () => {
      const done = await page.locator(`#area-${i} .cp-done`).count();
      const now = done ? '' : await page.locator(`#area-${i} .step-head span`).first().textContent();
      expect(done > 0 || now !== head).toBe(true);
    }).toPass({ timeout: 5000 });
  }
  await expect(page.locator(`#feedback-${i}`)).toHaveClass(/correct/);
}

async function passChain(page, i) {
  await openTab(page, i);
  for (;;) {
    if (await page.locator(`#area-${i} .cp-done`).count()) break;
    const card = page.locator(`#qc-${i}`);
    const head = await page.locator(`#area-${i} .step-head span`).first().textContent();
    const type = await card.getAttribute('data-type');
    if (type === 'mcq') {
      const id = await card.getAttribute('data-id');
      const q = [...BASICS_POOL, ...PLENARY_POOL].find(x => x.id === id);
      await card.locator(`.cp-opt[data-k="${q.a}"]`).click();
    } else {
      const value = +(await card.getAttribute('data-value'));
      const width = +(await card.getAttribute('data-width'));
      await page.locator(`#typed-${i}`).fill(type === 'b2d' ? String(value) : toBinary(value, width));
      await page.locator(`#typed-${i}`).press('Enter');
    }
    await expect(page.locator(`#msg-${i}`)).toHaveClass(/good/);
    await expect(async () => {
      const done = await page.locator(`#area-${i} .cp-done`).count();
      const now = done ? '' : await page.locator(`#area-${i} .step-head span`).first().textContent();
      expect(done > 0 || now !== head).toBe(true);
    }).toPass({ timeout: 5000 });
  }
  await expect(page.locator(`#feedback-${i}`)).toHaveClass(/correct/);
}

const saved = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);

test('loads with seven tabs, Tasks 5 to 7 locked, no external resources and no errors', async ({ page }) => {
  const errors = [];
  const external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) external.push(r.url()); });
  await page.goto(URL);
  await expectPageTitle(page, /Binary and Denary/);
  await expectNoClassroomBanner(page);
  await expect(page.locator('.tab')).toHaveCount(7);
  await expect(page.locator('#lock-4')).toBeVisible();
  await expect(page.locator('#next-card')).toBeHidden();
  await openTab(page, 4);
  await expect(page.locator('#area-4 .lock-card')).toContainText('Pass Task 4 first');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('the whole lesson first time: gold, 100 % and the locks open in order', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(URL);
  await passChain(page, 0);
  await passLadder(page, 1);
  await passLadder(page, 2);
  await passChain(page, 3);
  await expect(page.locator('#lock-4')).toBeHidden();
  await expect(page.locator('#lock-5')).toBeVisible();
  await passLadder(page, 4);
  await expect(page.locator('#lock-5')).toBeHidden();
  await passLadder(page, 5);
  await passChain(page, 6);
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#done-banner')).toHaveClass(/gold/);
  // Then on to the Cisco Binary Game, in a new tab
  const game = page.locator('#next-card a');
  await expect(game).toBeVisible();
  await expect(game).toHaveAttribute('href', 'https://learningcontent.cisco.com/games/binary/index.html');
  await expect(game).toHaveAttribute('target', '_blank');
  const s = await saved(page);
  expect(s.completed.every(Boolean)).toBe(true);
  expect(s.firstAttempt.every(Boolean)).toBe(true);
  expect(s.log[1].length).toBeGreaterThan(0);
  await expect(page.locator('#ev-1')).toHaveValue(/✓/);
});

test('a wrong ladder answer marks the part red, costs gold and gives a new number', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 1);
  const before = await page.locator('#qc-1').getAttribute('data-value');
  await fillLadder(page, 1, { wrong: true });
  await expect(page.locator('#qc-1 [data-part="total"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#msg-1')).toContainText('working');
  const retry = page.locator('#msg-1 button');
  await expect(retry).toBeDisabled();

  // The wait survives a refresh: the working and the countdown come back, not a new question
  await page.reload();
  await openTab(page, 1);
  await expect(page.locator('#qc-1')).toHaveCount(0);
  await expect(page.locator('#msg-1 button')).toContainText('Read the working');

  const again = page.locator('#msg-1 button');
  await expect(again).toBeEnabled({ timeout: 15000 });
  await again.click();
  await expect(page.locator('#qc-1')).not.toHaveAttribute('data-value', before);
  await expect(page.locator('#area-1 .step-head')).toContainText('Step 1 of 5');
  expect((await saved(page)).firstAttempt[1]).toBe(false);

  // A refresh keeps the new number, so it can't be dodged
  const now = await page.locator('#qc-1').getAttribute('data-value');
  await page.reload();
  await openTab(page, 1);
  await expect(page.locator('#qc-1')).toHaveAttribute('data-value', now);
});

test('a wrong chain answer restarts from question 1', async ({ page }) => {
  await page.goto(URL);
  const card = page.locator('#qc-0');
  const id = await card.getAttribute('data-id');
  const q = BASICS_POOL.find(x => x.id === id);
  const wrongKey = q.opts.find(o => o[0] !== q.a)[0];
  await card.locator(`.cp-opt[data-k="${wrongKey}"]`).click();
  await expect(page.locator('#msg-0')).toHaveClass(/bad/);
  const s = await saved(page);
  expect(s.cp[0]).toEqual({ attempt: 1, pos: 0 });
  expect(s.firstAttempt[0]).toBe(false);
});

test('empty boxes and badly formed answers are not marked wrong', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 2);
  await page.locator('#check-2').click();
  await expect(page.locator('#msg-2')).toContainText('Fill in every box first');

  await openTab(page, 3);
  const type = await page.locator('#qc-3').getAttribute('data-type');
  await page.locator('#typed-3').fill(type === 'b2d' ? 'ten' : '10');
  await page.locator('#check-3').click();
  await expect(page.locator('#msg-3')).toContainText(type === 'b2d' ? 'denary number' : 'exactly 4 bits');

  const s = await saved(page);
  expect(s.firstAttempt[2]).toBe(true);
  expect(s.firstAttempt[3]).toBe(true);
});
