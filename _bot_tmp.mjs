import { chromium } from 'playwright';
const civ = process.argv[2] || 'britons';
const b = await chromium.launch(); const p = await b.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file:///C:/Users/n.houlton_grange.out/source/repos/interactive/_drafts/AoE2_Archers/2_Economy_Simulator.html');
await p.click(`.civ[data-civ=${civ}]`); await p.click('#btnStart'); await p.click('[data-speed="16"]');
for (let i = 0; i < 2000; i++) {
  const done = await p.evaluate(() => {
    const $ = id => document.getElementById(id), n = j => +$('n-' + j).textContent;
    if (getComputedStyle($('end')).display !== 'none') return true;
    const click = el => el && !el.disabled && el.click();
    const btn = sel => document.querySelector(sel);
    const v = n('food') + n('wood') + n('gold') + n('idle');
    const [used, cap] = $('pop').textContent.split('/').map(Number);
    const age = $('age').textContent;
    if ($('tcQueue').children.length < 2 && (age !== 'Dark Age' || v < 21)) click($('btnVil'));
    const houseGoing = /going up/.test(btn('[data-build=house]').parentElement.textContent);
    if (cap - used <= 3 && !houseGoing) click(btn('[data-build=house]'));
    const want = v < 6 ? 'food' : v < 10 ? 'wood' : v < 17 ? 'food' : v < 19 ? 'wood' : v < 22 ? 'gold' : (n('gold') < 7 ? 'gold' : n('wood') < 10 ? 'wood' : 'food');
    document.querySelector(`input[name=rally][value=${want}]`).checked = true;
    if (n('idle')) document.querySelector(`[data-job=${want}][data-d="1"]`).click();
    if (/farms: (\d+)/.test($('foodSub').textContent)) {
      const nat = +(($('foodSub').textContent.match(/left: (\d+)/) || [0, 0])[1]);
      const farms = +$('foodSub').textContent.match(/farms: (\d+)/)[1];
      if (nat < 500 && farms < n('food')) click(btn('[data-build=farm]'));
    }
    if (v >= 17) click(btn('[data-build=barracks]'));
    if (v >= 14) click($("btnLoom"));
    if (age === 'Dark Age' && v >= 21) click($('btnAge'));
    if (age === 'Feudal Age') {
      const ranges = document.querySelectorAll('#ranges .bar').length + (/going up/.test(btn('[data-build=range]').parentElement.textContent) ? 1 : 0);
      if (ranges < 2) click(btn('[data-build=range]'));
      click(btn('[data-build=smith]'));
      ['fletch', 'dbl', 'collar', 'mining'].forEach(k => click(btn(`[data-tech=${k}]`)));
      if (v >= 26) click(btn('[data-wheel]'));
      if (v >= 28) click($('btnAge'));
      if (!/Castle/.test($('tcQueue').textContent) || +$('rg').textContent > 120) click($('btnArcher'));
    }
    return false;
  });
  if (done) break;
  await p.waitForTimeout(100);
}
console.log(civ, await p.textContent('#endTitle'), '|', await p.textContent('#endRank'));
console.log((await p.textContent('#endTable')).replace(/\s+/g,' '));
console.log((await p.$$eval('#log p', ps => ps.map(x => x.textContent).reverse())).join('\n'));
console.log('errors', errs);
await b.close();
