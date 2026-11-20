import { test, expect } from '@playwright/test';
import { CHOICES } from '../Y10/Component_1/L3.3_Same_Text_Different_Readings/checkers_unit_a_check.js';

const URL = '/Y10/Component_1/L3.3_Same_Text_Different_Readings/1_Unit_A_Check.html';
const qs = Object.entries(CHOICES.terms);

test('Task 1 is one go: blanks are refused, the first click asks to be sure, the second hands in and colours every answer', async ({ page }) => {
  await page.goto(URL);
  const panel = page.locator('#panel-0');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.q')).toHaveCount(qs.length);

  // A blank question: refused, no time lost.
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toContainText('Answer every question first');

  // Three wrong, the rest right.
  for (const [n, [id, c]] of qs.entries()) {
    const pick = n < 3 ? c.opts.find(o => o[0] !== c.a)[0] : c.a;
    await panel.locator(`input[name="${id}"][value="${pick}"]`).check();
  }
  await page.locator('#check-0').click();
  await expect(page.locator('#check-0')).toHaveText('Sure? Click again to hand in');
  await expect(panel.locator('.q.is-correct, .q.is-wrong')).toHaveCount(0);

  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toContainText(`Handed in: ${qs.length - 3} of ${qs.length} right`);
  await expect(panel.locator('.q.is-wrong')).toHaveCount(3);
  await expect(panel.locator('.q.is-correct')).toHaveCount(qs.length - 3);
  // No retry: no Try for Gold, the radios are locked, and no right option is shown on a wrong question.
  await expect(page.locator('#reset-0')).toBeHidden();
  await expect(panel.locator('input[type="radio"]:not(:disabled)')).toHaveCount(0);
  await expect(page.locator('.tab[data-idx="0"]')).toHaveClass(/done/);

  // After a reload it stays handed in, with the same marks.
  await page.reload();
  await expect(page.locator('#feedback-0')).toContainText(`Handed in: ${qs.length - 3} of ${qs.length} right`);
  await expect(panel.locator('.q.is-wrong')).toHaveCount(3);
});

test('Task 2: the evidence file shows; a box that is too short goes red, then a long enough answer saves', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="1"]').click();
  await expect(page.locator('#panel-1 .evidence-file li')).toHaveCount(6);
  await expect(page.locator('#panel-1 .starter')).toHaveCount(0);
  await page.fill('#a_who', 'Channel 4 is a public service broadcaster. The purpose of Bake Off is to entertain, and the motivation is to generate profit from the adverts in the breaks.');
  await page.fill('#a_aud', 'Families and students watch it.');
  await page.fill('#a_use', 'Families watch it together on a Tuesday night in the living room, which meets a need for social interaction. Keen bakers watch on their own and try the recipes, so it meets a need for information.');
  await page.locator('#check-1').click();
  await expect(page.locator('#panel-1 [data-qw="a_aud"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#feedback-1')).toContainText('too short: write at least 20 words');
  await page.fill('#a_aud', 'Families and adults who like baking watch it every week, and lots of students watch it too because they like the jokes and the memes online.');
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toContainText('Saved and sent to your teacher');
  await expect(page.locator('.tab[data-idx="1"]')).toHaveClass(/done/);
});
