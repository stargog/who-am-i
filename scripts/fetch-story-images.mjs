/**
 * Download real poster art for every story card (multi-source, best pick).
 *
 * Sources (by category): Jikan, TMDB*, TVMaze, OMDb*, Wikipedia, Wikimedia Commons, Wikidata
 * * TMDB_API_KEY / OMDB_API_KEY optional but recommended for movies & TV
 *
 *   npm run fetch:story-images
 *   npm run fetch:story-images -- --force
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "shared", "decks", "catalog.json");
const imageDir = path.join(root, "apps", "web", "public", "deck");
const overridesPath = path.join(root, "shared/decks/story-image-overrides.json");
const urlOverridesPath = path.join(root, "shared/decks/story-image-urls.json");
const cacheDir = path.join(root, "shared/decks/.cache/story-images");

const UA =
  "WhoAmI-DeckBuilder/1.0 (https://github.com/; educational party game)";
const DELAY_MS = 900;
const API_GAP_MS = 350;
const MAX_RETRIES = 5;
const SAVE_EVERY = 3;
const MIN_POSTER_BYTES = 3500;

const tmdbKey = process.env.TMDB_API_KEY?.trim() || "";
const omdbKey = process.env.OMDB_API_KEY?.trim() || "";

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
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  }
  throw new Error("429");
}

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return {};
  }
}

function fullSizeWikiImageUrl(url) {
  if (!url || !url.includes("/thumb/")) return url;
  const m = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/(?:[^/]+))\/thumb\/(.+)\/\d+px-[^/]+$/
  );
  if (m) return `${m[1]}/${m[2]}`;
  return url;
}

/** Higher = more likely a theatrical/key poster. */
function scorePosterUrl(url, meta = {}) {
  if (!url) return -999;
  const u = url.toLowerCase();
  let score = meta.baseScore ?? 40;

  if (u.endsWith(".svg")) return -999;
  if (/\.gif(\?|$)/.test(u)) score -= 25;

  if (/poster|one_sheet|one-sheet|keyart|key_art|cover\.|_cover|film_poster|movie_poster|theatrical/.test(u)) {
    score += 35;
  }
  if (/logo|wordmark|icon|banner|title_card|title-card|emblem|seal|flag/.test(u)) {
    score -= 45;
  }
  if (u.includes("myanimelist.net") || u.includes("cdn.myanimelist")) score += 28;
  if (u.includes("image.tmdb.org")) score += 32;
  if (u.includes("tvmaze.com")) score += 26;
  if (u.includes("/wikipedia/en/")) score += 28;
  if (u.includes("/wikipedia/commons/") && /poster/i.test(u)) score += 12;

  if (meta.source === "TMDB") score += 15;
  if (meta.source === "MyAnimeList/Jikan") score += 12;
  if (meta.source === "TVMaze") score += 22;
  if (meta.source === "OMDb") score += 14;
  if (meta.source === "Wikipedia") score += 8;
  if (meta.source === "Wikidata") score -= 5;

  if (meta.category === "movie_stories" && meta.source === "MyAnimeList/Jikan") {
    return -999;
  }
  if (meta.category === "tv_stories" && meta.source === "MyAnimeList/Jikan") {
    score -= 30;
  }

  return score;
}

function hasRaster(id) {
  for (const ext of [".jpg", ".jpeg", ".webp", ".png"]) {
    const f = path.join(imageDir, `${id}${ext}`);
    try {
      if (fs.statSync(f).size > MIN_POSTER_BYTES) return `/deck/${id}${ext}`;
    } catch {
      /* skip */
    }
  }
  return null;
}

function commonsMatchesTitle(storyName, fileName) {
  const stop = new Set(["the", "and", "of", "a", "an", "in", "on", "at", "to", "film", "movie"]);
  const words = storyName
    .toLowerCase()
    .replace(/[''·:]/g, "")
    .split(/[\s–—-]+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  const f = fileName.toLowerCase();
  if (words.length === 0) return false;
  const hits = words.filter((w) => f.includes(w)).length;
  if (!/poster|one.?sheet|keyart|film|movie/.test(f)) return false;
  if (words.length === 1) return hits >= 1 && f.includes(words[0]);
  return hits >= words.length;
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
    list.push(`${name} (American TV series)`);
  } else if (category === "anime_stories") {
    list.push(`${name} (TV series)`);
    list.push(`${name} (film)`);
    list.push(`${name} (anime)`);
    for (const a of aliases ?? []) {
      if (/^[\x00-\x7F\s'.:;,\-–—0-9!?]+$/u.test(a)) list.push(`${name} (${a})`);
    }
  }
  return [...new Set(list)];
}

async function getWikiPageImage(title) {
  await sleep(API_GAP_MS);
  try {
    const summary = await fetchJson(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      "https://en.wikipedia.org/"
    );
    const img =
      summary.originalimage?.source ?? summary.thumbnail?.source ?? null;
    if (img) {
      return {
        url: fullSizeWikiImageUrl(img),
        source: "Wikipedia",
        title: summary.title || title,
      };
    }
  } catch {
    /* fall through */
  }

  await sleep(API_GAP_MS);
  const data = await fetchJson(
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
      `&prop=pageimages&format=json&piprop=original|thumbnail&pithumbsize=800`,
    "https://en.wikipedia.org/"
  );
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) return null;
  const url = page.original?.source ?? page.thumbnail?.source;
  if (!url) return null;
  return {
    url: fullSizeWikiImageUrl(url),
    source: "Wikipedia",
    title: page.title || title,
  };
}

async function resolveWikipediaCandidates(entry, overrides) {
  const out = [];
  for (const title of wikiCandidates(entry, overrides)) {
    try {
      const hit = await getWikiPageImage(title);
      if (hit) out.push(hit);
    } catch {
      /* next */
    }
  }
  return out;
}

async function resolveCommonsPoster(entry) {
  const queries = [
    `${entry.name} film poster`,
    `${entry.name} movie poster`,
    `${entry.name} theatrical poster`,
    entry.category === "tv_stories" ? `${entry.name} TV series poster` : null,
  ].filter(Boolean);

  for (const q of queries) {
    try {
      await sleep(API_GAP_MS);
      const data = await fetchJson(
        `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
          `&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=6` +
          `&prop=imageinfo&iiprop=url|mime&iiurlwidth=780&format=json`,
        "https://commons.wikimedia.org/"
      );
      const pages = Object.values(data.query?.pages ?? {}).sort(
        (a, b) => (a.index ?? 0) - (b.index ?? 0)
      );
      for (const page of pages) {
        const info = page.imageinfo?.[0];
        const mime = info?.mime ?? "";
        if (!mime.startsWith("image/") || mime.includes("svg")) continue;
        const url = fullSizeWikiImageUrl(info.url ?? info.thumburl);
        if (!url) continue;
        const name = (page.title ?? "").replace(/^File:/i, "");
        if (/logo|icon|flag|map|location|crew poster|nasa|expedition/i.test(name)) {
          continue;
        }
        if (!commonsMatchesTitle(entry.name, name) && !/poster/i.test(name)) {
          continue;
        }
        return { url, source: "Wikimedia Commons", title: name, baseScore: 35 };
      }
    } catch {
      /* next query */
    }
  }
  return null;
}

async function resolveTmdb(entry, type) {
  if (!tmdbKey) return null;
  await sleep(API_GAP_MS);
  const endpoint = type === "tv" ? "search/tv" : "search/movie";
  const data = await fetchJson(
    `https://api.themoviedb.org/3/${endpoint}?api_key=${tmdbKey}&query=${encodeURIComponent(entry.name)}&language=en-US`,
    "https://www.themoviedb.org/"
  );
  const hit = data.results?.find((r) => r.poster_path) ?? data.results?.[0];
  if (!hit?.poster_path) return null;
  return {
    url: `https://image.tmdb.org/t/p/w780${hit.poster_path}`,
    source: "TMDB",
    title: hit.title ?? hit.name,
  };
}

async function resolveOmdb(entry) {
  if (!omdbKey) return null;
  const type = entry.category === "tv_stories" ? "series" : "movie";
  await sleep(API_GAP_MS);
  try {
    const data = await fetchJson(
      `https://www.omdbapi.com/?apikey=${omdbKey}&t=${encodeURIComponent(entry.name)}&type=${type}`,
      "https://www.omdbapi.com/"
    );
    if (data.Poster && data.Poster !== "N/A") {
      return { url: data.Poster, source: "OMDb", title: data.Title };
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function resolveTvmaze(name) {
  await sleep(API_GAP_MS);
  try {
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

function normalizeForMatch(s) {
  return s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreAnimeMatch(query, item) {
  const q = normalizeForMatch(query);
  for (const t of [item.title, item.title_english, item.title_japanese].filter(Boolean)) {
    const n = normalizeForMatch(t);
    if (n === q) return 100;
    if (n.startsWith(q) || q.startsWith(n)) return 80;
    if (n.includes(q) || q.includes(n)) return 55;
  }
  return 20;
}

async function resolveJikan(entry) {
  const queries = [
    entry.name,
    ...(entry.aliases ?? []).filter((a) =>
      /^[\x00-\x7F\s'.:;,\-–—0-9!?]+$/u.test(a)
    ),
  ];
  const seen = new Set();
  let best = null;
  let bestScore = 0;

  for (const q of queries) {
    if (!q || seen.has(q)) continue;
    seen.add(q);
    try {
      await sleep(API_GAP_MS);
      const data = await fetchJson(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=8`,
        "https://myanimelist.net/"
      );
      for (const item of data.data ?? []) {
        const match = scoreAnimeMatch(q, item);
        if (match < 50) continue;
        const url =
          item.images?.jpg?.large_image_url ?? item.images?.jpg?.image_url;
        if (!url) continue;
        const combined = match + 30;
        if (combined > bestScore) {
          bestScore = combined;
          best = {
            url,
            source: "MyAnimeList/Jikan",
            title: item.title,
            baseScore: 70,
          };
        }
      }
    } catch {
      /* next */
    }
  }
  return best;
}

async function wikidataImageOnly(query) {
  await sleep(API_GAP_MS);
  const search = await fetchJson(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=2`,
    "https://www.wikidata.org/"
  );
  const id = search.search?.[0]?.id;
  if (!id) return null;

  await sleep(API_GAP_MS);
  const entity = await fetchJson(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${id}&props=claims&format=json`,
    "https://www.wikidata.org/"
  );
  const raw = entity.entities?.[id]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  const fileName = typeof raw === "string" ? raw : null;
  if (!fileName) return null;

  await sleep(API_GAP_MS);
  const fileData = await fetchJson(
    `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url|mime&format=json`,
    "https://commons.wikimedia.org/"
  );
  const page = Object.values(fileData.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  const mime = info?.mime ?? "";
  if (!mime.startsWith("image/") || mime.includes("svg")) return null;
  const url = fullSizeWikiImageUrl(info?.url);
  if (!url) return null;
  return { url, source: "Wikidata", title: fileName };
}

async function resolveJikanByMalId(malId) {
  await sleep(API_GAP_MS);
  const data = await fetchJson(
    `https://api.jikan.moe/v4/anime/${malId}`,
    "https://myanimelist.net/"
  );
  const item = data?.data;
  const url =
    item?.images?.jpg?.large_image_url ?? item?.images?.jpg?.image_url;
  if (!url) return null;
  return {
    url,
    source: "MyAnimeList/Jikan",
    title: item.title,
    baseScore: 95,
  };
}

async function gatherPosterCandidates(entry, overrides, urlOverrides) {
  const raw = [];

  const malOverride = overrides[entry.id];
  if (typeof malOverride === "string" && malOverride.startsWith("mal:")) {
    const hit = await resolveJikanByMalId(malOverride.slice(4));
    if (hit) return [{ ...hit, score: scorePosterUrl(hit.url, hit) }];
  }

  if (urlOverrides[entry.id]) {
    raw.push({
      url: urlOverrides[entry.id],
      source: "Manual",
      title: entry.name,
      baseScore: 100,
    });
    return raw;
  }

  if (entry.category === "anime_stories") {
    const jikan = await resolveJikan(entry);
    if (jikan) raw.push(jikan);
    const tmdbTv = await resolveTmdb(entry, "tv");
    if (tmdbTv) raw.push(tmdbTv);
    raw.push(...(await resolveWikipediaCandidates(entry, overrides)));
    const commons = await resolveCommonsPoster(entry);
    if (commons) raw.push(commons);
  } else if (entry.category === "movie_stories") {
    const tmdb = await resolveTmdb(entry, "movie");
    if (tmdb) raw.push(tmdb);
    const omdb = await resolveOmdb(entry);
    if (omdb) raw.push(omdb);
    raw.push(...(await resolveWikipediaCandidates(entry, overrides)));
    const commons = await resolveCommonsPoster(entry);
    if (commons) raw.push(commons);
    /* Never use Jikan for live-action films — it returns unrelated anime. */
  } else {
    const tmdb = await resolveTmdb(entry, "tv");
    if (tmdb) raw.push(tmdb);
    const tvmaze = await resolveTvmaze(entry.name);
    if (tvmaze) raw.push(tvmaze);
    const omdb = await resolveOmdb(entry);
    if (omdb) raw.push(omdb);
    raw.push(...(await resolveWikipediaCandidates(entry, overrides)));
    const commons = await resolveCommonsPoster(entry);
    if (commons) raw.push(commons);
    /* Animated Western TV (e.g. Avatar) may exist on MAL — try last. */
    if (/avatar|simpsons|family guy|futurama/i.test(entry.name)) {
      const jikan = await resolveJikan(entry);
      if (jikan) raw.push({ ...jikan, baseScore: 45 });
    }
  }

  const wd = await wikidataImageOnly(overrides[entry.id] ?? entry.name);
  if (wd) raw.push(wd);

  const seen = new Set();
  const scored = [];
  for (const c of raw) {
    if (!c?.url || seen.has(c.url)) continue;
    seen.add(c.url);
    const score = scorePosterUrl(c.url, { ...c, category: entry.category });
    if (score > 0) scored.push({ ...c, score, category: entry.category });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

async function downloadImage(url, outFile) {
  const tryUrls = [...new Set([url, fullSizeWikiImageUrl(url)].filter(Boolean))];
  for (const tryUrl of tryUrls) {
    for (let i = 0; i < MAX_RETRIES; i++) {
      const res = await fetch(tryUrl, {
        headers: { "User-Agent": UA, Referer: "https://www.wikipedia.org/" },
      });
      if (res.status === 429) {
        await sleep(6000 * (i + 1));
        continue;
      }
      if (!res.ok) break;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < MIN_POSTER_BYTES) break;
      if (tryUrl.toLowerCase().includes(".svg")) break;
      fs.writeFileSync(outFile, buf);
      return { ok: true, bytes: buf.length };
    }
  }
  return { ok: false };
}

function cacheFile(id) {
  return path.join(cacheDir, `${id}.json`);
}

async function pickAndDownload(entry, overrides, urlOverrides) {
  let candidates = await gatherPosterCandidates(entry, overrides, urlOverrides);
  if (!candidates.length) return null;

  const bestWiki = candidates.find((c) => c.source === "Wikipedia");
  const bestTmdb = candidates.find((c) => c.source === "TMDB");
  const bestTvmaze = candidates.find((c) => c.source === "TVMaze");
  const trusted =
    bestTmdb?.score ??
    bestTvmaze?.score ??
    bestWiki?.score ??
    0;

  if (trusted >= 68) {
    candidates = candidates.filter(
      (c) =>
        !["Wikimedia Commons", "Wikidata"].includes(c.source) ||
        c.score > trusted + 25
    );
  }

  if (entry.category === "tv_stories" && bestTvmaze) {
    candidates = candidates.filter(
      (c) =>
        ["TVMaze", "TMDB", "OMDb", "Wikipedia"].includes(c.source) ||
        c.score > bestTvmaze.score + 15
    );
  }

  const outFile = path.join(imageDir, `${entry.id}.jpg`);
  for (const c of candidates.slice(0, 8)) {
    const result = await downloadImage(c.url, outFile);
    if (result.ok) {
      const picked = { ...c, bytes: result.bytes };
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(cacheFile(entry.id), JSON.stringify(picked, null, 2));
      return picked;
    }
  }
  return null;
}

function saveCatalog(catalog) {
  catalog.generated = new Date().toISOString();
  fs.writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
}

async function main() {
  const opts = parseArgs();
  const overrides = loadJson(overridesPath);
  const urlOverrides = loadJson(urlOverridesPath);
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
  fs.mkdirSync(imageDir, { recursive: true });

  if (!tmdbKey) {
    console.log(
      "Tip: set TMDB_API_KEY for better movie/TV posters (https://www.themoviedb.org/settings/api)\n"
    );
  }

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
      `[${globalIdx + 1}/${catalog.entries.length}] ${entry.name}`
    );

    try {
      if (opts.force) {
        try {
          fs.unlinkSync(cacheFile(entry.id));
        } catch {
          /* skip */
        }
        for (const ext of [".jpg", ".jpeg", ".webp", ".png"]) {
          try {
            fs.unlinkSync(path.join(imageDir, `${entry.id}${ext}`));
          } catch {
            /* skip */
          }
        }
      }

      const hit = await pickAndDownload(entry, overrides, urlOverrides);
      if (hit) {
        entry.image = `/deck/${entry.id}.jpg`;
        entry.imageAttribution = hit.source;
        console.log(
          `  ✓ ${hit.source} (score ${hit.score}, ${Math.round(hit.bytes / 1024)}KB) — ${hit.title ?? entry.name}`
        );
        ok++;
      } else {
        if (existing) {
          entry.image = existing;
          console.log(`  ~ kept previous image`);
          skip++;
        } else {
          console.log(`  ✗ no poster found`);
          fail++;
        }
      }
    } catch (e) {
      console.log(`  ✗ ${e.message}`);
      if (existing) skip++;
      else fail++;
    }

    if ((i + 1) % SAVE_EVERY === 0) saveCatalog(catalog);
    await sleep(DELAY_MS);
  }

  saveCatalog(catalog);
  const withPhoto = catalog.entries.filter((e) =>
    /\.(jpg|jpeg|webp|png)$/i.test(e.image ?? "")
  ).length;
  console.log(`\nDone. Updated: ${ok}, skipped: ${skip}, failed: ${fail}`);
  console.log(`With images: ${withPhoto}/${catalog.entries.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
