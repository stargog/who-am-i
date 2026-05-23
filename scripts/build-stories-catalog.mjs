/**
 * Build shared/decks/catalog.json from scripts/stories-data.mjs
 */
import { existsSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { STORIES } from "./stories-data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "shared/decks/catalog.json");
const deckImageDir = join(root, "apps/web/public/deck");

function existingDeckImage(id) {
  for (const ext of [".jpg", ".jpeg", ".webp", ".png"]) {
    const p = join(deckImageDir, `${id}${ext}`);
    try {
      if (existsSync(p) && statSync(p).size > 800) return `/deck/${id}${ext}`;
    } catch {
      /* skip */
    }
  }
  return "/deck/placeholder.svg";
}

function mediaFromCategory(category) {
  if (category === "anime_stories") return "anime";
  if (category === "movie_stories") return "movie";
  return "tv";
}

function buildAliases(s) {
  const out = [];
  if (s.nameRomaji) out.push(s.nameRomaji);
  if (s.aliases?.length) out.push(...s.aliases);
  return [...new Set(out.filter(Boolean))];
}

const entries = STORIES.map((s) => {
  const aliases = buildAliases(s);
  const entry = {
    id: `story-${s.id}`,
    name: s.name,
    category: s.category,
    image: existingDeckImage(`story-${s.id}`),
    imageAlt: s.name,
    tags: {
      type: "story",
      media: mediaFromCategory(s.category),
      tier: s.tier,
      fictional: true,
      human: false,
      alive: "unknown",
      gender: "na",
    },
    hints: s.hints,
    facts: s.facts,
  };
  if (aliases.length > 0) entry.aliases = aliases;
  return entry;
});

const ids = new Set();
for (const e of entries) {
  if (ids.has(e.id)) {
    console.error(`Duplicate id: ${e.id}`);
    process.exit(1);
  }
  ids.add(e.id);
}

const catalog = {
  version: 3,
  source: "scripts/stories-data.mjs",
  generated: new Date().toISOString(),
  entries,
};

writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

const byCat = {};
for (const e of entries) {
  byCat[e.category] = (byCat[e.category] || 0) + 1;
}
console.log(`Wrote ${entries.length} stories → ${outPath}`);
console.log(byCat);
