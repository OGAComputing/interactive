import { test, expect } from '@playwright/test';
import { SORTS, CHOICES, REVEALS, SPOTS, UNLOCK } from '../Y10/Component_1/L1.3_Who_Made_It_and_Why/checkers.js';

const URL = '/Y10/Component_1/L1.3_Who_Made_It_and_Why/1_Who_Made_It_and_Why.html';

// Part 2 (Tasks 2–4 and Tricky cases) opens with the word from the deck's Part 2 task slide.
async function unlockPart2(page) {
  await page.locator('.tab[data-idx="1"]').click();
  await page.locator('#panel-1 .unlock-word').fill(UNLOCK[2]);
  await page.locator('#panel-1 .unlock-form button').click();
  await expect(page.locator('#panel-1 .lockbox')).toHaveCount(0);
}

test('part 2 stays locked until the word from the slide; the lock box points to the part 1 challenge', async ({ page }) => {
  await page.goto(URL);
  for (const i of [1, 2, 3, 5]) await expect(page.locator(`.tab[data-idx="${i}"]`)).toHaveClass(/locked/);
  await expect(page.locator('.tab[data-idx="6"]')).not.toHaveClass(/locked/);
  await page.locator('.tab[data-idx="2"]').click();
  await expect(page.locator('#panel-2 .lockbox')).toBeVisible();
  await expect(page.locator('#panel-2 .qs')).toBeHidden();

  await page.locator('#panel-2 .unlock-word').fill('motivation');
  await page.locator('#panel-2 .unlock-form button').click();
  await expect(page.locator('#panel-2 .unlock-msg')).toContainText('not the word');

  await page.locator('#panel-2 .lockbox [data-goto="6"]').click();
  await expect(page.locator('#panel-6')).toBeVisible();

  await page.locator('.tab[data-idx="2"]').click();
  await page.locator('#panel-2 .unlock-word').fill('Motive');
  await page.locator('#panel-2 .unlock-word').press('Enter');
  await expect(page.locator('#panel-2 .qs')).toBeVisible();
  for (const i of [1, 2, 3, 5]) await expect(page.locator(`.tab[data-idx="${i}"]`)).not.toHaveClass(/locked/);
  await page.reload();
  await expect(page.locator('.tab[data-idx="3"]')).not.toHaveClass(/locked/);   // stays open after a refresh
});

test('the page opens on the warm-up tab', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('.tab.support')).toHaveClass(/active/);
  await expect(page.locator('#panel-4')).toBeVisible();
  await expect(page.locator('#panel-4 .tray .chip')).toHaveCount(SORTS.kinds.items.length);
  await expect(page.locator('#panel-0')).toBeHidden();
});

test('mystery producer: a wrong guess shows the next clue and waits; solving every round finishes the task', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="0"]').click();
  const { rounds } = REVEALS.who;
  const round = page.locator('#panel-0 .round');
  await expect(round.locator('.clues li')).toHaveCount(1);

  // Wrong first guess: a second clue appears, the guess goes red and the rest wait for the cooldown.
  const current = async () => { const id = await round.getAttribute('data-qw'); return rounds.find(x => x.id === id); };
  let r = await current();
  // The producer is named, with its picture, before the first clue: the only question is its type.
  await expect(round.locator('.subject')).toContainText(r.label);
  await expect(round.locator('.q-text')).toHaveText(`What type of producer is ${r.who}?`);
  const wrong = REVEALS.who.opts.find(o => o[0] !== r.a)[0];
  await round.locator(`.guess[data-guess="${wrong}"]`).click();
  await expect(page.locator('#feedback-0')).toHaveClass(/wrong/);
  await expect(round.locator('.clues li')).toHaveCount(2);
  await expect(round.locator(`.guess[data-guess="${wrong}"]`)).toHaveClass(/is-wrong/);
  await expect(round.locator(`.guess[data-guess="${r.a}"]`)).toBeDisabled();

  // The cooldown survives a reload; then skip the wait so the rest of the test runs quickly.
  await page.reload();
  await page.locator('.tab[data-idx="0"]').click();
  await expect(page.locator(`#panel-0 .guess[data-guess="${r.a}"]`)).toBeDisabled();
  await page.evaluate(() => {
    const k = Object.keys(localStorage).find(x => x.startsWith('y10_c1_l1_3'));
    const s = JSON.parse(localStorage.getItem(k)); s.coolUntil = {}; localStorage.setItem(k, JSON.stringify(s));
  });
  await page.reload();
  await page.locator('.tab[data-idx="0"]').click();

  for (let n = 0; n < rounds.length; n++) {
    r = await current();
    await round.locator(`.guess[data-guess="${r.a}"]`).click();
    await expect(page.locator(`#panel-0 .file[data-qw="${r.id}"]`)).toHaveCount(1);
  }
  await expect(page.locator('#panel-0 .round')).toHaveCount(0);
  await expect(page.locator('#panel-0 .file')).toHaveCount(rounds.length);
  await expect(page.locator('.tab[data-idx="0"]')).toHaveClass(/done/);
  await expect(page.locator('#reset-0')).toBeVisible();   // not gold, after the wrong guess
});

test('spot the slip: wrong flags go red, then all four slips unlock the fixes', async ({ page }) => {
  await page.goto(URL);
  await unlockPart2(page);
  await page.locator('.tab[data-idx="1"]').click();
  const slips = SPOTS.slip.parts.filter(p => p.fix);
  // Flag three slips and one correct sentence.
  for (const p of slips.slice(0, 3)) await page.locator(`.sent[data-qw="${p.id}"]`).click();
  await page.locator('.sent[data-qw="s2"]').click();
  await page.locator('#check-1').click();
  // Only the flagged sentences are marked: the missed slip stays unmarked, so the check doesn't give it away.
  await expect(page.locator('.sent[data-qw="s2"]')).toHaveClass(/is-wrong/);
  for (const p of slips.slice(0, 3)) await expect(page.locator(`.sent[data-qw="${p.id}"]`)).toHaveClass(/is-correct/);
  await expect(page.locator(`.sent[data-qw="${slips[3].id}"]`)).not.toHaveClass(/is-wrong|is-correct/);
  await expect(page.locator('.spot .sent.is-wrong, .spot .sent.is-correct')).toHaveCount(4);
  await expect(page.locator('#feedback-1')).toContainText('1 slip is still hiding');
  await expect(page.locator('#panel-1 .fixes')).toHaveCount(0);
  await expect(page.locator('#check-1')).toBeDisabled();

  await page.evaluate(() => {
    const k = Object.keys(localStorage).find(x => x.startsWith('y10_c1_l1_3'));
    const s = JSON.parse(localStorage.getItem(k)); s.coolUntil = {}; localStorage.setItem(k, JSON.stringify(s));
  });
  await page.reload();
  await page.locator('.tab[data-idx="1"]').click();
  await page.locator('.sent[data-qw="s2"]').click();            // un-flag
  await page.locator(`.sent[data-qw="${slips[3].id}"]`).click();
  await page.locator('#check-1').click();
  await expect(page.locator('#panel-1 .fixes .q')).toHaveCount(slips.length);

  for (const p of slips) await page.locator(`input[name="${p.id}_fix"][value="${p.fix.a}"]`).check();
  await page.locator('#check-1').click();
  await expect(page.locator('#feedback-1')).toHaveClass(/correct/);
  await expect(page.locator('.tab[data-idx="1"]')).toHaveClass(/done/);
});

test('all right answers in Task 3 go green', async ({ page }) => {
  await page.goto(URL);
  await unlockPart2(page);
  await page.locator('.tab[data-idx="2"]').click();
  const entries = Object.entries(CHOICES.name);
  for (const [id, c] of entries) await page.locator(`input[name="${id}"][value="${c.a}"]`).check();
  await page.locator('#check-2').click();
  await expect(page.locator('#feedback-2')).toHaveClass(/correct/);
  await expect(page.locator('#panel-2 .q.is-correct')).toHaveCount(entries.length);
});

test('glossary words show their meaning on hover and on keyboard focus', async ({ page }) => {
  await page.goto(URL);
  await unlockPart2(page);
  await page.locator('.tab[data-idx="2"]').click();
  const tip = page.locator('.gl-tip');
  await page.locator('#panel-2 .opt .gl', { hasText: /^Innovation$/ }).first().hover();
  await expect(tip).toHaveClass(/show/);
  await expect(tip).toContainText('Doing something new');
  await page.mouse.move(0, 0);
  await expect(tip).not.toHaveClass(/show/);

  // Words outside radio labels can be reached with Tab; the definition boxes and help panels are left alone.
  await page.locator('.tab[data-idx="0"]').click();
  await expect(page.locator('#panel-0 .terms .gl')).toHaveCount(0);
  await expect(page.locator('#panel-1 .spot .gl', { hasText: 'box office' })).toHaveCount(1);
  await page.locator('.tab[data-idx="3"]').click();
  const sector = page.locator('#panel-3 .goal .gl', { hasText: 'sector' });
  await sector.focus();
  await expect(tip).toHaveClass(/show/);
  await expect(tip).toContainText('audio/moving image');
});

test('your turn: each sector has purpose, motivation and aim boxes; a box without a spec word goes red', async ({ page }) => {
  await page.goto(URL);
  await unlockPart2(page);
  await page.locator('.tab[data-idx="3"]').click();
  await expect(page.locator('#panel-3 .write-group')).toHaveText(['Audio/moving image', 'Print', 'Interactive']);
  await expect(page.locator('#panel-3 .write-q.mot')).toHaveCount(3);
  await expect(page.locator('#panel-3 .write-q[data-qw="ami_aim"] .wordbank')).toContainText('distinctive');

  const fill = {
    prod: s => `${s} product by Somebody`,
    pur: s => `The ${s} one was made by a media conglomerate. Its purpose is to entertain people because it is very funny`,
    mot: s => `The motivation of the ${s} company is to generate profit because people pay for it`,
    aim: s => `One aim was to make the ${s} one distinctive. You can see this because the colours are bold`,
  };
  for (const s of ['ami', 'print', 'int']) for (const [f, text] of Object.entries(fill)) await page.locator(`#${s}_${f}`).fill(text(s));
  await page.locator('#print_mot').fill('The company made it because they wanted lots and lots of money from it');
  await page.locator('#check-3').click();
  await expect(page.locator('.write-q[data-qw="print_mot"]')).toHaveClass(/is-wrong/);
  await expect(page.locator('#feedback-3')).toContainText('using a word from each box');

  await page.locator('#print_mot').fill(fill.mot('print'));
  await page.locator('#check-3').click();
  await expect(page.locator('#feedback-3')).toHaveClass(/correct/);
});

test('the challenge tabs show their pictures', async ({ page }) => {
  await page.goto(URL);
  await page.locator('.tab[data-idx="6"]').click();
  await expect(page.locator('#panel-6 img[data-img="mrbeast"]')).toHaveAttribute('src', /^data:image\/jpeg/);
  await unlockPart2(page);
  await page.locator('.tab[data-idx="5"]').click();
  await expect(page.locator('#panel-5 img[data-img="lionesses"]')).toHaveAttribute('src', /^data:image\/jpeg/);
});
