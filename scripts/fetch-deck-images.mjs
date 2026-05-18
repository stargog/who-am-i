/**
 * Fetch Wikipedia summaries + images into apps/web/public/deck/{id}.jpg
 * Uses file cache to avoid repeat API calls. Resume-safe.
 *
 * Usage:
 *   node scripts/fetch-deck-images.mjs
 *   node scripts/fetch-deck-images.mjs --offset 0 --limit 50
 *   node scripts/fetch-deck-images.mjs --only-missing
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "shared", "decks", "catalog.json");
const imageDir = path.join(root, "apps", "web", "public", "deck");
const cacheDir = path.join(root, "shared", "decks", ".cache", "wiki");
const overridesPath = path.join(root, "shared", "decks", "wikipedia-overrides.json");

const UA =
  "WhoAmI-DeckBuilder/1.0 (https://github.com/; educational party game)";
const DELAY_MS = 2200;
const SUB_DELAY_MS = 450;
const MAX_RETRIES = 5;
const SAVE_EVERY = 5;

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { offset: 0, limit: Infinity, onlyMissing: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--offset") opts.offset = Number(args[++i]) || 0;
    else if (args[i] === "--limit") opts.limit = Number(args[++i]) || 0;
    else if (args[i] === "--only-missing") opts.onlyMissing = true;
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, binary = false) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429) {
      const wait = 5000 * (i + 1);
      console.warn(`  rate limited, waiting ${wait / 1000}s…`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status}`);
    return binary ? Buffer.from(await res.arrayBuffer()) : res.json();
  }
  throw new Error("429");
}

function splitSentences(text, max = 4) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 220)
    .slice(0, max);
}

function loadOverrides() {
  try {
    return JSON.parse(fs.readFileSync(overridesPath, "utf8"));
  } catch {
    return {};
  }
}

function cachePath(id) {
  return path.join(cacheDir, `${id}.json`);
}

function readCache(id) {
  try {
    return JSON.parse(fs.readFileSync(cachePath(id), "utf8"));
  } catch {
    return null;
  }
}

function writeCache(id, data) {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cachePath(id), JSON.stringify(data, null, 2));
}

function hasRaster(id) {
  for (const ext of [".jpg", ".jpeg", ".webp", ".png"]) {
    const f = path.join(imageDir, `${id}${ext}`);
    try {
      if (fs.statSync(f).size > 800) return `/deck/${id}${ext}`;
    } catch {
      /* skip */
    }
  }
  return null;
}

async function opensearchTitle(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&namespace=0&format=json`;
  const data = await fetchWithRetry(url);
  const titles = data[1];
  return titles?.[0] ?? null;
}

/** Pick first search hit that has a thumbnail (avoids disambiguation pages). */
async function searchWithThumbnail(query) {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&prop=pageimages|description|extracts` +
    `&exintro=1&explaintext=1&exsentences=3&piprop=thumbnail&pithumbsize=480&format=json`;
  const data = await fetchWithRetry(url);
  const pages = data.query?.pages;
  if (!pages) return null;
  const sorted = Object.values(pages).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  for (const page of sorted) {
    const thumb = page.thumbnail?.source;
    if (!thumb) continue;
    const extract = page.extract || "";
    if (/may refer to:/i.test(extract) && extract.length < 400) continue;
    return {
      title: page.title,
      extract,
      description: page.description || "",
      thumbnail: thumb,
      via: "search",
    };
  }
  return null;
}

async function getWikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const data = await fetchWithRetry(url);
  return {
    title: data.title,
    extract: data.extract || "",
    description: data.description || "",
    thumbnail: data.thumbnail?.source ?? null,
  };
}

async function getCommonsThumb(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=480`;
  const data = await fetchWithRetry(url);
  const pages = data.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  return page.thumbnail?.source ?? null;
}

function titleCandidates(entry, overrides) {
  const { name, category, id } = entry;
  const list = [];
  if (overrides[id]) list.push(overrides[id]);
  if (overrides[name]) list.push(overrides[name]);
  list.push(name);
  if (category === "movie_characters" || category === "anime_characters") {
    list.push(`${name} (character)`);
    if (category === "anime_characters") {
      list.push(`${name} (anime)`);
      list.push(`${name} (manga)`);
    }
    if (category === "movie_characters") {
      list.push(`${name} (film character)`);
      list.push(`${name} (Marvel Comics)`);
      list.push(`${name} (DC Comics)`);
    }
  }
  if (category === "animals") {
    list.push(`${name} (animal)`);
    list.push(`${name} species`);
  }
  if (category === "objects") {
    list.push(`${name} (object)`);
    list.push(`${name} (furniture)`);
    list.push(`${name} (device)`);
    list.push(`${name} (tool)`);
  }
  return [...new Set(list)];
}

async function resolveWikiData(entry, overrides) {
  const cached = readCache(entry.id);
  if (cached?.resolvedTitle) return cached;

  const candidates = titleCandidates(entry, overrides);
  let lastErr = null;

  for (const title of candidates) {
    try {
      await sleep(SUB_DELAY_MS);
      const summary = await getWikiSummary(title);
      if (summary.extract || summary.thumbnail) {
        const data = { ...summary, resolvedTitle: summary.title || title, tried: candidates };
        writeCache(entry.id, data);
        return data;
      }
    } catch (e) {
      lastErr = e;
    }
  }

  try {
    await sleep(SUB_DELAY_MS);
    const found = await opensearchTitle(entry.name);
    if (found) {
      await sleep(SUB_DELAY_MS);
      const summary = await getWikiSummary(found);
      if (summary.thumbnail || (summary.extract && !/may refer to:/i.test(summary.extract))) {
        const data = { ...summary, resolvedTitle: found, tried: candidates, via: "opensearch" };
        writeCache(entry.id, data);
        return data;
      }
    }
  } catch (e) {
    lastErr = e;
  }

  const searchQueries = [
    entry.name,
    entry.category === "objects" ? `${entry.name} furniture` : null,
    entry.category === "animals" ? `${entry.name} animal` : null,
    entry.category === "anime_characters" ? `${entry.name} anime character` : null,
    entry.category === "movie_characters" ? `${entry.name} film character` : null,
  ].filter(Boolean);

  for (const q of searchQueries) {
    try {
      await sleep(SUB_DELAY_MS);
      const hit = await searchWithThumbnail(q);
      if (hit) {
        writeCache(entry.id, { ...hit, tried: candidates });
        return hit;
      }
    } catch (e) {
      lastErr = e;
    }
  }

  const fail = { resolvedTitle: null, extract: "", description: "", thumbnail: null, error: String(lastErr) };
  writeCache(entry.id, fail);
  return fail;
}

async function downloadImage(url, outFile) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Referer: "https://en.wikipedia.org/",
      },
    });
    if (res.status === 429) {
      await sleep(5000 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outFile, buf);
    return fs.statSync(outFile).size > 800;
  }
  throw new Error("429");
}

async function enrichEntry(entry, overrides) {
  const existing = hasRaster(entry.id);
  if (existing) {
    return { ...entry, image: existing, imageAttribution: entry.imageAttribution ?? "Wikipedia" };
  }

  const wiki = await resolveWikiData(entry, overrides);
  let imageUrl = wiki.thumbnail;

  if (!imageUrl && wiki.resolvedTitle) {
    await sleep(SUB_DELAY_MS);
    try {
      imageUrl = await getCommonsThumb(wiki.resolvedTitle);
    } catch {
      /* ignore */
    }
  }

  const outFile = path.join(imageDir, `${entry.id}.jpg`);
  let image = entry.image;
  let imageAttribution = entry.imageAttribution;

  if (imageUrl) {
    try {
      await sleep(SUB_DELAY_MS);
      if (await downloadImage(imageUrl, outFile)) {
        image = `/deck/${entry.id}.jpg`;
        imageAttribution = "Wikipedia / Wikimedia Commons";
      }
    } catch (e) {
      console.warn(`  image failed: ${entry.name}`, e.message);
    }
  }

  const facts = [];
  if (wiki.description) facts.push(wiki.description);
  facts.push(...splitSentences(wiki.extract || ""));
  const mergedFacts = facts.length > 0 ? facts : entry.facts;

  return {
    ...entry,
    image,
    imageAlt: entry.name,
    imageAttribution,
    facts: mergedFacts,
  };
}

function saveCatalog(catalog) {
  catalog.generated = new Date().toISOString();
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
}

async function main() {
  const opts = parseArgs();
  const overrides = loadOverrides();
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  const slice = catalog.entries.slice(
    opts.offset,
    opts.limit === Infinity ? undefined : opts.offset + opts.limit
  );

  fs.mkdirSync(imageDir, { recursive: true });

  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < slice.length; i++) {
    const globalIdx = opts.offset + i;
    const entry = catalog.entries[globalIdx];
    if (!entry) continue;

    if (opts.onlyMissing && hasRaster(entry.id)) {
      skipped++;
      entry.image = hasRaster(entry.id);
      continue;
    }

    console.log(`[${globalIdx + 1}/${catalog.entries.length}] ${entry.name}`);
    try {
      const updated = await enrichEntry(entry, overrides);
      catalog.entries[globalIdx] = updated;
      if (updated.image?.endsWith(".jpg")) fetched++;
      else failed++;
    } catch (e) {
      console.warn(`  error: ${e.message}`);
      failed++;
    }

    if ((i + 1) % SAVE_EVERY === 0) saveCatalog(catalog);
    await sleep(DELAY_MS);
  }

  saveCatalog(catalog);

  const withJpg = catalog.entries.filter((e) => e.image?.endsWith(".jpg")).length;
  console.log(`\nDone. Batch: +${fetched} photos, ${skipped} skipped, ${failed} still without photo`);
  console.log(`Catalog total with .jpg: ${withJpg}/${catalog.entries.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
