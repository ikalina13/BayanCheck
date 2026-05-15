import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string) {
  return format(new Date(iso), "MMM d, yyyy h:mm a");
}

export function formatRelative(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    politics: "Philippine Politics & Government",
    business: "Business & Economics",
    technology: "Technology & Science",
    sports: "Sports",
    entertainment: "Entertainment",
    education: "Education",
    health: "Health",
    opinion: "Opinion & Analysis",
    regional: "Regional News",
  };
  return labels[category] ?? category;
}

export function getCaseStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    under_investigation: "Under Investigation",
    hearing: "Hearing Phase",
    dismissed: "Dismissed",
    convicted: "Convicted",
    resolved: "Resolved",
    allegation: "Allegation (Unverified)",
  };
  return labels[status] ?? status;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "clean":
      return "bg-success text-white";
    case "pending":
      return "bg-warning text-white";
    case "serious":
      return "bg-danger text-white";
    default:
      return "bg-muted text-foreground";
  }
}
