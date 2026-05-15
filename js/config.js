/* BayanCheck — site-wide configuration.
 *
 * Edit this file to swap the embedded default Gemini key (used so BayanBot
 * works for visitors with zero setup). The key is, by design, public — it's
 * served as part of the static site. Protect it with an HTTP referrer
 * restriction in Google AI Studio (allow `https://ikalina13.github.io/*`).
 *
 * Visitors can override by pasting their own key in BayanBot ⚙ Settings.
 */
(function (global) {
  "use strict";
  global.BAYAN_CONFIG = {
    // Embedded default Gemini key. Anyone who lands on the site can use
    // BayanBot immediately — no setup, no signup. If this key gets rate
    // limited or revoked, BayanBot falls back to free Pollinations
    // automatically (see BayanKeys.chatProvider in js/keys.js).
    defaultGeminiKey: "AIzaSyBMeLhjQ4NqNTqpXvEjf0G5_f1uO7Htyoc",
    defaultGeminiModel: "gemini-flash-latest",
  };
})(window);
