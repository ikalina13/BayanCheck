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

function newsCard(a, featured) {
  const breaking = a.isBreaking ? '<span class="badge-breaking">Breaking</span>' : "";
  return `
  <article class="news-card reveal">
    <div class="news-card-thumb">
      ${breaking}
      <a href="article.html?id=${a.id}"><img src="${a.imageUrl}" alt="" loading="lazy"></a>
    </div>
    <div class="news-card-body">
      <p class="meta"><span class="cat">${CATEGORIES[a.category] || a.category}</span> · ${a.source} · ${formatDate(a.publishedAt)}</p>
      <h3><a href="article.html?id=${a.id}">${a.title}</a></h3>
      <p class="news-card-summary">${a.summary}</p>
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
  return `<ul class="source-list">${sources.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.label}</a> <span class="meta">(${s.accessedAt})</span></li>`).join("")}</ul>`;
}

const initPage = {
  home() {
    initLayout("home");
    const breaking = BAYAN_NEWS.filter((a) => a.isBreaking);
    const hero = breaking[0] || BAYAN_NEWS[0];
    const trending = [...BAYAN_NEWS].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
    $("#hero-news").innerHTML = newsCard(hero);
    $("#top-stories").innerHTML = BAYAN_NEWS.slice(1, 5).map((a) => newsCard(a)).join("");
    $("#trending").innerHTML = trending
      .map(
        (a, i) => `
      <div class="trending-item reveal">
        <span class="trending-num">${i + 1}</span>
        <div><a href="article.html?id=${a.id}">${a.title}</a><p class="meta">${a.viewCount.toLocaleString()} views</p></div>
      </div>`
      )
      .join("");
    const featured =
      typeof BAYAN_CANDIDATES !== "undefined"
        ? BAYAN_CANDIDATES.filter((c) =>
            ["kiko-pangilinan", "robin-padilla", "risa-hontiveros", "chiz-escudero"].includes(c.slug)
          )
        : [];
    $("#featured-candidates").innerHTML = (featured.length ? featured : BAYAN_CANDIDATES.slice(0, 4))
      .map(candidateCard)
      .join("");
    initRevealAnimations();
  },

  news() {
    initLayout("news");
    const cat = getParam("category");
    const q = (getParam("q") || "").toLowerCase();
    let list = [...BAYAN_NEWS];
    if (cat) list = list.filter((a) => a.category === cat);
    if (q) list = list.filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
    list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    $("#news-grid").innerHTML = list.length ? list.map((a) => newsCard(a)).join("") : '<p class="empty">No articles found.</p>';
    if (cat) $("#filter-label").textContent = "Showing: " + (CATEGORIES[cat] || cat);
    initRevealAnimations();
  },

  article() {
    initLayout("news");
    const id = getParam("id");
    const a = BAYAN_NEWS.find((x) => x.id === id);
    if (!a) {
      $("#article-root").innerHTML = '<p class="empty">Article not found. <a href="news.html">Back to news</a></p>';
      return;
    }
    $("#article-root").innerHTML = `
      <p class="meta"><a href="news.html">News</a> / ${CATEGORIES[a.category] || a.category}</p>
      ${a.isBreaking ? '<span class="badge-breaking" style="position:static;display:inline-block;margin:.5rem 0">Breaking</span>' : ""}
      <h1 style="font-size:2rem;margin:1rem 0">${a.title}</h1>
      <p class="meta"><strong>${a.source}</strong> · ${formatDate(a.publishedAt)}</p>
      <img class="article-img reveal" src="${a.imageUrl}" alt="">
      <p style="font-size:1.1rem;font-weight:500;margin:1rem 0">${a.summary}</p>
      <p>${a.content}</p>
      <p style="margin-top:2rem"><a href="${a.sourceUrl}" class="btn btn-primary" target="_blank" rel="noopener">Read on ${a.source} →</a></p>`;
    initRevealAnimations($("#article-root") || document);
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
          <p class="profile-summary">${c.summary}</p>
          <p class="profile-verified">Last verified: ${c.lastVerified}</p>
          ${wikiLink}
        </div>
      </div>
      <div class="container">
        <section class="profile-section"><h2>Basic Information</h2>
          <p><strong>Age:</strong> ${ageLine}</p>
          ${termLine}
          <p><strong>Years in public service:</strong> ${yearsLine}</p>
          <p><strong>Education:</strong> ${eduLine}</p>
        </section>
        <section class="profile-section highlight"><h2>Issues & Controversies</h2>
          <p class="meta" style="margin-bottom:1rem">All public cases listed. Allegations are marked; outcomes shown when available.</p>
          ${casesHtml(serious, "Serious Issues", "🔴")}
          ${casesHtml(pending, "Pending", "🟡")}
          ${!c.cases.length ? noCasesMsg : ""}
        </section>
        <section class="profile-section"><h2>Financial Disclosure (SALN)</h2>
          ${c.saln.map((s) => `<p><strong>${s.year}:</strong> Net worth ${s.netWorth}; Income: ${s.primaryIncome}</p>${sourceLinks(s.sources)}`).join("")}
        </section>
        <section class="profile-section"><h2>Completed Projects</h2>
          ${c.completedProjects.map((p) => `<div class="case-item"><strong>${p.name}</strong><p>${p.description}</p>${p.impact ? "<p>" + p.impact + "</p>" : ""}${sourceLinks(p.sources)}</div>`).join("") || "<p class='meta'>None listed.</p>"}
        </section>
        <p style="margin:2rem 0"><a href="compare.html">Compare candidates</a> · <a href="candidates.html">← All candidates</a></p>
      </div>`;
    initRevealAnimations($("#profile-root") || document);
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
