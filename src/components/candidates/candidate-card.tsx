import Link from "next/link";
import Image from "next/image";
import type { Candidate } from "@/lib/types";
import { cn, getSeverityColor } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

const severityIcons = {
  clean: CheckCircle,
  pending: Clock,
  serious: AlertTriangle,
};

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  const Icon = severityIcons[candidate.issueSeverity];
  const seriousCount = candidate.cases.filter((c) => c.severity === "serious" && c.status !== "dismissed" && c.status !== "resolved").length;
  const pendingCount = candidate.cases.filter((c) => c.status === "pending" || c.status === "under_investigation" || c.status === "hearing").length;

  return (
    <Link
      href={`/candidates/${candidate.slug}`}
      className="block bg-card rounded-lg border border-black/5 dark:border-white/10 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="flex gap-4 p-4">
        <div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden bg-surface">
          <Image src={candidate.photoUrl} alt="" fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-lg leading-tight">{candidate.fullName}</h3>
              <p className="text-sm text-muted">{candidate.position} · {candidate.party}</p>
              {candidate.region && <p className="text-xs text-muted">{candidate.region}</p>}
            </div>
            <span className={cn("text-xs px-2 py-1 rounded-full shrink-0 flex items-center gap-1", getSeverityColor(candidate.issueSeverity))}>
              <Icon className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-2 text-sm line-clamp-2">{candidate.summary}</p>
          <div className="mt-2 flex gap-3 text-xs">
            {seriousCount > 0 && <span className="text-danger font-medium">🔴 {seriousCount} serious</span>}
            {pendingCount > 0 && <span className="text-warning font-medium">🟡 {pendingCount} pending</span>}
            {candidate.cases.length === 0 && <span className="text-success">No cases listed</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
