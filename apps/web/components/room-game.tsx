"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRoom } from "@/lib/use-room";
import { getStoredPlayerName } from "@/lib/storage";
import { playerColor } from "@/lib/player-theme";
import { Lobby } from "./lobby";
import { Playing } from "./playing";
import { Finished } from "./finished";
import { GameShell } from "./game-shell";
import { Button, Input, Panel } from "./ui";

export function RoomGame({ roomCode }: { roomCode: string }) {
  const [name, setName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"players" | "info" | null>(
    null
  );
  const { state, error, connected, send, clearError, reconnectJoin, playerId } =
    useRoom(roomCode, nameConfirmed ? name : "");

  useEffect(() => {
    const stored = getStoredPlayerName();
    if (stored) {
      setName(stored);
      setNameConfirmed(true);
    }
  }, []);

  const code = roomCode.toUpperCase();
  const currentTurnId =
    state?.phase === "playing"
      ? (state.turnOrder[state.currentTurnIndex] ?? "")
      : "";
  const glowColor = currentTurnId ? playerColor(currentTurnId) : "#a78bfa";

  if (!nameConfirmed) {
    return (
      <GameShell roomCode={code} connected={connected}>
        <main className="app-shell flex min-h-[calc(100dvh-65px)] flex-col justify-center gap-6 py-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-black text-white md:text-3xl">
              Join room{" "}
              <span style={{ color: glowColor }}>{code}</span>
            </h2>
            <p className="mt-2 text-sm text-white/40">
              Enter your display name to join
            </p>
          </motion.div>
          <Input
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            autoFocus
          />
          <Button
            className="w-full"
            disabled={!name.trim()}
            onClick={() => setNameConfirmed(true)}
          >
            Join room
          </Button>
          <Link
            href="/"
            className="text-center text-sm text-white/30 transition-colors hover:text-white/60"
          >
            ← Back to home
          </Link>
        </main>
      </GameShell>
    );
  }

  const isPlaying = state?.phase === "playing";

  return (
    <GameShell
      roomCode={code}
      playerCount={state?.players.length}
      connected={connected}
      glowColor={glowColor}
      showMobileToggles={isPlaying}
      mobilePanel={mobilePanel}
      onMobilePanel={isPlaying ? setMobilePanel : undefined}
    >
      {error && (
        <div className="mx-4 mb-4 mt-2 rounded-2xl border border-red-400/30 bg-red-950/30 p-4 md:mx-6">
          <p className="text-sm text-red-300">{error}</p>
          <Button variant="ghost" className="mt-2" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      )}

      {!connected && (
        <div className="mx-4 mb-4 mt-2 glass-panel p-4 text-center md:mx-6">
          <p className="text-white/40">Connecting to server…</p>
          <Button className="mt-3" variant="secondary" onClick={reconnectJoin}>
            Retry
          </Button>
        </div>
      )}

      {state?.phase === "lobby" && (
        <main className="app-shell py-6">
          <Lobby
            state={state}
            playerId={playerId}
            onReady={() => send({ type: "ready" })}
            onStart={() => send({ type: "start_game" })}
            onSetCategories={(categories) =>
              send({ type: "set_categories", categories })
            }
          />
        </main>
      )}

      {state?.phase === "playing" && (
        <Playing
          state={state}
          playerId={playerId}
          mobilePanel={mobilePanel}
          onMobilePanel={setMobilePanel}
          onAsk={(text) => send({ type: "ask", text })}
          onVote={(vote) => send({ type: "vote", vote })}
          onGuess={(text) => send({ type: "guess", text })}
        />
      )}

      {state?.phase === "finished" && (
        <main className="app-shell py-6">
          <Finished
            state={state}
            playerId={playerId}
            onPlayAgain={() => send({ type: "play_again" })}
          />
        </main>
      )}

      {!state && connected && (
        <div className="app-shell py-12 text-center text-white/40">
          Loading room…
        </div>
      )}
    </GameShell>
  );
}
