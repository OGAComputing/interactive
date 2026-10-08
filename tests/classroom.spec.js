import { test, expect } from '@playwright/test';
import { mockSignedOut, mockAsStudent, mockAsTeacher, mockAsStudentReusedPost, mockAsTeacherReusedPost } from './helpers/mockClassroom.js';

// Any activity that loads classroom.js works as a host page; Functions is used here.
const HOST = '/Y8/Python Unit 2/L4_Functions/1_Functions.html';
const COURSE_ID = 'test-course-123';
const ACTIVITY_URL = `http://127.0.0.1:3001${HOST}`;
const AUTH_TIMEOUT = 15000;

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
    await expect(page.locator('#classroom-text')).toContainText('Connected to Google Classroom', { timeout: AUTH_TIMEOUT });
  });

  test('status dot is green (online)', async ({ page }) => {
    await expect(page.locator('#classroom-dot')).toHaveClass(/online/, { timeout: AUTH_TIMEOUT });
  });

  test('sign-in button is hidden', async ({ page }) => {
    await expect(page.locator('#classroom-signin-btn')).toHaveClass(/hidden/, { timeout: AUTH_TIMEOUT });
  });

  test('activity action proceeds normally after sign-in', async ({ page }) => {
    await expect(page.locator('#classroom-text')).toContainText('Connected', { timeout: AUTH_TIMEOUT });
    await fillPredict(page);
    await page.locator('button:has-text("Check predictions")').click();
    await page.locator('button:has-text("go to Run")').click();
    await expect(page.locator('#stage-R')).toHaveClass(/active/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  courseId present — signed in as teacher
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
//  Re-used post — URL contains a courseId from a different classroom
// ═══════════════════════════════════════════════════════════════════════════════

const OLD_COURSE_ID = 'old-course-aaa';
const NEW_COURSE_ID = 'new-course-bbb';

test.describe('Re-used post (wrong courseId in URL)', () => {
  test('student: banner shows Connected after fallback course scan', async ({ page }) => {
    await mockAsStudentReusedPost(page, OLD_COURSE_ID, NEW_COURSE_ID, ACTIVITY_URL);
    await page.goto(`${HOST}?courseId=${OLD_COURSE_ID}`);
    await expect(page.locator('#classroom-text')).toContainText('Connected to Google Classroom', { timeout: AUTH_TIMEOUT });
    await expect(page.locator('#classroom-dot')).toHaveClass(/online/, { timeout: AUTH_TIMEOUT });
  });

  test('teacher: teacher mode restored after fallback course scan corrects courseId', async ({ page }) => {
    await mockAsTeacherReusedPost(page, OLD_COURSE_ID, NEW_COURSE_ID, ACTIVITY_URL);
    await page.goto(`${HOST}?courseId=${OLD_COURSE_ID}`);
    await expect(page.locator('#classroom-dot')).toHaveClass(/teacher/, { timeout: AUTH_TIMEOUT });
    await expect(page.locator('#classroom-text')).toContainText('Teacher mode', { timeout: AUTH_TIMEOUT });
  });
});

test.describe('Signed in as teacher', () => {
  test.beforeEach(async ({ page }) => {
    await mockAsTeacher(page, COURSE_ID);
    await page.goto(`${HOST}?courseId=${COURSE_ID}`);
  });

  test('status dot is amber (teacher)', async ({ page }) => {
    await expect(page.locator('#classroom-dot')).toHaveClass(/teacher/, { timeout: AUTH_TIMEOUT });
  });

  test('shows Teacher mode text', async ({ page }) => {
    await expect(page.locator('#classroom-text')).toContainText('Teacher mode', { timeout: AUTH_TIMEOUT });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  Sign-in log viewer and automatic-redirect loop guard
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Sign-in log', () => {
  test('signed out: log button opens a log of what happened', async ({ page }) => {
    await mockSignedOut(page);
    await page.goto(`${HOST}?courseId=${COURSE_ID}`);
    await page.locator('#classroom-log-btn').click();
    await expect(page.locator('#cr-log-backdrop')).toHaveClass(/open/);
    await expect(page.locator('#cr-log-text')).toContainText('Page opened');
    await expect(page.locator('#cr-log-text')).toContainText('Silent sign-in failed');
    await page.locator('#cr-log-box button:has-text("Close")').click();
    await expect(page.locator('#cr-log-backdrop')).not.toHaveClass(/open/);
  });

  test('student: log records who signed in and whether the assignment was found', async ({ page }) => {
    await mockAsStudent(page, COURSE_ID, ACTIVITY_URL);
    await page.goto(`${HOST}?courseId=${COURSE_ID}`);
    await expect(page.locator('#classroom-dot')).toHaveClass(/online/, { timeout: AUTH_TIMEOUT });
    await page.locator('#classroom-log-btn').click();
    await expect(page.locator('#cr-log-text')).toContainText('Signed in as student@test.com');
    await expect(page.locator('#cr-log-text')).toContainText('assignment found');
    await expect(page.locator('#cr-log-text')).not.toContainText('mock-token-abc123');
  });

  test('loop guard: stops automatic sign-in after repeated attempts', async ({ page }) => {
    // Three automatic trips to Google in the last minute, and no silent-failure flag:
    // without the guard, bootstrap would redirect to Google yet again.
    await page.addInitScript(`(function(){
      try {
        const now = Date.now();
        sessionStorage.setItem('oga_auto_redirects', JSON.stringify([now - 30000, now - 20000, now - 10000]));
      } catch(e) {}
    })()`);
    let wentToGoogle = false;
    await page.route('https://accounts.google.com/**', route => { wentToGoogle = true; route.abort(); });
    await page.goto(`${HOST}?courseId=${COURSE_ID}`);
    await expect(page.locator('#classroom-text')).toContainText('Automatic sign-in kept failing');
    expect(wentToGoogle).toBe(false);
    await page.locator('#classroom-log-btn').click();
    await expect(page.locator('#cr-log-text')).toContainText('LOOP GUARD');
  });
});
