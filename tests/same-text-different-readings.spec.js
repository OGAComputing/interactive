import { test, expect } from '@playwright/test';
import { SORTS, CHOICES, UNLOCK } from '../Y10/Component_1/L3.3_Same_Text_Different_Readings/checkers_readings.js';

const URL = '/Y10/Component_1/L3.3_Same_Text_Different_Readings/2_Same_Text_Different_Readings.html';

async function unlock(page, idx) {
  await page.locator(`.tab[data-idx="${idx}"]`).click();
  await page.locator(`#panel-${idx} .unlock-word`).fill(UNLOCK[2]);
  await page.locator(`#panel-${idx} .unlock-form button`).click();
  await expect(page.locator(`#panel-${idx} .lockbox`)).toHaveCount(0);
}
async function sortAll(page, idx, key) {
  const panel = page.locator(`#panel-${idx}`);
  for (const it of SORTS[key].items) {
    await panel.locator(`.chip[data-qw="${it.id}"]`).click();
    await panel.locator(`.bin[data-bin="${it.bin}"]`).click();
  }
}

test('opens on the warm-up with its definitions open; Part 2 is locked until its word, and the lock box points to the ★', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#panel-3')).toBeVisible();
  await expect(page.locator('#panel-3 .terms div')).toHaveCount(2);
  await sortAll(page, 3, 'warm');
  await page.locator('#check-3').click();
  await expect(page.locator('#panel-3 .chip.is-correct')).toHaveCount(SORTS.warm.items.length);

  for (const i of [1, 2, 5]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  await page.locator('.tab[data-idx="1"]').click();
  await page.locator('#panel-1 .lockbox [data-goto="4"]').click();
  await expect(page.locator('#panel-4 .write')).toBeVisible();
  await unlock(page, 1);
  await expect(page.locator('.tab.locked')).toHaveCount(0);
});

test('Task 1: all seven right goes green and finishes the task', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const panel = page.locator('#panel-0');
  await expect(panel.locator('.evidence-file li')).toHaveCount(5);
  for (const [id, c] of Object.entries(CHOICES.panic)) await panel.locator(`input[name="${id}"][value="${c.a}"]`).check();
  await page.locator('#check-0').click();
  await expect(panel.locator('.q.is-correct')).toHaveCount(Object.keys(CHOICES.panic).length);
  await expect(page.locator('.tab[data-idx="0"]')).toHaveClass(/done/);
});

test('Part 2: the readings sort goes green; Snapper writing saves once every box uses its term', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 1);
  await sortAll(page, 1, 'reads');
  await page.locator('#check-1').click();
  await expect(page.locator('#panel-1 .chip.is-correct')).toHaveCount(SORTS.reads.items.length);

  await page.locator('.tab[data-idx="2"]').click();
  await page.fill('#s_pref', 'The preferred reading is that Christmas traditions can change, and John Lewis is the place to shop for a new kind of family Christmas.');
  await page.fill('#s_neg', 'A viewer might laugh at Snapper but think the advert is far too strange to make them want to shop there.');
  await page.fill('#s_opp', 'An oppositional reading would be a viewer who says the advert is just a shop trying to sell expensive presents to families at Christmas.');
  await page.fill('#s_passive', 'A passive audience would all take in the same message, but Snapper got different readings, so its viewers were not passive at all.');
  await page.locator('#check-2').click();
  await expect(page.locator('#panel-2 [data-qw="s_neg"]')).toHaveClass(/is-wrong/);
  await page.fill('#s_neg', 'A negotiated reading would be a viewer who laughs at Snapper but thinks the advert is too strange to make them shop at John Lewis.');
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toContainText('Saved and sent to your teacher');
  await expect(page.locator('.tab[data-idx="2"]')).toHaveClass(/done/);
});
