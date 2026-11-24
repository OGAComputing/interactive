import { test, expect } from '@playwright/test';
import { SORTS, CHOICES, REVEALS, HOTSPOTS, UNLOCK } from '../Y10/Component_1/L4.1_Spot_the_Genre/checkers.js';

const URL = '/Y10/Component_1/L4.1_Spot_the_Genre/1_Spot_the_Genre.html';
const KEY = 'y10_l4_1_spot_the_genre';

async function unlock(page, idx) {
  await page.locator(`.tab[data-idx="${idx}"]`).click();
  await page.locator(`#panel-${idx} .unlock-word`).fill(UNLOCK[2]);
  await page.locator(`#panel-${idx} .unlock-form button`).click();
  await expect(page.locator(`#panel-${idx} .lockbox`)).toHaveCount(0);
}
// Skip a cooldown so the test doesn't wait: it survives a reload, so clear it in storage.
async function skipCooldown(page) {
  await page.evaluate(k => {
    const s = JSON.parse(localStorage.getItem(k)); s.coolUntil = {}; localStorage.setItem(k, JSON.stringify(s));
  }, KEY);
  await page.reload();
}
// Click a picture at (x, y) percent of its image.
async function clickAt(stage, x, y) {
  const box = await stage.locator('img').boundingBox();
  await stage.click({ position: { x: box.width * x / 100, y: box.height * y / 100 } });
}
const centre = z => [z.box[0] + z.box[2] / 2, z.box[1] + z.box[3] / 2];

test('opens on the warm-up with its definitions; Part 2 opens with its word; the lock box points to the Part 1 challenge', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#panel-4')).toBeVisible();
  await expect(page.locator('#panel-4 .terms div')).toHaveCount(6);
  await expect(page.locator('#panel-4 .tray .chip')).toHaveCount(SORTS.warm.items.length);
  for (const i of [2, 3, 6]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  await page.locator('.tab[data-idx="2"]').click();
  await page.locator('#panel-2 .lockbox [data-goto="5"]').click();
  await expect(page.locator('#panel-5 .spot-text')).toBeVisible();
  await unlock(page, 2);
  await expect(page.locator('.tab.locked')).toHaveCount(0);
});

test('warm-up: all eight cards in the right boxes go green', async ({ page }) => {
  await page.goto(URL);
  const panel = page.locator('#panel-4');
  for (const it of SORTS.warm.items) {
    await panel.locator(`.chip[data-qw="${it.id}"]`).click();
    await panel.locator(`.bin[data-bin="${it.bin}"]`).click();
  }
  await page.locator('#check-4').click();
  await expect(panel.locator('.chip.is-correct')).toHaveCount(SORTS.warm.items.length);
});

test('Task 1: three clips and no posters; right answers finish the task', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  await expect(page.locator('#panel-0 .clip iframe')).toHaveCount(3);
  await expect(page.locator('#panel-0 .q.has-pic')).toHaveCount(0);
  for (const [id, c] of Object.entries(CHOICES.trail)) await page.locator(`#panel-0 input[name="${id}"][value="${c.a}"]`).check();
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toContainText('All correct first time');
  await expect(page.locator('.tab[data-idx="0"]')).toHaveClass(/done/);
});

test('Task 2 hotspot: Check waits for every pin; a wrong pin goes red and costs time; moved pins pass and show the right zones', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="1"]').click();
  const hs = HOTSPOTS.icon, [fnaf, mando] = hs.pics;
  const stage = id => page.locator(`#panel-1 .hs-pic[data-pic="${id}"] .hs-stage`);
  await expect(page.locator('#panel-1 .hs-stage img')).toHaveCount(2);

  // Each click places the chosen pin and picks the next one. Pin 1 (the scary character) on the ball pit: wrong.
  await clickAt(stage(fnaf.id), ...centre(fnaf.zones.pit));
  await clickAt(stage(fnaf.id), ...centre(fnaf.zones.pit));
  await clickAt(stage(fnaf.id), ...centre(fnaf.zones.cupcake));
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toContainText('every pin');
  for (const z of ['helmet', 'blaster', 'grogu', 'jet']) await clickAt(stage(mando.id), ...centre(mando.zones[z]));
  await expect(page.locator('#panel-1 .pin[data-pin]')).toHaveCount(7);
  await page.locator('#check-1').click();
  await expect(page.locator('#panel-1 .pin[data-pin="h_char"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#panel-1 .pin[data-pin="h_set"]')).toHaveClass(/is-correct/);
  await expect(page.locator('#panel-1 .pin.is-correct')).toHaveCount(6);
  await expect(page.locator('#check-1')).toBeDisabled();

  await skipCooldown(page);
  await page.locator('.tab[data-idx="1"]').click();
  await page.locator('#panel-1 .hs-find[data-find="h_char"]').click();
  await clickAt(stage(fnaf.id), ...centre(fnaf.zones.bonnie));
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toContainText('All correct');
  await expect(page.locator('.tab[data-idx="1"]')).toHaveClass(/done/);
  await expect(page.locator('#panel-1 .hs-zone')).toHaveCount(7);   // only the zones the seven pins landed in are outlined
  await expect(page.locator('#panel-1 .hs-find[data-find="h_char"] .hs-state')).toContainText('Bonnie');
});

test('Task 3: clues hide the product; clues come on a timer; a wrong guess gives none; solving every round finishes', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2);
  const { rounds, opts } = REVEALS.conv;
  const round = page.locator('#panel-2 .round');
  const current = async () => { const id = await round.getAttribute('data-qw'); return rounds.find(x => x.id === id); };
  let r = await current();
  await expect(round.locator('.clues li')).toHaveCount(1);
  await expect(round).not.toContainText(r.label);
  await round.locator(`.guess[data-guess="${opts.find(o => o[0] !== r.a)[0]}"]`).click();
  await expect(round.locator('.clues li')).toHaveCount(1);   // a wrong guess costs time but gives no clue
  await expect(round.locator('.clue-next')).toContainText('Clue 2 in');
  await expect(round.locator('.clues li')).toHaveCount(2, { timeout: (REVEALS.conv.auto + 2) * 1000 });   // the clue comes by itself

  await skipCooldown(page);
  await page.locator('.tab[data-idx="2"]').click();
  for (let n = 0; n < rounds.length; n++) {
    r = await current();
    await round.locator(`.guess[data-guess="${r.a}"]`).click();
    await expect(page.locator(`#panel-2 .file[data-qw="${r.id}"]`)).toHaveCount(1);
  }
  await expect(page.locator('#panel-2 .file img')).toHaveCount(rounds.length);
  await expect(page.locator('.tab[data-idx="2"]')).toHaveClass(/done/);
});

test('Task 4: a box without its spec word goes red; full answers save', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 3);
  await expect(page.locator('#panel-3 .strip img[src^="data:image"]')).toHaveCount(3);
  const fill = (id, t) => page.locator(`#panel-3 #${id}`).fill(t);
  await fill('m_prod', 'Superman');
  await fill('m_genre', 'Its genre is superhero. I can tell straight away because a man in a red cape stands in a crowd.');
  await fill('m_icon', 'It has a red cape, the S logo and soldiers in a big city, which shows he is a hero.');
  await fill('m_conv', 'One convention of superhero films is a hero who saves people, and the trailer shows him rescuing a man.');
  await page.locator('#check-3').click();
  await expect(page.locator('#panel-3 [data-qw="m_icon"]')).toHaveClass(/is-wrong/);
  await fill('m_icon', 'The iconography includes the red cape, the S logo and soldiers in a big city, which shows he is a hero.');
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toContainText('Saved');
});

test('★ Breaking a convention: two examples with posters are on show before the writing', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 6);
  await expect(page.locator('#panel-6 .example-card')).toHaveCount(2);
  await expect(page.locator('#panel-6 .example-card img[src^="data:image"]')).toHaveCount(2);
  await expect(page.locator('#panel-6 details')).toHaveCount(0);
});

test('Task 3: once every clue is showing, the timer stops and the round is not redrawn (the last clue used to flash)', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2);
  await page.evaluate(([k, rounds]) => {
    const s = JSON.parse(localStorage.getItem(k));
    for (const r of rounds) s.answers[r.id + '_clues'] = r.n;
    localStorage.setItem(k, JSON.stringify(s));
  }, [KEY, REVEALS.conv.rounds.map(r => ({ id: r.id, n: r.clues.length }))]);
  await page.reload();
  await page.locator('.tab[data-idx="2"]').click();
  const round = page.locator('#panel-2 .round');
  await expect(round.locator('.clues li')).toHaveCount(3);
  await expect(round.locator('.clue-timer')).toHaveCount(0);
  const last = await round.locator('.clues li').last().elementHandle();
  await page.waitForTimeout(1500);
  expect(await last.evaluate(el => el.isConnected)).toBe(true);
});
