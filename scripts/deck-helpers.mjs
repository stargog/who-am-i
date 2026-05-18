export const CATEGORY_META = {
  movie_characters: {
    label: "Movie character",
    shortLabel: "Movie",
    emoji: "🎬",
    gradient: ["#6d28d9", "#be185d"],
    tagType: "character",
    hintSeeds: ["From movies or TV", "Fictional character", "Not a real person"],
    factLead: (name) =>
      `${name} is a character from film, television, or related media.`,
  },
  anime_characters: {
    label: "Anime character",
    shortLabel: "Anime",
    emoji: "✨",
    gradient: ["#7c3aed", "#2563eb"],
    tagType: "character",
    hintSeeds: ["From anime or manga", "Fictional character", "Japanese-style animation"],
    factLead: (name) =>
      `${name} is a character from anime, manga, or related media.`,
  },
  animals: {
    label: "Animal",
    shortLabel: "Animal",
    emoji: "🐾",
    gradient: ["#047857", "#0d9488"],
    tagType: "animal",
    hintSeeds: ["A living animal", "Not a person or object", "Found in nature or as a pet"],
    factLead: (name) => `${name} is a type of animal.`,
  },
  objects: {
    label: "Object",
    shortLabel: "Object",
    emoji: "📦",
    gradient: ["#475569", "#1e40af"],
    tagType: "object",
    hintSeeds: ["An everyday thing", "Not alive", "Not a person or animal"],
    factLead: (name) => `${name} is a common object or item.`,
  },
};

export const PLACEHOLDER = "/deck/placeholder.svg";
export const RASTER_EXTS = [".jpg", ".jpeg", ".webp", ".png"];

export function slug(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function makeId(category, name) {
  return `${category.replace(/_/g, "-")}-${slug(name)}`;
}

export function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function initials(name) {
  const cleaned = name.replace(/^The\s+/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase() || "?";
}

export function tagsFor(category) {
  const meta = CATEGORY_META[category];
  switch (category) {
    case "movie_characters":
    case "anime_characters":
      return {
        type: meta.tagType,
        human: true,
        fictional: true,
        alive: "unknown",
        gender: "na",
      };
    case "animals":
      return {
        type: meta.tagType,
        human: false,
        fictional: false,
        alive: "unknown",
        gender: "na",
      };
    case "objects":
      return {
        type: meta.tagType,
        human: false,
        fictional: false,
        alive: "unknown",
        gender: "na",
      };
    default:
      throw new Error(`Unhandled category: ${category}`);
  }
}

export function buildHints(category, name, custom = []) {
  if (custom.length > 0) return custom;
  const meta = CATEGORY_META[category];
  const hints = [...meta.hintSeeds];
  const first = name.replace(/^The\s+/i, "").trim()[0];
  if (first) {
    hints.push(`Name begins with “${first.toUpperCase()}”`);
  }
  const words = name.trim().split(/\s+/).length;
  if (words >= 2) hints.push("Multi-word name");
  return hints.slice(0, 5);
}

export function buildFacts(category, name, hints, custom = []) {
  if (custom.length > 0) return custom;
  const meta = CATEGORY_META[category];
  return [
    meta.factLead(name),
    `Category: ${meta.label}.`,
    hints[0] ?? meta.hintSeeds[0],
  ].filter(Boolean);
}

export function generateCardSvg({ name, category }) {
  const meta = CATEGORY_META[category];
  const [c1, c2] = meta.gradient;
  const ini = escapeXml(initials(name));
  const safeName = escapeXml(name);
  const label = escapeXml(meta.shortLabel);
  const emoji = meta.emoji;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-label="${safeName}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="32" fill="url(#bg)"/>
  <circle cx="200" cy="155" r="72" fill="rgba(255,255,255,0.12)"/>
  <text x="200" y="175" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="56" font-weight="800" fill="#ffffff">${ini}</text>
  <text x="200" y="268" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="22" font-weight="700" fill="#ffffff">${safeName}</text>
  <text x="200" y="310" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="16" font-weight="600" fill="rgba(255,255,255,0.75)">${emoji} ${label}</text>
</svg>`;
}
