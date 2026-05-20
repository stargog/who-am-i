/**
 * Fetch category poster images from category-specific sources.
 *
 *   npm run fetch:posters              # skip existing JPGs
 *   npm run fetch:posters -- --force   # re-download all
 *
 * Sources (see shared/decks/category-poster-sources.json):
 *   mal        — MyAnimeList via Jikan API (anime posters)
 *   wikipedia  — Wikipedia page/summary image
 *   tmdb       — The Movie Database (optional TMDB_API_KEY env)
 *   svg        — gradient fallback only
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CATEGORY_META } from "./deck-helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "apps", "web", "public", "categories");
const sourcesPath = path.join(
  root,
  "shared",
  "decks",
  "category-poster-sources.json"
);

const UA =
  "WhoAmI-DeckBuilder/1.0 (https://github.com/; educational party game)";
const DELAY_MS = 2200;
const MAX_RETRIES = 4;

const force = process.argv.includes("--force");
const sources = JSON.parse(fs.readFileSync(sourcesPath, "utf8"));
const tmdbKey = process.env.TMDB_API_KEY?.trim() || "";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function posterFile(id) {
  return path.join(outDir, `${id.replace(/_/g, "-")}.jpg`);
}

function posterSvgFile(id) {
  return posterFile(id).replace(/\.jpg$/, ".svg");
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

async function resolveMal(malId) {
  const data = await fetchJson(
    `https://api.jikan.moe/v4/anime/${malId}`,
    "https://myanimelist.net/"
  );
  const images = data?.data?.images?.jpg;
  return images?.large_image_url ?? images?.image_url ?? null;
}

async function resolveTmdb(id, type = "movie") {
  if (!tmdbKey) return null;
  const data = await fetchJson(
    `https://api.themoviedb.org/3/${type}/${id}?api_key=${tmdbKey}`,
    "https://www.themoviedb.org/"
  );
  const poster = data?.poster_path;
  return poster ? `https://image.tmdb.org/t/p/w500${poster}` : null;
}

async function resolveWikipedia(title) {
  try {
    const summary = await fetchJson(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      "https://en.wikipedia.org/"
    );
    if (summary.thumbnail?.source) return summary.thumbnail.source;
    if (summary.originalimage?.source) return summary.originalimage.source;
  } catch {
    /* try action API */
  }

  const data = await fetchJson(
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}` +
      `&prop=pageimages&piprop=thumbnail&pithumbsize=600&format=json&origin=*`,
    "https://en.wikipedia.org/"
  );
  const page = Object.values(data.query?.pages ?? {})[0];
  return page?.thumbnail?.source ?? null;
}

async function resolveImageUrl(categoryId, spec) {
  switch (spec.source) {
    case "mal":
      return resolveMal(spec.id);
    case "tmdb":
      return resolveTmdb(spec.id, spec.type ?? "movie");
    case "wikipedia":
      return resolveWikipedia(spec.title);
    case "svg":
      return null;
    default:
      throw new Error(`Unknown source "${spec.source}" for ${categoryId}`);
  }
}

async function download(url, dest, referer) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      ...(referer ? { Referer: referer } : {}),
    },
  });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) return false;
  fs.writeFileSync(dest, buf);
  return true;
}

function downloadReferer(spec) {
  if (spec.source === "mal") return "https://myanimelist.net/";
  if (spec.source === "wikipedia") return "https://en.wikipedia.org/";
  if (spec.source === "tmdb") return "https://www.themoviedb.org/";
  return undefined;
}

function writeSvgPoster(id, label, gradient) {
  const [c1, c2] = gradient;
  const safe = label.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="600" fill="url(#g)"/>
  <text x="200" y="520" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" font-weight="800" fill="rgba(255,255,255,0.92)">${safe}</text>
</svg>`;
  fs.writeFileSync(posterSvgFile(id), svg, "utf8");
}

function sourceLabel(spec) {
  if (spec.source === "mal") return `MAL #${spec.id}`;
  if (spec.source === "tmdb") return `TMDB #${spec.id}`;
  if (spec.source === "wikipedia") return `Wiki: ${spec.title}`;
  return "SVG";
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  let ok = 0;
  let fail = 0;

  for (const [id, spec] of Object.entries(sources)) {
    const meta = CATEGORY_META[id];
    const label = meta?.shortLabel ?? id.replace(/_/g, " ");
    const dest = posterFile(id);
    process.stdout.write(`${label} (${sourceLabel(spec)})… `);

    if (spec.source === "svg") {
      writeSvgPoster(id, label, meta?.gradient ?? ["#475569", "#1e293b"]);
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      console.log("svg");
      ok++;
      continue;
    }

    if (force && fs.existsSync(dest)) fs.unlinkSync(dest);

    if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 500) {
      console.log("cached");
      ok++;
      continue;
    }

    await sleep(DELAY_MS);
    try {
      const imageUrl = await resolveImageUrl(id, spec);
      if (imageUrl && (await download(imageUrl, dest, downloadReferer(spec)))) {
        console.log("ok");
        ok++;
        continue;
      }
    } catch (e) {
      console.log(`err: ${e.message}`);
    }

    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    writeSvgPoster(id, label, meta?.gradient ?? ["#475569", "#1e293b"]);
    console.log("svg fallback");
    fail++;
  }

  console.log(`\nDone: ${ok} posters, ${fail} svg fallbacks → ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
