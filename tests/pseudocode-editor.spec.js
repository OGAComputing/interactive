import { test, expect } from '@playwright/test';

const ACTIVITY = '/Demo/Pseudocode_Sandbox/index.html';

// ═══════════════════════════════════════════════════════════════════════════════
//  PAGE SHELL
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Page shell', () => {
  test.beforeEach(async ({ page }) => { await page.goto(ACTIVITY); });

  test('page loads with expected title', async ({ page }) => {
    await expect(page).toHaveTitle(/Pseudocode Sandbox/);
  });

  test('has a pseudocode textarea', async ({ page }) => {
    await expect(page.locator('#pscEditor')).toBeVisible();
  });

  test('Run button is initially disabled while Pyodide loads', async ({ page }) => {
    // Button should start disabled
    await expect(page.locator('#runBtn')).toBeDisabled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  HIGHLIGHTING
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Pseudocode highlighting', () => {
  test.beforeEach(async ({ page }) => { await page.goto(ACTIVITY); });

  test('highlight layer renders after typing', async ({ page }) => {
    const ta = page.locator('#pscEditor');
    // Clear the editor and type a known keyword
    await ta.fill('for i = 0 to 5\n    print(i)\nnext i');
    // Wait for the 50ms debounce + rendering
    await page.waitForTimeout(200);
    const hl = page.locator('.highlight-layer');
    await expect(hl).toBeVisible();
    const html = await hl.innerHTML();
    // 'for', 'to', 'next' should appear as keyword spans
    expect(html).toContain('tok-kw');
  });

  test('OCR keywords get tok-kw class', async ({ page }) => {
    const ta = page.locator('#pscEditor');
    await ta.fill('if x > 0 then\nendif');
    await page.waitForTimeout(200);
    const hl = page.locator('.highlight-layer');
    const html = await hl.innerHTML();
    expect(html).toContain('tok-kw');
    // At least one of the keywords should be highlighted
    expect(html).toMatch(/class="tok-kw"[^>]*>if|>if<[^>]*class="tok-kw"/i);
  });

  test('print appears as a builtin', async ({ page }) => {
    const ta = page.locator('#pscEditor');
    await ta.fill('print("hello")');
    await page.waitForTimeout(200);
    const hl = page.locator('.highlight-layer');
    const html = await hl.innerHTML();
    expect(html).toContain('tok-builtin');
  });

  test('string literals get tok-str class', async ({ page }) => {
    const ta = page.locator('#pscEditor');
    await ta.fill('x = "hello"');
    await page.waitForTimeout(200);
    const html = await page.locator('.highlight-layer').innerHTML();
    expect(html).toContain('tok-str');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  SYNTAX HINT
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Syntax hint', () => {
  test.beforeEach(async ({ page }) => { await page.goto(ACTIVITY); });

  test('hint is hidden initially for valid default code', async ({ page }) => {
    await page.waitForTimeout(1200); // let the 800ms debounce fire
    const hint = page.locator('.syntax-hint');
    await expect(hint).not.toHaveClass(/visible/);
  });

  test('transpiler error shows immediately (no 800ms wait)', async ({ page }) => {
    const ta = page.locator('#pscEditor');
    await ta.fill('class Foo\n    x = 1\nendclass');
    await page.waitForTimeout(200); // well within 800ms
    const hint = page.locator('.syntax-hint');
    await expect(hint).toHaveClass(/visible/);
    const text = await hint.textContent();
    expect(text).toMatch(/class/i);
  });

  test('valid code clears the hint', async ({ page }) => {
    const ta = page.locator('#pscEditor');
    // First trigger an error
    await ta.fill('class Foo\nendclass');
    await page.waitForTimeout(200);
    await expect(page.locator('.syntax-hint')).toHaveClass(/visible/);
    // Then clear to valid code
    await ta.fill('x = 1');
    await page.waitForTimeout(200);
    await expect(page.locator('.syntax-hint')).not.toHaveClass(/visible/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  "SHOW TRANSPILED" TOGGLE
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Show transpiled toggle', () => {
  test.beforeEach(async ({ page }) => { await page.goto(ACTIVITY); });

  test('Python panel is hidden by default', async ({ page }) => {
    await expect(page.locator('#pyPanel')).toBeHidden();
  });

  test('toggle reveals the Python panel', async ({ page }) => {
    await page.locator('#togglePyBtn').click();
    await expect(page.locator('#pyPanel')).toBeVisible();
  });

  test('Python panel contains source-map gutter', async ({ page }) => {
    const ta = page.locator('#pscEditor');
    await ta.fill('x = 1\ny = 2');
    await page.waitForTimeout(100);
    await page.locator('#togglePyBtn').click();
    const pyOut = page.locator('#pyOut');
    await expect(pyOut).toBeVisible();
    const html = await pyOut.innerHTML();
    // Should contain 'src=' gutter entries
    expect(html).toContain('src=');
    // Preamble lines show as injected '—'
    expect(html).toContain('injected');
  });

  test('toggling again hides the panel', async ({ page }) => {
    await page.locator('#togglePyBtn').click();
    await expect(page.locator('#pyPanel')).toBeVisible();
    await page.locator('#togglePyBtn').click();
    await expect(page.locator('#pyPanel')).toBeHidden();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  RUNNING CODE
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Running code', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACTIVITY);
    // Wait for Pyodide to finish loading
    await expect(page.locator('#runBtn')).not.toBeDisabled({ timeout: 60000 });
  });

  test('simple print produces correct output', async ({ page }) => {
    await page.locator('#pscEditor').fill('print("Hello from pseudocode")');
    await page.locator('#runBtn').click();
    const output = page.locator('.output-content');
    await expect(output).toHaveText('Hello from pseudocode', { timeout: 30000 });
  });

  test('for loop runs and shows each value', async ({ page }) => {
    await page.locator('#pscEditor').fill('for i = 1 to 3\n    print(i)\nnext i');
    await page.locator('#runBtn').click();
    const output = page.locator('.output-content');
    await expect(output).toContainText('1', { timeout: 30000 });
    await expect(output).toContainText('2');
    await expect(output).toContainText('3');
  });

  test('step -1 countdown runs correctly', async ({ page }) => {
    await page.locator('#pscEditor').fill('for i = 3 to 1 step -1\n    print(i)\nnext i');
    await page.locator('#runBtn').click();
    const output = page.locator('.output-content');
    await expect(output).toHaveText('3\n2\n1', { timeout: 30000 });
  });

  test('.length on expression gives correct result', async ({ page }) => {
    await page.locator('#pscEditor').fill('function greet()\n    return "Hello"\nendfunction\nprint(greet().length)');
    await page.locator('#runBtn').click();
    const output = page.locator('.output-content');
    await expect(output).toHaveText('5', { timeout: 30000 });
  });

  test('2D array write+read works', async ({ page }) => {
    const code = 'array g[2,2]\ng[1,0] = 42\nprint(g[1,0])';
    await page.locator('#pscEditor').fill(code);
    await page.locator('#runBtn').click();
    const output = page.locator('.output-content');
    await expect(output).toHaveText('42', { timeout: 30000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Error handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ACTIVITY);
    await expect(page.locator('#runBtn')).not.toBeDisabled({ timeout: 60000 });
  });

  test('runtime NameError shows output panel in error state', async ({ page }) => {
    const code = 'x = 1\ny = undeclared_var + 1\nprint(y)';
    await page.locator('#pscEditor').fill(code);
    await page.locator('#runBtn').click();
    await expect(page.locator('.output-panel')).toHaveClass(/error/, { timeout: 30000 });
    const text = await page.locator('.output-content').textContent();
    expect(text).toContain('⚠');
  });

  test('Python SyntaxError maps back to pseudocode line in hint', async ({ page }) => {
    // Deliberate syntax error on pseudocode line 2: print(i +)
    const code = 'for i = 0 to 3\n    print(i +)\nnext i';
    await page.locator('#pscEditor').fill(code);
    // Wait for 800ms hint debounce + Pyodide checkSyntax
    const hint = page.locator('.syntax-hint');
    await expect(hint).toHaveClass(/visible/, { timeout: 15000 });
    const text = await hint.textContent();
    // Should mention pseudocode line 2 (where the bad expression is)
    expect(text).toMatch(/pseudocode line 2/);
  });

  test('transpiler error for class shows line in output panel', async ({ page }) => {
    // OOP is unsupported — transpiler error references line 1
    await page.locator('#pscEditor').fill('class Foo\nendclass');
    await page.locator('#runBtn').click();
    await expect(page.locator('.output-panel')).toHaveClass(/error/, { timeout: 30000 });
    const text = await page.locator('.output-content').textContent();
    expect(text).toMatch(/line 1/);
    expect(text).toMatch(/class/i);
  });
});
