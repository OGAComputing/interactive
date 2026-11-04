import { describe, expect, test } from 'vitest';
import {
  QUESTIONS, markQuestion, maxMarks, printed, verdict,
  TEMPS, SEATS, SALES, NAMES, COMMON,
} from './checkers_String_Functions_and_Arrays.js';

// Build the runs a program would produce: `program(ask, say, inputs)` calls
// ask(prompt) for each input (echoed as prompt + value, like the mocked input())
// and say(line) for each print.
function runsFor(id, program) {
  return QUESTIONS[id].tests.map(({ inputs }) => {
    const out = [];
    let k = 0;
    const ask = prompt => {
      const v = inputs[k++];
      out.push(prompt + (v ?? ''));
      return v === undefined ? '' : (/^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v);
    };
    const say = line => out.push(String(line));
    try {
      program(ask, say, inputs);
      return { inputs, output: out.join('\n'), ok: true };
    } catch (e) {
      return { inputs, output: String(e), ok: false };
    }
  });
}

const score = (id, src, program) => markQuestion(id, src, runsFor(id, program)).earned;
const full = id => maxMarks(id);
const cap = w => w[0].toUpperCase() + w.slice(1).toLowerCase();

// Source shapes are only checked by regex, so these just need the right keywords.
const SRC = {
  caseConvert: 's = input("")\nprint(s.upper)\nprint(s.lower)\nprint(s.length)',
  date:        'd = input("")\nprint(d.left(2))\nprint(d.substring(3, 2))\nprint(d.right(4))',
  flight:      'r = input("")\nprint(r.left(3).upper)\nprint(r.right(3).upper)',
  tidyName:    'n = input("")\nprint(n.left(1).upper + n.right(n.length - 1).lower)',
  shopping:    'array items[4]\nfor i = 0 to 3\nitems[i] = input("")\nnext i\nfor i = 3 to 0 step -1\nprint(items[i])\nnext i',
  hotDays:     't = input("")\nfor i = 0 to 6\nif temps[i] > t then\nendif\nnext i',
  cinema:      'r = input("")\ns = input("")\nif seats[r, s] == "" then\nendif',
  sales:       's = input("")\nfor q = 0 to 3\ntotal = total + sales[s, q]\nnext q',
  nameFinder:  'l = input("")\nfor i = 0 to 5\nif names[i].left(1).lower == l.lower then\nendif\nnext i',
  emails:      'array first[3]\narray last[3]\nfor i = 0 to 2\nfirst[i] = input("")\nlast[i] = input("")\nnext i',
  password:    'p = input("")\nfor i = 0 to 4\nif p.lower == common[i] then\nendif\nnext i',
  acronym:     'array words[4]\nfor i = 0 to 3\nwords[i] = input("")\na = a + words[i].left(1).upper\nnext i',
};

// Correct behaviour for each question.
const MODEL = {
  caseConvert: (ask, say) => { const s = ask('Enter a sentence: '); say(s.toUpperCase()); say(s.toLowerCase()); say('Characters: ' + s.length); },
  date: (ask, say) => { const d = ask('Enter a date: '); say('Day: ' + d.slice(0, 2)); say('Month: ' + d.slice(3, 5)); say('Year: ' + d.slice(-4)); },
  flight: (ask, say) => { const r = ask('Route: '); say('From: ' + r.slice(0, 3).toUpperCase()); say('To: ' + r.slice(-3).toUpperCase()); },
  tidyName: (ask, say) => { const n = ask('Name: '); say('Hello ' + cap(n)); },
  shopping: (ask, say) => { const a = []; for (let i = 0; i < 4; i++) a.push(ask(`Item ${i + 1}: `)); for (let i = 3; i >= 0; i--) say(a[i]); },
  hotDays: (ask, say) => { const t = ask('Temperature: '); say('Warmer days: ' + TEMPS.filter(x => x > t).length); },
  cinema: (ask, say) => { const r = ask('Row: '); const s = ask('Seat: '); say(SEATS[r][s] === 'empty' ? 'Free' : 'Taken'); },
  sales: (ask, say) => { const s = ask('Shop: '); say('Total: ' + SALES[s].reduce((a, b) => a + b, 0)); },
  nameFinder: (ask, say) => {
    const l = ask('Letter: ').toLowerCase();
    const m = NAMES.filter(n => n[0].toLowerCase() === l);
    if (m.length) m.forEach(n => say(n.toUpperCase())); else say('No names');
  },
  emails: (ask, say) => {
    const f = [], s = [];
    for (let i = 0; i < 3; i++) { f.push(ask('First name: ')); s.push(ask('Surname: ')); }
    for (let i = 0; i < 3; i++) say((f[i][0] + s[i]).toLowerCase() + '@school.org');
  },
  password: (ask, say) => {
    const p = ask('Password: ');
    say(p.length < 8 || COMMON.includes(p.toLowerCase()) ? 'Weak' : 'Strong');
  },
  acronym: (ask, say) => { const w = []; for (let i = 0; i < 4; i++) w.push(ask(`Word ${i + 1}: `)); say(w.map(x => x[0].toUpperCase()).join('')); },
};

describe('output helpers', () => {
  test('echo lines are removed and counted', () => {
    const p = printed({ inputs: ['jam'], output: 'Item 1: jam\njam' });
    expect(p.lines).toEqual(['jam']);
    expect(p.consumed).toBe(1);
  });
  test('verdict needs exactly one Strong or Weak', () => {
    expect(verdict({ inputs: [], output: 'Strong', ok: true })).toBe('strong');
    expect(verdict({ inputs: [], output: 'Weak\nStrong', ok: true })).toBeNull();
    expect(verdict({ inputs: [], output: 'Weak\nWeak', ok: true })).toBeNull();
  });
});

describe('model answers score full marks', () => {
  for (const id of Object.keys(QUESTIONS)) {
    test(id, () => expect(score(id, SRC[id], MODEL[id])).toBe(full(id)));
  }
});

describe('common mistakes lose marks', () => {
  const lost = (id, program, src = SRC[id]) => expect(score(id, src, program)).toBeLessThan(full(id));

  test('case convert: prints the sentence unchanged', () =>
    lost('caseConvert', (ask, say) => { const s = ask(''); say(s); say(s); say(s.length); }));
  test('case convert: length without spaces', () =>
    lost('caseConvert', (ask, say) => { const s = ask(''); say(s.toUpperCase()); say(s.toLowerCase()); say(s.replace(/ /g, '').length); }));
  test('date: month taken from 1-based position', () =>
    lost('date', (ask, say) => { const d = ask(''); say(d.slice(0, 2)); say(d.slice(2, 4)); say(d.slice(-4)); }));
  test('date: printing the whole date', () =>
    lost('date', (ask, say) => { say('Date: ' + ask('')); }));
  test('flight: not converted to upper case', () =>
    lost('flight', (ask, say) => { const r = ask(''); say(r.slice(0, 3)); say(r.slice(-3)); }));
  test('flight: printing the whole route in upper case', () =>
    lost('flight', (ask, say) => { say(ask('').toUpperCase()); }));
  test('tidy name: whole name in upper case', () =>
    lost('tidyName', (ask, say) => { say(ask('').toUpperCase()); }));
  test('tidy name: rest of the name left as typed', () =>
    lost('tidyName', (ask, say) => { const n = ask(''); say(n[0].toUpperCase() + n.slice(1)); }));
  test('shopping: printed in the order entered', () =>
    lost('shopping', (ask, say) => { const a = []; for (let i = 0; i < 4; i++) a.push(ask('')); a.forEach(x => say(x)); }));
  test('shopping: reverse loop stops at index 1', () =>
    lost('shopping', (ask, say) => { const a = []; for (let i = 0; i < 4; i++) a.push(ask('')); for (let i = 3; i >= 1; i--) say(a[i]); }));
  test('hot days: >= counts days equal to the temperature', () =>
    lost('hotDays', (ask, say) => { const t = ask(''); say(TEMPS.filter(x => x >= t).length); }));
  test('cinema: row and seat swapped', () =>
    lost('cinema', (ask, say) => { const r = ask(''); const s = ask(''); const v = SEATS[s]?.[r]; if (v === undefined) throw new Error('IndexError'); say(v === 'empty' ? 'Free' : 'Taken'); }));
  test('sales: adds up a column instead of a row', () =>
    lost('sales', (ask, say) => { const s = ask(''); say(SALES.reduce((a, row) => a + row[s], 0)); }));
  test('name finder: case-sensitive comparison', () =>
    lost('nameFinder', (ask, say) => {
      const l = ask(''); const m = NAMES.filter(n => n[0] === l);
      if (m.length) m.forEach(n => say(n.toUpperCase())); else say('No names');
    }));
  test('name finder: "No names" for every non-matching name', () =>
    lost('nameFinder', (ask, say) => {
      const l = ask('').toLowerCase();
      NAMES.forEach(n => say(n[0].toLowerCase() === l ? n.toUpperCase() : 'No names'));
    }));
  test('emails: case left as typed', () =>
    lost('emails', (ask, say) => {
      const f = [], s = []; for (let i = 0; i < 3; i++) { f.push(ask('')); s.push(ask('')); }
      for (let i = 0; i < 3; i++) say(f[i][0] + s[i] + '@school.org');
    }));
  test('password: banned list checked case-sensitively', () =>
    lost('password', (ask, say) => { const p = ask(''); say(p.length < 8 || COMMON.includes(p) ? 'Weak' : 'Strong'); }));
  test('password: > 8 rejects a password of exactly 8 characters', () =>
    lost('password', (ask, say) => { const p = ask(''); say(p.length <= 8 || COMMON.includes(p.toLowerCase()) ? 'Weak' : 'Strong'); }));
  test('password: verdict printed on every pass of the loop', () =>
    lost('password', (ask, say) => { const p = ask(''); COMMON.forEach(c => say(p.length < 8 || p.toLowerCase() === c ? 'Weak' : 'Strong')); }));
  test('acronym: first letters not converted to upper case', () =>
    lost('acronym', (ask, say) => { const w = []; for (let i = 0; i < 4; i++) w.push(ask('')); say(w.map(x => x[0]).join('')); }));
});

test('a check that throws counts as not passed', () => {
  const { earned, passed } = markQuestion('flight', SRC.flight, []);
  expect(earned).toBe(2);
  expect(passed).toEqual([true, true, false, false]);
});
