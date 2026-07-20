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

### 0.1 Phase 1 status: complete (this repo is now the active working repo)

The migration described in the old §11 runbook is done. `Off-LineNews-next` exists on GitHub, is public, has GitHub Pages enabled (Source: GitHub Actions), and `.github/workflows/nextjs-deploy.yml` deploys the Next.js static export on every push to `main`. Live at `https://justoffline.github.io/Off-LineNews-next/`. All future work happens in this repo, not in `D:\Justin\OneDrive\Documents\Off-LineNews` (production, untouched, see §10.1).

**Two incidents worth knowing about, since they're the kind of mistake easy to repeat:**

1. **Don't scaffold a rebuild inside the production repo's working directory, even on a branch, without pruning before pushing elsewhere.** Phase 1 scaffolding happened as a branch inside production's folder, and that branch's full file tree — including production's `.github/workflows/main.yml` and `scripts/fetch_news.py` — got carried into this repo when the branch was pushed here. Consequence: the old production news-bot workflow ran on its normal daily cron *inside this rebuild repo* for two weeks (2026-07-05 through 2026-07-19) before anyone noticed, auto-committing news mutations to `index.html` here. Fixed by deleting `.github/workflows/main.yml`, `scripts/fetch_news.py`, `scripts/seen_guids.json`, and the stray root `daily-update.yml`/`fetch_news.py`/`requirements.txt` duplicates (commit `3146ce7`). `index.html`/`SOURCES.md` stay — they're still needed as the read-only migration source for Phase 2 (§7 step 2).
2. **`actions/configure-pages@v5` will not auto-create a Pages site that's never existed**, despite its `enablement` default suggesting it should. The one-time fix is manual: repo → Settings → Pages → Source → **GitHub Actions**. No `gh` CLI or API call needed. This applies per-repo — if production's Pages ever gets disabled (e.g. by a visibility change), it needs the identical one-time toggle, independent of this repo.

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
| Hosting | GitHub Pages (static export) — resolved 2026-07, see §10.1 | — |
| CI | GitHub Actions | fetch/corroborate (Python) → build (Next.js reads DB) → deploy |

**Hosting, resolved:** GitHub Pages, `output: 'export'` (exact config in §9). No Vercel, no third-party host — stays entirely inside GitHub, matching the rest of this toolchain. The one real cost of static export is losing server-side features (API routes, on-request SQLite queries) if this product ever needs them — not a concern at this scale, since all data-fetching happens at build time regardless of host. See §10.1 for how the rebuild stays isolated from the live production URL without Vercel's branch-preview mechanism.

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
                              12 platform cards / 10 legislation rows
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

1. **Scaffold** — `create-next-app`, `shadcn init` (choose the system-sans + black/white tokens from §5 during init), no data wiring yet. Confirm the shell renders and deploys (to Vercel or GH Pages per §3) before touching data.
2. **Schema + migration** — `scripts/db.py`, `scripts/migrate_seed_db.py`. Seed from the real `index.html`'s 12 platform cards / 10 legislation rows. Manually diff the migration script's printed summary against the live site — this is the check that the migration didn't lose or mangle anything.
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

## 9. GitHub Pages config (primary — resolved per §3)

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
| Hosting | GitHub Pages, resolved 2026-07, see §10.1 | — (Vercel considered and rejected — GitHub-only preferred) |
| Auto-publish | PR-gated (`AUTO_PUBLISH=false`) | Direct-to-main, as originally specced |
| Status color | Strict black/white/grayscale + icon | One restrained accent color for severity |
| `tracker.db` diffs | Also commit `tracker.json` snapshot | Binary-only, rely on audit-log prints |

### 10.1 Environment separation (resolved — binding for every phase, not just Phase 1)

The live site at `justoffline.github.io/Off-LineNews` is a real, in-use asset (CHT fellowship application evidence, deadline July 12 2026) and must not go dark or regress at any point during this rebuild. Since hosting is GitHub Pages only (no Vercel branch-preview mechanism available), isolation comes from repo separation, not branch discipline:

- **The rebuild lives in its own sibling repo** — `Off-LineNews-next` (rename freely) — not inside the production `Off-LineNews` repo. GitHub Pages gives every repo its own free URL automatically (`justoffline.github.io/Off-LineNews-next/`), so this repo has zero shared surface with production: no shared branch, no shared workflow, nothing an accidental `workflow_dispatch` or push could touch on the live site. This is safer than branch-based isolation because there's no rule to remember — the repos simply don't intersect.
- **Fastest review loop, no deployment at all:** `npm run build && npx serve out` — reviews the static export on localhost before anything touches GitHub.
- **The production repo (`Off-LineNews`) is not touched** — no commits, no new workflows, no Pages-setting changes — until cutover.
- **Cutover**, once the rebuild reaches full feature parity (platforms, legislation, all five pillars, news feed, methodology) and ideally after July 12: replace the production repo's contents with the finished v3 build and let its existing Pages setup pick it up, rather than trying to migrate mid-build. Don't cut over a partial rebuild under deadline pressure — that recreates the exact risk this section exists to avoid.

---

## 11. Phase 1 migration — retired, kept for history

The runbook that used to live here (create the sibling repo, fix `basePath`, push, enable Pages, clean up production) is done — see §0.1 for what actually happened, including the two incidents. `.github/workflows/nextjs-deploy.yml` (in this repo) is the live version of what was drafted as `deploy.yml` here; check that file directly rather than a copy in this doc, so there's only one source of truth for it.

If GitHub Pages ever needs re-enabling for this repo again (e.g. after a visibility change, per incident 2 in §0.1): repo → Settings → Pages → Source → **GitHub Actions**. That's the entire fix, no `gh` CLI needed.

---

## 12. Ground truth, verified not assumed

- **Live:** `justoffline.github.io/Off-LineNews-next` — Platform Tracker (12 entries), strict grayscale status convention, CI smoke-test on deploy. Commits `598c959`, `6a9ed22`.
- **Not yet built:** Legislation Tracker on the new site, SQLite migration (`data/tracker.db`, `lib/db.ts`), `articles`/`clusters` tables, zettelkasten graph, corroboration engine (`update_tracker.py`, PR-gated).
- **Production `justoffline.github.io/Off-LineNews`** (the old hand-written `index.html` site) is currently 404 — Pages source was flipped to "GitHub Actions" but no workflow has run since. This is a separate, smaller open item — see §19.
- Repo is public (required for free GitHub Pages). `data/tracker.db` is planned to be committed as source of truth per the original §3/§4 decision.

---

## 13. Now (current sprint — static architecture, no new infra, no new accounts)

Three additions below fit the current static-site architecture (content/data layer only, no new backend/hosting/accounts): a Reports tab (basic graphs of article release frequency by topic/pillar), SEO-friendly content structure for future indexing, and social share affordances on cards/articles. All three, plus a Substack signup CTA, slot into the existing build-time-render model the same way the Platform Tracker increment did — no architectural change required.

The SQLite migration is sequenced *after* the Legislation Tracker increment rather than before it: seeding `data/tracker.db` from `index.html` naturally covers both the `platforms` and `legislation` tables in one migration pass, so hand-copying Legislation into its own `lib/legislation.ts` first (mirroring the already-proven `lib/platforms.ts` recipe) means the migration script has two real, already-rendered tables to seed from and diff against — not one plus a table nobody's looked at yet on the new site.

| Item | What "done" means | Depends on |
|---|---|---|
| Legislation Tracker content increment | Same recipe as Platform Tracker: `lib/legislation.ts` (10 rows), `LegislationRow.tsx`, rendered on `/`, same 3-layer verification | none — can start immediately |
| SQLite migration (`data/tracker.db`) | `scripts/db.py`, `scripts/migrate_seed_db.py` seed both tables from `index.html`; `lib/db.ts` reads at build time; `lib/platforms.ts`/`lib/legislation.ts` retired | Legislation increment done first (seed both tables in one pass, see reasoning above) |
| Reports tab v1 | Static bar chart (shadcn Chart/Recharts, build-time data) — article count by pillar over time, sourced from the `articles` table once it exists | SQLite migration |
| SEO foundation | Per-page `<title>`/meta description, OpenGraph tags, `sitemap.xml`, `robots.txt` generated at build time — no submission/indexing automation yet, just correct markup | none |
| Social share affordance | Static share links (X/LinkedIn/copy-link intent URLs) on each card — no API posting, just outbound share buttons | none |
| Substack signup CTA | One link/button in footer or hero, per the original Notion note | none |

---

## Kickoff prompt (paste this into Claude Code in this repo)

```
Read CLAUDE.md in full before doing anything else, including §0.1, §12, and
§13 — Phase 1 is done and the Platform Tracker content increment already
shipped (live, verified, see §12). This is a sprint in progress, not a
fresh start.

Next unit of work per §13: the Legislation Tracker content increment
(lib/legislation.ts, LegislationRow.tsx, same 3-layer verification as the
Platform Tracker increment). Only after that's done and confirmed, move to
the SQLite migration (scripts/db.py, scripts/migrate_seed_db.py, seeding
both platforms and legislation tables from index.html in one pass, then
lib/db.ts) — see §13 for why that ordering matters.

Stop and report after each item in §13's table before starting the next
one, same "stop and confirm between units of work" pattern as before.
```

---

## 19. Open items (tracked separately from the §13 sprint)

**Production Pages still 404.** `justoffline.github.io/Off-LineNews` (the old hand-written `index.html` site — separate repo, `JustOffline/Off-LineNews`) returns 404. The user re-enabled Pages Source → GitHub Actions after an earlier visibility-change incident (§0.1 incident 2 is the same failure mode, different repo), but flipping that setting alone doesn't trigger a deploy — it needs an actual workflow run: either the next scheduled cron run, or a manual "Run workflow" dispatch from that repo's Actions tab. Smaller and unrelated to the `Off-LineNews-next` rebuild; do not fold a fix for this into any §13 work, and do not touch the production repo beyond confirming this.
