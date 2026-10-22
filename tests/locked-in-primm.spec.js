import { test, expect } from '@playwright/test';

// Y9 Python · L3 Locked In (Station Zero, Chapter 3: while loops) — UI wiring only
// (checker permutations live in Y9/Python/L3_While_Loops/checkers.test.js).
//   • Predict reveals its worked example (annotations + "How while works") after the first attempt.
//   • Run is gated until it has been run with 4271 first time, and with 3+ wrong codes first.
//   • Investigate's bug step is an infinite loop, stopped by the runner after 4 s.
//   • Modify / Make are checked by running the program once per test answer and reading the output.
//   • The story follows Proximity's ending (X critical, or the sensors lost) and this chapter's
//     choices: heat (the crisis), airlock (Modify 1) and seals (Make).

const PATH = '/Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html';
const KEY  = 'primm_y9_l3_locked_in';

// step=off shows each run at once instead of stepping through it, to keep the tests quick.
async function openAt(page, state = {}, { story = false } = {}) {
  await page.addInitScript(([k, s]) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }
  }, [KEY, state]);
  await page.goto(PATH + '?step=off&answers=fixed' + (story ? '' : '&story=off'));
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
}

async function setCode(page, id, src) {
  await page.locator('#' + id).evaluate((ta, v) => { ta.value = v; ta.dispatchEvent(new Event('input')); }, src);
}

const checker = (page, editorId) => page.locator('#' + editorId).locator('xpath=ancestor::div[contains(@class,"code-checker")]');
const outputOf = (page, editorId) => checker(page, editorId).locator('.output-content');

async function answerPrompts(page, editorId, values) {
  const field = checker(page, editorId).locator('.output-input-field');
  for (const v of values) {
    await expect(field).toBeVisible({ timeout: 30000 });
    await field.fill(v);
    await field.press('Enter');
  }
}

async function runWith(page, stage, editorId, values) {
  await page.click(`#stage-${stage} button:has-text("Run code")`);
  await answerPrompts(page, editorId, values);
}

const STARTER = [
  'code = input("Enter airlock code: ")',
  'while code != "4271":',
  '    print("ACCESS DENIED")',
  '    code = input("Enter airlock code: ")',
  'print("Airlock open")',
];
const starter = (edit = {}) => STARTER.map((l, i) => (i in edit ? edit[i] : l)).join('\n');
const withCode = c => starter({ 1: `while code != "${c}":` });
// Modification 2's answer (its code is given in the page).
const counted = c => ['attempts = 1', ...STARTER.slice(0, 4).map((l, i) => (i === 1 ? `while code != "${c}":` : l)),
  '    attempts = attempts + 1', STARTER[4], 'print("Tries: " + str(attempts))'];

// ─── Story layer ─────────────────────────────────────────────────────────────

test('chapter title card shows once, with a two-bullet recap; ?story=off stops it', async ({ page }) => {
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/);
  await expect(page.locator('#szTitle')).toHaveText(/Chapter 3/);
  await expect(page.locator('#szObjective')).toContainText('airlock');
  await expect(page.locator('#szPrevTyped .sz-prev-li')).toHaveCount(2);
  await expect(page.locator('#szPrevFull')).toContainText('Don’t trust WARD');
  await expect(page.locator('#szReadouts')).toContainText('Locked by WARDEN');
  await expect(page.locator('#szReadouts')).toContainText('4 of 5');
  await page.click('#szContinue');
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
  await page.reload();
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
});

test('the recap follows Proximity: X is still critical on its bad path', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sz_choices', JSON.stringify({ shield: 'pod3', lockdown: 'sensors', power: 'sensors' })));
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szPrevFull')).toContainText('Patel is still critical');
  await expect(page.locator('#szReadouts')).toContainText('4 of 5 · 1 critical');
  await expect(page.locator('#szCrewPods .crew-pod').nth(4)).toHaveClass(/critical/);
});

// ─── Predict ─────────────────────────────────────────────────────────────────

test('Predict: the worked example appears after the first attempt, then on to Run', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro"]'), PATH);
  await openAt(page, {}, { story: true });
  await expect(page.locator('#stage-P .recipe')).toBeHidden();

  await page.check('input[name="p_mcq1"][value="option_d"]');
  await page.click('#btn_check_p_mcq1');
  await expect(page.locator('#qcard_p_mcq2')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#stage-P .recipe')).toBeVisible();
  await expect(page.locator('#stage-P .recipe')).toContainText('is not equal to');

  for (const [q, v] of [['p_mcq2', 'option_c'], ['p_mcq3', 'option_b'], ['p_mcq4', 'option_c']]) {
    await page.check(`input[name="${q}"][value="${v}"]`);
    await page.click('#btn_check_' + q);
    await expect(page.locator('#fb_' + q)).toHaveClass(/pass/);
  }
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 5000 });
  await expect(page.locator('#szTitle')).toHaveText(/Watched/);
  await expect(page.locator('#szImpact svg')).toContainText('2 DENIALS');
  await page.click('#szContinue');
  await expect(page.locator('#stage-R')).toHaveClass(/active/);
});

test('Predict: a wrong answer shows its feedback and waits for Continue', async ({ page }) => {
  await openAt(page, { predictStep: 1, maxPredictStep: 1 });
  await page.check('input[name="p_mcq1"][value="option_b"]');
  await page.click('#btn_check_p_mcq1');
  await expect(page.locator('#fb_p_mcq1')).toHaveClass(/fail/);
  await expect(page.locator('#qcard_p_mcq1 .predict-continue')).toBeVisible();
});

// ─── Run ─────────────────────────────────────────────────────────────────────

test('Run is gated until both runs are done, then the keypad plays the last run', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P"]'), PATH);
  await openAt(page, { currentStage: 'R', completedStages: ['P'] }, { story: true });
  await page.fill('#r1', 'No, the condition was False at the top so the loop never ran');
  await page.click('#btn_check_run');
  await expect(page.locator('#qcard_r1 .field-hint')).toContainText('4271 the first time');

  await runWith(page, 'R', 'r_editor', ['4271']);
  await expect(outputOf(page, 'r_editor')).toContainText('Airlock open', { timeout: 30000 });
  await expect(page.locator('#req_r li').nth(0)).toHaveClass(/req-pass/);
  await runWith(page, 'R', 'r_editor', ['1111', '2222', '3333', '4271']);
  await expect(outputOf(page, 'r_editor')).toContainText('Airlock open', { timeout: 30000 });
  await expect(page.locator('#req_r li')).toHaveClass([/req-pass/, /req-pass/]);

  await page.click('#btn_check_run');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/Cycling/);
  await expect(page.locator('#szImpact svg')).toContainText('INNER DOOR · OPEN');
  await expect(page.locator('#szImpact svg')).toContainText('DENIED');
  await expect(page.locator('#szImpact .sz-impact-cap')).toContainText('4 codes tried');
});

// ─── Investigate ─────────────────────────────────────────────────────────────

test('Investigate 1: the crisis pick comes first; with if, a wrong second code opens the airlock', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P","R"]'), PATH);
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] }, { story: true });
  await expect(page.locator('#i1_task')).toBeHidden();
  await page.check('input[name="i_choice"][value="cryo"]');
  await expect(page.locator('#i1_task')).toBeVisible();
  await setCode(page, 'i_editor', starter({ 1: 'if code != "4271":' }));
  await expect(page.locator('#req_i_1 li:not(.req-note)').nth(0)).toHaveClass(/req-pass/);
  await runWith(page, 'I', 'i_editor', ['1234', '5678']);
  await expect(outputOf(page, 'i_editor')).toContainText('Airlock open', { timeout: 30000 });
  await expect(page.locator('#req_i_1 li:not(.req-note)')).toHaveClass([/req-pass/, /req-pass/]);
  await page.check('input[name="i1_mcq"][value="option_d"]');
  await page.click('#btn_check_i1');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/One power line/);
  await expect(page.locator('#szReadouts')).toContainText('Hunted');
  await page.click('#szContinue');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ heat: 'cryo' });
  await expect(page.locator('input[name="i_choice"][value="fast"]')).toBeDisabled();
  await expect(page.locator('#szCrewPods .crew-pod').nth(3)).toHaveClass(/hunted/);
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible();
});

// The loop question chain, drawn in a fixed order: the first variant of each slot, options
// unshuffled, so option value 0 is always the right answer.
const FIXED_I2_CHAIN = { pick: [0, 0, 0, 0], order: Array(4).fill([0, 1, 2, 3]), q: 0, done: false };

test('Investigate 2: Airlock open indented into the loop prints after a wrong code; the chain moves on', async ({ page }) => {
  const STEP1 = starter({ 1: 'if code != "4271":' });
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2, radio_i_choice: 'fast',
    iCodeSnapshots: { 1: STEP1 }, i_editor: STEP1, i2Chain: FIXED_I2_CHAIN,
  });
  const bullets = page.locator('#req_i_2 li:not(.req-note)');
  await setCode(page, 'i_editor', starter({ 4: '  print("Airlock open")' }));
  await expect(bullets.nth(0)).toHaveClass(/req-pass/);
  await expect(bullets.nth(1)).toHaveClass(/req-fail/);
  await expect(page.locator('#coach_i_2')).toContainText('2 spaces');

  await setCode(page, 'i_editor', starter({ 4: '    print("Airlock open")' }));
  await expect(bullets.nth(1)).toHaveClass(/req-pass/);
  await runWith(page, 'I', 'i_editor', ['1111', '2222', '4271']);
  await expect(outputOf(page, 'i_editor')).toContainText('Airlock open', { timeout: 30000 });
  await expect(bullets).toHaveClass([/req-pass/, /req-pass/, /req-pass/]);
  for (let slot = 0; slot < 4; slot++) {
    await page.check(`input[name="i2c_${slot}"][value="0"]`);
    await expect(page.locator('#fb_i2c_' + slot)).toHaveClass(/pass/);
  }
  await expect(page.locator('#qcard_i3_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate 2: a run that starts with 4271 does not unlock the questions', async ({ page }) => {
  const STEP1 = starter({ 1: 'if code != "4271":' });
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2, radio_i_choice: 'fast',
    iCodeSnapshots: { 1: STEP1 }, i_editor: STEP1, i2Chain: FIXED_I2_CHAIN,
  });
  await setCode(page, 'i_editor', starter({ 4: '    print("Airlock open")' }));
  await runWith(page, 'I', 'i_editor', ['4271']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#req_i_2 li:not(.req-note)')).toHaveClass([/req-pass/, /req-pass/, /req-fail/]);
  await expect(page.locator('#coach_i_2')).toContainText('start with a wrong code');
  await expect(page.locator('input[name="i2c_0"]').first()).toBeDisabled();
});

test('Investigate bug step: Break it makes a loop that never ends; putting the line back completes Investigate', async ({ page }) => {
  test.setTimeout(120000);
  // tryCompleteInvestigate re-checks every step's answer, so seed steps 1–3 as answered
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 4, maxStepI: 4, radio_i_choice: 'cryo',
    i_editor: starter({ 1: 'while code == "4271":' }),
    radio_i1_mcq: 'option_d', i2Chain: { ...FIXED_I2_CHAIN, q: 3, done: true }, radio_i3_mcq: 'option_c',
  });
  await page.click('#qcard_i4_prompt button:has-text("Break it")');
  await expect(page.locator('#i_editor')).toHaveValue(/while code != "4271":/);
  await expect(page.locator('#i_editor')).not.toHaveValue(/^\s+code = input/m);
  await expect(page.locator('#ibug_line')).toHaveText('4');
  await answerPrompts(page, 'i_editor', ['1234']);
  await expect(page.locator('#i_fb_run')).toContainText('InfiniteLoopError', { timeout: 30000 });

  await setCode(page, 'i_editor', starter());
  await runWith(page, 'I', 'i_editor', ['1234', '4271']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#req_i_4 li:not(.req-note)')).toHaveClass([/req-pass/, /req-pass/, /req-pass/]);
  await page.check('input[name="i4_mcq"][value="option_b"]');
  await page.click('#btn_check_i4');
  await expect(page.locator('#stage-M1')).toHaveClass(/active/, { timeout: 10000 });
  await expect(page.locator('#m1_editor')).toHaveValue(starter());
});

// ─── Modify ──────────────────────────────────────────────────────────────────

test('Modify 1: the old code fails with a plain hint; the chosen code passes and plays its report', async ({ page }) => {
  await page.addInitScript(p => {
    localStorage.setItem('sz_story_' + p, JSON.stringify(['intro', 'P', 'R', 'I1', 'I']));
    localStorage.setItem('sz_choices', JSON.stringify({ heat: 'fast' }));
  }, PATH);
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] }, { story: true });
  await expect(page.locator('#m1_task_1')).toBeHidden();
  await page.check('input[name="m1_choice"][value="override"]');
  await expect(page.locator('#req_m1_1_text')).toContainText('"0000"');

  await setCode(page, 'm1_editor', starter());
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('change "4271" to "0000"', { timeout: 30000 });

  await setCode(page, 'm1_editor', withCode('0000'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/Something at the door/);
  await expect(page.locator('#szLogFull')).toContainText('buckles');
  await expect(page.locator('#szReadouts')).toContainText('−14°C');
  await expect(page.locator('#szImpact svg')).toContainText('OPEN');
  await page.click('#szContinue');
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ airlock: 'override' });
  // Modification 2's worked example shows the chosen code, and Make's card the deciding fact
  await expect(page.locator('#m1_mod2_code_val')).toHaveText('"0000"');
  await expect(page.locator('#m2_choice_report')).toContainText('40%');
});

test('Modify 2: without str() it is a TypeError; the given code passes', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 2, maxStepM1: 2, radio_m1_choice: 'warden',
    passedChecks: { m1_code1: true }, m1CodeSnapshots: { 1: withCode('9013') } });
  await setCode(page, 'm1_editor', counted('9013').map(l => l.replace('str(attempts)', 'attempts')).join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('TypeError', { timeout: 30000 });

  await setCode(page, 'm1_editor', counted('9013').join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_3')).toBeVisible({ timeout: 10000 });
});

test('Modify 4: a pressure loop at the bottom passes; <= 100 is caught at the boundary', async ({ page }) => {
  const base = counted('9013').map(l => (l === '    print("ACCESS DENIED")' ? '    print("ACCESS DENIED: try " + str(attempts))' : l));
  const pressure = op => [...base, 'p = int(input("Pressure: "))', `while p ${op} 100:`, '    print("Too low")',
    '    p = int(input("Pressure: "))', 'print("Pressure OK")'].join('\n');
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 4, maxStepM1: 4, radio_m1_choice: 'warden',
    passedChecks: { m1_code1: true, m1_code2: true, m1_code3: true } });
  await setCode(page, 'm1_editor', pressure('<='));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/fail/, { timeout: 60000 });
  await expect(page.locator('#fb_m1')).toContainText('loop kept going');

  await setCode(page, 'm1_editor', pressure('<'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 60000 });
});

// ─── Make → cliffhanger → extension ─────────────────────────────────────────

const LOCK = [
  'guesses = 1',
  'guess = int(input("Lock number: "))',
  'while guess != 62:',
  '    print("Wrong number")',
  '    guess = int(input("Lock number: "))',
  '    guesses = guesses + 1',
  'print("Unlocked in " + str(guesses) + " guesses")',
];

test('Make: Unlocked inside the loop fails; the right lock plays the cliffhanger; then the extension', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(p => {
    localStorage.setItem('sz_story_' + p, '["intro","P","R","I1","I","M1"]');
    localStorage.setItem('sz_choices', JSON.stringify({ heat: 'cryo', airlock: 'warden' }));
  }, PATH);
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] }, { story: true });
  await expect(page.locator('#m2_choice_report')).toContainText('WARDEN held the airlock shut');
  await page.check('input[name="m2_choice"][value="override"]');
  await expect(page.locator('#req_m2_choice_text')).toContainText('SEALS: OVERRIDE');

  const inside = [...LOCK.slice(0, 4), '    print("Unlocked")', ...LOCK.slice(4), 'print("SEALS: OVERRIDE")'];
  await setCode(page, 'm2_editor', inside.join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toContainText('more than once', { timeout: 60000 });

  await setCode(page, 'm2_editor', [...LOCK, 'print("SEALS: OVERRIDE")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 60000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 5000 });
  await expect(page.locator('#szTitle')).toHaveText(/Let me in/);
  await expect(page.locator('#szLogFull')).toContainText('catches your arm');
  await expect(page.locator('#szReadouts')).toContainText('NO MATCH');
  await expect(page.locator('#szReadouts')).toContainText('Injured');
  await expect(page.locator('#szImpact svg')).toContainText('SEALS → OVERRIDE');
  await page.click('#szContinue');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ seals: 'override' });
  await expect(page.locator('#szCrewPods .crew-pod').nth(3)).toHaveClass(/injured/);

  await expect(page.locator('#m2_ext_task')).toBeVisible();
  const hints = LOCK.map(l => (l === '    print("Wrong number")'
    ? '    if guess > 62:\n        print("Too high")\n    else:\n        print("Too low")' : l));
  await setCode(page, 'm2_editor', [...hints, 'print("SEALS: OVERRIDE")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 60000 });
  await expect(page.locator('#completionBanner')).toBeVisible();
});
