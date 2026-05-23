"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { ClientDeckInfo } from "@who-am-i/shared/deck";
import { playSfx } from "@/lib/sfx";
import { CharacterCard } from "./character-card";

type Props = {
  open: boolean;
  question: string;
  askerName: string;
  askerColor: string;
  deck: ClientDeckInfo | null;
  onVote: (vote: "yes" | "no") => void;
};

export function VoteOverlay({
  open,
  question,
  askerName,
  askerColor,
  deck,
  onVote,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="vote-dialog-title"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(100%,22rem)] -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <motion.div
              className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
              style={{
                background: "rgba(12,12,22,0.98)",
                boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${askerColor}33`,
              }}
            >
              <motion.div
                className="px-5 py-4 text-center"
                style={{
                  background: `linear-gradient(135deg, ${askerColor}22, transparent)`,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p
                  id="vote-dialog-title"
                  className="text-xs font-semibold uppercase tracking-widest text-white/40"
                >
                  Vote on the question
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/90">
                  {question}
                </p>
                <p className="mt-2 text-xs text-white/35">
                  About{" "}
                  <span style={{ color: askerColor }}>{askerName}</span>
                  &apos;s character
                </p>
              </motion.div>

              {deck && (
                <motion.div className="border-b border-white/[0.06] px-4 py-3">
                  <CharacterCard deck={deck} variant="panel" />
                </motion.div>
              )}

              <motion.div className="flex gap-3 p-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    playSfx("voteYes");
                    onVote("yes");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base font-black tracking-wide"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(74,222,128,0.3), rgba(74,222,128,0.12))",
                    border: "2px solid rgba(74,222,128,0.5)",
                    color: "#4ade80",
                  }}
                >
                  <ThumbsUp className="h-5 w-5" />
                  YES
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    playSfx("voteNo");
                    onVote("no");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base font-black tracking-wide"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(248,113,113,0.3), rgba(248,113,113,0.12))",
                    border: "2px solid rgba(248,113,113,0.5)",
                    color: "#f87171",
                  }}
                >
                  <ThumbsDown className="h-5 w-5" />
                  NO
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
