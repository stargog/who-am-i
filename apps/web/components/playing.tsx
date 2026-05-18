"use client";

import { useState } from "react";
import type { ClientRoomState } from "@who-am-i/shared/types";
import { GameTable } from "./game-table";
import { Button, Input, Panel } from "./ui";

type Props = {
  state: ClientRoomState;
  playerId: string;
  onAsk: (text: string) => void;
  onVote: (vote: "yes" | "no") => void;
  onGuess: (text: string) => void;
};

function getCharacter(
  state: ClientRoomState,
  targetId: string
): string | null {
  const a = state.assignments.find((x) => x.targetPlayerId === targetId);
  return a?.character ?? null;
}

export function Playing({
  state,
  playerId,
  onAsk,
  onVote,
  onGuess,
}: Props) {
  const [question, setQuestion] = useState("");
  const [guess, setGuess] = useState("");
  const [showGuess, setShowGuess] = useState(false);

  const currentId = state.turnOrder[state.currentTurnIndex] ?? "";
  const isMyTurn = currentId === playerId;
  const pending = state.pendingQuestion;
  const myVote = pending?.votes[playerId];
  const canVote =
    pending && pending.askerId !== playerId && !myVote;

  return (
    <div className="flex flex-col gap-3">
      <GameTable
        state={state}
        playerId={playerId}
        currentTurnId={currentId}
        getCharacter={(id) => getCharacter(state, id)}
      />

      <div className="playing-controls">
        {canVote && (
          <Panel>
            <p className="mb-2 text-center text-sm text-[var(--muted)]">
              ตอบคำถามนี้
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="success"
                onClick={() => onVote("yes")}
              >
                ใช่
              </Button>
              <Button
                className="flex-1"
                variant="danger"
                onClick={() => onVote("no")}
              >
                ไม่ใช่
              </Button>
            </div>
          </Panel>
        )}

        {pending && pending.askerId !== playerId && myVote && (
          <p className="text-center text-sm text-[var(--muted)]">
            โหวตแล้ว — รอคนอื่น...
          </p>
        )}

        {pending && pending.askerId === playerId && (
          <p className="text-center text-sm text-[var(--muted)]">
            รอคนอื่นตอบ...
          </p>
        )}

        {isMyTurn && !pending && !showGuess && (
          <Panel>
            <Input
              placeholder="ถามคำถาม (ตอบได้แค่ ใช่/ไม่ใช่)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={80}
              onKeyDown={(e) => {
                if (e.key === "Enter" && question.trim()) {
                  onAsk(question.trim());
                  setQuestion("");
                }
              }}
            />
            <div className="mt-2 flex flex-col gap-2">
              <Button
                className="w-full"
                disabled={!question.trim()}
                onClick={() => {
                  onAsk(question.trim());
                  setQuestion("");
                }}
              >
                ถาม
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowGuess(true)}
              >
                ทายตัวตนแทน
              </Button>
            </div>
          </Panel>
        )}

        {isMyTurn && !pending && showGuess && (
          <Panel>
            <Input
              placeholder="ฉันคือ..."
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              maxLength={80}
            />
            <div className="mt-2 flex flex-col gap-2">
              <Button
                className="w-full"
                disabled={!guess.trim()}
                onClick={() => {
                  onGuess(guess.trim());
                  setGuess("");
                  setShowGuess(false);
                }}
              >
                ยืนยันทาย
              </Button>
              <Button variant="ghost" onClick={() => setShowGuess(false)}>
                กลับไปถาม
              </Button>
            </div>
          </Panel>
        )}

        <QuestionLog state={state} />
      </div>
    </div>
  );
}

function QuestionLog({ state }: { state: ClientRoomState }) {
  if (state.questions.length === 0) return null;

  return (
    <Panel>
      <h3 className="mb-2 font-semibold">บันทึกคำถาม</h3>
      <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
        {[...state.questions].reverse().map((q, i) => {
          const asker = state.players.find((p) => p.id === q.askerId);
          const answerLabel =
            q.answer === "yes"
              ? "ใช่"
              : q.answer === "no"
                ? "ไม่ใช่"
                : "เสมอ — ถามใหม่";
          return (
            <li key={i} className="rounded-lg bg-[var(--bg)] px-3 py-2">
              <span className="text-[var(--muted)]">{asker?.name}: </span>
              {q.text}
              <span
                className={`ml-2 font-medium ${
                  q.answer === "yes"
                    ? "text-[var(--success)]"
                    : q.answer === "no"
                      ? "text-[var(--danger)]"
                      : "text-[var(--accent)]"
                }`}
              >
                → {answerLabel}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
