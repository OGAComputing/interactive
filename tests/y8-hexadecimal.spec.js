import { test, expect } from '@playwright/test';
import { expectPageTitle, expectNoClassroomBanner } from './helpers/activityHelpers.js';
import {
  ladderQuestion, hexDigit, hi, lo, toHex, toBinary, SPLIT_GAP, itemAnswer, PLENARY_POOL, gameQuestion,
} from '../Y8/Data_Representation/L3_Hexadecimal/checkers.js';

const URL = '/Y8/Data_Representation/L3_Hexadecimal/1_Hexadecimal.html';
const KEY = 'y8_datarep_l3_hexadecimal';

const saved = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);

async function openTab(page, i) {
  await page.locator(`.tab[data-idx="${i}"]`).click();
  await expect(page.locator(`#panel-${i}`)).toHaveClass(/active/);
}

// Set a ? → 0 → 1 toggle by clicking until it shows the wanted bit.
async function setToggle(btn, want) {
  for (let n = 0; n < 3 && (await btn.textContent()).trim() !== want; n++) await btn.click();
  await expect(btn).toHaveText(want);
}

// The question on screen, worked out from the saved seed, step and retry.
async function currentQ(page, i) {
  const s = await saved(page);
  return ladderQuestion(i, s.ld[i].step, s.seed, s.ld[i].retry);
}

async function fillLadder(page, i, { wrong = false } = {}) {
  const q = await currentQ(page, i);
  const card = page.locator(`#qc-${i}`);
  const fill = (sel, v) => card.locator(sel).fill(String(v));
  if (i === 0) for (const [k, it] of q.items.entries()) await fill(`[data-field="items"][data-k="${k}"]`, wrong && k === 0 ? (it.dir === 'd2h' ? '0' : '99') : it.answer);
  if (i === 1) { await fill('[data-sub="n"]', q.n); await fill('[data-field="hex"]', wrong ? '0' : hexDigit(q.n)); }
  if (i === 2) {
    if (q.split === 'tap') await card.locator(`.gap-btn[data-k="${SPLIT_GAP}"]`).click();
    if (q.dec) { await fill('[data-field="dec"][data-sub="l"]', hi(q.n)); await fill('[data-field="dec"][data-sub="r"]', lo(q.n)); }
    if (q.nib) { await fill('[data-field="nib"][data-sub="l"]', hexDigit(hi(q.n))); await fill('[data-field="nib"][data-sub="r"]', hexDigit(lo(q.n))); }
    await fill('[data-field="ans"]', toHex(q.n).toLowerCase());
  }
  if (i === 3) {
    if (q.dec) { await fill('[data-field="dec"][data-sub="l"]', hi(q.n)); await fill('[data-field="dec"][data-sub="r"]', lo(q.n)); }
    const bits = toBinary(q.n, 8);
    if (q.entry === 'typed') await fill('[data-field="typed"]', bits);
    else for (let k = 0; k < 8; k++) await setToggle(card.locator(`[data-action="toggle"][data-k="${k}"]`), bits[k]);
  }
  await page.locator(`#check-${i}`).click();
}

async function waitForNext(page, i, head) {
  await expect(async () => {
    const done = await page.locator(`#area-${i} .cp-done`).count();
    const now = done ? '' : await page.locator(`#area-${i} .step-head span`).first().textContent();
    expect(done > 0 || now !== head).toBe(true);
  }).toPass({ timeout: 5000 });
}

async function passLadder(page, i) {
  await openTab(page, i);
  for (;;) {
    if (await page.locator(`#area-${i} .cp-done`).count()) break;
    const head = await page.locator(`#area-${i} .step-head span`).first().textContent();
    await fillLadder(page, i);
    await expect(page.locator(`#msg-${i}`)).toHaveClass(/good/);
    await waitForNext(page, i, head);
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
      await card.locator(`.cp-opt[data-k="${PLENARY_POOL.find(x => x.id === id).a}"]`).click();
    } else {
      await page.locator(`#typed-${i}`).fill(itemAnswer({ type, n: +(await card.getAttribute('data-n')) }));
      await page.locator(`#typed-${i}`).press('Enter');
    }
    await expect(page.locator(`#msg-${i}`)).toHaveClass(/good/);
    await waitForNext(page, i, head);
  }
  await expect(page.locator(`#feedback-${i}`)).toHaveClass(/correct/);
}

test('loads with seven tabs, Tasks 5, 6 and the game locked, no external resources and no errors', async ({ page }) => {
  const errors = [];
  const external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) external.push(r.url()); });
  await page.goto(URL);
  await expectPageTitle(page, /Hexadecimal/);
  await expectNoClassroomBanner(page);
  await expect(page.locator('.tab')).toHaveCount(7);
  await expect(page.locator('#lock-4')).toBeVisible();
  await expect(page.locator('#lock-6')).toBeVisible();
  await expect(page.locator('#area-0 .hex-table')).toBeVisible();
  await openTab(page, 4);
  await expect(page.locator('#area-4 .lock-card')).toContainText('Pass Task 4 first');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('hover definitions: a dotted word shows its meaning; none in the method box', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 1);
  const word = page.locator('#panel-1 .goal .gl', { hasText: /binary/i }).first();
  await word.hover();
  await expect(page.locator('#gl-tip')).toHaveClass(/show/);
  await expect(page.locator('#gl-tip')).toContainText('0 and 1');
  await expect(page.locator('#method-1 .gl')).toHaveCount(0);
});

test('the whole lesson first time: gold, 100 % and the locks open in order', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto(URL);
  await passLadder(page, 0);
  await passLadder(page, 1);
  await passLadder(page, 2);
  await expect(page.locator('#lock-4')).toBeVisible();
  await passLadder(page, 3);
  await expect(page.locator('#lock-4')).toBeHidden();
  await passChain(page, 4);
  await expect(page.locator('#lock-5')).toBeHidden();
  await passChain(page, 5);
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#done-banner')).toHaveClass(/gold/);
  await expect(page.locator('#lock-6')).toBeHidden();
  const s = await saved(page);
  expect(s.completed.every(Boolean)).toBe(true);
  expect(s.firstAttempt.every(Boolean)).toBe(true);
  await expect(page.locator('#ev-2')).toHaveValue(/✓/);
});

test('a wrong answer marks that box red, costs gold, waits through a refresh and gives a new question', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 1);
  const before = await page.locator('#qc-1').getAttribute('data-key');
  await fillLadder(page, 1, { wrong: true });
  await expect(page.locator('#qc-1 [data-part="h"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#qc-1 [data-part="d"]')).toHaveClass(/is-right/);
  await expect(page.locator('#msg-1 button')).toBeDisabled();

  await page.reload();
  await openTab(page, 1);
  await expect(page.locator('#qc-1')).toHaveCount(0);
  const again = page.locator('#msg-1 button');
  await expect(again).toBeEnabled({ timeout: 15000 });
  await again.click();
  expect(await page.locator('#qc-1').getAttribute('data-key')).not.toBe(before);
  await expect(page.locator('#area-1 .step-head')).toContainText('Step 1 of 4');
  expect((await saved(page)).firstAttempt[1]).toBe(false);
});

test('wrongly shaped answers get a hint and are not marked wrong', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 1);
  await page.locator('#check-1').click();
  await expect(page.locator('#msg-1')).toContainText('Fill in both boxes');
  const s0 = await saved(page);
  // Jump Task 3 to its answer-only step: 3 characters (115 for B5) is a hint, not a wrong answer
  await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.ld[2].step = 3; localStorage.setItem(k, JSON.stringify(s)); }, KEY);
  await page.reload();
  await openTab(page, 2);
  await page.locator('#qc-2 [data-field="ans"]').fill('115');
  await page.locator('#check-2').click();
  await expect(page.locator('#msg-2')).toContainText('two hex digits');
  const s = await saved(page);
  expect(s0.firstAttempt[1]).toBe(true);
  expect(s.firstAttempt[2]).toBe(true);
});

test('the split step: tapping the wrong gap marks it red', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k)); s.ld[2].step = 2; localStorage.setItem(k, JSON.stringify(s)); }, KEY);
  await page.reload();
  await openTab(page, 2);
  const q = await currentQ(page, 2);
  const card = page.locator('#qc-2');
  await card.locator('.gap-btn[data-k="3"]').click();
  await expect(card.locator('.gap-btn.on')).toHaveAttribute('data-k', '3');
  await card.locator('[data-sub="l"]').fill(hexDigit(hi(q.n)));
  await card.locator('[data-sub="r"]').fill(hexDigit(lo(q.n)));
  await card.locator('[data-field="ans"]').fill(toHex(q.n));
  await page.locator('#check-2').click();
  await expect(card.locator('.gap-btn[data-k="3"]')).toHaveClass(/is-wrong/);
  await expect(card.locator('[data-part="ans"]')).toHaveClass(/is-right/);
});

test('Hex Rush: a class challenge, game over and the best score in the header', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(URL);
  await page.evaluate(k => {
    const s = JSON.parse(localStorage.getItem(k));
    s.completed = s.completed.map(() => true);
    s.passed = [0, 1, 2, 3, 4, 5];
    localStorage.setItem(k, JSON.stringify(s));
  }, KEY);
  await page.reload();
  await openTab(page, 6);
  await page.locator('#rush-code').fill('hex-1');
  await page.locator('[data-rush="challenge"]').click();
  const q0 = gameQuestion('HEX1', 0);
  await expect(page.locator('#rush-show')).toHaveText(toBinary(q0.n, 4));
  await page.locator('#rush-in').fill(itemAnswer(q0).toLowerCase());
  await page.locator('#rush-in').press('Enter');
  await expect(page.locator('#verdict')).toContainText('Right');

  for (const i of [1, 2, 3]) {
    await expect(page.locator('#hud-q')).toHaveText(String(i + 1));
    const q = gameQuestion('HEX1', i);
    await page.locator('#rush-in').fill(itemAnswer(q) === 'F' ? 'E' : 'F');
    await page.locator('#rush-in').press('Enter');
    await expect(page.locator('#verdict')).toContainText('The answer is');
  }
  await expect(page.locator('#rush-over')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#over-mode')).toContainText('HEX1');
  const score = (await page.locator('#over-score').textContent()).trim();
  await expect(page.locator('#best-chip')).toContainText(`HEX1: ${score}`);
  const r = await page.evaluate(() => JSON.parse(localStorage.getItem('y8_datarep_l3_hex_rush')));
  expect(r.codes.HEX1).toBe(+score.replace(/,/g, ''));
});
