const fs = require("fs");
const path = require("path");

const extsOk = /\.(js|json|node)$/;

function patchSpec(s) {
  const add = (m, a, b, c) => (extsOk.test(b) ? m : `${a}${b}.js${c}`);

  // export ... from "./x"
  s = s.replace(/(from\s+['"])(\.{1,2}\/[^'"\n]+?)(['"])/g, add);

  // side-effect import "./x"
  s = s.replace(/(import\s+['"])(\.{1,2}\/[^'"\n]+?)(['"])/g, add);

  // dynamic import("./x")
  s = s.replace(/(import\s*\(\s*['"])(\.{1,2}\/[^'"\n]+?)(['"]\s*\))/g, add);

  return s;
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.isFile() && p.endsWith(".js")) {
      const o = fs.readFileSync(p, "utf8");
      const n = patchSpec(o);
      if (n !== o) {
        fs.writeFileSync(p, n, "utf8");
        console.log("patched", p);
      }
    }
  }
}

const target = process.argv[2];
if (!target) {
  console.error("Usage: node patch-esm-dist.cjs <distDir>");
  process.exit(1);
}
if (!fs.existsSync(target)) {
  console.error("Missing dist dir:", target);
  process.exit(1);
}

walk(target);
