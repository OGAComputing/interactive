// Pure validation logic — no DOM access. Imported by PRIMM.html and checkers.test.js.

export function normalise(code) {
  let s = code.replace(/#[^\n]*/g, '');
  s = s.replace(/"""[\s\S]*?"""/g, '""');
  s = s.replace(/"[^"\n]*"/g, '"…"');
  s = s.replace(/'[^'\n]*'/g, '"…"');
  return s.toLowerCase().replace(/\s+/g, ' ');
}

export function has(code, pattern) {
  return pattern instanceof RegExp ? pattern.test(code) : code.includes(pattern);
}

// Mock inputs to inject when running each modification step via pyodide.
// mod1–mod3 accumulate inputs; mod4 adds a favourite number.
export const MOD_INPUTS = {
  mod1: ['Alice', '13'],
  mod2: ['Alice', '2013'],
  mod3: ['Alice', '2013', '165'],
  mod4: ['Alice', '2013', '165', '7'],
};

// ── Modify checks ─────────────────────────────────────────────────────────────
//
// Each mod is a list of independent, individually-detected `reqs` — one per
// bullet point shown in the task card (the bullet TEXT lives in the HTML, not
// here — reqs only carry the pass/fail logic). The UI ticks/crosses each
// bullet on every Check click (see renderReqResults() in the activity's inline
// script). `pass` (all reqs true) and `hint` (the first failing req's message,
// shown in the feedback box) are derived automatically — see evalMod() below.

export const MOD_CHECKS = {
  mod1: {
    reqs: [
      {
        hint: '❌ Change the greeting to say "Nice to meet you, [name]!" — the original "Hello," is still there.',
        test(raw) { return has(raw, /nice to meet you/i); },
      },
      {
        hint: '❌ Keep int(input()) for the age input — don\'t remove the casting.',
        test(raw) { return has(normalise(raw), 'int(input'); },
      },
    ],
    passMsg: '✅ Greeting updated — "Nice to meet you" in place!',
  },

  // Mod 2 — bullet 1 combines "ask for birth year with int()" and "calculate age
  // with subtraction" into ONE requirement. They used to be two separate checks,
  // but the age-calculation half was gated on the loose pattern /\d{4}\s*-/,
  // which the UNCHANGED starter line (year = 2026 - age) already satisfies before
  // the student edits anything for this mod — so it would tick green immediately.
  // Anchoring the pattern to an assignment INTO age (age = 2026 - ...), which the
  // starter never does, closes that gap; keeping it paired with the int(input(
  // check in one req (rather than 2 separate, one of which was already-loophole-
  // prone) avoids a misleading lone green tick before real progress is made.
  mod2: {
    reqs: [
      {
        hint: '❌ Ask for the birth year using int(input(...)), then calculate the age with something like: age = 2026 - year (subtract the birth year from the current year).',
        test(raw) {
          const c = normalise(raw);
          return has(c, 'int(input') && /\bage\s*=\s*\d{4}\s*-/.test(c);
        },
      },
      {
        hint: '❌ Update the print statement to show the calculated age — for example: print("You are " + str(age) + " years old.")',
        test(raw) {
          const c = normalise(raw);
          return has(c, /print.*age/) || has(c, /str\s*\(\s*age/);
        },
      },
    ],
    passMsg: '✅ Birth year input, age calculation, and age output — excellent!',
  },

  mod3: {
    reqs: [
      {
        hint: '❌ Add a height input using float(input(...)) — float() handles decimal centimetre values.',
        test(raw) { return has(normalise(raw), 'float(input'); },
      },
      {
        hint: '❌ Convert to metres by dividing by 100: height_m = height_cm / 100.',
        test(raw) {
          const c = normalise(raw);
          return has(c, /\/\s*100/) || has(c, /\*\s*0\.01/);
        },
      },
    ],
    passMsg: '✅ Height input with float() and metres conversion — great!',
  },

  // Mod 4 — bullet 1 requires 4 input() calls, not the original 3. By the time a
  // student reaches mod4 they already have 3 inputs from mods 1–3 (name, birth
  // year, height) purely by carrying that code forward, so a "3 or more" gate
  // ticked green with zero mod4-specific work. Requiring 4 makes the favourite-
  // number input (this mod's actual new ask) the thing that closes the gap.
  mod4: {
    reqs: [
      {
        hint: '❌ You need at least 4 input() calls in total now — name, birth year, height and a favourite number.',
        test(raw) {
          const c = normalise(raw);
          return (c.match(/input\s*\(/g) || []).length >= 4;
        },
      },
      {
        hint: '❌ Print name, age and favourite number together in one message — use + to join them (with str()) or commas inside print().',
        test(raw) {
          const c = normalise(raw);
          const hasStr = has(c, 'str(');
          const hasFString = has(raw, /f["']/);
          const printLines = raw.split('\n').filter(l => /^\s*print\s*\(/.test(l));
          const hasCombined = printLines.some(l => {
            const n = normalise(l);
            return (n.match(/\+/g) || []).length >= 2 || (n.match(/,/g) || []).length >= 2;
          });
          return hasStr || hasFString || hasCombined;
        },
      },
    ],
    passMsg: '✅ All your inputs collected and printed in one combined message — well done!',
  },
};

// Runs every req for a given mod against `raw`, returning per-bullet results
// plus the overall pass/hint the check button needs.
export function evalMod(checkKey, raw) {
  const check = MOD_CHECKS[checkKey];
  const results = check.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? check.passMsg : check.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

// ── Make ────────────────────────────────────────────────────────────────────
// Built from a blank editor (no starter code carried over), so unlike Modify
// there is no risk of a leftover line satisfying a req before the student
// writes anything — each req can be split out independently.

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Call input() to ask the user for something.',
      test(raw) { return has(normalise(raw), 'input('); },
    },
    {
      hint: '❌ Use int() or float() to convert a number input.',
      test(raw) {
        const c = normalise(raw);
        return has(c, 'float(') || has(c, 'int(');
      },
    },
    {
      hint: '❌ Include a calculation, e.g. * 9 / 5 + 32 or price * quantity.',
      test(raw) {
        // Strip string literals before looking for arithmetic so prompt text doesn't trigger it
        const noStrings = raw.replace(/"[^"\n]*"/g, '""').replace(/'[^'\n]*'/g, '""');
        return /[+\-*\/]/.test(noStrings.replace(/input\s*\([^)]*\)/g, '').replace(/print\s*\(/g, ''));
      },
    },
    {
      hint: '❌ Use print() to show the result.',
      test(raw) { return has(normalise(raw), 'print('); },
    },
  ],
  passMsg: '✅ Program complete — all requirements met. Well done!',
};

export function evalMake(raw) {
  const results = MAKE_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? MAKE_CHECK.passMsg : MAKE_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

// ── Extension ─────────────────────────────────────────────────────────────────
// Reuses the Make editor/program, so the two-numbers-cast-with-int/float check
// alone is NOT split into its own bullet: a completed Make solution (e.g. the
// Price Calculator challenge, which already asks for price as float() and
// quantity as int()) can already have two casted numeric inputs before the
// student does any extension-specific work, which would tick that bullet green
// immediately on arriving at this step. Keeping "two number inputs" and "all
// four operations" as ONE combined requirement (as the original single-message
// validateExt already effectively required both together) means the bullet only
// goes green once the genuinely new part — all four operations on separate
// lines — is actually present.

export const EXT_CHECK = {
  reqs: [
    {
      hint: '❌ Ask for two numbers using int() or float(), then print their sum, difference, product and division — all four operations, one per line.',
      test(raw) {
        const c = normalise(raw);
        const numInputs = (c.match(/(?:int|float)\s*\(\s*input/g) || []).length;
        if (numInputs < 2) return false;
        const noStrings = raw.replace(/"[^"\n]*"/g, '""').replace(/'[^'\n]*'/g, '""');
        const calc = noStrings.replace(/input\s*\([^)]*\)/g, '').replace(/print\s*\(/g, '');
        const ops = [/\+/.test(calc), /-/.test(calc), /\*/.test(calc), /\//.test(calc)].filter(Boolean).length;
        return ops >= 4;
      },
    },
  ],
  passMsg: '✅ Extension complete — all four operations printed. Excellent!',
};

export function evalExt(raw) {
  const results = EXT_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? EXT_CHECK.passMsg : EXT_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}
