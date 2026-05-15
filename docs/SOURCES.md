# Sources & filtering

Every external API the site calls, what we use it for, and how we keep results to **Filipino politics only**.

## News (live PH outlets)

Aggregated client-side from these RSS feeds via `api.rss2json.com`:

- Rappler — `https://www.rappler.com/feed/`
- Rappler Nation — `https://www.rappler.com/nation/feed/`
- Inquirer (full feed) — `https://www.inquirer.net/fullfeed`
- Inquirer News — `https://newsinfo.inquirer.net/feed`
- ABS-CBN News — `https://news.abs-cbn.com/rss/news`
- GMA News — `https://data.gmanetwork.com/gno/rss/news/feed.xml`
- GMA News Nation — `https://data.gmanetwork.com/gno/rss/news/nation/feed.xml`
- Manila Bulletin — `https://mb.com.ph/feed/`
- Philstar Headlines — `https://www.philstar.com/rss/headlines`
- Vera Files (fact-check) — `https://verafiles.org/feed`
- Bilyonaryo — `https://bilyonaryo.com/feed/`

Augmented with **GDELT 2.0** filtered to `sourcecountry:RP` (Philippines, FIPS code).

Cached in `localStorage` for 15 min.

## Senate hearing calendar

Scraped from `https://web.senate.gov.ph/committee/calendar.asp` (and `/press_release/` + the homepage as fallbacks) via three free CORS proxies in priority order:

1. `corsproxy.io`
2. `api.allorigins.win`
3. `api.codetabs.com`

Cached 1 h. The Philippine Senate site uses Cloudflare bot protection; from datacenter IPs it may return a challenge page (handled gracefully — UI shows a "view on senate.gov.ph" link). From normal residential / mobile IPs it works fine.

## Candidate biography + issues + projects

- **Wikipedia REST API** — biography, thumbnail, article sections.
- **Wikipedia parse API** — section HTML for "Controversies / Investigations / Legal" (→ Issues) and "Bills / Legislation / Career" (→ Projects).
- **Wikidata** (planned for v2) — structured facts.

Cached 24 h per candidate.

## Per-candidate news + multi-platform

- **GDELT 2.0** with `"<full name>" sourcecountry:RP` query for recent media coverage.
- **Reddit** `r/Philippines/search.json` for citizen discussion (direct → `old.reddit.com` → CORS proxy fallbacks).
- **YouTube Data API v3** (optional, user-supplied key) for senator-channel videos.

## AI chat

- **Pollinations** (default, model `openai` / GPT-OSS 20B) — browser-direct, FREE, no key, no signup. OpenAI-compatible streaming endpoint at `https://text.pollinations.ai/openai`.
- **Google Gemini 1.5 Flash / Pro** — FREE tier with a free API key from https://aistudio.google.com/app/apikey. Browser-direct streaming.
- **Groq · Llama 3.1 70B / 8B** — FREE tier with a free API key from https://console.groq.com/keys. Browser-direct, very fast.
- **Anthropic Claude** (paid) — browser-direct via the documented `anthropic-dangerous-direct-browser-access: true` header.
- **OpenAI GPT-4o** (paid) — browser-direct via standard chat completions API.

User supplies any optional key. Stored in `localStorage` only.

System prompt (loaded into every request):
- Hard rule: only answer Philippine-politics questions.
- Hard rule: cite a source URL for every factual claim, listed at the message footer.
- Hard rule: refuse to endorse, rank, or recommend candidates.
- Restricts answers to facts in the retrieved context (Wikipedia, PH news, Senate records, candidate profile JSON).

## "Filipino politics only" — three-layer filter

Implemented in [`js/ph-politics-filter.js`](../js/ph-politics-filter.js).

1. **Source whitelist.** ~40 hostnames recognized as Philippine outlets / official records / Wikipedia. A whitelisted source contributes +2 to the relevance score.
2. **Keyword scoring.** ~250 PH-politics terms covering institutions (Senate, COMELEC, DPWH, BSP), parties (Lakas-CMD, PDP-Laban, Akbayan, etc.), people (every senator + dynasty surnames), processes (impeachment, bill, hearing, SALN), and geography (every region + major city). Each hit = +1.
3. **Configurable strictness** (BayanBot → ⚙ Settings):
   - **Loose**: ≥ 1 keyword hit OR a whitelisted source.
   - **Standard** (default): ≥ 2 hits OR (whitelisted source AND ≥ 1 hit).
   - **Strict**: ≥ 3 hits OR (whitelisted source AND ≥ 1 hit).

Items below threshold are dropped before they hit the page.

For the chat assistant we add a **fourth layer** — the user's prompt is also run through the filter (loose mode) and clearly off-topic prompts get a local refusal without burning a model call.

## Citation policy

Every text block surfaced from an external source carries an inline `Sources:` footer linking to the original URL with the publisher's name. We never republish full article bodies — we summarize from the public RSS description and link out.
