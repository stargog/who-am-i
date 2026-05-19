"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Target,
} from "lucide-react";
import { SUGGESTED_QUESTIONS } from "@/lib/player-theme";

export type QuestionPhase =
  | "asking"
  | "voted"
  | "waiting"
  | "guessing"
  | "pending-wait"
  | "vote-open";

type Props = {
  phase: QuestionPhase;
  activePlayerName: string;
  activePlayerColor: string;
  pendingQuestion?: string;
  onQuestion: (text: string) => void;
  onGuess: (text: string) => void;
  onShowGuess: () => void;
};

export function QuestionInput({
  phase,
  activePlayerName,
  activePlayerColor,
  pendingQuestion = "",
  onQuestion,
  onGuess,
  onShowGuess,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [guessValue, setGuessValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = () => {
    const q = inputValue.trim();
    if (!q) return;
    onQuestion(q.endsWith("?") ? q : `${q}?`);
    setInputValue("");
    setShowSuggestions(false);
  };

  const handleGuessSubmit = () => {
    const g = guessValue.trim();
    if (!g) return;
    onGuess(g);
    setGuessValue("");
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">

        {phase === "guessing" && (
          <motion.div
            key="guessing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/40">
              Submit your guess
            </p>
            <motion.div className="flex gap-3 items-center">
              <input
                type="text"
                value={guessValue}
                onChange={(e) => setGuessValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuessSubmit()}
                placeholder="I amâ€¦"
                maxLength={80}
                className="w-full rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${guessValue ? `${activePlayerColor}66` : "rgba(255,255,255,0.1)"}`,
                }}
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGuessSubmit}
                disabled={!guessValue.trim()}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-all disabled:opacity-30"
                style={{
                  background: guessValue.trim()
                    ? `linear-gradient(135deg, ${activePlayerColor}, ${activePlayerColor}88)`
                    : "rgba(255,255,255,0.08)",
                }}
              >
                <Target className="h-4 w-4 text-white" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {(phase === "asking" || phase === "waiting" || phase === "voted" || phase === "pending-wait" || phase === "vote-open") && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {phase === "vote-open" && (
              <p className="text-center text-sm text-white/40">
                โหวต YES / NO ในป๊อปอัพ
              </p>
            )}
            {phase === "voted" && (
              <p className="mb-3 text-center text-sm text-white/40">
                Voted â€” waiting for othersâ€¦
              </p>
            )}
            {phase === "pending-wait" && (
              <p className="mb-3 text-center text-sm text-white/40">
                Waiting for answersâ€¦
              </p>
            )}
            {phase === "waiting" && (
              <p className="mb-3 text-center text-sm text-white/40">
                Waiting for {activePlayerName}&apos;s turnâ€¦
              </p>
            )}

            {phase === "asking" && (
              <>
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="mb-2 flex items-center gap-2 px-1"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="h-1 w-1 rounded-full"
                            style={{ background: activePlayerColor }}
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-white/30">
                        Ask a yes/no questionâ€¦
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsTyping(e.target.value.length > 0);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="Ask a yes/no questionâ€¦"
                      maxLength={80}
                      className="w-full rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${inputValue ? `${activePlayerColor}66` : "rgba(255,255,255,0.1)"}`,
                        boxShadow: inputValue
                          ? `0 0 20px ${activePlayerColor}15`
                          : undefined,
                      }}
                    />
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!inputValue.trim()}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-all disabled:opacity-30"
                    style={{
                      background: inputValue.trim()
                        ? `linear-gradient(135deg, ${activePlayerColor}, ${activePlayerColor}88)`
                        : "rgba(255,255,255,0.08)",
                      boxShadow: inputValue.trim()
                        ? `0 8px 20px ${activePlayerColor}40`
                        : undefined,
                    }}
                  >
                    <Send className="h-4 w-4 text-white" />
                  </motion.button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/50"
                  >
                    <Lightbulb className="h-3 w-3" />
                    Suggested questions
                    {showSuggestions ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onShowGuess}
                    className="text-xs font-semibold transition-colors hover:text-white/70"
                    style={{ color: "#4ade80" }}
                  >
                    Guess instead â†’
                  </button>
                </div>

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 flex flex-wrap gap-2">
                        {SUGGESTED_QUESTIONS.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => {
                              onQuestion(q);
                              setShowSuggestions(false);
                            }}
                            className="rounded-xl px-3 py-1.5 text-xs transition-all hover:scale-105"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "rgba(255,255,255,0.5)",
                            }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
