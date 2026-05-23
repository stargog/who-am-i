import type * as Party from "partykit/server";
import {
  ASK_COOLDOWN_MS,
  DISCONNECT_GRACE_MS,
  MAX_NAME_LENGTH,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MIN_PLAYER_CATEGORIES,
  type Assignment,
  type ClientMessage,
  type ClientRoomState,
  type Player,
  type Question,
  type RoomState,
} from "../shared/types";
import {
  assignCharactersPerPlayer,
  getDeckEntry,
  getDeckPool,
} from "../shared/deck-utils";
import { DECK_CATEGORIES, type DeckCategory } from "../shared/deck";
import {
  entryGuessMatches,
  sanitizeText,
  shuffle,
} from "../shared/utils";

const VALID_CATEGORIES = new Set(DECK_CATEGORIES.map((c) => c.id));

function sanitizeCategories(categories: DeckCategory[]): DeckCategory[] {
  return [...new Set(categories.filter((c) => VALID_CATEGORIES.has(c)))];
}

type ConnectionMeta = {
  playerId: string;
  lastAskAt?: number;
};

function createInitialState(code: string): RoomState {
  return {
    code,
    phase: "lobby",
    players: [],
    turnOrder: [],
    currentTurnIndex: 0,
    assignments: [],
    deckCategories: [],
    questionsByPlayer: {},
  };
}

function pushPlayerQuestion(
  state: RoomState,
  askerId: string,
  question: Question
) {
  const list = state.questionsByPlayer[askerId] ?? [];
  list.push(question);
  state.questionsByPlayer[askerId] = list;
}

function buildQuestionCounts(state: RoomState): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const [id, qs] of Object.entries(state.questionsByPlayer)) {
    counts[id] = qs.length;
  }
  return counts;
}

function getCharacterForPlayer(
  assignments: Assignment[],
  playerId: string
): string | undefined {
  return assignments.find((a) => a.targetPlayerId === playerId)?.character;
}

function toClientDeck(entryId: string) {
  const entry = getDeckEntry(entryId);
  if (!entry) return null;
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

function toClientAssignment(
  a: Assignment,
  viewerId: string | null,
  phase: RoomState["phase"]
): ClientRoomState["assignments"][number] {
  const hideFromTarget =
    viewerId !== null &&
    a.targetPlayerId === viewerId &&
    phase !== "finished";

  if (hideFromTarget) {
    return {
      targetPlayerId: a.targetPlayerId,
      fromPlayerId: a.fromPlayerId,
      character: null,
      deckEntryId: null,
      deck: null,
    };
  }

  return {
    targetPlayerId: a.targetPlayerId,
    fromPlayerId: a.fromPlayerId,
    character: a.character,
    deckEntryId: a.deckEntryId,
    deck: toClientDeck(a.deckEntryId),
  };
}

function filterStateForPlayer(
  state: RoomState,
  playerId: string | null
): ClientRoomState {
  const assignments = state.assignments.map((a) =>
    toClientAssignment(a, playerId, state.phase)
  );

  const { pendingQuestion, questionsByPlayer, ...rest } = state;

  const client: ClientRoomState = {
    ...rest,
    assignments,
    questions: playerId ? (questionsByPlayer[playerId] ?? []) : [],
    questionCounts: buildQuestionCounts(state),
    pendingQuestion:
      pendingQuestion && playerId
        ? {
            askerId: pendingQuestion.askerId,
            text: pendingQuestion.text,
            votes:
              pendingQuestion.askerId === playerId
                ? {}
                : { ...pendingQuestion.votes },
          }
        : pendingQuestion
          ? {
              askerId: pendingQuestion.askerId,
              text: pendingQuestion.text,
              votes: {},
            }
          : undefined,
  };

  return client;
}

export default class RoomServer implements Party.Server {
  state: RoomState;
  connectionToPlayer = new Map<string, string>();
  playerToConnection = new Map<string, string>();
  disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(readonly room: Party.Room) {
    this.state = createInitialState(room.id.toUpperCase());
  }

  onConnect(conn: Party.Connection) {
    conn.send(JSON.stringify({ type: "state", state: filterStateForPlayer(this.state, null) }));
  }

  onClose(conn: Party.Connection) {
    const meta = conn.state as ConnectionMeta | undefined;
    if (!meta?.playerId) return;

    const playerId = meta.playerId;
    this.connectionToPlayer.delete(conn.id);
    this.playerToConnection.delete(playerId);

    const player = this.state.players.find((p) => p.id === playerId);
    if (player) player.connected = false;

    const existing = this.disconnectTimers.get(playerId);
    if (existing) clearTimeout(existing);

    this.disconnectTimers.set(
      playerId,
      setTimeout(() => {
        this.disconnectTimers.delete(playerId);
        const stillDisconnected = !this.playerToConnection.has(playerId);
        if (stillDisconnected) {
          this.removePlayer(playerId);
        }
      }, DISCONNECT_GRACE_MS)
    );

    this.broadcastState();
  }

  onMessage(message: string, sender: Party.Connection) {
    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(message) as ClientMessage;
    } catch {
      this.sendError(sender, "Invalid message");
      return;
    }

    const meta = sender.state as ConnectionMeta | undefined;
    const playerId = meta?.playerId;

    switch (parsed.type) {
      case "join":
        this.handleJoin(sender, parsed.playerId, parsed.name);
        break;
      case "ready":
        if (!playerId) return this.sendError(sender, "You have not joined the room");
        this.handleReady(playerId, sender);
        break;
      case "set_categories":
        if (!playerId) return this.sendError(sender, "You have not joined the room");
        this.handleSetCategories(playerId, parsed.categories, sender);
        break;
      case "start_game":
        if (!playerId) return this.sendError(sender, "You have not joined the room");
        this.handleStartGame(playerId, sender);
        break;
      case "ask":
        if (!playerId) return this.sendError(sender, "You have not joined the room");
        this.handleAsk(playerId, parsed.text, sender, meta);
        break;
      case "vote":
        if (!playerId) return this.sendError(sender, "You have not joined the room");
        this.handleVote(playerId, parsed.vote, sender);
        break;
      case "guess":
        if (!playerId) return this.sendError(sender, "You have not joined the room");
        this.handleGuess(playerId, parsed.text, sender);
        break;
      case "play_again":
        if (!playerId) return this.sendError(sender, "You have not joined the room");
        this.handlePlayAgain(playerId, sender);
        break;
    }
  }

  handleJoin(conn: Party.Connection, playerId: string, name: string) {
    const cleanName = sanitizeText(name, MAX_NAME_LENGTH);
    if (!cleanName) {
      this.sendError(conn, "Please enter a display name");
      return;
    }

    if (!playerId || playerId.length > 64) {
      this.sendError(conn, "Invalid player id");
      return;
    }

    const existingTimer = this.disconnectTimers.get(playerId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.disconnectTimers.delete(playerId);
    }

    const oldConnId = this.playerToConnection.get(playerId);
    if (oldConnId && oldConnId !== conn.id) {
      const oldConn = [...this.room.getConnections()].find((c) => c.id === oldConnId);
      oldConn?.close();
      this.connectionToPlayer.delete(oldConnId);
    }

    this.connectionToPlayer.set(conn.id, playerId);
    this.playerToConnection.set(playerId, conn.id);
    conn.setState({ playerId } satisfies ConnectionMeta);

    let player = this.state.players.find((p) => p.id === playerId);
    if (!player) {
      if (this.state.players.length >= MAX_PLAYERS) {
        this.sendError(conn, "Room is full (max 8 players)");
        return;
      }
      const isHost = this.state.players.length === 0;
      player = {
        id: playerId,
        name: cleanName,
        ready: false,
        connected: true,
        isHost,
        preferredCategories: [],
      };
      this.state.players.push(player);
    } else {
      player.name = cleanName;
      player.connected = true;
      if (!player.preferredCategories) player.preferredCategories = [];
    }

    this.broadcastState();
  }

  handleSetCategories(
    playerId: string,
    categories: DeckCategory[],
    sender: Party.Connection
  ) {
    if (this.state.phase !== "lobby") return;
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;

    const sanitized = sanitizeCategories(categories);
    const dropped = categories.filter((c) => !VALID_CATEGORIES.has(c));
    if (dropped.length > 0) {
      this.sendError(
        sender,
        "Some categories are not available yet — refresh the page or wait for server update."
      );
    }
    player.preferredCategories = sanitized;
    player.ready = false;
    this.broadcastState();
  }

  handleReady(playerId: string, sender: Party.Connection) {
    if (this.state.phase !== "lobby") return;
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;

    if (
      !player.ready &&
      player.preferredCategories.length < MIN_PLAYER_CATEGORIES
    ) {
      this.sendError(
        sender,
        `Pick at least ${MIN_PLAYER_CATEGORIES} categories before readying up`
      );
      return;
    }

    player.ready = !player.ready;
    this.broadcastState();
  }

  handleStartGame(playerId: string, sender: Party.Connection) {
    if (this.state.phase !== "lobby") return;
    const host = this.state.players.find((p) => p.id === playerId);
    if (!host?.isHost) {
      this.sendError(sender, "Only the host can start the game");
      return;
    }

    const connected = this.state.players.filter((p) => p.connected);
    if (connected.length < MIN_PLAYERS) {
      this.sendError(sender, `Need at least ${MIN_PLAYERS} players`);
      return;
    }

    if (!connected.every((p) => p.ready)) {
      this.sendError(sender, "Everyone must be ready first");
      return;
    }

    for (const p of connected) {
      if (p.preferredCategories.length < MIN_PLAYER_CATEGORIES) {
        this.sendError(
          sender,
          `Everyone must pick at least ${MIN_PLAYER_CATEGORIES} categories`
        );
        return;
      }
      if (getDeckPool(p.preferredCategories).length === 0) {
        this.sendError(
          sender,
          `${p.name} has no stories in their selected categories`
        );
        return;
      }
    }

    const assignment = assignCharactersPerPlayer(
      connected.map((p) => p.id),
      (id) =>
        this.state.players.find((p) => p.id === id)!.preferredCategories,
      shuffle
    );

    if (!assignment) {
      this.sendError(
        sender,
        "Cannot assign unique stories — try different category mixes"
      );
      return;
    }

    const unionCategories = sanitizeCategories(
      connected.flatMap((p) => p.preferredCategories)
    );
    this.state.deckCategories = unionCategories;

    this.state.turnOrder = shuffle(connected.map((p) => p.id));
    this.state.assignments = connected.map((p) => {
      const entry = assignment.get(p.id)!;
      return {
        targetPlayerId: p.id,
        character: entry.name,
        deckEntryId: entry.id,
        fromPlayerId: "deck",
      };
    });
    this.state.questionsByPlayer = {};
    this.state.winnerId = undefined;
    this.state.pendingQuestion = undefined;
    this.state.currentTurnIndex = 0;
    this.state.phase = "playing";
    this.broadcastState();
  }

  handleAsk(
    playerId: string,
    text: string,
    sender: Party.Connection,
    meta?: ConnectionMeta
  ) {
    if (this.state.phase !== "playing") return;

    const currentId = this.state.turnOrder[this.state.currentTurnIndex];
    if (playerId !== currentId) {
      this.sendError(sender, "It is not your turn");
      return;
    }

    if (this.state.pendingQuestion) {
      this.sendError(sender, "Wait for the previous question to be answered");
      return;
    }

    const now = Date.now();
    if (meta?.lastAskAt && now - meta.lastAskAt < ASK_COOLDOWN_MS) {
      this.sendError(sender, "Too soon — wait a moment before asking again");
      return;
    }

    const clean = sanitizeText(text);
    if (!clean) {
      this.sendError(sender, "Please enter a question");
      return;
    }

    if (meta) meta.lastAskAt = now;
    sender.setState(meta);

    this.state.pendingQuestion = {
      askerId: playerId,
      text: clean,
      votes: {},
    };
    this.broadcastState();
  }

  handleVote(playerId: string, vote: "yes" | "no", sender: Party.Connection) {
    if (this.state.phase !== "playing" || !this.state.pendingQuestion) return;

    const { askerId, votes } = this.state.pendingQuestion;
    if (playerId === askerId) {
      this.sendError(sender, "The asker cannot vote");
      return;
    }

    if (votes[playerId]) {
      this.sendError(sender, "You already voted");
      return;
    }

    votes[playerId] = vote;

    const voters = this.state.players.filter(
      (p) => p.id !== askerId && p.connected
    );
    const votedCount = Object.keys(votes).length;
    if (votedCount < voters.length) {
      this.broadcastState();
      return;
    }

    let yes = 0;
    let no = 0;
    for (const v of Object.values(votes)) {
      if (v === "yes") yes++;
      else no++;
    }

    let answer: "yes" | "no" | "tie";
    if (yes > no) answer = "yes";
    else if (no > yes) answer = "no";
    else answer = "tie";

    pushPlayerQuestion(this.state, askerId, {
      askerId,
      text: this.state.pendingQuestion.text,
      answer,
    });
    this.state.pendingQuestion = undefined;

    if (answer !== "tie") {
      this.state.currentTurnIndex =
        (this.state.currentTurnIndex + 1) % this.state.turnOrder.length;
    }

    this.broadcastState();
  }

  handleGuess(playerId: string, text: string, sender: Party.Connection) {
    if (this.state.phase !== "playing") return;

    const currentId = this.state.turnOrder[this.state.currentTurnIndex];
    if (playerId !== currentId) {
      this.sendError(sender, "It is not your turn");
      return;
    }

    if (this.state.pendingQuestion) {
      this.sendError(sender, "Wait for the previous question to be answered");
      return;
    }

    const clean = sanitizeText(text);
    if (!clean) {
      this.sendError(sender, "Please enter your guess");
      return;
    }

    const assignment = this.state.assignments.find(
      (a) => a.targetPlayerId === playerId
    );
    const entry = assignment?.deckEntryId
      ? getDeckEntry(assignment.deckEntryId)
      : undefined;

    if (!assignment) {
      this.sendError(sender, "Your story was not found");
      return;
    }

    const matched =
      (entry && entryGuessMatches(clean, entry)) ||
      entryGuessMatches(clean, { name: assignment.character });

    if (matched) {
      this.state.winnerId = playerId;
      this.state.phase = "finished";
      this.state.pendingQuestion = undefined;
      this.broadcastState();
      return;
    }

    pushPlayerQuestion(this.state, playerId, {
      askerId: playerId,
      text: `[Guess] ${clean}`,
      answer: "no",
    });
    this.state.currentTurnIndex =
      (this.state.currentTurnIndex + 1) % this.state.turnOrder.length;
    this.broadcastState();
  }

  handlePlayAgain(playerId: string, sender: Party.Connection) {
    if (this.state.phase !== "finished") return;
    const host = this.state.players.find((p) => p.id === playerId);
    if (!host?.isHost) {
      this.sendError(sender, "Only the host can start a new round");
      return;
    }

    for (const p of this.state.players) {
      p.ready = false;
    }

    this.state.phase = "lobby";
    this.state.turnOrder = [];
    this.state.currentTurnIndex = 0;
    this.state.assignments = [];
    this.state.deckCategories = [];
    this.state.questionsByPlayer = {};
    this.state.winnerId = undefined;
    this.state.pendingQuestion = undefined;
    this.broadcastState();
  }

  removePlayer(playerId: string) {
    const idx = this.state.players.findIndex((p) => p.id === playerId);
    if (idx === -1) return;

    const wasHost = this.state.players[idx].isHost;
    this.state.players.splice(idx, 1);
    this.state.turnOrder = this.state.turnOrder.filter((id) => id !== playerId);
    this.state.assignments = this.state.assignments.filter(
      (a) => a.targetPlayerId !== playerId
    );
    delete this.state.questionsByPlayer[playerId];

    if (wasHost && this.state.players.length > 0) {
      this.state.players[0].isHost = true;
    }

    if (this.state.players.length === 0) {
      this.state = createInitialState(this.room.id.toUpperCase());
    } else if (this.state.phase !== "lobby") {
      this.reconcileGameAfterLeave(playerId);
    }

    this.broadcastState();
  }

  reconcileGameAfterLeave(leftId: string) {
    if (this.state.turnOrder.length < MIN_PLAYERS) {
      this.resetToLobby();
      return;
    }

    if (this.state.phase === "playing") {
      if (this.state.pendingQuestion?.askerId === leftId) {
        this.state.pendingQuestion = undefined;
      }
      const idx = this.state.turnOrder.indexOf(
        this.state.turnOrder[this.state.currentTurnIndex] ?? ""
      );
      if (idx >= this.state.turnOrder.length) {
        this.state.currentTurnIndex = 0;
      }
    }
  }

  resetToLobby() {
    for (const p of this.state.players) {
      p.ready = false;
    }
    this.state.phase = "lobby";
    this.state.turnOrder = [];
    this.state.currentTurnIndex = 0;
    this.state.assignments = [];
    this.state.deckCategories = [];
    this.state.questionsByPlayer = {};
    this.state.winnerId = undefined;
    this.state.pendingQuestion = undefined;
  }

  sendError(conn: Party.Connection, message: string) {
    conn.send(JSON.stringify({ type: "error", message } satisfies import("../shared/types").ServerMessage));
  }

  broadcastState() {
    for (const conn of this.room.getConnections()) {
      const meta = conn.state as ConnectionMeta | undefined;
      const filtered = filterStateForPlayer(this.state, meta?.playerId ?? null);
      conn.send(JSON.stringify({ type: "state", state: filtered }));
    }
  }
}
