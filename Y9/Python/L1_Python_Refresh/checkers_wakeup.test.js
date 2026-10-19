import { describe, test, expect } from 'vitest';
import { evalInv, evalMod, evalMake, evalExt, breakCode, hasBugLine, hasFixedLine, isBugFixed, isBugPairLine,
         IBUG_LINE, IBUG_FIXED_LINE, MOD_INPUTS, MAKE_INPUTS, MOD_PROFILES, modInputs, MAKE_PROFILES } from './checkers_wakeup.js';

const code = (...lines) => lines.join('\n');
const out  = (...lines) => lines.join('\n') + '\n';

const STARTER = [
  'name = input("Enter your name: ")',
  'role = input("Enter your job: ")',
  'print("CRYO BAY DOOR")',
  'print("Checking in: " + role + " " + name)',
  'print("Door unlocking...")',
];
const withLine = (i, line) => STARTER.map((l, k) => (k === i ? line : l));
const ran = (src, ok = true) => ({ code: src, ok });

test('test answers match the values the checkers expect', () => {
  expect(MOD_INPUTS.mod2).toEqual(['Riley', 'Engineer', '4']);
  expect(MAKE_INPUTS.slice(0, 3)).toEqual(['Ash', 'Navigation', 'Missing']);
});

// ─── Investigate ─────────────────────────────────────────────────────────────

describe('evalInv step 1 — change the question text', () => {
  test('untouched starter code is not accepted', () => {
    expect(evalInv(1, code(...STARTER)).pass).toBe(false);
  });
  test('any new question text passes, either quote style', () => {
    expect(evalInv(1, code(...withLine(1, 'role = input("What is your job? ")'))).pass).toBe(true);
    expect(evalInv(1, code(...withLine(1, "role = input('Job? ')"))).pass).toBe(true);
  });
  test('only changing spacing is not a new question', () => {
    expect(evalInv(1, code(...withLine(1, 'role = input("Enter your job:")'))).pass).toBe(false);
  });
  test('breaking the input line gets a specific hint', () => {
    const r = evalInv(1, code(...withLine(1, 'role = "What is your job? "')));
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/only change the words inside the quotes/);
  });
});

describe('evalInv step 2 — Break it, fix the capital N', () => {
  const broken = code(...STARTER, IBUG_LINE);
  const fixed  = code(...STARTER, IBUG_FIXED_LINE);

  test('needs a Break it press, then a fixed line that has been run', () => {
    expect(evalInv(2, code(...STARTER)).results).toEqual([false, false]);
    expect(evalInv(2, broken, { breaks: 1, lastRun: ran(broken, false) }).results).toEqual([true, false]);
    expect(evalInv(2, fixed, { breaks: 1, lastRun: ran(fixed) }).pass).toBe(true);
  });
  test('fixed but not yet run asks for a run', () => {
    const r = evalInv(2, fixed, { breaks: 1, lastRun: ran(broken, false) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/Run code/);
  });
  test('deleting the broken line instead of fixing it is not accepted', () => {
    const src = code(...STARTER);
    const r = evalInv(2, src, { breaks: 1, lastRun: ran(src) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/don't delete it/);
  });
  test('a working near-miss gets a "Nearly!" hint', () => {
    const src = code(...STARTER, 'print("Access granted to " + role)');
    const r = evalInv(2, src, { breaks: 1, lastRun: ran(src) });
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/^Nearly!/);
  });
});

describe('bug-pair helpers', () => {
  test('case matters: Name is broken, name is fixed', () => {
    expect(hasBugLine("print('Access granted to ' + Name)")).toBe(true);
    expect(hasFixedLine('print( "Access granted to "+name )')).toBe(true);
    expect(hasFixedLine('print(" Access  granted to " + name)')).toBe(true);
    expect(hasFixedLine(IBUG_LINE)).toBe(false);
    expect(isBugFixed(code(...STARTER, IBUG_FIXED_LINE))).toBe(true);
    expect(isBugPairLine(IBUG_LINE) && isBugPairLine(IBUG_FIXED_LINE)).toBe(true);
  });
  test('the starter lines are never treated as the bug line (they survive the end-of-step strip)', () => {
    expect(STARTER.some(isBugPairLine)).toBe(false);
  });
  test('breakCode appends the line once, re-breaks a fix in place, and is safe to mash', () => {
    const a = breakCode(code(...STARTER));
    expect(a.lineNo).toBe(6);
    expect(a.code.trim().split('\n').pop()).toBe(IBUG_LINE);
    expect(breakCode(a.code).code).toBe(a.code);
    const b = breakCode(code(...STARTER, IBUG_FIXED_LINE));
    expect(b.lineNo).toBe(6);
    expect(hasBugLine(b.code) && !hasFixedLine(b.code)).toBe(true);
  });
});

// ─── Modify ──────────────────────────────────────────────────────────────────

const ECHO = ['Enter your name: Riley', 'Enter your job: Engineer'];

describe('Modify 1 — door message', () => {
  test('passes on Cryo Bay door: OPEN (any case)', () => {
    const src = code(...withLine(4, 'print("Cryo Bay door: OPEN")'));
    expect(evalMod('mod1', src, out(...ECHO, 'CRYO BAY DOOR', 'Checking in: Engineer Riley', 'Cryo Bay door: OPEN')).pass).toBe(true);
    expect(evalMod('mod1', src, out(...ECHO, 'CRYO BAY DOOR', 'Checking in: Engineer Riley', 'Door open')).pass).toBe(true);
  });
  test('the original message fails, and DOOR on one line + "open" later does not count', () => {
    expect(evalMod('mod1', code(...STARTER), out(...ECHO, 'CRYO BAY DOOR', 'Checking in: Engineer Riley', 'Door unlocking...')).pass).toBe(false);
    expect(evalMod('mod1', code(...STARTER), out('CRYO BAY DOOR', 'open')).pass).toBe(false);
  });
});

describe('Modify 1 — the door choice decides which message passes', () => {
  const run = last => out(...ECHO, 'CRYO BAY DOOR', 'Checking in: Engineer Riley', last);
  const src = code(...STARTER);
  test('choosing "sealed" wants SEALED, and OPEN no longer counts', () => {
    expect(evalMod('mod1', src, run('Cryo Bay door: SEALED'), 'sealed').pass).toBe(true);
    const r = evalMod('mod1', src, run('Cryo Bay door: OPEN'), 'sealed');
    expect(r.pass).toBe(false);
    expect(r.msg).toMatch(/SEALED/);
  });
  test('choosing "open" wants OPEN, and SEALED does not count', () => {
    expect(evalMod('mod1', src, run('Cryo Bay door: OPEN'), 'open').pass).toBe(true);
    expect(evalMod('mod1', src, run('Cryo Bay door: SEALED'), 'open').pass).toBe(false);
  });
  test('the pass message follows the choice', () => {
    expect(evalMod('mod1', src, run('Cryo Bay door: SEALED'), 'sealed').msg).toMatch(/stays sealed/);
    expect(evalMod('mod1', src, run('Cryo Bay door: OPEN'), 'open').msg).toMatch(/will open/);
  });
  test('the CRYO BAY DOOR heading alone never counts as SEALED', () => {
    expect(evalMod('mod1', src, run('Door unlocking...'), 'sealed').pass).toBe(false);
  });
});

const ECHO3 = [...ECHO, 'Pod number: 4'];
const BEFORE_POD = ['CRYO BAY DOOR', 'Checking in: Engineer Riley', 'Door unlocking...'];

describe('Modify 2 — pod number', () => {
  test('a pod question at the bottom, printed with + underneath, passes', () => {
    const src = code(...STARTER, 'pod = input("Pod number: ")', 'print("Pod: " + pod)');
    expect(evalMod('mod2', src, out(...ECHO, ...BEFORE_POD, 'Pod number: 4', 'Pod: 4')).pass).toBe(true);
  });
  test('joining the pod into the check-in line instead also passes', () => {
    const src = code(...STARTER.slice(0, 2), 'pod = input("Pod number: ")', 'print("CRYO BAY DOOR")', 'print("Checking in: " + role + " " + name + " from pod " + pod)');
    expect(evalMod('mod2', src, out(...ECHO3, 'CRYO BAY DOOR', 'Checking in: Engineer Riley from pod 4')).pass).toBe(true);
  });
  test('print(pod) without + fails the second bullet', () => {
    const src = code(...STARTER, 'pod = input("Pod number: ")', 'print(pod)');
    expect(evalMod('mod2', src, out(...ECHO, ...BEFORE_POD, 'Pod number: 4', '4')).results).toEqual([true, false]);
  });
  test('a pod question but no pod line fails the second bullet', () => {
    const src = code(...STARTER, 'pod = input("Pod number: ")');
    expect(evalMod('mod2', src, out(...ECHO, ...BEFORE_POD, 'Pod number: 4')).results).toEqual([true, false]);
  });
  test('no third question fails the first bullet', () => {
    expect(evalMod('mod2', code(...STARTER), out(...ECHO, 'Checking in: Engineer Riley')).results[0]).toBe(false);
  });
});

describe('Modify 3 — how are you feeling?', () => {
  const MOD2 = [...STARTER, 'pod = input("Pod number: ")', 'print("Pod: " + pod)'];
  const OUT2 = [...ECHO, ...BEFORE_POD, 'Pod number: 4', 'Pod: 4'];
  test('a feeling question (any wording, any variable name), printed with + underneath, passes', () => {
    const a = code(...MOD2, 'feeling = input("How are you feeling? ")', 'print("You feel " + feeling)');
    expect(evalMod('mod3', a, out(...OUT2, 'How are you feeling? Dizzy', 'You feel Dizzy')).pass).toBe(true);
    const b = code(...MOD2, "mood = input('How do you FEEL: ')", "print('Status: ' + mood)");
    expect(evalMod('mod3', b, out(...OUT2, 'How do you FEEL: Dizzy', 'Status: Dizzy')).pass).toBe(true);
  });
  test('a fourth question about something else fails the first bullet', () => {
    const src = code(...MOD2, 'deck = input("Which deck? ")', 'print("Deck: " + deck)');
    expect(evalMod('mod3', src, out(...OUT2, 'Which deck? Dizzy', 'Deck: Dizzy')).results).toEqual([false, false]);
  });
  test('Mod 2 code alone fails the first bullet', () => {
    expect(evalMod('mod3', code(...MOD2), out(...OUT2)).results).toEqual([false, false]);
  });
  test('a feeling question that is never printed fails the second bullet', () => {
    const src = code(...MOD2, 'feeling = input("How are you feeling? ")');
    expect(evalMod('mod3', src, out(...OUT2, 'How are you feeling? Dizzy')).results).toEqual([true, false]);
  });
  test('printing the feeling without + fails the second bullet', () => {
    const src = code(...MOD2, 'feeling = input("How are you feeling? ")', 'print(feeling)');
    expect(evalMod('mod3', src, out(...OUT2, 'How are you feeling? Dizzy', 'Dizzy')).results).toEqual([true, false]);
  });
});

describe('Modify 4 — name and feeling together', () => {
  const MOD3 = [...STARTER, 'pod = input("Pod number: ")', 'print("Pod: " + pod)', 'feeling = input("How are you feeling? ")'];
  const OUT3 = [...ECHO, ...BEFORE_POD, 'Pod number: 4', 'Pod: 4', 'How are you feeling? Dizzy'];
  test('the name and the feeling on one line passes', () => {
    const src = code(...MOD3, 'print(name + " is feeling " + feeling)');
    expect(evalMod('mod4', src, out(...OUT3, 'Riley is feeling Dizzy')).pass).toBe(true);
  });
  test('the feeling on its own, or with the pod instead of the name, fails', () => {
    expect(evalMod('mod4', code(...MOD3, 'print("You feel " + feeling)'), out(...OUT3, 'You feel Dizzy')).pass).toBe(false);
    expect(evalMod('mod4', code(...MOD3, 'print("Pod " + pod + ": " + feeling)'), out(...OUT3, 'Pod 4: Dizzy')).pass).toBe(false);
  });
});

// ─── Make + Extension ────────────────────────────────────────────────────────

const MAKE_GOOD = [
  'name = input("Crew member: ")',
  'room = input("Last seen in: ")',
  'print("CREW LOCATOR")',
  'print("Crew member: " + name)',
  'print("Last seen in: " + room)',
];
const MAKE_OUT = out('Crew member: Ash', 'Last seen in: Navigation', 'CREW LOCATOR', 'Crew member: Ash', 'Last seen in: Navigation', 'LOCK: CRYO BAY DOOR');

describe('Make — crew locator', () => {
  test('a complete locator passes', () => {
    expect(evalMake(code(...MAKE_GOOD, 'print("LOCK: CRYO BAY DOOR")'), MAKE_OUT, 'bay').pass).toBe(true);
  });
  test('printing with commas instead of + fails the join bullet', () => {
    const src = code(MAKE_GOOD[0], MAKE_GOOD[1], 'print("Crew member:", name)', 'print("Room:", room)');
    expect(evalMake(src, out('Crew member: Ash', 'Last seen in: Navigation', 'Crew member: Ash', 'Room: Navigation')).results[2]).toBe(false);
  });
  test('answers that are asked but never stored fail', () => {
    const src = code('input("Crew member: ")', 'input("Room: ")', 'print("Report")', 'print("done")');
    expect(evalMake(src, out('Crew member: Ash', 'Room: Navigation', 'Report', 'done')).results[1]).toBe(false);
  });
  test('both answers on one line of report passes', () => {
    const src = code(MAKE_GOOD[0], MAKE_GOOD[1], 'print(name + " was last seen in " + room)');
    expect(evalMake(src, out('Crew member: Ash', 'Last seen in: Navigation', 'Ash was last seen in Navigation', 'LOCK: POD 5 SHIELD'), 'pod5').pass).toBe(true);
  });
  test('typing the answers into a print string instead of using the variables fails', () => {
    const src = code('name = input("What is your name?")', 'room = input("What room are you in?")',
      'print("Last seen in: " + room)', 'print("Crew member: Ash Last seen in: Navigation")', 'print("LOCK: CRYO BAY DOOR")');
    const o = out('What is your name?Ash', 'What room are you in?Navigation', 'Last seen in: Navigation', 'Crew member: Ash Last seen in: Navigation', 'LOCK: CRYO BAY DOOR');
    const r = evalMake(src, o, 'bay');
    expect(r.results[3]).toBe(false);
    expect(r.pass).toBe(false);
  });
  test('variable names do not matter', () => {
    const src = code('who = input("Who? ")', 'where = input("Where? ")', 'print(who + " was in " + where)', 'print("LOCK: CRYO BAY DOOR")');
    expect(evalMake(src, out('Who? Ash', 'Where? Navigation', 'Ash was in Navigation', 'LOCK: CRYO BAY DOOR'), 'bay').pass).toBe(true);
  });
  test('printing only one of the answers fails the last bullet', () => {
    const src = code(MAKE_GOOD[0], MAKE_GOOD[1], 'print("Crew member: " + name)', 'print("Report done")');
    expect(evalMake(src, out('Crew member: Ash', 'Last seen in: Navigation', 'Crew member: Ash', 'Report done')).results[3]).toBe(false);
  });
});

describe('Make — the lock choice decides which last line passes', () => {
  const src = code(...MAKE_GOOD);
  test('only the chosen lock line passes', () => {
    expect(evalMake(src, MAKE_OUT, 'bay').results[4]).toBe(true);
    expect(evalMake(src, MAKE_OUT, 'pod5').results[4]).toBe(false);
    expect(evalMake(src, MAKE_OUT, 'pod5').msg).toContain('LOCK: POD 5 SHIELD');
  });
  test('spacing and case are forgiven', () => {
    expect(evalMake(src, out('Crew member: Ash', 'Last seen in: Navigation', 'Ash in Navigation', 'Lock - pod 5 shield'), 'pod5').pass).toBe(true);
  });
  test('no choice yet: the last bullet fails and asks for the call first', () => {
    const r = evalMake(src, MAKE_OUT);
    expect(r.results.slice(0, 4)).toEqual([true, true, true, true]);
    expect(r.msg).toMatch(/Make your call/);
  });
});

describe('Extension — status report', () => {
  test('a third question and one line with all three answers passes', () => {
    const src = code(...MAKE_GOOD, 'status = input("Status: ")', 'print(name + " is " + status + " in " + room)');
    expect(evalExt(src, out(...MAKE_OUT.trim().split('\n'), 'Status: Missing', 'Ash is Missing in Navigation')).pass).toBe(true);
  });
  test('the three answers on separate lines fails the second bullet', () => {
    const src = code(...MAKE_GOOD, 'status = input("Status: ")', 'print("Status: " + status)');
    expect(evalExt(src, out(...MAKE_OUT.trim().split('\n'), 'Status: Missing', 'Status: Missing')).results).toEqual([true, false]);
  });
});

// ─── Answer banks ("typed for you" changes each check) ───────────────────────

describe('answer banks — every set works, and typed-in answers are caught', () => {
  // What the runner prints for a Modify program, given one profile's answers.
  const echo = p => ['Enter your name: ' + p.name, 'Enter your job: ' + p.role];
  const door = p => ['CRYO BAY DOOR', 'Checking in: ' + p.role + ' ' + p.name, 'Door unlocking...'];
  const MOD2 = [...STARTER, 'pod = input("Pod number: ")', 'print("Pod: " + pod)'];
  const MOD3 = [...MOD2, 'feeling = input("How are you feeling? ")', 'print("You feel " + feeling)'];
  const upToFeeling = p => [...echo(p), ...door(p), 'Pod number: ' + p.pod, 'Pod: ' + p.pod, 'How are you feeling? ' + p.feeling];

  test('5–10 sets, the first is the default, and Modifications 3 and 4 add the feeling', () => {
    expect(MOD_PROFILES.length).toBeGreaterThanOrEqual(5);
    expect(MOD_PROFILES.length).toBeLessThanOrEqual(10);
    expect(MAKE_PROFILES.length).toBeGreaterThanOrEqual(5);
    expect(MAKE_PROFILES.length).toBeLessThanOrEqual(10);
    expect(MAKE_INPUTS).toEqual(MAKE_PROFILES[0]);
    const p = MOD_PROFILES[1];
    expect(modInputs('mod2', p)).toEqual([p.name, p.role, p.pod]);
    expect(modInputs('mod4', p)).toEqual([p.name, p.role, p.pod, p.feeling]);
  });
  test('every answer in a set is different, so one can never be mistaken for another', () => {
    for (const p of MOD_PROFILES) {
      const a = [p.name, p.role, p.pod, p.feeling].map(v => v.toLowerCase());
      expect(a.every(v => a.filter(w => w.includes(v)).length === 1)).toBe(true);
    }
    for (const set of MAKE_PROFILES) {
      const a = set.slice(0, 3).map(v => v.toLowerCase());
      expect(a.every(v => a.filter(w => w.includes(v)).length === 1)).toBe(true);
    }
  });
  test('Modify 2–4 pass for every set when the variables are printed', () => {
    for (const p of MOD_PROFILES) {
      expect(evalMod('mod2', code(...MOD2), out(...echo(p), ...door(p), 'Pod number: ' + p.pod, 'Pod: ' + p.pod), undefined, p).pass).toBe(true);
      expect(evalMod('mod3', code(...MOD3), out(...upToFeeling(p), 'You feel ' + p.feeling), undefined, p).pass).toBe(true);
      expect(evalMod('mod4', code(...MOD3, 'print(name + " is feeling " + feeling)'),
        out(...upToFeeling(p), 'You feel ' + p.feeling, p.name + ' is feeling ' + p.feeling), undefined, p).pass).toBe(true);
    }
  });
  test('a line with the first set typed in fails every other set, and the hint names the answers typed', () => {
    const first = MOD_PROFILES[0];
    for (const p of MOD_PROFILES.slice(1)) {
      const r = evalMod('mod4', code(...MOD3, 'print("Riley is feeling Dizzy")'),
        out(...upToFeeling(p), 'You feel ' + p.feeling, first.name + ' is feeling ' + first.feeling), undefined, p);
      expect(r.pass).toBe(false);
      expect(r.msg).toContain(`tested with ${p.name} and ${p.feeling}`);
    }
  });
  test('Make and the extension pass for every set, and the hints name the answers typed', () => {
    const src = code(...MAKE_GOOD, 'print("LOCK: CRYO BAY DOOR")');
    for (const set of MAKE_PROFILES) {
      const [name, room, status] = set;
      const o = ['Crew member: ' + name, 'Last seen in: ' + room, 'CREW LOCATOR', 'Crew member: ' + name, 'Last seen in: ' + room, 'LOCK: CRYO BAY DOOR'];
      expect(evalMake(src, out(...o), 'bay', set).pass).toBe(true);
      const typedIn = evalMake(src, out('Crew member: ' + name, 'Last seen in: ' + room, 'CREW LOCATOR', 'Crew member: Ash', 'Last seen in: Navigation'), 'bay', set);
      if (name !== 'Ash') expect(typedIn.msg).toContain(`tested with ${name} (name) and ${room} (room)`);
      const ext = code(...MAKE_GOOD, 'status = input("Status: ")', 'print(name + " is " + status + " in " + room)');
      expect(evalExt(ext, out(...o, 'Status: ' + status, `${name} is ${status} in ${room}`), set).pass).toBe(true);
    }
  });
});
