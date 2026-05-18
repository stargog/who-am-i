export type DeckCategory =
  | "movie_characters"
  | "anime_characters"
  | "animals"
  | "objects";

export const DECK_CATEGORIES: {
  id: DeckCategory;
  label: string;
}[] = [
  { id: "movie_characters", label: "Movie characters" },
  { id: "anime_characters", label: "Anime characters" },
  { id: "animals", label: "Animals" },
  { id: "objects", label: "Objects" },
];

export type DeckTags = {
  type: "character" | "animal" | "object";
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
};

export type DeckCatalog = {
  version: number;
  entries: DeckEntry[];
};

export type ClientDeckInfo = Pick<
  DeckEntry,
  "id" | "name" | "category" | "image" | "imageAlt" | "tags" | "hints" | "facts"
>;
