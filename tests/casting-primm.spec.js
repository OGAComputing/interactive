import { test, expect } from '@playwright/test';

// Y8 Unit 1 · L4 Data Types & Casting — UI wiring only (checker permutations live in
// Y8/Python Unit 1/L4_Data_Types_Casting/checkers.test.js).
//   • Modify/Make checks answer the program with fixed test numbers and pass on the output.
//   • Passing Make unlocks the five extension challenges; challenge 1 completes the activity,
//     and each later challenge unlocks the next.

const URL = '/Y8/Python%20Unit%201/L4_Data_Types_Casting/1_Casting_PRIMM.html';
const KEY = 'primm_l4_data_types_casting';

async function openAt(page, state) {
  await page.addInitScript(([k, s]) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }
  }, [KEY, state]);
  await page.goto(URL);
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
}

async function setCode(page, id, src) {
  await page.locator('#' + id).evaluate((ta, v) => { ta.value = v; ta.dispatchEvent(new Event('input')); }, src);
}

test('Modify 1 passes using the test numbers (9 and 5 → 4)', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] });
  await setCode(page, 'm1_editor', [
    'a = int(input("Enter first number: "))',
    'b = int(input("Enter second number: "))',
    'print(a + b)',
    'print(b - a)',
  ].join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
});

test('Make → extension ladder: challenge 1 completes, challenge 2 unlocks', async ({ page }) => {
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] });
  await setCode(page, 'm2_editor', [
    'x = int(input("First? "))',
    'y = int(input("Second? "))',
    'print(x + y)',
    'print(x * y)',
  ].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#ext_step_1')).toBeVisible();
  await expect(page.locator('#btn_check_m2')).toHaveText(/extension 1/);

  await setCode(page, 'm2_editor', [
    'p = int(input("Pizzas? "))',
    's = int(input("Slices? "))',
    'n = int(input("People? "))',
    'print(p * s / n)',
  ].join('\n'));
  await page.click('#btn_check_m2');
  // Extension runs interactively — answer the three questions in the output panel.
  const field = page.locator('#m2_editor').locator('xpath=ancestor::div[contains(@class,"code-checker")]').locator('.output-input-field');
  for (const v of ['2', '8', '4']) {
    await expect(field).toBeVisible({ timeout: 30000 });
    await field.fill(v);
    await field.press('Enter');
  }
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#completionBanner')).toBeVisible();
  await expect(page.locator('#ext_step_2')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#btn_check_m2')).toHaveText(/extension 2/);
});
