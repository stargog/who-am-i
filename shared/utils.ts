import { MAX_TEXT_LENGTH } from "./types";

export function sanitizeText(input: string, maxLen = MAX_TEXT_LENGTH): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export function normalizeGuess(text: string): string {
  return sanitizeText(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.'’\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);

  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }

  return prev[b.length];
}

function fuzzyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  const maxLen = Math.max(a.length, b.length);
  const dist = levenshtein(a, b);

  if (maxLen <= 4) return dist <= 1;
  if (maxLen <= 8) return dist <= 2;
  return dist / maxLen <= 0.2;
}

function tokens(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

const SKIP_TOKENS = new Set(["the", "lord", "lady", "sir", "a", "an"]);

function significantTokens(text: string): string[] {
  return tokens(text).filter((t) => !SKIP_TOKENS.has(t));
}

function tokenMatches(guessToken: string, answerToken: string): boolean {
  if (guessToken === answerToken) return true;
  if (guessToken.length >= 4 && answerToken.includes(guessToken)) return true;
  if (answerToken.length >= 4 && guessToken.includes(answerToken)) return true;
  return fuzzyEqual(guessToken, answerToken);
}

function allGuessTokensMatch(guessTokens: string[], answerTokens: string[]): boolean {
  if (guessTokens.length === 0) return false;
  return guessTokens.every((gt) =>
    answerTokens.some((at) => tokenMatches(gt, at))
  );
}

export function guessesMatch(guess: string, answer: string): boolean {
  const g = normalizeGuess(guess);
  const a = normalizeGuess(answer);
  if (!g || !a) return false;

  if (g === a) return true;
  if (fuzzyEqual(g, a)) return true;

  const minPartial = 4;
  if (g.length >= minPartial && a.includes(g)) return true;
  if (a.length >= minPartial && g.includes(a)) return true;

  const gTokens = significantTokens(g);
  const aTokens = significantTokens(a);
  if (gTokens.length === 0 || aTokens.length === 0) return false;

  if (allGuessTokensMatch(gTokens, aTokens)) return true;

  if (gTokens.length === 1 && gTokens[0].length >= 3) {
    return aTokens.some((at) => tokenMatches(gTokens[0], at));
  }

  return false;
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
