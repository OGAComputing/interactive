import { test, expect } from '@playwright/test';
import { SORTS, CHOICES, REVEALS, PROFILES, UNLOCK } from '../Y10/Component_1/L2.2_Who_Is_It_For/checkers.js';

const URL = '/Y10/Component_1/L2.2_Who_Is_It_For/1_Who_Is_It_For.html';

async function unlock(page, idx) {
  await page.locator(`.tab[data-idx="${idx}"]`).click();
  await page.locator(`#panel-${idx} .unlock-word`).fill(UNLOCK[2]);
  await page.locator(`#panel-${idx} .unlock-form button`).click();
  await expect(page.locator(`#panel-${idx} .lockbox`)).toHaveCount(0);
}
// Skip a cooldown so the test doesn't wait: it survives a reload, so clear it in storage.
async function skipCooldown(page) {
  await page.evaluate(() => {
    const k = Object.keys(localStorage).find(x => x.startsWith('y10_c1_l2_2'));
    const s = JSON.parse(localStorage.getItem(k)); s.coolUntil = {}; localStorage.setItem(k, JSON.stringify(s));
  });
  await page.reload();
}

test('opens on the warm-up; Part 2 opens with its word, and the lock box points to the Part 1 challenge', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#panel-5')).toBeVisible();
  await expect(page.locator('#panel-5 .tray .chip')).toHaveCount(SORTS.warm.items.length);
  for (const i of [2, 3, 4, 7]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  await page.locator('.tab[data-idx="2"]').click();
  await page.locator('#panel-2 .lockbox [data-goto="6"]').click();
  await expect(page.locator('#panel-6')).toBeVisible();
  await expect(page.locator('#panel-6 .write-q')).toHaveCount(3);
  await unlock(page, 2);
  await expect(page.locator('.tab.locked')).toHaveCount(0);
});

test('Task 1: all right answers go green', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const entries = Object.entries(CHOICES.who);
  for (const [id, c] of entries) await page.locator(`input[name="${id}"][value="${c.a}"]`).check();
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toHaveClass(/correct/);
  await expect(page.locator('#panel-0 .q.is-correct')).toHaveCount(entries.length);
});

test('Task 2 reveal: the product shows first; a wrong guess adds a clue and waits; solving all four finishes it', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="1"]').click();
  const panel = page.locator('#panel-1'), game = REVEALS.guess;
  const roundId = () => panel.locator('.round').getAttribute('data-qw');
  await expect(panel.locator('.round .subject b')).toBeVisible();
  await expect(panel.locator('.clues li')).toHaveCount(1);

  const id = await roundId();
  const r = game.rounds.find(x => x.id === id);
  const wrong = game.opts.find(o => o[0] !== r.a)[0];
  await panel.locator(`.guess[data-guess="${wrong}"]`).click();
  await expect(panel.locator('.clues li')).toHaveCount(2);
  await expect(page.locator('#feedback-1')).toHaveClass(/wrong/);
  await expect(panel.locator(`.guess[data-guess="${r.a}"]`)).toBeDisabled();

  await skipCooldown(page);
  await page.locator('.tab[data-idx="1"]').click();
  for (let n = 0; n < game.rounds.length; n++) {
    const rid = await roundId();
    const round = game.rounds.find(x => x.id === rid);
    await panel.locator(`.guess[data-guess="${round.a}"]`).click();
  }
  await expect(page.locator('#feedback-1')).toContainText('Every round solved');
  await expect(panel.locator('.file')).toHaveCount(game.rounds.length);
});

test('Task 3 sort: a football fan\'s lifestyle, sorted by clicking', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2);
  const panel = page.locator('#panel-2');
  for (const it of SORTS.fans.items) {
    await panel.locator(`.chip[data-qw="${it.id}"]`).click();
    await panel.locator(`.bin[data-bin="${it.bin}"]`).click();
  }
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toContainText('first time');
});

test('Task 4 profile: evidence and fields show; one wrong field goes red and waits; then it passes', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 3);
  const panel = page.locator('#panel-3'), cards = PROFILES.card.cards;
  await expect(panel.locator('.profile-card')).toHaveCount(cards.length);
  await expect(panel.locator('.profile-card').first().locator('.evidence li')).toHaveCount(cards[0].evidence.length);
  await expect(panel.locator('.profile-card img')).toHaveCount(cards.length);
  const fields = cards.flatMap(c => c.fields);
  await expect(panel.locator('.pf')).toHaveCount(fields.length);

  for (const f of fields) await panel.locator(`input[name="${f.id}"][value="${f.id === 'f_gen' ? 'mix' : f.ok[0]}"]`).check();
  await page.locator('#check-3').click();
  await expect(panel.locator('.pf[data-qw="f_gen"]')).toHaveClass(/is-wrong/);
  await expect(panel.locator('.pf.is-correct')).toHaveCount(fields.length - 1);
  await expect(page.locator('#check-3')).toBeDisabled();

  await skipCooldown(page);
  await page.locator('.tab[data-idx="3"]').click();
  await panel.locator('input[name="f_gen"][value="m"]').check();   // answers survive the reload
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toContainText('All correct');
  await expect(panel.locator('input[name="r_age"]').first()).toBeDisabled();
});

test('★ Stranger Things: right fields but a weak reason asks for a sentence without a cooldown', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 7);
  const panel = page.locator('#panel-7');
  for (const f of PROFILES.st.cards[0].fields) await panel.locator(`input[name="${f.id}"][value="${f.ok[0]}"]`).check();
  await page.locator('#st_why').fill('nostalgia');
  await page.locator('#check-7').click();
  await expect(page.locator('#feedback-7')).toContainText('full sentence');
  await expect(page.locator('#check-7')).toBeEnabled();
  await page.locator('#st_why').fill('The secondary audience grew up in the 1980s, so they enjoy the songs and fashion they remember');
  await page.locator('#check-7').click();
  await expect(page.locator('#feedback-7')).toHaveClass(/correct/);
});

test('Task 5: the lifestyle profile saves once every box uses its word', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 4);
  await page.locator('#m_prod').fill('Radio 1');
  await page.locator('#m_who').fill('A typical member of the primary audience is Maya, aged 19, a student in socio-economic group C1');
  await page.locator('#m_int').fill('In her free time she is interested in new music and festivals');
  await page.locator('#m_att').fill('Her attitude to music is that the newest songs are the best');
  await page.locator('#m_val').fill('She values her friends because they go to gigs together');
  await page.locator('#m_beh').fill('Every morning she listens on the bus');
  await page.locator('#check-4').click();
  await expect(page.locator('.write-q[data-qw="m_beh"]')).toHaveClass(/is-wrong/);
  await page.locator('#m_beh').fill('Her behaviour: every morning she listens on the BBC Sounds app on the bus');
  await page.locator('#check-4').click();
  await expect(page.locator('#feedback-4')).toContainText('Saved');
});

test('glossary words show their meaning on hover', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const tip = page.locator('.gl-tip');
  await page.locator('#panel-0 .q-text .gl', { hasText: /^state pension$/ }).first().hover();
  await expect(tip).toHaveClass(/show/);
  await expect(tip).toContainText('retire');
  await expect(page.locator('#panel-0 .terms .gl')).toHaveCount(0);
});
