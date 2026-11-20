import { describe, it, expect } from 'vitest';
import { liveQuery, shortNames, buildRows, sortRows, leaderboards, scoreBoard, mostImproved, usualPositions, compareSet, defaultCompare, ordinal, formatBoard, ago, themeFor, IDLE_MS, loadHidden, saveHidden, withoutHidden, HIDDEN_KEY } from './hub-live.js';

describe('hidden from leaderboards', () => {
  const store = (init = {}) => ({ data: { ...init }, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; } });
  it('saves and loads the hidden list', () => {
    const s = store();
    saveHidden({ p1: 'Amelia Smith' }, s);
    expect(loadHidden(s)).toEqual({ p1: 'Amelia Smith' });
  });
  it('starts empty when nothing (or rubbish) is saved, or storage is blocked', () => {
    expect(loadHidden(store())).toEqual({});
    expect(loadHidden(store({ [HIDDEN_KEY]: 'not json' }))).toEqual({});
    expect(loadHidden(store({ [HIDDEN_KEY]: '[1]' }))).toEqual({});
    expect(loadHidden({ getItem() { throw new Error('blocked'); } })).toEqual({});
  });
  it('takes hidden students off the boards, the rest moving up', () => {
    const rows = [{ who: 'p1', short: 'Amy A.', score: 90, modified: 1 }, { who: 'p2', short: 'Ben B.', score: 80, modified: 1 }];
    const shown = withoutHidden(rows, { p1: 'Amy Ash' });
    expect(shown.map(r => r.who)).toEqual(['p2']);
    expect(scoreBoard(shown)[0]).toMatchObject({ rank: 1, short: 'Ben B.' });
    expect(withoutHidden(rows, {})).toHaveLength(2);
    expect(withoutHidden([{ who: 'toString' }], {})).toHaveLength(1);   // only the teacher's own entries count
  });
});

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
    expect(boards['Carry Rush']).toEqual([{ rank: 1, who: 'Eli Eke', short: 'Eli E.', board: 5000, unit: '' }]);
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

describe('scoreBoard (the Top 10 every assignment has)', () => {
  const rows = buildRows([
    file('a', 'Amy Ash', 5, { ogaScore: '80' }),
    file('b', 'Bea Bond', 9, { ogaScore: '80' }),
    file('c', 'Cal Cox', 1, { ogaScore: '100' }),
    file('d', 'Dev Dee', 1, { ogaScore: '0' }),
    file('e', 'Eli Eke', 1, { ogaLtask: '0/5' }),
  ], NOW);
  it('ranks by score, the first to reach a score listed first, leaving out 0 and no score', () => {
    expect(scoreBoard(rows).map(e => [e.rank, e.short, e.board, e.unit])).toEqual([[1, 'Cal C.', 100, '%'], [2, 'Bea B.', 80, '%'], [2, 'Amy A.', 80, '%']]);
  });
  it('keeps only the top entries, and formats as a percentage', () => {
    expect(scoreBoard(rows, 1)).toHaveLength(1);
    expect(formatBoard(85, '%')).toBe('85%');
  });
});

describe('ordinal', () => {
  it('gives 1st, 2nd, 3rd, 4th, 11th–13th, 21st, 22nd', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 101].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '101st']);
  });
});

describe('mostImproved', () => {
  // The same student keeps their Drive permissionId across assignments; submission IDs differ.
  const ev = (who, name, score) => ({
    id: who + Math.random(), modifiedTime: at(1), lastModifyingUser: { displayName: name }, owners: [{ displayName: name, permissionId: who }],
    appProperties: { ogaSub: 'sub-' + who + Math.random(), ...(score == null ? {} : { ogaScore: String(score) }) },
  });
  const rows = list => buildRows(list.map(([who, name, score]) => ev(who, name, score)), NOW);
  const before = rows([['a', 'Amy Ash', 100], ['b', 'Bea Bond', 90], ['c', 'Cal Cox', 60], ['d', 'Dev Dee', 30], ['e', 'Eli Eke', 20], ['f', 'Fay Fox', 10]]);

  it('ranks by places climbed in the class, not raw %', () => {
    // A harder task this week: everyone scores lower, but Eli climbs 5th → 2nd and Dev 4th → 3rd.
    const after = rows([['a', 'Amy Ash', 70], ['b', 'Bea Bond', 40], ['c', 'Cal Cox', 30], ['d', 'Dev Dee', 50], ['e', 'Eli Eke', 60], ['f', 'Fay Fox', 5]]);
    const { candidates, compared, notCompared } = mostImproved([before], after);
    expect(candidates.map(c => [c.short, c.from, c.to, c.climbed, c.topTwo])).toEqual([['Eli E.', 5, 2, 3, true], ['Dev D.', 4, 3, 1, false]]);
    expect(candidates[0]).toMatchObject({ before: 20, after: 60 });
    expect([compared, notCompared]).toEqual([6, 0]);
  });
  it('leaves out a student who was absent last time, however well they did', () => {
    const after = rows([['a', 'Amy Ash', 100], ['b', 'Bea Bond', 90], ['c', 'Cal Cox', 60], ['d', 'Dev Dee', 30], ['e', 'Eli Eke', 20], ['f', 'Fay Fox', 10], ['g', 'Gus Gee', 100]]);
    const r = mostImproved([before], after);
    expect(r.candidates).toEqual([]);
    expect(r.notCompared).toBe(1);
  });
  it('only counts students in the top half this time (a less bad week is not enough)', () => {
    // Fay climbs 6th → 4th but is still in the bottom half; Cal climbs 3rd → 1st.
    const after = rows([['a', 'Amy Ash', 80], ['b', 'Bea Bond', 70], ['c', 'Cal Cox', 90], ['d', 'Dev Dee', 10], ['e', 'Eli Eke', 5], ['f', 'Fay Fox', 40]]);
    expect(mostImproved([before], after).candidates.map(c => c.short)).toEqual(['Cal C.']);
  });
  it('breaks a tie in places climbed by the higher score now, and keeps the top 3', () => {
    // Cal and Dev both climb 2 places; Cal scored more this time.
    const b = rows([['a', 'Amy Ash', 40], ['b', 'Bea Bond', 30], ['c', 'Cal Cox', 20], ['d', 'Dev Dee', 10]]);
    const a = rows([['a', 'Amy Ash', 70], ['b', 'Bea Bond', 60], ['c', 'Cal Cox', 90], ['d', 'Dev Dee', 80]]);
    expect(mostImproved([b], a).candidates.map(c => [c.short, c.climbed])).toEqual([['Cal C.', 2], ['Dev D.', 2]]);
    expect(mostImproved([b], a, 1).candidates).toHaveLength(1);
  });
  it('ignores students with no score in either', () => {
    const r = mostImproved([rows([['a', 'Amy Ash', null]])], rows([['a', 'Amy Ash', 50]]));
    expect([r.compared, r.notCompared]).toEqual([0, 1]);
  });

  describe('averaged over two earlier lessons', () => {
    // Lesson 1 (4 in class): Amy, Bea, Cal, Dev. Lesson 2 (5 in class): Amy, Cal, Dev, Bea, Eli.
    const l1 = rows([['a', 'Amy Ash', 100], ['b', 'Bea Bond', 80], ['c', 'Cal Cox', 60], ['d', 'Dev Dee', 40], ['e', 'Eli Eke', null]]);
    const l2 = rows([['a', 'Amy Ash', 90], ['b', 'Bea Bond', 30], ['c', 'Cal Cox', 80], ['d', 'Dev Dee', 70], ['e', 'Eli Eke', 10]]);

    it('gives each student their usual share of the class, from the lessons they were in', () => {
      const u = usualPositions([l1, l2]);
      expect(u.get('a')).toEqual({ pos: 0, score: 95, lessons: 2 });
      expect(u.get('b').pos).toBeCloseTo((1 / 3 + 3 / 4) / 2);   // 2nd of 4, then 4th of 5
      expect(u.get('e')).toEqual({ pos: 1, score: 10, lessons: 1 });   // absent from lesson 1
      expect(usualPositions([rows([['a', 'Amy Ash', 50]])]).get('a').pos).toBe(0);   // a class of one
    });
    it('ranks climbs from the usual place, counting a student absent from one lesson on the other', () => {
      // Usual order: Amy, Cal, Bea, Dev, Eli. Now: Dev, Eli, Bea, Amy, Cal.
      const now = rows([['a', 'Amy Ash', 50], ['b', 'Bea Bond', 60], ['c', 'Cal Cox', 40], ['d', 'Dev Dee', 90], ['e', 'Eli Eke', 80]]);
      const { candidates, compared } = mostImproved([l1, l2], now);
      expect(candidates.map(c => [c.short, c.from, c.to, c.lessons])).toEqual([['Dev D.', 4, 1, 2], ['Eli E.', 5, 2, 1]]);
      expect(candidates[0].before).toBe(55);   // the average of 40% and 70%
      expect(compared).toBe(5);
    });
    it('halves the climb from one bad week', () => {
      // Bea is usually 2nd, had one bad week (last lesson) and is 2nd again.
      const now = rows([['a', 'Amy Ash', 100], ['b', 'Bea Bond', 95], ['c', 'Cal Cox', 50], ['d', 'Dev Dee', 40]]);
      const good = rows([['a', 'Amy Ash', 90], ['b', 'Bea Bond', 70], ['c', 'Cal Cox', 60], ['d', 'Dev Dee', 50]]);
      const bad = rows([['a', 'Amy Ash', 90], ['b', 'Bea Bond', 10], ['c', 'Cal Cox', 60], ['d', 'Dev Dee', 50]]);
      const climb = earlier => mostImproved(earlier, now).candidates.find(c => c.short === 'Bea B.')?.climbed;
      expect(climb([bad])).toBe(2);          // last lesson only: "4th → 2nd"
      expect(climb([bad, good])).toBe(1);    // her usual place is 3rd
    });
  });
});

describe('compareSet', () => {
  const works = [
    { id: 'today', creationTime: '2026-11-17T10:00:00Z' },
    { id: 'lastweek2', creationTime: '2026-11-10T10:00:00Z' },
    { id: 'lastweek1', creationTime: '2026-11-10T09:00:00Z' },
    { id: 'twoweeks', creationTime: '2026-11-03T09:00:00Z' },
  ];
  it('takes the chosen assignment and the lesson before it, skipping pages from the same day', () => {
    expect(compareSet(works, 'lastweek2')).toEqual(['lastweek2', 'twoweeks']);
  });
  it('gives what there is when there is no earlier lesson', () => {
    expect(compareSet(works, 'twoweeks')).toEqual(['twoweeks']);
    expect(compareSet(works, '')).toEqual([]);
  });
});

describe('defaultCompare', () => {
  const works = [
    { id: 'today2', creationTime: '2026-11-17T10:00:00Z' },
    { id: 'today1', creationTime: '2026-11-17T09:00:00Z' },
    { id: 'lastweek', creationTime: '2026-11-10T09:00:00Z' },
    { id: 'older', creationTime: '2026-11-03T09:00:00Z' },
  ];
  it('picks last week\'s lesson, not another page set the same day', () => {
    expect(defaultCompare(works, 'today2')).toBe('lastweek');
    expect(defaultCompare(works, 'lastweek')).toBe('older');
  });
  it('falls back to the one just before when nothing is 2 days older, and gives none for the first', () => {
    expect(defaultCompare(works.slice(0, 2), 'today2')).toBe('today1');
    expect(defaultCompare(works, 'older')).toBe('');
    expect(defaultCompare(works, 'missing')).toBe('');
  });
});
