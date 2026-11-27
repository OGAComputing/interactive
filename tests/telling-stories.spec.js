import { test, expect } from '@playwright/test';
import { SORTS, CHOICES, ORDERS, UNLOCK, orderAnswer } from '../Y10/Component_1/L4.3_Telling_Stories/checkers.js';

const URL = '/Y10/Component_1/L4.3_Telling_Stories/1_Telling_Stories.html';
const KEY = 'y10_l4_3_telling_stories';

async function unlock(page, idx) {
  await page.locator(`.tab[data-idx="${idx}"]`).click();
  await page.locator(`#panel-${idx} .unlock-word`).fill(UNLOCK[2]);
  await page.locator(`#panel-${idx} .unlock-form button`).click();
  await expect(page.locator(`#panel-${idx} .lockbox`)).toHaveCount(0);
}
async function skipCooldown(page) {
  await page.evaluate(k => {
    const s = JSON.parse(localStorage.getItem(k)); s.coolUntil = {}; localStorage.setItem(k, JSON.stringify(s));
  }, KEY);
  await page.reload();
}
// Put a list's cards in this order with the ▲ buttons, top card first.
async function arrange(panel, ids) {
  for (let k = 0; k < ids.length; k++) {
    const cards = panel.locator('.ocard');
    const at = (await cards.evaluateAll(els => els.map(e => e.dataset.qw))).indexOf(ids[k]);
    for (let n = at; n > k; n--) await panel.locator(`.ocard[data-qw="${ids[k]}"] [data-move="-1"]`).click();
  }
  await expect(panel.locator('.ocard')).toHaveCount(ids.length);
  expect(await panel.locator('.ocard').evaluateAll(els => els.map(e => e.dataset.qw))).toEqual(ids);
}

test('opens on the warm-up with its definitions; Part 2 opens with its word; the lock box points to the Part 1 challenge', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#panel-4')).toBeVisible();
  await expect(page.locator('#panel-4 .terms div')).toHaveCount(3);
  await expect(page.locator('#panel-4 .tray .chip')).toHaveCount(SORTS.warm.items.length);
  for (const i of [2, 3, 6]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  await page.locator('.tab[data-idx="2"]').click();
  await page.locator('#panel-2 .lockbox [data-goto="5"]').click();
  await expect(page.locator('#panel-5 .write')).toBeVisible();
  await unlock(page, 2);
  await expect(page.locator('.tab.locked')).toHaveCount(0);
});

test('Task 1: Check waits for a move; the plot order goes red with arrows and costs time; story order finishes it and shows the notes', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const panel = page.locator('#panel-0'), list = ORDERS.story.lists[0], right = orderAnswer(list);
  await expect(panel.locator('.ocard')).toHaveCount(7);
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toContainText('in order first');
  await expect(page.locator('#check-0')).toBeEnabled();
  // The order the film shows them puts every card one place out: all red, each saying which way it goes.
  await arrange(panel, ['s_party', ...right.slice(0, -1)]);
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toContainText('0 of 7 in the right place');
  await expect(panel.locator('.ocard.is-wrong')).toHaveCount(7);
  await expect(panel.locator('.ocard[data-qw="s_party"] .ohint')).toHaveText('⬇ goes later');
  await expect(panel.locator('.ocard[data-qw="s_birth"] .ohint')).toHaveText('⬆ goes earlier');
  await expect(page.locator('#check-0')).toBeDisabled();
  await skipCooldown(page);
  await page.locator('.tab[data-idx="0"]').click();
  await page.locator('#panel-0 .ocard[data-qw="s_party"]').focus();
  for (let n = 0; n < 6; n++) await page.keyboard.press('ArrowDown');   // arrow keys move a focused card
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toContainText('All correct');
  await expect(panel.locator('.ocard.is-correct')).toHaveCount(7);
  await expect(panel.locator('.ocard[data-qw="s_party"] .onote')).toContainText('opens with this scene');
  // The plot beside the story: the same cards, the party picked out in both.
  await expect(panel.locator('.ocompare .ocol')).toHaveCount(2);
  await expect(panel.locator('.ocompare .ocol').first()).toContainText('Plot: what the film shows');
  await expect(panel.locator('.ocard.omoved')).toHaveCount(2);
  await expect(panel.locator('.ocompare .ocol').first().locator('.omoved .otag')).toHaveText('In the story it comes 7th');
  await expect(panel.locator('.osum')).toContainText('non-linear');
  await expect(panel.locator('.omove button:not(:disabled)')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#panel-0 .ocard.is-correct')).toHaveCount(7);
});

test('Task 1: a card can be dragged into place', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1600 });   // no scrolling mid-drag
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const panel = page.locator('#panel-0');
  const first = await panel.locator('.ocard').first().getAttribute('data-qw');
  const second = panel.locator('.ocard').nth(1), box = await second.boundingBox();
  // Dropped on the lower half of the next card, it goes below it.
  await panel.locator('.ocard').first().dragTo(second, { targetPosition: { x: 20, y: box.height - 5 } });
  await expect(panel.locator('.ocard').nth(1)).toHaveAttribute('data-qw', first);
  await expect(panel.locator('.ocard')).toHaveCount(7);
});

test('Task 2: a wrong answer goes red and costs time; right answers finish the task', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="1"]').click();
  const qs = Object.entries(CHOICES.struct);
  await expect(page.locator('#panel-1 .q')).toHaveCount(qs.length);
  for (const [id, c] of qs) await page.locator(`#panel-1 input[name="${id}"][value="${id === 'lion' ? 'lin' : c.a}"]`).check();
  await page.locator('#check-1').click();
  await expect(page.locator('#panel-1 .q[data-qw="lion"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#check-1')).toBeDisabled();
  await skipCooldown(page);
  await page.locator('.tab[data-idx="1"]').click();
  await page.locator('#panel-1 input[name="lion"][value="circ"]').check();
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toContainText('All correct');
});

test('Task 3: background above the details is wrong; a fair swap of details is right first time', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2);
  const panel = page.locator('#panel-2');
  await expect(panel.locator('.ocard')).toHaveCount(6);
  await arrange(panel, ['n_lead', 'n_walk', 'n_step', 'n_home', 'n_jfk', 'n_collins']);
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toContainText('All correct first time');
  await expect(page.locator('.tab[data-idx="2"]')).toHaveClass(/done/);
});

test('Task 4: a box without its spec word goes red; full answers save', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 3);
  const fill = (id, t) => page.locator(`#panel-3 #${id}`).fill(t);
  await fill('u_story', 'In Wicked, the story starts with Elphaba being born, but the plot starts with the party at the end.');
  await fill('u_struct', 'The Lion King is circular because it begins and ends with a cub held up at Pride Rock.');
  await fill('u_pyr', 'Armstrong and Aldrin go at the top because they are the biggest news and readers want it first.');
  await page.locator('#check-3').click();
  await expect(page.locator('#panel-3 [data-qw="u_pyr"]')).toHaveClass(/is-wrong/);
  await fill('u_pyr', 'Armstrong and Aldrin go at the top because an inverted pyramid puts the biggest news first for readers.');
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toContainText('Saved');
});
