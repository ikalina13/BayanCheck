import { notFound } from "next/navigation";
import Link from "next/link";
import { getCandidateBySlug } from "@/lib/data/candidates";
import { CandidateProfile } from "@/components/candidates/candidate-profile";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default async function CandidatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const candidate = getCandidateBySlug(slug);
  if (!candidate) notFound();

  return (
    <>
      <div className="bg-surface border-b px-4 py-3 print:hidden">
        <div className="mx-auto max-w-4xl flex flex-wrap gap-4 text-sm">
          <Link href="/candidates" className="text-accent hover:underline">← All Candidates</Link>
          <Link href={`/compare?ids=${candidate.id}`} className="text-accent hover:underline">Compare</Link>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 pt-6 print:hidden">
        <DisclaimerBanner />
      </div>
      <CandidateProfile candidate={candidate} />
    </>
  );
}
