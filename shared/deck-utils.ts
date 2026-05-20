import type { DeckCatalog, DeckCategory, DeckEntry } from "./deck";
import catalogData from "./decks/catalog.json";

const catalog = catalogData as DeckCatalog;

const byId = new Map<string, DeckEntry>(
  catalog.entries.map((e) => [e.id, e])
);

export function getCatalog(): DeckCatalog {
  return catalog;
}

export function getDeckEntry(id: string): DeckEntry | undefined {
  return byId.get(id);
}

export function getDeckPool(categories?: DeckCategory[]): DeckEntry[] {
  if (!categories || categories.length === 0) {
    return [...catalog.entries];
  }
  const set = new Set(categories);
  return catalog.entries.filter((e) => set.has(e.category));
}

export function pickDeckForPlayers(
  count: number,
  categories?: DeckCategory[]
): DeckEntry[] {
  const pool = getDeckPool(categories);
  if (pool.length < count) {
    throw new Error(
      `Not enough characters in deck (need ${count}, have ${pool.length})`
    );
  }
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/** Assign one unique character per player from each player's own category pool. */
export function assignCharactersPerPlayer(
  playerIds: string[],
  getCategories: (playerId: string) => DeckCategory[],
  shuffleFn: <T>(arr: T[]) => T[]
): Map<string, DeckEntry> | null {
  const order = shuffleFn([...playerIds]).sort((a, b) => {
    const pa = getDeckPool(getCategories(a)).length;
    const pb = getDeckPool(getCategories(b)).length;
    return pa - pb;
  });

  const used = new Set<string>();
  const assignment = new Map<string, DeckEntry>();

  function backtrack(idx: number): boolean {
    if (idx >= order.length) return true;
    const pid = order[idx];
    const pool = shuffleFn(getDeckPool(getCategories(pid))).filter(
      (e) => !used.has(e.id)
    );
    if (pool.length === 0) return false;
    for (const entry of pool) {
      used.add(entry.id);
      assignment.set(pid, entry);
      if (backtrack(idx + 1)) return true;
      used.delete(entry.id);
      assignment.delete(pid);
    }
    return false;
  }

  if (!backtrack(0)) return null;
  return assignment;
}

export function canAssignCharactersPerPlayer(
  players: { id: string; preferredCategories: DeckCategory[] }[]
): boolean {
  return (
    assignCharactersPerPlayer(
      players.map((p) => p.id),
      (id) => players.find((p) => p.id === id)!.preferredCategories,
      (arr) => [...arr]
    ) !== null
  );
}

export function formatTagLine(tags: DeckEntry["tags"]): string {
  const parts: string[] = [];
  parts.push(tags.type);
  if (tags.human) parts.push("Human");
  else parts.push("Not human");
  if (tags.fictional) parts.push("Fictional");
  else parts.push("Real");
  if (tags.alive === true) parts.push("Alive");
  else if (tags.alive === false) parts.push("Not alive");
  if (tags.gender !== "na") parts.push(tags.gender);
  return parts.join(" · ");
}
