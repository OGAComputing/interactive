import { test, expect } from '@playwright/test';
import { SORTS, CHOICES, NUMBERS, PILOTS, UNLOCK } from '../Y10/Component_1/L2.3_Counting_and_Asking_Audiences/checkers.js';

const URL = '/Y10/Component_1/L2.3_Counting_and_Asking_Audiences/1_Counting_and_Asking_Audiences.html';

async function unlock(page, idx) {
  await page.locator(`.tab[data-idx="${idx}"]`).click();
  await page.locator(`#panel-${idx} .unlock-word`).fill(UNLOCK[2]);
  await page.locator(`#panel-${idx} .unlock-form button`).click();
  await expect(page.locator(`#panel-${idx} .lockbox`)).toHaveCount(0);
}
// Skip a cooldown so the test doesn't wait: it survives a reload, so clear it in storage.
async function skipCooldown(page) {
  await page.evaluate(() => {
    const k = 'y10_c1_l2_3_counting';
    const s = JSON.parse(localStorage.getItem(k)); s.coolUntil = {}; localStorage.setItem(k, JSON.stringify(s));
  });
  await page.reload();
}

test('opens on the warm-up with its definitions; Part 2 opens with its word; the lock box points to the Part 1 challenge', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#panel-6')).toBeVisible();
  await expect(page.locator('#panel-6 .terms div')).toHaveCount(6);
  await expect(page.locator('#panel-6 .tray .chip')).toHaveCount(SORTS.warm.items.length);
  for (const i of [3, 4, 5, 8]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  await page.locator('.tab[data-idx="3"]').click();
  await page.locator('#panel-3 .lockbox [data-goto="7"]').click();
  await expect(page.locator('#panel-7 .write-q')).toHaveCount(3);
  await unlock(page, 3);
  await expect(page.locator('.tab.locked')).toHaveCount(0);
});

test('Task 1: all right answers go green first time', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const entries = Object.entries(CHOICES.which);
  for (const [id, c] of entries) await page.locator(`input[name="${id}"][value="${c.a}"]`).check();
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toContainText('first time');
  await expect(page.locator('#panel-0 .q.is-correct')).toHaveCount(entries.length);
});

test('Task 2 numbers: three tables show; a wrong number goes red and waits; then typed answers pass and lock', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="1"]').click();
  const panel = page.locator('#panel-1'), qs = NUMBERS.read.qs;
  await expect(panel.locator('.data-table')).toHaveCount(NUMBERS.read.tables.length);
  await expect(panel.locator('.data-table img')).toHaveCount(2);
  const answer = async (wrongId) => {
    for (const q of qs) {
      if (q.opts) await panel.locator(`input[name="${q.id}"][value="${q.a}"]`).check();
      else await panel.locator(`#${q.id}`).fill(q.id === wrongId ? '12' : q.id === 'n_mc' ? '£56.9m' : String(q.a));
    }
  };
  await answer('n_gap');
  await page.locator('#check-1').click();
  await expect(panel.locator('.q[data-qw="n_gap"]')).toHaveClass(/is-wrong/);
  await expect(panel.locator('.q.is-correct')).toHaveCount(qs.length - 1);
  await expect(page.locator('#check-1')).toBeDisabled();

  await skipCooldown(page);
  await page.locator('.tab[data-idx="1"]').click();
  await expect(panel.locator('#n_gap')).toHaveValue('12');   // answers survive the reload
  await panel.locator('#n_gap').fill('19.3');
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toContainText('All correct');
  await expect(panel.locator('#n_mc')).toBeDisabled();
});

test('Task 3 hunt: a fact with no number asks for one, with no cooldown; a full log makes references', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="2"]').click();
  const fill = async (id, v) => page.locator(`#${id}`).fill(v);
  await fill('h1_prod', 'A Minecraft Movie');
  await fill('h1_fact', 'It took a lot of money at UK and Ireland cinemas');
  await fill('h1_url', 'https://www.bbc.co.uk/news/articles/abc123');
  await fill('h1_who', 'BBC News');
  await fill('h1_note', 'This box office figure shows that millions of people paid to see it at the cinema');
  await fill('h2_prod', 'MrBeast');
  await fill('h2_fact', 'His YouTube channel had 500 million subscribers in June 2026');
  await fill('h2_url', 'https://www.youtube.com/@MrBeast');
  await fill('h2_who', 'YouTube');
  await fill('h2_note', 'This subscribers figure shows his channel has a huge audience all around the world');
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toContainText('needs its number');
  await expect(page.locator('#check-2')).toBeEnabled();
  await fill('h1_fact', 'It took £56.9 million at UK and Ireland cinemas in 2025');
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toHaveClass(/correct/);
  await expect(page.locator('#panel-2 .refs li')).toHaveCount(2);
});

test('Task 5 test the survey: run it, flag the useless results, rewrite them, run them again', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 4);
  const panel = page.locator('#panel-4'), lines = PILOTS.jay.lines, slips = lines.filter(l => l.slip);
  await expect(panel.locator('.pilot-plan .line')).toHaveCount(lines.length);
  await panel.locator('.pilot-run').click();
  await expect(panel.locator('.pilot-results .res')).toHaveCount(lines.length);
  for (const l of slips) await panel.locator(`.pilot-results .res[data-qw="${l.id}"]`).click();
  await page.locator('#check-4').click();
  await expect(page.locator('#feedback-4')).toContainText('You found all 3');
  await expect(panel.locator('.pilot-fix textarea')).toHaveCount(3);
  await expect(panel.locator('#j_two_re')).toHaveValue(slips.find(l => l.id === 'j_two').text);   // starts as Jay's line

  const good = {
    j_best: 'How much do you like Fortnite, from 1 to 5?',
    j_two: 'How often do you play Fortnite? Who do you play with?',
    j_who: '20 students aged 12 to 16, some who play a lot and some who don\'t.',
  };
  for (const [id, t] of Object.entries(good)) await panel.locator(`#${id}_re`).fill(id === 'j_two' ? 'How often do you play and who with?' : t);
  await page.locator('#check-4').click();
  await expect(page.locator('#feedback-4')).toContainText('1 rewrite in red');
  await expect(panel.locator('.pilot-msg')).toHaveCount(1);
  await expect(panel.locator('.again')).toHaveCount(2);
  await expect(page.locator('#check-4')).toBeDisabled();

  await skipCooldown(page);
  await page.locator('.tab[data-idx="4"]').click();
  await panel.locator('#j_two_re').fill(good.j_two);
  await page.locator('#check-4').click();
  await expect(page.locator('#feedback-4')).toContainText('All correct');
  await expect(panel.locator('.again')).toHaveCount(3);
  await expect(panel.locator('#j_best_re')).toBeDisabled();
});

test('Task 6 writing: the steps and eight boxes show; a weak answer goes red without a cooldown', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 5);
  const panel = page.locator('#panel-5');
  await expect(panel.locator('.steps li')).toHaveCount(6);
  await expect(panel.locator('.write-q')).toHaveCount(8);
  await page.locator('#t_prod').fill('Stranger Things');
  await page.locator('#check-5').click();
  await expect(page.locator('#feedback-5')).toHaveClass(/wrong/);
  await expect(page.locator('#check-5')).toBeEnabled();
});

test('the research log links open 2.1 on its research log task', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="2"]').click();
  const link = page.locator('#panel-2 .goal a');
  await expect(link).toHaveAttribute('target', '_blank');
  const [log] = await Promise.all([page.waitForEvent('popup'), link.click()]);
  await expect(log).toHaveURL(/L2\.1_Research_Like_a_Pro\/1_Research_Like_a_Pro\.html#log$/);
  await expect(log.locator('#panel-3')).toBeVisible();   // 2.1's 'log' task (Part 3: its lock box shows until unlocked)
  await expect(log.locator('.tab[data-idx="3"]')).toHaveClass(/active/);
});
