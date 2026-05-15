# BayanCheck — Static Website

Filipino news portal + political candidate background checker. **Plain HTML/CSS/JS** — no Node.js required to view.

## Open the site

1. Open **`index.html`** in your browser (double-click), or
2. Upload this folder to **GitHub Pages** (see below)

## GitHub Pages

1. Create a new repo on GitHub
2. Upload **all files in this folder** (not the parent `src/` Next.js folder if present)
3. Repo → **Settings** → **Pages** → Source: **Deploy from branch** → branch `main`, folder `/ (root)`
4. Your site will be at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

Add `.nojekyll` is included so GitHub serves the site correctly.

## Pages

| File | Page |
|------|------|
| `index.html` | Homepage |
| `news.html` | News listing |
| `article.html?id=n1` | Article detail |
| `candidates.html` | Candidate search |
| `candidate.html?slug=maria-elena-reyes` | Full profile |
| `compare.html` | Compare candidates |
| `elections.html` | How to vote |
| `about.html` | Disclaimer |
| `faq.html` | FAQ |

## Local preview (optional)

```bash
npx serve .
```

## Disclaimer

For voter education only. Not affiliated with COMELEC.
