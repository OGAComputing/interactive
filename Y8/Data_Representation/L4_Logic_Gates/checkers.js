// Logic Gates and Truth Tables (Y8 Data Representation L4): pure checking logic, no DOM.
//
// Tasks (all scored):
//   0  Gates in real life   4 steps: AND, OR, NOT sentences (tap 1/0 for each situation), then fill the gap
//   1  Gate symbols         4 steps: drag the names onto the symbols (key, no key), then onto the gates in circuits
//   2  Truth tables         5 steps: AND, OR, NOT with the rule, symbol only, then "which gate made this table?"
//   3  Trace a circuit      4 steps: fill P (the middle wire) and Q for two-gate circuits, the last with 3 inputs
//   4  Build it             4 steps: drag gates (and from step 2 the inputs) into a circuit; checked on every row
//   5  Plenary              5 in a row: key ideas and output columns
// Logic Rush (extension, not scored) starts with logic only, then brings in hex (L3), binary adding (L2)
// and binary ↔ denary (L1), so the game builds over the unit.

export const TASK_COUNT = 6;
export const GATE_NAMES = ['AND', 'OR', 'NOT'];

// ── Random numbers (seeded per student, so a reload shows the same question) ──
export function seededRandom(seed) {
  let s = 0;
  for (const ch of String(seed).toUpperCase()) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  // Mix the bits (MurmurHash3 finaliser), so nearby seeds give unrelated numbers.
  s ^= s >>> 16; s = Math.imul(s, 0x85ebca6b) >>> 0;
  s ^= s >>> 13; s = Math.imul(s, 0xc2b2ae35) >>> 0;
  s ^= s >>> 16;
  if (!s) s = 1;
  const next = () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
  for (let k = 0; k < 4; k++) next();   // warm up
  return next;
}

export function shuffled(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];

// ═══════════════ GATES ═══════════════
export const arity = g => (g === 'NOT' ? 1 : 2);
export function gate(g, a, b) {
  if (g === 'AND') return a & b;
  if (g === 'OR') return a | b;
  if (g === 'NOT') return 1 - a;
  throw new Error('Unknown gate ' + g);
}
export const RULES = {
  AND: 'Output 1 only when both inputs are 1.',
  OR:  'Output 1 when the inputs have at least one 1.',
  NOT: 'One input. The output is the opposite of the input.',
};
export const SHAPES = {
  AND: 'flat back, round front (a D shape)',
  OR:  'curved back, pointed front',
  NOT: 'a triangle with a small circle on its tip',
};

// Every row of a truth table, in order: 2 inputs → 00, 01, 10, 11 (counting up in binary, A on the left).
export function inputRows(n) {
  return Array.from({ length: 1 << n }, (_, r) => Array.from({ length: n }, (_, k) => (r >> (n - 1 - k)) & 1));
}
export const gateColumn = g => inputRows(arity(g)).map(([a, b]) => gate(g, a, b)).join('');
export const gateFromColumn = col => GATE_NAMES.find(g => gateColumn(g) === col) || null;

// ═══════════════ CIRCUITS ═══════════════
// A layout is a fixed circuit shape. Each slot is a gate box; its inputs are input letters or earlier slots.
// With pins, the input letters are left empty for the student to fill: pin key `${slot}.${k}`.
// Slots are listed in order, so every slot's inputs are worked out before it.
export const LAYOUTS = {
  one:      { inputs: ['A', 'B'],      slots: { g1: ['A', 'B'] },                               out: 'g1' },
  notIn:    { inputs: ['A', 'B'],      slots: { g1: ['A'], g2: ['g1', 'B'] },                    out: 'g2' },
  notOut:   { inputs: ['A', 'B'],      slots: { g1: ['A', 'B'], g2: ['g1'] },                    out: 'g2' },
  three:    { inputs: ['A', 'B', 'C'], slots: { g1: ['A', 'B'], g2: ['g1', 'C'] },               out: 'g2' },
  threeNot: { inputs: ['A', 'B', 'C'], slots: { g1: ['A', 'B'], g2: ['C'], g3: ['g1', 'g2'] },   out: 'g3' },
};
const isSlot = src => /^g\d$/.test(src);
export const slotIds = id => Object.keys(LAYOUTS[id].slots);
export const pinKeys = id => Object.entries(LAYOUTS[id].slots)
  .flatMap(([g, ins]) => ins.map((src, k) => (isSlot(src) ? null : `${g}.${k}`)).filter(Boolean));
// Can this gate go in this box? NOT needs a box with one input; AND and OR need two.
export const fits = (id, slot, g) => arity(g) === LAYOUTS[id].slots[slot].length;

// env = { A: 0|1, … }. Returns every slot's value (undefined while a gate or a pin is missing) and the output.
export function evalCircuit(id, build, env, pins = false) {
  const L = LAYOUTS[id];
  const vals = {};
  for (const [g, ins] of Object.entries(L.slots)) {
    const kind = build[g];
    const xs = ins.map((src, k) => (isSlot(src) ? vals[src] : env[pins ? build[`${g}.${k}`] : src]));
    vals[g] = kind && arity(kind) === ins.length && xs.every(v => v === 0 || v === 1) ? gate(kind, ...xs) : undefined;
  }
  return { out: vals[L.out], vals };
}

export const envFor = (id, row) => Object.fromEntries(LAYOUTS[id].inputs.map((x, k) => [x, row[k]]));

// The circuit's output for every row, e.g. '0010', or null if it isn't finished.
export function circuitColumn(id, build, pins = false) {
  const outs = inputRows(LAYOUTS[id].inputs.length).map(r => evalCircuit(id, build, envFor(id, r), pins).out);
  return outs.every(v => v === 0 || v === 1) ? outs.join('') : null;
}
// One slot's value on every row (P, the middle wire, in Task 4).
export function slotColumn(id, build, slot, pins = false) {
  return inputRows(LAYOUTS[id].inputs.length).map(r => evalCircuit(id, build, envFor(id, r), pins).vals[slot]).join('');
}

// The circuit written out, with brackets round every inner gate: "(NOT A) AND B".
export function exprString(id, build, pins = false, slot = LAYOUTS[id].out, top = true) {
  const ins = LAYOUTS[id].slots[slot];
  const part = (src, k) => (isSlot(src) ? exprString(id, build, pins, src, false) : (pins ? build[`${slot}.${k}`] : src) || '?');
  const g = build[slot] || '?';
  const s = ins.length === 1 ? `NOT ${part(ins[0], 0)}` : `${part(ins[0], 0)} ${g} ${part(ins[1], 1)}`;
  return top ? s : `(${s})`;
}

// Every way to fill a layout's slots with gates that fit.
export function allBuilds(id) {
  return slotIds(id).reduce((acc, g) => acc.flatMap(b =>
    (LAYOUTS[id].slots[g].length === 1 ? ['NOT'] : ['AND', 'OR']).map(k => ({ ...b, [g]: k }))), [{}]);
}

// ═══════════════ TASK 1: GATES IN REAL LIFE ═══════════════
// text has the gate word in capitals; a/b name the inputs, q the output.
export const SCENARIOS = {
  AND: [
    { id: 'car',   text: 'The car starts when the key is turned AND the brake is pressed.', a: 'Key turned', b: 'Brake pressed', q: 'Car starts' },
    { id: 'micro', text: 'The microwave runs when the door is shut AND start is pressed.', a: 'Door shut', b: 'Start pressed', q: 'Microwave runs' },
    { id: 'shop',  text: 'You can buy the game when you have enough money AND you are logged in.', a: 'Enough money', b: 'Logged in', q: 'Can buy the game' },
    { id: 'phone', text: 'The phone unlocks when the face matches AND the screen is on.', a: 'Face matches', b: 'Screen on', q: 'Phone unlocks' },
  ],
  OR: [
    { id: 'bell',  text: 'The doorbell rings when the front button OR the back button is pressed.', a: 'Front button pressed', b: 'Back button pressed', q: 'Doorbell rings' },
    { id: 'light', text: 'The hall light comes on when the switch is on OR the sensor sees someone.', a: 'Switch on', b: 'Sensor sees someone', q: 'Light on' },
    { id: 'drink', text: 'You get a free drink when it is your birthday OR you have a voucher.', a: 'Your birthday', b: 'Have a voucher', q: 'Free drink' },
    { id: 'alarm', text: 'The alarm goes off when a window opens OR a door opens.', a: 'Window opens', b: 'Door opens', q: 'Alarm goes off' },
  ],
  NOT: [
    { id: 'night', text: 'The night light is on when it is NOT daytime.', a: 'Daytime', q: 'Night light on' },
    { id: 'fan',   text: 'The fan runs when the room is NOT cold.', a: 'Room is cold', q: 'Fan runs' },
    { id: 'wifi',  text: 'The screen shows "Offline" when the Wi-Fi is NOT connected.', a: 'Wi-Fi connected', q: 'Shows "Offline"' },
    { id: 'lock',  text: 'The door stays locked when the code is NOT right.', a: 'Code is right', q: 'Door stays locked' },
  ],
};
export const scenario = id => Object.values(SCENARIOS).flat().find(s => s.id === id);
export const gapText = s => s.text.replace(/\b(AND|OR|NOT)\b/, '___');
export const scenarioGate = id => GATE_NAMES.find(g => SCENARIOS[g].some(s => s.id === id));

// ═══════════════ TASK 5: BUILD IT ═══════════════
// story: inputs named, a rule in words, and one circuit that works (any circuit with the same table is right).
// table: just the target, from one circuit that works.
export const BUILDS = {
  one: [
    { id: 'drone',   text: 'The drone takes off when the battery is charged AND the start button is pressed.', ins: { A: 'battery charged', B: 'start pressed' }, q: 'drone takes off', build: { g1: 'AND' } },
    { id: 'safe',    text: 'The safe opens when the code is right AND the key is turned.', ins: { A: 'code right', B: 'key turned' }, q: 'safe opens', build: { g1: 'AND' } },
    { id: 'robot',   text: 'The robot moves when its power is on AND its path is clear.', ins: { A: 'power on', B: 'path clear' }, q: 'robot moves', build: { g1: 'AND' } },
    { id: 'bin',     text: 'The bin lid opens when the foot pedal is pressed OR a hand waves over the sensor.', ins: { A: 'pedal pressed', B: 'hand waved' }, q: 'lid opens', build: { g1: 'OR' } },
    { id: 'fire',    text: 'The fire alarm sounds when smoke is found OR the alarm button is pressed.', ins: { A: 'smoke found', B: 'button pressed' }, q: 'alarm sounds', build: { g1: 'OR' } },
    { id: 'gameend', text: 'The game ends when you run out of lives OR the time runs out.', ins: { A: 'out of lives', B: 'time up' }, q: 'game ends', build: { g1: 'OR' } },
  ],
  notIn: [
    { id: 'heat',  text: 'The heating comes on when the window is NOT open AND it is cold.', ins: { A: 'window open', B: 'it is cold' }, q: 'heating on', build: { g1: 'NOT', g2: 'AND', 'g1.0': 'A', 'g2.1': 'B' } },
    { id: 'garden', text: 'The garden light comes on when it is NOT daytime AND someone is outside.', ins: { A: 'daytime', B: 'someone outside' }, q: 'light on', build: { g1: 'NOT', g2: 'AND', 'g1.0': 'A', 'g2.1': 'B' } },
    { id: 'pet',   text: 'The pet door opens when the pet\'s tag is near AND the door is NOT locked.', ins: { A: 'tag near', B: 'door locked' }, q: 'pet door opens', build: { g1: 'NOT', g2: 'AND', 'g1.0': 'B', 'g2.1': 'A' } },
    { id: 'belt',  text: 'The warning light comes on when the seatbelt is NOT done up OR a door is open.', ins: { A: 'seatbelt done up', B: 'door open' }, q: 'warning light on', build: { g1: 'NOT', g2: 'OR', 'g1.0': 'A', 'g2.1': 'B' } },
    { id: 'plant', text: 'The plant gets watered when the soil is dry OR it has NOT rained today.', ins: { A: 'soil dry', B: 'rained today' }, q: 'plant watered', build: { g1: 'NOT', g2: 'OR', 'g1.0': 'B', 'g2.1': 'A' } },
  ],
  notOut: [
    { id: 'nand', build: { g1: 'AND', g2: 'NOT', 'g1.0': 'A', 'g1.1': 'B' } },
    { id: 'nor',  build: { g1: 'OR', g2: 'NOT', 'g1.0': 'A', 'g1.1': 'B' } },
    { id: 'nota', build: { g1: 'AND', g2: 'NOT', 'g1.0': 'A', 'g1.1': 'A' } },
  ],
  three: [
    { id: 'sprinkler', text: 'The sprinkler turns on when it is morning OR evening, AND the soil is dry.', ins: { A: 'morning', B: 'evening', C: 'soil dry' }, q: 'sprinkler on', build: { g1: 'OR', g2: 'AND', 'g1.0': 'A', 'g1.1': 'B', 'g2.1': 'C' } },
    { id: 'street',    text: 'The street light comes on when a car OR a person goes past, AND it is dark.', ins: { A: 'car goes past', B: 'person goes past', C: 'dark' }, q: 'light on', build: { g1: 'OR', g2: 'AND', 'g1.0': 'A', 'g1.1': 'B', 'g2.1': 'C' } },
    { id: 'vend',      text: 'The machine gives a drink when you pay by coin OR by card, AND the drink is in stock.', ins: { A: 'paid by coin', B: 'paid by card', C: 'in stock' }, q: 'drink given', build: { g1: 'OR', g2: 'AND', 'g1.0': 'A', 'g1.1': 'B', 'g2.1': 'C' } },
    { id: 'ride',      text: 'The ride starts when the bar is down AND the belt is on, OR when the operator presses override.', ins: { A: 'bar down', B: 'belt on', C: 'override' }, q: 'ride starts', build: { g1: 'AND', g2: 'OR', 'g1.0': 'A', 'g1.1': 'B', 'g2.1': 'C' } },
    { id: 'level',     text: 'The next level unlocks when you have the key AND the coin, OR when you use a cheat code.', ins: { A: 'have the key', B: 'have the coin', C: 'cheat code' }, q: 'level unlocks', build: { g1: 'AND', g2: 'OR', 'g1.0': 'A', 'g1.1': 'B', 'g2.1': 'C' } },
  ],
};

// ═══════════════ LADDERS ═══════════════
// One question at a time. A right answer moves on a step (with less help); a wrong one shows the working
// and gives a new question at the same step. fold: the method box is folded away.
export const LADDERS = {
  0: [
    { kind: 'situ', gate: 'AND', help: 'AND: it only happens when both things are true. Tap 1 (yes) or 0 (no) for each situation.' },
    { kind: 'situ', gate: 'OR', help: 'OR: it happens when at least one thing is true. Tap 1 or 0 for each situation.' },
    { kind: 'situ', gate: 'NOT', help: 'NOT: it happens when the thing is not true, so the answer is the opposite.' },
    { kind: 'gap', fold: true, help: 'Read what happened in each situation, then drag AND, OR or NOT into the gap that fits.' },
  ],
  1: [
    { kind: 'name3', showKey: true, help: 'Use the shape key: drag each name onto its symbol.' },
    { kind: 'name3', showKey: false, fold: true, help: 'No key now. Drag each name onto its symbol.' },
    { kind: 'nameCircuit', layouts: ['notIn', 'notOut', 'three'], help: 'Gates join up to make a circuit. Drag a name onto every gate.' },
    { kind: 'nameCircuit', layouts: ['threeNot'], help: 'Three gates this time. A name can be used more than once.' },
  ],
  2: [
    { kind: 'table', gate: 'AND', rule: true, help: 'The rule is shown. Tap each output box to set it to 0 or 1.' },
    { kind: 'table', gate: 'OR', rule: true, help: 'Now OR. Read the rule, then fill in the output for every row.' },
    { kind: 'table', gate: 'NOT', rule: true, help: 'NOT has one input, so its table has only 2 rows.' },
    { kind: 'table', gate: 'pick', rule: false, fold: true, help: 'Only the symbol now. Name the gate in your head, then fill in its table.' },
    { kind: 'whichGate', fold: true, help: 'The outputs are done. Drag the name of the gate that makes each table onto it.' },
  ],
  3: [
    { kind: 'trace', layout: 'notIn', giveP: true, help: 'P is the first gate\'s output, and it is done for you. Use P and B as the inputs to the second gate to fill in Q.' },
    { kind: 'trace', layout: 'notIn', giveP: false, help: 'Now fill in P first (the first gate), then use it to fill in Q.' },
    { kind: 'trace', layout: 'notOut', giveP: false, help: 'This time the NOT gate comes last. Work out P, then Q is the opposite of P.' },
    { kind: 'trace', layout: 'three', giveP: false, fold: true, help: 'Three inputs, so 8 rows. P uses A and B; Q uses P and C.' },
  ],
  4: [
    { kind: 'build', layout: 'one', pins: false, from: 'story', help: 'Drag the gate that matches the rule into the box. Flip the switches to test it.' },
    { kind: 'build', layout: 'notIn', pins: true, from: 'story', help: 'Drag a gate into each box, and drag A or B onto each empty input. Test it with the switches.' },
    { kind: 'build', layout: 'notOut', pins: true, from: 'table', help: 'No story this time: build a circuit that gives this truth table. Add a working column for the first gate (try A AND B, or A OR B) and see which one Q is the opposite of.' },
    { kind: 'build', layout: 'three', pins: true, from: 'story', fold: true, help: 'Three inputs. Which two go into the first gate? Build it, then test it.' },
  ],
};
export const STEP_COUNT = Object.fromEntries(Object.entries(LADDERS).map(([t, steps]) => [t, steps.length]));

// Build a random circuit of gates that fit (for the naming and tracing steps).
function randomBuild(id, rnd) {
  return Object.fromEntries(Object.entries(LAYOUTS[id].slots).map(([g, ins]) => [g, ins.length === 1 ? 'NOT' : pick(['AND', 'OR'], rnd)]));
}

function makeQuestion(task, step, s, rnd) {
  const t = +task;
  const base = { ...s, task: t, step };
  if (s.kind === 'situ') {
    const sc = pick(SCENARIOS[s.gate], rnd);
    const n = arity(s.gate);
    const rows = n === 1 ? shuffled(inputRows(1), rnd) : shuffled(inputRows(2), rnd).slice(0, 3);
    return { ...base, scenario: sc.id, rows, answers: rows.map(([a, b]) => gate(s.gate, a, b)), key: `${sc.id}|${rows.join(';')}` };
  }
  if (s.kind === 'gap') {
    const ids = shuffled(GATE_NAMES.map(g => pick(SCENARIOS[g], rnd).id), rnd);
    // Evidence: for AND/OR the two "only one is yes" rows tell them apart; NOT shows both rows.
    const evidence = ids.map(id => {
      const g = scenarioGate(id);
      const rows = g === 'NOT' ? shuffled(inputRows(1), rnd) : shuffled([[1, 1], pick([[1, 0], [0, 1]], rnd), [0, 0]], rnd).slice(0, 2);
      // Two-input rows must include a mixed row, or AND and OR look the same.
      if (g !== 'NOT' && !rows.some(([a, b]) => a !== b)) rows[0] = [1, 0];
      return rows.map(r => ({ r, out: gate(g, ...r) }));
    });
    return { ...base, ids, evidence, answers: ids.map(scenarioGate), key: ids.join(',') };
  }
  if (s.kind === 'name3') {
    const order = shuffled(GATE_NAMES, rnd);
    return { ...base, order, answers: order, key: order.join(',') };
  }
  if (s.kind === 'nameCircuit') {
    const layout = pick(s.layouts, rnd);
    const build = randomBuild(layout, rnd);
    return { ...base, layout, build, answers: slotIds(layout).map(g => build[g]), key: layout + JSON.stringify(build) };
  }
  if (s.kind === 'table') {
    const g = s.gate === 'pick' ? pick(['AND', 'OR'], rnd) : s.gate;
    return { ...base, gate: g, answers: [...gateColumn(g)].map(Number), key: g };
  }
  if (s.kind === 'whichGate') {
    const order = shuffled(GATE_NAMES, rnd);
    return { ...base, order, answers: order, key: order.join(',') };
  }
  if (s.kind === 'trace') {
    const build = randomBuild(s.layout, rnd);
    const p = slotColumn(s.layout, build, 'g1'), q = circuitColumn(s.layout, build);
    return { ...base, build, P: p, Q: q, key: JSON.stringify(build) };
  }
  // build
  const item = pick(BUILDS[s.layout], rnd);
  return { ...base, item: item.id, target: circuitColumn(s.layout, item.build, s.pins), key: item.id };
}

export function ladderQuestion(task, step, seed, retry = 0) {
  const s = LADDERS[task][step];
  // A retry never repeats the question the student just got wrong (when there is another one to give).
  const prev = retry > 0 ? ladderQuestion(task, step, seed, retry - 1).key : null;
  let q;
  for (let t = 0; t < 40; t++) {
    q = makeQuestion(task, step, s, seededRandom(`${seed}|L${task}|${step}|${retry}|${t}`));
    if (q.key !== prev) return q;
  }
  return q;   // only one question at this step (e.g. the AND table)
}

export const buildItem = (layout, id) => BUILDS[layout].find(b => b.id === id);

// ── Marking ──
// d = { bits: { key: '0'|'1' }, slots: { key: value } }. Each checker returns { ok, results: { part: bool } }.
export function checkLadder(q, d) {
  const results = {};
  const bit = k => d.bits?.[k];
  const slot = k => d.slots?.[k];
  if (q.kind === 'situ' || q.kind === 'table') q.answers.forEach((a, k) => { results['q' + k] = bit('q' + k) === String(a); });
  if (['gap', 'name3', 'nameCircuit', 'whichGate'].includes(q.kind)) {
    const keys = q.kind === 'nameCircuit' ? slotIds(q.layout) : q.answers.map((_, k) => 's' + k);
    keys.forEach((k, i) => { results[k] = slot(k) === q.answers[i]; });
  }
  if (q.kind === 'trace') {
    for (let k = 0; k < q.Q.length; k++) {
      if (!q.giveP) results['P' + k] = bit('P' + k) === q.P[k];
      results['Q' + k] = bit('Q' + k) === q.Q[k];
    }
  }
  if (q.kind === 'build') {
    const col = circuitColumn(q.layout, d.slots || {}, q.pins);
    for (let k = 0; k < q.target.length; k++) results['r' + k] = !!col && col[k] === q.target[k];
  }
  return { ok: Object.values(results).every(Boolean), results };
}

// Answers in the wrong shape aren't marked wrong: the student is told what's missing and tries again.
export function shapeHint(q, d) {
  const bits = d.bits || {}, slots = d.slots || {};
  const set = k => bits[k] === '0' || bits[k] === '1';
  if (q.kind === 'situ' || q.kind === 'table') {
    if (q.answers.some((_, k) => !set('q' + k))) return 'Tap every output box to set it to 0 or 1 first.';
  }
  if (['gap', 'name3', 'whichGate'].includes(q.kind) && q.answers.some((_, k) => !slots['s' + k])) {
    return q.kind === 'gap' ? 'Drag a word into every gap first.' : 'Drag a name onto every one first.';
  }
  if (q.kind === 'nameCircuit' && slotIds(q.layout).some(g => !slots[g])) return 'Drag a name onto every gate first.';
  if (q.kind === 'trace') {
    const keys = Array.from({ length: q.Q.length }, (_, k) => [...(q.giveP ? [] : ['P' + k]), 'Q' + k]).flat();
    if (keys.some(k => !set(k))) return q.giveP ? 'Fill in every Q box first.' : 'Fill in every P and Q box first.';
  }
  if (q.kind === 'build') {
    if (slotIds(q.layout).some(g => !slots[g])) return 'Drag a gate into every box first.';
    if (q.pins && pinKeys(q.layout).some(k => !slots[k])) return 'Drag an input onto every empty input circle first.';
  }
  return '';
}

const rowText = r => r.join(' ');
// The last gate written with the first gate's output called P: "P AND B", "NOT P".
export function outWithP(id, build) {
  const L = LAYOUTS[id], ins = L.slots[L.out];
  const part = src => (src === 'g1' ? 'P' : src);
  return ins.length === 1 ? `NOT ${part(ins[0])}` : `${part(ins[0])} ${build[L.out]} ${part(ins[1])}`;
}
export function tableWorking(g) {
  return inputRows(arity(g)).map(([a, b]) => (g === 'NOT' ? `NOT ${a} = ${1 - a}` : `${a} ${g} ${b} = ${gate(g, a, b)}`)).join(', ') + '.';
}

export function workingFor(q) {
  if (q.kind === 'situ') {
    const sc = scenario(q.scenario);
    const lines = q.rows.map(([a, b], k) => (q.gate === 'NOT' ? `NOT ${a} = ${q.answers[k]}` : `${a} ${q.gate} ${b} = ${q.answers[k]}`));
    return `${RULES[q.gate]} ${lines.join(', ')}. So "${sc.q}" is 1 only on ${q.gate === 'NOT' ? 'the row where the input is 0' : q.gate === 'AND' ? 'a row with two 1s' : 'rows with at least one 1'}.`;
  }
  if (q.kind === 'gap') {
    return q.ids.map(id => {
      const g = scenarioGate(id);
      const why = g === 'AND' ? 'only one being yes wasn\'t enough' : g === 'OR' ? 'one being yes was enough' : 'it happened when the thing was not true';
      return `${scenario(id).q}: ${why}, so ${g}.`;
    }).join(' ');
  }
  if (q.kind === 'name3' || q.kind === 'nameCircuit') return GATE_NAMES.map(g => `${g}: ${SHAPES[g]}.`).join(' ');
  if (q.kind === 'table') return `${q.gate}: ${RULES[q.gate]} ${tableWorking(q.gate)}`;
  if (q.kind === 'whichGate') return q.order.map(g => `${gateColumn(g)} is ${g}`).join('; ') + `. ${RULES.AND} ${RULES.OR}`;
  if (q.kind === 'trace') {
    const L = LAYOUTS[q.layout];
    const rows = inputRows(L.inputs.length).map((r, k) => `${rowText(r)}: P = ${q.P[k]}, Q = ${q.Q[k]}`);
    return `P = ${exprString(q.layout, q.build, false, 'g1')}, then Q = ${outWithP(q.layout, q.build)}. ${rows.join('. ')}.`;
  }
  if (q.kind === 'build') {
    const it = buildItem(q.layout, q.item);
    return `One circuit that works: Q = ${exprString(q.layout, it.build, true)}. Its outputs, top to bottom: ${q.target}.`;
  }
  return '';
}

// Wait after a wrong answer (wrong answers in a row on this task: 1, 2, 3+), so guessing is slow.
export function cooldownSeconds(wrongInARow) {
  return [5, 10, 15][Math.min(Math.max(wrongInARow, 1), 3) - 1];
}

// ═══════════════ PLENARY (Task 6) ═══════════════
// MCQ item: { id, q, opts: [[key, text] ×4], a: correctKey, why }. Table item: fill in a circuit's output column.
export const PLENARY_LENGTH = 5;
export const PLENARY_POOL = [
  { id: 'and1', q: 'When is the output of an AND gate 1?', a: 'a', opts: [
    ['a', 'Only when both inputs are 1'], ['b', 'When there is at least one 1'],
    ['c', 'Only when both inputs are 0'], ['d', 'When the inputs are not the same']],
    why: 'AND gives 1 only when both inputs are 1. Any 0 makes the output 0.' },
  { id: 'or1', q: 'When is the output of an OR gate 1?', a: 'b', opts: [
    ['a', 'Only when both inputs are 1'], ['b', 'When there is at least one 1'],
    ['c', 'Only when both inputs are 0'], ['d', 'When the inputs are not the same']],
    why: 'OR gives 1 when the inputs have at least one 1, including when both are 1.' },
  { id: 'not1', q: 'What does a NOT gate do?', a: 'c', opts: [
    ['a', 'Gives 1 if both inputs are 1'], ['b', 'Always gives an output of 0'],
    ['c', 'Gives the opposite of its input'], ['d', 'Copies its input straight to the output']],
    why: 'NOT has one input and flips it: 1 becomes 0, and 0 becomes 1.' },
  { id: 'rows2', q: 'How many rows does a truth table for a 2-input gate have?', a: 'd', opts: [
    ['a', '2'], ['b', '3'], ['c', '8'], ['d', '4']],
    why: 'Two inputs give four combinations: 00, 01, 10 and 11, so 4 rows.' },
  { id: 'rowsnot', q: 'How many rows does the truth table for NOT have?', a: 'a', opts: [
    ['a', '2'], ['b', '1'], ['c', '4'], ['d', '3']],
    why: 'NOT has one input, which is 0 or 1, so 2 rows.' },
  { id: 'chain', q: 'In a circuit, where does the first gate\'s output go?', a: 'b', opts: [
    ['a', 'Back into the first gate'], ['b', 'Into the next gate as an input'],
    ['c', 'Nowhere: the circuit just throws it away'], ['d', 'Onto the end of the table']],
    why: 'In a circuit, one gate\'s output becomes the next gate\'s input.' },
  { id: 'tt', q: 'What does a truth table show?', a: 'c', opts: [
    ['a', 'Which gates are in the circuit'], ['b', 'How fast the circuit can work out answers'],
    ['c', 'The output for every input'], ['d', 'Only the inputs that give a 1']],
    why: 'A truth table shows the output for every input combination, one row each.' },
  { id: 'or11', q: 'What is 1 OR 1?', a: 'b', opts: [
    ['a', '0'], ['b', '1'], ['c', '2'], ['d', '11']],
    why: 'OR gives 1 when there is at least one 1, and here both are 1. It is logic, not adding.' },
];
export const plenaryQuestion = id => PLENARY_POOL.find(q => q.id === id);

export function optionOrder(item, seed, attempt) {
  return shuffled(item.opts.map(o => o[0]), seededRandom(`${seed}|${item.id}|${attempt}`));
}

// Plenary: 3 key-idea questions and 2 output columns (one gate shown as a symbol, one two-gate circuit), shuffled.
export function drawPlenary(seed, attempt) {
  const rnd = seededRandom(`${seed}|plenary|${attempt}`);
  const mcq = shuffled(PLENARY_POOL.map(q => q.id), rnd).slice(0, 3).map(id => ({ type: 'mcq', id }));
  const one = { type: 'tcol', layout: 'one', build: { g1: pick(['AND', 'OR'], rnd) } };
  const twoLayout = pick(['notIn', 'notOut'], rnd);
  const two = { type: 'tcol', layout: twoLayout, build: randomBuild(twoLayout, rnd) };
  return shuffled([...mcq, one, two], rnd);
}
export const tcolAnswer = item => circuitColumn(item.layout, item.build);

// ═══════════════ BINARY, HEX AND ADDING (Lessons 1–3, for Logic Rush) ═══════════════
// Copied from the Lesson 1–3 pages (activities keep their own logic).
export const HEADINGS4 = [8, 4, 2, 1];
export const HEADINGS8 = [128, 64, 32, 16, 8, 4, 2, 1];
export const HEX_DIGITS = '0123456789ABCDEF';
export const toBinary = (n, width = 0) => n.toString(2).padStart(width, '0');
export const toDenary = bits => [...String(bits)].reduce((sum, b) => sum * 2 + (b === '1' ? 1 : 0), 0);
export const hexDigit = n => HEX_DIGITS[n];
export const toHex = n => hexDigit(n >> 4) + hexDigit(n & 15);
const hi = n => n >> 4;
const lo = n => n & 15;
export const cleanBits = s => String(s ?? '').replace(/\s+/g, '');
export const cleanNumber = s => String(s ?? '').trim();
export const cleanHex = s => String(s ?? '').replace(/\s+/g, '').toUpperCase();
export const isBits = s => /^[01]+$/.test(s);
export const isHex = s => /^[0-9A-F]+$/.test(s);
export const ones = n => toBinary(n).split('').filter(b => b === '1').length;

function nibbleSum(n) {
  const parts = HEADINGS4.filter(h => n & h);
  if (!parts.length) return '0';
  return parts.length === 1 ? `${parts[0]}` : `${parts.join(' + ')} = ${n}`;
}
function nibbleWorking(n) {
  const tail = n >= 10 ? `, and ${n} is ${hexDigit(n)} in hex` : `, which is ${n} in hex too`;
  return `${toBinary(n, 4)}: ${nibbleSum(n)}${tail}.`;
}
function b2hWorking(n) {
  const b = toBinary(n, 8);
  const one = k => `${toBinary(k, 4)} = ${nibbleSum(k)}${k >= 10 ? ` = ${hexDigit(k)}` : ''}`;
  return `Split into ${b.slice(0, 4)} ${b.slice(4)}. ${one(hi(n))}. ${one(lo(n))}. Join: ${toHex(n)}.`;
}
function h2bWorking(n) {
  const one = k => {
    const d = k >= 10 ? `${hexDigit(k)} = ${k}` : `${k}`;
    const parts = HEADINGS4.filter(h => k & h);
    return `${d} = ${parts.length ? parts.join(' + ') : '0'} → ${toBinary(k, 4)}`;
  };
  return `${one(hi(n))}. ${one(lo(n))}. Join: ${toBinary(n, 8)}.`;
}

export function addColumns(a, b, width) {
  const A = toBinary(a, width), B = toBinary(b, width);
  const cols = new Array(width);
  let c = 0;
  for (let k = width - 1; k >= 0; k--) {
    const x = +A[k], y = +B[k], s = x + y + c;
    cols[k] = { x, y, c, write: s % 2 };
    c = s >> 1;
  }
  return { A, B, cols, final: c };
}
export const carryCount = (a, b, width) => {
  const r = addColumns(a, b, width);
  return r.cols.filter(col => col.c).length + r.final;
};
export const addAnswer = (a, b, width) => toBinary(a + b, a + b >= 1 << width ? width + 1 : width);
function addWorking(a, b, width) {
  const r = addColumns(a, b, width);
  const steps = [];
  for (let k = width - 1; k >= 0; k--) {
    const { x, y, c } = r.cols[k], s = x + y + c;
    const sum = `${[x, y, ...(c ? [c] : [])].join(' + ')} = ${s}`;
    steps.push(`${k === width - 1 ? 'Right column' : 'Next'}: ${sum}: write ${s % 2}${s >= 2 ? ', carry 1' : ''}`);
  }
  const fin = r.final ? ' The final carry becomes a new bit on the left.' : '';
  return `${steps.join('. ')}.${fin} Answer: ${addAnswer(a, b, width)} (${a} + ${b} = ${a + b}).`;
}
function b2dWorking(n, width) {
  const bits = toBinary(n, width);
  const used = (width === 8 ? HEADINGS8 : HEADINGS4).filter((_, k) => bits[k] === '1');
  return `${bits} has a 1 under ${used.join(', ')}. ${used.join(' + ')} = ${n}.`;
}
function d2bWorking(n, width) {
  let left = n;
  const steps = (width === 8 ? HEADINGS8 : HEADINGS4).map(h => {
    if (h <= left) { left -= h; return `${h} fits: 1, ${left} left`; }
    return `${h} doesn't fit: 0`;
  });
  return `${n}: ${steps.join('. ')}. So ${n} = ${toBinary(n, width)}.`;
}

// ═══════════════ TYPED QUESTIONS (Logic Rush) ═══════════════
// Logic: 'trio' three one-gate sums (3 bits), 'trio2' three two-gate sums, 'col' a gate's output column,
// 'col2' a two-gate circuit's output column, 'name' which gate made this column.
// Hex: 'nib2h', 'h2nib', 'b2h', 'h2b'. Adding: 'add4', 'add8'. Denary: 'b2d4', 'b2d8', 'd2b4', 'd2b8'.
export const LOGIC_TYPES = ['trio', 'trio2', 'col', 'col2', 'name'];
export const isLogic = t => LOGIC_TYPES.includes(t);
export const typeWidth = t => (t === 'nib2h' || t === 'h2nib' || t.endsWith('4') ? 4 : 8);
const isAdd = t => t.startsWith('add');

// One logic sum: { f: 'g', g, a, b } a single gate; 'notOf' NOT (a g b); 'notIn' (NOT a) g b; 'two' (a g b) g2 c.
export function sumValue(s) {
  if (s.f === 'g') return gate(s.g, s.a, s.b);
  if (s.f === 'notOf') return 1 - gate(s.g, s.a, s.b);
  if (s.f === 'notIn') return gate(s.g, 1 - s.a, s.b);
  return gate(s.g2, gate(s.g, s.a, s.b), s.c);
}
export function sumText(s) {
  if (s.f === 'g') return s.g === 'NOT' ? `NOT ${s.a}` : `${s.a} ${s.g} ${s.b}`;
  if (s.f === 'notOf') return `NOT (${s.a} ${s.g} ${s.b})`;
  if (s.f === 'notIn') return `(NOT ${s.a}) ${s.g} ${s.b}`;
  return `(${s.a} ${s.g} ${s.b}) ${s.g2} ${s.c}`;
}
function sumWorking(s) {
  const v = sumValue(s);
  if (s.f === 'g') return `${sumText(s)} = ${v}`;
  if (s.f === 'notOf') { const i = gate(s.g, s.a, s.b); return `${s.a} ${s.g} ${s.b} = ${i}, NOT ${i} = ${v}`; }
  if (s.f === 'notIn') return `NOT ${s.a} = ${1 - s.a}, ${1 - s.a} ${s.g} ${s.b} = ${v}`;
  const i = gate(s.g, s.a, s.b);
  return `${s.a} ${s.g} ${s.b} = ${i}, ${i} ${s.g2} ${s.c} = ${v}`;
}

export function itemAnswer(item) {
  const t = item.type, w = typeWidth(t);
  if (t === 'trio' || t === 'trio2') return item.sums.map(sumValue).join('');
  if (t === 'col') return gateColumn(item.g);
  if (t === 'col2') return circuitColumn(item.layout, item.build);
  if (t === 'name') return item.g;
  if (t === 'b2h') return toHex(item.n);
  if (t === 'nib2h') return hexDigit(item.n);
  if (isAdd(t)) return addAnswer(item.a, item.b, w);
  if (t.startsWith('b2d')) return String(item.n);
  return toBinary(item.n, w);   // h2b, h2nib, d2b
}
export function itemShown(item) {
  const t = item.type, w = typeWidth(t);
  if (t === 'trio' || t === 'trio2') return item.sums.map(sumText).join('  ·  ');
  if (t === 'col') return item.g === 'NOT' ? 'NOT A' : `A ${item.g} B`;
  if (t === 'col2') return exprString(item.layout, item.build);
  if (t === 'name') return `Q = ${gateColumn(item.g)}`;
  if (t === 'h2b') return toHex(item.n);
  if (t === 'h2nib') return hexDigit(item.n);
  if (isAdd(t)) return `${toBinary(item.a, w)} + ${toBinary(item.b, w)}`;
  if (t.startsWith('d2b')) return String(item.n);
  return toBinary(item.n, w);   // b2h, nib2h, b2d
}
export const toHexType = t => t === 'b2h' || t === 'nib2h';
// Rows in the question's table (column questions), so the page can draw A and B above the answer.
export function itemRows(item) {
  if (item.type === 'col' || item.type === 'name') return inputRows(arity(item.g));
  if (item.type === 'col2') return inputRows(LAYOUTS[item.layout].inputs.length);
  return null;
}

// 'ok' | 'wrong' | 'format'. A wrongly shaped answer (3 bits for a 4-row table, 115 for B5) isn't marked wrong.
export function checkTyped(item, text) {
  const t = item.type, want = itemAnswer(item);
  if (t === 'name') {
    const g = String(text ?? '').trim().toUpperCase();
    if (!GATE_NAMES.includes(g)) return 'format';
    return g === want ? 'ok' : 'wrong';
  }
  if (toHexType(t)) {
    const h = cleanHex(text);
    if (!isHex(h) || h.length !== want.length) return 'format';
    return h === want ? 'ok' : 'wrong';
  }
  if (t.startsWith('b2d')) {
    const d = cleanNumber(text);
    if (!/^\d+$/.test(d)) return 'format';
    return String(+d) === want ? 'ok' : 'wrong';
  }
  const b = cleanBits(text);
  if (isAdd(t)) {
    const w = typeWidth(t);
    if (!isBits(b) || b.length < w || b.length > w + 1) return 'format';
    return toDenary(b) === item.a + item.b ? 'ok' : 'wrong';
  }
  if (!isBits(b) || b.length !== want.length) return 'format';
  return b === want ? 'ok' : 'wrong';
}

export function formatHint(item) {
  const t = item.type, w = typeWidth(t);
  if (t === 'trio' || t === 'trio2') return 'Type 3 bits, one answer for each sum, left to right, like 101.';
  if (t === 'col' || t === 'col2') return `Type ${itemAnswer(item).length} bits: the output for each row, top to bottom.`;
  if (t === 'name') return 'Type the gate\'s name: AND, OR or NOT.';
  if (t === 'b2h') return 'Type two hex digits, one for each group of 4 bits (0–9 or A–F), like B5.';
  if (t === 'nib2h') return 'Type one hex digit: 0–9 or A–F.';
  if (t === 'h2b') return 'Type 8 bits (1s and 0s): 4 for each hex digit, leading 0s included.';
  if (isAdd(t)) return `Type the answer in bits (1s and 0s): ${w} bits, or ${w + 1} if there is a final carry.`;
  if (t.startsWith('b2d')) return 'Type a denary number, using the digits 0–9.';
  if (t.startsWith('d2b')) return `Type exactly ${w} bits: one 1 or 0 for each heading.`;
  return 'Type 4 bits (1s and 0s), leading 0s included.';
}

export function itemWorking(item) {
  const t = item.type, w = typeWidth(t);
  if (t === 'trio' || t === 'trio2') return item.sums.map(sumWorking).join('. ') + '.';
  if (t === 'col') return `${item.g}: ${RULES[item.g]} ${tableWorking(item.g)}`;
  if (t === 'col2') {
    const p = slotColumn(item.layout, item.build, 'g1');
    return `P = ${exprString(item.layout, item.build, false, 'g1')} gives ${p}. Then Q = ${outWithP(item.layout, item.build)} gives ${itemAnswer(item)}.`;
  }
  if (t === 'name') return `${gateColumn(item.g)} is ${item.g}: ${RULES[item.g]}`;
  if (t === 'b2h') return b2hWorking(item.n);
  if (t === 'h2b') return h2bWorking(item.n);
  if (t === 'nib2h') return nibbleWorking(item.n);
  if (isAdd(t)) return addWorking(item.a, item.b, w);
  if (t.startsWith('b2d')) return b2dWorking(item.n, w);
  if (t.startsWith('d2b')) return d2bWorking(item.n, w);
  const n = item.n, parts = HEADINGS4.filter(h => n & h);
  return `${n >= 10 ? `${hexDigit(n)} = ${n} = ` : `${n} = `}${parts.length ? parts.join(' + ') : '0'} → ${toBinary(n, 4)}.`;
}

// ═══════════════ LOGIC RUSH (extension game, not scored) ═══════════════
// The game builds over the unit: about the first two minutes are this lesson only, then the lessons before
// join in, newest first (hex, then binary adding, then binary ↔ denary), and the last level is all 8 bits.
// Questions get harder by question number, not score, so a class challenge code gives everyone the same run.
const pairs = (as, bs, keep) => as.flatMap(a => bs.filter(b => keep(a, b)).map(b => [a, b]));
const n4 = range(1, 15);
const busy4 = (a, b) => ones(a) + ones(b) >= 3;
const letterByte = n => lo(n) > 0 && (hi(n) >= 10 || lo(n) >= 10);
export const GAME_POOLS = {
  nibAny:    range(1, 15),
  anyLetter: range(16, 255).filter(letterByte),
  add4easy:  pairs(n4, n4, (a, b) => busy4(a, b) && a + b <= 15 && carryCount(a, b, 4) <= 1),
  add4:      pairs(n4, n4, (a, b) => busy4(a, b) && carryCount(a, b, 4) >= 2),
  add8:      pairs(range(20, 230), range(20, 230), (a, b) =>
               a + b <= 255 && ones(a) >= 3 && ones(b) >= 3 && carryCount(a, b, 8) >= 2 && carryCount(a, b, 8) <= 4),
  b2d4:      range(3, 15).filter(n => ones(n) >= 2),
  d2b4:      range(5, 14).filter(n => ones(n) >= 2),
  b2d8:      range(33, 120).filter(n => ones(n) >= 3 && ones(n) <= 5),
  d2b8:      range(20, 120).filter(n => ones(n) >= 3 && ones(n) <= 5),
};

// Seconds per question type.
export const TYPE_TIME = {
  name: 15, trio: 20, col: 20, trio2: 30, col2: 35,
  nib2h: 20, h2nib: 25, b2d4: 25, d2b4: 30, add4: 35,
  b2h: 35, h2b: 40, b2d8: 45, d2b8: 50, add8: 60,
};

// mix: 'type:pool' entries, one picked at random per question (an entry listed twice comes up twice as often).
// Level 1 opens with one of each logic kind in order. intro: the toast when the level starts.
export const GAME_LEVELS = [
  { from: 0,  name: 'Level 1', base: 100, opener: ['trio', 'col', 'name'],
    mix: ['trio', 'col', 'name', 'col'] },
  { from: 12, name: 'Level 2', base: 120, intro: 'Level 2: hex from last lesson joins in',
    mix: ['trio2', 'col', 'trio', 'nib2h:nibAny', 'h2nib:nibAny'] },
  { from: 20, name: 'Level 3', base: 150, intro: 'Level 3: binary adding joins in. Watch the carries!',
    mix: ['trio2', 'col2', 'nib2h:nibAny', 'h2nib:nibAny', 'add4:add4easy'] },
  { from: 28, name: 'Level 4', base: 180, intro: 'Level 4: binary ↔ denary joins in, and two-gate circuits',
    mix: ['col2', 'trio2', 'b2h:anyLetter', 'h2b:anyLetter', 'add4:add4', 'b2d4:b2d4', 'd2b4:d2b4'] },
  { from: 36, name: 'Level 5', base: 220, intro: 'Level 5: everything, 8 bits, and it speeds up',
    mix: ['col2', 'trio2', 'b2h:anyLetter', 'h2b:anyLetter', 'add8:add8', 'b2d8:b2d8', 'd2b8:d2b8'] },
];
export const GAME_LIVES = 3;

export function gameLevel(i) {
  let lvl = GAME_LEVELS[0];
  for (const l of GAME_LEVELS) if (i >= l.from) lvl = l;
  return lvl;
}

// Seconds for question i of this type. At the last level the time shrinks by 8% every 5 questions, to 60% at most.
export function gameTime(i, type) {
  const lvl = gameLevel(i), t = TYPE_TIME[type];
  if (lvl !== GAME_LEVELS.at(-1)) return t;
  return Math.round(t * Math.max(0.6, 1 - 0.08 * Math.floor((i - lvl.from) / 5)));
}

const bitPick = rnd => (rnd() < 0.5 ? 0 : 1);
function oneSum(rnd, two) {
  if (!two) {
    const g = pick(GATE_NAMES, rnd);
    return { f: 'g', g, a: bitPick(rnd), b: bitPick(rnd) };
  }
  return { f: pick(['notOf', 'notIn', 'two'], rnd), g: pick(['AND', 'OR'], rnd), g2: pick(['AND', 'OR'], rnd),
    a: bitPick(rnd), b: bitPick(rnd), c: bitPick(rnd) };
}
function logicItem(type, rnd) {
  if (type === 'trio' || type === 'trio2') {
    // Not all three answers the same, so "000" or "111" never works as a guess.
    for (;;) {
      const sums = [0, 1, 2].map(() => oneSum(rnd, type === 'trio2'));
      if (new Set(sums.map(sumValue)).size > 1) return { type, sums };
    }
  }
  if (type === 'col' || type === 'name') return { type, g: pick(GATE_NAMES, rnd) };
  const layout = pick(['notIn', 'notOut', 'three'], rnd);
  return { type, layout, build: randomBuild(layout, rnd) };
}

function rawQ(seed, i, salt) {
  const lvl = gameLevel(i);
  const rnd = seededRandom(`${seed}|rush|${i}|${salt}`);
  const entry = lvl.opener && i - lvl.from < lvl.opener.length ? lvl.opener[i - lvl.from] : pick(lvl.mix, rnd);
  const [type, pool] = entry.split(':');
  let q;
  if (isLogic(type)) q = logicItem(type, rnd);
  else {
    const v = pick(GAME_POOLS[pool], rnd);
    q = Array.isArray(v) ? { type, a: v[0], b: v[1], n: v[0] + v[1] } : { type, n: v };
  }
  return { i, ...q, level: lvl.name, time: gameTime(i, type) };
}

// Question i of a run. The same seed (a class code) always gives the same questions;
// two in a row are never the same kind of question.
export function gameQuestion(seed, i) {
  let prev = null;
  for (let k = 0; k <= i; k++) {
    for (let salt = 0; ; salt++) {
      const q = rawQ(seed, k, salt);
      if (!prev || q.type !== prev.type) { prev = q; break; }
    }
  }
  return prev;
}

// Streak multiplier: x1, then x2 from 3 in a row, x3 from 6, x4 from 10.
export function multiplier(streak) {
  if (streak >= 10) return 4;
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

// A right answer: the level's base points plus a speed bonus (up to the base again,
// in proportion to the time left), times the streak multiplier.
export function gamePoints(i, secondsLeft, limit, streak) {
  const { base } = gameLevel(i);
  const speed = Math.round(base * Math.max(0, Math.min(1, secondsLeft / limit)));
  return (base + speed) * multiplier(streak);
}

export const RANKS = [
  [0, 'Trainee'], [1000, 'Bit Flipper'], [3000, 'Gate Keeper'], [6000, 'Logic Hacker'],
  [12000, 'Circuit Ninja'], [25000, 'Logic Legend'], [50000, 'Logic Boss'],
];

export function rankFor(score) {
  let r = RANKS[0][1];
  for (const [min, name] of RANKS) if (score >= min) r = name;
  return r;
}

export const GAME_BADGES = [
  ['first',    '🎖 First Run',     'Finish a run'],
  ['streak5',  '🔥 On a Roll',     '5 right in a row'],
  ['streak10', '⚡ Unstoppable',   '10 right in a row'],
  ['hex',      '🔣 Hex Joins In',  'Reach Level 2, where hex joins in'],
  ['adder',    '➕ Carry On',      'Reach Level 3, where binary adding joins in'],
  ['unit',     '🧩 Whole Unit',    'Reach Level 5: everything, in 8 bits'],
  ['speed',    '🏎 Lightning',     '5 right in under 5 seconds each, in one run'],
  ['perfect',  '💎 Flawless 20',   'The first 20 questions all right'],
  ['score10k', '🏛 10,000 Club',   '10,000+ points in one run'],
];

// run = { played, maxStreak, fast, perfect, score }: the badges this run earned.
export function runBadges(run) {
  return {
    first: true,
    streak5: run.maxStreak >= 5,
    streak10: run.maxStreak >= 10,
    hex: run.played > GAME_LEVELS[1].from,
    adder: run.played > GAME_LEVELS[2].from,
    unit: run.played > GAME_LEVELS[4].from,
    speed: run.fast >= 5,
    perfect: run.played >= 20 && run.perfect,
    score10k: run.score >= 10000,
  };
}

// A class challenge code: letters and digits only, upper case, at most 8.
export const cleanCode = s => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

// ── Hover definitions ──
// [pattern, meaning]: the page dotted-underlines these words in task text and shows the meaning on hover, focus or tap.
// AND, OR and NOT are left out: their meaning would answer the questions. Meanings: plain words, 80 characters at most.
export const GLOSSARY = [
  ['truth tables?', 'A table that shows the output for every input combination.'],
  ['logic gates?|gates?', 'A part that takes inputs of 1 or 0 and gives one output.'],
  ['inputs?', 'A 1 or 0 that goes into a gate, like a switch being on or off.'],
  ['outputs?', 'The 1 or 0 that comes out of a gate.'],
  ['circuits?', 'Gates joined up, so one gate\'s output goes into the next gate.'],
  ['symbols?', 'The shape we draw to show which gate it is.'],
  ['sensor', 'A part that notices something, like movement, light or heat.'],
  ['binary', 'A number system with only two digits, 0 and 1. Computers use it.'],
  ['bits?', 'One binary digit: a 0 or a 1.'],
];
export function glossaryDef(word) {
  return GLOSSARY.find(([p]) => new RegExp(`^(?:${p})$`, 'i').test(word))?.[1];
}
// Questions that test what a word means, or that its meaning would answer: no definitions on these cards.
export const NO_GLOSS = ['tt', 'chain', 'rows2', 'rowsnot'];
