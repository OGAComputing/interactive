import { test, expect } from '@playwright/test';

// Y9 Python · L2 Proximity (Station Zero, Chapter 2: selection with elif) — UI wiring only
// (checker permutations live in Y9/Python/L2_Selection/checkers.test.js).
//   • Predict, Run and Investigate use a plain if/else; elif first appears in Modification 2.
//   • Predict reveals its worked examples as the student reaches them.
//   • Run: 85, 5, then 50, each run followed by a question that unlocks only after that run.
//   • Modify / Make are checked by running the program once per test answer and reading the output.
//   • The story follows Wake Up's choices (Patel) and this chapter's: the crisis on Investigate 1
//     (which pod the heaters save; the other crew member, X, is critical), then the lockdown and power.

const PATH = '/Y9/Python/L2_Selection/1_Proximity_PRIMM.html';
const KEY  = 'primm_y9_l2_proximity';

// step=off shows each run at once instead of stepping through it, to keep the tests quick.
async function openAt(page, state = {}, { story = false } = {}) {
  await page.addInitScript(([k, s]) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }
  }, [KEY, state]);
  await page.goto(PATH + '?step=off' + (story ? '' : '&story=off'));
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
  'distance = int(input("Distance to target in metres: "))',
  'if distance >= 50:',
  '    print("All clear")',
  'else:',
  '    print("IT\'S RIGHT BEHIND YOU")',
  'print("Scan complete")',
];
const starter = (edit = {}) => STARTER.map((l, i) => (i in edit ? edit[i] : l)).join('\n');

// Modification 1's answer: the lockdown line inside the else.
const lockdownProgram = room => [
  ...STARTER.slice(0, 5), `    print("LOCKDOWN: ${room}")`, STARTER[5],
];
// Modification 2's answer: the elif middle band added above the else.
const middleBandProgram = room => {
  const p = lockdownProgram(room);
  return [...p.slice(0, 3), 'elif distance >= 20:', '    print("Movement detected")', ...p.slice(3)];
};

// ─── Story layer ─────────────────────────────────────────────────────────────

test('chapter title card shows once, and ?story=off stops it', async ({ page }) => {
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/);
  await expect(page.locator('#szTitle')).toHaveText(/Chapter 2/);
  await expect(page.locator('#szObjective')).toContainText('proximity sensors');
  await page.click('#szContinue');
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
  await page.reload();
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
});

test('the recap says Patel is critical when Wake Up shut it in with him (nobody has died)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sz_choices', JSON.stringify({ door: 'open', lock: 'bay' })));
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szPrevFull')).toContainText('Patel is critical');
  await expect(page.locator('#szReadouts')).toContainText('4 of 5 · 1 critical');
  await expect(page.locator('#szCrewPods .crew-pod').nth(4)).toHaveClass(/critical/);
});

test('the optional Life Support round can save a critical Patel: canisters to Pod 5', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sz_choices', JSON.stringify({ door: 'open', lock: 'bay', transfer: 'pod5' })));
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szPrevFull')).not.toContainText('Patel is critical');
  await expect(page.locator('#szReadouts')).toContainText('4 of 5');
  await expect(page.locator('#szCrewPods .crew-pod').nth(4)).not.toHaveClass(/critical/);
});

test('with no earlier choices, the recap tells Wake Up and why you came to Sensor Ops, in two short bullets', async ({ page }) => {
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szPrevTyped .sz-prev-li')).toHaveCount(2);
  await expect(page.locator('#szPrevFull')).toContainText('Hale died with something from the planet');
  await expect(page.locator('#szPrevFull')).toContainText('Don’t trust WARD');
  await expect(page.locator('#szPrevFull')).toContainText('Sensor Ops');
  await expect(page.locator('#szReadouts')).toContainText('Reserve tanks');
  await expect(page.locator('#szReadouts')).toContainText('4 of 5');
});

// ─── Predict ─────────────────────────────────────────────────────────────────

test('Predict: the worked example appears after the first attempt, there is no elif, then on to Run', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro"]'), PATH);
  await openAt(page, {}, { story: true });
  await expect(page.locator('#stage-P .recipe').first()).toBeHidden();
  await expect(page.locator('#stage-P .annotated-code')).not.toContainText('elif');

  await page.check('input[name="p_mcq1"][value="option_d"]');
  await page.click('#btn_check_p_mcq1');
  await expect(page.locator('#qcard_p_mcq2')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#stage-P .recipe').first()).toBeVisible();

  await page.check('input[name="p_mcq2"][value="option_c"]');
  await page.click('#btn_check_p_mcq2');
  await expect(page.locator('#qcard_p_mcq3')).toBeVisible({ timeout: 5000 });

  await page.check('input[name="p_mcq3"][value="option_a"]');
  await page.click('#btn_check_p_mcq3');
  await expect(page.locator('#qcard_p_mcq4')).toBeVisible({ timeout: 5000 });
  await page.check('input[name="p_mcq4"][value="option_c"]');
  await page.click('#btn_check_p_mcq4');
  await expect(page.locator('#qcard_p_text1')).toBeVisible({ timeout: 5000 });
  await page.fill('#p_text1', "it's right behind you");
  await page.click('#btn_check_p_text1');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 5000 });
  await expect(page.locator('#szTitle')).toHaveText(/Watched/);
  await expect(page.locator('#szImpact svg')).toContainText('SIMULATION');
  await page.click('#szContinue');
  await expect(page.locator('#stage-R')).toHaveClass(/active/);
});

test('Predict: a wrong answer explains, and waits for Continue', async ({ page }) => {
  await openAt(page);
  await page.check('input[name="p_mcq1"][value="option_a"]');
  await page.click('#btn_check_p_mcq1');
  await expect(page.locator('#fb_p_mcq1')).toHaveClass(/fail/);
  await expect(page.locator('#qcard_p_mcq1 .predict-continue')).toBeVisible();
});

// ─── Run ─────────────────────────────────────────────────────────────────────

test('Run: each distance is run, then a question about it; a wrong answer needs another run', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P"]'), PATH);
  await openAt(page, { currentStage: 'R', completedStages: ['P'] }, { story: true });
  const opt = (k, v) => page.locator(`input[name="rc_${k}"][value="${v}"]`);
  await expect(page.locator('#r_chain')).toContainText('Run 1 of 3');
  await expect(opt(0, 0)).toBeDisabled();
  await expect(page.locator('#r_hint')).toBeHidden();

  // the wrong distance doesn't unlock the question
  await runWith(page, 'R', 'r_editor', ['50']);
  await expect(page.locator('#r_chain .rc-note').first()).toContainText("doesn't match", { timeout: 30000 });
  await expect(opt(0, 0)).toBeDisabled();

  await runWith(page, 'R', 'r_editor', ['85']);
  await expect(opt(0, 0)).toBeEnabled({ timeout: 30000 });
  await opt(0, 1).click();
  await expect(page.locator('#r_chain .mcq-fb.fail')).toContainText('Run it again and type 85');
  await expect(opt(0, 0)).toBeDisabled();
  await runWith(page, 'R', 'r_editor', ['85']);
  await expect(opt(0, 0)).toBeEnabled({ timeout: 30000 });
  await opt(0, 0).click();
  await expect(page.locator('#r_chain .mcq-fb.pass')).toBeVisible();

  await expect(page.locator('#r_chain')).toContainText('Run 2 of 3', { timeout: 10000 });
  await runWith(page, 'R', 'r_editor', ['5']);
  await expect(opt(1, 0)).toBeEnabled({ timeout: 30000 });
  await opt(1, 0).click();
  await expect(page.locator('#r_chain')).toContainText('Run 3 of 3', { timeout: 10000 });
  await runWith(page, 'R', 'r_editor', ['50']);
  await expect(opt(2, 0)).toBeEnabled({ timeout: 30000 });
  await opt(2, 0).click();

  // the report replays the run with 5, not the last run
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 15000 });
  await expect(page.locator('#szImpact .sz-feed-term .ln.hit')).toContainText('BEHIND YOU');
  await expect(page.locator('#szImpact svg')).toContainText('CONTACT · BEHIND YOU');
  await expect(page.locator('#szImpact .sz-impact-cap')).toContainText("IT'S RIGHT BEHIND YOU");
});

// ─── Investigate ─────────────────────────────────────────────────────────────

test('Investigate 1: the crisis pick comes first, then changing 50 to 20 makes 30 print All clear', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] });
  await expect(page.locator('#i1_task')).toBeHidden();
  await page.check('input[name="i_choice"][value="pod3"]');
  await expect(page.locator('#i1_task')).toBeVisible();
  await expect(page.locator('#btn_check_i1')).toBeDisabled();
  await setCode(page, 'i_editor', starter({ 1: 'if distance >= 20:' }));
  await expect(page.locator('#req_i_1 li:not(.req-note)')).toHaveClass([/req-pass/]);
  await runWith(page, 'I', 'i_editor', ['30']);
  await expect(outputOf(page, 'i_editor')).toContainText('All clear', { timeout: 30000 });
  await page.check('input[name="i1_mcq"][value="option_c"]');
  await page.click('#btn_check_i1');
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible({ timeout: 10000 });
  // the pick is locked and stored: heating Pod 3 leaves Patel (Pod 5) critical
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ shield: 'pod3' });
  await expect(page.locator('input[name="i_choice"][value="pod5"]')).toBeDisabled();
  await expect(page.locator('#szCrewPods .crew-pod').nth(4)).toHaveClass(/critical/);
});

test('Investigate 1: the crisis report names who the heaters could not save', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P","R"]'), PATH);
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], radio_i_choice: 'pod5',
    i_editor: starter({ 1: 'if distance >= 20:' }), radio_i1_mcq: 'option_c',
  }, { story: true });
  await runWith(page, 'I', 'i_editor', ['30']);
  await expect(outputOf(page, 'i_editor')).toContainText('All clear', { timeout: 30000 });
  await page.click('#btn_check_i1');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/Two pods/);
  await expect(page.locator('#szLogFull')).toContainText('get help to Chen');
  await expect(page.locator('#szReadouts')).toContainText('Pod 3 · Chen');
  await page.click('#szContinue');
  await expect(page.locator('#szCrewPods .crew-pod').nth(2)).toHaveClass(/critical/);
  // the Modify card names Chen as the one left in the Cryo Bay
  await expect(page.locator('#m1_choice .sz-x').first()).toHaveText('Chen');
});

// The indentation question chain, drawn in a fixed order: the first variant of each slot,
// options unshuffled, so option value 0 is always the right answer.
const FIXED_I2_CHAIN = { pick: [0, 0, 0, 0], order: Array(4).fill([0, 1, 2, 3]), q: 0, done: false };

test('Investigate 2: live coach counts the spaces; a real Tab key lines it up', async ({ page }) => {
  const STEP1_CODE = starter({ 1: 'if distance >= 20:' });
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2, iCodeSnapshots: { 1: STEP1_CODE }, i_editor: STEP1_CODE });
  const bullets = page.locator('#req_i_2 li:not(.req-note)');
  const coach = page.locator('#coach_i_2');
  await expect(coach).toContainText('press Tab');                     // next thing to do, before any typing
  await expect(page.locator('#i2_chain')).toContainText('Run your code first');

  await setCode(page, 'i_editor', starter({ 1: 'if distance >= 20:', 5: '  print("Scan complete")' }));
  await expect(bullets.nth(0)).toHaveClass(/req-pass/);
  await expect(bullets.nth(1)).toHaveClass(/req-fail/);               // red live, no Check needed
  await expect(coach).toContainText('2 spaces');

  // back to the left edge, then the real Tab key at the start of line 6
  await setCode(page, 'i_editor', STEP1_CODE);
  await page.locator('#i_editor').evaluate(ta => {
    const pos = ta.value.indexOf('print("Scan complete")');
    ta.focus(); ta.setSelectionRange(pos, pos);
  });
  await page.keyboard.press('Tab');
  await expect(bullets).toHaveClass([/req-pass/, /req-pass/]);
  await expect(coach).toHaveClass(/done/);
});

test('Investigate 2: Scan complete vanishes for 85; the question chain restarts on a slip, then moves on', async ({ page }) => {
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2,
    i_editor: starter({ 1: 'if distance >= 20:', 5: '    print("Scan complete")' }), i2Chain: FIXED_I2_CHAIN,
  });
  await runWith(page, 'I', 'i_editor', ['85']);
  await expect(outputOf(page, 'i_editor')).toContainText('All clear', { timeout: 30000 });
  await expect(outputOf(page, 'i_editor')).not.toContainText('Scan complete');

  // a wrong answer explains, and the chain starts again
  await page.check('input[name="i2c_0"][value="1"]');
  await expect(page.locator('#fb_i2c_0')).toHaveClass(/fail/);
  await page.click('#qcard_i2 button:has-text("Start the questions again")');
  await expect(page.locator('#i2_chain')).toContainText('Question 1 of 4');

  // reseed the fixed draw, then answer all four in a row
  await page.evaluate(d => { localStorage.setItem('primm_y9_l2_proximity', JSON.stringify({ ...JSON.parse(localStorage.getItem('primm_y9_l2_proximity')), i2Chain: d })); }, FIXED_I2_CHAIN);
  await page.reload();
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
  for (let slot = 0; slot < 4; slot++) {
    await page.check(`input[name="i2c_${slot}"][value="0"]`);
    await expect(page.locator('#fb_i2c_' + slot)).toHaveClass(/pass/);
  }
  await expect(page.locator('#qcard_i3_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate bug step: Break it gives a TypeError; int() back completes Investigate', async ({ page }) => {
  // tryCompleteInvestigate re-checks every step's answer, so seed steps 1–3 as answered
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 4, maxStepI: 4, i_editor: starter({ 1: 'if distance > 20:' }),
    radio_i1_mcq: 'option_c', i2Chain: { ...FIXED_I2_CHAIN, q: 3, done: true }, radio_i3_mcq: 'option_b',
  });
  await page.click('#qcard_i4_prompt button:has-text("Break it")');
  await expect(page.locator('#i_editor')).toHaveValue(/^distance = input\(/);
  await answerPrompts(page, 'i_editor', ['30']);
  await expect(page.locator('#i_fb_run')).toContainText('TypeError', { timeout: 30000 });

  await setCode(page, 'i_editor', starter({ 1: 'if distance > 20:' }));
  await runWith(page, 'I', 'i_editor', ['30']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#req_i_4 li:not(.req-note)')).toHaveClass([/req-pass/, /req-pass/]);
  await page.check('input[name="i4_mcq"][value="option_d"]');
  await page.click('#btn_check_i4');
  await expect(page.locator('#stage-M1')).toHaveClass(/active/, { timeout: 10000 });
  await expect(page.locator('#m1_editor')).toHaveValue(starter());
});

// ─── Modify ──────────────────────────────────────────────────────────────────

test('Modify 1: the lockdown must be inside the else; the choice is stored for the story', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] });
  await expect(page.locator('#m1_task_1')).toBeHidden();
  await page.check('input[name="m1_choice"][value="cryo"]');
  await expect(page.locator('#req_m1_1_text')).toContainText('LOCKDOWN: CRYO BAY');

  await setCode(page, 'm1_editor', [...STARTER, 'print("LOCKDOWN: CRYO BAY")'].join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/fail/, { timeout: 30000 });
  // the far distance changes from check to check (MOD_TEST_BANK.mod1): always 50 or more
  await expect(page.locator('#fb_m1')).toContainText(/With ([5-9]\d|1\d\d) typed/);
  await expect(page.locator('#req_m1_1 li')).toHaveClass([/req-pass/, /req-fail/]);

  await setCode(page, 'm1_editor', lockdownProgram('CRYO BAY').join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ lockdown: 'cryo' });
});

test('Modify 2: elif is introduced here, and the middle band stops the lockdown at 20 to 49', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 2, maxStepM1: 2, radio_m1_choice: 'cryo',
    passedChecks: { m1_code1: true } });
  await expect(page.locator('#m1_step_2 .annotated-code')).toContainText('elif distance >= 20:');
  await setCode(page, 'm1_editor', lockdownProgram('CRYO BAY').join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('between the All clear block and else', { timeout: 30000 });
  await expect(page.locator('#req_m1_2 li')).toHaveClass([/req-fail/, /req-pass/, /req-pass/]);

  await setCode(page, 'm1_editor', middleBandProgram('CRYO BAY').join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_3')).toBeVisible({ timeout: 10000 });
});

test('Modify 3: a band above Movement detected fails with an order hint, and the right place passes', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 3, maxStepM1: 3, radio_m1_choice: 'cryo',
    passedChecks: { m1_code1: true, m1_code2: true } });
  const base = middleBandProgram('CRYO BAY');
  const wrong = [...base.slice(0, 3), 'elif distance >= 10:', '    print("Proximity alert")', ...base.slice(3)];
  await setCode(page, 'm1_editor', wrong.join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('first True condition', { timeout: 30000 });
  await expect(page.locator('#req_m1_3 li')).toHaveClass([/req-pass/, /req-fail/, /req-pass/]);

  const right = [...base.slice(0, 5), 'elif distance >= 10:', '    print("Proximity alert")', ...base.slice(5)];
  await setCode(page, 'm1_editor', right.join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
});

test('Modify 1 passes, and the report straight away shows what the Sensor Ops lockdown cost: Chen', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, JSON.stringify(['intro', 'P', 'R', 'I1', 'I'])), PATH);
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], radio_m1_choice: 'sensors' }, { story: true });
  await setCode(page, 'm1_editor', lockdownProgram('SENSOR OPS').join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/Lockdown/);
  await expect(page.locator('#szImpact .sz-feed-term .ln.hit')).toHaveText('LOCKDOWN: SENSOR OPS');
  await expect(page.locator('#szImpact svg')).toContainText('CRYO BAY: MOTION');
  await expect(page.locator('#szReadouts')).toContainText('Chen');
  await expect(page.locator('#szCamLabel')).toHaveText(/Sensor Ops door/);
  await expect(page.locator('#szContinue')).toHaveText('Onwards to Modification 2 →');
  await page.click('#szContinue');
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('#szCrewPods .crew-pod').nth(2)).toHaveClass(/critical/);
  // Make's card repeats the deciding fact
  await expect(page.locator('#m2_choice_report')).toContainText('Chen is critical');
});

// ─── Make → cliffhanger → extension ─────────────────────────────────────────

const SCANNER = [
  'dose = int(input("Radiation dose: "))',
  'if dose >= 200:', '    print("DANGER: do not enter")',
  'elif dose >= 100:', '    print("WARNING: 5 minutes only")',
  'elif dose >= 50:', '    print("CAUTION: suit required")',
  'else:', '    print("SAFE")',
];

test('Make: a wrong boundary fails on that band, then the right scanner plays the cliffhanger', async ({ page }) => {
  await page.addInitScript(p => {
    localStorage.setItem('sz_story_' + p, '["intro","P","R","I","M1"]');
    localStorage.setItem('sz_choices', JSON.stringify({ lockdown: 'cryo' }));
  }, PATH);
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] }, { story: true });
  await expect(page.locator('#m2_choice_report')).toContainText('sensor array is smashed');
  await page.check('input[name="m2_choice"][value="sensors"]');
  await setCode(page, 'm2_editor', [...SCANNER.map(l => l.replace('>= 200', '> 200')), 'print("POWER: SENSORS")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toContainText('A dose of 200', { timeout: 60000 });
  await expect(page.locator('#req_m2_make li').nth(2)).toHaveClass(/req-fail/);

  await setCode(page, 'm2_editor', [...SCANNER, 'print("POWER: SENSORS")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 60000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 5000 });
  await expect(page.locator('#szTitle')).toHaveText(/One frame/);
  await expect(page.locator('#szLogFull')).toContainText('flickers back to life');
  await expect(page.locator('#szLogFull')).toContainText('WARDEN has locked the airlock');
  await expect(page.locator('#szReadouts')).toContainText('Backup power');
  await expect(page.locator('#szCam')).toBeVisible();
  await expect(page.locator('#szCamLabel')).toHaveText(/1 frame/);
  await expect(page.locator('#szCamImg')).toHaveJSProperty('naturalWidth', 800);
  await expect(page.locator('#szImpact svg')).toContainText('POWER → SENSORS');
  await page.click('#szContinue');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ power: 'sensors' });

  await expect(page.locator('#m2_ext_task')).toBeVisible();
  await setCode(page, 'm2_editor', [
    'dose = int(input("Radiation dose: "))',
    'if dose < 0:', '    print("SCANNER FAULT")',
    'elif dose >= 500:', '    print("EVACUATE")',
    ...SCANNER.slice(1).map(l => l.replace(/^if/, 'elif')),
    'print("POWER: SENSORS")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 60000 });
  await expect(page.locator('#completionBanner')).toBeVisible();
});

test('Make: asking two questions gets a plain explanation, not a raw EOFError', async ({ page }) => {
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] });
  await page.check('input[name="m2_choice"][value="pods"]');
  await setCode(page, 'm2_editor', ['name = input("Name: ")', ...SCANNER, 'print("POWER: CRYO PODS")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toContainText('only ask one question', { timeout: 60000 });
});
