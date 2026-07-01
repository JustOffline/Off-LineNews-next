import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Global Signal Board
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Off-Line® News
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        No spin. Just status. Rebuild in progress — data wiring lands in the
        next phase.
      </p>
      <Button variant="secondary">Shell deployed</Button>
    </div>
  );
}
