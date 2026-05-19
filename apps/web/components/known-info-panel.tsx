"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@who-am-i/shared/types";
import { CheckCircle2, XCircle, BookOpen, Clock } from "lucide-react";

type Props = {
  questions: Question[];
  playerColor: string;
  playerName: string;
  getAskerName: (askerId: string) => string;
};

export function KnownInfoPanel({
  questions,
  playerColor,
  playerName,
  getAskerName,
}: Props) {
  const sorted = [...questions].reverse();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] px-4 pb-3 pt-4">
        <motion.div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" style={{ color: playerColor }} />
          <span className="text-xs font-bold uppercase tracking-widest text-white/40">
            Known Info
          </span>
        </motion.div>
        <p className="mt-1 text-xs text-white/20">{playerName}&apos;s session</p>
      </div>

      <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-3">
        <AnimatePresence initial={false}>
          {sorted.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center"
            >
              <div className="mb-3 text-3xl opacity-30">🔍</div>
              <p className="text-xs leading-relaxed text-white/20">
                No clues discovered yet.
                <br />
                Start asking questions!
              </p>
            </motion.div>
          ) : (
            sorted.map((q, index) => {
              const isYes = q.answer === "yes";
              const isNo = q.answer === "no";
              return (
                <motion.div
                  key={`${q.askerId}-${q.text}-${index}`}
                  initial={{ opacity: 0, y: -12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="group relative"
                >
                  <div
                    className="rounded-xl p-3 transition-all"
                    style={{
                      background: isYes
                        ? "rgba(74, 222, 128, 0.06)"
                        : isNo
                          ? "rgba(248, 113, 113, 0.06)"
                          : "rgba(168, 139, 250, 0.06)",
                      border: `1px solid ${
                        isYes
                          ? "rgba(74, 222, 128, 0.15)"
                          : isNo
                            ? "rgba(248, 113, 113, 0.15)"
                            : "rgba(168, 139, 250, 0.15)"
                      }`,
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex-shrink-0">
                        {isYes ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : isNo ? (
                          <XCircle className="h-4 w-4 text-red-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-purple-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-relaxed text-white/70">
                          {q.text}
                        </p>
                        <p className="mt-1 text-[10px] text-white/25">
                          {getAskerName(q.askerId)}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span
                            className="rounded-md px-2 py-0.5 text-xs font-bold"
                            style={{
                              background: isYes
                                ? "rgba(74,222,128,0.15)"
                                : isNo
                                  ? "rgba(248,113,113,0.15)"
                                  : "rgba(168,139,250,0.15)",
                              color: isYes
                                ? "#4ade80"
                                : isNo
                                  ? "#f87171"
                                  : "#a78bfa",
                            }}
                          >
                            {isYes ? "✓ YES" : isNo ? "✗ NO" : "Tie"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {questions.length > 0 && (
        <div
          className="border-t border-white/[0.06] px-4 py-3"
          style={{ background: "rgba(0,0,0,0.2)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-green-400" />
              <span className="text-xs font-semibold text-green-400">
                {questions.filter((q) => q.answer === "yes").length} confirmed
              </span>
            </div>
            <motion.div className="flex items-center gap-1.5">
              <XCircle className="h-3 w-3 text-red-400" />
              <span className="text-xs font-semibold text-red-400">
                {questions.filter((q) => q.answer === "no").length} ruled out
              </span>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
