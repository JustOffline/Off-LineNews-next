import { PlatformCard } from "@/components/dashboard/PlatformCard";
import { LegislationRow } from "@/components/dashboard/LegislationRow";
import { platforms } from "@/lib/platforms";
import { legislation } from "@/lib/legislation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Home() {
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
    </div>
  );
}
