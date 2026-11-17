import { describe as group, it, expect } from 'vitest';
import {
  defsIn, callsIn, callBeforeDef, runKind, breakCode, isBugFixed, hasBugLine, evalInv, segments,
  evalMod, MOD_CHECKS, JOBS, evalMake, MAKE_TEST_BANK, MAKE_CHECK, PRIORITY_CHOICES, VALID_PODS,
  evalExt, EXT_TEST_BANK, EXT_CHECK, evalParams, PARAMS_CHECK, polygonsIn, placesOf, describe, mod4LinesAdded,
} from './checkers.js';

// ── A tiny Python stand-in ───────────────────────────────────────────────────
// Enough to "run" the programs these tests use: defs, calls, print of a literal, input(),
// int(input()), if / elif / else on ==, and a while loop on != (the extension). It echoes each
// answer after its prompt, as the page's runner does.
function runPy(src, inputs = []) {
  const lines = src.split('\n');
  const out = [];
  const fns = {};
  const vars = {};
  let k = 0;
  const ind = l => l.match(/^ */)[0].length;
  const block = (from, base) => { const b = []; for (let i = from; i < lines.length; i++) { if (!lines[i].trim()) continue; if (ind(lines[i]) <= base) break; b.push(i); } return b; };
  const val = e => {
    e = e.trim();
    let m;
    if ((m = /^int\(input\((["'])(.*)\1\)\)$/.exec(e))) { const v = inputs[k++]; if (v === undefined) throw new Error('EOFError'); out.push(m[2] + v); return Number(v); }
    if ((m = /^input\((["'])(.*)\1\)$/.exec(e))) { const v = inputs[k++]; if (v === undefined) throw new Error('EOFError'); out.push(m[2] + v); return v; }
    if ((m = /^(["'])(.*)\1$/.exec(e))) return m[2];
    if (/^-?\d+$/.test(e)) return Number(e);
    if (e in vars) return vars[e];
    throw new Error('NameError: ' + e);
  };
  const cond = e => { const m = /^(.+?)\s*(==|!=)\s*(.+)$/.exec(e); const a = val(m[1]), b = val(m[3]); return m[2] === '==' ? a === b : a !== b; };
  function exec(idx) {
    for (let p = 0; p < idx.length; p++) {
      const i = idx[p], l = lines[i].trim(), base = ind(lines[i]);
      let m;
      if ((m = /^def (\w+)\(\):$/.exec(l))) { const b = block(i + 1, base); fns[m[1]] = b; p += b.length; continue; }
      if ((m = /^print\((.*)\)$/.exec(l))) { out.push(String(val(m[1]))); continue; }
      if ((m = /^(\w+) = (.*)$/.exec(l))) { vars[m[1]] = val(m[2]); continue; }
      if ((m = /^for (\w+) in range\((\d+)\):$/.exec(l))) { const b = block(i + 1, base); for (let n = 0; n < Number(m[2]); n++) { vars[m[1]] = n; exec(b); } p += b.length; continue; }
      if ((m = /^while (.*):$/.exec(l))) { const b = block(i + 1, base); let guard = 0; while (cond(m[1])) { exec(b); if (++guard > 50) throw new Error('loop'); } p += b.length; continue; }
      if (/^if /.test(l)) {
        // walk the if / elif / else chain at this indent
        let q = p, done = false;
        while (q < idx.length) {
          const j = idx[q], t = lines[j].trim();
          if (ind(lines[j]) !== base || !/^(if |elif |else:)/.test(t) || (q > p && /^if /.test(t))) break;
          const b = block(j + 1, base);
          const c = /^(?:if|elif) (.*):$/.exec(t);
          if (!done && (!c || cond(c[1]))) { exec(b); done = true; }
          q += 1 + b.length;
        }
        p = q - 1;
        continue;
      }
      if ((m = /^(\w+)\(\)$/.exec(l))) { if (!fns[m[1]]) throw new Error(`NameError: name '${m[1]}' is not defined`); exec(fns[m[1]]); continue; }
      throw new Error('cannot run: ' + l);
    }
  }
  // exec gets every line of a block (nested ones too) and skips each statement's own sub-block
  try { exec(block(0, -1)); return { ok: true, output: out.join('\n') }; }
  catch (e) { return { ok: false, output: out.concat(e.message).join('\n') }; }
}
const run = (src, inputs = []) => { const r = runPy(src, inputs); return { output: r.output, drawing: {}, ok: r.ok }; };
const runsFor = (src, tests) => tests.map(t => run(src, t));

// ── A tiny turtle (as in L4's tests) ─────────────────────────────────────────
function turtle() {
  let x = 0, y = 0, h = 0, down = true;
  const segs = [];
  const r = v => Math.round(v * 1000) / 1000;
  const t = {
    fd(d) { const nx = x + d * Math.cos(h * Math.PI / 180), ny = y + d * Math.sin(h * Math.PI / 180); if (down) segs.push([r(x), r(y), r(nx), r(ny), 'black', 1, 0]); x = nx; y = ny; return t; },
    lt(a) { h += a; return t; },
    up() { down = false; return t; }, down() { down = true; return t; },
    poly(n, len = 50) { for (let i = 0; i < n; i++) t.fd(len).lt(360 / n); return t; },
    drawing: () => ({ used: true, segs }),
  };
  return t;
}

const STARTER = `def drone_status():
    print("DRONE ONLINE")
    print("Battery: 100%")

drone_status()`;
const ran = code => ({ lastRun: { ok: true, code, output: '' } });

group('structure helpers', () => {
  it('finds defs with their bodies, and calls with where they sit', () => {
    expect(defsIn(STARTER)).toEqual([expect.objectContaining({ name: 'drone_status', at: 0, params: [] })]);
    expect(defsIn(STARTER)[0].body).toHaveLength(2);
    expect(callsIn(STARTER)).toEqual([expect.objectContaining({ name: 'drone_status', at: 4, indent: 0, inDef: null })]);
  });
  it('print and input are not calls to a function of yours', () => {
    expect(callsIn('print("hi")\nx = input("? ")')).toEqual([]);
  });
  it('a call inside an if is top level; one inside a def is not', () => {
    const src = 'def a():\n    b()\ndef b():\n    print("x")\nif 1 == 1:\n    a()';
    expect(callsIn(src).map(c => [c.name, c.inDef])).toEqual([['b', 'a'], ['a', null]]);
  });
  it('callBeforeDef spots a call above its def', () => {
    expect(callBeforeDef('go()\ndef go():\n    print("x")')).toMatchObject({ name: 'go', at: 0 });
    expect(callBeforeDef('def go():\n    print("x")\ngo()')).toBeNull();
  });
  it('runKind spots the drone status', () => {
    expect(runKind('DRONE ONLINE\nBattery: 100%')).toBe('status');
    expect(runKind('')).toBe('other');
  });
});

// ── Investigate ──────────────────────────────────────────────────────────────
const STEP1 = STARTER + '\ndrone_status()';
const STEP2 = STEP1.replace('    print("Battery: 100%")', '    print("Battery: 100%")\n    print("Camera: ready")');
const STEP3 = STEP2 + '\n\ndef drone_dock():\n    print("DOCKING")';

group('Investigate ticks', () => {
  it('step 1: a second call at the left edge, then a run of that code', () => {
    expect(evalInv(1, STEP1, {}).results).toEqual([true, false]);
    expect(evalInv(1, STEP1, ran(STEP1)).pass).toBe(true);
    expect(evalInv(1, STARTER, ran(STARTER)).results[0]).toBe(false);
  });
  it('step 1: a call indented into the function is flagged as a mistake', () => {
    const inside = STARTER.replace('    print("Battery: 100%")', '    print("Battery: 100%")\n    drone_status()');
    const r = evalInv(1, inside, ran(inside));
    expect(r.results[0]).toBe(false);
    expect(r.wrongs[0]).toBe(true);
  });
  it('steps 2 and 3: a half-typed print doesn\'t tick until its line is finished', () => {
    for (const partial of ['    print(', '    print("', '    print("Camera: ready', '    print("Camera: ready"']) {
      const code = STEP1.replace('    print("Battery: 100%")', '    print("Battery: 100%")\n' + partial);
      expect(evalInv(2, code, {}).results[0]).toBe(false);
    }
    expect(evalInv(2, STEP2, {}).results[0]).toBe(true);
    expect(evalInv(3, STEP2 + '\n\ndef drone_dock():\n    print("DOCK', {}).results[0]).toBe(false);
    expect(evalInv(3, STEP3, {}).results[0]).toBe(true);
  });
  it('step 2: a third print inside the function, both calls kept, any wording', () => {
    expect(evalInv(2, STEP2, ran(STEP2)).pass).toBe(true);
    const other = STEP2.replace('Camera: ready', 'Lights: on');
    expect(evalInv(2, other, ran(other)).pass).toBe(true);
  });
  it('step 2: the new print at the left edge is outside the function', () => {
    const outside = STEP1 + '\nprint("Camera: ready")';
    const r = evalInv(2, outside, ran(outside));
    expect(r.results[0]).toBe(false);
    expect(r.wrongs[0]).toBe(true);
  });
  it('step 3: a new function defined but not called', () => {
    expect(evalInv(3, STEP3, ran(STEP3)).pass).toBe(true);
    const anyName = STEP3.replace('drone_dock', 'park');
    expect(evalInv(3, anyName, ran(anyName)).pass).toBe(true);
    const called = STEP3 + '\ndrone_dock()';
    const r = evalInv(3, called, ran(called));
    expect(r.results[0]).toBe(false);
    expect(r.wrongs[0]).toBe(true);
    expect(evalInv(3, STEP2, ran(STEP2)).results[0]).toBe(false);
  });
});

group('the bug step', () => {
  it('Break it puts a call to the newest function on line 1: a NameError', () => {
    const { code, lineNo } = breakCode(STEP3);
    expect(lineNo).toBe(1);
    expect(code.split('\n')[0]).toBe('drone_dock()');
    expect(hasBugLine(code)).toBe(true);
    expect(run(code).ok).toBe(false);
    expect(run(code).output).toMatch(/NameError/);
  });
  it('pressing Break it again doesn\'t add a second call', () => {
    const once = breakCode(STEP3).code;
    expect(breakCode(once).code).toBe(once);
  });
  it('moving the call below its def fixes it; deleting it does not', () => {
    const broken = breakCode(STEP3).code;
    const moved = broken.split('\n').slice(1).join('\n') + '\ndrone_dock()';
    expect(isBugFixed(moved)).toBe(true);
    expect(run(moved).output.split('\n').at(-1)).toBe('DOCKING');
    const deleted = broken.split('\n').slice(1).join('\n');
    expect(isBugFixed(deleted)).toBe(false);
    expect(isBugFixed(broken)).toBe(false);
  });
  it('moving the def to the top also fixes it', () => {
    const broken = breakCode(STEP3).code;
    const lines = broken.split('\n');
    const defFirst = ['def drone_dock():', '    print("DOCKING")', ...lines.slice(0, -3)].join('\n');
    expect(isBugFixed(defFirst)).toBe(true);
  });
  it('the step\'s ticks: break, run it broken, then fix and run', () => {
    const fixed = STEP3 + '\ndrone_dock()';
    expect(evalInv(4, fixed, { breaks: 1, ranBroken: true, ...ran(fixed) }).pass).toBe(true);
    expect(evalInv(4, fixed, { breaks: 0, ...ran(fixed) }).pass).toBe(false);
    expect(evalInv(4, breakCode(STEP3).code, { breaks: 1, ranBroken: true }).msg).toMatch(/Move the drone_dock\(\) call/);
  });
});

// ── Modify ───────────────────────────────────────────────────────────────────
// Starts from Investigate's program; the steps change it rather than add to it (as in Y8).
const MOD_START = `def drone_status():
    print("DRONE ONLINE")
    print("Battery: 100%")

def drone_dock():
    print("DOCKING")

drone_status()
drone_dock()`;
const renamed = job => MOD_START.split('drone_status').join(job);
const M1 = { scout: renamed('scout_ducts'), guard: renamed('guard_cryo') };
const M2 = {
  scout: M1.scout.replace('DRONE ONLINE', 'Drone: into the ducts').replace('Battery: 100%', 'Camera: recording'),
  guard: M1.guard.replace('DRONE ONLINE', 'Drone: to the Cryo Bay').replace('Battery: 100%', 'Guard mode: on'),
};
const M3 = { scout: M2.scout.replace('\ndrone_dock()', '\nscout_ducts()\ndrone_dock()'),
             guard: M2.guard.replace('\ndrone_dock()', '\nguard_cryo()\ndrone_dock()') };
const BEEP_DEF = 'def beep():\n    for i in range(3):\n        print("BEEP")\n\n';
const M4 = c => M3[c].replace('def drone_dock():\n    print("DOCKING")', BEEP_DEF + 'def drone_dock():\n    beep()\n    print("DOCKING")');
const mod = (key, src, choice) => evalMod(key, src, [run(src)], choice);

group('Modify 1: rename drone_status to the job (choice)', () => {
  for (const choice of ['scout', 'guard']) {
    it(`${choice}: renamed in the def and the call passes`, () => {
      expect(mod('mod1', M1[choice], choice).pass).toBe(true);
    });
  }
  it('only the def renamed: the old call is a NameError', () => {
    const half = MOD_START.replace('def drone_status', 'def scout_ducts');
    const r = mod('mod1', half, 'scout');
    expect(r.results).toEqual([true, false, false]);
    expect(r.msg).toMatch(/NameError/);
  });
  it('not renamed at all', () => {
    const r = mod('mod1', MOD_START, 'guard');
    expect(r.results[0]).toBe(false);
    expect(r.msg).toMatch(/guard_cryo/);
  });
  it('renamed to the other job fails for this choice, and says so', () => {
    const r = mod('mod1', M1.guard, 'scout');
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/You picked scout_ducts/);
  });
  it('drone_dock() taken out', () => {
    expect(mod('mod1', M1.scout.replace('\ndrone_dock()', ''), 'scout').results[2]).toBe(false);
  });
});

group('Modify 2: change both messages', () => {
  it('the suggested lines pass, for both jobs', () => {
    expect(mod('mod2', M2.scout, 'scout').pass).toBe(true);
    expect(mod('mod2', M2.guard, 'guard').pass).toBe(true);
  });
  it('any new messages pass', () => {
    const own = M1.scout.replace('DRONE ONLINE', 'Into the vents').replace('Battery: 100%', "Lights off");
    expect(mod('mod2', own, 'scout').pass).toBe(true);
  });
  it('only the first changed', () => {
    const r = mod('mod2', M1.scout.replace('DRONE ONLINE', 'Into the vents'), 'scout');
    expect(r.results).toEqual([true, false, true]);
    expect(r.msg).toMatch(/Camera: recording/);
  });
  it('neither changed', () => {
    expect(mod('mod2', M1.guard, 'guard').results).toEqual([false, false, true]);
  });
});

group('Modify 3: call the job twice', () => {
  it('a second call above drone_dock() passes', () => {
    expect(mod('mod3', M3.scout, 'scout').pass).toBe(true);
  });
  it('the second call below drone_dock(): DOCKING isn\'t last', () => {
    const late = M2.scout + '\nscout_ducts()';
    const r = mod('mod3', late, 'scout');
    expect(r.results).toEqual([true, false]);
    expect(r.msg).toMatch(/above drone_dock/);
  });
  it('one call only', () => {
    expect(mod('mod3', M2.guard, 'guard').results).toEqual([false, true]);
  });
  it('the second call indented inside a function', () => {
    const inside = M2.scout.replace('    print("DOCKING")', '    print("DOCKING")\n    scout_ducts()');
    expect(mod('mod3', inside, 'scout').msg).toMatch(/indented/);
  });
});

group('Modify 4: beep() with a loop inside, called inside drone_dock()', () => {
  it('the given code passes, for both jobs', () => {
    expect(mod('mod4', M4('scout'), 'scout').pass).toBe(true);
    expect(mod('mod4', M4('guard'), 'guard').pass).toBe(true);
  });
  it('another valid shape passes: any name and message, defined below drone_dock()', () => {
    const own = M3.scout.replace('def drone_dock():\n    print("DOCKING")',
      'def drone_dock():\n    siren()\n    print("DOCKING")\n\ndef siren():\n    for n in range(3):\n        print("WEE-OO")');
    expect(mod('mod4', own, 'scout').pass).toBe(true);
  });
  it('the loop at the left edge is not inside the function', () => {
    const flat = M3.scout.replace('def drone_dock():', 'def beep():\n    print("x")\nfor i in range(3):\n    print("BEEP")\n\ndef drone_dock():');
    const r = mod('mod4', flat, 'scout');
    expect(r.results[0]).toBe(false);
    expect(r.msg).toMatch(/left edge/);
  });
  it('defined but not called', () => {
    const r = mod('mod4', M3.scout.replace('def drone_dock():', BEEP_DEF + 'def drone_dock():'), 'scout');
    expect(r.results).toEqual([true, false, true]);
    expect(r.msg).toMatch(/inside drone_dock/);
  });
  it('called at the left edge, not inside drone_dock()', () => {
    const top = M3.scout.replace('def drone_dock():', BEEP_DEF + 'def drone_dock():') + '\nbeep()';
    const r = mod('mod4', top, 'scout');
    expect(r.results[1]).toBe(false);
    expect(r.msg).toMatch(/isn't part of docking/);
  });
  it('the loop runs twice, not 3 times', () => {
    const r = mod('mod4', M4('scout').replace('range(3)', 'range(2)'), 'scout');
    expect(r.results[1]).toBe(false);
    expect(r.msg).toMatch(/range\(3\)/);
  });
  it('the checklist ticks each NEW line as it\'s typed', () => {
    expect(mod4LinesAdded(M3.scout)).toEqual({ def: false, for: false, print: false, call: false });
    expect(mod4LinesAdded(M3.scout.replace('def drone_dock():', 'def beep():\n    for i in range(3):\ndef drone_dock():')))
      .toEqual({ def: true, for: true, print: false, call: false });
    expect(mod4LinesAdded(M4('scout'))).toEqual({ def: true, for: true, print: true, call: true });
    // the print at 4 spaces sits after the loop, not in it
    expect(mod4LinesAdded(M4('scout').replace('        print("BEEP")', '    print("BEEP")')).print).toBe(false);
    // beep() at the left edge isn't inside drone_dock()
    expect(mod4LinesAdded(M4('scout').replace('    beep()\n', '') + '\nbeep()').call).toBe(false);
  });
});

// ── Make: the cryo-pod lookup ─────────────────────────────────────────────────
const LOOKUP = `def menu():
    print("CRYO POD LOOKUP")
    print("1 Okafor, 3 Chen, 5 Patel")

def pod1():
    print("Pod 1: Okafor, Commander")

def pod3():
    print("Pod 3: Chen, Medic")

def pod5():
    print("Pod 5: Patel, Pilot")

menu()
pod = input("Which pod? ")
if pod == "1":
    pod1()
elif pod == "3":
    pod3()
elif pod == "5":
    pod5()
else:
    print("No such pod")
print("PRIORITY: MED KIT")`;
const make = (src, choice = 'pod1', tests = MAKE_TEST_BANK[0]) => evalMake(src, runsFor(src, tests), choice, tests);

group('Make: the cryo-pod lookup', () => {
  it('every bank set passes the model answer, for both calls', () => {
    for (const tests of MAKE_TEST_BANK) {
      expect(make(LOOKUP, 'pod1', tests).pass).toBe(true);
      expect(make(LOOKUP.replace('MED KIT")', 'CAMERA")'), 'camera', tests).pass).toBe(true);
    }
  });
  it('every set types pods 1, 3 and 5 and one pod that doesn\'t exist (never 0, 2 or 4)', () => {
    for (const set of MAKE_TEST_BANK) {
      const typed = set.map(t => t[0]);
      expect([...typed].filter(v => VALID_PODS.includes(v)).sort()).toEqual(['1', '3', '5']);
      expect(typed.filter(v => !VALID_PODS.includes(v)).every(v => !['0', '2', '4'].includes(v))).toBe(true);
    }
  });
  it('int(input()) with numbers passes too', () => {
    const asInt = LOOKUP.replace('pod = input("Which pod? ")', 'pod = int(input("Which pod? "))').replace(/== "(\d)"/g, '== $1');
    expect(make(asInt).pass).toBe(true);
  });
  it('comparing text with a number: nothing prints for the pods', () => {
    const noQuotes = LOOKUP.replace(/== "(\d)"/g, '== $1');
    const r = make(noQuotes);
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/in quotes|int\(\)/);
  });
  it('no menu function', () => {
    const noMenu = LOOKUP.replace('menu()\n', '');
    expect(make(noMenu).results[0]).toBe(false);
  });
  it('fewer than four functions', () => {
    const three = LOOKUP.replace('def pod5():\n    print("Pod 5: Patel, Pilot")\n\n', '').replace('    pod5()', '    print("Pod 5: Patel")');
    const r = make(three);
    expect(r.results[1]).toBe(false);
    expect(r.msg).toMatch(/3 functions/);
  });
  it('no else: a missing pod prints nothing', () => {
    const noElse = LOOKUP.replace('else:\n    print("No such pod")\n', '');
    const r = make(noElse);
    expect(r.results[5]).toBe(false);
  });
  it('the call\'s line must match the call made', () => {
    expect(make(LOOKUP, 'camera').results[6]).toBe(false);
    expect(make(LOOKUP, 'camera').msg).toContain(PRIORITY_CHOICES.camera);
  });
  it('two pods printing the same thing', () => {
    const same = LOOKUP.replace('Pod 3: Chen, Medic', 'Pod 1: Okafor, Commander');
    expect(make(same).results[4]).toBe(false);
  });
  it('one result per requirement', () => {
    expect(make(LOOKUP).results).toHaveLength(MAKE_CHECK.reqs.length);
  });
});

// ── Extension: keep looking until 0 ───────────────────────────────────────────
const LOOP = LOOKUP.replace(/menu\(\)\npod = input\("Which pod\? "\)\n([\s\S]*?)print\("PRIORITY: MED KIT"\)/, (m, branches) =>
  'menu()\npod = ""\nwhile pod != "0":\n    pod = input("Which pod? ")\n' + branches.split('\n').map(l => (l ? '    ' + l : l)).join('\n') + 'print("PRIORITY: MED KIT")');

group('Extension: keep looking until 0', () => {
  it('every bank set passes the model answer', () => {
    for (const tests of EXT_TEST_BANK) expect(evalExt(LOOP, runsFor(LOOP, tests), 'pod1', tests).pass).toBe(true);
  });
  it('each segment is the right pod\'s lines', () => {
    const t = EXT_TEST_BANK[0][0];
    expect(segments(run(LOOP, t).output, t).map(s => s.join('|'))).toEqual(['Pod 1: Okafor, Commander', 'Pod 5: Patel, Pilot', 'No such pod|PRIORITY: MED KIT']);
  });
  it('no loop: asks once', () => {
    const tests = EXT_TEST_BANK[0];
    const r = evalExt(LOOKUP, runsFor(LOOKUP, tests), 'pod1', tests);
    expect(r.results[0]).toBe(false);
    expect(r.results[1]).toBe(false);
  });
  it('one result per requirement', () => {
    expect(evalExt(LOOP, runsFor(LOOP, EXT_TEST_BANK[0]), 'pod1').results).toHaveLength(EXT_CHECK.reqs.length);
  });
});

// ── ★ Bonus: parameters ───────────────────────────────────────────────────────
group('Bonus: polygon(sides)', () => {
  const SRC = `import turtle
t = turtle.Turtle()

def square(size):
    for i in range(4):
        t.forward(size)
        t.left(90)

square(50)

def polygon(sides):
    for i in range(sides):
        t.forward(60)
        t.left(360 / sides)

polygon(5)
polygon(8)`;
  const drew = (...ns) => { const t = turtle(); t.poly(4); ns.forEach(n => t.poly(n, 60)); return t.drawing(); };
  it('two calls with different sides, both drawn, passes', () => {
    const r = evalParams(SRC, [{ output: '', drawing: drew(5, 8) }]);
    expect(r.pass).toBe(true);
    expect(r.msg).toMatch(/polygon\(5\) drew a pentagon, polygon\(8\) drew an octagon/);
  });
  it('a loop that ignores the parameter is not a parameter', () => {
    expect(evalParams(SRC.replace('range(sides)', 'range(5)'), [{ output: '', drawing: drew(5, 8) }]).results[0]).toBe(false);
  });
  it('called once', () => {
    expect(evalParams(SRC.replace('\npolygon(8)', ''), [{ output: '', drawing: drew(5) }]).results[1]).toBe(false);
  });
  it('a turn that isn\'t 360 / sides doesn\'t join up', () => {
    const t = turtle(); t.poly(4); for (let i = 0; i < 5; i++) t.fd(60).lt(60);
    const r = evalParams(SRC, [{ output: '', drawing: t.drawing() }]);
    expect(r.results[2]).toBe(false);
    expect(polygonsIn(t.drawing()).map(p => p.n)).toEqual([4]);
  });
  it('one result per requirement', () => {
    expect(evalParams(SRC, [{ output: '', drawing: drew(5, 8) }]).results).toHaveLength(PARAMS_CHECK.reqs.length);
  });
});

group('jobs', () => {
  it('two jobs, one per option', () => {
    expect(Object.keys(JOBS)).toEqual(['scout', 'guard']);
    expect(MOD_CHECKS.mod1.reqs).toHaveLength(3);
  });
});
