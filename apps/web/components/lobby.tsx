"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, CheckCircle2 } from "lucide-react";
import type { ClientRoomState } from "@who-am-i/shared/types";
import { MIN_PLAYERS, MIN_PLAYER_CATEGORIES } from "@who-am-i/shared/types";
import {
  categoryPosterFallback,
  DECK_CATEGORIES,
  type DeckCategory,
} from "@who-am-i/shared/deck";
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

function CategoryPosterCard({
  label,
  poster,
  selected,
  onToggle,
}: {
  label: string;
  poster: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const [src, setSrc] = useState(poster);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className="group relative block aspect-[2/3] w-full cursor-pointer overflow-hidden rounded-xl text-left transition-transform hover:scale-[1.02]"
      style={{
        boxShadow: selected
          ? "0 0 0 2px #a78bfa, 0 8px 24px rgba(167,139,250,0.25)"
          : "0 4px 16px rgba(0,0,0,0.35)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => {
          const fallback = categoryPosterFallback(poster);
          if (src !== fallback) setSrc(fallback);
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
      {selected && (
        <div className="absolute right-2 top-2 rounded-full bg-purple-500/90 p-0.5 shadow-lg">
          <CheckCircle2 className="h-5 w-5 text-white" aria-hidden />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-2.5">
        <p className="text-sm font-bold leading-tight text-white drop-shadow-md">
          {label}
        </p>
      </div>
    </button>
  );
}

export function Lobby({
  state,
  playerId,
  onReady,
  onStart,
  onSetCategories,
}: Props) {
  const [copied, setCopied] = useState(false);
  const serverCategories = state.players.find((p) => p.id === playerId)
    ?.preferredCategories;
  const [optimisticCategories, setOptimisticCategories] = useState<
    DeckCategory[] | null
  >(null);
  const sentCategoriesRef = useRef<DeckCategory[] | null>(null);
  const serverCategoriesAtSendRef = useRef<DeckCategory[] | null>(null);
  const categoryStateVersionRef = useRef(0);
  const categoryStateVersionAtSendRef = useRef(0);

  useEffect(() => {
    categoryStateVersionRef.current += 1;
  }, [serverCategories]);

  useEffect(() => {
    const sent = sentCategoriesRef.current;
    if (!sent) return;
    if (categoryStateVersionRef.current <= categoryStateVersionAtSendRef.current) {
      return;
    }

    const server = serverCategories ?? [];
    const serverSet = new Set(server);
    const matches =
      sent.length === server.length &&
      sent.every((c) => serverSet.has(c));

    if (matches) {
      sentCategoriesRef.current = null;
      serverCategoriesAtSendRef.current = null;
      categoryStateVersionAtSendRef.current = 0;
      setOptimisticCategories(null);
      return;
    }

    const atSend = serverCategoriesAtSendRef.current ?? [];
    const serverUnchanged =
      server.length === atSend.length &&
      server.every((c) => atSend.includes(c));
    if (serverUnchanged) {
      sentCategoriesRef.current = null;
      serverCategoriesAtSendRef.current = null;
      categoryStateVersionAtSendRef.current = 0;
      setOptimisticCategories(null);
    }
  }, [serverCategories]);

  const me = state.players.find((p) => p.id === playerId);
  const connected = state.players.filter((p) => p.connected);
  const myServerCategories = serverCategories ?? [];
  const myCategories = optimisticCategories ?? myServerCategories;
  const roomUrl = getRoomUrl(state.code);

  const myPoolSize = getDeckPool(
    myServerCategories.length > 0 ? myServerCategories : undefined
  ).length;

  const everyoneHasCategories = connected.every(
    (p) => p.preferredCategories.length >= MIN_PLAYER_CATEGORIES
  );

  const assignmentOk =
    connected.length >= MIN_PLAYERS &&
    everyoneHasCategories &&
    canAssignCharactersPerPlayer(connected);

  const allReady =
    connected.length >= MIN_PLAYERS &&
    connected.every((p) => p.ready) &&
    everyoneHasCategories &&
    assignmentOk;

  const canReady =
    myServerCategories.length >= MIN_PLAYER_CATEGORIES && myPoolSize > 0;

  function toggleCategory(id: DeckCategory) {
    const next = myCategories.includes(id)
      ? myCategories.filter((c) => c !== id)
      : [...myCategories, id];
    serverCategoriesAtSendRef.current = myServerCategories;
    categoryStateVersionAtSendRef.current = categoryStateVersionRef.current;
    sentCategoriesRef.current = next;
    setOptimisticCategories(next);
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
          Choose one or more — you will only get cards from your own picks.
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DECK_CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <CategoryPosterCard
                label={cat.label}
                poster={cat.poster}
                selected={myCategories.includes(cat.id)}
                onToggle={() => toggleCategory(cat.id)}
              />
            </li>
          ))}
        </ul>
        <p
          className={`mt-3 text-xs ${
            myServerCategories.length >= MIN_PLAYER_CATEGORIES && myPoolSize > 0
              ? "text-white/30"
              : "text-amber-400/90"
          }`}
        >
          {myServerCategories.length} categor
          {myServerCategories.length === 1 ? "y" : "ies"} saved · {myPoolSize}{" "}
          cards in your pool
          {optimisticCategories &&
            optimisticCategories.length !== myServerCategories.length && (
              <span className="text-white/20"> · saving…</span>
            )}
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
            Category picks may overlap — need enough unique cards across
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
          {myServerCategories.length === 0
            ? "Select at least one category to ready up"
            : "No cards in your selected categories — pick different ones"}
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
          Need {MIN_PLAYERS}+ players, at least one category each, unique
          assignable cards, and everyone ready
        </p>
      )}
    </motion.div>
  );
}
