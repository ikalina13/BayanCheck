export type NewsCategory =
  | "politics"
  | "business"
  | "technology"
  | "sports"
  | "entertainment"
  | "education"
  | "health"
  | "opinion"
  | "regional";

export type NewsSource =
  | "Rappler"
  | "ABS-CBN News"
  | "GMA News Online"
  | "Manila Bulletin"
  | "Philippine Daily Inquirer"
  | "Philstar Global"
  | "Manilanews.ph"
  | "Balitang Pilipinas"
  | "Reuters"
  | "Vera Files";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  source: NewsSource;
  sourceUrl: string;
  imageUrl: string;
  publishedAt: string;
  author?: string;
  tags: string[];
  viewCount: number;
  isBreaking?: boolean;
}

export type CaseStatus =
  | "pending"
  | "under_investigation"
  | "hearing"
  | "dismissed"
  | "convicted"
  | "resolved"
  | "allegation";

export type IssueSeverity = "clean" | "pending" | "serious";

export interface SourceRef {
  label: string;
  url: string;
  accessedAt: string;
  type: "official" | "news" | "court" | "factcheck" | "document";
}

export interface LegalCase {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  severity: "pending" | "serious";
  filedDate?: string;
  resolvedDate?: string;
  sources: SourceRef[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "completed" | "ongoing";
  startYear?: number;
  endYear?: number;
  budget?: string;
  impact?: string;
  outcomes?: string[];
  sources: SourceRef[];
}

export interface SalnDisclosure {
  year: number;
  netWorth: string;
  primaryIncome: string;
  businessInterests: string[];
  properties: string[];
  sources: SourceRef[];
}

export interface HearingRecord {
  committee: string;
  attendanceRate?: number;
  keyHearings: { title: string; date: string; attended: boolean; url?: string }[];
  votingRecordUrl?: string;
  sources: SourceRef[];
}

export interface Candidate {
  id: string;
  slug: string;
  fullName: string;
  aliases?: string[];
  position: string;
  positionLevel: "president" | "vice_president" | "senator" | "representative" | "governor" | "mayor";
  party: string;
  region?: string;
  electionYear: number;
  age: number;
  birthdate: string;
  birthPlace?: string;
  education: { institution: string; degree?: string; year?: string }[];
  workHistory: { role: string; organization: string; years?: string }[];
  website?: string;
  socialMedia?: { platform: string; url: string }[];
  summary: string;
  photoUrl: string;
  yearsInPublicService: number;
  previousPositions: string[];
  electionHistory: { year: number; position: string; result: "won" | "lost" }[];
  partyHistory: string[];
  saln: SalnDisclosure[];
  cases: LegalCase[];
  completedProjects: Project[];
  ongoingProjects: Project[];
  hearings: HearingRecord;
  mediaCoverage: { title: string; source: string; url: string; date: string }[];
  awards: { title: string; year?: number; sources: SourceRef[] }[];
  issueSeverity: IssueSeverity;
  lastVerified: string;
  relatedNewsIds?: string[];
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  content: string;
  createdAt: string;
  status: "approved" | "pending";
}
