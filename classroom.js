/**
 * classroom.js — Shared Google Classroom integration for all activity pages.
 *
 * Usage in any activity HTML file (all are 2 levels deep: Y<n>/Topic/file.html):
 *   <script src="../../classroom.js"></script>
 *
 * When the page URL contains ?courseId=X this script:
 *   1. Injects a sticky login banner at the top of the page
 *   2. Loads the Google Sign-In library and initialises the OAuth token client
 *   3. After sign-in, automatically looks up the courseWorkId by scanning the
 *      course's published assignments for one whose link URL matches this page
 *   4. Detects whether the signed-in user is a teacher of this course and, if so,
 *      shows a "Teacher mode" panel with a pre-built assignment link to copy
 *   5. Exposes window.Classroom.verifyAuth() — call at the start of Check Answer
 *      handlers to block unauthenticated students when in a Classroom context
 *   6. Exposes window.Classroom.submitGrade(percent, activityName) — posts the
 *      draft grade via the teacher's Apps Script proxy. The proxy URL is resolved
 *      from (in order): ?proxyUrl= URL param → localStorage (set by setup page).
 *      Grade submission is silently skipped when no proxy URL is available.
 *
 * If no courseId URL param is present, nothing is injected and all API calls
 * are no-ops, so activities work identically for students not using Classroom.
 *
 * Teacher setup: open _teacher/setup.html once per teacher account. This
 * deploys a personal Apps Script proxy and saves its URL to localStorage so
 * activity pages on that browser work automatically.
 */
(function () {
  'use strict';

  const CLIENT_ID = '379663437881-iukh6qnkq8jmqtqko3qog0n6ohuhemmq.apps.googleusercontent.com';
  // classroom.coursework.me — read/turn-in student's own submissions.
  // classroom.courses.readonly — list courses to detect teacher vs student role.
  // openid + email — fetch the student's Google user ID for the proxy call.
  const SCOPE = 'https://www.googleapis.com/auth/classroom.coursework.me https://www.googleapis.com/auth/classroom.courses.readonly openid email';

  // Minimum proxy version that this classroom.js is compatible with.
  // Bump this (and PROXY_VERSION in setup.html's PROXY_JS) when making breaking changes.
  const PROXY_MIN_VERSION = 1;

  // urlParams must be declared before proxyUrl so the reference is valid
  const urlParams   = new URLSearchParams(window.location.search);
  // let (not const) so the fallback course scan can correct a stale courseId from a re-used post
  let courseId      = urlParams.get('courseId');
  const isClassroomContext = !!courseId;

  // Proxy URL resolution: URL param wins, then localStorage (saved by setup page)
  let proxyUrl = urlParams.get('proxyUrl') || (() => {
    try { return localStorage.getItem('oga_proxy_url'); } catch (_) { return null; }
  })() || null;

  let tokenClient  = null;
  let accessToken  = null;
  let courseWorkId   = null; // resolved after sign-in
  let submissionId   = null; // resolved after sign-in

  let proxyVersionChecked = false;
  let proxyVersionOk      = true; // set to false only when version endpoint confirms it is below minimum

  // ── Login banner ─────────────────────────────────────────────────────────────

  function injectBanner() {
    const style = document.createElement('style');
    style.textContent = `
      #classroom-banner {
        position: sticky; top: 0; z-index: 9999;
        background: #111827; color: #d1d5db;
        padding: 10px 20px;
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        font-family: 'Segoe UI', system-ui, sans-serif; font-size: 0.85rem;
        border-bottom: 2px solid #374151;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      }
      #classroom-banner-msg { display: flex; align-items: center; gap: 10px; min-width: 0; }
      #classroom-dot {
        width: 9px; height: 9px; border-radius: 50%;
        background: #ef4444; flex-shrink: 0;
        transition: background 0.3s, box-shadow 0.3s;
      }
      #classroom-dot.online  { background: #10b981; box-shadow: 0 0 8px #10b981; }
      #classroom-dot.teacher { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
      #classroom-banner-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
      #classroom-signin-btn {
        background: #fff; color: #111827; border: none;
        padding: 6px 14px; border-radius: 4px;
        font-weight: 700; font-size: 0.82rem; cursor: pointer;
        white-space: nowrap;
        animation: classroom-pulse-btn 1.5s infinite;
      }
      #classroom-signin-btn:hover { background: #f3f4f6; }
      #classroom-signin-btn.hidden { display: none; }
      @keyframes classroom-pulse-btn {
        0%,100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
        50%      { box-shadow: 0 0 0 5px rgba(245,158,11,0.45); }
      }
      #classroom-copy-btn {
        background: #f59e0b; color: #111827; border: none;
        padding: 6px 14px; border-radius: 4px;
        font-weight: 700; font-size: 0.82rem; cursor: pointer;
        white-space: nowrap; display: none;
      }
      #classroom-copy-btn:hover { background: #d97706; }
      #classroom-copy-btn.visible { display: inline-block; }
      #classroom-toast {
        position: fixed; bottom: 24px; right: 24px; z-index: 99999;
        background: #10b981; color: #fff;
        padding: 12px 20px; border-radius: 8px;
        font-family: 'Segoe UI', system-ui, sans-serif;
        font-size: 0.9rem; font-weight: 600;
        box-shadow: 0 4px 16px rgba(0,0,0,0.35);
        transform: translateY(80px); opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        pointer-events: none;
      }
      #classroom-toast.show { transform: translateY(0); opacity: 1; }

      /* Classroom API disabled modal */
      #cr-api-modal-backdrop {
        display: none; position: fixed; inset: 0; z-index: 99998;
        background: rgba(0,0,0,0.7); align-items: center; justify-content: center;
      }
      #cr-api-modal-backdrop.open { display: flex; }

      /* Teacher setup modal */
      #cr-modal-backdrop {
        display: none; position: fixed; inset: 0; z-index: 99998;
        background: rgba(0,0,0,0.7); align-items: center; justify-content: center;
      }
      #cr-modal-backdrop.open { display: flex; }
      #cr-modal {
        background: #1e293b; border: 1px solid #475569; border-radius: 12px;
        padding: 28px 32px; max-width: 480px; width: calc(100% - 48px);
        font-family: 'Segoe UI', system-ui, sans-serif;
        box-shadow: 0 12px 40px rgba(0,0,0,0.5);
      }
      #cr-modal h2 { font-size: 1.1rem; color: #f1f5f9; margin-bottom: 8px; }
      #cr-modal p  { font-size: 0.82rem; color: #94a3b8; line-height: 1.6; margin-bottom: 16px; }
      #cr-modal a  { color: #60a5fa; }
      #cr-modal input {
        width: 100%; padding: 8px 12px; border-radius: 6px;
        background: #0f172a; border: 1px solid #334155; color: #e2e8f0;
        font-size: 0.82rem; margin-bottom: 12px;
        font-family: 'Cascadia Code', 'Consolas', monospace;
      }
      #cr-modal input:focus { outline: none; border-color: #3b82f6; }
      #cr-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
      #cr-modal-actions button {
        padding: 7px 18px; border: none; border-radius: 6px;
        font-size: 0.82rem; font-weight: 700; cursor: pointer;
      }
      #cr-modal-save   { background: #3b82f6; color: #fff; }
      #cr-modal-save:hover { background: #2563eb; }
      #cr-modal-skip   { background: #374151; color: #d1d5db; }
      #cr-modal-skip:hover { background: #4b5563; }
      #cr-drive-search-btn {
        display: block; width: 100%;
        padding: 8px 14px; border: 1px solid #334155; border-radius: 6px;
        background: #0f172a; color: #94a3b8; font-size: 0.82rem;
        cursor: pointer; margin-bottom: 10px; text-align: left;
        transition: background 0.15s, color 0.15s;
      }
      #cr-drive-search-btn:hover { background: #1e293b; color: #e2e8f0; }
      #cr-drive-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    `;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'classroom-banner';
    banner.innerHTML = `
      <div id="classroom-banner-msg">
        <span id="classroom-dot"></span>
        <span id="classroom-text">⚠️ This activity is linked to Google Classroom — sign in to record your results. <strong style="color:#fbbf24;">On the next screen, make sure all permission boxes are ticked.</strong></span>
      </div>
      <div id="classroom-banner-actions">
        <button id="classroom-copy-btn" onclick="window._classroomCopyLink()">Copy assignment link</button>
        <button id="classroom-signin-btn" onclick="window._classroomSignIn()">Sign in with Google</button>
      </div>
    `;
    if (document.body.firstChild) {
      document.body.insertBefore(banner, document.body.firstChild);
    } else {
      document.body.appendChild(banner);
    }

    const toast = document.createElement('div');
    toast.id = 'classroom-toast';
    document.body.appendChild(toast);

    // SERVICE_DISABLED modal — shown when the Classroom API is not enabled in the proxy's Cloud project
    const apiModal = document.createElement('div');
    apiModal.id = 'cr-api-modal-backdrop';
    apiModal.innerHTML = `
      <div id="cr-modal">
        <h2>⚙️ Classroom API not enabled</h2>
        <p>
          The grade proxy is deployed but the Google Classroom API hasn't been enabled
          in its Cloud project yet. Click the button below to open Google Cloud Console,
          click <strong>Enable</strong>, then refresh this page and try again.
        </p>
        <div id="cr-modal-actions">
          <button id="cr-modal-skip" onclick="window._classroomApiModalClose()">Dismiss</button>
          <a id="cr-api-console-link" href="#" target="_blank" style="background:#f59e0b;color:#111827;padding:7px 18px;border-radius:6px;font-size:0.82rem;font-weight:700;text-decoration:none;">Enable in Cloud Console →</a>
        </div>
      </div>
    `;
    document.body.appendChild(apiModal);

    // Modal (hidden until teacher needs setup)
    const modal = document.createElement('div');
    modal.id = 'cr-modal-backdrop';
    modal.innerHTML = `
      <div id="cr-modal">
        <h2>⚙️ Teacher: grade proxy not configured</h2>
        <p>
          To automatically sync student scores to Google Classroom you need a
          personal grade proxy. Run the one-time setup, then come back here.
          <br><br>
          <a href="../../_teacher/setup.html" target="_blank">Open setup page →</a>
          &nbsp;(opens in a new tab — refresh this page when done)
        </p>
        <p>Already set up on another device? Search your Drive or paste the URL below:</p>
        <button id="cr-drive-search-btn" onclick="window._classroomSearchDriveForProxy()">🔍 Search my Drive for proxy script</button>
        <input id="cr-proxy-input" type="url" placeholder="https://script.google.com/macros/s/…/exec">
        <div id="cr-modal-actions">
          <button id="cr-modal-skip" onclick="window._classroomModalSkip()">Skip for now</button>
          <button id="cr-modal-save" onclick="window._classroomModalSave()">Save &amp; use</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function setBannerStudent() {
    const dot  = document.getElementById('classroom-dot');
    const text = document.getElementById('classroom-text');
    const btn  = document.getElementById('classroom-signin-btn');
    if (dot)  dot.classList.add('online');
    if (text) text.textContent = '✅ Connected to Google Classroom — your results will be recorded automatically.';
    if (btn)  btn.classList.add('hidden');
  }

  function setBannerTeacher(hasProxy) {
    const dot      = document.getElementById('classroom-dot');
    const text     = document.getElementById('classroom-text');
    const btn      = document.getElementById('classroom-signin-btn');
    const copyBtn  = document.getElementById('classroom-copy-btn');
    if (dot)  { dot.classList.add('teacher'); }
    if (btn)  btn.classList.add('hidden');
    if (hasProxy) {
      if (text) text.textContent = '🎓 Teacher mode — grade proxy configured. Share the assignment link with your class.';
      if (copyBtn) copyBtn.classList.add('visible');
    } else {
      if (text) text.textContent = '🎓 Teacher mode — no grade proxy configured. Students\' scores won\'t sync automatically.';
    }
  }

  function showClassroomToast(msg) {
    const toast = document.getElementById('classroom-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = msg.startsWith('⚠️') ? '#b45309' : '#10b981';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  // ── Teacher modal ─────────────────────────────────────────────────────────────

  window._classroomApiModalClose = function () {
    const el = document.getElementById('cr-api-modal-backdrop');
    if (el) el.classList.remove('open');
  };

  window._classroomModalSkip = function () {
    const el = document.getElementById('cr-modal-backdrop');
    if (el) el.classList.remove('open');
  };

  window._classroomModalSave = function () {
    const input = document.getElementById('cr-proxy-input');
    const url   = input && input.value.trim();
    if (!url || !url.startsWith('https://')) {
      input && (input.style.borderColor = '#ef4444');
      return;
    }
    proxyUrl = url;
    try { localStorage.setItem('oga_proxy_url', url); } catch (_) {}
    window._classroomModalSkip();
    setBannerTeacher(true);
    showClassroomToast('Proxy URL saved ✅');
    checkProxyVersion();
  };

  window._classroomSearchDriveForProxy = function () {
    const btn = document.getElementById('cr-drive-search-btn');
    if (btn) { btn.textContent = '🔍 Searching…'; btn.disabled = true; }

    const driveClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/script.deployments',
      callback: async (resp) => {
        if (btn) { btn.textContent = '🔍 Search my Drive for proxy script'; btn.disabled = false; }
        if (resp.error) { showClassroomToast('⚠️ Drive search cancelled.'); return; }
        try {
          const searchRes = await fetch(
            'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
              q: "mimeType='application/vnd.google-apps.script' and name='OGA Classroom Grade Proxy' and trashed=false",
              fields: 'files(id,name)',
              pageSize: 5
            }),
            { headers: { Authorization: `Bearer ${resp.access_token}` } }
          );
          const { files } = await searchRes.json();
          if (!files || files.length === 0) {
            showClassroomToast('⚠️ No proxy script found in Drive.');
            return;
          }
          const depRes = await fetch(
            `https://script.googleapis.com/v1/projects/${files[0].id}/deployments`,
            { headers: { Authorization: `Bearer ${resp.access_token}` } }
          );
          const depData = await depRes.json();
          const webAppDep = (depData.deployments || []).find(d =>
            (d.entryPoints || []).some(ep => ep.entryPointType === 'WEB_APP')
          );
          const ep = webAppDep?.entryPoints?.find(ep => ep.entryPointType === 'WEB_APP');
          const url = ep?.webApp?.url;
          if (url) {
            const input = document.getElementById('cr-proxy-input');
            if (input) input.value = url;
            if (btn) btn.textContent = '✅ Found — click Save & use';
            showClassroomToast('Proxy URL found — click Save & use ✅');
          } else {
            showClassroomToast('⚠️ Proxy script found but not deployed.');
          }
        } catch (e) {
          console.error('Classroom: Drive proxy search failed', e);
          showClassroomToast('⚠️ Drive search failed — see console.');
        }
      }
    });
    driveClient.requestAccessToken();
  };

  window._classroomCopyLink = function () {
    if (!proxyUrl) return;
    const link = `${location.origin}${location.pathname}?courseId=${courseId}&proxyUrl=${encodeURIComponent(proxyUrl)}`;
    navigator.clipboard.writeText(link).then(() => {
      const btn = document.getElementById('classroom-copy-btn');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy assignment link', 2000); }
    });
  };

  // ── courseWorkId lookup ───────────────────────────────────────────────────────

  async function lookupCourseWorkId(token, cId) {
    const pageBase = decodeURIComponent(window.location.origin + window.location.pathname);
    const pagePath = decodeURIComponent(window.location.pathname);
    try {
      for (const state of ['PUBLISHED', 'DRAFT']) {
        let pageToken = '';
        do {
          const url =
            `https://classroom.googleapis.com/v1/courses/${cId}/courseWork` +
            `?courseWorkStates=${state}&pageSize=100` +
            (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) break;
          const data = await res.json();
          pageToken = data.nextPageToken || '';
          if (!data.courseWork) break;
          for (const cw of data.courseWork) {
            if (!cw.materials) continue;
            for (const m of cw.materials) {
              if (m.link && m.link.url) {
                const linkBase = decodeURIComponent(m.link.url.split('?')[0]);
                if (linkBase === pageBase || linkBase.endsWith(pagePath)) return cw.id;
              }
            }
          }
        } while (pageToken);
      }
    } catch (e) {
      console.warn('Classroom: courseWork lookup failed', e);
    }
    return null;
  }

  // ── Fallback course scan ──────────────────────────────────────────────────────
  // Called when lookupCourseWorkId finds nothing in the URL's courseId.
  // This happens when a teacher uses "Re-use post" in Classroom: the copied post
  // retains the original classroom's courseId in the link. We scan all courses the
  // signed-in user can see and find one with an assignment matching this page's URL.

  async function findCorrectCourse(token) {
    const pagePath = decodeURIComponent(window.location.pathname);
    console.log('Classroom: assignment not found in URL courseId — scanning all accessible courses (re-used post?)');
    try {
      let pageToken = '';
      do {
        const url = 'https://classroom.googleapis.com/v1/courses?pageSize=50' +
          (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) break;
        const data = await res.json();
        pageToken = data.nextPageToken || '';
        for (const course of (data.courses || [])) {
          if (course.id === courseId) continue; // already checked
          const cwId = await lookupCourseWorkId(token, course.id);
          if (cwId) {
            console.log(`Classroom: matched assignment in course "${course.name}" (${course.id}) — updating courseId`);
            return { courseId: course.id, courseWorkId: cwId };
          }
        }
      } while (pageToken);
    } catch (e) {
      console.warn('Classroom: fallback course scan failed', e);
    }
    console.warn('Classroom: no matching assignment found in any accessible course — expected URL containing:', pagePath);
    return { courseId: null, courseWorkId: null };
  }

  // ── Submission ID lookup ─────────────────────────────────────────────────────
  // Uses the student's own token (classroom.coursework.me) to find their submission
  // for the resolved courseWorkId. The proxy uses this ID to patch the grade directly
  // without needing a teacher-level studentSubmissions.list call.

  async function lookupSubmissionId(token, cwId) {
    if (!cwId) return null;
    try {
      const res = await fetch(
        `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${cwId}/studentSubmissions?userId=me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        console.warn('Classroom: submission lookup failed', res.status);
        return null;
      }
      const data = await res.json();
      return data.studentSubmissions?.[0]?.id || null;
    } catch (e) {
      console.warn('Classroom: submission lookup error', e);
      return null;
    }
  }

  // ── Proxy version check ───────────────────────────────────────────────────────
  // Fetches ?action=version from the proxy and warns the teacher if it is outdated.
  // Old proxies (before the version endpoint was added) return non-numeric text, which
  // is treated as "unknown version" — a warning is shown but grade sync is not blocked,
  // since the old proxy still speaks the same protocol.
  // If the version endpoint returns a number below PROXY_MIN_VERSION, grade sync is
  // blocked because a breaking change has been made.

  function showProxyOutdatedWarning() {
    const text = document.getElementById('classroom-text');
    if (text) text.textContent = '⚠️ Proxy script is outdated — please redeploy from the setup page.';
    const dot = document.getElementById('classroom-dot');
    if (dot) { dot.style.background = '#ef4444'; dot.style.boxShadow = '0 0 8px #ef4444'; }
    showClassroomToast('⚠️ Proxy outdated — please redeploy.');
  }

  async function checkProxyVersion() {
    if (!proxyUrl || proxyVersionChecked) return;
    proxyVersionChecked = true;
    try {
      const res  = await fetch(proxyUrl + '?action=version');
      const text = res.ok ? (await res.text()).trim() : '';
      const ver  = parseInt(text, 10);
      if (isNaN(ver)) {
        // Old proxy with no version endpoint — warn but don't block grade sync
        showProxyOutdatedWarning();
      } else if (ver < PROXY_MIN_VERSION) {
        // Version explicitly below minimum — warn and block grade sync
        proxyVersionOk = false;
        showProxyOutdatedWarning();
      }
    } catch (_) {
      // Network error — don't warn or block
    }
  }

  // ── Teacher detection ─────────────────────────────────────────────────────────
  // courses.list?teacherId=me returns only courses the user teaches, which works
  // with the classroom.coursework.me scope and needs no additional permissions.

  async function detectTeacher(token) {
    try {
      const res  = await fetch(
        'https://classroom.googleapis.com/v1/courses?teacherId=me&pageSize=50',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return false;
      const data = await res.json();
      return (data.courses || []).some(c => c.id === courseId);
    } catch (_) {
      return false;
    }
  }

  // ── OAuth ─────────────────────────────────────────────────────────────────────

  function initTokenClient() {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: async (tokenResponse) => {
        if (tokenResponse.error !== undefined) {
          console.error('Classroom OAuth error:', tokenResponse);
          return;
        }

        // Verify all required scopes were actually granted.
        // Users can uncheck permissions on the consent screen, so we must confirm
        // the returned scope list contains everything we asked for.
        const grantedScopes = (tokenResponse.scope || '').split(' ');
        const missingScopes = SCOPE.split(' ').filter(s => s && !grantedScopes.includes(s));
        if (missingScopes.length > 0) {
          console.warn('Classroom: missing scopes after sign-in:', missingScopes);
          const dot  = document.getElementById('classroom-dot');
          const text = document.getElementById('classroom-text');
          if (dot)  dot.style.cssText = 'background:#ef4444;box-shadow:0 0 8px #ef4444';
          if (text) text.textContent = '⚠️ Some permissions were not granted — please sign in again and allow all access.';
          showClassroomToast('⚠️ Please grant all permissions and sign in again.');
          // Re-prompt with consent screen so the user can tick all checkboxes.
          setTimeout(() => tokenClient.requestAccessToken({ prompt: 'consent' }), 1500);
          return;
        }

        accessToken = tokenResponse.access_token;
        courseWorkId = await lookupCourseWorkId(accessToken, courseId);
        if (!courseWorkId) {
          // Assignment not found in the URL's courseId — likely a "Re-use post" link
          // from a different classroom. Scan all accessible courses for a match.
          const found = await findCorrectCourse(accessToken);
          if (found.courseId) {
            courseId    = found.courseId;    // update module-level so submitGrade etc. use correct course
            courseWorkId = found.courseWorkId;
          }
        }
        submissionId = await lookupSubmissionId(accessToken, courseWorkId);

        const isTeacher = await detectTeacher(accessToken);
        if (isTeacher) {
          setBannerTeacher(!!proxyUrl);
          if (!proxyUrl) {
            // Show modal so teacher can enter their proxy URL
            const modal = document.getElementById('cr-modal-backdrop');
            if (modal) modal.classList.add('open');
          } else {
            await checkProxyVersion();
          }
        } else {
          setBannerStudent();
        }
      },
    });
  }

  window.initClassroomTokenClient = function () { initTokenClient(); };
  window._classroomSignIn = function () { if (tokenClient) tokenClient.requestAccessToken(); };

  // ── Public API ────────────────────────────────────────────────────────────────

  window.Classroom = {
    get isClassroomContext() { return isClassroomContext; },
    get isAuthenticated()    { return !!accessToken; },

    verifyAuth() {
      if (isClassroomContext && !accessToken) {
        alert("This assignment is linked to Google Classroom.\nPlease click 'Sign in with Google' at the top of the page to record your results.");
        return false;
      }
      return true;
    },

    /**
     * Submit a draft grade via the teacher's Apps Script proxy.
     * No-op when not in a Classroom context, not authenticated, or no proxy configured.
     *
     * @param {number} gradePercent  0–100
     * @param {string} activityName  Logged to console for debugging
     */
    async submitGrade(gradePercent, activityName) {
      if (!accessToken) return;
      if (!proxyUrl) {
        console.error('Classroom: grade not submitted — no proxy URL configured.');
        showClassroomToast('⚠️ Grade not saved — proxy not configured.');
        return;
      }
      await checkProxyVersion();
      if (!proxyVersionOk) {
        console.error('Classroom: grade not submitted — proxy version is below minimum required (need v' + PROXY_MIN_VERSION + ').');
        showClassroomToast('⚠️ Grade not saved — proxy is outdated, please redeploy.');
        return;
      }
      if (!courseWorkId || !submissionId) {
        console.error('Classroom: grade not submitted — could not find matching assignment or submission.',
          { courseWorkId, submissionId });
        showClassroomToast('⚠️ Grade not saved — assignment not found.');
        return;
      }
      try {
        // Send the student's own OAuth token rather than a self-reported userId.
        // The proxy calls the userinfo endpoint to verify identity server-side.
        // submissionId is looked up client-side using the student's own token so
        // the proxy does not need a teacher-level studentSubmissions.list call.
        const res = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            courseId,
            courseWorkId,
            submissionId,
            studentToken: accessToken,
            grade: gradePercent
          }).toString()
        });

        if (!res.ok) {
          const text = await res.text().catch(() => res.status);
          throw new Error(`Proxy returned ${res.status}: ${text}`);
        }
        const result = await res.text();
        if (result !== 'ok') {
          console.warn(`Classroom proxy responded: "${result}" for "${activityName}"`);

          // SERVICE_DISABLED — show actionable modal so the teacher can fix it
          if (result.includes('SERVICE_DISABLED') || result.includes('has not been used')) {
            let projectNum = null;
            try {
              const match = result.match(/"containerInfo":\s*"(\d+)"/);
              if (match) projectNum = match[1];
            } catch (_) {}
            const backdrop = document.getElementById('cr-api-modal-backdrop');
            if (backdrop) {
              if (projectNum) {
                const link = document.getElementById('cr-api-console-link');
                if (link) link.href = 'https://console.developers.google.com/apis/api/classroom.googleapis.com/overview?project=' + projectNum;
              }
              backdrop.classList.add('open');
            }
            showClassroomToast('⚠️ Classroom API not enabled — see popup.');
            return;
          }

          showClassroomToast('⚠️ Grade sync issue — see console.');
          return;
        }
        showClassroomToast('Grade sent to Classroom! ✅');
        console.log(`Classroom grade submitted via proxy: ${gradePercent}% for "${activityName}" — proxy said: ${result}`);
      } catch (err) {
        console.error('Classroom sync failed:', err);
        showClassroomToast('⚠️ Grade sync failed — see console.');
      }
    }
  };

  // ── Bootstrap ─────────────────────────────────────────────────────────────────

  function bootstrap() {
    if (!isClassroomContext) return;
    injectBanner();
    const script = document.createElement('script');
    script.src   = 'https://accounts.google.com/gsi/client';
    script.onload = () => window.initClassroomTokenClient();
    script.async = script.defer = true;
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

}());
