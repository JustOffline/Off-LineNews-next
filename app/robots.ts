import type { MetadataRoute } from "next";

const BASE_URL = "https://justoffline.github.io/Off-LineNews-next";

// Required under output:"export" -- Next can't infer this route is
// static-safe on its own, and the build fails without it (verified).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
