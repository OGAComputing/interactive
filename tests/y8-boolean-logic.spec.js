import { test, expect } from '@playwright/test';
import { gateOutput, SCENARIOS, TT_CELLS, QUIZ_POOL, PREDICT_LENGTH, QUIZ_LENGTH } from '../Y8/Theory/boolean-checkers.js';

const URL = '/Y8/Theory/BooleanLogic.html';
const KEY = 'y8_theory_boolean_logic';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function openTab(page, i) {
  await page.locator(`.tab[data-idx="${i}"]`).click();
  await expect(page.locator(`#panel-${i}`)).toHaveClass(/active/);
}

// Read the hidden-bulb circuit's label and answer from the gate rule.
async function passPredict(page) {
  for (let n = 0; n < PREDICT_LENGTH; n++) {
    const label = await page.locator('#predict-box .circuit').getAttribute('aria-label');
    const [, gate, a, b] = label.match(/^(AND|OR|NOT) gate\. Input A is (\d)(?:, input B is (\d))?/);
    const out = gateOutput(gate, +a, +(b ?? 0));
    await page.locator(`#predict-box .cp-opt[data-val="${out}"]`).click();
    if (n < PREDICT_LENGTH - 1) await expect(page.locator('#predict-box .cp-head')).toContainText(`Circuit ${n + 2}`);
  }
  await expect(page.locator('#feedback-0')).toHaveClass(/correct/);
}

async function passQuiz(page) {
  for (let n = 0; n < QUIZ_LENGTH; n++) {
    const text = await page.locator('#quiz-box .cp-q').textContent();
    const q = QUIZ_POOL.find(x => x.q === text);
    await page.locator(`#quiz-box .cp-opt[data-k="${q.a}"]`).click();
    if (n < QUIZ_LENGTH - 1) await expect(page.locator('#quiz-box .cp-q')).not.toHaveText(text);
  }
  await expect(page.locator('#feedback-4')).toHaveClass(/correct/);
}

async function tapPlace(page, group, kind, val, slot) {
  await page.locator(`.dd-tile[data-group="${group}"][data-kind="${kind}"][data-val="${val}"]`).click();
  await page.locator(`.dd-slot[data-slot="${slot}"]`).click();
}

async function passMatch(page) {
  for (const g of ['AND', 'OR', 'NOT']) {
    await tapPlace(page, 'match', 'name', g, `name-${g}`);
    await tapPlace(page, 'match', 'rule', g, `rule-${g}`);
  }
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toHaveClass(/correct/);
}

async function passTables(page) {
  for (const c of TT_CELLS) {
    const btn = page.locator(`.tt-toggle[data-cell="${c.id}"]`);
    const want = String(gateOutput(c.gate, c.a, c.b));
    await btn.click();                       // ? → 0
    if (want === '1') await btn.click();     // 0 → 1
    await expect(btn).toHaveText(want);
  }
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toHaveClass(/correct/);
}

async function passScenarios(page) {
  for (const s of SCENARIOS) await tapPlace(page, 'scen', 'gate', s.answer, `sc-${s.id}`);
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toHaveClass(/correct/);
}

test('loads with five tabs, no external resources and no page errors', async ({ page }) => {
  const errors = [];
  const external = [];
  page.on('pageerror', e => errors.push(e.message));
  // Google Fonts are the only outside request allowed (as in the Y9 template).
  page.on('request', r => {
    const u = r.url();
    if (!u.startsWith('http://127.0.0.1') && !/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u)) external.push(u);
  });
  await page.goto(URL);
  await expect(page).toHaveTitle(/Logic Gate Lab/);
  await expect(page.locator('.tab')).toHaveCount(5);
  await expect(page.locator('#predict-box .cp-opt')).toHaveCount(2);
  await expect(page.locator('#classroom-banner')).not.toBeAttached();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('sandbox lights the bulb only when the gate rule says so', async ({ page }) => {
  await page.goto(URL);
  const bulb = page.locator('#sandbox-circuit .circuit');
  await expect(bulb).toHaveAttribute('aria-label', /AND gate.*Output is 0/);
  await page.locator('#switch-a').click();
  await page.locator('#switch-b').click();
  await expect(bulb).toHaveAttribute('aria-label', /Output is 1, bulb on/);
  await page.locator('[data-action="gate"][data-gate="NOT"]').click();
  await expect(page.locator('#switch-b')).toBeDisabled();
  await expect(bulb).toHaveAttribute('aria-label', /NOT gate.*Output is 0/);
});

async function readCircuit(page) {
  const label = await page.locator('#predict-box .circuit').getAttribute('aria-label');
  const [, gate, a, b] = label.match(/^(AND|OR|NOT) gate\. Input A is (\d)(?:, input B is (\d))?/);
  return { label, gate, out: gateOutput(gate, +a, +(b ?? 0)) };
}

test('a wrong prediction keeps the question number and asks the same gate with new inputs', async ({ page }) => {
  await page.goto(URL);
  const first = await readCircuit(page);
  await page.locator(`#predict-box .cp-opt[data-val="${1 - first.out}"]`).click();
  await expect(page.locator('#predict-box .cp-msg')).toHaveClass(/bad/);
  const retry = page.locator('#predict-box .cp-msg button');
  await expect(retry).toBeEnabled({ timeout: 6000 });
  await expect(retry).toContainText(`Try another ${first.gate}`);
  await retry.click();

  const next = await readCircuit(page);
  expect(next.gate).toBe(first.gate);
  expect(next.label).not.toBe(first.label);
  await expect(page.locator('#predict-box .cp-head')).toContainText('Circuit 1 of 6');
  const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
  expect(saved.cp.predict).toMatchObject({ attempt: 0, pos: 0, retry: 1 });
  expect(saved.firstAttempt[0]).toBe(false);
  expect(saved.streak).toBe(0);
});

test('a wrong final-challenge answer sends the student back to question 1', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 4);
  const text = await page.locator('#quiz-box .cp-q').textContent();
  const q = QUIZ_POOL.find(x => x.q === text);
  await page.locator(`#quiz-box .cp-opt[data-k="${q.a}"]`).click();
  await expect(page.locator('#quiz-box .cp-head')).toContainText('Question 2', { timeout: 5000 });
  const text2 = await page.locator('#quiz-box .cp-q').textContent();
  const q2 = QUIZ_POOL.find(x => x.q === text2);
  const wrongKey = q2.opts.find(o => o[0] !== q2.a)[0];
  await page.locator(`#quiz-box .cp-opt[data-k="${wrongKey}"]`).click();
  const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
  expect(saved.cp.quiz).toMatchObject({ attempt: 1, pos: 0 });
});

test('XP is only paid once per chain position, so failing on purpose cannot farm it', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 4);
  for (let round = 0; round < 2; round++) {
    const text = await page.locator('#quiz-box .cp-q').textContent();
    const q = QUIZ_POOL.find(x => x.q === text);
    await page.locator(`#quiz-box .cp-opt[data-k="${q.a}"]`).click();
    await expect(page.locator('#quiz-box .cp-head')).toContainText('Question 2', { timeout: 5000 });
    const t2 = await page.locator('#quiz-box .cp-q').textContent();
    const q2 = QUIZ_POOL.find(x => x.q === t2);
    await page.locator(`#quiz-box .cp-opt[data-k="${q2.opts.find(o => o[0] !== q2.a)[0]}"]`).click();
    const btn = page.locator('#quiz-box .cp-msg button');
    await expect(btn).toBeEnabled({ timeout: 7000 });
    await btn.click();
  }
  await expect(page.locator('#xp-text')).toHaveText('5');
});

test('a wrong check highlights each answer and starts a cooldown', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 1);
  await tapPlace(page, 'match', 'name', 'AND', 'name-OR');
  await tapPlace(page, 'match', 'name', 'OR', 'name-AND');
  await tapPlace(page, 'match', 'name', 'NOT', 'name-NOT');
  for (const g of ['AND', 'OR', 'NOT']) await tapPlace(page, 'match', 'rule', g, `rule-${g}`);
  await page.locator('#check-1').click();
  await expect(page.locator('.dd-slot[data-slot="name-OR"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('.dd-slot[data-slot="name-NOT"]')).toHaveClass(/is-right/);
  await expect(page.locator('#check-1')).toBeDisabled();
  await expect(page.locator('#check-1')).toContainText('Think again');
});

test('empty boxes are not marked and do not cost a cooldown', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 2);
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toContainText('still empty');
  await expect(page.locator('#check-2')).toBeEnabled();
});

test('completing every task gives gold, XP, badges and a certificate, and survives a reload', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#cert-btn')).toContainText('🔒');
  await passPredict(page);
  await openTab(page, 1); await passMatch(page);
  await openTab(page, 2); await passTables(page);
  await openTab(page, 3); await passScenarios(page);
  await expect(page.locator('.sc-why').first()).toBeVisible();
  await openTab(page, 4); await passQuiz(page);

  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#done-banner')).toHaveClass(/gold/);
  for (let i = 0; i < 5; i++) await expect(page.locator(`#dot-${i}`)).toHaveClass(/gold/);

  // 5 tasks × 50 + 11 chain answers × 5 + 7 badges × 25 (all but Circuit Starter)
  await expect(page.locator('#xp-text')).toHaveText('480');
  await expect(page.locator('#rank-pill')).toContainText('Master Engineer');
  await expect(page.locator('#badge-count')).toHaveText('7/8');

  await page.locator('#cert-btn').click();
  await expect(page.locator('#cert-modal')).toBeVisible();
  await page.locator('#cert-name').fill('Alex Test');
  await expect(page.locator('#cert-student-name')).toHaveText('Alex Test');
  await expect(page.locator('#cert-seal')).toHaveText('GOLD');
  await page.keyboard.press('Escape');
  await expect(page.locator('#cert-modal')).toBeHidden();

  await page.reload();
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#check-3')).toBeDisabled();
  await expect(page.locator('#ev-name-AND')).toHaveValue('AND');
  await expect(page.locator('#xp-text')).toHaveText('480');
  await openTab(page, 0);
  await expect(page.locator('#predict-box .cp-done')).toBeVisible();
  await page.locator('#cert-btn').click();
  await expect(page.locator('#cert-student-name')).toHaveText('Alex Test');
});

test('lighting the bulb with every gate earns Circuit Starter', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#switch-a').click();
  await page.locator('#switch-b').click();                                  // AND lit
  await page.locator('[data-action="gate"][data-gate="OR"]').click();       // OR lit
  await page.locator('[data-action="gate"][data-gate="NOT"]').click();
  await page.locator('#switch-a').click();                                  // NOT lit (A = 0)
  await expect(page.locator('#badge-count')).toHaveText('1/8');
  await expect(page.locator('#xp-text')).toHaveText('25');
  await page.locator('#badges-btn').click();
  await expect(page.locator('#badge-grid .badge.on')).toContainText('Circuit Starter');
});

test('the certificate stays locked until every task is done', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#cert-btn').click();
  await expect(page.locator('#cert-modal')).toBeHidden();
});

test('drag and drop places a card', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.goto(URL);
  await openTab(page, 3);
  const tile = page.locator('.dd-tile[data-group="scen"][data-val="NOT"]');
  const slot = page.locator('.dd-slot[data-slot="sc-fridge"]');
  const t = await tile.boundingBox();
  const s = await slot.boundingBox();
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
  await page.mouse.down();
  await page.mouse.move(t.x + 30, t.y + 30, { steps: 4 });
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(slot).toHaveText('NOT');
  await expect(tile).toBeVisible();   // gate cards are reusable
});
