"use client";

import { motion } from "framer-motion";
import type { Player } from "@who-am-i/shared/types";
import { Crown, Zap } from "lucide-react";
import { playerAvatar, playerColor } from "@/lib/player-theme";

type Props = {
  players: Player[];
  activePlayerId: string;
  questionCounts?: Record<string, number>;
};

export function PlayerList({
  players,
  activePlayerId,
  questionCounts = {},
}: Props) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Crown className="h-4 w-4 text-yellow-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">
          Players
        </span>
      </div>

      {players.map((player, index) => {
        const isActive = player.id === activePlayerId;
        const color = playerColor(player.id);
        const avatar = playerAvatar(player.id);
        const qCount = questionCounts[player.id] ?? 0;

        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <div
              className={`relative flex cursor-default items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300 ${
                isActive
                  ? "bg-white/10 shadow-lg"
                  : "bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
              style={{
                borderLeft: isActive
                  ? `3px solid ${color}`
                  : "3px solid transparent",
                boxShadow: isActive ? `0 0 20px ${color}22` : undefined,
              }}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-10"
                  style={{
                    background: `radial-gradient(circle at left, ${color}, transparent)`,
                  }}
                  animate={{ opacity: [0.08, 0.15, 0.08] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <motion.div
                className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                style={{
                  background: isActive
                    ? `${color}22`
                    : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${isActive ? `${color}66` : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {avatar}
                {isActive && (
                  <motion.div
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full"
                    style={{ background: color }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="h-2.5 w-2.5 text-black" />
                  </motion.div>
                )}
              </motion.div>

              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-sm font-bold ${isActive ? "text-white" : "text-white/60"}`}
                >
                  {player.name}
                  {player.isHost && (
                    <span className="ml-1.5 text-[10px] font-normal text-yellow-400/80">
                      host
                    </span>
                  )}
                </div>
                <motion.div className="mt-0.5 text-xs text-white/30">
                  {!player.connected
                    ? "Offline"
                    : qCount > 0
                      ? `${qCount} question${qCount === 1 ? "" : "s"} asked`
                      : "No questions yet"}
                </motion.div>
              </div>

              {qCount > 0 && (
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold"
                  style={{
                    background: `${color}22`,
                    color,
                    border: `1px solid ${color}44`,
                  }}
                >
                  {qCount}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
