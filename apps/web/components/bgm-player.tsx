"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { BGM_VOLUME, getBgmMuted, setBgmMuted } from "@/lib/bgm-storage";
import { unlockAudio } from "@/lib/sfx";

const BGM_SRC = "/audio/bgm.mp3";

export function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const startedRef = useRef(false);

  const applyToAudio = useCallback((isMuted: boolean) => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = BGM_VOLUME;
    el.muted = isMuted;
    if (!isMuted) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, []);

  useEffect(() => {
    setMuted(getBgmMuted());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyToAudio(muted);
  }, [ready, muted, applyToAudio]);

  useEffect(() => {
    if (!ready) return;

    const tryStart = () => {
      unlockAudio();
      if (startedRef.current || getBgmMuted()) return;
      startedRef.current = true;
      applyToAudio(false);
    };

    document.addEventListener("pointerdown", tryStart, { once: true });
    document.addEventListener("keydown", tryStart, { once: true });
    return () => {
      document.removeEventListener("pointerdown", tryStart);
      document.removeEventListener("keydown", tryStart);
    };
  }, [ready, applyToAudio]);

  function toggleMute() {
    unlockAudio();
    const next = !muted;
    setMuted(next);
    setBgmMuted(next);
    if (!next) startedRef.current = true;
    applyToAudio(next);
  }

  if (!ready) return null;

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={BGM_SRC} loop preload="auto" />
      <button
        type="button"
        onClick={toggleMute}
        className="flex items-center justify-center rounded-xl p-2 transition-colors hover:bg-white/10"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        aria-label={muted ? "Turn music on" : "Turn music off"}
        title={muted ? "Music off" : "Music on"}
      >
        {muted ? (
          <VolumeX className="h-4 w-4 text-white/40" />
        ) : (
          <Volume2 className="h-4 w-4 text-white/60" />
        )}
      </button>
    </>
  );
}
