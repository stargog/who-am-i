"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomCode } from "@who-am-i/shared/utils";
import { getStoredPlayerName, setStoredPlayerName } from "@/lib/storage";
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
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--accent)]">Who Am I</h1>
        <p className="mt-2 text-lg text-[var(--muted)]">ฉันคือใคร?</p>
        <p className="mt-4 text-sm text-[var(--muted)]">
          สร้างห้อง เชิญเพื่อน มอบตัวละครให้กัน แล้วถามจนรู้ว่าตัวเองคือใคร
        </p>
      </div>

      <Panel>
        <label className="mb-2 block text-sm text-[var(--muted)]">ชื่อเล่น</label>
        <Input
          placeholder="ชื่อของคุณ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
        />
      </Panel>

      <Button className="w-full" disabled={!name.trim()} onClick={createRoom}>
        สร้างห้องใหม่
      </Button>

      <div className="flex items-center gap-3 text-[var(--muted)]">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-sm">หรือเข้าห้อง</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <Input
        placeholder="รหัสห้อง 6 ตัว"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
        maxLength={6}
        className="text-center tracking-widest uppercase"
      />
      <Button
        variant="secondary"
        className="w-full"
        disabled={!name.trim() || roomCode.trim().length !== 6}
        onClick={joinRoom}
      >
        เข้าห้อง
      </Button>
    </main>
  );
}
