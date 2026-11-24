import { test, expect } from '@playwright/test';
import { SORTS, CHOICES, UNLOCK } from '../Y10/Component_1/L4.2_Genres_Change/checkers.js';

const URL = '/Y10/Component_1/L4.2_Genres_Change/1_Genres_Change.html';
const KEY = 'y10_l4_2_genres_change';

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
async function sortAll(page, panel, items, binOf = it => it.bin) {
  for (const it of items) {
    await panel.locator(`.chip[data-qw="${it.id}"]`).click();
    await panel.locator(`.bin[data-bin="${binOf(it)}"]`).click();
  }
}

test('opens on the warm-up with its definitions; Part 2 opens with its word; the lock box points to the Part 1 challenge', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#panel-4')).toBeVisible();
  await expect(page.locator('#panel-4 .terms div')).toHaveCount(2);
  await expect(page.locator('#panel-4 .tray .chip')).toHaveCount(SORTS.warm.items.length);
  for (const i of [2, 3, 6]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  await page.locator('.tab[data-idx="2"]').click();
  await page.locator('#panel-2 .lockbox [data-goto="5"]').click();
  await expect(page.locator('#panel-5 .write')).toBeVisible();
  await unlock(page, 2);
  await expect(page.locator('.tab.locked')).toHaveCount(0);
});

test('warm-up: all eight cards in the right boxes go green', async ({ page }) => {
  await page.goto(URL);
  const panel = page.locator('#panel-4');
  await sortAll(page, panel, SORTS.warm.items);
  await page.locator('#check-4').click();
  await expect(panel.locator('.chip.is-correct')).toHaveCount(SORTS.warm.items.length);
});

test('Task 1: a wrong answer goes red and costs time; right answers finish the task', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const qs = Object.entries(CHOICES.fam);
  await expect(page.locator('#panel-0 .q')).toHaveCount(qs.length);
  for (const [id, c] of qs) await page.locator(`#panel-0 input[name="${id}"][value="${id === 'ghosts' ? 'sub' : c.a}"]`).check();
  await page.locator('#check-0').click();
  await expect(page.locator('#panel-0 .q[data-qw="ghosts"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#check-0')).toBeDisabled();
  await skipCooldown(page);
  await page.locator('.tab[data-idx="0"]').click();
  await page.locator('#panel-0 input[name="ghosts"][value="hyb"]').check();
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toContainText('All correct');
  await expect(page.locator('.tab[data-idx="0"]')).toHaveClass(/done/);
});

test('Task 3: three clips with their conventions; the boxes show their counts; the right sort finishes it', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2);
  const panel = page.locator('#panel-2');
  await expect(panel.locator('.prod .clip iframe')).toHaveCount(3);
  await expect(panel.locator('.convs li')).toHaveCount(10);
  await expect(panel.locator('.bin')).toHaveCount(3);
  await expect(panel.locator('.bin').first()).toContainText('/ 3');
  await sortAll(page, panel, SORTS.rds.items);
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toContainText('All correct first time');
  await expect(page.locator('.tab[data-idx="2"]')).toHaveClass(/done/);
});

test('Task 4: three then-and-now pairs; a box without its spec word goes red; full answers save', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 3);
  await expect(page.locator('#panel-3 .pair')).toHaveCount(3);
  const fill = (id, t) => page.locator(`#panel-3 #${id}`).fill(t);
  await fill('t_pair', 'Godzilla');
  await fill('t_rep', 'Both are monster films. The new one repeats conventions such as a giant monster rising from the sea and roaring.');
  await fill('t_dif', 'The biggest difference is the CGI, which makes Godzilla look real and taller than a skyscraper, so it feels new.');
  await fill('t_sub', 'The old one makes Godzilla a monster that destroys Tokyo, but the new one makes him the hero who saves us all.');
  await page.locator('#check-3').click();
  await expect(page.locator('#panel-3 [data-qw="t_sub"]')).toHaveClass(/is-wrong/);
  await fill('t_sub', 'The old one makes Godzilla a monster that destroys Tokyo, but the new one subverts this by making him the hero.');
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toContainText('Saved');
});

test('★ Photoshop: the steps name Place Embedded and grouping layers', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 6);
  await expect(page.locator('#panel-6 .steps li')).toHaveCount(7);
  await expect(page.locator('#panel-6 .steps')).toContainText('Place Embedded');
  await expect(page.locator('#panel-6 .steps')).toContainText('Ctrl+G');
});
