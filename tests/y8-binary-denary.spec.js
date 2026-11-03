import { test, expect } from '@playwright/test';
import {
  CIPHER_WORDS, KEYWORDS, HEADINGS, GIVEN_HEADINGS, toBinary,
  B2D_LENGTH, b2dQuestion, GUIDED_LENGTH, guidedNumber, fitSteps,
  D2B_LENGTH, d2bQuestion, FINAL_LENGTH, finalQuestion,
} from '../Y8/Data_Representation/L1_Binary_And_Denary/checkers.js';

const URL = '/Y8/Data_Representation/L1_Binary_And_Denary/1_Binary_And_Denary.html';
const KEY = 'y8_datarep_l1_binary_denary';

const saved = page => page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);

async function openTab(page, i) {
  await page.locator(`.tab[data-idx="${i}"]`).click();
  await expect(page.locator(`#panel-${i}`)).toHaveClass(/active/);
}

async function passCipher(page) {
  for (let i = 0; i < CIPHER_WORDS.length; i++) await page.locator(`#w${i}`).fill(CIPHER_WORDS[i]);
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toHaveClass(/correct/);
}

async function passKeywords(page) {
  for (const k of KEYWORDS) {
    await page.locator(`.dd-tile[data-val="${k.id}"]`).click();
    await page.locator(`.dd-slot[data-slot="kw-${k.id}"]`).click();
  }
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toHaveClass(/correct/);
}

async function passHeadings(page) {
  for (let i = 0; i < 8; i++) if (!GIVEN_HEADINGS.includes(i)) await page.locator(`#h${i}`).fill(String(HEADINGS[i]));
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toHaveClass(/correct/);
}

async function passB2D(page) {
  const { seed, b2d } = await saved(page);
  for (let pos = 0; pos < B2D_LENGTH; pos++) {
    const q = b2dQuestion(seed, b2d.attempt, pos, 0);
    await expect(page.locator('#b2d-box .cp-head')).toContainText(`Number ${pos + 1} of`);
    await page.locator('#b2d-in').fill(String(q.value));
    await page.locator('#b2d-in').press('Enter');
    await expect(page.locator('#b2d-box .cp-msg')).toHaveClass(/good/);
  }
  await expect(page.locator('#feedback-3')).toHaveClass(/correct/);
}

async function passGuided(page) {
  const { seed, guided } = await saved(page);
  for (let pos = 0; pos < GUIDED_LENGTH; pos++) {
    const n = guidedNumber(seed, guided.attempt, pos);
    await expect(page.locator('#guided-box .cp-q').first()).toHaveText(`Convert ${n} to binary`);
    for (const st of fitSteps(n)) {
      await page.locator(`#guided-box [data-action="fit"][data-val="${st.fits ? 1 : 0}"]`).click();
    }
    await expect(page.locator('#guided-box .cp-msg')).toHaveClass(/good/);
  }
  await expect(page.locator('#feedback-4')).toHaveClass(/correct/);
}

async function passD2B(page) {
  const { seed, d2b } = await saved(page);
  for (let pos = 0; pos < D2B_LENGTH; pos++) {
    const { value } = d2bQuestion(seed, d2b.attempt, pos, 0);
    await expect(page.locator('#d2b-box .cp-q')).toContainText(`Make ${value} in binary`);
    const bits = toBinary(value);
    for (let i = 0; i < 8; i++) if (bits[i] === '1') await page.locator(`#d2b-grid [data-i="${i}"]`).click();
    await page.locator('#d2b-box [data-action="d2b"]').click();
    await expect(page.locator('#d2b-box .cp-msg')).toHaveClass(/good/);
  }
  await expect(page.locator('#feedback-5')).toHaveClass(/correct/);
}

async function passFinal(page) {
  const { seed, final } = await saved(page);
  for (let pos = 0; pos < FINAL_LENGTH; pos++) {
    const q = finalQuestion(seed, final.attempt, pos);
    await expect(page.locator('#final-box .cp-head')).toContainText(`Question ${pos + 1} of`);
    await page.locator('#final-in').fill(q.type === 'b2d' ? String(q.value) : q.value.toString(2));
    await page.locator('#final-in').press('Enter');
    await expect(page.locator('#final-box .cp-msg')).toHaveClass(/good/);
  }
  await expect(page.locator('#feedback-6')).toHaveClass(/correct/);
}

test('loads with seven tabs, no external requests and no page errors', async ({ page }) => {
  const errors = [];
  const external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1')) external.push(r.url()); });
  await page.goto(URL);
  await expect(page).toHaveTitle(/Binary and Denary/);
  await expect(page.locator('.tab')).toHaveCount(7);
  await expect(page.locator('#cipher-words .q-card')).toHaveCount(CIPHER_WORDS.length);
  await expect(page.locator('#b2d-example .col.glow')).toHaveCount(3);   // 1101: 8, 4 and 1
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('a wrong starter check marks each word and starts a cooldown', async ({ page }) => {
  await page.goto(URL);
  for (let i = 0; i < CIPHER_WORDS.length; i++) await page.locator(`#w${i}`).fill(i === 2 ? '10' : CIPHER_WORDS[i]);
  await page.locator('#check-0').click();
  await expect(page.locator('#card-w2')).toHaveClass(/is-wrong/);
  await expect(page.locator('#card-w0')).toHaveClass(/is-right/);
  await expect(page.locator('#check-0')).toBeDisabled();
  await expect(page.locator('#check-0')).toContainText('Think again');
});

test('empty boxes are not marked and cost nothing', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 2);
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toContainText('still empty');
  await expect(page.locator('#check-2')).toBeEnabled();
});

test('a wrong binary answer shows the working, then a new number at the same step', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 3);
  const { seed } = await saved(page);
  const q = b2dQuestion(seed, 0, 0, 0);
  await page.locator('#b2d-in').fill(String(q.value + 1));
  await page.locator('#b2d-box [data-action="b2d"]').click();
  await expect(page.locator('#b2d-box .cp-msg')).toHaveClass(/bad/);
  await expect(page.locator('#b2d-box .cp-msg .why')).toContainText(`= ${q.value}`);
  await expect(page.locator('#b2d-box .cp-reveal .col.glow')).not.toHaveCount(0);
  const retry = page.locator('#b2d-box .cp-msg button');
  await expect(retry).toBeEnabled({ timeout: 7000 });
  await retry.click();
  await expect(page.locator('#b2d-box .cp-head')).toContainText('Number 1 of');
  const s = await saved(page);
  expect(s.b2d).toMatchObject({ pos: 0, retry: 1 });
  expect(s.firstAttempt[3]).toBe(false);
});

test('a wrong "does it fit?" step explains it and asks the same step again', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 4);
  const { seed } = await saved(page);
  const n = guidedNumber(seed, 0, 0);
  const first = fitSteps(n)[0];   // 128 never fits these numbers
  expect(first.fits).toBe(false);
  await page.locator('#guided-box [data-action="fit"][data-val="1"]').click();
  await expect(page.locator('#guided-box .cp-msg .why')).toContainText('does not fit');
  const retry = page.locator('#guided-box .cp-msg button');
  await expect(retry).toBeEnabled({ timeout: 6000 });
  await retry.click();
  await expect(page.locator('#guided-box .cp-q').nth(1)).toHaveText(`Does 128 fit into ${n}?`);
});

test('the worked example plays through 22', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 4);
  await page.locator('#demo-btn').click();
  await expect(page.locator('#demo-box .cp-q')).toHaveText('22 in binary is 00010110', { timeout: 20000 });
});

test('a wrong plenary answer sends the student back to question 1', async ({ page }) => {
  await page.goto(URL);
  await openTab(page, 6);
  const { seed } = await saved(page);
  const q0 = finalQuestion(seed, 0, 0);
  await page.locator('#final-in').fill(String(q0.value));
  await page.locator('#final-in').press('Enter');
  await expect(page.locator('#final-box .cp-head')).toContainText('Question 2', { timeout: 5000 });
  await page.locator('#final-in').fill('2');   // binary only uses 0 and 1: pointed out, no restart
  await page.locator('#final-in').press('Enter');
  await expect(page.locator('#final-box .cp-msg')).toContainText('0 and 1');
  const q1 = finalQuestion(seed, 0, 1);
  await page.locator('#final-in').fill(toBinary(q1.value + 1));
  await page.locator('#final-in').press('Enter');
  expect((await saved(page)).final).toMatchObject({ attempt: 1, pos: 0 });
});

test('completing every task first time gives gold and survives a reload', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(URL);
  await passCipher(page);
  await openTab(page, 1); await passKeywords(page);
  await openTab(page, 2); await passHeadings(page);
  await openTab(page, 3); await passB2D(page);
  await openTab(page, 4); await passGuided(page);
  await openTab(page, 5); await passD2B(page);
  await openTab(page, 6); await passFinal(page);

  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#done-banner')).toHaveClass(/gold/);
  for (let i = 0; i < 7; i++) await expect(page.locator(`#dot-${i}`)).toHaveClass(/gold/);
  await expect(page.locator('#ev-3')).toHaveValue(/✓/);

  await page.reload();
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#w0')).toHaveValue('there');
  await expect(page.locator('#ev-kw-bit')).toHaveValue('Bit');
  await openTab(page, 3);
  await expect(page.locator('#b2d-box .cp-done')).toBeVisible();
});
