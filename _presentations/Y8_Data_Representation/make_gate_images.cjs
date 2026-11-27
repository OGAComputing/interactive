// Draws the AND, OR and NOT symbols as PNGs for the decks, from the same SVG as the Lesson 4 activity page
// (Y8/Data_Representation/L4_Logic_Gates/1_Logic_Gates.html, GATE_SVG), so slides and page match.
// Light lines on the deck's indigo panel colour. 88 × 60 drawing units, rendered at 6 px per unit.
//   node make_gate_images.cjs   → gates/AND.png, gates/OR.png, gates/NOT.png
const path = require('path');
const { chromium } = require(require.resolve('@playwright/test', { paths: [path.join(__dirname, '../..')] }));

const BODY = 'fill="#2E2A6E" stroke="#F5F5FF" stroke-width="3" stroke-linejoin="round"';
const STUB = 'stroke="#F5F5FF" stroke-width="3"';
const GATE = {
  AND: `<line ${STUB} x1="-44" y1="-15" x2="-28" y2="-15"/><line ${STUB} x1="-44" y1="15" x2="-28" y2="15"/>
        <path ${BODY} d="M-28,-24 H2 A24,24 0 0 1 2,24 H-28 Z"/><line ${STUB} x1="26" y1="0" x2="44" y2="0"/>`,
  OR:  `<line ${STUB} x1="-44" y1="-15" x2="-24" y2="-15"/><line ${STUB} x1="-44" y1="15" x2="-24" y2="15"/>
        <path ${BODY} d="M-30,-24 Q2,-24 26,0 Q2,24 -30,24 Q-16,0 -30,-24 Z"/><line ${STUB} x1="26" y1="0" x2="44" y2="0"/>`,
  NOT: `<line ${STUB} x1="-44" y1="0" x2="-26" y2="0"/>
        <path ${BODY} d="M-26,-22 L14,0 L-26,22 Z"/><circle ${BODY} cx="20" cy="0" r="6"/><line ${STUB} x1="26" y1="0" x2="44" y2="0"/>`,
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 6, viewport: { width: 88, height: 60 } });
  for (const [g, svg] of Object.entries(GATE)) {
    await p.setContent(`<html><body style="margin:0;background:transparent">
      <svg xmlns="http://www.w3.org/2000/svg" width="88" height="60" viewBox="-44 -30 88 60">${svg}</svg></body></html>`);
    await p.locator('svg').screenshot({ path: path.join(__dirname, 'gates', g + '.png'), omitBackground: true });
  }
  await b.close();
  console.log('Wrote gates/AND.png, OR.png, NOT.png');
})();
