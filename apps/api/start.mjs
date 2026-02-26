import { existsSync } from "node:fs";
import { spawn } from "node:child_process";

const candidates = ["./dist/index.js", "./dist/src/index.js"];
const entry = candidates.find(existsSync);

if (!entry) {
  console.error("No built entry found. Run build first.");
  process.exit(1);
}

spawn(process.execPath, [entry], { stdio: "inherit" });
