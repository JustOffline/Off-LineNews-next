import type { MetadataRoute } from "next";

// Static export site, fixed deploy target (next.config.ts) — hardcoded base
// URL matches that file's own `repoName` convention rather than deriving it
// at request time, since there is no request time for a static export.
const BASE_URL = "https://justoffline.github.io/Off-LineNews-next";

// Required under output:"export" -- Next can't infer this route is
// static-safe on its own, and the build fails without it (verified).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/news", "/changes"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}/`,
    lastModified: new Date(),
  }));
}
