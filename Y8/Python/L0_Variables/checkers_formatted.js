// Validation logic for 2_FormattedPrint_PRIMM.html — Variables: formatted print with multiple variables.

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

function countAssignments(raw) {
  return (normalise(raw).match(/\b\w+\s*=/g) || []).length;
}

export const MOD_CHECKS = {
  mod1(raw) {
    if (/name\s*=\s*["']Riley["']/i.test(raw))
      return { pass: false, msg: '❌ Change the name variable to your own name — "Riley" is still the original.' };
    if (/mood\s*=\s*["']Happy["']/i.test(raw))
      return { pass: false, msg: '❌ Change the mood variable to how you are actually feeling — "Happy" is still the original.' };
    if (!has(normalise(raw), /\bname\s*=/) || !has(normalise(raw), /\bmood\s*=/))
      return { pass: false, msg: '❌ Keep both the name and mood variables — just change their values.' };
    return { pass: true, msg: '✅ Variables personalised — your own name and mood are now in the program!' };
  },
  mod2(raw) {
    const c = normalise(raw);
    if (!has(c, /\bage\s*=/))
      return { pass: false, msg: '❌ Add an age variable: age = your actual age (as a number, no speech marks).' };
    if (!has(c, /print\s*\([^)]*age[^)]*\)/))
      return { pass: false, msg: '❌ Include age in your print() statement so it appears in the output sentence.' };
    if (countPrints(raw) < 1)
      return { pass: false, msg: '❌ Keep your print() statement with the name, mood, and age.' };
    return { pass: true, msg: '✅ Age variable added and included in the sentence — great formatted output!' };
  },
  mod3(raw) {
    const c = normalise(raw);
    if (!has(c, /\bsubject\s*=/))
      return { pass: false, msg: '❌ Create a subject variable: subject = "your favourite subject".' };
    if (countPrints(raw) < 2)
      return { pass: false, msg: '❌ Add a second print() statement that uses the subject variable.' };
    return { pass: true, msg: '✅ Subject variable added and printed in a second sentence — two formatted lines of output!' };
  },
  mod4(raw) {
    const c = normalise(raw);
    if (!has(c, /\bcity\s*=/) && !has(c, /\btown\s*=/) && !has(c, /\bplace\s*=/))
      return { pass: false, msg: '❌ Create a city variable (or town/place): city = "your nearest city".' };
    if (countPrints(raw) < 3)
      return { pass: false, msg: '❌ Add a third print() sentence that includes the city variable.' };
    return { pass: true, msg: '✅ Three formatted sentences, four variables — your program tells a story about you!' };
  },
};

export const MOD_INPUTS = {};

export function validateMake(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Write your program first, then click Check.' };
  const c = normalise(raw);
  const assignCount = countAssignments(raw);
  if (assignCount < 6)
    return { pass: false, msg: `❌ Create at least 6 variables — you have around ${assignCount}. Think: name, age, favouriteFood, pet, city, sport…` };
  const printCount = countPrints(raw);
  if (printCount < 2)
    return { pass: false, msg: '❌ Output at least two sentences using your variables — you need at least 2 print() calls.' };
  if (!has(c, /print\s*\([^)]*,/))
    return { pass: false, msg: '❌ Each print() sentence should mix string text with variables using commas — e.g. print("My name is", name).' };
  return { pass: true, msg: '✅ Six variables and two formatted sentences — great personal profile program!' };
}

export function validateExt(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Paste your extended program above first.' };
  const assignCount = countAssignments(raw);
  if (assignCount < 6)
    return { pass: false, msg: '❌ Keep all 6 variables from the Make task.' };
  const printCount = countPrints(raw);
  if (printCount < 3)
    return { pass: false, msg: '❌ Add a third sentence so you have at least 3 print() statements.' };
  if (!/\d/.test(raw))
    return { pass: false, msg: '❌ Include at least one number variable (e.g. age, score) and use it in a print().' };
  return { pass: true, msg: '✅ Extension complete — three sentences with six variables. Excellent work!' };
}
