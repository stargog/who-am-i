"use client";

import type { ClientRoomState } from "@who-am-i/shared/types";
import { Button, Panel } from "./ui";

type Props = {
  state: ClientRoomState;
  playerId: string;
  onPlayAgain: () => void;
};

function getCharacter(
  state: ClientRoomState,
  targetId: string
): string | null {
  const a = state.assignments.find((x) => x.targetPlayerId === targetId);
  return a?.character ?? null;
}

export function Finished({ state, playerId, onPlayAgain }: Props) {
  const winner = state.players.find((p) => p.id === state.winnerId);
  const me = state.players.find((p) => p.id === playerId);

  return (
    <div className="flex flex-col gap-4">
      <Panel className="text-center">
        <p className="text-sm text-[var(--muted)]">ผู้ชนะ</p>
        <p className="text-2xl font-bold text-[var(--accent)]">
          {winner?.name ?? "—"}
        </p>
        <p className="mt-2 text-[var(--muted)]">ทายถูกแล้ว!</p>
      </Panel>

      <Panel>
        <h2 className="mb-3 font-semibold">ตัวละครทุกคน</h2>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li
              key={p.id}
              className="flex justify-between rounded-lg bg-[var(--bg)] px-3 py-2"
            >
              <span>
                {p.name}
                {p.id === state.winnerId && (
                  <span className="ml-2 text-xs text-[var(--accent)]">ชนะ</span>
                )}
              </span>
              <span className="font-semibold text-[var(--accent)]">
                {getCharacter(state, p.id) ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {state.questions.length > 0 && (
        <Panel>
          <h3 className="mb-2 font-semibold">สรุปคำถาม ({state.questions.length})</h3>
          <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-[var(--muted)]">
            {state.questions.map((q, i) => {
              const asker = state.players.find((p) => p.id === q.askerId);
              return (
                <li key={i}>
                  {asker?.name}: {q.text}
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {me?.isHost ? (
        <Button className="w-full" onClick={onPlayAgain}>
          เล่นอีกครั้ง
        </Button>
      ) : (
        <p className="text-center text-sm text-[var(--muted)]">
          รอโฮสต์เริ่มรอบใหม่
        </p>
      )}
    </div>
  );
}

