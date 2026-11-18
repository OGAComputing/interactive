// ISYS (I Say, You Say) — ppt-guidelines.md §10. Shared by Y9_Python/sz_kit.cjs (Y9, Y8) and Y10_BTEC_CDM/c1_kit.cjs.
//
//   K.isys(slide, { term: 'Bit', fact: 'one binary digit',
//                   say: 'A bit is one binary digit: a 0 or a 1.' });
//
// Draws the ISYS dot on that slide (bottom right, just left of the slide number, in its colour) and,
// when the deck is written, adds the teacher script to the slide's notes and lists the lesson's
// phrases at the top of slide 1's notes. The build fails if a lesson has no phrase or more than three,
// a phrase is longer than 4 words, one term is given two different facts, or the Say line doesn't
// contain the term and the fact word for word.

const words = (t) => String(t).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

module.exports = function createIsys(pres) {
  const moments = [];
  const facts = new Map();

  function add(s, { term, fact, say } = {}, drawDot) {
    if (!term || !fact || !say) throw new Error('isys() needs term, fact and say');
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
    facts.set(term, fact);
    if (!moments.some((m) => m.s === s)) drawDot();
    moments.push({ s, term, fact, say });
  }

  const script = ({ term, fact, say }) => [
    'ISYS:',
    `- Say: "${say}"`,
    `- I say, you say: "${term}" … "${fact}"`,
    `- Check (in 3, 2, 1): "What is ${fact}?" → "${term}"`,
    `- Reverse (in 3, 2, 1): "What does ${term} mean?" → "${fact}"`,
  ].join('\n');
  const hasNotes = (s) => s._slideObjects.some((o) => o._type === 'notes');
  const note = (text) => ({ _type: 'notes', text: [{ text }] });

  // Called by the kit's write(), after every slide is made. template: true skips the 1–3 rule
  // (the deck template shows one example of everything, not a lesson).
  function finish({ template = false } = {}) {
    if (!template && (facts.size < 1 || facts.size > 3)) {
      throw new Error(`A lesson needs 1–3 ISYS phrases; this deck has ${facts.size}. Add them with K.isys(slide, { term, fact, say }).`);
    }
    moments.forEach((m) => m.s._slideObjects.push(note((hasNotes(m.s) ? '\n\n' : '') + script(m))));
    if (!moments.length) return;
    const first = new Map();
    moments.forEach((m) => { if (!first.has(m.term)) first.set(m.term, { ...m, n: pres.slides.indexOf(m.s) + 1 }); });
    const summary = ['ISYS THIS LESSON (I say, you say; slides marked with the dot by the slide number):',
      ...[...first.values()].sort((a, b) => a.n - b.n).map((m) => `- "${m.term}" … "${m.fact}" (slide ${m.n})`)].join('\n');
    const s1 = pres.slides[0];
    s1._slideObjects.unshift(note(summary + (hasNotes(s1) ? '\n\n' : '')));
  }

  return { add, finish, get count() { return facts.size; } };
};
