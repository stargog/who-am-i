const BGM_MUTED_KEY = "who-am-i-bgm-muted";
const BGM_VOLUME_KEY = "who-am-i-bgm-volume";
export const BGM_DEFAULT_VOLUME = 0.1;
const VOLUME_STEP = 0.05;

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

export function getBgmVolume(): number {
  if (typeof window === "undefined") return BGM_DEFAULT_VOLUME;
  try {
    const raw = localStorage.getItem(BGM_VOLUME_KEY);
    if (raw == null) return BGM_DEFAULT_VOLUME;
    const v = Number.parseFloat(raw);
    if (Number.isFinite(v) && v >= 0 && v <= 1) return v;
  } catch {
    /* ignore */
  }
  return BGM_DEFAULT_VOLUME;
}

export function setBgmVolume(volume: number): void {
  const clamped = Math.min(1, Math.max(0, volume));
  try {
    localStorage.setItem(BGM_VOLUME_KEY, String(clamped));
  } catch {
    /* ignore */
  }
}

export { VOLUME_STEP };
