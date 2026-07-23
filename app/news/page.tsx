import type { Metadata } from "next";
import articlesData from "@/data/articles.json";
import type { Article } from "@/lib/types";
import { NewsCard } from "@/components/dashboard/NewsCard";

export const metadata: Metadata = {
  title: "News",
  description: "Real headlines on platform bans and internet freedom, fetched daily from public RSS sources.",
};

const articles = articlesData as Article[];

// ISO 8601 strings sort lexically, so plain string comparison finds the
// most recent fetch run without needing a separate top-level field that
// could drift out of sync with the per-article fetchedAt values.
function lastUpdated(items: Article[]): string | null {
  if (items.length === 0) return null;
  const max = items.reduce((latest, a) => (a.fetchedAt > latest ? a.fetchedAt : latest), items[0].fetchedAt);
  const d = new Date(max);
  if (Number.isNaN(d.getTime())) return null;
  const date = d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "UTC" });
  return `${date}, ${time} UTC`;
}

export default function NewsPage() {
  const sorted = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));
  const updated = lastUpdated(articles);

  return (
    <div className="flex flex-1 flex-col gap-10 px-6 py-16 sm:px-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Latest News
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          News
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Real headlines, fetched daily. No spin. Just status.
        </p>
        {updated && (
          <p className="text-xs text-muted-foreground">Last updated: {updated}</p>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="mx-auto text-sm text-muted-foreground">
          No articles fetched yet.
        </p>
      ) : (
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </section>
      )}
    </div>
  );
}
