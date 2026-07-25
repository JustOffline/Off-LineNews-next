import { PlatformCard } from "@/components/dashboard/PlatformCard";
import { LegislationRow } from "@/components/dashboard/LegislationRow";
import { NewsCard } from "@/components/dashboard/NewsCard";
import { Card } from "@/components/ui/card";
import { platforms } from "@/lib/platforms";
import { legislation } from "@/lib/legislation";
import articlesData from "@/data/articles.json";
import newsSeenData from "@/data/news-seen.json";
import changelogData from "@/data/changelog.json";
import type { Article, NewsSeenCache, ChangelogEntry } from "@/lib/types";
import { PLATFORM_STATUS_META, LEGISLATION_STATUS_META } from "@/lib/statusMeta";
import { formatUtcDateTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const articles = articlesData as Article[];
const newsSeen = newsSeenData as NewsSeenCache;
const changelog = changelogData as ChangelogEntry[];

const ALL_STATUS_META: Record<string, { glyph: string; label: string }> = {
  ...PLATFORM_STATUS_META,
  ...LEGISLATION_STATUS_META,
};

function statusMeta(status: string) {
  return ALL_STATUS_META[status] ?? { glyph: "?", label: status.toUpperCase() };
}

// ISO 8601 strings sort lexically, so plain string comparison finds the
// most recent fetch run without needing a separate top-level field that
// could drift out of sync with the per-article fetchedAt values.
function newestArticleAdded(items: Article[]): string | null {
  if (items.length === 0) return null;
  const max = items.reduce((latest, a) => (a.fetchedAt > latest ? a.fetchedAt : latest), items[0].fetchedAt);
  return formatUtcDateTime(max, { seconds: true });
}

export default function Home() {
  const sortedArticles = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));
  const newestArticle = newestArticleAdded(articles);
  const lastChecked = formatUtcDateTime(newsSeen.updated, { seconds: true });
  const sortedChangelog = [...changelog].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="flex flex-1 flex-col gap-16 px-6 py-16 sm:px-12">
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Global Signal Board
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Off-Line® News
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          No spin. Just status.
        </p>
      </div>
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => (
          <PlatformCard key={platform.name} platform={platform} />
        ))}
      </section>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Legislation Tracker
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Bill / Law</TableHead>
              <TableHead>Targets</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {legislation.map((item) => (
              <LegislationRow key={item.title} legislation={item} />
            ))}
          </TableBody>
        </Table>
      </section>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Latest News
          </h2>
          {newestArticle && (
            <p className="text-xs text-muted-foreground">Newest article added: {newestArticle}</p>
          )}
          <p className="text-xs text-muted-foreground">Last checked: {lastChecked}</p>
        </div>
        {sortedArticles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No articles fetched yet.</p>
        ) : (
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Status Changes
        </h2>
        {sortedChangelog.length === 0 ? (
          <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>
        ) : (
          sortedChangelog.map((entry) => {
            const prev = statusMeta(entry.previousStatus);
            const next = statusMeta(entry.newStatus);
            return (
              <Card as="article" key={entry.id}>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold tracking-tight">
                    {entry.entity}
                  </h3>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
                  <span className="flex items-center gap-1">
                    <span aria-hidden="true">{prev.glyph}</span>
                    {prev.label}
                  </span>
                  <span aria-hidden="true">→</span>
                  <span className="flex items-center gap-1">
                    <span aria-hidden="true">{next.glyph}</span>
                    {next.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{entry.detail}</p>
                <a
                  href={entry.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline underline-offset-2 hover:text-foreground"
                >
                  Source ↗
                </a>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}
