import { test, expect } from '@playwright/test';
import { expectPageTitle, expectNoClassroomBanner } from './helpers/activityHelpers.js';

// Y8 Unit 1 · L4R Revision Quest — UI wiring only (checker permutations live in
// Y8/Python Unit 1/L4R_Revision/checkers.test.js).
//   • Levels unlock in order; the extensions unlock once all five levels are done.
//   • Level 1 is a checkpoint chain: a wrong answer forces a restart that survives a reload.
//   • Levels 2–3 lock the Check button for a cooldown after a wrong check.

const URL = '/Y8/Python%20Unit%201/L4R_Revision/1_Revision_Quest.html';
const KEY = 'y8_l4r_revision_quest';
const ALL_DONE = [true, true, true, true, true];

async function openWith(page, state) {
  if (state) {
    await page.addInitScript(([k, s]) => {
      if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }
    }, [KEY, state]);
  }
  await page.goto(URL);
}
const waitForPython = page => expect(page.locator('#pyStatus')).toHaveText(/ready/, { timeout: 60000 });
async function setCode(page, id, src) {
  await page.locator('#' + id).evaluate((ta, v) => { ta.value = v; ta.dispatchEvent(new Event('input', { bubbles: true })); }, src);
}

test('page shell: Level 1 open, everything else locked', async ({ page }) => {
  await openWith(page);
  await expectPageTitle(page, /Revision Quest/);
  await expectNoClassroomBanner(page);
  await expect(page.locator('#panel-0')).toHaveClass(/active/);
  for (let i = 1; i < 8; i++) await expect(page.locator(`.tab[data-idx="${i}"]`)).toBeDisabled();
});

test('Level 1: six right in a row completes it and unlocks Level 2', async ({ page }) => {
  await openWith(page);
  for (let i = 0; i < 6; i++) {
    await page.locator('input[name="chain_opt"][value="0"]').check();
    await page.click('#chain-check');
    if (i < 5) await expect(page.locator('#chain-card')).toContainText(`Question ${i + 2} of 6`, { timeout: 5000 });
  }
  await expect(page.locator('#chain-area .done-box')).toContainText(/Gold/, { timeout: 5000 });
  await expect(page.locator('#dot-0')).toHaveClass(/gold/);
  await expect(page.locator('.tab[data-idx="1"]')).toBeEnabled();
});

test('Level 1: a wrong answer ends the run, and the restart survives a reload', async ({ page }) => {
  await openWith(page);
  await page.locator('input[name="chain_opt"][value="2"]').check();
  await page.click('#chain-check');
  await expect(page.locator('#chain-restart')).toBeVisible();
  await expect(page.locator('#chain-card .why')).toBeVisible();
  await page.reload();
  await expect(page.locator('#chain-restart')).toBeVisible();
  await page.click('#chain-restart');
  await expect(page.locator('#chain-check')).toBeVisible();
});

// seed 0 → trace variant A (seed % 3), and fixed card/option orders.
const L2_STATE = { seed: 0, tab: 1, completed: [true, false, false, false, false], firstAttempt: [true, true, true, true, true] };

test('Level 2: a wrong trace is marked per box and locks Check for a cooldown', async ({ page }) => {
  await openWith(page, L2_STATE);
  await page.fill('#trace_v_name', 'Mo');          // text without quotes
  await page.fill('#trace_v_age', '"120"');
  await page.fill('#trace_v_older', '13');
  await page.fill('#trace_o_0', 'Mo will be 13');
  await page.fill('#trace_o_1', '120');
  await page.click('#trace-check');
  await expect(page.locator('#trace_v_name')).toHaveClass(/ans-wrong/);
  await expect(page.locator('#trace_v_age')).toHaveClass(/ans-correct/);
  await expect(page.locator('#msg_v_name')).toContainText(/quotes/);
  await expect(page.locator('#trace-check')).toBeDisabled();
  await expect(page.locator('#trace-check')).toContainText(/Look again/);
});

test('Level 2: a correct trace completes the level', async ({ page }) => {
  await openWith(page, L2_STATE);
  await page.fill('#trace_v_name', '"Mo"');
  await page.fill('#trace_v_age', '"120"');
  await page.fill('#trace_v_older', '13');
  await page.fill('#trace_o_0', 'Mo will be 13');
  await page.fill('#trace_o_1', '120');
  await page.click('#trace-check');
  await expect(page.locator('#trace-done .done-box')).toBeVisible();
  await expect(page.locator('.tab[data-idx="2"]')).toBeEnabled();
});

test('Level 3: click-to-place sorting completes the level', async ({ page }) => {
  await openWith(page, { ...L2_STATE, tab: 2, completed: [true, true, false, false, false] });
  const answers = { s1: 'join', s2: 'maths', s3: 'error', s4: 'join', s5: 'maths', s6: 'error',
                    s7: 'maths', s8: 'join', s9: 'maths', s10: 'error', s11: 'join', s12: 'join' };
  for (const [id, bin] of Object.entries(answers)) {
    await page.click(`.sort-card[data-id="${id}"]`);
    await page.locator(`.sort-bin[data-bin="${bin}"]`).click({ position: { x: 12, y: 12 } });
    await expect(page.locator(`.sort-bin[data-bin="${bin}"] .sort-card[data-id="${id}"]`)).toBeAttached();
  }
  await page.click('#sort-check');
  await expect(page.locator('#sort-done .done-box')).toBeVisible();
  await expect(page.locator('.tab[data-idx="3"]')).toBeEnabled();
});

test('Level 4: fixing a bug passes it; the unfixed starter fails with a hint', async ({ page }) => {
  await openWith(page, { ...L2_STATE, tab: 3, completed: [true, true, true, false, false] });
  await waitForPython(page);
  await page.click('#bugcheck_b5');
  await expect(page.locator('#bugfb_b5')).toHaveClass(/wrong/, { timeout: 30000 });
  await expect(page.locator('#bughint_b5')).toBeVisible();

  await setCode(page, 'bug_b1', 'print("Welcome to the Python club!")\nprint("Today we revise everything.")');
  await page.click('#bugcheck_b1');
  await expect(page.locator('#bugfb_b1')).toHaveClass(/correct/, { timeout: 30000 });
  await expect(page.locator('#bugkind_b1')).toBeVisible();
  await expect(page.locator('#bug-counter')).toHaveText('1 of 5 fixed');
});

test('Level 5: a working ticket machine completes the quest and unlocks the extensions', async ({ page }) => {
  await openWith(page, { ...L2_STATE, tab: 4, completed: [true, true, true, true, false] });
  await waitForPython(page);
  await setCode(page, 'build_editor', [
    'name = input("What is your name? ")',
    'tickets = int(input("How many tickets? "))',
    'price = 7',
    'total = tickets * price',
    'print(name + ", your " + str(tickets) + " tickets cost £" + str(total))',
  ].join('\n'));
  await page.click('#build-check');
  await expect(page.locator('#build-fb')).toHaveClass(/correct/, { timeout: 30000 });
  await expect(page.locator('#req_build li.req-pass')).toHaveCount(5);
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('.tab[data-idx="5"]')).toBeEnabled();
});

test('Design Studio: checking a program awards badges that persist', async ({ page }) => {
  await openWith(page, { ...L2_STATE, tab: 7, completed: ALL_DONE, ext: { done: [true, true], fails: [0, 0], badges: [] } });
  await waitForPython(page);
  await setCode(page, 'ext3_editor', [
    'name = input("Name? ")',
    'pet = input("Pet? ")',
    'age = int(input("Age? "))',
    'print("==========")',
    'print(name + " has a pet " + pet + " aged " + str(age))',
  ].join('\n'));
  await page.click('#ext3-check');
  await expect(page.locator('#ext3-fb')).toContainText(/New badge/, { timeout: 30000 });
  await expect(page.locator('.badge[data-id="chatter"]')).toHaveClass(/earned/);
  await expect(page.locator('.badge[data-id="banner"]')).toHaveClass(/earned/);
  await expect(page.locator('.badge[data-id="decimal"]')).not.toHaveClass(/earned/);
  await page.reload();
  await expect(page.locator('.badge[data-id="chatter"]')).toHaveClass(/earned/);
});
