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
    youtube: "bayan_youtube_key",
    rss2json: "bayan_rss2json_key",
    strictness: "bayan_topic_strictness", // strict | standard | loose
    chatModel: "bayan_chat_model", // claude-3-5-sonnet-20241022 | gpt-4o-mini | etc
  };

  const DEFAULTS = {
    strictness: "standard",
    chatModel: "claude-3-5-sonnet-20241022",
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

  // Returns the available chat provider config, picking the user's preferred
  // model and falling back from Anthropic → OpenAI as needed.
  function chatProvider() {
    const ant = get("anthropic");
    const oai = get("openai");
    const preferred = get("chatModel") || DEFAULTS.chatModel;
    const isClaude = preferred.toLowerCase().startsWith("claude");
    if (isClaude && ant) return { provider: "anthropic", key: ant, model: preferred };
    if (!isClaude && oai) return { provider: "openai", key: oai, model: preferred };
    if (ant) return { provider: "anthropic", key: ant, model: "claude-3-5-sonnet-20241022" };
    if (oai) return { provider: "openai", key: oai, model: "gpt-4o-mini" };
    return null;
  }

  global.BayanKeys = { get, set, has, clearAll, chatProvider, DEFAULTS, STORE };
})(window);
