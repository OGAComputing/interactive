/**
 * Rescore PRIMM grades: a one-off Apps Script that converts Classroom draft grades
 * from the old PRIMM weighting (P5 R5 I5, Modify 40, Make 25, Ext 20) to the new one
 * (P10 R5 I35, Modify 30, Make 15, Ext 5), so finishing Modify reads 80%, not 55%.
 *
 * Classroom only holds each student's percentage, not their progress, so the old
 * percentage is mapped onto the new scale stage by stage (CURVES below). A grade
 * never goes down.
 *
 * How to run:
 *   1. At script.google.com, open your "OGA Classroom Grade Proxy" project (it
 *      already has the Classroom permissions). Add a script file, paste this in.
 *      In a new project instead, tick Project Settings → "Show appsscript.json",
 *      add the oauthScopes below to it, and add the Google Classroom API under
 *      Services (that switches the API on for the project):
 *        "oauthScopes": [
 *          "https://www.googleapis.com/auth/classroom.courses.readonly",
 *          "https://www.googleapis.com/auth/classroom.coursework.students",
 *          "https://www.googleapis.com/auth/classroom.rosters.readonly",
 *          "https://www.googleapis.com/auth/script.external_request"
 *        ]
 *   2. Set CUTOFF to when the new scoring went live (when it was pushed to main).
 *   3. Run preview(): View → Logs lists every change. Nothing is written.
 *   4. Run apply() to write them.
 *
 * Only grades last changed before CUTOFF are converted. Grades the new pages send,
 * and grades this script writes, are newer than that, so running it twice is safe.
 */

var CUTOFF = '';                       // e.g. '2026-10-22T16:00:00Z' (UTC)
var UPDATE_RETURNED_GRADES = false;    // true also raises grades already returned to students

// [old %, new %] at each stage boundary: start, Predict, Run, Investigate, Modify, Make, Extension.
var STANDARD = [[0, 0], [5, 10], [10, 15], [15, 50], [55, 80], [80, 95], [100, 100]];
// Turtle: Investigate was 10, its Make 13 per step, plus 1 on completion.
var TURTLE   = [[0, 0], [5, 10], [10, 15], [20, 50], [60, 80], [99, 92], [100, 100]];

// Matched against each assignment's link, as classroom.js does.
var ACTIVITIES = [
  ['Y9/Python/L1_Python_Refresh/1_Wake_Up_PRIMM.html', STANDARD],
  ['Y9/Python/L1_Python_Refresh/2_Life_Support_PRIMM.html', STANDARD],
  ['Y9/Python/L2_Selection/1_Proximity_PRIMM.html', STANDARD],
  ['Y9/Python/L3_While_Loops/1_Locked_In_PRIMM.html', STANDARD],
  ['Y8/Python Unit 1/L1_Output/1_Strings_PRIMM.html', STANDARD],
  ['Y8/Python Unit 1/L2_Variables/1_Variables_PRIMM.html', STANDARD],
  ['Y8/Python Unit 1/L3_Input/1_Input_PRIMM.html', STANDARD],
  ['Y8/Python Unit 1/L4_Data_Types_Casting/1_Casting_PRIMM.html', STANDARD],
  ['Y8/Python Unit 1/L5_Selection/1_Selection_PRIMM.html', STANDARD],
  ['Y8/Python Unit 2/L2_Casting/2 PRIMM.html', STANDARD],
  ['Y8/Python Unit 2/L4_Functions/1_Functions.html', STANDARD],
  ['Y8/Python Unit 2/L3_Turtle_And_Loops/1_For_Loop_Turtle_Challenges.html', TURTLE]
];

var API = 'https://classroom.googleapis.com/v1/';

function preview() { run_(false); }
function apply()   { run_(true); }

function run_(write) {
  var cutoff = Date.parse(CUTOFF);
  if (!CUTOFF || isNaN(cutoff)) throw new Error("Set CUTOFF first, e.g. '2026-10-22T16:00:00Z'.");
  var changed = 0, skippedNewer = 0;

  listAll_(API + 'courses?teacherId=me&courseStates=ACTIVE', 'courses').forEach(function (course) {
    listAll_(API + 'courses/' + course.id + '/courseWork', 'courseWork').forEach(function (cw) {
      var curve = curveFor_(cw);
      if (!curve || !cw.maxPoints) return;
      var path = 'courses/' + course.id + '/courseWork/' + cw.id + '/studentSubmissions';

      listAll_(API + path, 'studentSubmissions').forEach(function (sub) {
        if (typeof sub.draftGrade !== 'number') return;
        if (lastDraftChange_(sub) >= cutoff) { skippedNewer++; return; }

        var body = {}, mask = [];
        var draft = Math.round(convert_(sub.draftGrade, curve));
        if (draft > sub.draftGrade) { body.draftGrade = draft; mask.push('draftGrade'); }
        if (UPDATE_RETURNED_GRADES && typeof sub.assignedGrade === 'number') {
          var assigned = Math.round(convert_(sub.assignedGrade, curve));
          if (assigned > sub.assignedGrade) { body.assignedGrade = assigned; mask.push('assignedGrade'); }
        }
        if (!mask.length) return;

        Logger.log('%s | %s | %s | %s → %s%s', course.name, cw.title, studentName_(course.id, sub.userId),
          sub.draftGrade, draft, body.assignedGrade != null ? ' (returned ' + sub.assignedGrade + ' → ' + body.assignedGrade + ')' : '');
        if (write) call_('patch', API + path + '/' + sub.id + '?updateMask=' + mask.join(','), body);
        changed++;
      });
    });
  });

  Logger.log('%s %s grade(s). %s skipped as already on the new scale.',
    write ? 'Updated' : 'Would update', changed, skippedNewer);
}

// Piecewise-linear map from the old percentage to the new one.
function convert_(old, curve) {
  for (var i = 1; i < curve.length; i++) {
    var a = curve[i - 1], b = curve[i];
    if (old <= b[0]) return a[1] + (old - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
  }
  return 100;
}

function curveFor_(cw) {
  var links = (cw.materials || []).filter(function (m) { return m.link; }).map(function (m) {
    var url = m.link.url.replace(/\+/g, ' ');
    try { return decodeURIComponent(url); } catch (e) { return url; }
  });
  for (var i = 0; i < ACTIVITIES.length; i++) {
    for (var j = 0; j < links.length; j++) {
      if (links[j].indexOf(ACTIVITIES[i][0]) !== -1) return ACTIVITIES[i][1];
    }
  }
  return null;
}

// When the draft grade last changed (falls back to the submission's last update).
function lastDraftChange_(sub) {
  var t = 0;
  (sub.submissionHistory || []).forEach(function (h) {
    var g = h.gradeHistory;
    if (g && g.gradeChangeType === 'DRAFT_GRADE_POINTS_EARNED_CHANGE') t = Math.max(t, Date.parse(g.gradeTimestamp));
  });
  return t || Date.parse(sub.updateTime);
}

// Names need the classroom.rosters.readonly scope, which the proxy doesn't have,
// so this falls back to the Google user ID.
var names_ = {};
function studentName_(courseId, userId) {
  if (!(userId in names_)) {
    try { names_[userId] = call_('get', API + 'courses/' + courseId + '/students/' + userId).profile.name.fullName; }
    catch (e) { names_[userId] = 'user ' + userId; }
  }
  return names_[userId];
}

function listAll_(url, key) {
  var out = [], token = '';
  do {
    var page = call_('get', url + (url.indexOf('?') === -1 ? '?' : '&') + 'pageSize=100' +
      (token ? '&pageToken=' + encodeURIComponent(token) : ''));
    out = out.concat(page[key] || []);
    token = page.nextPageToken;
  } while (token);
  return out;
}

function call_(method, url, body) {
  var opts = { method: method, muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } };
  if (body) { opts.contentType = 'application/json'; opts.payload = JSON.stringify(body); }
  var res = UrlFetchApp.fetch(url, opts);
  if (res.getResponseCode() !== 200) throw new Error(method.toUpperCase() + ' ' + url + ' → ' + res.getResponseCode() + ': ' + res.getContentText());
  return JSON.parse(res.getContentText() || '{}');
}
