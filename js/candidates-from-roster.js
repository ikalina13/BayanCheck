/**
 * Builds BAYAN_CANDIDATES from sitting senators (20th Congress) + House leadership.
 * Must load after roster-senate.js and roster-house.js.
 */
function bayanCommonsUrl(photoFile) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(photoFile)}`;
}

function bayanCommonsPipe(entry) {
  const files = [entry.photoFile].concat(entry.photoFileAlt || []);
  return files.map(bayanCommonsUrl).join("|");
}

function bayanOfficialSources(chamber) {
  const isSenate = chamber === "senate";
  return [
    {
      label: isSenate ? "Senate of the Philippines" : "House of Representatives",
      url: isSenate ? "https://www.senate.gov.ph/" : "https://www.congress.gov.ph/",
      accessedAt: "2026-05-15",
      type: "official",
    },
    {
      label: "COMELEC",
      url: "https://comelec.gov.ph/",
      accessedAt: "2026-05-15",
      type: "official",
    },
  ];
}

/**
 * Integrity tier for list cards (not a court finding).
 * - clean (green): no major item flagged in this conservative list — still verify sources.
 * - pending (orange): widely reported controversies, governance/ethics scrutiny, or criminal/civil
 *   legal history (including resolved cases) in mainstream reliable coverage.
 * - serious (red): ICC preliminary investigation / comparable high-stakes international criminal-law exposure.
 * Verify on Wikipedia, court dockets, ICC, Ombudsman.
 */
const BAYAN_SEVERITY_BY_SLUG = {
  "bam-aquino": "clean",
  "kiko-pangilinan": "clean",
  "pia-cayetano": "clean",
  "chiz-escudero": "clean",
  "joel-villanueva": "clean",
  "risa-hontiveros": "clean",
  "loren-legarda": "clean",
  "win-gatchalian": "clean",
  "jv-ejercito": "clean",
  "alan-peter-cayetano": "clean",
  "lito-lapid": "clean",
  "migz-zubiri": "clean",
  "bojie-dy": "clean",

  "bong-go": "pending",
  "erwin-tulfo": "pending",
  "rodante-marcoleta": "pending",
  "ping-lacson": "pending",
  "tito-sotto": "pending",
  "camille-villar": "pending",
  "imee-marcos": "pending",
  "robin-padilla": "pending",
  "raffy-tulfo": "pending",
  "mark-villar": "pending",
  "martin-romualdez": "pending",
  "jinggoy-estrada": "pending",

  "bato-delarosa": "serious",
};

function issueSeverityForSlug(slug) {
  return BAYAN_SEVERITY_BY_SLUG[slug] || "pending";
}

function buildSenatorCandidate(s, index) {
  const id = `sen-${String(index + 1).padStart(2, "0")}`;
  const wikiUrl = `https://en.wikipedia.org/wiki/${s.wiki}`;
  return {
    id,
    slug: s.slug,
    fullName: s.fullName,
    aliases: [s.displayName],
    position: "Senator",
    positionLevel: "senator",
    party: s.party,
    region: "National (at-large)",
    electionYear: s.cohort,
    term: s.term,
    cohort: s.cohort,
    age: null,
    birthdate: "See public biography",
    birthPlace: "Philippines",
    education: [],
    workHistory: [],
    website: wikiUrl,
    socialMedia: [],
    summary: `Sitting senator, 20th Congress. Term ${s.term}. ${s.party}. Profile summary from public election records; verify SALN and cases via official sources.`,
    photoUrl: bayanCommonsUrl(s.photoFile),
    photoCommonsSrcs: bayanCommonsPipe(s),
    wiki: s.wiki,
    yearsInPublicService: null,
    previousPositions: ["Senator of the Philippines"],
    electionHistory: [{ year: s.cohort, position: "Senator", result: "won" }],
    partyHistory: [s.party],
    saln: [
      {
        year: 2025,
        netWorth: "See latest SALN filing",
        primaryIncome: "Public disclosure (Senate / Ombudsman)",
        businessInterests: [],
        properties: [],
        sources: bayanOfficialSources("senate"),
      },
    ],
    cases: [],
    completedProjects: [],
    ongoingProjects: [],
    hearings: {
      committee: "See Senate committee assignments",
      attendanceRate: null,
      keyHearings: [],
      sources: bayanOfficialSources("senate"),
    },
    mediaCoverage: [
      {
        title: `${s.displayName} — Wikipedia`,
        source: "Wikipedia",
        url: wikiUrl,
        date: "2026-05-15",
      },
    ],
    awards: [],
    issueSeverity: issueSeverityForSlug(s.slug),
    lastVerified: "2026-05-15",
    relatedNewsIds: [],
    isRealFigure: true,
    chamber: "senate",
  };
}

function buildHouseCandidate(h, index) {
  const id = `rep-${String(index + 1).padStart(2, "0")}`;
  const slug = h.slug || h.wiki.toLowerCase().replace(/_/g, "-");
  const wikiUrl = `https://en.wikipedia.org/wiki/${h.wiki}`;
  return {
    id,
    slug,
    fullName: h.displayName,
    aliases: [],
    position: h.role,
    positionLevel: "representative",
    party: h.party || "See Congress directory",
    region: "House of Representatives",
    electionYear: null,
    term: "20th Congress",
    age: null,
    birthdate: "See public biography",
    birthPlace: "Philippines",
    education: [],
    workHistory: [],
    website: wikiUrl,
    socialMedia: [],
    summary: `${h.role}. ${h.note} Detailed district, party, and disclosure records are on the official House member directory.`,
    photoUrl: bayanCommonsUrl(h.photoFile),
    photoCommonsSrcs: bayanCommonsPipe(h),
    wiki: h.wiki,
    yearsInPublicService: null,
    previousPositions: [h.role],
    electionHistory: [],
    partyHistory: h.party ? [h.party] : [],
    saln: [
      {
        year: 2025,
        netWorth: "See latest SALN filing",
        primaryIncome: "Public disclosure (House / Ombudsman)",
        businessInterests: [],
        properties: [],
        sources: bayanOfficialSources("house"),
      },
    ],
    cases: [],
    completedProjects: [],
    ongoingProjects: [],
    hearings: {
      committee: "See House committee assignments",
      attendanceRate: null,
      keyHearings: [],
      sources: bayanOfficialSources("house"),
    },
    mediaCoverage: [
      {
        title: `${h.displayName} — Wikipedia`,
        source: "Wikipedia",
        url: wikiUrl,
        date: "2026-05-15",
      },
    ],
    awards: [],
    issueSeverity: issueSeverityForSlug(slug),
    lastVerified: "2026-05-15",
    relatedNewsIds: [],
    isRealFigure: true,
    chamber: "house",
  };
}

function buildBayanCandidatesFromRoster() {
  const senators = (typeof BAYAN_SENATE_ROSTER !== "undefined" ? BAYAN_SENATE_ROSTER : []).map(buildSenatorCandidate);
  const house = (typeof BAYAN_HOUSE_LEADERSHIP !== "undefined" ? BAYAN_HOUSE_LEADERSHIP : []).map(buildHouseCandidate);
  return senators.concat(house);
}

const BAYAN_CANDIDATES = buildBayanCandidatesFromRoster();
// Browsers do NOT attach top-level `const` declarations to window. Force-attach
// so api.js (which references `window.BAYAN_CANDIDATES` via its `global` param)
// can find the roster.
window.BAYAN_CANDIDATES = BAYAN_CANDIDATES;
