#!/usr/bin/env python3
"""
Off-Line News — Daily News Fetcher (Off-LineNews-next)
Pulls from free RSS feeds, filters by keywords, writes structured JSON for
the Next.js /news page. Runs daily via GitHub Actions. No API keys required.

This is a headline feed only — it does not detect or publish tracker status
changes. It never touches index.html (kept as a read-only migration source
in this repo, per CLAUDE.md §0.1) and uses its own dedup cache
(data/news-seen.json), distinct from the old production repo's
scripts/seen_guids.json, so this script is fully self-contained to this repo.
"""

import sys
import html
import hashlib
import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Windows' default console codepage (cp1252) can't encode the ✓/⚠ markers
# below; GitHub Actions' Ubuntu runner defaults to UTF-8 already, but local
# verification on Windows needs this to not crash.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
from urllib.request import urlopen, Request
from urllib.error import URLError
from xml.etree import ElementTree
import re

# ── CONFIG ───────────────────────────────────────────────────────────────────

MAX_ARTICLES   = 12     # articles kept on the page
FRESHNESS_DAYS = 30      # ignore articles older than this
ARTICLES_FILE  = "data/articles.json"
DEDUP_FILE     = "data/news-seen.json"  # tracks seen article IDs — this repo only

RSS_FEEDS = [
    # Source name          URL
    ("BBC Technology",     "http://feeds.bbci.co.uk/news/technology/rss.xml"),
    ("The Guardian",       "https://www.theguardian.com/technology/rss"),
    ("Al Jazeera",         "https://www.aljazeera.com/xml/rss/all.xml"),
    ("OONI",               "https://ooni.org/post/index.xml"),
    ("Rest of World",      "https://restofworld.org/feed/"),
    ("EFF",                "https://www.eff.org/rss/updates.xml"),
    ("TechCrunch",         "https://techcrunch.com/feed/"),
    ("Wired",              "https://www.wired.com/feed/rss"),
    ("Techdirt",           "https://www.techdirt.com/techdirt_rss.xml"),
    ("NetBlocks",          "https://netblocks.org/feed"),
    ("Freedom House",      "https://freedomhouse.org/rss.xml"),
    ("Access Now",         "https://www.accessnow.org/feed/"),
    ("The Intercept",      "https://theintercept.com/feed/?rss"),
    ("AP Technology",      "https://feeds.apnews.com/apnews/technology"),
]

# Articles must contain at least one keyword (case-insensitive)
KEYWORDS = [
    "social media ban", "social media block", "platform ban", "platform block",
    "tiktok ban", "tiktok block", "tiktok restrict",
    "twitter ban", "twitter block", "x ban", "x restrict",
    "facebook ban", "facebook block", "meta ban",
    "instagram ban", "instagram block",
    "youtube ban", "youtube block", "youtube restrict",
    "telegram ban", "telegram block", "telegram restrict",
    "whatsapp ban", "whatsapp block",
    "internet shutdown", "internet blackout", "internet censorship",
    "online censorship", "digital censorship",
    "DSA fine", "digital services act",
    "online safety act", "online safety bill",
    "content moderation law", "social media law", "social media regulation",
    "banned app", "banned platform",
    "great firewall", "internet freedom",
    "network block", "site block", "website block",
    "VPN ban", "encryption ban",
    "disinformation law", "fake news law",
    "platform regulation", "tech regulation",
    "age verification", "under-16 ban", "children online",
]

# Tags automatically applied when a keyword matches
KEYWORD_TAGS = {
    "tiktok":             "TikTok",
    "twitter":            "Twitter/X",
    "x ban":              "Twitter/X",
    "x restrict":         "Twitter/X",
    "facebook":           "Facebook",
    "meta":               "Meta",
    "instagram":          "Instagram",
    "youtube":            "YouTube",
    "telegram":           "Telegram",
    "whatsapp":           "WhatsApp",
    "internet shutdown":  "Shutdown",
    "internet blackout":  "Shutdown",
    "dsa":                "DSA",
    "digital services":   "DSA",
    "online safety":      "Online Safety",
    "great firewall":     "China",
    "china":              "China",
    "russia":             "Russia",
    "iran":               "Iran",
    "india":              "India",
    "turkey":             "Turkey",
    "brazil":             "Brazil",
    "australia":          "Australia",
    "censorship":         "Censorship",
    "shutdown":           "Shutdown",
    "age verification":   "Age Verification",
    "under-16":           "Age Restriction",
    "children":           "Child Safety",
    "vpn":                "VPN",
}

# ── HELPERS ──────────────────────────────────────────────────────────────────

def fetch_rss(url: str, source_name: str) -> list[dict]:
    """Fetch and parse a single RSS feed. Returns list of article dicts."""
    headers = {
        "User-Agent": "OffLineNews-next/1.0 (https://github.com; news aggregator for public interest research)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
    }
    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=15) as resp:
            data = resp.read()
        root = ElementTree.fromstring(data)
    except URLError as e:
        print(f"  ⚠  {source_name}: network error — {e}", file=sys.stderr)
        return []
    except ElementTree.ParseError as e:
        print(f"  ⚠  {source_name}: XML parse error — {e}", file=sys.stderr)
        return []

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    articles = []

    # RSS 2.0
    for item in root.findall(".//item"):
        title   = _text(item, "title")
        link    = _text(item, "link")
        summary = _text(item, "description") or ""
        pub     = _text(item, "pubDate") or ""
        guid    = _text(item, "guid") or link or title
        articles.append(dict(
            source=source_name, title=title, link=link,
            summary=summary, pub_str=pub, guid=guid
        ))

    # Atom
    for entry in root.findall("atom:entry", ns) or root.findall(".//entry"):
        title   = _text(entry, "title") or _text(entry, "atom:title", ns)
        summary = _text(entry, "summary") or _text(entry, "atom:summary", ns) or \
                  _text(entry, "content") or ""
        pub     = _text(entry, "published") or _text(entry, "updated") or ""
        link_el = entry.find("link")
        link    = (link_el.get("href") if link_el is not None else None) or _text(entry, "id") or ""
        guid    = _text(entry, "id") or link or title
        articles.append(dict(
            source=source_name, title=title, link=link,
            summary=summary, pub_str=pub, guid=guid
        ))

    print(f"  ✓  {source_name}: {len(articles)} items fetched")
    return articles


def _text(el, tag: str, ns: dict = {}) -> str | None:
    child = el.find(tag, ns) if ns else el.find(tag)
    if child is None:
        return None
    return (child.text or "").strip() or None


def parse_date(pub_str: str) -> datetime | None:
    """Try multiple date formats; return UTC datetime or None."""
    if not pub_str:
        return None
    formats = [
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S GMT",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%d",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(pub_str.strip(), fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None


def is_relevant(article: dict) -> bool:
    """Return True if the article matches any tracked keyword."""
    haystack = (
        (article.get("title") or "") + " " +
        (article.get("summary") or "")
    ).lower()
    return any(kw in haystack for kw in KEYWORDS)


def extract_tags(article: dict) -> list[str]:
    """Return up to 3 auto-detected tags from title + summary text."""
    haystack = (
        (article.get("title") or "") + " " +
        (article.get("summary") or "")
    ).lower()
    seen = set()
    tags = []
    for kw, tag in KEYWORD_TAGS.items():
        if kw in haystack and tag not in seen:
            seen.add(tag)
            tags.append(tag)
        if len(tags) >= 3:
            break
    return tags or ["News"]


def clean_html(raw: str) -> str:
    """Strip HTML tags and normalise whitespace."""
    raw = re.sub(r"<[^>]+>", " ", raw)
    raw = html.unescape(raw)
    raw = re.sub(r"\s+", " ", raw).strip()
    return raw


def truncate(text: str, max_chars: int = 220) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rsplit(" ", 1)[0].rstrip(".,;:—-") + "…"


def article_id(article: dict) -> str:
    return hashlib.md5((article.get("guid") or article.get("link") or article.get("title") or "").encode()).hexdigest()


def source_short(name: str) -> str:
    """Shorten long source names."""
    replacements = {
        "BBC Technology": "BBC",
        "The Guardian": "Guardian",
        "AP Technology": "AP News",
        "Rest of World": "Rest of World",
    }
    return replacements.get(name, name)


# ── DEDUP STORE ──────────────────────────────────────────────────────────────

def load_seen(path: str) -> set[str]:
    try:
        with open(path) as f:
            data = json.load(f)
        return set(data.get("seen", []))
    except (FileNotFoundError, json.JSONDecodeError):
        return set()


def save_seen(path: str, seen: set[str]) -> None:
    # Keep only the most recent 2000 IDs to prevent file bloat
    seen_list = list(seen)[-2000:]
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w") as f:
        json.dump({"seen": seen_list, "updated": datetime.now(timezone.utc).isoformat()}, f, indent=2)


# ── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    repo_root     = Path(__file__).parent.parent
    articles_path = repo_root / ARTICLES_FILE
    dedup_path    = repo_root / DEDUP_FILE

    now_utc  = datetime.now(timezone.utc)
    cutoff   = now_utc - timedelta(days=FRESHNESS_DAYS)
    last_run = now_utc.strftime("%Y-%m-%d %H:%M UTC")

    print(f"\n{'='*60}")
    print(f"  Off-Line News — News Fetch — {last_run}")
    print(f"{'='*60}\n")

    seen = load_seen(str(dedup_path))
    print(f"Seen cache: {len(seen)} article IDs\n")

    # 1. Fetch all feeds
    all_articles = []
    for source_name, url in RSS_FEEDS:
        articles = fetch_rss(url, source_name)
        all_articles.extend(articles)

    print(f"\nTotal fetched: {len(all_articles)} articles")

    # 2. Parse dates
    for a in all_articles:
        a["parsed_date"] = parse_date(a.get("pub_str") or "")

    # 3. Filter: relevant keywords + freshness
    relevant = [
        a for a in all_articles
        if is_relevant(a)
        and (a["parsed_date"] is None or a["parsed_date"] >= cutoff)
    ]
    print(f"After keyword filter: {len(relevant)} articles")

    # 4. Deduplicate against seen cache + within this batch
    new_articles = []
    batch_seen_links = set()
    for a in relevant:
        aid = article_id(a)
        link = (a.get("link") or "").strip()
        if aid not in seen and link not in batch_seen_links:
            new_articles.append(a)
            batch_seen_links.add(link)

    print(f"After dedup: {len(new_articles)} new articles")

    # 5. Sort by date descending, take top N
    new_articles.sort(
        key=lambda a: a["parsed_date"] or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )
    selected = new_articles[:MAX_ARTICLES]
    print(f"Selected: {len(selected)} articles for page\n")

    for a in selected:
        d = a["parsed_date"].strftime("%Y-%m-%d") if a["parsed_date"] else "unknown"
        print(f"  [{d}] {a['source']}: {(a.get('title') or '')[:70]}")

    # 6. Build structured records (existing articles + newly selected, capped at MAX_ARTICLES)
    existing = []
    if articles_path.exists():
        try:
            existing = json.loads(articles_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            existing = []

    new_records = [
        {
            "id": article_id(a),
            "title": html.unescape(a.get("title") or "Untitled"),
            "link": a.get("link") or "#",
            "summary": truncate(clean_html(a.get("summary") or "")),
            "source": source_short(a.get("source") or ""),
            "tags": extract_tags(a),
            "date": a["parsed_date"].isoformat() if a["parsed_date"] else "",
            "fetchedAt": now_utc.isoformat(),
        }
        for a in selected
    ]

    combined = new_records + existing
    combined.sort(key=lambda r: r.get("date") or "", reverse=True)
    combined = combined[:MAX_ARTICLES]

    # 7. Write articles.json
    articles_path.parent.mkdir(parents=True, exist_ok=True)
    articles_path.write_text(json.dumps(combined, indent=2) + "\n", encoding="utf-8")
    print(f"\n✅ {articles_path} updated — {len(combined)} articles on page ({len(new_records)} new)")

    # 8. Update dedup cache (only with newly-selected articles)
    for a in selected:
        seen.add(article_id(a))
    save_seen(str(dedup_path), seen)
    print(f"✅ Dedup cache updated — {len(seen)} total IDs stored")
    print(f"\n{'='*60}\n")


if __name__ == "__main__":
    main()
