/**
 * Generate short UI/game SFX as WAV (CC0 — generated, no external assets).
 * Run: node scripts/generate-sfx.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "apps", "web", "public", "sfx");

function writeWav(filePath, { duration, sampleRate = 22050, sampleAt }) {
  const n = Math.floor(sampleRate * duration);
  const dataSize = n * 2;
  const buf = Buffer.alloc(44 + dataSize);

  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const env = sampleAt(t, i, n);
    const s = Math.max(-1, Math.min(1, env));
    buf.writeInt16LE(Math.floor(s * 32767 * 0.85), 44 + i * 2);
  }

  fs.writeFileSync(filePath, buf);
}

function sine(freq, t, amp = 1) {
  return amp * Math.sin(2 * Math.PI * freq * t);
}

function envDecay(t, dur, power = 4) {
  return Math.pow(Math.max(0, 1 - t / dur), power);
}

const sounds = {
  "vote-yes": {
    duration: 0.14,
    sampleAt(t) {
      return sine(880, t) * envDecay(t, 0.14, 3);
    },
  },
  "vote-no": {
    duration: 0.16,
    sampleAt(t) {
      return sine(220, t) * envDecay(t, 0.16, 2.5);
    },
  },
  "send-question": {
    duration: 0.2,
    sampleAt(t) {
      const e = envDecay(t, 0.2, 2);
      const f = t < 0.08 ? 520 : 680;
      return sine(f, t) * e * 0.9;
    },
  },
  guess: {
    duration: 0.22,
    sampleAt(t) {
      const freq = 400 + (t / 0.22) * 500;
      return sine(freq, t) * envDecay(t, 0.22, 2);
    },
  },
  "clue-yes": {
    duration: 0.18,
    sampleAt(t) {
      const e = envDecay(t, 0.18, 2.5);
      return (sine(660, t) + sine(990, t) * 0.5) * e * 0.7;
    },
  },
  "clue-no": {
    duration: 0.2,
    sampleAt(t) {
      const freq = 380 - (t / 0.2) * 120;
      return sine(freq, t) * envDecay(t, 0.2, 2);
    },
  },
  tie: {
    duration: 0.24,
    sampleAt(t) {
      const e = envDecay(t, 0.24, 2);
      const f = t < 0.12 ? 440 : 440;
      return sine(f, t % 0.12) * e * 0.8;
    },
  },
  win: {
    duration: 0.55,
    sampleAt(t) {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const slot = Math.min(3, Math.floor(t / 0.12));
      const local = (t - slot * 0.12) / 0.12;
      const e = envDecay(local, 0.12, 2);
      return sine(notes[slot], t) * e * 0.75;
    },
  },
};

fs.mkdirSync(outDir, { recursive: true });

for (const [name, spec] of Object.entries(sounds)) {
  const file = path.join(outDir, `${name}.wav`);
  writeWav(file, spec);
  console.log("wrote", path.basename(file));
}

console.log(`\nDone → ${outDir}`);
