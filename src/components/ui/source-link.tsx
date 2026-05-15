import type { SourceRef } from "@/lib/types";
import { ExternalLink, FileText, Scale, Newspaper, ShieldCheck } from "lucide-react";

const icons = {
  official: ShieldCheck,
  news: Newspaper,
  court: Scale,
  factcheck: ShieldCheck,
  document: FileText,
};

export function SourceLinks({ sources }: { sources: SourceRef[] }) {
  return (
    <ul className="space-y-1 mt-2">
      {sources.map((s, i) => {
        const Icon = icons[s.type] ?? ExternalLink;
        return (
          <li key={i}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {s.label}
              <span className="text-muted text-xs">(accessed {s.accessedAt})</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
