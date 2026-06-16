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

export const MOD_CHECKS = {
  mod1(raw) {
    const c = normalise(raw);
    if (!has(c, 'def hello'))
      return { pass: false, msg: '❌ Rename greet to hello — use def hello():' };
    if (has(c, 'def greet'))
      return { pass: false, msg: '❌ Remove the old name — replace def greet with def hello.' };
    if (!has(c, /hello\(\)(?!:)/))
      return { pass: false, msg: '❌ Update the call at the bottom to hello() too.' };
    if (!has(c, 'def farewell'))
      return { pass: false, msg: "❌ Keep your farewell() function from Investigate — don't remove it." };
    return { pass: true, msg: '✅ Renamed correctly — hello() defined and called, farewell() kept.' };
  },
  mod2(raw) {
    const c = normalise(raw);
    if (!has(c, 'def hello') && !has(c, 'def greet'))
      return { pass: false, msg: '❌ Make sure your function is still defined with def.' };
    if (!has(c, 'print('))
      return { pass: false, msg: '❌ Your function should still have print statements inside.' };
    if (/["']Hello!["']/.test(raw))
      return { pass: false, msg: '❌ Change the first message — "Hello!" is still the original. Make it personal!' };
    if (/["']Have a great day\.["']/.test(raw))
      return { pass: false, msg: '❌ Change the second message — "Have a great day." is still the original. Make it personal!' };
    return { pass: true, msg: '✅ Custom messages in place — nice personalised greeting!' };
  },
  mod3(raw) {
    const c = normalise(raw);
    if (!has(c, 'def say_goodbye'))
      return { pass: false, msg: '❌ Rename farewell to say_goodbye — use def say_goodbye():' };
    if (has(c, 'def farewell'))
      return { pass: false, msg: '❌ Remove the old name — replace def farewell with def say_goodbye.' };
    if (!has(c, /say_goodbye\(\)(?!:)/))
      return { pass: false, msg: '❌ Update the call at the bottom to say_goodbye() too.' };
    return { pass: true, msg: '✅ Renamed to say_goodbye() — definition and call both updated.' };
  },
  mod4(raw) {
    const c = normalise(raw);
    if (!has(c, 'def print_line'))
      return { pass: false, msg: '❌ Define a new function: def print_line():' };
    if (!has(c, /print_line\(\)(?!:)/))
      return { pass: false, msg: '❌ Call print_line() inside hello() at the start and end.' };
    return { pass: true, msg: '✅ print_line() defined and called from inside hello() — function calling a function!' };
  },
};

export function validateMake(raw) {
  if (raw.trim().length < 10)
    return { pass: false, msg: '⚠️ Paste your program first.' };
  const c = normalise(raw);
  const defCount = (c.match(/\bdef\s+\w+\s*\(\s*\)/g) || []).length;
  const missing = [];
  if (!has(c, 'def show_menu'))    missing.push('a show_menu() function');
  if (!has(c, 'def show_goodbye')) missing.push('a show_goodbye() function');
  if (defCount < 5)                missing.push(`at least 5 functions in total (you have ${defCount})`);
  if (!has(c, 'input('))           missing.push('input()');
  if (!has(c, /\bif\b/) || !has(c, /\belif\b/)) missing.push('if / elif');
  if (!has(c, /\belse\b/))         missing.push('an else branch for invalid choices');
  if (missing.length)
    return { pass: false, msg: '❌ Still needed: ' + missing.join(', ') + '.' };
  return { pass: true, msg: '✅ All six criteria met — great Animal Fact Finder! Show your teacher.' };
}

export function validateExt(raw) {
  if (raw.trim().length < 20)
    return { pass: false, msg: '⚠️ Paste your extended program above first.' };
  const c = normalise(raw);
  const missing = [];
  if (!has(c, /\bwhile\b/)) missing.push('a while loop');
  if (!has(c, /\bbreak\b/)) missing.push('break to exit the loop');
  if (missing.length)
    return { pass: false, msg: '❌ Still needed: ' + missing.join(', ') + '.' };
  return { pass: true, msg: '✅ Extension complete — repeating menu with while and break. Excellent!' };
}
