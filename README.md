# Interactive

Interactive computing activities for Outwood Grange Academy students (Years 7–13), plus some Religious Studies. Each activity is a single web page that runs in the browser: students answer questions, write and run Python or OCR pseudocode, and get instant feedback.

**Site:** https://ogacomputing.github.io/interactive/

## For teachers

- **Using an activity:** sign in on the site and use an activity's **Assign** button to post it to a Google Classroom class. Students' work is attached to their submission as they go; the next time you open the site it writes their scores into Classroom as draft grades. No setup is needed: see [How Grading Works](getting-started.html).
- **Unit guides:** [`_teacher/`](_teacher/) holds teacher-only guides and tools, such as the Y8 Python Unit 1 guide.
- **Lesson decks:** [`_presentations/`](_presentations/) holds the PowerPoint decks that go with the activities.

## For developers

There's no build step: every activity is plain HTML, CSS and JavaScript. Start with [`CLAUDE.md`](CLAUDE.md), which covers the folder layout, the templates, the shared files and the rules every activity follows.

```
npm ci                 # once: installs the test tools
node test-server.mjs   # serves the site on http://localhost:3000
npm run test:unit      # Vitest: checker logic, quick
npx playwright test    # Playwright: the pages in a real browser, slow
```

A push to `main` rebuilds the activity list and deploys the site once the tests pass.
