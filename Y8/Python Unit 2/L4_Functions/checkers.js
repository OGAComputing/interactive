// Pure validation logic — no DOM access. Imported by 1_Functions.html and checkers.test.js.

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

// Both function still defined AND still printing something — a shared sanity
// floor used by mod2's two message-change reqs (see hasHelloStructure below).
function hasHelloStructure(raw) {
  const c = normalise(raw);
  return (has(c, 'def hello') || has(c, 'def greet')) && has(c, 'print(');
}

// Each mod is a list of independent, individually-detected `reqs` — one per
// bullet point shown in the task card (the bullet TEXT lives in the HTML, not
// here — reqs only carry the pass/fail logic). The UI ticks/crosses each
// bullet on every Check click (see renderReqResults() in the activity's inline
// script). `pass` (all reqs true) and `hint` (the first failing req's message,
// shown in the feedback box) are derived automatically — see evalMod() below.

export const MOD_CHECKS = {
  // Mod 1 — rename greet to hello (definition + call), keep farewell.
  mod1: {
    reqs: [
      {
        hint: '❌ Rename the definition — replace def greet(): with def hello():.',
        test(raw) {
          const c = normalise(raw);
          return has(c, 'def hello') && !has(c, 'def greet');
        },
      },
      {
        hint: '❌ Update the call at the bottom to hello() too.',
        test(raw) {
          const c = normalise(raw);
          return has(c, /hello\(\)(?!:)/);
        },
      },
      {
        hint: "❌ Keep your farewell() function from Investigate — don't remove it.",
        test(raw) {
          const c = normalise(raw);
          return has(c, 'def farewell');
        },
      },
    ],
    passMsg: '✅ Renamed correctly — hello() defined and called, farewell() kept.',
  },

  // Mod 2 — both print messages inside hello() changed to something personal.
  mod2: {
    reqs: [
      {
        hint: '❌ Change the first message — "Hello!" is still the original. Make it personal!',
        test(raw) {
          return hasHelloStructure(raw) && !/["']Hello!["']/.test(raw);
        },
      },
      {
        hint: '❌ Change the second message — "Have a great day." is still the original. Make it personal!',
        test(raw) {
          return hasHelloStructure(raw) && !/["']Have a great day\.["']/.test(raw);
        },
      },
    ],
    passMsg: '✅ Custom messages in place — nice personalised greeting!',
  },

  // Mod 3 — rename farewell to say_goodbye (definition + call).
  mod3: {
    reqs: [
      {
        hint: '❌ Rename the definition — replace def farewell(): with def say_goodbye():.',
        test(raw) {
          const c = normalise(raw);
          return has(c, 'def say_goodbye') && !has(c, 'def farewell');
        },
      },
      {
        hint: '❌ Update the call at the bottom to say_goodbye() too.',
        test(raw) {
          const c = normalise(raw);
          return has(c, /say_goodbye\(\)(?!:)/);
        },
      },
    ],
    passMsg: '✅ Renamed to say_goodbye() — definition and call both updated.',
  },

  // Mod 4 — a new print_line() function, called from inside hello().
  mod4: {
    reqs: [
      {
        hint: '❌ Define a new function: def print_line(): that prints 10 dashes.',
        test(raw) {
          const c = normalise(raw);
          return has(c, 'def print_line');
        },
      },
      {
        hint: '❌ Call print_line() inside hello() at the start and end.',
        test(raw) {
          const c = normalise(raw);
          return has(c, /print_line\(\)(?!:)/);
        },
      },
    ],
    passMsg: '✅ print_line() defined and called from inside hello() — function calling a function!',
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
// One req per req-list bullet in the Make section (#req_m2_make) — same six
// criteria the old combined validateMake() checked, just individually ticked.

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Define a show_menu() function that prints a title line and a numbered list, and call it at the start of your program.',
      test(raw) { return has(normalise(raw), 'def show_menu'); },
    },
    {
      hint: '❌ Define a separate function for each animal (e.g. dog_facts) — at least 3 animal functions, not counting show_menu/show_goodbye.',
      test(raw) {
        const c = normalise(raw);
        const names = [...c.matchAll(/\bdef\s+(\w+)\s*\(\s*\)/g)].map(m => m[1]);
        return names.filter(n => n !== 'show_menu' && n !== 'show_goodbye').length >= 3;
      },
    },
    {
      hint: '❌ Use input() to ask the user their choice and store the result in a variable.',
      test(raw) { return has(normalise(raw), 'input('); },
    },
    {
      hint: '❌ Use if / elif / else to call the correct animal function based on the user\'s input.',
      test(raw) {
        const c = normalise(raw);
        return has(c, /\bif\b/) && has(c, /\belif\b/) && has(c, /\belse\b/);
      },
    },
    {
      hint: '❌ Define a show_goodbye() function that prints a sign-off message, and call it at the very end.',
      test(raw) { return has(normalise(raw), 'def show_goodbye'); },
    },
    {
      hint: '❌ Your program must define and call at least 5 functions in total (show_menu, 3 animal functions, show_goodbye).',
      test(raw) {
        const c = normalise(raw);
        return (c.match(/\bdef\s+\w+\s*\(\s*\)/g) || []).length >= 5;
      },
    },
  ],
  passMsg: '✅ All six criteria met — great Animal Fact Finder! Show your teacher.',
};

export function evalMake(raw) {
  const results = MAKE_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? MAKE_CHECK.passMsg : MAKE_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

// ── Extension ─────────────────────────────────────────────────────────────────

export const EXT_CHECK = {
  reqs: [
    {
      hint: '❌ Wrap your program in a while True loop.',
      test(raw) { return has(normalise(raw), /\bwhile\b/); },
    },
    {
      hint: '❌ Add a 4. Quit option that uses break to exit the loop.',
      test(raw) { return has(normalise(raw), /\bbreak\b/); },
    },
  ],
  passMsg: '✅ Extension complete — repeating menu with while and break. Excellent!',
};

export function evalExt(raw) {
  const results = EXT_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? EXT_CHECK.passMsg : EXT_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}
