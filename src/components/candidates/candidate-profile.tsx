"use client";

import Image from "next/image";
import Link from "next/link";
import type { Candidate } from "@/lib/types";
import { SourceLinks } from "@/components/ui/source-link";
import { Badge } from "@/components/ui/badge";
import { getCaseStatusLabel, getSeverityColor } from "@/lib/utils";
import { Download, Share2, Clock, ExternalLink } from "lucide-react";

export function CandidateProfile({ candidate }: { candidate: Candidate }) {
  const seriousCases = candidate.cases.filter((c) => c.severity === "serious" && !["dismissed", "resolved"].includes(c.status));
  const pendingCases = candidate.cases.filter((c) => ["pending", "under_investigation", "hearing", "allegation"].includes(c.status));
  const resolvedCases = candidate.cases.filter((c) => ["dismissed", "resolved", "convicted"].includes(c.status));

  const handlePrint = () => window.print();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 print:py-4">
      <header className="flex flex-col md:flex-row gap-6 pb-8 border-b border-black/10 dark:border-white/10">
        <div className="relative h-32 w-32 shrink-0 rounded-full overflow-hidden mx-auto md:mx-0">
          <Image src={candidate.photoUrl} alt="" fill className="object-cover" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
            <span className={`text-xs px-3 py-1 rounded-full ${getSeverityColor(candidate.issueSeverity)}`}>
              {candidate.issueSeverity === "clean" && "Clean Record"}
              {candidate.issueSeverity === "pending" && "Pending Issues"}
              {candidate.issueSeverity === "serious" && "Serious Issues"}
            </span>
            <Badge variant="outline">Last verified: {candidate.lastVerified}</Badge>
          </div>
          <h1 className="text-3xl font-bold">{candidate.fullName}</h1>
          {candidate.aliases && (
            <p className="text-muted text-sm">Also known as: {candidate.aliases.join(", ")}</p>
          )}
          <p className="text-lg mt-1">
            {candidate.position} · <span className="font-medium">{candidate.party}</span>
          </p>
          {candidate.region && <p className="text-muted">{candidate.region} · Election {candidate.electionYear}</p>}
          <p className="mt-3 text-sm">{candidate.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm"
            >
              <Download className="h-4 w-4" /> Export / Print PDF
            </button>
            <button
              type="button"
              onClick={() => navigator.share?.({ title: candidate.fullName, url: window.location.href })}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </header>

      <Section title="Basic Information" id="basic">
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <Item label="Age" value={`${candidate.age} (born ${candidate.birthdate})`} />
          {candidate.birthPlace && <Item label="Birthplace" value={candidate.birthPlace} />}
          <Item label="Years in public service" value={String(candidate.yearsInPublicService)} />
          <Item label="Previous positions" value={candidate.previousPositions.join(", ")} />
        </dl>
        <h4 className="font-semibold mt-4 mb-2">Education</h4>
        <ul className="text-sm space-y-1">
          {candidate.education.map((e, i) => (
            <li key={i}>
              {e.institution} {e.degree && `— ${e.degree}`} {e.year && `(${e.year})`}
            </li>
          ))}
        </ul>
        <h4 className="font-semibold mt-4 mb-2">Work History</h4>
        <ul className="text-sm space-y-1">
          {candidate.workHistory.map((w, i) => (
            <li key={i}>
              <strong>{w.role}</strong> — {w.organization} {w.years && `(${w.years})`}
            </li>
          ))}
        </ul>
        {candidate.website && (
          <p className="mt-3 text-sm">
            <a href={candidate.website} className="text-accent inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
              Official website <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        )}
      </Section>

      <Section title="Financial Disclosure (SALN)" id="saln">
        {candidate.saln.map((s) => (
          <div key={s.year} className="mb-6 p-4 bg-surface rounded-lg">
            <h4 className="font-bold">SALN {s.year}</h4>
            <dl className="mt-2 grid sm:grid-cols-2 gap-2 text-sm">
              <Item label="Net worth" value={s.netWorth} />
              <Item label="Primary income" value={s.primaryIncome} />
              <Item label="Business interests" value={s.businessInterests.join("; ") || "None declared"} />
              <Item label="Properties" value={s.properties.join("; ")} />
            </dl>
            <SourceLinks sources={s.sources} />
          </div>
        ))}
      </Section>

      <Section title="Issues & Controversies" id="cases" highlight>
        <p className="text-sm text-muted mb-4">
          All public cases and allegations are listed below. Status indicates outcome where available.
          Allegations without formal charges are clearly marked.
        </p>

        {seriousCases.length > 0 && (
          <CaseGroup title="Serious Issues" emoji="🔴" cases={seriousCases} />
        )}
        {pendingCases.length > 0 && (
          <CaseGroup title="Pending / Under Investigation" emoji="🟡" cases={pendingCases} />
        )}
        {resolvedCases.length > 0 && (
          <CaseGroup title="Resolved / Dismissed" emoji="⚪" cases={resolvedCases} />
        )}
        {candidate.cases.length === 0 && (
          <p className="text-success font-medium">No cases or controversies on record in our database.</p>
        )}
      </Section>

      <Section title="Completed Projects & Track Record" id="projects">
        {candidate.completedProjects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {candidate.completedProjects.length === 0 && <p className="text-sm text-muted">No completed projects listed.</p>}
      </Section>

      {candidate.ongoingProjects.length > 0 && (
        <Section title="Ongoing / In-Progress Projects" id="ongoing">
          {candidate.ongoingProjects.map((p) => (
            <ProjectCard key={p.id} project={p} ongoing />
          ))}
        </Section>
      )}

      <Section title="Senate / Congressional Hearings" id="hearings">
        {candidate.hearings.attendanceRate !== undefined && (
          <p className="text-lg font-bold mb-2">Attendance rate: {candidate.hearings.attendanceRate}%</p>
        )}
        <ul className="space-y-2 text-sm">
          {candidate.hearings.keyHearings.map((h, i) => (
            <li key={i} className="flex items-start gap-2">
              {h.attended ? (
                <span className="text-success">✓</span>
              ) : (
                <span className="text-danger">✗</span>
              )}
              <span>
                {h.title} — {h.date}
                {h.url && (
                  <a href={h.url} className="ml-2 text-accent" target="_blank" rel="noopener noreferrer">
                    transcript
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
        {candidate.hearings.votingRecordUrl && (
          <a href={candidate.hearings.votingRecordUrl} className="text-accent text-sm mt-2 inline-block" target="_blank" rel="noopener noreferrer">
            View voting record →
          </a>
        )}
        <SourceLinks sources={candidate.hearings.sources} />
      </Section>

      <Section title="Political History" id="political">
        <h4 className="font-semibold text-sm mb-2">Election History</h4>
        <ul className="text-sm space-y-1 mb-4">
          {candidate.electionHistory.map((e, i) => (
            <li key={i}>
              {e.year}: {e.position} — <strong className={e.result === "won" ? "text-success" : "text-muted"}>{e.result}</strong>
            </li>
          ))}
        </ul>
        <h4 className="font-semibold text-sm mb-2">Party Affiliations</h4>
        <ul className="text-sm space-y-1">
          {candidate.partyHistory.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </Section>

      <Section title="Media Coverage & Fact-Checks" id="media">
        <ul className="space-y-3">
          {candidate.mediaCoverage.map((m, i) => (
            <li key={i} className="text-sm border-l-2 border-accent pl-3">
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-accent">
                {m.title}
              </a>
              <p className="text-muted text-xs">{m.source} · {m.date}</p>
            </li>
          ))}
        </ul>
      </Section>

      {candidate.awards.length > 0 && (
        <Section title="Awards & Certifications" id="awards">
          <ul className="text-sm space-y-2">
            {candidate.awards.map((a, i) => (
              <li key={i}>
                <strong>{a.title}</strong> {a.year && `(${a.year})`}
                <SourceLinks sources={a.sources} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Career Timeline" id="timeline">
        <div className="relative border-l-2 border-accent/30 pl-6 space-y-6">
          {candidate.electionHistory.map((e) => (
            <div key={e.year} className="relative">
              <span className="absolute -left-[1.6rem] w-3 h-3 rounded-full bg-accent" />
              <p className="font-bold">{e.year}</p>
              <p className="text-sm">Ran for {e.position} — {e.result}</p>
            </div>
          ))}
          {candidate.workHistory.map((w, i) => (
            <div key={`w-${i}`} className="relative">
              <span className="absolute -left-[1.6rem] w-3 h-3 rounded-full bg-muted" />
              <p className="font-bold">{w.role}</p>
              <p className="text-sm text-muted">{w.organization} {w.years}</p>
            </div>
          ))}
        </div>
      </Section>

      <p className="mt-8 text-xs text-muted flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Profile last verified: {candidate.lastVerified}. Report corrections via{" "}
        <Link href="/about" className="text-accent underline">About</Link>.
      </p>
    </div>
  );
}

function Section({
  title,
  id,
  children,
  highlight,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <section
      id={id}
      className={`py-8 border-b border-black/10 dark:border-white/10 ${highlight ? "bg-danger/5 -mx-4 px-4 rounded-lg" : ""}`}
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-accent" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function CaseGroup({ title, emoji, cases }: { title: string; emoji: string; cases: import("@/lib/types").LegalCase[] }) {
  return (
    <div className="mb-6">
      <h4 className="font-bold mb-3">
        {emoji} {title} ({cases.length})
      </h4>
      <ol className="space-y-4">
        {cases.map((c, i) => (
          <li key={c.id} className="p-4 bg-card rounded-lg border border-black/5 dark:border-white/10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-semibold">{i + 1}. {c.title}</span>
              <Badge variant={c.severity === "serious" ? "danger" : "warning"}>{getCaseStatusLabel(c.status)}</Badge>
            </div>
            <p className="text-sm">{c.description}</p>
            {c.filedDate && <p className="text-xs text-muted mt-1">Filed: {c.filedDate}{c.resolvedDate && ` · Resolved: ${c.resolvedDate}`}</p>}
            <SourceLinks sources={c.sources} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function ProjectCard({ project, ongoing }: { project: import("@/lib/types").Project; ongoing?: boolean }) {
  return (
    <div className="mb-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <span>{ongoing ? "🔄" : "✅"}</span>
        <h4 className="font-bold">{project.name}</h4>
        {ongoing ? <Badge variant="warning">Ongoing</Badge> : <Badge variant="success">Completed</Badge>}
      </div>
      <p className="text-sm mt-2">{project.description}</p>
      {project.budget && <p className="text-sm mt-1"><strong>Budget:</strong> {project.budget}</p>}
      {project.impact && <p className="text-sm mt-1"><strong>Impact:</strong> {project.impact}</p>}
      {project.outcomes && (
        <ul className="text-sm mt-2 list-disc list-inside">
          {project.outcomes.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      )}
      <SourceLinks sources={project.sources} />
    </div>
  );
}
