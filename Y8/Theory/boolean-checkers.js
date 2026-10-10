// Pure answer data and checkers for BooleanLogic.html (no DOM).
// Unit-tested in boolean-checkers.test.js.

export const TASK_COUNT = 5;

// ── Gates ─────────────────────────────────────────────────
export function gateOutput(gate, a, b = 0) {
  if (gate === 'AND') return a === 1 && b === 1 ? 1 : 0;
  if (gate === 'OR')  return a === 1 || b === 1 ? 1 : 0;
  if (gate === 'NOT') return a === 1 ? 0 : 1;
  throw new Error('Unknown gate: ' + gate);
}

// ── Seeded randomness (stable per student, so a reload shows the same order) ──
export function seededRandom(seed) {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  if (!s) s = 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

export function shuffled(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Escalating wait after a wrong check: 10 s, 20 s, then 30 s.
export function cooldownSeconds(wrongCount) {
  return Math.min(30, 10 * Math.max(1, wrongCount));
}

// ── Task 1: predict the bulb (checkpoint chain) ───────────
// Every gate/input combination. One attempt draws PREDICT_LENGTH of them.
export const PREDICT_POOL = [
  ...[[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => ({ id: `AND${a}${b}`, gate: 'AND', a, b })),
  ...[[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => ({ id: `OR${a}${b}`,  gate: 'OR',  a, b })),
  ...[0, 1].map(a => ({ id: `NOT${a}`, gate: 'NOT', a, b: 0 })),
];
export const PREDICT_LENGTH = 6;

export function predictQuestion(id) {
  return PREDICT_POOL.find(q => q.id === id);
}

export function drawPredict(seed, attempt) {
  return shuffled(PREDICT_POOL.map(q => q.id), seededRandom(`${seed}|predict|${attempt}`))
    .slice(0, PREDICT_LENGTH);
}

// The circuit for one question. The draw picks the gate; after a wrong answer the
// student gets the same gate with different inputs (retry 1, 2, …), not a restart.
export function predictCircuit(seed, attempt, pos, retry = 0) {
  let q = predictQuestion(drawPredict(seed, attempt)[pos]);
  for (let r = 1; r <= retry; r++) {
    const others = PREDICT_POOL.filter(p => p.gate === q.gate && p.id !== q.id);
    q = others[Math.floor(seededRandom(`${seed}|retry|${attempt}|${pos}|${r}`)() * others.length)];
  }
  return q;
}

export function predictWhy({ gate, a, b }) {
  const out = gateOutput(gate, a, b);
  if (gate === 'AND') return out
    ? 'Both inputs are 1, so the AND gate outputs 1.'
    : 'AND needs BOTH inputs to be 1. At least one input is 0, so the output is 0.';
  if (gate === 'OR') return out
    ? 'At least one input is 1, so the OR gate outputs 1.'
    : 'OR needs at least one input to be 1. Both are 0, so the output is 0.';
  return `NOT flips the input. The input is ${a}, so the output is ${out}.`;
}

// ── Task 2: match each symbol to its name and rule ────────
export const RULES = {
  AND: 'Outputs 1 only when both inputs are 1',
  OR:  'Outputs 1 when at least one input is 1',
  NOT: 'Outputs the opposite of its one input',
};

// placed: { 'name-AND': 'AND', 'rule-AND': 'OR', … } — the slot id names the real gate.
export function checkMatch(placed) {
  const results = {};
  for (const gate of ['AND', 'OR', 'NOT']) {
    results['name-' + gate] = placed['name-' + gate] === gate;
    results['rule-' + gate] = placed['rule-' + gate] === gate;
  }
  return { ok: Object.values(results).every(Boolean), results };
}

// ── Task 3: truth tables ──────────────────────────────────
export const TT_CELLS = [
  ...[[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => ({ id: `and-${a}${b}`, gate: 'AND', a, b })),
  ...[[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => ({ id: `or-${a}${b}`,  gate: 'OR',  a, b })),
  ...[0, 1].map(a => ({ id: `not-${a}`, gate: 'NOT', a, b: 0 })),
];

// values: { 'and-00': '0', … } — strings '0' / '1' / '' (blank).
export function checkTables(values) {
  const results = {};
  for (const c of TT_CELLS) results[c.id] = values[c.id] === String(gateOutput(c.gate, c.a, c.b));
  return { ok: Object.values(results).every(Boolean), results };
}

// ── Task 4: real-world logic ──────────────────────────────
export const SCENARIOS = [
  { id: 'seatbelt', icon: '🚗', title: 'Seatbelt alarm',
    before: 'The seatbelt alarm beeps if the engine is running', after: 'the seatbelt is unbuckled.',
    answer: 'AND', why: 'It only beeps when both are true: engine on and belt unbuckled.' },
  { id: 'hallway', icon: '💡', title: 'Hallway light',
    before: 'The hallway light turns on if the wall switch is pressed', after: 'the motion sensor detects someone.',
    answer: 'OR', why: 'Either one is enough to turn the light on.' },
  { id: 'combo', icon: '🎮', title: 'Game combo move',
    before: 'Your character does a Mega-Punch if button A is held', after: 'button B is pressed.',
    answer: 'AND', why: 'A combo needs both buttons at the same time.' },
  { id: 'bell', icon: '🔔', title: 'School bell',
    before: 'The school bell rings if the fire alarm button is pressed', after: 'it is 3:15 pm.',
    answer: 'OR', why: 'Either event rings the bell on its own.' },
  { id: 'vault', icon: '🏦', title: 'Bank vault',
    before: 'The vault door opens if guard 1 turns their key', after: 'guard 2 turns their key.',
    answer: 'AND', why: 'For security, both keys must be turned.' },
  { id: 'heater', icon: '🌡️', title: 'Smart heating',
    before: 'The heater turns on if the room is below 18 °C', after: 'the boost button is pressed.',
    answer: 'OR', why: 'Being cold or pressing boost will each turn it on.' },
  { id: 'fridge', icon: '🧊', title: 'Fridge light',
    before: 'The fridge light is on when the door is', after: 'closed.',
    answer: 'NOT', why: 'The light is the opposite of "door closed": closed means off.' },
  { id: 'street', icon: '🌙', title: 'Street lights',
    before: 'The street lights switch on when it is', after: 'daytime.',
    answer: 'NOT', why: 'The lights are on whenever it is not daytime.' },
];

// placed: { 'sc-seatbelt': 'AND', … }
export function checkScenarios(placed) {
  const results = {};
  for (const s of SCENARIOS) results['sc-' + s.id] = placed['sc-' + s.id] === s.answer;
  return { ok: Object.values(results).every(Boolean), results };
}

// ── Task 5: final quiz (checkpoint chain) ─────────────────
// Option lengths are kept similar so the longest option is not a giveaway.
export const QUIZ_POOL = [
  { id: 'q1', q: 'Which gate outputs 1 only when both inputs are 1?',
    opts: [['a', 'AND gate'], ['b', 'OR gate'], ['c', 'NOT gate']], a: 'a',
    why: 'AND needs both inputs to be 1.' },
  { id: 'q2', q: 'An OR gate has A = 0 and B = 1. What is the output?',
    opts: [['a', '0'], ['b', '1']], a: 'b',
    why: 'OR outputs 1 when at least one input is 1.' },
  { id: 'q3', q: 'A NOT gate has an input of 1. What is the output?',
    opts: [['a', '0'], ['b', '1']], a: 'a',
    why: 'NOT flips the input, so 1 becomes 0.' },
  { id: 'q4', q: 'An AND gate has A = 1 and B = 0. What is the output?',
    opts: [['a', '0'], ['b', '1']], a: 'a',
    why: 'AND needs both inputs to be 1, and B is 0.' },
  { id: 'q5', q: 'An alarm sounds if sensor A OR sensor B detects movement. Which gate is this?',
    opts: [['a', 'AND gate'], ['b', 'OR gate'], ['c', 'NOT gate']], a: 'b',
    why: 'Either sensor on its own is enough, so it is OR.' },
  { id: 'q6', q: 'A truth table row shows A = 1, B = 1, output = 1. Which gates could it be?',
    opts: [['a', 'AND only'], ['b', 'OR only'], ['c', 'AND or OR'], ['d', 'Neither']], a: 'c',
    why: 'Both AND and OR output 1 when both inputs are 1.' },
  { id: 'q7', q: 'A truth table row shows A = 0, B = 1, output = 1. Which gate is it?',
    opts: [['a', 'AND gate'], ['b', 'OR gate'], ['c', 'NOT gate']], a: 'b',
    why: 'AND would give 0 here. Only OR gives 1.' },
  { id: 'q8', q: 'How many inputs does a NOT gate have?',
    opts: [['a', 'One'], ['b', 'Two'], ['c', 'Three']], a: 'a',
    why: 'NOT has one input, which it flips.' },
  { id: 'q9', q: 'How many rows are in the truth table for a two-input gate?',
    opts: [['a', '2'], ['b', '3'], ['c', '4'], ['d', '8']], a: 'c',
    why: 'Two inputs give 4 combinations: 00, 01, 10, 11.' },
  { id: 'q10', q: 'Which gate symbol has a small circle at its output?',
    opts: [['a', 'AND gate'], ['b', 'OR gate'], ['c', 'NOT gate']], a: 'c',
    why: 'The circle (bubble) means "flip", so it marks the NOT gate.' },
  { id: 'q11', q: 'A car starts only if the key is in AND the brake is pressed. Key = 1, brake = 0. Does it start?',
    opts: [['a', 'Yes (1)'], ['b', 'No (0)']], a: 'b',
    why: 'AND needs both, and the brake is 0.' },
  { id: 'q12', q: 'In logic, what does the value 1 usually mean?',
    opts: [['a', 'On / True'], ['b', 'Off / False']], a: 'a',
    why: '1 means on (true) and 0 means off (false).' },
];
export const QUIZ_LENGTH = 5;

export function quizQuestion(id) {
  return QUIZ_POOL.find(q => q.id === id);
}

export function drawQuiz(seed, attempt) {
  return shuffled(QUIZ_POOL.map(q => q.id), seededRandom(`${seed}|quiz|${attempt}`)).slice(0, QUIZ_LENGTH);
}

export function quizOptionOrder(id, seed, attempt) {
  return shuffled(quizQuestion(id).opts.map(o => o[0]), seededRandom(`${seed}|quiz|${attempt}|${id}`));
}

// ── XP, ranks and badges ──────────────────────────────────
// XP only comes from real progress, so it can't be farmed:
//  • a checkpoint answer pays only when it beats that chain's best position so far
//  • a task pays once per tier (a gold retry after green pays just the difference)
//  • each badge pays once
export const XP = { answer: 5, taskGold: 50, taskGreen: 30, badge: 25 };
export const STREAK_BADGE = 5;

export const BADGES = [
  { id: 'start',    icon: '🔌', title: 'Circuit Starter',    desc: 'Light the bulb with all three gates in the Try it area' },
  { id: 'predict',  icon: '💡', title: 'Bright Spark',       desc: 'Pass Predict the Bulb' },
  { id: 'match',    icon: '🎯', title: 'Match Maestro',      desc: 'Match every symbol to its name and rule' },
  { id: 'truth',    icon: '📊', title: 'Truth Table Titan',  desc: 'Complete all three truth tables' },
  { id: 'scenario', icon: '🤖', title: 'Automation Expert',  desc: 'Solve every real-world scenario' },
  { id: 'quiz',     icon: '🎓', title: 'Challenge Champion', desc: 'Pass the Final Challenge' },
  { id: 'streak',   icon: '🔥', title: 'On Fire',            desc: `Get ${STREAK_BADGE} answers right in a row` },
  { id: 'gold',     icon: '🏆', title: 'Gold Standard',      desc: 'Finish every task on gold' },
];
export const TASK_BADGE = ['predict', 'match', 'truth', 'scenario', 'quiz'];

export const RANKS = [
  [0,   '⚡ Gate Novice'],
  [100, '🔌 Circuit Builder'],
  [200, '📊 Truth Titan'],
  [300, '🚀 Logic Wizard'],
  [450, '👑 Master Engineer'],
];

export const MAX_XP = TASK_COUNT * XP.taskGold + (PREDICT_LENGTH + QUIZ_LENGTH) * XP.answer + BADGES.length * XP.badge;

export function rankFor(xp) {
  let index = 0;
  RANKS.forEach(([min], i) => { if (xp >= min) index = i; });
  return { index, min: RANKS[index][0], name: RANKS[index][1], next: RANKS[index + 1]?.[0] ?? null };
}

// XP still owed for finishing a task, given what it has already paid out.
export function taskXpGain(alreadyPaid, gold) {
  return Math.max(0, (gold ? XP.taskGold : XP.taskGreen) - (alreadyPaid || 0));
}
