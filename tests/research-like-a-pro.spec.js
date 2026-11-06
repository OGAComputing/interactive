import { test, expect } from '@playwright/test';
import { SORTS, CHOICES, SPECTRUMS, SPOTS, HUNTS, UNLOCK } from '../Y10/Component_1/L2.1_Research_Like_a_Pro/checkers.js';

const URL = '/Y10/Component_1/L2.1_Research_Like_a_Pro/1_Research_Like_a_Pro.html';

async function unlock(page, idx, word) {
  await page.locator(`.tab[data-idx="${idx}"]`).click();
  await page.locator(`#panel-${idx} .unlock-word`).fill(word);
  await page.locator(`#panel-${idx} .unlock-form button`).click();
  await expect(page.locator(`#panel-${idx} .lockbox`)).toHaveCount(0);
}
// Skip a cooldown so the test doesn't wait: it survives a reload, so clear it in storage.
async function skipCooldown(page) {
  await page.evaluate(() => {
    const k = Object.keys(localStorage).find(x => x.startsWith('y10_c1_l2_1'));
    const s = JSON.parse(localStorage.getItem(k)); s.coolUntil = {}; localStorage.setItem(k, JSON.stringify(s));
  });
  await page.reload();
}

test('opens on the warm-up; parts 2 and 3 open only with their own words', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#panel-4')).toBeVisible();
  await expect(page.locator('#panel-4 .tray .chip')).toHaveCount(SORTS.warm.items.length);
  for (const i of [1, 6, 2, 3, 7]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);

  // The Part 2 word doesn't open Part 3; the lock box points to the challenges already open.
  await unlock(page, 1, UNLOCK[2]);
  await page.locator('.tab[data-idx="2"]').click();
  await page.locator('#panel-2 .unlock-word').fill(UNLOCK[2]);
  await page.locator('#panel-2 .unlock-form button').click();
  await expect(page.locator('#panel-2 .unlock-msg')).toContainText('opens Part 2');
  await expect(page.locator('#panel-2 .lockbox [data-goto]')).toHaveCount(2);
  await unlock(page, 2, UNLOCK[3]);
  await expect(page.locator('.tab.locked')).toHaveCount(0);
});

test('Task 1: all right answers go green', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const entries = Object.entries(CHOICES.which);
  for (const [id, c] of entries) await page.locator(`input[name="${id}"][value="${c.a}"]`).check();
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toHaveClass(/correct/);
  await expect(page.locator('#panel-0 .q.is-correct')).toHaveCount(entries.length);
});

test('Task 2 spectrum: a card at the wrong end goes red and waits; good places plus reasons finish it', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 1, UNLOCK[2]);
  const sp = SPECTRUMS.rely, panel = page.locator('#panel-1');
  await expect(panel.locator('.ends')).toContainText('Trust it');
  await expect(panel.locator('.bin')).toHaveCount(sp.zones.length);
  await expect(panel.locator('.why .write-q')).toHaveCount(sp.why.length);

  // Place every card by clicking it, then its zone; the anonymous post goes at the wrong end.
  for (const it of sp.items) {
    await panel.locator(`.chip[data-qw="${it.id}"]`).click();
    await panel.locator(`.bin[data-bin="${it.id === 'r_reddit' ? 'z1' : it.ok[0]}"]`).click();
  }
  await page.locator('#why_trust').fill('I can trust the official website because Mojang makes the game and can count its sales');
  await page.locator('#why_doubt').fill('I can\'t trust the Reddit post because it is anonymous and nobody can check it');
  await page.locator('#check-1').click();
  await expect(panel.locator('.chip[data-qw="r_reddit"]')).toHaveClass(/is-wrong/);
  await expect(panel.locator('.chip.is-correct')).toHaveCount(sp.items.length - 1);
  await expect(page.locator('#check-1')).toBeDisabled();

  await skipCooldown(page);
  await page.locator('.tab[data-idx="1"]').click();
  await panel.locator('.chip[data-qw="r_reddit"]').click();
  await panel.locator('.bin[data-bin="z5"]').click();
  await page.locator('#why_doubt').fill('too short');
  await page.locator('#check-1').click();
  // Placements are right, so a weak reason only asks for a sentence: no cooldown.
  await expect(page.locator('#feedback-1')).toContainText('full sentence');
  await expect(panel.locator('.write-q[data-qw="why_doubt"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#check-1')).toBeEnabled();
  await page.locator('#why_doubt').fill('I can\'t trust the Reddit post because it is anonymous and nobody can check it');
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toHaveClass(/correct/);
  await expect(panel.locator('.chip .reveal').first()).toBeVisible();   // notes appear once done
});

test('Task 3: Jay\'s log is one line per entry, and finding the five slips brings up the fixes', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2, UNLOCK[3]);
  await page.locator('.tab[data-idx="2"]').click();
  await expect(page.locator('#panel-2 .spot-text.lines')).toBeVisible();
  const slips = SPOTS.slip.parts.filter(p => p.fix);
  for (const p of slips) await page.locator(`.sent[data-qw="${p.id}"]`).click();
  await page.locator('#check-2').click();
  await expect(page.locator('#panel-2 .fixes .q')).toHaveCount(slips.length);
  for (const p of slips) await page.locator(`input[name="${p.id}_fix"][value="${p.fix.a}"]`).check();
  await page.locator('#check-2').click();
  await expect(page.locator('.tab[data-idx="2"]')).toHaveClass(/done/);
});

test('Task 4 hunt: a search link is caught without a penalty; a full log shows the references', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2, UNLOCK[3]);
  await page.locator('.tab[data-idx="3"]').click();
  const panel = page.locator('#panel-3');
  await expect(panel.locator('.hunt-row')).toHaveCount(HUNTS.log.rows.length);
  await expect(panel.locator('.hunt-row img')).toHaveCount(3);
  await expect(panel.locator('#h_pri_url')).toHaveCount(0);   // primary research has no link

  const facts = { h_st: 'Hawkins', h_beano: '1938', h_fn: '100' };
  const urls = { h_st: 'https://www.netflix.com/gb/title/80057281', h_beano: 'https://www.beano.com/about', h_fn: 'https://www.epicgames.com/fortnite' };
  for (const id of Object.keys(facts)) {
    await page.locator(`#${id}_fact`).fill(facts[id]);
    await page.locator(`#${id}_url`).fill(urls[id]);
    await page.locator(`#${id}_who`).fill(id === 'h_st' ? 'Netflix' : id === 'h_beano' ? 'Beano.com' : 'Epic Games');
    await page.locator(`#${id}_note`).fill('This is secondary research. I can trust it because it is the official website for it');
  }
  await page.locator('#h_pri_fact').fill('She has played Fortnite and thinks the building is the best part');
  await page.locator('#h_pri_who').fill('the person next to me');
  await page.locator('#h_pri_note').fill('This is primary research: an interview because I asked one person myself');
  await page.locator('#h_beano_url').fill('https://www.google.com/search?q=first+beano');
  await page.locator('#check-3').click();
  await expect(panel.locator('.field[data-qw="h_beano_url"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#feedback-3')).toContainText('search results');
  await expect(page.locator('#check-3')).toBeEnabled();   // a link slip never costs time

  await page.locator('#h_beano_url').fill(urls.h_beano);
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toContainText('first time');
  await expect(panel.locator('.refs li')).toHaveCount(HUNTS.log.rows.length);
  await expect(panel.locator('.refs li').first()).toContainText('Netflix. Stranger Things (Netflix). https://www.netflix.com');
  await page.reload();
  await page.locator('.tab[data-idx="3"]').click();
  await expect(panel.locator('.refs li')).toHaveCount(HUNTS.log.rows.length);   // still there after a refresh
});

test('Task 4 hunt: a wrong fact costs gold and starts the cooldown', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2, UNLOCK[3]);
  await page.locator('.tab[data-idx="3"]').click();
  // Checking a blank log only asks for the facts: blank isn't wrong, so no cooldown.
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toContainText('find every fact');
  await expect(page.locator('#check-3')).toBeEnabled();
  await page.locator('#h_beano_fact').fill('1983');
  await page.locator('#check-3').click();
  await expect(page.locator('.field[data-qw="h_beano_fact"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#feedback-3')).toContainText("doesn't match");
  await expect(page.locator('#check-3')).toBeDisabled();
});

test('glossary words show their meaning on hover', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const tip = page.locator('.gl-tip');
  await page.locator('#panel-0 .q-text .gl', { hasText: /^box office$/ }).first().hover();
  await expect(tip).toHaveClass(/show/);
  await expect(tip).toContainText('cinema tickets');
  await expect(page.locator('#panel-0 .terms .gl')).toHaveCount(0);
});
