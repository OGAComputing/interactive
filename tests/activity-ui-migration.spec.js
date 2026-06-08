import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const y11Activities = [
  '/Y11/1.1 Systems Architecture/CPU_Architecture.html',
  '/Y11/1.2 Data Representation/Binary_Addition.html',
  '/Y11/1.2 Data Representation/Binary_Denary_Hex_Conversion.html',
  '/Y11/1.2 Data Representation/Images.html',
  '/Y11/1.3 Networks/ClientServerP2P.html',
  '/Y11/1.3 Networks/internet_dns_cloud.html',
  '/Y11/1.3 Networks/network_topology_builder.html',
  '/Y11/1.3 Networks/router_switch_venn.html',
  '/Y11/1.4 Network Security/cybersecurity-threats-prevention.html',
  '/Y11/1.5 System Software/os-mindmap.html',
  '/Y11/1.6 Legislation/FillInBlanks.html',
  '/Y11/1.6 Legislation/digital-society-impacts.html',
  '/Y11/2.1 Algorithms/Practice.html',
  '/Y11/2.1 Algorithms/Practice_2.html',
  '/Y11/2.1 Algorithms/Challenge.html',
  '/Y11/2.1 Algorithms/Functions.html'
];

const templates = [
  { file: '_templates/Y8.html', base: 'http://127.0.0.1:3001/Y8/Python/' },
  { file: '_templates/Y9.html', base: 'http://127.0.0.1:3001/Y9/Hardware_Networks/' },
  { file: '_templates/Y11.html', base: 'http://127.0.0.1:3001/Y11/Networks/' },
  { file: '_templates/Pseudocode_Y11.html', base: 'http://127.0.0.1:3001/Y11/Algorithms/' },
  { file: '_templates/PRIMM_Python_Y8.html', base: 'http://127.0.0.1:3001/Y8/Python/L1_Template/' }
];

async function collectPageProblems(page) {
  const problems = [];
  page.on('pageerror', err => problems.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') problems.push(msg.text());
  });
  return problems;
}

async function expectActivityUiScriptResolves(page, request) {
  const src = await page.evaluate(() => {
    const script = [...document.scripts].find(s => /activity-ui\.js$/.test(s.getAttribute('src') || ''));
    return script?.src || '';
  });
  expect(src).toContain('/activity-ui.js');
  const response = await request.get(src);
  expect(response.status()).toBe(200);
}

async function installCelebrationCounter(page) {
  await page.evaluate(() => {
    window.__celebrationCount = 0;
    window.addEventListener('activity-ui:celebration-start', () => window.__celebrationCount++);
    window.addEventListener('activity-ui:go-for-gold', () => window.__celebrationCount++);
    window.ActivityUI?.resetCelebration();
  });
}

test.describe('ActivityUI migration coverage', () => {
  for (const activity of y11Activities) {
    test(`${activity} loads ActivityUI`, async ({ page, request }) => {
      const problems = await collectPageProblems(page);

      await page.goto(encodeURI(activity));
      await expectActivityUiScriptResolves(page, request);
      await expect.poll(() => page.evaluate(() => Boolean(window.ActivityUI))).toBe(true);
      expect(problems).toEqual([]);
    });
  }

  for (const template of templates) {
    test(`${template.file} resolves ActivityUI at copied depth`, async ({ page, request }) => {
      const html = await readFile(template.file, 'utf8');
      const problems = await collectPageProblems(page);
      const scriptMatch = html.match(/<script src="([^"]*activity-ui\.js)"><\/script>/);
      expect(scriptMatch?.[1]).toBeTruthy();

      await page.goto('/index.html');
      await page.setContent(`<!doctype html><base href="${template.base}"><script src="${scriptMatch[1]}"></script>`, { waitUntil: 'load' });
      await expectActivityUiScriptResolves(page, request);
      await expect.poll(() => page.evaluate(() => Boolean(window.ActivityUI))).toBe(true);
      expect(problems).toEqual([]);
    });
  }
});

test.describe('ActivityUI completion regressions', () => {
  test('template-style activity keeps banner behavior and launches one celebration', async ({ page }) => {
    await page.goto('/Y11/1.2%20Data%20Representation/Binary_Addition.html');
    await installCelebrationCounter(page);
    await page.evaluate(() => allComplete());

    await expect(page.locator('#done-banner')).toHaveClass(/show/);
    await expect.poll(() => page.evaluate(() => window.__celebrationCount)).toBe(1);

    await page.evaluate(() => allComplete());
    await expect.poll(() => page.evaluate(() => window.__celebrationCount)).toBe(1);

    await page.evaluate(() => restartActivity());
    await expect(page.locator('#done-banner')).not.toHaveClass(/show/);

    await page.evaluate(() => allComplete());
    await expect.poll(() => page.evaluate(() => window.__celebrationCount)).toBe(2);
  });

  test('weighted algorithm activity keeps completion banner and launches one celebration', async ({ page }) => {
    await page.goto('/Y11/2.1%20Algorithms/Practice.html');
    await installCelebrationCounter(page);
    await page.evaluate(() => {
      document.getElementById('done-banner').classList.add('show');
      window.ActivityUI?.launchCelebration();
    });

    await expect(page.locator('#done-banner')).toHaveClass(/show/);
    await expect.poll(() => page.evaluate(() => window.__celebrationCount)).toBe(1);
    await page.evaluate(() => window.ActivityUI?.launchCelebration());
    await expect.poll(() => page.evaluate(() => window.__celebrationCount)).toBe(1);
  });

  test('bespoke older banner keeps perfect styling and launches shared celebration', async ({ page }) => {
    await page.goto('/Y11/1.1%20Systems%20Architecture/CPU_Architecture.html');
    await installCelebrationCounter(page);
    await page.evaluate(() => triggerCompletion(true));

    await expect(page.locator('#done-banner')).toHaveClass(/show/);
    await expect(page.locator('#done-banner')).toHaveClass(/gold/);
    await expect.poll(() => page.evaluate(() => window.__celebrationCount)).toBe(1);
  });

  test('template-migrated activity shows banner and launches shared celebration', async ({ page }) => {
    await page.goto('/Y11/1.3%20Networks/ClientServerP2P.html');
    await installCelebrationCounter(page);
    await page.evaluate(() => allComplete());

    await expect(page.locator('#done-banner')).toHaveClass(/show/);
    await expect.poll(() => page.evaluate(() => window.__celebrationCount)).toBe(1);
  });
});
