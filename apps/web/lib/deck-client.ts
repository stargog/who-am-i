import type { ClientDeckInfo } from "@who-am-i/shared/deck";
import { getDeckEntry } from "@who-am-i/shared/deck-utils";
import type { ClientAssignment } from "@who-am-i/shared/types";

export function toClientDeckInfo(entry: NonNullable<ReturnType<typeof getDeckEntry>>): ClientDeckInfo {
  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    image: entry.image,
    imageAlt: entry.imageAlt,
    tags: entry.tags,
    hints: entry.hints,
    facts: entry.facts,
  };
}

/** Resolve deck metadata on the client (catalog ships with the web app). */
export function resolveDeck(
  assignment: ClientAssignment | undefined
): ClientDeckInfo | null {
  if (!assignment) return null;

  if (assignment.deck) return assignment.deck;

  if (assignment.deckEntryId) {
    const entry = getDeckEntry(assignment.deckEntryId);
    if (entry) return toClientDeckInfo(entry);
  }

  return null;
}

/** Turn `/deck/foo.jpg` into an absolute URL so images work on nested routes. */
export function deckImageSrc(imagePath: string): string {
  if (!imagePath) return "/deck/placeholder.svg";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
  }
  return imagePath;
}
