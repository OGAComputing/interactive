import { test, expect } from '@playwright/test';
import { mockAsStudent } from './helpers/mockClassroom.js';

// The Live view: classroom.js puts setLive fields on the evidence file, and the hub's
// Live panel reads them back. hub-live.test.js covers the row/leaderboard logic.

const HOST = '/Y8/Python Unit 2/L4_Functions/1_Functions.html';
const COURSE_ID = 'test-course-123';
const AUTH_TIMEOUT = 15000;

// Every evidence upload's metadata part (the JSON with appProperties).
async function captureUploads(page) {
  const uploads = [];
  await page.route('https://www.googleapis.com/upload/drive/**', route => {
    const body = route.request().postData() || '';
    const meta = body.match(/\{"name".*?"appProperties":\{.*?\}\}/);
    uploads.push(meta ? JSON.parse(meta[0]).appProperties : null);
    route.fulfill({ json: { id: 'mock-drive-file-id' } });
  });
  return uploads;
}

test.describe('classroom.js setLive', () => {
  test.beforeEach(async ({ page }) => {
    await mockAsStudent(page, COURSE_ID, `http://127.0.0.1:3001${HOST}`);
    // mockAsStudent's handler matches '/courseWork' before '/studentSubmissions', so the
    // submission lookup never finds one; answer it properly (a later route wins).
    await page.route('https://classroom.googleapis.com/**/studentSubmissions**', r => r.fulfill({ json: { studentSubmissions: [{ id: 'mock-submission-123' }] } }));
  });

  test('live fields go up with the grade', async ({ page }) => {
    const uploads = await captureUploads(page);
    await page.goto(`${HOST}?courseId=${COURSE_ID}`);
    await expect(page.locator('#classroom-text')).toContainText('Connected', { timeout: AUTH_TIMEOUT });
    await page.evaluate(() => {
      window.Classroom.setLive({ task: '1/5' }, 'Live Test');
      window.Classroom.submitGrade(20, 'Live Test');
    });
    await expect.poll(() => uploads.length).toBe(1);
    expect(uploads[0]).toMatchObject({ ogaScore: '20', ogaLtask: '1/5', ogaWork: 'mock-cw-123', ogaSub: 'mock-submission-123' });
    await page.waitForTimeout(1500);   // the fields went with the grade: no live-only upload follows
    expect(uploads).toHaveLength(1);
  });

  test('a live-only update keeps the saved score and waits its turn', async ({ page }) => {
    const uploads = await captureUploads(page);
    await page.goto(`${HOST}?courseId=${COURSE_ID}`);
    await expect(page.locator('#classroom-text')).toContainText('Connected', { timeout: AUTH_TIMEOUT });
    await page.evaluate(() => window.Classroom.setLive({ board: 1840, boardLabel: 'Carry Rush', 'bad key': 1 }, 'Live Test'));
    await expect.poll(() => uploads.length).toBe(1);
    expect(uploads[0]).toMatchObject({ ogaLboard: '1840', ogaLboardLabel: 'Carry Rush' });
    expect(uploads[0]).not.toHaveProperty('ogaScore');   // Drive keeps the score already on the file
    expect(Object.keys(uploads[0]).some(k => k.includes(' '))).toBe(false);

    // The next one is held for the 20-second limit, and an unchanged one is never sent.
    await page.evaluate(() => {
      window.Classroom.setLive({ board: 2000 }, 'Live Test');
      window.Classroom.setLive({ board: 2000 }, 'Live Test');
    });
    await page.waitForTimeout(1500);
    expect(uploads).toHaveLength(1);
  });
});

// ── Hub Live panel ───────────────────────────────────────────────────────────

const now = Date.now();
const evidence = (sub, name, minsAgo, props) => ({
  id: 'f-' + sub, modifiedTime: new Date(now - minsAgo * 60000).toISOString(),
  lastModifyingUser: { displayName: name },
  appProperties: { ogaCourse: COURSE_ID, ogaWork: 'cw-new', ogaSub: sub, ogaSync: '1', ...props },
});
const FILES = [
  evidence('s1', 'Amelia Smith', 1, { ogaScore: '100', ogaLtask: '5/5', ogaLboard: '2400', ogaLboardLabel: 'Carry Rush X7' }),
  evidence('s2', 'Ben Jones', 2, { ogaScore: '60', ogaLtask: '3/5', ogaLboard: '3100', ogaLboardLabel: 'Carry Rush X7' }),
  evidence('s3', 'Cara Lee', 25, { ogaScore: '20', ogaLtask: '1/5' }),
  // Another class's file must not show up.
  { ...evidence('s9', 'Zed Other', 1, { ogaScore: '90' }), appProperties: { ogaCourse: 'other', ogaWork: 'cw-new', ogaSub: 's9' } },
];

async function mockHubTeacher(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('oga_oauth_token', JSON.stringify({ access_token: 'mock-teacher', scope: '', expires_at: Date.now() + 3600000 }));
    localStorage.setItem('oga_hub_last_course', 'test-course-123');
  });
  await page.route('https://accounts.google.com/**', r => r.abort());
  await page.route('https://www.googleapis.com/oauth2/v3/userinfo', r => r.fulfill({ json: { sub: 't1', email: 'teacher@test.com' } }));
  const driveQueries = [];
  await page.route('https://www.googleapis.com/drive/**', r => {
    const q = new URL(r.request().url()).searchParams.get('q') || '';
    driveQueries.push(q);
    r.fulfill({ json: { files: q.includes("key='ogaWork'") ? FILES : [] } });
  });
  await page.route('https://classroom.googleapis.com/**', r => {
    const url = r.request().url();
    if (url.includes('/studentSubmissions')) return r.fulfill({ json: { studentSubmissions: [{ id: 's1' }, { id: 's2' }, { id: 's3' }, { id: 's4' }] } });
    if (url.includes('/courseWork')) return r.fulfill({ json: { courseWork: [
      { id: 'cw-old', title: 'The Drone', creationTime: '2026-10-01T09:00:00Z', associatedWithDeveloper: true,
        materials: [{ link: { url: 'https://x.github.io/interactive/Y9/Python/L5_Functions/1_The_Drone_PRIMM.html?courseId=c' } }] },
      { id: 'cw-new', title: 'Binary Addition', creationTime: '2026-11-17T09:00:00Z', associatedWithDeveloper: true,
        materials: [{ link: { url: 'https://x.github.io/interactive/Y8/Data_Representation/L2_Binary_Addition/1_Binary_Addition.html?courseId=c' } }] },
      { id: 'cw-hand', title: 'Made by hand', creationTime: '2026-11-17T10:00:00Z' },
    ] } });
    if (url.includes('/topics')) return r.fulfill({ json: { topic: [] } });
    return r.fulfill({ json: { courses: [{ id: COURSE_ID, name: '8X Computing' }] } });
  });
  return driveQueries;
}

test.describe('Hub Live panel', () => {
  test('shows progress for the newest hub assignment and a leaderboard', async ({ page }) => {
    const driveQueries = await mockHubTeacher(page);
    await page.goto('/index.html');
    await expect(page.locator('#btn-live')).toBeVisible();
    await expect(page.locator('#course-search')).toHaveValue('8X Computing');
    await page.locator('#btn-live').click();

    const panel = page.locator('#live-panel');
    await expect(panel).toBeVisible();
    await expect(page.locator('#live-work')).toHaveValue('cw-new');
    await expect(page.locator('#live-work option')).toHaveCount(2);   // the hand-made post is left out
    expect(driveQueries.some(q => q.includes("key='ogaWork' and value='cw-new'"))).toBe(true);

    await expect(page.locator('#live-summary')).toHaveText('3 of 4 started · 1 finished · 1 with no save in 10 min');
    // Needs help first: Cara (20%, idle), Ben (60%), Amelia (done).
    await expect(page.locator('.live-card .live-name')).toHaveText(['Cara L.', 'Ben J.', 'Amelia S.']);
    await expect(page.locator('.live-card').first()).toContainText('No save 10 min');
    await expect(page.locator('.live-card').nth(1)).toContainText('60% · Task 3/5');
    await expect(page.locator('.live-card').last()).toContainText('✓ Done');
    await expect(panel).not.toContainText('Zed');

    await page.locator('#live-tab-board').click();
    await expect(page.locator('.live-board-title')).toHaveText('🏆 Carry Rush X7');
    await expect(page.locator('.live-board li .live-who')).toHaveText(['Ben J.', 'Amelia S.']);
    await expect(page.locator('.live-board li').first()).toContainText('3,100');

    // Dressed as the lesson: Y8 Data Representation's light theme and indigo accent.
    await expect(panel).toHaveAttribute('data-year', '8');
    await expect(panel).toHaveAttribute('data-topic', 'Data_Representation');
    await expect(panel).not.toHaveAttribute('data-skin', /./);
    expect(await panel.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(238, 245, 251)');
    expect(await page.locator('.live-top').evaluate(el => getComputedStyle(el).borderBottomColor)).toBe('rgb(99, 102, 241)');

    // A Y9 Python chapter switches to Station Zero.
    await page.locator('#live-work').selectOption('cw-old');
    await expect(panel).toHaveAttribute('data-skin', 'station-zero');
    await expect(page.locator('#live-heading')).toHaveText('Station Zero · Crew monitor');

    // The hub itself keeps its own look: shared.css is layered under it.
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(15, 28, 46)');

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });
});
