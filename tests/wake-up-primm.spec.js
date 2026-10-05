import { test, expect } from '@playwright/test';

// Y9 Python · L1 round 1 Wake Up (Station Zero, Chapter 1) — UI wiring only (checker permutations
// live in Y9/Python/L1_Python_Refresh/checkers_wakeup.test.js).
//   • The terminal situation report types itself, skips on click, and shows once.
//   • Two Investigate steps (prompt isn't stored · NameError bug step), two Modify steps.
//   • Make is checked by running with word answers and reading the output.

const PATH = '/Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html';
const KEY  = 'primm_y9_l1_wake_up';

async function openAt(page, state = {}, { story = false, reducedMotion = 'reduce' } = {}) {
  await page.emulateMedia({ reducedMotion });
  await page.addInitScript(([k, s]) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }
  }, [KEY, state]);
  await page.goto(PATH + (story ? '' : '?story=off'));
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

const outputOf = (page, editorId) =>
  page.locator('#' + editorId).locator('xpath=ancestor::div[contains(@class,"code-checker")]').locator('.output-content');

const STARTER = [
  'name = input("Enter your name: ")',
  'role = input("Enter your job: ")',
  'print("CRYO BAY DOOR")',
  'print("Checking in: " + role + " " + name)',
  'print("Door unlocking...")',
].join('\n');

// ─── Story layer ─────────────────────────────────────────────────────────────

test('the terminal report types itself, a click shows it all, and it only shows once', async ({ page }) => {
  await openAt(page, {}, { story: true, reducedMotion: 'no-preference' });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/);
  await expect(page.locator('#szObjective')).toContainText('Get out of the Cryo Bay');
  // still typing: the log is incomplete and the skip hint is showing
  await expect(page.locator('#szSkipHint')).toBeVisible();
  const full = await page.locator('#szLogFull').textContent();
  await page.locator('#szMap').click();
  await expect(page.locator('#szLogTyped')).toHaveText(full);
  await expect(page.locator('#szSkipHint')).toBeHidden();
  await expect(page.locator('#szTitleTyped')).toHaveText('Chapter 1 — Wake Up');
  await expect(page.locator('.sz-readout').first()).toContainText('[CRIT]');
  await page.click('#szContinue');
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
  await page.reload();
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
});

test('reduced motion shows the whole report at once', async ({ page }) => {
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szLogTyped')).toHaveText(await page.locator('#szLogFull').textContent());
  await expect(page.locator('#szSkipHint')).toBeHidden();
});

// ─── Predict ─────────────────────────────────────────────────────────────────

test('Predict: three answers (exact output typed loosely) move to Run', async ({ page }) => {
  await openAt(page);
  await page.check('input[name="p_mcq1"][value="option_a"]');
  await page.click('#btn_check_p_mcq1');
  await expect(page.locator('#qcard_p_mcq2')).toBeVisible({ timeout: 5000 });
  await page.check('input[name="p_mcq2"][value="option_b"]');
  await page.click('#btn_check_p_mcq2');
  await expect(page.locator('#qcard_p_text1')).toBeVisible({ timeout: 5000 });
  await page.fill('#p_text1', 'checking in:  Engineer Riley.');
  await page.click('#btn_check_p_text1');
  await expect(page.locator('#fb_p_text1')).toHaveClass(/pass/);
  await expect(page.locator('#stage-R')).toHaveClass(/active/, { timeout: 10000 });
});

test('Predict: the name and job the wrong way round gets an order hint', async ({ page }) => {
  await openAt(page, { predictStep: 3, maxPredictStep: 3, radio_p_mcq1: 'option_a', radio_p_mcq2: 'option_b' });
  await page.fill('#p_text1', 'Checking in: Riley Engineer');
  await page.click('#btn_check_p_text1');
  await expect(page.locator('#fb_p_text1')).toContainText('check the order');
});

// ─── Investigate ─────────────────────────────────────────────────────────────

test('Investigate step 1 is gated until the question text changes', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] });
  await setCode(page, 'i_editor', STARTER.replace('Enter your job: ', 'What is your job? '));
  await expect(page.locator('#req_i_1 li:not(.req-note)').first()).toHaveClass(/req-pass/);
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['Sam', 'Pilot']);
  await expect(outputOf(page, 'i_editor')).toContainText('Checking in: Pilot Sam', { timeout: 30000 });
  await page.check('input[name="i1_mcq"][value="option_c"]');
  await page.click('#btn_check_i1');
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate: Run alone shows a cross for a change not yet made, then a tick — no MCQ needed', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] });
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['Sam', 'Pilot']);
  await expect(page.locator('#req_i_1 li:not(.req-note)').first()).toHaveClass(/req-fail/, { timeout: 30000 });
  await expect(page.locator('#req_i_1 li:not(.req-note) > span').first()).toHaveText('✗');

  await setCode(page, 'i_editor', STARTER.replace('Enter your job: ', 'What is your job? '));
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['Sam', 'Pilot']);
  await expect(page.locator('#req_i_1 li:not(.req-note) > span').first()).toHaveText('✓', { timeout: 30000 });
});

test('Investigate bug step: Break it gives a NameError; fixing the capital N completes Investigate', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2,
    i_editor: STARTER.replace('Enter your job: ', 'Job? '), radio_i1_mcq: 'option_c' });
  await page.click('#qcard_i2 button:has-text("Break it")');
  await answerPrompts(page, 'i_editor', ['Sam', 'Pilot']);
  await expect(page.locator('#i_fb_run')).toContainText('NameError', { timeout: 30000 });

  await setCode(page, 'i_editor', STARTER.replace('Enter your job: ', 'Job? ') + '\nprint("Access granted to " + name)');
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['Sam', 'Pilot']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#req_i_2 li:not(.req-note)')).toHaveClass([/req-pass/, /req-pass/]);
  await page.check('input[name="i2_mcq"][value="option_a"]');
  await page.click('#btn_check_i2');
  await expect(page.locator('#stage-M1')).toHaveClass(/active/, { timeout: 10000 });
});

// ─── Modify ──────────────────────────────────────────────────────────────────

test('Modify: door message, pod line, own question, then two answers on one line', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] });
  const mod1 = STARTER.replace('Door unlocking...', 'Cryo Bay door: OPEN');
  await setCode(page, 'm1_editor', mod1);
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });

  const withPod = mod1.trimEnd() + '\npod = input("Pod number: ")\n';
  await setCode(page, 'm1_editor', withPod + 'print("Pod: " + pod)');
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_3')).toBeVisible({ timeout: 10000 });

  const withOwn = withPod + 'print("Pod: " + pod)\nfeeling = input("How are you feeling? ")\n';
  await setCode(page, 'm1_editor', withOwn + 'print("You feel " + feeling)');
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_4')).toBeVisible({ timeout: 10000 });

  await setCode(page, 'm1_editor', withOwn + 'print(name + " is feeling " + feeling)');
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#stage-M2')).toHaveClass(/active/, { timeout: 10000 });
});

// ─── Make → extension ────────────────────────────────────────────────────────

test('Make passes on the output, and the extension completes the activity', async ({ page }) => {
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] });
  const make = [
    'name = input("Crew member: ")',
    'room = input("Last seen in: ")',
    'print("CREW LOCATOR")',
    'print("Crew member: " + name)',
    'print("Last seen in: " + room)',
  ];
  await setCode(page, 'm2_editor', make.join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m2_ext_task')).toBeVisible();

  await setCode(page, 'm2_editor', [...make, 'status = input("Status: ")', 'print(name + " is " + status + " in " + room)'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#completionBanner')).toBeVisible();
});
