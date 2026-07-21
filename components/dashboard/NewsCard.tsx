import type { Article } from "@/lib/types";

function formatDate(iso: string): string {
  if (!iso) return "Recent";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recent";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function NewsCard({ article }: { article: Article }) {
  return (
    <article className="flex flex-col gap-2 border border-border p-4">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{article.source}</span>
        <span>{formatDate(article.date)}</span>
      </div>
      <h3 className="text-sm font-semibold tracking-tight">
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          {article.title}
        </a>
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="border border-border px-1.5 py-0.5 uppercase tracking-wide">
              {tag}
            </span>
          ))}
        </div>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap underline underline-offset-2 hover:text-foreground"
        >
          Read ↗
        </a>
      </div>
    </article>
  );
}
