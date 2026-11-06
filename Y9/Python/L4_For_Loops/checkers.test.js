import { describe as group, it, expect } from 'vitest';
import {
  paths, polygonOf, polygonsIn, describe, runKind, breakCode, isBugFixed, hasBugLine, evalInv,
  evalMod, MOD_TEST_BANK, MOD_CHECKS, evalMake, MAKE_TEST_BANK, MAKE_CHECK, FLARE_CHOICES,
  evalExt, EXT_TEST_BANK, EXT_CHECK, ownOutput, mod2LinesAdded,
} from './checkers.js';

// A tiny turtle that records drawings in the same shape as turtle-canvas.js's turtle module.
function turtle() {
  let x = 0, y = 0, h = 0, c = 'black', w = 1, down = true;
  const segs = [];
  const r = v => Math.round(v * 1000) / 1000;
  const t = {
    fd(d) {
      const nx = x + d * Math.cos(h * Math.PI / 180), ny = y + d * Math.sin(h * Math.PI / 180);
      if (down) segs.push([r(x), r(y), r(nx), r(ny), c, w, 0]);
      x = nx; y = ny; return t;
    },
    lt(a) { h += a; return t; },
    rt(a) { h -= a; return t; },
    color(v) { c = v; return t; },
    size(v) { w = v; return t; },
    up() { down = false; return t; },
    down() { down = true; return t; },
    goto(nx, ny) { if (down) segs.push([r(x), r(y), r(nx), r(ny), c, w, 0]); x = nx; y = ny; return t; },
    poly(n, len = 100, turn = 360 / n, dir = 'lt') { for (let i = 0; i < n; i++) t.fd(len)[dir](turn); return t; },
    drawing: () => ({ used: true, segs, fills: [], dots: [], texts: [], poses: [], bg: 'white' }),
  };
  return t;
}
const poly = (n, opts = {}) => { const t = turtle(); if (opts.c) t.color(opts.c); if (opts.w) t.size(opts.w); return t.poly(n, opts.len, opts.turn, opts.dir).drawing(); };
const run = (drawing, output = '') => ({ output, drawing });

// ── Geometry ─────────────────────────────────────────────────────────────────
group('paths and polygons', () => {
  it('a square is one closed regular 4-gon, left or right turns', () => {
    expect(polygonsIn(poly(4))).toEqual([expect.objectContaining({ n: 4, turn: 90 })]);
    expect(polygonsIn(poly(4, { dir: 'rt' }))[0].n).toBe(4);
  });
  it('range(8) with 90° is the same square twice', () => {
    expect(polygonsIn(poly(8, { turn: 90 })).map(p => p.n)).toEqual([4, 4]);
    expect(describe(poly(8, { turn: 90 }))).toBe('a square, 2 times over');
  });
  it('a heptagon with float turns (360 / 7) still closes', () => {
    expect(polygonsIn(poly(7))[0].n).toBe(7);
  });
  it('two forward() calls in a row are one side', () => {
    const t = turtle();
    for (let i = 0; i < 3; i++) t.fd(50).fd(50).lt(120);
    expect(polygonsIn(t.drawing())[0].n).toBe(3);
    expect(polygonsIn(t.drawing())[0].len).toBeCloseTo(100, 1);
  });
  it('a five-pointed star is not a pentagon', () => {
    expect(polygonsIn(poly(5, { turn: 144 }))).toEqual([]);
  });
  it('the turn left outside the loop is a straight line', () => {
    const t = turtle(); t.fd(100).fd(100).fd(100).lt(120);
    expect(describe(t.drawing())).toBe('a straight line');
  });
  it('a shape that doesn\'t close is described as lines that don\'t join up', () => {
    expect(describe(poly(3, { turn: 90 }))).toBe("3 lines that don't join up");
    expect(describe({ segs: [] })).toMatch(/nothing/);
  });
  it('a pen-up move starts a new path', () => {
    const t = turtle().poly(4); t.up().goto(200, 0).down().poly(5);
    expect(polygonsIn(t.drawing()).map(p => p.n)).toEqual([4, 5]);
    expect(describe(t.drawing())).toBe('a square and a pentagon');
  });
  it('runKind spots the beacon square', () => {
    expect(runKind(poly(4))).toBe('square');
    expect(runKind(poly(3))).toBe('other');
    expect(runKind({ segs: [] })).toBe('none');
  });
  it('polygonOf rejects uneven sides', () => {
    const t = turtle(); t.fd(100).lt(90).fd(50).lt(90).fd(100).lt(90).fd(50).lt(90);
    expect(polygonOf(paths(t.drawing())[0])).toBeNull();
  });
});

// ── Investigate ──────────────────────────────────────────────────────────────
const STARTER = `import turtle
t = turtle.Turtle()
for i in range(4):
    t.forward(100)
    t.left(90)`;
const ran = code => ({ lastRun: { ok: true, code, output: '' } });

group('Investigate ticks', () => {
  it('step 1: range(8), then a run of that code', () => {
    const code = STARTER.replace('range(4)', 'range(8)');
    expect(evalInv(1, code, {}).results).toEqual([true, false]);
    expect(evalInv(1, code, ran(code)).pass).toBe(true);
    expect(evalInv(1, STARTER, ran(STARTER)).results[0]).toBe(false);
  });
  it('step 2: range(3) and 120, either turn direction', () => {
    const code = STARTER.replace('range(4)', 'range(3)').replace('left(90)', 'left(120)');
    expect(evalInv(2, code, ran(code)).pass).toBe(true);
    const right = code.replace('left', 'right');
    expect(evalInv(2, right, ran(right)).pass).toBe(true);
    const wrongAngle = code.replace('120', '100');
    expect(evalInv(2, wrongAngle, ran(wrongAngle)).wrongs[1]).toBe(true);
  });
  it('step 3: print(i) inside the loop and range(1, 4)', () => {
    const tri = STARTER.replace('range(4)', 'range(1, 4)').replace('left(90)', 'left(120)');
    const code = tri + '\n    print(i)';
    expect(evalInv(3, code, ran(code)).pass).toBe(true);
    const outside = tri + '\nprint(i)';
    const r = evalInv(3, outside, ran(outside));
    expect(r.results[0]).toBe(false);
    expect(r.wrongs[0]).toBe(true);
  });
});

group('the bug step', () => {
  const tri = `import turtle
t = turtle.Turtle()
for i in range(1, 4):
    t.forward(100)
    t.left(120)
    print(i)`;
  it('Break it moves the turn out of the loop, keeping print(i) inside', () => {
    const { code, lineNo } = breakCode(tri);
    expect(code.split('\n')).toEqual(['import turtle', 't = turtle.Turtle()', 'for i in range(1, 4):', '    t.forward(100)', '    print(i)', 't.left(120)']);
    expect(lineNo).toBe(6);
    expect(hasBugLine(code)).toBe(true);
    expect(isBugFixed(code)).toBe(false);
  });
  it('putting the turn back anywhere in the loop fixes it; deleting it does not', () => {
    const { code } = breakCode(tri);
    expect(isBugFixed(tri)).toBe(true);
    const back = code.replace('    print(i)\nt.left(120)', '    t.left(120)\n    print(i)');
    expect(isBugFixed(back)).toBe(true);
    const first = 'import turtle\nt = turtle.Turtle()\nfor i in range(1, 4):\n    t.left(120)\n    t.forward(100)\n    print(i)';
    expect(isBugFixed(first)).toBe(true);
    expect(isBugFixed(code.replace('\nt.left(120)', ''))).toBe(false);
  });
  it('Break it twice does nothing more (the turn is already outside)', () => {
    const once = breakCode(tri).code;
    expect(breakCode(once).code).toBe(once);
  });
  it('the ticks: break, run it broken, then fix and run', () => {
    const fixed = tri;
    expect(evalInv(4, tri, {}).results).toEqual([false, false, false]);
    expect(evalInv(4, breakCode(tri).code, { breaks: 1, ranBroken: true }).results).toEqual([true, true, false]);
    expect(evalInv(4, fixed, { breaks: 1, ranBroken: true, fixes: 1 }).pass).toBe(true);
  });
});

// ── Modify ───────────────────────────────────────────────────────────────────
group('Modification 1: the signal', () => {
  it('MAYDAY is a hexagon, QUARANTINE an octagon, any side length or direction', () => {
    expect(evalMod('mod1', '', [run(poly(6))], 'mayday').pass).toBe(true);
    expect(evalMod('mod1', '', [run(poly(8, { len: 60, dir: 'rt' }))], 'quarantine').pass).toBe(true);
  });
  it('the other shape fails, and says what was drawn', () => {
    const r = evalMod('mod1', '', [run(poly(4))], 'mayday');
    expect(r.results).toEqual([false, false]);
    expect(r.msg).toMatch(/a square.*range\(6\).*60/);
  });
  it('the right shape drawn twice over fails the second requirement', () => {
    const r = evalMod('mod1', '', [run(poly(12, { turn: 60 }))], 'mayday');
    expect(r.results).toEqual([true, false]);
  });
});

group('Modification 2: red and thick', () => {
  it('passes red and 3 wide, or #ff0000 and 5 wide', () => {
    expect(evalMod('mod2', '', [run(poly(6, { c: 'red', w: 3 }))], 'mayday').pass).toBe(true);
    expect(evalMod('mod2', '', [run(poly(8, { c: '#ff0000', w: 5 }))], 'quarantine').pass).toBe(true);
  });
  it('fails each part separately', () => {
    expect(evalMod('mod2', '', [run(poly(6, { w: 3 }))], 'mayday').results).toEqual([false, true, true]);
    expect(evalMod('mod2', '', [run(poly(6, { c: 'red' }))], 'mayday').results).toEqual([true, false, true]);
    expect(evalMod('mod2', '', [run(poly(4, { c: 'red', w: 3 }))], 'mayday').results).toEqual([false, false, false]);
  });
});

group('Modification 3: a pentagon too', () => {
  const both = () => turtle().color('red').size(3).poly(6).poly(5).drawing();
  const code2 = 'for i in range(6):\n    pass\nfor j in range(5):\n    pass';
  it('passes with two loops drawing a hexagon then a pentagon', () => {
    expect(evalMod('mod3', code2, [run(both())], 'mayday').pass).toBe(true);
  });
  it('needs the pentagon drawn by its own loop', () => {
    expect(evalMod('mod3', 'for i in range(6):\n    pass', [run(both())], 'mayday').results).toEqual([true, true, false]);
  });
  it('fails without the first signal or without the pentagon', () => {
    expect(evalMod('mod3', code2, [run(poly(5))], 'mayday').results[0]).toBe(false);
    expect(evalMod('mod3', code2, [run(poly(6))], 'mayday').results[1]).toBe(false);
  });
});

group('Modification 4: any number of sides', () => {
  const code = 'sides = int(input("How many sides? "))\nfor k in range(sides):\n    pass';
  const runFor = n => run(turtle().poly(8).poly(5).poly(n).drawing(), `How many sides? ${n}\n`);
  it('every bank set passes the model answer', () => {
    for (const set of MOD_TEST_BANK.mod4) {
      const runs = set.map(t => runFor(Number(t[0])));
      expect(evalMod('mod4', code, runs, 'quarantine', set).pass).toBe(true);
    }
  });
  it('a fixed shape that ignores the answer fails, naming the answer', () => {
    const set = [['7'], ['3']];
    const runs = set.map(t => run(turtle().poly(8).poly(5).poly(7).drawing(), `How many sides? ${t[0]}\n`));
    const r = evalMod('mod4', code, runs, 'quarantine', set);
    expect(r.results[1]).toBe(false);
    expect(r.msg).toMatch(/With 3 typed/);
    expect(r.show).toBe(1);
  });
  it('input() without int() fails the first requirement', () => {
    const set = [['7'], ['3']];
    const runs = set.map(t => runFor(Number(t[0])));
    expect(evalMod('mod4', 'sides = input("How many sides? ")', runs, 'quarantine', set).results[0]).toBe(false);
  });
  it('the earlier signals must still be drawn', () => {
    const set = [['7'], ['3']];
    const runs = set.map(t => run(turtle().poly(Number(t[0])).drawing(), `How many sides? ${t[0]}\n`));
    expect(evalMod('mod4', code, runs, 'quarantine', set).results).toEqual([true, true, false]);
  });
});

// ── Make ─────────────────────────────────────────────────────────────────────
group('Make: the flare', () => {
  const code = 'import turtle\nt = turtle.Turtle()\ncolour = input("Flare colour? ")\nt.pencolor(colour)\nfor i in range(5):\n    t.forward(80)\n    t.left(72)\nprint("FLARE: MEDICAL")';
  const flare = (c, n = 5, line = 'FLARE: MEDICAL') => run(poly(n, { c: c.toLowerCase() }), `Flare colour? ${c}\n${line}\n`);
  it('every bank set passes a model answer, for both calls', () => {
    for (const set of MAKE_TEST_BANK) {
      expect(evalMake(code, set.map(t => flare(t[0])), 'medical', set).pass).toBe(true);
      expect(evalMake(code, set.map(t => flare(t[0], 4, FLARE_CHOICES.warning)), 'warning', set).pass).toBe(true);
    }
  });
  it('a fixed colour fails on the second colour typed', () => {
    const set = [['red'], ['green']];
    const r = evalMake(code, [flare('red'), run(poly(5, { c: 'red' }), 'Flare colour? green\nFLARE: MEDICAL\n')], 'medical', set);
    expect(r.results[1]).toBe(false);
    expect(r.show).toBe(1);
    expect(r.msg).toMatch(/With green typed/);
  });
  it('needs a for loop, a closed shape and the call line', () => {
    const set = [['red'], ['green']];
    expect(evalMake(code.replace(/for i in range\(5\)/, 'while True'), set.map(t => flare(t[0])), 'medical', set).results[2]).toBe(false);
    const open = set.map(t => run(poly(3, { c: t[0], turn: 90 }), `Flare colour? ${t[0]}\nFLARE: MEDICAL\n`));
    expect(evalMake(code, open, 'medical', set).results[3]).toBe(false);
    expect(evalMake(code, set.map(t => flare(t[0])), 'warning', set).results[4]).toBe(false);
  });
  it('a prompt that mentions the flare line never counts as printing it', () => {
    expect(ownOutput('FLARE: MEDICAL? red\n', ['red']).trim()).toBe('');
  });
  it('has one requirement per bullet', () => {
    expect(MAKE_CHECK.reqs).toHaveLength(5);
    expect(MOD_CHECKS.mod4.reqs).toHaveLength(3);
  });
});

// ── Extension ────────────────────────────────────────────────────────────────
group('Extension: a growing burst', () => {
  const burst = (c, n = 40, grow = true) => {
    const t = turtle().color(c);
    for (let i = 0; i < n; i++) t.fd(grow ? i + 5 : 20).lt(91);
    return run(t.drawing(), `Colour? ${c}\n`);
  };
  it('every bank set passes a growing spiral', () => {
    for (const set of EXT_TEST_BANK) expect(evalExt('', set.map(t => burst(t[0].toLowerCase())), set).pass).toBe(true);
  });
  it('too few lines, lines that don\'t grow, or the wrong colour fail', () => {
    const set = [['red']];
    expect(evalExt('', [burst('red', 20)], set).results[0]).toBe(false);
    expect(evalExt('', [burst('red', 40, false)], set).results).toEqual([true, false, true]);
    expect(evalExt('', [burst('blue')], set).results[2]).toBe(false);
  });
  it('a flare polygon before the burst is fine', () => {
    const t = turtle().color('red').poly(5);
    for (let i = 0; i < 40; i++) t.fd(i + 5).lt(91);
    expect(evalExt('', [run(t.drawing())], [['red']]).pass).toBe(true);
    expect(EXT_CHECK.reqs).toHaveLength(3);
  });
});

group('mod2LinesAdded: Modification 2 checklist ticks', () => {
  const sig = ['import turtle', 't = turtle.Turtle()', 'for i in range(8):', '    t.forward(100)', '    t.left(45)'];
  const add = (...extra) => [...sig.slice(0, 2), ...extra, ...sig.slice(2)].join('\n');
  it('neither NEW line in the Modification 1 code', () => {
    expect(mod2LinesAdded(sig.join('\n'))).toEqual({ colour: false, size: false });
  });
  it('both in the given code, each on its own, and with Windows line endings', () => {
    expect(mod2LinesAdded(add('t.pencolor("red")', 't.pensize(3)'))).toEqual({ colour: true, size: true });
    expect(mod2LinesAdded(add('t.pencolor("red")'))).toEqual({ colour: true, size: false });
    expect(mod2LinesAdded(add('t.pensize(3)'))).toEqual({ colour: false, size: true });
    expect(mod2LinesAdded(add('t.pencolor("red")', 't.pensize(3)').replace(/\n/g, '\r\n'))).toEqual({ colour: true, size: true });
  });
  it("any turtle name, quotes, spacing, color() and width() tick", () => {
    expect(mod2LinesAdded(add("pen.color('red')", 'pen.width( 3 )'))).toEqual({ colour: true, size: true });
  });
  it('inside or after the loop, or another colour, does not tick', () => {
    expect(mod2LinesAdded([...sig, 't.pencolor("red")', 't.pensize(3)'].join('\n'))).toEqual({ colour: false, size: false });
    expect(mod2LinesAdded([...sig.slice(0, 3), '    t.pencolor("red")', '    t.pensize(3)', ...sig.slice(3)].join('\n'))).toEqual({ colour: false, size: false });
    expect(mod2LinesAdded(add('t.pencolor("blue")', 't.pensize(5)'))).toEqual({ colour: false, size: false });
  });
});
