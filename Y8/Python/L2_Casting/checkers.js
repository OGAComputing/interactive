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

export const MOD_CHECKS = {
  mod1(raw) {
    if (!has(raw, /nice to meet you/i))
      return { pass: false, msg: '❌ Change the greeting to say "Nice to meet you, [name]!" — the original "Hello," is still there.' };
    const c = normalise(raw);
    if (!has(c, 'int(input'))
      return { pass: false, msg: '❌ Keep int(input()) for the age input — don\'t remove the casting.' };
    return { pass: true, msg: '✅ Greeting updated — "Nice to meet you" in place!' };
  },

  mod2(raw) {
    const c = normalise(raw);
    if (!has(c, 'int(input'))
      return { pass: false, msg: '❌ Ask for the birth year using int(input(...)) — you still need int() to do the subtraction.' };
    if (!has(c, /\d{4}\s*-/))
      return { pass: false, msg: '❌ Calculate age with something like: age = 2026 - year (subtract the birth year from the current year).' };
    if (!has(c, /print.*age/) && !has(c, /str\s*\(\s*age/))
      return { pass: false, msg: '❌ Update the print statement to show the calculated age — for example: print("You are " + str(age) + " years old.")' };
    return { pass: true, msg: '✅ Birth year input, age calculation, and age output — excellent!' };
  },

  mod3(raw) {
    const c = normalise(raw);
    if (!has(c, 'float(input'))
      return { pass: false, msg: '❌ Add a height input using float(input(...)) — float() handles decimal centimetre values.' };
    if (!has(c, /\/\s*100/) && !has(c, /\*\s*0\.01/))
      return { pass: false, msg: '❌ Convert to metres by dividing by 100: height_m = height_cm / 100.' };
    return { pass: true, msg: '✅ Height input with float() and metres conversion — great!' };
  },

  mod4(raw) {
    const c = normalise(raw);
    const inputCount = (c.match(/input\s*\(/g) || []).length;
    if (inputCount < 3)
      return { pass: false, msg: '❌ You need at least 3 input() calls — name, age/birth year and favourite number.' };
    // Accept str() concatenation OR commas in print, or f-strings
    const hasStr = has(c, 'str(');
    const hasFString = has(raw, /f["']/);
    const printLines = raw.split('\n').filter(l => /^\s*print\s*\(/.test(l));
    const hasCombined = printLines.some(l => {
      const n = normalise(l);
      return (n.match(/\+/g) || []).length >= 2 || (n.match(/,/g) || []).length >= 2;
    });
    if (!hasStr && !hasFString && !hasCombined)
      return { pass: false, msg: '❌ Print name, age and favourite number together in one message — use + to join them (with str()) or commas inside print().' };
    return { pass: true, msg: '✅ Three inputs collected and printed in one combined message — well done!' };
  },
};

export function validateMake(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Write your program first.' };
  const c = normalise(raw);
  const missing = [];
  if (!has(c, 'input('))
    missing.push('input()');
  if (!has(c, 'float(') && !has(c, 'int('))
    missing.push('int() or float() to convert a number input');
  if (!has(c, 'print('))
    missing.push('print()');
  // Strip string literals before looking for arithmetic so prompt text doesn't trigger it
  const noStrings = raw.replace(/"[^"\n]*"/g, '""').replace(/'[^'\n]*'/g, '""');
  if (!/[+\-*\/]/.test(noStrings.replace(/input\s*\([^)]*\)/g, '').replace(/print\s*\(/g, '')))
    missing.push('a calculation (e.g. * 9 / 5 + 32 or price * quantity)');
  if (missing.length)
    return { pass: false, msg: '❌ Still needed: ' + missing.join(', ') + '.' };
  return { pass: true, msg: '✅ Program complete — all requirements met. Well done!' };
}

export function validateExt(raw) {
  if (raw.trim().length < 20)
    return { pass: false, msg: '⚠️ Add the two-number extension to your program first.' };
  const c = normalise(raw);
  const missing = [];
  const numInputs = (c.match(/(?:int|float)\s*\(\s*input/g) || []).length;
  if (numInputs < 2)
    missing.push('two number inputs with int() or float()');
  const noStrings = raw.replace(/"[^"\n]*"/g, '""').replace(/'[^'\n]*'/g, '""');
  const calc = noStrings.replace(/input\s*\([^)]*\)/g, '').replace(/print\s*\(/g, '');
  const ops = [/\+/.test(calc), /-/.test(calc), /\*/.test(calc), /\//.test(calc)].filter(Boolean).length;
  if (ops < 4)
    missing.push('all four operations: sum (+), difference (−), product (×) and division (÷) on separate lines');
  if (missing.length)
    return { pass: false, msg: '❌ Still needed: ' + missing.join(', ') + '.' };
  return { pass: true, msg: '✅ Extension complete — all four operations printed. Excellent!' };
}
