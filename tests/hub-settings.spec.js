// The hub's ⚙ menu (index.html initSettingsMenu) holds what a teacher sets once or rarely needs,
// so the bar keeps just the class, topic and Live. Uses ?demo's made-up teacher.
import { test, expect } from '@playwright/test';

test('settings menu holds the rarely-used teacher tools and closes like a menu', async ({ page }) => {
  await page.goto('/index.html?demo');
  const gear = page.locator('#btn-settings');
  const menu = page.locator('#settings-menu');
  await expect(page.locator('#btn-live')).toBeVisible();
  await expect(menu).toBeHidden();

  await gear.click();
  await expect(menu).toBeVisible();
  await expect(gear).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#settings-account')).toContainText('demo.teacher@example.invalid');
  await expect(menu.getByText('Attach lesson slides')).toBeVisible();
  await expect(page.locator('#btn-sync')).toBeVisible();
  await expect(menu.getByRole('link', { name: /How grading works/ })).toBeVisible();
  await expect(page.locator('#btn-signout')).toBeVisible();

  // Ticking the checkbox keeps the menu open.
  await page.locator('#attach-slides').check();
  await expect(menu).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(gear).toBeFocused();

  await gear.click();
  await page.locator('#content').click({ position: { x: 5, y: 5 } });
  await expect(menu).toBeHidden();
});

test('signed out, the menu has only the grading guide', async ({ page }) => {
  await page.goto('/index.html');
  await page.locator('#btn-settings').click();
  await expect(page.locator('#settings-menu').getByRole('link', { name: /How grading works/ })).toBeVisible();
  await expect(page.locator('#btn-sync')).toBeHidden();
  await expect(page.locator('#btn-signout')).toBeHidden();
  await expect(page.locator('#attach-slides')).toBeHidden();
});
