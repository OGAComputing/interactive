import { test, expect } from '@playwright/test';

const ACTIVITY = '/Y11/2.1 Algorithms/Practice_3.html';

// One model answer per question — each must score full marks.
const MODEL = [
`username = input("Enter your username: ")
level = input("Enter your level: ")
print(username + " is on level " + str(level))`,

`pizzas = input("How many pizzas? ")
guests = input("How many guests? ")
slices = pizzas * 8
print("Total slices: " + str(slices))
print("Slices each: " + str(slices / guests))`,

`height = input("Enter height in cm: ")
if height >= 120 then
  print("Enjoy the ride")
else
  print("Sorry, you are too short")
endif`,

`password = input("Enter password: ")
while password != "dragon42"
  password = input("Enter password: ")
endwhile
print("Access granted")`,

`start = input("Enter starting number: ")
for i = start to 1 step -1
  print(i)
next i
print("Lift off!")`,

`days = input("How many days? ")
total = 0
for d = 1 to days
  steps = input("Steps for day " + str(d) + ": ")
  total = total + steps
next d
print("Total steps: " + str(total))`,

`students = input("Number of students: ")
full = students DIV 16
left = students MOD 16
print("Full minibuses: " + str(full))
print("Students left over: " + str(left))
if left > 0 then
  print("Extra minibus needed")
else
  print("All minibuses full")
endif`,

`secret = 37
guess = input("Enter a guess: ")
while guess != secret
  if guess > secret then
    print("Too high")
  else
    print("Too low")
  endif
  guess = input("Enter a guess: ")
endwhile
print("Correct!")`,

`passed = 0
failed = 0
for i = 1 to 6
  score = input("Enter score " + str(i) + ": ")
  if score >= 40 then
    passed = passed + 1
  else
    failed = failed + 1
  endif
next i
print("Passed: " + str(passed))
print("Failed: " + str(failed))`,

`total = 0
price = input("Enter item price (0 to finish): ")
while price != 0
  total = total + price
  price = input("Enter item price (0 to finish): ")
endwhile
print("Basket total: " + str(total))
if total >= 50 then
  print("Free delivery")
else
  print("Delivery charge £3.99")
endif`,

`hours = input("Enter hours stayed (1-24): ")
while hours < 1 OR hours > 24
  print("Invalid number of hours")
  hours = input("Enter hours stayed (1-24): ")
endwhile
if hours <= 2 then
  charge = 3
else
  charge = 3 + (hours - 2) * 1.5
endif
print("Charge: " + str(charge))`,

`lives = 3
score = 0
while lives > 0
  points = input("Points this round: ")
  if points == 0 then
    lives = lives - 1
    print("Lives left: " + str(lives))
  else
    score = score + points
  endif
endwhile
print("Final score: " + str(score))
if score >= 100 then
  print("New high score!")
endif`,
];

async function runAnswer(page, idx, code) {
  await page.locator(`.tab-btn[data-idx="${idx}"]`).click();
  await page.locator(`#editor-${idx}`).evaluate((ta, v) => {
    ta.value = v;
    ta.dispatchEvent(new Event('input'));
  }, code);
  await page.locator(`#run-${idx}`).click();
  await expect(page.locator(`#run-${idx}`)).toBeEnabled({ timeout: 60_000 });
  await expect(page.locator(`#ms-score-${idx}`)).not.toHaveText(/^—/);
  return page.locator(`#ms-score-${idx}`).textContent();
}

test.describe('Algorithm Practice 3', () => {
  test.setTimeout(240_000);

  test('every model answer scores full marks', async ({ page }) => {
    await page.goto(ACTIVITY);
    await expect(page.locator('.tab-btn')).toHaveCount(12);
    for (let i = 0; i < MODEL.length; i++) {
      const score = await runAnswer(page, i, MODEL[i]);
      const [got, max] = score.match(/\d+/g).map(Number);
      expect(got, `Q${i + 1}: ${score}`).toBe(max);
    }
    await expect(page.locator('#done-banner')).toHaveClass(/show/);
  });

  test('prompts without a trailing space still score full marks', async ({ page }) => {
    await page.goto(ACTIVITY);
    for (let i = 0; i < MODEL.length; i++) {
      const code = MODEL[i].replace(/input\("([^"]*?)\s+"/g, 'input("$1"');
      const score = await runAnswer(page, i, code);
      const [got, max] = score.match(/\d+/g).map(Number);
      expect(got, `Q${i + 1}: ${score}`).toBe(max);
    }
  });

  test('a variable called pass works (Q9)', async ({ page }) => {
    await page.goto(ACTIVITY);
    const code = MODEL[8].replace(/\bpassed\b/g, 'pass').replace(/\bfailed\b/g, 'fail');
    const score = await runAnswer(page, 8, code);
    expect(score).toBe('6 / 6 marks');
  });

  test('common mistakes lose marks', async ({ page }) => {
    await page.goto(ACTIVITY);
    const lost = async (idx, code) => {
      const score = await runAnswer(page, idx, code);
      const [got, max] = score.match(/\d+/g).map(Number);
      expect(got, `Q${idx + 1}: ${score}`).toBeLessThan(max);
    };
    // Q3: > instead of >= at the 120 boundary
    await lost(2, MODEL[2].replace('>=', '>'));
    // Q5: countdown to 0
    await lost(4, MODEL[4].replace('to 1 step', 'to 0 step'));
    // Q6: fixed 3 days instead of the number entered
    await lost(5, MODEL[5].replace('to days', 'to 3'));
    // Q7: / instead of DIV
    await lost(6, MODEL[6].replace('DIV', '/'));
    // Q9: > 40 instead of >= 40
    await lost(8, MODEL[8].replace('>= 40', '> 40'));
    // Q10: free delivery only above 50
    await lost(9, MODEL[9].replace('>= 50', '> 50'));
    // Q11: no validation loop
    await lost(10, MODEL[10].replace(/while[\s\S]*?endwhile\n/, ''));
    // Q12: high score only above 100
    await lost(11, MODEL[11].replace('>= 100', '> 100'));
  });
});
