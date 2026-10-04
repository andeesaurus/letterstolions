/* Letters to Lions — static site logic (no build step, no dependencies). */
(function () {
  'use strict';

  const CONFIG = window.LTL_CONFIG || {};
  const SHEET_URL = (CONFIG.SHEET_URL || '').trim();
  const WORD_MIN = CONFIG.WORD_MIN || 50;
  const WORD_MAX = CONFIG.WORD_MAX || 300;
  const LETTER_MAX_CHARS = CONFIG.LETTER_MAX_CHARS || 3000;
  const TITLE_MAX_CHARS = CONFIG.TITLE_MAX_CHARS || 60;
  const NAV = [
    ['home', '#/', 'Home'],
    ['letters', '#/letters', 'Read More'],
    ['write', '#/write', 'Write a Letter'],
    ['about', '#/about', 'About'],
    ['help', '#/help', 'Find Help'],
  ];
  const SCHOOLS = ['CC', 'SEAS', 'BC', 'GS', 'Other'];
  const EMPTY_FORM = { title: '', letter: '', topic: '', name: '', school: '', classYear: '', website: '' };
  const ERRORS = { title: 'Please add a title.', letter: 'Please write your letter.', short: `Minimum word count is ${WORD_MIN}.`, long: `Please keep your letter under ${WORD_MAX} words.`, topic: 'Please choose a topic.' };

  const state = {
    letters: [], localLetters: [], sheetLetters: [], loadingSheet: !!SHEET_URL, topics: [], about: null, resources: [],
    featuredId: null, topic: 'All', openId: null,
    form: { ...EMPTY_FORM }, errors: {}, attempted: false, submitting: false, sent: false, submitError: '',
    votes: readVotes(),
  };

  const main = document.getElementById('main');
  const modalRoot = document.getElementById('modal-root');

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function readVotes() {
    try { return JSON.parse(localStorage.getItem('ltl-votes') || '{}'); } catch (e) { return {}; }
  }
  function saveVotes() {
    try { localStorage.setItem('ltl-votes', JSON.stringify(state.votes)); } catch (e) { /* private mode */ }
  }
  function norm(l) {
    const tag = [l.school, l.year ? "'" + l.year : ''].filter(Boolean).join(' ');
    return { ...l, greeting: l.greeting || 'Dear Lion,', tag, byline: [l.author, tag].filter(Boolean).join(', ') };
  }
  function route() {
    const r = (location.hash.replace(/^#\/?/, '').split(/[/?]/)[0] || 'home');
    return NAV.some(n => n[0] === r) ? r : 'home';
  }
  function findLetter(id) {
    return state.letters.find(l => String(l.id) === String(id));
  }

  // Send a row to the Google Sheet. Apps Script can't answer CORS preflights, so we post
  // text/plain with no-cors: the response is opaque and a resolved request counts as success.
  function post(row) {
    if (!SHEET_URL) {
      console.warn('[Letters to Lions] SHEET_URL is not set in config.js — nothing was sent.', row);
      return Promise.resolve();
    }
    return fetch(SHEET_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(row),
    });
  }

  // ---------- data ----------
  function getJSON(path) {
    return fetch(path, { cache: 'no-cache' }).then(r => {
      if (!r.ok) throw new Error(path + ': ' + r.status);
      return r.json();
    });
  }

  // Greeting on its own line ("Dear Freshmen,") or run into the first sentence ("Dear Freshmen,These next…")
  const GREETING_LINE_RE = /^(dear|to|hi|hello|hey)\b[^,.!?\n]{0,30}[,:!]?$/i;
  const GREETING_INLINE_RE = /^((?:dear|hi|hello|hey)\b[^,\n.!?]{0,30},)\s*(\S[\s\S]*)$/i;

  function splitGreeting(paras) {
    if (paras.length > 1 && GREETING_LINE_RE.test(paras[0])) return paras.shift();
    const m = paras.length ? paras[0].match(GREETING_INLINE_RE) : null;
    if (!m) return '';
    paras[0] = m[2].charAt(0).toUpperCase() + m[2].slice(1);
    return m[1];
  }

  function cleanLetter(l) {
    const paras = Array.isArray(l.paras) ? l.paras.map(s => String(s).trim()).filter(Boolean) : [];
    const firstPara = paras[0];
    let greeting = l.greeting || '', pull = l.pull || '';
    // The letter's own opening line becomes the greeting instead of part of the first paragraph
    const opener = splitGreeting(paras);
    if (opener) {
      if (!greeting) greeting = opener;
      if (pull === opener || pull === firstPara) pull = '';
    }
    return {
      id: l.id, topic: l.topic || 'Others', title: l.title || '', author: l.author || 'Anonymous',
      school: l.school || '', year: l.year ? String(l.year) : '', greeting,
      pull: pull || paras[0] || '', paras,
    };
  }

  // Approved letters come from the Google Sheet, which is slow to answer (1–3 s).
  // The last list is kept in this browser so returning visitors see it instantly; it's refreshed in the background.
  const SHEET_CACHE_KEY = 'ltl-sheet-letters';

  function fetchSheetLetters() {
    if (!SHEET_URL) return Promise.resolve(null);
    return fetch(SHEET_URL + (SHEET_URL.includes('?') ? '&' : '?') + 'action=letters')
      .then(r => r.json())
      .then(res => (res && Array.isArray(res.letters) ? res.letters : null))
      .catch(err => { console.warn('[Letters to Lions] Could not load letters from the sheet:', err); return null; });
  }

  function readSheetCache() {
    try { return JSON.parse(localStorage.getItem(SHEET_CACHE_KEY) || 'null'); } catch (e) { return null; }
  }

  function setSheetLetters(list) {
    const local = new Set(state.localLetters.map(l => String(l.id)));
    state.sheetLetters = list.map(cleanLetter).filter(l => l.title && l.paras.length && !local.has(String(l.id)));
    state.letters = state.localLetters.concat(state.sheetLetters);
    if (!findLetter(state.featuredId)) pickFeatured();
  }

  function pickFeatured() {
    const l = state.letters[Math.floor(Math.random() * state.letters.length)];
    state.featuredId = l ? l.id : null;
  }

  // ---------- views ----------
  function pageTitle(title, intro) {
    return `<section class="wrap page-title"><h1 class="h1">${title}</h1>${intro ? `<p class="intro">${intro}</p>` : ''}</section>`;
  }

  function viewHome() {
    const f = findLetter(state.featuredId);
    const l = f ? norm(f) : null;
    return `
    <section class="wrap hero">
      <div>
        <h1>You're not<br><em>alone</em> in this.</h1>
        <p class="sub">Letters from Columbia students and alumni to incoming freshmen.</p>
        <div class="cta"><a class="link-btn" href="#/letters">Read More Letters →</a></div>
      </div>
      <div class="stack">
        <div class="sheet back"></div>
        <div class="sheet middle"></div>
        <button class="front" data-open="${l ? esc(l.id) : ''}" ${l ? `aria-label="Read the letter: ${esc(l.title)}"` : 'disabled'}>
          <div class="top">
            <span class="eyebrow">${l ? esc(l.topic) : ''}</span>
            ${l && l.school && l.year ? `<span class="stamp"><span>${esc(l.school)}<span>'${esc(l.year)}</span></span></span>` : ''}
          </div>
          <p class="greeting">${l ? esc(l.greeting) : ''}</p>
          <p class="pull">${l ? esc(l.pull) : state.loadingSheet ? 'Loading letters…' : 'Letters are on their way.'}</p>
          ${l ? `<div class="bottom"><span>— ${esc(l.author)}</span><span class="read">Read →</span></div>` : ''}
        </button>
      </div>
    </section>`;
  }

  function viewLetters() {
    const t = state.topic;
    const list = state.letters.filter(l => t === 'All' || l.topic === t);
    const label = (t === 'All' ? 'All letters' : t) + ' · ' + list.length + (list.length === 1 ? ' letter' : ' letters');
    return `
    ${pageTitle('Read More Letters')}
    <section class="wrap library">
      <h2 class="h2">Find a letter for <em>what’s on your mind</em> today.</h2>
      <div class="chips" role="group" aria-label="Filter by topic">
        ${['All'].concat(state.topics).map(c => `<button class="chip" data-topic="${esc(c)}" aria-pressed="${c === t}">${esc(c)}</button>`).join('')}
      </div>
      <p class="count" aria-live="polite">${esc(label)}</p>
      ${list.length ? '' : `<p class="empty">${state.loadingSheet ? 'Loading letters…' : 'No letters here yet.'}</p>`}
      <div class="grid">
        ${list.map(x => { const l = norm(x); return `
        <button class="card" data-open="${esc(l.id)}">
          <div class="top"><span class="pill">${esc(l.topic)}</span>${l.tag ? `<span class="tag">${esc(l.tag)}</span>` : ''}</div>
          <h3>${esc(l.title)}</h3>
          <p>${esc(l.paras[0] || '')}</p>
          <div class="meta"><span>— ${esc(l.author)}</span></div>
        </button>`; }).join('')}
      </div>
    </section>`;
  }

  function viewWrite() {
    const intro = 'Write something to support your peers. What would you tell your freshman self?';
    if (state.sent) {
      return `
      <section class="wrap write">
        <h1 class="h1">Write a Letter</h1>
        <p class="intro">${intro}</p>
        <div class="sent">
          <div class="sheet back"></div>
          <div class="sheet middle"></div>
          <div class="front">
            <span class="eyebrow">Letter sent</span>
            <p class="big">Thank you for <em>your letter.</em></p>
            <p class="msg">Your words might be exactly what a fellow Lion needs to hear.</p>
            <div class="actions">
              <a class="btn" href="#/letters" style="text-decoration:none">Read Letters</a>
              <button class="btn btn-outline" data-action="reset">Write Another</button>
            </div>
          </div>
        </div>
      </section>`;
    }
    const f = state.form, e = state.errors;
    const year = new Date().getFullYear();
    const years = Array.from({ length: 71 }, (_, i) => String(year + 35 - i)).concat('Other');
    const opts = (list, val) => '<option value="">Select</option>' +
      list.map(o => `<option value="${esc(o)}"${o === val ? ' selected' : ''}>${esc(o)}</option>`).join('');
    const field = (k, label, control, cls, counter) => `
      <label class="field ${cls || ''} ${e[k] ? 'invalid' : ''}" data-field="${k}">
        <span class="label">${label}</span>
        ${control}
        <span class="field-foot">
          <span class="error" id="err-${k}" aria-live="polite">${esc(e[k] || '')}</span>
          ${counter || ''}
        </span>
      </label>`;
    return `
    <section class="wrap write">
      <h1 class="h1">Write a Letter</h1>
      <p class="intro">${intro}</p>
      <form class="form" novalidate>
        ${field('title', 'Title', `<input name="title" type="text" maxlength="${TITLE_MAX_CHARS}" placeholder="Give it a title" value="${esc(f.title)}" aria-describedby="err-title title-count">`, '',
          `<span class="word-count" id="title-count" aria-live="polite">${f.title.length} / ${TITLE_MAX_CHARS}</span>`)}
        ${field('letter', 'Letter', `<textarea name="letter" rows="10" maxlength="${LETTER_MAX_CHARS}" placeholder="Write your letter…" aria-describedby="err-letter word-count">${esc(f.letter)}</textarea>`, '',
          `<span class="word-count${counterBad(f.letter) ? ' bad' : ''}" id="word-count" aria-live="polite">${counterText(f.letter)}</span>`)}
        ${field('topic', 'Topic', `<select name="topic" aria-describedby="err-topic">${opts(state.topics, f.topic)}</select>`, 'topic')}
        <div class="optional-row">
          <label class="field"><span class="label">Name <span class="opt">(optional)</span></span>
            <input name="name" type="text" maxlength="60" value="${esc(f.name)}" autocomplete="name"></label>
          <label class="field"><span class="label">School <span class="opt">(optional)</span></span>
            <select name="school">${opts(SCHOOLS, f.school)}</select></label>
          <label class="field"><span class="label">Class <span class="opt">(optional)</span></span>
            <select name="classYear">${opts(years, f.classYear)}</select></label>
        </div>
        <p class="helper">You can stay anonymous and leave any of these blank.</p>
        <div class="hp" aria-hidden="true"><label>Leave this empty <input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
        <div class="form-foot">
          ${state.submitError ? `<p class="form-error" role="alert">${esc(state.submitError)}</p>` : ''}
          <button class="btn" type="submit" ${state.submitting ? 'disabled' : ''}>${state.submitting ? 'Sending…' : 'Submit'}</button>
        </div>
      </form>
    </section>`;
  }

  function viewAbout() {
    const a = state.about || { sections: [], values: { items: [] } };
    const note = esc(a.importantNote || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return `
    ${pageTitle('About Letters to Lions', esc(a.intro))}
    <section class="wrap about">
      <div class="cols">
        ${a.sections.map(s => `
        <div class="col"><span class="num">${esc(s.num)}</span><h2 class="h2">${esc(s.title)}</h2><p>${esc(s.body)}</p></div>`).join('')}
      </div>
      ${a.values && a.values.items.length ? `
      <div class="values">
        <div class="head"><span class="num">${esc(a.values.num)}</span><h2 class="h2">${esc(a.values.title)}</h2></div>
        <div class="cols">
          ${a.values.items.map(v => `<div class="value"><span class="name">${esc(v.name)}</span><span class="desc">${esc(v.desc)}</span></div>`).join('')}
        </div>
      </div>` : ''}
      <div class="note"><h2 class="h2">Important Note</h2><p>${note}</p></div>
    </section>`;
  }

  function viewHelp() {
    return `
    ${pageTitle('Find Help', 'Starting at Columbia means navigating a whole new chapter of life. These resources are here to support you through all of it.')}
    <section class="wrap help">
      ${state.resources.map(g => `
      <div class="group">
        <div>
          <h2 class="h2">${esc(g.title)}</h2>
          ${g.note ? `<p class="crisis">${esc(g.note)}</p>` : ''}
        </div>
        <div class="resources">
          ${g.items.map(r => `
          <a class="resource" href="${esc(r.href)}" target="_blank" rel="noopener">
            <span class="name">${esc(r.name)}</span>
            <span class="visit">Visit ↗</span>
            <span class="desc">${esc(r.desc)}</span>
            ${r.phone ? `<span class="phone">Phone: ${esc(r.phone)}</span>` : ''}
          </a>`).join('')}
        </div>
      </div>`).join('')}
    </section>`;
  }

  const VIEWS = { home: viewHome, letters: viewLetters, write: viewWrite, about: viewAbout, help: viewHelp };

  function renderNav(r) {
    const html = cls => NAV.map(([k, href, label]) =>
      `<a href="${href}"${cls && k === r ? ' aria-current="page"' : ''}>${label}</a>`).join('');
    document.querySelector('[data-nav]').innerHTML = html(true);
    document.querySelector('[data-footer-nav]').innerHTML = html(false);
  }

  // Mobile hamburger menu
  const menuBtn = document.querySelector('[data-menu]');
  const navEl = document.querySelector('[data-nav]');
  function setMenu(open) {
    navEl.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', () => setMenu(!navEl.classList.contains('open')));
  navEl.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && navEl.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });

  function render() {
    const r = route();
    renderNav(r);
    main.innerHTML = VIEWS[r]();
    document.title = r === 'home' ? 'Letters to Lions' : NAV.find(n => n[0] === r)[2] + ' · Letters to Lions';
  }

  // ---------- letter modal ----------
  let lastFocus = null;

  function openLetter(id) {
    if (!findLetter(id)) return;
    if (state.openId == null) lastFocus = document.activeElement;
    state.openId = id;
    renderModal();
  }

  function closeLetter() {
    state.openId = null;
    modalRoot.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function step(d) {
    const n = state.letters.length;
    if (n < 2) return;
    const i = state.letters.findIndex(l => String(l.id) === String(state.openId));
    openLetter(state.letters[(i + d + n) % n].id);
  }

  function renderModal() {
    const l = norm(findLetter(state.openId));
    const voted = state.votes[l.id] !== undefined;
    modalRoot.innerHTML = `
    <div class="overlay" data-action="close">
      <article class="letter" role="dialog" aria-modal="true" aria-labelledby="letter-title">
        <button class="close" data-action="close" aria-label="Close">×</button>
        <h2 id="letter-title">${esc(l.title)}</h2>
        <div class="body">
          <p class="greeting">${esc(l.greeting)}</p>
          ${l.paras.map(p => `<p>${esc(p)}</p>`).join('')}
          <p class="sign">— ${esc(l.byline)}</p>
        </div>
        ${state.letters.length > 1 ? '<button class="btn another" data-action="next">Read another letter</button>' : ''}
        <div class="feedback" aria-live="polite">
          ${voted ? '<span>Thanks for letting us know.</span>' : `
          <span>Did this letter help?</span>
          <div class="row">
            <button class="btn btn-outline" data-vote="yes">Yes</button>
            <button class="btn btn-outline" data-vote="no">Not really</button>
          </div>`}
        </div>
      </article>
    </div>`;
    document.body.style.overflow = 'hidden';
    modalRoot.querySelector('.overlay').scrollTop = 0;
    modalRoot.querySelector('.close').focus();
  }

  function vote(helped) {
    const l = findLetter(state.openId);
    if (!l || state.votes[l.id] !== undefined) return;
    state.votes[l.id] = helped;
    saveVotes();
    renderModal();
    post({ type: 'feedback', letterId: String(l.id), letterTitle: l.title, helped: helped ? 'Yes' : 'No' }).catch(() => {});
  }

  // ---------- form ----------
  function validate() {
    const f = state.form, e = {};
    if (!f.title.trim()) e.title = ERRORS.title;
    const words = countWords(f.letter);
    if (!words) e.letter = ERRORS.letter;
    else if (words < WORD_MIN) e.letter = ERRORS.short;
    else if (words > WORD_MAX) e.letter = ERRORS.long;
    if (!f.topic) e.topic = ERRORS.topic;
    return e;
  }

  function countWords(s) {
    return s.trim().split(/\s+/).filter(Boolean).length;
  }
  function counterText(s) {
    return `${countWords(s)} / ${WORD_MAX} words`;
  }
  function counterBad(s) {
    const n = countWords(s);
    return n > WORD_MAX || (state.attempted && n < WORD_MIN);
  }
  function updateCounter(el) {
    const c = main.querySelector('#word-count');
    if (!c) return;
    c.textContent = counterText(el.value);
    c.classList.toggle('bad', counterBad(el.value));
  }

  function submit() {
    if (state.submitting) return;
    state.attempted = true;
    state.errors = validate();
    state.submitError = '';
    const firstBad = ['title', 'letter', 'topic'].find(k => state.errors[k]);
    if (firstBad) {
      render();
      const el = main.querySelector(`[name="${firstBad}"]`);
      if (el) el.focus();
      return;
    }
    const f = state.form;
    state.submitting = true;
    render();
    post({
      type: 'letter', title: f.title.trim(), letter: f.letter.trim(), topic: f.topic,
      name: f.name.trim(), school: f.school, classYear: f.classYear, website: f.website,
    }).then(() => {
      state.submitting = false;
      state.sent = true;
      state.attempted = false;
      state.form = { ...EMPTY_FORM };
      render();
      window.scrollTo(0, 0);
    }).catch(() => {
      state.submitting = false;
      state.submitError = 'Something went wrong sending your letter. Please check your connection and try again.';
      render();
    });
  }

  // ---------- events ----------
  document.addEventListener('click', e => {
    const t = e.target;
    const open = t.closest('[data-open]');
    if (open && open.dataset.open !== '') { openLetter(open.dataset.open); return; }

    const chip = t.closest('[data-topic]');
    if (chip) { state.topic = chip.dataset.topic; render(); main.querySelector(`[data-topic="${CSS.escape(state.topic)}"]`).focus(); return; }

    const v = t.closest('[data-vote]');
    if (v) { vote(v.dataset.vote === 'yes'); return; }

    const a = t.closest('[data-action]');
    if (!a) return;
    const action = a.dataset.action;
    if (action === 'close') {
      // The overlay itself closes only on a click outside the letter.
      if (a.classList.contains('overlay') && t.closest('.letter')) return;
      closeLetter();
    } else if (action === 'next') step(1);
    else if (action === 'reset') { state.sent = false; state.form = { ...EMPTY_FORM }; state.errors = {}; state.attempted = false; render(); }
  });

  main.addEventListener('input', e => {
    const el = e.target;
    if (!el.name || !(el.name in state.form)) return;
    state.form[el.name] = el.value;
    if (el.name === 'letter') updateCounter(el);
    if (el.name === 'title') main.querySelector('#title-count').textContent = `${el.value.length} / ${TITLE_MAX_CHARS}`;
    if (state.errors[el.name]) {
      state.errors[el.name] = '';
      const field = el.closest('.field');
      field.classList.remove('invalid');
      field.querySelector('.error').textContent = '';
    }
  });
  main.addEventListener('submit', e => { e.preventDefault(); submit(); });

  document.addEventListener('keydown', e => {
    if (state.openId == null) return;
    if (e.key === 'Escape') closeLetter();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {
      // keep focus inside the open letter
      const items = modalRoot.querySelectorAll('button');
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener('hashchange', () => {
    if (state.openId != null) closeLetter();
    state.submitError = '';
    render();
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  });

  // ---------- boot ----------
  const sheetRequest = fetchSheetLetters(); // start right away, in parallel with the local files

  Promise.all([
    getJSON('data/letters.json'), getJSON('data/topics.json'),
    getJSON('data/about.json'), getJSON('data/resources.json'),
  ]).then(([letters, topics, about, resources]) => {
    state.localLetters = letters.map(cleanLetter).filter(l => l.title && l.paras.length);
    state.topics = topics;
    state.about = about;
    state.resources = resources;
    const cached = readSheetCache();
    if (cached) state.loadingSheet = false;
    setSheetLetters(cached || []);
    render();

    sheetRequest.then(list => {
      state.loadingSheet = false;
      if (list) {
        try { localStorage.setItem(SHEET_CACHE_KEY, JSON.stringify(list)); } catch (e) { /* storage full or blocked */ }
        setSheetLetters(list);
      }
      if (['home', 'letters'].includes(route())) render();
    });
  }).catch(err => {
    console.error(err);
    main.innerHTML = '<section class="wrap page-title"><p class="intro">Sorry — the site could not load. Please refresh the page.</p></section>';
  });
})();
