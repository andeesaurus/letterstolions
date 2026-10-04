# Letters to Lions

A student-run Columbia site where students and alumni write supportive letters to incoming freshmen.

**Pages:** Home · Read More (letter library) · Write a Letter · About · Find Help

The site is plain HTML/CSS/JS, so there's nothing to build or install. It's hosted on **GitHub Pages**, and a **Google Sheet** (via Apps Script) stores submissions and feedback.

## Project layout

```
index.html            page shell (header, footer)
config.js             ← paste your Apps Script /exec URL here
assets/styles.css     all styles (design tokens at the top)
assets/app.js         routing, letter library, modal, form, feedback
data/letters.json     hand-curated letters (approved sheet letters are added automatically)
data/topics.json      topic list (filters + form dropdown)
data/about.json       About page copy
data/resources.json   Find Help links
apps-script/Code.gs   Google Sheet backend (see apps-script/README.md)
design/               original design handoff, prototype and drawings (reference only)
```

## Set up the backend

Follow [`apps-script/README.md`](apps-script/README.md): create a Sheet, paste in `Code.gs`, deploy it as a web app, then put the URL in `config.js`.

Until `SHEET_URL` is set, the form still shows "Letter sent" but nothing is saved. A warning is logged in the browser console.

## Publish on GitHub Pages

1. Merge into `main`.
2. In the repo on GitHub, go to **Settings → Pages → Build and deployment → Source: Deploy from a branch**, then choose **Branch: `main`**, folder **`/ (root)`**, and click **Save**.
3. After about a minute the site is live at `https://<your-username>.github.io/letterstolions/`.

## Run it locally

The site loads its `data/*.json` files with `fetch`, so open it through a local server rather than by double-clicking `index.html`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Editing content (no code needed)

You can edit everything in the GitHub web editor (open the file and click ✏️):

- **Add a letter by hand:** add an entry to `data/letters.json`:
  ```json
  { "id": 3, "topic": "Academics", "school": "CC", "year": "27", "author": "Anonymous",
    "greeting": "Dear Lion,", "title": "Letter title",
    "pull": "Short quote shown on the Home card.",
    "paras": ["First paragraph.", "Second paragraph."] }
  ```
  `topic` must match one in `data/topics.json` exactly. `school`/`year` can be `""`. `greeting` is optional.
  Most letters won't need this, because approving a submission in the Google Sheet publishes it automatically.
- **About / Find Help copy:** edit `data/about.json` / `data/resources.json`. In the About note, `**text**` makes text bold.

## Letter length

Letters must be **50–300 words** (max 3,000 characters). The form shows a live word counter.

Limits live in two places. Change both together:
- Site: `WORD_MIN`, `WORD_MAX`, `LETTER_MAX_CHARS` in `config.js`
- Sheet: `WORD_MIN`, `WORD_MAX`, `LIMITS.letter` in `apps-script/Code.gs` (then redeploy, see `apps-script/README.md`)

## URLs

Pages use hash links that work on GitHub Pages without extra setup: `#/`, `#/letters`, `#/write`, `#/about`, `#/help`.
