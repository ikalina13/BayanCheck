import type { Candidate } from "@/lib/types";

const official = (label: string, url: string): import("@/lib/types").SourceRef => ({
  label,
  url,
  accessedAt: "2026-05-15",
  type: "official",
});

const news = (label: string, url: string): import("@/lib/types").SourceRef => ({
  label,
  url,
  accessedAt: "2026-05-15",
  type: "news",
});

export const candidates: Candidate[] = [
  {
    id: "c1",
    slug: "maria-elena-reyes",
    fullName: "Maria Elena Santos Reyes",
    aliases: ["Len Reyes"],
    position: "Senator",
    positionLevel: "senator",
    party: "Partido ng Bayan at Pagbabago",
    region: "National",
    electionYear: 2028,
    age: 54,
    birthdate: "1972-03-14",
    birthPlace: "Quezon City, Metro Manila",
    education: [
      { institution: "University of the Philippines Diliman", degree: "BA Political Science", year: "1993" },
      { institution: "Asian Institute of Management", degree: "MPM", year: "1998" },
    ],
    workHistory: [
      { role: "City Councilor", organization: "Quezon City Council", years: "2004–2010" },
      { role: "Representative", organization: "House of Representatives (4th District, QC)", years: "2010–2019" },
      { role: "Senator", organization: "Senate of the Philippines", years: "2019–present" },
    ],
    website: "https://example.gov.ph/sen-reyes",
    socialMedia: [
      { platform: "Facebook", url: "https://facebook.com" },
      { platform: "X", url: "https://x.com" },
    ],
    summary:
      "Three-term public servant with focus on education reform, disaster resilience, and transparency legislation. Incumbent senator seeking re-election.",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    yearsInPublicService: 22,
    previousPositions: ["City Councilor", "House Representative", "Senator"],
    electionHistory: [
      { year: 2004, position: "City Councilor", result: "won" },
      { year: 2010, position: "Representative", result: "won" },
      { year: 2016, position: "Representative", result: "won" },
      { year: 2019, position: "Senator", result: "won" },
    ],
    partyHistory: ["Lakas-Kampi (2004–2009)", "Partido ng Bayan at Pagbabago (2010–present)"],
    saln: [
      {
        year: 2025,
        netWorth: "₱48.2 million",
        primaryIncome: "Government salary, book royalties",
        businessInterests: ["Minor shares in family agricultural cooperative (disclosed)"],
        properties: ["Residential lot, Quezon City", "Agricultural land, Nueva Ecija (inherited)"],
        sources: [
          official("SALN 2025 Filing Summary", "https://www.ombudsman.gov.ph"),
          official("Senate Public Disclosure", "https://senate.gov.ph"),
        ],
      },
    ],
    cases: [
      {
        id: "case1",
        title: "Administrative complaint – alleged misuse of disaster funds (2023)",
        description:
          "Complaint filed before the Ombudsman alleging irregular procurement in a 2023 relief program. Investigation ongoing.",
        status: "under_investigation",
        severity: "serious",
        filedDate: "2023-11-20",
        sources: [
          official("Ombudsman Case Bulletin", "https://www.ombudsman.gov.ph"),
          news("News coverage – inquiry status", "https://www.rappler.com"),
        ],
      },
      {
        id: "case2",
        title: "Election protest – 2019 senatorial race (counter-protest segment)",
        description:
          "Segment of consolidated protest dismissed in 2021; no liability found against respondent Reyes on challenged precincts.",
        status: "dismissed",
        severity: "pending",
        filedDate: "2019-06-01",
        resolvedDate: "2021-04-15",
        sources: [
          official("COMELEC Decision Archive", "https://comelec.gov.ph"),
          news("Rappler – protest dismissed", "https://www.rappler.com"),
        ],
      },
      {
        id: "case3",
        title: "Plagiarism allegation – policy paper (2020)",
        description:
          "Academic integrity allegation regarding a co-authored policy brief. Senate ethics committee found insufficient evidence; case closed.",
        status: "dismissed",
        severity: "pending",
        filedDate: "2020-08-10",
        resolvedDate: "2020-12-01",
        sources: [
          official("Senate Committee Report (public summary)", "https://senate.gov.ph"),
          news("Fact check – attribution dispute", "https://verafiles.org"),
        ],
      },
    ],
    completedProjects: [
      {
        id: "p1",
        name: "Libreng Tulong Eskwela Act implementation",
        description: "National scholarship voucher program for public high school students.",
        status: "completed",
        startYear: 2020,
        endYear: 2024,
        budget: "₱4.2 billion (aggregate appropriations)",
        impact: "Beneficiaries: 120,000 students; graduation rate improvement cited at 8% in pilot regions.",
        outcomes: ["92% completion among first cohort", "DepEd partnership in 81 provinces"],
        sources: [
          official("DepEd Annual Report 2024", "https://www.deped.gov.ph"),
          news("Inquirer – program outcomes", "https://www.inquirer.net"),
        ],
      },
      {
        id: "p2",
        name: "Coastal Resilience Fund (author)",
        description: "Legislation allocating climate adaptation grants to LGUs.",
        status: "completed",
        startYear: 2022,
        endYear: 2025,
        budget: "₱12 billion",
        impact: "156 LGUs received grants; 42 seawall and mangrove projects completed.",
        sources: [official("DBM Budget Documents", "https://www.dbm.gov.ph")],
      },
    ],
    ongoingProjects: [
      {
        id: "o1",
        name: "Open Government Data Bill",
        description: "Mandates machine-readable publication of procurement and SALN summaries.",
        status: "ongoing",
        startYear: 2025,
        budget: "₱85 million (implementation fund proposed)",
        sources: [official("Senate Bill Index", "https://senate.gov.ph")],
      },
    ],
    hearings: {
      committee: "Committee on Finance; Committee on Public Works",
      attendanceRate: 87,
      keyHearings: [
        { title: "2026 National Budget Deliberations", date: "2025-11-12", attended: true },
        { title: "Flood Control Infrastructure Probe", date: "2026-05-10", attended: true, url: "https://senate.gov.ph" },
        { title: "Education Reform Special Session", date: "2026-04-02", attended: false },
      ],
      votingRecordUrl: "https://senate.gov.ph",
      sources: [official("Senate Session Records", "https://senate.gov.ph")],
    },
    mediaCoverage: [
      { title: "Senator Reyes pushes transparency bill amid probe", source: "Rappler", url: "https://www.rappler.com", date: "2026-05-12" },
      { title: "Fact check: Claims on scholarship program enrollment", source: "Vera Files", url: "https://verafiles.org", date: "2026-03-01" },
    ],
    awards: [
      { title: "Gawad Paglilingkod sa Sambayanan", year: 2018, sources: [news("Local council citation", "https://www.inquirer.net")] },
    ],
    issueSeverity: "serious",
    lastVerified: "2026-05-15",
    relatedNewsIds: ["n1", "n9"],
  },
  {
    id: "c2",
    slug: "antonio-dela-cruz-villar",
    fullName: "Antonio Dela Cruz Villar Jr.",
    position: "President",
    positionLevel: "president",
    party: "National Unity Alliance",
    electionYear: 2028,
    age: 61,
    birthdate: "1965-07-22",
    birthPlace: "Iloilo City, Iloilo",
    education: [
      { institution: "Ateneo de Manila University", degree: "BS Management", year: "1987" },
      { institution: "Harvard Kennedy School", degree: "MPA", year: "1995" },
    ],
    workHistory: [
      { role: "Provincial Governor", organization: "Province of Iloilo", years: "2007–2016" },
      { role: "Secretary", organization: "Department of Trade and Industry", years: "2016–2022" },
    ],
    summary:
      "Former governor and cabinet secretary campaigning on economic growth, food security, and digital government.",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    yearsInPublicService: 15,
    previousPositions: ["Provincial Governor", "DTI Secretary"],
    electionHistory: [
      { year: 2007, position: "Governor", result: "won" },
      { year: 2013, position: "Governor", result: "won" },
    ],
    partyHistory: ["National Unity Alliance (2010–present)"],
    saln: [
      {
        year: 2025,
        netWorth: "₱312.5 million",
        primaryIncome: "Business income, investments, speaking fees (declared)",
        businessInterests: ["Villar Holdings (declared stake)", "Agri-export firm board membership"],
        properties: ["Multiple residential properties (declared)", "Commercial lots, Iloilo and Makati"],
        sources: [
          official("COMELEC Candidate Disclosure (sample)", "https://comelec.gov.ph"),
          official("Ombudsman SALN portal", "https://www.ombudsman.gov.ph"),
        ],
      },
    ],
    cases: [
      {
        id: "case4",
        title: "Civil case – breach of contract (business dispute, 2018)",
        description: "Private civil suit related to pre-public office business dealings. Settled out of court in 2020.",
        status: "resolved",
        severity: "pending",
        filedDate: "2018-02-01",
        resolvedDate: "2020-06-15",
        sources: [news("Court docket summary (reporting)", "https://www.inquirer.net")],
      },
      {
        id: "case5",
        title: "Unexplained wealth allegation (social media, 2024)",
        description:
          "Allegation of disproportionate assets. No formal charge filed; Ombudsman has not confirmed active investigation as of May 2026.",
        status: "allegation",
        severity: "pending",
        sources: [
          news("Rappler – allegation context", "https://www.rappler.com"),
          official("Ombudsman – no public case bulletin entry", "https://www.ombudsman.gov.ph"),
        ],
      },
    ],
    completedProjects: [
      {
        id: "p3",
        name: "Iloilo Expressway Phase 1",
        description: "Provincial infrastructure project during governorship.",
        status: "completed",
        startYear: 2012,
        endYear: 2015,
        budget: "₱8.1 billion",
        impact: "Travel time reduced by 35% on primary corridor.",
        sources: [official("DPWH Project Report", "https://www.dpwh.gov.ph")],
      },
    ],
    ongoingProjects: [],
    hearings: {
      committee: "N/A (not currently in legislature)",
      keyHearings: [
        { title: "Congressional inquiry on import policies (resource person)", date: "2025-09-20", attended: true },
      ],
      sources: [official("House Committee Transcript Index", "https://congress.gov.ph")],
    },
    mediaCoverage: [
      { title: "Villar outlines economic platform", source: "GMA News Online", url: "https://www.gmanetwork.com/news", date: "2026-04-28" },
    ],
    awards: [{ title: "Outstanding Governor Award (regional league)", year: 2014, sources: [news("Manila Bulletin", "https://mb.com.ph")] }],
    issueSeverity: "pending",
    lastVerified: "2026-05-15",
  },
  {
    id: "c3",
    slug: "fatima-hassan-mendoza",
    fullName: "Fatima Hassan Mendoza",
    position: "Mayor",
    positionLevel: "mayor",
    party: "Alyansa ng Mamamayan",
    region: "Davao City",
    electionYear: 2028,
    age: 47,
    birthdate: "1979-01-08",
    birthPlace: "Davao City, Davao del Sur",
    education: [
      { institution: "Ateneo de Davao University", degree: "BS Civil Engineering", year: "2001" },
      { institution: "University of the Philippines", degree: "MA Urban Planning", year: "2008" },
    ],
    workHistory: [
      { role: "City Engineer", organization: "Davao City LGU", years: "2008–2015" },
      { role: "Vice Mayor", organization: "Davao City", years: "2016–2022" },
      { role: "Mayor", organization: "Davao City", years: "2022–present" },
    ],
    summary:
      "Incumbent mayor focused on transport modernization, informal settler housing, and barangay health stations.",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    yearsInPublicService: 18,
    previousPositions: ["City Engineer", "Vice Mayor"],
    electionHistory: [
      { year: 2016, position: "Vice Mayor", result: "won" },
      { year: 2022, position: "Mayor", result: "won" },
    ],
    partyHistory: ["Alyansa ng Mamamayan (2016–present)"],
    saln: [
      {
        year: 2025,
        netWorth: "₱22.7 million",
        primaryIncome: "Government salary, spouse income (declared)",
        businessInterests: [],
        properties: ["Family home, Davao City"],
        sources: [official("DILG SALN submission portal", "https://www.dilg.gov.ph")],
      },
    ],
    cases: [
      {
        id: "case6",
        title: "Labor dispute – city contractor wages (2024)",
        description: "DOLE mediation on delayed wages for sanitation contractor workers. Settlement reached with back pay.",
        status: "resolved",
        severity: "pending",
        filedDate: "2024-03-10",
        resolvedDate: "2024-08-22",
        sources: [official("DOLE Press Release", "https://www.dole.gov.ph")],
      },
    ],
    completedProjects: [
      {
        id: "p4",
        name: "Davao Bus Rapid Transit Pilot",
        status: "completed",
        description: "12-km pilot corridor with dedicated lanes.",
        startYear: 2023,
        endYear: 2025,
        budget: "₱3.5 billion",
        impact: "Daily ridership 45,000; average commute reduced 18 minutes.",
        sources: [official("City Transport Office Report", "https://www.davaocity.gov.ph")],
      },
    ],
    ongoingProjects: [
      {
        id: "o2",
        name: "Barangay Health Station Upgrade",
        status: "ongoing",
        description: "182 stations targeted; 94 completed as of Q1 2026.",
        startYear: 2024,
        budget: "₱1.2 billion",
        sources: [official("City Health Office Progress Report", "https://www.davaocity.gov.ph")],
      },
    ],
    hearings: {
      committee: "League of Cities presentations",
      attendanceRate: 92,
      keyHearings: [
        { title: "Senate LGU hearing on urban transport", date: "2026-02-14", attended: true, url: "https://senate.gov.ph" },
      ],
      sources: [official("Senate Committee on Local Government", "https://senate.gov.ph")],
    },
    mediaCoverage: [
      { title: "Davao mayor defends BRT spending", source: "ABS-CBN News", url: "https://www.abs-cbn.com/news", date: "2026-01-20" },
    ],
    awards: [],
    issueSeverity: "clean",
    lastVerified: "2026-05-15",
    relatedNewsIds: ["n8"],
  },
  {
    id: "c4",
    slug: "ricardo-manuel-go",
    fullName: "Ricardo Manuel Go",
    position: "Representative",
    positionLevel: "representative",
    party: "Bagong Lakas",
    region: "Pampanga (2nd District)",
    electionYear: 2028,
    age: 58,
    birthdate: "1968-11-30",
    birthPlace: "San Fernando, Pampanga",
    education: [{ institution: "Far Eastern University", degree: "LLB", year: "1993" }],
    workHistory: [
      { role: "Prosecutor", organization: "DOJ", years: "1994–2005" },
      { role: "Representative", organization: "House of Representatives", years: "2016–present" },
    ],
    summary: "Lawyer-legislator known for criminal justice reform bills and anti-corruption advocacy.",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    yearsInPublicService: 10,
    previousPositions: ["DOJ Prosecutor", "House Representative"],
    electionHistory: [
      { year: 2016, position: "Representative", result: "won" },
      { year: 2022, position: "Representative", result: "won" },
    ],
    partyHistory: ["Bagong Lakas (2014–present)"],
    saln: [
      {
        year: 2025,
        netWorth: "₱18.9 million",
        primaryIncome: "Government salary",
        businessInterests: [],
        properties: ["Residential, San Fernando"],
        sources: [official("House Statement of Assets", "https://congress.gov.ph")],
      },
    ],
    cases: [
      {
        id: "case7",
        title: "Graft charges – alleged kickbacks in road project (2022)",
        description:
          "Sandiganbayan case pending. Accused denies charges; suspended from committee chairmanship pending trial.",
        status: "hearing",
        severity: "serious",
        filedDate: "2022-06-18",
        sources: [
          official("Sandiganbayan docket (public index)", "https://sc.judiciary.gov.ph"),
          news("Rappler – case update", "https://www.rappler.com"),
        ],
      },
      {
        id: "case8",
        title: "Campaign finance violation – 2022 election",
        description: "COMELEC complaint regarding late expenditure reports. Fine imposed; no disqualification.",
        status: "resolved",
        severity: "pending",
        resolvedDate: "2023-01-10",
        sources: [official("COMELEC Resolution", "https://comelec.gov.ph")],
      },
    ],
    completedProjects: [
      {
        id: "p5",
        name: "Public Attorney's Office Budget Increase (co-author)",
        status: "completed",
        description: "Legislation increasing PAO funding by 15%.",
        startYear: 2023,
        endYear: 2024,
        sources: [official("House Bill 8921", "https://congress.gov.ph")],
      },
    ],
    ongoingProjects: [],
    hearings: {
      committee: "Committee on Justice",
      attendanceRate: 78,
      keyHearings: [
        { title: "Anti-Graft Agency Budget Hearing", date: "2026-03-05", attended: true },
        { title: "Road Project Probe (subject)", date: "2026-04-18", attended: true, url: "https://congress.gov.ph" },
      ],
      votingRecordUrl: "https://congress.gov.ph",
      sources: [official("House Journal", "https://congress.gov.ph")],
    },
    mediaCoverage: [
      { title: "Rep. Go pleads not guilty in Sandiganbayan", source: "Philippine Daily Inquirer", url: "https://www.inquirer.net", date: "2025-11-02" },
    ],
    awards: [],
    issueSeverity: "serious",
    lastVerified: "2026-05-15",
    relatedNewsIds: ["n1"],
  },
  {
    id: "c5",
    slug: "carmela-rosario-lim",
    fullName: "Carmela Rosario Lim",
    position: "Vice President",
    positionLevel: "vice_president",
    party: "Katipunan ng Progresibong Pilipino",
    electionYear: 2028,
    age: 52,
    birthdate: "1974-05-19",
    birthPlace: "Cebu City, Cebu",
    education: [
      { institution: "University of San Carlos", degree: "BS Economics", year: "1995" },
      { institution: "London School of Economics", degree: "MSc Development Studies", year: "1999" },
    ],
    workHistory: [
      { role: "NGO Director", organization: "Visayas Development Initiative", years: "2000–2012" },
      { role: "Senator", organization: "Senate of the Philippines", years: "2013–2022" },
    ],
    summary: "Former senator and development economist running on education and anti-poverty platforms.",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    yearsInPublicService: 9,
    previousPositions: ["Senator"],
    electionHistory: [{ year: 2013, position: "Senator", result: "won" }],
    partyHistory: ["Katipunan ng Progresibong Pilipino (2012–present)"],
    saln: [
      {
        year: 2025,
        netWorth: "₱67.3 million",
        primaryIncome: "Investments, honoraria, pension (declared)",
        businessInterests: ["Social enterprise equity (declared)"],
        properties: ["Cebu City residence", "Condominium unit, Taguig"],
        sources: [official("COMELEC filing", "https://comelec.gov.ph")],
      },
    ],
    cases: [],
    completedProjects: [
      {
        id: "p6",
        name: "Universal Feeding Program Act (principal author)",
        status: "completed",
        description: "School-based feeding for K-6 in public schools.",
        startYear: 2018,
        endYear: 2022,
        budget: "₱6 billion annually (upon enactment)",
        impact: "3.2 million student meals served in first year per DepEd.",
        sources: [official("DepEd Implementation Report", "https://www.deped.gov.ph")],
      },
    ],
    ongoingProjects: [],
    hearings: {
      committee: "Former Senate Committees on Education, Agriculture",
      attendanceRate: 91,
      keyHearings: [{ title: "Final Senate session as incumbent", date: "2022-06-03", attended: true }],
      sources: [official("Senate Archives", "https://senate.gov.ph")],
    },
    mediaCoverage: [
      { title: "Lim announces VP bid with education focus", source: "Philstar Global", url: "https://www.philstar.com", date: "2026-02-10" },
    ],
    awards: [
      { title: "Outstanding Legislator Award", year: 2019, sources: [news("Philippine Daily Inquirer", "https://www.inquirer.net")] },
    ],
    issueSeverity: "clean",
    lastVerified: "2026-05-15",
  },
];

export function getCandidateBySlug(slug: string) {
  return candidates.find((c) => c.slug === slug);
}

export function searchCandidates(query: string, filters?: { position?: string; party?: string; region?: string; year?: number }) {
  const q = query.toLowerCase();
  return candidates.filter((c) => {
    const matchesQuery =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.party.toLowerCase().includes(q) ||
      c.position.toLowerCase().includes(q);
    const matchesPosition = !filters?.position || c.positionLevel === filters.position;
    const matchesParty = !filters?.party || c.party === filters.party;
    const matchesRegion = !filters?.region || (c.region?.toLowerCase().includes(filters.region.toLowerCase()) ?? false);
    const matchesYear = !filters?.year || c.electionYear === filters.year;
    return matchesQuery && matchesPosition && matchesParty && matchesRegion && matchesYear;
  });
}

export const parties = [...new Set(candidates.map((c) => c.party))];
export const positions = [...new Set(candidates.map((c) => c.positionLevel))];
