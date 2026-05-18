"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRoom } from "@/lib/use-room";
import { getStoredPlayerName } from "@/lib/storage";
import { Lobby } from "./lobby";
import { Assigning } from "./assigning";
import { Playing } from "./playing";
import { Finished } from "./finished";
import { Button, Input, Panel } from "./ui";

export function RoomGame({ roomCode }: { roomCode: string }) {
  const [name, setName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const { state, error, connected, send, clearError, reconnectJoin, playerId } =
    useRoom(roomCode, nameConfirmed ? name : "");

  useEffect(() => {
    const stored = getStoredPlayerName();
    if (stored) {
      setName(stored);
      setNameConfirmed(true);
    }
  }, []);

  if (!nameConfirmed) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ห้อง {roomCode.toUpperCase()}</h1>
          <p className="mt-2 text-[var(--muted)]">ใส่ชื่อเล่นก่อนเข้าห้อง</p>
        </div>
        <Input
          placeholder="ชื่อเล่น"
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
          เข้าห้อง
        </Button>
        <Link href="/" className="text-center text-sm text-[var(--muted)] hover:underline">
          กลับหน้าแรก
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md p-4 pb-8">
      <header className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-[var(--muted)] hover:underline">
          ← หน้าแรก
        </Link>
        <span
          className={`text-xs ${connected ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
        >
          {connected ? "เชื่อมต่อแล้ว" : "กำลังเชื่อมต่อ..."}
        </span>
      </header>

      <h1 className="mb-4 text-center text-xl font-bold">
        ฉันคือใคร?{" "}
        <span className="text-[var(--accent)]">{roomCode.toUpperCase()}</span>
      </h1>

      {error && (
        <Panel className="mb-4 border-[var(--danger)] bg-red-950/30">
          <p className="text-sm text-[var(--danger)]">{error}</p>
          <Button variant="ghost" className="mt-2" onClick={clearError}>
            ปิด
          </Button>
        </Panel>
      )}

      {!connected && (
        <Panel className="mb-4 text-center">
          <p className="text-[var(--muted)]">กำลังเชื่อมต่อเซิร์ฟเวอร์...</p>
          <Button className="mt-2" variant="secondary" onClick={reconnectJoin}>
            ลองใหม่
          </Button>
        </Panel>
      )}

      {state && (
        <>
          {state.phase === "lobby" && (
            <Lobby
              state={state}
              playerId={playerId}
              onReady={() => send({ type: "ready" })}
              onStart={() => send({ type: "start_game" })}
            />
          )}
          {state.phase === "assigning" && (
            <Assigning
              state={state}
              playerId={playerId}
              onSubmit={(character) =>
                send({ type: "submit_assignment", character })
              }
            />
          )}
          {state.phase === "playing" && (
            <Playing
              state={state}
              playerId={playerId}
              onAsk={(text) => send({ type: "ask", text })}
              onVote={(vote) => send({ type: "vote", vote })}
              onGuess={(text) => send({ type: "guess", text })}
            />
          )}
          {state.phase === "finished" && (
            <Finished
              state={state}
              playerId={playerId}
              onPlayAgain={() => send({ type: "play_again" })}
            />
          )}
        </>
      )}

      {!state && connected && (
        <Panel className="text-center text-[var(--muted)]">กำลังโหลดห้อง...</Panel>
      )}
    </main>
  );
}
