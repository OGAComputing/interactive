import { test, expect } from '@playwright/test';
import { expectPageTitle, expectNoClassroomBanner } from './helpers/activityHelpers.js';
import { TARGETS, drawCheckpoint, poolQuestion, rightAnswer } from '../Y8/Python Unit 1/L7_Targeted_Practice/checkers.js';

// Y8 Unit 1 · L7 Targeted Practice — UI wiring only (routing and marking permutations live in
// Y8/Python Unit 1/L7_Targeted_Practice/checkers.test.js).
//   • The plan comes from the assessment's saved state; with none, the student picks targets.
//   • Look back shows the student's own wrong answers.
//   • Steps unlock in order; a checkpoint restart is saved at once (survives a reload).
//   • Every code task: the starter fails and a model answer passes in real Python.
//   • Make it: locked until the targets are done (teacher password unlocks), checked against
//     the student's own test plan.

const URL = '/Y8/Python%20Unit%201/L7_Targeted_Practice/1_Targeted_Practice.html';
const KEY = 'oga_y8u1_dirt_v1';
const ASSESS_KEY = 'oga_y8u1_assess_v1';
const SEED = 1;
const ALL = TARGETS.map(t => t.id);

// An assessment with marks lost on o_print (chose option 2), c_join, c_fix and s_boundary:
// print 4/5, cast_int 3/6, conditions 3/4 → plan: print, cast_int, conditions.
const FULL = { o_print: 1, o_lines: 1, o_errline: 1, o_errfix: 1, o_fix: 1, o_write: 2, v_trace: 4, v_quotes: 1, v_order: 1, v_write: 2,
  i_prompt: 1, i_trace: 1, i_store: 1, i_fix: 1, i_write: 2, c_sort: 3, c_join: 1, c_int: 1, c_str: 1, c_fix: 2, c_write: 2,
  s_indented: 1, s_branch: 3, s_equals: 1, s_indent: 1, s_boundary: 1, s_fix: 1, s_write: 2, w_warm: 2, w_make: 6 };
const ASSESSMENT = { seed: 0, pts: { ...FULL, o_print: 0, c_join: 0, c_fix: 0, s_boundary: 0 },
  sel: { o_print: 2, c_join: 1, s_boundary: 1 }, code: { ed_c_fix: 'apples = input("How many apples? ")\nprint(apples)' } };

async function openWith(page, { assess = null, state = null } = {}) {
  await page.addInitScript(([k, s, ak, a]) => {
    if (sessionStorage.getItem('seeded')) return;
    if (s) localStorage.setItem(k, JSON.stringify(s));
    if (a) localStorage.setItem(ak, JSON.stringify(a));
    sessionStorage.setItem('seeded', '1');
  }, [KEY, state, ASSESS_KEY, assess]);
  await page.goto(URL);
}
const waitForPython = page => expect(page.locator('#pyStatus')).toHaveText(/ready/, { timeout: 60000 });
async function setCode(page, id, src) {
  await page.locator('#' + id).evaluate((ta, v) => { ta.value = v; ta.dispatchEvent(new Event('input', { bubbles: true })); }, src);
}
const tab = (page, key) => page.locator(`.tab[data-tab="${key}"]`).click();
// Steps 2 and 3 already done, so step 4 (the code task) is open.
const readyToCode = tids => ({
  seed: SEED, plan: tids,
  reflect: Object.fromEntries(tids.map(t => [t, 'Next time I will read it carefully'])),
  cp: Object.fromEntries(tids.map(t => [t, { attempt: 0, pos: 3, done: true }])),
});

test('page shell, and the plan built from the assessment', async ({ page }) => {
  await openWith(page, { assess: ASSESSMENT, state: { seed: SEED } });
  await expectPageTitle(page, /Targeted Practice/);
  await expectNoClassroomBanner(page);
  await expect(page.locator('.tab')).toHaveCount(6);                // plan + 3 targets + make + more
  await expect(page.locator('#panel-plan .plan-card:not(.make)')).toHaveCount(3);
  await expect(page.locator('#panel-plan')).toContainText('You got 4 / 5 on questions 1.1, 1.2, 1.5, 1.6');
  await expect(page.locator('.tab[data-tab="make"]')).toContainText('🔒');
  await expect(page.locator('#score-pill')).toHaveText('Progress: 0%');
});

test('look back shows the student\'s own wrong answer, the right one and why', async ({ page }) => {
  await openWith(page, { assess: ASSESSMENT, state: { seed: SEED } });
  await tab(page, 'print');
  const lb = page.locator('#step1_print .lb');
  await expect(lb).toHaveCount(1);                                   // only o_print was lost
  await expect(lb).toContainText('print(Good morning)');            // what they chose
  await expect(lb.locator('.right')).toContainText('print("Good morning")');
  await expect(page.locator('#step1_print .got-right')).toContainText('1.2 and 1.5');
  await tab(page, 'cast_int');
  await expect(page.locator('#step1_cast_int')).toContainText('apples = input("How many apples? ")');   // their own code
});

test('no results: the student picks up to 3 targets', async ({ page }) => {
  await openWith(page);
  await expect(page.locator('[data-pick]')).toHaveCount(TARGETS.length);
  await page.locator('[data-pick="variables"]').check();
  await page.locator('[data-pick="print"]').check();
  await page.click('#pick-start');
  await expect(page.locator('.tab')).toHaveCount(5);
  await expect(page.locator('#panel-print')).toHaveClass(/active/);   // in lesson order
  await expect(page.locator('#step1_print .lb')).toHaveCount(4);      // every question, with answers
});

test('steps unlock in order; a sentence must be a real sentence', async ({ page }) => {
  await openWith(page, { assess: ASSESSMENT, state: { seed: SEED } });
  await tab(page, 'print');
  await expect(page.locator('#step3_print')).toHaveClass(/locked/);
  await page.fill('#reflect_print', 'idk');
  await page.click('#savereflect_print');
  await expect(page.locator('#fbreflect_print')).toHaveClass(/wrong/);
  await page.fill('#reflect_print', 'Next time I will check print is in lower case');
  await page.click('#savereflect_print');
  await expect(page.locator('#step3_print')).not.toHaveClass(/locked/);
  await expect(page.locator('#step4_print')).toHaveClass(/locked/);
});

async function answerCp(page, tid, q, right) {
  if (q.kind === 'mcq') {
    await page.locator(`#cp_${tid} .cp-opt[data-k="${right ? 0 : 1}"]`).click();
  } else {
    await page.fill(`#cpin_${tid}`, right ? rightAnswer(q) : 'zzz');
    await page.locator(`#cp_${tid} [data-cp-type]`).click();
  }
}

test('checkpoint: 3 in a row first time unlocks the code task', async ({ page }) => {
  await openWith(page, { assess: ASSESSMENT, state: { seed: SEED, reflect: { print: 'Next time I will check the brackets' } } });
  await tab(page, 'print');
  const draw = drawCheckpoint('print', SEED, 0);
  for (let i = 0; i < draw.length; i++) {
    await expect(page.locator('#cp_print .cp-head')).toContainText(`Question ${i + 1} of 3`);
    await answerCp(page, 'print', poolQuestion('print', draw[i]), true);
    await expect(page.locator('#cpmsg_print')).toHaveClass(/good/);
  }
  await expect(page.locator('#cp_print .cp-done')).toContainText('first time');
  await expect(page.locator('#step4_print')).not.toHaveClass(/locked/);
  await expect(page.locator('#score-pill')).toHaveText('Progress: 10%');   // 1 of 10 units, first time
});

test('checkpoint: a wrong answer restarts with a new draw, and a reload cannot dodge it', async ({ page }) => {
  await openWith(page, { assess: ASSESSMENT, state: { seed: SEED, reflect: { print: 'Next time I will check the brackets' } } });
  await tab(page, 'print');
  await answerCp(page, 'print', poolQuestion('print', drawCheckpoint('print', SEED, 0)[0]), false);
  await expect(page.locator('#cpmsg_print')).toHaveClass(/bad/);
  await expect(page.locator('#cprestart_print')).toBeDisabled();
  await page.reload();
  await expect(page.locator('#cp_print .cp-head')).toContainText('Question 1 of 3 · try 2');
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)).cp.print.attempt, KEY)).toBe(1);
});

// Every code task in real Python: the starter fails and a model answer passes.
const MODELS = {
  print: 'print("SCHOOL DISCO")\nprint()\nprint("Friday at 7pm")\nprint("Tickets cost £2")\nprint("Bring a friend!")',
  errors: 'team = "Rovers"\nprint("Your team is " + team)\nprint("Come on " + team + "!")',
  variables: 'pet = "cat"\nprint("I have a " + pet)\npet = "dog"\nprint("Now I have a " + pet)',
  input: 'colour = input("What is your favourite colour? ")\nprint("Your favourite colour is " + colour)',
  cast_int: 'round1 = int(input("Points in round 1? "))\nround2 = int(input("Points in round 2? "))\ntotal = round1 + round2\nprint("Total points: " + str(total))',
  cast_str: 'age = int(input("How old are you? "))\nprint("Next year you will be " + str(age + 1))',
  branches: 'tickets = int(input("How many tickets are left? "))\nif tickets > 0:\n    print("Book now!")\nelse:\n    print("Sold out")\nprint("Thanks for visiting")',
  conditions: 'age = int(input("How old are you? "))\nif age >= 60:\n    print("Free bus pass")\nelse:\n    print("Full fare")',
  write: 'name = input("What is your name? ")\nage = int(input("How old are you? "))\nif age >= 12:\n    print(name + ", you can buy this game")\nelse:\n    print("Sorry " + name + ", come back in " + str(12 - age) + " years")',
};
test('every code task: the starter fails, a model answer passes and locks', async ({ page }) => {
  test.setTimeout(240000);
  await openWith(page, { state: readyToCode(ALL) });
  await waitForPython(page);
  for (const [tid, model] of Object.entries(MODELS)) {
    await tab(page, tid);
    await page.click('#check_' + tid);
    await expect(page.locator('#fb_' + tid), tid).toHaveClass(/wrong/, { timeout: 30000 });
    await setCode(page, 'ed_' + tid, model);
    await page.click('#check_' + tid);
    await expect(page.locator('#fb_' + tid), tid).toHaveClass(/correct/, { timeout: 30000 });
    await expect(page.locator('#ed_' + tid)).toHaveJSProperty('readOnly', true);
    await expect(page.locator('#tdone_' + tid)).toHaveClass(/show/);
  }
  await expect(page.locator('.tab[data-tab="make"]')).toContainText('🎨');   // all targets done → unlocked
});

test('the write target starts from the student\'s own game shop and names what is missing', async ({ page }) => {
  const own = 'name = input("Name? ")\nage = int(input("Age? "))\nif age > 12:\n    print("Yes " + name)\nelse:\n    print("No " + name)';
  const { plan, ...ready } = readyToCode(['write']);   // no plan: the page makes it from the assessment
  await openWith(page, { assess: { seed: 0, pts: { ...FULL, w_make: 4 }, code: { ed_w_make: own }, results: { w_make: [true, true, true, false, true, false] } },
                         state: ready });
  await expect(page.locator('.tab[data-tab="write"]')).toBeVisible();
  expect(plan).toEqual(['write']);
  await waitForPython(page);
  await tab(page, 'write');
  await expect(page.locator('#step1_write .req-list li.req-fail')).toHaveCount(2);
  await expect(page.locator('#step4_write .own-note')).toBeVisible();
  await expect(page.locator('#ed_write')).toHaveValue(own);
  await page.click('#check_write');
  await expect(page.locator('#fb_write')).toContainText('Requirement 4', { timeout: 60000 });
  await expect(page.locator('#fb_write')).toContainText('Tip:');
  await expect(page.locator('#req_write li.req-pass')).toHaveCount(4);
});

test('make it: locked until the targets are done; the teacher password unlocks it', async ({ page }) => {
  await openWith(page, { assess: ASSESSMENT, state: { seed: SEED } });
  await tab(page, 'make');
  await expect(page.locator('#make-locked')).toBeVisible();
  await expect(page.locator('#make-locked-why')).toContainText('3 targets still to do');
  await page.click('#tu-show');
  await page.fill('#tu-pass', 'wrong');
  await page.click('#tu-go');
  await expect(page.locator('#make-body')).toBeHidden();
  await page.fill('#tu-pass', 'outwood');
  await page.click('#tu-go');
  await expect(page.locator('#make-body')).toBeVisible();
});

test('make it: checked against the student\'s own test plan; full marks in the assessment unlocks it at once', async ({ page }) => {
  test.setTimeout(120000);
  await openWith(page, { assess: { seed: 0, pts: FULL }, state: { seed: SEED } });
  await expect(page.locator('#panel-plan')).toContainText('every mark');
  await waitForPython(page);
  await tab(page, 'make');
  await page.click('[data-idea="ride"]');
  await expect(page.locator('#ed_make')).toHaveValue(/# Ride checker/);
  await setCode(page, 'ed_make', [
    'name = input("What is your name? ")',
    'height = int(input("How tall are you in cm? "))',
    'if height >= 140:',
    '    print("In you get, " + name + "!")',
    'else:',
    '    print("Sorry " + name + ", you need " + str(140 - height) + " more cm")',
    'print("Thanks for visiting")',
  ].join('\n'));
  await expect(page.locator('#test-plan input[data-test="A"]')).toHaveCount(2);
  await expect(page.locator('#tp_q1')).toHaveText('How tall are you in cm?');
  await page.click('#check_make');
  await expect(page.locator('#fb_make')).toContainText('Fill in every answer');
  for (const [t, ans] of [['A', ['Sam', '150']], ['B', ['Ali', '130']]]) {
    for (let i = 0; i < 2; i++) await page.fill(`#test-plan input[data-test="${t}"][data-i="${i}"]`, ans[i]);
  }
  await page.click('#check_make');
  await expect(page.locator('#fb_make')).toHaveClass(/correct/, { timeout: 30000 });
  await expect(page.locator('#req_make li.req-pass')).toHaveCount(4);
  await expect(page.locator('#req_stretch li.req-pass')).toHaveCount(3);
  await expect(page.locator('#tp_resB')).toContainText('you need 10 more cm');
  await expect(page.locator('#score-pill')).toHaveText('Progress: 100%');
  await expect(page.locator('#done-banner')).toHaveClass(/show/);
});

test('more practice adds an extra target as a bonus tab', async ({ page }) => {
  await openWith(page, { assess: ASSESSMENT, state: { seed: SEED } });
  await tab(page, 'more');
  await page.click('[data-add="branches"]');
  await expect(page.locator('#panel-branches')).toHaveClass(/active/);
  await expect(page.locator('.tab[data-tab="branches"]')).toContainText('+');
  await expect(page.locator('#step1_branches')).toContainText('You got every question on this right');
  await page.reload();
  await expect(page.locator('.tab[data-tab="branches"]')).toHaveCount(1);
});
