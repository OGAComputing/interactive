import { test, expect } from '@playwright/test';

// Y8 Python Unit 1, L1–L3 — Investigate tick-lists, Check gating, reset-to-step-start
// and the teacher-gated skip (same engine as L4, which has its own tests in
// casting-primm.spec.js). Checker permutations live in each lesson's checkers*.test.js.

const BASE = '/Y8/Python%20Unit%201/';
const L1 = { url: BASE + 'L1_Output/1_Strings_PRIMM.html', key: 'primm_l0_output_strings' };
const L2 = { url: BASE + 'L2_Variables/1_Variables_PRIMM.html', key: 'primm_l2_variables' };
const L3 = { url: BASE + 'L3_Input/1_Input_PRIMM.html', key: 'primm_l3_input' };

async function openAt(page, lesson, state) {
  await page.addInitScript(([k, s]) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }
  }, [lesson.key, state]);
  await page.goto(lesson.url);
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
}

async function setCode(page, id, src) {
  await page.locator('#' + id).evaluate((ta, v) => { ta.value = v; ta.dispatchEvent(new Event('input')); }, src);
}

async function answerPrompts(page, values) {
  const field = page.locator('#i_editor').locator('xpath=ancestor::div[contains(@class,"code-checker")]').locator('.output-input-field');
  for (const v of values) {
    await expect(field).toBeVisible({ timeout: 30000 });
    await field.fill(v);
    await field.press('Enter');
  }
}

const runBtn = '#stage-I .checker-footer button:has-text("Run code")';
const reqs = n => `#req_i_${n} li:not(.req-note)`;

// ─── L1 Output ───────────────────────────────────────────────────────────────

const L1_STEP3 = "print('Hi there!')\nprint(\"I am learning Python.\")\nprint(\"This is fun!\")\nprint(\"Sam\")";

test('L1: step 1 cannot be passed with the original greeting', async ({ page }) => {
  await openAt(page, L1, { currentStage: 'I', completedStages: ['P', 'R'] });
  await page.click(runBtn);
  await expect(page.locator('#btn_check_i1')).toBeEnabled({ timeout: 30000 });
  await page.fill('#i1', 'The greeting text changed');
  await page.click('#btn_check_i1');
  await expect(page.locator('#qcard_i1')).toHaveClass(/error/);
  await expect(page.locator(reqs(1)).first()).toHaveClass(/req-fail/);
  await expect(page.locator('#qcard_i2_prompt')).toBeHidden();
});

test('L1: deleting the Break it line instead of fixing it is not accepted', async ({ page }) => {
  await openAt(page, L1, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 4, maxStepI: 4,
    iCodeSnapshots: { 1: L1_STEP3, 2: L1_STEP3, 3: L1_STEP3 }, i_editor: L1_STEP3,
  });
  await page.click('#qcard_i4 button:has-text("Break it")');
  await expect(page.locator('#i_fb_run')).toHaveClass(/fail/, { timeout: 30000 });
  await expect(page.locator(reqs(4)).first()).toHaveClass(/req-pass/);
  await setCode(page, 'i_editor', L1_STEP3);
  await page.click(runBtn);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await page.check('input[name="i4_mcq"][value="option_b"]');
  await page.click('#btn_check_i4');
  await expect(page.locator('#qcard_i4 .field-hint')).toContainText("don't delete it");
});

// ─── L2 Variables ────────────────────────────────────────────────────────────

const L2_STEP1 = 'name = "Priya"\ngreeting = "Hello "\nprint(greeting + name + ", welcome to Python!")';
const L2_STEP3 = 'name = "Priya"\ngreeting = "Hi there, "\nprint(greeting + name + ", welcome to Python!")\nname = "Jordan"\nprint(name)';

test('L2: reset returns to the code the step started with', async ({ page }) => {
  await openAt(page, L2, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2,
    iCodeSnapshots: { 1: L2_STEP1 }, i_editor: 'print("half-finished")',
  });
  await page.click('#btn_reset_i');
  await expect(page.locator('#i_editor')).toHaveValue(L2_STEP1);
});

test('L2: Investigate skip needs the teacher password', async ({ page }) => {
  await openAt(page, L2, { currentStage: 'I', completedStages: ['P', 'R'], attemptCounts: { i1: 3 } });
  await expect(page.locator('#i_skip_wrap')).toBeVisible();
  await page.click('#i_skip_wrap button:has-text("Skip this step")');
  await page.fill('#skip_pw_i', 'nope');
  await page.press('#skip_pw_i', 'Enter');
  await expect(page.locator('#skip_gate_err_i')).toHaveText(/Incorrect password/);
  await page.fill('#skip_pw_i', 'outwood');
  await page.press('#skip_pw_i', 'Enter');
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible();
});

test('L2: deleting print(nickname) and running IS the fix — Investigate completes', async ({ page }) => {
  await openAt(page, L2, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 4, maxStepI: 4,
    iCodeSnapshots: { 1: L2_STEP1, 2: L2_STEP3, 3: L2_STEP3 }, i_editor: L2_STEP3,
    i1: 'It shows my name because name holds it now', radio_i2_mcq: 'option_c',
    i3: 'The first print showed Priya because it ran before name changed',
  });
  await page.click('#qcard_i4 button:has-text("Break it")');
  await expect(page.locator('#i_fb_run')).toHaveClass(/fail/, { timeout: 30000 });
  await page.check('input[name="i4_mcq"][value="option_b"]');
  await page.click('#btn_check_i4');   // still broken → gated
  await expect(page.locator(reqs(4)).nth(1)).toHaveClass(/req-fail/);

  await setCode(page, 'i_editor', L2_STEP3);
  await page.click(runBtn);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator(reqs(4)).nth(1)).toHaveClass(/req-pass/);
  await page.click('#btn_check_i4');
  await expect(page.locator('#stage-M1')).toHaveClass(/active/, { timeout: 10000 });
});

// ─── L3 Input ────────────────────────────────────────────────────────────────

const L3_STEP1 = 'name = input("Enter your name: ")\ngreeting = "Hello "\nprint(greeting + name)';

test('L3: step 2 (no code change) is not gated', async ({ page }) => {
  await openAt(page, L3, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2,
    iCodeSnapshots: { 1: L3_STEP1 }, i_editor: L3_STEP1,
  });
  await expect(page.locator('#req_i_2')).toHaveCount(0);
  await page.click(runBtn);
  await answerPrompts(page, ['']);
  await page.check('input[name="i2_mcq"][value="option_b"]');
  await page.click('#btn_check_i2');
  await expect(page.locator('#qcard_i3_prompt')).toBeVisible({ timeout: 10000 });
});

test('L3: deleting the broken line instead of fixing it is not accepted', async ({ page }) => {
  await openAt(page, L3, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 3, maxStepI: 3,
    iCodeSnapshots: { 1: L3_STEP1, 2: L3_STEP1 }, i_editor: L3_STEP1,
  });
  await page.click('#qcard_i3 button:has-text("Break it")');
  await answerPrompts(page, ['Sam']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/fail/, { timeout: 30000 });
  await setCode(page, 'i_editor', 'name = input("Enter your name: ")\ngreeting = "Hello "');
  await page.click(runBtn);
  await answerPrompts(page, ['Sam']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await page.check('input[name="i3_mcq"][value="option_b"]');
  await page.click('#btn_check_i3');
  await expect(page.locator('#qcard_i3 .field-hint')).toContainText("don't delete it");
});
