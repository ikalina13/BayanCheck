"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchArticles } from "@/lib/data/news";
import { searchCandidates } from "@/lib/data/candidates";
import { NewsCard } from "@/components/news/news-card";
import { CandidateCard } from "@/components/candidates/candidate-card";

function SearchResults() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initial);

  const articles = searchArticles(query);
  const people = searchCandidates(query);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          window.history.replaceState(null, "", `/search?q=${encodeURIComponent(query)}`);
        }}
        className="flex gap-2 mb-10"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search news, candidates, parties..."
          className="flex-1 px-4 py-3 border rounded-lg bg-card text-lg"
        />
        <button type="submit" className="px-6 py-3 bg-accent text-white rounded-lg font-medium">
          Search
        </button>
      </form>

      {query && (
        <>
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Candidates ({people.length})</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {people.map((c) => (
                <CandidateCard key={c.id} candidate={c} />
              ))}
            </div>
            {people.length === 0 && <p className="text-muted">No candidates found.</p>}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">News ({articles.length})</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
            {articles.length === 0 && <p className="text-muted">No articles found.</p>}
          </section>
        </>
      )}

      {!query && (
        <p className="text-muted">
          Try searching for a candidate name, party, or news topic.{" "}
          <Link href="/candidates" className="text-accent underline">Browse candidates</Link>
        </p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
