"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, BookOpen } from "lucide-react";
import type { ClientRoomState } from "@who-am-i/shared/types";
import { resolveDeck } from "@/lib/deck-client";
import { playerColor, playerAvatar } from "@/lib/player-theme";
import { GameTable } from "./game-table";
import { PlayerList } from "./player-list";
import { KnownInfoPanel } from "./known-info-panel";
import { QuestionInput, type QuestionPhase } from "./question-input";
import { FloatingNotification } from "./floating-notification";
import { VoteOverlay } from "./vote-overlay";

type Props = {
  state: ClientRoomState;
  playerId: string;
  onAsk: (text: string) => void;
  onVote: (vote: "yes" | "no") => void;
  onGuess: (text: string) => void;
  mobilePanel?: "players" | "info" | null;
  onMobilePanel?: (panel: "players" | "info" | null) => void;
};

function getDeck(state: ClientRoomState, targetId: string) {
  const a = state.assignments.find((x) => x.targetPlayerId === targetId);
  return resolveDeck(a);
}

export function Playing({
  state,
  playerId,
  onAsk,
  onVote,
  onGuess,
  mobilePanel: mobilePanelProp,
  onMobilePanel,
}: Props) {
  const [showGuess, setShowGuess] = useState(false);
  const [mobilePanelLocal, setMobilePanelLocal] = useState<
    "players" | "info" | null
  >(null);
  const mobilePanel = mobilePanelProp ?? mobilePanelLocal;
  const setMobilePanel = onMobilePanel ?? setMobilePanelLocal;
  const [notification, setNotification] = useState<{
    msg: string;
    type: "yes" | "no" | "info";
  } | null>(null);
  const [notifKey, setNotifKey] = useState(0);

  const currentId = state.turnOrder[state.currentTurnIndex] ?? "";
  const isMyTurn = currentId === playerId;
  const pending = state.pendingQuestion;
  const myVote = pending?.votes[playerId];
  const canVote = pending && pending.askerId !== playerId && !myVote;
  const currentPlayer = state.players.find((p) => p.id === currentId);
  const activeColor = playerColor(currentId);
  const askerDeck = pending ? getDeck(state, pending.askerId) : null;

  const myPlayer = state.players.find((p) => p.id === playerId);
  const myColor = playerColor(playerId);

  const prevQuestionLenRef = useRef(state.questions.length);

  useEffect(() => {
    if (state.questions.length > prevQuestionLenRef.current) {
      const last = state.questions[state.questions.length - 1];
      if (last) {
        const msg =
          last.answer === "yes"
            ? "YES — new clue added!"
            : last.answer === "no"
              ? "NO — ruled out!"
              : "Tie — ask again!";
        setNotification({
          msg,
          type: last.answer === "tie" ? "info" : last.answer,
        });
        setNotifKey((k) => k + 1);
        const t = setTimeout(() => setNotification(null), 3000);
        prevQuestionLenRef.current = state.questions.length;
        return () => clearTimeout(t);
      }
    }
    prevQuestionLenRef.current = state.questions.length;
  }, [state.questions]);

  useEffect(() => {
    if (!pending) setShowGuess(false);
  }, [pending, currentId]);

  const askerName = pending
    ? state.players.find((p) => p.id === pending.askerId)?.name ?? "?"
    : "";

  let phase: QuestionPhase = "waiting";
  if (canVote) phase = "vote-open";
  else if (pending && pending.askerId !== playerId && myVote) phase = "voted";
  else if (pending && pending.askerId === playerId) phase = "pending-wait";
  else if (isMyTurn && showGuess) phase = "guessing";
  else if (isMyTurn && !pending) phase = "asking";

  const turnIndex = state.turnOrder.indexOf(currentId);
  const getAskerName = (id: string) =>
    state.players.find((p) => p.id === id)?.name ?? "?";

  return (
    <>
      <FloatingNotification
        key={notifKey}
        message={notification?.msg ?? null}
        type={notification?.type}
      />

      <VoteOverlay
        open={Boolean(canVote)}
        question={pending?.text ?? ""}
        askerName={askerName}
        askerColor={activeColor}
        deck={askerDeck}
        onVote={onVote}
      />

      <AnimatePresence>
        {mobilePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setMobilePanel(null)}
          />
        )}
        {mobilePanel === "players" && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-0 top-[65px] z-40 w-72 overflow-y-auto md:hidden"
            style={{
              background: "rgba(10,10,18,0.98)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <PlayerList
              players={state.players}
              activePlayerId={currentId}
              questionCounts={state.questionCounts}
            />
          </motion.aside>
        )}
        {mobilePanel === "info" && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-0 right-0 top-[65px] z-40 flex w-72 flex-col overflow-hidden md:hidden"
            style={{
              background: "rgba(10,10,18,0.98)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <KnownInfoPanel
              questions={state.questions}
              playerColor={myColor}
              playerName={myPlayer?.name ?? ""}
              getAskerName={getAskerName}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.div
        className="flex min-h-[calc(100dvh-65px)] flex-col md:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <aside
          className="hidden w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-white/[0.06] md:flex"
          style={{ background: "rgba(8,8,15,0.6)" }}
        >
          <PlayerList
            players={state.players}
            activePlayerId={currentId}
            questionCounts={state.questionCounts}
          />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="flex items-center gap-2 rounded-xl px-3 py-1.5"
                style={{
                  background: `${activeColor}18`,
                  border: `1px solid ${activeColor}44`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 8px ${activeColor}22`,
                    `0 0 20px ${activeColor}44`,
                    `0 0 8px ${activeColor}22`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-xl">{playerAvatar(currentId)}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: activeColor }}
                >
                  {currentPlayer?.name}&apos;s Turn
                </span>
              </motion.div>
              <span className="hidden text-xs text-white/30 sm:inline">
                Player {turnIndex + 1} / {state.turnOrder.length}
              </span>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                className="rounded-xl p-2"
                onClick={() =>
                  setMobilePanel(mobilePanel === "players" ? null : "players")
                }
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Users className="h-4 w-4 text-white/60" />
              </button>
            </div>
          </div>

          <motion.div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 md:px-6 md:py-8">
            <GameTable
              state={state}
              playerId={playerId}
              currentTurnId={currentId}
              getDeck={(id) => getDeck(state, id)}
            />

            <p className="mt-4 max-w-md text-center text-xs text-white/25 md:text-sm">
              Your card is hidden (?). Opponents show full character info on the
              table.
            </p>
          </motion.div>

          <div
            className="flex-shrink-0 border-t border-white/[0.06] px-4 py-4 md:px-6 md:py-5"
            style={{ background: "rgba(6,6,12,0.8)" }}
          >
            <QuestionInput
              phase={phase}
              activePlayerName={currentPlayer?.name ?? ""}
              activePlayerColor={activeColor}
              pendingQuestion={pending?.text}
              onQuestion={onAsk}
              onGuess={onGuess}
              onShowGuess={() => setShowGuess(true)}
            />
          </div>
        </main>

        <aside
          className="hidden w-72 flex-shrink-0 flex-col overflow-hidden border-l border-white/[0.06] md:flex"
          style={{ background: "rgba(8,8,15,0.6)" }}
        >
          <KnownInfoPanel
            questions={state.questions}
            playerColor={myColor}
            playerName={myPlayer?.name ?? ""}
            getAskerName={getAskerName}
          />
        </aside>
      </motion.div>
    </>
  );
}
