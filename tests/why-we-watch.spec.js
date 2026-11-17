import { test, expect } from '@playwright/test';
import { SORTS, CHOICES, REVEALS, SPOTS, UNLOCK } from '../Y10/Component_1/L3.2_Why_We_Watch/checkers.js';

const URL = '/Y10/Component_1/L3.2_Why_We_Watch/1_Why_We_Watch.html';
const KEY = 'y10_c1_l3_2_gratifications';

async function unlock(page, idx, part = 2) {
  await page.locator(`.tab[data-idx="${idx}"]`).click();
  await page.locator(`#panel-${idx} .unlock-word`).fill(UNLOCK[part]);
  await page.locator(`#panel-${idx} .unlock-form button`).click();
  await expect(page.locator(`#panel-${idx} .lockbox`)).toHaveCount(0);
}
// Skip a cooldown so the test doesn't wait: it survives a reload, so clear it in storage.
async function skipCooldown(page, k = KEY) {
  await page.evaluate(k => {
    const s = JSON.parse(localStorage.getItem(k)); s.coolUntil = {}; localStorage.setItem(k, JSON.stringify(s));
  }, k);
  await page.reload();
}

test('opens on the warm-up with its definitions; Part 2 opens with its word; the lock box points to the Part 1 challenge', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#panel-4')).toBeVisible();
  await expect(page.locator('#panel-4 .terms div')).toHaveCount(5);
  await expect(page.locator('#panel-4 .tray .chip')).toHaveCount(SORTS.warm.items.length);
  for (const i of [2, 3, 6, 7]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  await page.locator('.tab[data-idx="2"]').click();
  await page.locator('#panel-2 .lockbox [data-goto="5"]').click();
  await expect(page.locator('#panel-5 .spot-text.lines')).toBeVisible();
  await unlock(page, 2);
  for (const i of [3, 7]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  await unlock(page, 3, 3);
  await expect(page.locator('.tab.locked')).toHaveCount(0);
});

test('warm-up: all ten cards in the right boxes go green', async ({ page }) => {
  await page.goto(URL);
  const panel = page.locator('#panel-4');
  for (const it of SORTS.warm.items) {
    await panel.locator(`.chip[data-qw="${it.id}"]`).click();
    await panel.locator(`.bin[data-bin="${it.bin}"]`).click();
  }
  await page.locator('#check-4').click();
  await expect(panel.locator('.chip.is-correct')).toHaveCount(SORTS.warm.items.length);
});

test('Task 1: the person is named; a wrong guess shows the next clue and waits; solving every round finishes', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const { rounds, opts } = REVEALS.why;
  const round = page.locator('#panel-0 .round');
  const current = async () => { const id = await round.getAttribute('data-qw'); return rounds.find(x => x.id === id); };
  let r = await current();
  await expect(round.locator('.q-text')).toHaveText(`Which need does this product meet for ${r.who}?`);
  await expect(round.locator('.clues li')).toHaveCount(1);
  const wrong = opts.find(o => o[0] !== r.a)[0];
  await round.locator(`.guess[data-guess="${wrong}"]`).click();
  await expect(round.locator('.clues li')).toHaveCount(2);
  await expect(round.locator(`.guess[data-guess="${r.a}"]`)).toBeDisabled();

  await skipCooldown(page);
  await page.locator('.tab[data-idx="0"]').click();
  for (let n = 0; n < rounds.length; n++) {
    r = await current();
    await round.locator(`.guess[data-guess="${r.a}"]`).click();
    await expect(page.locator(`#panel-0 .file[data-qw="${r.id}"]`)).toHaveCount(1);
  }
  await expect(page.locator('#panel-0 .file')).toHaveCount(rounds.length);
  await expect(page.locator('.tab[data-idx="0"]')).toHaveClass(/done/);
});

test('Task 2 diary: a box with no need named goes red; a full diary saves', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="1"]').click();
  await expect(page.locator('#panel-1 a[href*="L3.1_Where_When_Who_With"]')).toHaveAttribute('target', '_blank');
  const entries = [
    ['Wordle', 'It met my need for social interaction because I posted my score in the family group chat.'],
    ['Spotify', 'It met my need for escapism because the music took my mind off the bus ride and school.'],
  ];
  for (const [n, [prod, need]] of entries.entries()) {
    await page.locator(`#d${n + 1}_prod`).fill(prod);
    await page.locator(`#d${n + 1}_need`).fill(n === 1 ? 'I liked it a lot because the music took my mind off the bus ride.' : need);
  }
  await page.locator('#d_most').fill('The need I met most was escapism, because I use media to relax after a long day.');
  await page.locator('#check-1').click();
  await expect(page.locator('#panel-1 .write-q[data-qw="d2_need"]')).toHaveClass(/is-wrong/);
  await page.locator('#d2_need').fill(entries[1][1]);
  await page.locator('#check-1').click();
  await expect(page.locator('.tab[data-idx="1"]')).toHaveClass(/done/);
});

test('Task 3: all right answers go green first time', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2);
  const entries = Object.entries(CHOICES.same);
  for (const [id, c] of entries) await page.locator(`input[name="${id}"][value="${c.a}"]`).check();
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toHaveClass(/correct/);
  await expect(page.locator('#panel-2 .q.is-correct')).toHaveCount(entries.length);
});

test('★ spot the slip: finding Kai\'s three slips brings up the fixes', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="5"]').click();
  const slips = SPOTS.slip.parts.filter(p => p.fix);
  for (const p of slips) await page.locator(`#panel-5 .sent[data-qw="${p.id}"]`).click();
  await page.locator('#check-5').click();
  await expect(page.locator('#panel-5 .fixes .q')).toHaveCount(slips.length);
  for (const p of slips) await page.locator(`input[name="${p.id}_fix"][value="${p.fix.a}"]`).check();
  await page.locator('#check-5').click();
  await expect(page.locator('.tab[data-idx="5"]')).toHaveClass(/done/);
});

test('Task 4: the before-and-after and the starting thumbnail show; a "how" box with no cut-out goes red, then it saves', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2);
  await unlock(page, 3, 3);
  const panel = page.locator('#panel-3');
  await expect(panel.locator('.example img[src^="data:"]')).toBeVisible();
  await expect(panel.locator('.strip img[src^="data:"]')).toHaveCount(2);
  const th = {
    th1_need: 'My first thumbnail promises escapism to people who want to forget school and feel far away.',
    th1_how: 'I used a gradient map to make the colours purple and dreamy. My title says Lose yourself. The cut-out of a whale shows calm.',
    th2_need: 'My second thumbnail promises entertainment to people who want a laugh and something exciting.',
    th2_how: 'I used vibrance and contrast to make the colours bright and loud. My title says Wildest jumps ever in big letters.',
    th_click: 'I would click the second one because I use products like this for entertainment after school.',
  };
  for (const [id, v] of Object.entries(th)) await page.locator(`#${id}`).fill(v);
  await page.locator('#check-3').click();
  await expect(panel.locator('.write-q[data-qw="th2_how"]')).toHaveClass(/is-wrong/);
  await page.locator('#th2_how').fill(th.th2_how + ' The cut-out of a shocked face is funny.');
  await page.locator('#check-3').click();
  await expect(page.locator('.tab[data-idx="3"]')).toHaveClass(/done/);
});
