import { test, expect } from '@playwright/test';
import { expectPageTitle, expectNoClassroomBanner } from './helpers/activityHelpers.js';
import { toBinary, addColumns, fullAnswer, gameSum, PLENARY_POOL } from '../Y8/Data_Representation/L2_Binary_Addition/checkers.js';

const URL = '/Y8/Data_Representation/L2_Binary_Addition/1_Binary_Addition.html';
const KEY = 'y8_datarep_l2_binary_addition_v2';

async function openTab(page, i) {
  await page.locator(`.tab[data-idx="${i}"]`).click();
  await expect(page.locator(`#panel-${i}`)).toHaveClass(/active/);
}

// Set a toggle button by clicking until it shows the wanted text.
async function setToggle(btn, want) {
  for (let n = 0; n < 3 && (await btn.textContent()).trim() !== want; n++) await btn.click();
  await expect(btn).toHaveText(want === '' ? /^\s*$/ : want);
}

// Read the current ladder sum from the card's data attributes and answer it.
async function fillLadder(page, i, { wrong = false } = {}) {
  const card = page.locator(`#qc-${i}`);
  const a = +(await card.getAttribute('data-a'));
  const b = +(await card.getAttribute('data-b'));
  const width = +(await card.getAttribute('data-width'));
  const r = addColumns(a, b, width);
  if ((await card.getAttribute('data-pad')) === '1') {
    for (let k = 0; k < width; k++) {
      await card.locator(`[data-field="rowA"][data-k="${k}"]`).fill(r.A[k]);
      await card.locator(`[data-field="rowB"][data-k="${k}"]`).fill(r.B[k]);
    }
  }
  if ((await card.getAttribute('data-carry')) === 'write') {
    for (let k = 0; k < width - 1; k++) await setToggle(card.locator(`[data-field="carries"][data-k="${k}"]`), r.carryIn[k] ? '1' : '');
  }
  if ((await card.getAttribute('data-extra')) === '1') await setToggle(card.locator('[data-field="extra"]'), r.final ? '1' : '');
  const bits = toBinary((wrong ? r.sum ^ 1 : r.sum) % (1 << width), width);
  for (let k = 0; k < width; k++) await setToggle(card.locator(`[data-field="bits"][data-k="${k}"]`), bits[k]);
  if ((await card.getAttribute('data-dec')) === '1') {
    await card.locator('[data-sub="a"]').fill(String(a));
    await card.locator('[data-sub="b"]').fill(String(b));
    await card.locator('[data-sub="sum"]').fill(String(a + b));
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
      const q = PLENARY_POOL.find(x => x.id === id);
      await card.locator(`.cp-opt[data-k="${q.a}"]`).click();
    } else {
      const width = +(await card.getAttribute('data-width'));
      const answer = fullAnswer(+(await card.getAttribute('data-a')), +(await card.getAttribute('data-b')), width);
      await page.locator(`#typed-${i}`).fill(answer);
      await page.locator(`#typed-${i}`).press('Enter');
    }
    await expect(page.locator(`#msg-${i}`)).toHaveClass(/good/);
    await waitForNext(page, i, head);
  }
  await expect(page.locator(`#feedback-${i}`)).toHaveClass(/correct/);
}

const saved = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);

test('loads with six tabs, Tasks 4, 5 and the game locked, no external resources and no errors', async ({ page }) => {
  const errors = [];
  const external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) external.push(r.url()); });
  await page.goto(URL);
  await expectPageTitle(page, /Binary Addition/);
  await expectNoClassroomBanner(page);
  await expect(page.locator('.tab')).toHaveCount(6);
  await expect(page.locator('#lock-5')).toBeVisible();
  await expect(page.locator('#best-chip')).toBeHidden();
  await expect(page.locator('#lock-3')).toBeVisible();
  await openTab(page, 3);
  await expect(page.locator('#area-3 .lock-card')).toContainText('Pass Task 3 first');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('hover definitions: a dotted word shows its meaning; none in the method box', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 1);
  const word = page.locator('#panel-1 .goal .gl').first();
  await expect(word).toHaveText(/carry/i);
  await word.hover();
  await expect(page.locator('#gl-tip')).toHaveClass(/show/);
  await expect(page.locator('#gl-tip')).toContainText('next column on the left');
  await expect(page.locator('#method-1 .gl')).toHaveCount(0);
});

test('the whole lesson first time: gold, 100 % and the locks open in order', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto(URL);
  await passLadder(page, 0);
  await passLadder(page, 1);
  await passChain(page, 2);
  await expect(page.locator('#lock-3')).toBeHidden();
  await expect(page.locator('#lock-4')).toBeVisible();
  await passLadder(page, 3);
  await expect(page.locator('#lock-4')).toBeHidden();
  await passChain(page, 4);
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#done-banner')).toHaveClass(/gold/);
  const s = await saved(page);
  expect(s.completed.every(Boolean)).toBe(true);
  expect(s.firstAttempt.every(Boolean)).toBe(true);
  await expect(page.locator('#ev-0')).toHaveValue(/✓/);
});

test('a wrong ladder answer marks the bit red, costs gold and gives a new sum', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 0);
  const before = await page.locator('#qc-0').getAttribute('data-a') + '+' + await page.locator('#qc-0').getAttribute('data-b');
  await fillLadder(page, 0, { wrong: true });
  await expect(page.locator('#qc-0 [data-part="s3"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#msg-0')).toContainText('working');
  await expect(page.locator('#msg-0 button')).toBeDisabled();

  // The wait survives a refresh: the working and the countdown come back, not a new question
  await page.reload();
  await openTab(page, 0);
  await expect(page.locator('#qc-0')).toHaveCount(0);
  const again = page.locator('#msg-0 button');
  await expect(again).toContainText('Read the working');
  await expect(again).toBeEnabled({ timeout: 15000 });
  await again.click();
  const after = await page.locator('#qc-0').getAttribute('data-a') + '+' + await page.locator('#qc-0').getAttribute('data-b');
  expect(after).not.toBe(before);
  await expect(page.locator('#area-0 .step-head')).toContainText('Step 1 of 5');
  expect((await saved(page)).firstAttempt[0]).toBe(false);
});

test('empty boxes and badly formed answers are not marked wrong', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 0);
  await page.locator('#check-0').click();
  await expect(page.locator('#msg-0')).toContainText('Fill in every box first');

  await openTab(page, 2);
  await page.locator('#typed-2').fill('12');
  await page.locator('#check-2').click();
  await expect(page.locator('#msg-2')).toContainText('in bits');

  const s = await saved(page);
  expect(s.firstAttempt[0]).toBe(true);
  expect(s.firstAttempt[2]).toBe(true);
});

// ── Carry Rush ──
// Open the game as a student who has finished the lesson.
async function openRush(page) {
  await page.goto(URL);
  await page.evaluate(k => {
    const s = JSON.parse(localStorage.getItem(k));
    s.completed = s.completed.map(() => true);
    s.passed = [0, 1, 2, 3, 4];
    localStorage.setItem(k, JSON.stringify(s));
  }, KEY);
  await page.reload();
  await openTab(page, 5);
  await expect(page.locator('#rush-menu')).toBeVisible();
}

async function answerRush(page, i, code, { right = true } = {}) {
  await expect(page.locator('#hud-sum')).toHaveText(String(i + 1));
  const s = gameSum(code, i);
  const ans = fullAnswer(s.a, s.b, s.width);
  const typed = right ? ans : ans.slice(0, -1) + (ans.at(-1) === '1' ? '0' : '1');
  // Typed right to left, the way the sum is worked: each bit goes in the next column to the left
  for (const c of [...typed].reverse()) await page.keyboard.press(c);
  await page.keyboard.press('Enter');
}

// The answer boxes under the sum, left (extra column) to right.
const rushBoxes = page => page.locator('#rush-sum .rans').allTextContents();

test('Carry Rush: a class challenge, badges, game over and the best score in the header', async ({ page }) => {
  test.setTimeout(60_000);
  await openRush(page);
  await page.locator('#rush-code').fill('bin-7');
  await page.locator('[data-rush="challenge"]').click();
  await expect(page.locator('#rush-game')).toBeVisible();

  // The class code fixes the sums: what's on screen is gameSum('BIN7', 0)
  const s0 = gameSum('BIN7', 0);
  await expect(page.locator('#rush-sum .cell.bit').first()).toHaveText(toBinary(s0.a, s0.width)[0]);
  await answerRush(page, 0, 'BIN7');
  await expect(page.locator('#verdict')).toContainText('Right');
  await answerRush(page, 1, 'BIN7');
  await expect(page.locator('#verdict')).toContainText('Right');

  // A part-filled answer costs nothing
  await expect(page.locator('#hud-sum')).toHaveText('3');
  await page.keyboard.press('1');
  await page.keyboard.press('Enter');
  await expect(page.locator('#verdict')).toContainText('Fill every column');
  await expect(page.locator('#hud-lives')).toHaveText('❤️❤️❤️');
  await page.keyboard.press('Backspace');

  // Three wrong answers end the run; each shows the worked answer
  for (const i of [2, 3, 4]) {
    await answerRush(page, i, 'BIN7', { right: false });
    await expect(page.locator('#verdict')).toContainText('The answer is');
  }
  await expect(page.locator('#rush-over')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#over-mode')).toContainText('BIN7');
  await expect(page.locator('#over-badges .badge.got')).toContainText('First Run');
  await expect(page.locator('#over-missed li')).toHaveCount(3);
  const score = (await page.locator('#over-score').textContent()).trim();
  await expect(page.locator('#best-chip')).toBeVisible();
  await expect(page.locator('#best-chip')).toContainText(`BIN7: ${score}`);

  // The best is kept after a reload and shown on every tab
  await page.reload();
  await openTab(page, 0);
  await expect(page.locator('#best-chip')).toContainText(`BIN7: ${score}`);
  const r = await page.evaluate(() => JSON.parse(localStorage.getItem('y8_datarep_l2_carry_rush')));
  expect(r.codes.BIN7).toBe(+score.replace(/,/g, ''));
  expect(r.badges.first).toBe(true);
  await expect(page.locator('#ev-rush')).toHaveValue(/BIN7/);
});

test('Carry Rush: answers fill right to left under the columns; the keypad; leaving the tab ends the run', async ({ page }) => {
  await openRush(page);
  await page.locator('[data-rush="solo"]').click();
  await expect(page.locator('#rush-sum .rans')).toHaveCount(5);          // 4 columns + the extra one
  await page.locator('[data-key="1"]').click();
  await page.locator('[data-key="0"]').click();
  await page.locator('[data-key="carry"]').click();                      // a carry above the third column
  await page.locator('[data-key="1"]').click();
  await page.locator('[data-key="back"]').click();
  expect(await rushBoxes(page)).toEqual(['', '', '', '0', '1']);
  await expect(page.locator('#rush-sum .rc[data-c="1"]')).toHaveText('1');
  await page.locator('#rush-sum .rans[data-a="0"]').click();             // tap a box to move there
  await page.keyboard.press('1');
  expect(await rushBoxes(page)).toEqual(['1', '', '', '0', '1']);
  await openTab(page, 0);
  await openTab(page, 5);
  await expect(page.locator('#rush-menu')).toBeVisible();
  const r = await page.evaluate(() => JSON.parse(localStorage.getItem('y8_datarep_l2_carry_rush')));
  expect(r.runs ?? 0).toBe(0);
});
