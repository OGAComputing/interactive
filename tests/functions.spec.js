import { test, expect } from '@playwright/test';
import {
  expectPageTitle, expectProgressBar, expectNoClassroomBanner,
  expectCompletionBanner, expectActiveStage, expectDoneStage,
} from './helpers/activityHelpers.js';

const ACTIVITY = '/Y8/Python/L4_Functions/1_Functions.html';

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function fillPredict(page) {
  await page.locator('input[name="p2"][value="greet()"]').check();
  await page.locator('#p3').fill('Hello!');
  await page.locator('input[name="p4"][value="2"]').check();
  await page.locator('input[name="p5"][value="nothing"]').check();
}

async function fillRun(page) {
  await page.locator('#r1').fill('I saw Hello! and Have a great day. in the output panel.');
}

async function fillInvestigate(page) {
  await page.locator('#i_editor').fill('def greet():\n    print("Hello!")\n    print("Have a great day.")\n    print("Nice to meet you!")\n\ngreet()');
  await page.locator('#i1').fill('A third line appeared: Nice to meet you!');
  await page.locator('#qcard_i1 button:has-text("Next Investigation")').click();
  await page.locator('#i2').fill('The greeting printed twice because greet() was called twice.');
  await page.locator('#qcard_i2 button:has-text("Next Investigation")').click();
  await page.locator('#i3').fill('The first line changed to show my own name instead of Hello.');
  await page.locator('#qcard_i3 button:has-text("Next Investigation")').click();
  await page.locator('#i4').fill('Nothing happened because without brackets Python does not call the function, it just references the object.');
  await page.locator('#qcard_i4 button:has-text("Next Investigation")').click();
  await page.locator('#i5').fill('Hello and Have a great day printed, then Goodbye on the next line.');
}

const VALID_MAKE_PROGRAM = `
def show_menu():
    print("Animal Fact Finder")
    print("1. Dog  2. Cat  3. Rabbit")

def dog_facts():
    print("Dogs are loyal companions.")
    print("Dogs can learn hundreds of words.")

def cat_facts():
    print("Cats sleep up to 16 hours a day.")
    print("Cats can make over 100 sounds.")

def rabbit_facts():
    print("Rabbits can live up to 12 years.")
    print("Rabbits have almost 360-degree vision.")

def show_goodbye():
    print("Thanks for using Animal Fact Finder!")

show_menu()
choice = input("Enter 1, 2 or 3: ")
if choice == "1":
    dog_facts()
elif choice == "2":
    cat_facts()
elif choice == "3":
    rabbit_facts()
else:
    print("Sorry, that's not a valid option.")
show_goodbye()
`.trim();

const VALID_EXT_PROGRAM = `
def show_menu():
    print("1. Dog  2. Cat  3. Rabbit  4. Quit")

def dog_facts():
    print("Dogs are loyal.")
    print("Dogs can bark.")

def cat_facts():
    print("Cats purr.")
    print("Cats sleep a lot.")

def rabbit_facts():
    print("Rabbits hop.")
    print("Rabbits eat plants.")

def show_goodbye():
    print("Goodbye!")

while True:
    show_menu()
    choice = input("Enter 1-4: ")
    if choice == "1":
        dog_facts()
    elif choice == "2":
        cat_facts()
    elif choice == "3":
        rabbit_facts()
    elif choice == "4":
        show_goodbye()
        break
    else:
        print("Sorry, that's not a valid option.")
`.trim();

// ─── Helper to navigate through all stages ───────────────────────────────────

async function advanceToModify(page) {
  await fillPredict(page);
  await page.locator('button:has-text("Check predictions")').click();
  await fillRun(page);
  await page.locator('button:has-text("Check response")').click();
  await page.locator('button:has-text("go to Investigate")').click();
  await fillInvestigate(page);
  await page.locator('button:has-text("Finish Investigation")').click();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE SHELL
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Page shell', () => {
  test.beforeEach(async ({ page }) => { await page.goto(ACTIVITY); });

  test('page loads with correct title', async ({ page }) => {
    await expectPageTitle(page, /PRIMM Practice.*Functions.*Year 8/);
  });

  test('starts on Predict stage', async ({ page }) => {
    await expectActiveStage(page, 'P');
    await expect(page.locator('#stage-R')).not.toHaveClass(/active/);
  });

  test('progress bar starts at 20%', async ({ page }) => {
    await expectProgressBar(page, 20);
  });

  test('no classroom banner without courseId', async ({ page }) => {
    await expectNoClassroomBanner(page);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PREDICT stage
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Predict stage', () => {
  test.beforeEach(async ({ page }) => { await page.goto(ACTIVITY); });

  test('shows warning when submitted with no answers', async ({ page }) => {
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#predictWarning')).toBeVisible();
    await expectActiveStage(page, 'P');
  });

  test('marks unanswered q-cards as error', async ({ page }) => {
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#qcard_p2')).toHaveClass(/error/);
    await expect(page.locator('#qcard_p3')).toHaveClass(/error/);
    await expect(page.locator('#qcard_p4')).toHaveClass(/error/);
    await expect(page.locator('#qcard_p5')).toHaveClass(/error/);
  });

  test('correct answers show pass feedback', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#fb_p2')).toHaveClass(/pass/);
    await expect(page.locator('#fb_p3')).toHaveClass(/pass/);
    await expect(page.locator('#fb_p4')).toHaveClass(/pass/);
    await expect(page.locator('#fb_p5')).toHaveClass(/pass/);
  });

  test('wrong answers still advance (attempt is enough)', async ({ page }) => {
    await page.locator('input[name="p2"][value="def greet():"]').check();
    await page.locator('#p3').fill('wrong');
    await page.locator('input[name="p4"][value="1"]').check();
    await page.locator('input[name="p5"][value="error"]').check();
    await page.locator('button:has-text("Check predictions")').click();
    await expectActiveStage(page, 'R');
    await expect(page.locator('#fb_p2')).toHaveClass(/fail/);
  });

  test('correct answers advance to Run and mark P done', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await expectActiveStage(page, 'R');
    await expectDoneStage(page, 'P');
  });

  test('progress bar advances after completing P', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    const width = await page.locator('#progressFill').evaluate(el => parseInt(el.style.width));
    expect(width).toBeGreaterThan(20);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  RUN stage
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Run stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACTIVITY);
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
  });

  test('rejects empty textareas', async ({ page }) => {
    await page.locator('button:has-text("Check response")').click();
    await expect(page.locator('#qcard_r1')).toHaveClass(/error/);
    await expectActiveStage(page, 'R');
  });

  test('rejects nonsense keyboard-mashing', async ({ page }) => {
    await page.locator('#r1').fill('asdfasdfasdf');
    await page.locator('button:has-text("Check response")').click();
    await expect(page.locator('#qcard_r1')).toHaveClass(/error/);
  });

  test('valid answers advance to Investigate', async ({ page }) => {
    await fillRun(page);
    await page.locator('button:has-text("Check response")').click();
    await page.locator('button:has-text("go to Investigate")').click();
    await expectActiveStage(page, 'I');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  INVESTIGATE stage
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Investigate stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACTIVITY);
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await fillRun(page);
    await page.locator('button:has-text("Check response")').click();
    await page.locator('button:has-text("go to Investigate")').click();
  });

  test('rejects empty fields', async ({ page }) => {
    await page.locator('#qcard_i1 button:has-text("Next Investigation")').click();
    await expect(page.locator('#qcard_i1')).toHaveClass(/error/);
  });

  test('I4 rejects answer missing bracket/call keywords', async ({ page }) => {
    await page.locator('#i1').fill('Something happened.');
    await page.locator('#qcard_i1 button:has-text("Next Investigation")').click();
    await page.locator('#i2').fill('Repeat.');
    await page.locator('#qcard_i2 button:has-text("Next Investigation")').click();
    await page.locator('#i3').fill('Name.');
    await page.locator('#qcard_i3 button:has-text("Next Investigation")').click();
    await page.locator('#i4').fill('Nonsense answer.');
    await page.locator('#qcard_i4 button:has-text("Next Investigation")').click();
    await expect(page.locator('#qcard_i4')).toHaveClass(/error/);
  });

  test('valid answers advance to Modify', async ({ page }) => {
    await fillInvestigate(page);
    await page.locator('button:has-text("Finish Investigation")').click();
    await expectActiveStage(page, 'M1');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MODIFY stage — DOM wiring (checker logic tested in checkers.test.js)
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Modify stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACTIVITY);
    await page.locator('[data-stage="M1"]').click();
  });

  test('checker warns when textarea is empty', async ({ page }) => {
    await page.locator('#m1_editor').fill('');
    await page.locator('#btn_check_m1').click();
    await expect(page.locator('#fb_m1')).toContainText('Write some code first');
  });

  test('valid mod1 code shows pass feedback', async ({ page }) => {
    const code = [
      'def hello():',
      '    print("Hello!")',
      '    print("Have a great day.")',
      '',
      'def farewell():',
      '    print("Goodbye!")',
      '',
      'hello()',
      'farewell()',
    ].join('\n');
    await page.locator('#m1_editor').fill(code);
    await page.locator('#btn_check_m1').click();
    await expect(page.locator('#fb_m1')).toHaveClass(/pass/, { timeout: 60000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MAKE stage — DOM wiring + completion
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Make stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACTIVITY);
    await page.locator('[data-stage="M2"]').click();
  });

  test('warns on empty submission', async ({ page }) => {
    await page.locator('#btn_check_m2').click();
    await expect(page.locator('#fb_m2')).toContainText('Paste your program');
  });

  test('valid program shows pass feedback and completion banner', async ({ page }) => {
    await page.locator('#m2_editor').fill(VALID_MAKE_PROGRAM);
    await page.locator('#btn_check_m2').click();
    await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 60000 });
    await expectCompletionBanner(page, 'PRIMM Complete');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  EXTENSION — DOM wiring
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Extension', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACTIVITY);
    await page.locator('[data-stage="M2"]').click();
  });

  test('valid extension code shows pass feedback', async ({ page }) => {
    // Must complete Make task first to reveal Extension
    await page.locator('#m2_editor').fill(VALID_MAKE_PROGRAM);
    await page.locator('#btn_check_m2').click();

    // Now check extension
    await page.locator('#m2_editor').fill(VALID_EXT_PROGRAM);
    await page.locator('#btn_check_m2').click(); // Button now triggers checkExt
    await expect(page.locator('#fb_m2')).toHaveClass(/pass/, { timeout: 60000 });
  });
});
