"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { generateRoomCode } from "@who-am-i/shared/utils";
import { getStoredPlayerName, setStoredPlayerName } from "@/lib/storage";
import { GameShell } from "@/components/game-shell";
import { Button, Input, Panel } from "@/components/ui";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    const stored = getStoredPlayerName();
    if (stored) setName(stored);
  }, []);

  function saveNameAndGo(code: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setStoredPlayerName(trimmed);
    router.push(`/room/${code.toUpperCase()}`);
  }

  function createRoom() {
    saveNameAndGo(generateRoomCode());
  }

  function joinRoom() {
    const code = roomCode.trim().toUpperCase();
    if (code.length !== 6) return;
    saveNameAndGo(code);
  }

  return (
    <GameShell connected>
      <main className="app-shell flex min-h-[calc(100dvh-65px)] flex-col justify-center gap-6 py-8 md:gap-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            Who Am I?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/40 md:text-base">
            Create a room, invite friends, get random stories, and ask yes/no
            questions until you guess who you are.
          </p>
        </motion.div>

        <Panel>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/30">
            Display name
          </label>
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
          />
        </Panel>

        <Button className="w-full" disabled={!name.trim()} onClick={createRoom}>
          Create room
        </Button>

        <div className="flex items-center gap-3 text-white/25">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs font-medium uppercase tracking-widest">
            or join
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Input
          placeholder="6-letter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="text-center uppercase tracking-[0.3em]"
        />
        <Button
          variant="secondary"
          className="w-full"
          disabled={!name.trim() || roomCode.trim().length !== 6}
          onClick={joinRoom}
        >
          Join room
        </Button>
      </main>
    </GameShell>
  );
}
