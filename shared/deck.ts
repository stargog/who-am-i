export type DeckCategory =
  | "harry_potter_characters"
  | "one_piece_characters"
  | "naruto_characters"
  | "dragon_ball_characters"
  | "pokemon_characters"
  | "demon_slayer_characters"
  | "attack_on_titan_characters"
  | "my_hero_academia_characters"
  | "jujutsu_kaisen_characters"
  | "anime_characters"
  | "movie_characters"
  | "animals"
  | "objects";

export const DECK_CATEGORIES: {
  id: DeckCategory;
  label: string;
}[] = [
  { id: "harry_potter_characters", label: "Harry Potter" },
  { id: "one_piece_characters", label: "One Piece" },
  { id: "naruto_characters", label: "Naruto" },
  { id: "dragon_ball_characters", label: "Dragon Ball" },
  { id: "pokemon_characters", label: "Pokemon" },
  { id: "demon_slayer_characters", label: "Demon Slayer" },
  { id: "attack_on_titan_characters", label: "Attack on Titan" },
  { id: "my_hero_academia_characters", label: "My Hero Academia" },
  { id: "jujutsu_kaisen_characters", label: "Jujutsu Kaisen" },
  { id: "anime_characters", label: "Anime (other)" },
  { id: "movie_characters", label: "Movie characters" },
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
