# Letters to Lions

A warm, editorial web platform where Columbia University students and alumni share supportive letters with incoming freshmen.

**This is the static public demo** — a read-only version that runs entirely in the browser with no backend, database, or authentication required.

---

## Live Demo

After deploying, your site will be available at:

```
https://YOUR_USERNAME.github.io/letters-to-lions/
```

---

## Quick Start (Local Development)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to GitHub Pages

### Option A: Automatic (recommended)

This repo includes a GitHub Actions workflow that builds and deploys automatically on every push to `main`.

1. **Create a GitHub repo**
   - Go to [github.com/new](https://github.com/new)
   - Name it `letters-to-lions` (this name is used in URLs)
   - Leave it empty (no README, no .gitignore)

2. **Push this code**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/letters-to-lions.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repo → **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - That's it — the workflow runs automatically

4. **Wait ~2 minutes** for the first build, then visit:
   ```
   https://YOUR_USERNAME.github.io/letters-to-lions/
   ```

### Option B: Manual

```bash
npm install
npm run deploy
```

This creates an `out/` folder with static files. You can:
- Push the `out/` folder to a `gh-pages` branch
- Or upload it to any static hosting (Netlify, Cloudflare Pages, etc.)

---

## Changing the Repo Name

If your GitHub repo is named something other than `letters-to-lions`, update the repo name in one place:

**`next.config.js`** — line 4:
```js
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || "your-repo-name";
```

The GitHub Actions workflow sets this automatically from the repo name.

---

## Project Structure

```
letters-to-lions/
├── .github/workflows/deploy.yml   ← auto-deploy to GitHub Pages
├── public/
│   ├── letters.json                ← all sample letter data
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── globals.css             ← all styles
│   │   ├── layout.tsx              ← root layout
│   │   ├── page.tsx                ← homepage
│   │   ├── not-found.tsx           ← 404
│   │   ├── about/page.tsx          ← about page
│   │   ├── letters/page.tsx        ← letter reader page
│   │   └── resources/page.tsx      ← support resources
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx          ← site navigation
│   │   │   └── footer.tsx          ← site footer
│   │   └── letters/
│   │       ├── letter-card.tsx     ← single letter display
│   │       └── letter-reader.tsx   ← random letter with "read another"
│   ├── config/
│   │   └── content.ts             ← all site copy and resources
│   └── lib/
│       ├── letters.ts             ← client-side letter fetcher
│       └── utils.ts               ← utility functions
├── next.config.js                  ← static export + basePath config
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── package.json
```

---

## How It Works

- **Letters** are stored in `public/letters.json` as a static JSON file
- The **letter reader** fetches this file client-side and picks a random letter
- **"Read Another Letter"** picks a new random letter from the same data (no API call)
- **Feedback buttons** are decorative — they acknowledge the click but don't send data anywhere
- **No backend, no database, no auth** — everything runs in the browser

---

## Editing Letters

To add, remove, or edit letters, modify `public/letters.json`. Each letter needs:

```json
{
  "id": "unique-id",
  "title": "Letter Title",
  "body": "The full letter text...",
  "authorDisplayName": "Name or null",
  "authorAffiliation": "CURRENT_STUDENT | ALUMNI | GRADUATE_STUDENT | STAFF | OTHER",
  "authorClassYear": "2026",
  "approvedAt": "2026-01-01T00:00:00.000Z"
}
```

Push your changes and GitHub Actions will redeploy automatically.

---

## License

This project is intended for use by the Columbia University community. Please adapt responsibly.
