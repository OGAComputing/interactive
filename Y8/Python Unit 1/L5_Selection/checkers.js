// Validation logic for 1_Selection_PRIMM.html — binary selection with if/else, comparison
// operators, == vs =, and indentation. Builds on Lesson 4: every number arrives from input()
// as text and is cast with int() before it is compared.
//
// Checks are formative and accept any valid solution SHAPE (see feedback_checker_flexibility
// memory — there is always more than one way to solve a short programming task):
//   • a pass mark of "40 or more" may be written  score >= 40  or  score > 39
//   • "check for a fail first" may be written     score < 40,  score <= 39,  40 > score
//   • messages are the student's own words — they are found by RUNNING the program
// A decision has two paths, so one run can only ever prove half of it. Modify and Make run
// the program TWICE (or three times) with different test answers — one each side of the
// pass mark — and compare what each run printed. Lines that appear in only one run are that
// branch's message; lines that appear in every run are printed by code outside the if/else.

// Strip comments and string CONTENTS (leaving "" / '') so tokens inside strings
// (if, else, ==, <, input, print) can't trigger false positives.
export function normalise(code) {
  let s = code.replace(/#[^\n]*/g, '');
  s = s.replace(/"""[\s\S]*?"""/g, '""').replace(/'''[\s\S]*?'''/g, "''");
  s = s.replace(/"[^"\n]*"/g, '""').replace(/'[^'\n]*'/g, "''");
  return s;
}

export function has(code, pattern) {
  return pattern instanceof RegExp ? pattern.test(code) : code.includes(pattern);
}

// ── shared helpers ───────────────────────────────────────────────────────────

const inputCount = raw => (normalise(raw).match(/\binput\s*\(/g) || []).length;
const castCount  = raw => (normalise(raw).match(/\b(?:int|float)\s*\(/g) || []).length;

// Non-blank code lines (comments removed, strings blanked), keeping their indentation.
const codeLines = raw => normalise(raw).split('\n').filter(l => l.trim());
const indentOf  = line => line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
const leadOf    = line => line.match(/^[ \t]*/)[0];   // the exact whitespace — Python won't match a Tab with 4 spaces
const COMPARISON = /==|!=|<=|>=|<|>/;
const isIfLine   = l => /^\s*if\b.*:\s*$/.test(l);
const isElseLine = l => /^\s*else\s*:\s*$/.test(l);

// Every if line that has an else lined up underneath it (same indent, later on).
function ifElsePairs(raw) {
  const lines = codeLines(raw);
  const pairs = [];
  lines.forEach((l, i) => {
    if (!isIfLine(l)) return;
    const ind = indentOf(l);
    for (let j = i + 1; j < lines.length; j++) {
      const lj = lines[j];
      if (indentOf(lj) < ind) break;
      if (indentOf(lj) === ind) {
        if (isElseLine(lj)) pairs.push({ ifLine: l, ifIdx: i, elseIdx: j });
        if (!/^\s*elif\b/.test(lj) && !isElseLine(lj)) break;   // a new statement ends the if
        if (isElseLine(lj)) break;
      }
    }
  });
  return pairs;
}

// What a run printed, as trimmed message lines, without the echoed "prompt + typed answer"
// lines the input() mock adds (e.g. "Enter your score: 40").
function msgLines(output, typed = []) {
  return (output || '').split('\n').map(l => l.trim()).filter(Boolean).filter(l =>
    !typed.some(v => l === v || (l.endsWith(v) && /[:?>\-]\s*$/.test(l.slice(0, -v.length)))));
}

// Lines printed in run A but not run B, and vice versa — each branch's own message(s).
function branchDiff(a, b) {
  const la = msgLines(a.out, a.inputs), lb = msgLines(b.out, b.inputs);
  return { aOnly: la.filter(l => !lb.includes(l)), bOnly: lb.filter(l => !la.includes(l)), la, lb };
}

const says = (lines, re) => lines.some(l => re.test(l));
const PASS_WORD = /\bpass(ed)?\b/i;
const FAIL_WORD = /\bfail(ed)?\b/i;
const isBareWord = (lines, word) => lines.some(l => new RegExp('^' + word + '[.!]*$', 'i').test(l));

function evalReqs(check, raw, ctx) {
  const results = check.reqs.map(r => !!r.test(raw, ctx));
  const pass = results.every(Boolean);
  const bad = results.findIndex(r => !r);
  const hint = pass ? check.passMsg : check.reqs[bad].hint;
  return { results, pass, msg: typeof hint === 'function' ? hint(raw, ctx) : hint };
}

// ── Investigate checks ────────────────────────────────────────────────────────
// One req per CODE-CHANGE bullet in each Investigate prompt card (#req_i_N in the HTML),
// ticked/crossed live and required before that step's "Check answer" will pass.
// test(raw, ctx) — ctx describes what the student has done at this step:
//   ctx.breaks    "😈 Break it" presses at this step
//   ctx.fixes     break → fix → successful run cycles completed at this step
//   ctx.lastRun   { code, ok } — the last Run of the Investigate editor (any step)

// The standard bug-pair line. Indentation is the misconception: a line that is NOT inside
// an if/else must not be indented, so appending it indented after the final unindented
// print() gives "IndentationError: unexpected indent". The fix is to remove the spaces —
// deleting the line does not count. Matched loosely (quote style, optional "!").
export const IBUG_LINE       = '    print("Goodbye!")';
export const IBUG_FIXED_LINE = 'print("Goodbye!")';
const BUG_RE    = /^[ \t]+print\s*\(\s*(["'])Goodbye!?\1\s*\)\s*$/i;
const FIXED_RE  = /^print\s*\(\s*(["'])Goodbye!?\1\s*\)\s*$/i;
const TARGET_RE = /^\s*print\s*\(.*goodbye/i;
const liveLines = raw => raw.split('\n').filter(l => !/^\s*#/.test(l));   // commented-out lines don't count
export const hasBugLine    = raw => liveLines(raw).some(l => BUG_RE.test(l));
export const hasFixedLine  = raw => liveLines(raw).some(l => FIXED_RE.test(l));
export const isBugPairLine = line => BUG_RE.test(line) || FIXED_RE.test(line);
export const isBugFixed    = raw => hasFixedLine(raw) && !hasBugLine(raw);

// "😈 Break it": re-indents the student's Goodbye line in place (appending it if there is
// none) and leaves an already-broken line alone — safe to mash. Returns the new code and
// the 1-based line number of the broken line.
export function breakCode(raw) {
  const body = raw.replace(/\s+$/, '');
  const lines = body ? body.split('\n') : [];
  let i = lines.findIndex(l => BUG_RE.test(l));
  if (i === -1) {
    i = lines.findIndex(l => !/^\s*#/.test(l) && TARGET_RE.test(l));
    if (i === -1) i = lines.push('') - 1;
    lines[i] = IBUG_LINE;
  }
  return { code: lines.join('\n') + '\n', lineNo: i + 1 };
}

const ranAsIs = (raw, ctx) => !!ctx.lastRun?.ok && ctx.lastRun.code.trim() === raw.trim();
const fixedAndRun = (raw, ctx) => isBugFixed(raw) && ranAsIs(raw, ctx);

// Why the "fix it" bullet is crossed — including the student who deletes the broken line
// instead of fixing it, and the one who tucks it inside the else so it runs (a near-miss).
function fixHint(raw, ctx) {
  if (!ctx.breaks) return 'Press 😈 Break it first to add the broken line.';
  if (hasBugLine(raw)) {
    return ranAsIs(raw, ctx)
      ? 'Nearly! That runs, but print("Goodbye!") is still indented, so it now belongs to the if/else and only shows sometimes. Take away ALL the spaces in front of it so it lines up with print("Thanks for playing!")'
      : 'Fix the broken line: take away the spaces in front of print("Goodbye!") so it starts at the very left edge';
  }
  if (!hasFixedLine(raw)) return 'The Goodbye line has gone — don\'t delete it, fix it! Press 😈 Break it to bring it back, then take away the spaces in front of it';
  return 'Now press ▶ Run code to check your fix works.';
}

// Where things sit in the student's if/else, on RAW lines (so blank lines count — step 2's
// first bullet is "make an empty line"). Comment lines are skipped when searching.
//   ifIdx    the first if line          passIdx  the first line after it (print("Pass"))
//   elseIdx  the else: after that       newIdx   another print() between if and else, or -1
// null if there is no if … else to work with.
function ifGeometry(raw) {
  const lines = raw.split('\n');
  const live = i => lines[i].trim() && !/^\s*#/.test(lines[i]);
  const ifIdx = lines.findIndex((l, i) => live(i) && /^\s*if\b.*:\s*(#.*)?$/.test(l));
  if (ifIdx === -1) return null;
  let passIdx = -1;
  for (let i = ifIdx + 1; i < lines.length; i++) if (live(i)) { passIdx = i; break; }
  if (passIdx === -1 || /^\s*else\s*:/.test(lines[passIdx])) return null;
  const elseIdx = lines.findIndex((l, i) => i > passIdx && /^\s*else\s*:/.test(l));
  if (elseIdx === -1) return null;
  let newIdx = -1;
  for (let i = ifIdx + 1; i < elseIdx; i++) if (i !== passIdx && live(i) && /\bprint\s*\(/.test(lines[i])) { newIdx = i; break; }
  return { lines, ifIdx, passIdx, elseIdx, newIdx };
}

// Step 2, bullet 2 — says exactly where the student's Well done line has ended up.
function wellDoneWhereHint(raw) {
  const g = ifGeometry(raw);
  if (!g) return 'Keep the if / else from the starting code — line 2 should still start with if, with else: further down';
  const where = g.lines.findIndex(l => !/^\s*#/.test(l) && /print\s*\(.*well\s*done/i.test(l));
  const goes = 'Move it up so it sits between print("Pass") and else:';
  if (where === -1) return 'On your new empty line, type print("Well done!")';
  if (where < g.ifIdx) return 'Your print("Well done!") is above the if. Move it down so it sits between print("Pass") and else:';
  if (where > g.elseIdx) {
    return indentOf(g.lines[where]) > 0
      ? 'Your print("Well done!") is under the else, so it would only show for a Fail. ' + goes
      : 'Your print("Well done!") is at the bottom, outside the if/else, so it would show every time. ' + goes;
  }
  return 'Type print("Well done!") on the new line between print("Pass") and else:';
}

export const INV_CHECKS = {
  // Step 1 — the pass mark becomes 70.
  inv1: {
    reqs: [
      {
        hint: 'Change the 50 on line 2 to 70, so it reads: if score >= 70:',
        test: raw => codeLines(raw).some(l => isIfLine(l) && /\b70\b/.test(l) && COMPARISON.test(l)),
      },
    ],
  },
  // Step 2 — a second line inside the if block. Indentation is where students get stuck, so
  // the one change is split into three bullets that tick live, in the order they happen:
  // make a new line in the right place → type the print() on it → line it up with Tab.
  // Each hint names the exact problem (inside the else, at the bottom, 2 spaces not 4 …).
  inv2: {
    reqs: [
      {
        hint: 'Click at the very end of line 3 — just after print("Pass") — and press Enter to make a new, empty line underneath it',
        test: raw => { const g = ifGeometry(raw); return !!g && g.elseIdx - g.passIdx > 1; },
      },
      {
        hint: wellDoneWhereHint,
        test: raw => { const g = ifGeometry(raw); return !!g && g.newIdx !== -1; },
        // typed, but somewhere other than inside the if (under the else, at the bottom …)
        wrong: raw => {
          const g = ifGeometry(raw);
          return !!g && g.newIdx === -1 && g.lines.some(l => !/^\s*#/.test(l) && /print\s*\(.*well\s*done/i.test(l));
        },
      },
      {
        hint: raw => {
          const g = ifGeometry(raw);
          if (!g || g.newIdx === -1) return 'Once print("Well done!") is in place, press Tab at the start of it so it lines up with print("Pass")';
          const have = indentOf(g.lines[g.newIdx]), want = indentOf(g.lines[g.passIdx]);
          if (have === want) return 'Your new line mixes a Tab character with spaces, which Python can\'t match up. Delete the gap at the start of the line and press Tab once';
          if (have === 0) return 'Your new line starts at the left edge, so Python thinks the if has already finished. Click at the very start of the line and press Tab once';
          if (have < want) return `Your new line has ${have} space${have === 1 ? '' : 's'} in front; print("Pass") has ${want}. They must match exactly — click at the start of the line and add ${want - have} more`;
          return `Your new line has ${have} spaces in front; print("Pass") has ${want}. Too many — click at the start of the line and press Shift+Tab to take 4 away`;
        },
        test: raw => {
          const g = ifGeometry(raw);
          return !!g && g.newIdx !== -1 && leadOf(g.lines[g.newIdx]) === leadOf(g.lines[g.passIdx]);
        },
        // in place, but its spaces don't match print("Pass")
        wrong: raw => {
          const g = ifGeometry(raw);
          return !!g && g.newIdx !== -1 && leadOf(g.lines[g.newIdx]) !== leadOf(g.lines[g.passIdx]);
        },
      },
    ],
  },
  // Step 3 — == instead of >= (after meeting the error a single = gives).
  inv3: {
    reqs: [
      {
        hint: raw => codeLines(raw).some(l => isIfLine(l) && /[^=!<>]=[^=]/.test(l))
          ? 'A single = means "store", so Python gives an error. Use TWO equals signs to compare: if score == 70:'
          : 'Change the comparison on line 2 to == (two equals signs), so it reads: if score == 70:',
        test: raw => codeLines(raw).some(l => isIfLine(l) && /[^=!<>]==[^=]/.test(l) && /\b70\b/.test(l)),
      },
    ],
  },
  // Step 4 — the standard bug step: indentation.
  inv4: {
    reqs: [
      { hint: 'Press 😈 Break it to add the broken line.', test: (raw, ctx) => ctx.breaks >= 1 },
      { hint: fixHint, test: (raw, ctx) => ctx.breaks >= 1 && fixedAndRun(raw, ctx) },
    ],
  },
};

// Runs every req for Investigate step n (1-based). ctx fields default to "nothing done".
// A req may also have wrong(raw, ctx): true when the student has made a definite MISTAKE on
// that bullet (not just "not done yet"). The page shows those as live red crosses, and
// wrongMsg is the first such bullet's hint, so the live coach names the mistake first.
export function evalInv(n, raw, ctx = {}) {
  const c = { breaks: 0, fixes: 0, lastRun: null, ...ctx };
  const reqs = INV_CHECKS['inv' + n]?.reqs || [];
  const results = reqs.map(r => !!r.test(raw, c));
  const wrongs = reqs.map((r, i) => !results[i] && !!r.wrong?.(raw, c));
  const resolve = i => { const h = i === -1 ? null : reqs[i].hint; return typeof h === 'function' ? h(raw, c) : h; };
  const bad = results.findIndex(r => !r);
  return { results, wrongs, pass: bad === -1, msg: resolve(bad), wrongMsg: resolve(wrongs.findIndex(Boolean)) };
}

// ── Modify checks ─────────────────────────────────────────────────────────────
// Modify starts from the original starter program (pass mark 50, Pass / Fail, then
// "Thanks for playing!"). Each mod is run TWICE with MOD_TESTS[mod] — run A, then run B —
// and test(raw, ctx) gets ctx = { aOnly, bOnly, la, lb } from branchDiff(): the message
// lines only run A printed, only run B printed, and everything each run printed.
//
// Runs A and B sit either side of the new pass mark (40 passes, 39 fails), so a working
// if/else MUST print something different in each run.

export const MOD_TESTS = {
  mod1: [['40'], ['39']],
  mod2: [['40'], ['39']],
  mod3: [['40'], ['39']],
  // Same score both times — only the new yes/no question changes, so any difference
  // between the runs comes from the student's second decision.
  mod4: [['40', 'yes'], ['40', 'no']],
};
export const MOD_TEST_NOTES = {
  mod1: 'a score of 40, then 39',
  mod2: 'a score of 40, then 39',
  mod3: 'a score of 40, then 39',
  mod4: 'a score of 40 and "yes", then 40 and "no"',
};

const passFailWorks = (raw, c) => says(c.aOnly, PASS_WORD) && says(c.bOnly, FAIL_WORD);
// The first if compares with "40 or less" (score <= 40, or 40 >= score) — exactly 40 would fail.
const hasLe40 = raw => /<=\s*40\b|\b40\s*>=/.test(codeLines(raw).find(isIfLine) || '');

export const MOD_CHECKS = {
  // Mod 1 — a new pass mark. Behaviour only: >= 40 and > 39 are both right.
  mod1: {
    reqs: [
      {
        hint: (raw, c) => !c.aOnly.length && !c.bOnly.length
          ? '❌ 40 and 39 both printed the same thing. Change the number in your if so that 40 or more passes — e.g. if score >= 40:'
          : '❌ Tested with 40 (should print Pass) and 39 (should print Fail). Check your comparison: >= means "40 or more" — e.g. if score >= 40:',
        test: passFailWorks,
      },
    ],
    passMsg: '✅ Spot on — 40 takes the if path, 39 takes the else path. Changing one number moved the line between them.',
  },

  // Mod 2 — flip the comparison: check for a FAIL first, behaviour unchanged.
  mod2: {
    reqs: [
      {
        hint: '❌ Change the comparison so the if checks for a FAIL first — use < instead of >= , e.g. if score < 40:',
        test(raw) {
          const first = codeLines(raw).find(isIfLine) || '';
          return /<(?!<)/.test(first) || /\b\d+\s*>=?/.test(first) || /\bnot\b/.test(first);
        },
      },
      {
        // Checked on its own: <= 40 means "40 or less", so exactly 40 would fail. Code-based,
        // so <= 39 (also correct) still passes.
        hint: '❌ <= means "40 or less", so a score of exactly 40 would FAIL. Use < so only 39 and below fail — e.g. if score < 40:',
        test: raw => !hasLe40(raw),
      },
      {
        hint: (raw, c) => says(c.la, FAIL_WORD)
          ? '❌ Now 40 prints Fail! Your if checks for a fail, so print("Fail") must move up under the if — and print("Pass") down under the else'
          : '❌ The program should still work the same: 40 prints Pass and 39 prints Fail. Swap your two print() messages over',
        // Are the messages in the right branches? 39 must print Fail. 40 must print Pass too —
        // unless the comparison is <= 40, which the bullet above already flags, so a <= slip
        // doesn't also cross out a swap the student has done correctly.
        test: (raw, c) => says(c.lb, FAIL_WORD) && !says(c.lb, PASS_WORD) &&
          (hasLe40(raw) || (says(c.la, PASS_WORD) && !says(c.la, FAIL_WORD))),
      },
    ],
    passMsg: '✅ Same behaviour, different code — the if checks for a fail now, so the messages had to swap places.',
  },

  // Mod 3 — the student's own messages. Whatever they write, 40 and 39 must still differ.
  mod3: {
    reqs: [
      {
        hint: (raw, c) => !c.aOnly.length
          ? '❌ 40 and 39 printed the same thing — make sure each path still has its own print() message'
          : '❌ Change the PASS message (the one a score of 40 gets) to your own words — e.g. "Well done, you passed!"',
        test: (raw, c) => c.aOnly.length > 0 && !isBareWord(c.aOnly, 'pass'),
      },
      {
        hint: (raw, c) => !c.bOnly.length
          ? '❌ 40 and 39 printed the same thing — make sure each path still has its own print() message'
          : '❌ Change the FAIL message (the one a score of 39 gets) to your own words — e.g. "Unlucky — try again!"',
        test: (raw, c) => c.bOnly.length > 0 && !isBareWord(c.bOnly, 'fail'),
      },
    ],
    passMsg: '✅ Your own messages, and each score still gets the right one.',
  },

  // Mod 4 — a second, separate if/else that uses == on a typed answer.
  mod4: {
    reqs: [
      {
        hint: '❌ At the END of your program, ask a second question with input() — e.g. revised = input("Did you revise? ")',
        test: raw => inputCount(raw) >= 2,
      },
      {
        hint: '❌ Add a new if/else underneath that uses == to check the answer — e.g. if revised == "yes":  then an else: lined up with it',
        test: raw => ifElsePairs(raw).length >= 2 && ifElsePairs(raw).some(p => /==/.test(p.ifLine)),
      },
      {
        hint: '❌ Tested with "yes" then "no" (lowercase) — each answer should print a different message. Check you compared with "yes" in lowercase, and put a print() under both the if and the else',
        test: (raw, c) => c.aOnly.length > 0 && c.bOnly.length > 0,
      },
    ],
    passMsg: '✅ Two separate decisions in one program — and == compared the typed answer with "yes" exactly.',
  },
};

// outputs: [runA output, runB output], made with MOD_TESTS[checkKey].
export function evalMod(checkKey, raw, outputs = ['', '']) {
  const [ia, ib] = MOD_TESTS[checkKey];
  const ctx = branchDiff({ out: outputs[0], inputs: ia }, { out: outputs[1], inputs: ib });
  return evalReqs(MOD_CHECKS[checkKey], raw, ctx);
}

// ── Make ────────────────────────────────────────────────────────────────────
// A rollercoaster height checker — 120 cm or more can ride. Run three times: 120 and 200
// (both can ride) and 119 (too short). 200 catches `== 120`; 120 catches `> 120`.

export const MAKE_TESTS = [['120'], ['119'], ['200']];

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Ask for the height with input() and cast it with int() — e.g. height = int(input("How tall are you in cm? "))',
      test: raw => inputCount(raw) >= 1 && castCount(raw) >= 1,
    },
    {
      hint: '❌ Use an if with a comparison, then an else: lined up underneath it — e.g. if height >= 120:',
      test: raw => ifElsePairs(raw).some(p => COMPARISON.test(p.ifLine)),
    },
    {
      hint: (raw, c) => c.same120_200 && !c.diff120_119
        ? '❌ 120 and 119 printed the same thing — 120 should be allowed on, 119 should not. Check your comparison: >= means "120 or more"'
        : '❌ Tested with 120, 200 and 119: 120 and 200 should both get the "you can ride" message, and 119 a different one — e.g. if height >= 120:',
      test: (raw, c) => c.same120_200 && c.diff120_119,
    },
    {
      hint: '❌ After the whole if/else, add one print() with NO indent so it shows for everyone — e.g. print("Enjoy the park!")',
      test: (raw, c) => {
        const lines = codeLines(raw);
        const pairs = ifElsePairs(raw);
        if (!pairs.length || !c.common.length) return false;
        const last = pairs[pairs.length - 1];
        return lines.slice(last.elseIdx + 1).some(l => indentOf(l) <= indentOf(last.ifLine) && /\bprint\s*\(/.test(l));
      },
    },
  ],
  passMsg: '✅ Your first program that makes a real decision — and it gets the 120 cm edge case exactly right!',
};

// outputs: [run 120, run 119, run 200], made with MAKE_TESTS.
// The typed height is masked to # so a message that repeats it ("120cm — you can ride!")
// still counts as the same message for 120 and 200.
export function evalMake(raw, outputs = ['', '', '']) {
  const [m120, m119, m200] = outputs.map((o, i) => {
    const h = MAKE_TESTS[i][0];
    return msgLines(o, MAKE_TESTS[i]).map(l => l.split(h).join('#'));
  });
  const key = ls => ls.join('\n');
  const ctx = {
    same120_200: m120.length > 0 && key(m120) === key(m200),
    diff120_119: key(m120) !== key(m119) && m119.length > 0,
    common: m120.filter(l => m119.includes(l) && m200.includes(l)),
  };
  return evalReqs(MAKE_CHECK, raw, ctx);
}

// ── Extension ────────────────────────────────────────────────────────────────
// Design your own decision program. The student's own questions mean the answers can't be
// predicted, so the code runs interactively and is checked on shape only.

export const EXT_CHECK = {
  reqs: [
    {
      hint: '❌ Ask at least 2 questions with input(), each stored in its own variable.',
      test: raw => inputCount(raw) >= 2,
    },
    {
      hint: '❌ Make at least 2 separate decisions — each one an if with its own else: lined up underneath.',
      test: raw => ifElsePairs(raw).length >= 2,
    },
    {
      hint: '❌ Use == in at least one if to check for an exact answer — e.g. if answer == "Paris":',
      test: raw => ifElsePairs(raw).some(p => /==/.test(p.ifLine)),
    },
  ],
  passMsg: '🏆 Superb — your own program that asks, decides and answers back. That is real programming!',
};

export function evalExt(raw) {
  return evalReqs(EXT_CHECK, raw, {});
}
