"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { parties, positions } from "@/lib/data/candidates";

export function CandidateFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/candidates?${params.toString()}`);
  };

  return (
    <div className="grid md:grid-cols-5 gap-3 my-6 p-4 bg-surface rounded-lg">
      <input
        type="search"
        placeholder="Name, party, position..."
        defaultValue={searchParams.get("q") ?? ""}
        onBlur={(e) => update("q", e.target.value)}
        className="md:col-span-2 px-3 py-2 border rounded-md bg-card text-sm"
      />
      <select
        defaultValue={searchParams.get("position") ?? ""}
        onChange={(e) => update("position", e.target.value)}
        className="px-3 py-2 border rounded-md bg-card text-sm"
      >
        <option value="">All Positions</option>
        {positions.map((p) => (
          <option key={p} value={p}>{p.replace("_", " ")}</option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("party") ?? ""}
        onChange={(e) => update("party", e.target.value)}
        className="px-3 py-2 border rounded-md bg-card text-sm"
      >
        <option value="">All Parties</option>
        {parties.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Region"
        defaultValue={searchParams.get("region") ?? ""}
        onBlur={(e) => update("region", e.target.value)}
        className="px-3 py-2 border rounded-md bg-card text-sm"
      />
    </div>
  );
}
