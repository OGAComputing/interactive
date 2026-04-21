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
