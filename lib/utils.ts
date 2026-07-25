import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Rendered in UTC, not visitor-local time: this is a global feed about bans
// across timezones, and the fetch cron itself runs on UTC — showing
// visitor-local time would vary per reader and imply a false locality.
export function formatUtcDateTime(
  iso: string | null | undefined,
  opts: { seconds?: boolean } = {}
): string {
  if (!iso) return "Recent";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recent";
  const date = d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    ...(opts.seconds ? { second: "2-digit" as const } : {}),
    hour12: false,
    timeZone: "UTC",
  });
  return `${date}, ${time} UTC`;
}
