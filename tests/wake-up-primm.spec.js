import { test, expect } from '@playwright/test';

// Y9 Python · L1 round 1 Wake Up (Station Zero, Chapter 1) — UI wiring only (checker permutations
// live in Y9/Python/L1_Python_Refresh/checkers_wakeup.test.js).
//   • The terminal situation report types itself, skips on click, and shows once.
//   • Two Investigate steps (prompt isn't stored · NameError bug step), two Modify steps.
//   • Make is checked by running with word answers and reading the output.

const PATH = '/Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html';
const KEY  = 'primm_y9_l1_wake_up';

// step=off shows each run at once instead of stepping through it, to keep the tests quick.
async function openAt(page, state = {}, { story = false, reducedMotion = 'reduce' } = {}) {
  await page.emulateMedia({ reducedMotion });
  await page.addInitScript(([k, s]) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }
  }, [KEY, state]);
  await page.goto(PATH + '?step=off' + (story ? '' : '&story=off'));
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

test('a report opens on its still, and the story only types in over it once it has dimmed', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 600 });
  await openAt(page, {}, { story: true, reducedMotion: 'no-preference' });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/);
  await expect(page.locator('#szPanel button[aria-label*="Close"]')).toHaveCount(0);
  await expect(page.locator('#szHero')).toHaveClass(/reveal/);
  await expect(page.locator('#szCamLabel')).toHaveText(/Ext cam/);
  // the still holds on its own first: no story yet
  await page.waitForTimeout(1000);
  await expect(page.locator('#szLogTyped')).toHaveText('');
  // then the story types in over it, at the top of the report
  await expect(page.locator('#szLogTyped')).toHaveText(await page.locator('#szLogFull').textContent(), { timeout: 10000 });
  await expect(page.locator('#szLog')).toBeInViewport();
  await expect(page.locator('#szContinue')).toBeFocused();
});

test('reduced motion shows the whole report at once', async ({ page }) => {
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szLogTyped')).toHaveText(await page.locator('#szLogFull').textContent());
  await expect(page.locator('#szSkipHint')).toBeHidden();
});

test("the live feed plays the student's own run output into the door", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });   // report taller than the screen
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, JSON.stringify(['intro', 'P'])), PATH);
  await openAt(page, { currentStage: 'R', completedStages: ['P'] }, { story: true });
  await page.click('#stage-R button:has-text("Run code")');
  await answerPrompts(page, 'r_editor', ['Sam', 'Pilot']);
  await expect(outputOf(page, 'r_editor')).toContainText('Checking in: Pilot Sam', { timeout: 30000 });
  await page.fill('#r1', 'It showed my job then my name');
  await page.click('#btn_check_run');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szImpact')).toBeVisible();
  // opens at the top (the still and the story), even though Continue at the bottom has focus
  expect(await page.locator('#szPanel').evaluate(p => p.scrollHeight > p.clientHeight && p.scrollTop === 0)).toBe(true);
  await expect(page.locator('#szContinue')).toBeFocused();
  await expect(page.locator('#szImpact .sz-feed-term .ln.hit')).toHaveText('Checking in: Pilot Sam');
  await expect(page.locator('#szImpact svg')).toContainText('Checking in: Pilot Sam');
  await page.click('#szContinue');
  // showMap() (no header button now) re-opens the report without replaying the feed
  await page.evaluate(() => window.StationZero.showMap());
  await expect(page.locator('#szImpact')).toBeHidden();
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
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'], radio_i_choice: 'silent' });
  await setCode(page, 'i_editor', STARTER.replace('Enter your job: ', 'What is your job? '));
  await expect(page.locator('#req_i_1 li:not(.req-note)').first()).toHaveClass(/req-pass/);
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['Sam', 'Pilot']);
  await expect(outputOf(page, 'i_editor')).toContainText('Checking in: Pilot Sam', { timeout: 30000 });
  await page.check('input[name="i1_mcq"][value="option_c"]');
  await page.click('#btn_check_i1');
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate 1: the voice comes first, then locks and is stored when the step passes', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'],
    i_editor: STARTER.replace('Enter your job: ', 'What is your job? '), radio_i1_mcq: 'option_c' });
  await expect(page.locator('#i1_task')).toBeHidden();
  await page.locator('#btn_check_i1').evaluate(b => { b.disabled = false; });
  await page.click('#btn_check_i1');
  await expect(page.locator('#qcard_i1')).toHaveClass(/error/);
  await expect(page.locator('#qcard_i2_prompt')).toBeHidden();

  await page.check('input[name="i_choice"][value="answer"]');
  await expect(page.locator('#i1_task')).toBeVisible();
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['Sam', 'Pilot']);
  await expect(outputOf(page, 'i_editor')).toContainText('Checking in: Pilot Sam', { timeout: 30000 });
  await page.click('#btn_check_i1');
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible({ timeout: 10000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ voice: 'answer' });
  await expect(page.locator('input[name="i_choice"][value="silent"]')).toBeDisabled();
  // the door choice remembers that it knows you're in here
  await expect(page.locator('#m1_choice_q')).toContainText('Hale’s voice says your name');
});

test('Investigate 1: the crisis report follows the voice choice', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P","R"]'), PATH);
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'], radio_i_choice: 'silent',
    i_editor: STARTER.replace('Enter your job: ', 'What is your job? '), radio_i1_mcq: 'option_c' }, { story: true });
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['Sam', 'Pilot']);
  await expect(outputOf(page, 'i_editor')).toContainText('Checking in: Pilot Sam', { timeout: 30000 });
  await page.click('#btn_check_i1');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/The voice/);
  await expect(page.locator('#szLogFull')).toContainText('working its way round the station');
  await expect(page.locator('#szReadouts')).toContainText('Location unknown');
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
  await page.click('#qcard_i2_prompt button:has-text("Break it")');
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

test('scrolled down, the pinned bug step shows only its requirements, without moving the page', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2,
    i_editor: STARTER.replace('Enter your job: ', 'Job? '), radio_i1_mcq: 'option_c' });
  const card = page.locator('#qcard_i2_prompt');
  await expect(card.locator('.q-label')).toBeVisible();
  const editorTop = () => page.locator('#stage-I .code-checker').evaluate(e => e.getBoundingClientRect().top + scrollY);
  const before = await editorTop();
  await page.locator('#qcard_i2').scrollIntoViewIfNeeded();
  await expect(page.locator('#i_steps')).toHaveClass(/is-stuck/);
  await expect(card.locator('.q-label')).toBeHidden();
  await expect(card.locator('li.req-note')).toBeHidden();
  await expect(card.locator('button:has-text("Break it")')).toBeVisible();
  await expect(card.locator('#req_i_2 li:not(.req-note)')).toHaveCount(2);
  expect(await editorTop()).toBeCloseTo(before, 0);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(page.locator('#i_steps')).not.toHaveClass(/is-stuck/);
  await expect(card.locator('.q-label')).toBeVisible();
});

// ─── Modify ──────────────────────────────────────────────────────────────────

test('Modify 1 is a choice: the requirement appears once chosen, only that line passes, then it locks', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] });
  await expect(page.locator('#m1_task_1')).toBeHidden();
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveText(/choice/);

  await page.check('input[name="m1_choice"][value="sealed"]');
  await expect(page.locator('#req_m1_1_text')).toContainText('Cryo Bay door: SEALED');
  await setCode(page, 'm1_editor', STARTER.replace('Door unlocking...', 'Cryo Bay door: OPEN'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/fail/, { timeout: 30000 });
  await expect(page.locator('#fb_m1')).toContainText('SEALED');

  await setCode(page, 'm1_editor', STARTER.replace('Door unlocking...', 'Cryo Bay door: SEALED'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('input[name="m1_choice"][value="open"]')).toBeDisabled();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ door: 'sealed' });
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });
  // the choice is saved with the rest of the work
  await page.reload();
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
  await page.click('#btn_back_M1');
  await expect(page.locator('input[name="m1_choice"][value="sealed"]')).toBeChecked();
  await expect(page.locator('#m1_choice')).toHaveClass(/locked/);
});

test('the door choice plays its report as soon as Modification 1 passes, then on to Modification 2', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, JSON.stringify(['intro', 'P', 'R', 'I1', 'I'])), PATH);
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], radio_m1_choice: 'open' }, { story: true });
  await setCode(page, 'm1_editor', STARTER.replace('Door unlocking...', 'Cryo Bay door: OPEN'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/Something got in/);
  await expect(page.locator('#szImpact svg')).toContainText('Cryo Bay door: OPEN');
  await expect(page.locator('#szImpact svg')).toContainText('Checking in:');   // whoever the check typed in
  await expect(page.locator('#szReadouts')).toContainText('Cryo Bay');
  await expect(page.locator('#szContinue')).toHaveText('Onwards to Modification 2 →');
  await page.click('#szContinue');
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });
});

test('Modify: door message, pod line, own question, then two answers on one line', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] });
  await page.check('input[name="m1_choice"][value="open"]');
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

test('a second Check in the pause after a pass never skips the next modification', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] });
  await page.check('input[name="m1_choice"][value="open"]');
  await setCode(page, 'm1_editor', STARTER.replace('Door unlocking...', 'Cryo Bay door: OPEN'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#btn_check_m1')).toBeDisabled();
  // A click that beat the disable: the same modification passes again, but must not advance twice.
  await page.evaluate(() => window.checkMod());
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2500);
  await expect(page.locator('#m1_step_2')).toBeVisible();
  await expect(page.locator('#m1_step_3')).toBeHidden();
  await expect(page.locator('#btn_check_m1')).toBeEnabled();
});

test("Make's toolkit shows the student's own finished Modify program and a cheat sheet", async ({ page }) => {
  const modCode = STARTER + '\npod = input("Pod number: ")\nprint("Pod: " + pod)';
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'], m1CodeSnapshots: { 3: 'old', 4: modCode } });
  await page.click('#stage-M2 .toolkit summary:has-text("Your Modify program")');
  await expect(page.locator('#m2_mod_code')).toHaveText(modCode);
  await page.click('#stage-M2 .toolkit summary:has-text("Cheat sheet")');
  await expect(page.locator('#stage-M2 .toolkit')).toContainText('print("You chose " + food)');
});

// ─── Make → Life Support link + extension ────────────────────────────────────

test('Make shows the link on to Life Support, and the extension completes the activity', async ({ page }) => {
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] });
  const make = [
    'name = input("Crew member: ")',
    'room = input("Last seen in: ")',
    'print("CREW LOCATOR")',
    'print("Crew member: " + name)',
    'print("Last seen in: " + room)',
    'print("LOCK: CRYO BAY DOOR")',
  ];
  await setCode(page, 'm2_editor', make.join('\n'));
  // the second Station Zero call comes first
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveText(/call/);
  await page.check('input[name="m2_choice"][value="bay"]');
  await expect(page.locator('#req_m2_choice_text')).toContainText('LOCK: CRYO BAY DOOR');
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('sz_choices')))).toMatchObject({ lock: 'bay' });
  await expect(page.locator('#m2_ext_task')).toBeVisible();
  await expect(page.locator('#completionBanner')).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/chapter-done/);
  // the link keeps the query string (?story=off here; ?courseId=… in Classroom)
  await expect(page.locator('#nextActivityLink')).toHaveAttribute('href', '2_Life_Support_PRIMM.html?step=off&story=off');

  await setCode(page, 'm2_editor', [...make, 'status = input("Status: ")', 'print(name + " is " + status + " in " + room)'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#req_m2_ext li')).toHaveClass([/req-pass/, /req-pass/]);
});

// ─── Make: the second Station Zero call ──────────────────────────────────────

test('the Make call repeats the fact from the last report that it turns on', async ({ page }) => {
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'], radio_m1_choice: 'sealed' });
  await expect(page.locator('#m2_choice_report')).toContainText('Nothing got in');
  await page.check('input[name="m2_choice"][value="pod5"]');
  await expect(page.locator('#req_m2_choice_text')).toContainText('LOCK: POD 5 SHIELD');
});

// Door opened, then the bay locked: it's shut in with the crew. The cliffhanger says so.
test('the cliffhanger follows both calls', async ({ page }) => {
  await page.addInitScript(p => {
    localStorage.setItem('sz_story_' + p, JSON.stringify(['intro', 'P', 'R', 'I', 'M1']));
    localStorage.setItem('sz_choices', JSON.stringify({ door: 'open' }));
  }, PATH);
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'], radio_m1_choice: 'open' }, { story: true });
  await expect(page.locator('#m2_choice_report')).toContainText('Pod 5');
  await page.check('input[name="m2_choice"][value="bay"]');
  await setCode(page, 'm2_editor', [
    'name = input("Crew member: ")',
    'room = input("Last seen in: ")',
    'print(name + " was last seen in " + room)',
    'print("LOCK: CRYO BAY DOOR")',
  ].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szTitle')).toHaveText(/Crew tag: HALE/);
  await expect(page.locator('#szReadouts')).toContainText('Critical');
  await expect(page.locator('#szReadouts')).toContainText('Not human');
  await expect(page.locator('input[name="m2_choice"][value="pod5"]')).toBeDisabled();
});
