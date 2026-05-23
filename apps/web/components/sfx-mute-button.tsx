"use client";

import { useEffect, useState } from "react";
import { AudioLines, VolumeX } from "lucide-react";
import { getSfxMuted, setSfxMuted } from "@/lib/sfx-storage";
import { unlockAudio } from "@/lib/sfx";

export function SfxMuteButton() {
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMuted(getSfxMuted());
    setReady(true);
  }, []);

  function toggleMute() {
    unlockAudio();
    const next = !muted;
    setMuted(next);
    setSfxMuted(next);
  }

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggleMute}
      className="flex items-center justify-center rounded-xl p-2 transition-colors hover:bg-white/10"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      aria-label={muted ? "เปิดเสียงเอฟเฟกต์" : "ปิดเสียงเอฟเฟกต์"}
      title={muted ? "เสียงเอฟเฟกต์ปิด" : "เสียงเอฟเฟกต์เปิด"}
    >
      {muted ? (
        <VolumeX className="h-4 w-4 text-white/40" />
      ) : (
        <AudioLines className="h-4 w-4 text-white/60" />
      )}
    </button>
  );
}
