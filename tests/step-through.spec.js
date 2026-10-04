import { test, expect } from '@playwright/test';

// Step-through Run (code-editor.js `stepThrough`, trialled in the Y9 Station Zero lessons):
// Run replays the program a line at a time, lighting the running line and printing that
// line's output as it goes. Exercised through Life Support's Run and Investigate editors.

const PATH = '/Y9/Python/L1_Python_Refresh/2_Life_Support_PRIMM.html';
const KEY  = 'primm_y9_l1_life_support';

async function openAt(page, state = {}, query = '?story=off') {
  await page.addInitScript(([k, s]) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }
  }, [KEY, state]);
  await page.goto(PATH + query);
  await expect(page.locator('#pyStatusText')).toHaveText(/ready/, { timeout: 60000 });
}

async function setCode(page, id, src) {
  await page.locator('#' + id).evaluate((ta, v) => { ta.value = v; ta.dispatchEvent(new Event('input')); }, src);
}

const checker = (page, id) => page.locator('#' + id).locator('xpath=ancestor::div[contains(@class,"code-checker")]');
const litLine = (page, id) => checker(page, id).locator('.line-nums .exec-num');

test('Run lights each line in turn, waits on the input line, and prints output as it goes', async ({ page }) => {
  await openAt(page, { currentStage: 'R', completedStages: ['P'] });
  const r = checker(page, 'r_editor');
  await page.click('#stage-R button:has-text("Run code")');

  // Line 1 is the first input(): it stays lit while the student answers.
  await expect(r.locator('.output-input-field')).toBeVisible({ timeout: 30000 });
  await expect(litLine(page, 'r_editor')).toHaveText('1');
  await expect(r.locator('.exec-line')).toBeVisible();
  await r.locator('.output-input-field').fill('Sam');
  await r.locator('.output-input-field').press('Enter');

  await expect(litLine(page, 'r_editor')).toHaveText('2', { timeout: 5000 });
  await r.locator('.output-input-field').fill('6');
  await r.locator('.output-input-field').press('Enter');

  // Line 4 prints the name before line 6 prints the oxygen.
  await expect(litLine(page, 'r_editor')).toHaveText('4', { timeout: 5000 });
  await expect(r.locator('.output-content')).toContainText('Engineer Sam is awake.', { timeout: 2000 });
  await expect(r.locator('.output-content')).not.toContainText('300');
  await expect(litLine(page, 'r_editor')).toHaveText('6', { timeout: 5000 });
  await expect(r.locator('.output-content')).toContainText('300', { timeout: 2000 });

  // Finished: the bar and status row go, and the run reports success.
  await expect(r.locator('.exec-line')).toBeHidden({ timeout: 5000 });
  await expect(r.locator('.step-status')).toBeHidden();
  await expect(page.locator('#r_fb_run')).toHaveClass(/pass/);
});

test('Skip jumps a long loop straight to the end', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] });
  await setCode(page, 'i_editor', 'for i in range(20):\n    print(i)\nprint("done")');
  const i = checker(page, 'i_editor');
  await page.click('#stage-I button:has-text("Run code")');
  await expect(litLine(page, 'i_editor')).toHaveText('2', { timeout: 30000 });
  await expect(i.locator('.output-content')).not.toContainText('done');
  await i.locator('.step-skip').click();
  await expect(i.locator('.output-content')).toContainText('19\ndone', { timeout: 2000 });
  await expect(i.locator('.exec-line')).toBeHidden();
});

test('A crash keeps the output printed before it and marks the failing line in red', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] });
  await setCode(page, 'i_editor', 'print("before")\nprint(oxygen)\nprint("after")');
  const i = checker(page, 'i_editor');
  await page.click('#stage-I button:has-text("Run code")');
  await expect(page.locator('#i_fb_run')).toContainText('NameError', { timeout: 30000 });
  await expect(i.locator('.output-content')).toContainText('before');
  await expect(i.locator('.output-content')).toContainText('NameError');
  await expect(i.locator('.output-content')).not.toContainText('after');
  await expect(i.locator('.exec-line')).toHaveClass(/exec-error/);
  await expect(litLine(page, 'i_editor')).toHaveText('2');

  // Editing the code clears the red marker.
  await setCode(page, 'i_editor', 'print("before")\nprint("fixed")');
  await expect(i.locator('.exec-line')).toBeHidden();
});

test('Typing in the editor mid-replay jumps to the end', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] });
  await setCode(page, 'i_editor', 'for i in range(20):\n    print(i)');
  const i = checker(page, 'i_editor');
  await page.click('#stage-I button:has-text("Run code")');
  await expect(litLine(page, 'i_editor')).toHaveText('2', { timeout: 30000 });
  await page.locator('#i_editor').evaluate(ta => ta.dispatchEvent(new Event('input')));
  await expect(i.locator('.output-content')).toContainText('19', { timeout: 2000 });
  await expect(i.locator('.step-status')).toBeHidden();
});

test('A long program speeds up so the replay takes no more than about 5 seconds', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] });
  // 61 lines run: at 0.5 s each this would take 30 s.
  await setCode(page, 'i_editor', 'for i in range(30):\n    print(i)\nprint("done")');
  const i = checker(page, 'i_editor');
  const t0 = Date.now();
  await page.click('#stage-I button:has-text("Run code")');
  await expect(litLine(page, 'i_editor')).toHaveText('2', { timeout: 30000 });
  await expect(i.locator('.output-content')).toContainText('29\ndone', { timeout: 10000 });
  await expect(i.locator('.exec-line')).toBeHidden();
  const ms = Date.now() - t0;
  expect(ms).toBeGreaterThan(4000);   // still stepped, not dumped at once
  expect(ms).toBeLessThan(8000);      // 5 s replay plus the run itself
});

const LS_STARTER = [
  'name = input("Enter your name: ")',
  'hours = int(input("Hours until rescue: "))',
  'oxygen = hours * 60',
  'print("Engineer " + name + " is awake.")',
  'print("Oxygen needed in litres:")',
  'print(oxygen)',
].join('\n');

test('A Modify check steps through the run with its test answers before giving feedback', async ({ page }) => {
  await openAt(page, { currentStage: 'M1', completedStages: ['P', 'R', 'I'] });
  await setCode(page, 'm1_editor', LS_STARTER);
  const m = checker(page, 'm1_editor');
  await page.click('#btn_check_m1');
  await expect(litLine(page, 'm1_editor')).toHaveText('4', { timeout: 30000 });
  await expect(page.locator('#fb_m1')).toHaveClass(/loading/);   // no verdict mid-replay
  await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 10000 });
  await expect(m.locator('.output-content')).toContainText('360');
  await expect(m.locator('.exec-line')).toBeHidden();
});

test('A Make check that crashes shows the error after stepping to the failing line', async ({ page }) => {
  await openAt(page, { currentStage: 'M2', completedStages: ['P', 'R', 'I', 'M1'] });
  await setCode(page, 'm2_editor', 'print("Station log")\nprint(missing_name)');
  const m = checker(page, 'm2_editor');
  await page.click('#btn_check_m2');
  await expect(page.locator('#fb_m2')).toHaveClass(/fail/, { timeout: 30000 });
  await expect(m.locator('.output-content')).toContainText('Station log');
  await expect(m.locator('.output-content')).toContainText('NameError');
  await expect(m.locator('.exec-line')).toHaveClass(/exec-error/);
  await expect(litLine(page, 'm2_editor')).toHaveText('2');
});

test('?step=off runs the whole program at once with no line highlight', async ({ page }) => {
  await openAt(page, { currentStage: 'I', completedStages: ['P', 'R'] }, '?story=off&step=off');
  await setCode(page, 'i_editor', 'for i in range(20):\n    print(i)');
  const i = checker(page, 'i_editor');
  await page.click('#stage-I button:has-text("Run code")');
  await expect(i.locator('.output-content')).toContainText('19', { timeout: 30000 });
  await expect(i.locator('.step-status')).toHaveCount(0);
  await expect(i.locator('.exec-line')).toBeHidden();
});
