import articlesData from "@/data/articles.json";
import type { Article } from "@/lib/types";
import { NewsCard } from "@/components/dashboard/NewsCard";

const articles = articlesData as Article[];

export default function NewsPage() {
  const sorted = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));

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
