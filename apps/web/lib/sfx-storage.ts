const SFX_MUTED_KEY = "who-am-i-sfx-muted";

export function getSfxMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(SFX_MUTED_KEY);
    if (raw == null) return false;
    return raw === "1";
  } catch {
    return false;
  }
}

export function setSfxMuted(muted: boolean): void {
  try {
    localStorage.setItem(SFX_MUTED_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}
