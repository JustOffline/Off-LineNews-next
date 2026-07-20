export type PlatformStatus = "banned" | "restricted" | "at-risk" | "monitoring";

export interface Platform {
  name: string;
  status: PlatformStatus;
  countries: string;
  detail: string;
  updated: string;
  sourceName: string;
  sourceUrl: string;
}

export type LegislationStatus =
  | "signed-law"
  | "in-force"
  | "passed"
  | "senate-passed"
  | "stalled"
  | "draft"
  | "active";

export interface Legislation {
  country: string;
  title: string;
  targets: string;
  status: LegislationStatus;
  date: string;
  sourceUrl: string;
}

export interface ChangelogEntry {
  id: string;
  date: string;
  pillar: string;
  entity: string;
  previousStatus: string;
  newStatus: string;
  detail: string;
  sourceUrl: string;
  published: boolean;
}
