/**
 * Letters to Lions — Instagram post generator
 *
 * When a letter's status is changed to "approved" in the Letters tab, this:
 *   1. copies your Google Slides template,
 *   2. fills in the {{placeholders}} with the letter's text,
 *   3. makes a new subfolder in your Drive folder, named  YYYY-MM-DD_<id>_<title>
 *      (e.g. 2026-10-05_ab12cd34_Take-it-slow), and saves the slides + a PNG per slide in it,
 *   4. writes the subfolder link into the letter's "post" column.
 *
 * A letter gets a post only once. To regenerate it, clear its "post" cell and approve it again
 * (set status to pending, then approved).
 *
 * Setup: see apps-script/README.md → "Instagram posts". In short:
 *   1. Put {{placeholders}} in your Slides template (list below).
 *   2. Paste the template ID and folder ID below.
 *   3. Run `setupInstagram` once.
 *
 * Placeholders you can type anywhere in the template (any slide, any text box):
 *   {{title}}     letter title
 *   {{greeting}}  e.g. "Dear Lion," (the sheet's greeting column, or "Dear Lion,")
 *   {{pull}}      short quote (the sheet's pull column, or the first paragraph)
 *   {{body}}      the whole letter
 *   {{p1}} … {{p9}}  paragraph 1 … 9 (for carousel posts; unused ones become blank)
 *   {{author}}    name, or "Anonymous"
 *   {{byline}}    e.g. "— Jo, SEAS '27"
 *   {{school}} {{year}} {{topic}}
 */

// ---- Settings: paste your IDs here -----------------------------------------

// From the template's URL: docs.google.com/presentation/d/<THIS PART>/edit
const IG_TEMPLATE_ID = '1KAIi4r65c6dcwjRuCOUhyyxNTKPk3rL-W2Aox6f0jBs';
// From the folder's URL: drive.google.com/drive/folders/<THIS PART>
const IG_FOLDER_ID = '1HoOp6JKgC7tXg_Vh8pkVQp_BBh_IP7w3';
// Also save a PNG of each slide (ready to upload to Instagram).
const IG_EXPORT_PNG = true;

// ---- Trigger ----------------------------------------------------------------

/** Run once from the Apps Script editor. Asks for Slides/Drive permission and turns on the trigger. */
function setupInstagram() {
  if (!IG_TEMPLATE_ID || !IG_FOLDER_ID) throw new Error('Paste IG_TEMPLATE_ID and IG_FOLDER_ID at the top of Instagram.gs first.');
  SlidesApp.openById(IG_TEMPLATE_ID);   // checks access to the template
  DriveApp.getFolderById(IG_FOLDER_ID); // checks access to the folder
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'onApproveForInstagram')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onApproveForInstagram').forSpreadsheet(ss).onEdit().create();
  postColumn(ss.getSheetByName(TABS.letter.name));
}

/** Installable onEdit trigger (created by setupInstagram). */
function onApproveForInstagram(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== TABS.letter.name) return;
  const head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const statusCol = head.indexOf('status') + 1;
  if (!statusCol || e.range.getColumn() > statusCol || e.range.getLastColumn() < statusCol) return;

  for (let row = Math.max(2, e.range.getRow()); row <= e.range.getLastRow(); row++) {
    const status = String(sheet.getRange(row, statusCol).getValue()).trim().toLowerCase();
    if (status === 'approved') makeInstagramPost(sheet, row);
  }
}

// ---- Post generation ----------------------------------------------------------

function makeInstagramPost(sheet, row) {
  const postCol = postColumn(sheet);
  const postCell = sheet.getRange(row, postCol);
  if (String(postCell.getValue()).trim()) return; // already made

  const head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const values = sheet.getRange(row, 1, 1, head.length).getValues()[0];
  const get = name => head.indexOf(name) < 0 ? '' : String(values[head.indexOf(name)]).replace(/^'/, '').trim();

  try {
    const fields = postFields(get);
    const name = postName(get('id'), fields.title);
    const folder = DriveApp.getFolderById(IG_FOLDER_ID).createFolder(name);
    const copy = DriveApp.getFileById(IG_TEMPLATE_ID).makeCopy(name + '_slides', folder);

    const deck = SlidesApp.openById(copy.getId());
    Object.keys(fields).filter(k => typeof fields[k] === 'string')
      .forEach(k => deck.replaceAllText('{{' + k + '}}', fields[k]));
    for (let i = 1; i <= 9; i++) deck.replaceAllText('{{p' + i + '}}', fields.paras[i - 1] || '');
    deck.saveAndClose();

    if (IG_EXPORT_PNG) exportSlidesAsPng(copy.getId(), name, folder);
    postCell.setValue(folder.getUrl());
  } catch (err) {
    postCell.setValue('ERROR: ' + err.message + ' (clear this cell and re-approve to retry)');
  }
}

/** Standard name: YYYY-MM-DD_<letter id>_<Title-words> (date = day it was approved). */
function postName(id, title) {
  const date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const slug = String(title || 'Letter').normalize('NFKD').replace(/[^\w\s-]/g, '')
    .trim().replace(/\s+/g, '-').slice(0, 40) || 'Letter';
  return date + '_' + id + '_' + slug;
}

function postFields(get) {
  const paras = get('letter').split(/\n\s*\n|\n/).map(s => s.trim()).filter(Boolean);
  const school = get('school') === 'Other' ? '' : get('school');
  const year = /^\d{4}$/.test(get('classYear')) ? get('classYear').slice(2) : '';
  const tag = [school, year ? "'" + year : ''].filter(Boolean).join(' ');
  const author = get('name') || 'Anonymous';
  return {
    title: get('title'),
    greeting: get('greeting') || 'Dear Lion,',
    pull: get('pull') || paras[0] || '',
    body: paras.join('\n\n'),
    author: author,
    byline: '— ' + [author, tag].filter(Boolean).join(', '),
    school: school,
    year: year ? "'" + year : '',
    topic: get('topic'),
    paras: paras, // used for {{p1}}…{{p9}}
  };
}

function exportSlidesAsPng(presentationId, name, folder) {
  const slides = SlidesApp.openById(presentationId).getSlides();
  const token = ScriptApp.getOAuthToken();
  slides.forEach((slide, i) => {
    const url = 'https://docs.google.com/presentation/d/' + presentationId +
      '/export/png?pageid=' + slide.getObjectId();
    const blob = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + token } }).getBlob();
    folder.createFile(blob.setName(name + '_' + String(i + 1).padStart(2, '0') + '.png'));
  });
}

/** Returns the "post" column number, adding the header if the sheet doesn't have it yet. */
function postColumn(sheet) {
  const lastCol = sheet.getLastColumn();
  const head = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  const i = head.indexOf('post');
  if (i >= 0) return i + 1;
  sheet.getRange(1, lastCol + 1).setValue('post').setFontWeight('bold').setBackground('#DCEBF5');
  return lastCol + 1;
}
