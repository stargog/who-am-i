"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Bell } from "lucide-react";

type Props = {
  message: string | null;
  type?: "yes" | "no" | "info";
};

export function FloatingNotification({ message, type = "info" }: Props) {
  const colors = {
    yes: {
      bg: "rgba(74,222,128,0.15)",
      border: "rgba(74,222,128,0.3)",
      text: "#4ade80",
      icon: CheckCircle,
    },
    no: {
      bg: "rgba(248,113,113,0.15)",
      border: "rgba(248,113,113,0.3)",
      text: "#f87171",
      icon: XCircle,
    },
    info: {
      bg: "rgba(168,139,250,0.15)",
      border: "rgba(168,139,250,0.3)",
      text: "#a78bfa",
      icon: Bell,
    },
  };

  const style = colors[type];
  const Icon = style.icon;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2"
        >
          <div
            className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              color: style.text,
              backdropFilter: "blur(16px)",
              boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${style.border}`,
            }}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
