/**
 * Full local deck build from who_am_i_pool.csv (no external APIs).
 * Generates catalog.json, card images (SVG), hints, and facts automatically.
 *
 * Run: npm run import:pool
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  CATEGORY_META,
  PLACEHOLDER,
  RASTER_EXTS,
  buildFacts,
  buildHints,
  generateCardSvg,
  makeId,
  tagsFor,
} from "./deck-helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const csvPath = path.join(root, "who_am_i_pool.csv");
const catalogPath = path.join(root, "shared", "decks", "catalog.json");
const imageDir = path.join(root, "apps", "web", "public", "deck");

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function splitList(value) {
  if (!value) return [];
  return value
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseCsv(content) {
  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV is empty");

  const header = parseCsvLine(lines[0]);
  const col = (name) => header.indexOf(name);
  if (col("category") === -1 || col("name") === -1) {
    throw new Error('CSV header must include "category" and "name"');
  }

  return lines.slice(1).map((line, lineNo) => {
    const cells = parseCsvLine(line);
    const get = (name) => {
      const i = col(name);
      return i === -1 ? "" : (cells[i] ?? "").trim();
    };
    const category = get("category");
    const name = get("name");
    if (!category || !name) {
      throw new Error(`Line ${lineNo + 2}: missing category or name`);
    }
    if (!CATEGORY_META[category]) {
      throw new Error(`Line ${lineNo + 2}: unknown category "${category}"`);
    }
    return {
      category,
      name,
      image: get("image"),
      hints: splitList(get("hints")),
      facts: splitList(get("facts")),
    };
  });
}

function findRasterImage(id) {
  for (const ext of RASTER_EXTS) {
    const file = path.join(imageDir, `${id}${ext}`);
    if (fs.existsSync(file) && fs.statSync(file).size > 500) {
      return `/deck/${id}${ext}`;
    }
  }
  return null;
}

function resolveImage(row, entry) {
  const { id, name, category } = entry;

  if (row.image) {
    if (row.image.startsWith("/deck/")) return row.image;
    if (row.image.startsWith("deck/")) return `/${row.image}`;
    return `/deck/${row.image.replace(/^\//, "")}`;
  }

  const raster = findRasterImage(id);
  if (raster) return raster;

  fs.mkdirSync(imageDir, { recursive: true });
  const svgPath = path.join(imageDir, `${id}.svg`);
  fs.writeFileSync(svgPath, generateCardSvg({ name, category }), "utf8");
  return `/deck/${id}.svg`;
}

function loadExistingById() {
  try {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
    return new Map(catalog.entries.map((e) => [e.id, e]));
  } catch {
    return new Map();
  }
}

function main() {
  const content = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(content);
  const existingById = loadExistingById();
  const usedIds = new Set();
  const entries = [];
  let rasterCount = 0;
  let svgCount = 0;
  let customImageCount = 0;

  for (const row of rows) {
    let id = makeId(row.category, row.name);
    if (usedIds.has(id)) {
      id = `${id}-${usedIds.size}`;
    }
    usedIds.add(id);

    const tags = tagsFor(row.category);
    const prev = existingById.get(id);
    let hints = buildHints(row.category, row.name, row.hints);
    let facts = buildFacts(row.category, row.name, hints, row.facts);
    if (row.hints.length === 0 && row.facts.length === 0 && prev?.hints?.length) {
      hints = prev.hints;
      facts = prev.facts?.length ? prev.facts : hints;
    }

    const draft = { id, name: row.name, category: row.category };
    const image = resolveImage(row, draft);

    if (row.image) customImageCount++;
    else if (RASTER_EXTS.some((ext) => image.endsWith(ext))) rasterCount++;
    else if (image.endsWith(".svg") && image !== PLACEHOLDER) svgCount++;

    entries.push({
      id,
      name: row.name,
      category: row.category,
      image,
      imageAlt: row.name,
      tags,
      hints,
      facts,
    });
  }

  const byCat = {};
  for (const r of rows) {
    byCat[r.category] = (byCat[r.category] || 0) + 1;
  }

  fs.writeFileSync(
    catalogPath,
    JSON.stringify(
      {
        version: 2,
        source: "who_am_i_pool.csv",
        generated: new Date().toISOString(),
        entries,
      },
      null,
      2
    )
  );

  console.log(`✓ Built ${entries.length} characters (no API calls)`);
  console.log("  By category:", byCat);
  console.log(`  Images: ${svgCount} generated cards, ${rasterCount} photos, ${customImageCount} custom paths`);
  console.log(`  Wrote ${catalogPath}`);
  console.log("\nDeck is ready to play. Run: npm run dev");
}

main();
