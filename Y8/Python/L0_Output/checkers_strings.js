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

export const MOD_CHECKS = {
  mod1(raw) {
    if (countPrints(raw) < 3)
      return { pass: false, msg: '❌ Keep all 3 print() calls — just change the text inside them.' };
    if (/hello,\s*world/i.test(raw))
      return { pass: false, msg: '❌ Change "Hello, World!" to your own text — it looks like the original is still there.' };
    if (/i am learning python/i.test(raw))
      return { pass: false, msg: '❌ Change "I am learning Python." to something about you — the original text is still there.' };
    if (/this is fun/i.test(raw))
      return { pass: false, msg: '❌ Change "This is fun!" to something about you — the original text is still there.' };
    return { pass: true, msg: '✅ All three lines updated with your own text — looking good!' };
  },
  mod2(raw) {
    if (countPrints(raw) < 5)
      return { pass: false, msg: `❌ You need at least 5 print() calls — you have ${countPrints(raw)}. Add ${5 - countPrints(raw)} more.` };
    return { pass: true, msg: '✅ Five print() calls found — your program prints five things!' };
  },
  mod3(raw) {
    if (!has(raw, /print\s*\(\s*\)/) && !has(raw, /print\s*\(\s*["']\s*["']\s*\)/))
      return { pass: false, msg: '❌ Add at least one print() with empty brackets to create a blank line in the output.' };
    return { pass: true, msg: '✅ Empty print() found — that creates a blank line in the output!' };
  },
  mod4(raw) {
    const singlePrintWithCommas = /print\s*\([^)]*,[^)]*,[^)]*,[^)]*\)/.test(raw);
    if (!singlePrintWithCommas)
      return { pass: false, msg: '❌ Add a single print() that uses commas to show multiple items on one line — e.g. print("Alice", "Bob", "Carol").' };
    return { pass: true, msg: '✅ Single print() with multiple items found — all on one line!' };
  },
};

export const MOD_INPUTS = {};

export function validateMake(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Write your program first, then click Check.' };
  const printCount = countPrints(raw);
  if (printCount < 5)
    return { pass: false, msg: `❌ You need at least 5 print() calls — one for each name. You have ${printCount}.` };
  const strings = raw.match(/["'][^"'\n]+["']/g) || [];
  const nonEmpty = strings.filter(s => s.length > 2);
  if (nonEmpty.length < 5)
    return { pass: false, msg: '❌ Make sure each print() contains a name (non-empty text in speech marks).' };
  return { pass: true, msg: '✅ Five names printed — great work! Did you sort them alphabetically?' };
}

export function validateExt(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Paste your extended program above first.' };
  if (!has(raw, /\\n/))
    return { pass: false, msg: '❌ Use \\n inside one print() to display all five names without separate print() calls.' };
  return { pass: true, msg: '✅ Extension complete — all five names in a single print() using \\n. Excellent!' };
}
