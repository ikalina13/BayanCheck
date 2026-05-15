/* BayanCheck — Philippine politics topic filter.
 *
 * Three layers of "only PH politics" protection:
 *  (1) source whitelist  — content from PH-politics-relevant outlets only
 *  (2) keyword scoring   — title+summary scored against PH-politics dictionary
 *  (3) chat system prompt + post-response citation whitelist (in chat.js)
 *
 * This module implements (1) and (2) and is consumed by api.js + chat.js.
 *
 * Strictness levels (set in chat settings):
 *   strict   — needs ≥ 3 dictionary hits OR (whitelisted source AND ≥ 1 hit)
 *   standard — needs ≥ 2 dictionary hits OR (whitelisted source AND ≥ 1 hit)   [default]
 *   loose    — needs ≥ 1 dictionary hit  OR  whitelisted source
 */
(function (global) {
  "use strict";

  // Hostnames that publish primarily Philippine news / official records.
  // A hit on any of these gives the item +2 to its relevance score.
  const PH_OUTLET_HOSTS = [
    "rappler.com",
    "inquirer.net",
    "abs-cbn.com",
    "news.abs-cbn.com",
    "gmanetwork.com",
    "data.gmanetwork.com",
    "mb.com.ph",
    "philstar.com",
    "verafiles.org",
    "bilyonaryo.com",
    "manilanews.ph",
    "pna.gov.ph",
    "newsinfo.inquirer.net",
    "businessmirror.com.ph",
    "manilatimes.net",
    "spot.ph",
    "interaksyon.philstar.com",
    "balitangpilipinas.ph",
    "pep.ph",
    "manilastandard.net",
    "tribune.net.ph",
    "thephilbiznews.com",
    "senate.gov.ph",
    "web.senate.gov.ph",
    "congress.gov.ph",
    "comelec.gov.ph",
    "officialgazette.gov.ph",
    "dpwh.gov.ph",
    "doh.gov.ph",
    "dilg.gov.ph",
    "ombudsman.gov.ph",
    "sandiganbayan.gov.ph",
    "supremecourt.gov.ph",
    "neda.gov.ph",
    "pcoo.gov.ph",
    "presidentialcom.gov.ph",
    "en.wikipedia.org",
  ];

  // Hard PH-politics vocabulary. Each hit is +1 to the relevance score.
  // Includes agencies, parties, common political nouns/verbs, and place names.
  const PH_POLITICS_TERMS = [
    // institutions
    "senate", "senator", "senators", "congress", "house of representatives",
    "representative", "congressman", "congresswoman", "speaker of the house",
    "comelec", "ombudsman", "sandiganbayan", "supreme court", "ca", "court of appeals",
    "malacañang", "malacanang", "palace", "executive branch", "legislative",
    "judicial", "bureaucracy", "executive order", "republic act", "ra ",
    "presidential", "vice president", "vp", "cabinet", "secretary",
    "department of", "dpwh", "doh", "deped", "dilg", "denr", "dswd", "dnd", "dof",
    "dotr", "dti", "doe", "doj", "dot", "dict", "dilg", "neda", "psa",
    "afp", "pnp", "armed forces of the philippines", "philippine national police",
    "ngcp", "bsp", "bangko sentral", "pcg", "coast guard", "bir", "boc",
    "pcoo", "presidential communications", "pcgg", "ched", "tesda",
    // electoral
    "election", "elections", "vote", "voted", "voter", "voters", "ballot", "ballots",
    "campaign", "candidate", "candidates", "running mate", "incumbent",
    "barangay", "sangguniang kabataan", "sk", "midterm", "barangay election",
    "automated election", "smartmatic", "vcm", "precinct", "canvass", "canvassing",
    "boards of canvassers", "electoral tribunal", "set", "het", "pet",
    // parties (current and historical)
    "lakas-cmd", "lakas cmd", "pdp-laban", "pdp laban", "pfp", "partido federal",
    "nacionalista", "liberal party", "akbayan", "bayan muna", "kabataan",
    "anakpawis", "gabriela", "act-cis", "1-pacman", "ang probinsiyano",
    "nationalist people's coalition", "npc", "kabataang barangay",
    "katipunan ng nagkakaisang pilipino", "knp", "asenso manileño",
    // people / dynasties (broad)
    "marcos", "duterte", "sara duterte", "bongbong", "bbm", "imee marcos",
    "aquino", "noynoy", "ninoy", "kris aquino", "estrada", "joseph estrada",
    "binay", "robredo", "leni", "arroyo", "gloria macapagal", "macapagal",
    "drilon", "lacson", "ping lacson", "sotto", "tito sotto", "villar",
    "cynthia villar", "manny villar", "cayetano", "alan peter", "pia cayetano",
    "pangilinan", "kiko pangilinan", "hontiveros", "risa hontiveros",
    "escudero", "chiz escudero", "gatchalian", "win gatchalian",
    "padilla", "robin padilla", "go", "bong go", "tulfo", "raffy tulfo",
    "erwin tulfo", "dela rosa", "bato", "marcoleta", "ejercito", "jv ejercito",
    "zubiri", "migz zubiri", "villanueva", "joel villanueva", "lapid", "lito lapid",
    "romualdez", "martin romualdez", "bam aquino", "camille villar", "mark villar",
    "jinggoy estrada", "dy", "bojie dy", "loren legarda", "leila de lima",
    // policy / processes
    "bill", "bills", "republic act", "house bill", "senate bill",
    "committee", "committees", "hearing", "hearings", "blue ribbon",
    "appropriations", "budget", "general appropriations act", "gaa",
    "saln", "statement of assets", "transparency", "graft", "plunder",
    "impeachment", "impeach", "censure", "expulsion", "pork barrel", "pdaf",
    "dap", "disbursement acceleration", "confidential funds", "intelligence funds",
    "war on drugs", "extrajudicial killing", "ejk", "icc", "international criminal court",
    "anti-terror", "anti-terrorism act", "ata", "human rights", "chr",
    "bangsamoro", "barmm", "moro", "milf", "miff", "lumad",
    "wps", "west philippine sea", "south china sea", "spratly", "scarborough",
    "edsa", "people power", "martial law",
    "infrastructure", "build build build", "flood control", "dpwh project",
    "mrt", "lrt", "edsa busway", "skyway", "railway", "naia",
    // geography (when paired with a political term raises confidence)
    "philippines", "philippine", "pilipino", "filipino", "pinoy",
    "manila", "quezon city", "pasig", "makati", "taguig", "cebu",
    "davao", "iloilo", "baguio", "tacloban", "zamboanga", "general santos",
    "cagayan", "ilocos", "pampanga", "bulacan", "laguna", "cavite", "batangas",
    "rizal", "leyte", "samar", "negros", "panay", "mindanao", "luzon", "visayas",
    "ncr", "metro manila", "calabarzon", "central luzon", "bicol", "soccsksargen",
  ];

  // Negative / off-topic noise filters. If any of these dominate the title
  // we drop the score by 2 (helps reject pure-entertainment headlines).
  const OFF_TOPIC_PENALTY_TERMS = [
    "kdrama", "k-drama", "kpop", "k-pop", "anime", "manga",
    "boyfriend", "girlfriend", "wedding", "dating", "engaged",
    "showbiz", "abs-cbn entertainment", "starstruck",
    "horoscope", "lottery", "lotto",
    "premier league", "nba", "fight card", "ufc", "boxing draw",
    "mlb", "ufl",
  ];

  function getRelevance(itemOrText, opts) {
    opts = opts || {};
    let title = "";
    let summary = "";
    let host = "";

    if (typeof itemOrText === "string") {
      title = itemOrText;
    } else if (itemOrText && typeof itemOrText === "object") {
      title = String(itemOrText.title || "");
      summary = String(itemOrText.summary || itemOrText.description || itemOrText.content || "");
      const url = itemOrText.sourceUrl || itemOrText.url || itemOrText.link || "";
      try {
        host = url ? new URL(url).hostname.replace(/^www\./, "") : "";
      } catch (e) {
        host = "";
      }
    }

    const haystack = (title + " \n " + summary).toLowerCase();
    let hits = 0;
    let titleHits = 0;
    let titleLower = title.toLowerCase();

    for (const term of PH_POLITICS_TERMS) {
      if (haystack.indexOf(term) !== -1) hits += 1;
      if (titleLower.indexOf(term) !== -1) titleHits += 1;
    }

    for (const bad of OFF_TOPIC_PENALTY_TERMS) {
      if (haystack.indexOf(bad) !== -1) hits -= 2;
    }

    let sourceBonus = 0;
    let isPhSource = false;
    if (host) {
      isPhSource = PH_OUTLET_HOSTS.some(
        (h) => host === h || host.endsWith("." + h)
      );
      if (isPhSource) sourceBonus = 2;
    }

    const score = hits + sourceBonus;
    return {
      score,
      hits,
      titleHits,
      sourceBonus,
      isPhSource,
      host,
    };
  }

  function isPhPoliticsRelevant(itemOrText, opts) {
    opts = opts || {};
    const strictness = opts.strictness || "standard";
    const r = getRelevance(itemOrText, opts);

    if (strictness === "loose") {
      return r.score >= 1 || r.isPhSource;
    }
    if (strictness === "strict") {
      return r.hits >= 3 || (r.isPhSource && r.hits >= 1);
    }
    // standard
    return r.hits >= 2 || (r.isPhSource && r.hits >= 1);
  }

  function classifyCategory(title, summary) {
    const t = ((title || "") + " " + (summary || "")).toLowerCase();
    if (/\b(senate|congress|comelec|election|vote|impeach|bill|committee|hearing|saln|ombudsman|cabinet|malaca|presidential|ra \d|republic act)\b/.test(t)) return "politics";
    if (/\b(bsp|peso|inflation|economy|stocks?|gdp|budget|business|trade)\b/.test(t)) return "business";
    if (/\b(dict|tech|telco|internet|broadband|ai\b|startup|digital)\b/.test(t)) return "technology";
    if (/\b(pba|nba|gilas|sea games|olympics|football|basketball|boxing|volleyball|sports)\b/.test(t)) return "sports";
    if (/\b(film|cinema|movie|concert|abs-cbn entertainment|kapuso|kapamilya|teleserye|showbiz)\b/.test(t)) return "entertainment";
    if (/\b(deped|university|college|school|students?|teachers?|education|ched|tesda)\b/.test(t)) return "education";
    if (/\b(doh|hospital|dengue|covid|health|vaccine|outbreak|patient)\b/.test(t)) return "health";
    if (/\b(opinion|column|editorial|fact[- ]?check|verafiles|analysis)\b/.test(t)) return "opinion";
    if (/\b(cebu|davao|iloilo|baguio|mindanao|visayas|luzon|barangay|provincial|regional)\b/.test(t)) return "regional";
    return "politics";
  }

  function getStrictness() {
    if (global.BayanKeys && typeof global.BayanKeys.get === "function") {
      return global.BayanKeys.get("strictness") || "standard";
    }
    return "standard";
  }

  global.BayanFilter = {
    isPhPoliticsRelevant,
    getRelevance,
    classifyCategory,
    getStrictness,
    PH_OUTLET_HOSTS,
    PH_POLITICS_TERMS,
  };
})(window);
