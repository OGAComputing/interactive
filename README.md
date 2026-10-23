# Interactive

Interactive computing activities for Outwood Grange Academy students (Years 7–13), plus some Religious Studies. Each activity is a single web page that runs in the browser: students answer questions, write and run Python or OCR pseudocode, and get instant feedback.

**Site:** https://ogacomputing.github.io/interactive/

## For teachers

- **Using an activity:** open the site, find the activity under its year and topic, and post its link as a Google Classroom assignment. Students who open it from Classroom get their grade and a copy of their work submitted automatically.
- **First time with Classroom grading:** follow [`getting-started.html`](getting-started.html), then [`_teacher/setup.html`](_teacher/setup.html) to set up the grade proxy.
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
