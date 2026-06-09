// Validation logic for 2_DataTypes_PRIMM.html — Output: strings vs integers and arithmetic.

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
    if (!has(raw, /3\s*\*\s*7|3\*7/))
      return { pass: false, msg: '❌ Change the multiplication from 2 * 5 to 3 * 7 in your code.' };
    if (has(raw, /2\s*\*\s*5/))
      return { pass: false, msg: '❌ Remove the original 2 * 5 — replace it with 3 * 7.' };
    return { pass: true, msg: '✅ Multiplication updated to 3 * 7 — the output should now show 21.' };
  },
  mod2(raw) {
    if (!has(raw, /3\s*\*\s*7|3\*7/))
      return { pass: false, msg: '❌ Make sure you still have the 3 * 7 from modification 1.' };
    const hasStringVersion  = has(raw, /"12\s*-\s*4"|'12\s*-\s*4'/);
    const hasCalcVersion    = has(raw, /print\s*\([^)]*12\s*-\s*4[^)]*\)/);
    if (!hasStringVersion)
      return { pass: false, msg: '❌ Add print("12 - 4") to show the subtraction as text (in speech marks).' };
    if (!hasCalcVersion)
      return { pass: false, msg: '❌ Also add print(12 - 4) without speech marks so Python calculates it.' };
    return { pass: true, msg: '✅ Both versions added — the string shows "12 - 4" and the integer shows 8.' };
  },
  mod3(raw) {
    if (!has(raw, /3\s*\*\s*7|3\*7/))
      return { pass: false, msg: '❌ Make sure you still have 3 * 7 from modification 1.' };
    if (!has(raw, /100\s*-\s*37/))
      return { pass: false, msg: '❌ Add a print() that calculates 100 - 37 combined with a message string.' };
    if (!has(raw, /print\s*\([^)]*"[^"]*"[^)]*100\s*-\s*37|print\s*\([^)]*100\s*-\s*37[^)]*"[^"]*"/))
      return { pass: false, msg: '❌ Mix the message string and 100 - 37 inside one print() using a comma.' };
    return { pass: true, msg: '✅ Message and calculation combined in one print() — the output shows both the text and the result.' };
  },
  mod4(raw) {
    if (!has(raw, /\*\*/))
      return { pass: false, msg: '❌ Add print(5 ** 2) — use ** to find out what that operator does.' };
    return { pass: true, msg: '✅ Found ** in your code — ** is the power/exponent operator (5 ** 2 = 25).' };
  },
};

export const MOD_INPUTS = {};

export function validateMake(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Write your maths quiz program first, then click Check.' };
  const printCount = countPrints(raw);
  if (printCount < 3)
    return { pass: false, msg: `❌ You need at least 3 print() calls — one per question. You have ${printCount}.` };
  if (!has(raw, /[+\-*\/]/))
    return { pass: false, msg: '❌ Include some arithmetic (+, -, *, /) to show the answers as calculations.' };
  const hasString = has(raw, /"[^"]*[+\-*\/][^"]*"|'[^']*[+\-*\/][^']*'/);
  if (!hasString)
    return { pass: false, msg: '❌ Show each question as a string (in speech marks) as well as its answer.' };
  return { pass: true, msg: '✅ Maths quiz complete — three questions with answers shown. Well done!' };
}

export function validateExt(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Paste your extended program above first.' };
  const printCount = countPrints(raw);
  if (printCount < 5)
    return { pass: false, msg: '❌ Add at least 5 questions to your quiz.' };
  if (!has(raw, /[+\-*\/]/) || !has(raw, /\*\*/))
    return { pass: false, msg: '❌ Include at least one use of the ** (power) operator in your extended quiz.' };
  return { pass: true, msg: '✅ Extended quiz complete — five or more questions including powers. Excellent!' };
}
