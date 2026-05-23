import type { ClientDeckInfo, DeckCategory } from "./deck";

export type Phase = "lobby" | "playing" | "finished";

export type Player = {
  id: string;
  name: string;
  ready: boolean;
  connected: boolean;
  isHost: boolean;
  preferredCategories: DeckCategory[];
};

export type Assignment = {
  targetPlayerId: string;
  character: string;
  fromPlayerId: string;
  deckEntryId: string;
};

export type Question = {
  askerId: string;
  text: string;
  answer: "yes" | "no" | "tie";
};

export type RoomState = {
  code: string;
  phase: Phase;
  players: Player[];
  turnOrder: string[];
  currentTurnIndex: number;
  assignments: Assignment[];
  deckCategories: DeckCategory[];
  /** Server-only: each player's private clue notebook */
  questionsByPlayer: Record<string, Question[]>;
  winnerId?: string;
  pendingQuestion?: {
    askerId: string;
    text: string;
    votes: Record<string, "yes" | "no">;
  };
};

export type ClientAssignment = {
  targetPlayerId: string;
  character: string | null;
  fromPlayerId: string;
  /** Set when the viewer may see this player's character (client can resolve from catalog). */
  deckEntryId: string | null;
  deck: ClientDeckInfo | null;
};

export type ClientRoomState = Omit<RoomState, "assignments" | "questionsByPlayer"> & {
  assignments: ClientAssignment[];
  /** This viewer's questions only */
  questions: Question[];
  /** How many questions each player has asked (no text) */
  questionCounts: Record<string, number>;
};
export type ClientMessage =
  | { type: "join"; playerId: string; name: string }
  | { type: "set_categories"; categories: DeckCategory[] }
  | { type: "ready" }
  | { type: "start_game" }
  | { type: "ask"; text: string }
  | { type: "vote"; vote: "yes" | "no" }
  | { type: "guess"; text: string }
  | { type: "play_again" };

export type ServerMessage =
  | { type: "state"; state: ClientRoomState }
  | { type: "error"; message: string };

export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;
export const MIN_PLAYER_CATEGORIES = 1;
export const MAX_NAME_LENGTH = 24;
export const MAX_TEXT_LENGTH = 80;
export const DISCONNECT_GRACE_MS = 60_000;
export const ASK_COOLDOWN_MS = 5_000;
