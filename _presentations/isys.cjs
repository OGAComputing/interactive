// ISYS (I Say, You Say) — ppt-guidelines.md §10. Shared by Y9_Python/sz_kit.cjs (Y9, Y8) and Y10_BTEC_CDM/c1_kit.cjs.
//
//   K.isys(slide, { term: 'Bit', fact: 'one binary digit',
//                   say: 'A bit is one binary digit: a 0 or a 1.' });
//
// On that slide: the phrase ("Bit … one binary digit") in the bottom-right corner and a small dot just
// left of the slide number, both in the slide number's colour, and the teacher script in its notes.
// The deck's slide 1 is a hidden teacher slide (it never shows in the slideshow) listing the lesson's
// phrases, with the same list at the top of its notes. Slides are numbered from 0, so the hidden
// slide is 0 and the first slide students see (Recap & Recall) is still 1.
// The build fails if a lesson has no phrase or more than three, a phrase is longer than 4 words,
// one term is given two different facts, or the Say line doesn't contain the term and the fact.
//
// Check and Reverse default to "What is <fact>?" and "What does <term> mean?". Those only read well
// when the fact is a noun phrase ("a whole number"). When it is a verb or a clause ("stores data",
// "takes it in"), give the questions yourself; the answers stay the term and the fact:
//   K.isys(s, { term: 'Variable', fact: 'stores data', say: '…',
//               check: 'What stores data?', reverse: 'What does a variable do?' });
// The build prints every Check and Reverse question: read each one aloud before you keep it.

const path = require('path');
const requireGlobal = (name) => {
  try { return require(name); } catch {
    const root = require('child_process').execSync('npm root -g').toString().trim();
    try { return require(path.join(root, name)); } catch { return require(path.join(root, 'pptxgenjs', 'node_modules', name)); }
  }
};

const words = (t) => String(t).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const label = ({ term, fact }) => `${term} … ${fact}`;
// Does text contain phrase as whole words ("Print" is not in "printed", "A" is not in "What")?
const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (text, phrase) => new RegExp(`(^|[^\\p{L}\\p{N}])${escape(phrase)}($|[^\\p{L}\\p{N}])`, 'iu').test(text);

// kit: { teacherSlide, mark(s, text), teacher(s, phrases) } — the kit draws in its own look.
// phrases: [{ term, fact, say, n }] in slide order, n = the slide number students see.
module.exports = function createIsys(pres, kit) {
  const moments = [];
  const facts = new Map();

  const asked = new Map();
  function add(s, { term, fact, say, check, reverse } = {}) {
    if (!term || !fact || !say) throw new Error('isys() needs term, fact and say');
    check = check || `What is ${fact}?`;
    reverse = reverse || `What does ${term} mean?`;
    if (has(check, term)) throw new Error(`ISYS Check question gives away its answer "${term}": "${check}"`);
    if (has(reverse, fact)) throw new Error(`ISYS Reverse question gives away its answer "${fact}": "${reverse}"`);
    if (asked.has(term) && asked.get(term) !== check + '|' + reverse) {
      throw new Error(`ISYS "${term}" is asked two different ways: give it the same Check and Reverse questions every time`);
    }
    for (const [name, t] of [['term', term], ['fact', fact]]) {
      if (words(t) > 4) throw new Error(`ISYS ${name} "${t}" is ${words(t)} words: keep it to 1–4`);
    }
    if (facts.has(term) && facts.get(term) !== fact) {
      throw new Error(`ISYS "${term}" is "${facts.get(term)}" on one slide and "${fact}" on another: word it the same every time`);
    }
    const low = say.toLowerCase();
    if (!low.includes(term.toLowerCase()) || !low.includes(fact.toLowerCase())) {
      throw new Error(`ISYS Say line must contain "${term}" and "${fact}" word for word: "${say}"`);
    }
    if (s === kit.teacherSlide) throw new Error('ISYS goes on the slide where the term is taught, not the teacher slide');
    facts.set(term, fact);
    asked.set(term, check + '|' + reverse);
    moments.push({ s, term, fact, say, check, reverse });
  }

  const script = ({ term, fact, say, check, reverse }) => [
    'ISYS:',
    `- Say: "${say}"`,
    `- I say, you say: "${term}" … "${fact}"`,
    `- Check (in 3, 2, 1): "${check}" → "${term}"`,
    `- Reverse (in 3, 2, 1): "${reverse}" → "${fact}"`,
  ].join('\n');
  const hasNotes = (s) => s._slideObjects.some((o) => o._type === 'notes');
  const note = (text) => ({ _type: 'notes', text: [{ text }] });

  // Called by the kit's write(), after every slide is made. template: true skips the 1–3 rule
  // (the deck template shows one example of everything, not a lesson).
  function finish({ template = false } = {}) {
    if (!template && (facts.size < 1 || facts.size > 3)) {
      throw new Error(`A lesson needs 1–3 ISYS phrases; this deck has ${facts.size}. Add them with K.isys(slide, { term, fact, say }).`);
    }
    const slides = [...new Set(moments.map((m) => m.s))];
    for (const s of slides) kit.mark(s, moments.filter((m) => m.s === s).map(label).join('  ·  '));
    moments.forEach((m) => m.s._slideObjects.push(note((hasNotes(m.s) ? '\n\n' : '') + script(m))));

    const first = new Map();
    moments.forEach((m) => { if (!first.has(m.term)) first.set(m.term, { ...m, n: pres.slides.indexOf(m.s) }); });
    const phrases = [...first.values()].sort((a, b) => a.n - b.n);
    kit.teacher(kit.teacherSlide, phrases);
    // Read these aloud: each must sound like a real question with exactly one answer.
    phrases.forEach((m) => console.log(`ISYS  ${label(m)}
      Check:   ${m.check} → ${m.term}
      Reverse: ${m.reverse} → ${m.fact}`));
    const summary = ['ISYS THIS LESSON (I say, you say). This slide is hidden: students never see it. '
      + 'ISYS slides show the phrase and a dot by the slide number.',
    ...phrases.map((m) => `- "${m.term}" … "${m.fact}" (slide ${m.n})`),
    ...phrases.map((m) => '\n' + script(m))].join('\n');
    kit.teacherSlide._slideObjects.unshift(note(summary + (hasNotes(kit.teacherSlide) ? '\n\n' : '')));
  }

  return { add, finish, label, get count() { return facts.size; } };
};

// Hidden slide 1 is numbered 0, so every slide students see keeps its number.
module.exports.numberFromZero = async function numberFromZero(buf) {
  const JSZip = requireGlobal('jszip');
  const zip = await JSZip.loadAsync(buf);
  const f = 'ppt/presentation.xml';
  let xml = await zip.file(f).async('string');
  xml = xml.replace(/<p:presentation\b([^>]*?)(\s+firstSlideNum="\d+")?(\s*\/?)>/, (all, attrs, _n, end) =>
    `<p:presentation${attrs} firstSlideNum="0"${end}>`);
  zip.file(f, xml);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
};
