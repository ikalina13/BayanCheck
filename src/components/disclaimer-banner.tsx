import { AlertCircle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="bg-warning/15 border border-warning/40 rounded-lg p-4 flex gap-3 text-sm" role="note">
      <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden />
      <div>
        <p className="font-semibold">Voter Education Disclaimer</p>
        <p className="mt-1 text-muted dark:text-white/70">
          BayanCheck aggregates publicly available information from official government sources and established news outlets.
          We do not endorse any candidate. Verify all information independently via{" "}
          <a href="https://comelec.gov.ph" className="text-accent underline" target="_blank" rel="noopener noreferrer">
            COMELEC
          </a>{" "}
          and official records. Allegations are clearly marked; outcomes are shown when available.
        </p>
      </div>
    </div>
  );
}
