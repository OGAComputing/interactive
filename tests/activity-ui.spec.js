import { test, expect } from '@playwright/test';

async function loadActivityUI(page) {
  await page.goto('/index.html');
  await page.evaluate(() => {
    document.body.innerHTML = '<main id="host"></main>';
  });
  await page.addScriptTag({ url: '/activity-ui.js' });
}

test.describe('ActivityUI shared helpers', () => {
  test('exposes the expected API', async ({ page }) => {
    await loadActivityUI(page);
    await expect.poll(() => page.evaluate(() => Object.keys(window.ActivityUI || {}).sort())).toEqual([
      'launchCelebration',
      'resetCelebration',
      'showToast'
    ]);
  });

  test('showToast uses an existing toast element and hides after the timeout', async ({ page }) => {
    await loadActivityUI(page);
    await page.evaluate(() => {
      document.body.insertAdjacentHTML('beforeend', '<div class="ac-toast" id="toast"></div>');
      window.__toastEvents = 0;
      window.addEventListener('activity-ui:toast', () => window.__toastEvents++);
      window.ActivityUI.showToast('Saved', 'warn', { duration: 500 });
    });

    const toast = page.locator('#toast');
    await expect(toast).toHaveText('Saved');
    await expect(toast).toHaveClass(/show/);
    await expect(toast).toHaveClass(/warn/);
    await expect.poll(() => page.evaluate(() => window.__toastEvents)).toBe(1);
    await expect(toast).not.toHaveClass(/show/, { timeout: 1000 });
  });

  test('showToast creates a toast element when one is missing', async ({ page }) => {
    await loadActivityUI(page);
    await page.evaluate(() => window.ActivityUI.showToast('Created', 'success', { duration: 50 }));
    await expect(page.locator('#toast')).toHaveText('Created');
    await expect(page.locator('#toast')).toHaveClass(/success/);
  });

  test('launchCelebration emits an event and creates a transient effect', async ({ page }) => {
    await loadActivityUI(page);
    await page.evaluate(() => {
      window.__celebrations = [];
      window.addEventListener('activity-ui:celebration-start', e => window.__celebrations.push(e.detail.effect));
      window.ActivityUI.resetCelebration();
      window.ActivityUI.launchCelebration({ effectIndex: 3 });
    });

    await expect.poll(() => page.evaluate(() => window.__celebrations)).toEqual(['badge-pop']);
    await expect(page.locator('.activity-ui-celebration')).toBeAttached();
  });

  test('launchCelebration runs once until resetCelebration is called', async ({ page }) => {
    await loadActivityUI(page);
    await page.evaluate(() => {
      window.__count = 0;
      window.addEventListener('activity-ui:celebration-start', () => window.__count++);
      window.ActivityUI.resetCelebration();
      window.ActivityUI.launchCelebration({ effectIndex: 3 });
      window.ActivityUI.launchCelebration({ effectIndex: 3 });
    });
    await expect.poll(() => page.evaluate(() => window.__count)).toBe(1);

    await page.evaluate(() => {
      window.ActivityUI.resetCelebration();
      window.ActivityUI.launchCelebration({ effectIndex: 3 });
    });
    await expect.poll(() => page.evaluate(() => window.__count)).toBe(2);
  });

  test('launchCelebration respects reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loadActivityUI(page);
    const result = await page.evaluate(() => {
      window.__count = 0;
      window.addEventListener('activity-ui:celebration-start', () => window.__count++);
      window.ActivityUI.resetCelebration();
      return window.ActivityUI.launchCelebration({ effectIndex: 3 });
    });

    expect(result).toBe(false);
    await expect.poll(() => page.evaluate(() => window.__count)).toBe(0);
    await expect(page.locator('.activity-ui-celebration')).not.toBeAttached();
  });
});
