import { expect } from '@playwright/test';

// ─── Common activity shell checks ────────────────────────────────────────────
// Call these at the start of any activity spec to verify page fundamentals
// without duplicating boilerplate across every spec file.

export async function expectPageTitle(page, pattern) {
  await expect(page).toHaveTitle(pattern);
}

export async function expectProgressBar(page, pct) {
  const width = await page.locator('#progressFill').evaluate(el => el.style.width);
  expect(width).toBe(`${pct}%`);
}

export async function expectNoClassroomBanner(page) {
  await expect(page.locator('#classroom-banner')).not.toBeAttached();
}

export async function expectCompletionBanner(page, textPattern) {
  await expect(page.locator('#completionBanner')).toBeVisible();
  if (textPattern) await expect(page.locator('#completionBanner')).toContainText(textPattern);
}

export async function expectActiveStage(page, stageId) {
  await expect(page.locator(`#stage-${stageId}`)).toHaveClass(/active/);
  await expect(page.locator(`[data-stage="${stageId}"]`)).toHaveClass(/active/);
}

export async function expectDoneStage(page, stageId) {
  await expect(page.locator(`[data-stage="${stageId}"]`)).toHaveClass(/done/);
}

// ─── Live view fields ────────────────────────────────────────────────────────
// Records what the page passes to Classroom.setLive (the hub's Live view), so a
// spec can check a game sends its best. Call after the last page load/reload.
export async function recordLiveCalls(page) {
  await page.evaluate(() => {
    window.__live = [];
    const real = window.Classroom.setLive.bind(window.Classroom);
    window.Classroom.setLive = (fields, name) => { window.__live.push(fields); return real(fields, name); };
  });
}

export async function lastLiveCall(page) {
  return page.evaluate(() => window.__live.at(-1));
}
