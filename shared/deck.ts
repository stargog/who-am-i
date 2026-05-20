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

function categoryPosterPath(id: DeckCategory): string {
  return `/categories/${id.replace(/_/g, "-")}.jpg`;
}

export const DECK_CATEGORIES: {
  id: DeckCategory;
  label: string;
  poster: string;
}[] = [
  { id: "harry_potter_characters", label: "Harry Potter", poster: categoryPosterPath("harry_potter_characters") },
  { id: "one_piece_characters", label: "One Piece", poster: categoryPosterPath("one_piece_characters") },
  { id: "naruto_characters", label: "Naruto", poster: categoryPosterPath("naruto_characters") },
  { id: "dragon_ball_characters", label: "Dragon Ball", poster: categoryPosterPath("dragon_ball_characters") },
  { id: "pokemon_characters", label: "Pokemon", poster: categoryPosterPath("pokemon_characters") },
  { id: "demon_slayer_characters", label: "Demon Slayer", poster: categoryPosterPath("demon_slayer_characters") },
  { id: "attack_on_titan_characters", label: "Attack on Titan", poster: categoryPosterPath("attack_on_titan_characters") },
  { id: "my_hero_academia_characters", label: "My Hero Academia", poster: categoryPosterPath("my_hero_academia_characters") },
  { id: "jujutsu_kaisen_characters", label: "Jujutsu Kaisen", poster: categoryPosterPath("jujutsu_kaisen_characters") },
  { id: "anime_characters", label: "Anime (other)", poster: categoryPosterPath("anime_characters") },
  { id: "movie_characters", label: "Movie characters", poster: categoryPosterPath("movie_characters") },
  { id: "animals", label: "Animals", poster: categoryPosterPath("animals") },
  { id: "objects", label: "Objects", poster: categoryPosterPath("objects") },
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

export function categoryPosterFallback(poster: string): string {
  return poster.replace(/\.jpg$/, ".svg");
}
