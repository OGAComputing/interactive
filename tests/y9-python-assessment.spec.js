import { test, expect } from '@playwright/test';
import { expectPageTitle, expectNoClassroomBanner } from './helpers/activityHelpers.js';
import { LIVE_ITEMS as ITEMS, SECTIONS, variantOf, itemMax } from '../Y9/Python/L6_Assessment/checkers.js';

// Y9 Python · L6 Assessment (Station Zero Chapter 6, Systems Check) — UI wiring only (marking
// permutations live in Y9/Python/L6_Assessment/checkers.test.js). The engine is the Y8 Unit 1
// assessment's, so this covers what's new here: the elif rows, turtle checks in real Python,
// every code task end to end, and the 📡 Transmit report built from the story choices.

const URL = '/Y9/Python/L6_Assessment/1_Python_Assessment.html';
const KEY = 'oga_y9py_assess_v1';
const SEED = 0;
const REVIEW = SECTIONS.length;
const V = id => variantOf(ITEMS.find(i => i.id === id), SEED);

async function openWith(page, state = { seed: SEED, tab: 0 }, choices = null) {
  await page.addInitScript(([k, s, c]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(k, JSON.stringify(s));
      if (c) localStorage.setItem('sz_choices', JSON.stringify(c));
      sessionStorage.setItem('seeded', '1');
    }
  }, [KEY, state, choices]);
  await page.goto(URL);
}
const waitForPython = page => expect(page.locator('#pyStatus')).toHaveText(/ready/, { timeout: 60000 });
async function setCode(page, id, src) {
  await page.locator('#' + id).evaluate((ta, v) => { ta.value = v; ta.dispatchEvent(new Event('input', { bubbles: true })); }, src);
}
const tab = (page, i) => page.locator(`.tab[data-idx="${i}"]`).click();
const tabOf = id => SECTIONS.findIndex(s => s.id === ITEMS.find(i => i.id === id).section);

test('page shell: opens on Start; six sections (v2), a bonus and a review tab, each with its story line', async ({ page }) => {
  await openWith(page, { seed: SEED });   // a fresh start: no tab saved yet
  await expectPageTitle(page, /Systems Check/);
  await expectNoClassroomBanner(page);
  await expect(page.locator('.tab')).toHaveCount(SECTIONS.length + 2);   // Start + sections + Review
  await expect(page.locator('#panel-start')).toHaveClass(/active/);
  await expect(page.locator('#panel-start')).toContainText('How this assessment works');
  await expect(page.locator('#panel-0')).not.toContainText('How this assessment works');
  await page.click('#panel-start [data-goto="0"]');
  await expect(page.locator('#score-pill')).toHaveText('Score: 0 / 46 (0%)');
  await expect(page.locator('#panel-0 .sz-line')).toContainText('WARDEN Core');
  await expect(page.locator('#sz-report')).toBeHidden();
});

test('multiple choice: one try, the lock survives a reload', async ({ page }) => {
  await openWith(page);
  await page.locator('#card_e_line .opt[data-k="1"]').click();   // a wrong answer
  await page.click('#lock_e_line');
  await expect(page.locator('#card_e_line')).toHaveClass(/is-wrong/);
  await expect(page.locator('#card_e_line .opt[data-k="0"]')).toHaveClass(/right/);
  await page.reload();
  await expect(page.locator('#lock_e_line')).toBeDisabled();
  await expect(page.locator('#card_e_line input[value="1"]')).toBeChecked();
});

test('elif rows and the loop trace are marked row by row and box by box', async ({ page }) => {
  await openWith(page);
  await tab(page, tabOf('s_branch'));
  const v = V('s_branch');
  await expect(page.locator('#brow_s_branch_0 .opt')).toHaveCount(4);
  for (let r = 0; r < v.rows.length; r++) await page.locator(`#brow_s_branch_${r} .opt[data-k="${v.rows[r][1]}"]`).click();
  await page.click('#lock_s_branch');
  await expect(page.locator('#card_s_branch')).toHaveClass(/is-right/);

  await tab(page, tabOf('w_trace'));
  const t = V('w_trace');
  await expect(page.locator('#card_w_trace .howto')).toContainText('Worked example');   // v2
  await page.fill(`#tr_w_trace_v_${t.vars[0].name}`, String(t.vars[0].value));
  for (let i = 0; i < t.output.length; i++) await page.fill(`#tr_w_trace_o_${i}`, i === 0 ? 'nope' : t.output[i]);
  await expect(page.locator('#card_w_trace .out-line .n').first()).toHaveText('1st printed');
  await page.click('#lock_w_trace');
  await expect(page.locator('#fb_w_trace')).toContainText('3 of 4');
  await expect(page.locator('#score-pill')).toContainText('Score: 6 / 46');
});

// Every live code question in real Python (s_fix and d_fix are retired in v2): the starter scores 0 and a model answer scores full marks.
const MODELS = {
  e_fix: 'name = input("What is your name? ")\nprint("Welcome aboard, " + name)',
  e_colon: 'print("Starting the scan")\nfor i in range(2):\n    print("Scanning...")\nprint("Scan complete")',
  v_str: 'tries = 3\nprint("Tries: " + str(tries))',
  v_write: 'age = int(input("How old are you? "))\nprint("Next year you will be", age + 1)',
  s_guide: 'score = int(input("Score? "))\nif score >= 50:\n    print("Pass")\nelif score >= 40:\n    print("Nearly")\nelse:\n    print("Try again")',
  s_write: 'points = int(input("Points? "))\nif points >= 100:\n    print("Gold")\nelif points >= 50:\n    print("Silver")\nelse:\n    print("Bronze")',
  w_fix: 'pin = input("PIN? ")\nwhile pin != "1234":\n    print("Wrong PIN")\n    pin = input("PIN? ")\nprint("Unlocked")',
  w_write: 'start = int(input("Count down from? "))\nwhile start > 0:\n    print(start)\n    start = start - 1\nprint("Lift off!")',
  f_guide: 'for i in range(5):\n    print("Ping")',
  f_fix: 'import turtle\nt = turtle.Turtle()\nfor i in range(4):\n    t.forward(100)\n    t.left(90)',
  f_write: 'import turtle\nt = turtle.Turtle()\nfor i in range(5):\n    t.forward(80)\n    t.right(72)',
  d_guide: 'def cheer():\n    print("Hip hip hooray!")\n\ncheer()\ncheer()',
  d_write: 'def goodbye():\n    print("See you soon")\n\ngoodbye()',
  p_till: 'def welcome():\n    print("Welcome to the cinema!")\n\nwelcome()\ntickets = int(input("How many tickets? "))\nfor i in range(tickets):\n    print("Ticket")\nif tickets >= 5:\n    print("Group discount!")',
  x_guess: 'guesses = 1\nguess = int(input("Guess: "))\nwhile guess != 7:\n    if guess < 7:\n        print("Too low")\n    else:\n        print("Too high")\n    guess = int(input("Guess: "))\n    guesses = guesses + 1\nprint("Correct! You took " + str(guesses) + " guesses")',
};
test('every code question: starter scores 0, model answer scores full marks', async ({ page }) => {
  test.setTimeout(420000);
  await openWith(page);
  await waitForPython(page);
  for (const [id, model] of Object.entries(MODELS)) {
    const item = ITEMS.find(i => i.id === id);
    await tab(page, tabOf(id));
    if (item.kind === 'fix' || item.resettable) {
      await page.click('#check_' + id);
      await expect(page.locator('#fb_' + id), id + ' starter').toContainText('This check: 0/', { timeout: 30000 });
    }
    await setCode(page, 'ed_' + id, model);
    await page.click('#check_' + id);
    await expect(page.locator('#fb_' + id), id).toHaveClass(/correct/, { timeout: 30000 });
  }
});

test('turtle: a wrong shape says what was drawn, on the beacon display', async ({ page }) => {
  await openWith(page, { seed: SEED, tab: tabOf('f_write') });
  await waitForPython(page);
  await setCode(page, 'ed_f_write', 'import turtle\nt = turtle.Turtle()\nfor i in range(6):\n    t.forward(80)\n    t.left(60)');
  await page.click('#check_f_write');
  await expect(page.locator('#fb_f_write')).toContainText('The turtle drew a hexagon', { timeout: 30000 });
  await expect(page.locator('#card_f_write .turtle-screen')).toBeVisible();
});

test('review: answering the last question shows the finished banner', async ({ page }) => {
  const core = ITEMS.filter(i => !i.bonus && i.id !== 'e_line');
  const pts = Object.fromEntries(core.map(i => [i.id, itemMax(i, SEED)]));
  const locked = Object.fromEntries(core.filter(i => !['fix', 'reqs'].includes(i.kind)).map(i => [i.id, true]));
  const checked = Object.fromEntries(core.filter(i => ['fix', 'reqs'].includes(i.kind)).map(i => [i.id, true]));
  await openWith(page, { seed: SEED, tab: REVIEW, pts, locked, checked });
  await expect(page.locator('#review-todo button')).toHaveCount(1);
  await page.click('#review-todo button');
  await page.locator('#card_e_line .opt[data-k="0"]').click();
  await page.click('#lock_e_line');
  await expect(page.locator('#done-banner')).toContainText('full marks');
  await expect(page.locator('#score-pill')).toHaveText('Score: 46 / 46 (100%)');
});

test('transmit: the inventory and the breach follow the story choices, never the score', async ({ page }) => {
  // Proximity lost Chen (shielded Patel, locked down Sensor Ops, power to the sensors).
  await openWith(page, { seed: SEED, tab: REVIEW }, { shield: 'pod5', lockdown: 'sensors', power: 'sensors', _at: { shield: 1, lockdown: 2, power: 3 } });
  await page.click('#transmit');
  const report = page.locator('#sz-report');
  await expect(report).toBeVisible();
  await expect(report).toContainText('CREW ALIVE');
  await expect(report).toContainText('3 of 5');
  await expect(report).toContainText('Chen is gone');
  await expect(report).toContainText('Patel can steer');
  await expect(page.locator('#transmit')).toHaveText(/Transmitted/);
  await page.reload();
  await expect(report).toBeVisible();   // stays transmitted
});
