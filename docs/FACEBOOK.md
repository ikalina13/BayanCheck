# Facebook integration (opt-in only)

**Why we don't ship a Facebook scraper:** Meta's Terms of Service forbid scraping. Third-party services like Apify, BrightData, and Phantombuster routinely get blocked, and what they return is whatever the candidate's PR team chose to post — i.e. propaganda, not unbiased data. Surfacing that as "candidate information" would be the opposite of what BayanCheck is for.

**The compliant path** is the official Meta Graph API, which requires:
1. A Meta Developer App (free).
2. A Page Access Token for whichever public Page you want to read (you must be admin of the Page, OR the Page must grant your app access).
3. Business verification for production-tier permissions.

If you want to add this, here's the wiring point:

```js
// In js/api.js, alongside reddit() and youtube():
async function facebookGraph({ pageId, accessToken, limit = 10 }) {
  const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=message,created_time,permalink_url,full_picture&limit=${limit}&access_token=${accessToken}`;
  const r = await fetch(url, { credentials: "omit" });
  if (!r.ok) return { ok: false, error: "fb HTTP " + r.status, data: [] };
  const j = await r.json();
  return { ok: true, data: (j.data || []).map((p) => ({
    title: (p.message || "").slice(0, 120),
    snippet: (p.message || "").slice(0, 240),
    url: p.permalink_url,
    publishedAt: p.created_time,
    image: p.full_picture,
  })) };
}
```

And surface it in `js/site.js initPage.candidate()` alongside the existing YouTube + Reddit sections, conditional on a per-candidate `pageId` mapping you maintain.

Page Access Tokens go in `BayanKeys` (`localStorage`) the same way the YouTube key does. Add a `bayan_facebook_pages` entry mapping candidate slugs → `{pageId, accessToken}`.

We don't enable any of this by default because (a) most users don't have a Meta Developer App, (b) the curation work of mapping every senator to their official Page is a manual research task, and (c) for the 24 senators we cover, the Senate of the Philippines official press releases + the news outlet net catches everything Facebook would surface anyway.
