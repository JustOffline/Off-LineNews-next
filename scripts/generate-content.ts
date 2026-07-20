import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import * as React from "react";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { PLATFORM_STATUS_META, LEGISLATION_STATUS_META } from "../lib/statusMeta";
import type { ChangelogEntry } from "../lib/types";

// Reads data/changelog.json, renders a black/white "quote card" PNG for every
// unpublished entry (build-time only — no server, works with GitHub Pages),
// appends a human-reviewed Substack Notes queue entry, and regenerates
// public/feed.json. No automated posting: Substack has no official Notes API,
// so the review/publish step stays a human copying data/queue.md by hand.

const ROOT = path.resolve(__dirname, "..");
const CHANGELOG_PATH = path.join(ROOT, "data", "changelog.json");
const QUEUE_PATH = path.join(ROOT, "data", "queue.md");
const FEED_PATH = path.join(ROOT, "public", "feed.json");
const CARDS_DIR = path.join(ROOT, "public", "cards");

const ALL_STATUS_META: Record<string, { glyph: string; label: string }> = {
  ...PLATFORM_STATUS_META,
  ...LEGISLATION_STATUS_META,
};

function statusMeta(status: string): { glyph: string; label: string } {
  return ALL_STATUS_META[status] ?? { glyph: "?", label: status.toUpperCase() };
}

function loadFonts() {
  return [
    {
      name: "Arimo",
      data: readFileSync(path.join(ROOT, "public", "fonts", "Arimo-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Arimo",
      data: readFileSync(path.join(ROOT, "public", "fonts", "Arimo-Bold.ttf")),
      weight: 700 as const,
      style: "normal" as const,
    },
    // Arimo is missing the open-triangle/open-diamond glyphs (△ at-risk,
    // ◇ stalled — the status glyph convention from lib/statusMeta.ts).
    // Satori falls back to this font per-glyph when Arimo lacks a codepoint;
    // verified via opentype.js cmap inspection that this font covers all
    // five status glyphs (●▲△○◇), unlike plain Noto Sans or Noto Sans
    // Symbols (v1), which cover none or only some of them.
    {
      name: "Noto Sans Symbols 2",
      data: readFileSync(path.join(ROOT, "public", "fonts", "NotoSansSymbols2-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
  ];
}

async function renderCard(entry: ChangelogEntry, fonts: ReturnType<typeof loadFonts>) {
  const prev = statusMeta(entry.previousStatus);
  const next = statusMeta(entry.newStatus);

  const tree = React.createElement(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily: "Arimo",
        padding: "64px",
      },
    },
    React.createElement(
      "div",
      { style: { fontSize: 22, letterSpacing: 4, color: "#8a8a8a" } },
      "OFF-LINE® NEWS — STATUS CHANGE"
    ),
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 24 } },
      React.createElement("div", { style: { fontSize: 56, fontWeight: 700 } }, entry.entity),
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 20, fontSize: 32, fontWeight: 700 } },
        React.createElement("span", { style: { display: "flex" } }, `${prev.glyph} ${prev.label}`),
        React.createElement("span", { style: { display: "flex", color: "#8a8a8a" } }, "→"),
        React.createElement("span", { style: { display: "flex" } }, `${next.glyph} ${next.label}`)
      ),
      React.createElement(
        "div",
        { style: { display: "flex", fontSize: 26, color: "#cccccc", maxWidth: 1000 } },
        entry.detail
      )
    ),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "space-between", fontSize: 20, color: "#8a8a8a" } },
      React.createElement("span", { style: { display: "flex" } }, entry.date),
      React.createElement("span", { style: { display: "flex" } }, new URL(entry.sourceUrl).hostname)
    )
  );

  const svg = await satori(tree, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}

async function main() {
  const changelog: ChangelogEntry[] = JSON.parse(readFileSync(CHANGELOG_PATH, "utf-8"));
  const pending = changelog.filter((e) => !e.published);

  if (pending.length === 0) {
    console.log("No unpublished changelog entries.");
  } else {
    if (!existsSync(CARDS_DIR)) mkdirSync(CARDS_DIR, { recursive: true });
    const fonts = loadFonts();
    let queueAppend = "";

    for (const entry of pending) {
      const png = await renderCard(entry, fonts);
      writeFileSync(path.join(CARDS_DIR, `${entry.id}.png`), png);

      const prev = statusMeta(entry.previousStatus);
      const next = statusMeta(entry.newStatus);
      queueAppend += `\n## ${entry.entity} — ${entry.date}\n\n`;
      queueAppend += `- Image: \`public/cards/${entry.id}.png\`\n`;
      queueAppend += `- Suggested post: "${entry.entity} moved from ${prev.label} to ${next.label}. ${entry.detail}"\n`;
      queueAppend += `- Source: ${entry.sourceUrl}\n`;
      queueAppend += `- [ ] posted\n`;

      entry.published = true;
    }

    const existingQueue = existsSync(QUEUE_PATH)
      ? readFileSync(QUEUE_PATH, "utf-8")
      : "# Substack queue\n\nHuman-reviewed. Copy each entry into Substack Notes yourself, then check it off. Nothing here posts automatically.\n";
    writeFileSync(QUEUE_PATH, existingQueue + queueAppend);
    writeFileSync(CHANGELOG_PATH, JSON.stringify(changelog, null, 2) + "\n");
    console.log(`Generated ${pending.length} card(s), appended to data/queue.md, marked published.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omitting `published` from the public feed
  const feed = changelog.map(({ published, ...rest }) => rest);
  writeFileSync(FEED_PATH, JSON.stringify(feed, null, 2) + "\n");
  console.log(`Wrote ${feed.length} entries to public/feed.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
