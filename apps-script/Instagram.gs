/**
 * Letters to Lions — Instagram carousel export
 *
 * When a letter's status is set to "approved" in the Letters tab, this:
 *   1. copies the Slides template into a new subfolder named  YYYY-MM-DD_<id>_<Title>,
 *   2. splits the letter into pages and duplicates the template's 2nd slide ("next page") as needed,
 *   3. fills in the placeholders, keeping the template's fonts and adding a first-line indent per paragraph,
 *   4. saves a PNG of every slide (…_01.png, …_02.png, …) in the same subfolder,
 *   5. writes the subfolder link into the letter's "post" column.
 * Status stays "approved" so the letter stays on the website.
 *
 * A letter gets a post only once. Setting status back to pending/rejected moves its folder to the Drive trash
 * (recoverable for 30 days); approving again makes a fresh post. Deleted rows are cleaned up daily by cleanUpPosts.
 * Or run  exportRow(5)  from the editor (5 = sheet row number).
 *
 * TEMPLATE (2 slides):
 *   Slide 1 = first page. Slide 2 = next page (copied for page 2, 3, …).
 *   Placeholders (each in its own text box, styled the way you want the text to look):
 *     {{body}}      the letter text for that page (whole text box is replaced)
 *     {{title}}     letter title (shrinks automatically when long)
 *     {{greeting}}  "Dear …," line from the letter, or "Dear Lion,"
 *     {{name}}      e.g. "Jo, SEAS ’27" (only kept on the LAST page)
 *     {{page}}      e.g. "2/3"
 *     {{topic}}
 *
 * SETUP: run setupInstagram once and allow the permissions.
 */

// ---- Settings ----------------------------------------------------------------

const IG_TEMPLATE_ID = '1KAIi4r65c6dcwjRuCOUhyyxNTKPk3rL-W2Aox6f0jBs'; // /presentation/d/<ID>/edit
const IG_FOLDER_ID = '1HoOp6JKgC7tXg_Vh8pkVQp_BBh_IP7w3';             // /folders/<ID>
const IG_EXPORT_PNG = true;
const IG_DEFAULT_GREETING = 'Dear Lion,';

// Layout capacity (must match the template)
const IG_FIRST_LINES = 10;     // body lines on the first page
const IG_NEXT_LINES = 14;      // body lines on each next page
const IG_CHARS_PER_LINE = 42;  // lower to 38–40 if text spills; raise if pages end short
const IG_INDENT_CHARS = 3;     // how many characters the first-line indent takes up
const IG_INDENT_PT = 42;       // first-line indent size in points

// ---- Trigger -------------------------------------------------------------------

/** Run once from the Apps Script editor. Asks for Slides/Drive permission and turns on the trigger. */
function setupInstagram() {
  SlidesApp.openById(IG_TEMPLATE_ID);   // checks access to the template
  DriveApp.getFolderById(IG_FOLDER_ID); // checks access to the folder
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers()
    .filter(t => ['onApproveForInstagram', 'onStatusEdit', 'cleanUpPosts'].indexOf(t.getHandlerFunction()) >= 0)
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onApproveForInstagram').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('cleanUpPosts').timeBased().everyDays(1).atHour(4).create();
  postColumn(ss.getSheetByName(TABS.letter.name));
}

/** Installable onEdit trigger (created by setupInstagram). */
function onApproveForInstagram(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== TABS.letter.name) return;
  const statusCol = header(sheet).indexOf('status') + 1;
  if (!statusCol || e.range.getColumn() > statusCol || e.range.getLastColumn() < statusCol) return;

  for (let row = Math.max(2, e.range.getRow()); row <= e.range.getLastRow(); row++) {
    const status = String(sheet.getRange(row, statusCol).getValue()).trim().toLowerCase();
    if (status === 'approved') exportRow(row);
    else trashPost(sheet, row); // un-approved → move its post folder to the Drive trash
  }
}

/** Moves a row's post folder to the Drive trash (recoverable for 30 days) and clears the "post" cell. */
function trashPost(sheet, row) {
  const cell = sheet.getRange(row, postColumn(sheet));
  const m = String(cell.getValue()).match(/\/folders\/([\w-]+)/);
  if (!m) return;
  try {
    const folder = DriveApp.getFolderById(m[1]);
    if (isPostFolder(folder)) folder.setTrashed(true);
  } catch (err) { /* already gone */ }
  cell.clearContent();
}

/**
 * Trashes post folders whose letter is no longer approved — including letters whose row was deleted
 * (deleting a row can't be detected the moment it happens). Runs daily; can also be run by hand.
 */
function cleanUpPosts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TABS.letter.name);
  const head = header(sheet);
  const idCol = head.indexOf('id'), statusCol = head.indexOf('status');
  const approved = new Set(sheet.getDataRange().getValues().slice(1)
    .filter(r => String(r[statusCol]).trim().toLowerCase() === 'approved')
    .map(r => String(r[idCol]).trim()));
  const it = DriveApp.getFolderById(IG_FOLDER_ID).getFolders();
  while (it.hasNext()) {
    const f = it.next();
    const m = f.getName().match(POST_NAME_RE);
    if (m && !approved.has(m[1])) f.setTrashed(true);
  }
}

// Folders this script made: YYYY-MM-DD_<8-char id>_<title>
const POST_NAME_RE = /^\d{4}-\d{2}-\d{2}_([0-9a-f]{8})_/;

/** Safety check: only touch folders this script created inside the Instagram folder. */
function isPostFolder(folder) {
  if (!POST_NAME_RE.test(folder.getName())) return false;
  const parents = folder.getParents();
  while (parents.hasNext()) if (parents.next().getId() === IG_FOLDER_ID) return true;
  return false;
}

// ---- Export ----------------------------------------------------------------------

/**
 * Manual test: click any cell in a letter's row in the sheet, then run this from the editor.
 * Clears that row's "post" cell and makes the post again; errors show up in the execution log.
 */
function exportSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TABS.letter.name);
  const row = sheet.getActiveRange() ? sheet.getActiveRange().getRow() : 0;
  if (row < 2) throw new Error('Click a cell in a letter row on the Letters tab first.');
  sheet.getRange(row, postColumn(sheet)).clearContent();
  exportRow(row);
  const result = String(sheet.getRange(row, postColumn(sheet)).getValue());
  if (result.indexOf('ERROR') === 0) throw new Error(result);
  console.log('Done: ' + result);
}

/** Makes the carousel for one sheet row. Can also be run by hand: exportRow(5). */
function exportRow(row) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TABS.letter.name);
  const postCell = sheet.getRange(row, postColumn(sheet));
  if (String(postCell.getValue()).trim()) return; // already made

  const head = header(sheet);
  const values = sheet.getRange(row, 1, 1, head.length).getValues()[0];
  const get = name => head.indexOf(name) < 0 ? '' : String(values[head.indexOf(name)]).replace(/^'/, '').trim();

  try {
    const d = letterData(get);
    const pages = paginate(d.paras);
    const name = postName(get('id'), d.title);
    const folder = DriveApp.getFolderById(IG_FOLDER_ID).createFolder(name);
    const copy = DriveApp.getFileById(IG_TEMPLATE_ID).makeCopy(name + '_slides', folder);
    const pres = SlidesApp.openById(copy.getId());
    buildSlides(pres, pages, d);
    pres.saveAndClose();

    if (IG_EXPORT_PNG) exportSlidesAsPng(copy.getId(), name, folder);
    postCell.setValue(folder.getUrl());
  } catch (err) {
    postCell.setValue('ERROR: ' + err.message + ' (clear this cell and re-approve to retry)');
  }
}

function buildSlides(pres, pages, d) {
  const tpl = pres.getSlides();
  if (tpl.length < 2) throw new Error('The template needs 2 slides: first page and next page.');
  const firstTpl = tpl[0], nextTpl = tpl[1];

  const slides = [firstTpl];
  for (let i = 1; i < pages.length; i++) {
    const dup = nextTpl.duplicate();
    dup.move(pres.getSlides().length - 1);
    slides.push(dup);
  }
  nextTpl.remove();

  slides.forEach((slide, i) => {
    const isLast = i === pages.length - 1;
    slide.getShapes().forEach(shape => {
      const t = shape.getText().asString();
      if (t.indexOf('{{name}}') >= 0 && !isLast) { shape.remove(); return; }
      if (t.indexOf('{{body}}') >= 0) fillBody(shape.getText(), pages[i]);
    });
    slide.replaceAllText('{{title}}', d.title);
    slide.replaceAllText('{{greeting}}', d.greeting);
    slide.replaceAllText('{{name}}', d.name);
    slide.replaceAllText('{{topic}}', d.topic);
    slide.replaceAllText('{{page}}', (i + 1) + '/' + pages.length);
  });

  // Long titles: shrink so they stay on the title lines
  if (d.title.length > 22) firstTpl.getShapes().forEach(s => {
    if (s.getText().asString().trim() === d.title) s.getText().getTextStyle().setFontSize(d.title.length > 34 ? 30 : 40);
  });
}

/** Replaces the {{body}} box text; setText keeps the box's existing font/size/colour. */
function fillBody(textRange, page) {
  textRange.setText(page.length ? page.map(p => p.text).join('\n') : ' ');
  textRange.getParagraphs().forEach((p, k) => {
    if (page[k]) p.getRange().getParagraphStyle().setIndentFirstLine(page[k].indent ? IG_INDENT_PT : 0);
  });
}

function letterData(get) {
  const paras = get('letter').split(/\n+/).map(s => s.trim()).filter(Boolean);
  // Use the letter's own opening line ("Dear …," / "To …," / "Hi …,") as the greeting
  let greeting = get('greeting') || IG_DEFAULT_GREETING;
  if (paras.length > 1 && /^(dear|to|hi|hello|hey)\b.{0,40}[,:!]?$/i.test(paras[0])) {
    const opener = paras.shift();
    if (!get('greeting')) greeting = opener;
  }
  const school = get('school') === 'Other' ? '' : get('school');
  const year = /^\d{4}$/.test(get('classYear')) ? '’' + get('classYear').slice(2) : '';
  const tag = [school, year].filter(Boolean).join(' ');
  return {
    title: get('title'),
    topic: get('topic'),
    greeting: greeting,
    name: [get('name') || 'Anonymous', tag].filter(Boolean).join(', '),
    paras: paras,
  };
}

/** Splits paragraphs into pages by estimated line count. */
function paginate(paras) {
  const lines = [];
  paras.forEach(p => {
    let cur = '', first = true;
    p.split(/\s+/).forEach(w => {
      const max = IG_CHARS_PER_LINE - (first ? IG_INDENT_CHARS : 0);
      const test = cur ? cur + ' ' + w : w;
      if (test.length > max && cur) { lines.push({ text: cur, paraStart: first }); cur = w; first = false; }
      else cur = test;
    });
    if (cur) lines.push({ text: cur, paraStart: first });
  });

  const pages = [];
  let i = 0;
  while (i < lines.length) {
    const cap = pages.length === 0 ? IG_FIRST_LINES : IG_NEXT_LINES;
    pages.push(lines.slice(i, i + cap));
    i += cap;
  }
  if (!pages.length) pages.push([]);

  // Re-join the wrapped lines into paragraphs; a paragraph continued from the previous page gets no indent
  return pages.map(pl => {
    const out = [];
    pl.forEach(l => {
      if (l.paraStart || !out.length) out.push({ text: l.text, indent: l.paraStart });
      else out[out.length - 1].text += ' ' + l.text;
    });
    return out;
  });
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

// ---- Helpers -----------------------------------------------------------------------

/** Standard name: YYYY-MM-DD_<letter id>_<Title-words> (date = day it was approved). */
function postName(id, title) {
  const date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const slug = String(title || 'Letter').normalize('NFKD').replace(/[^\w\s-]/g, '')
    .trim().replace(/\s+/g, '-').slice(0, 40) || 'Letter';
  return date + '_' + id + '_' + slug;
}

function header(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
}

/** Returns the "post" column number, adding the header if the sheet doesn't have it yet. */
function postColumn(sheet) {
  const head = header(sheet);
  const i = head.indexOf('post');
  if (i >= 0) return i + 1;
  sheet.getRange(1, head.length + 1).setValue('post').setFontWeight('bold').setBackground('#DCEBF5');
  return head.length + 1;
}
