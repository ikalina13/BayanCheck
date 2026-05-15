"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

const categories = [
  { value: "", label: "All Categories" },
  { value: "politics", label: "Politics" },
  { value: "business", label: "Business" },
  { value: "technology", label: "Technology" },
  { value: "sports", label: "Sports" },
  { value: "entertainment", label: "Entertainment" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "opinion", label: "Opinion" },
  { value: "regional", label: "Regional" },
];

const sources = [
  { value: "", label: "All Sources" },
  { value: "Rappler", label: "Rappler" },
  { value: "ABS-CBN News", label: "ABS-CBN" },
  { value: "GMA News Online", label: "GMA" },
  { value: "Philippine Daily Inquirer", label: "Inquirer" },
  { value: "Manila Bulletin", label: "Manila Bulletin" },
  { value: "Philstar Global", label: "Philstar" },
];

export function NewsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/news?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    update("q", q);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-surface rounded-lg">
      <form onSubmit={handleSearch} className="flex flex-1 gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search headlines..."
          className="flex-1 px-4 py-2 rounded-md border bg-card text-sm"
        />
        <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md">
          <Search className="h-4 w-4" />
        </button>
      </form>
      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
        className="px-3 py-2 rounded-md border bg-card text-sm"
      >
        {categories.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <select
        value={searchParams.get("source") ?? ""}
        onChange={(e) => update("source", e.target.value)}
        className="px-3 py-2 rounded-md border bg-card text-sm"
      >
        {sources.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
