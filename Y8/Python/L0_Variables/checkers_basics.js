// Validation logic for 1_Basics_PRIMM.html — Variables: creating and using variables.

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

export const MOD_CHECKS = {
  mod1(raw) {
    const c = normalise(raw);
    if (has(c, 'number1') || has(c, 'number2'))
      return { pass: false, msg: '❌ Replace every use of number1 with num1, and number2 with num2 — including the variable assignments and the print() calls.' };
    if (!has(c, 'num1') || !has(c, 'num2'))
      return { pass: false, msg: '❌ Make sure you have both num1 and num2 defined and printed.' };
    return { pass: true, msg: '✅ Variables renamed to num1 and num2 everywhere — Python uses the new names correctly.' };
  },
  mod2(raw) {
    const c = normalise(raw);
    if (has(c, 'number1') || has(c, 'number2'))
      return { pass: false, msg: '❌ Make sure you still have num1 and num2 (not number1/number2) from modification 1.' };
    if (!has(c, /print\s*\(\s*num1\s*\+\s*num2\s*\)/) && !has(c, /print\s*\([^)]*num1\s*\+\s*num2[^)]*\)/))
      return { pass: false, msg: '❌ Add print(num1 + num2) to display the two numbers added together.' };
    return { pass: true, msg: '✅ Addition printed — num1 + num2 appears in a print() call.' };
  },
  mod3(raw) {
    const c = normalise(raw);
    if (!has(c, /num1\s*-\s*num2/) || !has(c, /num2\s*-\s*num1/))
      return { pass: false, msg: '❌ Add two subtraction print() calls: one for num1 - num2 and one for num2 - num1 (both directions).' };
    return { pass: true, msg: '✅ Both subtractions added — num1 - num2 and num2 - num1 both printed.' };
  },
  mod4(raw) {
    const c = normalise(raw);
    if (!has(c, /num1\s*\*\s*num2/))
      return { pass: false, msg: '❌ Add print(num1 * num2) to display the product of the two numbers.' };
    return { pass: true, msg: '✅ Multiplication added — all four operations now printed. Great work!' };
  },
};

export const MOD_INPUTS = {};

export function validateMake(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Write your program first, then click Check.' };
  const c = normalise(raw);
  const missing = [];
  if (!has(c, /\bname\s*=/))   missing.push('a variable called name (e.g. name = "Your Name")');
  if (!has(c, /\bage\s*=/))    missing.push('a variable called age (e.g. age = 13)');
  if (!has(c, /\*/) && !has(c, /\*/))
    missing.push('a multiplication using * (e.g. age * 3)');
  if (!has(c, 'print('))       missing.push('at least one print() statement');
  if (missing.length)
    return { pass: false, msg: '❌ Still needed: ' + missing.join(', ') + '.' };
  return { pass: true, msg: '✅ Program complete — name and age variables created, and age multiplied correctly!' };
}

export function validateExt(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Paste your extended program above first.' };
  const c = normalise(raw);
  const varCount = (c.match(/\b\w+\s*=/g) || []).length;
  if (varCount < 5)
    return { pass: false, msg: '❌ Create at least 5 different variables (name, age, and three more about yourself).' };
  const printCount = (raw.match(/\bprint\s*\(/g) || []).length;
  if (printCount < 3)
    return { pass: false, msg: '❌ Print all your variables — you need at least 3 print() calls.' };
  return { pass: true, msg: '✅ Extension complete — 5 or more variables all printed. Excellent!' };
}
