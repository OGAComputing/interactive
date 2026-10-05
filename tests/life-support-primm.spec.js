import { test, expect } from '@playwright/test';

// Y9 Python · L1 round 2 Life Support (Station Zero, Chapter 1 part 2) — UI wiring only (checker
// permutations live in Y9/Python/L1_Python_Refresh/checkers_life_support.test.js).
//   • Station Zero situation reports: once each, dismissable, suppressed by ?story=off.
//   • Run / Investigate use live input typed into the output panel.
//   • Modify / Make are checked by running with fixed test answers and reading the output.

const PATH = '/Y9/Python/L1_Python_Refresh/2_Life_Support_PRIMM.html';
const KEY  = 'primm_y9_l1_life_support';

async function openAt(page, state = {}, { story = false } = {}) {
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
  'hours = int(input("Hours until rescue: "))',
  'oxygen = hours * 50',
  'print("Engineer " + name + " is awake.")',
  'print("Oxygen needed in litres:")',
  'print(oxygen)',
].join('\n');

// ─── Story layer ─────────────────────────────────────────────────────────────

test('chapter title card shows once on first visit and closes with Continue', async ({ page }) => {
  await openAt(page, {}, { story: true });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/);
  await expect(page.locator('#szTitle')).toHaveText(/Chapter 1/);
  await expect(page.locator('#szObjective')).toContainText('Restore life support');
  await page.click('#szContinue');
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
  await page.reload();
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
  // the map button re-opens the latest report in review mode
  await page.click('.btn-map');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/);
  await expect(page.locator('#szContinue')).toHaveText('Back to the task');
  await page.keyboard.press('Escape');
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
});

test('?story=off stops reports popping up', async ({ page }) => {
  await openAt(page);
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
});

// ─── Predict → Run ───────────────────────────────────────────────────────────

test('Predict: three correct answers move to Run, with a situation report between', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro"]'), PATH);
  await openAt(page, {}, { story: true });
  await page.check('input[name="p_mcq1"][value="option_b"]');
  await page.click('#btn_check_p_mcq1');
  await expect(page.locator('#qcard_p_mcq2')).toBeVisible({ timeout: 5000 });
  await page.check('input[name="p_mcq2"][value="option_b"]');
  await page.click('#btn_check_p_mcq2');
  await expect(page.locator('#qcard_p_text1')).toBeVisible({ timeout: 5000 });
  await page.fill('#p_text1', '300');
  await page.click('#btn_check_p_text1');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 5000 });
  await expect(page.locator('#szTitle')).toHaveText(/vents/i);
  await expect(page.locator('#szContinue')).toHaveText(/Run/);
  await page.click('#szContinue');
  await expect(page.locator('#stage-R')).toHaveClass(/active/);
});

test('Run: the student types their own answers live and sees 300', async ({ page }) => {
  await openAt(page, { currentStage: 'R', completedStages: ['P'] });
  await page.click('#stage-R button:has-text("Run code")');
  await answerPrompts(page, 'r_editor', ['Sam', '6']);
  await expect(outputOf(page, 'r_editor')).toContainText('Engineer Sam is awake.', { timeout: 30000 });
  await expect(outputOf(page, 'r_editor')).toContainText('300');
});

test("the live feed plays the student's own run output into the recycler", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });   // report taller than the screen
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, JSON.stringify(['intro', 'P'])), PATH);
  await openAt(page, { currentStage: 'R', completedStages: ['P'] }, { story: true });
  await page.click('#stage-R button:has-text("Run code")');
  await answerPrompts(page, 'r_editor', ['Sam', '7']);
  await expect(outputOf(page, 'r_editor')).toContainText('350', { timeout: 30000 });
  await page.fill('#r1', 'It showed 350 because I typed 7');
  await page.click('#btn_check_run');
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 10000 });
  await expect(page.locator('#szImpact')).toBeVisible();
  expect(await page.locator('#szPanel').evaluate(p => p.scrollHeight > p.clientHeight && p.scrollTop === 0)).toBe(true);
  await expect(page.locator('#szContinue')).toBeFocused();
  await expect(page.locator('#szImpact .sz-feed-term .ln.hit')).toHaveText('350');
  await expect(page.locator('#szImpact svg')).toContainText('O2 NEEDED: 350 L');
  await expect(page.locator('#szImpact .sz-impact-cap')).toContainText('350 litres');
  await page.click('#szContinue');
  await page.click('.btn-map');
  await expect(page.locator('#szImpact')).toBeHidden();
});

// ─── Investigate ─────────────────────────────────────────────────────────────

test('Investigate step 1 is gated until int() is deleted; then the 6 is repeated as text', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] });
  await expect(page.locator('#req_i_1 li:not(.req-note)').first()).not.toHaveClass(/req-pass/);
  await setCode(page, 'i_editor', STARTER.replace('int(input("Hours until rescue: "))', 'input("Hours until rescue: ")'));
  await expect(page.locator('#req_i_1 li:not(.req-note)').first()).toHaveClass(/req-pass/);
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['Sam', '6']);
  await expect(outputOf(page, 'i_editor')).toContainText('6'.repeat(50), { timeout: 30000 });
  await page.fill('#i1', 'It repeated the 6 fifty times because it was text');
  await page.click('#btn_check_i1');
  await expect(page.locator('#qcard_i2_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate step 2: with int() back, print(hours + 1) adds', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'], stepI: 2, maxStepI: 2, i_editor: STARTER,
    i1: 'It repeated the text 6 fifty times because it was a string' });
  await expect(page.locator('#req_i_2 li:not(.req-note)')).toHaveClass([/req-pass/, /^(?!.*req-pass)/]);
  await setCode(page, 'i_editor', STARTER + '\nprint(hours + 1)');
  await expect(page.locator('#req_i_2 li:not(.req-note)')).toHaveClass([/req-pass/, /req-pass/]);
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['Sam', '6']);
  await expect(outputOf(page, 'i_editor')).toContainText('300\n7', { timeout: 30000 });
  await page.check('input[name="i2_mcq"][value="option_b"]');
  await page.click('#btn_check_i2');
  await expect(page.locator('#qcard_i3_prompt')).toBeVisible({ timeout: 10000 });
});

test('Investigate bug step: Break it gives a TypeError; fixing with str() completes Investigate', async ({ page }) => {
  // tryCompleteInvestigate re-checks every step's answer, so seed steps 1–2 as answered
  await openAt(page, {
    currentStage: 'I', completedStages: ['P', 'R'], stepI: 3, maxStepI: 3, i_editor: STARTER,
    i1: 'It repeated the text 6 fifty times because it was a string', radio_i2_mcq: 'option_b',
  });
  await page.click('#qcard_i3 button:has-text("Break it")');
  await answerPrompts(page, 'i_editor', ['Sam', '6']);
  await expect(page.locator('#i_fb_run')).toContainText('TypeError', { timeout: 30000 });

  await setCode(page, 'i_editor', STARTER + '\nprint("Oxygen per hour: " + str(50))');
  await page.click('#stage-I button:has-text("Run code")');
  await answerPrompts(page, 'i_editor', ['Sam', '6']);
  await expect(page.locator('#i_fb_run')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#req_i_3 li:not(.req-note)')).toHaveClass([/req-pass/, /req-pass/]);
  await page.check('input[name="i3_mcq"][value="option_b"]');
  await page.click('#btn_check_i3');
  await expect(page.locator('#stage-M1')).toHaveClass(/active/, { timeout: 10000 });
  await expect(page.locator('#m1_editor')).not.toHaveValue(/Oxygen per hour/);
});

// ─── Modify ──────────────────────────────────────────────────────────────────

test('Modify 1 passes on the output (rate 60 → 360) and a wrong rate fails', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] });
  await setCode(page, 'm1_editor', STARTER.replace('* 50', '* 70'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/fail/, { timeout: 30000 });
  await expect(page.locator('#req_m1_1 li').first()).toHaveClass(/req-fail/);

  await setCode(page, 'm1_editor', STARTER.replace('* 50', '* 60'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#m1_step_2')).toBeVisible({ timeout: 10000 });
});

test('Modify 4: the crew total in a str() sentence passes', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'], stepM1: 4, maxStepM1: 4 });
  await setCode(page, 'm1_editor', [
    STARTER.replace('* 50', '* 60'),
    'crew = int(input("Crew awake: "))',
    'print(crew)',
    'total = hours * crew * 60',
    'print("Total oxygen: " + str(total) + " litres")',
  ].join('\n'));
  await page.click('#btn_check_m1');
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 30000 });
});

// ─── Make → cliffhanger → extension ─────────────────────────────────────────

test('Make passes, plays the cliffhanger once, and the extension completes the chapter', async ({ page }) => {
  await page.addInitScript(p => localStorage.setItem('sz_story_' + p, '["intro","P","R","I","M1"]'), PATH);
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] }, { story: true });
  const make = [
    'cans = int(input("Oxygen canisters: "))',
    'packs = int(input("Ration packs: "))',
    'air = cans * 8',
    'print("SUPPLY MANIFEST")',
    'print("Oxygen lasts " + str(air) + " hours")',
    'print("Ration packs: " + str(packs))',
  ];
  await setCode(page, 'm2_editor', make.join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#szOverlay')).toHaveClass(/open/, { timeout: 5000 });
  await expect(page.locator('#szTitle')).toHaveText(/Life support online/i);
  await expect(page.locator('#szImpact svg')).toContainText('SENSOR OPS: CREW TAG HALE');
  await page.click('#szContinue');
  await expect(page.locator('#m2_ext_task')).toBeVisible();

  await setCode(page, 'm2_editor', [...make,
    'cells = int(input("Battery cells: "))',
    'print("Canisters: " + str(cans) + ", cells: " + str(cells))'].join('\n'));
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 30000 });
  await expect(page.locator('#completionBanner')).toBeVisible();
  await expect(page.locator('#szOverlay')).not.toHaveClass(/open/);
});
