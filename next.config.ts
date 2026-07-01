import type { NextConfig } from "next";

// GitHub Pages fallback (CLAUDE.md §9) — static export served from
// justoffline.github.io/Off-LineNews, so asset URLs need the repo
// name as a base path in production.
const repoName = "Off-LineNews";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
