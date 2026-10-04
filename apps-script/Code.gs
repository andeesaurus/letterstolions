/**
 * Letters to Lions — Google Sheet backend
 *
 * POST  (from the site)          → saves a letter submission or a "did this help?" vote
 * GET   ?action=letters          → returns letters whose status is "approved" (shown on the site)
 * GET   (no action)              → health check
 *
 * Setup: see apps-script/README.md. In short:
 *   1. Open the Google Sheet → Extensions → Apps Script → paste this file.
 *   2. Run `setup` once (authorizes the script and creates the tabs).
 *   3. Deploy → New deployment → Web app · Execute as: Me · Who has access: Anyone.
 *   4. Paste the /exec URL into config.js (SHEET_URL) on the site.
 */

// ---- Settings -------------------------------------------------------------

// Optional: an email address that gets a short notice for every new letter. Leave '' to disable.
const NOTIFY_EMAIL = '';

const TOPICS = ['Academics', 'Career', 'Money', 'Belonging', 'Relationships', 'Health', 'Others'];
const SCHOOLS = ['CC', 'SEAS', 'BC', 'GS', 'Other'];
const STATUSES = ['pending', 'approved', 'rejected'];

const TABS = {
  letter: {
    name: 'Letters',
    // `pull` and `greeting` are optional, filled in by the team when approving.
    cols: ['timestamp', 'id', 'status', 'title', 'topic', 'name', 'school', 'classYear', 'letter', 'pull', 'greeting'],
  },
  feedback: {
    name: 'Feedback',
    cols: ['timestamp', 'letterId', 'letterTitle', 'helped'],
  },
};
const LIMITS = { title: 100, name: 60, letter: 3000, letterTitle: 200, letterId: 40 };
const WORD_MIN = 50;
const WORD_MAX = 300;
const CACHE_KEY = 'approved-letters';
const CACHE_SECONDS = 300;

// ---- Web app endpoints ----------------------------------------------------

function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return out({ ok: false, error: 'invalid JSON' });
  }

  // Honeypot: the site has a hidden "website" field that people never fill in, but bots do.
  if (data.website) return out({ ok: true });

  const clean = data.type === 'letter' ? cleanLetter(data)
              : data.type === 'feedback' ? cleanFeedback(data)
              : { error: 'unknown type' };
  if (clean.error) return out({ ok: false, error: clean.error });

  const tab = TABS[data.type];
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet(tab);
    sheet.appendRow(tab.cols.map(c => c === 'timestamp' ? new Date() : safe(clean[c])));
  } finally {
    lock.releaseLock();
  }

  if (data.type === 'letter' && NOTIFY_EMAIL) notify(clean);
  return out({ ok: true, id: clean.id || null });
}

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === 'letters') return out({ ok: true, letters: approvedLetters() });
  return out({ ok: true, service: 'Letters to Lions' });
}

// ---- Validation -----------------------------------------------------------

function cleanLetter(d) {
  const r = {
    id: Utilities.getUuid().slice(0, 8),
    status: 'pending',
    title: text(d.title, LIMITS.title),
    letter: text(d.letter, LIMITS.letter),
    topic: text(d.topic, 40),
    name: text(d.name, LIMITS.name),
    school: text(d.school, 20),
    classYear: text(d.classYear, 10),
  };
  if (!r.title || !r.letter || !r.topic) return { error: 'missing required field' };
  const words = r.letter.split(/\s+/).filter(Boolean).length;
  if (words < WORD_MIN || words > WORD_MAX) return { error: 'letter must be ' + WORD_MIN + '–' + WORD_MAX + ' words' };
  if (TOPICS.indexOf(r.topic) < 0) return { error: 'unknown topic' };
  if (r.school && SCHOOLS.indexOf(r.school) < 0) r.school = 'Other';
  if (r.classYear && !/^(\d{4}|Other)$/.test(r.classYear)) r.classYear = '';
  return r;
}

function cleanFeedback(d) {
  const r = {
    letterId: text(d.letterId, LIMITS.letterId),
    letterTitle: text(d.letterTitle, LIMITS.letterTitle),
    helped: d.helped === true || d.helped === 'Yes' ? 'Yes' : 'No',
  };
  if (!r.letterId) return { error: 'missing letterId' };
  return r;
}

function text(v, max) {
  return (v == null ? '' : String(v)).replace(/\r\n?/g, '\n').trim().slice(0, max);
}

// Stop anything that looks like a formula from being evaluated by Sheets.
function safe(v) {
  v = v == null ? '' : String(v);
  return /^[=+\-@\t]/.test(v) ? "'" + v : v;
}

// ---- Approved letters (read by the site) ----------------------------------

function approvedLetters() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get(CACHE_KEY);
  if (hit) return JSON.parse(hit);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TABS.letter.name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const rows = sheet.getDataRange().getValues();
  const head = rows.shift().map(String);
  const col = name => head.indexOf(name);

  const letters = rows
    .filter(r => String(r[col('status')]).trim().toLowerCase() === 'approved')
    .map(r => {
      const get = name => col(name) < 0 ? '' : String(r[col(name)]).replace(/^'/, '').trim();
      const paras = get('letter').split(/\n\s*\n|\n/).map(s => s.trim()).filter(Boolean);
      const year = get('classYear');
      return {
        id: get('id'),
        topic: get('topic'),
        title: get('title'),
        author: get('name') || 'Anonymous',
        school: get('school') === 'Other' ? '' : get('school'),
        year: /^\d{4}$/.test(year) ? year.slice(2) : '',
        greeting: get('greeting'),
        pull: get('pull') || paras[0] || '',
        paras: paras,
      };
    })
    .filter(l => l.id && l.title && l.paras.length)
    .reverse(); // newest first

  const json = JSON.stringify(letters);
  if (json.length < 100000) cache.put(CACHE_KEY, json, CACHE_SECONDS);
  return letters;
}

// Simple trigger: when the team edits the Letters tab (e.g. approves a letter),
// drop the cache so the change shows up on the site right away.
function onEdit(e) {
  if (e && e.range && e.range.getSheet().getName() === TABS.letter.name) {
    CacheService.getScriptCache().remove(CACHE_KEY);
  }
}

// ---- Sheet helpers --------------------------------------------------------

function getSheet(tab) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(tab.name);
  if (!sh) {
    sh = ss.insertSheet(tab.name);
    formatSheet(sh, tab);
  }
  return sh;
}

function formatSheet(sh, tab) {
  sh.getRange(1, 1, 1, tab.cols.length).setValues([tab.cols]).setFontWeight('bold').setBackground('#DCEBF5');
  sh.setFrozenRows(1);
  if (tab === TABS.letter) {
    const statusCol = tab.cols.indexOf('status') + 1;
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build();
    sh.getRange(2, statusCol, sh.getMaxRows() - 1, 1).setDataValidation(rule);
    const letterCol = tab.cols.indexOf('letter') + 1;
    sh.setColumnWidth(letterCol, 420);
    sh.getRange(2, letterCol, sh.getMaxRows() - 1, 1).setWrap(true);
  }
}

/** Run once from the Apps Script editor: creates/formats the tabs and asks for permissions. */
function setup() {
  Object.keys(TABS).forEach(k => {
    const tab = TABS[k];
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(tab.name) || ss.insertSheet(tab.name);
    formatSheet(sh, tab);
  });
  CacheService.getScriptCache().remove(CACHE_KEY);
}

function notify(l) {
  try {
    MailApp.sendEmail(NOTIFY_EMAIL, 'New Letters to Lions submission: ' + l.title,
      'Topic: ' + l.topic + '\nFrom: ' + (l.name || 'Anonymous') + ' ' + l.school + ' ' + l.classYear +
      '\n\n' + l.letter + '\n\nReview it in the "Letters" tab: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
  } catch (err) {
    console.warn('notify failed: ' + err);
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
