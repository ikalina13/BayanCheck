# BayanCheck — Filipino news + candidate background checker

Pure-static site for Philippine voter education. **Zero backend.** Deploys to GitHub Pages.

## What it does

- **Live Philippine news** scraped from 11 PH outlets (Rappler, Inquirer, ABS-CBN, GMA, Manila Bulletin, Philstar, Vera Files, Bilyonaryo + GDELT) via `rss2json` + free CORS proxies.
- **Senate hearing tracker** — scrapes `web.senate.gov.ph/committee/calendar.asp` and matches hearings to each senator.
- **Candidate enrichment** — Wikipedia + Wikidata + GDELT + Reddit aggregated per senator, with inline source citations on every claim.
- **BayanBot** — floating chat assistant in the bottom-right. **Free out of the box** (uses [Pollinations](https://pollinations.ai/) — no key, no signup). Optional upgrade to free Google Gemini, free Groq Llama 3.1, or paid Claude / OpenAI. Strict "PH politics only, cite every claim, never endorse a candidate" system prompt.
- **24 senators of the 20th Congress** plus House leadership, real names, Wikimedia Commons portraits.

## Run locally

Just open `index.html` in a browser, or:

```bash
python3 -m http.server 8000
```

## Deploy to GitHub Pages

1. Push the repo (you're already on `main`).
2. GitHub → Settings → Pages → Source: Deploy from branch `main`, folder `/ (root)`.
3. `.nojekyll` is included so files are served as-is.

## Where every piece of data comes from

| Data | Source | How fetched |
|---|---|---|
| News headlines | 11 PH outlet RSS feeds | `api.rss2json.com` (anonymous tier) |
| News (augmenter) | GDELT 2.0 DOC API | direct (CORS-enabled, `sourcecountry:RP` filter) |
| Senate hearings | `web.senate.gov.ph` | `corsproxy.io` → `api.allorigins.win` → `api.codetabs.com` |
| Candidate biography | Wikipedia REST API | direct (CORS-enabled) |
| Candidate Issues / Projects | Wikipedia article sections | direct |
| Recent media coverage per candidate | GDELT 2.0 (`"<full name>" sourcecountry:RP`) | direct |
| Citizen mentions | Reddit `r/Philippines/search.json` | direct → CORS proxy fallback |
| YouTube videos (optional) | YouTube Data API v3 | user-supplied key |
| Chat assistant (default) | Pollinations (`text.pollinations.ai`) | free, no key required |
| Chat assistant (optional) | Google Gemini / Groq / Claude / OpenAI | user-supplied key, browser-direct |

See [`docs/SOURCES.md`](docs/SOURCES.md) for the full list, including the three-layer "Filipino politics only" filter.

## API keys

**You don't need any keys to use BayanBot** — the default Pollinations provider is free and requires no signup. Click the 💬 chat bubble and start asking questions.

If you want higher-quality answers, click the 💬 chat bubble → ⚙ Settings → paste a key:

- **Google Gemini** (FREE): https://aistudio.google.com/app/apikey — no credit card needed.
- **Groq · Llama 3.1 70B** (FREE, very fast): https://console.groq.com/keys
- **Anthropic Claude** (paid): https://console.anthropic.com/
- **OpenAI** (paid): https://platform.openai.com/api-keys
- **YouTube Data API v3** (optional, for senator videos): https://console.cloud.google.com/apis/library/youtube.googleapis.com
- **rss2json** (optional, raises news quota): https://rss2json.com/

Keys are stored only in this browser's `localStorage` and sent ONLY to the official API endpoint of each provider. BayanCheck never sees them. Full privacy details in `about.html#privacy`.

## Honesty

- **No AI is 100% unbiased.** BayanBot mitigates by (1) hard-banning endorsements and rankings, (2) requiring an inline source URL for every factual claim, (3) restricting answers to retrieved context (Wikipedia + PH news + Senate records). Always verify against the cited links.
- **Facebook scraping is intentionally NOT included.** Meta forbids it; the third-party scraper services that try violate the ToS and return whatever the candidate's PR team chose to post — i.e. propaganda, not unbiased data. We use Reddit + YouTube + a wider news net instead. If you want official Facebook page integration we need a Meta Developer App + Page Access Token; see `docs/FACEBOOK.md`.
- **News is aggregated, never republished.** We show headlines + summaries from public RSS feeds and link out to the original outlet for the full article.
- **Allegations ≠ convictions.** Every issue is labeled with its status and links to the original public source.

## Disclaimer

For voter education only. Not affiliated with COMELEC. Verify everything via the cited sources, COMELEC, and the official Senate / House directories.
