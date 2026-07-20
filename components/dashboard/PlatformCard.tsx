import type { Platform } from "@/lib/types";
import { PLATFORM_STATUS_META } from "@/lib/statusMeta";

export function PlatformCard({ platform }: { platform: Platform }) {
  const { glyph, label } = PLATFORM_STATUS_META[platform.status];

  return (
    <article className="flex flex-col gap-2 border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">{platform.name}</h3>
        <span className="flex items-center gap-1 text-xs font-medium tracking-wide">
          <span aria-hidden="true">{glyph}</span>
          {label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{platform.countries}</p>
      <p className="text-sm leading-relaxed">{platform.detail}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
        <span>Updated {platform.updated}</span>
        <a
          href={platform.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          {platform.sourceName} ↗
        </a>
      </div>
    </article>
  );
}
