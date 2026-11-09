import { test, expect } from '@playwright/test';

// Y9 Python · L4 Distress Signal (Station Zero, Chapter 4: for loops with turtle) — UI wiring
// only (checker permutations live in Y9/Python/L4_For_Loops/checkers.test.js).
//   • Predict: the while/for pair, then the beacon program, revealed question by question.
//   • Every run draws on the turtle screen under the editor (turtle-canvas.js).
//   • Investigate's bug step is a logic error: the turn moved out of the loop, no error message.
//   • Modify / Make are checked by running the program and reading what the turtle drew.
//   • The story follows Locked In's ending and this chapter's choices: fuel (the crisis), signal
//     (Modify 1) and flare (Make). An unfixed countdown is fatal (2026-11-04).

const PATH = '/Y9/Python/L4_For_Loops/1_Distress_Signal_PRIMM.html';
const KEY  = 'primm_y9_l4_distress_signal';

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
const screenNote = (page, editorId) => checker(page, editorId).locator('.turtle-screen .ts-note');
const run = (page, stage) => page.click(`#stage-${stage} button:has-text("Run code")`);

const poly = (n, turn = 360 / n, extra = []) => ['import turtle', 't = turtle.Turtle()', ...extra,
  `for i in range(${n}):`, '    t.forward(100)', `    t.left(${turn})`];
const STARTER = poly(4, 90).join('\n');
const TRIANGLE = ['import turtle', 't = turtle.Turtle()', 'for i in range(1, 4):', '    t.forward(100)', '    t.left(120)', '    print(i)'].join('\n');

// ─── Story layer ─────────────────────────────────────────────────────────────

test('chapter title card shows once, with a two-bullet recap; ?story=off stops it', async ({ page }) => {
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/);
  await expect(page.locator('#szTitle')).toHaveText(/Chapter 4/);
  await expect(page.locator('#szObjective')).toContainText('rescue ship');
  await expect(page.locator('#szPrevTyped .sz-prev-li')).toHaveCount(2);
  await expect(page.locator('#szPrevFull')).toContainText('WARDEN held it shut');
  await expect(page.locator('#szReadouts')).toContainText('No contact');
  await expect(page.locator('#szReadouts')).toContainText('4 of 5');
  await page.click('#szContinue');
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
  await page.reload();
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
});

test('the recap follows Locked In: injured at the airlock (seals never handed to WARDEN)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sz_choices', JSON.stringify({ heat: 'cryo', airlock: 'warden' })));
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szPrevFull')).toContainText('caught your arm');
  await expect(page.locator('#szReadouts')).toContainText('Injured');
  await expect(page.locator('#szCrewPods .crew-pod').nth(3)).toHaveClass(/injured/);
});

test('the recap follows Locked In: the heaters burnt out, so the crew in cryo are at risk', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sz_choices', JSON.stringify({ heat: 'fast', seals: 'override' })));
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szPrevFull')).toContainText('heaters burnt out');
  for (const i of [0, 2, 4]) await expect(page.locator('#szCrewPods .crew-pod').nth(i)).toHaveClass(/risk/);
});

test('the recap follows Proximity: X died on its bad path', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sz_choices', JSON.stringify({ shield: 'pod3', lockdown: 'sensors', power: 'sensors' })));
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szPrevFull')).toContainText('Patel died');
  await expect(page.locator('#szReadouts')).toContainText('3 of 5');
});

// An unfixed danger is fatal (2026-11-04): only a fast ship beats the countdown.
async function crewAfter(page, seen, choices) {
  await page.addInitScript(([p, s, c]) => {
    localStorage.setItem('sz_story_' + p, JSON.stringify(s));
    localStorage.setItem('sz_choices', JSON.stringify(c));
  }, [PATH, seen, choices]);
  await page.goto(PATH + '?step=off&story=off');
  return page.locator('#szCrewPods .crew-pod');
}
const ALL_SEEN = ['intro', 'P', 'R', 'I1', 'I', 'M1', 'M2'];

test('holding the orbit with QUARANTINE and Make never reached: the pod you saved runs out', async ({ page }) => {
  const pods = await crewAfter(page, ALL_SEEN, { shield: 'pod5', lockdown: 'cryo', fuel: 'orbit', signal: 'quarantine' });
  await expect(pods.nth(4)).toHaveClass(/dead/);
});

test('one death at a time: Proximity lost Chen, so the slow ship leaves Patel injured, not dead', async ({ page }) => {
  const pods = await crewAfter(page, ALL_SEEN, { shield: 'pod5', lockdown: 'sensors', power: 'sensors', fuel: 'orbit', signal: 'quarantine' });
  await expect(pods.nth(2)).toHaveClass(/dead/);
  await expect(pods.nth(4)).toHaveClass(/injured/);
  await expect(pods.nth(4)).not.toHaveClass(/dead/);
  await expect(page.locator('#szCrewCount')).toHaveText('3/5');
});

test('keeping the pods powered with a slow ship: the station clips the storm and you are injured', async ({ page }) => {
  const pods = await crewAfter(page, ALL_SEEN, { fuel: 'pods', signal: 'quarantine', flare: 'warning' });
  await expect(pods.nth(3)).toHaveClass(/injured/);
});

test('a fast ship beats the countdown: MAYDAY with no flare yet still saves the pod', async ({ page }) => {
  const pods = await crewAfter(page, ALL_SEEN, { shield: 'pod3', fuel: 'orbit', signal: 'mayday' });
  await expect(pods.nth(2)).not.toHaveClass(/dead|critical/);
});

test('before the cliffhanger, the saved crew member is critical on the orbit path', async ({ page }) => {
  const pods = await crewAfter(page, ['intro', 'P', 'R', 'I1'], { shield: 'pod5', fuel: 'orbit' });
  await expect(pods.nth(4)).toHaveClass(/critical/);
});

// ─── Predict ─────────────────────────────────────────────────────────────────

test('Predict: one program; the loop label and "How for works" appear after two attempts', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro"]'), PATH);
  await openAt(page, {}, { story: true });
  await expect(page.locator('#stage-P .annotated-code')).toHaveCount(1);
  await expect(page.locator('#stage-P .recipe')).toBeHidden();
  for (const [q, v] of [['p_mcq1', 'option_c'], ['p_mcq2', 'option_b']]) {
    await page.check(`input[name="${q}"][value="${v}"]`);
    await page.click('#btn_check_' + q);
    await expect(page.locator('#fb_' + q)).toHaveClass(/pass/);
  }
  await expect(page.locator('#qcard_p_mcq3')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#stage-P .recipe')).toContainText('How for works');
  for (const [q, v] of [['p_mcq3', 'option_a'], ['p_mcq4', 'option_d']]) {
    await page.check(`input[name="${q}"][value="${v}"]`);
    await page.click('#btn_check_' + q);
    await expect(page.locator('#fb_' + q)).toHaveClass(/pass/);
  }
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 5000 });
  await expect(page.locator('#szTitle')).toHaveText(/Signal code/);
  await expect(page.locator('#szImpact svg')).toContainText('SIMULATION');
  await expect(page.locator('#szImpact')).toContainText('4 SIDES');
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

test('Run: the turtle draws the square; three runs, each followed by a question', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P"]'), PATH);
  await openAt(page, { currentStage: 'R', completedStages: ['P'] }, { story: true });
  const opt = (k, v) => page.locator(`input[name="rc_${k}"][value="${v}"]`);
  await expect(opt(0, 0)).toBeDisabled();
  await run(page, 'R');
  await expect(screenNote(page, 'r_editor')).toContainText('4 lines drawn', { timeout: 30000 });
  // no print or input: the display takes the console's place
  await expect(checker(page, 'r_editor').locator('.output-panel .turtle-screen')).toBeVisible();
  await expect(checker(page, 'r_editor').locator('.output-content')).toBeHidden();
  await expect(opt(0, 0)).toBeEnabled();
  await opt(0, 1).click();
  await expect(page.locator('#r_chain .mcq-fb.fail')).toContainText('count the sides');
  await expect(opt(0, 0)).toBeDisabled();
  for (let k = 0; k < 3; k++) {
    await run(page, 'R');
    await expect(opt(k, 0)).toBeEnabled({ timeout: 30000 });
    await opt(k, 0).click();
    if (k < 2) await expect(page.locator('#r_chain')).toContainText(`Run ${k + 2} of 3`, { timeout: 10000 });
  }
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 15000 });
  await expect(page.locator('#szTitle')).toHaveText(/Transmitting/);
  await expect(page.locator('#szImpact svg')).toContainText('BEACON · TRANSMITTING');
  await expect(page.locator('#szImpact')).toContainText('4 SIDES');
});

// ─── Investigate ─────────────────────────────────────────────────────────────

test('Investigate 1: the crisis pick comes first; range(8) goes round the square twice', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P","R"]'), PATH);
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] }, { story: true });
  await expect(page.locator('#i1_task')).toBeHidden();
  await page.check('input[name="i_choice"][value="orbit"]');
  await expect(page.locator('#i1_task')).toBeVisible();
  await setCode(page, 'i_editor', STARTER.replace('range(4)', 'range(8)'));
  await expect(page.locator('#req_i_1 li').nth(0)).toHaveClass(/req-pass/);
  await run(page, 'I');
  await expect(screenNote(page, 'i_editor')).toContainText('8 lines drawn', { timeout: 30000 });
  await expect(page.locator('#req_i_1 li')).toHaveClass([/req-pass/, /req-pass/]);
  await page.check('input[name="i1_mcq"][value="option_b"]');
  await page.click('#btn_check_i1');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/Countdown/);
  await expect(page.locator('#szReadouts')).toContainText('Pod 5 reserve');
  await page.click('#szContinue');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ fuel: 'orbit' });
  await expect(page.locator('input[name="i_choice"][value="pods"]')).toBeDisabled();
  await expect(page.locator('#szCrewPods .crew-pod').nth(4)).toHaveClass(/critical/);
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible();
});

// The shape question chain, drawn in a fixed order: the first variant of each slot, options
// unshuffled, so option value 0 is always the right answer.
const FIXED_I2_CHAIN = { pick: [0, 0, 0], order: Array(3).fill([0, 1, 2, 3]), q: 0, done: false };

test('Investigate 2: the triangle, then four shape questions in a row', async ({ page }) => {
  const STEP1 = STARTER.replace('range(4)', 'range(8)');
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2, radio_i_choice: 'pods',
    iCodeSnapshots: { 1: STEP1 }, i_editor: STEP1, i2Chain: FIXED_I2_CHAIN,
  });
  await setCode(page, 'i_editor', poly(3, 120).join('\n'));
  await expect(page.locator('input[name="i2c_0"]').first()).toBeDisabled();
  await run(page, 'I');
  await expect(screenNote(page, 'i_editor')).toContainText('3 lines drawn', { timeout: 30000 });
  await expect(page.locator('#req_i_2 li')).toHaveClass([/req-pass/, /req-pass/, /req-pass/]);
  for (let slot = 0; slot < 3; slot++) {
    await page.check(`input[name="i2c_${slot}"][value="0"]`);
    await expect(page.locator('#fb_i2c_' + slot)).toHaveClass(/pass/);
  }
  await expect(page.locator('#qcard_i3_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate bug step: Break it draws a straight line with no error; the turn back in the loop completes Investigate', async ({ page }) => {
  test.setTimeout(120000);
  // tryCompleteInvestigate re-checks every step's answer, so seed steps 1–3 as answered
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 4, maxStepI: 4, radio_i_choice: 'orbit',
    i_editor: TRIANGLE, radio_i1_mcq: 'option_b', i2Chain: { ...FIXED_I2_CHAIN, q: 2, done: true }, radio_i3_mcq: 'option_c',
  });
  await page.click('#qcard_i4_prompt button:has-text("Break it")');
  await expect(page.locator('#i_editor')).toHaveValue(/print\(i\)\nt\.left\(120\)$/);
  await expect(page.locator('#ibug_line')).toHaveText('6');
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(screenNote(page, 'i_editor')).toContainText('3 lines drawn');
  // print(i) from step 3: the console stays and the display sits under the editor row
  await expect(checker(page, 'i_editor').locator('.output-content')).toContainText('1');
  await expect(checker(page, 'i_editor').locator('.output-panel .turtle-screen')).toHaveCount(0);
  await expect(checker(page, 'i_editor').locator('.editor-wrap + .turtle-screen')).toBeVisible();
  await expect(page.locator('#req_i_4 li')).toHaveClass([/req-pass/, /req-pass/, /./]);

  await setCode(page, 'i_editor', TRIANGLE);
  await run(page, 'I');
  await expect(page.locator('#req_i_4 li')).toHaveClass([/req-pass/, /req-pass/, /req-pass/], { timeout: 30000 });
  await page.check('input[name="i4_mcq"][value="option_c"]');
  await page.click('#btn_check_i4');
  await expect(page.locator('#stage-M1')).toHaveClass(/active/, { timeout: 10000 });
  await expect(page.locator('#m1_editor')).toHaveValue(STARTER);
});

// ─── Modify ──────────────────────────────────────────────────────────────────

test('Modify 1: the square fails and says so; the MAYDAY hexagon passes and plays the reply', async ({ page }) => {
  await page.addInitScript(p => {
    localStorage.setItem('sz_story_' + p, JSON.stringify(['intro', 'P', 'R', 'I1', 'I']));
    localStorage.setItem('sz_choices', JSON.stringify({ fuel: 'pods' }));
  }, PATH);
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] }, { story: true });
  await expect(page.locator('#m1_task_1')).toBeHidden();
  await page.check('input[name="m1_choice"][value="mayday"]');
  await expect(page.locator('#req_m1_1_text')).toContainText('range(6)');

  await setCode(page, 'm1_editor', STARTER);
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('drew a square', { timeout: 30000 });

  await setCode(page, 'm1_editor', poly(6, 60).join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/Someone heard/);
  await expect(page.locator('#szQuote')).toContainText('ETA 1 day');
  await expect(page.locator('#szReadouts')).toContainText('Orbit');
  await expect(page.locator('#szImpact')).toContainText('6 SIDES');
  await page.click('#szContinue');
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ signal: 'mayday' });
  await expect(page.locator('#m1_mod2_n')).toHaveText('6');
  await expect(page.locator('#m2_choice_report')).toContainText('ETA 1 day');
  await expect(page.locator('#m2_choice_report')).toContainText('orbit');
});

test('Modify 2: red and thick passes; a misspelt colour is a TurtleGraphicsError', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 2, maxStepM1: 2, radio_m1_choice: 'quarantine',
    passedChecks: { m1_code1: true }, m1CodeSnapshots: { 1: poly(8, 45).join('\n') } });
  // The given code is the task's first requirement: each NEW line ticks as it's typed.
  await expect(page.locator('#m1_mod2_code_count')).toHaveText('0 of 2 added');
  await setCode(page, 'm1_editor', poly(8, 45, ['t.pencolor("rde")', 't.pensize(3)']).join('\n'));
  await expect(page.locator('#req_m1_2 #m1_mod2_code [data-line]')).toHaveClass([/^(?!.*added)/, /added/]);
  await expect(page.locator('#m1_mod2_code_count')).toHaveText('1 of 2 added');
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('bad color string', { timeout: 30000 });

  await setCode(page, 'm1_editor', poly(8, 45, ['t.pencolor("red")', 't.pensize(3)']).join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_3')).toBeVisible({ timeout: 10000 });
});

test('Modify 4: the number of sides from int(input()) passes; a fixed shape does not', async ({ page }) => {
  test.setTimeout(90000);
  const base = [...poly(8, 45, ['t.pencolor("red")', 't.pensize(3)']), 'for i in range(5):', '    t.forward(100)', '    t.left(72)'];
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 4, maxStepM1: 4, radio_m1_choice: 'quarantine',
    passedChecks: { m1_code1: true, m1_code2: true, m1_code3: true } });
  await setCode(page, 'm1_editor', [...base, 'sides = int(input("How many sides? "))', 'for i in range(7):', '    t.forward(60)', '    t.left(360 / 7)'].join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toContainText('With 3 typed', { timeout: 30000 });

  await setCode(page, 'm1_editor', [...base, 'sides = int(input("How many sides? "))', 'for i in range(sides):', '    t.forward(60)', '    t.left(360 / sides)'].join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
});

// ─── Make ────────────────────────────────────────────────────────────────────

const FLARE = ['import turtle', 't = turtle.Turtle()', 'colour = input("Flare colour? ")', 't.pencolor(colour)',
  'for i in range(5):', '    t.forward(80)', '    t.left(72)'];

test('Make: a fixed colour fails; QUARANTINE + warning flare is slow, so the saved pod is lost; then the extension', async ({ page }) => {
  test.setTimeout(120000);
  await page.addInitScript(p => {
    localStorage.setItem('sz_story_' + p, '["intro","P","R","I1","I","M1"]');
    localStorage.setItem('sz_choices', JSON.stringify({ shield: 'pod5', lockdown: 'cryo', fuel: 'orbit', signal: 'quarantine' }));
  }, PATH);
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] }, { story: true });
  await expect(page.locator('#m2_editor')).toHaveValue(/^import turtle\nt = turtle\.Turtle\(\)/);
  await expect(page.locator('#m2_choice_report')).toContainText('ETA 3 days');
  await expect(page.locator('#m2_choice_report')).toContainText('Patel has 1 day 16 h');
  await page.check('input[name="m2_choice"][value="warning"]');
  await expect(page.locator('#req_m2_choice_text')).toContainText('FLARE: BIOHAZARD');

  const fixed = FLARE.map(l => (l === 't.pencolor(colour)' ? 't.pencolor("red")' : l));
  await setCode(page, 'm2_editor', [...fixed, 'print("FLARE: BIOHAZARD")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toContainText('With green typed', { timeout: 60000 });

  await setCode(page, 'm2_editor', [...FLARE, 'print("FLARE: BIOHAZARD")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 60000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 5000 });
  await expect(page.locator('#szTitle')).toHaveText(/Two life signs/);
  await expect(page.locator('#szLogFull')).toContainText('heart monitor goes flat');
  await expect(page.locator('#szQuote')).toContainText('two life signs');
  await expect(page.locator('#szReadouts')).toContainText('Lost');
  await expect(page.locator('#szImpact svg')).toContainText('FLARE · BIOHAZARD');
  await page.click('#szContinue');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ flare: 'warning' });
  await expect(page.locator('#szCrewPods .crew-pod').nth(4)).toHaveClass(/dead/);

  await expect(page.locator('#m2_ext_task')).toBeVisible();
  await setCode(page, 'm2_editor', [...FLARE, 'for i in range(40):', '    t.forward(i + 5)', '    t.left(91)', 'print("FLARE: BIOHAZARD")'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 60000 });
  await expect(page.locator('#completionBanner')).toBeVisible();
});
