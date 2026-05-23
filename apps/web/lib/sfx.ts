import { getSfxMuted } from "@/lib/sfx-storage";

export type SfxId =
  | "voteYes"
  | "voteNo"
  | "sendQuestion"
  | "guess"
  | "clueYes"
  | "clueNo"
  | "tie"
  | "win";

const SFX_SRC: Record<SfxId, string> = {
  voteYes: "/sfx/vote-yes.wav",
  voteNo: "/sfx/vote-no.wav",
  sendQuestion: "/sfx/send-question.wav",
  guess: "/sfx/guess.wav",
  clueYes: "/sfx/clue-yes.wav",
  clueNo: "/sfx/clue-no.wav",
  tie: "/sfx/tie.wav",
  win: "/sfx/win.wav",
};

const SFX_VOLUME: Record<SfxId, number> = {
  voteYes: 0.4,
  voteNo: 0.4,
  sendQuestion: 0.35,
  guess: 0.42,
  clueYes: 0.38,
  clueNo: 0.35,
  tie: 0.32,
  win: 0.48,
};

let unlocked = false;

/** Call once after user gesture (shared with BGM unlock). */
export function unlockAudio() {
  unlocked = true;
}

export function playSfx(id: SfxId) {
  if (typeof window === "undefined" || getSfxMuted()) return;

  const audio = new Audio(SFX_SRC[id]);
  audio.volume = SFX_VOLUME[id];
  void audio.play().catch(() => {
    if (!unlocked) return;
    void audio.play().catch(() => {});
  });
}
