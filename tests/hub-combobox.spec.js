// The hub's class picker behaves like an ordinary searchable drop-down (index.html makeCombobox):
// opening it lists every class with the current one highlighted, typing filters, and leaving
// without picking puts the last pick back. Uses ?demo's three made-up classes.
import { test, expect } from '@playwright/test';

test('class picker lists every class when opened, filters when typed into, restores on leave', async ({ page }) => {
  await page.goto('/index.html?demo');
  const box = page.locator('#course-search');
  const options = page.locator('#course-dropdown .course-option');
  await expect(box).not.toHaveAttribute('readonly', '');

  // Pick a class, so the box holds its name.
  await box.click();
  await expect(options).toHaveCount(3);
  await options.filter({ hasText: '9Y' }).click();
  await expect(box).toHaveValue('9Y Computing (demo)');
  await expect(page.locator('#course-dropdown')).not.toHaveClass(/open/);

  // Reopening shows all three, not just the one whose name is in the box.
  await page.locator('body').click({ position: { x: 5, y: 400 } });
  await box.click();
  await expect(options).toHaveCount(3);
  await expect(options.filter({ hasText: '9Y' })).toHaveClass(/selected/);
  await expect(options.filter({ hasText: '9Y' })).toHaveClass(/focused/);

  // Typing replaces the selected text and filters.
  await page.keyboard.type('8x');
  await expect(options).toHaveCount(1);
  await expect(options.first()).toHaveText('8X Computing (demo)');

  // Esc cancels: the previous class comes back.
  await page.keyboard.press('Escape');
  await expect(box).toHaveValue('9Y Computing (demo)');

  // Keyboard pick: arrow down from the current class, Enter.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(box).toHaveValue('9F Computing (demo)');

  // The ▼ opens it too.
  await page.locator('#course-chevron').click();
  await expect(options).toHaveCount(3);
});
