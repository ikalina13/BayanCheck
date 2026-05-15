import { NextResponse } from "next/server";
import { newsArticles } from "@/lib/data/news";

export const revalidate = 1800;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const source = searchParams.get("source");

  let articles = [...newsArticles];
  if (category) articles = articles.filter((a) => a.category === category);
  if (source) articles = articles.filter((a) => a.source === source);

  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    count: articles.length,
    articles,
    note: "Connect NEWS_API_KEY in production for live aggregation from Rappler, ABS-CBN, GMA, Inquirer, and other sources.",
  });
}
