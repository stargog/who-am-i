const PLAYER_ID_KEY = "whoami_player_id";
const PLAYER_NAME_KEY = "whoami_player_name";

export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function getStoredPlayerName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PLAYER_NAME_KEY) ?? "";
}

export function setStoredPlayerName(name: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, name);
}
