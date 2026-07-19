import type { Platform } from "./types";

// Hand-transcribed from index.html's #p-grid (12 .p-card entries) as of the
// Phase 1 rebuild's first content increment. No sync mechanism to index.html —
// this is a manual snapshot, expected to drift; the SQLite migration increment
// replaces this file entirely.
export const platforms: Platform[] = [
  {
    name: "TikTok",
    status: "at-risk",
    countries: "🇺🇸 US · 🇮🇳 India (banned) · 🇦🇺 AU (gov devices)",
    detail:
      "PAFACA signed Jan 2025 mandating ByteDance divestiture; enforcement delayed by injunctions. India permanently banned Jun 2020. Australia restricted government device access 2023. Florida AG filed suit Jun 2026 alleging exposure of minors to harmful content.",
    updated: "Jun 2026",
    sourceName: "Guardian",
    sourceUrl:
      "https://www.theguardian.com/us-news/2026/jun/15/florida-sues-tiktok-teen-social-media-access-law",
  },
  {
    name: "X / Twitter",
    status: "restricted",
    countries: "🇹🇷 Turkey · 🇧🇷 Brazil · 🇳🇬 Nigeria · 🇵🇰 Pakistan",
    detail:
      "Brazil suspended X in Aug 2024 over non-compliance with Supreme Court orders; restored Oct 2024 after local legal representative appointed. Turkey regularly throttles under Law No. 5651 during civil unrest. Nigeria blocked access for 7 months in 2021–22.",
    updated: "Jun 2026",
    sourceName: "OONI",
    sourceUrl: "https://ooni.org/reports/",
  },
  {
    name: "Instagram",
    status: "banned",
    countries: "🇮🇷 Iran · 🇨🇳 China · 🇷🇺 Russia (restricted)",
    detail:
      'Blocked in China since 2014 and Iran since 2014. Russia designated Meta an "extremist organisation" in 2022, restricting access to all Meta platforms including Instagram and Facebook.',
    updated: "Jun 2026",
    sourceName: "Freedom House",
    sourceUrl: "https://freedom.house/report/freedom-on-the-net",
  },
  {
    name: "Facebook",
    status: "banned",
    countries: "🇨🇳 China · 🇮🇷 Iran · 🇰🇵 North Korea · 🇷🇺 Russia · 🇲🇲 Myanmar",
    detail:
      "Blocked by China's Great Firewall since 2009. Myanmar blocked Feb 2021 following the military coup. Russia's extremist designation of Meta in 2022 added Facebook to the restricted list under Federal Law No. 149-FZ.",
    updated: "Jun 2026",
    sourceName: "Freedom House",
    sourceUrl: "https://freedomhouse.org/report/freedom-net/2024/fragile-freedoms",
  },
  {
    name: "YouTube",
    status: "restricted",
    countries: "🇨🇳 China · 🇮🇷 Iran · 🇷🇺 Russia (throttled)",
    detail:
      "Fully blocked in China and Iran. Russia began systematic throttling in 2024 as part of RuNet sovereignty measures; speeds reduced up to 40%. Active geo-restrictions on news content in multiple additional markets.",
    updated: "Jun 2026",
    sourceName: "NetBlocks",
    sourceUrl: "https://netblocks.org/",
  },
  {
    name: "Telegram",
    status: "restricted",
    countries: "🇧🇷 Brazil · 🇪🇸 Spain (temporary) · 🇮🇷 Iran",
    detail:
      "Brazil suspended Telegram in Aug 2024 for failing to remove illegal content; restored days later. Spain ordered a 5-day block in Mar 2024 amid a copyright dispute. CEO Pavel Durov arrested in France Aug 2024; released on bail pending trial.",
    updated: "Jun 2026",
    sourceName: "BBC",
    sourceUrl: "https://www.bbc.com/news/articles/c0jp84r9vwlo",
  },
  {
    name: "WhatsApp",
    status: "banned",
    countries: "🇨🇳 China · 🇰🇵 North Korea · 🇨🇺 Cuba (restricted)",
    detail:
      "Part of China's Great Firewall since 2017. North Korea prohibits all foreign internet platforms. Cuba has repeatedly blocked messaging apps during protest periods, including 2021 and 2024 civil unrest events.",
    updated: "Jun 2026",
    sourceName: "OONI",
    sourceUrl: "https://ooni.org/reports/",
  },
  {
    name: "LinkedIn",
    status: "banned",
    countries: "🇷🇺 Russia · 🇨🇳 China",
    detail:
      "Russia blocked LinkedIn in Nov 2016 under Federal Law No. 242-FZ for non-compliance with data localisation requirements — the first major Western platform blocked there. China blocked it in 2023 after Microsoft removed the social feed feature.",
    updated: "Jun 2026",
    sourceName: "RSF",
    sourceUrl: "https://rsf.org/en/index",
  },
  {
    name: "Twitch",
    status: "restricted",
    countries: "🇹🇷 Turkey · 🇨🇳 China · 🇰🇷 South Korea (partial)",
    detail:
      "Turkey blocked Twitch in Aug 2024 citing failure to appoint a local representative under Law No. 5651. Fully blocked in China. South Korea restricted streams broadcasting illegal online gambling content under Broadcasting Act enforcement.",
    updated: "Jun 2026",
    sourceName: "NetBlocks",
    sourceUrl: "https://netblocks.org/",
  },
  {
    name: "Bluesky",
    status: "monitoring",
    countries: "🇧🇷 Brazil (briefly blocked Aug 2024)",
    detail:
      "Brazil's Federal Supreme Court ordered Bluesky blocked in Aug 2024 for failing to appoint a legal representative. Block lifted within 72 hours after compliance. First significant legal test of the decentralised AT Protocol platform.",
    updated: "Jun 2026",
    sourceName: "TechCrunch",
    sourceUrl: "https://techcrunch.com/2024/08/30/brazil-blocks-bluesky/",
  },
  {
    name: "Pinterest",
    status: "banned",
    countries: "🇨🇳 China · 🇮🇷 Iran · 🇰🇵 North Korea",
    detail:
      "Part of China's Great Firewall with no compliance pathway. Blocked in Iran since 2012. Access prohibited in North Korea as part of its near-total civilian internet blackout — only a state-controlled domestic intranet is available.",
    updated: "Jun 2026",
    sourceName: "Freedom House",
    sourceUrl: "https://freedom.house/report/freedom-on-the-net",
  },
  {
    name: "Discord",
    status: "restricted",
    countries: "🇨🇳 China · 🇷🇺 Russia · 🇹🇷 Turkey (periodic)",
    detail:
      "Fully blocked in China. Russia has issued repeated block orders since 2023, citing Discord's failure to remove content deemed illegal under Russian information law. Turkey periodically throttles or blocks it during domestic civil unrest.",
    updated: "Jun 2026",
    sourceName: "OONI",
    sourceUrl: "https://ooni.org/reports/",
  },
];
