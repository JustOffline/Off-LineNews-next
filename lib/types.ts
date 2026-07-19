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
