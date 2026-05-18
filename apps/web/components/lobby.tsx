"use client";

import type { ClientRoomState } from "@who-am-i/shared/types";
import { MIN_PLAYERS } from "@who-am-i/shared/types";
import { getRoomUrl } from "@/lib/party";
import { Button, Panel } from "./ui";

type Props = {
  state: ClientRoomState;
  playerId: string;
  onReady: () => void;
  onStart: () => void;
};

export function Lobby({ state, playerId, onReady, onStart }: Props) {
  const me = state.players.find((p) => p.id === playerId);
  const connected = state.players.filter((p) => p.connected);
  const allReady =
    connected.length >= MIN_PLAYERS && connected.every((p) => p.ready);
  const roomUrl = getRoomUrl(state.code);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(roomUrl);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <p className="text-sm text-[var(--muted)]">รหัสห้อง</p>
        <p className="text-3xl font-bold tracking-widest text-[var(--accent)]">
          {state.code}
        </p>
        <Button variant="secondary" className="mt-3 w-full" onClick={copyLink}>
          คัดลอกลิงก์เชิญเพื่อน
        </Button>
        <p className="mt-2 truncate text-xs text-[var(--muted)]">{roomUrl}</p>
      </Panel>

      <Panel>
        <h2 className="mb-3 font-semibold">
          ผู้เล่น ({connected.length}/{state.players.length})
        </h2>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-[var(--bg)] px-3 py-2"
            >
              <span className={p.id === playerId ? "font-semibold" : ""}>
                {p.name}
                {p.isHost && (
                  <span className="ml-2 text-xs text-[var(--accent)]">โฮสต์</span>
                )}
                {p.id === playerId && (
                  <span className="ml-1 text-xs text-[var(--muted)]">(คุณ)</span>
                )}
              </span>
              <span className="text-sm">
                {!p.connected && (
                  <span className="text-[var(--muted)]">ออฟไลน์</span>
                )}
                {p.connected && p.ready && (
                  <span className="text-[var(--success)]">พร้อม</span>
                )}
                {p.connected && !p.ready && (
                  <span className="text-[var(--muted)]">รอ...</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Button className="w-full" variant="secondary" onClick={onReady}>
        {me?.ready ? "ยกเลิกพร้อม" : "พร้อมเล่น"}
      </Button>

      {me?.isHost && (
        <Button className="w-full" disabled={!allReady} onClick={onStart}>
          เริ่มเกม
        </Button>
      )}

      {!me?.isHost && (
        <p className="text-center text-sm text-[var(--muted)]">
          รอโฮสต์เริ่มเกมเมื่อทุกคนพร้อม
        </p>
      )}

      {me?.isHost && !allReady && (
        <p className="text-center text-sm text-[var(--muted)]">
          ต้องมีผู้เล่นอย่างน้อย {MIN_PLAYERS} คน และทุกคนกดพร้อม
        </p>
      )}
    </div>
  );
}
