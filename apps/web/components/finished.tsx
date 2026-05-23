"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ClientRoomState } from "@who-am-i/shared/types";
import { resolveDeck } from "@/lib/deck-client";
import { playerColor } from "@/lib/player-theme";
import { CharacterCard } from "./character-card";
import { CelebrationOverlay } from "./celebration-overlay";
import { Button, Panel } from "./ui";

type Props = {
  state: ClientRoomState;
  playerId: string;
  onPlayAgain: () => void;
};

function getDeck(state: ClientRoomState, targetId: string) {
  const a = state.assignments.find((x) => x.targetPlayerId === targetId);
  return resolveDeck(a);
}

export function Finished({ state, playerId, onPlayAgain }: Props) {
  const [showCelebration, setShowCelebration] = useState(true);
  const winner = state.players.find((p) => p.id === state.winnerId);
  const me = state.players.find((p) => p.id === playerId);
  const winnerAssignment = state.assignments.find(
    (a) => a.targetPlayerId === state.winnerId
  );
  const winnerCharacter =
    resolveDeck(winnerAssignment)?.name ??
    winnerAssignment?.character ??
    "Unknown";
  const winnerColor = state.winnerId
    ? playerColor(state.winnerId)
    : "#a78bfa";

  return (
    <>
      <CelebrationOverlay
        show={showCelebration}
        playerName={winner?.name ?? "Winner"}
        character={winnerCharacter}
        playerColor={winnerColor}
        onContinue={() => setShowCelebration(false)}
        continueLabel="View results"
      />

      <motion.div
        className="flex flex-col gap-4 md:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Panel className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
            Winner
          </p>
          <p
            className="mt-1 text-3xl font-black"
            style={{ color: winnerColor }}
          >
            {winner?.name ?? "—"}
          </p>
          <p className="mt-2 text-sm text-white/40">Correct guess!</p>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/40">
            Everyone&apos;s stories
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {state.players.map((p) => {
              const deck = getDeck(state, p.id);
              const color = playerColor(p.id);
              return (
                <li
                  key={p.id}
                  className="rounded-2xl p-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${p.id === state.winnerId ? color + "44" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <CharacterCard deck={deck} variant="panel" />
                  <p className="mt-2 text-center text-sm font-bold text-white/80">
                    {p.name}
                    {p.id === state.winnerId && (
                      <span
                        className="ml-2 text-xs font-black uppercase"
                        style={{ color }}
                      >
                        Won
                      </span>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        </Panel>

        {me?.isHost ? (
          <Button className="w-full" onClick={onPlayAgain}>
            Play again
          </Button>
        ) : (
          <p className="text-center text-sm text-white/30">
            Waiting for the host to start a new round
          </p>
        )}
      </motion.div>
    </>
  );
}
