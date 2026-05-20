"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import type { ClientRoomState } from "@who-am-i/shared/types";
import { MIN_PLAYERS, MIN_PLAYER_CATEGORIES } from "@who-am-i/shared/types";
import { DECK_CATEGORIES, type DeckCategory } from "@who-am-i/shared/deck";
import {
  canAssignCharactersPerPlayer,
  getDeckPool,
} from "@who-am-i/shared/deck-utils";
import { getRoomUrl } from "@/lib/party";
import { playerAvatar, playerColor } from "@/lib/player-theme";
import { Button, Panel } from "./ui";

type Props = {
  state: ClientRoomState;
  playerId: string;
  onReady: () => void;
  onStart: () => void;
  onSetCategories: (categories: DeckCategory[]) => void;
};

export function Lobby({
  state,
  playerId,
  onReady,
  onStart,
  onSetCategories,
}: Props) {
  const [copied, setCopied] = useState(false);
  const me = state.players.find((p) => p.id === playerId);
  const connected = state.players.filter((p) => p.connected);
  const myCategories = me?.preferredCategories ?? [];
  const roomUrl = getRoomUrl(state.code);

  const myPoolSize = getDeckPool(
    myCategories.length > 0 ? myCategories : undefined
  ).length;

  const everyoneHasCategories = connected.every(
    (p) => p.preferredCategories.length >= MIN_PLAYER_CATEGORIES
  );

  const assignmentOk = useMemo(
    () =>
      connected.length >= MIN_PLAYERS &&
      everyoneHasCategories &&
      canAssignCharactersPerPlayer(connected),
    [connected, everyoneHasCategories]
  );

  const allReady =
    connected.length >= MIN_PLAYERS &&
    connected.every((p) => p.ready) &&
    everyoneHasCategories &&
    assignmentOk;

  const canReady =
    myCategories.length >= MIN_PLAYER_CATEGORIES && myPoolSize > 0;

  function toggleCategory(id: DeckCategory) {
    const next = myCategories.includes(id)
      ? myCategories.filter((c) => c !== id)
      : [...myCategories, id];
    onSetCategories(next);
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

      <Panel>
        <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-white/40">
          Your categories
        </h2>
        <p className="mb-3 text-sm text-white/35">
          Pick at least {MIN_PLAYER_CATEGORIES} — you will only get a character
          from your own picks.
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DECK_CATEGORIES.map((cat) => {
            const selected = myCategories.includes(cat.id);
            return (
              <li key={cat.id}>
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                  style={{
                    background: selected
                      ? "rgba(167,139,250,0.1)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selected ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleCategory(cat.id)}
                    className="h-4 w-4 accent-[#a78bfa]"
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <p
          className={`mt-3 text-xs ${
            myCategories.length >= MIN_PLAYER_CATEGORIES && myPoolSize > 0
              ? "text-white/30"
              : "text-amber-400/90"
          }`}
        >
          {myCategories.length}/{MIN_PLAYER_CATEGORIES}+ categories · {myPoolSize}{" "}
          characters in your pool
        </p>
      </Panel>

      <Panel>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-white/40">
          Players ({connected.length}/{state.players.length})
        </h2>
        <ul className="flex flex-col gap-2">
          {state.players.map((p) => {
            const color = playerColor(p.id);
            const catCount = p.preferredCategories.length;
            const catsOk = catCount >= MIN_PLAYER_CATEGORIES;
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-xl px-3 py-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${p.id === playerId ? color + "33" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <span className="min-w-0 flex-1">
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
                  <span
                    className={`mt-0.5 block text-[10px] ${catsOk ? "text-white/25" : "text-amber-400/80"}`}
                  >
                    {catCount} categor{catCount === 1 ? "y" : "ies"} selected
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold">
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
        {me?.isHost && connected.length >= MIN_PLAYERS && !assignmentOk && (
          <p className="mt-3 text-xs text-amber-400/90">
            Category picks may overlap — need enough unique characters across
            players.
          </p>
        )}
      </Panel>

      <Button
        className="w-full"
        variant="secondary"
        disabled={!canReady}
        onClick={onReady}
      >
        {me?.ready ? "Cancel ready" : "Ready up"}
      </Button>

      {!canReady && (
        <p className="text-center text-xs text-white/25">
          Select at least {MIN_PLAYER_CATEGORIES} categories to ready up
        </p>
      )}

      {me?.isHost && (
        <Button className="w-full" disabled={!allReady} onClick={onStart}>
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
          Need {MIN_PLAYERS}+ players, {MIN_PLAYER_CATEGORIES}+ categories each,
          unique assignable characters, and everyone ready
        </p>
      )}
    </motion.div>
  );
}
