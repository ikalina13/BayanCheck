import Link from "next/link";
import { NewsCard } from "@/components/news/news-card";
import { CandidateCard } from "@/components/candidates/candidate-card";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { newsArticles, getTrendingArticles } from "@/lib/data/news";
import { candidates } from "@/lib/data/candidates";
import { getCategoryLabel } from "@/lib/utils";
import { ArrowRight, Shield, Newspaper } from "lucide-react";

export default function HomePage() {
  const breaking = newsArticles.filter((a) => a.isBreaking);
  const hero = breaking[0] ?? newsArticles[0];
  const trending = getTrendingArticles(5);
  const featuredCandidates = candidates.slice(0, 4);

  const categories = [
    "politics",
    "business",
    "technology",
    "sports",
  ] as const;

  return (
    <div>
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-accent font-semibold uppercase tracking-wide text-sm mb-2">
                For Filipino Voters
              </p>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight text-balance">
                Verified News. Transparent Candidate Records.
              </h1>
              <p className="mt-4 text-white/80 text-lg max-w-xl">
                BayanCheck combines Rappler-style news coverage with comprehensive, source-linked
                background checks on political candidates — including controversies we never hide.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/candidates"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-3 rounded-md font-semibold transition-colors"
                >
                  <Shield className="h-5 w-5" />
                  Check a Candidate
                </Link>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-3 rounded-md font-semibold transition-colors"
                >
                  <Newspaper className="h-5 w-5" />
                  Latest News
                </Link>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 [&_*]:text-foreground">
              <DisclaimerBanner />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-1 h-8 bg-accent" />
              Breaking & Top Stories
            </h2>
            <Link href="/news" className="text-accent text-sm font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <NewsCard article={hero} featured />
            {newsArticles.slice(1, 5).map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {categories.map((cat) => {
              const articles = newsArticles.filter((a) => a.category === cat).slice(0, 3);
              if (articles.length === 0) return null;
              return (
                <section key={cat}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{getCategoryLabel(cat)}</h2>
                    <Link href={`/news?category=${cat}`} className="text-sm text-accent hover:underline">
                      More
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {articles.map((a) => (
                      <NewsCard key={a.id} article={a} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <aside className="space-y-8">
            <section className="bg-card rounded-lg border border-black/5 dark:border-white/10 p-5">
              <h3 className="font-bold text-lg mb-4">Trending Now</h3>
              <ol className="space-y-4">
                {trending.map((a, i) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="text-2xl font-bold text-accent/40">{i + 1}</span>
                    <div>
                      <Link href={`/news/${a.id}`} className="font-medium text-sm hover:text-accent line-clamp-2">
                        {a.title}
                      </Link>
                      <p className="text-xs text-muted mt-1">{a.viewCount.toLocaleString()} views</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-4">Featured Candidates</h3>
              <div className="space-y-3">
                {featuredCandidates.map((c) => (
                  <CandidateCard key={c.id} candidate={c} />
                ))}
              </div>
              <Link
                href="/candidates"
                className="mt-4 block text-center text-accent font-medium text-sm hover:underline"
              >
                Browse all candidates →
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
