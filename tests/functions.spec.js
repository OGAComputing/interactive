import { test, expect } from '@playwright/test';
import { mockSignedOut, mockAsStudent, mockAsTeacher } from './helpers/mockClassroom.js';

const ACTIVITY = '/Y8/Python/L4_Functions/1_Functions.html';
const COURSE_ID = 'test-course-123';

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function fillPredict(page) {
  await page.locator('input[name="p2"][value="greet()"]').check();
  await page.locator('#p3').fill('Hello!');
  await page.locator('input[name="p4"][value="2"]').check();
  await page.locator('input[name="p5"][value="nothing"]').check();
}

async function fillRun(page) {
  await page.locator('#r1').fill('I saw Hello! and Have a great day. in the output panel.');
  await page.locator('#r2').fill('def tells Python to create and store the function without running it.');
}

async function fillInvestigate(page) {
  await page.locator('#i1').fill('A third line appeared: Nice to meet you!');
  await page.locator('#i2').fill('The greeting printed twice because greet() was called twice.');
  await page.locator('#i3').fill('The first line changed to show my own name instead of Hello.');
  await page.locator('#i4').fill('Nothing happened because without brackets Python does not call the function, it just references the object.');
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

// ═══════════════════════════════════════════════════════════════════════════════
//  UNAUTHENTICATED — no courseId in URL
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Unauthenticated (no courseId)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACTIVITY);
  });

  // ── Page shell ──────────────────────────────────────────────────────────────

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/PRIMM Practice.*Functions.*Year 8/);
  });

  test('starts on Predict stage', async ({ page }) => {
    await expect(page.locator('#stage-P')).toHaveClass(/active/);
    await expect(page.locator('[data-stage="P"]')).toHaveClass(/active/);
    await expect(page.locator('#stage-R')).not.toHaveClass(/active/);
  });

  test('progress bar starts at 20%', async ({ page }) => {
    const width = await page.locator('#progressFill').evaluate(el => el.style.width);
    expect(width).toBe('20%');
  });

  test('no classroom banner injected', async ({ page }) => {
    await expect(page.locator('#classroom-banner')).not.toBeAttached();
  });

  // ── PREDICT stage ───────────────────────────────────────────────────────────

  test('predict: shows warning when submitted with no answers', async ({ page }) => {
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#predictWarning')).toBeVisible();
    await expect(page.locator('#stage-P')).toHaveClass(/active/);
  });

  test('predict: marks unanswered q-cards as error', async ({ page }) => {
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#qcard_p2')).toHaveClass(/error/);
    await expect(page.locator('#qcard_p3')).toHaveClass(/error/);
    await expect(page.locator('#qcard_p4')).toHaveClass(/error/);
    await expect(page.locator('#qcard_p5')).toHaveClass(/error/);
  });

  test('predict: correct answers show pass feedback', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#fb_p2')).toHaveClass(/pass/);
    await expect(page.locator('#fb_p3')).toHaveClass(/pass/);
    await expect(page.locator('#fb_p4')).toHaveClass(/pass/);
    await expect(page.locator('#fb_p5')).toHaveClass(/pass/);
  });

  test('predict: wrong answers still advance (attempt is enough)', async ({ page }) => {
    await page.locator('input[name="p2"][value="def greet():"]').check();
    await page.locator('#p3').fill('wrong');
    await page.locator('input[name="p4"][value="1"]').check();
    await page.locator('input[name="p5"][value="error"]').check();
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#stage-R')).toHaveClass(/active/);
    await expect(page.locator('#fb_p2')).toHaveClass(/fail/);
  });

  test('predict: correct answers advance to Run and mark P done', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#stage-R')).toHaveClass(/active/);
    await expect(page.locator('[data-stage="P"]')).toHaveClass(/done/);
  });

  test('predict: progress bar advances after completing P', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    const width = await page.locator('#progressFill').evaluate(el => parseInt(el.style.width));
    expect(width).toBeGreaterThan(20);
  });

  // ── RUN stage ───────────────────────────────────────────────────────────────

  test('run: rejects empty textareas', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await page.locator('button:has-text("go to Investigate")').click();
    await expect(page.locator('#qcard_r1')).toHaveClass(/error/);
    await expect(page.locator('#qcard_r2')).toHaveClass(/error/);
    await expect(page.locator('#stage-R')).toHaveClass(/active/);
  });

  test('run: rejects nonsense keyboard-mashing', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await page.locator('#r1').fill('asdfasdfasdf');
    await page.locator('#r2').fill('qwerqwerqwer');
    await page.locator('button:has-text("go to Investigate")').click();
    await expect(page.locator('#qcard_r1')).toHaveClass(/error/);
  });

  test('run: valid answers advance to Investigate', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await fillRun(page);
    await page.locator('button:has-text("go to Investigate")').click();
    await expect(page.locator('#stage-I')).toHaveClass(/active/);
  });

  // ── INVESTIGATE stage ───────────────────────────────────────────────────────

  test('investigate: rejects empty fields', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await fillRun(page);
    await page.locator('button:has-text("go to Investigate")').click();
    await page.locator('button:has-text("go to Modify")').click();
    await expect(page.locator('#qcard_i1')).toHaveClass(/error/);
  });

  test('investigate: I4 rejects answer missing bracket/call keywords', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await fillRun(page);
    await page.locator('button:has-text("go to Investigate")').click();
    // Fill all except give a vague i4
    await page.locator('#i1').fill('Something happened to the output.');
    await page.locator('#i2').fill('The output repeated because it was called twice.');
    await page.locator('#i3').fill('The name changed in the output.');
    await page.locator('#i4').fill('It just did something different on screen.');  // missing keyword
    await page.locator('#i5').fill('Both functions printed their lines.');
    await page.locator('button:has-text("go to Modify")').click();
    await expect(page.locator('#qcard_i4')).toHaveClass(/error/);
  });

  test('investigate: valid answers advance to Modify', async ({ page }) => {
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await fillRun(page);
    await page.locator('button:has-text("go to Investigate")').click();
    await fillInvestigate(page);
    await page.locator('button:has-text("go to Modify")').click();
    await expect(page.locator('#stage-M1')).toHaveClass(/active/);
  });

  // ── MODIFY stage — code checkers ────────────────────────────────────────────

  // Helper: find the Check code button for a given checker textarea id.
  // Uses CSS general sibling combinator (~) since textarea and checker-footer
  // are siblings inside .code-checker.
  function checkBtn(page, textareaId) {
    return page.locator(`#${textareaId} ~ .checker-footer .btn-check`);
  }

  test('modify: checker warns when textarea is empty', async ({ page }) => {
    await page.locator('[data-stage="M1"]').click();
    await checkBtn(page, 'm1_code1').click();
    await expect(page.locator('#fb_m1_code1')).toContainText('Paste your code');
  });

  test('modify: mod1 passes when greet correctly renamed to say_hello', async ({ page }) => {
    await page.locator('[data-stage="M1"]').click();
    const code = [
      'def say_hello():',
      '    print("Hello!")',
      '    print("Have a great day.")',
      '',
      'def farewell():',
      '    print("Goodbye!")',
      '',
      'say_hello()',
      'farewell()',
    ].join('\n');
    await page.locator('#m1_code1').fill(code);
    await checkBtn(page, 'm1_code1').click();
    await expect(page.locator('#fb_m1_code1')).toHaveClass(/pass/);
    await expect(page.locator('#fb_m1_code1')).toContainText('✅');
  });

  test('modify: mod1 fails if greet is not renamed', async ({ page }) => {
    await page.locator('[data-stage="M1"]').click();
    const code = 'def greet():\n    print("Hello!")\n\ngreet()';
    await page.locator('#m1_code1').fill(code);
    await checkBtn(page, 'm1_code1').click();
    await expect(page.locator('#fb_m1_code1')).toHaveClass(/fail/);
    await expect(page.locator('#fb_m1_code1')).toContainText('say_hello');
  });

  test('modify: mod1 fails if farewell function is removed', async ({ page }) => {
    // The checker requires farewell() to still be present (check 4).
    // (Note: the checker detects say_hello() via substring of "def say_hello():"
    //  so the only testable failure modes are: missing def, old name kept, farewell removed.)
    await page.locator('[data-stage="M1"]').click();
    const code = 'def say_hello():\n    print("Hello!")\n\nsay_hello()';
    await page.locator('#m1_code1').fill(code);
    await checkBtn(page, 'm1_code1').click();
    await expect(page.locator('#fb_m1_code1')).toHaveClass(/fail/);
    await expect(page.locator('#fb_m1_code1')).toContainText('farewell');
  });

  test('modify: mod3 fails if farewell not renamed to say_goodbye', async ({ page }) => {
    await page.locator('[data-stage="M1"]').click();
    const code = 'def say_hello():\n    print("Hi")\n\ndef farewell():\n    print("Bye")\n\nsay_hello()\nfarewell()';
    await page.locator('#m1_code3').fill(code);
    await checkBtn(page, 'm1_code3').click();
    await expect(page.locator('#fb_m1_code3')).toHaveClass(/fail/);
    await expect(page.locator('#fb_m1_code3')).toContainText('say_goodbye');
  });

  test('modify: mod4 passes when print_line() is defined and called inside say_hello', async ({ page }) => {
    await page.locator('[data-stage="M1"]').click();
    const code = [
      'def print_line():',
      '    print("----------")',
      '',
      'def say_hello():',
      '    print_line()',
      '    print("Hello!")',
      '    print_line()',
      '',
      'def say_goodbye():',
      '    print("Goodbye!")',
      '',
      'say_hello()',
      'say_goodbye()',
    ].join('\n');
    await page.locator('#m1_code4').fill(code);
    await checkBtn(page, 'm1_code4').click();
    await expect(page.locator('#fb_m1_code4')).toHaveClass(/pass/);
  });

  // ── MAKE stage ──────────────────────────────────────────────────────────────

  test('make: warns on empty submission', async ({ page }) => {
    await page.locator('[data-stage="M2"]').click();
    await page.locator('button:has-text("Check my program")').click();
    await expect(page.locator('#fb_m2_make')).toContainText('Paste your program');
  });

  test('make: fails when fewer than 5 functions defined', async ({ page }) => {
    await page.locator('[data-stage="M2"]').click();
    const code = 'def show_menu():\n    print("Menu")\n\nchoice = input("Enter: ")\nif choice == "1":\n    pass\nelif choice == "2":\n    pass\nelse:\n    print("Sorry, that\'s not a valid option.")\n';
    await page.locator('#m2_make').fill(code);
    await page.locator('button:has-text("Check my program")').click();
    await expect(page.locator('#fb_m2_make')).toHaveClass(/fail/);
    await expect(page.locator('#fb_m2_make')).toContainText('5 function');
  });

  test('make: fails when input() is missing', async ({ page }) => {
    await page.locator('[data-stage="M2"]').click();
    const code = [
      'def show_menu(): print("Menu")',
      'def dog_facts(): print("Dog")',
      'def cat_facts(): print("Cat")',
      'def rabbit_facts(): print("Rabbit")',
      'def show_goodbye(): print("Bye")',
      'show_menu()',
      'choice = "1"',
      'if choice == "1": dog_facts()',
      'elif choice == "2": cat_facts()',
      'else: print("Sorry, that\'s not a valid option.")',
    ].join('\n');
    await page.locator('#m2_make').fill(code);
    await page.locator('button:has-text("Check my program")').click();
    await expect(page.locator('#fb_m2_make')).toHaveClass(/fail/);
    await expect(page.locator('#fb_m2_make')).toContainText('input()');
  });

  test('make: passes a complete valid program', async ({ page }) => {
    await page.locator('[data-stage="M2"]').click();
    await page.locator('#m2_make').fill(VALID_MAKE_PROGRAM);
    await page.locator('button:has-text("Check my program")').click();
    await expect(page.locator('#fb_m2_make')).toHaveClass(/pass/);
    await expect(page.locator('#fb_m2_make')).toContainText('✅');
  });

  test('make: completion banner appears after passing', async ({ page }) => {
    await page.locator('[data-stage="M2"]').click();
    await page.locator('#m2_make').fill(VALID_MAKE_PROGRAM);
    await page.locator('button:has-text("Check my program")').click();
    await expect(page.locator('#completionBanner')).toBeVisible();
    await expect(page.locator('#completionBanner h3')).toContainText('PRIMM Complete');
  });

  // ── EXTENSION ───────────────────────────────────────────────────────────────

  test('extension: fails when while loop is missing', async ({ page }) => {
    await page.locator('[data-stage="M2"]').click();
    const code = 'def show_menu():\n    print("Menu")\nshow_menu()\nif True:\n    pass\nbreak';
    await page.locator('#m2_ext').fill(code);
    await page.locator('button:has-text("Mark extension complete")').click();
    await expect(page.locator('#fb_m2_ext')).toHaveClass(/fail/);
    await expect(page.locator('#fb_m2_ext')).toContainText('while');
  });

  test('extension: passes with while loop and break', async ({ page }) => {
    await page.locator('[data-stage="M2"]').click();
    await page.locator('#m2_ext').fill(VALID_EXT_PROGRAM);
    await page.locator('button:has-text("Mark extension complete")').click();
    await expect(page.locator('#fb_m2_ext')).toHaveClass(/pass/);
    await expect(page.locator('#fb_m2_ext')).toContainText('✅');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CLASSROOM CONTEXT — signed out (banner visible, auth blocks predict)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Classroom context — signed out', () => {
  test.beforeEach(async ({ page }) => {
    await mockSignedOut(page);
    await page.goto(`${ACTIVITY}?courseId=${COURSE_ID}`);
  });

  test('classroom banner is injected', async ({ page }) => {
    await expect(page.locator('#classroom-banner')).toBeAttached();
  });

  test('sign-in button is visible', async ({ page }) => {
    await expect(page.locator('#classroom-signin-btn')).toBeVisible();
    await expect(page.locator('#classroom-signin-btn')).not.toHaveClass(/hidden/);
  });

  test('status dot starts red (offline)', async ({ page }) => {
    await expect(page.locator('#classroom-dot')).not.toHaveClass(/online/);
    await expect(page.locator('#classroom-dot')).not.toHaveClass(/teacher/);
  });

  test('predict check is blocked and shows alert when not signed in', async ({ page }) => {
    await fillPredict(page);
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Check predictions")').click();
    // Alert shown → still on P stage
    await expect(page.locator('#stage-P')).toHaveClass(/active/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CLASSROOM CONTEXT — signed in as student
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Classroom context — signed in as student', () => {
  test.beforeEach(async ({ page }) => {
    await mockAsStudent(page, COURSE_ID);
    await page.goto(`${ACTIVITY}?courseId=${COURSE_ID}`);
  });

  test('banner shows Connected after sign-in', async ({ page }) => {
    await expect(page.locator('#classroom-text')).toContainText('Connected to Google Classroom', { timeout: 5000 });
  });

  test('status dot is green (online) after sign-in', async ({ page }) => {
    await expect(page.locator('#classroom-dot')).toHaveClass(/online/, { timeout: 5000 });
  });

  test('sign-in button is hidden after sign-in', async ({ page }) => {
    await expect(page.locator('#classroom-signin-btn')).toHaveClass(/hidden/, { timeout: 5000 });
  });

  test('predict check proceeds normally after sign-in', async ({ page }) => {
    await expect(page.locator('#classroom-text')).toContainText('Connected', { timeout: 5000 });
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#stage-R')).toHaveClass(/active/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CLASSROOM CONTEXT — signed in as teacher
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Classroom context — signed in as teacher', () => {
  test.beforeEach(async ({ page }) => {
    await mockAsTeacher(page, COURSE_ID);
    await page.goto(`${ACTIVITY}?courseId=${COURSE_ID}`);
  });

  test('status dot is amber (teacher) after sign-in', async ({ page }) => {
    await expect(page.locator('#classroom-dot')).toHaveClass(/teacher/, { timeout: 5000 });
  });

  test('shows Teacher mode text after sign-in', async ({ page }) => {
    await expect(page.locator('#classroom-text')).toContainText('Teacher mode', { timeout: 5000 });
  });
});
