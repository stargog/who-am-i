const BGM_MUTED_KEY = "who-am-i-bgm-muted";

export function getBgmMuted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(BGM_MUTED_KEY) === "1";
  } catch {
    return true;
  }
}

export function setBgmMuted(muted: boolean): void {
  try {
    localStorage.setItem(BGM_MUTED_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}
