"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star } from "lucide-react";
import { playSfx } from "@/lib/sfx";

type Props = {
  show: boolean;
  playerName: string;
  character: string;
  playerColor: string;
  onContinue: () => void;
  continueLabel?: string;
};

export function CelebrationOverlay({
  show,
  playerName,
  character,
  playerColor,
  onContinue,
  continueLabel = "Continue",
}: Props) {
  const playedWinRef = useRef(false);

  useEffect(() => {
    if (show && !playedWinRef.current) {
      playedWinRef.current = true;
      playSfx("win");
    }
    if (!show) playedWinRef.current = false;
  }, [show]);

  const confettiColors = [
    "#ff6b6b",
    "#4ecdc4",
    "#ffe66d",
    "#a29bfe",
    "#fd79a8",
    "#6c5ce7",
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-sm"
              style={{
                left: `${(i * 17 + 13) % 100}%`,
                background: confettiColors[i % confettiColors.length],
              }}
              initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
              animate={{
                y: typeof window !== "undefined" ? window.innerHeight + 50 : 800,
                x: ((i % 5) - 2) * 40,
                rotate: (i % 4) * 180,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + (i % 3) * 0.3,
                delay: (i % 6) * 0.08,
                ease: "easeIn",
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative mx-4 w-full max-w-sm rounded-[2.5rem] p-8 text-center"
            style={{
              background: "rgba(12,12,20,0.95)",
              border: `2px solid ${playerColor}66`,
              boxShadow: `0 0 80px ${playerColor}44, 0 30px 60px rgba(0,0,0,0.6)`,
            }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-4 text-6xl"
            >
              🎉
            </motion.div>

            <div className="mb-2 flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="text-xs font-black uppercase tracking-widest text-yellow-400">
                Correct!
              </span>
              <Trophy className="h-5 w-5 text-yellow-400" />
            </div>

            <h2 className="mb-2 text-3xl font-black text-white">{playerName}</h2>
            <p className="mb-1 text-sm text-white/50">guessed their story!</p>
            <motion.div
              className="mb-6 mt-3 inline-block rounded-xl px-4 py-2 text-xl font-black"
              style={{
                background: `${playerColor}22`,
                color: playerColor,
                border: `1.5px solid ${playerColor}44`,
              }}
            >
              {character}
            </motion.div>

            <div className="mb-6 flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                >
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </motion.div>
              ))}
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onContinue}
              className="w-full rounded-2xl py-3.5 text-sm font-black uppercase tracking-widest text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${playerColor}, ${playerColor}88)`,
                boxShadow: `0 8px 25px ${playerColor}44`,
              }}
            >
              {continueLabel}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
