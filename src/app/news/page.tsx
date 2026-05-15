import { Suspense } from "react";
import { NewsCard } from "@/components/news/news-card";
import { newsArticles } from "@/lib/data/news";
import { getCategoryLabel } from "@/lib/utils";
import { NewsFilters } from "@/components/news/news-filters";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; source?: string; q?: string }>;
}) {
  const params = await searchParams;
  let articles = [...newsArticles];

  if (params.category) {
    articles = articles.filter((a) => a.category === params.category);
  }
  if (params.source) {
    articles = articles.filter((a) => a.source === params.source);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q)
    );
  }

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Philippine News</h1>
      <p className="text-muted mb-6">
        Aggregated from Rappler, ABS-CBN, GMA, Inquirer, Manila Bulletin, Philstar, and more.
        Updates every 30 minutes.
      </p>
      <Suspense fallback={<div className="h-20 bg-surface rounded-lg animate-pulse mb-8" />}>
        <NewsFilters />
      </Suspense>
      {params.category && (
        <p className="text-sm mb-4">
          Showing: <strong>{getCategoryLabel(params.category)}</strong>
        </p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>
      {articles.length === 0 && (
        <p className="text-center text-muted py-12">No articles match your filters.</p>
      )}
    </div>
  );
}
