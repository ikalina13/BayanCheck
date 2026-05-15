/* BayanCheck — user-supplied API key store.
 *
 * Pure-static GitHub Pages site → no server to hold keys. Anything that needs
 * a paid key (Anthropic, OpenAI, YouTube, optional rss2json) is provided by
 * the user and stored in this browser's localStorage only. Keys are sent only
 * to the official API endpoint of each provider.
 */
(function (global) {
  "use strict";

  const STORE = {
    anthropic: "bayan_anthropic_key",
    openai: "bayan_openai_key",
    gemini: "bayan_gemini_key",
    groq: "bayan_groq_key",
    youtube: "bayan_youtube_key",
    rss2json: "bayan_rss2json_key",
    strictness: "bayan_topic_strictness", // strict | standard | loose
    chatModel: "bayan_chat_model", // pollinations | gemini-1.5-flash | llama-3.1-70b-versatile | claude-... | gpt-...
  };

  const DEFAULTS = {
    strictness: "standard",
    // Gemini is the default — it's the fastest free option but needs a free
    // API key. Onboarding inside the chat panel walks the user through it
    // (30 seconds, no credit card). If they skip, we fall back to free
    // Pollinations which works without any setup.
    chatModel: "gemini-1.5-flash-latest",
  };

  function get(name) {
    try {
      const k = STORE[name];
      if (!k) return null;
      const v = localStorage.getItem(k);
      if (v == null) return DEFAULTS[name] || null;
      return v;
    } catch (e) {
      return DEFAULTS[name] || null;
    }
  }

  function set(name, value) {
    try {
      const k = STORE[name];
      if (!k) return;
      if (value == null || value === "") {
        localStorage.removeItem(k);
      } else {
        localStorage.setItem(k, String(value));
      }
    } catch (e) {}
  }

  function clearAll() {
    try {
      Object.values(STORE).forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
  }

  function has(name) {
    const v = get(name);
    return v != null && v !== "" && v !== DEFAULTS[name];
  }

  // Returns the chat-provider config to use, picking the user's preferred
  // model and degrading toward free Pollinations as needed.
  // Pollinations is the no-key default — chatProvider() ALWAYS returns
  // something usable, even when the user hasn't set any keys.
  function chatProvider() {
    const ant = get("anthropic");
    const oai = get("openai");
    const gem = get("gemini");
    const grq = get("groq");
    const preferred = (get("chatModel") || DEFAULTS.chatModel).toLowerCase();

    if (preferred.startsWith("claude") && ant)
      return { provider: "anthropic", key: ant, model: get("chatModel") };
    if ((preferred.startsWith("gpt") || preferred === "openai") && oai)
      return { provider: "openai", key: oai, model: get("chatModel") };
    if (preferred.startsWith("gemini") && gem)
      return { provider: "gemini", key: gem, model: get("chatModel") };
    if ((preferred.includes("llama") || preferred.includes("mixtral") || preferred === "groq") && grq)
      return { provider: "groq", key: grq, model: get("chatModel") };
    if (preferred === "pollinations")
      return { provider: "pollinations", key: null, model: "openai" };

    // Preferred model couldn't be served — try any configured key
    if (gem) return { provider: "gemini", key: gem, model: "gemini-1.5-flash-latest" };
    if (grq) return { provider: "groq", key: grq, model: "llama-3.1-70b-versatile" };
    if (ant) return { provider: "anthropic", key: ant, model: "claude-3-5-sonnet-20241022" };
    if (oai) return { provider: "openai", key: oai, model: "gpt-4o-mini" };

    // No keys at all — return null so the UI shows the Gemini onboarding
    // screen rather than silently falling back to slow Pollinations
    return null;
  }

  function pollinationsFallback() {
    return { provider: "pollinations", key: null, model: "openai" };
  }

  global.BayanKeys = { get, set, has, clearAll, chatProvider, pollinationsFallback, DEFAULTS, STORE };
})(window);
