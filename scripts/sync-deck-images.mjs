/** Point catalog entries at existing raster files in public/deck/ */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "shared", "decks", "catalog.json");
const imageDir = path.join(root, "apps", "web", "public", "deck");
const exts = [".jpg", ".jpeg", ".webp", ".png"];

function findRaster(id) {
  for (const ext of exts) {
    const f = path.join(imageDir, `${id}${ext}`);
    try {
      if (fs.statSync(f).size > 800) return `/deck/${id}${ext}`;
    } catch {
      /* skip */
    }
  }
  return null;
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
let updated = 0;
for (const entry of catalog.entries) {
  const raster = findRaster(entry.id);
  if (raster && entry.image !== raster) {
    entry.image = raster;
    entry.imageAttribution = entry.imageAttribution ?? "Wikipedia / Wikimedia Commons";
    updated++;
  }
}
catalog.generated = new Date().toISOString();
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
const withJpg = catalog.entries.filter((e) => /\.(jpg|jpeg|webp|png)$/i.test(e.image ?? "")).length;
console.log(`Synced ${updated} entries. Catalog with photos: ${withJpg}/${catalog.entries.length}`);
