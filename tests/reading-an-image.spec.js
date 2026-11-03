import { test, expect } from '@playwright/test';
import { SORTS, CHOICES } from '../Y10/Component_1/L1.2_Reading_an_Image/checkers.js';

const URL = '/Y10/Component_1/L1.2_Reading_an_Image/1_Reading_an_Image.html';

test('the Jaws sort works by drag as well as by click', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  await expect(page.locator('#panel-0 .tray .chip')).toHaveCount(8);
  const [first, ...rest] = SORTS.jaws.items;
  await page.locator(`.chip[data-qw="${first.id}"]`).dragTo(page.locator(`#panel-0 .bin[data-bin="${first.bin}"]`));
  await expect(page.locator(`#panel-0 .bin[data-bin="${first.bin}"] .chip[data-qw="${first.id}"]`)).toHaveCount(1);
  for (const it of rest) {
    await page.locator(`.chip[data-qw="${it.id}"]`).click();
    await page.locator(`#panel-0 .bin[data-bin="${it.bin}"]`).click();
  }
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toHaveClass(/correct/);
  await expect(page.locator('#panel-0 .chip.is-correct')).toHaveCount(8);
});

test('one wrong answer is red, the rest green, and the cooldown survives a reload', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="1"]').click();
  const entries = Object.entries(CHOICES.anchor);
  for (const [id, c] of entries) {
    const v = id === 'pink' ? c.opts.find(o => o[0] !== c.a)[0] : c.a;
    await page.locator(`input[name="${id}"][value="${v}"]`).check();
  }
  await page.locator('#check-1').click();
  await expect(page.locator('[data-qw="pink"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#panel-1 .q.is-correct')).toHaveCount(entries.length - 1);
  // The cooldown survives a reload, so refreshing can't skip it.
  await page.reload();
  await page.locator('.tab[data-idx="1"]').click();
  await expect(page.locator('#check-1')).toBeDisabled();
});

test('the caption preview shows the chosen photo and both captions', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="3"]').click();
  await page.locator('input[name="cap_photo"][value="stairs"]').check();
  await page.locator('#cap_poly').fill('He could be upset about bad news or he could be hiding from someone');
  await page.locator('#cap1').fill('Exam results day');
  await page.locator('#cap2').fill('Hiding from the zombies');
  await expect(page.locator('#prev-cap-1')).toHaveText('Exam results day');
  await expect(page.locator('#prev-cap-2')).toHaveText('Hiding from the zombies');
  const src = await page.locator('#prev-img-1').getAttribute('src');
  expect(src).toMatch(/^data:image\/jpeg;base64,/);
  await page.locator('#mean1').fill('With this caption the photo suggests he is upset about his grades');
  await page.locator('#mean2').fill('Now the photo suggests he is terrified and trying to stay hidden');
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toHaveClass(/correct/);
  await page.reload();
  await page.locator('.tab[data-idx="3"]').click();
  await expect(page.locator('input[name="cap_photo"][value="stairs"]')).toBeChecked();
  await expect(page.locator('#prev-cap-2')).toHaveText('Hiding from the zombies');
});

test('the warm-up and challenge tabs open their own panels', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab.support').click();
  await expect(page.locator('#panel-4')).toBeVisible();
  await expect(page.locator('#panel-4 .tray .chip')).toHaveCount(SORTS.words.items.length);
  await page.locator('.tab.challenge').click();
  await expect(page.locator('#panel-5')).toBeVisible();
  await expect(page.locator('#panel-5 img[data-img="jaws"]')).toHaveAttribute('src', /^data:image\/jpeg/);
  await expect(page.locator('#panel-0')).toBeHidden();
});

test('the page opens on the warm-up tab', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.tab.support')).toHaveClass(/active/);
  await expect(page.locator('#panel-4')).toBeVisible();
  await expect(page.locator('#panel-0')).toBeHidden();
});
