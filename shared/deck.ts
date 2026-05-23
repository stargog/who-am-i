export type DeckCategory =
  | "anime_stories"
  | "movie_stories"
  | "tv_stories";

function categoryPosterPath(id: DeckCategory): string {
  return `/categories/${id.replace(/_/g, "-")}.jpg`;
}

export const DECK_CATEGORIES: {
  id: DeckCategory;
  label: string;
  poster: string;
}[] = [
  {
    id: "anime_stories",
    label: "Anime",
    poster: "/categories/anime-characters.jpg",
  },
  {
    id: "movie_stories",
    label: "Movies",
    poster: "/categories/movie-characters.jpg",
  },
  {
    id: "tv_stories",
    label: "TV Series",
    poster: "/categories/movie-characters.jpg",
  },
];

export type DeckTags = {
  type: "story" | "character" | "animal" | "object";
  media?: "anime" | "movie" | "tv";
  tier?: "a" | "b" | "c";
  human: boolean;
  fictional: boolean;
  alive: boolean | "unknown";
  gender: "male" | "female" | "nonbinary" | "na";
};

export type DeckEntry = {
  id: string;
  name: string;
  category: DeckCategory;
  image: string;
  imageAlt?: string;
  imageAttribution?: string;
  tags: DeckTags;
  hints: string[];
  facts: string[];
  /** Extra accepted guess strings (e.g. Japanese title). Server-only for matching. */
  aliases?: string[];
};

export type DeckCatalog = {
  version: number;
  entries: DeckEntry[];
};

export type ClientDeckInfo = Pick<
  DeckEntry,
  "id" | "name" | "category" | "image" | "imageAlt" | "tags" | "hints" | "facts"
>;

export function categoryPosterFallback(poster: string): string {
  return poster.replace(/\.jpg$/, ".svg");
}
