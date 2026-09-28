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

// ─── Investigate: code-change ticks, reset, gated skip ───────────────────────

const STARTER = 'a = "5"\nb = "5"\nprint(a + b)\n\nc = 5\nd = 5\nprint(c + d)';
const STEP1_CODE = 'a = input("Enter first number: ")\nb = "5"\nprint(a + b)\n\nc = 5\nd = 5\nprint(c + d)';
const STEP2_CODE = 'a = int(input("Enter first number: "))\nb = int(input("Enter second number: "))\nprint(a + b)';

// Type answers into the live input() prompts of an editor's output panel.
async function answerPrompts(page, editorId, values) {
  const field = page.locator('#' + editorId).locator('xpath=ancestor::div[contains(@class,"code-checker")]').locator('.output-input-field');
  for (const v of values) {
    await expect(field).toBeVisible({ timeout: 30000 });
    await field.fill(v);
    await field.press('Enter');
  }
}

test('Investigate step 1 cannot be passed until line 1 uses input()', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] });
  await page.click('#stage-I button:has-text("Run code")');
  await expect(page.locator('#btn_check_i1')).toBeEnabled({ timeout: 30000 });
  await page.fill('#i1', 'Because b is still text so it joins them');
  await page.click('#btn_check_i1');
  await expect(page.locator('#qcard_i1')).toHaveClass(/error/);
  await expect(page.locator('#req_i_1 li:not(.req-note)').first()).toHaveClass(/req-fail/);
  await expect(page.locator('#qcard_i2_prompt')).toBeHidden();

  await setCode(page, 'i_editor', STEP1_CODE);
  await expect(page.locator('#req_i_1 li:not(.req-note)').first()).toHaveClass(/req-pass/);   // live tick while editing
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['5']);
  await page.click('#btn_check_i1');
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate reset returns to the code the step started with, not the original', async ({ page }) => {
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2,
    iCodeSnapshots: { 1: STEP1_CODE }, i_editor: 'print("half-finished mess")',
  });
  await page.click('#btn_reset_i');
  await expect(page.locator('#i_editor')).toHaveValue(STEP1_CODE);
});

test('Investigate skip needs the teacher password', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'], attemptCounts: { i1: 3 }, i_editor: STARTER });
  await expect(page.locator('#i_skip_wrap')).toBeVisible();
  await page.click('#i_skip_wrap button:has-text("Skip this step")');
  await page.fill('#skip_pw_i', 'letmein');
  await page.press('#skip_pw_i', 'Enter');
  await expect(page.locator('#skip_gate_err_i')).toHaveText(/Incorrect password/);
  await expect(page.locator('#qcard_i1_prompt')).toBeVisible();
  await page.fill('#skip_pw_i', 'outwood');
  await page.press('#skip_pw_i', 'Enter');
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible();
});

test('Break it: deleting the broken line instead of fixing it is not accepted', async ({ page }) => {
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 3, maxStepI: 3,
    iCodeSnapshots: { 1: STEP1_CODE, 2: STEP2_CODE }, i_editor: STEP2_CODE,
  });
  await page.click('#qcard_i3 button:has-text("Break it")');
  await answerPrompts(page, 'i_editor', ['5', '3']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/fail/, { timeout: 30000 });
  await expect(page.locator('#req_i_3 li:not(.req-note)').first()).toHaveClass(/req-pass/);

  await setCode(page, 'i_editor', STEP2_CODE);   // deleted rather than fixed
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['5', '3']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await page.check('input[name="i3_mcq"][value="option_b"]');
  await page.click('#btn_check_i3');
  await expect(page.locator('#qcard_i3 .field-hint')).toContainText("don't delete it");
  await expect(page.locator('#req_i_3 li:not(.req-note)').nth(1)).toHaveClass(/req-fail/);
});
