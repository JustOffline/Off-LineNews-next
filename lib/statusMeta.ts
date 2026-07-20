import type { LegislationStatus, PlatformStatus } from "@/lib/types";

export const PLATFORM_STATUS_META: Record<PlatformStatus, { glyph: string; label: string }> = {
  banned: { glyph: "●", label: "BANNED" },
  restricted: { glyph: "▲", label: "RESTRICTED" },
  "at-risk": { glyph: "△", label: "AT RISK" },
  monitoring: { glyph: "○", label: "MONITORING" },
};

// Maturity ladder reused from PLATFORM_STATUS_META: filled glyph = settled/in
// effect now, open glyph = not yet in effect. "stalled" isn't a maturity level
// (it's a frozen/off-track state), so it gets its own glyph rather than being
// squeezed onto the ladder.
export const LEGISLATION_STATUS_META: Record<LegislationStatus, { glyph: string; label: string }> = {
  "signed-law": { glyph: "●", label: "SIGNED LAW" },
  "in-force": { glyph: "●", label: "IN FORCE" },
  active: { glyph: "●", label: "ACTIVE" },
  passed: { glyph: "▲", label: "PASSED" },
  "senate-passed": { glyph: "△", label: "SENATE PASSED" },
  draft: { glyph: "○", label: "DRAFT" },
  stalled: { glyph: "◇", label: "STALLED" },
};
