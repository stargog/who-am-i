"use client";

import { useState } from "react";
import deck from "@who-am-i/shared/decks/th";
import type { ClientRoomState } from "@who-am-i/shared/types";
import { Button, Input, Panel } from "./ui";

type Props = {
  state: ClientRoomState;
  playerId: string;
  onSubmit: (character: string) => void;
};

export function Assigning({ state, playerId, onSubmit }: Props) {
  const [character, setCharacter] = useState("");
  const targetId = state.myAssignTargetId;
  const target = state.players.find((p) => p.id === targetId);
  const submitted = state.submittedAssigners.length;
  const total = state.turnOrder.length;

  function pickRandom() {
    const item = deck[Math.floor(Math.random() * deck.length)] as string;
    setCharacter(item);
  }

  if (state.hasSubmittedAssignment) {
    return (
      <Panel className="text-center">
        <p className="text-lg font-semibold">ส่งตัวละครแล้ว</p>
        <p className="mt-2 text-[var(--muted)]">
          รอผู้เล่นคนอื่น... ({submitted}/{total})
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg)]">
          <div
            className="h-full bg-[var(--accent)] transition-all"
            style={{ width: `${(submitted / total) * 100}%` }}
          />
        </div>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <h2 className="text-lg font-semibold">ใส่ตัวละครให้</h2>
        <p className="mt-1 text-2xl font-bold text-[var(--accent)]">
          {target?.name ?? "..."}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          คนอื่นจะไม่เห็นจนกว่าจะเริ่มเล่น — ตัวคุณจะไม่รู้ตัวละครของตัวเอง
        </p>
      </Panel>

      <Input
        placeholder="เช่น นักร้อง, ช้าง, ไอรอนแมน..."
        value={character}
        onChange={(e) => setCharacter(e.target.value)}
        maxLength={80}
      />

      <Button variant="secondary" onClick={pickRandom}>
        สุ่มจากเด็ค
      </Button>

      <Button
        className="w-full"
        disabled={!character.trim()}
        onClick={() => onSubmit(character.trim())}
      >
        ส่งตัวละคร
      </Button>

      <p className="text-center text-sm text-[var(--muted)]">
        ความคืบหน้า {submitted}/{total}
      </p>
    </div>
  );
}
