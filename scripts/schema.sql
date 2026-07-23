-- SQLite schema groundwork for the eventual data/tracker.db migration
-- (CLAUDE.md §13 "Now" table — this file is prep only, not the migration).
--
-- Columns are derived directly from this repo's real, current lib/types.ts
-- interfaces (Platform, Legislation, Article) — not from the "prior plan"'s
-- status_signals/clusters schema referenced in CLAUDE.md §1/§6, which isn't
-- available in this session and isn't fabricated here from memory.
--
-- Out of scope here: no migrate_seed_db.py, no lib/db.ts, no retiring
-- lib/platforms.ts/legislation.ts. This is schema only.

CREATE TABLE IF NOT EXISTS platforms (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    status      TEXT NOT NULL CHECK (status IN ('banned', 'restricted', 'at-risk', 'monitoring')),
    countries   TEXT NOT NULL,
    detail      TEXT NOT NULL,
    updated     TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS legislation (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    country    TEXT NOT NULL,
    title      TEXT NOT NULL,
    targets    TEXT NOT NULL,
    status     TEXT NOT NULL CHECK (status IN ('signed-law', 'in-force', 'passed', 'senate-passed', 'stalled', 'draft', 'active')),
    date       TEXT NOT NULL,
    source_url TEXT NOT NULL,
    UNIQUE (country, title)
);

CREATE TABLE IF NOT EXISTS articles (
    id         TEXT PRIMARY KEY,  -- md5 hash from scripts/fetch_news.py's article_id()
    title      TEXT NOT NULL,
    link       TEXT NOT NULL,
    summary    TEXT NOT NULL,
    source     TEXT NOT NULL,
    tags       TEXT NOT NULL,     -- comma-separated, matches CLAUDE.md §6's own "cheap v1" convention
    date       TEXT NOT NULL,     -- ISO 8601 UTC, "" if unparseable
    fetched_at TEXT NOT NULL      -- ISO 8601 UTC
);
