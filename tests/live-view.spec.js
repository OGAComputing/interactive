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
const evidence = (sub, name, minsAgo, props, work = 'cw-new') => ({
  id: 'f-' + sub + work, modifiedTime: new Date(now - minsAgo * 60000).toISOString(),
  lastModifyingUser: { displayName: name }, owners: [{ displayName: name, permissionId: 'p-' + name }],
  appProperties: { ogaCourse: COURSE_ID, ogaWork: work, ogaSub: sub, ogaSync: '1', ...props },
});
const FILES = [
  evidence('s1', 'Amelia Smith', 1, { ogaScore: '100', ogaLtask: '5/5', ogaLboard: '2400', ogaLboardLabel: 'Carry Rush X7' }),
  evidence('s2', 'Ben Jones', 2, { ogaScore: '60', ogaLtask: '3/5', ogaLboard: '3100', ogaLboardLabel: 'Carry Rush X7' }),
  evidence('s3', 'Cara Lee', 25, { ogaScore: '20', ogaLtask: '1/5' }),
  evidence('s4', 'Dan Ward', 3, { ogaScore: '80', ogaLtask: '4/5' }),
  // Another class's file must not show up.
  { ...evidence('s9', 'Zed Other', 1, { ogaScore: '90' }), appProperties: { ogaCourse: 'other', ogaWork: 'cw-new', ogaSub: 's9' } },
];
// The Drone, weeks earlier: Amelia 1st, Ben 2nd, Dan 3rd, Cara 4th. Now Dan is 2nd.
const OLD_FILES = [['o1', 'Amelia Smith', 100], ['o2', 'Ben Jones', 90], ['o3', 'Dan Ward', 30], ['o4', 'Cara Lee', 10]]
  .map(([sub, name, score]) => evidence(sub, name, 60 * 24 * 40, { ogaScore: String(score) }, 'cw-old'));

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
    r.fulfill({ json: { files: q.includes("value='cw-old'") ? OLD_FILES : q.includes("key='ogaWork'") ? FILES : [] } });
  });
  const classroomUrls = [];
  await page.route('https://classroom.googleapis.com/**', r => {
    const url = r.request().url();
    classroomUrls.push(url);
    if (url.includes('/studentSubmissions')) return r.fulfill({ json: { studentSubmissions: [{ id: 's1' }, { id: 's2' }, { id: 's3' }, { id: 's4' }] } });
    if (url.includes('/courseWork')) return r.fulfill({ json: { courseWork: [
      { id: 'cw-old', title: 'The Drone', creationTime: '2026-10-01T09:00:00Z', associatedWithDeveloper: true,
        materials: [{ link: { url: 'https://x.github.io/interactive/Y9/Python/L5_Functions/1_The_Drone_PRIMM.html?courseId=c' } }] },
      { id: 'cw-new', title: 'Binary Addition', creationTime: '2026-11-17T09:00:00Z', associatedWithDeveloper: true,
        materials: [{ link: { url: 'https://x.github.io/interactive/Y8/Data_Representation/L2_Binary_Addition/1_Binary_Addition.html?courseId=c' } }] },
      { id: 'cw-hand', title: 'Made by hand', creationTime: '2026-11-17T10:00:00Z' },
    ] } });
    if (url.includes('/topics')) return r.fulfill({ json: { topic: [] } });
    return r.fulfill({ json: { courses: [{ id: COURSE_ID, name: '8X Computing' }, { id: 'course-9y', name: '9Y Computing' }] } });
  });
  driveQueries.classroomUrls = classroomUrls;
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

    await expect(page.locator('#live-summary')).toHaveText('4 of 4 started · 1 finished · 1 with no save in 10 min');
    // Needs help first: Cara (20%, idle), Ben (60%), Dan (80%), Amelia (done).
    await expect(page.locator('.live-card .live-name')).toHaveText(['Cara L.', 'Ben J.', 'Dan W.', 'Amelia S.']);
    await expect(page.locator('.live-card').first()).toContainText('No save 10 min');
    await expect(page.locator('.live-card').nth(1)).toContainText('60% · Task 3/5');
    await expect(page.locator('.live-card').last()).toContainText('✓ Done');
    await expect(panel).not.toContainText('Zed');

    await page.locator('#live-tab-board').click();
    await expect(page.locator('#live-tab-board')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.live-board-title')).toHaveText('Carry Rush X7');
    await expect(page.locator('.live-board li .live-who')).toHaveText(['Ben J.', 'Amelia S.']);
    await expect(page.locator('.live-board li').first()).toContainText('3,100');
    // Every assignment also has a Top 10 by score.
    await page.locator('.live-board-pick [data-board="Top 10"]').click();
    await expect(page.locator('.live-board-title')).toHaveText('Top 10 · Score');
    await expect(page.locator('.live-board li .live-who')).toHaveText(['Amelia S.', 'Dan W.', 'Ben J.', 'Cara L.']);
    await expect(page.locator('.live-board li').nth(1)).toContainText('80%');

    // Most improved, against the assignment set at least 2 days earlier: Dan climbed 3rd → 2nd.
    await page.locator('#live-tab-improved').click();
    await expect(page.locator('#live-compare')).toBeVisible();
    await expect(page.locator('#live-compare')).toHaveValue('cw-old');
    await expect(page.locator('.live-improved li')).toHaveCount(1);
    await expect(page.locator('.live-improved li').first()).toContainText('Dan W.');
    await expect(page.locator('.live-improved li').first()).toContainText('3rd → 2nd place');
    await expect(page.locator('.live-improved li').first()).toContainText('30% → 80%');
    await expect(page.locator('.live-improved li').first()).toContainText('Already top 2');
    await page.locator('#live-tab-board').click();

    // The board says nothing about most improved until the teacher reveals it: then the name
    // (no places or scores) in a banner, and their row marked when they're on the board.
    await expect(page.locator('.live-mi-banner')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reveal most improved' }).click();
    await expect(page.locator('.live-mi-banner')).toContainText('Dan W.');
    await expect(page.locator('.live-mi-banner')).not.toContainText('%');
    await page.locator('.live-board-pick [data-board="Top 10"]').click();
    await expect(page.locator('.live-board li.is-mi .live-who')).toHaveText('Dan W.Most improved');
    await page.getByRole('button', { name: 'Hide most improved' }).click();
    await expect(page.locator('.live-mi-banner')).toHaveCount(0);
    await expect(page.locator('.live-board li.is-mi')).toHaveCount(0);

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

    // A class with no hub assignments, picked from the panel's own class list.
    await page.locator('#live-course').selectOption('course-9y');
    await expect.poll(() => driveQueries.classroomUrls.some(u => u.includes('/courses/course-9y/courseWork'))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });

  test('a hidden student appears nowhere until shown again from the Hidden list', async ({ page }) => {
    await mockHubTeacher(page);
    await page.goto('/index.html');
    await page.locator('#btn-live').click();
    await expect(page.locator('.live-card')).toHaveCount(4);
    await expect(page.locator('#live-hidden-btn')).toBeHidden();

    // Hidden from their Progress card: gone from Progress, every board, Most improved and the reveal.
    await page.getByRole('button', { name: 'Hide Ben Jones from the Live view' }).click();
    await page.getByRole('button', { name: 'Hide Dan Ward from the Live view' }).click();
    await expect(page.locator('.live-card')).toHaveCount(2);
    await expect(page.locator('#live-body')).not.toContainText(/Ben|Dan/);
    await expect(page.locator('#live-hidden-btn')).toContainText('2');
    await expect(page.locator('#live-hidden-pop')).toBeHidden();   // names only when asked for
    await page.locator('#live-tab-board').click();
    await expect(page.locator('.live-board li .live-who')).toHaveText(['Amelia S.']);
    await expect(page.locator('.live-board li').first()).toContainText('🥇');
    await page.locator('.live-board-pick [data-board="Top 10"]').click();
    await expect(page.locator('#live-body')).not.toContainText(/Ben|Dan/);
    await page.getByRole('button', { name: 'Reveal most improved' }).click();
    await expect(page.locator('.live-mi-banner')).toContainText('Not decided yet');   // Dan was the one
    await page.locator('#live-tab-improved').click();
    await expect(page.locator('#live-body')).not.toContainText('Dan');

    // Remembered next time; the Hidden list shows how they're doing, for the teacher to check.
    await page.reload();
    await page.locator('#btn-live').click();
    await page.locator('#live-hidden-btn').click();
    await expect(page.locator('#live-hidden-btn')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#live-hidden-pop li')).toHaveCount(2);
    await expect(page.locator('#live-hidden-pop li').first()).toContainText('Ben Jones');
    await expect(page.locator('#live-hidden-pop li').first()).toContainText('60% · Task 3/5');
    await page.keyboard.press('Escape');   // closes the list, not the Live view
    await expect(page.locator('#live-hidden-pop')).toBeHidden();
    await expect(page.locator('#live-panel')).toBeVisible();

    // Shown again from the list, which stays open for the next one.
    await page.locator('#live-hidden-btn').click();
    await page.getByRole('button', { name: 'Show Ben Jones again' }).click();
    await expect(page.locator('#live-hidden-pop li')).toHaveCount(1);
    await page.getByRole('button', { name: 'Show Dan Ward again' }).click();
    await expect(page.locator('#live-hidden-btn')).toBeHidden();
    await expect(page.locator('.live-card')).toHaveCount(4);
  });
});
