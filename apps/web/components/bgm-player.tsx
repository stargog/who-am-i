"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, Volume2, VolumeX } from "lucide-react";
import {
  BGM_DEFAULT_VOLUME,
  VOLUME_STEP,
  getBgmMuted,
  getBgmVolume,
  setBgmMuted,
  setBgmVolume,
} from "@/lib/bgm-storage";

const BGM_SRC = "/audio/bgm.mp3";

export function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(BGM_DEFAULT_VOLUME);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    setMuted(getBgmMuted());
    setVolume(getBgmVolume());
    setReady(true);
  }, []);

  const syncPlayback = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
    if (!muted && volume > 0) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [muted, volume]);

  useEffect(() => {
    if (!ready) return;
    syncPlayback();
  }, [ready, muted, volume, syncPlayback]);

  useEffect(() => {
    if (!ready || muted || volume === 0) return;

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
  }, [ready, muted, volume, syncPlayback]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function applyVolume(next: number) {
    const clamped = Math.min(1, Math.max(0, next));
    setVolume(clamped);
    setBgmVolume(clamped);
    if (clamped > 0 && muted) {
      setMuted(false);
      setBgmMuted(false);
      startedRef.current = true;
    }
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setBgmMuted(next);
    if (!next) startedRef.current = true;
  }

  function onMainButtonClick() {
    if (muted) {
      toggleMute();
      setOpen(true);
    } else {
      setOpen((o) => !o);
    }
  }

  const volumePercent = Math.round(volume * 100);

  if (!ready) return null;

  return (
    <div ref={rootRef} className="relative">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={BGM_SRC} loop preload="auto" />

      <button
        type="button"
        onClick={onMainButtonClick}
        className="flex items-center justify-center rounded-xl p-2 transition-colors hover:text-white/80"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        aria-label={muted ? "Turn music on" : `Music volume ${volumePercent}%`}
        aria-expanded={open}
        title={muted ? "Music off" : `Volume ${volumePercent}%`}
      >
        {muted || volume === 0 ? (
          <VolumeX className="h-4 w-4 text-white/40" />
        ) : (
          <Volume2 className="h-4 w-4 text-white/60" />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 flex min-w-[10.5rem] flex-col gap-2 rounded-xl p-3 shadow-xl"
          style={{
            background: "rgba(15,15,20,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
          role="group"
          aria-label="Music volume"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => applyVolume(volume - VOLUME_STEP)}
              disabled={volume <= 0}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 disabled:opacity-30"
              aria-label="Volume down"
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="range"
              min={0}
              max={100}
              value={volumePercent}
              onChange={(e) => applyVolume(Number(e.target.value) / 100)}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-purple-400"
              aria-label="Volume slider"
            />

            <button
              type="button"
              onClick={() => applyVolume(volume + VOLUME_STEP)}
              disabled={volume >= 1}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 disabled:opacity-30"
              aria-label="Volume up"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium tabular-nums text-white/35">
              {volumePercent}%
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className="text-[10px] font-semibold text-white/45 transition-colors hover:text-white/70"
            >
              {muted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
