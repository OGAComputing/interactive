import { test, expect } from '@playwright/test';
import { expectPageTitle, expectNoClassroomBanner, recordLiveCalls, lastLiveCall } from './helpers/activityHelpers.js';
import {
  ladderQuestion, LADDERS, keepsOnRetry, slotIds, pinKeys, buildItem, PLENARY_POOL, drawPlenary, tcolAnswer, gameQuestion, itemAnswer, isLogic, GAME_LEVELS,
} from '../Y8/Data_Representation/L4_Logic_Gates/checkers.js';

const URL = '/Y8/Data_Representation/L4_Logic_Gates/1_Logic_Gates.html';
const KEY = 'y8_datarep_l4_logic_gates';

const saved = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
async function patch(page, fn) {
  await page.evaluate(([k, src]) => {
    const s = JSON.parse(localStorage.getItem(k));
    new Function('s', src)(s);
    localStorage.setItem(k, JSON.stringify(s));
  }, [KEY, `(${fn})(s)`]);
  await page.reload();
}

async function openTab(page, i) {
  await page.locator(`.tab[data-idx="${i}"]`).click();
  await expect(page.locator(`#panel-${i}`)).toHaveClass(/active/);
}

// ? → 0 → 1 → 0: click until the box shows the wanted bit.
async function setToggle(btn, want) {
  for (let n = 0; n < 3 && (await btn.textContent()).trim() !== want; n++) await btn.click();
  await expect(btn).toHaveText(want);
}

// Tap a chip in the tray, then tap the box (the tap-to-place route; dragging has its own test).
async function place(page, i, kind, value, key) {
  await page.locator(`#area-${i} .chip[data-kind="${kind}"][data-chip="${value}"]`).click();
  await page.locator(`#area-${i} .drop[data-drop="${key}"]`).click();
  await expect(page.locator(`#area-${i} .drop[data-drop="${key}"]`)).toContainText(kind === 'gate' ? '' : value);
}

async function currentQ(page, i) {
  const s = await saved(page);
  const st = s.ld[i];
  return ladderQuestion(i, st.step, s.seed, keepsOnRetry(LADDERS[i][st.step]?.kind) ? (st.round || 0) : st.retry);
}

async function fillLadder(page, i) {
  const q = await currentQ(page, i);
  const tog = (k, v) => setToggle(page.locator(`#qc-${i} [data-action="toggle"][data-k="${k}"]`), String(v));
  if (q.kind === 'situ' || q.kind === 'table') for (const [k, a] of q.answers.entries()) await tog('q' + k, a);
  if (q.kind === 'gap') for (const [k, a] of q.answers.entries()) await place(page, i, 'word', a, 's' + k);
  if (q.kind === 'name3' || q.kind === 'whichGate') for (const [k, a] of q.answers.entries()) await place(page, i, 'name', a, 's' + k);
  if (q.kind === 'nameCircuit') for (const g of slotIds(q.layout)) await place(page, i, 'name', q.build[g], g);
  if (q.kind === 'trace') for (let k = 0; k < q.Q.length; k++) { if (!q.giveP) await tog('P' + k, q.P[k]); await tog('Q' + k, q.Q[k]); }
  if (q.kind === 'build') {
    const b = buildItem(q.layout, q.item).build;
    for (const g of slotIds(q.layout)) await place(page, i, 'gate', b[g], g);
    if (q.pins) for (const k of pinKeys(q.layout)) await place(page, i, 'input', b[k], k);
  }
  await page.locator(`#check-${i}`).click();
}

async function waitForNext(page, i, head) {
  await expect(async () => {
    const done = await page.locator(`#area-${i} .cp-done`).count();
    const now = done ? '' : await page.locator(`#area-${i} .step-head span`).first().textContent();
    expect(done > 0 || now !== head).toBe(true);
  }).toPass({ timeout: 6000 });
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

async function passPlenary(page) {
  await openTab(page, 5);
  for (;;) {
    if (await page.locator('#area-5 .cp-done').count()) break;
    const s = await saved(page);
    const item = drawPlenary(s.seed, s.cp.attempt)[s.cp.pos];
    const head = await page.locator('#area-5 .step-head span').first().textContent();
    if (item.type === 'mcq') {
      await page.locator(`#qc-5 .cp-opt[data-k="${PLENARY_POOL.find(x => x.id === item.id).a}"]`).click();
    } else {
      const want = tcolAnswer(item);
      for (let k = 0; k < want.length; k++) await setToggle(page.locator(`#qc-5 [data-k="q${k}"]`), want[k]);
      await page.locator('#check-5').click();
    }
    await expect(page.locator('#msg-5')).toHaveClass(/good/);
    await waitForNext(page, 5, head);
  }
}

test('loads with seven tabs, Tasks 4–6 and the game locked, no external resources and no errors', async ({ page }) => {
  const errors = [];
  const external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) external.push(r.url()); });
  await page.goto(URL);
  await expectPageTitle(page, /Logic Gates/);
  await expectNoClassroomBanner(page);
  await expect(page.locator('.tab')).toHaveCount(7);
  for (const i of [3, 4, 5, 6]) await expect(page.locator(`#lock-${i}`)).toBeVisible();
  await expect(page.locator('#area-0 .scenario')).toContainText('AND');
  await openTab(page, 4);
  await expect(page.locator('#area-4 .lock-card')).toContainText('Pass Task 4 first');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('hover definitions: a dotted word shows its meaning; none in the method box', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 2);
  const word = page.locator('#panel-2 .goal .gl', { hasText: /truth tables/i }).first();
  await word.hover();
  await expect(page.locator('#gl-tip')).toHaveClass(/show/);
  await expect(page.locator('#gl-tip')).toContainText('output for every input');
  await expect(page.locator('#method-2 .gl')).toHaveCount(0);
});

test('the whole lesson first time: gold, 100 % and the locks open in order', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto(URL);
  await passLadder(page, 0);
  await passLadder(page, 1);
  await passLadder(page, 2);
  await expect(page.locator('#lock-3')).toBeHidden();
  await passLadder(page, 3);
  await expect(page.locator('#lock-4')).toBeHidden();
  await passLadder(page, 4);
  await passPlenary(page);
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#done-banner')).toHaveClass(/gold/);
  await expect(page.locator('#lock-6')).toBeHidden();
  const s = await saved(page);
  expect(s.completed.every(Boolean)).toBe(true);
  expect(s.firstAttempt.every(Boolean)).toBe(true);
  await expect(page.locator('#ev-4')).toHaveValue(/Q = .*✓/);
});

test('build by dragging: a gate drops into its box, NOT is refused by a two-input box, the switches light the bulb', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });   // the tray and the circuit both on screen, as a real drag needs
  await page.goto(URL);
  await patch(page, s => { s.passed = [0, 1, 2, 3]; s.ld[4] = { step: 0, retry: 0 }; s.tab = 4; });
  const q = await currentQ(page, 4);
  const want = buildItem('one', q.item).build.g1;
  const drag = async (value, key) => {
    const from = await page.locator(`#area-4 .chip[data-chip="${value}"]`).boundingBox();
    const to = await page.locator(`#area-4 .drop[data-drop="${key}"]`).boundingBox();
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(from.x + 40, from.y + 40, { steps: 4 });
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
    await page.mouse.up();
  };
  await drag('NOT', 'g1');
  await expect(page.locator('#msg-4')).toContainText('only one input');
  await expect(page.locator('#area-4 .drop[data-drop="g1"]')).not.toHaveClass(/filled/);
  await drag(want, 'g1');
  await expect(page.locator('#area-4 .drop[data-drop="g1"]')).toHaveClass(/filled/);
  // Both switches on: AND and OR both give 1, so the bulb lights.
  await page.locator('#area-4 [data-action="switch"][data-k="A"]').click();
  await page.locator('#area-4 [data-action="switch"][data-k="B"]').click();
  await expect(page.locator('#area-4 .bulb')).toHaveClass(/lit/);
  await expect(page.locator('#area-4 .bulb-read')).toContainText('Q = 1');
  // Tapping the filled box empties it.
  await page.locator('#area-4 .drop[data-drop="g1"]').click();
  await expect(page.locator('#area-4 .drop[data-drop="g1"]')).not.toHaveClass(/filled/);
});

test('a wrong circuit marks the wrong rows red, costs gold, waits, and comes back to fix with the circuit kept', async ({ page }) => {
  await page.goto(URL);
  await patch(page, s => { s.passed = [0, 1, 2, 3]; s.ld[4] = { step: 0, retry: 0 }; s.tab = 4; });
  const q = await currentQ(page, 4);
  const wrong = buildItem('one', q.item).build.g1 === 'AND' ? 'OR' : 'AND';
  await place(page, 4, 'gate', wrong, 'g1');
  await page.locator('#check-4').click();
  await expect(page.locator('#result-4 tr.is-wrong')).toHaveCount(2);
  await expect(page.locator('#result-4 tr.is-right')).toHaveCount(2);
  await expect(page.locator('#msg-4 button')).toBeDisabled();
  expect((await saved(page)).firstAttempt[4]).toBe(false);
  await expect(page.locator('#msg-4 button')).toBeEnabled({ timeout: 8000 });
  await expect(page.locator('#msg-4')).toContainText('Wrong output when');
  await expect(page.locator('#msg-4')).not.toContainText('One circuit that works');
  await page.locator('#msg-4 button').click();
  expect(await page.locator('#qc-4').getAttribute('data-key')).toBe(q.key);
  await expect(page.locator('#area-4 .drop[data-drop="g1"]')).toHaveClass(/filled/);
  // Fixing it passes the step.
  await page.locator('#area-4 .drop[data-drop="g1"]').click();
  await place(page, 4, 'gate', buildItem('one', q.item).build.g1, 'g1');
  await page.locator('#check-4').click();
  await expect(page.locator('#msg-4')).toHaveClass(/good/);
});

test('a wrong trace keeps the circuit and the right boxes, empties the wrong ones, then gives one more new circuit', async ({ page }) => {
  await page.goto(URL);
  await patch(page, s => { s.passed = [0, 1, 2]; s.ld[3] = { step: 1, retry: 0 }; s.tab = 3; });
  const q = await currentQ(page, 3);
  // Column headings say what each column is.
  await expect(page.locator('#qc-3 th').filter({ hasText: /^P/ })).toContainText('= NOT A');
  await expect(page.locator('#qc-3 th').filter({ hasText: /^Q/ })).toContainText(`= P ${q.build.g2} B`);
  const tog = (k, v) => setToggle(page.locator(`#qc-3 [data-action="toggle"][data-k="${k}"]`), String(v));
  for (let k = 0; k < 4; k++) { await tog('P' + k, q.P[k]); await tog('Q' + k, k === 0 ? 1 - q.Q[0] : q.Q[k]); }
  await page.locator('#check-3').click();
  await expect(page.locator('#qc-3 [data-k="Q0"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#msg-3')).toContainText(`Q = P ${q.build.g2} B`);
  await expect(page.locator('#msg-3')).not.toContainText(q.Q);
  await expect(page.locator('#msg-3 button')).toBeEnabled({ timeout: 8000 });
  await page.locator('#msg-3 button').click();
  expect(await page.locator('#qc-3').getAttribute('data-key')).toBe(q.key);
  await expect(page.locator('#qc-3 [data-k="Q0"]')).toHaveText('?');
  await expect(page.locator('#qc-3 [data-k="Q1"]')).toHaveText(String(q.Q[1]));
  await expect(page.locator('#qc-3 [data-k="P0"]')).toHaveText(String(q.P[0]));
  await tog('Q0', q.Q[0]);
  await page.locator('#check-3').click();
  await expect(page.locator('#msg-3')).toContainText('one more like it');
  // The next one is a new circuit at the same step.
  await expect(async () => expect(await page.locator('#qc-3').getAttribute('data-key')).not.toBe(q.key)).toPass({ timeout: 6000 });
  const s = await saved(page);
  expect(s.ld[3].step).toBe(1);
  expect(s.ld[3].round).toBe(1);
  // Try for Gold stays hidden while other tasks are still to do.
  await expect(page.locator('#reset-3')).toBeHidden();
});

test('Task 4 passes after three steps; the three-input trace is a ★ extension and Task 5 is open', async ({ page }) => {
  await page.goto(URL);
  await patch(page, s => { s.passed = [0, 1, 2]; s.ld[3] = { step: 2, retry: 0 }; s.tab = 3; });
  await fillLadder(page, 3);
  await expect(page.locator('#area-3 .cp-done')).toBeVisible({ timeout: 6000 });
  await expect(page.locator('#area-3 .step-head')).toContainText('★ Extension');
  await expect(page.locator('#lock-4')).toBeHidden();
  const s = await saved(page);
  expect(s.completed[3]).toBe(true);
  // A wrong extension answer doesn't cost gold.
  for (let k = 0; k < 8; k++) await setToggle(page.locator(`#qc-3 [data-action="toggle"][data-k="P${k}"]`), '0');
  for (let k = 0; k < 8; k++) await setToggle(page.locator(`#qc-3 [data-action="toggle"][data-k="Q${k}"]`), '1');
  await page.locator('#check-3').click();
  await expect(page.locator('#msg-3')).toHaveClass(/bad/);
  expect((await saved(page)).firstAttempt[3]).toBe(true);
});

test('Logic Rush: logic only to start, a class challenge, game over and the best in the header', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(URL);
  await patch(page, s => { s.completed = s.completed.map(() => true); s.passed = [0, 1, 2, 3, 4, 5]; s.tab = 6; });
  await recordLiveCalls(page);
  await page.locator('#rush-code').fill('lg-4');
  await page.locator('[data-rush="challenge"]').click();
  // The first questions are logic only (hex, adding and denary join later).
  for (let i = 0; i < GAME_LEVELS[1].from; i++) expect(isLogic(gameQuestion('LG4', i).type)).toBe(true);
  const q0 = gameQuestion('LG4', 0);
  expect(q0.type).toBe('trio');
  await page.locator('#rush-in').fill(itemAnswer(q0));
  await page.locator('#rush-in').press('Enter');
  await expect(page.locator('#verdict')).toContainText('Right');
  expect(await lastLiveCall(page)).toMatchObject({ boardLabel: 'Logic Rush LG4' });

  for (const i of [1, 2, 3]) {
    // A wrong answer stays on screen for 4.5 s before the next question.
    await expect(page.locator('#hud-q')).toHaveText(String(i + 1), { timeout: 10_000 });
    const q = gameQuestion('LG4', i);
    const a = itemAnswer(q);
    const wrongAnswer = q.type === 'name' ? (a === 'AND' ? 'OR' : 'AND') : a.slice(0, -1) + (a.at(-1) === '1' ? '0' : '1');
    await page.locator('#rush-in').fill(wrongAnswer);
    await page.locator('#rush-in').press('Enter');
    await expect(page.locator('#verdict')).toContainText('The answer is');
  }
  await expect(page.locator('#rush-over')).toBeVisible({ timeout: 10_000 });
  const score = (await page.locator('#over-score').textContent()).trim();
  await expect(page.locator('#best-chip')).toContainText(`LG4: ${score}`);
  const r = await page.evaluate(() => JSON.parse(localStorage.getItem('y8_datarep_l4_logic_rush')));
  expect(r.codes.LG4).toBe(+score.replace(/,/g, ''));
});

test('a build from a table can have working columns: named, filled, saved and not marked', async ({ page }) => {
  await page.goto(URL);
  await patch(page, s => { s.passed = [0, 1, 2, 3]; s.ld[4] = { step: 2, retry: 0 }; s.tab = 4; });
  await page.locator('#area-4 [data-action="work-add"]').click();
  const head = page.locator('#area-4 .wk-head[data-work="0"]');
  await expect(head).toBeFocused();
  await head.fill('A AND B');
  for (const [k, v] of ['0', '0', '0', '1'].entries()) await setToggle(page.locator(`#qc-4 [data-k="w0_${k}"]`), v);
  await page.reload();
  await expect(page.locator('#area-4 .wk-head[data-work="0"]')).toHaveValue('A AND B');
  await expect(page.locator('#qc-4 [data-k="w0_3"]')).toHaveText('1');
  // A second column, then remove the first: the second takes its place.
  await page.locator('#area-4 [data-action="work-add"]').click();
  await page.locator('#area-4 .wk-head[data-work="1"]').fill('NOT A');
  await expect(page.locator('#area-4 [data-action="work-add"]')).toHaveCount(0);
  await page.locator('#area-4 [data-action="work-remove"][data-k="0"]').click();
  await expect(page.locator('#area-4 .wk-head')).toHaveCount(1);
  await expect(page.locator('#area-4 .wk-head[data-work="0"]')).toHaveValue('NOT A');
  // Working columns are never needed: a right circuit with an empty one still passes.
  const q = await currentQ(page, 4);
  const b = buildItem(q.layout, q.item).build;
  for (const g of slotIds(q.layout)) await place(page, 4, 'gate', b[g], g);
  for (const k of pinKeys(q.layout)) await place(page, 4, 'input', b[k], k);
  await page.locator('#check-4').click();
  await expect(page.locator('#msg-4')).toHaveClass(/good/);
});
