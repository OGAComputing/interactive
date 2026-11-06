import { test, expect } from '@playwright/test';
import { PRODUCTS, CHOICES, UNLOCK } from '../Y10/Component_1/L1.1_Media_Everywhere/checkers.js';

const URL = '/Y10/Component_1/L1.1_Media_Everywhere/1_Media_Everywhere.html';

const BIN = Object.fromEntries(PRODUCTS.map(p => [p.id, p.bin]));

// Part 2 (Tasks 2–4 and Remake it) opens with the word from the deck's Part 2 task slide.
async function unlockPart2(page) {
  await page.locator('.tab[data-idx="1"]').click();
  await page.locator('#panel-1 .unlock-word').fill(UNLOCK[2]);
  await page.locator('#panel-1 .unlock-form button').click();
  await expect(page.locator('#panel-1 .lockbox')).toHaveCount(0);
}

test('part 2 stays locked until the word from the slide; the lock box points to Tricky cases', async ({ page }) => {
  await page.goto(URL);
  for (const i of [1, 2, 3, 6]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  for (const i of [0, 4, 5]) await expect(page.locator(`.tab[data-idx="${i}"]`)).not.toHaveClass(/locked/);
  await page.locator('.tab[data-idx="1"]').click();
  await expect(page.locator('#panel-1 .lockbox')).toBeVisible();
  await expect(page.locator('#panel-1 iframe').first()).toBeHidden();
  await page.locator('#panel-1 .unlock-word').fill('lion');
  await page.locator('#panel-1 .unlock-form button').click();
  await expect(page.locator('#panel-1 .unlock-msg')).toContainText('not the word');
  await page.locator('#panel-1 .lockbox [data-goto="5"]').click();
  await expect(page.locator('#panel-5')).toBeVisible();
  await page.locator('.tab[data-idx="3"]').click();
  await page.locator('#panel-3 .unlock-word').fill('Simba');
  await page.locator('#panel-3 .unlock-word').press('Enter');
  await expect(page.locator('#day_ami')).toBeVisible();
  await page.reload();
  await expect(page.locator('.tab[data-idx="2"]')).not.toHaveClass(/locked/);   // stays open after a refresh
});

test('a part the student already finished work in stays open', async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.setItem('y10_c1_l1_1_media_everywhere',
    JSON.stringify({ completed: [false, false, true, false, false, false, false], firstAttempt: [], answers: {}, wrongs: {}, coolUntil: {} })));
  await page.reload();
  await expect(page.locator('.tab[data-idx="1"]')).not.toHaveClass(/locked/);
});

test('glossary words show their meaning on hover', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  await page.locator('#panel-0 .goal .gl', { hasText: /^sector$/ }).hover();
  await expect(page.locator('.gl-tip')).toHaveClass(/show/);
  await expect(page.locator('.gl-tip')).toContainText('audio/moving image');
  await expect(page.locator('#panel-0 .key .gl')).toHaveCount(0);   // the definition boxes already explain them
});

// The cards are dealt one at a time: sort whichever card is on top, the way a student does
// (click it, then click its box), until the pile is empty.
async function sortAll(page, panel, binOf) {
  const top = page.locator(`${panel} .tray .chip`).first();
  while (await top.count()) {
    const id = await top.getAttribute('data-qw');
    await top.click();
    await page.locator(`${panel} .bin[data-bin="${binOf(id)}"]`).click();
    await expect(page.locator(`${panel} .bin .chip[data-qw="${id}"]`)).toHaveCount(1);
  }
}

test('the board loads all 21 products with their images', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  await expect(page.locator('#panel-0 .tray .chip')).toHaveCount(21);
  await expect(page.locator('#panel-0 .chip img')).toHaveCount(21);
  await expect(page.locator('#panel-0 .bin')).toHaveCount(6);
});

test('cards are dealt one at a time beside the boxes; Skip sends the top card to the bottom', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  await expect(page.locator('#panel-0 .tray .chip:visible')).toHaveCount(1);
  await expect(page.locator('#panel-0 .deal-count')).toHaveText('Card 1 of 21');
  const first = await page.locator('#panel-0 .tray .chip').first().getAttribute('data-qw');
  await page.locator('#panel-0 .skip').click();
  await expect(page.locator('#panel-0 .tray .chip').last()).toHaveAttribute('data-qw', first);
  // Keyboard: Enter picks the dealt card, a number drops it, and the next card takes the focus.
  const top = page.locator('#panel-0 .tray .chip').first();
  const id = await top.getAttribute('data-qw');
  await top.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('1');
  await expect(page.locator(`#panel-0 .bin .chip[data-qw="${id}"]`)).toHaveCount(1);
  await expect(page.locator('#panel-0 .deal-count')).toHaveText('Card 2 of 21');
  await expect(page.locator('#panel-0 .tray .chip').first()).toBeFocused();
});

test('pictures are never cropped; the magnifier shows the whole picture; sorted tiles preview on hover', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const top = page.locator('#panel-0 .tray .chip').first();
  const id = await top.getAttribute('data-qw');
  await expect(top.locator('.thumb img')).toHaveCSS('object-fit', 'contain');
  await top.hover();
  await top.locator('.zoom').click();
  const dlg = page.locator('#zoom-dlg');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('img')).toHaveAttribute('src', /^data:image\/jpeg/);
  await expect(dlg).toContainText(PRODUCTS.find(p => p.id === id).label);
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  await expect(page.locator('.chip.picked')).toHaveCount(0);
  // Once sorted, the card is a small tile; hovering it shows it bigger with its name.
  await top.click();
  await page.locator(`#panel-0 .bin[data-bin="${BIN[id]}"]`).click();
  await page.locator(`#panel-0 .bin .chip[data-qw="${id}"] .thumb img`).hover();
  await expect(page.locator('.peek')).toHaveClass(/show/);
  await expect(page.locator('.peek')).toContainText(PRODUCTS.find(p => p.id === id).label);
});

test('a wrong board starts a cooldown and marks the wrong card red', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  await sortAll(page, '#panel-0', id => (id === 'jaws' ? 'ami-post' : BIN[id]));
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toHaveClass(/wrong/);
  await expect(page.locator('.chip[data-qw="jaws"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('.chip[data-qw="tiktok"]')).toHaveClass(/is-correct/);
  await expect(page.locator('#check-0')).toBeDisabled();
  await expect(page.locator('#check-0')).toContainText('Look again');
});

test('a right board is gold, shows the years and survives a reload', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  await sortAll(page, '#panel-0', id => BIN[id]);
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toHaveClass(/correct/);
  await expect(page.locator('#dot-0')).toHaveClass(/gold/);
  await expect(page.locator('.chip[data-qw="pacman"] .reveal')).toHaveText('1980');
  await page.reload();
  await expect(page.locator('#dot-0')).toHaveClass(/gold/);
  await expect(page.locator('.bin[data-bin="int-pre"] .chip[data-qw="pacman"]')).toHaveCount(1);
});

test('then and now: right answers complete the task; clips have Drive links', async ({ page }) => {
  await page.goto(URL);
  await unlockPart2(page);
  await page.locator('.tab[data-idx="1"]').click();
  await expect(page.locator('#panel-1 iframe')).toHaveCount(2);
  await expect(page.locator('#panel-1 a[href*="/view?t="]')).toHaveCount(2);
  for (const [id, c] of Object.entries(CHOICES.then)) await page.locator(`input[name="${id}"][value="${c.a}"]`).check();
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toHaveClass(/correct/);
  await expect(page.locator('#panel-1 .q.is-correct')).toHaveCount(Object.keys(CHOICES.then).length);
});

test('writing needs real sentences, then saves', async ({ page }) => {
  await page.goto(URL);
  await unlockPart2(page);
  await page.locator('.tab[data-idx="3"]').click();
  await page.locator('#day_ami').fill('Stranger Things');
  await page.locator('#day_print').fill('Metro');
  await page.locator('#day_int').fill('Roblox');
  await page.locator('#day_most').fill('roblox');
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toHaveClass(/wrong/);
  await expect(page.locator('[data-qw="day_most"]')).toHaveClass(/is-wrong/);
  await page.locator('#day_most').fill('I use Roblox the most because my friends play it every night');
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toHaveClass(/correct/);
  await expect(page.locator('#dot-3')).toHaveClass(/gold/);
});

test('the warm-up is optional: finishing it does not finish the page', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab.support').click();
  await expect(page.locator('#panel-4 .tray .chip')).toHaveCount(6);
  await sortAll(page, '#panel-4', id => BIN[id.replace('snap_', '')].split('-')[0]);
  await page.locator('#check-4').click();
  await expect(page.locator('#feedback-4')).toHaveClass(/correct/);
  await expect(page.locator('#dot-4')).toHaveClass(/optional/);
  await expect(page.locator('#done-banner')).not.toHaveClass(/show/);
  await expect(page.locator('.tab.challenge')).toHaveCount(2);
});

test('the page opens on the warm-up tab', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.tab.support')).toHaveClass(/active/);
  await expect(page.locator('#panel-4')).toBeVisible();
  await expect(page.locator('#panel-0')).toBeHidden();
});
