/**
 * Enrich catalog from Wikipedia / Wikidata / Commons (cached, resume-safe).
 *
 *   npm run fetch:images              # missing photos only
 *   npm run fetch:images -- --force   # ignore cache, retry all missing
 *   npm run fetch:images -- --refresh-text  # update hints/facts for every entry
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildHints, buildFacts, tagsFor } from "./deck-helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "shared", "decks", "catalog.json");
const imageDir = path.join(root, "apps", "web", "public", "deck");
const cacheDir = path.join(root, "shared", "decks", ".cache", "wiki");
const overridesPath = path.join(root, "shared", "decks", "wikipedia-overrides.json");

const UA =
  "WhoAmI-DeckBuilder/1.0 (https://github.com/; educational party game)";
const DELAY_MS = 2400;
const SUB_DELAY_MS = 500;
const MAX_RETRIES = 6;
const SAVE_EVERY = 5;

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    offset: 0,
    limit: Infinity,
    onlyMissing: false,
    force: false,
    refreshText: false,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--offset") opts.offset = Number(args[++i]) || 0;
    else if (args[i] === "--limit") opts.limit = Number(args[++i]) || 0;
    else if (args[i] === "--only-missing") opts.onlyMissing = true;
    else if (args[i] === "--force") opts.force = true;
    else if (args[i] === "--refresh-text") opts.refreshText = true;
  }
  if (!opts.onlyMissing && !opts.refreshText && args.length === 0) {
    opts.onlyMissing = true;
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429) {
      await sleep(6000 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  }
  throw new Error("429");
}

function splitSentences(text, max = 5) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 240)
    .slice(0, max);
}

function isDisambiguation(extract, description) {
  if (/may refer to:/i.test(extract)) return true;
  if (/Topics referred to by the same term/i.test(description || "")) return true;
  return false;
}

function fullSizeWikiImageUrl(url) {
  if (!url || !url.includes("/thumb/")) return url;
  const m = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/(?:[^/]+))\/thumb\/(.+)\/\d+px-[^/]+$/
  );
  if (m) return `${m[1]}/${m[2]}`;
  return url;
}

function loadOverrides() {
  try {
    return JSON.parse(fs.readFileSync(overridesPath, "utf8"));
  } catch {
    return {};
  }
}

function cacheFile(id) {
  return path.join(cacheDir, `${id}.json`);
}

function readCache(id) {
  try {
    return JSON.parse(fs.readFileSync(cacheFile(id), "utf8"));
  } catch {
    return null;
  }
}

function writeCache(id, data) {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cacheFile(id), JSON.stringify(data, null, 2));
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

async function getWikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const data = await fetchJson(url);
  return {
    title: data.title,
    extract: data.extract || "",
    description: data.description || "",
    thumbnail: data.thumbnail?.source ?? null,
  };
}

async function getPageImageOriginal(title) {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
    `&prop=pageimages&format=json&piprop=original|thumbnail&pithumbsize=600`;
  const data = await fetchJson(url);
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) return null;
  return (
    page.original?.source ??
    page.thumbnail?.source ??
    null
  );
}

async function searchWithThumbnail(query) {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=12&prop=pageimages|description|extracts` +
    `&exintro=1&explaintext=1&exsentences=4&piprop=thumbnail|original&pithumbsize=600&format=json`;
  const data = await fetchJson(url);
  const pages = data.query?.pages;
  if (!pages) return null;
  const sorted = Object.values(pages).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  for (const page of sorted) {
    const extract = page.extract || "";
    const description = page.description || "";
    if (isDisambiguation(extract, description)) continue;
    const thumb =
      page.original?.source ?? page.thumbnail?.source ?? null;
    if (!thumb && !extract) continue;
    return {
      title: page.title,
      extract,
      description,
      thumbnail: thumb,
      via: "search",
    };
  }
  return null;
}

async function commonsImageSearch(query) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=5` +
    `&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json`;
  const data = await fetchJson(url);
  const pages = data.query?.pages;
  if (!pages) return null;
  for (const page of Object.values(pages)) {
    const info = page.imageinfo?.[0];
    const imgUrl = info?.thumburl ?? info?.url;
    if (imgUrl) return fullSizeWikiImageUrl(imgUrl);
  }
  return null;
}

async function wikidataImage(query) {
  const searchUrl =
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}` +
    `&language=en&format=json&limit=3&type=item`;
  const search = await fetchJson(searchUrl);
  const id = search.search?.[0]?.id;
  if (!id) return null;

  await sleep(SUB_DELAY_MS);
  const entityUrl =
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${id}` +
    `&props=claims&format=json`;
  const entity = await fetchJson(entityUrl);
  const claim = entity.entities?.[id]?.claims?.P18?.[0];
  const fileName = claim?.mainsnak?.datavalue?.value;
  if (!fileName) return null;

  await sleep(SUB_DELAY_MS);
  const pathUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}` +
    `&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json`;
  const fileData = await fetchJson(pathUrl);
  const page = Object.values(fileData.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

function titleCandidates(entry, overrides) {
  const { name, category, id } = entry;
  const list = [];
  if (overrides[id]) list.push(overrides[id]);
  if (overrides[name]) list.push(overrides[name]);
  list.push(name);
  if (category === "movie_characters" || category === "anime_characters") {
    list.push(`${name} (character)`);
    if (category === "anime_characters") list.push(`${name} (anime)`);
    if (category === "movie_characters") list.push(`${name} (film character)`);
  }
  if (category === "animals") {
    list.push(`${name} (animal)`);
    list.push(name === "Buffalo" ? "American bison" : `${name} species`);
  }
  if (category === "objects") {
    list.push(`${name} (furniture)`);
    list.push(`${name} (device)`);
    list.push(`${name} (object)`);
  }
  return [...new Set(list)];
}

function isGoodWikiData(data) {
  if (!data) return false;
  if (data.thumbnail) return true;
  if (data.extract && !isDisambiguation(data.extract, data.description)) return true;
  return false;
}

async function resolveWikiData(entry, overrides, force) {
  if (!force) {
    const cached = readCache(entry.id);
    if (isGoodWikiData(cached)) return cached;
  }

  const candidates = titleCandidates(entry, overrides);
  let lastErr = null;

  for (const title of candidates) {
    try {
      await sleep(SUB_DELAY_MS);
      const summary = await getWikiSummary(title);
      if (isDisambiguation(summary.extract, summary.description)) continue;
      let thumb = summary.thumbnail;
      if (!thumb) {
        await sleep(SUB_DELAY_MS);
        thumb = await getPageImageOriginal(summary.title || title);
      }
      const data = {
        ...summary,
        thumbnail: fullSizeWikiImageUrl(thumb),
        resolvedTitle: summary.title || title,
        tried: candidates,
      };
      if (isGoodWikiData(data)) {
        writeCache(entry.id, data);
        return data;
      }
    } catch (e) {
      lastErr = e;
    }
  }

  const searches = [
    overrides[entry.id] ?? entry.name,
    entry.category === "objects" ? `${entry.name} furniture` : entry.name,
    entry.category === "animals" ? `${entry.name} animal` : entry.name,
    entry.category === "anime_characters" ? `${entry.name} anime` : entry.name,
    entry.category === "movie_characters" ? `${entry.name} film` : entry.name,
  ];

  for (const q of [...new Set(searches)]) {
    try {
      await sleep(SUB_DELAY_MS);
      const hit = await searchWithThumbnail(q);
      if (hit && isGoodWikiData(hit)) {
        hit.thumbnail = fullSizeWikiImageUrl(hit.thumbnail);
        writeCache(entry.id, hit);
        return hit;
      }
    } catch (e) {
      lastErr = e;
    }
  }

  const fail = {
    resolvedTitle: null,
    extract: "",
    description: "",
    thumbnail: null,
    error: String(lastErr),
  };
  writeCache(entry.id, fail);
  return fail;
}

async function resolveImageUrl(entry, wiki, overrides) {
  let url = fullSizeWikiImageUrl(wiki.thumbnail);
  if (url) return url;

  if (wiki.resolvedTitle) {
    try {
      await sleep(SUB_DELAY_MS);
      url = fullSizeWikiImageUrl(await getPageImageOriginal(wiki.resolvedTitle));
      if (url) return url;
    } catch {
      /* ignore */
    }
  }

  const commonsQueries = [
    overrides[entry.id],
    wiki.resolvedTitle,
    entry.name,
    `${entry.name} ${entry.category.includes("anime") ? "anime" : entry.category.includes("movie") ? "film" : ""}`.trim(),
  ].filter(Boolean);

  for (const q of [...new Set(commonsQueries)]) {
    try {
      await sleep(SUB_DELAY_MS);
      url = await commonsImageSearch(q);
      if (url) return url;
    } catch {
      /* ignore */
    }
  }

  try {
    await sleep(SUB_DELAY_MS);
    url = await wikidataImage(overrides[entry.id] ?? entry.name);
    if (url) return url;
  } catch {
    /* ignore */
  }

  return null;
}

async function downloadImage(url, outFile) {
  const urls = [url, fullSizeWikiImageUrl(url)].filter(Boolean);
  const unique = [...new Set(urls)];

  for (const tryUrl of unique) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const res = await fetch(tryUrl, {
        headers: { "User-Agent": UA, Referer: "https://en.wikipedia.org/" },
      });
      if (res.status === 429) {
        await sleep(6000 * (i + 1));
        continue;
      }
      if (!res.ok) break;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 800) break;
      fs.writeFileSync(outFile, buf);
      return true;
    }
  }
  return false;
}

function buildWikiHints(entry, wiki) {
  const hints = [];
  if (wiki.description && !isDisambiguation("", wiki.description)) {
    hints.push(wiki.description);
  }
  for (const s of splitSentences(wiki.extract || "", 2)) {
    if (!isDisambiguation(s, "")) hints.push(s);
  }
  const base = buildHints(entry.category, entry.name);
  return [...new Set([...hints, ...base])].slice(0, 6);
}

function buildWikiFacts(entry, wiki) {
  const facts = [];
  if (wiki.description && !/refer to/i.test(wiki.description)) {
    facts.push(wiki.description);
  }
  facts.push(...splitSentences(wiki.extract || "", 4));
  if (facts.length >= 2) return facts.slice(0, 5);
  return buildFacts(entry.category, entry.name, buildHints(entry.category, entry.name));
}

async function enrichEntry(entry, overrides, opts) {
  const raster = hasRaster(entry.id);
  const needImage = !raster && !opts.refreshText;
  const needText = opts.refreshText || !raster;

  if (raster && !opts.refreshText) {
    return { ...entry, image: raster };
  }

  const wiki = await resolveWikiData(entry, overrides, opts.force);

  let image = raster ?? entry.image;
  let imageAttribution = entry.imageAttribution;

  if (needImage || (opts.force && !raster)) {
    const imageUrl = await resolveImageUrl(entry, wiki, overrides);
    if (imageUrl) {
      const outFile = path.join(imageDir, `${entry.id}.jpg`);
      try {
        await sleep(SUB_DELAY_MS);
        if (await downloadImage(imageUrl, outFile)) {
          image = `/deck/${entry.id}.jpg`;
          imageAttribution = "Wikipedia / Wikimedia Commons / Wikidata";
        }
      } catch (e) {
        console.warn(`  image failed: ${entry.name}`, e.message);
      }
    }
  }

  let hints = entry.hints;
  let facts = entry.facts;
  if (needText && isGoodWikiData(wiki)) {
    hints = buildWikiHints(entry, wiki);
    facts = buildWikiFacts(entry, wiki);
  }

  return {
    ...entry,
    image,
    imageAlt: entry.name,
    imageAttribution,
    tags: entry.tags ?? tagsFor(entry.category),
    hints,
    facts,
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

  if (opts.force) {
    fs.mkdirSync(cacheDir, { recursive: true });
    for (const entry of catalog.entries) {
      if (!opts.onlyMissing || !hasRaster(entry.id)) {
        try {
          fs.unlinkSync(cacheFile(entry.id));
        } catch {
          /* skip */
        }
      }
    }
    console.log("Cleared wiki cache for retry.");
  }

  const slice = catalog.entries.slice(
    opts.offset,
    opts.limit === Infinity ? undefined : opts.offset + opts.limit
  );

  fs.mkdirSync(imageDir, { recursive: true });

  let newPhotos = 0;
  let refreshed = 0;
  let failed = 0;

  for (let i = 0; i < slice.length; i++) {
    const globalIdx = opts.offset + i;
    const entry = catalog.entries[globalIdx];
    if (!entry) continue;

    const hadRaster = Boolean(hasRaster(entry.id));
    if (opts.onlyMissing && !opts.refreshText && hadRaster) continue;

    console.log(`[${globalIdx + 1}/${catalog.entries.length}] ${entry.name}`);
    try {
      const updated = await enrichEntry(entry, overrides, opts);
      catalog.entries[globalIdx] = updated;
      const hasPhoto = /\.(jpg|jpeg|webp|png)$/i.test(updated.image ?? "");
      if (!hadRaster && hasPhoto) newPhotos++;
      else if (opts.refreshText) refreshed++;
      else if (!hasPhoto) failed++;
    } catch (e) {
      console.warn(`  error: ${e.message}`);
      failed++;
    }

    if ((i + 1) % SAVE_EVERY === 0) saveCatalog(catalog);
    await sleep(DELAY_MS);
  }

  saveCatalog(catalog);

  const withPhoto = catalog.entries.filter((e) =>
    /\.(jpg|jpeg|webp|png)$/i.test(e.image ?? "")
  ).length;
  console.log(`\nDone. New photos: ${newPhotos}, text refreshed: ${refreshed}, batch failures: ${failed}`);
  console.log(`Catalog with photos: ${withPhoto}/${catalog.entries.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
