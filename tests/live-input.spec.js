import { test, expect } from '@playwright/test';

// Exercises pyodide-runner.js's loop guard and code-editor.js's "live" input
// mode, via the Y8 Python Sandbox (a plain runCode() editor).
//
// Live mode: programs with input() inside a loop or function are run until
// input() wants an answer, the output so far is shown, the student answers,
// and the program re-runs with the answers so far. Straight-line programs
// keep the original "collect every prompt first" behaviour.
const SANDBOX = '/Y8/Sandbox/Python_Sandbox.html';

async function openSandbox(page, code) {
  await page.goto(SANDBOX);
  await expect(page.locator('#runBtn')).toBeEnabled({ timeout: 60000 });
  await page.locator('#sandboxEditor').fill(code);
}

const panel = page => page.locator('#codeWrap .output-panel');
const output = page => page.locator('#codeWrap .output-content');
const field = page => page.locator('#codeWrap .output-input-field');
const promptLabel = page => page.locator('#codeWrap .output-prompt-label');

async function answer(page, value) {
  await expect(field(page)).toBeVisible({ timeout: 30000 });
  await field(page).fill(value);
  await field(page).press('Enter');
}

test('while loop re-asks for input and shows output between answers', async ({ page }) => {
  await openSandbox(page, [
    'answer = input("What is 6 x 7? ")',
    'while answer != "42":',
    '    print("Not quite - try again")',
    '    answer = input("What is 6 x 7? ")',
    'print("Correct!")',
  ].join('\n'));
  await page.locator('#runBtn').click();

  await answer(page, '40');
  // The loop's output appears BEFORE the next prompt, like real Python.
  await expect(output(page)).toContainText('What is 6 x 7? 40\nNot quite - try again');
  await expect(promptLabel(page)).toHaveText('What is 6 x 7? ');

  await answer(page, '48');
  await expect(output(page)).toContainText('48\nNot quite - try again');

  await answer(page, '42');
  await expect(output(page)).toContainText('Correct!');
  await expect(field(page)).toBeHidden();
  await expect(panel(page)).not.toHaveClass(/error/);
  await expect(page.locator('#runBtn')).toBeEnabled();
});

test('random choices stay the same across re-runs of one Run click', async ({ page }) => {
  await openSandbox(page, [
    'import random',
    'secret = random.randint(1, 1000000)',
    'print("secret is", secret)',
    'guess = ""',
    'while guess != "stop":',
    '    guess = input("Type stop: ")',
    'print("final secret", secret)',
  ].join('\n'));
  await page.locator('#runBtn').click();

  await answer(page, 'go');
  await answer(page, 'stop');
  await expect(output(page)).toContainText('final secret');
  const text = await output(page).textContent();
  const first = text.match(/secret is (\d+)/)[1];
  const last = text.match(/final secret (\d+)/)[1];
  expect(last).toBe(first);
});

test('an infinite loop is stopped with a friendly error instead of freezing', async ({ page }) => {
  await openSandbox(page, 'count = 0\nwhile count < 5:\n    print(count)');
  await page.locator('#runBtn').click();

  await expect(panel(page)).toHaveClass(/error/, { timeout: 20000 });
  await expect(output(page)).toContainText('InfiniteLoopError');
  // The page is still responsive and the error helper explains it.
  await expect(page.locator('#runBtn')).toBeEnabled();
  await page.locator('#codeWrap .output-help-btn').click();
  await expect(page.locator('#codeWrap .error-helper')).toContainText('never finished');
});

test('straight-line input programs still collect answers up front', async ({ page }) => {
  await openSandbox(page, 'name = input("Name? ")\nprint("Hi " + name)');
  await page.locator('#runBtn').click();
  await answer(page, 'Sam');
  await expect(output(page)).toContainText('Hi Sam');
});
