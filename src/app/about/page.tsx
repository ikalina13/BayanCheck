import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">About BayanCheck</h1>
      <DisclaimerBanner />

      <section className="mt-8 space-y-6 text-sm leading-relaxed">
        <p>
          BayanCheck is a voter education platform combining aggregated Philippine news with transparent
          political candidate background profiles. We do not endorse any candidate or political party.
        </p>

        <h2 id="disclaimer" className="text-xl font-bold">Disclaimer</h2>
        <ul className="list-disc list-inside space-y-2 text-muted">
          <li>Information is aggregated from publicly available government records and established news outlets.</li>
          <li>Allegations are distinguished from proven facts; case status is shown when available.</li>
          <li>Users must verify information independently via COMELEC and official agencies.</li>
          <li>We acknowledge corrections when source material is updated.</li>
        </ul>

        <h2 id="privacy" className="text-xl font-bold">Data Privacy (RA 10173)</h2>
        <p className="text-muted">
          We comply with the Philippine Data Privacy Act. We do not collect unnecessary personal contact
          information. Comment display names are optional and moderated. Analytics, if enabled in production,
          are anonymized.
        </p>

        <h2 id="sources" className="text-xl font-bold">Verified Sources</h2>
        <p className="text-muted mb-2">Government:</p>
        <ul className="list-disc list-inside text-muted space-y-1">
          <li><a href="https://comelec.gov.ph" className="text-accent underline" target="_blank" rel="noopener noreferrer">COMELEC</a></li>
          <li><a href="https://www.ombudsman.gov.ph" className="text-accent underline" target="_blank" rel="noopener noreferrer">Office of the Ombudsman</a></li>
          <li><a href="https://senate.gov.ph" className="text-accent underline" target="_blank" rel="noopener noreferrer">Senate of the Philippines</a></li>
          <li><a href="https://congress.gov.ph" className="text-accent underline" target="_blank" rel="noopener noreferrer">House of Representatives</a></li>
        </ul>
        <p className="text-muted mt-4 mb-2">News & fact-checking:</p>
        <ul className="list-disc list-inside text-muted space-y-1">
          <li>Rappler, ABS-CBN News, GMA News, Inquirer, Manila Bulletin, Philstar</li>
          <li>Vera Files, Rappler Fact Check</li>
          <li>Reuters, AP (cross-verification)</li>
        </ul>

        <h2 className="text-xl font-bold">Transparency Rules</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted">
          <li>Every claim links to a source with access date</li>
          <li>Case outcomes shown (pending, dismissed, convicted, resolved)</li>
          <li>Facts vs. allegations clearly labeled</li>
          <li>Last verified date on each candidate profile</li>
        </ol>
      </section>
    </div>
  );
}
