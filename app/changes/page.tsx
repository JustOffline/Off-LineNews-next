import type { Metadata } from "next";
import changelogData from "@/data/changelog.json";
import type { ChangelogEntry } from "@/lib/types";
import { PLATFORM_STATUS_META, LEGISLATION_STATUS_META } from "@/lib/statusMeta";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Status Changes",
  description: "Every tracker status change, in order, with source.",
};

const changelog = changelogData as ChangelogEntry[];

const ALL_STATUS_META: Record<string, { glyph: string; label: string }> = {
  ...PLATFORM_STATUS_META,
  ...LEGISLATION_STATUS_META,
};

function statusMeta(status: string) {
  return ALL_STATUS_META[status] ?? { glyph: "?", label: status.toUpperCase() };
}

export default function ChangesPage() {
  const entries = [...changelog].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="flex flex-1 flex-col gap-10 px-6 py-16 sm:px-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Changelog
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Status Changes
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Every tracker status change, in order, with source.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="mx-auto text-sm text-muted-foreground">
          No status changes recorded yet.
        </p>
      ) : (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {entries.map((entry) => {
            const prev = statusMeta(entry.previousStatus);
            const next = statusMeta(entry.newStatus);
            return (
              <Card as="article" key={entry.id}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold tracking-tight">
                    {entry.entity}
                  </h2>
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
          })}
        </section>
      )}
    </div>
  );
}
