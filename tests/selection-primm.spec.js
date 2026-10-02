import { test, expect } from '@playwright/test';

// Y8 Unit 1 · L5 Selection — UI wiring only (checker permutations live in
// Y8/Python Unit 1/L5_Selection/checkers.test.js).
//   • Modify/Make run the program once per test answer (each side of the pass mark) and
//     compare the outputs, so both paths of the decision are checked.
//   • Investigate step 4 is the standard Break it step — an indented line outside any if/else.

const URL = '/Y8/Python%20Unit%201/L5_Selection/1_Selection_PRIMM.html';
const KEY = 'primm_l5_selection';

const STARTER = [
  'score = int(input("Enter your score: "))',
  'if score >= 50:',
  '    print("Pass")',
  'else:',
  '    print("Fail")',
  'print("Thanks for playing!")',
].join('\n');
const STEP3_CODE = STARTER.replace('>= 50', '== 70').replace('    print("Pass")', '    print("Pass")\n    print("Well done!")');

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

async function answerPrompts(page, editorId, values) {
  const field = page.locator('#' + editorId).locator('xpath=ancestor::div[contains(@class,"code-checker")]').locator('.output-input-field');
  for (const v of values) {
    await expect(field).toBeVisible({ timeout: 30000 });
    await field.fill(v);
    await field.press('Enter');
  }
}

test('Predict: three questions, then on to Run', async ({ page }) => {
  await openAt(page, {});
  await page.check('input[name="p_mcq1"][value="option_a"]');
  await page.click('#btn_check_p_mcq1');
  await expect(page.locator('#qcard_p_mcq2')).toBeVisible({ timeout: 5000 });
  await page.check('input[name="p_mcq2"][value="option_b"]');
  await page.click('#btn_check_p_mcq2');
  await expect(page.locator('#qcard_p_mcq3')).toBeVisible({ timeout: 5000 });
  await page.check('input[name="p_mcq3"][value="option_c"]');
  await page.click('#btn_check_p_mcq3');
  await expect(page.locator('#stage-R')).toHaveClass(/active/, { timeout: 5000 });
});

test('Modify 1 runs both paths: unchanged pass mark fails, 40 passes', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] });
  await setCode(page, 'm1_editor', STARTER);
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/fail/, { timeout: 30000 });
  await expect(page.locator('#fb_m1')).toContainText('same thing');

  await setCode(page, 'm1_editor', STARTER.replace('50', '40'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  // both test runs are shown in the output panel
  const panel = page.locator('#m1_editor').locator('xpath=ancestor::div[contains(@class,"code-checker")]');
  await expect(panel).toContainText('Test: 40');
  await expect(panel).toContainText('Test: 39');
});

test('Make → extension unlocks; interactive extension completes the activity', async ({ page }) => {
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] });
  await setCode(page, 'm2_editor', [
    'height = int(input("How tall are you in cm? "))',
    'if height >= 120:',
    '    print("You can ride!")',
    'else:',
    '    print("Sorry, too short.")',
    'print("Enjoy the park!")',
  ].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m2_ext_task')).toBeVisible();

  await setCode(page, 'm2_editor', [
    'answer = input("Capital of France? ")',
    'if answer == "Paris":',
    '    print("Correct!")',
    'else:',
    '    print("Not quite")',
    'age = int(input("Age? "))',
    'if age >= 12:',
    '    print("You can watch it")',
    'else:',
    '    print("Too young")',
  ].join('\n'));
  await page.click('#btn_check_m2');
  await answerPrompts(page, 'm2_editor', ['Paris', '13']);
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#completionBanner')).toBeVisible();
});

test('Break it: indented Goodbye line errors; deleting it is not accepted, fixing it is', async ({ page }) => {
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 4, maxStepI: 4,
    iCodeSnapshots: { 1: STEP3_CODE, 2: STEP3_CODE, 3: STEP3_CODE }, i_editor: STEP3_CODE,
    // finishing Investigate re-checks every step's answer, so seed steps 1–3 as answered
    radio_i1_mcq: 'option_b', i2: 'Only when you pass, because it is indented inside the if', radio_i3_mcq: 'option_c',
  });
  await page.click('#qcard_i4 button:has-text("Break it")');
  await expect(page.locator('#i_fb_run')).toHaveClass(/fail/, { timeout: 30000 });
  await expect(page.locator('#i_fb_run')).toContainText(/indent/i);
  await expect(page.locator('#req_i_4 li:not(.req-note)').first()).toHaveClass(/req-pass/);

  await setCode(page, 'i_editor', STEP3_CODE);   // deleted rather than fixed
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['70']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await page.check('input[name="i4_mcq"][value="option_b"]');
  await page.click('#btn_check_i4');
  await expect(page.locator('#qcard_i4 .field-hint')).toContainText("don't delete it");

  await setCode(page, 'i_editor', STEP3_CODE + '\nprint("Goodbye!")');
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['70']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await page.click('#btn_check_i4');
  await expect(page.locator('#stage-M1')).toHaveClass(/active/, { timeout: 10000 });
});
