import { test, expect } from '@playwright/test';

const URL = '/Y10/Component_1/L1.0_Course_Introduction/1_Course_Introduction.html';

test('finishing both baseline tasks completes the page at 100%', async ({ page }) => {
  await page.goto(URL);
  await page.locator('#fav_watch').fill('Inside Out 2');
  await page.locator('#fav_read').fill('The Beano');
  await page.locator('#fav_play').fill('EA FC 26');
  await page.locator('#hope').fill('I would like to make a music video because I love editing clips');
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toHaveClass(/correct/);

  await page.locator('.tab[data-idx="1"]').click();
  await expect(page.locator('#panel-1 img[data-img="minecraft"]')).toHaveAttribute('src', /^data:image\/jpeg/);
  await page.locator('#b_what').fill('This is a film poster that you would see at the cinema');
  await page.locator('#b_who').fill('It is made for children and teenagers who play Minecraft because it has blocks and a creeper');
  await page.locator('#b_detail').fill('The bright blue sky makes me think the film will be fun and happy');
  await page.locator('#b_why').fill('They made it to get people to go and watch the film');
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toHaveClass(/correct/);
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#done-banner')).toHaveClass(/gold/);
});
