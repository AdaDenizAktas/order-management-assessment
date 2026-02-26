const fs = require("fs");
const path = require("path");

if (!process.env.VERCEL) {
  console.log("copy-web-dist: skip (not on Vercel)");
  process.exit(0);
}

const repoRoot = path.resolve(__dirname, "..");
const src = path.join(repoRoot, "apps", "web", "dist");
const dest = path.join(repoRoot, "dist");

if (!fs.existsSync(src)) {
  console.error("copy-web-dist: missing build output:", src);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });

console.log("copy-web-dist: copied", src, "->", dest);