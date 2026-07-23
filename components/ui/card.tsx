import * as React from "react";

import { cn } from "@/lib/utils";

// Deliberately not the shadcn-registry default styling (rounded/ring/bg-card)
// -- this exists to de-duplicate the flat "border + p-4" card convention
// already used across PlatformCard/NewsCard/ChangesPage, not to restyle it.
// `as` defaults to "div" but callers pass "article" to keep semantic HTML
// where a card represents one article/entry (matters for the SEO pass).
function Card({
  as: Component = "div",
  className,
  ...props
}: React.ComponentProps<"div"> & { as?: "div" | "article" }) {
  return (
    <Component
      data-slot="card"
      className={cn("flex flex-col gap-2 border border-border p-4", className)}
      {...props}
    />
  );
}

export { Card };
