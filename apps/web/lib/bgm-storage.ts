const BGM_MUTED_KEY = "who-am-i-bgm-muted";

/** Fixed BGM level (3%) — not user-adjustable */
export const BGM_VOLUME = 0.03;

export function getBgmMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(BGM_MUTED_KEY);
    if (raw == null) return false;
    return raw === "1";
  } catch {
    return false;
  }
}

export function setBgmMuted(muted: boolean): void {
  try {
    localStorage.setItem(BGM_MUTED_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}
