/**
 * One-off: remove obsolete 3rd string arg (old kana) from anime() calls in stories-data.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(fileURLToPath(import.meta.url)), "stories-data.mjs");
let src = readFileSync(path, "utf8");

// anime("id", "Name", "kana-or-tier", "tier", ...  ->  anime("id", "Name", "tier", ...
src = src.replace(
  /anime\(([^,]+),\s*([^,]+),\s*"([^"]+)",\s*("a"|"b"|"c"),/g,
  (m, id, name, third, tier) => {
    if (third === "a" || third === "b" || third === "c") return m;
    return `anime(${id}, ${name}, ${tier},`;
  }
);

writeFileSync(path, src, "utf8");
console.log("Stripped obsolete anime() 3rd args");
