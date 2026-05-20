"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";
import { Users, BookOpen, RotateCcw } from "lucide-react";
import { BgmPlayer } from "./bgm-player";

type Props = {
  children: ReactNode;
  glowColor?: string;
  playerCount?: number;
  roomCode?: string;
  connected?: boolean;
  mobilePanel?: "players" | "info" | null;
  onMobilePanel?: (panel: "players" | "info" | null) => void;
  showMobileToggles?: boolean;
  headerExtra?: ReactNode;
  onReset?: () => void;
  homeHref?: string;
};

export function GameShell({
  children,
  glowColor = "#a78bfa",
  playerCount,
  roomCode,
  connected,
  mobilePanel,
  onMobilePanel,
  showMobileToggles = false,
  headerExtra,
  onReset,
  homeHref = "/",
}: Props) {
  return (
    <motion.div
      className="game-shell min-h-dvh relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="pointer-events-none fixed inset-0"
        aria-hidden
      >
        <motion.div
          className="absolute top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px] opacity-[0.12]"
          animate={{
            background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
          }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>

      <motion.div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden
      />

      <header className="relative z-30 flex items-center justify-between overflow-visible border-b border-white/[0.06] px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-3">
          <Link
            href={homeHref}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-opacity hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            🎭
          </Link>
          <motion.div>
            <h1 className="text-sm font-black tracking-tight text-white">
              Who Am I?
            </h1>
            <p className="text-[10px] font-medium text-white/30">
              {roomCode ? `Room ${roomCode}` : "Party Deduction Game"}
            </p>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {playerCount !== undefined && (
            <div
              className="hidden items-center gap-2 rounded-xl px-3 py-1.5 md:flex"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className={`h-2 w-2 rounded-full ${connected ? "animate-pulse bg-green-400" : "bg-red-400"}`}
              />
              <span className="text-xs font-medium text-white/50">
                {playerCount} players
              </span>
            </div>
          )}

          {headerExtra}

          <BgmPlayer />

          {showMobileToggles && onMobilePanel && (
            <>
              <button
                type="button"
                className="rounded-xl p-2 md:hidden"
                onClick={() =>
                  onMobilePanel(mobilePanel === "players" ? null : "players")
                }
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Users className="h-4 w-4 text-white/60" />
              </button>
              <button
                type="button"
                className="rounded-xl p-2 md:hidden"
                onClick={() =>
                  onMobilePanel(mobilePanel === "info" ? null : "info")
                }
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <BookOpen className="h-4 w-4 text-white/60" />
              </button>
            </>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </header>

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
