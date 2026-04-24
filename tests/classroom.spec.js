import { test, expect } from '@playwright/test';
import { mockSignedOut, mockAsStudent, mockAsTeacher } from './helpers/mockClassroom.js';

// Any activity that loads classroom.js works as a host page; Functions is used here.
const HOST = '/Y8/Python/L4_Functions/1_Functions.html';
const COURSE_ID = 'test-course-123';
const ACTIVITY_URL = `http://127.0.0.1:3001${HOST}`;

// Minimal predict fill — just enough to satisfy the activity's form validation
// so auth-gating is what determines whether we advance.
async function fillPredict(page) {
  await page.locator('input[name="p2"][value="greet()"]').check();
  await page.locator('#p3').fill('Hello!');
  await page.locator('input[name="p4"][value="2"]').check();
  await page.locator('input[name="p5"][value="nothing"]').check();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  No courseId — classroom.js should not inject any UI
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('No courseId', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HOST);
  });

  test('classroom banner is not injected', async ({ page }) => {
    await expect(page.locator('#classroom-banner')).not.toBeAttached();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  courseId present — signed out
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Signed out', () => {
  test.beforeEach(async ({ page }) => {
    await mockSignedOut(page);
    await page.goto(`${HOST}?courseId=${COURSE_ID}`);
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

  test('activity action is blocked and shows alert when not signed in', async ({ page }) => {
    await fillPredict(page);
    page.once('dialog', dialog => dialog.accept());
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#stage-P')).toHaveClass(/active/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  courseId present — signed in as student
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Signed in as student', () => {
  test.beforeEach(async ({ page }) => {
    await mockAsStudent(page, COURSE_ID, ACTIVITY_URL);
    await page.goto(`${HOST}?courseId=${COURSE_ID}`);
  });

  test('banner shows Connected to Google Classroom', async ({ page }) => {
    await expect(page.locator('#classroom-text')).toContainText('Connected to Google Classroom', { timeout: 5000 });
  });

  test('status dot is green (online)', async ({ page }) => {
    await expect(page.locator('#classroom-dot')).toHaveClass(/online/, { timeout: 5000 });
  });

  test('sign-in button is hidden', async ({ page }) => {
    await expect(page.locator('#classroom-signin-btn')).toHaveClass(/hidden/, { timeout: 5000 });
  });

  test('activity action proceeds normally after sign-in', async ({ page }) => {
    await expect(page.locator('#classroom-text')).toContainText('Connected', { timeout: 5000 });
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await expect(page.locator('#stage-R')).toHaveClass(/active/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  courseId present — signed in as teacher
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Signed in as teacher', () => {
  test.beforeEach(async ({ page }) => {
    await mockAsTeacher(page, COURSE_ID);
    await page.goto(`${HOST}?courseId=${COURSE_ID}`);
  });

  test('status dot is amber (teacher)', async ({ page }) => {
    await expect(page.locator('#classroom-dot')).toHaveClass(/teacher/, { timeout: 5000 });
  });

  test('shows Teacher mode text', async ({ page }) => {
    await expect(page.locator('#classroom-text')).toContainText('Teacher mode', { timeout: 5000 });
  });
});
