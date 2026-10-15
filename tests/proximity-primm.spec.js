import { test, expect } from '@playwright/test';

// Y9 Python · L2 Proximity (Station Zero, Chapter 2: selection with elif) — UI wiring only
// (checker permutations live in Y9/Python/L2_Selection/checkers.test.js).
//   • Predict reveals its worked examples as the student reaches them.
//   • Run is gated until all three distances (85, 20, 5) have been run.
//   • Modify / Make are checked by running the program once per test answer and reading the output.
//   • The story follows Chapter 1's choices (Patel) and this chapter's (Chen, the sensors).

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
  'elif distance >= 20:',
  '    print("Movement detected")',
  'else:',
  '    print("IT\'S RIGHT BEHIND YOU")',
  'print("Scan complete")',
];
const starter = (edit = {}) => STARTER.map((l, i) => (i in edit ? edit[i] : l)).join('\n');

const lockdownProgram = room => [
  ...STARTER.slice(0, 7), `    print("LOCKDOWN: ${room}")`, STARTER[7],
];

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

test('the recap says Patel died when Wake Up shut him in and Life Support never saved him', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sz_choices', JSON.stringify({ door: 'open', lock: 'bay', air: 'full' })));
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szPrevFull')).toContainText('heart monitor went flat');
  await expect(page.locator('#szReadouts')).toContainText('3 of 5');
  await expect(page.locator('#szCrewCount')).toContainText('3');
});

test('with no earlier choices, the recap uses the defaults: everyone stable', async ({ page }) => {
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szPrevFull')).toContainText('Hale died three days ago');
  await expect(page.locator('#szPrevFull')).toContainText('the sleeping crew are stable');
  await expect(page.locator('#szReadouts')).toContainText('4 of 5');
});

// ─── Predict ─────────────────────────────────────────────────────────────────

test('Predict: the worked examples appear as the student reaches them, then on to Run', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro"]'), PATH);
  await openAt(page, {}, { story: true });
  const progB = page.locator('#stage-P [data-reveal="3"]');
  await expect(page.locator('#stage-P .recipe').first()).toBeHidden();
  await expect(progB).toBeHidden();

  await page.check('input[name="p_mcq1"][value="option_d"]');
  await page.click('#btn_check_p_mcq1');
  await expect(page.locator('#qcard_p_mcq2')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#stage-P .recipe').first()).toBeVisible();
  await expect(progB).toBeHidden();

  await page.check('input[name="p_mcq2"][value="option_c"]');
  await page.click('#btn_check_p_mcq2');
  await expect(page.locator('#qcard_p_mcq3')).toBeVisible({ timeout: 5000 });
  await expect(progB).toBeVisible();

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

test('Run is gated until 85, 20 and 5 have all been run, then the radar plays the last run', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P"]'), PATH);
  await openAt(page, { currentStage: 'R', completedStages: ['P'] }, { story: true });
  await page.fill('#r1', '20 printed Movement detected because >= includes equal to');
  await page.click('#btn_check_run');
  await expect(page.locator('#qcard_r1 .field-hint')).toContainText('85 and 20 and 5');

  await runWith(page, 'R', 'r_editor', ['85']);
  await expect(outputOf(page, 'r_editor')).toContainText('All clear', { timeout: 30000 });
  await expect(page.locator('#req_r li').nth(0)).toHaveClass(/req-pass/);
  await runWith(page, 'R', 'r_editor', ['20']);
  await expect(outputOf(page, 'r_editor')).toContainText('Movement detected', { timeout: 30000 });
  await runWith(page, 'R', 'r_editor', ['5']);
  await expect(outputOf(page, 'r_editor')).toContainText('BEHIND YOU', { timeout: 30000 });
  await expect(page.locator('#req_r li')).toHaveClass([/req-pass/, /req-pass/, /req-pass/]);

  await page.click('#btn_check_run');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szImpact .sz-feed-term .ln.hit')).toContainText('BEHIND YOU');
  await expect(page.locator('#szImpact svg')).toContainText('CONTACT · BEHIND YOU');
  await expect(page.locator('#szImpact .sz-impact-cap')).toContainText("IT'S RIGHT BEHIND YOU");
});

// ─── Investigate ─────────────────────────────────────────────────────────────

test('Investigate 1: swapping the numbers makes 30 print All clear', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] });
  await expect(page.locator('#btn_check_i1')).toBeDisabled();
  await setCode(page, 'i_editor', starter({ 1: 'if distance >= 20:', 3: 'elif distance >= 50:' }));
  await expect(page.locator('#req_i_1 li:not(.req-note)')).toHaveClass([/req-pass/, /req-pass/]);
  await runWith(page, 'I', 'i_editor', ['30']);
  await expect(outputOf(page, 'i_editor')).toContainText('All clear', { timeout: 30000 });
  await page.check('input[name="i1_mcq"][value="option_c"]');
  await page.click('#btn_check_i1');
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate 2: two separate ifs print two messages for 85', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2, i_editor: starter() });
  await setCode(page, 'i_editor', starter({ 3: 'if distance >= 20:' }));
  await runWith(page, 'I', 'i_editor', ['85']);
  await expect(outputOf(page, 'i_editor')).toContainText('All clear\nMovement detected', { timeout: 30000 });
  await page.fill('#i2', 'Both ifs were checked separately and both were true');
  await page.click('#btn_check_i2');
  await expect(page.locator('#qcard_i3_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate bug step: Break it gives a TypeError; int() back completes Investigate', async ({ page }) => {
  // tryCompleteInvestigate re-checks every step's answer, so seed steps 1–3 as answered
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 4, maxStepI: 4, i_editor: starter({ 3: 'elif distance > 20:' }),
    radio_i1_mcq: 'option_c', i2: 'Both ifs were checked separately and both were true', radio_i3_mcq: 'option_b',
  });
  await page.click('#qcard_i4_prompt button:has-text("Break it")');
  await expect(page.locator('#i_editor')).toHaveValue(/^distance = input\(/);
  await answerPrompts(page, 'i_editor', ['30']);
  await expect(page.locator('#i_fb_run')).toContainText('TypeError', { timeout: 30000 });

  await setCode(page, 'i_editor', starter({ 3: 'elif distance > 20:' }));
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
  await expect(page.locator('#fb_m1')).toContainText('With 30 typed');
  await expect(page.locator('#req_m1_1 li')).toHaveClass([/req-pass/, /req-fail/]);

  await setCode(page, 'm1_editor', lockdownProgram('CRYO BAY').join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ lockdown: 'cryo' });
});

test('Modify 3: a band above Movement detected fails with an order hint, and the right place passes', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 3, maxStepM1: 3, radio_m1_choice: 'cryo',
    passedChecks: { m1_code1: true, m1_code2: true } });
  const base = lockdownProgram('CRYO BAY');
  base[1] = 'if distance >= 60:';
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

test('Modify 4 passes, and the report shows what the Sensor Ops lockdown cost: Chen', async ({ page }) => {
  await page.addInitScript(p => {
    localStorage.setItem('sz_story_' + p, JSON.stringify(['intro', 'P', 'R', 'I']));
    localStorage.setItem('sz_choices', JSON.stringify({ lockdown: 'sensors' }));
  }, PATH);
  await openAt(page, {
    currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 4, maxStepM1: 4, radio_m1_choice: 'sensors',
    passedChecks: { m1_code1: true, m1_code2: true, m1_code3: true },
  }, { story: true });
  await setCode(page, 'm1_editor', [...lockdownProgram('SENSOR OPS'),
    'alert = input("Send alert to the crew? (y/n) ")',
    'if alert == "y":', '    print("Alert sent")', 'else:', '    print("Alert cancelled")'].join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/Lockdown/);
  await expect(page.locator('#szImpact .sz-feed-term .ln.hit')).toHaveText('LOCKDOWN: SENSOR OPS');
  await expect(page.locator('#szImpact svg')).toContainText('CRYO BAY: MOTION');
  await expect(page.locator('#szReadouts')).toContainText('Chen');
  await expect(page.locator('#szCamLabel')).toHaveText(/Sensor Ops door/);
  await page.click('#szContinue');
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
