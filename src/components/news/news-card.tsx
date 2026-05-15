import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "@/lib/types";
import { formatRelative, getCategoryLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function NewsCard({ article, featured = false }: { article: NewsArticle; featured?: boolean }) {
  return (
    <article
      className={cn(
        "group bg-card rounded-lg overflow-hidden shadow-sm border border-black/5 dark:border-white/10 hover:shadow-md transition-shadow",
        featured && "md:col-span-2 md:row-span-2"
      )}
    >
      <Link href={`/news/${article.id}`} className="block">
        <div className={cn("relative overflow-hidden bg-surface", featured ? "aspect-[16/9]" : "aspect-video")}>
          <Image
            src={article.imageUrl}
            alt=""
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={featured ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 100vw, 33vw"}
          />
          {article.isBreaking && (
            <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2 py-1 uppercase">
              Breaking
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted mb-2">
            <span className="text-accent font-semibold uppercase">{getCategoryLabel(article.category)}</span>
            <span>·</span>
            <span>{article.source}</span>
            <span>·</span>
            <time dateTime={article.publishedAt}>{formatRelative(article.publishedAt)}</time>
          </div>
          <h3
            className={cn(
              "font-bold leading-snug group-hover:text-accent transition-colors",
              featured ? "text-2xl md:text-3xl" : "text-lg"
            )}
          >
            {article.title}
          </h3>
          <p className="mt-2 text-sm text-muted line-clamp-2">{article.summary}</p>
        </div>
      </Link>
    </article>
  );
}
