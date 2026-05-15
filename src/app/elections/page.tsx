import Link from "next/link";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default function ElectionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">How to Vote in the Philippines</h1>
      <DisclaimerBanner />

      <section className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold">1. Register with COMELEC</h2>
          <p className="text-muted mt-2">
            Filipino citizens aged 18 and above must register with the Commission on Elections (COMELEC).
            Check your precinct and voter status on the official portal.
          </p>
          <a href="https://comelec.gov.ph" className="text-accent underline" target="_blank" rel="noopener noreferrer">
            comelec.gov.ph →
          </a>
        </div>

        <div>
          <h2 className="text-xl font-bold">2. Know your candidates</h2>
          <p className="text-muted mt-2">
            Use BayanCheck to review SALN disclosures, legal cases, project track records, and hearing attendance
            before election day. Compare up to three candidates side by side.
          </p>
          <Link href="/candidates" className="text-accent underline">Browse candidate profiles →</Link>
        </div>

        <div>
          <h2 className="text-xl font-bold">3. Election day</h2>
          <ul className="list-disc list-inside text-muted mt-2 space-y-1">
            <li>Bring valid ID accepted by COMELEC</li>
            <li>Vote during official polling hours for your area</li>
            <li>Follow poll workers&apos; instructions at your precinct</li>
            <li>Do not take photos of your ballot where prohibited</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold">4. Verify results</h2>
          <p className="text-muted mt-2">
            Rely only on official COMELEC canvass and accredited media. Be skeptical of viral screenshots
            claiming final results before official proclamation.
          </p>
        </div>
      </section>
    </div>
  );
}
