/**
 * Download poster images for story deck entries.
 *
 *   npm run fetch:story-images              # missing only
 *   npm run fetch:story-images -- --force   # re-fetch all
 *   npm run fetch:story-images -- --limit 20
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "shared", "decks", "catalog.json");
const imageDir = path.join(root, "apps", "web", "public", "deck");
const overridesPath = path.join(root, "shared", "decks", "story-image-overrides.json");
const urlOverridesPath = path.join(root, "shared", "decks", "story-image-urls.json");
const cacheDir = path.join(root, "shared", "decks", ".cache", "story-images");

const UA =
  "WhoAmI-DeckBuilder/1.0 (https://github.com/; educational party game)";
const DELAY_MS = 1200;
const JIKAN_DELAY_MS = 400;
const MAX_RETRIES = 5;
const SAVE_EVERY = 3;

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { offset: 0, limit: Infinity, force: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--offset") opts.offset = Number(args[++i]) || 0;
    else if (args[i] === "--limit") opts.limit = Number(args[++i]) || 0;
    else if (args[i] === "--force") opts.force = true;
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, referer) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        ...(referer ? { Referer: referer } : {}),
      },
    });
    if (res.status === 429) {
      await sleep(5000 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  }
  throw new Error(`429 ${url}`);
}

function loadOverrides() {
  try {
    return JSON.parse(fs.readFileSync(overridesPath, "utf8"));
  } catch {
    return {};
  }
}

function loadUrlOverrides() {
  try {
    return JSON.parse(fs.readFileSync(urlOverridesPath, "utf8"));
  } catch {
    return {};
  }
}

async function tvmazePoster(name) {
  try {
    await sleep(JIKAN_DELAY_MS);
    const data = await fetchJson(
      `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(name)}`,
      "https://www.tvmaze.com/"
    );
    const url = data?.image?.original ?? data?.image?.medium;
    if (url) return { url, source: "TVMaze", title: data.name };
  } catch {
    /* ignore */
  }
  return null;
}

async function wikidataPoster(query) {
  const search = await fetchJson(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=3&type=item`,
    "https://www.wikidata.org/"
  );
  for (const hit of search.search ?? []) {
    await sleep(JIKAN_DELAY_MS);
    const entity = await fetchJson(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${hit.id}&props=claims&format=json`,
      "https://www.wikidata.org/"
    );
    const claims = entity.entities?.[hit.id]?.claims ?? {};
    for (const prop of ["P154", "P18", "P3417"]) {
      const raw = claims[prop]?.[0]?.mainsnak?.datavalue?.value;
      const fileName =
        typeof raw === "string" ? raw : raw?.id?.replace(/^http.+\//, "") ?? null;
      if (!fileName) continue;
      await sleep(JIKAN_DELAY_MS);
      try {
        const fileData = await fetchJson(
          `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`,
          "https://commons.wikimedia.org/"
        );
        const page = Object.values(fileData.query?.pages ?? {})[0];
        const url = page?.imageinfo?.[0]?.url ?? page?.imageinfo?.[0]?.thumburl;
        if (url && !url.endsWith(".svg")) {
          return { url: fullSizeWikiImageUrl(url), source: "Wikidata", title: hit.label };
        }
        if (url) {
          return { url: fullSizeWikiImageUrl(url), source: "Wikidata", title: hit.label };
        }
      } catch {
        /* next */
      }
    }
  }
  return null;
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

function fullSizeWikiImageUrl(url) {
  if (!url || !url.includes("/thumb/")) return url;
  const m = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/(?:[^/]+))\/thumb\/(.+)\/\d+px-[^/]+$/
  );
  if (m) return `${m[1]}/${m[2]}`;
  return url;
}

async function getWikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const data = await fetchJson(url, "https://en.wikipedia.org/");
  return {
    title: data.title,
    thumbnail:
      data.originalimage?.source ?? data.thumbnail?.source ?? null,
  };
}

async function getPageImageOriginal(title) {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
    `&prop=pageimages&format=json&piprop=original|thumbnail&pithumbsize=800`;
  const data = await fetchJson(url, "https://en.wikipedia.org/");
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) return null;
  return page.original?.source ?? page.thumbnail?.source ?? null;
}

function wikiCandidates(entry, overrides) {
  const { name, category, id, aliases } = entry;
  const list = [];
  if (overrides[id]) list.push(overrides[id]);
  if (overrides[name]) list.push(overrides[name]);
  list.push(name);

  if (category === "movie_stories") {
    list.push(`${name} (film)`);
    if (name.startsWith("The ")) list.push(`${name.replace(/^The /, "")} (film)`);
  } else if (category === "tv_stories") {
    list.push(`${name} (TV series)`);
    list.push(`${name} (television series)`);
  } else if (category === "anime_stories") {
    list.push(`${name} (TV series)`);
    list.push(`${name} (film)`);
    list.push(`${name} (anime)`);
    for (const a of aliases ?? []) {
      if (/^[\x00-\x7F\s'.:;,\-–—0-9]+$/u.test(a)) list.push(a);
    }
  }

  return [...new Set(list)];
}

async function resolveWikipedia(entry, overrides) {
  for (const title of wikiCandidates(entry, overrides)) {
    try {
      await sleep(JIKAN_DELAY_MS);
      const summary = await getWikiSummary(title);
      let thumb = fullSizeWikiImageUrl(summary.thumbnail);
      if (!thumb) {
        await sleep(JIKAN_DELAY_MS);
        thumb = fullSizeWikiImageUrl(
          await getPageImageOriginal(summary.title || title)
        );
      }
      if (thumb) return { url: thumb, source: "Wikipedia", title };
    } catch {
      /* try next */
    }
  }
  return null;
}

function normalizeForMatch(s) {
  return s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreAnimeMatch(query, item) {
  const q = normalizeForMatch(query);
  const titles = [
    item.title,
    item.title_english,
    item.title_japanese,
  ].filter(Boolean);
  for (const t of titles) {
    const n = normalizeForMatch(t);
    if (n === q) return 100;
    if (n.startsWith(q) || q.startsWith(n)) return 80;
    if (n.includes(q) || q.includes(n)) return 50;
  }
  return item.score ?? 0;
}

async function resolveJikan(entry) {
  const queries = [
    entry.name,
    ...(entry.aliases ?? []).filter((a) =>
      /^[\x00-\x7F\s'.:;,\-–—0-9!?]+$/u.test(a)
    ),
  ];
  const seen = new Set();
  for (const q of queries) {
    if (!q || seen.has(q)) continue;
    seen.add(q);
    try {
      await sleep(JIKAN_DELAY_MS);
      const data = await fetchJson(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=8`,
        "https://myanimelist.net/"
      );
      const items = data?.data ?? [];
      if (!items.length) continue;
      items.sort(
        (a, b) => scoreAnimeMatch(q, b) - scoreAnimeMatch(q, a)
      );
      const best = items[0];
      const url =
        best.images?.jpg?.large_image_url ??
        best.images?.jpg?.image_url ??
        null;
      if (url) {
        return { url, source: "MyAnimeList/Jikan", title: best.title };
      }
    } catch {
      /* next query */
    }
  }
  return null;
}

async function downloadImage(url, outFile) {
  const tryUrls = [...new Set([url, fullSizeWikiImageUrl(url)].filter(Boolean))];
  for (const tryUrl of tryUrls) {
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

async function resolveImage(entry, overrides, urlOverrides, force) {
  if (!force) {
    const cached = readCache(entry.id);
    if (cached?.url) return cached;
  }

  if (urlOverrides[entry.id]) {
    const hit = {
      url: urlOverrides[entry.id],
      source: "Manual URL",
      title: entry.name,
    };
    writeCache(entry.id, hit);
    return hit;
  }

  let hit = null;
  if (entry.category === "anime_stories") {
    hit = await resolveJikan(entry);
    if (!hit) hit = await resolveWikipedia(entry, overrides);
  } else {
    hit = await resolveWikipedia(entry, overrides);
  }

  if (!hit) {
    await sleep(JIKAN_DELAY_MS);
    hit = await wikidataPoster(overrides[entry.id] ?? entry.name);
  }

  if (!hit && entry.category === "tv_stories") {
    hit = await tvmazePoster(entry.name);
  }

  if (hit) writeCache(entry.id, hit);
  else writeCache(entry.id, { error: "not found" });
  return hit;
}

function saveCatalog(catalog) {
  catalog.generated = new Date().toISOString();
  fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
}

async function main() {
  const opts = parseArgs();
  const overrides = loadOverrides();
  const urlOverrides = loadUrlOverrides();
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  fs.mkdirSync(imageDir, { recursive: true });

  const slice = catalog.entries.slice(
    opts.offset,
    opts.limit === Infinity ? undefined : opts.offset + opts.limit
  );

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (let i = 0; i < slice.length; i++) {
    const globalIdx = opts.offset + i;
    const entry = catalog.entries[globalIdx];
    if (!entry) continue;

    const existing = hasRaster(entry.id);
    if (existing && !opts.force) {
      entry.image = existing;
      skip++;
      continue;
    }

    console.log(
      `[${globalIdx + 1}/${catalog.entries.length}] ${entry.name} (${entry.category})`
    );

    try {
      if (opts.force) {
        try {
          fs.unlinkSync(cachePath(entry.id));
        } catch {
          /* skip */
        }
      }
      const hit = await resolveImage(entry, overrides, urlOverrides, opts.force);
      if (hit?.url) {
        const outFile = path.join(imageDir, `${entry.id}.jpg`);
        if (await downloadImage(hit.url, outFile)) {
          entry.image = `/deck/${entry.id}.jpg`;
          entry.imageAttribution = hit.source;
          console.log(`  ✓ ${hit.source}: ${hit.title ?? entry.name}`);
          ok++;
        } else {
          console.log(`  ✗ download failed`);
          fail++;
        }
      } else {
        console.log(`  ✗ no image found`);
        fail++;
      }
    } catch (e) {
      console.log(`  ✗ ${e.message}`);
      fail++;
    }

    if ((i + 1) % SAVE_EVERY === 0) saveCatalog(catalog);
    await sleep(DELAY_MS);
  }

  saveCatalog(catalog);
  const withPhoto = catalog.entries.filter((e) =>
    /\.(jpg|jpeg|webp|png)$/i.test(e.image ?? "")
  ).length;
  console.log(
    `\nDone. Downloaded: ${ok}, skipped: ${skip}, failed: ${fail}`
  );
  console.log(`Catalog with photos: ${withPhoto}/${catalog.entries.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
