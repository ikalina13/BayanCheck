# Upload this folder to GitHub

This is a **static website** — no Node.js, no backend. Everything runs in the browser.

## Steps

1. Create a new GitHub repository (or use the existing one).
2. Upload all files in this folder (or push from git).
3. Settings → Pages → Source: Deploy from branch `main`, folder `/ (root)`.

Your site URL: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

`.nojekyll` is included so files are served as-is.

## Test locally

Open `index.html` directly, or run:

```bash
python3 -m http.server 8000
```

## What's in here

- `*.html` — all pages
- `css/site.css` — single stylesheet
- `js/` — all scripts (orchestration in `api.js`, chat widget in `chat.js`, etc.)
- `docs/` — `SOURCES.md` (every API + filter), `FACEBOOK.md` (opt-in flow)

See [README.md](README.md) for the full architecture and where every piece of data comes from.
