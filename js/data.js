/* Hardcoded sample articles used as a last-resort fallback when the live
 * news feeds in js/api.js (rss2json + GDELT + AllOrigins) are unreachable.
 * Real news in production comes from BayanAPI.news() — see js/api.js.
 */
const BAYAN_NEWS_FALLBACK = [
  {
    id: "n1",
    title: "Senate panel resumes probe on flood control projects amid budget scrutiny",
    summary:
      "Lawmakers question DPWH officials on project timelines and contractor selection as typhoon season approaches.",
    content:
      "The Senate blue ribbon committee resumed hearings on flood control infrastructure, with senators demanding documentary evidence on project completion rates. DPWH officials presented regional breakdowns while opposition lawmakers cited audit findings. The hearing is expected to continue next week with contractor representatives invited to testify.",
    category: "politics",
    source: "Rappler",
    sourceUrl: "https://www.rappler.com",
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=450&fit=crop",
    publishedAt: "2026-05-15T08:30:00+08:00",
    author: "Rappler Staff",
    tags: ["Senate", "Infrastructure", "DPWH"],
    viewCount: 12450,
    isBreaking: true,
  },
  {
    id: "n2",
    title: "BSP holds key rate steady as inflation eases in April",
    summary:
      "The central bank cites improved food supply and stable peso in its latest monetary policy decision.",
    content:
      "Bangko Sentral ng Pilipinas kept its overnight borrowing rate unchanged, noting that headline inflation moved within the target band. Economists expect gradual easing later in the year if global oil prices remain stable. The decision affects loan rates for households and businesses nationwide.",
    category: "business",
    source: "Philippine Daily Inquirer",
    sourceUrl: "https://www.inquirer.net",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop",
    publishedAt: "2026-05-15T07:15:00+08:00",
    tags: ["BSP", "Economy", "Inflation"],
    viewCount: 8320,
  },
  {
    id: "n3",
    title: "DICT launches rural connectivity program targeting 500 barangays",
    summary:
      "Free Wi-Fi hubs and digital literacy training roll out in underserved provinces this quarter.",
    content:
      "The Department of Information and Communications Technology announced phase two of its connectivity initiative, partnering with local governments to install community access points. Officials said the program aims to support students and small entrepreneurs in remote areas.",
    category: "technology",
    source: "GMA News Online",
    sourceUrl: "https://www.gmanetwork.com/news",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop",
    publishedAt: "2026-05-14T16:45:00+08:00",
    tags: ["DICT", "Internet", "Rural"],
    viewCount: 5210,
  },
  {
    id: "n4",
    title: "Gilas Pilipinas names final 12 for FIBA Asia Cup qualifiers",
    summary:
      "National team coach balances veteran leadership with young talent ahead of away fixtures.",
    content:
      "The Samahang Basketbol ng Pilipinas confirmed the roster after a week-long training camp in Manila. The team departs next week for qualifying matches that will determine seeding for the continental tournament.",
    category: "sports",
    source: "ABS-CBN News",
    sourceUrl: "https://www.abs-cbn.com/news",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=450&fit=crop",
    publishedAt: "2026-05-14T14:20:00+08:00",
    tags: ["Basketball", "Gilas", "FIBA"],
    viewCount: 18900,
  },
  {
    id: "n5",
    title: "DepEd expands mental health support in public high schools",
    summary:
      "Guidance counselors to receive additional training under new wellness framework.",
    content:
      "The Department of Education issued guidelines requiring schools to establish referral pathways for students facing anxiety and academic stress. Civil society groups welcomed the policy but called for more hiring of licensed psychologists.",
    category: "education",
    source: "Manila Bulletin",
    sourceUrl: "https://mb.com.ph",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop",
    publishedAt: "2026-05-14T11:00:00+08:00",
    tags: ["DepEd", "Mental Health", "Schools"],
    viewCount: 4100,
  },
  {
    id: "n6",
    title: "DOH reports decline in dengue cases in Visayas, urges continued cleanup drives",
    summary:
      "Health officials credit community fogging and early referral protocols for the downward trend.",
    content:
      "Regional epidemiology centers recorded a 22% week-on-week decrease in dengue admissions. The DOH reminded local governments to sustain 4S campaigns as rainy season intensifies.",
    category: "health",
    source: "Philstar Global",
    sourceUrl: "https://www.philstar.com",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop",
    publishedAt: "2026-05-13T18:30:00+08:00",
    tags: ["DOH", "Dengue", "Visayas"],
    viewCount: 6700,
  },
  {
    id: "n7",
    title: "Fact check: Viral post on automated poll results is misleading",
    summary:
      "Vera Files and Rappler Fact Check clarify that no official tally has been released for 2026 local races.",
    content:
      "Fact-checkers debunked a widely shared screenshot claiming to show final vote counts. COMELEC reminded the public that only official canvass data from accredited sources should be trusted during election season.",
    category: "opinion",
    source: "Vera Files",
    sourceUrl: "https://verafiles.org",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=450&fit=crop",
    publishedAt: "2026-05-13T09:00:00+08:00",
    tags: ["Fact Check", "Elections", "COMELEC"],
    viewCount: 22100,
    isBreaking: true,
  },
  {
    id: "n8",
    title: "Cebu City unveils new coastal resilience plan after storm surge damage",
    summary:
      "Local officials partner with urban planners on seawall upgrades and mangrove rehabilitation.",
    content:
      "Mayor's office presented a 10-year adaptation roadmap funded by national disaster risk reduction allocations. Residents in coastal barangays joined consultations on evacuation routes and early warning systems.",
    category: "regional",
    source: "Manilanews.ph",
    sourceUrl: "https://manilanews.ph",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=450&fit=crop",
    publishedAt: "2026-05-12T15:45:00+08:00",
    tags: ["Cebu", "Climate", "Disaster"],
    viewCount: 3800,
  },
  {
    id: "n9",
    title: "Ombudsman releases summary of SALN compliance for national officials",
    summary:
      "Document highlights filing rates and referrals for late submissions among executive branch officials.",
    content:
      "The Office of the Ombudsman published its annual transparency report, noting improved electronic filing adoption. Several cases were referred for preliminary investigation over inconsistent asset declarations.",
    category: "politics",
    source: "Rappler",
    sourceUrl: "https://www.rappler.com",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop",
    publishedAt: "2026-05-12T10:20:00+08:00",
    tags: ["Ombudsman", "SALN", "Transparency"],
    viewCount: 9100,
  },
  {
    id: "n10",
    title: "Film industry celebrates revival of regional cinema festivals",
    summary:
      "Independent filmmakers gain grants for stories in Visayan and Mindanao languages.",
    content:
      "The Film Development Council announced funding for five regional festivals, aiming to diversify Philippine cinema beyond Metro Manila premieres. Streaming platforms expressed interest in distribution deals.",
    category: "entertainment",
    source: "Balitang Pilipinas",
    sourceUrl: "https://balitangpilipinas.ph",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=450&fit=crop",
    publishedAt: "2026-05-11T20:00:00+08:00",
    tags: ["Cinema", "FDCP", "Culture"],
    viewCount: 2900,
  },
];

/* Backwards-compatible alias — older calls to BAYAN_NEWS still work
 * but everything new should use the live BayanAPI.news() feed. */
const BAYAN_NEWS = BAYAN_NEWS_FALLBACK;

/* BAYAN_CANDIDATES is built in candidates-from-roster.js (24 senators + House leadership). */
