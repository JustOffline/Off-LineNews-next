import type { Legislation } from "@/lib/types";
import { LEGISLATION_STATUS_META } from "@/lib/statusMeta";
import { TableCell, TableRow } from "@/components/ui/table";

export function LegislationRow({ legislation }: { legislation: Legislation }) {
  const { glyph, label } = LEGISLATION_STATUS_META[legislation.status];

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
        {legislation.country}
      </TableCell>
      <TableCell className="max-w-xs whitespace-normal text-sm">
        <a
          href={legislation.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          {legislation.title}
        </a>
      </TableCell>
      <TableCell className="max-w-[12rem] whitespace-normal text-xs text-muted-foreground">
        {legislation.targets}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <span className="flex items-center gap-1 text-xs font-medium tracking-wide">
          <span aria-hidden="true">{glyph}</span>
          {label}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
        {legislation.date}
      </TableCell>
    </TableRow>
  );
}
