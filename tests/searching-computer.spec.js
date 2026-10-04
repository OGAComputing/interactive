import { test, expect } from '@playwright/test';
import {
  ANSWERS, GATES, CHECKPOINTS, THREATS, ATTACK_TARGETS, fallsWithinHour, DEMO_PREDICT, CARVE_BLOCKS, isHistoryBlock,
} from '../Y9/Digital_Forensics/L5_Searching_the_Computer/searching-checkers.js';

const URL = '/Y9/Digital_Forensics/L5_Searching_the_Computer/Searching_the_Computer.html';
const KEY = 'y9-searching-computer-v3';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

// Click a visually hidden radio's visible label part, as a student would.
async function pickRadio(scope, name, value) {
  const input = scope.locator(`input[name="${name}"][value="${value}"]`).first();
  await input.locator('xpath=following-sibling::*[1]').click();
  await expect(input).toBeChecked();
}

// Answer one scored (non-checkpoint) task through the real controls.
async function answer(page, i) {
  const box = page.locator(`#task-${i}`);
  for (const [q, v] of Object.entries(ANSWERS['t' + i])) {
    if (i === 2) {
      await box.locator(`.chip[data-qw="${q}"]`).click();
      await box.locator(`.bin[data-bin="${v}"]`).click();
    } else if (await box.locator(`.dd-slot[data-slot="${q}"]`).count()) {
      await box.locator(`.dd-tile[data-val="${v}"]`).click();
      await box.locator(`.dd-slot[data-slot="${q}"]`).click();
      await expect(box.locator(`.dd-slot[data-slot="${q}"] .dd-tile[data-val="${v}"]`)).toHaveCount(1);
    } else {
      for (const val of [].concat(v)) await pickRadio(box, q, val);
    }
  }
  await page.locator(`#check-${i}`).click();
  await expect(page.locator(`#feedback-${i}`)).toHaveClass(/correct/);
}

// Answer a checkpoint correctly, reading each question off the screen.
async function passCheckpoint(page, i) {
  const pool = CHECKPOINTS['t' + i].pool;
  for (let n = 0; n < CHECKPOINTS['t' + i].length; n++) {
    const text = await page.locator(`#cp-${i} .cp-q`).textContent();
    const q = pool.find(x => x.q === text);
    await page.locator(`#cp-${i} .cp-opt[data-k="${q.a}"]`).click();
    if (n < CHECKPOINTS['t' + i].length - 1) await expect(page.locator(`#cp-${i} .cp-q`)).not.toHaveText(text);
  }
  await expect(page.locator(`#feedback-${i}`)).toHaveClass(/correct/);
}

async function passGate(page, g) {
  const box = page.locator(`#gate-${g}`);
  for (const [q, v] of Object.entries(GATES[g])) {
    for (const val of [].concat(v)) await box.locator(`input[name="${q}"][value="${val}"]`).check();
  }
  await page.locator(`#gatebtn-${g}`).click();
  await expect(page.locator(`#gatefb-${g}`)).toHaveClass(/correct/);
}

async function crackJournal(page) {
  for (const w of ['Maria', '23', 'Ibiza']) await page.click(`.wtile[data-word="${w}"]`);
  await pickRadio(page, 'jcase', 'upper');
  await page.click('#j-try');
  await expect(page.locator('#j-log')).toContainText('ACCESS GRANTED');
}

async function playStation1(page) {
  await crackJournal(page);
  await pickRadio(page, 'atkpred', '50');
  await page.click('#atk-free');
  await page.click('#atk-clue');
  await expect(page.locator('#atk-sum')).toBeVisible();
  for (let i = 0; i < ATTACK_TARGETS.length; i++) {
    await pickRadio(page.locator(`#target-${i}`), `pr-${i}`, fallsWithinHour(ATTACK_TARGETS[i]) ? 'crack' : 'safe');
  }
  await page.click('#predict-btn');
  await expect(page.locator('#predict-score')).toContainText('6 / 6');
  await page.fill('#pw', 'kettle tiger purple moon');
  await answer(page, 0);
  await passCheckpoint(page, 1);
}

async function carve(page) {
  for (const b of CARVE_BLOCKS.filter(isHistoryBlock)) await page.click(`.cblk[data-blk="${b.id}"]`);
  await expect(page.locator('#hist-body .hist-row')).toHaveCount(8);
}

test('page loads cleanly with only Station 1 unlocked', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL);
  await expect(page).toHaveTitle(/Searching the Computer/);
  await expect(page.locator('#stage-0')).toHaveClass(/active/);
  await expect(page.locator('.nav-btn[data-stage="1"]')).toBeDisabled();
  await expect(page.locator('.nav-btn[data-stage="5"]')).toBeDisabled();
  await expect(page.locator('#task-0')).toBeHidden();
  expect(errors).toEqual([]);
});

test('a password built from the journal words is flagged as personal and does not pass', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({
    completed: Array(10).fill(false), firstAttempt: Array(10).fill(true), passed: Array(10).fill(false),
    flags: { s1Manual: true, s1Clue: true, s1Predict: true }, answers: {}, texts: {}, protect: [], stage: 0, seed: 'abc',
  })), KEY);
  await page.reload();
  await page.fill('#pw', 'Maria23Ibiza');
  await expect(page.locator('#pw-why')).toContainText('Maria, Ibiza');
  await expect(page.locator('#pw-tips li[data-tip="personal"]')).not.toHaveClass(/ok/);
  await page.fill('#pw', 'kettle tiger purple maria');
  await expect(page.locator('#task-0')).toBeHidden();
  await page.fill('#pw', 'kettle tiger purple moon');
  await expect(page.locator('#task-0')).toBeVisible();
});

test('a wrong check is highlighted per question, loses gold and locks the button for a while', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({
    completed: Array(10).fill(false), firstAttempt: Array(10).fill(true), passed: Array(10).fill(false),
    flags: { s1Manual: true, s1Clue: true, s1Predict: true, s1Builder: true }, answers: {}, texts: {}, protect: [], stage: 0, seed: 'abc',
  })), KEY);
  await page.reload();
  const box = page.locator('#task-0');
  await box.locator('.dd-tile[data-val="code"]').click();
  await box.locator('.dd-slot[data-slot="d_2fa"]').click();
  await box.locator('.dd-tile[data-val="bots"]').click();
  await box.locator('.dd-slot[data-slot="d_lock"]').click();
  await page.click('#check-0');
  await expect(page.locator('[data-qw="d_2fa"]')).toHaveClass(/is-correct/);
  await expect(page.locator('[data-qw="d_lock"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#feedback-0')).toHaveClass(/wrong/);
  await expect(page.locator('#check-0')).toBeDisabled();
  const s = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
  expect(s.firstAttempt[0]).toBe(false);
  // The cooldown survives a refresh.
  await page.reload();
  await expect(page.locator('#check-0')).toBeDisabled();
});

test('a wrong checkpoint answer restarts the run with a new draw', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({
    completed: [true, ...Array(9).fill(false)], firstAttempt: Array(10).fill(true), passed: [true, ...Array(9).fill(false)],
    flags: { s1Manual: true, s1Clue: true, s1Predict: true, s1Builder: true }, answers: {}, texts: {}, protect: [], stage: 0, seed: 'abc',
  })), KEY);
  await page.reload();
  const pool = CHECKPOINTS.t1.pool;
  const t1 = await page.locator('#cp-1 .cp-q').textContent();
  await page.locator(`#cp-1 .cp-opt[data-k="${pool.find(q => q.q === t1).a}"]`).click();
  await expect(page.locator('#cp-1 .cp-head')).toContainText('Question 2 of 4');
  const t2 = await page.locator('#cp-1 .cp-q').textContent();
  const q2 = pool.find(q => q.q === t2);
  await page.locator(`#cp-1 .cp-opt[data-k="${q2.opts.find(o => o[0] !== q2.a)[0]}"]`).click();
  await expect(page.locator('#cpmsg-1')).toContainText('Back to question 1');
  const s = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
  expect(s.cp.t1).toEqual({ attempt: 1, pos: 0 });
  expect(s.firstAttempt[1]).toBe(false);
  // Refreshing doesn't dodge the restart.
  await page.reload();
  await expect(page.locator('#cp-1 .cp-head')).toContainText('Question 1 of 4');
});

test('carving: a near-miss block locks the scanner and is not counted', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({
    completed: [true, true, ...Array(8).fill(false)], firstAttempt: Array(10).fill(true), passed: [true, true, ...Array(8).fill(false)],
    flags: {}, answers: {}, texts: {}, protect: [], stage: 1, seed: 'abc',
  })), KEY);
  await page.reload();
  await page.click('.cblk[data-blk="d06"]');
  await expect(page.locator('#carve-msg')).toContainText('Close');
  await expect(page.locator('#carve-grid')).toHaveClass(/locked/);
  await expect(page.locator('#carve-count')).toHaveText('0');
  await expect(page.locator('#carve-grid')).not.toHaveClass(/locked/, { timeout: 6000 });
  await page.click('.cblk[data-blk="b03"]');
  await expect(page.locator('#carve-count')).toHaveText('1');
});

test('full investigation unlocks stations in order and finishes the case', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto(URL);
  await playStation1(page);
  await page.click('#next-1');

  await expect(page.locator('#stage-1')).toHaveClass(/active/);
  await carve(page);
  await answer(page, 2);
  await passGate(page, 'cookies');
  await passCheckpoint(page, 3);
  await expect(page.locator('#ev-2')).toHaveClass(/on/);
  await page.click('#next-3');

  await page.click('#demo-btn'); // save
  for (const n of [2, 3]) {
    await page.click('#demo-btn');
    await page.locator(`#demo-q .cp-opt[data-k="${DEMO_PREDICT[n].a}"]`).click();
    await expect(page.locator('#demo-btn')).toBeVisible();
  }
  await answer(page, 4);
  await page.click('#recover-btn');
  await expect(page.locator('#recovered .rec-card')).toHaveCount(5);
  await passGate(page, 'recov');
  await page.fill('#explain-del', 'Only the file table entry is removed, so the data stays until it is overwritten.');
  await page.click('button:has-text("Add to case notes")');
  await passCheckpoint(page, 5);
  await page.click('#next-5');

  await answer(page, 6);
  await page.click('#xt-old');
  await expect(page.locator('#xt-found .xcard')).toHaveCount(3);
  await page.click('#xt-new');
  await expect(page.locator('#xt-found .xcard.blocked')).toHaveCount(1);
  await passGate(page, 'extract');
  await answer(page, 7);
  await passCheckpoint(page, 8);
  await page.click('#next-8');

  await expect(page.locator('#task-9')).toBeHidden();
  for (const id of ['pass', 'twofa', 'lock']) {
    await page.check(`[data-protect="${id}"]`);
    await page.fill(`textarea[data-text="pj-${id}"]`, 'It stops other people getting into my accounts.');
  }
  await expect(page.locator('[data-protect="vpn"]')).toBeDisabled();
  await page.click('button:has-text("Add to report")');
  await answer(page, 9);

  await expect(page.locator('#case-closed')).toHaveClass(/on/);
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#done-banner')).toHaveClass(/gold/);
  await expect(page.locator('.nav-btn[data-stage="5"]')).toBeEnabled();
  await expect(page.locator('#progress-text')).toHaveText('Tasks 10 / 10');
});

test('progress survives a reload, mid-station', async ({ page }) => {
  await page.goto(URL);
  await playStation1(page);
  await page.click('#next-1');
  for (const b of CARVE_BLOCKS.filter(isHistoryBlock).slice(0, 3)) await page.click(`.cblk[data-blk="${b.id}"]`);

  await page.reload();
  await expect(page.locator('#stage-1')).toHaveClass(/active/);
  await expect(page.locator('#carve-count')).toHaveText('3');
  await expect(page.locator('.cblk.found')).toHaveCount(3);
  await expect(page.locator('.nav-btn[data-stage="0"]')).toHaveClass(/done/);
  await expect(page.locator('#ev-1')).toHaveClass(/on/);
  // Station 1 predictions are still shown.
  await expect(page.locator('#predict-score')).toContainText('6 / 6');
  // The practice password is never stored.
  expect(await page.evaluate(k => localStorage.getItem(k), KEY)).not.toContain('kettle');
});

test('each student gets their own order of cards', async ({ browser }) => {
  const orders = [];
  for (let n = 0; n < 3; n++) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(URL);
    orders.push(await page.locator('.cblk').evaluateAll(bs => bs.map(b => b.dataset.blk).join()));
    await ctx.close();
  }
  expect(new Set(orders).size).toBeGreaterThan(1);
});

test('Breach Defence: a challenge run ends after three breaches and records a best', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(k => {
    localStorage.setItem(k, JSON.stringify({
      completed: Array(10).fill(true), firstAttempt: Array(10).fill(true), passed: Array(10).fill(true),
      flags: {}, answers: {}, texts: {}, protect: [], stage: 5, pwRecord: null, seed: 'abc',
    }));
  }, KEY);
  await page.reload();
  await expect(page.locator('#bd-menu')).toHaveClass(/on/);
  await page.fill('#bd-code', 'test9');
  await page.click('button:has-text("Start challenge")');
  await expect(page.locator('#bd-game')).toHaveClass(/on/);

  const firstThreat = await page.locator('#threat-txt').textContent();

  // One correct answer, then three wrong ones.
  for (let n = 0; n < 4; n++) {
    const txt = await page.locator('#threat-txt').textContent();
    const threat = THREATS.find(t => t.text === txt);
    const cards = await page.locator('#hand .dcard').evaluateAll(bs => bs.map(b => b.dataset.def));
    const pick = n === 0 ? threat.best : cards.find(d => d !== threat.best && !threat.ok.includes(d));
    await page.click(`#hand .dcard[data-def="${pick}"]`);
    if (n === 0) await expect(page.locator('#hud-score')).not.toHaveText('0');
    if (n < 3) await expect(page.locator('#threat-txt')).not.toHaveText(txt, { timeout: 5000 });
  }
  await expect(page.locator('#bd-over')).toHaveClass(/on/, { timeout: 5000 });
  await expect(page.locator('#over-mode')).toContainText('TEST9');
  await expect(page.locator('#over-cards')).toHaveText('4');
  await expect(page.locator('#over-missed li')).toHaveCount(3);
  const store = await page.evaluate(() => JSON.parse(localStorage.getItem('y9-breach-defence-v1')));
  expect(store.codes.TEST9).toBeGreaterThan(0);
  expect(store.badges.first).toBe(true);

  // Same code → same first threat.
  await page.click('button:has-text("Play again")');
  await expect(page.locator('#threat-txt')).toHaveText(firstThreat);
});
