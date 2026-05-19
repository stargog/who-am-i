"use client";

import { clsx } from "clsx";
import type { ClientDeckInfo } from "@who-am-i/shared/deck";
import type { ClientRoomState } from "@who-am-i/shared/types";
import { orderPlayersForTable, seatPosition } from "@/lib/table-layout";
import { CharacterCard } from "./character-card";

type Props = {
  state: ClientRoomState;
  playerId: string;
  currentTurnId: string;
  getDeck: (targetId: string) => ClientDeckInfo | null;
};

export function GameTable({
  state,
  playerId,
  currentTurnId,
  getDeck,
}: Props) {
  const ordered = orderPlayersForTable(state.players, playerId);
  const n = ordered.length;
  const pending = state.pendingQuestion;
  const currentPlayer = state.players.find((p) => p.id === currentTurnId);
  const isMyTurn = currentTurnId === playerId;

  return (
    <div className="game-table-wrap">
      <div
        className="game-table-stage"
        aria-label="Game table"
        data-players={n}
      >
        <div className="game-table-surface" />

        <div className="game-table-center">
          {pending ? (
            <>
              <p className="game-table-center-label">Question</p>
              <p className="game-table-center-main line-clamp-3">{pending.text}</p>
              <p className="game-table-center-sub">
                from {state.players.find((p) => p.id === pending.askerId)?.name}
              </p>
            </>
          ) : isMyTurn ? (
            <>
              <p className="game-table-center-label">Your turn</p>
              <p className="game-table-center-main">Ask or guess</p>
            </>
          ) : currentPlayer ? (
            <>
              <p className="game-table-center-label">Turn</p>
              <p className="game-table-center-main">{currentPlayer.name}</p>
            </>
          ) : (
            <p className="game-table-center-main">Waiting for turn</p>
          )}
        </div>

        {ordered.map((p, index) => {
          const pos = seatPosition(index, n);
          const isMe = p.id === playerId;
          const isCurrent = p.id === currentTurnId;
          const deck = isMe ? null : getDeck(p.id);

          return (
            <div
              key={p.id}
              data-seat={index}
              className={clsx(
                "game-table-seat",
                isCurrent && "game-table-seat--active",
                isMe && "game-table-seat--self"
              )}
              style={{ left: pos.left, top: pos.top }}
            >
              <div className="game-table-seat-player">
                <span className="game-table-avatar" aria-hidden>
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <span className="game-table-name">{p.name}</span>
                {isMe && <span className="game-table-you">You</span>}
                {!p.connected && (
                  <span className="game-table-offline">Offline</span>
                )}
              </div>

              <CharacterCard
                deck={deck}
                hidden={isMe}
                variant="table"
                className="game-table-seat-card"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
