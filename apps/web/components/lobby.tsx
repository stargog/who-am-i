"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import type { ClientRoomState } from "@who-am-i/shared/types";
import { MIN_PLAYERS } from "@who-am-i/shared/types";
import { DECK_CATEGORIES, type DeckCategory } from "@who-am-i/shared/deck";
import { getDeckPool } from "@who-am-i/shared/deck-utils";
import { getRoomUrl } from "@/lib/party";
import { playerAvatar, playerColor } from "@/lib/player-theme";
import { Button, Panel } from "./ui";

type Props = {
  state: ClientRoomState;
  playerId: string;
  onReady: () => void;
  onStart: (categories?: DeckCategory[]) => void;
};

export function Lobby({ state, playerId, onReady, onStart }: Props) {
  const [categories, setCategories] = useState<DeckCategory[]>([]);
  const [copied, setCopied] = useState(false);
  const me = state.players.find((p) => p.id === playerId);
  const connected = state.players.filter((p) => p.connected);
  const allReady =
    connected.length >= MIN_PLAYERS && connected.every((p) => p.ready);
  const roomUrl = getRoomUrl(state.code);

  const poolSize = getDeckPool(
    categories.length > 0 ? categories : undefined
  ).length;
  const poolOk = poolSize >= connected.length;

  function toggleCategory(id: DeckCategory) {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.div
      className="flex flex-col gap-4 md:gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Panel className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
          Room code
        </p>
        <p
          className="mt-2 text-4xl font-black tracking-[0.25em] md:text-5xl"
          style={{ color: "#a78bfa" }}
        >
          {state.code}
        </p>
        <Button variant="secondary" className="mt-4 w-full" onClick={copyLink}>
          {copied ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" /> Copied!
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Copy className="h-4 w-4" /> Copy invite link
            </span>
          )}
        </Button>
        <p className="mt-2 truncate text-[10px] text-white/20">{roomUrl}</p>
      </Panel>

      {me?.isHost && (
        <Panel>
          <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-white/40">
            Character categories
          </h2>
          <p className="mb-3 text-sm text-white/35">
            Leave all unchecked for the full deck. Pick one or more to narrow the
            pool.
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DECK_CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                  style={{
                    background: categories.includes(cat.id)
                      ? "rgba(167,139,250,0.1)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${categories.includes(cat.id) ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={categories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="h-4 w-4 accent-[#a78bfa]"
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              </li>
            ))}
          </ul>
          <p
            className={`mt-3 text-xs ${poolOk ? "text-white/30" : "text-red-400"}`}
          >
            {poolSize} characters available for {connected.length} players
            {!poolOk && " — need more categories or fewer players"}
          </p>
        </Panel>
      )}

      <Panel>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-white/40">
          Players ({connected.length}/{state.players.length})
        </h2>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => {
            const color = playerColor(p.id);
            return (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl px-3 py-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${p.id === playerId ? color + "33" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{playerAvatar(p.id)}</span>
                  <span
                    className={
                      p.id === playerId ? "font-bold text-white" : "text-white/70"
                    }
                  >
                    {p.name}
                    {p.isHost && (
                      <span className="ml-1.5 text-[10px] font-normal text-yellow-400/80">
                        host
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-xs font-semibold">
                  {!p.connected && (
                    <span className="text-white/25">Offline</span>
                  )}
                  {p.connected && p.ready && (
                    <span style={{ color: "#4ade80" }}>Ready</span>
                  )}
                  {p.connected && !p.ready && (
                    <span className="text-white/25">Waiting…</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Button className="w-full" variant="secondary" onClick={onReady}>
        {me?.ready ? "Cancel ready" : "Ready up"}
      </Button>

      {me?.isHost && (
        <Button
          className="w-full"
          disabled={!allReady || !poolOk}
          onClick={() =>
            onStart(categories.length > 0 ? categories : undefined)
          }
        >
          Start game
        </Button>
      )}

      {!me?.isHost && (
        <p className="text-center text-sm text-white/30">
          Waiting for the host to start when everyone is ready
        </p>
      )}

      {me?.isHost && !allReady && (
        <p className="text-center text-xs text-white/25">
          Need at least {MIN_PLAYERS} players and everyone must be ready
        </p>
      )}
    </motion.div>
  );
}
