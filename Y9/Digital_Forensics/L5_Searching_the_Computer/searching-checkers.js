// Pure logic for Searching_the_Computer.html — no DOM. Unit-tested in searching-checkers.test.js.
//
// The activity has ten scored tasks (see "Scored tasks" below). Each check function takes the student's
// answers as a plain object { questionId: value } and returns { questionId: true|false } so the
// page can highlight every question individually.

// ── Station 1: brute force ───────────────────────────────────────────────────

export const JOURNAL_WORDS = ['Maria', 'Ibiza', '23'];
export const JOURNAL_PASSWORD = 'MARIA23IBIZA';

const CASES = [w => w.toLowerCase(), w => w[0].toUpperCase() + w.slice(1).toLowerCase(), w => w.toUpperCase()];

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]));
}

// Every guess a dictionary attack would try with the journal words.
// No rules: any order, each word in lower / Title / UPPER case.
// With the clues (CAPITALS, word-number-word): only the two orders with 23 in the middle, in capitals.
export function journalGuesses(useClues) {
  const out = [];
  for (const order of permutations(JOURNAL_WORDS)) {
    if (useClues) {
      if (order[1] !== '23') continue;
      out.push(order.map(w => w.toUpperCase()).join(''));
      continue;
    }
    const variants = order.reduce((acc, w) => {
      const forms = /\d/.test(w) ? [w] : CASES.map(f => f(w));
      return acc.flatMap(a => forms.map(f => a + f));
    }, ['']);
    out.push(...variants);
  }
  // The real password is tried last in both modes, so the counter shows the full search.
  const i = out.indexOf(JOURNAL_PASSWORD);
  if (i >= 0) { out.splice(i, 1); out.push(JOURNAL_PASSWORD); }
  return out;
}

// The student's own guess at the journal password (built from word tiles + a case setting).
export function checkJournalGuess(guess) {
  return guess === JOURNAL_PASSWORD;
}

// Words an attacker's dictionary would contain (from the old Brute Force spreadsheet plus
// very common choices: names, pets, teams, places). Passwords built only from these fall in
// seconds whatever their length.
export const DICTIONARY = [
  'password', 'letmein', 'hello', 'bob', 'abc', 'qwerty', 'admin', 'welcome', 'football',
  'mancity', 'liverpool', 'chelsea', 'arsenal', 'dragon', 'monkey', 'iloveyou', 'sunshine',
  'princess', 'love', 'secret', 'master', 'login', 'pass', 'summer', 'holiday', 'birthday',
  'school', 'london', 'spain', 'charlie', 'poppy', 'alfie', 'bella', 'daisy', 'molly', 'oliver',
];

// Personal details from this case. A targeted attacker who has read the journal (or your
// social media) tries names, places and dates connected to the victim before anything else.
export const PERSONAL_WORDS = ['maria', 'ibiza', 'ashley', 'williams', 'oakfield', 'albert', 'terrace'];

// Guesses per second for an offline attack on a stolen password file with a gaming GPU.
export const GUESSES_PER_SECOND = 1e10;

export function charsetSize(pw) {
  let n = 0;
  if (/[a-z]/.test(pw)) n += 26;
  if (/[A-Z]/.test(pw)) n += 26;
  if (/[0-9]/.test(pw)) n += 10;
  if (/[^A-Za-z0-9]/.test(pw)) n += 33;
  return n;
}

// Undo the common look-alike swaps (p@ssw0rd → password). One character in, one out,
// so positions still line up with the original password.
function unswap(pw) {
  return pw.toLowerCase()
    .replace(/@/g, 'a').replace(/0/g, 'o').replace(/3/g, 'e').replace(/\$/g, 's').replace(/1/g, 'i');
}

// True when the password is just dictionary words / digit runs / keyboard patterns,
// with common substitutions undone (e.g. "P@ssw0rd!" → "password").
export function isDictionaryLike(pw) {
  if (!pw) return true;
  const raw = pw.toLowerCase().replace(/[^a-z]/g, '');
  if (!raw) return pw.length < 10; // short digit/symbol runs, e.g. 12345678
  const swapped = unswap(pw).replace(/[^a-z]/g, '');
  return splitsIntoWords(raw, DICTIONARY) || splitsIntoWords(swapped, DICTIONARY);
}

// Can the letters be split entirely into words from the list?
function splitsIntoWords(s, words) {
  const ok = [true];
  for (let i = 1; i <= s.length; i++) {
    ok[i] = words.some(w => i >= w.length && ok[i - w.length] && s.slice(i - w.length, i) === w);
  }
  return ok[s.length];
}

// Personal details found in the password: case words (any case, look-alike swaps undone)
// and years like 2009. Returns the matched text, e.g. ['Maria', 'Ibiza'].
export function personalDetails(pw) {
  if (!pw) return [];
  const low = unswap(pw);
  const found = [];
  for (const w of PERSONAL_WORDS) {
    const i = low.indexOf(w);
    if (i >= 0) found.push(pw.slice(i, i + w.length));
  }
  const year = pw.match(/(19|20)\d\d/);
  if (year) found.push(year[0]);
  return found;
}

// The part of the password an attacker who knows your personal details would still have to guess.
function withoutPersonal(pw) {
  let out = pw;
  for (const d of personalDetails(pw)) out = out.split(d).join('');
  // Lower-case match removal too (personalDetails returns the original casing of the first hit).
  let low = unswap(out);
  for (const w of PERSONAL_WORDS) {
    let i;
    while ((i = low.indexOf(w)) >= 0) { out = out.slice(0, i) + out.slice(i + w.length); low = unswap(out); }
  }
  return out.replace(/\s+/g, ' ').trim();
}

// Estimated seconds to crack (average case: half the search space).
export function crackSeconds(pw) {
  if (!pw) return 0;
  if (isDictionaryLike(pw)) {
    // Dictionary + rules attack: a few million guesses at most.
    return Math.min(0.001 * pw.length, 0.01);
  }
  if (personalDetails(pw).length) {
    // A targeted attacker already knows the personal parts, so only the rest needs guessing.
    const rest = withoutPersonal(pw);
    return rest ? Math.min(crackSeconds(rest), bruteSeconds(pw)) : 0.001;
  }
  return bruteSeconds(pw);
}
function bruteSeconds(pw) {
  return Math.pow(charsetSize(pw), pw.length) / 2 / GUESSES_PER_SECOND;
}

// Why a password is weak, for the builder's explanation line.
export function weaknesses(pw) {
  const out = [];
  if (!pw) return out;
  const personal = personalDetails(pw);
  if (personal.length) out.push('personal');
  if (isDictionaryLike(pw)) out.push('dictionary');
  if (pw.length < 12) out.push('short');
  return out;
}

const YEAR = 365.25 * 24 * 3600;
export const HUNDRED_YEARS = 100 * YEAR;

export function beatsHundredYears(pw) {
  return crackSeconds(pw) >= HUNDRED_YEARS;
}

export function formatDuration(sec) {
  if (sec < 1) return 'instantly';
  const units = [['second', 1], ['minute', 60], ['hour', 3600], ['day', 86400], ['year', YEAR]];
  if (sec >= 1e6 * YEAR) return 'millions of years+';
  if (sec >= 1000 * YEAR) return Math.round(sec / YEAR / 1000) + ' thousand years';
  let [name, size] = units[0];
  for (const u of units) if (sec >= u[1]) [name, size] = u;
  const n = Math.round(sec / size);
  return n + ' ' + name + (n === 1 ? '' : 's');
}

// Passwords for the "Which ones fall in under an hour?" prediction.
export const ATTACK_TARGETS = ['letMeIn', 'password1', 'Bob123', 'ManCity2020', 'HELLO($)', 'kettle tiger purple moon'];

export function fallsWithinHour(pw) {
  return crackSeconds(pw) < 3600;
}

// ── Scored tasks ─────────────────────────────────────────────────────────────
// Ten scored tasks, two or three per station:
//   S1: t0 defences match (drag)      t1 checkpoint
//   S2: t2 history sort (drag)        t3 checkpoint
//   S3: t4 disk-map prediction        t5 checkpoint
//   S4: t6 find the open door         t7 protected/exposed t8 checkpoint
//   Report: t9 evidence for court (drag)

export const ANSWERS = {
  t0: {
    d_2fa: 'code',        // 2FA → needs a code from your phone, so the password alone is useless
    d_lock: 'limit',      // lockout → only a handful of guesses allowed
    d_captcha: 'bots',    // CAPTCHA → stops automated bots
    d_pass: 'space',      // long passphrase → too many combinations to try
  },
  t2: {
    h1: 'watch', h2: 'watch', h3: 'accounts', h4: 'accounts',
    h5: 'hide', h6: 'hide', h7: 'none', h8: 'none',
  },
  t4: { f1: 'full', f2: 'gone', f3: 'part', f4: 'full', f5: 'part' },
  // Ashley's phone's patch level is 1 Mar 2023, so only holes fixed after that date are still open.
  t6: { pt_open: ['lockslip', 'picbomb', 'wifispy'], pt_tool: 'lockslip', pt_fix: 'auto' },
  t7: { pe1: 'safe', pe2: 'exposed', pe3: 'exposed', pe4: 'safe', pe5: 'exposed', pe6: 'safe' },
  t9: { r1: 'cookies', r2: 'history', r3: 'photos', r4: 'phone', r5: 'hide' },
};

// Generic marker: every key in the answer key must match.
export function mark(taskId, given) {
  const key = ANSWERS[taskId] || GATES[taskId];
  const out = {};
  for (const q of Object.keys(key)) {
    const want = key[q];
    const got = given?.[q];
    out[q] = Array.isArray(want)
      ? Array.isArray(got) && got.length === want.length && want.every(w => got.includes(w))
      : (got ?? '') === want;
  }
  return out;
}

export function allCorrect(result) {
  return Object.values(result).every(Boolean);
}

// Wait after a wrong "Check answers", so guessing and re-clicking is slow: always 10 s.
export function cooldownSeconds(wrongCount) {
  return 10;
}

// ── Checkpoints: answer N in a row; one wrong answer restarts with a fresh draw ──
// Each question: { id, q, opts: [[key, text] ×4], a: correctKey, why }.
export const CHECKPOINTS = {
  t1: { length: 4, pool: [
    { id: 'bf', q: 'What is a brute force attack?', a: 'b', opts: [
      ['a', 'Tricking someone into giving away their password by email'],
      ['b', 'Trying many passwords automatically until one works'],
      ['c', "Watching over someone's shoulder as they type a PIN"],
      ['d', 'Installing hidden software that records every key pressed']],
      why: 'A brute force attack is a program trying password after password until one works.' },
    { id: 'clues', q: 'Why did the journal clues cut the attack from 54 guesses to 2?', a: 'a', opts: [
      ['a', 'They ruled out most of the possible combinations'],
      ['b', 'They made the computer run each guess much faster'],
      ['c', 'They switched off the lockout on his user account'],
      ['d', 'They told the attacker the password straight away']],
      why: "Every rule the attacker knows removes combinations they'd otherwise have to try." },
    { id: 'suffix', q: 'Why does adding "1" or "!" to the end of a word barely help?', a: 'c', opts: [
      ['a', 'Numbers and symbols are not allowed in most passwords'],
      ['b', 'It makes the password far too long for you to remember easily'],
      ['c', 'Attack software tries those endings on every word anyway'],
      ['d', 'Websites strip the extra characters off when you log in']],
      why: "Crackers apply rules like 'add 1', 'add !' and 'swap a for @' to every word in their dictionary." },
    { id: 'phrase', q: 'Why is "kettle tiger purple moon" so hard to crack?', a: 'd', opts: [
      ['a', 'It mixes capital letters, numbers and lots of symbols'],
      ['b', 'The spaces between the words confuse attack software'],
      ['c', 'Each of the words is too rare to be in any dictionary'],
      ['d', "It is long, and the words have no link to its owner"]],
      why: "Length makes the number of combinations enormous, and random words can't be guessed from facts about you." },
    { id: 'personal', q: 'MARIA23IBIZA is 12 characters long. Why was it still a weak password?', a: 'a', opts: [
      ['a', 'It was built from details anyone reading his journal could see'],
      ['b', 'It used only capitals instead of mixing upper and lower case letters'],
      ['c', 'It had no symbol, and Windows rejects passwords without one'],
      ['d', 'Twelve characters is far too short for any computer password']],
      why: 'Names, places and dates linked to you are the first things a targeted attacker tries.' },
    { id: 'reuse', q: 'Why should you use a different password for every important account?', a: 'b', opts: [
      ['a', 'Websites delete accounts that share the same password'],
      ['b', 'One leaked password would open all your other accounts'],
      ['c', 'Using one password makes your computer run more slowly'],
      ['d', 'It stops websites saving tracking cookies on your device']],
      why: 'Websites get hacked. If you reuse a password, one leak unlocks everything.' },
    { id: 'twofa', q: 'Someone guesses your password, but you have 2-factor login switched on. What happens?', a: 'c', opts: [
      ['a', 'Your account is deleted to protect your private data'],
      ['b', 'They get in, but can only read and not send messages'],
      ['c', 'They still need the code sent to your phone to get in'],
      ['d', 'The website quietly changes your password to a random one']],
      why: 'With 2FA the password alone is not enough. They would need your phone too.' },
  ] },
  t3: { length: 4, pool: [
    { id: 'ck1', q: 'What is a cookie?', a: 'c', opts: [
      ['a', 'A program that secretly records the keys you press'],
      ['b', 'A full copy of a website saved for offline use'],
      ['c', 'A small text file a website stores on your device'],
      ['d', 'A virus hidden inside a downloaded image file']],
      why: 'A cookie is a small text file a website saves so it can recognise you next time.' },
    { id: 'ck2', q: 'Why are the three Instagram cookies strong evidence?', a: 'a', opts: [
      ['a', 'They show all three accounts were logged in on this PC'],
      ['b', 'They contain the full text of every message that was sent'],
      ['c', "They prove that Maria once visited Ashley's house"],
      ['d', 'They reveal which VPN company Ashley was paying for']],
      why: 'Each login cookie names an account, and all three were saved on Ashley’s computer.' },
    { id: 'pb', q: 'What does private (incognito) browsing actually hide?', a: 'd', opts: [
      ['a', 'Your activity from your internet provider'],
      ['b', 'Your activity from the websites you visit'],
      ['c', 'Your activity from the school network'],
      ['d', 'Your history, but only on that one device']],
      why: 'Private browsing only stops your own device keeping a history. Your provider, the school network and websites still see it.' },
    { id: 'carve', q: 'Ashley cleared his history. Why could investigators still read it?', a: 'b', opts: [
      ['a', 'Browsers send a copy of all history to the police'],
      ['b', 'The deleted data stayed on the drive until overwritten'],
      ['c', 'Chrome keeps a hidden backup copy that is never deleted'],
      ['d', "History can't be cleared until the PC has restarted"]],
      why: 'Clearing history deletes the file, but its data stays on the drive until something overwrites it.' },
    { id: 'sig', q: 'How did the carving tool find the history records in unallocated space?', a: 'c', opts: [
      ['a', 'It asked Google for a copy of the deleted history'],
      ['b', 'It read the file names from the emptied Recycle Bin'],
      ['c', 'It searched for the bytes every history record starts with'],
      ['d', 'It guessed the password that locked the deleted history file']],
      why: 'Every type of file starts with its own signature bytes. Carving tools search for them.' },
    { id: 'tracker', q: 'What does a third-party tracking cookie do?', a: 'a', opts: [
      ['a', 'Follows you across sites to build an advertising profile'],
      ['b', 'Stores your password so you never have to type it again'],
      ['c', 'Blocks adverts from loading on the websites you visit'],
      ['d', 'Encrypts your browsing so your internet provider cannot see it']],
      why: 'Tracking cookies let ad networks recognise you on every site that uses them.' },
    { id: 'block', q: 'Which setting best stops advertisers following you from site to site?', a: 'b', opts: [
      ['a', 'Turn on dark mode in your browser settings'],
      ['b', 'Block third-party cookies in your browser'],
      ['c', 'Close each tab as soon as you finish with it'],
      ['d', 'Use a longer password for every website login']],
      why: 'Blocking third-party cookies stops ad networks recognising you across sites.' },
  ] },
  t5: { length: 4, pool: [
    { id: 'del', q: 'When you empty the Recycle Bin, what actually happens?', a: 'b', opts: [
      ['a', 'The file is wiped and its space filled with zeros'],
      ['b', 'Its table entry goes, but the data stays until overwritten'],
      ['c', 'The file moves to a hidden backup folder somewhere on the drive'],
      ['d', 'The file is uploaded to the cloud, then removed']],
      why: 'Only the file table entry is removed. The blocks are marked free but still hold the data.' },
    { id: 'sell', q: "You're selling your old phone. What's the best way to protect your data?", a: 'c', opts: [
      ['a', 'Delete your photos and apps one by one first'],
      ['b', 'Take out the SIM card and the memory card'],
      ['c', 'Turn on encryption, then do a factory reset'],
      ['d', 'Log out of every app before you post it']],
      why: 'Encrypt, then reset: anything left behind is unreadable without the key.' },
    { id: 'table', q: "What does a drive's file table do?", a: 'a', opts: [
      ['a', 'Records which blocks each file is stored in'],
      ['b', 'Stores a backup copy of every file you delete'],
      ['c', 'Shows which programs are running right now'],
      ['d', "Locks files so other people can't open them"]],
      why: "The file table is like a book's contents page: it says where each file's blocks are." },
    { id: 'part', q: 'A deleted file used blocks 5, 6 and 7. A new file has since overwritten block 6. What can be recovered?', a: 'd', opts: [
      ['a', 'All of it, because deleted data is never lost'],
      ['b', 'None of it, as one block means it is all gone'],
      ['c', "All of it, but only if you know the suspect's password"],
      ['d', 'Part of the file: the data left in blocks 5 and 7']],
      why: 'Overwritten blocks are gone for good, but the untouched blocks can still be read.' },
    { id: 'meta', q: "How did investigators link the recovered photos to Ashley's Samsung phone?", a: 'b', opts: [
      ['a', "Samsung prints the owner's name on every photo"],
      ['b', "The camera model is saved in each photo's metadata"],
      ['c', "The file names always start with the phone's number"],
      ['d', 'Only Samsung phones can save files as .jpg images']],
      why: 'Photo metadata stores the camera model, date and time (and often GPS location).' },
    { id: 'enc', q: 'Why does encrypting a phone before a factory reset protect your data?', a: 'a', opts: [
      ['a', 'Any data left behind is unreadable without the key'],
      ['b', 'Encryption deletes every file twice to be extra safe'],
      ['c', 'It uploads your files to the cloud, then wipes them'],
      ['d', 'It stops the phone from turning on for a new owner']],
      why: 'Even if blocks survive the reset, encrypted data is scrambled without the key.' },
  ] },
  t8: { length: 4, pool: [
    { id: 'patch', q: 'What is a security patch?', a: 'c', opts: [
      ['a', 'A program that scans your files for viruses'],
      ['b', 'A backup copy of your files kept in the cloud'],
      ['c', 'An update that fixes a known security hole'],
      ['d', 'A sticker that covers your webcam lens']],
      why: 'A patch is a fix for a security hole, sent out in an update.' },
    { id: 'public', q: 'Why is a device in more danger once a patch has been released?', a: 'a', opts: [
      ['a', 'The patch tells criminals that the hole exists'],
      ['b', 'Patches make devices that skip them run slowly'],
      ['c', 'Old devices can no longer connect to Wi-Fi'],
      ['d', 'The maker deletes its files as a warning']],
      why: 'Once a fix is published, anyone can learn about the hole and target devices that skipped it.' },
    { id: 'level', q: 'A phone\'s patch level is 1 May 2024. Which hole is still open on it?', a: 'd', opts: [
      ['a', 'A hole that was fixed on 1 January 2024'],
      ['b', 'A hole that was fixed on 1 March 2024'],
      ['c', 'A hole that was fixed on 1 May 2024'],
      ['d', 'A hole that was fixed on 1 August 2024']],
      why: 'Only holes fixed after the patch level date are still open.' },
    { id: 'lab', q: 'How did the lab get past the PIN on Ashley’s phone?', a: 'b', opts: [
      ['a', 'It tried every 6-digit PIN until one worked'],
      ['b', 'It used a hole a skipped update would fix'],
      ['c', 'Instagram sent the police the phone\'s PIN'],
      ['d', 'The PIN was written down in Ashley\'s journal']],
      why: 'Ashley’s phone was on an old patch level, so the LockSlip hole was still open.' },
    { id: 'law', q: 'Why can police examiners use a hole like this when you cannot?', a: 'a', opts: [
      ['a', 'They have a warrant; for anyone else it is a crime'],
      ['b', 'The tools only work on phones owned by the police'],
      ['c', 'It is legal for anyone, as long as they own the tool'],
      ['d', 'Only the police know that phones have security holes']],
      why: 'Getting into a device without permission is an offence under the Computer Misuse Act 1990.' },
    { id: 'auto', q: 'What is the easiest way to keep a device patched?', a: 'c', opts: [
      ['a', 'Only update when the device starts running slowly'],
      ['b', 'Wait a year in case new updates contain bugs'],
      ['c', 'Turn on automatic updates and restart when asked'],
      ['d', 'Delete any apps you have not opened recently']],
      why: 'Automatic updates install fixes as soon as they are released.' },
    { id: 'eol', q: 'A tablet no longer gets updates from its maker. What is the safest choice?', a: 'b', opts: [
      ['a', 'Keep using it, as old devices are never targeted'],
      ['b', 'Replace it, or keep nothing private on it'],
      ['c', 'Install a VPN, which closes all the holes'],
      ['d', 'Factory reset it once a month to stay safe']],
      why: 'With no more patches, every new hole found stays open for good.' },
  ] },
};

export const TASK_COUNT = Object.keys(ANSWERS).length + Object.keys(CHECKPOINTS).length;

export function checkpointQuestion(taskId, qid) {
  return CHECKPOINTS[taskId].pool.find(q => q.id === qid);
}

// The questions for one attempt. Deterministic for (seed, attempt) so a reload shows the
// same run, but every restart draws a new set in a new order.
export function drawCheckpoint(taskId, seed, attempt) {
  const cp = CHECKPOINTS[taskId];
  const rnd = seededRandom(`${seed}|${taskId}|${attempt}`);
  return shuffled(cp.pool.map(q => q.id), rnd).slice(0, cp.length);
}

// Option order for one question in one attempt.
export function optionOrder(taskId, qid, seed, attempt) {
  const q = checkpointQuestion(taskId, qid);
  return shuffled(q.opts.map(o => o[0]), seededRandom(`${seed}|${taskId}|${attempt}|${qid}`));
}

export function shuffled(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Evidence logs: short ungraded checks that gate the next step ─────────────
export const GATES = {
  cookies: {
    ck_acc: ['sk8r.ellie', 'dance.mad.jess', 'music_lover_kay'], // tick every account logged in on Ashley's computer
    ck_trk: 'trackr',
  },
  recov: { rc_dev: 'samsung', rc_file: 'logins', rc_lost: 'img0418' },
  extract: { ex_why: 'fixed', ex_new: 'sent', ex_who: 'anyone' },
};

// ── Station 2: carving the history out of unallocated space ──────────────────
// Every Chrome history record starts with the same signature bytes. Decoys include
// other file types and near-misses with the bytes in the wrong order.
export const HISTORY_SIGNATURE = '68 69 73 74';
export const CARVE_BLOCKS = [
  { id: 'b01', hex: '68 69 73 74 01 9A', entry: 'h1' },
  { id: 'b02', hex: '68 69 73 74 02 4C', entry: 'h2' },
  { id: 'b03', hex: '68 69 73 74 03 E1', entry: 'h3' },
  { id: 'b04', hex: '68 69 73 74 04 07', entry: 'h4' },
  { id: 'b05', hex: '68 69 73 74 05 B2', entry: 'h5' },
  { id: 'b06', hex: '68 69 73 74 06 5D', entry: 'h6' },
  { id: 'b07', hex: '68 69 73 74 07 C8', entry: 'h7' },
  { id: 'b08', hex: '68 69 73 74 08 33', entry: 'h8' },
  { id: 'd01', hex: 'FF D8 FF E0 00 10', kind: 'jpg' },
  { id: 'd02', hex: 'FF D8 FF E1 2A 0C', kind: 'jpg' },
  { id: 'd03', hex: '50 4B 03 04 14 00', kind: 'zip' },
  { id: 'd04', hex: '47 41 4D 45 00 02', kind: 'game' },
  { id: 'd05', hex: '00 00 00 00 00 00', kind: 'zero' },
  { id: 'd06', hex: '68 69 74 73 02 4C', kind: 'near' },
  { id: 'd07', hex: '68 96 73 74 05 B2', kind: 'near' },
  { id: 'd08', hex: '86 96 37 47 01 9A', kind: 'near' },
];
export function isHistoryBlock(block) {
  return block.hex.startsWith(HISTORY_SIGNATURE);
}
export const CARVE_TARGET = CARVE_BLOCKS.filter(isHistoryBlock).length;
// Seconds the scanner locks after clicking a block that isn't a history record.
export const CARVE_PENALTY = 3;

// ── Station 3: predict each step of the deleting demo before seeing it ───────
// step = the demo step the question unlocks (1 = after saving, 2 = delete, 3 = new file).
export const DEMO_PREDICT = {
  2: { q: 'You delete holiday.jpg and empty the bin. What do you think happens to blocks 3 to 7?', a: 'b', opts: [
    ['a', 'They are wiped clean straight away'],
    ['b', 'They keep the photo but are marked free'],
    ['c', 'They move to a hidden backup area']],
    why: 'Wiping takes time, so the drive only crosses out the file table entry and marks the blocks free.' },
  3: { q: 'Now you save a new file. Where can the drive put it?', a: 'a', opts: [
    ['a', 'In any free block, including the old photo\'s'],
    ['b', 'Only in blocks that have never been used'],
    ['c', 'Nowhere until the old photo is wiped']],
    why: "The old photo's blocks are marked free, so a new file can reuse them." },
};

// ── Station 3: disk map ──────────────────────────────────────────────────────
// Deleted files and the blocks they used. A block is overwritten when a newer file now uses it.
export const DELETED_FILES = [
  { id: 'f1', name: 'IMG_0412.jpg', blocks: [2, 3, 4] },
  { id: 'f2', name: 'IMG_0418.jpg', blocks: [8, 9] },
  { id: 'f3', name: 'logins.txt',   blocks: [12, 13, 14] },
  { id: 'f4', name: 'IMG_0425.jpg', blocks: [18, 19, 20] },
  { id: 'f5', name: 'signup.png',   blocks: [25, 26, 27] },
];
export const OVERWRITTEN_BLOCKS = [8, 9, 14, 26];
export const DISK_BLOCKS = 32;

export function recoveryStatus(file, overwritten = OVERWRITTEN_BLOCKS) {
  const hit = file.blocks.filter(b => overwritten.includes(b)).length;
  if (hit === 0) return 'full';
  if (hit === file.blocks.length) return 'gone';
  return 'part';
}

// ── Written answers ──────────────────────────────────────────────────────────
export const MIN_JUSTIFICATION = 15;

// A real sentence: 15+ characters, 4+ words, not just one word repeated or keyboard mashing.
export function justificationOk(text) {
  const t = (text || '').trim();
  if (t.length < MIN_JUSTIFICATION) return false;
  const words = t.toLowerCase().match(/[a-z']+/g) || [];
  if (words.length < 4) return false;
  if (new Set(words).size < 3) return false;
  if (/(.)\1{4,}/.test(t)) return false;
  return words.some(w => /[aeiouy]/.test(w) && w.length >= 3);
}

export function protectReady(choices) {
  // choices: [{ id, text }]
  return (choices || []).filter(c => justificationOk(c.text)).length >= 3;
}

// ── Extension: Breach Defence ────────────────────────────────────────────────

export const DEFENCES = {
  pass:   { icon: '🔑', name: 'Long passphrase' },
  twofa:  { icon: '📲', name: '2-factor login' },
  lock:   { icon: '🔒', name: 'Screen lock' },
  vpn:    { icon: '🛡️', name: 'VPN' },
  wipe:   { icon: '🧹', name: 'Encrypt + reset' },
  cookie: { icon: '🍪', name: 'Block cookies' },
  update: { icon: '⬆️', name: 'Install updates' },
  perms:  { icon: '📍', name: 'App permissions' },
  backup: { icon: '💾', name: 'Back up files' },
  think:  { icon: '🤔', name: 'Don\'t click it' },
};

// Each threat: the best defence (full points) and any that partly help (some points).
export const THREATS = [
  { id: 'bf',    text: 'A bot is trying 10,000 passwords a second on your gaming account.', best: 'pass', ok: ['twofa'], why: "A long passphrase has too many combinations for a bot to ever reach." },
  { id: 'leak',  text: 'Your password leaked in a website hack. Someone tries it on your email.', best: 'twofa', ok: ['pass'], why: "With 2FA the leaked password alone won't get in. They'd need your phone too." },
  { id: 'desk',  text: 'You leave your laptop open in the library while you get a drink.', best: 'lock', ok: [], why: "Lock it (Windows key + L). Anyone could read or send messages as you in seconds." },
  { id: 'phone', text: 'Your phone is stolen from your bag on the bus.', best: 'lock', ok: ['wipe'], why: "A screen lock (PIN or face) stops the thief opening your apps and photos." },
  { id: 'cafe',  text: 'You\'re on free café Wi-Fi. Someone on the same network is snooping.', best: 'vpn', ok: [], why: "A VPN encrypts everything between you and the VPN server, so snoopers see nonsense." },
  { id: 'hotel', text: 'You log in to your bank app on hotel Wi-Fi abroad.', best: 'vpn', ok: ['twofa'], why: "On untrusted Wi-Fi a VPN encrypts your traffic before it leaves your device." },
  { id: 'sell',  text: 'You\'re selling your old phone online next week.', best: 'wipe', ok: ['backup'], why: "Deleting isn't enough (remember Station 3). Encrypt, then factory reset." },
  { id: 'bin',   text: 'You "deleted" private photos and emptied the bin before giving away your laptop.', best: 'wipe', ok: [], why: "Emptied files stay on the drive until overwritten. Encrypt and reset before it leaves you." },
  { id: 'ads',   text: 'Adverts keep following you from site to site after you shop for trainers.', best: 'cookie', ok: [], why: "Blocking third-party cookies stops ad networks recognising you on every site." },
  { id: 'track', text: 'A website tracker is building a profile of everything you browse.', best: 'cookie', ok: ['vpn'], why: "Tracking cookies are how sites follow you. Block or clear them." },
  { id: 'vuln',  text: 'Hackers are using a known security hole in an old version of your browser.', best: 'update', ok: [], why: "Updates patch known security holes. Old versions are an open door." },
  { id: 'os',    text: 'Your laptop keeps saying "restart to install security fixes". You keep clicking later.', best: 'update', ok: [], why: "Those restarts install security fixes. Delaying them leaves you exposed." },
  { id: 'torch', text: 'A free torch app wants your location, contacts and microphone.', best: 'perms', ok: [], why: "A torch needs none of that. Deny permissions an app doesn't need." },
  { id: 'loc',   text: 'A game app is quietly logging your location 24/7, like the apps in Lesson 2.', best: 'perms', ok: [], why: "Check app permissions and switch location to 'only while using' or off." },
  { id: 'ransom',text: 'Ransomware locks every file on your laptop and demands payment.', best: 'backup', ok: ['update'], why: "With a backup you can restore your files without paying." },
  { id: 'dead',  text: 'Your laptop\'s hard drive fails the night before your coursework is due.', best: 'backup', ok: [], why: "Only a backup saves files from a dead drive." },
  { id: 'phish', text: 'A text says "Your parcel is held, pay £1.45 here" with a link.', best: 'think', ok: [], why: "It's a scam (phishing). Don't click. Check the real courier website instead." },
  { id: 'dm',    text: 'A stranger DMs: "Free skins! Just log in on this page with your password."', best: 'think', ok: ['twofa'], why: "Fake login pages steal passwords. Never type your password into a link from a stranger." },
];

export const LIVES = 3;
export const BASE_POINTS = 100;
export const PARTIAL_POINTS = 30;
export const SPEED_BONUS = 100;

// Seconds allowed per card: starts at 20 and shrinks every 5 cards, never below 8.
export function timeLimit(cardIndex) {
  return Math.max(8, 20 - Math.floor(cardIndex / 5) * 3);
}

// Streak multiplier: x1, then x2 from 3 in a row, x3 from 6, x4 from 10.
export function multiplier(streak) {
  if (streak >= 10) return 4;
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

// Score one play. secondsLeft rewards speed: up to +100, in proportion to the time left.
// Returns { result: 'best'|'ok'|'wrong', points, streak, lifeLost }.
export function scorePlay(threat, defenceId, secondsLeft, limit, streak) {
  if (defenceId === threat.best) {
    const newStreak = streak + 1;
    const speed = Math.round(SPEED_BONUS * Math.max(0, Math.min(1, secondsLeft / limit)));
    return { result: 'best', points: (BASE_POINTS + speed) * multiplier(newStreak), streak: newStreak, lifeLost: false };
  }
  if (threat.ok.includes(defenceId)) {
    return { result: 'ok', points: PARTIAL_POINTS, streak: 0, lifeLost: false };
  }
  return { result: 'wrong', points: 0, streak: 0, lifeLost: true };
}

// Rank titles shown on the game-over screen.
export const RANKS = [
  [0, 'Trainee'], [1000, 'Evidence Officer'], [2500, 'Forensic Technician'],
  [5000, 'Digital Investigator'], [8000, 'Senior Analyst'], [12000, 'Head of Cyber Unit'],
];

export function rankFor(score) {
  let r = RANKS[0][1];
  for (const [min, name] of RANKS) if (score >= min) r = name;
  return r;
}

// Deterministic shuffle so a "class challenge" code gives everyone the same card order.
export function seededRandom(seed) {
  let s = 0;
  for (const ch of String(seed).toUpperCase()) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  if (!s) s = 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

// A long run of threats (cycled reshuffles) so no card repeats back-to-back.
export function buildDeck(seed, length = 120) {
  const rnd = seed ? seededRandom(seed) : Math.random;
  const deck = [];
  while (deck.length < length) {
    const round = THREATS.slice();
    for (let i = round.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [round[i], round[j]] = [round[j], round[i]];
    }
    if (deck.length && round[0].id === deck[deck.length - 1].id) round.push(round.shift());
    deck.push(...round);
  }
  return deck.slice(0, length);
}

// The defence cards offered for a threat: the best answer plus distractors, shuffled.
// Always 4 cards; partly-right cards may appear as distractors.
export function handFor(threat, rnd = Math.random) {
  const others = Object.keys(DEFENCES).filter(d => d !== threat.best);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const hand = [threat.best, ...others.slice(0, 3)];
  for (let i = hand.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [hand[i], hand[j]] = [hand[j], hand[i]];
  }
  return hand;
}
