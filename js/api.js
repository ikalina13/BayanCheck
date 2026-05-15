/* BayanCheck — orchestration layer for all external APIs.
 *
 * Pure browser code. No backend.
 *   news()              → live PH news from RSS feeds via rss2json + AllOrigins
 *   gdeltNews()         → GDELT 2.0 (no key, CORS, sourcecountry:PH)
 *   hearings()          → senate.gov.ph committee calendar via AllOrigins
 *   candidateProfile()  → Wikipedia + Wikidata + GDELT + Reddit, merged
 *   reddit()            → r/Philippines mentions for a given senator
 *   youtube()           → YouTube Data API v3 (user-supplied key)
 *
 * All methods return { ok, data, error?, fromCache?, degraded? } so the
 * UI can degrade gracefully when an external service is down.
 *
 * Cache TTLs (in localStorage):
 *   news        15 min
 *   hearings     1 h
 *   candidate   24 h
 *   reddit      30 min
 *   youtube     30 min
 */
(function (global) {
  "use strict";

  const CACHE_PREFIX = "bayan_cache_v1_";
  const TTL = {
    news: 15 * 60 * 1000,
    hearings: 60 * 60 * 1000,
    candidate: 24 * 60 * 60 * 1000,
    reddit: 30 * 60 * 1000,
    youtube: 30 * 60 * 1000,
    wiki: 24 * 60 * 60 * 1000,
  };

  function cacheGet(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return null;
      if (obj.exp && obj.exp < Date.now()) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return obj.value;
    } catch (e) {
      return null;
    }
  }

  function cacheSet(key, value, ttlMs) {
    try {
      const payload = JSON.stringify({ value, exp: Date.now() + (ttlMs || 0) });
      localStorage.setItem(CACHE_PREFIX + key, payload);
    } catch (e) {
      // Quota exceeded: try to clear oldest cache entries
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
        }
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ value, exp: Date.now() + (ttlMs || 0) }));
      } catch (e2) {}
    }
  }

  function hashStr(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
    return (h >>> 0).toString(36);
  }

  function relativeTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const ms = Date.now() - d.getTime();
    if (ms < 0) {
      const future = -ms;
      const days = Math.floor(future / 86400000);
      if (days >= 1) return "in " + days + "d";
      const hours = Math.floor(future / 3600000);
      if (hours >= 1) return "in " + hours + "h";
      const mins = Math.floor(future / 60000);
      return "in " + Math.max(1, mins) + "m";
    }
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + "h ago";
    const days = Math.floor(hours / 24);
    if (days < 30) return days + "d ago";
    const months = Math.floor(days / 30);
    if (months < 12) return months + "mo ago";
    return Math.floor(months / 12) + "y ago";
  }

  function stripHtml(s) {
    if (!s) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = String(s);
    return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
  }

  function firstImageFrom(html) {
    if (!html) return null;
    const m = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
    return m ? m[1] : null;
  }

  /* ============================================================
     NEWS — multi-source PH RSS aggregator
     ============================================================ */

  // Outlet → RSS URL (and a category hint when the feed is a category page).
  const NEWS_FEEDS = [
    { source: "Rappler", url: "https://www.rappler.com/feed/", category: null },
    { source: "Rappler — Nation", url: "https://www.rappler.com/nation/feed/", category: "politics" },
    { source: "Inquirer", url: "https://www.inquirer.net/fullfeed", category: null },
    { source: "Inquirer — News", url: "https://newsinfo.inquirer.net/feed", category: "politics" },
    { source: "ABS-CBN News", url: "https://news.abs-cbn.com/rss/news", category: null },
    { source: "GMA News", url: "https://data.gmanetwork.com/gno/rss/news/feed.xml", category: null },
    { source: "GMA News — Nation", url: "https://data.gmanetwork.com/gno/rss/news/nation/feed.xml", category: "politics" },
    { source: "Manila Bulletin", url: "https://mb.com.ph/feed/", category: null },
    { source: "Philstar", url: "https://www.philstar.com/rss/headlines", category: null },
    { source: "Vera Files", url: "https://verafiles.org/feed", category: "opinion" },
    { source: "Bilyonaryo", url: "https://bilyonaryo.com/feed/", category: "business" },
  ];

  function rss2jsonUrl(feedUrl) {
    const key = global.BayanKeys && global.BayanKeys.get("rss2json");
    let u =
      "https://api.rss2json.com/v1/api.json?rss_url=" +
      encodeURIComponent(feedUrl) +
      "&count=15";
    if (key) u += "&api_key=" + encodeURIComponent(key);
    return u;
  }

  async function fetchRss(feed) {
    try {
      const r = await fetch(rss2jsonUrl(feed.url), { credentials: "omit" });
      if (!r.ok) throw new Error("rss2json HTTP " + r.status);
      const j = await r.json();
      if (!j || j.status !== "ok" || !Array.isArray(j.items)) {
        throw new Error("rss2json bad payload");
      }
      const sourceName = (j.feed && j.feed.title) || feed.source;
      return j.items.map((it) => normalizeRssItem(it, feed, sourceName));
    } catch (err) {
      // rss2json failed → fall back to fetching the raw RSS via CORS proxy
      try {
        const xml = await global.BayanProxy.fetchViaProxy(feed.url, { timeout: 9000 });
        const doc = global.BayanProxy.parseXml(xml, "text/xml");
        const items = Array.from(doc.querySelectorAll("item, entry")).slice(0, 15);
        return items.map((node) => normalizeRssNode(node, feed));
      } catch (err2) {
        return [];
      }
    }
  }

  function normalizeRssItem(it, feed, sourceName) {
    const link = it.link || it.guid || "";
    const title = stripHtml(it.title || "");
    const summary = stripHtml(it.description || it.content || "").slice(0, 320);
    const content = it.content || it.description || "";
    const imageUrl =
      it.thumbnail ||
      it.enclosure?.link ||
      it.enclosure?.url ||
      firstImageFrom(content) ||
      "";
    const pub = it.pubDate || it.isoDate || it.published;
    const publishedAt = pub ? new Date(pub).toISOString() : new Date().toISOString();
    const cat =
      feed.category ||
      (global.BayanFilter ? global.BayanFilter.classifyCategory(title, summary) : "politics");
    return {
      id: hashStr(link || title),
      title,
      summary,
      content: stripHtml(content).slice(0, 1200),
      source: sourceName || feed.source,
      sourceUrl: link,
      publishedAt,
      imageUrl,
      category: cat,
      tags: Array.isArray(it.categories) ? it.categories.slice(0, 6) : [],
    };
  }

  function getNodeText(node, sels) {
    for (const s of sels) {
      const el = node.querySelector(s);
      if (el && el.textContent) return el.textContent;
    }
    return "";
  }

  function normalizeRssNode(node, feed) {
    const title = stripHtml(getNodeText(node, ["title"]));
    const link =
      stripHtml(getNodeText(node, ["link"])) ||
      (node.querySelector("link") ? node.querySelector("link").getAttribute("href") || "" : "");
    const desc = getNodeText(node, ["description", "summary", "content\\:encoded", "content"]);
    const summary = stripHtml(desc).slice(0, 320);
    const pub = getNodeText(node, ["pubDate", "published", "updated", "dc\\:date"]);
    const publishedAt = pub ? new Date(pub).toISOString() : new Date().toISOString();
    const imageUrl =
      firstImageFrom(desc) ||
      (node.querySelector("enclosure") ? node.querySelector("enclosure").getAttribute("url") : "") ||
      "";
    const cat =
      feed.category ||
      (global.BayanFilter ? global.BayanFilter.classifyCategory(title, summary) : "politics");
    return {
      id: hashStr(link || title),
      title,
      summary,
      content: stripHtml(desc).slice(0, 1200),
      source: feed.source,
      sourceUrl: link,
      publishedAt,
      imageUrl,
      category: cat,
      tags: [],
    };
  }

  async function gdeltNews(opts) {
    opts = opts || {};
    const q =
      opts.query ||
      "(senate OR congress OR comelec OR malacanang OR \"philippine politics\")";
    const url =
      "https://api.gdeltproject.org/api/v2/doc/doc?query=" +
      encodeURIComponent(q + " sourcecountry:PH") +
      "&mode=ArtList&format=json&maxrecords=50&sort=DateDesc";
    try {
      const r = await fetch(url, { credentials: "omit" });
      if (!r.ok) throw new Error("GDELT HTTP " + r.status);
      const j = await r.json();
      const arts = (j && j.articles) || [];
      return arts
        .map((a) => {
          let host = "";
          try {
            host = a.url ? new URL(a.url).hostname.replace(/^www\./, "") : "";
          } catch (e) {}
          const dateStr = a.seendate || ""; // yyyymmddhhmmss
          let publishedAt = new Date().toISOString();
          if (dateStr && /^\d{14}$/.test(dateStr)) {
            const y = dateStr.slice(0, 4),
              mo = dateStr.slice(4, 6),
              d = dateStr.slice(6, 8),
              h = dateStr.slice(8, 10),
              mi = dateStr.slice(10, 12),
              s = dateStr.slice(12, 14);
            publishedAt = new Date(
              Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)
            ).toISOString();
          }
          return {
            id: hashStr(a.url),
            title: stripHtml(a.title || ""),
            summary: "",
            content: "",
            source: a.domain || host || "GDELT",
            sourceUrl: a.url,
            publishedAt,
            imageUrl: a.socialimage || "",
            category: global.BayanFilter
              ? global.BayanFilter.classifyCategory(a.title, "")
              : "politics",
            tags: [],
            _gdelt: true,
          };
        })
        .filter((x) => x.sourceUrl);
    } catch (e) {
      return [];
    }
  }

  function dedupeAndSort(items, limit) {
    const seen = new Set();
    const out = [];
    for (const it of items) {
      if (!it || !it.title) continue;
      const key = (it.sourceUrl || it.id || it.title).toLowerCase().split("?")[0];
      if (seen.has(key)) continue;
      const slugTitle = it.title.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 80);
      if (seen.has(slugTitle)) continue;
      seen.add(key);
      seen.add(slugTitle);
      out.push(it);
    }
    out.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return limit ? out.slice(0, limit) : out;
  }

  async function news(opts) {
    opts = opts || {};
    const cacheKey = "news_" + (opts.category || "all") + "_" + (opts.q || "");
    if (!opts.refresh) {
      const cached = cacheGet(cacheKey);
      if (cached) return { ok: true, data: cached, fromCache: true };
    }

    const tasks = NEWS_FEEDS.map((f) => fetchRss(f));
    if (opts.includeGdelt !== false) tasks.push(gdeltNews({}));

    const results = await Promise.allSettled(tasks);
    let items = [];
    let okSources = 0;
    let totalSources = NEWS_FEEDS.length;
    results.forEach((r, idx) => {
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        items = items.concat(r.value);
        if (idx < NEWS_FEEDS.length && r.value.length > 0) okSources += 1;
      }
    });

    const strictness = global.BayanFilter
      ? global.BayanFilter.getStrictness()
      : "standard";
    items = items.filter((it) =>
      global.BayanFilter
        ? global.BayanFilter.isPhPoliticsRelevant(it, { strictness })
        : true
    );

    if (opts.category) {
      items = items.filter((it) => it.category === opts.category);
    }
    if (opts.q) {
      const ql = opts.q.toLowerCase();
      items = items.filter(
        (it) =>
          (it.title || "").toLowerCase().includes(ql) ||
          (it.summary || "").toLowerCase().includes(ql)
      );
    }

    items = dedupeAndSort(items, opts.limit || 60);

    const data = {
      items,
      lastUpdated: new Date().toISOString(),
      sources: { ok: okSources, total: totalSources },
    };

    if (items.length > 0) {
      cacheSet(cacheKey, data, TTL.news);
      return { ok: true, data };
    }

    // fall back to whatever's in cache, or signal degraded so UI can show fallback
    const stale = cacheGet(cacheKey);
    if (stale) return { ok: true, data: stale, fromCache: true, degraded: true };
    return { ok: false, error: "all-feeds-failed", data };
  }

  /* ============================================================
     SENATE HEARINGS — scrape senate.gov.ph committee calendar
     ============================================================ */

  const SENATE_CAL_URL = "https://web.senate.gov.ph/committee/calendar.asp";

  async function hearings(opts) {
    opts = opts || {};
    const cacheKey = "hearings_all";
    let all = cacheGet(cacheKey);
    if (!all || opts.refresh) {
      try {
        const html = await global.BayanProxy.fetchViaProxy(SENATE_CAL_URL, { timeout: 10000 });
        all = parseSenateCalendar(html);
        if (all.length > 0) cacheSet(cacheKey, all, TTL.hearings);
      } catch (e) {
        all = cacheGet(cacheKey) || [];
        if (!all.length) return { ok: false, error: "senate-unreachable", data: [] };
        return { ok: true, data: filterHearings(all, opts), degraded: true, fromCache: true };
      }
    }
    return { ok: true, data: filterHearings(all, opts) };
  }

  function parseSenateCalendar(html) {
    try {
      const doc = global.BayanProxy.parseHtml(html);
      // The committee calendar uses <table> rows. We parse permissively:
      // any row with a date + a committee name is treated as a hearing.
      const rows = Array.from(doc.querySelectorAll("table tr"));
      const out = [];
      const dateRe = /(\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4})|(\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+\d{1,2}\s+\w+\s+\d{4})/i;
      for (const row of rows) {
        const text = (row.textContent || "").replace(/\s+/g, " ").trim();
        if (!text) continue;
        const m = text.match(dateRe);
        if (!m) continue;
        const dateStr = m[0];
        // Find committee name: look for "Committee on …" or capitalized words after the date
        let committee = "";
        const cm = text.match(/Committee on [^|;,]+/i);
        if (cm) committee = cm[0].trim();
        if (!committee) {
          const tds = Array.from(row.querySelectorAll("td"));
          if (tds.length >= 2) committee = stripHtml(tds[1].innerHTML).slice(0, 120);
        }
        if (!committee) continue;
        const time =
          (text.match(/\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)/) || [""])[0] || "";
        const agenda = text
          .replace(dateStr, "")
          .replace(committee, "")
          .replace(time, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 240);
        let isoDate = "";
        try {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) isoDate = d.toISOString();
        } catch (e) {}
        out.push({
          committee,
          date: isoDate || dateStr,
          rawDate: dateStr,
          time,
          agenda,
          location: "Senate of the Philippines",
          sourceUrl: SENATE_CAL_URL,
        });
      }
      return out;
    } catch (e) {
      return [];
    }
  }

  function filterHearings(all, opts) {
    let items = all.slice();
    // future-only by default
    const now = Date.now();
    items = items.filter((h) => {
      const t = new Date(h.date).getTime();
      return isNaN(t) || t >= now - 24 * 3600 * 1000;
    });
    // sort ascending
    items.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (opts && opts.slug) {
      // Tagged committee membership comes from a separate scrape; for now we
      // do a name match: hearings whose agenda contains the senator's surname.
      const slug = opts.slug;
      const senator =
        (global.BAYAN_CANDIDATES || []).find((c) => c.slug === slug) || null;
      if (senator) {
        const surname = senator.fullName.split(/\s+/).pop().toLowerCase();
        const display = (senator.aliases && senator.aliases[0]) || senator.fullName;
        const dispLower = display.toLowerCase();
        items = items.filter((h) => {
          const hay = (h.committee + " " + h.agenda).toLowerCase();
          return hay.includes(surname) || hay.includes(dispLower);
        });
      }
    }
    if (opts && opts.limit) items = items.slice(0, opts.limit);
    return items;
  }

  /* ============================================================
     WIKIPEDIA + WIKIDATA enrichment
     ============================================================ */

  async function wikiSummary(title) {
    if (!title) return null;
    const cacheKey = "wiki_sum_" + title;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
    try {
      const r = await fetch(
        "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title),
        { credentials: "omit" }
      );
      if (!r.ok) return null;
      const j = await r.json();
      cacheSet(cacheKey, j, TTL.wiki);
      return j;
    } catch (e) {
      return null;
    }
  }

  async function wikiSections(title) {
    if (!title) return null;
    const cacheKey = "wiki_sec_" + title;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
    try {
      const url =
        "https://en.wikipedia.org/w/api.php?action=parse&page=" +
        encodeURIComponent(title) +
        "&format=json&prop=sections|wikitext&origin=*";
      const r = await fetch(url, { credentials: "omit" });
      if (!r.ok) return null;
      const j = await r.json();
      cacheSet(cacheKey, j, TTL.wiki);
      return j;
    } catch (e) {
      return null;
    }
  }

  async function wikiSectionHtml(title, sectionIndex) {
    try {
      const url =
        "https://en.wikipedia.org/w/api.php?action=parse&page=" +
        encodeURIComponent(title) +
        "&section=" +
        encodeURIComponent(sectionIndex) +
        "&format=json&prop=text&origin=*";
      const r = await fetch(url, { credentials: "omit" });
      if (!r.ok) return null;
      const j = await r.json();
      return (j && j.parse && j.parse.text && j.parse.text["*"]) || null;
    } catch (e) {
      return null;
    }
  }

  function extractSectionParas(html, max) {
    if (!html) return [];
    const doc = global.BayanProxy.parseHtml(
      "<div>" + String(html).replace(/<style[\s\S]*?<\/style>/g, "") + "</div>"
    );
    const ps = Array.from(doc.querySelectorAll("p"))
      .map((p) => stripHtml(p.innerHTML))
      .filter((t) => t && t.length > 30);
    return ps.slice(0, max || 3);
  }

  /* ============================================================
     Reddit + YouTube
     ============================================================ */

  async function reddit(opts) {
    opts = opts || {};
    const q = opts.q || opts.fullName;
    if (!q) return { ok: false, error: "no-query", data: [] };
    const cacheKey = "reddit_" + q;
    if (!opts.refresh) {
      const cached = cacheGet(cacheKey);
      if (cached) return { ok: true, data: cached, fromCache: true };
    }
    const url =
      "https://www.reddit.com/r/Philippines/search.json?q=" +
      encodeURIComponent('"' + q + '"') +
      "&restrict_sr=on&sort=new&t=month&limit=10";
    try {
      const r = await fetch(url, { credentials: "omit" });
      if (!r.ok) throw new Error("reddit HTTP " + r.status);
      const j = await r.json();
      const posts = ((j.data && j.data.children) || []).map((c) => c.data).map((p) => ({
        title: p.title,
        url: "https://www.reddit.com" + p.permalink,
        score: p.score,
        author: p.author,
        subreddit: p.subreddit_name_prefixed,
        publishedAt: new Date((p.created_utc || 0) * 1000).toISOString(),
        snippet: (p.selftext || "").slice(0, 240),
      }));
      const filtered = posts.filter((p) =>
        global.BayanFilter
          ? global.BayanFilter.isPhPoliticsRelevant(
              { title: p.title, summary: p.snippet, sourceUrl: p.url },
              { strictness: "loose" }
            )
          : true
      );
      cacheSet(cacheKey, filtered, TTL.reddit);
      return { ok: true, data: filtered };
    } catch (e) {
      return { ok: false, error: String(e), data: [] };
    }
  }

  async function youtube(opts) {
    opts = opts || {};
    const q = opts.q;
    if (!q) return { ok: false, error: "no-query", data: [] };
    const key = global.BayanKeys && global.BayanKeys.get("youtube");
    if (!key) return { ok: false, error: "no-key", data: [] };

    const cacheKey = "yt_" + q;
    if (!opts.refresh) {
      const cached = cacheGet(cacheKey);
      if (cached) return { ok: true, data: cached, fromCache: true };
    }
    const url =
      "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" +
      encodeURIComponent(q) +
      "&type=video&relevanceLanguage=en&regionCode=PH&maxResults=8&key=" +
      encodeURIComponent(key);
    try {
      const r = await fetch(url, { credentials: "omit" });
      if (!r.ok) throw new Error("youtube HTTP " + r.status);
      const j = await r.json();
      const items = (j.items || []).map((it) => ({
        title: it.snippet.title,
        channel: it.snippet.channelTitle,
        url: "https://www.youtube.com/watch?v=" + (it.id.videoId || ""),
        publishedAt: it.snippet.publishedAt,
        thumbnail:
          (it.snippet.thumbnails &&
            (it.snippet.thumbnails.medium || it.snippet.thumbnails.default || {}).url) ||
          "",
        description: it.snippet.description,
      }));
      const filtered = items.filter((p) =>
        global.BayanFilter
          ? global.BayanFilter.isPhPoliticsRelevant(
              { title: p.title, summary: p.description, sourceUrl: p.url },
              { strictness: "loose" }
            )
          : true
      );
      cacheSet(cacheKey, filtered, TTL.youtube);
      return { ok: true, data: filtered };
    } catch (e) {
      return { ok: false, error: String(e), data: [] };
    }
  }

  /* ============================================================
     CANDIDATE PROFILE — merge Wikipedia + GDELT + Reddit + per-outlet news
     ============================================================ */

  async function candidateProfile(slug) {
    if (!slug) return { ok: false, error: "no-slug" };
    const cacheKey = "candprof_" + slug;
    const cached = cacheGet(cacheKey);
    if (cached) return { ok: true, data: cached, fromCache: true };

    const candidate = (global.BAYAN_CANDIDATES || []).find((c) => c.slug === slug);
    if (!candidate) return { ok: false, error: "unknown-slug" };
    const wikiTitle = candidate.wiki || candidate.fullName.replace(/\s+/g, "_");
    const fullName = candidate.fullName;

    const [summaryJ, sectionsJ, gdeltItems, redditR] = await Promise.all([
      wikiSummary(wikiTitle),
      wikiSections(wikiTitle),
      gdeltNews({ query: '"' + fullName + '"' }),
      reddit({ q: fullName }),
    ]);

    const result = {
      slug,
      fullName,
      wikiTitle,
      lastFetched: new Date().toISOString(),
      biography: {},
      issues: [],
      projects: [],
      recentNews: [],
      reddit: [],
      youtube: [],
      sources: [],
    };

    if (summaryJ && !summaryJ.title === undefined) {
      result.biography.summary = summaryJ.extract || "";
      if (summaryJ.thumbnail) result.biography.thumbnail = summaryJ.thumbnail.source;
      result.sources.push({
        label: "Wikipedia — " + (summaryJ.titles?.normalized || wikiTitle.replace(/_/g, " ")),
        url:
          "https://en.wikipedia.org/wiki/" +
          encodeURIComponent(wikiTitle),
        fetchedAt: result.lastFetched,
      });
    }

    // Pull section text for issues + projects
    if (sectionsJ && sectionsJ.parse && Array.isArray(sectionsJ.parse.sections)) {
      const issueRe = /(controvers|investig|case|allegation|legal|criticism|impeach|scandal|charges?)/i;
      const projectRe = /(bill|legislat|principal sponsor|author|achievement|advocacy|career|political career|tenure|projects?)/i;
      const issueSecs = [];
      const projectSecs = [];
      for (const sec of sectionsJ.parse.sections) {
        if (issueRe.test(sec.line)) issueSecs.push(sec);
        else if (projectRe.test(sec.line)) projectSecs.push(sec);
      }
      // Limit per-page section fetches to avoid hammering Wikipedia
      const issueLimit = issueSecs.slice(0, 4);
      const projectLimit = projectSecs.slice(0, 4);
      const issueHtmls = await Promise.all(issueLimit.map((s) => wikiSectionHtml(wikiTitle, s.index)));
      const projectHtmls = await Promise.all(projectLimit.map((s) => wikiSectionHtml(wikiTitle, s.index)));
      issueLimit.forEach((sec, i) => {
        const paras = extractSectionParas(issueHtmls[i], 2);
        if (paras.length === 0) return;
        const anchor = (sec.anchor || sec.line.replace(/\s+/g, "_")).replace(/[^A-Za-z0-9_]/g, "_");
        result.issues.push({
          title: sec.line,
          description: paras.join(" "),
          severity: /impeach|criminal|icc|graft|plunder/i.test(sec.line) ? "serious" : "pending",
          sources: [
            {
              label: "Wikipedia §" + sec.line,
              url:
                "https://en.wikipedia.org/wiki/" +
                encodeURIComponent(wikiTitle) +
                "#" +
                anchor,
            },
          ],
        });
      });
      projectLimit.forEach((sec, i) => {
        const paras = extractSectionParas(projectHtmls[i], 2);
        if (paras.length === 0) return;
        const anchor = (sec.anchor || sec.line.replace(/\s+/g, "_")).replace(/[^A-Za-z0-9_]/g, "_");
        result.projects.push({
          name: sec.line,
          description: paras.join(" "),
          impact: "",
          sources: [
            {
              label: "Wikipedia §" + sec.line,
              url:
                "https://en.wikipedia.org/wiki/" +
                encodeURIComponent(wikiTitle) +
                "#" +
                anchor,
            },
          ],
        });
      });
    }

    // Recent media coverage from GDELT, PH-filtered
    if (Array.isArray(gdeltItems)) {
      const recent = gdeltItems
        .filter((it) =>
          global.BayanFilter
            ? global.BayanFilter.isPhPoliticsRelevant(it, { strictness: "loose" })
            : true
        )
        .slice(0, 8);
      result.recentNews = recent;
    }

    if (redditR && redditR.ok) result.reddit = redditR.data;

    // YouTube only if user supplied a key
    if (global.BayanKeys && global.BayanKeys.get("youtube")) {
      const ytR = await youtube({ q: fullName + " Philippines" });
      if (ytR && ytR.ok) result.youtube = ytR.data;
    }

    // Hearings (server-side only, but cached separately)
    try {
      const hr = await hearings({ slug });
      result.upcomingHearings = (hr && hr.data) || [];
    } catch (e) {
      result.upcomingHearings = [];
    }

    cacheSet(cacheKey, result, TTL.candidate);
    return { ok: true, data: result };
  }

  /* ============================================================
     Public API
     ============================================================ */
  global.BayanAPI = {
    news,
    gdeltNews,
    hearings,
    candidateProfile,
    reddit,
    youtube,
    wikiSummary,
    wikiSections,
    wikiSectionHtml,
    relativeTime,
    stripHtml,
    cacheClear: () => {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
        }
      } catch (e) {}
    },
  };
})(window);
