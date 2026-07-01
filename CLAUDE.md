# CLAUDE.md — Off-Line® News v3

Role: You are acting as CTO and full-stack lead on this repo. Read this file in full before writing any code. It supersedes any earlier chat-generated mockup of this project — see §0.

---

## 0. Ground truth correction (read first)

An earlier planning pass in a different chat session produced a mock rebuild (`app.js`, `data/content.js`, a "v2" `README.md`) that was never actually built into the real repo. That mockup should be treated as a discarded sketch, not a base to build on.

The real repo, confirmed by direct file reads in a prior Claude Code session, is:

- A single `index.html` (~990 lines) with all CSS hand-written inline
- `scripts/fetch_news.py` + `.github/workflows/main.yml` — automates the News section only
- `SOURCES.md` — documents Platform Status Tracker and Legislation Tracker as hardcoded HTML, verified manually against primary evidence

This document plans a rebuild from that real state, not from the discarded mockup. If you (Claude Code, with repo access) find the actual state differs from this description, stop and reconcile before proceeding — don't silently build on top of an assumption.

---

## 1. Critique of the prior automation plan (SQLite corroboration engine)

A prior plan proposed: RSS-sourced signal detection → 2-source corroboration → auto-apply to `data/tracker.db` with no human review gate, replacing the manually-verified platform/legislation trackers.

What's sound, keep it as-is:

- SQLite schema (`platforms`, `legislation`, `status_signals`) — clean, normalized where it matters, appropriately loose where full normalization isn't worth it yet.
- Corroboration bar (2+ distinct sources within a 14-day window) before applying a change.
- Proximity-window mitigation (status keyword within ~8 tokens of the matched entity) for the "blocked" word-sense ambiguity problem.
- `status_signals` retention cleanup, audit-log print statements, alias tables, dedupe by `article_guid`.

What's genuinely risky, and worth reconsidering before this ships:

- **No human review before publish**, on claims about government bans and legislation. This is the single biggest liability surface in the whole plan. The plan's own text names "blocked" as its top false-positive risk — that's the system's own author flagging that confidence isn't fully there yet. A wrongly auto-published claim ("Country X banned Platform Y") is a factual, reputationally-loaded statement going out under the Off-Line® name with zero human in the loop, during a period when you're actively building the Off-Line/OFF-LINE GUY trademark and formal Pty Ltd structure. That's exactly the wrong moment to carry unreviewed publish risk.
  Recommendation: default to **PR-gated auto-apply** instead of direct-to-main commit. When the corroboration bar is met, `update_tracker.py` opens a PR (not a commit) with the proposed change, sources cited in the PR body, diffed against the current DB snapshot. One tap of "Merge" from the GitHub mobile app approves it — this costs you seconds per change, not a review cycle, while keeping a human as the actual publisher of record. Implement as a feature flag: `AUTO_PUBLISH=false` (PR-gated, default) / `AUTO_PUBLISH=true` (direct commit, available any time you decide the false-positive rate is low enough after a few months of PR logs to trust it). This is a one-line flip, not a rebuild — don't let this recommendation block starting the rest of the plan.
- **Binary DB in git**: `data/tracker.db` won't produce readable diffs. Cheap insurance: also emit `data/tracker.json` (human-readable export) on every write, committed alongside the binary. Costs one extra write call, makes every PR/commit diff-reviewable in GitHub's UI.

Everything else in the prior plan (schema, alias tables, workflow job ordering, build-order sequencing) carries forward unchanged into §7 below.

---

## 2. Critique of this message's requirements

**Next.js + Tailwind + shadcn/ui** — correct call, and directly answers your own stated reason ("dashboard templates, copy-paste components, autocomplete, small organized files"). Confirmed current as of mid-2026: shadcn/ui is not a package but a code generator — `npx shadcn add card` copies the component source into your repo, so there's nothing to silently update or break under you. As of the March 2026 CLI v4 release it also ships AI agent skills (`shadcn/skills`) purpose-built for coding agents like you — worth installing, since it gives you direct, structured access to component docs/registry instead of guessing prop names.

**Headless UI vs shadcn/ui** — these overlap (both wrap unstyled interactive primitives: dialogs, menus, tabs, comboboxes). shadcn/ui is built on Radix UI, which already covers everything this project needs. Recommendation: skip Headless UI entirely for v1. Only reach for it later if a specific accessible pattern shows up that shadcn's registry genuinely doesn't have — don't add it speculatively.

**Magic UI** — confirmed current, MIT-licensed, 150+ components, explicitly positioned as "landing page components," not application/dashboard UI (no data tables, forms, or nav patterns — that's shadcn's job). Recommendation: use Magic UI narrowly — hero section flourish, maybe an animated stat counter or a headline-marquee of latest items. Do not reach for it in the tracker tables, badges, or filter UI; those need to read fast and flat, which is a shadcn Table/Badge/Tabs job, not an animation job.

**"React updates just one chart without blinking"** — worth being precise about what this buys you, since the phrasing in the ask implies more than it is. This describes client-side re-render efficiency: switching a filter or tab re-renders only the affected DOM subtree, no full page reload, no flash. It does not mean live/real-time data — there's no websocket or push layer here, and there shouldn't be one; that would require a persistent backend and directly contradicts the "free, static, simple" constraint this whole project runs on. Data freshness stays bounded by the daily Action, same as today. If a real-time ticker is ever wanted, that's a distinct, materially bigger feature — flag it as a v4 idea, not part of this plan.

**Fonts: "all fonts Helvetica"** — literal Helvetica can't be safely web-embedded; the typeface is proprietary (Monotype), and most non-Apple devices don't have it installed. Recommendation: use the system font stack `font-family: "Helvetica Neue", Helvetica, Arial, sans-serif`. This is legally uncomplicated (you're referencing an OS-installed font, not embedding one), renders as true Helvetica on macOS/iOS and a very close match (Arial) everywhere else, and — bonus — removes the Google Fonts CDN dependency the earlier mockup had, which is a genuine improvement: zero third-party network requests, faster load, consistent with the "independent, no third-party, no ads" brand posture already in your footer copy.

**Black background / white text / system-sans as "a beginner design system"** — don't undersell this. For this specific brand ("no spin, just status"), a strict black/white/system-sans system reads as wire-service / terminal-of-record, which is more on-brand than the orange-accent dark-dashboard look from the earlier mockup. Endorse it as the actual design direction, not a placeholder to upgrade later. One open call for you: pure black/white/gray with status conveyed by icon + label text only (strict, disciplined, zero color-coding), vs. one restrained status accent color (helps fast visual scanning, since color-coded status is this product's whole value proposition). Both are documented in §5 — default is strict grayscale, flip is one token change.

**shadcn/ui + Magic UI + Tremor** — you didn't ask for Tremor, but it's worth naming: it's the standard 2026 answer for "analytics charts / KPI cards" in this exact stack combination (shadcn = app shell, Tremor = charts/KPIs, Magic UI = landing flourish). Recommendation: skip it for v1. shadcn's own Chart component now wraps Recharts directly (confirmed current), which covers the stat cards and any bar/line charts you need. Don't add a fourth UI dependency until Recharts-via-shadcn proves insufficient.

**SQLite for "article storage"** — the prior plan's `tracker.db` only stores tracked entities (platforms, legislation), not the underlying article corpus. Extend the schema with an `articles` table (§6) so the zettelkasten view in §8 has a persistent, growing corpus to cluster against — not just whatever's in the last `news.json` snapshot.

**Zettelkasten cluster dashboard** — Magic UI is not a graph library, so this needs a dedicated force-directed graph renderer underneath it. Recommend `react-force-graph` (2D canvas mode) — mature, well-known, handles this project's scale (dozens to low hundreds of nodes) comfortably; `reagraph` (WebGL) is a fine alternative if node count grows past a few thousand later. For clustering logic, start rule-based (shared pillar + shared tags/entities + date proximity) — no ML dependency in CI, ships in this milestone. True semantic clustering (embeddings) is a natural v2, and there's a clean local-first path for it: you've already standardized on `nomic-embed-text` via Ollama for the local dev environment — run embedding + re-clustering as a periodic job on your own machine, commit the resulting cluster assignments, rather than adding an ML dependency to GitHub's cloud runners. Keeps the CI pipeline free of anything heavier than RSS parsing, and keeps the actual embedding compute on your own hardware, consistent with the local-first principle the rest of your stack is built on.

---

## 3. Final stack decision

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router), TypeScript, React 19 | current stable; Server Components fit a build-time-rendered, mostly-static site well |
| Styling | Tailwind CSS v4 | current major version; CSS-first config, shadcn CLI v4 configures it automatically |
| Components | shadcn/ui (Radix-based primitives) | matches your own stated reason; copy-owned code, not a dependency |
| Motion/flourish | Magic UI, used narrowly (hero only) | not an app-shell library; don't let it touch tables/filters |
| Charts | shadcn Chart (Recharts under the hood) | already in the stack via shadcn, no 4th dependency |
| Graph viz | react-force-graph (2D) | dedicated force-directed graph, not something Magic UI or shadcn provide |
| Fonts | System stack: `"Helvetica Neue", Helvetica, Arial, sans-serif` | no licensing risk, no font CDN, on-brand |
| State | Server Components for data; useState/useReducer in Client Components for filters/interactivity | no Redux/Zustand needed at this scale — don't add one |
| Data store | SQLite (`data/tracker.db`) — platforms, legislation, articles, status_signals | binary file as source of truth, read at build time |
| DB access | better-sqlite3 (Node, read-only at build time) | synchronous, simplest option for build-time SQLite reads |
| Fetch/corroboration | Python (carried over from prior plan, extended with articles writes) | no reason to rewrite working RSS/corroboration logic in JS |
| Hosting | GitHub Pages via `output: 'export'` — **resolved, §10** | purely GitHub-native, no third-party host/account, no server infra beyond what's already in use for the rest of this project |
| CI | GitHub Actions | fetch/corroborate (Python) → build (Next.js reads DB) → deploy |

**Resolved 2026-07-01 — GitHub-native only.** GitHub Pages can only serve one live deployment per repo, so the `nextjs-rebuild` branch's shell is reviewed locally (`npm run dev` / `npm run build` + static preview) during development, not via a hosted preview URL. `main` stays on its existing `.github/workflows/main.yml` pipeline (hand-written `index.html`, daily Python fetch, deploy to `justoffline.github.io/Off-LineNews`) until the rebuild is ready to cut over. The `nextjs-deploy.yml` GitHub Actions workflow added during Phase 1 (`workflow_dispatch`-only, builds the static export and deploys to GitHub Pages via `actions/deploy-pages`) is the actual production deploy path once the rebuild is ready — running it replaces the live site's content, so it should stay manual-trigger-only until then, not wired to `push`/`cron`.

---

## 4. Repo structure

```
app/
  layout.tsx                 root layout, font stack, metadata
  page.tsx                   home / signal board (platforms + legislation + hero)
  surveillance/page.tsx
  cognition/page.tsx
  privacy/page.tsx
  opensource/page.tsx
  zettelkasten/page.tsx      cluster dashboard
  methodology/page.tsx
components/
  ui/                        shadcn-generated — button.tsx, card.tsx, badge.tsx,
                              table.tsx, tabs.tsx, sheet.tsx, command.tsx, chart.tsx …
  magic/                     the 2–3 selected Magic UI components (hero only)
  dashboard/
    Sidebar.tsx
    StatCard.tsx
    IntersectionChart.tsx    time × pillar dashboard (shadcn Chart/Recharts)
    ZettelkastenGraph.tsx    react-force-graph wrapper
    NewsCard.tsx
    StatusBadge.tsx
    SourceFilter.tsx
  layout/
    Header.tsx
    Footer.tsx
lib/
  db.ts                      better-sqlite3 connection + typed query helpers
  types.ts                   Platform, Legislation, Article, Signal, Pillar types
  clustering.ts              rule-based cluster assignment (§2, zettelkasten)
  utils.ts                   timeAgo, formatDate, cn()
data/
  tracker.db                 committed binary — source of truth
  tracker.json               committed human-readable snapshot (diff insurance)
scripts/                     Python — unchanged home from the prior plan
  db.py
  migrate_seed_db.py         one-time: seed tracker.db from the real index.html's
                              12 platform cards / 11 legislation rows
  fetch_news.py               extended: also writes to the new `articles` table
  update_tracker.py          corroboration engine, PR-gated by default (§1)
  cluster_articles.py        new — rule-based zettelkasten clustering
  run_daily.py                orchestrator: fetch once → render → cluster → tracker update
.github/workflows/
  main.yml                   fetch/corroborate → build → deploy, extended (§7)
SOURCES.md                    rewritten to describe the actual automated process (§7, phase 8)
```

---

## 5. Design tokens

```ts
// tailwind.config.ts (or CSS-first `@theme` block under Tailwind v4 — shadcn init sets this up)
colors: {
  ink:   "#000000",   // background
  paper: "#ffffff",   // primary text
  line:  "#1a1a1a",   // hairline borders on black
  dim:   "#8a8a8a",   // secondary text
  // status — see the strict-grayscale-vs-accent call below
},
fontFamily: {
  sans: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
},
```

**Status representation** — default is strict grayscale + label + icon, not color-coding:
`● BANNED / ▲ RESTRICTED / △ AT RISK / ○ MONITORING` — weight and glyph carry the distinction, not hue. This is the literal "black background, white text" ask taken seriously, and it's a real, disciplined Swiss/wire-service choice, not a placeholder.

Alternate, if fast visual scanning matters more to you than strict two-tone: add one restrained accent (e.g. a single warm red used only on BANNED/IN_FORCE-severity items, nothing else in the palette) — status-scanning is this product's core value proposition, and pure grayscale costs the reader a half-second of reading per card instead of a glance. This is a one-token change in the config above, not a rebuild — make the call either way and note it in `data/tracker.json`'s schema comment so it's documented.

---

## 6. Data model additions

```sql
-- New table — not in the prior plan, needed for the zettelkasten view
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    source_name TEXT NOT NULL,
    pillar TEXT NOT NULL,              -- platforms | surveillance | cognition | privacy | opensource
    tags TEXT,                         -- comma-separated, cheap v1 — normalize later if it earns it
    published_date TEXT NOT NULL,
    cluster_id INTEGER,                -- FK-ish, set by cluster_articles.py
    fetched_at TEXT NOT NULL
);

CREATE TABLE clusters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,               -- derived from dominant shared tags
    pillar_mix TEXT NOT NULL,          -- which pillars this cluster spans — the "intersection" signal
    created_at TEXT NOT NULL
);
```

(`platforms`, `legislation`, `status_signals` carry over unchanged from the prior plan — see that document for the full DDL, not repeated here.)

Clustering rule (v1, rule-based, in `cluster_articles.py`): group articles into the same cluster when they share ≥2 of {pillar, tag, entity-in-title} within a rolling 14-day window. Recompute nightly as part of `run_daily.py`, don't try to make it incremental yet — the corpus is small enough that a full recompute each night is cheap.

---

## 7. Build phases

1. **Scaffold** — `create-next-app`, `shadcn init` (choose the system-sans + black/white tokens from §5 during init), no data wiring yet. Confirm the shell renders locally and builds cleanly for GitHub Pages static export (§3, §9) before touching data.
2. **Schema + migration** — `scripts/db.py`, `scripts/migrate_seed_db.py`. Seed from the real `index.html`'s 12 platform cards / 11 legislation rows. Manually diff the migration script's printed summary against the live site — this is the check that the migration didn't lose or mangle anything.
3. **DB → UI read path** — `lib/db.ts`, replace hardcoded platform/legislation HTML with Server Components reading `tracker.db` at build time. This proves the DB→page pipeline works before automation touches it — isolates "does rendering from SQLite work" from "does the corroboration engine work."
4. **Corroboration engine** — port `update_tracker.py` from the prior plan, PR-gated by default (`AUTO_PUBLISH=false`), proximity-window matching included from day one, not retrofitted.
5. **Articles table + zettelkasten** — `cluster_articles.py` (rule-based), `ZettelkastenGraph.tsx` (react-force-graph), `/zettelkasten` page.
6. **shadcn component pass** — Sidebar, Card, Table, Badge, Tabs, Command (palette-style filter/search across pillars — a natural fit given shadcn ships this component already).
7. **Magic UI, narrowly** — hero section only, per §2.
8. **CI assembly** — extend `.github/workflows/main.yml`: fetch-and-corroborate (Python) → build (Node, better-sqlite3 reads tracker.db) → deploy. Job ordering is load-bearing here — build must run after the fetch job pushes, or Tailwind/Next's static generation won't see that day's new DB rows. Rewrite `SOURCES.md` to accurately describe the automated, PR-gated process — the current "verified manually" language becomes false the moment this ships, so this isn't optional polish.
9. **Dry run** — trigger via `workflow_dispatch` on a branch before trusting the daily cron. Manually click through every filter/tab, confirm the graph renders, confirm a synthetic 2-source signal correctly opens a PR (not a direct commit) with sources cited.

---

## 8. Guardrails (carry forward, non-negotiable)

- Original-language summaries only — never reproduce third-party article text.
- One outbound link per source per card; no CHT or other third-party branding anywhere in code, copy, or metadata.
- `AUTO_PUBLISH` defaults to `false`. Don't flip it without an explicit, separate decision once PR logs exist to justify it.
- Don't invent or guess RSS URLs — verify each source feed actually resolves before adding it to the source list.
- Preserve `data-*` attributes on any ported filter markup if legacy filter JS logic is reused — silently dropping them breaks filtering with no visible error, which was already flagged once as the highest-risk step in the prior plan and remains true here.

---

## 9. GitHub Pages deploy config

```ts
// next.config.ts
const repoName = "Off-LineNews";
const isProd = process.env.NODE_ENV === "production";
export default {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,
};
```

Also required: a `.nojekyll` file in `/public` (GitHub's Jekyll processor otherwise eats the `_next/` folder), and GitHub Pages source set to **GitHub Actions**, not "Deploy from a branch."

---

## 10. Open calls for you (defaults assumed above, flip any of these in one line)

| Decision | Default assumed here | Alternative |
|---|---|---|
| ~~Hosting~~ | **Resolved: GitHub Pages** (§9), purely GitHub-native — no third-party host. Reviewed locally during development; `nextjs-deploy.yml` (`workflow_dispatch`-only) is the eventual cutover path (§3) | — |
| Auto-publish | PR-gated (`AUTO_PUBLISH=false`) | Direct-to-main, as originally specced |
| Status color | Strict black/white/grayscale + icon | One restrained accent color for severity |
| `tracker.db` diffs | Also commit `tracker.json` snapshot | Binary-only, rely on audit-log prints |
