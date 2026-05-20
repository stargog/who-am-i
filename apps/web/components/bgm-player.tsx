"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getBgmMuted, setBgmMuted } from "@/lib/bgm-storage";

const BGM_SRC = "/audio/bgm.mp3";
const BGM_VOLUME = 0.35;

export function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    setMuted(getBgmMuted());
    setReady(true);
  }, []);

  const syncPlayback = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = BGM_VOLUME;
    el.muted = muted;
    if (!muted) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [muted]);

  useEffect(() => {
    if (!ready) return;
    syncPlayback();
  }, [ready, muted, syncPlayback]);

  useEffect(() => {
    if (!ready || muted) return;

    const tryStart = () => {
      if (startedRef.current || getBgmMuted()) return;
      startedRef.current = true;
      syncPlayback();
    };

    document.addEventListener("click", tryStart, { once: true });
    document.addEventListener("keydown", tryStart, { once: true });
    return () => {
      document.removeEventListener("click", tryStart);
      document.removeEventListener("keydown", tryStart);
    };
  }, [ready, muted, syncPlayback]);

  function toggle() {
    const next = !muted;
    setMuted(next);
    setBgmMuted(next);
    if (!next) startedRef.current = true;
  }

  if (!ready) return null;

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={BGM_SRC} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        className="flex items-center justify-center rounded-xl p-2 transition-colors hover:text-white/80"
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
