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
  "Am I a real person?",
  "Am I still alive?",
  "Am I from a movie?",
  "Am I a fictional character?",
  "Am I male?",
  "Am I a superhero?",
  "Do I use special powers?",
  "Am I from the 20th century?",
  "Am I famous for science?",
  "Am I a villain?",
  "Do I wear a costume?",
  "Am I from a book?",
  "Am I a world leader?",
  "Am I known for sports?",
  "Am I an animated character?",
];
