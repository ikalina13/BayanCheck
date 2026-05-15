import { Suspense } from "react";
import { CandidateCard } from "@/components/candidates/candidate-card";
import { CandidateFilters } from "@/components/candidates/candidate-filters";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { searchCandidates } from "@/lib/data/candidates";

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; position?: string; party?: string; region?: string; year?: string }>;
}) {
  const params = await searchParams;
  const list = searchCandidates(params.q ?? "", {
    position: params.position || undefined,
    party: params.party || undefined,
    region: params.region || undefined,
    year: params.year ? Number(params.year) : undefined,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Political Candidate Background Checker</h1>
      <p className="text-muted mb-6 max-w-2xl">
        Comprehensive profiles with SALN disclosures, cases, projects, and hearing records.
        Every claim links to verified sources. Controversies are never hidden.
      </p>
      <DisclaimerBanner />
      <Suspense fallback={<p className="my-6 text-muted">Loading filters...</p>}>
        <CandidateFilters />
      </Suspense>
      <p className="text-sm text-muted my-4">{list.length} candidate(s) found</p>
      <div className="grid md:grid-cols-2 gap-4">
        {list.map((c) => (
          <CandidateCard key={c.id} candidate={c} />
        ))}
      </div>
      {list.length === 0 && (
        <p className="text-center text-muted py-12">No candidates match your search.</p>
      )}
    </div>
  );
}
