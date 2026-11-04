import { test, expect } from '@playwright/test';

const ACTIVITY = '/Y11/2.1 Algorithms/String_Functions_and_Arrays.html';

// One model answer per question — each must score full marks. Questions with
// given array data (Q6, Q7, Q8, Q9, Q11) keep the starter program and add to the end.
const MODEL = [
`sentence = input("Enter a sentence: ")
print(sentence.upper)
print(sentence.lower)
print("Characters: " + str(sentence.length))`,

`date = input("Enter a date (DD/MM/YYYY): ")
print("Day: " + date.left(2))
print("Month: " + date.substring(3, 2))
print("Year: " + date.right(4))`,

`route = input("Enter the route code: ")
print("Departure: " + route.left(3).upper)
print("Arrival: " + route.right(3).upper)`,

`name = input("Enter your name: ")
tidy = name.left(1).upper + name.right(name.length - 1).lower
print("Welcome " + tidy)`,

`array items[4]
for i = 0 to 3
  items[i] = input("Enter item " + str(i + 1) + ": ")
next i
for i = 3 to 0 step -1
  print(items[i])
next i`,

`limit = input("Enter a temperature: ")
warm = 0
for i = 0 to 6
  if temps[i] > limit then
    warm = warm + 1
  endif
next i
print("Warmer days: " + str(warm))`,

`row = input("Enter row (0-2): ")
seat = input("Enter seat (0-3): ")
if seats[row, seat] == "empty" then
  print("Free")
else
  print("Taken")
endif`,

`shop = input("Enter shop number (0-2): ")
total = 0
for q = 0 to 3
  total = total + sales[shop, q]
next q
print("Total sales: " + str(total))`,

`letter = input("Enter a letter: ")
found = false
for i = 0 to 5
  if names[i].left(1).lower == letter.lower then
    print(names[i].upper)
    found = true
  endif
next i
if found == false then
  print("No names")
endif`,

`array firstNames[3]
array surnames[3]
for i = 0 to 2
  firstNames[i] = input("First name: ")
  surnames[i] = input("Surname: ")
next i
for i = 0 to 2
  email = firstNames[i].left(1) + surnames[i] + "@school.org"
  print(email.lower)
next i`,

`password = input("Enter a password: ")
onList = false
for i = 0 to 4
  if password.lower == common[i] then
    onList = true
  endif
next i
if password.length < 8 OR onList == true then
  print("Weak")
else
  print("Strong")
endif`,

`array words[4]
for i = 0 to 3
  words[i] = input("Enter word " + str(i + 1) + ": ")
next i
acronym = ""
for i = 0 to 3
  acronym = acronym + words[i].substring(0, 1).upper
next i
print(acronym)`,
];

async function runAnswer(page, idx, code, { keepStarter = true } = {}) {
  await page.locator(`.tab-btn[data-idx="${idx}"]`).click();
  await page.locator(`#editor-${idx}`).evaluate((ta, [v, keep]) => {
    ta.value = (keep && !ta.value.startsWith('// Write') ? ta.value : '') + v;
    ta.dispatchEvent(new Event('input'));
  }, [code, keepStarter]);
  await page.locator(`#run-${idx}`).click();
  await expect(page.locator(`#run-${idx}`)).toBeEnabled({ timeout: 60_000 });
  await expect(page.locator(`#ms-score-${idx}`)).not.toHaveText(/^—/);
  const [got, max] = (await page.locator(`#ms-score-${idx}`).textContent()).match(/\d+/g).map(Number);
  return { got, max };
}

test.describe('String Functions and Arrays', () => {
  test.setTimeout(240_000);

  test('every model answer scores full marks', async ({ page }) => {
    await page.goto(ACTIVITY);
    await expect(page.locator('.tab-btn')).toHaveCount(12);
    for (let i = 0; i < MODEL.length; i++) {
      const { got, max } = await runAnswer(page, i, MODEL[i]);
      expect(got, `Q${i + 1}`).toBe(max);
    }
    await expect(page.locator('#done-banner')).toHaveClass(/show/);
  });

  test('Reset puts the given array data back', async ({ page }) => {
    await page.goto(ACTIVITY);
    await page.locator('.tab-btn[data-idx="10"]').click();
    const editor = page.locator('#editor-10');
    await editor.evaluate(ta => { ta.value = ''; ta.dispatchEvent(new Event('input')); });
    await page.locator('#clear-10').click();
    await expect(editor).toHaveValue(/common\[4\] = "iloveyou"/);
  });

  test('common mistakes lose marks', async ({ page }) => {
    await page.goto(ACTIVITY);
    const lost = async (idx, code) => {
      const { got, max } = await runAnswer(page, idx, code);
      expect(got, `Q${idx + 1}`).toBeLessThan(max);
    };
    // Q2: month read from a 1-based position
    await lost(1, MODEL[1].replace('substring(3, 2)', 'substring(2, 2)'));
    // Q4: rest of the name left as typed
    await lost(3, MODEL[3].replace('.right(name.length - 1).lower', '.right(name.length - 1)'));
    // Q6: >= counts days equal to the temperature
    await lost(5, MODEL[5].replace('> limit', '>= limit'));
    // Q9: case-sensitive comparison
    await lost(8, MODEL[8].replace('names[i].left(1).lower == letter.lower', 'names[i].left(1) == letter'));
  });
});
