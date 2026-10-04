# Handoff: Letters to Lions — website

## Overview
Letters to Lions is a student-run Columbia site where students and alumni write supportive letters to incoming freshmen. Five views: **Home**, **Read More** (letter library + filters + letter modal), **Write a Letter** (submission form → Google Sheet), **About**, **Find Help** (resources). It will be **hosted on GitHub Pages** with a **Google Sheet (via Apps Script web app)** as the only backend.

## About the Design Files
`reference/Letters to Lions.dc.html` is a **design reference built in HTML** — a working prototype of the intended look and behavior, not production code. It runs on a proprietary runtime (`support.js`, `<x-dc>`, `<sc-if>`, `<sc-for>`, `{{ }}` holes) that should **not** be shipped. Recreate it as a clean static site.

Open it locally to see it live: serve the `reference/` folder (`npx serve reference`) and open the `.dc.html`.

### Recommended stack (no existing codebase)
- **Vite + React** (or plain Vite + vanilla JS if preferred), deployed to **GitHub Pages** with a GitHub Actions workflow (`actions/deploy-pages`).
- Set `base: '/<repo-name>/'` in `vite.config` (unless using a custom domain / `user.github.io` repo).
- Use **hash routing** (`#/letters`, `#/write`, `#/about`, `#/help`) or a `404.html` SPA fallback — GitHub Pages has no server rewrites.
- Content lives in plain data files so non-developers can edit via GitHub web UI:
  - `src/data/letters.json`, `src/data/resources.json`, `src/data/about.json`, `src/data/topics.json`
- Config: `VITE_SHEET_URL` (Apps Script web-app URL) in `.env` / GitHub Actions variable. It's public anyway (client-side), so not a secret.

## Fidelity
**High-fidelity.** Colors, type, spacing, copy and interactions are final. Recreate pixel-accurately. All copy in the reference is final — do not rewrite.

## Global layout
- Page bg `#F4F8FB`; body text color `#14263F`; font **Hanken Grotesk** 400/500/600(/700); display/serif **Newsreader** (opsz 6–72, 400/500, italic 400/500). Load from Google Fonts:
  `https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=Hanken+Grotesk:wght@400;500;600&display=swap` (add 700 for bold value names).
- Content container: `max-width:1200px; margin:0 auto; padding-inline:28px`.
- `* { box-sizing:border-box }`, `-webkit-font-smoothing: antialiased`, `text-wrap: pretty` on paragraphs.
- Links: `#1D4F91`, hover `#0E2C55`, underline offset 3px.
- Fully fluid; every grid uses `repeat(auto-fit, minmax(min(100%, Npx), 1fr))`. No horizontal scroll at any width. Buttons/chips `white-space:nowrap`.

### Header (sticky)
- `position:sticky; top:0; z-index:20; background:rgba(244,248,251,.92); backdrop-filter:blur(10px); border-bottom:1px solid #DCE8F1`. Inner padding `16px 28px`, flex space-between, wraps.
- Wordmark "Letters to Lions": Newsreader 21px, letter-spacing −0.01em, `#0E2C55`; click → Home.
- Nav pills (in order): **Home · Read More · Write a Letter · About · Find Help**. 15px/500, padding `8px 14px`, radius 999px, gap 6px. Active: bg `#DCEBF5`, text `#0E2C55`; inactive: transparent, `#33496A`.

### Footer
- bg `#E6F0F7`-ish band (see reference), border-top `#DCE8F1`. Left: wordmark (Newsreader). Right: disclaimer 15px `#33496A`: "Letters to Lions is a peer encouragement project — not a substitute for professional support. If you're going through something difficult, please reach out to Columbia Counseling and Psychological Services or another trusted resource."
- Divider, then nav links (same 5, `#1D4F91`, 15px, padding 6px 10px) and "Letters to Lions · A Columbia community project".

### Page title pattern (Read More, Write a Letter, About, Find Help)
- Section padding `64px 28px 40px`, column flex gap 24px.
- H1: Newsreader 400, `clamp(48px,6vw,80px)`, line-height 1, letter-spacing −0.025em, `#0E2C55`.
- Intro p: 20px / 1.55, `#33496A`, max-width 38em.

## Screens

### 1. Home
- Section padding `72px 28px 88px`; grid `repeat(auto-fit,minmax(min(100%,440px),1fr))`, gap 56px, align center.
- Left: H1 "You're not / *alone* in this." — Newsreader 400, `clamp(52px,7.4vw,96px)`, lh 0.98, ls −0.025em, `#0E2C55`; "alone" italic `#3A6EA5`. Sub: "Letters from Columbia students and alumni to incoming freshmen." 19px/1.55 `#33496A`, max 30em, mt 28px. Text link button "Read More Letters →" (16px/500 `#1D4F91`, no bg) mt 36px → Read More.
- Right: **featured letter stack**, container `height:460px; max-width:520px`:
  - back sheet: `inset:40px 30px 0 60px; bg #B9D9EB; radius 6px; rotate(6deg)`
  - middle sheet: `inset:20px 50px 20px 30px; bg #DCEBF5; rotate(-4deg)`
  - front card (button): `inset:0 40px 40px 40px; bg #fff; radius 6px; shadow 0 30px 60px -30px rgba(14,44,85,.35), 0 0 0 1px #E3EDF4; padding 40px 38px; rotate(-1deg)`; hover → `rotate(0) translateY(-4px)`.
  - Contents: topic eyebrow (13px/600, ls .1em, uppercase, `#3A6EA5`); optional dashed circle stamp 58px (`1.5px dashed #6C9BC8`, 11px/600 `#3A6EA5`, school + 'YY) shown only if school/year exist; greeting (Newsreader 19px `#5A7192`, mt 18px); pull quote (Newsreader 26px/1.3 `#0E2C55`, clamp to 6 lines); bottom row "— Author" (15px `#33496A`) and "Read →" (`#1D4F91`/500). Hide stamp/bottom row when no letters (shows "Letters are on their way.").
  - **Featured letter is random per page load.** Click opens that letter in the modal.

### 2. Read More (letter library)
- Title "Read More Letters". Then H2 "Find a letter for *what's on your mind* today." (Newsreader 30px, lh 1.1, ls −0.015em; italic part `#3A6EA5`), mt 48px, mb 20px.
- Filter chips row (padding-bottom 24px, border-bottom `#DCE8F1`): **All, Academics, Career, Money, Belonging, Relationships, Health, Others**. 15px/500, padding `9px 16px`, radius 999px, gap 8px. Active: bg/border `#0E2C55`, white text; inactive: white bg, border `#B9D9EB`, text `#0E2C55`.
- Count label: "All letters · N letters" / "{Topic} · N letter(s)" — 15px `#5A7192`, margin `20px 0 28px`. Empty: "No letters here yet." 18px `#33496A`.
- Card grid: `repeat(auto-fill,minmax(min(100%,320px),1fr))`, gap 20px. Card: white, radius 6px, ring `0 0 0 1px #E3EDF4`, padding 28px, min-height 280px, column gap 14px; hover `translateY(-4px)` + ring `#B9D9EB` + `0 24px 40px -28px rgba(14,44,85,.4)` (transition .2s).
  - Topic pill 12px/600 uppercase ls .1em `#3A6EA5` on `#EAF3F9`, padding `5px 10px`; right: "CC '27" tag 13px `#5A7192` (omit if unknown).
  - Title Newsreader 26px/1.2 `#0E2C55`. Excerpt = first paragraph, 16px/1.55 `#33496A`. Footer "— Author" + "N min read" (words/200, min 1), 15px `#5A7192`.

### 3. Letter modal
- Overlay: fixed, `rgba(14,44,85,.55)`, blur 4px, scrollable, padding `48px 20px`. Click outside / × / Esc closes. ← → keys step prev/next.
- Article: max-width 680px, radius 6px, shadow `0 40px 80px -30px rgba(0,0,0,.5)`, padding `clamp(32px,6vw,64px)`, fade-in `translateY(12px)→0, .35s ease`.
  - Background: white with ruled paper lines: `repeating-linear-gradient(to bottom, transparent 0 33px, #EAF2F8 33px 34px)`.
- Close button 40px circle, border `#DCE8F1`, top/right 18px.
- Title Newsreader `clamp(32px,4vw,42px)`/1.12. Body Newsreader 21px/1.6 `#1E3352`; greeting `#5A7192` ("Dear Lion," default or per-letter `greeting`); paragraphs mb 18px; signature italic "— Author, School 'YY" (omit missing parts).
- "Read another letter" button centered: `#1D4F91`, white 15px/500, 205×44, radius 999px; mt ~44px.
- **Helpfulness feedback** below (mt 32px, pt 24px, border-top `#DCE8F1`, centered): "Did this letter help?" 16px `#33496A` + pills **Yes** / **Not really** (white, border `#B9D9EB`, `#0E2C55` 15px/500, padding `9px 20px`, hover bg `#EAF3F9`). After vote → "Thanks for letting us know." One vote per letter per session (store in `sessionStorage`/`localStorage` in production to reduce duplicates).

### 4. Write a Letter
- Title "Write a Letter"; intro "Write something to support your peers. What would you tell your freshman self?"
- Form card: mt 24px, max-width 760px, white, border `#DCE8F1`, radius 10px, padding `clamp(20px,4vw,36px)`, column gap 24px. Field label 14px/600 `#0E2C55`; inputs `16px/1.6 #14263F`, border `#B9D9EB`, radius 6px, padding `10px 14px`, focus outline `#1D4F91`.
  1. **Title** (required) — text, maxlength 100, placeholder "Give it a title".
  2. **Letter** (required) — textarea, min-height 220px, resize vertical, placeholder "Write your letter…".
  3. **Topic** (required) — select, max-width 320px: Select / Academics / Career / Money / Belonging / Relationships / Health / Others.
  4. Row grid `repeat(auto-fit,minmax(min(100%,180px),1fr))` gap 16px — all optional, label suffix "(optional)" in `#5A7192`/400:
     - **Name** text maxlength 60
     - **School** select: Select / CC / SEAS / BC / GS / Other
     - **Class** select: Select / (current year +35 … current year −35, descending) / Other
  5. Helper: "You can stay anonymous and leave any of these blank." 15px `#5A7192`.
  6. Submit button right-aligned: "Submit", `#1D4F91` → hover `#0E2C55`, white 16px/600, padding `12px 28px`, radius 999px.
- **Validation:** custom, English only (use `noValidate` — native browser bubbles are localized, e.g. Korean). On submit with missing required fields: field border `#A23B2A` + message under it 14px `#A23B2A`: "Please add a title." / "Please write your letter." / "Please choose a topic." Error clears as the user edits that field.
- **Success state** (replaces form): stacked-paper card matching Home — back sheet `#B9D9EB` rotate 2.5°, middle `#DCEBF5` rotate −1.8°, front white card radius 10px, centered: eyebrow "LETTER SENT" (13px/600 uppercase `#3A6EA5`), H "Thank you for *your letter.*" (Newsreader `clamp(34px,4.4vw,48px)`, italic part `#3A6EA5`), "Your words might be exactly what a fellow Lion needs to hear." (17px `#33496A`), buttons **Read Letters** (primary blue) and **Write Another** (outline, resets form).
- Add a disabled/"Sending…" state while the request is in flight (not in prototype).

### 5. About
- Title "About Letters to Lions"; intro p (see `about.json` / reference).
- Section padding `48px 28px 96px`.
- **01–03 grid**: `repeat(auto-fit,minmax(min(100%,220px),1fr))`, gap `40px 36px`. Each column: `padding-top:24px; border-top:2px solid #1D4F91`; number "01" 14px/600 ls .08em `#3A6EA5`; H2 Newsreader 32px/1.1 `#0E2C55`; body 17px/1.65 `#33496A`. (What it is / Who it's for / Why it exists.)
- **04 What we value**: mt 72px, same 2px `#1D4F91` top rule full width, same number + 32px H2; then 3-column grid (same tracks/gap) of values — name 17px/700 `#0E2C55`, description 17px/1.65 `#33496A`. No backgrounds/boxes.
- **Important Note**: mt 120px, bg `#DCEBF5`, radius 10px, padding `clamp(32px,5vw,52px) clamp(28px,5vw,56px)`, column gap 16px. H2 "Important Note" Newsreader 32px `#0E2C55`; paragraph 18px/1.7 `#14263F`, max 44em, phone numbers bold `#0E2C55`.

### 6. Find Help
- Title "Find Help"; intro "Starting at Columbia means navigating a whole new chapter of life. These resources are here to support you through all of it."
- Groups (padding `56px 28px 96px`, gap 56px): H2 Newsreader 30px full width; optional note under the Crisis heading: bg `#DCEBF5`, 16px `#0E2C55`, padding `10px 16px`, radius 6px.
- Each resource is a link row (new tab): grid `minmax(0,1fr) auto`, padding `20px 0`, border-top `#DCE8F1`, hover bg `#EAF3F9`. Name 18px/600 `#0E2C55`; "Visit ↗" 15px/500 `#1D4F91`; description 16px/1.5 `#33496A`; optional "Phone: …" 15px `#5A7192`.
- Full data in `data/resources.json`.

## State
- `route` (home | letters | write | about | help), `topicFilter`, `openLetterId`, `featuredIndex` (random on load), `form {title, letter, topic, name, school, classYear}`, `errors`, `submitting`, `sent`, `votes {[letterId]: bool}`.

## Google Sheet backend
- Client POSTs JSON as `text/plain` (avoids CORS preflight) with `mode:'no-cors'` to the Apps Script web-app URL. Response is opaque — treat as success after the request resolves.
- Two row types, routed to two tabs by `apps-script/Code.gs`:
  - `type:'letter'` → tab **Letters**: `timestamp | title | topic | name | school | classYear | letter | status`
  - `type:'feedback'` → tab **Feedback**: `timestamp | letterId | letterTitle | helped`
- Letters are **moderated**: submissions land in the sheet with `status = pending`; the team copies approved ones into `letters.json` (manual, current plan). Optional later: an Apps Script `doGet` that returns rows with `status = approved` as JSON so the site loads letters dynamically.
- Deploy: Extensions → Apps Script → paste `Code.gs` → Deploy → New deployment → Web app, Execute as **Me**, Access **Anyone** → copy URL into `VITE_SHEET_URL`.

## Letter data shape (`letters.json`)
```json
{ "id": 1, "topic": "Others", "school": "", "year": "", "author": "Anonymous",
  "greeting": "Dear Freshmen,", "title": "Take your time",
  "pull": "Quote shown on the Home card (≤ ~6 lines).",
  "paras": ["Paragraph 1", "Paragraph 2"] }
```
`topic` must exactly match one of `topics.json`. `school`/`year` may be empty (then the tag/stamp is hidden). `greeting` defaults to "Dear Lion,".

## Design tokens
- Navy ink `#0E2C55` · Columbia blue (actions) `#1D4F91` · mid blue (italics, eyebrows) `#3A6EA5` · soft blue stamp `#6C9BC8`
- Light blue `#B9D9EB` (borders, back sheet) · pale blue `#DCEBF5` (active nav, notes) · tint `#EAF3F9` (hovers, pills)
- Lines `#DCE8F1` / `#E3EDF4` · paper lines `#EAF2F8`
- Text: body `#14263F`, secondary `#33496A`, muted `#5A7192`, letter body `#1E3352`
- Page bg `#F4F8FB`, surface `#FFFFFF`, error `#A23B2A`
- Radii: 6px (cards, inputs), 10px (form, panels), 999px (pills/buttons)
- Type: H1 clamp(48–80); hero clamp(52–96); H2 30–32; card title 26; letter body 21; intro 20; body 16–18; labels 14–15; eyebrows 12–13 uppercase ls .1em

## Files
- `reference/Letters to Lions.dc.html` — the full prototype (all screens, data, logic).
- `reference/support.js` — prototype runtime, only needed to view the reference locally.
- `data/*.json` — content extracted from the prototype.
- `apps-script/Code.gs` — Google Sheet receiver.

## Suggested repo layout
```
/ (repo)
├─ index.html
├─ src/ (components, styles, data/)
├─ public/
├─ .github/workflows/deploy.yml   # build + deploy to Pages
├─ vite.config.js                 # base: '/<repo>/'
└─ README.md
```
