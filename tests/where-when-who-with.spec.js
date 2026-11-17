import { test, expect } from '@playwright/test';
import { SORTS, CHOICES, SPECTRUMS, SPOTS, UNLOCK } from '../Y10/Component_1/L3.1_Where_When_Who_With/checkers.js';

const URL = '/Y10/Component_1/L3.1_Where_When_Who_With/1_Where_When_Who_With.html';

async function unlock(page, idx) {
  await page.locator(`.tab[data-idx="${idx}"]`).click();
  await page.locator(`#panel-${idx} .unlock-word`).fill(UNLOCK[2]);
  await page.locator(`#panel-${idx} .unlock-form button`).click();
  await expect(page.locator(`#panel-${idx} .lockbox`)).toHaveCount(0);
}
// Skip a cooldown so the test doesn't wait: it survives a reload, so clear it in storage.
async function skipCooldown(page) {
  await page.evaluate(() => {
    const k = 'y10_c1_l3_1_situation';
    const s = JSON.parse(localStorage.getItem(k)); s.coolUntil = {}; localStorage.setItem(k, JSON.stringify(s));
  });
  await page.reload();
}

test('opens on the warm-up with its definitions; Part 2 opens with its word; the lock box points to the Part 1 challenge', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#panel-5')).toBeVisible();
  await expect(page.locator('#panel-5 .terms div')).toHaveCount(3);
  await expect(page.locator('#panel-5 .tray .chip')).toHaveCount(SORTS.warm.items.length);
  for (const i of [2, 3, 4, 7]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  await page.locator('.tab[data-idx="2"]').click();
  await page.locator('#panel-2 .lockbox [data-goto="6"]').click();
  await expect(page.locator('#panel-6 .write-q')).toHaveCount(3);
  await expect(page.locator('#panel-6 .strip img[src^="data:"]')).toHaveCount(2);   // Walkman and Game Boy
  await unlock(page, 2);
  await expect(page.locator('.tab.locked')).toHaveCount(0);
});

test('Task 1: five questions show their product beside them; all right answers go green first time', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  await expect(page.locator('#panel-0 .q.has-pic .q-pic img[src^="data:"]')).toHaveCount(5);
  const entries = Object.entries(CHOICES.same);
  for (const [id, c] of entries) await page.locator(`input[name="${id}"][value="${c.a}"]`).check();
  await page.locator('#check-0').click();
  await expect(page.locator('#feedback-0')).toHaveClass(/correct/);
  await expect(page.locator('#panel-0 .q.is-correct')).toHaveCount(entries.length);
});

test('Task 2 diary: a short entry goes red; a full diary saves', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="1"]').click();
  const entry = {
    e1: ['The Traitors', 'I watched it on the sofa at home at 9 pm, with my mum and my sister.', 'I was also eating my tea'],
    e2: ['Spotify', 'I listened on my headphones on the walk to school at 8 am, on my own.', 'I was also walking to school'],
    e3: ['Mario Kart World', 'I played it in my bedroom after school at about 5 pm, online with two mates.', 'I was also talking on a headset'],
  };
  for (const [e, [prod, sit, also]] of Object.entries(entry)) {
    await page.locator(`#${e}_prod`).fill(prod);
    await page.locator(`#${e}_sit`).fill(e === 'e2' ? 'on the bus' : sit);
    await page.locator(`#${e}_else`).fill(also);
  }
  await page.locator('#check-1').click();
  await expect(page.locator('#panel-1 .write-q[data-qw="e2_sit"]')).toHaveClass(/is-wrong/);
  await page.locator('#e2_sit').fill(entry.e2[1]);
  await page.locator('#check-1').click();
  await expect(page.locator('.tab[data-idx="1"]')).toHaveClass(/done/);
});

test('Task 3 sort: nine involvement cards into three boxes, all right first time', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2);
  const panel = page.locator('#panel-2');
  await expect(panel.locator('.bin')).toHaveCount(3);
  for (const it of SORTS.kinds.items) {
    await panel.locator(`.chip[data-qw="${it.id}"]`).click();
    await panel.locator(`.bin[data-bin="${it.bin}"]`).click();
  }
  await page.locator('#check-2').click();
  await expect(panel.locator('.chip.is-correct')).toHaveCount(SORTS.kinds.items.length);
  await expect(page.locator('.tab[data-idx="2"]')).toHaveClass(/done/);
});

// Seen in class (2026-11-17): every card in box 1, check, the reds in box 2, check, the rest in box 3.
test('Task 3 sort: every card in one box cannot be checked, and a mostly wrong board does not say which', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 2);
  const panel = page.locator('#panel-2'), bins = SORTS.kinds.bins.map(b => b[0]);
  for (const it of SORTS.kinds.items) {
    await panel.locator(`.chip[data-qw="${it.id}"]`).click();
    await panel.locator(`.bin[data-bin="${bins[0]}"]`).click();
  }
  await expect(panel.locator(`.bin[data-bin="${bins[0]}"] .bin-count`)).toHaveText('9 / 3');
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toContainText('number of cards shown');
  await expect(panel.locator('.chip.is-wrong')).toHaveCount(0);
  await expect(page.locator('#check-2')).toBeEnabled();   // no time lost
  // Every card one box along: each box is full, but all nine are wrong.
  for (const it of SORTS.kinds.items) {
    await panel.locator(`.chip[data-qw="${it.id}"]`).click();
    await panel.locator(`.bin[data-bin="${bins[(bins.indexOf(it.bin) + 1) % 3]}"]`).click();
  }
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toContainText('Only 0 of 9 right');
  await expect(panel.locator('.chip.is-wrong, .chip.is-correct')).toHaveCount(0);
  await expect(page.locator('#check-2')).toBeDisabled();
});

test('Task 4 spectrum: a passive card at the active end goes red and waits; then it finishes', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 3);
  const sp = SPECTRUMS.line, panel = page.locator('#panel-3');
  await expect(panel.locator('.ends')).toContainText('Passive');
  await expect(panel.locator('.bin')).toHaveCount(sp.zones.length);
  for (const it of sp.items) {
    await panel.locator(`.chip[data-qw="${it.id}"]`).click();
    await panel.locator(`.bin[data-bin="${it.id === 'l_homework' ? 'z5' : it.ok[0]}"]`).click();
  }
  await page.locator('#why_pas').fill('The audience is passive because the music is just on in the background and nobody really listens.');
  await page.locator('#why_act').fill('The audience is active because they build a level for others to play. This is consumer-generated content.');
  await page.locator('#check-3').click();
  await expect(panel.locator('.chip[data-qw="l_homework"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#check-3')).toBeDisabled();

  await skipCooldown(page);
  await page.locator('.tab[data-idx="3"]').click();
  await panel.locator('.chip[data-qw="l_homework"]').click();
  await panel.locator('.bin[data-bin="z1"]').click();
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toHaveClass(/correct/);
  await expect(panel.locator('.chip .reveal').first()).toBeVisible();
});

test('★ spot the slip: finding Sam\'s three slips brings up the fixes', async ({ page }) => {
  await page.goto(URL);
  await unlock(page, 7);
  await expect(page.locator('#panel-7 .spot-text.lines')).toBeVisible();
  const slips = SPOTS.slip.parts.filter(p => p.fix);
  for (const p of slips) await page.locator(`#panel-7 .sent[data-qw="${p.id}"]`).click();
  await page.locator('#check-7').click();
  await expect(page.locator('#panel-7 .fixes .q')).toHaveCount(slips.length);
  for (const p of slips) await page.locator(`input[name="${p.id}_fix"][value="${p.fix.a}"]`).check();
  await page.locator('#check-7').click();
  await expect(page.locator('.tab[data-idx="7"]')).toHaveClass(/done/);
});
