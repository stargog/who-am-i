export const CATEGORY_META = {
  harry_potter_characters: {
    label: "Harry Potter character",
    shortLabel: "Harry Potter",
    emoji: "⚡",
    gradient: ["#1e3a5f", "#7c2d12"],
    tagType: "character",
    hintSeeds: [
      "From Harry Potter",
      "Fictional wizarding character",
      "Not a real person",
    ],
    factLead: (name) =>
      `${name} is a character from the Harry Potter books and films.`,
  },
  one_piece_characters: {
    label: "One Piece character",
    shortLabel: "One Piece",
    emoji: "🏴‍☠️",
    gradient: ["#dc2626", "#1d4ed8"],
    tagType: "character",
    hintSeeds: ["From One Piece", "Fictional anime character", "Not a real person"],
    factLead: (name) => `${name} is a character from the One Piece series.`,
  },
  naruto_characters: {
    label: "Naruto character",
    shortLabel: "Naruto",
    emoji: "🍥",
    gradient: ["#ea580c", "#2563eb"],
    tagType: "character",
    hintSeeds: ["From Naruto", "Fictional anime character", "Not a real person"],
    factLead: (name) => `${name} is a character from the Naruto series.`,
  },
  dragon_ball_characters: {
    label: "Dragon Ball character",
    shortLabel: "Dragon Ball",
    emoji: "🐉",
    gradient: ["#f97316", "#eab308"],
    tagType: "character",
    hintSeeds: ["From Dragon Ball", "Fictional anime character", "Not a real person"],
    factLead: (name) => `${name} is a character from the Dragon Ball series.`,
  },
  pokemon_characters: {
    label: "Pokemon character",
    shortLabel: "Pokemon",
    emoji: "⚡",
    gradient: ["#eab308", "#dc2626"],
    tagType: "character",
    hintSeeds: ["From Pokemon", "Fictional anime character", "Not a real person"],
    factLead: (name) => `${name} is a character from the Pokemon series.`,
  },
  demon_slayer_characters: {
    label: "Demon Slayer character",
    shortLabel: "Demon Slayer",
    emoji: "👹",
    gradient: ["#059669", "#7c2d12"],
    tagType: "character",
    hintSeeds: ["From Demon Slayer", "Fictional anime character", "Not a real person"],
    factLead: (name) => `${name} is a character from Demon Slayer: Kimetsu no Yaiba.`,
  },
  attack_on_titan_characters: {
    label: "Attack on Titan character",
    shortLabel: "AoT",
    emoji: "🧱",
    gradient: ["#57534e", "#991b1b"],
    tagType: "character",
    hintSeeds: ["From Attack on Titan", "Fictional anime character", "Not a real person"],
    factLead: (name) => `${name} is a character from Attack on Titan.`,
  },
  my_hero_academia_characters: {
    label: "My Hero Academia character",
    shortLabel: "MHA",
    emoji: "💥",
    gradient: ["#2563eb", "#16a34a"],
    tagType: "character",
    hintSeeds: ["From My Hero Academia", "Fictional anime character", "Not a real person"],
    factLead: (name) => `${name} is a character from My Hero Academia.`,
  },
  jujutsu_kaisen_characters: {
    label: "Jujutsu Kaisen character",
    shortLabel: "JJK",
    emoji: "👁",
    gradient: ["#1e1b4b", "#7c3aed"],
    tagType: "character",
    hintSeeds: ["From Jujutsu Kaisen", "Fictional anime character", "Not a real person"],
    factLead: (name) => `${name} is a character from Jujutsu Kaisen.`,
  },
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
  if (!meta) throw new Error(`Unknown category: ${category}`);
  if (meta.tagType === "character") {
    return {
      type: meta.tagType,
      human: true,
      fictional: true,
      alive: "unknown",
      gender: "na",
    };
  }
  switch (category) {
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
