import { describe, expect, test } from 'vitest';
import { QUESTIONS, markQuestion, maxMarks, printed, isEcho } from './checkers_Strings_and_Arrays.js';

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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MARKS = [[45, 52, 60, 58], [66, 70, 71, 64], [30, 41, 35, 38]];
const REGISTER = ['Amir', 'Beth', 'Chloe', 'Dev', 'Ellie', 'Finn', 'Grace', 'Zane'];

// Source shapes are only checked by regex, so these just need the right keywords.
const SRC = {
  username:  'first = input("")\nsurname = input("")\nprint(surname.left(3) + first.left(1))',
  stockCode: 'code = input("")\nprint(code.substring(0, 3))',
  postcode:  'p = input("")\nprint(p.left(p.length - 4))\nprint(p.right(3))',
  middle:    'w = input("")\nprint(w.substring(w.length DIV 2, 1))',
  lineup:    'array players[5]\nfor i = 0 to 4\nplayers[i] = input("")\nnext i',
  dayFinder: 'n = input("")\nprint(days[n - 1])',
  rainfall:  'array rain[7]\nfor d = 0 to 6\nrain[d] = input("")\nnext d',
  marksGrid: 's = input("")\nt = input("")\nprint(marks[s, t])',
  vowels:    'w = input("")\nfor i = 0 to w.length - 1\nif w.substring(i, 1) == "a" then\nendif\nnext i',
  email:     'e = input("")\nwhile e.right(11) != ""\ne = input("")\nendwhile',
  register:  'n = input("")\nfor i = 0 to 7\nif register[i] == n then\nendif\nnext i',
  longestWord: 'array words[5]\nfor i = 0 to 4\nwords[i] = input("")\nif words[i].length > 0 then\nendif\nnext i',
};

// Correct behaviour for each question.
const MODEL = {
  username: (ask, say) => { const f = ask('First name: '); const s = ask('Surname: '); say('Username: ' + s.slice(0, 3) + f[0]); },
  stockCode: (ask, say) => { const c = ask('Code: '); say('Warehouse: ' + c.slice(0, 3)); say('Aisle: ' + c.slice(3, 5)); say('Colour: ' + c.slice(-3)); },
  postcode: (ask, say) => { const p = ask('Postcode: '); say('Outward: ' + p.slice(0, p.length - 4)); say('Inward: ' + p.slice(-3)); },
  middle: (ask, say) => { const w = ask('Word: '); say('Middle letter: ' + w[Math.floor(w.length / 2)]); },
  lineup: (ask, say) => { const a = []; for (let i = 0; i < 5; i++) a.push(ask(`Player ${i + 1}: `)); say('Captain: ' + a[0]); say('Goalkeeper: ' + a[4]); },
  dayFinder: (ask, say) => { const n = ask('Day number: '); say(DAYS[n - 1]); },
  rainfall: (ask, say) => { let t = 0; for (let i = 0; i < 7; i++) t += ask(`Day ${i + 1}: `); say('Total: ' + t); say('Average: ' + t / 7); },
  marksGrid: (ask, say) => { const s = ask('Student: '); const t = ask('Test: '); say('Mark: ' + MARKS[s][t]); },
  vowels: (ask, say) => { const w = ask('Word: '); say('Vowels: ' + [...w].filter(c => 'aeiou'.includes(c)).length); },
  email: (ask, say) => {
    let e = ask('Email: ');
    while (!e.endsWith('@school.org')) { say('That is not a school email address'); e = ask('Email: '); }
    say('Username: ' + e.slice(0, e.length - 11));
  },
  register: (ask, say) => { const n = ask('Name: '); const i = REGISTER.indexOf(n); say(i >= 0 ? `${n} is at index ${i}` : 'Not found'); },
  longestWord: (ask, say) => {
    const w = []; for (let i = 0; i < 5; i++) w.push(ask(`Word ${i + 1}: `));
    let longest = w[0];
    for (const x of w) if (x.length > longest.length) longest = x;
    say('Longest word: ' + longest);
    say('Words ending in ing: ' + w.filter(x => x.endsWith('ing')).length);
  },
};

describe('output helpers', () => {
  test('echo lines are removed and counted', () => {
    const p = printed({ inputs: ['Kane'], output: 'Player 1: Kane\nCaptain: Kane' });
    expect(p.lines).toEqual(['Captain: Kane']);
    expect(p.consumed).toBe(1);
  });
  test('an echo match does not split a number', () => {
    expect(isEcho('Total: 50', 0)).toBe(false);
    expect(isEcho('Rain: 0', 0)).toBe(true);
  });
});

describe('model answers score full marks', () => {
  for (const id of Object.keys(QUESTIONS)) {
    test(id, () => expect(score(id, SRC[id], MODEL[id])).toBe(full(id)));
  }
});

describe('common mistakes lose marks', () => {
  const lost = (id, program, src = SRC[id]) => expect(score(id, src, program)).toBeLessThan(full(id));

  test('username: first letter of surname instead of first name', () =>
    lost('username', (ask, say) => { const f = ask(''); const s = ask(''); say(s.slice(0, 3) + s[0]); }));
  test('stock code: aisle taken from 1-based position', () =>
    lost('stockCode', (ask, say) => { const c = ask(''); say(c.slice(0, 3)); say(c.slice(2, 4)); say(c.slice(-3)); }));
  test('postcode: outward code always 4 characters', () =>
    lost('postcode', (ask, say) => { const p = ask(''); say('Outward: ' + p.slice(0, 4)); say('Inward: ' + p.slice(-3)); }));
  test('postcode: printing the whole postcode is not the outward code', () =>
    lost('postcode', (ask, say) => { const p = ask(''); say('Postcode: ' + p); say('Inward: ' + p.slice(-3)); }));
  test('middle: hard-coded position 2 only works for "apple"', () =>
    lost('middle', (ask, say) => { const w = ask(''); say(w[2]); }));
  test('line-up: printing every player', () =>
    lost('lineup', (ask, say) => { const a = []; for (let i = 0; i < 5; i++) a.push(ask('')); a.forEach(p => say(p)); }));
  test('line-up: only four names read', () =>
    lost('lineup', (ask, say) => { const a = []; for (let i = 0; i < 4; i++) a.push(ask('')); say(a[0]); say(a[3]); }));
  test('day finder: off by one (days[n])', () =>
    lost('dayFinder', (ask, say) => { const n = ask(''); if (!DAYS[n]) throw new Error('IndexError'); say(DAYS[n]); }));
  test('day finder: printing every day', () =>
    lost('dayFinder', (ask, say) => { ask(''); DAYS.forEach(d => say(d)); }));
  test('rainfall: average divided by 6', () =>
    lost('rainfall', (ask, say) => { let t = 0; for (let i = 0; i < 7; i++) t += ask(''); say(t); say(t / 6); }));
  test('rainfall: not stored in an array', () =>
    lost('rainfall', MODEL.rainfall, 'total = 0\nfor d = 1 to 7\nr = input("")\ntotal = total + r\nnext d'));
  test('marks grid: row and column swapped', () =>
    lost('marksGrid', (ask, say) => { const s = ask(''); const t = ask(''); const v = MARKS[t]?.[s]; if (v === undefined) throw new Error('IndexError'); say(v); }));
  test('vowels: counts characters instead of vowels', () =>
    lost('vowels', (ask, say) => { const w = ask(''); say(w.length); }));
  test('email: accepts anything containing "@school"', () =>
    lost('email', (ask, say) => { let e = ask(''); while (!e.includes('@school')) e = ask(''); say(e.split('@')[0]); }));
  test('email: outputs the whole address', () =>
    lost('email', (ask, say) => { let e = ask(''); while (!e.endsWith('@school.org')) e = ask(''); say('Welcome ' + e); }));
  test('register: "Not found" printed for every non-matching name', () =>
    lost('register', (ask, say) => { const n = ask(''); REGISTER.forEach((r, i) => say(r === n ? `index ${i}` : 'Not found')); }));
  test('register: loop stops one short and misses Zane', () =>
    lost('register', (ask, say) => { const n = ask(''); const i = REGISTER.slice(0, 7).indexOf(n); say(i >= 0 ? `index ${i}` : 'Not found'); }));
  test('longest word: >= picks the last of a tie', () =>
    lost('longestWord', (ask, say) => {
      const w = []; for (let i = 0; i < 5; i++) w.push(ask(''));
      let longest = w[0]; for (const x of w) if (x.length >= longest.length) longest = x;
      say('Longest: ' + longest); say('ing: ' + w.filter(x => x.endsWith('ing')).length);
    }));
  test('longest word: counts words containing "ing" anywhere (singer)', () =>
    lost('longestWord', (ask, say) => {
      const w = []; for (let i = 0; i < 5; i++) w.push(ask(''));
      let longest = w[0]; for (const x of w) if (x.length > longest.length) longest = x;
      say('Longest: ' + longest); say('ing: ' + w.filter(x => x.includes('ing')).length);
    }));
});

test('storing with literal indexes is a valid shape', () => {
  const src = 'array words[5]\n' + [0, 1, 2, 3, 4].map(i => `words[${i}] = input("")`).join('\n') +
    '\nfor i = 0 to 4\nif words[i].length > 0 then\nendif\nnext i';
  expect(score('longestWord', src, MODEL.longestWord)).toBe(full('longestWord'));
});

test('a check that throws counts as not passed', () => {
  const { earned, passed } = markQuestion('username', SRC.username, []);
  expect(earned).toBe(2);
  expect(passed).toEqual([true, true, false, false]);
});
