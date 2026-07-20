import type { Legislation } from "./types";

// Hand-transcribed from index.html's #l-table (10 .l-row entries) as of the
// Legislation Tracker content increment. No sync mechanism to index.html —
// this is a manual snapshot, expected to drift; the SQLite migration increment
// replaces this file entirely.
export const legislation: Legislation[] = [
  {
    country: "🇺🇸 United States",
    title: "PAFACA — Protecting Americans from Foreign Adversary Controlled Applications Act",
    targets: "TikTok / ByteDance",
    status: "signed-law",
    date: "Apr 2024",
    sourceUrl: "https://www.congress.gov/bill/118th-congress/house-bill/7521",
  },
  {
    country: "🇪🇺 European Union",
    title: "Digital Services Act (DSA)",
    targets: "All large platforms (VLOPs)",
    status: "in-force",
    date: "Feb 2024",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package",
  },
  {
    country: "🇬🇧 United Kingdom",
    title: "Online Safety Act 2023",
    targets: "All platforms & services",
    status: "in-force",
    date: "Oct 2023",
    sourceUrl: "https://www.legislation.gov.uk/ukpga/2023/50/contents/enacted",
  },
  {
    country: "🇦🇺 Australia",
    title: "Online Safety Amendment — Social Media Minimum Age Act",
    targets: "Social platforms (under-16s)",
    status: "passed",
    date: "Nov 2024",
    sourceUrl: "https://www.esafety.gov.au/industry/social-media-minimum-age",
  },
  {
    country: "🇧🇷 Brazil",
    title: "PL 2630 — Fake News / Disinformation Bill",
    targets: "Social platforms",
    status: "stalled",
    date: "Pending 2024",
    sourceUrl: "https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2256735",
  },
  {
    country: "🇺🇸 United States",
    title: "KOSA — Kids Online Safety Act",
    targets: "Platforms with minor users",
    status: "senate-passed",
    date: "Jul 2024",
    sourceUrl: "https://www.congress.gov/bill/118th-congress/senate-bill/1409",
  },
  {
    country: "🇮🇳 India",
    title: "Digital Personal Data Protection Act 2023",
    targets: "All data processors & platforms",
    status: "passed",
    date: "Aug 2023",
    sourceUrl: "https://www.meity.gov.in/data-protection-framework",
  },
  {
    country: "🇿🇦 South Africa",
    title: "Online Safety Bill (draft)",
    targets: "Social media platforms",
    status: "draft",
    date: "2024–2025",
    sourceUrl: "https://www.gov.za/documents/film-and-publication-act",
  },
  {
    country: "🇷🇺 Russia",
    title: "Internet Sovereignty Law — RuNet (Federal Law No. 90-FZ)",
    targets: "All foreign platforms",
    status: "active",
    date: "2019 (ongoing)",
    sourceUrl: "https://digital.gov.ru/en/events/39468/",
  },
  {
    country: "🇨🇳 China",
    title: "Cybersecurity Law + Algorithm Recommendations Regulations",
    targets: "All platforms operating in China",
    status: "active",
    date: "2017 + 2022",
    sourceUrl: "https://www.cac.gov.cn/2022-01/04/c_1642894308944214.htm",
  },
];
