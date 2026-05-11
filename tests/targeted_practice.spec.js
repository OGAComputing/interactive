import { test, expect } from '@playwright/test';

const ACTIVITY = '/Y8/Python/L6_Targeted_Practice/1_Targeted_Practice.html';

// Register a page init script that seeds localStorage before the page loads.
// Call this BEFORE page.goto(). Each test's `page` fixture is fresh so
// addInitScript registrations don't accumulate across tests.
function seedAssessResults(page, overrides = {}) {
  const qPoints = Object.assign({
    qE1:1, qE2:1, qE3:1, qE4:1,            // errors_read — pass
    qE5:1, qE6:1,                            // errors_fix  — pass
    qC1:0, qC2:0, qC4:0, qC5:0,            // cast_to_int — WEAK (default)
    qC3:1, qC6:1,                            // cast_to_str — pass
    qL1:1, qL2:1, qL3:1, qLC1:1,           // range_basics — 4/5 = 0.8, not weak
    qL4:1, qLC2:1, qLC3:1,                  // turtle_loops — 3/5 = 0.6, not weak
    qF1:1, qF2:1, qF3:1, qF4:1, qFC1:1,   // function_basics — 5/6 = 0.83, not weak
    qFC2:2,                                  // function_loop — 2/2 = 1.0, not weak
    qB1:2, qB2:2,                            // foundational — pass
  }, overrides);
  return page.addInitScript(d => {
    localStorage.setItem('oga_y8py_assess_v1', JSON.stringify({ qPoints: d }));
  }, qPoints);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE SHELL
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Page shell', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto(ACTIVITY);
    await expect(page).toHaveTitle(/Targeted Practice.*Year 8 Python/);
  });

  test('no classroom banner without courseId', async ({ page }) => {
    await page.goto(ACTIVITY);
    await expect(page.locator('#classroom-banner')).not.toBeAttached();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  FALLBACK — shown when no localStorage data is available
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Fallback (no data)', () => {
  test.beforeEach(async ({ page }) => {
    // No seed — localStorage is empty, so it falls back to showing all activities.
    await page.goto(ACTIVITY);
  });

  test('shows plan screen instead of picker', async ({ page }) => {
    await expect(page.locator('#plan-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#plan-list')).toBeVisible();
  });

  test('shows a full list of all activities in fallback mode', async ({ page }) => {
    // All clusters (9) + extension (1) = 10
    await expect(page.locator('#plan-list li')).toHaveCount(10);
  });

  test('clicking Start practising from fallback builds tabs', async ({ page }) => {
    await page.locator('#plan-screen button:has-text("Start practising")').click();
    await expect(page.locator('#tab-bar')).toBeVisible();
    await expect(page.locator('.tab').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PLAN SCREEN — shown when localStorage data is present
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Plan screen (with data)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAssessResults(page); // cast_to_int (0/4) and range_basics (4/8) are weak
    await page.goto(ACTIVITY);
  });

  test('shows plan screen with cluster list', async ({ page }) => {
    await expect(page.locator('#plan-screen')).toBeVisible({ timeout: 5000 });
    // weak clusters (2) + extension (1) = 3
    await expect(page.locator('#plan-list li')).toHaveCount(3);
  });

  test('plan screen shows assessment score for the weak cluster', async ({ page }) => {
    await expect(page.locator('#plan-list')).toContainText('0/4');
  });

  test('clicking Start practising builds tabs', async ({ page }) => {
    await page.locator('#plan-screen button:has-text("Start practising")').click();
    await expect(page.locator('#tab-bar')).toBeVisible();
    await expect(page.locator('.tab').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TABS + PANEL STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Tabs and panels', () => {
  test.beforeEach(async ({ page }) => {
    await seedAssessResults(page); // one weak cluster: cast_to_int
    await page.goto(ACTIVITY);
    await expect(page.locator('#plan-screen')).toBeVisible({ timeout: 5000 });
    await page.locator('#plan-screen button:has-text("Start practising")').click();
  });

  test('first cluster tab is active on start', async ({ page }) => {
    const firstTab = page.locator('.tab').first();
    await expect(firstTab).toHaveClass(/active/);
  });

  test('first panel is visible', async ({ page }) => {
    await expect(page.locator('#panel-0')).toBeVisible();
  });

  test('Reflect tab appears at the end', async ({ page }) => {
    const tabs = page.locator('.tab');
    const lastTab = tabs.last();
    await expect(lastTab).toContainText('Reflect');
  });

  test('Task B is locked until Task A passes', async ({ page }) => {
    await expect(page.locator('#panel-0 .locked-task')).toBeVisible();
  });

  test('optional examples and hints are hidden until opened', async ({ page }) => {
    await expect(page.locator('#panel-0 .optional-example').first()).toBeVisible();
    await expect(page.locator('#panel-0 .worked-example').first()).not.toBeVisible();
    await expect(page.locator('#panel-0 .optional-hint').first()).toBeVisible();
    await expect(page.locator('#panel-0 .q-hint').first()).not.toBeVisible();
  });

  test('optional reminders name the current skill', async ({ page }) => {
    await expect(page.locator('#panel-0 .optional-reminder summary').first())
      .toHaveText('Remind me how casting input to a number works');
  });

  test('clicking a different tab switches panels', async ({ page }) => {
    const tabs = page.locator('.tab');
    const count = await tabs.count();
    if (count > 2) {
      // Click second cluster tab
      await tabs.nth(1).click();
      await expect(page.locator('#panel-1')).toBeVisible();
      await expect(page.locator('#panel-0')).not.toBeVisible();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TASK CHECK — MCQ cluster (errors_read)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Task check — MCQ (errors_read)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAssessResults(page, {
      qE1: 0, qE2: 0, qE3: 0, qE4: 0,  // errors_read WEAK
      qC1: 1, qC2: 1, qC4: 1, qC5: 1,  // cast_to_int PASS (override default)
    });
    await page.goto(ACTIVITY);
    await expect(page.locator('#plan-screen')).toBeVisible({ timeout: 5000 });
    await page.locator('#plan-screen button:has-text("Start practising")').click();
    await expect(page.locator('#tab-bar')).toBeVisible();
  });

  test('warns when submitting with no MCQ selection', async ({ page }) => {
    // errors_read Task A is MCQ — click Check with nothing selected
    const checkBtn = page.locator('#errors_read_A-btn');
    await checkBtn.click();
    await expect(page.locator('#errors_read_A-fb')).toContainText('select an answer');
  });

  test('wrong MCQ answer shows fail feedback', async ({ page }) => {
    await page.locator('input[name="errors_read_A"][value="A"]').check();
    await page.locator('#errors_read_A-btn').click();
    await expect(page.locator('#errors_read_A-fb')).toHaveClass(/fail/);
  });

  test('correct MCQ answer shows pass and unlocks Task B', async ({ page }) => {
    await page.locator('input[name="errors_read_A"][value="C"]').check();
    await page.locator('#errors_read_A-btn').click();
    await expect(page.locator('#errors_read_A-fb')).toHaveClass(/pass/);
    await expect(page.locator('#errors_read_B')).not.toHaveClass(/locked-task/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TASK CHECK — code cluster (cast_to_int)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Task check — code (cast_to_int)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAssessResults(page); // cast_to_int weak by default
    await page.goto(ACTIVITY);
    await expect(page.locator('#plan-screen')).toBeVisible({ timeout: 5000 });
    await page.locator('#plan-screen button:has-text("Start practising")').click();
    await expect(page.locator('#tab-bar')).toBeVisible();
  });

  test('warns on empty textarea', async ({ page }) => {
    await page.locator('#cast_to_int_A-ta').fill('');
    await page.locator('#cast_to_int_A-btn').click();
    await expect(page.locator('#cast_to_int_A-fb')).toContainText('write some code');
  });

  test('wrong code shows fail feedback', async ({ page }) => {
    await page.locator('#cast_to_int_A-ta').fill('age = input("Age? ")\nprint(age)');
    await page.locator('#cast_to_int_A-btn').click();
    await expect(page.locator('#cast_to_int_A-fb')).toHaveClass(/fail/, { timeout: 30000 });
  });

  test('valid code passes and unlocks Task B', async ({ page }) => {
    await page.locator('#cast_to_int_A-ta').fill('age = int(input("Age? "))\nprint(age + 1)');
    await page.locator('#cast_to_int_A-btn').click();
    await expect(page.locator('#cast_to_int_A-fb')).toHaveClass(/pass/, { timeout: 30000 });
    await expect(page.locator('#cast_to_int_B')).not.toHaveClass(/locked-task/);
  });

  test('Task B can be completed after Task A passes', async ({ page }) => {
    // First pass Task A
    await page.locator('#cast_to_int_A-ta').fill('age = int(input("Age? "))\nprint(age + 1)');
    await page.locator('#cast_to_int_A-btn').click();
    await expect(page.locator('#cast_to_int_A-fb')).toHaveClass(/pass/, { timeout: 30000 });

    // Then complete Task B
    await page.locator('#cast_to_int_B-ta').fill('mins = int(input("Minutes? "))\nprint(mins * 60)');
    await page.locator('#cast_to_int_B-btn').click();
    await expect(page.locator('#cast_to_int_B-fb')).toHaveClass(/pass/, { timeout: 30000 });
  });

  test('completing both tasks marks the tab as done', async ({ page }) => {
    await page.locator('#cast_to_int_A-ta').fill('age = int(input("Age? "))\nprint(age + 1)');
    await page.locator('#cast_to_int_A-btn').click();
    await expect(page.locator('#cast_to_int_A-fb')).toHaveClass(/pass/, { timeout: 30000 });

    await page.locator('#cast_to_int_B-ta').fill('mins = int(input("Minutes? "))\nprint(mins * 60)');
    await page.locator('#cast_to_int_B-btn').click();
    await expect(page.locator('#cast_to_int_B-fb')).toHaveClass(/pass/, { timeout: 30000 });

    // First cluster tab should now be marked done
    await expect(page.locator('.tab[data-idx="0"]')).toHaveClass(/done/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SCORE
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Task check - code execution (range_basics)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAssessResults(page, {
      qC1: 1, qC2: 1, qC4: 1, qC5: 1,     // cast_to_int PASS (override default)
      qL1: 0, qL2: 0, qL3: 0, qLC1: 0,    // range_basics WEAK
    });
    await page.goto(ACTIVITY);
    await expect(page.locator('#plan-screen')).toBeVisible({ timeout: 5000 });
    await page.locator('#plan-screen button:has-text("Start practising")').click();
    await expect(page.locator('#tab-bar')).toBeVisible();
  });

  test('Check runs the code and accepts lowercase hi four times', async ({ page }) => {
    await page.locator('#range_basics_A-ta').fill('for i in range(4):\n    print("hi")');
    await page.locator('#range_basics_A-btn').click();

    await expect(page.locator('#range_basics_A-fb')).toHaveClass(/pass/, { timeout: 30000 });
    await expect(page.locator('#range_basics_A .output-content')).toContainText('hi');
  });

  test('range reminder reads naturally', async ({ page }) => {
    await expect(page.locator('#panel-0 .sec-title')).toHaveText('Using range()');
    await expect(page.locator('#panel-0 .optional-reminder summary').first())
      .toHaveText('Remind me how using range() works');
  });

  test('Check shows Python errors in the editor output', async ({ page }) => {
    await page.locator('#range_basics_A-ta').fill('for i in range(4)\n    print("hi")');
    await page.locator('#range_basics_A-btn').click();

    await expect(page.locator('#range_basics_A-fb')).toContainText('Fix the error shown', { timeout: 30000 });
    await expect(page.locator('#range_basics_A .output-panel')).toHaveClass(/error/);
    await expect(page.locator('#range_basics_A .output-content')).toContainText('SyntaxError');
  });

  test('Check gives precise feedback for Hi with punctuation', async ({ page }) => {
    await page.locator('#range_basics_A-ta').fill('for i in range(4):\n    print("Hi!")');
    await page.locator('#range_basics_A-btn').click();

    await expect(page.locator('#range_basics_A-fb')).toContainText('no exclamation mark', { timeout: 30000 });
    await expect(page.locator('#range_basics_A .output-content')).toContainText('Hi!');
  });
});

test.describe('Task check - relaxed output checks (function_basics)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAssessResults(page, {
      qC1: 1, qC2: 1, qC4: 1, qC5: 1,   // cast_to_int PASS (override default)
      qF1: 0, qF2: 0, qF3: 0, qF4: 0, qFC1: 0, // function_basics WEAK
    });
    await page.goto(ACTIVITY);
    await expect(page.locator('#plan-screen')).toBeVisible({ timeout: 5000 });
    await page.locator('#plan-screen button:has-text("Start practising")').click();
    await expect(page.locator('#tab-bar')).toBeVisible();
  });

  test('Goodbye task accepts any three output lines containing bye', async ({ page }) => {
    await page.locator('#function_basics_A-ta').fill('print("bye")\nprint("bye for now")\nprint("goodbye")');
    await page.locator('#function_basics_A-btn').click();

    await expect(page.locator('#function_basics_A-fb')).toHaveClass(/pass/, { timeout: 30000 });
    await expect(page.locator('#function_basics_A .output-content')).toContainText('bye');
  });
});

test.describe('Task check - fill blanks (function_loop)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAssessResults(page, {
      qC1: 1, qC2: 1, qC4: 1, qC5: 1, // cast_to_int PASS (override default)
      qL1: 1, qL2: 1, qL3: 1, qLC1: 1, qLM1: 1, qLC4: 1, // range_basics PASS
      qFC2: 0,                         // function_loop WEAK
    });
    await page.goto(ACTIVITY);
    await expect(page.locator('#plan-screen')).toBeVisible({ timeout: 5000 });
    await page.locator('#plan-screen button:has-text("Start practising")').click();
    await expect(page.locator('#function_loop_A')).toBeVisible();
  });

  test('square task asks for blanks instead of a full editor', async ({ page }) => {
    await expect(page.locator('#function_loop_A .fill-input')).toHaveCount(4);
    await expect(page.locator('#function_loop_A .checker-textarea')).toHaveCount(0);
  });

  test('square task passes when all four blanks are completed', async ({ page }) => {
    await page.locator('#function_loop_A-name').fill('square');
    await page.locator('#function_loop_A-repeat').fill('4');
    await page.locator('#function_loop_A-turn').fill('90');
    await page.locator('#function_loop_A-call').fill('square()');
    await page.locator('#function_loop_A-btn').click();

    await expect(page.locator('#function_loop_A-fb')).toHaveClass(/pass/);
    await expect(page.locator('#function_loop_B')).not.toHaveClass(/locked-task/);
  });

  test('square task prompts students to complete every blank', async ({ page }) => {
    await page.locator('#function_loop_A-name').fill('square');
    await page.locator('#function_loop_A-btn').click();

    await expect(page.locator('#function_loop_A-fb')).toContainText('Complete all four blanks');
  });
});

test.describe('Extension game flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACTIVITY);
    await expect(page.locator('#plan-screen')).toBeVisible({ timeout: 5000 });
    await page.locator('#plan-screen button:has-text("Start practising")').click();
    await page.getByRole('button', { name: /Build a guessing game/ }).click();
    await expect(page.locator('#game_build_A')).toBeVisible();
  });

  test('stretch uses the same editor and paste is not allowed', async ({ page }) => {
    await expect(page.locator('#game_build_A-ta')).toBeVisible();
    await expect(page.locator('#game_build_A-ta')).not.toHaveAttribute('data-allowPaste', 'true');
    await expect(page.locator('#game_build_B-ta')).toHaveCount(0);
    await expect(page.locator('#game_build_B')).toContainText('same Guessing Game editor above');
  });

  test('first check leaves the game editor editable for the stretch', async ({ page }) => {
    const baseGame = [
      'def greet():',
      '    print("Welcome to Guess My Number!")',
      '',
      'greet()',
      'secret = 7',
      'for i in range(5):',
      '    guess = int(input("Guess: "))',
      '    if guess == secret:',
      '        print("Correct!")',
      '        break',
      '    elif guess > secret:',
      '        print("Too high")',
      '    else:',
      '        print("Too low")',
      'print("Game over! The secret was " + str(secret))',
    ].join('\n');

    await page.locator('#game_build_A-ta').fill(baseGame);
    await page.locator('#game_build_A-btn').click();

    await expect(page.locator('#game_build_A-fb')).toHaveClass(/pass/, { timeout: 30000 });
    await expect(page.locator('#game_build_A-ta')).not.toHaveAttribute('readonly', '');
    await expect(page.locator('#game_build_B')).not.toHaveClass(/locked-task/);
  });

  test('stretch check reads the original game editor', async ({ page }) => {
    const stretchedGame = [
      'def greet():',
      '    print("Welcome to Guess My Number!")',
      '',
      'greet()',
      'secret = 7',
      'attempts = 0',
      'for i in range(5):',
      '    attempts = attempts + 1',
      '    guess = int(input("Guess: "))',
      '    if guess == secret:',
      '        print("Correct!")',
      '        break',
      '    elif guess > secret:',
      '        print("Too high")',
      '    else:',
      '        print("Too low")',
      'print("You used " + str(attempts) + " tries")',
      'print("Game over! The secret was " + str(secret))',
    ].join('\n');

    await page.locator('#game_build_A-ta').fill(stretchedGame);
    await page.locator('#game_build_A-btn').click();
    await expect(page.locator('#game_build_A-fb')).toHaveClass(/pass/, { timeout: 30000 });

    await page.locator('#game_build_B-btn').click();
    await expect(page.locator('#game_build_B-fb')).toHaveClass(/pass/, { timeout: 30000 });
  });
});

test.describe('Score pill', () => {
  test.beforeEach(async ({ page }) => {
    await seedAssessResults(page); // cast_to_int weak by default
    await page.goto(ACTIVITY);
    await expect(page.locator('#plan-screen')).toBeVisible({ timeout: 5000 });
    await page.locator('#plan-screen button:has-text("Start practising")').click();
  });

  test('score pill shows 0 initially', async ({ page }) => {
    await expect(page.locator('#score-pill')).toContainText('0 /');
  });

  test('score increases after passing a task', async ({ page }) => {
    await page.locator('#cast_to_int_A-ta').fill('age = int(input("Age? "))\nprint(age + 1)');
    await page.locator('#cast_to_int_A-btn').click();
    await expect(page.locator('#cast_to_int_A-fb')).toHaveClass(/pass/, { timeout: 30000 });
    await expect(page.locator('#score-pill')).toContainText('1 /');
  });
});
