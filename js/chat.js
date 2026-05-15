/* BayanCheck — BayanBot floating chat assistant.
 *
 * Pure browser code. The user supplies their own Anthropic (default) or
 * OpenAI key. Keys live in localStorage only and are sent ONLY to the
 * official API endpoint of each provider.
 *
 * Three layers of "Filipino politics only" enforcement:
 *  (1) System prompt forbids non-PH-politics topics + endorsements
 *  (2) Client-side topic guard on the user's prompt (BayanFilter)
 *  (3) Citation whitelist on the model's response — if it cites a non-PH
 *      source we add a warning footer
 *
 * "100% unbiased AI" honesty: NO AI is fully unbiased. We mitigate by
 * forcing citations, refusing endorsements, restricting context, and
 * surfacing this caveat permanently in the chat UI.
 */
(function (global) {
  "use strict";

  const SUGGESTIONS = [
    "What committees does this senator chair?",
    "Summarize the public controversies, with sources.",
    "When are this senator's upcoming hearings?",
    "Who authored the latest budget bill?",
    "Explain the impeachment process in the Philippines.",
    "Who should I vote for in 2025?",
  ];

  const STORE = {
    open: "bayan_chat_open",
    msgs: "bayan_chat_msgs", // sessionStorage
  };

  // Mount the FAB and panel into <body>. Idempotent.
  function mount() {
    if (document.getElementById("bayanbot-root")) return;
    const root = document.createElement("div");
    root.id = "bayanbot-root";
    root.innerHTML = `
      <button class="bayanbot-fab has-pulse" id="bayanbot-fab"
        aria-label="Open BayanBot chat" aria-expanded="false" title="Ask BayanBot">
        <span aria-hidden="true">💬</span>
      </button>
      <section class="bayanbot-panel" id="bayanbot-panel" role="dialog"
        aria-label="BayanBot chat" aria-modal="false">
        <header class="bayanbot-header">
          <div class="bayanbot-header-row">
            <div class="bayanbot-title">
              <span class="bayanbot-title-icon" aria-hidden="true">🤖</span>
              BayanBot
            </div>
            <div style="display:flex;gap:.3rem">
              <button class="bayanbot-icon-btn" id="bayanbot-settings-btn" aria-label="Settings" title="Settings">⚙</button>
              <button class="bayanbot-icon-btn" id="bayanbot-close-btn" aria-label="Close chat" title="Close">✕</button>
            </div>
          </div>
          <div class="bayanbot-subtitle">
            Free PH voter-info AI · cites every claim · won't endorse candidates
          </div>
          <div id="bayanbot-context-pill-wrap"></div>
          <div class="bayanbot-settings" id="bayanbot-settings" role="dialog" aria-label="BayanBot settings">
            <h5>Chat model</h5>
            <label for="bayanbot-model">Preferred chat model</label>
            <select id="bayanbot-model">
              <option value="pollinations">Pollinations (free · no key needed · default)</option>
              <option value="gemini-1.5-flash-latest">Google Gemini 1.5 Flash (free key)</option>
              <option value="gemini-1.5-pro-latest">Google Gemini 1.5 Pro (free key)</option>
              <option value="llama-3.1-70b-versatile">Groq · Llama 3.1 70B (free key, fast)</option>
              <option value="llama-3.1-8b-instant">Groq · Llama 3.1 8B (free key, fastest)</option>
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (paid)</option>
              <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (paid)</option>
              <option value="gpt-4o-mini">OpenAI GPT-4o mini (paid)</option>
              <option value="gpt-4o">OpenAI GPT-4o (paid)</option>
            </select>
            <small>Pollinations is free and works instantly — no key, no signup. The other free options need a free API key.</small>

            <h5 style="margin-top:.85rem">API keys (optional, stored in this browser only)</h5>

            <label for="bayanbot-key-gemini">Google Gemini key (FREE)</label>
            <input type="password" id="bayanbot-key-gemini" autocomplete="off" placeholder="AIza…">
            <small><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Get a free Gemini key →</a> (no credit card needed)</small>

            <label for="bayanbot-key-groq">Groq key (FREE, very fast)</label>
            <input type="password" id="bayanbot-key-groq" autocomplete="off" placeholder="gsk_…">
            <small><a href="https://console.groq.com/keys" target="_blank" rel="noopener">Get a free Groq key →</a></small>

            <label for="bayanbot-key-anthropic">Anthropic Claude key (paid)</label>
            <input type="password" id="bayanbot-key-anthropic" autocomplete="off" placeholder="sk-ant-…">
            <small><a href="https://console.anthropic.com/" target="_blank" rel="noopener">Get a Claude key →</a></small>

            <label for="bayanbot-key-openai">OpenAI key (paid)</label>
            <input type="password" id="bayanbot-key-openai" autocomplete="off" placeholder="sk-…">
            <small><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">Get an OpenAI key →</a></small>

            <label for="bayanbot-key-youtube">YouTube Data API key (optional)</label>
            <input type="password" id="bayanbot-key-youtube" autocomplete="off" placeholder="AIza…">
            <small><a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener">Get a YouTube key →</a></small>

            <label for="bayanbot-key-rss2json">rss2json key (optional, raises news quota)</label>
            <input type="password" id="bayanbot-key-rss2json" autocomplete="off" placeholder="">

            <label for="bayanbot-strictness">Topic strictness (PH politics filter)</label>
            <select id="bayanbot-strictness">
              <option value="loose">Loose — accept anything PH-related</option>
              <option value="standard" selected>Standard — recommended</option>
              <option value="strict">Strict — only obvious PH-politics items</option>
            </select>
            <div class="bayanbot-settings-actions">
              <button type="button" id="bayanbot-clear-keys">Clear keys</button>
              <button type="button" class="is-primary" id="bayanbot-save-keys">Save</button>
            </div>
            <small style="margin-top:.6rem;display:block">Keys are stored in this browser's localStorage only. They're sent ONLY to the official API endpoint of each provider. BayanCheck never sees them.</small>
          </div>
        </header>
        <div class="bayanbot-body" id="bayanbot-body">
          <!-- messages render here -->
        </div>
        <form class="bayanbot-input-row" id="bayanbot-form">
          <textarea class="bayanbot-input" id="bayanbot-input" rows="1" placeholder="Ask about a senator, bill, or hearing…" autocomplete="off"></textarea>
          <button type="submit" class="bayanbot-send" id="bayanbot-send" aria-label="Send">Send</button>
        </form>
        <div class="bayanbot-footer-note">
          AI is not 100% unbiased. Always verify against the cited sources.
        </div>
      </section>`;
    document.body.appendChild(root);

    bind();
    if (localStorage.getItem(STORE.open) === "1") openPanel(true);
    renderMessages();
  }

  let messages = []; // {role: 'user'|'assistant'|'system', content, sources?}

  function loadMessages() {
    try {
      const raw = sessionStorage.getItem(STORE.msgs);
      if (!raw) {
        messages = [];
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) messages = parsed;
    } catch (e) {
      messages = [];
    }
  }

  function saveMessages() {
    try {
      sessionStorage.setItem(STORE.msgs, JSON.stringify(messages.slice(-30)));
    } catch (e) {}
  }

  function bind() {
    const fab = document.getElementById("bayanbot-fab");
    const close = document.getElementById("bayanbot-close-btn");
    const settingsBtn = document.getElementById("bayanbot-settings-btn");
    const settingsPanel = document.getElementById("bayanbot-settings");
    const form = document.getElementById("bayanbot-form");
    const input = document.getElementById("bayanbot-input");

    fab.addEventListener("click", () => openPanel());
    close.addEventListener("click", () => closePanel());
    settingsBtn.addEventListener("click", () => {
      settingsPanel.classList.toggle("is-open");
      if (settingsPanel.classList.contains("is-open")) hydrateSettings();
    });

    document.getElementById("bayanbot-save-keys").addEventListener("click", saveSettings);
    document.getElementById("bayanbot-clear-keys").addEventListener("click", () => {
      if (!confirm("Clear all stored API keys from this browser?")) return;
      global.BayanKeys.clearAll();
      hydrateSettings();
      addSystem("Keys cleared from this browser.");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      input.style.height = "auto";
      handleSend(text);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 128) + "px";
    });

    // Click-outside closes settings popup
    document.addEventListener("click", (e) => {
      if (!settingsPanel.classList.contains("is-open")) return;
      if (settingsPanel.contains(e.target) || settingsBtn.contains(e.target)) return;
      settingsPanel.classList.remove("is-open");
    });
  }

  function openPanel(silent) {
    const fab = document.getElementById("bayanbot-fab");
    const panel = document.getElementById("bayanbot-panel");
    panel.classList.add("is-open");
    fab.setAttribute("aria-expanded", "true");
    fab.classList.remove("has-pulse");
    try { localStorage.setItem(STORE.open, "1"); } catch (e) {}
    if (!silent) {
      setTimeout(() => document.getElementById("bayanbot-input")?.focus(), 60);
    }
    updateContextPill();
  }

  function closePanel() {
    const fab = document.getElementById("bayanbot-fab");
    const panel = document.getElementById("bayanbot-panel");
    panel.classList.remove("is-open");
    fab.setAttribute("aria-expanded", "false");
    document.getElementById("bayanbot-settings").classList.remove("is-open");
    try { localStorage.setItem(STORE.open, "0"); } catch (e) {}
  }

  function hydrateSettings() {
    const k = global.BayanKeys;
    document.getElementById("bayanbot-key-gemini").value = k.get("gemini") || "";
    document.getElementById("bayanbot-key-groq").value = k.get("groq") || "";
    document.getElementById("bayanbot-key-anthropic").value = k.get("anthropic") || "";
    document.getElementById("bayanbot-key-openai").value = k.get("openai") || "";
    document.getElementById("bayanbot-key-youtube").value = k.get("youtube") || "";
    document.getElementById("bayanbot-key-rss2json").value = k.get("rss2json") || "";
    document.getElementById("bayanbot-strictness").value = k.get("strictness") || "standard";
    document.getElementById("bayanbot-model").value = k.get("chatModel") || "pollinations";
  }

  function saveSettings() {
    const k = global.BayanKeys;
    k.set("gemini", document.getElementById("bayanbot-key-gemini").value.trim());
    k.set("groq", document.getElementById("bayanbot-key-groq").value.trim());
    k.set("anthropic", document.getElementById("bayanbot-key-anthropic").value.trim());
    k.set("openai", document.getElementById("bayanbot-key-openai").value.trim());
    k.set("youtube", document.getElementById("bayanbot-key-youtube").value.trim());
    k.set("rss2json", document.getElementById("bayanbot-key-rss2json").value.trim());
    k.set("strictness", document.getElementById("bayanbot-strictness").value);
    k.set("chatModel", document.getElementById("bayanbot-model").value);
    document.getElementById("bayanbot-settings").classList.remove("is-open");
    const provider = k.chatProvider();
    addSystem("Saved. Active model: " + (provider ? provider.provider + (provider.model ? " (" + provider.model + ")" : "") : "none"));
    renderMessages();
  }

  function getCurrentCandidateSlug() {
    const body = document.body;
    if (body && body.dataset && body.dataset.page === "candidate") {
      const params = new URLSearchParams(window.location.search);
      return params.get("slug");
    }
    return null;
  }

  function updateContextPill() {
    const wrap = document.getElementById("bayanbot-context-pill-wrap");
    if (!wrap) return;
    const slug = getCurrentCandidateSlug();
    const cand =
      slug && global.BAYAN_CANDIDATES
        ? global.BAYAN_CANDIDATES.find((c) => c.slug === slug)
        : null;
    if (cand) {
      wrap.innerHTML = `<span class="bayanbot-context-pill" title="BayanBot has loaded this candidate's public profile">📌 Context: ${escapeHtml(cand.fullName)}</span>`;
    } else {
      wrap.innerHTML = "";
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(s) {
    return escapeHtml(s);
  }

  // Lightweight Markdown → HTML (paragraphs, bold, italics, code, lists, links, [n] footnotes).
  function mdToHtml(md) {
    if (!md) return "";
    let s = escapeHtml(md);
    // code spans
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    // bold + italic
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s_])_([^_]+)_(?=[\s.,!?]|$)/g, "$1<em>$2</em>");
    // links [text](url)
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // numeric citations: [1], [2] → superscript
    s = s.replace(/\[(\d+)\]/g, '<sup><a href="#bayanbot-cite-$1" class="bayanbot-cite-ref">$1</a></sup>');
    // bullet lists
    const lines = s.split(/\n/);
    let out = [];
    let inList = false;
    let inOl = false;
    for (let line of lines) {
      const ulm = line.match(/^\s*[-*]\s+(.*)$/);
      const olm = line.match(/^\s*\d+\.\s+(.*)$/);
      if (ulm) {
        if (!inList) { out.push("<ul>"); inList = true; }
        if (inOl) { out.push("</ol>"); inOl = false; }
        out.push("<li>" + ulm[1] + "</li>");
      } else if (olm) {
        if (!inOl) { out.push("<ol>"); inOl = true; }
        if (inList) { out.push("</ul>"); inList = false; }
        out.push("<li>" + olm[1] + "</li>");
      } else {
        if (inList) { out.push("</ul>"); inList = false; }
        if (inOl) { out.push("</ol>"); inOl = false; }
        if (line.trim() === "") out.push("");
        else out.push("<p>" + line + "</p>");
      }
    }
    if (inList) out.push("</ul>");
    if (inOl) out.push("</ol>");
    return out.join("\n");
  }

  function extractCitations(text) {
    const urls = Array.from(text.matchAll(/(https?:\/\/[^\s)\]]+)/g)).map((m) => m[1]);
    const seen = new Set();
    const uniq = [];
    for (const u of urls) {
      const cleaned = u.replace(/[.,;]+$/, "");
      if (seen.has(cleaned)) continue;
      seen.add(cleaned);
      uniq.push(cleaned);
    }
    return uniq;
  }

  function citationDomain(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch (e) { return url; }
  }

  function renderMessages() {
    const body = document.getElementById("bayanbot-body");
    if (!body) return;
    if (!messages.length) {
      body.innerHTML = renderEmptyState();
      bindSuggestions();
      return;
    }
    body.innerHTML = messages.map(renderMsg).join("");
    body.scrollTop = body.scrollHeight;
  }

  function renderEmptyState() {
    const provider = global.BayanKeys.chatProvider();
    const slug = getCurrentCandidateSlug();
    const intro = slug
      ? `Ask anything about <strong>${(global.BAYAN_CANDIDATES || []).find((c) => c.slug === slug)?.fullName || "this candidate"}</strong> — I've already loaded their public profile.`
      : "Ask anything about Philippine politics, senators, bills, or upcoming Senate hearings.";
    const sugs = SUGGESTIONS.map(
      (s) => `<button type="button" class="bayanbot-suggestion" data-suggestion="${escapeAttr(s)}">${escapeHtml(s)}</button>`
    ).join("");
    const modelLabel =
      provider.provider === "pollinations"
        ? "Pollinations (free, no key needed)"
        : provider.provider === "gemini"
          ? "Google Gemini (your free key)"
          : provider.provider === "groq"
            ? "Groq (your free key)"
            : provider.provider === "anthropic"
              ? "Anthropic Claude (your key)"
              : "OpenAI (your key)";
    return `
      <div class="bayanbot-empty">
        <div class="bayanbot-empty-emoji">🇵🇭</div>
        <div class="bayanbot-empty-title">Ready</div>
        <div class="bayanbot-empty-text">${intro}</div>
        <div class="bayanbot-suggestions">${sugs}</div>
        <p style="font-size:.7rem;color:var(--muted);margin-top:.75rem">
          Active model: <strong>${escapeHtml(modelLabel)}</strong>. Want better quality? Add a free Gemini or Groq key in ⚙ Settings.
        </p>
      </div>`;
  }

  function bindSuggestions() {
    document.querySelectorAll(".bayanbot-suggestion").forEach((btn) => {
      btn.addEventListener("click", () => {
        handleSend(btn.dataset.suggestion);
      });
    });
  }

  function renderMsg(m) {
    if (m.role === "system") {
      return `<div class="bayanbot-msg is-system">${escapeHtml(m.content)}</div>`;
    }
    if (m.role === "user") {
      return `<div class="bayanbot-msg is-user">${escapeHtml(m.content)}</div>`;
    }
    let body = mdToHtml(m.content || "");
    let sourcesHtml = "";
    const cites = m.sources || extractCitations(m.content || "");
    if (cites && cites.length) {
      sourcesHtml = `<div class="bayanbot-msg-sources">
        <strong>Sources</strong>
        <ol>${cites.map((u, i) => `<li id="bayanbot-cite-${i + 1}"><a href="${escapeAttr(u)}" target="_blank" rel="noopener">${escapeHtml(citationDomain(u))}</a></li>`).join("")}</ol>
      </div>`;
    }
    if (m.streaming) {
      body += `<div class="bayanbot-typing" aria-label="Assistant is typing"><span></span><span></span><span></span></div>`;
    }
    if (m.error) {
      body += `<div class="bayanbot-error">${escapeHtml(m.error)}</div>`;
    }
    return `<div class="bayanbot-msg is-assistant">${body}${sourcesHtml}</div>`;
  }

  function addSystem(text) {
    messages.push({ role: "system", content: text });
    renderMessages();
    saveMessages();
  }

  function addUser(text) {
    messages.push({ role: "user", content: text });
    renderMessages();
    saveMessages();
  }

  function startAssistant() {
    const m = { role: "assistant", content: "", streaming: true, sources: [] };
    messages.push(m);
    renderMessages();
    return m;
  }

  function finishAssistant(m, errorMsg) {
    m.streaming = false;
    if (errorMsg) m.error = errorMsg;
    if (m.content) m.sources = extractCitations(m.content);
    saveMessages();
    renderMessages();
  }

  function buildSystemPrompt(candidateContext, hearingsContext, newsContext) {
    let ctx = "";
    if (candidateContext) {
      ctx += "\n\n=== CANDIDATE CONTEXT ===\n" + JSON.stringify(candidateContext, null, 0).slice(0, 8000);
    }
    if (hearingsContext && hearingsContext.length) {
      ctx += "\n\n=== UPCOMING SENATE HEARINGS (next 30 days) ===\n" +
        hearingsContext.slice(0, 12).map((h) => `${h.rawDate || h.date} — ${h.committee} — ${h.agenda || ""} (${h.sourceUrl})`).join("\n");
    }
    if (newsContext && newsContext.length) {
      ctx += "\n\n=== RECENT PHILIPPINE NEWS HEADLINES ===\n" +
        newsContext.slice(0, 18).map((n) => `${n.publishedAt} — ${n.source}: ${n.title} (${n.sourceUrl})`).join("\n");
    }
    return [
      "You are BayanBot, a neutral Philippine voter-education assistant for the BayanCheck site.",
      "",
      "HARD RULES (you MUST follow all of these):",
      "1. ONLY answer questions about Philippine / Filipino politics, government, elections, public officials, civic processes, COMELEC, Senate, House, the Cabinet, and related public-policy topics. If the user asks about anything else (sports, entertainment, foreign politics unrelated to PH, personal advice, etc.), politely refuse and offer to help with PH-politics topics.",
      "2. CITE A SOURCE URL for every factual claim. Use inline numeric markers like [1], [2], and ALWAYS list the URLs at the end of your message as a numbered list. Sources MUST come from the supplied context (Wikipedia, senate.gov.ph, congress.gov.ph, comelec.gov.ph, rappler.com, inquirer.net, abs-cbn.com, gmanetwork.com, mb.com.ph, philstar.com, verafiles.org, or other reputable PH sources). Do NOT invent URLs.",
      "3. NEVER endorse, rank, recommend, or rate candidates. If asked 'who should I vote for' or 'who is better,' respond exactly: \"I can describe each candidate's record from cited sources, but I won't recommend a vote — that's your decision.\" Then offer to summarize each candidate's record.",
      "4. Use ONLY facts present in the Context blocks below. If something isn't in context, say so honestly and link to a verification source (Wikipedia, COMELEC, senate.gov.ph, congress.gov.ph). Do NOT speculate.",
      "5. Treat allegations and ongoing cases as such — never as established fact. Use language like 'reportedly,' 'allegedly,' 'pending case,' as appropriate.",
      "6. Be concise (≤ 200 words) unless the user asks for more.",
      "7. Respond in the same language the user wrote in (Filipino, Tagalog, Bisaya, or English).",
      "8. NEVER generate fake quotes, fake statistics, fake bill numbers, or fake court rulings.",
      "",
      "DISCLAIMER you may surface when relevant: 'AI assistants are not 100% unbiased. Verify everything via the cited sources.'",
      ctx,
    ].join("\n");
  }

  async function handleSend(text) {
    const provider = global.BayanKeys.chatProvider();
    if (!provider) {
      // Should never happen — chatProvider() always falls back to free Pollinations
      addSystem("No chat provider available — please reload the page.");
      return;
    }

    // Topic guard on the user's message (loose — let the model respond, but flag clearly off-topic)
    if (global.BayanFilter && !global.BayanFilter.isPhPoliticsRelevant(text, { strictness: "loose" }) && !/philip|pinoy|pilipinas|filipino|senate|congress|comelec|barangay|government|politic|vote|election|bill|hearing/i.test(text)) {
      addUser(text);
      const m = startAssistant();
      m.content = "I only answer questions about Philippine politics, government, elections, and public officials. Try asking me about a senator (e.g. \"What committees does Risa Hontiveros chair?\"), a recent bill, an upcoming Senate hearing, or how to register to vote.";
      finishAssistant(m);
      return;
    }

    addUser(text);
    const assistantMsg = startAssistant();

    // Gather context: candidate (if on a candidate page), latest news headlines, hearings
    let candidateCtx = null;
    const slug = getCurrentCandidateSlug();
    try {
      if (slug && global.BayanAPI) {
        const r = await global.BayanAPI.candidateProfile(slug);
        if (r && r.ok) candidateCtx = r.data;
      }
    } catch (e) {}
    let newsCtx = [];
    let hearingsCtx = [];
    try {
      if (global.BayanAPI) {
        const [n, h] = await Promise.all([
          global.BayanAPI.news({ limit: 18 }),
          global.BayanAPI.hearings({ limit: 12, slug }),
        ]);
        if (n && n.ok) newsCtx = n.data.items || [];
        if (h && h.ok) hearingsCtx = h.data || [];
      }
    } catch (e) {}

    const systemPrompt = buildSystemPrompt(candidateCtx, hearingsCtx, newsCtx);

    // Recent conversation context (max 12 turns), excluding system meta
    const history = messages
      .filter((m) => m.role === "user" || (m.role === "assistant" && !m.streaming && m.content))
      .slice(0, -1) // exclude the in-flight assistant message
      .slice(-12);

    try {
      if (provider.provider === "anthropic") {
        await streamAnthropic({ provider, systemPrompt, history, userText: text, msg: assistantMsg });
      } else if (provider.provider === "gemini") {
        await streamGemini({ provider, systemPrompt, history, userText: text, msg: assistantMsg });
      } else if (provider.provider === "groq") {
        await streamGroq({ provider, systemPrompt, history, userText: text, msg: assistantMsg });
      } else if (provider.provider === "pollinations") {
        await streamPollinations({ provider, systemPrompt, history, userText: text, msg: assistantMsg });
      } else {
        await streamOpenAI({ provider, systemPrompt, history, userText: text, msg: assistantMsg });
      }
      finishAssistant(assistantMsg);
    } catch (err) {
      finishAssistant(assistantMsg, "Error: " + (err && err.message ? err.message : String(err)));
    }
  }

  async function streamPollinations({ systemPrompt, history, userText, msg }) {
    // Pollinations is OpenAI-compatible and FREE (no key needed).
    // Endpoint: https://text.pollinations.ai/openai
    const body = {
      model: "openai",
      stream: true,
      messages: [{ role: "system", content: systemPrompt }]
        .concat(history.map((m) => ({ role: m.role, content: m.content })))
        .concat([{ role: "user", content: userText }]),
      max_tokens: 1024,
      temperature: 0.4,
    };
    const resp = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error("Pollinations " + resp.status + ": " + text.slice(0, 240));
    }
    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    const onText = onChunk(msg);
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split(/\r?\n/);
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const j = JSON.parse(data);
          const delta = j.choices && j.choices[0] && j.choices[0].delta;
          // Pollinations streams 'reasoning' tokens before 'content' — ignore
          // reasoning, surface only content.
          if (delta && delta.content) onText(delta.content);
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }

  async function streamGemini({ provider, systemPrompt, history, userText, msg }) {
    // Google Gemini — FREE tier with a free key from https://aistudio.google.com
    const model = provider.model || "gemini-1.5-flash-latest";
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model) +
      ":streamGenerateContent?alt=sse&key=" +
      encodeURIComponent(provider.key);
    // Gemini's content format: roles user/model only. System goes in systemInstruction.
    const contents = history
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }))
      .concat([{ role: "user", parts: [{ text: userText }] }]);
    const body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
    };
    const resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error("Gemini " + resp.status + ": " + text.slice(0, 240));
    }
    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    const onText = onChunk(msg);
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split(/\r?\n/);
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const j = JSON.parse(data);
          const parts = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
          if (parts) {
            for (const p of parts) if (p.text) onText(p.text);
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }

  async function streamGroq({ provider, systemPrompt, history, userText, msg }) {
    // Groq — FREE tier with a free key from https://console.groq.com
    // OpenAI-compatible at https://api.groq.com/openai/v1/chat/completions
    const body = {
      model: provider.model || "llama-3.1-70b-versatile",
      stream: true,
      messages: [{ role: "system", content: systemPrompt }]
        .concat(history.map((m) => ({ role: m.role, content: m.content })))
        .concat([{ role: "user", content: userText }]),
      max_tokens: 1024,
      temperature: 0.4,
    };
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + provider.key,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error("Groq " + resp.status + ": " + text.slice(0, 240));
    }
    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    const onText = onChunk(msg);
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split(/\r?\n/);
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const j = JSON.parse(data);
          const delta = j.choices && j.choices[0] && j.choices[0].delta;
          if (delta && delta.content) onText(delta.content);
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }

  function onChunk(msg) {
    return (txt) => {
      msg.content += txt;
      // Render incrementally without rebuilding entire DOM each time
      const body = document.getElementById("bayanbot-body");
      if (!body) return;
      const lastMsg = body.querySelector(".bayanbot-msg.is-assistant:last-of-type");
      if (lastMsg) {
        lastMsg.innerHTML = mdToHtml(msg.content) + `<div class="bayanbot-typing"><span></span><span></span><span></span></div>`;
      }
      body.scrollTop = body.scrollHeight;
    };
  }

  async function streamAnthropic({ provider, systemPrompt, history, userText, msg }) {
    const body = {
      model: provider.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: history
        .map((m) => ({ role: m.role, content: m.content }))
        .concat([{ role: "user", content: userText }]),
      stream: true,
    };
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": provider.key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error("Anthropic " + resp.status + ": " + text.slice(0, 240));
    }
    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    const onText = onChunk(msg);
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split(/\r?\n/);
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const j = JSON.parse(data);
          if (j.type === "content_block_delta" && j.delta && j.delta.text) {
            onText(j.delta.text);
          } else if (j.type === "message_delta" && j.delta && j.delta.stop_reason) {
            // done
          } else if (j.type === "error") {
            throw new Error(j.error?.message || "Anthropic stream error");
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }

  async function streamOpenAI({ provider, systemPrompt, history, userText, msg }) {
    const body = {
      model: provider.model,
      stream: true,
      messages: [{ role: "system", content: systemPrompt }]
        .concat(history.map((m) => ({ role: m.role, content: m.content })))
        .concat([{ role: "user", content: userText }]),
      max_tokens: 1024,
      temperature: 0.4,
    };
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + provider.key,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error("OpenAI " + resp.status + ": " + text.slice(0, 240));
    }
    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    const onText = onChunk(msg);
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split(/\r?\n/);
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const j = JSON.parse(data);
          const delta = j.choices && j.choices[0] && j.choices[0].delta;
          if (delta && delta.content) onText(delta.content);
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    loadMessages();
    mount();
  });

  global.BayanBot = { mount, openPanel, closePanel };
})(window);
