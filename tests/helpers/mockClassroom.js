// Pre-seed a fake OAuth token in sessionStorage before any page scripts run.
// classroom.js's checkPendingOAuthToken() picks it up on DOMContentLoaded
// and calls handleTokenResponse(), completing sign-in without any redirect.

const SCOPE = 'https://www.googleapis.com/auth/classroom.coursework.me ' +
  'https://www.googleapis.com/auth/classroom.courses.readonly openid email ' +
  'https://www.googleapis.com/auth/drive.file ' +
  'https://www.googleapis.com/auth/drive.metadata.readonly ' +
  'https://www.googleapis.com/auth/script.deployments';

function seedTokenScript() {
  return `(function() {
  try {
    sessionStorage.setItem('oga_oauth_token', JSON.stringify({
      access_token: 'mock-token-abc123',
      scope: '${SCOPE}',
      expires_at: Date.now() + 3600000
    }));
    localStorage.removeItem('oga_auth');
  } catch(e) {}
})();
`;
}

// Abort any real Google OAuth redirects so tests never leave localhost.
async function interceptOAuth(page) {
  await page.route('https://accounts.google.com/**', route => route.abort());
}

// No token seeded — banner visible, not authenticated.
// Also seeds oga_silent_failed so bootstrap() skips the silent-auth redirect
// (which would otherwise navigate the page away before tests can inspect the DOM).
export async function mockSignedOut(page) {
  await page.addInitScript(`(function(){
    try { sessionStorage.setItem('oga_silent_failed', 'true'); } catch(e) {}
  })()`);
  await interceptOAuth(page);
}

// Token seeded + all downstream APIs mocked as a student (not a teacher).
// activityUrl: full URL that the mock courseWork material should point at — must
// match what page.goto() will navigate to so classroom.js can find the assignment.
export async function mockAsStudent(page, courseId = 'test-course-123', activityUrl = 'http://127.0.0.1:3001/Y8/Python/L4_Functions/1_Functions.html') {
  await page.addInitScript(seedTokenScript());
  await interceptOAuth(page);

  await page.route('https://www.googleapis.com/oauth2/v3/userinfo', route =>
    route.fulfill({ json: { email: 'student@test.com', name: 'Test Student', sub: '12345' } })
  );

  // Drive metadata search (searchDriveForProxy) — no proxy script found.
  await page.route('https://www.googleapis.com/drive/**', route =>
    route.fulfill({ json: { files: [] } })
  );

  // Apps Script deployments lookup — no deployments.
  await page.route('https://script.googleapis.com/**', route =>
    route.fulfill({ json: { deployments: [] } })
  );

  // Route all classroom.googleapis.com calls through one handler.
  await page.route('https://classroom.googleapis.com/**', async (route) => {
    const url = route.request().url();
    if (url.includes('teacherId=me')) {
      // detectTeacher: this user teaches no courses → student path
      await route.fulfill({ json: { courses: [] } });
    } else if (url.includes('/courseWork')) {
      // Return a mock assignment that matches the host page
      await route.fulfill({ json: {
        courseWork: [{
          id: 'mock-cw-123',
          materials: [{
            link: { url: activityUrl }
          }]
        }]
      }});
    } else if (url.includes('/studentSubmissions')) {
      // lookupSubmissionId: return a mock submission
      await route.fulfill({ json: {
        studentSubmissions: [{ id: 'mock-submission-123' }]
      }});
    } else {
      // findCorrectCourse fallback scan: no other courses
      await route.fulfill({ json: { courses: [] } });
    }
  });

  // Drive upload calls — return a fake file ID so evidence upload succeeds silently.
  await page.route('https://www.googleapis.com/upload/drive/**', route =>
    route.fulfill({ json: { id: 'mock-drive-file-id' } })
  );
}

// Token seeded + all downstream APIs mocked as a teacher of the given courseId.
export async function mockAsTeacher(page, courseId = 'test-course-123') {
  await page.addInitScript(seedTokenScript());
  await interceptOAuth(page);

  await page.route('https://www.googleapis.com/oauth2/v3/userinfo', route =>
    route.fulfill({ json: { email: 'teacher@test.com', name: 'Test Teacher', sub: '99999' } })
  );

  await page.route('https://www.googleapis.com/drive/**', route =>
    route.fulfill({ json: { files: [] } })
  );

  await page.route('https://script.googleapis.com/**', route =>
    route.fulfill({ json: { deployments: [] } })
  );

  await page.route('https://classroom.googleapis.com/**', async (route) => {
    const url = route.request().url();
    if (url.includes('teacherId=me')) {
      // detectTeacher: this user IS a teacher of courseId → teacher path
      await route.fulfill({ json: { courses: [{ id: courseId, name: 'Year 8 Computing' }] } });
    } else if (url.includes('/courseWork')) {
      await route.fulfill({ json: {} });
    } else {
      await route.fulfill({ json: { courses: [] } });
    }
  });
}
