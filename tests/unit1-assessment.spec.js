import { test, expect } from '@playwright/test';
import { expectPageTitle, expectNoClassroomBanner } from './helpers/activityHelpers.js';
import { ITEMS, variantOf, itemMax } from '../Y8/Python Unit 1/L6_Assessment/checkers.js';

// Y8 Unit 1 · L6 Assessment — UI wiring only (marking permutations live in
// Y8/Python Unit 1/L6_Assessment/checkers.test.js).
//   • One-try questions lock when answered, and the lock survives a reload.
//   • Code questions are run in real Python against the test inputs; full marks locks them.
//   • Review lists what is left; answering the last question shows the finished banner.

const URL = '/Y8/Python%20Unit%201/L6_Assessment/1_Python_Assessment.html';
const KEY = 'oga_y8u1_assess_v1';
const SEED = 0;
const V = id => variantOf(ITEMS.find(i => i.id === id), SEED);

async function openWith(page, state = { seed: SEED }) {
  await page.addInitScript(([k, s]) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); }
  }, [KEY, state]);
  await page.goto(URL);
}
const waitForPython = page => expect(page.locator('#pyStatus')).toHaveText(/ready/, { timeout: 60000 });
async function setCode(page, id, src) {
  await page.locator('#' + id).evaluate((ta, v) => { ta.value = v; ta.dispatchEvent(new Event('input', { bubbles: true })); }, src);
}
const tab = (page, i) => page.locator(`.tab[data-idx="${i}"]`).click();

test('page shell: six sections, a bonus and a review tab; nothing answered', async ({ page }) => {
  await openWith(page);
  await expectPageTitle(page, /Unit 1 Assessment/);
  await expectNoClassroomBanner(page);
  await expect(page.locator('.tab')).toHaveCount(8);
  await expect(page.locator('#count_output')).toHaveText('0/5');
  await expect(page.locator('#score-pill')).toHaveText('Score: 0 / 38 (0%)');
  await expect(page.locator('#intro')).toHaveAttribute('open', '');
});

test('multiple choice: one try, the lock survives a reload', async ({ page }) => {
  await openWith(page);
  await page.locator('#card_o_print .opt[data-k="2"]').click();   // a wrong answer
  await page.click('#lock_o_print');
  await expect(page.locator('#card_o_print')).toHaveClass(/is-wrong/);
  await expect(page.locator('#card_o_print .opt[data-k="0"]')).toHaveClass(/right/);
  await expect(page.locator('#card_o_print .why')).toBeVisible();
  await expect(page.locator('#count_output')).toHaveText('1/5');

  await page.reload();
  await expect(page.locator('#lock_o_print')).toBeDisabled();
  await expect(page.locator('#card_o_print input[value="0"]')).toBeDisabled();
  await expect(page.locator('#card_o_print .opt[data-k="2"]')).toHaveClass(/wrong/);
});

test('trace: marked box by box, with the right answers shown', async ({ page }) => {
  await openWith(page);
  await tab(page, 1);
  const v = V('v_trace');
  const [a, b] = v.vars;
  await page.fill(`#tr_v_trace_v_${a.name}`, a.value);              // no quotes → wrong
  await page.fill(`#tr_v_trace_v_${b.name}`, `"${b.value}"`);
  await page.fill('#tr_v_trace_o_0', v.output[0]);
  await page.fill('#tr_v_trace_o_1', v.output[1]);
  await page.click('#lock_v_trace');
  await expect(page.locator(`#tr_v_trace_v_${a.name}`)).toHaveClass(/ans-wrong/);
  await expect(page.locator(`#msg_v_trace_v_${a.name}`)).toContainText(/quotes/);
  await expect(page.locator(`#tr_v_trace_v_${b.name}`)).toHaveClass(/ans-correct/);
  await expect(page.locator('#fb_v_trace')).toContainText('3 of 4');
  await expect(page.locator('#score-pill')).toContainText('Score: 3 / 38');
});

test('selection rows and the sort lock with per-row and per-card marking', async ({ page }) => {
  await openWith(page);
  await tab(page, 4);
  const v = V('s_branch');
  for (let r = 0; r < v.rows.length; r++) {
    const want = v.rows[r][1] === 'a' ? 0 : 1;
    await page.locator(`#brow_s_branch_${r} .opt[data-k="${want}"]`).click();
  }
  await page.click('#lock_s_branch');
  await expect(page.locator('#card_s_branch')).toHaveClass(/is-right/);

  await tab(page, 3);
  for (const c of V('c_sort').cards) {
    await page.click(`.sort-card[data-id="${c.id}"]`);
    await page.locator(`.sort-bin[data-bin="${c.bin}"]`).click({ position: { x: 12, y: 12 } });
  }
  await page.click('#lock_c_sort');
  await expect(page.locator('#fb_c_sort')).toContainText('6 of 6');
  await expect(page.locator('#score-pill')).toContainText('Score: 6 / 38');
});

test('fix-it: the starter fails; the fix passes in real Python and locks', async ({ page }) => {
  await openWith(page);
  await waitForPython(page);
  await page.click('#check_o_fix');
  await expect(page.locator('#fb_o_fix')).toHaveClass(/wrong/, { timeout: 30000 });
  await expect(page.locator('#fb_o_fix')).toContainText(/SyntaxError/);

  await setCode(page, 'ed_o_fix', 'print("Welcome to the quiz!")\nprint("Good luck")\nprint("Question 1 is coming up")');
  await page.click('#check_o_fix');
  await expect(page.locator('#fb_o_fix')).toHaveClass(/correct/, { timeout: 30000 });
  await expect(page.locator('#card_o_fix')).toHaveClass(/code-locked/);
  await expect(page.locator('#check_o_fix')).toBeDisabled();
});

test('write it: a model game shop gets 6/6 in real Python', async ({ page }) => {
  await openWith(page, { seed: SEED, tab: 5 });
  await waitForPython(page);
  await setCode(page, 'ed_w_make', [
    'name = input("What is your name? ")',
    'age = int(input("How old are you? "))',
    'if age >= 12:',
    '    print(name + ", you can buy this game")',
    'else:',
    '    print("Sorry " + name + ", come back in " + str(12 - age) + " years")',
  ].join('\n'));
  await page.click('#check_w_make');
  await expect(page.locator('#fb_w_make')).toHaveClass(/correct/, { timeout: 60000 });
  await expect(page.locator('#req_w_make li.req-pass')).toHaveCount(6);
});

test('write it: a partial answer keeps its marks and shows which requirement is missing', async ({ page }) => {
  await openWith(page, { seed: SEED, tab: 5 });
  await waitForPython(page);
  await setCode(page, 'ed_w_make', 'name = input("Name? ")\nage = int(input("Age? "))\nif age > 12:\n    print("Yes " + name)\nelse:\n    print("No " + name)');
  await page.click('#check_w_make');
  await expect(page.locator('#fb_w_make')).toHaveClass(/partial/, { timeout: 60000 });
  await expect(page.locator('#fb_w_make')).toContainText('Requirement 4');
  await expect(page.locator('#req_w_make li.req-pass')).toHaveCount(4);
});

// Every code question in real Python: the starter scores 0 and a model answer scores full marks.
const MODELS = {
  i_fix: 'animal = input("What is your favourite animal? ")\nprint("I like " + animal + "s too!")',
  c_fix: 'apples = int(input("How many apples? "))\npears = int(input("How many pears? "))\ntotal = apples + pears\nprint("Fruit in the bowl: " + str(total))',
  s_fix: 'mark = int(input("What was your mark? "))\nif mark >= 60:\n    print("Merit!")\nelse:\n    print("Keep practising")',
  w_warm: 'temp = int(input("What is the temperature? "))\nif temp >= 25:\n    print("T-shirt weather!")\nelse:\n    print("Take a coat.")\nprint("Have a good day!")',
  x_speed: 'limit = int(input("What is the speed limit? "))\nspeed = int(input("How fast were you going? "))\nif speed > limit:\n    print("You were " + str(speed - limit) + " mph over the limit")\nelse:\n    print("Within the limit, thank you")\nprint("Drive safely")',
};
test('every code question: starter scores 0, model answer scores full marks', async ({ page }) => {
  test.setTimeout(180000);
  await openWith(page);
  await waitForPython(page);
  for (const [id, model] of Object.entries(MODELS)) {
    const item = ITEMS.find(i => i.id === id);
    await tab(page, ['output', 'variables', 'input', 'casting', 'selection', 'write', 'ext'].indexOf(item.section));
    if (item.kind === 'fix' || id === 'w_warm') {
      await page.click('#check_' + id);
      await expect(page.locator('#fb_' + id)).toContainText('This check: 0/', { timeout: 30000 });
    }
    await setCode(page, 'ed_' + id, model);
    await page.click('#check_' + id);
    await expect(page.locator('#fb_' + id), id).toHaveClass(/correct/, { timeout: 30000 });
  }
});

test('review lists what is left; answering the last question shows the finished banner', async ({ page }) => {
  // Everything answered except o_print, all at full marks.
  const core = ITEMS.filter(i => !i.bonus && i.id !== 'o_print');
  const pts = Object.fromEntries(core.map(i => [i.id, itemMax(i, SEED)]));
  const locked = Object.fromEntries(core.filter(i => !['fix', 'reqs'].includes(i.kind)).map(i => [i.id, true]));
  const checked = Object.fromEntries(core.filter(i => ['fix', 'reqs'].includes(i.kind)).map(i => [i.id, true]));
  await openWith(page, { seed: SEED, tab: 7, pts, locked, checked });
  await expect(page.locator('#review-todo button')).toHaveCount(1);
  await expect(page.locator('#review-todo')).toContainText('Question 1.1');

  await page.click('#review-todo button');
  await expect(page.locator('#panel-0')).toHaveClass(/active/);
  await page.locator('#card_o_print .opt[data-k="0"]').click();
  await page.click('#lock_o_print');
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
  await expect(page.locator('#done-banner')).toContainText('full marks');
  await expect(page.locator('#score-pill')).toHaveText('Score: 38 / 38 (100%)');
});
