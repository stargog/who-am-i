const COLORS = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#a29bfe", "#fd79a8", "#6c5ce7", "#00b894", "#e17055"];
const AVATARS = ["🦊", "🐺", "🦋", "🐉", "🦁", "🐸", "🦉", "🐙"];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * 31) | 0;
  return Math.abs(h);
}

export function playerColor(playerId: string): string {
  return COLORS[hashId(playerId) % COLORS.length];
}

export function playerAvatar(playerId: string): string {
  return AVATARS[hashId(playerId) % AVATARS.length];
}

export const SUGGESTED_QUESTIONS = [
  "Am I an anime?",
  "Am I a movie?",
  "Am I a TV series?",
  "Was I released after 2010?",
  "Am I from Japan?",
  "Am I from the United States?",
  "Is it based on a book?",
  "Are there superheroes in my story?",
  "Is there magic in my story?",
  "Is it animated?",
  "Is it horror?",
  "Is it science fiction?",
  "Is it a love story?",
  "Are there robots or AI?",
  "Is it part of a long franchise?",
];
