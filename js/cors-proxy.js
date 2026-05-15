/* BayanCheck — CORS proxy helpers
 * GitHub Pages can only run browser code, so to fetch RSS feeds and
 * scrape senate.gov.ph (which don't send CORS headers) we tunnel through
 * a free public proxy. Two are configured for redundancy.
 */
(function (global) {
  "use strict";

  const PROXIES = [
    {
      name: "allorigins",
      // returns JSON with .contents (the raw response body)
      build: (url) => "https://api.allorigins.win/get?url=" + encodeURIComponent(url),
      extract: (resp) => resp.json().then((j) => j.contents),
    },
    {
      name: "corsproxy.io",
      // returns the raw response body directly (text/JSON pass-through)
      build: (url) => "https://corsproxy.io/?" + encodeURIComponent(url),
      extract: (resp) => resp.text(),
    },
  ];

  /**
   * fetchViaProxy(targetUrl, opts) → Promise<string>
   * Tries each configured proxy until one returns a 2xx response.
   * Throws if all proxies fail.
   */
  async function fetchViaProxy(url, opts) {
    opts = opts || {};
    const timeoutMs = opts.timeout || 8000;
    let lastErr = null;

    for (const p of PROXIES) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await fetch(p.build(url), {
          signal: controller.signal,
          // Don't send credentials cross-origin
          credentials: "omit",
          // Cache helpfully on the user's side
          cache: opts.cache || "default",
        });
        clearTimeout(t);
        if (!resp.ok) {
          lastErr = new Error(p.name + " returned HTTP " + resp.status);
          continue;
        }
        const body = await p.extract(resp);
        if (body == null || body === "") {
          lastErr = new Error(p.name + " returned empty body");
          continue;
        }
        return body;
      } catch (err) {
        clearTimeout(t);
        lastErr = err;
        continue;
      }
    }

    throw lastErr || new Error("All CORS proxies failed for " + url);
  }

  /** Convenience: parse XML/HTML string → DOM Document. */
  function parseXml(str, type) {
    type = type || "text/xml";
    return new DOMParser().parseFromString(str, type);
  }

  function parseHtml(str) {
    return new DOMParser().parseFromString(str, "text/html");
  }

  global.BayanProxy = { fetchViaProxy, parseXml, parseHtml };
})(window);
