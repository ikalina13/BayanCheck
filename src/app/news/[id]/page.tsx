import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/data/news";
import { formatDate, getCategoryLabel } from "@/lib/utils";
import { ArticleComments } from "@/components/news/article-comments";
import { ShareButtons } from "@/components/news/share-buttons";
import { ExternalLink } from "lucide-react";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="text-sm text-muted mb-4">
        <Link href="/news" className="hover:text-accent">News</Link>
        <span> / </span>
        <span>{getCategoryLabel(article.category)}</span>
      </div>
      {article.isBreaking && (
        <span className="inline-block bg-accent text-white text-xs font-bold px-2 py-1 mb-3 uppercase">Breaking</span>
      )}
      <h1 className="text-3xl md:text-4xl font-bold leading-tight">{article.title}</h1>
      <p className="mt-4 text-muted flex flex-wrap gap-2 items-center">
        <span className="font-medium text-foreground">{article.source}</span>
        <span>·</span>
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        {article.author && (
          <>
            <span>·</span>
            <span>{article.author}</span>
          </>
        )}
      </p>
      <div className="relative aspect-video mt-6 rounded-lg overflow-hidden">
        <Image src={article.imageUrl} alt="" fill className="object-cover" priority />
      </div>
      <p className="mt-6 text-lg font-medium leading-relaxed">{article.summary}</p>
      <div className="mt-6 prose prose-sm max-w-none dark:prose-invert">
        {article.content.split("\n").map((p, i) => (
          <p key={i} className="mb-4 text-base leading-relaxed">{p}</p>
        ))}
      </div>
      <div className="mt-8 p-4 bg-surface rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Read full article at source</p>
          <p className="text-xs text-muted">Always verify with the original publisher</p>
        </div>
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          {article.source} <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <ShareButtons title={article.title} />
      <ArticleComments articleId={article.id} />
    </article>
  );
}
