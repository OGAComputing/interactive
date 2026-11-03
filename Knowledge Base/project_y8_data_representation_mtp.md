# Y8 Data Representation — Medium Term Plan

Topic question: *How do computers represent and process different types of data using binary?*
Source: the department's Google Slides "Data Representation - Lesson 1" (lesson overview slide).
Pages live in `Y8/Data_Representation/L<n>_…/`.

| Lesson | Question | Page |
|---|---|---|
| 1 | How are denary numbers represented in binary using 1s and 0s? | `L1_Binary_And_Denary/1_Binary_And_Denary.html` |
| 2 | How do I add two binary numbers? | — |
| 3 | How do I represent binary numbers with fewer digits using hexadecimal? | — |
| 4 | How is binary logic used to represent a real-world problem? | `Y8/Theory/BooleanLogic.html` (built earlier, topic-level) |
| 5 | How can we represent text and images in binary? | — |
| 6 | How can we represent sound in binary? | — |
| 7 | How can I improve my understanding of Data Representation? | — |

## Lesson 1 — Binary and denary

**Declarative knowledge:** denary is base 10, the system we use every day; binary is base 2, used
by computers because they are made of switches with two states (on/off); convert binary ↔ denary
with the headings table.

**Keywords:** denary, binary, bit, nibble (4 bits), byte (8 bits), conversion.

**Sequence (page tabs = deck sections, same order):**
1. Starter: A=1…Z=26 cipher → "There are ten types of people that understand binary".
2. Keywords: match word to meaning.
3. Headings: denary place value worked example (4205 = 4000 + 200 + 0 + 5), then binary headings
   128 … 1 (each ×2 the one on its right).
4. Binary → denary: worked example 1101 = 8 + 4 + 1 = 13; add the headings with a 1 under them;
   blanks count as 0. Practice fades support: highlighted columns + sum → bits only → bare number.
5. Denary → binary "does it fit?": worked example 22 → 00010110 (start at 128; fits → 1 and
   subtract; doesn't → 0). Then two guided numbers, one heading at a time.
6. Denary → binary on your own (toggle 8 bits).
7. Plenary: 6 in a row, alternating directions, getting bigger (slide plenary: 0111, 8, 1111, 9,
   10101, 25, 110110, 36).

The page replaces the old "Conversions Task" spreadsheet and "Binary Game" links.

## Decisions

- 2026-11-03: Unit placed in Year 8 (teacher confirmed). Deck rebuilt for cognitive load: labels on
  the place-value grid itself (no separate key), one step per slide, worked example → faded
  practice, no decorative images or duplicated narration text.
