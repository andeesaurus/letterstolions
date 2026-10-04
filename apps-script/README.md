# Google Sheet backend (Apps Script)

`Code.gs` turns a Google Sheet into the backend for the site:

- **Write a Letter** submissions land in a **Letters** tab with `status = pending`.
- **"Did this letter help?"** votes land in a **Feedback** tab.
- Any letter you mark **approved** shows up on the site automatically (Read More + the Home card). No copying into `letters.json` needed.

## One-time setup (about 5 minutes)

1. Create a new Google Sheet (e.g. "Letters to Lions submissions") in the account that should own the data.
2. In the sheet: **Extensions → Apps Script**. Delete the sample code, paste in all of `Code.gs`, and click **Save**.
3. *(Optional)* To get an email for every new letter, set `NOTIFY_EMAIL` at the top of the file to your address.
4. In the function dropdown at the top, choose **`setup`** and click **Run**. Google will ask you to authorize the script. Approve it. (If you see "Google hasn't verified this app", click **Advanced → Go to … (unsafe)**. That warning appears because it's your own script.) This creates and formats the **Letters** and **Feedback** tabs.
5. Click **Deploy → New deployment**, click the gear icon, and pick **Web app**:
   - Description: `Letters to Lions`
   - Execute as: **Me**
   - Who has access: **Anyone**

   Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.
6. Paste that URL into [`config.js`](../config.js) at the root of this repo:
   ```js
   window.LTL_CONFIG = {
     SHEET_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   };
   ```
   Commit the change. The site will start saving submissions.

To check it's live, open the `/exec` URL in a browser. You should see `{"ok":true,"service":"Letters to Lions"}`.

## Moderating letters

Open the **Letters** tab. Every new submission has `status = pending`, and nothing pending is ever shown publicly.

| Column | What it is |
| --- | --- |
| `timestamp` | When it was submitted |
| `id` | Short unique ID (used for feedback votes). Don't edit it. |
| `status` | Dropdown: `pending` → change to **`approved`** to publish, or **`rejected`** to hide |
| `title`, `topic`, `letter` | What the writer submitted |
| `name`, `school`, `classYear` | Optional. A blank name shows as "Anonymous". |
| `pull` | *(Optional, you fill this in)* The quote shown on the Home card. Defaults to the first paragraph. |
| `greeting` | *(Optional, you fill this in)* e.g. "Dear Freshmen,". Defaults to "Dear Lion,". |

You can fix typos directly in the sheet before approving. Approved letters appear on the site within a few seconds. Approved letters are cached for up to 5 minutes, and editing the Letters tab clears that cache.

To unpublish a letter, change its status back to `pending` or `rejected`.

## Feedback tab

`timestamp | letterId | letterTitle | helped (Yes/No)`. Each visitor can vote once per letter (stored in their browser).

## Updating the script later

If you change `Code.gs`, go to **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. This keeps the same `/exec` URL. (A *New deployment* would give you a new URL that you'd have to paste into `config.js` again.)

## Notes

- **Security:** the web-app URL is public by design, since the browser needs it. The script only accepts the two kinds of rows above, checks required fields and topic, rejects letters outside **50–300 words** (`WORD_MIN` / `WORD_MAX`), caps letters at 3,000 characters (`LIMITS.letter`), trims other lengths, and prefixes anything that starts like a spreadsheet formula (`=`, `+`, `-`, `@`) so it can't run. A hidden "honeypot" field silently drops most spam bots.
- **Why "no-cors":** Apps Script can't answer browser CORS preflight requests, so the site posts as `text/plain` with `mode: 'no-cors'`. The site can't read the reply, so it shows "Letter sent" once the request goes through, and an error message if the network request fails.
- The Letters tab is matched **by header name**, so you can reorder columns or add your own (e.g. `notes`) without breaking anything. Just don't rename the existing headers.

## Instagram posts (optional)

`Instagram.gs` makes an Instagram post from your Google Slides template each time a letter is set to **approved**. It saves a copy of the slides and a PNG of each slide into a Drive folder. The link goes in the letter's `post` column.

**Setup:**
1. In your Slides template, type placeholders where text should go, e.g. `{{pull}}` and `{{byline}}`. Full list at the top of `Instagram.gs`: `{{title}}`, `{{greeting}}`, `{{pull}}`, `{{body}}`, `{{p1}}`…`{{p9}}`, `{{author}}`, `{{byline}}`, `{{school}}`, `{{year}}`, `{{topic}}`.
2. In Apps Script, click **+ → Script**, name it `Instagram`, and paste in `Instagram.gs`.
3. Paste your IDs at the top:
   - `IG_TEMPLATE_ID`: from the template URL, `docs.google.com/presentation/d/`**`ID`**`/edit`
   - `IG_FOLDER_ID`: from the folder URL, `drive.google.com/drive/folders/`**`ID`**
4. Save, choose **`setupInstagram`** in the function dropdown, click **Run**, and allow the new permissions (Slides, Drive).

No redeploy is needed for this part. It runs inside the sheet, not the website.

**Notes:**
- Each letter gets one post. To redo it, clear its `post` cell, then set status to `pending` and back to `approved`.
- Text doesn't shrink to fit. Size your text boxes for long text, or use `{{pull}}` (short) instead of `{{body}}`.
- If something fails, the `post` cell shows `ERROR: …`.
