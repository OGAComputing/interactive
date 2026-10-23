import { test, expect } from '@playwright/test';

const ACTIVITY = '/Y11/2.1 Algorithms/Strings_and_Arrays.html';

// One model answer per question — each must score full marks. Questions with
// given array data (Q6, Q8, Q11) keep the starter program and add to the end.
const MODEL = [
`first = input("Enter first name: ")
surname = input("Enter surname: ")
username = surname.left(3) + first.left(1)
print("Username: " + username)`,

`code = input("Enter stock code: ")
print("Warehouse: " + code.substring(0, 3))
print("Aisle: " + code.substring(3, 2))
print("Colour: " + code.right(3))`,

`postcode = input("Enter postcode: ")
outward = postcode.left(postcode.length - 4)
inward = postcode.right(3)
print("Outward code: " + outward)
print("Inward code: " + inward)`,

`word = input("Enter a word: ")
mid = word.length DIV 2
print("Middle letter: " + word.substring(mid, 1))`,

`array players[5]
for i = 0 to 4
  players[i] = input("Enter player " + str(i + 1) + ": ")
next i
print("Captain: " + players[0])
print("Goalkeeper: " + players[4])`,

`num = input("Enter a day number (1-7): ")
print(days[num - 1])`,

`array rain[7]
total = 0
for day = 0 to 6
  rain[day] = input("Rainfall for day " + str(day + 1) + ": ")
  total = total + rain[day]
next day
print("Total: " + str(total))
print("Average: " + str(total / 7))`,

`student = input("Enter student number (0-2): ")
test = input("Enter test number (0-3): ")
print("Mark: " + str(marks[student, test]))`,

`word = input("Enter a word: ")
vowels = 0
for i = 0 to word.length - 1
  letter = word.substring(i, 1)
  if letter == "a" OR letter == "e" OR letter == "i" OR letter == "o" OR letter == "u" then
    vowels = vowels + 1
  endif
next i
print("Vowels: " + str(vowels))`,

`email = input("Enter your school email: ")
while email.right(11) != "@school.org"
  print("That is not a school email address")
  email = input("Enter your school email: ")
endwhile
print("Username: " + email.left(email.length - 11))`,

`name = input("Enter a name: ")
found = false
for i = 0 to 7
  if register[i] == name then
    print(name + " is at index " + str(i))
    found = true
  endif
next i
if found == false then
  print("Not found")
endif`,

`array words[5]
for i = 0 to 4
  words[i] = input("Enter word " + str(i + 1) + ": ")
next i
longest = words[0]
ingCount = 0
for i = 0 to 4
  if words[i].length > longest.length then
    longest = words[i]
  endif
  if words[i].right(3) == "ing" then
    ingCount = ingCount + 1
  endif
next i
print("Longest word: " + longest)
print("Words ending in ing: " + str(ingCount))`,
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

test.describe('Substrings and Arrays', () => {
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
    await expect(editor).toHaveValue(/register\[7\] = "Zane"/);
  });

  test('common mistakes lose marks', async ({ page }) => {
    await page.goto(ACTIVITY);
    const lost = async (idx, code) => {
      const { got, max } = await runAnswer(page, idx, code);
      expect(got, `Q${idx + 1}`).toBeLessThan(max);
    };
    // Q3: outward code always 4 characters
    await lost(2, MODEL[2].replace('postcode.length - 4', '4'));
    // Q6: off by one
    await lost(5, MODEL[5].replace('num - 1', 'num'));
    // Q8: row and column swapped
    await lost(7, MODEL[7].replace('marks[student, test]', 'marks[test, student]'));
    // Q11: loop stops one short
    await lost(10, MODEL[10].replace('0 to 7', '0 to 6'));
    // Q12: >= keeps the last of a tie
    await lost(11, MODEL[11].replace('> longest.length', '>= longest.length'));
  });
});
