---
name: y8-data-representation-mtp
description: "Y8 Data Representation — 7-lesson medium-term plan (binary, binary addition, hex, logic gates, text & images, sound, assessment + SRT): the declarative and procedural knowledge per lesson. Activities and decks are designed from scratch from this file."
metadata:
  type: project
---

# Y8 Data Representation — Medium Term Plan

**Scope:** 7 × 1-hour lessons: 6 teaching lessons + 1 assessment and SRT. Y8 Python Unit 1 follows.

**Topic question:** How do computers represent and process different types of data using binary?

**Prior learning:** block-based programming with variables. Students know computers store and process data, but not how it is represented.

## Build from scratch — decision (2026-11-03)
Design every activity and deck for this unit **from this file only**. Don't look at earlier
versions of these lessons for ideas: not git history, not the department's Google Drive unit folder
or its slides and worksheets, and not any removed pages or decks. Those taught the unit in a way
this plan replaces. Choose starters, worked examples, tasks and plenaries fresh, from the knowledge
below and the house style. Only use an old resource if the teacher explicitly asks for it.

## Procedural focus and keywords — decision (2026-11-03)
L1–L3 are about **doing** the conversions and the addition. Teach the method with worked examples and practice, and keep the declarative load to what the method needs. Each "Declarative" list holds only what students need for that lesson's tasks.

- **A term is introduced in the first lesson whose procedure needs it**, not earlier:

  | Term | Lesson | Why then |
  |---|---|---|
  | binary, denary, bit | L1 | Needed to name what is being converted |
  | carry | L2 | The one new word in the addition method |
  | hexadecimal, nibble | L3 | Binary → hex works by splitting into 4-bit nibbles |
  | AND, OR, NOT, truth table | L4 | Needed to name and complete the gates' tables |
  | ASCII, pixel, bit depth, byte | L5 | Byte's first real use: 1 byte per colour channel |
  | sample, sample rate | L6 | Bit depth comes back from L5, now for sound |

- **No keyword that only restates an everyday word** (e.g. "conversion", "addition").
- **"Base 2 / base 10 / base 16" is optional.** No procedure needs it. Say "binary uses two digits, denary uses ten, hex uses sixteen".
- **Leading zeros are a procedural step** ("pad to 8 bits"), not a fact to learn.

## 4 bits before 8 — decision (2026-11-03)
In L1, students learn both conversion methods on four headings (8 4 2 1) first, where the numbers
are small enough to hold in their heads. They only move to 8 bits once they can convert both ways
with no help on screen. The 8-bit work extends the same two methods by doubling the headings
further.

## Every bit shown — decision (2026-11-03, L1 build)
Don't ask students to convert a binary number with fewer bits than the headings (e.g. 110 under
8 4 2 1, lined up on the right with empty columns). Nick: it is confusing. Every binary number they
convert shows all its bits, leading 0s included (0110, not 110). Padding to 8 bits stays, as its own
step where adding the 0s is the task.

---

## Lesson 1 — Binary and denary conversion
**Lesson question:** How are denary numbers represented in binary using 1s and 0s?
**Keywords:** binary, denary, bit

### Declarative
- Denary is the number system we use every day. It has ten digits, 0–9.
- Binary has only two digits, 0 and 1.
- Computers use binary because they are made of switches that are either on (1) or off (0).
- A bit is one binary digit, a 0 or a 1.
- Binary column headings double from right to left: 1, 2, 4, 8, then 16, 32, 64, 128.

### Procedural
- Write out the binary headings before any conversion.
- **Binary → denary:** write each bit under its heading (the number always shows all its bits, 0s included), then add up the headings that have a 1 under them.
- **Denary → binary:** work from the biggest heading down. If the heading fits into what's left, write 1 and subtract it; if not, write 0. Carry on until nothing is left.
- Do both conversions confidently with 4 bits (0–15) before extending to 8 bits (0–255).
- Write answers as 8 bits by padding with leading zeros, knowing the value doesn't change.

---

## Lesson 2 — Binary addition
**Lesson question:** How do I add two binary numbers?
**Keywords:** carry (binary and bit are retrieval from L1)

*Decision (Nick, 2026-11-10): the activity page starts at whole 4-bit sums. Lesson 1 recall is done in the deck's starter, and the four rules are modelled from the deck, so the page has no tasks for either.*

### Declarative
- Binary addition works like denary column addition: right to left, carrying into the next column.
- In denary you carry when a column reaches 10. In binary you carry when a column reaches 2.
- The four rules:
  - 0 + 0 = 0
  - 0 + 1 = 1
  - 1 + 1 = 0, carry 1 to the left
  - 1 + 1 + 1 = 1, carry 1 to the left

### Procedural
- Recall both conversion methods from Lesson 1.
- Write the two numbers in columns, right-aligned, padding the shorter one with leading zeros.
- Add each column right to left, write any carry above the next column, and include the carried 1 in that column's sum.
- Write a final carry as a new leftmost bit, so the answer can be one bit longer.

---

## Lesson 3 — Hexadecimal
**Lesson question:** How do I represent binary numbers with fewer digits using hexadecimal?
**Keywords:** hexadecimal, nibble

### Declarative
- Hexadecimal (hex) has sixteen digits: 0–9, then A–F.
- A = 10, B = 11, C = 12, D = 13, E = 14, F = 15, so 10–15 each fit in one character.
- A nibble is 4 bits. One hex digit stands for exactly one nibble, so 8 bits are two hex digits.
- People use hex because it is a shorter way to write binary, so it is easier to read and remember. The computer still stores binary.

### Procedural
- **Binary → hex:** split the 8 bits into two nibbles, convert each nibble to denary using 8 4 2 1, turn 10–15 into A–F, then join the two digits.
- **Hex → binary:** take each hex digit, turn any letter into its denary value, write each as a 4-bit nibble with leading zeros, then join them.

---

## Lesson 4 — Logic gates and truth tables
**Lesson question:** How is binary logic used to represent a real-world problem?
**Keywords:** AND, OR, NOT, truth table

### Declarative
- A logic gate takes inputs of 1 (on) or 0 (off) and gives one output.
- **AND:** output 1 only when both inputs are 1.
- **OR:** output 1 when at least one input is 1.
- **NOT:** one input, and the output is the opposite.
- Each gate has its own symbol.
- A truth table lists the output for every combination of inputs (4 rows for two inputs, 2 for one).
- In a circuit, one gate's output becomes the next gate's input.

### Procedural
- Apply AND, OR and NOT to everyday conditions.
- Name a gate from its symbol.
- Complete the truth tables for AND, OR and NOT.
- Trace a two-gate circuit: work out the first gate's output, use it as an input to the second gate, and complete the truth table for the final output.

---

## Lesson 5 — Representing text and images
**Lesson question:** How can we represent text and images in binary?
**Keywords:** ASCII, pixel, bit depth, byte

### Declarative
- ASCII gives every character its own binary code.
- An image is made of pixels, and each pixel's colour is stored as a binary code.
- Bit depth is the number of bits per pixel. Each extra bit doubles the number of colours.
- A byte is 8 bits. A full-colour pixel uses one byte each for red, green and blue, so 3 bytes, usually written as hex.
- Higher bit depth means better quality and a bigger file. More pixels also means a bigger file.

### Procedural
- Decode text from ASCII: convert each 8-bit code to denary, then look the character up in the ASCII table.
- Draw an image from a grid of binary pixel codes and a colour key, and encode an image the other way.
- Work out how many colours a bit depth gives (double for each bit).
- Turn a pixel's red, green and blue bytes into a hex colour code.
- Predict how bit depth and pixel count affect quality and file size, and explain why.

---

## Lesson 6 — Representing sound
**Lesson question:** How can we represent sound in binary?
**Keywords:** sample, sample rate, bit depth (from L5)

### Declarative
- Sound is a continuous wave. To store it, the computer measures the wave at regular intervals (each measurement is a sample) and stores each one in binary.
- Sample rate is how many samples are taken per second. Higher means closer to the real sound, so better quality and a bigger file.
- Bit depth is the number of bits per sample. Higher means more accurate values, so better quality and a bigger file.
- Better quality always means a bigger file. A stream needs small files so it doesn't buffer.

### Procedural
- Read a wave's value at each sample point, convert each value to binary, and plot the result. Compare how well a higher and a lower sample rate rebuild the wave.
- Compare recordings at different quality settings, by ear and by file size.
- Choose and justify the lowest acceptable settings for a given use.
- Explain what sample rate and bit depth mean, and how each affects quality and file size.

---

## Lesson 7 — Assessment and SRT
**Lesson question:** How can I improve my understanding of Data Representation?

### Declarative
- No new content. Retrieval of the unit keywords: binary, denary, bit, carry, hexadecimal, nibble, AND, OR, NOT, truth table, ASCII, pixel, bit depth, byte, sample, sample rate.

### Procedural
- Use every procedure from L1–L6 independently under timed conditions.
- SRT: use the assessment feedback to work on their weakest areas.
