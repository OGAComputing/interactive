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
  // drive.file — create and update evidence files the app itself creates.
  // drive.metadata.readonly + script.deployments — auto-discover the proxy URL from Drive after sign-in.
  const SCOPE = 'https://www.googleapis.com/auth/classroom.coursework.me https://www.googleapis.com/auth/classroom.courses.readonly openid email https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/script.deployments';

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

  // tokenClient removed — sign-in uses a full-page redirect (no popup)
  let accessToken  = null;
  let courseWorkId   = null; // resolved after sign-in
  let submissionId   = null; // resolved after sign-in

  let proxyVersionChecked = false;
  let proxyVersionOk      = true; // set to false only when version endpoint confirms it is below minimum

  let userInfo             = null; // { email, name } fetched from Google userinfo after sign-in
  let isTeacherMode        = false; // true once detectTeacher confirms the signed-in user is a teacher
  let pendingEvidenceTimer = null; // debounce handle — evidence upload fires 2 s after last submitGrade

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
    if (text) text.textContent = '✅ Connected to Google Classroom — your results and work evidence are saved automatically.';
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

  // Search the signed-in user's Drive for the OGA proxy script and return its web app URL,
  // or null if not found. Requires drive.metadata.readonly + script.deployments scopes.
  async function searchDriveForProxy(token) {
    try {
      const searchRes = await fetch(
        'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
          q: "mimeType='application/vnd.google-apps.script' and name='OGA Classroom Grade Proxy' and trashed=false",
          fields: 'files(id,name)',
          pageSize: 5
        }),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { files } = await searchRes.json();
      if (!files || files.length === 0) return null;
      const depRes = await fetch(
        `https://script.googleapis.com/v1/projects/${files[0].id}/deployments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const depData = await depRes.json();
      // Sort by updateTime descending to ensure we get the latest deployment
      const deployments = (depData.deployments || []).sort((a, b) => 
        new Date(b.updateTime) - new Date(a.updateTime)
      );
      const webAppDep = deployments.find(d =>
        (d.entryPoints || []).some(ep => ep.entryPointType === 'WEB_APP')
      );
      const ep = webAppDep?.entryPoints?.find(ep => ep.entryPointType === 'WEB_APP');
      return ep?.webApp?.url || null;
    } catch (e) {
      console.warn('Classroom: Drive proxy search failed', e);
      return null;
    }
  }

  window._classroomSearchDriveForProxy = async function () {
    const btn = document.getElementById('cr-drive-search-btn');
    if (btn) { btn.textContent = '🔍 Searching…'; btn.disabled = true; }
    const url = await searchDriveForProxy(accessToken);
    if (btn) { btn.textContent = '🔍 Search my Drive for proxy script'; btn.disabled = false; }
    if (url) {
      const input = document.getElementById('cr-proxy-input');
      if (input) input.value = url;
      if (btn) btn.textContent = '✅ Found — click Save & use';
      showClassroomToast('Proxy URL found — click Save & use ✅');
    } else {
      showClassroomToast('⚠️ No proxy script found in Drive.');
    }
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

  function showProxyCorsWarning() {
    const text = document.getElementById('classroom-text');
    if (text) text.textContent = '⚠️ Proxy not accessible — redeploy the Apps Script with "Anyone" access (not "Anyone with Google account").';
    const dot = document.getElementById('classroom-dot');
    if (dot) { dot.style.background = '#ef4444'; dot.style.boxShadow = '0 0 8px #ef4444'; }
    showClassroomToast('⚠️ Proxy blocked — teacher must redeploy with "Anyone" access.');
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
      // fetch threw — could be a true network error or a CORS block (e.g. proxy deployed with
      // "Anyone with Google account" access, causing Google to redirect to Sign-In which has
      // no CORS headers).  A no-cors probe distinguishes the two: if it succeeds with an
      // opaque response, the URL is reachable but CORS-blocked → deployment issue.
      try {
        const probe = await fetch(proxyUrl + '?action=version', { mode: 'no-cors' });
        if (probe.type === 'opaque') {
          // URL is reachable but cross-origin access is blocked — proxy needs redeployment
          proxyVersionOk = false;
          showProxyCorsWarning();
          console.error('Classroom: proxy URL is CORS-blocked. The Apps Script must be deployed with "Who has access: Anyone" (not "Anyone with Google account"). Redeploy from the Apps Script editor.');
        }
      } catch (_2) {
        // True network error (offline, bad URL, etc.) — don't warn or block
      }
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

  // ── Work evidence ─────────────────────────────────────────────────────────────
  // When a student completes a task, capture all visible answers and upload a
  // clean HTML evidence report to their Google Drive, then attach it to their
  // Classroom submission.  Subsequent completions PATCH the same Drive file so
  // there is always exactly one attachment — no duplicates accumulate.

  async function fetchUserInfo(token) {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return null;
      const d = await res.json();
      return { email: d.email || '', name: d.name || d.given_name || '' };
    } catch (_) { return null; }
  }

  // ── DOM scraper ───────────────────────────────────────────────────────────────
  // Walks the live page and collects { label, value, type, feedback } for every
  // answered question.  Handles the three main activity patterns:
  //   • .q-card  (PRIMM, template-based activities)
  //   • .qcard / .card  (older spot-the-error / multiple-choice layouts)
  //   • .code-checker  (code paste areas)

  function scrapeWorkAnswers() {
    const results        = [];
    const seenInputs     = new Set();
    const seenRadioNames = new Set();

    // Exclude the Classroom banner and modal overlays from scraping.
    const SKIP_SELECTOR = '#classroom-banner,#cr-modal-backdrop,#cr-api-modal-backdrop';

    function isHidden(el) {
      // Skip elements inside modals / banners, or with display:none
      if (el.closest(SKIP_SELECTOR)) return true;
      return false;
    }

    // Find the most descriptive label for a form element by walking up to a
    // known container, then looking for a heading/label element inside it.
    function findLabel(el) {
      const container = el.closest('.q-card,.qcard,.card,.code-checker,fieldset');
      if (container) {
        const lbl = container.querySelector('.q-label,.qtitle,h3,.ch-label,legend');
        if (lbl) {
          let t = (lbl.innerText || lbl.textContent || '').trim();
          // Strip leading question number e.g. "1 What is…" → "What is…"
          t = t.replace(/^\s*\d+[\s.)]*/, '').trim();
          if (t) return t;
        }
      }
      if (el.id) {
        const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (lbl) return (lbl.innerText || lbl.textContent || '').trim();
      }
      return el.placeholder || el.getAttribute('name') || null;
    }

    // Find pass/fail feedback element near a form element.
    function findFeedback(el) {
      const container = el.closest('.q-card,.qcard,.card,.code-checker,.checker-footer');
      if (!container) return null;
      // Explicit feedback elements
      const fb = container.querySelector(
        '.mcq-fb.pass,.mcq-fb.fail,.feedback.pass,.feedback.fail'
      );
      if (fb) {
        return {
          passed : fb.classList.contains('pass'),
          text   : (fb.innerText || fb.textContent || '').trim()
        };
      }
      // Container-level class (correct/wrong card border changes)
      if (container.classList.contains('correct') ||
          container.classList.contains('answered-correct')) return { passed: true,  text: '' };
      if (container.classList.contains('incorrect') ||
          container.classList.contains('answered-wrong'))  return { passed: false, text: '' };
      return null;
    }

    // 1. Text inputs and textareas that have content
    document.querySelectorAll('input[type="text"],textarea').forEach(el => {
      if (seenInputs.has(el) || isHidden(el)) return;
      if (!el.value.trim()) return;
      seenInputs.add(el);
      const isCode = !!el.closest('.code-checker') ||
                     el.classList.contains('checker-textarea');
      results.push({
        label    : findLabel(el) || (isCode ? 'Code submission' : 'Response'),
        value    : el.value,
        type     : isCode ? 'code' : 'text',
        feedback : findFeedback(el)
      });
    });

    // 2. Radio buttons — one entry per named group (the selected option)
    document.querySelectorAll('input[type="radio"]:checked').forEach(el => {
      if (seenRadioNames.has(el.name) || isHidden(el)) return;
      seenRadioNames.add(el.name);
      const optEl = el.closest('label,.radio-opt,.mc-option');
      let value = optEl
        ? (optEl.innerText || optEl.textContent || '').trim()
        : el.value;
      // Strip stray radio-button characters that appear in innerText
      value = value.replace(/^[\s●○◉◎·•]+/, '').trim();
      results.push({
        label    : findLabel(el) || el.name,
        value,
        type     : 'choice',
        feedback : findFeedback(el)
      });
    });

    return results;
  }

  // ── HTML report builder ───────────────────────────────────────────────────────
  function buildEvidenceHtml(activityTitle, score) {
    function esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    const now = new Date().toLocaleString('en-GB', {
      dateStyle: 'full', timeStyle: 'short'
    });
    const studentLabel = userInfo
      ? esc(userInfo.name || '') + (userInfo.email ? ' &lt;' + esc(userInfo.email) + '&gt;' : '')
      : 'Student';
    const scoreHtml = score !== null && score !== undefined
      ? `<div class="ev-score"><div class="score-num">${Number(score)}%</div><div class="score-label">Score</div></div>`
      : '';

    const answers = scrapeWorkAnswers();
    const sectionsHtml = answers.length === 0
      ? '<p class="ev-empty">No answers recorded yet — the student has not completed any tasks.</p>'
      : answers.map((a, i) => {
          const typeIcon  = { text: '📝', code: '💻', choice: '🔘' }[a.type] || '📝';
          const typeLabel = { text: 'Written answer', code: 'Code', choice: 'Multiple choice' }[a.type] || 'Response';
          const answerHtml = a.value.trim()
            ? (a.type === 'code'
                ? `<pre class="ev-answer code">${esc(a.value)}</pre>`
                : `<div class="ev-answer">${esc(a.value)}</div>`)
            : `<div class="ev-answer empty">(no answer entered)</div>`;
          const fbHtml = a.feedback
            ? `<div class="ev-feedback ${a.feedback.passed ? 'pass' : 'fail'}">${esc(a.feedback.text || (a.feedback.passed ? '✅ Correct' : '❌ Incorrect'))}</div>`
            : '';
          return `
    <div class="ev-section">
      <div class="ev-label">${typeIcon} ${esc(typeLabel)} · Q${i + 1}</div>
      <div class="ev-question">${esc(a.label)}</div>
      ${answerHtml}${fbHtml}
    </div>`;
        }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(activityTitle)} — Work Evidence</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#f1f5f9;color:#1e293b;padding:20px;min-height:100vh}
  .ev-wrap{max-width:820px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.12)}
  .ev-head{background:linear-gradient(135deg,#1e3a5f 0%,#0f2040 100%);color:#fff;padding:24px 28px;border-bottom:3px solid #3b82f6;overflow:hidden}
  .ev-score{float:right;background:rgba(59,130,246,.25);border:1px solid rgba(59,130,246,.5);border-radius:10px;padding:10px 18px;text-align:center;margin:0 0 8px 16px}
  .ev-score .score-num{font-size:2rem;font-weight:800;line-height:1;color:#fff}
  .ev-score .score-label{font-size:.7rem;color:#93c5fd;margin-top:2px}
  .ev-title{font-size:1.35rem;font-weight:700;margin-bottom:3px}
  .ev-subtitle{font-size:.92rem;color:#93c5fd;margin-bottom:10px}
  .ev-meta{font-size:.78rem;color:#bfdbfe;display:flex;flex-wrap:wrap;gap:4px 16px}
  .ev-body{padding:24px 28px}
  .ev-section{margin-bottom:22px;padding-bottom:20px;border-bottom:1px solid #f1f5f9}
  .ev-section:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
  .ev-label{font-size:.7rem;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:.06em;margin-bottom:5px}
  .ev-question{font-size:.93rem;font-weight:600;color:#334155;margin-bottom:9px;line-height:1.5}
  .ev-answer{background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:11px 14px;font-size:.91rem;color:#1e293b;white-space:pre-wrap;word-break:break-word;line-height:1.6}
  .ev-answer.code{font-family:'Cascadia Code','Consolas','Courier New',monospace;font-size:.82rem;background:#0f172a;color:#e2e8f0;border-color:#1e293b;overflow-x:auto}
  .ev-answer.empty{color:#94a3b8;font-style:italic}
  .ev-feedback{margin-top:8px;font-size:.82rem;font-weight:600;padding:6px 10px;border-radius:6px}
  .ev-feedback.pass{background:#dcfce7;color:#166534;border:1px solid #86efac}
  .ev-feedback.fail{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5}
  .ev-empty{color:#94a3b8;font-style:italic;font-size:.9rem}
  .ev-footer{text-align:center;font-size:.72rem;color:#94a3b8;padding:14px 28px;border-top:1px solid #f1f5f9;background:#fafafa}
  @media print{body{background:#fff;padding:0}.ev-wrap{box-shadow:none;border-radius:0}}
</style>
</head>
<body>
<div class="ev-wrap">
  <div class="ev-head">
    ${scoreHtml}
    <div class="ev-title">📋 Work Evidence</div>
    <div class="ev-subtitle">${esc(activityTitle)}</div>
    <div class="ev-meta">
      <span>👤 ${studentLabel}</span>
      <span>🕐 ${esc(now)}</span>
      <span>🔗 ${esc(window.location.pathname)}</span>
    </div>
  </div>
  <div class="ev-body">${sectionsHtml}
  </div>
  <div class="ev-footer">OGA Computing Interactive · Work Evidence · ${esc(now)}</div>
</div>
</body>
</html>`;
  }

  // ── Drive API helpers ─────────────────────────────────────────────────────────

  async function driveCreateFile(filename, html) {
    const boundary = 'ev' + Date.now().toString(36);
    const meta     = JSON.stringify({ name: filename, mimeType: 'application/vnd.google-apps.document' });
    const body     =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
      `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n` +
      `--${boundary}--`;
    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method  : 'POST',
        headers : {
          Authorization  : `Bearer ${accessToken}`,
          'Content-Type' : `multipart/related; boundary=${boundary}`
        },
        body
      }
    );
    if (!res.ok) throw new Error(`Drive create ${res.status}: ${await res.text().catch(() => '')}`);
    return (await res.json()).id;
  }

  async function driveUpdateFile(fileId, filename, html) {
    const boundary = 'ev' + Date.now().toString(36);
    const meta     = JSON.stringify({ name: filename, mimeType: 'application/vnd.google-apps.document' });
    const body     =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n` +
      `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}\r\n` +
      `--${boundary}--`;
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=multipart`,
      {
        method  : 'PATCH',
        headers : {
          Authorization  : `Bearer ${accessToken}`,
          'Content-Type' : `multipart/related; boundary=${boundary}`
        },
        body
      }
    );
    if (!res.ok) {
      const err = Object.assign(new Error(`Drive update ${res.status}`), { status: res.status });
      throw err;
    }
    return fileId;
  }

  async function classroomAddAttachment(fileId) {
    if (!courseId || !courseWorkId || !submissionId) return;
    const res = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}` +
      `/studentSubmissions/${submissionId}:modifyAttachments`,
      {
        method  : 'POST',
        headers : {
          Authorization  : `Bearer ${accessToken}`,
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify({ addAttachments: [{ driveFile: { id: fileId } }] })
      }
    );
    if (!res.ok) {
      throw new Error(`modifyAttachments ${res.status}: ${await res.text().catch(() => '')}`);
    }
  }

  // ── Upload orchestrator ───────────────────────────────────────────────────────

  async function doUploadWorkEvidence(activityName, score) {
    if (!accessToken || !isClassroomContext || isTeacherMode) return;
    if (!courseWorkId || !submissionId) return;

    const storageKey = `oga_ev_${courseId}_${courseWorkId}`;
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch (_) {}

    const safeName = (activityName || 'Activity').replace(/[^a-z0-9 \-]/gi, '_').trim();
    const filename  = `${safeName} — Work Evidence`;

    let html;
    try { html = buildEvidenceHtml(activityName, score); } catch (e) {
      console.error('Classroom: evidence HTML build failed', e); return;
    }

    // Upload: update existing Google Doc, or create a new one.
    // Legacy entries without isGoogleDoc are HTML files that cannot be converted
    // in-place — skip them so a proper Google Doc is created instead.
    let fileId = (saved?.fileId && saved?.isGoogleDoc) ? saved.fileId : null;
    let newFile = false;
    try {
      if (fileId) {
        try {
          await driveUpdateFile(fileId, filename, html);
        } catch (e) {
          if (e.status === 404) { fileId = null; }  // file was deleted — fall through to create
          else throw e;
        }
      }
      if (!fileId) {
        fileId = await driveCreateFile(filename, html);
        newFile = true;
      }
    } catch (e) {
      console.error('Classroom: Drive evidence upload failed', e);
      return;
    }

    // Add to submission once (the attachment link stays valid as the file is updated in place).
    const alreadyAttached = saved?.attachmentAdded && saved?.isGoogleDoc && !newFile;
    if (!alreadyAttached) {
      try {
        await classroomAddAttachment(fileId);
        try { localStorage.setItem(storageKey, JSON.stringify({ fileId, attachmentAdded: true, isGoogleDoc: true })); } catch (_) {}
        showClassroomToast('📎 Work evidence attached ✅');
      } catch (e) {
        console.warn('Classroom: could not attach evidence to submission', e);
        try { localStorage.setItem(storageKey, JSON.stringify({ fileId, attachmentAdded: false, isGoogleDoc: true })); } catch (_) {}
        showClassroomToast('📎 Work evidence saved to Drive ✅');
      }
    } else {
      try { localStorage.setItem(storageKey, JSON.stringify({ fileId, attachmentAdded: true, isGoogleDoc: true })); } catch (_) {}
      // File updated silently — grade toast already shown, no second toast needed.
      console.log(`Classroom: evidence updated for "${activityName}" (fileId: ${fileId})`);
    }
  }

  // Debounce: when submitGrade is called several times in quick succession
  // (e.g. each code check fires a score update), wait for things to settle
  // before taking a DOM snapshot and uploading.
  function scheduleEvidenceUpload(activityName, score) {
    if (pendingEvidenceTimer) clearTimeout(pendingEvidenceTimer);
    pendingEvidenceTimer = setTimeout(() => {
      pendingEvidenceTimer = null;
      doUploadWorkEvidence(activityName, score);
    }, 2000);
  }

  // ── OAuth ─────────────────────────────────────────────────────────────────────

  // ── Token response handler ────────────────────────────────────────────────────
  // Shared between the redirect-return path (sessionStorage) and any future
  // popup fallback. Extracted so the bootstrap and re-prompt paths both use it.

  async function handleTokenResponse(tokenResponse) {
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
      try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch (_) {}
      const dot  = document.getElementById('classroom-dot');
      const text = document.getElementById('classroom-text');
      if (dot)  dot.style.cssText = 'background:#ef4444;box-shadow:0 0 8px #ef4444';
      if (text) text.textContent = '⚠️ Some permissions were not granted — please sign in again and allow all access.';
      showClassroomToast('⚠️ Please grant all permissions and sign in again.');
      // Re-prompt with consent screen so the user can tick all checkboxes.
      setTimeout(() => signInViaRedirect({ prompt: 'consent' }), 1500);
      return;
    }

    accessToken = tokenResponse.access_token;
    userInfo    = await fetchUserInfo(accessToken);

    // Always search Drive for the proxy URL so teachers automatically pick up
    // redeployments (new URL) from any computer. The ?proxyUrl= param wins and
    // is never overwritten; localStorage is treated as a cache only.
    if (!urlParams.get('proxyUrl')) {
      const discovered = await searchDriveForProxy(accessToken);
      if (discovered) {
        if (discovered !== proxyUrl) {
          proxyUrl = discovered;
          try { localStorage.setItem('oga_proxy_url', discovered); } catch (_) {}
          console.log('Classroom: proxy URL updated from Drive');
        }
      } else if (proxyUrl) {
        // Drive search found no proxy script — the file was likely deleted.
        // Clear the cached URL so the teacher is prompted to redeploy a new
        // one rather than silently failing against a stale endpoint.
        proxyUrl = null;
        try { localStorage.removeItem('oga_proxy_url'); } catch (_) {}
        console.log('Classroom: proxy script not found in Drive — cached URL cleared, teacher will be prompted to redeploy');
      }
    }

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
    isTeacherMode = isTeacher;
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
  }

  // ── Redirect-based sign-in ────────────────────────────────────────────────────
  // Constructs a standard OAuth 2.0 implicit-grant URL and navigates the whole
  // page to Google. No popup is opened, so school popup-blockers cannot interfere.
  // After sign-in Google redirects to oauth-callback.html, which stores the token
  // in sessionStorage and bounces the user back to the originating activity page.

  function signInViaRedirect(opts) {
    const params = new URLSearchParams({
      client_id    : CLIENT_ID,
      redirect_uri : window.location.origin + '/interactive/oauth-callback.html',
      response_type: 'token',
      scope        : SCOPE,
      prompt       : (opts && opts.prompt) || 'select_account',
    });
    try { sessionStorage.setItem('oga_return_url', window.location.href); } catch (_) {}
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + params;
  }

  // Called on page load to pick up a token left by oauth-callback.html after
  // returning from Google's sign-in page.
  const AUTH_STORAGE_KEY = 'oga_auth';

  function checkPendingOAuthToken() {
    let json = null;
    try { json = sessionStorage.getItem('oga_oauth_token'); } catch (_) {}
    if (!json) return false;
    try { sessionStorage.removeItem('oga_oauth_token'); } catch (_) {}
    let data;
    try { data = JSON.parse(json); } catch (_) { return false; }
    if (!data.access_token) return false;
    // Discard if already expired (30 s margin for clock skew).
    if (data.expires_at && data.expires_at < Date.now() + 30000) {
      console.warn('Classroom: discarding expired token from redirect');
      return false;
    }
    // Persist for cross-activity reuse within the ~1-hour token lifetime.
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        access_token : data.access_token,
        scope        : data.scope || '',
        expires_at   : data.expires_at
      }));
    } catch (_) {}
    handleTokenResponse({ access_token: data.access_token, scope: data.scope || '' });
    return true;
  }

  // Restore a previously saved token (e.g. page refresh or a different activity).
  // Calls handleTokenResponse if a non-expired token is found.
  function checkStoredToken() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null'); } catch (_) {}
    if (!data || !data.access_token) return false;
    if (data.expires_at && data.expires_at < Date.now() + 30000) {
      try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch (_) {}
      return false;
    }
    handleTokenResponse({ access_token: data.access_token, scope: data.scope || '' });
    return true;
  }

  window._classroomSignIn = function () { signInViaRedirect(); };

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

      // Always schedule a work evidence upload when a student completes a task,
      // regardless of whether the grade proxy is configured.
      scheduleEvidenceUpload(activityName, gradePercent);

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
    // Pick up token from redirect, or restore a persisted one (refresh / different activity).
    if (!checkPendingOAuthToken() && !checkStoredToken()) {
      // No token available. Check if a previous silent-auth attempt already failed
      // (set by oauth-callback.html when prompt=none returns an error).
      let silentFailed = false;
      try { silentFailed = !!sessionStorage.getItem('oga_silent_failed'); } catch (_) {}
      if (silentFailed) {
        // Silent auth failed — clear flag and leave the sign-in button visible.
        try { sessionStorage.removeItem('oga_silent_failed'); } catch (_) {}
      } else {
        // Try silent sign-in using the browser's existing Google session.
        // Works automatically if the student is already signed into Chrome and has
        // previously granted the required scopes (common in a managed school environment).
        // If it fails, oauth-callback.html sets oga_silent_failed and bounces back here.
        signInViaRedirect({ prompt: 'none' });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

}());
