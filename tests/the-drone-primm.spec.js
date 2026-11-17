import { test, expect } from '@playwright/test';

// Y9 Python · L5 The Drone (Station Zero, Chapter 5: functions) — UI wiring only (checker
// permutations live in Y9/Python/L5_Functions/checkers.test.js).
//   • Predict: the drone_status() program; the def/call labels and the recipe appear after Q1.
//   • Investigate's bug step: Break it puts a call above its def, a NameError.
//   • Modify / Make are checked by running the program and reading what it printed (and, for
//     Modification 4 and the parameters bonus, what the turtle drew).
//   • The story follows Distress Signal's ending and this chapter's choices: wake (the crisis),
//     drone (Modify 1) and priority (Make). An unfixed danger is fatal (2026-11-04); one death
//     at a time (2026-11-09). The cliffhanger is WARDEN's twist.

const PATH = '/Y9/Python/L5_Functions/1_The_Drone_PRIMM.html';
const KEY  = 'primm_y9_l5_the_drone';

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
const output = (page, editorId) => checker(page, editorId).locator('.output-content');
const run = (page, stage) => page.click(`#stage-${stage} button:has-text("Run code")`);

const STARTER = ['def drone_status():', '    print("DRONE ONLINE")', '    print("Battery: 100%")', '', 'drone_status()'].join('\n');
const STEP1 = STARTER + '\ndrone_status()';
const STEP2 = STEP1.replace('    print("Battery: 100%")', '    print("Battery: 100%")\n    print("Camera: ready")');
const STEP3 = STEP2 + '\n\ndef drone_dock():\n    print("DOCKING")';
// Modify starts from Investigate's program; each step changes it (scout chosen in these tests).
const MOD_START = ['def drone_status():', '    print("DRONE ONLINE")', '    print("Battery: 100%")', '',
  'def drone_dock():', '    print("DOCKING")', '', 'drone_status()', 'drone_dock()'].join('\n');
const M1 = MOD_START.split('drone_status').join('scout_ducts');
const M2 = M1.replace('DRONE ONLINE', 'Drone: into the ducts').replace('Battery: 100%', 'Camera: recording');
const M3 = M2.replace('\ndrone_dock()', '\nscout_ducts()\ndrone_dock()');
const BEEP_DEF = 'def beep():\n    for i in range(3):\n        print("BEEP")\n\n';
const M4 = M3.replace('def drone_dock():\n    print("DOCKING")', BEEP_DEF + 'def drone_dock():\n    beep()\n    print("DOCKING")');

// ─── Story layer ─────────────────────────────────────────────────────────────

test('chapter title card shows once, with a two-bullet recap; ?story=off stops it', async ({ page }) => {
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/);
  await expect(page.locator('#szTitle')).toHaveText(/Chapter 5/);
  await expect(page.locator('#szObjective')).toContainText('drone');
  await expect(page.locator('#szPrevTyped .sz-prev-li')).toHaveCount(2);
  await expect(page.locator('#szPrevFull')).toContainText('rescue ship is coming');
  await expect(page.locator('#szReadouts')).toContainText('No commands');
  await expect(page.locator('#szReadouts')).toContainText('4 of 5');
  await page.click('#szContinue');
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
  await page.reload();
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
});

test('the recap follows Distress Signal: the slow ship cost the crew member you saved', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sz_choices', JSON.stringify({ shield: 'pod5', lockdown: 'cryo', fuel: 'orbit', signal: 'quarantine' })));
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szPrevFull')).toContainText('Patel died');
  await expect(page.locator('#szReadouts')).toContainText('3 of 5');
  await expect(page.locator('#szCrewPods .crew-pod').nth(4)).toHaveClass(/dead/);
});

// An unfixed danger is fatal (2026-11-04); one death at a time (2026-11-09).
async function crewAfter(page, seen, choices) {
  await page.addInitScript(([p, s, c]) => {
    localStorage.setItem('sz_story_' + p, JSON.stringify(s));
    localStorage.setItem('sz_choices', JSON.stringify(c));
  }, [PATH, seen, choices]);
  await page.goto(PATH + '?step=off&story=off');
  return page.locator('#szCrewPods .crew-pod');
}
const ALL_SEEN = ['intro', 'P', 'R', 'I1', 'I', 'M1', 'M2'];

test('Okafor kept under and Make never reached: nobody sent the med kit, so he dies', async ({ page }) => {
  const pods = await crewAfter(page, ALL_SEEN, { wake: 'under', drone: 'guard' });
  await expect(pods.nth(0)).toHaveClass(/dead/);
  await expect(page.locator('#szCrewCount')).toHaveText('3/5');
});

test('Okafor woken, the drone scouting, and the camera replayed: he is left alone and dies', async ({ page }) => {
  const pods = await crewAfter(page, ALL_SEEN, { wake: 'awake', drone: 'scout', priority: 'camera' });
  await expect(pods.nth(0)).toHaveClass(/dead/);
});

test('one death at a time: Distress Signal lost Patel, so Okafor is injured, not dead', async ({ page }) => {
  const pods = await crewAfter(page, ALL_SEEN, { shield: 'pod5', lockdown: 'cryo', fuel: 'orbit', signal: 'quarantine', wake: 'under' });
  await expect(pods.nth(4)).toHaveClass(/dead/);
  await expect(pods.nth(0)).toHaveClass(/injured/);
  await expect(pods.nth(0)).not.toHaveClass(/dead/);
  await expect(page.locator('#szCrewCount')).toHaveText('3/5');
});

test('Okafor woken and the Cryo Bay guarded: he is safe, with no Make needed', async ({ page }) => {
  const pods = await crewAfter(page, ALL_SEEN, { wake: 'awake', drone: 'guard' });
  await expect(pods.nth(0)).not.toHaveClass(/dead|critical|injured/);
});

test('before the cliffhanger, Okafor kept under is critical', async ({ page }) => {
  const pods = await crewAfter(page, ['intro', 'P', 'R', 'I1'], { wake: 'under' });
  await expect(pods.nth(0)).toHaveClass(/critical/);
});

// ─── Predict ─────────────────────────────────────────────────────────────────

test('Predict: the def and call labels and "How functions work" appear after the first guess', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro"]'), PATH);
  await openAt(page, {}, { story: true });
  await expect(page.locator('#stage-P .recipe')).toBeHidden();
  const answers = [['p_mcq1', 'option_c'], ['p_mcq2', 'option_b'], ['p_mcq3', 'option_c'], ['p_mcq4', 'option_d']];
  for (const [k, [q, v]] of answers.entries()) {
    await expect(page.locator('#qcard_' + q)).toBeVisible({ timeout: 5000 });
    await page.check(`input[name="${q}"][value="${v}"]`);
    await page.click('#btn_check_' + q);
    await expect(page.locator('#fb_' + q)).toHaveClass(/pass/);
    if (k === 0) await expect(page.locator('#stage-P .recipe')).toContainText('How functions work', { timeout: 5000 });
  }
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 5000 });
  await expect(page.locator('#szTitle')).toHaveText(/First command/);
  await page.click('#szContinue');
  await expect(page.locator('#stage-R')).toHaveClass(/active/);
});

test('Predict: a wrong answer shows its feedback and waits for Continue', async ({ page }) => {
  await openAt(page, { predictStep: 1, maxPredictStep: 1 });
  await page.check('input[name="p_mcq1"][value="option_a"]');
  await page.click('#btn_check_p_mcq1');
  await expect(page.locator('#fb_p_mcq1')).toHaveClass(/fail/);
  await expect(page.locator('#qcard_p_mcq1 .predict-continue')).toBeVisible();
});

// ─── Run ─────────────────────────────────────────────────────────────────────

test('Run: three runs, each followed by a question; the report replays the output', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P"]'), PATH);
  await openAt(page, { currentStage: 'R', completedStages: ['P'] }, { story: true });
  const opt = (k, v) => page.locator(`input[name="rc_${k}"][value="${v}"]`);
  await expect(opt(0, 0)).toBeDisabled();
  await run(page, 'R');
  await expect(output(page, 'r_editor')).toContainText('Battery: 100%', { timeout: 30000 });
  // nothing draws here, so there's no turtle screen
  await expect(checker(page, 'r_editor').locator('.turtle-screen')).toHaveCount(0);
  await expect(opt(0, 0)).toBeEnabled();
  await opt(0, 1).click();
  await expect(page.locator('#r_chain .mcq-fb.fail')).toContainText('output panel');
  await expect(opt(0, 0)).toBeDisabled();
  for (let k = 0; k < 3; k++) {
    await run(page, 'R');
    await expect(opt(k, 0)).toBeEnabled({ timeout: 30000 });
    await opt(k, 0).click();
    if (k < 2) await expect(page.locator('#r_chain')).toContainText(`Run ${k + 2} of 3`, { timeout: 10000 });
  }
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 15000 });
  await expect(page.locator('#szTitle')).toHaveText(/Lift-off/);
  await expect(page.locator('#szImpact')).toContainText('DRONE ONLINE');
});

test('Run 2 steps one line per Next line click, so students can follow the highlight', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(([k, s]) => localStorage.setItem(k, JSON.stringify(s)),
    [KEY, { currentStage: 'R', completedStages: ['P'] }]);
  await page.goto(PATH + '?answers=fixed&story=off');   // stepping on
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
  const box = checker(page, 'r_editor');
  const next = box.locator('.step-next');
  const label = box.locator('.step-label');
  // Run 1 replays on its own, with no Next line button
  await run(page, 'R');
  await expect(page.locator('input[name="rc_0"][value="0"]')).toBeEnabled({ timeout: 30000 });
  await expect(next).toBeHidden();
  await page.locator('input[name="rc_0"][value="0"]').click();
  await expect(page.locator('#r_chain')).toContainText('Run 2 of 3', { timeout: 10000 });
  // Run 2 waits on every line until Next line is clicked: 1 (def), 5 (call), 2, 3
  await run(page, 'R');
  for (const line of [1, 5, 2, 3]) {
    await expect(label).toContainText(`Line ${line} ran`, { timeout: 30000 });
    await page.waitForTimeout(700);   // longer than an automatic step: it hasn't moved on
    await expect(label).toContainText(`Line ${line} ran`);
    if (line === 1) await expect(output(page, 'r_editor')).not.toContainText('DRONE ONLINE');
    await next.click();
  }
  await expect(next).toBeHidden();
  await expect(output(page, 'r_editor')).toContainText('Battery: 100%');
  await expect(page.locator('input[name="rc_1"][value="0"]')).toBeEnabled();
});

// ─── Investigate ─────────────────────────────────────────────────────────────

test('Investigate 1: the crisis pick comes first; two calls print everything twice', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P","R"]'), PATH);
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] }, { story: true });
  await expect(page.locator('#i1_task')).toBeHidden();
  await page.check('input[name="i_choice"][value="under"]');
  await expect(page.locator('#i1_task')).toBeVisible();
  await setCode(page, 'i_editor', STEP1);
  await expect(page.locator('#req_i_1 li').nth(0)).toHaveClass(/req-pass/);
  await run(page, 'I');
  await expect(page.locator('#req_i_1 li')).toHaveClass([/req-pass/, /req-pass/], { timeout: 30000 });
  await page.check('input[name="i1_mcq"][value="option_b"]');
  await page.click('#btn_check_i1');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/Pod 1/);
  await expect(page.locator('#szReadouts')).toContainText('31 BPM');
  await page.click('#szContinue');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ wake: 'under' });
  await expect(page.locator('input[name="i_choice"][value="awake"]')).toBeDisabled();
  await expect(page.locator('#szCrewPods .crew-pod').nth(0)).toHaveClass(/critical/);
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible();
});

// The question chain, drawn in a fixed order: the first variant of each slot, options
// unshuffled, so option value 0 is always the right answer.
const FIXED_I2_CHAIN = { pick: [0, 0, 0], order: Array(3).fill([0, 1, 2, 3]), q: 0, done: false };

test('Investigate 2: a third print inside the command, then three questions in a row', async ({ page }) => {
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2, radio_i_choice: 'awake',
    iCodeSnapshots: { 1: STEP1 }, i_editor: STEP1, i2Chain: FIXED_I2_CHAIN,
  });
  await setCode(page, 'i_editor', STEP2);
  await expect(page.locator('input[name="i2c_0"]').first()).toBeDisabled();
  await run(page, 'I');
  await expect(output(page, 'i_editor')).toContainText('Camera: ready', { timeout: 30000 });
  await expect(page.locator('#req_i_2 li')).toHaveClass([/req-pass/, /req-pass/, /req-pass/]);
  for (let slot = 0; slot < 3; slot++) {
    await page.check(`input[name="i2c_${slot}"][value="0"]`);
    await expect(page.locator('#fb_i2c_' + slot)).toHaveClass(/pass/);
  }
  await expect(page.locator('#qcard_i3_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate 3: a def with no call is not ticked once it is called', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'], stepI: 3, maxStepI: 3, radio_i_choice: 'awake', i_editor: STEP2 });
  await setCode(page, 'i_editor', STEP3 + '\ndrone_dock()');
  await expect(page.locator('#req_i_3 li').nth(0)).toHaveClass(/req-fail/);
  await setCode(page, 'i_editor', STEP3);
  await expect(page.locator('#req_i_3 li').nth(0)).toHaveClass(/req-pass/);
});

test('Investigate bug step: Break it gives a NameError; moving the call below its def completes Investigate', async ({ page }) => {
  test.setTimeout(120000);
  // tryCompleteInvestigate re-checks every step's answer, so seed steps 1–3 as answered
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 4, maxStepI: 4, radio_i_choice: 'awake',
    i_editor: STEP3, radio_i1_mcq: 'option_b', i2Chain: { ...FIXED_I2_CHAIN, q: 2, done: true }, radio_i3_mcq: 'option_c',
  });
  // Run the working code first, so drone_dock is already defined from an earlier run:
  // the broken call must still fail (each run forgets the defs it is about to make).
  await setCode(page, 'i_editor', STEP3 + '\n\ndrone_dock()');
  await run(page, 'I');
  await expect(output(page, 'i_editor')).toContainText('DOCKING', { timeout: 30000 });
  await page.click('#qcard_i4_prompt button:has-text("Break it")');
  await expect(page.locator('#i_editor')).toHaveValue(/^drone_dock\(\)\ndef drone_status/);
  await expect(page.locator('#ibug_line')).toHaveText('1');
  await expect(page.locator('#i_fb_run')).toHaveClass(/fail/, { timeout: 30000 });
  await expect(page.locator('#i_fb_run')).toContainText('NameError');
  await expect(page.locator('#req_i_4 li')).toHaveClass([/req-pass/, /req-pass/, /./]);
  // Reset can't be used to dodge the fix: once broken, it goes back to the broken code
  await setCode(page, 'i_editor', STEP3);
  await expect(page.locator('#btn_reset_i')).toHaveText(/Reset to broken code/);
  await page.click('#btn_reset_i');
  await expect(page.locator('#i_editor')).toHaveValue(/^drone_dock\(\)\n/);

  await setCode(page, 'i_editor', STEP3 + '\ndrone_dock()');
  await run(page, 'I');
  await expect(page.locator('#req_i_4 li')).toHaveClass([/req-pass/, /req-pass/, /req-pass/], { timeout: 30000 });
  await expect(output(page, 'i_editor')).toContainText('DOCKING');
  await page.check('input[name="i4_mcq"][value="option_d"]');
  await page.click('#btn_check_i4');
  await expect(page.locator('#stage-M1')).toHaveClass(/active/, { timeout: 10000 });
  await expect(page.locator('#m1_editor')).toHaveValue(MOD_START);
});

// ─── Modify ──────────────────────────────────────────────────────────────────
// 2026-11-17: the steps change Investigate's program (as in Y8) rather than add to it.

test('Modify 1: renaming only the def is a NameError; renaming both passes and plays the drone report', async ({ page }) => {
  await page.addInitScript(p => {
    localStorage.setItem('sz_story_' + p, JSON.stringify(['intro', 'P', 'R', 'I1', 'I']));
    localStorage.setItem('sz_choices', JSON.stringify({ wake: 'awake' }));
  }, PATH);
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] }, { story: true });
  await expect(page.locator('#m1_task_1')).toBeHidden();
  await expect(page.locator('#m1_editor')).toHaveValue(MOD_START);
  // nothing in Modify draws, so there's no turtle screen
  await expect(checker(page, 'm1_editor').locator('.turtle-screen')).toHaveCount(0);
  await page.check('input[name="m1_choice"][value="scout"]');
  await expect(page.locator('#req_m1_1_text')).toContainText('def scout_ducts():');
  await expect(page.locator('#m1_step_1 .m1-job')).toHaveText('scout_ducts');

  await setCode(page, 'm1_editor', MOD_START.replace('def drone_status', 'def scout_ducts'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('NameError', { timeout: 30000 });

  await setCode(page, 'm1_editor', M1);
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/One job/);
  await expect(page.locator('#szReadouts')).toContainText('Found');
  await expect(page.locator('#szReadouts')).toContainText('Alone');
  await page.click('#szContinue');
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ drone: 'scout' });
  // the next steps name the chosen job and suggest its messages
  await expect(page.locator('#m1_step_2 .m1-job')).toHaveText('scout_ducts');
  await expect(page.locator('#m1_step_2 .m1-line1')).toHaveText('Drone: into the ducts');
  await expect(page.locator('#m2_choice_report')).toContainText('found the nest');
  await expect(page.locator('#m2_choice_report')).toContainText('Okafor is alone');
});

test('Modify 2 and 3: one message changed fails; both pass; the second call below drone_dock() fails', async ({ page }) => {
  test.setTimeout(90000);
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 2, maxStepM1: 2, radio_m1_choice: 'scout',
    passedChecks: { m1_code1: true }, m1CodeSnapshots: { 1: M1 }, m1_editor: M1 });
  await setCode(page, 'm1_editor', M1.replace('DRONE ONLINE', 'Into the vents'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('second message', { timeout: 30000 });
  await setCode(page, 'm1_editor', M2);
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_3')).toBeVisible({ timeout: 10000 });

  await setCode(page, 'm1_editor', M2 + '\nscout_ducts()');
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('above drone_dock()', { timeout: 30000 });
  await setCode(page, 'm1_editor', M3);
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_4')).toBeVisible({ timeout: 10000 });
});

test('Modify 4: the 4 given lines tick as typed; beep() at the left edge fails; called inside drone_dock() passes', async ({ page }) => {
  test.setTimeout(90000);
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 4, maxStepM1: 4, radio_m1_choice: 'scout',
    passedChecks: { m1_code1: true, m1_code2: true, m1_code3: true }, m1_editor: M3 });
  await expect(page.locator('#m1_mod4_code_count')).toHaveText('0 of 4 added');
  const withDef = M3.replace('def drone_dock():', BEEP_DEF + 'def drone_dock():');
  await setCode(page, 'm1_editor', withDef + '\nbeep()');
  await expect(page.locator('#m1_mod4_code_count')).toHaveText('3 of 4 added');
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('part of docking', { timeout: 30000 });

  await setCode(page, 'm1_editor', M4);
  await expect(page.locator('#m1_mod4_code_count')).toHaveText('4 of 4 added');
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
});

// Trial (2026-11-16): Modify's task card pins like Investigate's, unless it's too tall.
test('Modify: the task card pins while scrolling to the editor; a failed bullet stays, passing ones hide', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1366, height: 768 });
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 3, maxStepM1: 3, radio_m1_choice: 'scout',
    passedChecks: { m1_code1: true, m1_code2: true }, m1_editor: M2 + '\n' + '# a long program, so the page scrolls\n'.repeat(30) });
  const steps = page.locator('#m1_steps');
  await page.locator('#btn_check_m1').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 400);
  await expect(steps).toHaveClass(/is-stuck/);
  await expect(page.locator('#m1_step_3 .section-label')).toBeHidden();
  await page.click('#btn_check_m1');   // one call only: bullet 1 red, 2 green
  await expect(page.locator('#fb_m1')).toHaveClass(/fail/, { timeout: 30000 });
  await page.mouse.wheel(0, 100);
  await expect(steps).toHaveClass(/is-stuck/);
  const reqs = page.locator('#req_m1_3 li');
  await expect(reqs.nth(0)).toBeVisible();
  await expect(reqs.nth(1)).toBeHidden();
});

test('Modify: a card too tall to pin scrolls away like normal content', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 3, maxStepM1: 3, radio_m1_choice: 'scout',
    passedChecks: { m1_code1: true, m1_code2: true }, m1_editor: M2 });
  const steps = page.locator('#m1_steps');
  // stand-in for a long card: a 400px bullet (over 45% of a 700px screen)
  await page.locator('#req_m1_3 li').first().evaluate(li => { li.style.height = '400px'; });
  await page.locator('#btn_check_m1').scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 400);
  await page.setViewportSize({ width: 1366, height: 700 });   // a resize re-measures
  await expect(steps).toHaveClass(/too-big/);
  await expect(steps).not.toHaveClass(/is-stuck/);
  expect(await steps.evaluate(e => getComputedStyle(e).position)).toBe('static');
});

// ─── Make ────────────────────────────────────────────────────────────────────

const LOOKUP = ['def menu():', '    print("CRYO POD LOOKUP")', '    print("Pods: 1, 3, 5")', '',
  'def pod1():', '    print("Pod 1: Okafor, Commander")', '', 'def pod3():', '    print("Pod 3: Chen, Medic")', '',
  'def pod5():', '    print("Pod 5: Patel, Pilot")', '', 'menu()', 'pod = input("Which pod? ")',
  'if pod == "1":', '    pod1()', 'elif pod == "3":', '    pod3()', 'elif pod == "5":', '    pod5()', 'else:', '    print("No such pod")'];

test('Make: numbers without quotes fail; the lookup passes and plays WARDEN\'s twist; then the extension and the bonus', async ({ page }) => {
  test.setTimeout(180000);
  await page.addInitScript(p => {
    localStorage.setItem('sz_story_' + p, '["intro","P","R","I1","I","M1"]');
    localStorage.setItem('sz_choices', JSON.stringify({ wake: 'under', drone: 'guard', airlock: 'override', seals: 'warden', heat: 'cryo' }));
  }, PATH);
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] }, { story: true });
  await expect(page.locator('#m2_choice_report')).toContainText('25 bpm');
  await page.check('input[name="m2_choice"][value="pod1"]');
  await expect(page.locator('#req_m2_choice_text')).toContainText('PRIORITY: MED KIT');

  const noQuotes = LOOKUP.map(l => l.replace(/== "(\d)"/, '== $1'));
  await setCode(page, 'm2_editor', [...noQuotes, 'print("PRIORITY: MED KIT")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toContainText('in quotes', { timeout: 60000 });

  await setCode(page, 'm2_editor', [...LOOKUP, 'print("PRIORITY: MED KIT")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 60000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 5000 });
  await expect(page.locator('#szTitle')).toHaveText(/WARDEN/);
  await expect(page.locator('#szLogFull')).toContainText('heart rate climbs back');
  await expect(page.locator('#szQuote')).toContainText('HALE DID NOT SAY THAT');
  await expect(page.locator('#szQuote')).toContainText('YOU GAVE THE AIRLOCK BACK');
  await expect(page.locator('#szReadouts')).toContainText('NO MATCH');
  await expect(page.locator('#szReadouts')).toContainText('Unknown');
  await page.click('#szContinue');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ priority: 'pod1' });
  await expect(page.locator('#szCrewPods .crew-pod').nth(0)).not.toHaveClass(/dead|critical/);

  // Extension: keep looking until 0
  await expect(page.locator('#m2_ext_task')).toBeVisible();
  const loop = ['def menu():', '    print("CRYO POD LOOKUP")', '', 'def pod1():', '    print("Pod 1: Okafor")', '', 'def pod3():', '    print("Pod 3: Chen")', '',
    'def pod5():', '    print("Pod 5: Patel")', '', 'menu()', 'pod = ""', 'while pod != "0":', '    pod = input("Which pod? ")',
    '    if pod == "1":', '        pod1()', '    elif pod == "3":', '        pod3()', '    elif pod == "5":', '        pod5()', '    else:', '        print("No such pod")',
    'print("PRIORITY: MED KIT")'];
  await setCode(page, 'm2_editor', loop.join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 60000 });
  await expect(page.locator('#completionBanner')).toBeVisible();

  // Bonus: polygon(sides), in its own editor
  await expect(page.locator('#x_params')).toBeVisible();
  await expect(page.locator('#x_editor')).toHaveValue(/def square\(size\):/);
  const x = await page.locator('#x_editor').inputValue();
  await setCode(page, 'x_editor', x + '\ndef polygon(sides):\n    for i in range(sides):\n        t.forward(60)\n        t.left(360 / sides)\n\npolygon(5)\npolygon(8)');
  await page.click('#btn_check_x');
  await expect(page.locator('#fb_x')).toHaveClass(/pass/, { timeout: 60000 });
  await expect(page.locator('#fb_x')).toContainText('an octagon');
});
