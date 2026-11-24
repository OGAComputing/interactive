// The Assign button's Automatic topic (index.html resolveTopic + hub-topics.js): a unit's first
// lesson makes a topic named after the unit, later lessons follow it, and the box goes back to
// Automatic after each post. The rules themselves are in hub-topics.test.js.
import { test, expect } from '@playwright/test';

const COURSE = 'c-8x';

async function mockClassroom(page) {
  await page.addInitScript(c => {
    sessionStorage.setItem('oga_oauth_token', JSON.stringify({ access_token: 'mock-teacher', scope: '', expires_at: Date.now() + 3600000 }));
    localStorage.setItem('oga_hub_last_course', c);
  }, COURSE);
  await page.route('https://accounts.google.com/**', r => r.abort());
  await page.route('https://www.googleapis.com/**', r => r.fulfill({ json: { sub: 't1', email: 'teacher@test.com', files: [] } }));
  const posts = { topics: [], work: [] };
  let n = 0;
  await page.route('https://classroom.googleapis.com/**', r => {
    const url = r.request().url();
    const method = r.request().method();
    if (url.includes('/topics')) {
      if (method === 'POST') {
        const body = r.request().postDataJSON();
        posts.topics.push(body.name);
        return r.fulfill({ json: { topicId: 't-new', name: body.name, courseId: COURSE } });
      }
      return r.fulfill({ json: { topic: [{ topicId: 't-wk', name: 'Week 3 homework' }] } });
    }
    if (url.includes('/courseWork')) {
      if (method === 'POST') {
        posts.work.push(r.request().postDataJSON());
        return r.fulfill({ json: { id: `cw-${++n}`, creationTime: new Date(Date.now() + n * 1000).toISOString() } });
      }
      return r.fulfill({ json: { courseWork: [{ id: 'old', topicId: 't-wk', creationTime: '2026-11-01T09:00:00Z' }] } });
    }
    return r.fulfill({ json: { courses: [{ id: COURSE, name: '8X Computing' }] } });
  });
  return posts;
}

const assign = async (page, path) => {
  await page.locator(`.btn-assign[data-path="${path}"]`).click();
  await expect(page.locator('#assign-modal-backdrop')).toHaveClass(/open/);
  const body = await page.locator('#assign-modal-body').textContent();
  await page.locator('#assign-modal-actions button').click();
  return body;
};

test('Automatic topic: first lesson makes the unit topic, later lessons follow it', async ({ page }) => {
  const posts = await mockClassroom(page);
  await page.goto('/index.html');
  await page.getByRole('tab', { name: /Year 8/ }).click();
  const topicBox = page.locator('#topic-search');
  await expect(topicBox).toHaveValue('Automatic (by lesson)');

  // Lesson 1 of Data Representation: the class has no such topic, so the hub makes it.
  let msg = await assign(page, 'Y8/Data_Representation/L1_Binary_And_Denary/1_Binary_And_Denary.html');
  expect(posts.topics).toEqual(['Data Representation']);
  expect(posts.work[0].topicId).toBe('t-new');
  expect(msg).toContain('new topic, Data Representation');

  // Lesson 2: under the unit's topic, nothing new made.
  msg = await assign(page, 'Y8/Data_Representation/L2_Binary_Addition/1_Binary_Addition.html');
  expect(posts.topics).toHaveLength(1);
  expect(posts.work[1].topicId).toBe('t-new');
  expect(msg).toContain('under the topic Data Representation');

  // A later lesson of a unit with no topic yet follows the last assignment.
  await assign(page, 'Y8/Python Unit 2/L2_Casting/1 Casting.html');
  expect(posts.work[2].topicId).toBe('t-new');

  // Picking a topic applies to the next post only; then it's back to Automatic.
  await topicBox.click();
  await page.locator('#topic-dropdown .course-option', { hasText: 'Week 3 homework' }).click();
  await assign(page, 'Y8/Data_Representation/L3_Hexadecimal/1_Hexadecimal.html');
  expect(posts.work[3].topicId).toBe('t-wk');
  await expect(topicBox).toHaveValue('Automatic (by lesson)');

  await topicBox.click();
  await page.locator('#topic-dropdown .course-option', { hasText: 'No topic' }).click();
  await assign(page, 'Y8/Data_Representation/L3_Hexadecimal/1_Hexadecimal.html');
  expect(posts.work[4].topicId).toBeUndefined();
});
