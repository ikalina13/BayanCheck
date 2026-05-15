/* BayanCheck — static site */
const CATEGORIES = {
  politics: "Philippine Politics & Government",
  business: "Business & Economics",
  technology: "Technology & Science",
  sports: "Sports",
  entertainment: "Entertainment",
  education: "Education",
  health: "Health",
  opinion: "Opinion & Analysis",
  regional: "Regional News",
};

const CASE_STATUS = {
  pending: "Pending",
  under_investigation: "Under Investigation",
  hearing: "Hearing Phase",
  dismissed: "Dismissed",
  convicted: "Convicted",
  resolved: "Resolved",
  allegation: "Allegation (Unverified)",
};

/** Card / profile badge — maps to CSS .severity.clean | .pending | .serious */
const ISSUE_SEVERITY_LABEL = {
  clean: "Clean",
  pending: "Public issues",
  serious: "Serious legal",
};

function issueSeverityLabel(sev) {
  return ISSUE_SEVERITY_LABEL[sev] || sev;
}

const THEME_KEY = "bayan-theme";

function $(sel, root = document) {
  return root.querySelector(sel);
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Resolve a Wikimedia Commons file name to a hotlinked image URL (check each file’s license on Commons). */
function commonsPhotoUrl(photoFile) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(photoFile)}`;
}

function escAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function rosterCommonsPipe(entry) {
  const files = [entry.photoFile].concat(entry.photoFileAlt || []);
  return files.map(commonsPhotoUrl).join("|");
}

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function placeholderSvgDataUri(initials) {
  const t = (initials || "?").replace(/[^A-Za-zÀ-ÿ0-9?]/g, "").slice(0, 2).toUpperCase() || "?";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2d2d36"/><stop offset="100%" stop-color="#1a1a22"/></linearGradient></defs><rect fill="url(#g)" width="256" height="256"/><text x="128" y="145" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="68" font-weight="600" fill="#ececf1">${t.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

function applyPhotoPlaceholder(img, initials) {
  const label = initials || initialsFromName(img.alt || "");
  img.setAttribute("data-img-retry", "placeholder");
  img.src = placeholderSvgDataUri(label);
  img.classList.add("is-photo-fallback");
}

function getStoredTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "dark" || t === "light") return t;
  } catch (e) {}
  return "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {}
  syncThemeToggleUi(theme);
}

function syncThemeToggleUi(theme) {
  const btn = $("#theme-toggle");
  if (!btn) return;
  const isDark = theme === "dark";
  btn.setAttribute("aria-pressed", isDark ? "true" : "false");
  btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  btn.title = isDark ? "Light mode" : "Dark mode";
  btn.innerHTML = isDark
    ? '<span class="theme-toggle-icon" aria-hidden="true">☀</span>'
    : '<span class="theme-toggle-icon" aria-hidden="true">☾</span>';
}

function initThemeToggle() {
  const theme = getStoredTheme();
  applyTheme(theme);
  const btn = $("#theme-toggle");
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const next = getStoredTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  } else {
    syncThemeToggleUi(document.documentElement.getAttribute("data-theme") || getStoredTheme());
  }
}

function initBayanImageFallbacks() {
  if (window.__bayanImgFallbacks) return;
  window.__bayanImgFallbacks = true;

  document.addEventListener(
    "error",
    (ev) => {
      const el = ev.target;
      if (!(el instanceof HTMLImageElement)) return;

      const st = el.getAttribute("data-img-retry") || "";
      if (st === "placeholder") return;
      if (st === "wiki-loading") return;

      const srcsAttr = el.getAttribute("data-commons-srcs");
      const wiki = el.getAttribute("data-wiki-fallback");
      const initialsFallback = el.getAttribute("data-initials-fallback");

      if (st === "wiki-loaded") {
        applyPhotoPlaceholder(el, initialsFallback || undefined);
        return;
      }

      if (srcsAttr) {
        const srcs = srcsAttr.split("|");
        let next = parseInt(el.getAttribute("data-commons-next") || "1", 10);
        if (next < srcs.length) {
          el.setAttribute("data-commons-next", String(next + 1));
          el.src = srcs[next];
          return;
        }
      }

      if (wiki && st !== "wiki-failed") {
        el.setAttribute("data-img-retry", "wiki-loading");
        const title = wiki.replace(/_/g, " ");
        fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&origin=*&pithumbsize=480`
        )
          .then((r) => r.json())
          .then((j) => {
            const pages = j.query && j.query.pages;
            const page = pages && Object.values(pages)[0];
            const thumb = page && !page.missing && page.thumbnail && page.thumbnail.source;
            if (thumb) {
              el.setAttribute("data-img-retry", "wiki-loaded");
              el.src = thumb;
            } else {
              el.setAttribute("data-img-retry", "wiki-failed");
              if (initialsFallback) applyPhotoPlaceholder(el, initialsFallback);
              else applyPhotoPlaceholder(el, initialsFromName(el.alt || wiki));
            }
          })
          .catch(() => {
            el.setAttribute("data-img-retry", "wiki-failed");
            if (initialsFallback) applyPhotoPlaceholder(el, initialsFallback);
            else applyPhotoPlaceholder(el, initialsFromName(el.alt || wiki));
          });
        return;
      }

      if (initialsFallback) {
        applyPhotoPlaceholder(el, initialsFallback);
      }
    },
    true
  );
}

let revealObserver;
function initRevealAnimations(root = document) {
  if (typeof IntersectionObserver === "undefined") return;
  const reduce =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    root.querySelectorAll(".reveal").forEach((el) => el.classList.add("reveal-visible"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("reveal-visible");
            revealObserver.unobserve(en.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -5% 0px", threshold: 0.08 }
    );
  }
  root.querySelectorAll(".reveal:not(.reveal-visible)").forEach((el) => revealObserver.observe(el));
}

function renderHeader(active = "") {
  const nav = [
    { href: "index.html", label: "Home", id: "home" },
    { href: "news.html", label: "News", id: "news" },
    { href: "candidates.html", label: "Check a Candidate", id: "candidates" },
    { href: "roster.html", label: "Congress roster", id: "roster" },
    { href: "compare.html", label: "Compare", id: "compare" },
    { href: "elections.html", label: "How to Vote", id: "elections" },
    { href: "about.html", label: "About", id: "about" },
  ];
  const cats = Object.keys(CATEGORIES).map(
    (k) => `<a href="news.html?category=${k}">${CATEGORIES[k].split(" ")[0]}</a>`
  );

  return `
  <header class="site-header">
    <div class="header-top container">
      <a href="index.html" class="logo">Bayan<span>Check</span></a>
      <nav class="nav-main" id="nav-main">
        ${nav.map((l) => `<a href="${l.href}" class="${active === l.id ? "active" : ""}">${l.label}</a>`).join("")}
      </nav>
      <div class="header-actions">
        <button type="button" class="theme-toggle" id="theme-toggle" aria-pressed="false" aria-label="Toggle theme"></button>
        <button class="menu-btn" id="menu-btn" aria-label="Menu">☰</button>
      </div>
    </div>
    <nav class="nav-cats container">${cats.join("")}</nav>
  </header>`;
}

function renderFooter() {
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <a href="index.html" class="logo">Bayan<span>Check</span></a>
        <p class="footer-tagline">Verified Filipino news and candidate background checks for informed voters.</p>
      </div>
      <div>
        <h4>News</h4>
        <ul>
          <li><a href="news.html?category=politics">Politics</a></li>
          <li><a href="news.html?category=business">Business</a></li>
          <li><a href="news.html">All News</a></li>
        </ul>
      </div>
      <div>
        <h4>Voters</h4>
        <ul>
          <li><a href="candidates.html">Check a Candidate</a></li>
          <li><a href="roster.html">Congress roster</a></li>
          <li><a href="compare.html">Compare</a></li>
          <li><a href="faq.html">FAQ</a></li>
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <ul>
          <li><a href="about.html">Disclaimer</a></li>
          <li><a href="about.html#privacy">Privacy</a></li>
        </ul>
      </div>
    </div>
    <p class="global-disclaimer">News is fetched live from listed Philippine outlets — verify on the source. Candidate Issues / Projects sections are auto-structured from public sources (Wikipedia, GDELT, PH news); AI assistants are not 100% unbiased — verify all citations.</p>
    <p class="footer-copy container">© ${new Date().getFullYear()} BayanCheck. For voter education only. Not affiliated with COMELEC.</p>
  </footer>`;
}

function initLayout(active) {
  const headerEl = $("#site-header");
  const footerEl = $("#site-footer");
  if (headerEl) headerEl.innerHTML = renderHeader(active);
  if (footerEl) footerEl.innerHTML = renderFooter();
  const btn = $("#menu-btn");
  const nav = $("#nav-main");
  if (btn && nav) {
    btn.addEventListener("click", () => nav.classList.toggle("open"));
  }
  initThemeToggle();
}

function articleHref(a) {
  if (a.sourceUrl && /^https?:\/\//.test(a.sourceUrl)) {
    return "article.html?url=" + encodeURIComponent(a.sourceUrl);
  }
  return "article.html?id=" + encodeURIComponent(a.id);
}

function newsCardImg(a) {
  if (a.imageUrl) {
    return `<a href="${articleHref(a)}"><img src="${escAttr(a.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer"></a>`;
  }
  // Soft placeholder so the card is consistent
  const ini = escAttr(initialsFromName(a.source || a.title || "?"));
  return `<a href="${articleHref(a)}" class="news-card-thumb-fallback" aria-hidden="true"
    style="display:block;width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,var(--surface),var(--surface-2));display:flex;align-items:center;justify-content:center;color:var(--muted-strong);font-weight:700;font-size:1.2rem">
    ${ini}
  </a>`;
}

function newsCard(a, featured) {
  const breaking = a.isBreaking ? '<span class="badge-breaking">Breaking</span>' : "";
  const cat = CATEGORIES[a.category] || a.category || "News";
  const dateStr = formatDate(a.publishedAt);
  const rel = (window.BayanAPI && BayanAPI.relativeTime) ? BayanAPI.relativeTime(a.publishedAt) : "";
  return `
  <article class="news-card reveal">
    <div class="news-card-thumb">
      ${breaking}
      ${newsCardImg(a)}
    </div>
    <div class="news-card-body">
      <p class="meta"><span class="cat">${cat}</span> · ${escAttr(a.source || "")}${rel ? " · " + rel : (dateStr ? " · " + dateStr : "")}</p>
      <h3><a href="${articleHref(a)}">${a.title}</a></h3>
      <p class="news-card-summary">${a.summary || ""}</p>
    </div>
  </article>`;
}

function candidateCard(c) {
  const serious = c.cases.filter((x) => x.severity === "serious" && !["dismissed", "resolved"].includes(x.status)).length;
  const ini = escAttr(initialsFromName(c.fullName));
  const commons = c.photoCommonsSrcs ? ` data-commons-srcs="${escAttr(c.photoCommonsSrcs)}"` : "";
  const wikiFb = c.wiki ? ` data-wiki-fallback="${escAttr(c.wiki)}"` : "";
  const termNote = c.term ? `<p class="meta">Term ${c.term}</p>` : "";
  return `
  <a href="candidate.html?slug=${c.slug}" class="candidate-card reveal" style="text-decoration:none;color:inherit">
    <img src="${c.photoUrl}" alt="${escAttr(c.fullName)}" loading="lazy" data-initials-fallback="${ini}"${commons}${wikiFb}>
    <span class="severity ${c.issueSeverity} candidate-card-badge">${issueSeverityLabel(c.issueSeverity)}</span>
    <div class="candidate-card-body">
      <h3>${c.fullName}</h3>
      <p class="meta">${c.position} · ${c.party}</p>
      ${termNote}
      <p class="candidate-card-summary">${c.summary}</p>
      ${serious ? `<p class="candidate-card-flag">🔴 ${serious} serious issue(s)</p>` : ""}
    </div>
  </a>`;
}

function sourceLinks(sources) {
  if (!sources || !sources.length) return "";
  return `<ul class="source-list" style="list-style:none;padding:.5rem .75rem"><li><span class="source-list-label">Sources</span></li>${sources.map((s) => `<li><a href="${escAttr(s.url)}" target="_blank" rel="noopener">${escAttr(s.label || s.url)}</a>${s.accessedAt ? ` <span class="meta">(${s.accessedAt})</span>` : ""}</li>`).join("")}</ul>`;
}

function hearingRow(h) {
  let dateLabel = h.rawDate || h.date;
  try {
    const d = new Date(h.date);
    if (!isNaN(d.getTime())) {
      dateLabel = d.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" });
    }
  } catch (e) {}
  return `<li class="hearing-row">
    <div>
      <div class="hearing-date">${dateLabel}${h.time ? "<br><span class=\"hearing-meta\">" + escAttr(h.time) + "</span>" : ""}</div>
    </div>
    <div>
      <div class="hearing-title">${escAttr(h.committee || "Senate hearing")}</div>
      ${h.agenda ? `<div class="hearing-meta">${escAttr(h.agenda)}</div>` : ""}
      <div class="hearing-meta"><a href="${escAttr(h.sourceUrl || "https://web.senate.gov.ph/committee/calendar.asp")}" target="_blank" rel="noopener">View on senate.gov.ph →</a></div>
    </div>
  </li>`;
}

function platformCard(item, kind) {
  const cls = kind === "youtube" ? "platform-card--youtube" : kind === "reddit" ? "platform-card--reddit" : "platform-card--news";
  const tag = kind === "youtube" ? "YouTube" : kind === "reddit" ? "Reddit" : (item.source || "News");
  const sub = kind === "youtube" ? (item.channel || "") : kind === "reddit" ? `${item.subreddit || "r/Philippines"} · ${item.score || 0} pts` : (item.source || "");
  const dateRel = item.publishedAt && window.BayanAPI ? BayanAPI.relativeTime(item.publishedAt) : "";
  return `<li><a class="platform-card ${cls}" href="${escAttr(item.url)}" target="_blank" rel="noopener">
    <span class="platform-tag">${escAttr(tag)}</span>
    <div class="platform-title">${escAttr(item.title || "")}</div>
    <div class="platform-sub">${escAttr(sub)}${dateRel ? " · " + dateRel : ""}</div>
  </a></li>`;
}

const initPage = {
  home() {
    initLayout("home");

    // Render fallback content immediately so the page is never blank.
    function renderArticles(list, status) {
      const breaking = list.filter((a) => a.isBreaking);
      const hero = breaking[0] || list[0];
      if (hero) {
        $("#hero-news").innerHTML = newsCard(hero) + (status ? statusPill(status) : "");
      }
      const top = list.filter((a) => a !== hero).slice(0, 4);
      $("#top-stories").innerHTML = top.map((a) => newsCard(a)).join("");
      const trending = list.slice(0, 5);
      $("#trending").innerHTML = trending
        .map(
          (a, i) => `
        <div class="trending-item reveal">
          <span class="trending-num">${i + 1}</span>
          <div>
            <a href="${articleHref(a)}">${a.title}</a>
            <p class="meta">${escAttr(a.source || "")}${a.publishedAt ? " · " + (BayanAPI && BayanAPI.relativeTime ? BayanAPI.relativeTime(a.publishedAt) : "") : ""}</p>
          </div>
        </div>`
        )
        .join("");
      initRevealAnimations();
    }

    function statusPill(s) {
      if (!s) return "";
      const cls = s.degraded ? "is-degraded" : s.offline ? "is-offline" : "";
      return `<p class="live-pill ${cls}" style="margin-top:.75rem">${s.text}</p>`;
    }

    renderArticles(BAYAN_NEWS_FALLBACK || []);

    const featured =
      typeof BAYAN_CANDIDATES !== "undefined"
        ? BAYAN_CANDIDATES.filter((c) =>
            ["kiko-pangilinan", "robin-padilla", "risa-hontiveros", "chiz-escudero"].includes(c.slug)
          )
        : [];
    $("#featured-candidates").innerHTML = (featured.length ? featured : (BAYAN_CANDIDATES || []).slice(0, 4))
      .map(candidateCard)
      .join("");

    // "This Week in the Senate" sidebar block (non-blocking)
    if (window.BayanAPI && BayanAPI.hearings) {
      BayanAPI.hearings({ limit: 5 }).then((res) => {
        const sidebar = $("#trending")?.parentElement?.parentElement;
        if (!res || !res.ok || !res.data || !res.data.length) return;
        const html = `
          <div class="sidebar-box" style="margin-top:1.5rem">
            <h3>This Week in the Senate</h3>
            <ul class="hearings-list">
              ${res.data.slice(0, 5).map(hearingRow).join("")}
            </ul>
            <p class="meta" style="margin-top:.5rem">Source: <a href="https://web.senate.gov.ph/committee/calendar.asp" target="_blank" rel="noopener">senate.gov.ph</a> · ${BayanAPI.relativeTime(new Date().toISOString())}</p>
          </div>`;
        sidebar?.insertAdjacentHTML("beforeend", html);
      }).catch(() => {});
    }

    // Live news (rss2json + GDELT). Replaces fallback when feeds reachable.
    if (window.BayanAPI && BayanAPI.news) {
      BayanAPI.news({ limit: 30 }).then((res) => {
        if (res && res.ok && res.data && Array.isArray(res.data.items) && res.data.items.length) {
          const status = res.degraded
            ? { text: "Showing cached headlines (some live feeds unreachable)", degraded: true }
            : { text: `Live: ${res.data.items.length} stories from ${res.data.sources.ok}/${res.data.sources.total} PH outlets · updated ${BayanAPI.relativeTime(res.data.lastUpdated)}` };
          renderArticles(res.data.items, status);
        } else {
          renderArticles(BAYAN_NEWS_FALLBACK || [], { text: "Live feeds unreachable — showing sample articles", offline: true });
        }
      }).catch(() => {
        renderArticles(BAYAN_NEWS_FALLBACK || [], { text: "Live feeds unreachable — showing sample articles", offline: true });
      });
    }
  },

  news() {
    initLayout("news");
    const cat = getParam("category");
    const q = (getParam("q") || "").toLowerCase();
    const grid = $("#news-grid");
    const labelEl = $("#filter-label");

    function render(list, statusHtml) {
      let f = [...list];
      if (cat) f = f.filter((a) => a.category === cat);
      if (q) f = f.filter((a) => (a.title || "").toLowerCase().includes(q) || (a.summary || "").toLowerCase().includes(q));
      f.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      grid.innerHTML = f.length
        ? f.map((a) => newsCard(a)).join("")
        : '<p class="empty">No Philippine politics articles found in the live feeds for this filter. Try removing the filter or refresh in a few minutes.</p>';
      if (labelEl) {
        labelEl.innerHTML = (cat ? `<strong>Filter:</strong> ${CATEGORIES[cat] || cat}` : "") + (statusHtml || "");
      }
      initRevealAnimations();
    }

    // Show fallback first, then refresh from live API
    render(BAYAN_NEWS_FALLBACK || [], ' <span class="live-pill is-degraded" style="margin-left:.5rem">Loading live feeds…</span>');

    if (window.BayanAPI && BayanAPI.news) {
      BayanAPI.news({ category: cat || null, q: q || null, limit: 80 }).then((res) => {
        if (res && res.ok && res.data && res.data.items && res.data.items.length) {
          const status = ` <span class="live-pill ${res.degraded ? "is-degraded" : ""}" style="margin-left:.5rem">${res.degraded ? "Some feeds unreachable · " : "Live · "}${res.data.items.length} stories from ${res.data.sources.ok}/${res.data.sources.total} PH outlets · ${BayanAPI.relativeTime(res.data.lastUpdated)}</span>`;
          render(res.data.items, status);
        } else {
          render(BAYAN_NEWS_FALLBACK || [], ' <span class="live-pill is-offline" style="margin-left:.5rem">Live feeds unreachable — showing sample articles</span>');
        }
      }).catch(() => {
        render(BAYAN_NEWS_FALLBACK || [], ' <span class="live-pill is-offline" style="margin-left:.5rem">Live feeds unreachable — showing sample articles</span>');
      });
    }
  },

  article() {
    initLayout("news");
    const root = $("#article-root");
    const id = getParam("id");
    const url = getParam("url");

    function renderArticle(a) {
      const sourceLine = `<strong>${escAttr(a.source || "")}</strong> · ${a.publishedAt ? formatDate(a.publishedAt) : ""} · <a href="${escAttr(a.sourceUrl || "#")}" target="_blank" rel="noopener">View original</a>`;
      const sourceBlock = `
        <div class="source-list" style="margin-top:1.5rem">
          <span class="source-list-label">Source for this story</span>
          <ul style="list-style:none;padding:0;margin:0">
            <li><a href="${escAttr(a.sourceUrl || "#")}" target="_blank" rel="noopener">${escAttr(a.source || a.sourceUrl)}</a> · published ${a.publishedAt ? formatDate(a.publishedAt) : "date unknown"}</li>
          </ul>
        </div>`;
      root.innerHTML = `
        <p class="meta"><a href="news.html">News</a> / ${CATEGORIES[a.category] || a.category || "Philippine politics"}</p>
        ${a.isBreaking ? '<span class="badge-breaking" style="position:static;display:inline-block;margin:.5rem 0">Breaking</span>' : ""}
        <h1 style="font-size:2rem;margin:1rem 0">${a.title}</h1>
        <p class="meta">${sourceLine}</p>
        ${a.imageUrl ? `<img class="article-img reveal" src="${escAttr(a.imageUrl)}" referrerpolicy="no-referrer" alt="">` : ""}
        <p style="font-size:1.1rem;font-weight:500;margin:1rem 0">${a.summary || ""}</p>
        ${a.content && a.content !== a.summary ? `<p>${a.content}</p>` : ""}
        <p style="margin-top:2rem">
          <a href="${escAttr(a.sourceUrl || "#")}" class="btn btn-primary" target="_blank" rel="noopener">Read full article on ${escAttr(a.source || "source")} →</a>
        </p>
        <p class="meta" style="margin-top:1rem;font-size:.78rem;color:var(--muted)">
          BayanCheck does not republish full articles. We aggregate the headline and summary from the outlet's public RSS feed, and link to the original. Verify all claims at the source.
        </p>
        ${sourceBlock}`;
      initRevealAnimations($("#article-root") || document);
    }

    // Live mode: arrived from a live news card → fetch from BayanAPI cache
    if (url) {
      // Try to find the article in the cached live news list
      if (window.BayanAPI && BayanAPI.news) {
        BayanAPI.news({ limit: 100 }).then((res) => {
          const items = (res && res.data && res.data.items) || [];
          const found = items.find((x) => x.sourceUrl === url);
          if (found) {
            renderArticle(found);
          } else {
            // We don't have the article in cache; render a stub that links out
            renderArticle({
              title: "Open this article on its original source",
              source: (() => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return "source"; } })(),
              sourceUrl: url,
              category: "politics",
              summary: "BayanCheck couldn't load this article from the local cache. Click the button below to read it on the original source.",
              imageUrl: "",
            });
          }
        });
      } else {
        renderArticle({ title: url, source: url, sourceUrl: url, summary: "", imageUrl: "" });
      }
      return;
    }

    // Legacy fallback: id-based lookup in the static fallback array
    const a = (typeof BAYAN_NEWS_FALLBACK !== "undefined" ? BAYAN_NEWS_FALLBACK : []).find((x) => x.id === id);
    if (!a) {
      root.innerHTML = '<p class="empty">Article not found. <a href="news.html">Back to news</a></p>';
      return;
    }
    renderArticle(a);
  },

  candidates() {
    initLayout("candidates");
    if (typeof BAYAN_CANDIDATES === "undefined" || !BAYAN_CANDIDATES.length) {
      $("#candidates-list").innerHTML =
        '<p class="empty">Official roster failed to load. Ensure roster scripts are included before site.js.</p>';
      return;
    }
    const q = (getParam("q") || $("#search-q")?.value || "").toLowerCase();
    let list = BAYAN_CANDIDATES;
    if (q) list = list.filter((c) => c.fullName.toLowerCase().includes(q) || c.party.toLowerCase().includes(q) || c.position.toLowerCase().includes(q));
    $("#candidates-list").innerHTML = list.map(candidateCard).join("") || '<p class="empty">No candidates found.</p>';
    $("#search-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      location.href = "candidates.html?q=" + encodeURIComponent($("#search-q").value);
    });
    initRevealAnimations();
  },

  candidate() {
    initLayout("candidates");
    const slug = getParam("slug");
    const c = BAYAN_CANDIDATES.find((x) => x.slug === slug);
    if (!c) {
      $("#profile-root").innerHTML = '<p class="empty">Candidate not found.</p>';
      return;
    }
    const serious = c.cases.filter((x) => x.severity === "serious" && !["dismissed", "resolved"].includes(x.status));
    const pending = c.cases.filter((x) => ["pending", "under_investigation", "hearing", "allegation"].includes(x.status));
    const ini = escAttr(initialsFromName(c.fullName));
    const commons = c.photoCommonsSrcs ? ` data-commons-srcs="${escAttr(c.photoCommonsSrcs)}"` : "";
    const wikiFb = c.wiki ? ` data-wiki-fallback="${escAttr(c.wiki)}"` : "";
    const ageLine = c.age != null ? `${c.age} (born ${c.birthdate})` : c.birthdate || "See public biography";
    const yearsLine = c.yearsInPublicService != null ? c.yearsInPublicService : "See official biography";
    const eduLine = c.education.length
      ? c.education.map((e) => e.institution + (e.degree ? " — " + e.degree : "")).join("; ")
      : c.wiki
        ? `<a href="https://en.wikipedia.org/wiki/${c.wiki}" target="_blank" rel="noopener">Wikipedia biography</a>`
        : "Not listed";
    const termLine = c.term ? `<p><strong>Term:</strong> ${c.term}</p>` : "";
    const wikiLink = c.wiki
      ? `<p style="margin-top:1rem"><a href="https://en.wikipedia.org/wiki/${c.wiki}" class="btn btn-primary" target="_blank" rel="noopener">Full biography on Wikipedia →</a></p>`
      : "";
    const noCasesMsg = !c.isRealFigure
      ? "<p style='color:var(--success)'>No cases on record.</p>"
      : c.issueSeverity === "clean"
        ? "<p class='meta'>No major public-integrity flags on BayanCheck's short list. Still verify SALN, Ombudsman, and court indices.</p>"
        : `<p class="meta" style="color:var(--warning);border-left:3px solid var(--warning);padding-left:.75rem">The badge reflects widely reported controversies or legal matters — not a court ruling. BayanCheck does not host docket rows yet. Start with the <a href="https://en.wikipedia.org/wiki/${c.wiki}" target="_blank" rel="noopener">Wikipedia article</a> (especially controversies / legal sections) and follow citations to primary sources.</p>`;
    const casesHtml = (arr, title, emoji) =>
      arr.length
        ? `<h3>${emoji} ${title} (${arr.length})</h3>${arr.map((x) => `<div class="case-item"><strong>${x.title}</strong> <span class="severity ${x.severity}">${CASE_STATUS[x.status] || x.status}</span><p>${x.description}</p>${sourceLinks(x.sources)}</div>`).join("")}`
        : "";
    $("#profile-root").innerHTML = `
      <div class="profile-header container">
        <img class="profile-photo reveal" src="${c.photoUrl}" alt="${escAttr(c.fullName)}" data-initials-fallback="${ini}"${commons}${wikiFb}>
        <div class="profile-header-body">
          <h1>${c.fullName}</h1>
          <div class="profile-meta-row">
            <span>${c.position}</span>
            <span class="dot" aria-hidden="true"></span>
            <span>${c.party}</span>
            ${c.region ? '<span class="dot" aria-hidden="true"></span><span>' + c.region + '</span>' : ''}
            <span class="severity ${c.issueSeverity} severity--lg">${issueSeverityLabel(c.issueSeverity)}</span>
          </div>
          <p class="profile-summary" id="profile-summary">${c.summary}</p>
          <p class="profile-verified">Last verified: ${c.lastVerified}</p>
          ${wikiLink}
        </div>
      </div>
      <div class="container">
        <section class="profile-section"><h2>Basic Information</h2>
          <div id="profile-bio">
            <p><strong>Age:</strong> ${ageLine}</p>
            ${termLine}
            <p><strong>Years in public service:</strong> ${yearsLine}</p>
            <p><strong>Education:</strong> ${eduLine}</p>
          </div>
        </section>

        <section class="profile-section">
          <h2>Upcoming Senate Hearings</h2>
          <div id="profile-hearings">
            <p class="empty-soft">Loading from senate.gov.ph…</p>
          </div>
        </section>

        <section class="profile-section highlight"><h2>Issues & Controversies <span class="ai-badge" title="Auto-structured from public sources">AUTO</span></h2>
          <p class="meta" style="margin-bottom:1rem">All public items listed. Allegations are marked as such; verify every item against the cited source.</p>
          <div id="profile-issues">
            ${casesHtml(serious, "Serious Issues", "🔴")}
            ${casesHtml(pending, "Pending", "🟡")}
            ${!c.cases.length ? '<p class="empty-soft">Loading from Wikipedia + Philippine news sources…</p>' : ""}
          </div>
        </section>

        <section class="profile-section"><h2>Financial Disclosure (SALN)</h2>
          ${c.saln.map((s) => `<p><strong>${s.year}:</strong> Net worth ${s.netWorth}; Income: ${s.primaryIncome}</p>${sourceLinks(s.sources)}`).join("")}
        </section>

        <section class="profile-section"><h2>Bills, Projects & Career Highlights <span class="ai-badge">AUTO</span></h2>
          <div id="profile-projects">
            ${c.completedProjects.map((p) => `<div class="case-item"><h4>${p.name}</h4><p>${p.description}</p>${p.impact ? "<p>" + p.impact + "</p>" : ""}${sourceLinks(p.sources)}</div>`).join("") || '<p class="empty-soft">Loading from Wikipedia + Philippine news sources…</p>'}
          </div>
        </section>

        <section class="profile-section">
          <h2>Recent Media Coverage</h2>
          <div id="profile-coverage">
            <p class="empty-soft">Loading recent PH news mentions…</p>
          </div>
        </section>

        <section class="profile-section">
          <h2>Multi-platform Mentions</h2>
          <p class="meta" style="margin-bottom:.5rem">Aggregated from public sources beyond traditional news. Facebook is intentionally excluded — Meta forbids scraping and what those scrapers return is what the candidate's PR team chose to post (i.e. not unbiased). Add a YouTube API key in BayanBot → settings to enable the YouTube row.</p>
          <div id="profile-platforms">
            <p class="empty-soft">Loading…</p>
          </div>
        </section>

        <p style="margin:2rem 0"><a href="compare.html">Compare candidates</a> · <a href="candidates.html">← All candidates</a></p>
      </div>`;
    initRevealAnimations($("#profile-root") || document);

    // ----- Live enrichment -----
    if (window.BayanAPI && BayanAPI.candidateProfile) {
      BayanAPI.candidateProfile(slug).then((res) => {
        if (!res || !res.ok || !res.data) return;
        const d = res.data;

        // Bio: replace summary + add Wikipedia extract if our static one is the placeholder
        if (d.biography && d.biography.summary) {
          const sumEl = document.getElementById("profile-summary");
          if (sumEl && /Profile summary from public election records/.test(sumEl.textContent || "")) {
            sumEl.textContent = d.biography.summary.split(/(?<=\.)\s/).slice(0, 3).join(" ");
          }
        }

        // Hearings
        const hEl = document.getElementById("profile-hearings");
        if (hEl) {
          if (d.upcomingHearings && d.upcomingHearings.length) {
            hEl.innerHTML = `
              <ul class="hearings-list">${d.upcomingHearings.slice(0, 8).map(hearingRow).join("")}</ul>
              <p class="meta" style="margin-top:.5rem">Source: <a href="https://web.senate.gov.ph/committee/calendar.asp" target="_blank" rel="noopener">senate.gov.ph</a> committee calendar · live-fetched ${BayanAPI.relativeTime(d.lastFetched)}</p>`;
          } else {
            hEl.innerHTML = `<p class="empty-soft">No upcoming hearings on file for this senator's committees in the Senate calendar (next 30 days). <a href="https://web.senate.gov.ph/committee/calendar.asp" target="_blank" rel="noopener">View full calendar →</a></p>`;
          }
        }

        // Issues
        const iEl = document.getElementById("profile-issues");
        if (iEl) {
          if (d.issues && d.issues.length) {
            iEl.innerHTML = d.issues.map((it) => `
              <div class="case-item">
                <h4>${escAttr(it.title)} <span class="severity ${it.severity || "pending"}">${(it.severity || "pending") === "serious" ? "Serious" : "Public issue"}</span></h4>
                <p>${escAttr(it.description)}</p>
                ${sourceLinks(it.sources)}
              </div>`).join("");
          } else if (!c.cases.length) {
            iEl.innerHTML = `<p class="empty-soft">No publicly documented issues found on Wikipedia or in the recent PH news net for this candidate, as of ${formatDate(d.lastFetched)}. This does not mean none exist — please continue to verify via <a href="https://en.wikipedia.org/wiki/${escAttr(d.wikiTitle)}" target="_blank" rel="noopener">Wikipedia</a> and <a href="https://www.ombudsman.gov.ph/" target="_blank" rel="noopener">Ombudsman</a>.</p>`;
          }
        }

        // Projects
        const pEl = document.getElementById("profile-projects");
        if (pEl) {
          if (d.projects && d.projects.length) {
            pEl.innerHTML = d.projects.map((p) => `
              <div class="case-item">
                <h4>${escAttr(p.name)}</h4>
                <p>${escAttr(p.description)}</p>
                ${sourceLinks(p.sources)}
              </div>`).join("");
          } else if (!c.completedProjects.length) {
            pEl.innerHTML = `<p class="empty-soft">No bills, projects, or career-highlight sections found on this candidate's Wikipedia article. Verify on the <a href="https://www.senate.gov.ph/" target="_blank" rel="noopener">Senate of the Philippines</a> bills directory.</p>`;
          }
        }

        // Recent coverage
        const cEl = document.getElementById("profile-coverage");
        if (cEl) {
          if (d.recentNews && d.recentNews.length) {
            cEl.innerHTML = `
              <ul class="coverage-list">
                ${d.recentNews.slice(0, 8).map((n) => `
                  <li>
                    <span class="coverage-source">${escAttr(n.source || "News")}</span>
                    <a href="${escAttr(n.sourceUrl)}" target="_blank" rel="noopener">${escAttr(n.title)}</a>
                    <span class="coverage-date">${BayanAPI.relativeTime(n.publishedAt)}</span>
                  </li>`).join("")}
              </ul>
              <p class="meta" style="margin-top:.5rem">Source: GDELT 2.0 (filtered to <code>sourcecountry:PH</code>)</p>`;
          } else {
            cEl.innerHTML = `<p class="empty-soft">No recent PH-news mentions surfaced via GDELT in the last fetch.</p>`;
          }
        }

        // Multi-platform
        const plEl = document.getElementById("profile-platforms");
        if (plEl) {
          const blocks = [];
          if (d.youtube && d.youtube.length) {
            blocks.push(`<h3 style="font-size:1rem;margin:.75rem 0 .35rem">YouTube</h3>
              <ul class="platform-list">${d.youtube.slice(0, 6).map((y) => platformCard(y, "youtube")).join("")}</ul>`);
          }
          if (d.reddit && d.reddit.length) {
            blocks.push(`<h3 style="font-size:1rem;margin:.75rem 0 .35rem">r/Philippines discussion</h3>
              <ul class="platform-list">${d.reddit.slice(0, 6).map((r) => platformCard(r, "reddit")).join("")}</ul>`);
          }
          if (!blocks.length) {
            plEl.innerHTML = `<p class="empty-soft">No off-news mentions surfaced. (Reddit search is on automatically; YouTube needs a free API key in BayanBot → settings.)</p>`;
          } else {
            plEl.innerHTML = blocks.join("");
          }
        }
      }).catch(() => {
        // graceful: leave initial fallback content as-is
      });
    }
  },

  compare() {
    initLayout("compare");
    const ids = (getParam("ids") || "").split(",").filter(Boolean);
    let selected = ids.length ? BAYAN_CANDIDATES.filter((c) => ids.includes(c.id)) : BAYAN_CANDIDATES.slice(0, 2);
    $("#compare-picks").innerHTML = BAYAN_CANDIDATES.map(
      (c) => `<button type="button" class="btn ${selected.find((s) => s.id === c.id) ? "btn-primary" : ""}" data-id="${c.id}" style="margin:.25rem">${c.fullName.split(" ").pop()}</button>`
    ).join("");
    function renderTable() {
      if (!selected.length) return;
      const rows = [
        ["Position", (c) => c.position],
        ["Party", (c) => c.party],
        ["Term", (c) => c.term || "—"],
        ["Age", (c) => (c.age != null ? String(c.age) : "—")],
        ["Issue level", (c) => issueSeverityLabel(c.issueSeverity)],
        ["Serious cases", (c) => String(c.cases.filter((x) => x.severity === "serious" && !["dismissed", "resolved"].includes(x.status)).length)],
        ["Net worth", (c) => c.saln[0]?.netWorth || "N/A"],
      ];
      $("#compare-table").innerHTML = `<table class="compare-table"><thead><tr><th></th>${selected.map((c) => `<th><a href="candidate.html?slug=${c.slug}">${c.fullName}</a></th>`).join("")}</tr></thead><tbody>${rows.map(([label, fn]) => `<tr><td><strong>${label}</strong></td>${selected.map((c) => `<td>${fn(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    }
    renderTable();
    $("#compare-picks").addEventListener("click", (e) => {
      const id = e.target.dataset?.id;
      if (!id) return;
      const idx = selected.findIndex((c) => c.id === id);
      if (idx >= 0) selected.splice(idx, 1);
      else if (selected.length < 3) selected.push(BAYAN_CANDIDATES.find((c) => c.id === id));
      renderTable();
    });
    initRevealAnimations();
  },

  faq() {
    initLayout("faq");
    initRevealAnimations();
  },

  about() {
    initLayout("about");
    initRevealAnimations();
  },

  elections() {
    initLayout("elections");
    initRevealAnimations();
  },

  roster() {
    initLayout("roster");
    const grid = $("#roster-senate");
    const houseGrid = $("#roster-house");
    const qInput = $("#roster-q");
    const countEl = $("#roster-count");
    if (!grid || typeof BAYAN_SENATE_ROSTER === "undefined") return;

    let cohortFilter = "all";

    function rosterImgHtml(alt, wikiTitle, entry) {
      const pipe = escAttr(rosterCommonsPipe(entry));
      const first = commonsPhotoUrl(entry.photoFile);
      return `<img src="${first}" alt="${escAttr(alt)}" width="132" height="132" loading="lazy" data-commons-srcs="${pipe}" data-wiki-fallback="${escAttr(wikiTitle)}">`;
    }

    function rosterCardSenator(s) {
      const wiki = `https://en.wikipedia.org/wiki/${s.wiki}`;
      const img = rosterImgHtml(s.displayName, s.wiki, s);
      return `
      <article class="roster-card reveal" data-cohort="${s.cohort}" data-name="${(s.displayName + " " + s.party).toLowerCase()}">
        <a href="${wiki}" target="_blank" rel="noopener" class="roster-card-photo">
          ${img}
        </a>
        <div class="roster-card-body">
          <h3><a href="${wiki}" target="_blank" rel="noopener">${s.displayName}</a></h3>
          <p class="meta">${s.party}</p>
          <p class="meta">Senate · ${s.term}</p>
        </div>
      </article>`;
    }

    function rosterCardHouse(h) {
      const wiki = `https://en.wikipedia.org/wiki/${h.wiki}`;
      const img = rosterImgHtml(h.displayName, h.wiki, h);
      return `
      <article class="roster-card reveal">
        <a href="${wiki}" target="_blank" rel="noopener" class="roster-card-photo">
          ${img}
        </a>
        <div class="roster-card-body">
          <p class="meta">${h.role}</p>
          <h3><a href="${wiki}" target="_blank" rel="noopener">${h.displayName}</a></h3>
          <p class="meta roster-house-note">${h.note}</p>
        </div>
      </article>`;
    }

    function applyFilters() {
      const q = (qInput?.value || "").toLowerCase().trim();
      const cards = grid.querySelectorAll(".roster-card");
      let visible = 0;
      cards.forEach((el) => {
        const ch = String(el.dataset.cohort || "");
        const name = (el.dataset.name || "").toLowerCase();
        const okCohort = cohortFilter === "all" || ch === cohortFilter;
        const okQ = !q || name.includes(q);
        const show = okCohort && okQ;
        el.style.display = show ? "" : "none";
        if (show) visible += 1;
      });
      if (countEl) countEl.textContent = `Showing ${visible} of ${BAYAN_SENATE_ROSTER.length} senators.`;
    }

    grid.innerHTML = BAYAN_SENATE_ROSTER.map(rosterCardSenator).join("");
    if (houseGrid && typeof BAYAN_HOUSE_LEADERSHIP !== "undefined") {
      houseGrid.innerHTML = BAYAN_HOUSE_LEADERSHIP.map(rosterCardHouse).join("");
    }

    document.querySelectorAll(".roster-filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".roster-filter").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        cohortFilter = btn.dataset.filter || "all";
        applyFilters();
      });
    });

    qInput?.addEventListener("input", applyFilters);
    applyFilters();
    initRevealAnimations();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  initBayanImageFallbacks();
  const page = document.body.dataset.page;
  if (initPage[page]) initPage[page]();
});
