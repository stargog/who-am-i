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
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(BGM_DEFAULT_VOLUME);
  const [ready, setReady] = useState(false);
  const startedRef = useRef(false);

  const applyToAudio = useCallback((vol: number, isMuted: boolean) => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = vol;
    el.muted = isMuted;
    if (!isMuted && vol > 0) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, []);

  useEffect(() => {
    const m = getBgmMuted();
    const v = getBgmVolume();
    setMuted(m);
    setVolume(v);
    setReady(true);
    applyToAudio(v, m);
  }, [applyToAudio]);

  useEffect(() => {
    if (!ready) return;
    applyToAudio(volume, muted);
  }, [ready, volume, muted, applyToAudio]);

  useEffect(() => {
    if (!ready) return;

    const tryStart = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const m = getBgmMuted();
      const v = getBgmVolume();
      if (!m && v > 0) applyToAudio(v, false);
    };

    document.addEventListener("pointerdown", tryStart, { once: true });
    document.addEventListener("keydown", tryStart, { once: true });
    return () => {
      document.removeEventListener("pointerdown", tryStart);
      document.removeEventListener("keydown", tryStart);
    };
  }, [ready, applyToAudio]);

  function applyVolume(next: number) {
    const clamped = Math.min(1, Math.max(0, next));
    const nextMuted = clamped === 0;
    setVolume(clamped);
    setBgmVolume(clamped);
    if (clamped > 0) {
      setMuted(false);
      setBgmMuted(false);
      startedRef.current = true;
    } else {
      setMuted(true);
      setBgmMuted(true);
    }
    applyToAudio(clamped, nextMuted);
  }

  function toggleMute() {
    if (muted && volume === 0) {
      applyVolume(BGM_DEFAULT_VOLUME);
      return;
    }
    const next = !muted;
    setMuted(next);
    setBgmMuted(next);
    if (!next) startedRef.current = true;
    applyToAudio(volume, next);
  }

  const volumePercent = Math.round(volume * 100);

  if (!ready) return null;

  return (
    <div
      className="flex items-center gap-1 rounded-xl px-1 py-1"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      role="group"
      aria-label="Music volume"
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={BGM_SRC} loop preload="auto" />

      <button
        type="button"
        onClick={toggleMute}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
        aria-label={muted ? "Turn music on" : "Mute music"}
        title={muted ? "Music off" : "Mute"}
      >
        {muted || volume === 0 ? (
          <VolumeX className="h-4 w-4 text-white/40" />
        ) : (
          <Volume2 className="h-4 w-4 text-white/60" />
        )}
      </button>

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
        step={5}
        value={volumePercent}
        onInput={(e) =>
          applyVolume(Number((e.target as HTMLInputElement).value) / 100)
        }
        onChange={(e) =>
          applyVolume(Number((e.target as HTMLInputElement).value) / 100)
        }
        className="h-1.5 w-14 cursor-pointer accent-purple-400 sm:w-20"
        aria-label="Volume"
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

      <span className="hidden min-w-[2rem] pr-1 text-center text-[10px] font-medium tabular-nums text-white/40 sm:inline">
        {volumePercent}%
      </span>
    </div>
  );
}
