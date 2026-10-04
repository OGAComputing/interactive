import { test, expect } from '@playwright/test';

// Old activity paths must forward to the new ones and keep Classroom params.
const MOVES = [
  ['/Y9/Databases/Criminal_Database_Investigation.html', '/Y9/Digital_Forensics/L4_Criminal_Database/Criminal_Database_Investigation.html'],
  ['/Y9/Cybersecurity/Searching_the_Computer.html', '/Y9/Digital_Forensics/L5_Searching_the_Computer/Searching_the_Computer.html'],
];

for (const [from, to] of MOVES) {
  test(`${from} forwards with query string`, async ({ page }) => {
    // Serve a blank target so classroom.js doesn't start a Google sign-in on ?courseId.
    let landed = null;
    await page.route(`**${to}*`, route => {
      landed = new URL(route.request().url());
      route.fulfill({ contentType: 'text/html', body: '<p>moved</p>' });
    });
    await page.goto(`${from}?courseId=123&proxyUrl=https%3A%2F%2Fexample.com%2Fx#top`);
    await expect.poll(() => landed?.pathname).toBe(to);
    expect(landed.searchParams.get('courseId')).toBe('123');
    expect(landed.searchParams.get('proxyUrl')).toBe('https://example.com/x');
    await expect.poll(() => new URL(page.url()).hash).toBe('#top');
  });
}
