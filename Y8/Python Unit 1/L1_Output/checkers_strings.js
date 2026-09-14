// Validation logic for 1_Strings_PRIMM.html — Output: print() with strings.

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

function countPrints(raw) {
  return (raw.match(/\bprint\s*\(/g) || []).length;
}

// Each mod is a list of independent, individually-detected `reqs` — one per
// bullet point shown in the task card (the bullet TEXT lives in the HTML, not
// here — reqs only carry the pass/fail logic). The UI ticks/crosses each
// bullet on every Check click (see renderReqResults() in the activity's inline
// script). `pass` (all reqs true) and `hint` (the first failing req's message,
// shown in the feedback box) are derived automatically — see evalMod() below.

export const MOD_CHECKS = {
  // Mod 1 — every line personalised, no starter text left over.
  mod1: {
    reqs: [
      {
        hint: '❌ Keep at least 3 print() calls that show text — one for your name, year group, and school name.',
        test(raw) {
          // Count only prints that actually output text — an empty print() left over from
          // the investigation is fine here (Modification 3 uses one deliberately).
          const textPrints = countPrints(raw) - (raw.match(/\bprint\s*\(\s*\)/g) || []).length;
          return textPrints >= 3;
        },
      },
      {
        hint: '❌ Change ALL the original starter text — "Hello, World!", "I am learning Python." and "This is fun!" should all be gone.',
        test(raw) {
          return !/hello,\s*world/i.test(raw) && !/i am learning python/i.test(raw) && !/this is fun/i.test(raw);
        },
      },
    ],
    passMsg: '✅ Looking good — all your print() lines now show your own text!',
  },

  // Mod 2 — build up to five lines of text.
  mod2: {
    reqs: [
      {
        hint: '❌ You need at least 5 print() calls that show text — keep adding until you reach 5.',
        test(raw) {
          // Five lines of *text* — an empty print() carried over from the investigation
          // doesn't count towards the five (it has no text).
          const textPrints = countPrints(raw) - (raw.match(/\bprint\s*\(\s*\)/g) || []).length;
          return textPrints >= 5;
        },
      },
    ],
    passMsg: '✅ Five print() calls found — your program prints five things!',
  },

  // Mod 3 — a blank line via an empty print().
  mod3: {
    reqs: [
      {
        hint: '❌ Add at least one print() with empty brackets to create a blank line in the output.',
        test: raw => has(raw, /print\s*\(\s*\)/) || has(raw, /print\s*\(\s*["']\s*["']\s*\)/),
      },
    ],
    passMsg: '✅ Empty print() found — that creates a blank line in the output!',
  },

  // Mod 4 — reorder: move the empty print() to the very top.
  mod4: {
    reqs: [
      {
        hint: '❌ Keep all your print() lines — just change their ORDER, don\'t delete any.',
        test: raw => countPrints(raw) >= 5,
      },
      {
        hint: '❌ Move your empty print() to the very top so it runs FIRST — the first print() line of your program should have empty brackets.',
        test(raw) {
          // The empty print() (the blank line) must now be the FIRST print in the program,
          // so the output starts with a blank line. This forces a real reorder.
          const firstPrint = raw.match(/print\s*\([^)]*\)/);
          return !!firstPrint && /^print\s*\(\s*(["']\s*["'])?\s*\)$/.test(firstPrint[0]);
        },
      },
    ],
    passMsg: '✅ The blank line now prints first! Moving it changed the output — Python always runs top to bottom.',
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

export const MOD_INPUTS = {};

// ── Make ────────────────────────────────────────────────────────────────────
// A name-list program: four names, each a real (non-empty) piece of text.
// "Own line" and "alphabetical order" are encouraged in the task text but were
// never structurally tested — that stays true here (see evalMake below).

export const MAKE_CHECK = {
  reqs: [
    {
      hint: '❌ Print at least four things — one for you and three friends.',
      test: raw => countPrints(raw) >= 4,
    },
    {
      hint: '❌ Make sure each name is real, non-empty text in speech marks — no blank print() used as a name.',
      test(raw) {
        const strings = raw.match(/["'][^"'\n]+["']/g) || [];
        return strings.filter(s => s.length > 2).length >= 4;
      },
    },
  ],
  passMsg: '✅ Four names printed — great work! Did you sort them alphabetically?',
};

export function evalMake(raw) {
  const results = MAKE_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? MAKE_CHECK.passMsg : MAKE_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

// ── Extension ─────────────────────────────────────────────────────────────────
// Combine the four names into a single print() using \n line breaks.

export const EXT_CHECK = {
  reqs: [
    {
      hint: '❌ Combine everything into a SINGLE print() statement — replace your separate print() calls with one.',
      test: raw => countPrints(raw) === 1,
    },
    {
      hint: '❌ Use \\n inside your print() to display all four names on separate lines.',
      test: raw => has(raw, /\\n/),
    },
  ],
  passMsg: '✅ Extension complete — all four names in a single print() using \\n. Excellent!',
};

export function evalExt(raw) {
  const results = EXT_CHECK.reqs.map(r => !!r.test(raw));
  const pass = results.every(Boolean);
  const hint = pass ? EXT_CHECK.passMsg : EXT_CHECK.reqs[results.findIndex(r => !r)].hint;
  return { results, pass, msg: hint };
}

export function validateMake2(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Write your second program first, then click Check.' };
  const textPrints = countPrints(raw) - (raw.match(/\bprint\s*\(\s*\)/g) || []).length;
  if (textPrints < 4)
    return { pass: false, msg: `❌ You need at least 4 print() lines of text — a title plus 3 items. You have ${textPrints}.` };
  if (!has(raw, /print\s*\(\s*\)/))
    return { pass: false, msg: '❌ Add an empty print() to leave a blank line between your title and your list.' };
  return { pass: true, msg: '✅ Second program complete — great job building it from scratch!' };
}

export function validateTripleQuote(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Write your triple-quote print() first.' };
  const tripleMatches = raw.match(/("""[\s\S]*?"""|'''[\s\S]*?''')/g) || [];
  if (tripleMatches.length === 0)
    return { pass: false, msg: '❌ Use triple quotes (""" ... """) around your text — you haven\'t used any yet.' };
  const longEnough = tripleMatches.some(m => (m.match(/\n/g) || []).length >= 2);
  if (!longEnough)
    return { pass: false, msg: '❌ Your triple-quoted text needs at least 3 lines — press Enter inside the quotes to add more lines.' };
  if (!has(raw, /\bprint\s*\(/))
    return { pass: false, msg: '❌ Wrap your triple-quoted text in a print() call so it actually displays.' };
  return { pass: true, msg: "✅ Multi-line printing with triple quotes — excellent! You've previewed a technique early." };
}

export function validateVpMod1(raw) {
  if (raw.trim().length < 20)
    return { pass: false, msg: '⚠️ Write some code first.' };
  if (!/\bname\s*=\s*["'][^"']+["']/.test(raw))
    return { pass: false, msg: '❌ Keep the name variable — just change its value to your own name (keep the speech marks).' };
  if (/\bname\s*=\s*["']Alice["']/i.test(raw))
    return { pass: false, msg: '❌ Change the value of name from "Alice" to your own name.' };
  if (!/\bschool\s*=\s*["'][^"']+["']/.test(raw))
    return { pass: false, msg: '❌ Keep the school variable — change its value to your own school name.' };
  if (/\bschool\s*=\s*["']Grange Academy["']/i.test(raw))
    return { pass: false, msg: '❌ Change "Grange Academy" to your own school name.' };
  if (!/\bprint\s*\(\s*name\s*\)/.test(raw))
    return { pass: false, msg: '❌ Keep print(name) — only change the variable values, not the print lines.' };
  if (!/\bprint\s*\(\s*school\s*\)/.test(raw))
    return { pass: false, msg: '❌ Keep print(school) — only change the variable values, not the print lines.' };
  return { pass: true, msg: '✅ Your own values are printing! Notice you only changed the assignment lines — the print lines stayed the same.' };
}

export function validateVpMod2(raw) {
  const r1 = validateVpMod1(raw);
  if (!r1.pass) return r1;
  if (!/\bsubject\s*=\s*["'][^"']+["']/.test(raw))
    return { pass: false, msg: '❌ Add a variable called subject and set it to your favourite school subject (in speech marks).' };
  if (!/\bprint\s*\(\s*subject\s*\)/.test(raw))
    return { pass: false, msg: '❌ Add print(subject) to display your subject variable.' };
  return { pass: true, msg: '✅ Three variables, all printing. Ready for the challenge!' };
}

export function validateVpChallenge(raw) {
  if (raw.trim().length < 20)
    return { pass: false, msg: '⚠️ Write your name badge program first.' };
  const varCount = (raw.match(/\b[a-zA-Z_]\w*\s*=\s*["'][^"'\n]+["']/g) || []).length;
  if (varCount < 3)
    return { pass: false, msg: `❌ Create at least 3 string variables — you have ${varCount} so far.` };
  if (!has(raw, '+'))
    return { pass: false, msg: '❌ Use + to join strings and variables in at least one print line — try: print("Name: " + first_name).' };
  const printCount = (raw.match(/\bprint\s*\(/g) || []).length;
  if (printCount < 2)
    return { pass: false, msg: '❌ Print at least 2 lines of your name badge.' };
  return { pass: true, msg: "✅ Name badge complete — you've previewed variables and string concatenation. You'll fly through the next lesson!" };
}
