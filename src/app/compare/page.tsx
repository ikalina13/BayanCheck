"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { candidates } from "@/lib/data/candidates";
import { getSeverityColor, getCaseStatusLabel } from "@/lib/utils";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

function CompareContent() {
  const searchParams = useSearchParams();
  const initialIds = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const [selected, setSelected] = useState<string[]>(
    initialIds.length > 0 ? initialIds.slice(0, 3) : candidates.slice(0, 2).map((c) => c.id)
  );

  const selectedCandidates = candidates.filter((c) => selected.includes(c.id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Compare Candidates</h1>
      <p className="text-muted mb-6">Select up to 3 candidates for side-by-side comparison.</p>
      <DisclaimerBanner />

      <div className="mt-6 flex flex-wrap gap-2">
        {candidates.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => toggle(c.id)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              selected.includes(c.id) ? "bg-accent text-white border-accent" : "bg-card"
            }`}
          >
            {c.fullName.split(" ").slice(-1)[0]}
          </button>
        ))}
      </div>

      {selectedCandidates.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left border-b bg-surface w-40">Criteria</th>
                {selectedCandidates.map((c) => (
                  <th key={c.id} className="p-3 text-left border-b bg-surface min-w-[220px]">
                    <Link href={`/candidates/${c.slug}`} className="hover:text-accent font-bold">
                      {c.fullName}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Photo" candidates={selectedCandidates} render={(c) => (
                <div className="relative h-16 w-16 rounded-full overflow-hidden">
                  <Image src={c.photoUrl} alt="" fill className="object-cover" />
                </div>
              )} />
              <CompareRow label="Position" candidates={selectedCandidates} render={(c) => c.position} />
              <CompareRow label="Party" candidates={selectedCandidates} render={(c) => c.party} />
              <CompareRow label="Age" candidates={selectedCandidates} render={(c) => String(c.age)} />
              <CompareRow label="Years in service" candidates={selectedCandidates} render={(c) => String(c.yearsInPublicService)} />
              <CompareRow label="Issue severity" candidates={selectedCandidates} render={(c) => (
                <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(c.issueSeverity)}`}>{c.issueSeverity}</span>
              )} />
              <CompareRow label="Active serious cases" candidates={selectedCandidates} render={(c) =>
                String(c.cases.filter((x) => x.severity === "serious" && !["dismissed", "resolved"].includes(x.status)).length)
              } />
              <CompareRow label="Net worth (latest SALN)" candidates={selectedCandidates} render={(c) => c.saln[0]?.netWorth ?? "N/A"} />
              <CompareRow label="Completed projects" candidates={selectedCandidates} render={(c) => String(c.completedProjects.length)} />
              <CompareRow label="Hearing attendance" candidates={selectedCandidates} render={(c) =>
                c.hearings.attendanceRate != null ? `${c.hearings.attendanceRate}%` : "N/A"
              } />
              <CompareRow label="Top case" candidates={selectedCandidates} render={(c) =>
                c.cases[0] ? `${c.cases[0].title} (${getCaseStatusLabel(c.cases[0].status)})` : "None listed"
              } />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CompareRow({
  label,
  candidates: rows,
  render,
}: {
  label: string;
  candidates: typeof import("@/lib/data/candidates").candidates;
  render: (c: (typeof rows)[0]) => React.ReactNode;
}) {
  return (
    <tr className="border-b">
      <td className="p-3 font-medium text-muted">{label}</td>
      {rows.map((c) => (
        <td key={c.id} className="p-3 align-top">{render(c)}</td>
      ))}
    </tr>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading comparison...</p>}>
      <CompareContent />
    </Suspense>
  );
}
