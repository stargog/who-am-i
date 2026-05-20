/**
 * Commit, push, and trigger CI deploy (PartyKit + Vercel via GitHub).
 *
 * Usage:
 *   npm run ship -- "Describe your changes"
 *   npm run ship
 */
import { execSync, spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const message = process.argv.slice(2).join(" ").trim() || "Update who-am-i.";

function git(...args) {
  const result = spawnSync("git", args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const status = execSync("git status --porcelain", {
  cwd: root,
  encoding: "utf8",
}).trim();

if (!status) {
  console.log("Nothing to commit.");
  process.exit(0);
}

git("add", "-A");
spawnSync("git", ["reset", "--", "who-am-i/"], { cwd: root, stdio: "inherit" });

const staged = execSync("git diff --cached --name-only", {
  cwd: root,
  encoding: "utf8",
}).trim();

if (!staged) {
  console.log("No staged changes (who-am-i/ excluded).");
  process.exit(0);
}

git("commit", "-m", message);
git("push", "origin", "master");

console.log("");
console.log("Pushed to GitHub.");
console.log("- Vercel: auto-deploy if repo is connected in Vercel Dashboard");
console.log("- PartyKit: GitHub Actions deploy (needs PARTYKIT_LOGIN + PARTYKIT_TOKEN secrets)");
