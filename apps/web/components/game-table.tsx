"use client";

import { clsx } from "clsx";
import type { ClientRoomState } from "@who-am-i/shared/types";
import { orderPlayersForTable, seatPosition } from "@/lib/table-layout";

type Props = {
  state: ClientRoomState;
  playerId: string;
  currentTurnId: string;
  getCharacter: (targetId: string) => string | null;
};

export function GameTable({
  state,
  playerId,
  currentTurnId,
  getCharacter,
}: Props) {
  const ordered = orderPlayersForTable(state.players, playerId);
  const n = ordered.length;
  const pending = state.pendingQuestion;
  const currentPlayer = state.players.find((p) => p.id === currentTurnId);
  const isMyTurn = currentTurnId === playerId;

  return (
    <div className="game-table-wrap">
      <div className="game-table-stage" aria-label="โต๊ะเกม">
        <div className="game-table-surface" />

        <div className="game-table-center">
          {pending ? (
            <>
              <p className="game-table-center-label">คำถาม</p>
              <p className="game-table-center-main line-clamp-3">{pending.text}</p>
              <p className="game-table-center-sub">
                จาก {state.players.find((p) => p.id === pending.askerId)?.name}
              </p>
            </>
          ) : isMyTurn ? (
            <>
              <p className="game-table-center-label">เทิร์นของคุณ</p>
              <p className="game-table-center-main">ถามหรือทายได้</p>
            </>
          ) : currentPlayer ? (
            <>
              <p className="game-table-center-label">เทิร์นของ</p>
              <p className="game-table-center-main">{currentPlayer.name}</p>
            </>
          ) : (
            <p className="game-table-center-main">รอเริ่มเทิร์น</p>
          )}
        </div>

        {ordered.map((p, index) => {
          const pos = seatPosition(index, n);
          const isMe = p.id === playerId;
          const isCurrent = p.id === currentTurnId;
          const char = isMe ? null : getCharacter(p.id);

          return (
            <div
              key={p.id}
              className={clsx(
                "game-table-seat",
                isCurrent && "game-table-seat--active",
                isMe && "game-table-seat--self"
              )}
              style={{ left: pos.left, top: pos.top }}
            >
              <div
                className={clsx(
                  "game-table-card",
                  isMe && "game-table-card--hidden"
                )}
              >
                <span className="game-table-card-text">
                  {isMe ? "?" : (char ?? "—")}
                </span>
              </div>
              <span className="game-table-avatar" aria-hidden>
                {p.name.charAt(0).toUpperCase()}
              </span>
              <p className="game-table-name">{p.name}</p>
              {isMe && <span className="game-table-you">คุณ</span>}
              {!p.connected && (
                <span className="game-table-offline">ออฟไลน์</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
