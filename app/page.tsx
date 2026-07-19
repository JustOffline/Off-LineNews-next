import { PlatformCard } from "@/components/dashboard/PlatformCard";
import { platforms } from "@/lib/platforms";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-10 px-6 py-16 sm:px-12">
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
    </div>
  );
}
