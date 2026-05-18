export type Phase = "lobby" | "assigning" | "playing" | "finished";

export type Player = {
  id: string;
  name: string;
  ready: boolean;
  connected: boolean;
  isHost: boolean;
};

export type Assignment = {
  targetPlayerId: string;
  character: string;
  fromPlayerId: string;
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
  assignTargets: Record<string, string>;
  submittedAssigners: string[];
  questions: Question[];
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
};

export type ClientRoomState = Omit<RoomState, "assignments"> & {
  assignments: ClientAssignment[];
  myAssignTargetId?: string;
  hasSubmittedAssignment: boolean;
};

export type ClientMessage =
  | { type: "join"; playerId: string; name: string }
  | { type: "ready" }
  | { type: "start_game" }
  | { type: "submit_assignment"; character: string }
  | { type: "ask"; text: string }
  | { type: "vote"; vote: "yes" | "no" }
  | { type: "guess"; text: string }
  | { type: "play_again" };

export type ServerMessage =
  | { type: "state"; state: ClientRoomState }
  | { type: "error"; message: string };

export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;
export const MAX_NAME_LENGTH = 24;
export const MAX_TEXT_LENGTH = 80;
export const DISCONNECT_GRACE_MS = 60_000;
export const ASK_COOLDOWN_MS = 5_000;
