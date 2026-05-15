# Upload this folder to GitHub

This is a **static website**. Open `index.html` in a browser — no install needed.

## Steps

1. Zip this entire folder (or upload files as-is)
2. Create a new GitHub repository
3. Upload all files to the repo root (`index.html` must be at the root)
4. Enable **GitHub Pages**: Settings → Pages → Deploy from `main` branch, folder `/ (root)`

Your site URL: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Do NOT upload

- `src/` folder (old Next.js app — optional, can delete)
- `package.json`, `node_modules` (not needed for the static site)

## Test locally

Double-click `index.html`, or run: `npx serve .`
