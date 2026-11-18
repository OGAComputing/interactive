import { describe, it, expect } from 'vitest';
import { liveQuery, shortNames, buildRows, sortRows, leaderboards, formatBoard, ago, themeFor, IDLE_MS } from './hub-live.js';

const NOW = Date.parse('2026-11-17T10:00:00Z');
const at = minsAgo => new Date(NOW - minsAgo * 60000).toISOString();
const file = (id, name, minsAgo, props) => ({
  id, modifiedTime: at(minsAgo), lastModifyingUser: { displayName: name },
  appProperties: { ogaCourse: 'c1', ogaWork: 'w1', ogaSub: 'sub-' + id, ...props },
});

describe('liveQuery', () => {
  it('searches by assignment ID', () => {
    expect(liveQuery('123')).toBe("appProperties has { key='ogaWork' and value='123' } and trashed = false");
  });
  it('strips quotes so an ID cannot break the query', () => {
    expect(liveQuery("1'2")).toContain("value='12'");
  });
});

describe('shortNames', () => {
  it('gives first name and surname initial', () => {
    expect(shortNames(['Amelia Smith', 'Ben Jones'])).toEqual(['Amelia S.', 'Ben J.']);
  });
  it('takes more of the surname when two short names clash', () => {
    expect(shortNames(['Sam Taylor', 'Sam Turner', 'Ava Lee'])).toEqual(['Sam Ta.', 'Sam Tu.', 'Ava L.']);
  });
  it('shows the whole surname once it is used up', () => {
    expect(shortNames(['Jo Li', 'Jo Lin'])).toEqual(['Jo Li', 'Jo Lin']);
  });
  it('copes with one-word and missing names', () => {
    expect(shortNames(['Cher', '', null])).toEqual(['Cher', 'Student', 'Student']);
  });
});

describe('buildRows', () => {
  it('reads score, task and board from the file', () => {
    const [r] = buildRows([file('a', 'Amelia Smith', 1, { ogaScore: '60', ogaLtask: '3/5', ogaLboard: '1840', ogaLboardLabel: 'Carry Rush' })], NOW);
    expect(r).toMatchObject({ short: 'Amelia S.', score: 60, task: '3/5', board: 1840, boardLabel: 'Carry Rush', done: false, idle: false });
  });
  it('marks 100% as done and never idle', () => {
    const [r] = buildRows([file('a', 'A B', 60, { ogaScore: '100' })], NOW);
    expect(r.done).toBe(true);
    expect(r.idle).toBe(false);
  });
  it('marks a student idle after IDLE_MS with no save', () => {
    const mins = IDLE_MS / 60000;
    expect(buildRows([file('a', 'A B', mins + 1, { ogaScore: '40' })], NOW)[0].idle).toBe(true);
    expect(buildRows([file('a', 'A B', mins - 1, { ogaScore: '40' })], NOW)[0].idle).toBe(false);
  });
  it('keeps one row per submission with the newest file and the best score', () => {
    const older = file('a', 'A B', 30, { ogaScore: '80' });
    const newer = { ...file('b', 'A B', 2, { ogaScore: '20', ogaLtask: '1/5' }), appProperties: { ...file('b', 'A B', 2, { ogaScore: '20', ogaLtask: '1/5' }).appProperties, ogaSub: 'sub-a' } };
    for (const order of [[older, newer], [newer, older]]) {
      const rows = buildRows(order, NOW);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ score: 80, task: '1/5' });
    }
  });
  it('leaves the score empty when only live fields were saved', () => {
    expect(buildRows([file('a', 'A B', 1, { ogaLboard: '50' })], NOW)[0]).toMatchObject({ score: null, board: 50, boardLabel: 'Leaderboard' });
  });
  it('falls back to the owner name', () => {
    const f = { ...file('a', '', 1, {}), lastModifyingUser: undefined, owners: [{ displayName: 'Zed Quinn' }] };
    expect(buildRows([f], NOW)[0].short).toBe('Zed Q.');
  });
});

describe('sortRows', () => {
  const rows = buildRows([
    file('a', 'Cara Cole', 1, { ogaScore: '100' }),
    file('b', 'Abe Adams', 1, { ogaScore: '60' }),
    file('c', 'Bo Bell', 3, { ogaScore: '20' }),
    file('d', 'Di Dunn', 8, { ogaScore: '20' }),
  ], NOW);
  it('A–Z by name', () => {
    expect(sortRows(rows, 'name').map(r => r.short)).toEqual(['Abe A.', 'Bo B.', 'Cara C.', 'Di D.']);
  });
  it('needs help first: lowest score, longest since a save, finished last', () => {
    expect(sortRows(rows, 'help').map(r => r.short)).toEqual(['Di D.', 'Bo B.', 'Abe A.', 'Cara C.']);
  });
});

describe('leaderboards', () => {
  const rows = buildRows([
    file('a', 'Amy Ash', 1, { ogaLboard: '900', ogaLboardLabel: 'Carry Rush X7' }),
    file('b', 'Bea Bond', 2, { ogaLboard: '1200', ogaLboardLabel: 'Carry Rush X7' }),
    file('c', 'Cal Cox', 3, { ogaLboard: '900', ogaLboardLabel: 'Carry Rush X7' }),
    file('d', 'Dev Dee', 1, { ogaLboard: '400', ogaLboardLabel: 'Carry Rush X7' }),
    file('e', 'Eli Eke', 1, { ogaLboard: '5000', ogaLboardLabel: 'Carry Rush' }),
    file('f', 'Fay Fox', 1, { ogaLboard: '0', ogaLboardLabel: 'Carry Rush' }),
    file('g', 'Gus Gee', 1, { ogaScore: '50' }),
  ], NOW);
  const boards = leaderboards(rows);
  it('ranks each label on its own board', () => {
    expect(Object.keys(boards).sort()).toEqual(['Carry Rush', 'Carry Rush X7']);
    expect(boards['Carry Rush']).toEqual([{ rank: 1, short: 'Eli E.', board: 5000, unit: '' }]);
  });
  it('shares a rank on a tie, the earlier save listed first', () => {
    expect(boards['Carry Rush X7'].map(e => [e.rank, e.short])).toEqual([[1, 'Bea B.'], [2, 'Cal C.'], [2, 'Amy A.'], [4, 'Dev D.']]);
  });
  it('keeps only the top entries', () => {
    expect(leaderboards(rows, 2)['Carry Rush X7']).toHaveLength(2);
  });
});

describe('ago', () => {
  it('rounds to friendly units', () => {
    expect(ago(20000)).toBe('just now');
    expect(ago(5 * 60000)).toBe('5 min ago');
    expect(ago(3 * 3600000)).toBe('3 h ago');
    expect(ago(50 * 3600000)).toBe('2 d ago');
  });
});

describe('time boards (boardUnit ms)', () => {
  const rows = buildRows([
    file('a', 'Amy Ash', 1, { ogaLboard: '95000', ogaLboardLabel: 'Rapid Response Unit', ogaLboardUnit: 'ms' }),
    file('b', 'Bea Bond', 1, { ogaLboard: '80000', ogaLboardLabel: 'Rapid Response Unit', ogaLboardUnit: 'ms' }),
    file('c', 'Cal Cox', 1, { ogaLboard: '120000', ogaLboardLabel: 'Rapid Response Unit', ogaLboardUnit: 'ms' }),
  ], NOW);
  it('ranks the lowest time first', () => {
    const b = leaderboards(rows)['Rapid Response Unit'];
    expect(b.map(e => e.short)).toEqual(['Bea B.', 'Amy A.', 'Cal C.']);
    expect(b[0].unit).toBe('ms');
  });
  it('formats times as m:ss.s and scores with commas', () => {
    expect(formatBoard(80000, 'ms')).toBe('1:20.0');
    expect(formatBoard(65430, 'ms')).toBe('1:05.4');
    expect(formatBoard(3100, '')).toBe('3,100');
  });
});

describe('themeFor', () => {
  const site = 'https://example.github.io/interactive/';
  it('reads year and topic from a lesson-level link, ignoring ?courseId', () => {
    expect(themeFor(site + 'Y8/Data_Representation/L2_Binary_Addition/1_Binary_Addition.html?courseId=9'))
      .toEqual({ year: '8', topic: 'Data_Representation', skin: '' });
  });
  it('gives the Y9 Python chapters the Station Zero skin', () => {
    expect(themeFor(site + 'Y9/Python/L5_Functions/1_The_Drone_PRIMM.html').skin).toBe('station-zero');
  });
  it('gives Y9 Digital Forensics the workstation skin', () => {
    expect(themeFor(site + 'Y9/Digital_Forensics/L5_Searching_the_Computer/Searching_the_Computer.html').skin).toBe('workstation');
  });
  it('strips spec numbers and spaces from topic folders, as classroom.js does', () => {
    expect(themeFor(site + 'Y11/1.3%20Networks/Quiz.html')).toEqual({ year: '11', topic: 'Networks', skin: '' });
  });
  it('gives nothing for links that are not activities', () => {
    expect(themeFor('https://docs.google.com/presentation/d/abc/view')).toEqual({});
    expect(themeFor(site + 'Y8/Loose_Page.html')).toEqual({});
    expect(themeFor('')).toEqual({});
  });
});
