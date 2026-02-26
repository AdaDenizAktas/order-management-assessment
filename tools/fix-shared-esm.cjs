const fs = require("fs");
const path = require("path");

function readJson(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeJson(p, j) { fs.writeFileSync(p, JSON.stringify(j, null, 2), "utf8"); }

function walk(dir, cb) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, cb);
    else if (ent.isFile()) cb(p);
  }
}

function patchSharedTsconfig() {
  const p = path.join("packages", "shared", "tsconfig.json");
  const j = readJson(p);
  j.compilerOptions = j.compilerOptions || {};
  j.compilerOptions.module = "ESNext";
  j.compilerOptions.moduleResolution = "Bundler";
  j.compilerOptions.target = j.compilerOptions.target || "ES2022";
  writeJson(p, j);
  console.log("patched", p);
}

function patchRelativeSpecifiersToJsExt() {
  const root = path.join("packages", "shared", "src");
  const extsOk = /\.(js|json|node)$/;

  const re1 = /(from\s+['"])(\.{1,2}\/[^'"\n]+?)(['"])/g;
  const re2 = /(export\s+\*\s+from\s+['"])(\.{1,2}\/[^'"\n]+?)(['"])/g;
  const re3 = /(export\s+\{[^}]+\}\s+from\s+['"])(\.{1,2}\/[^'"\n]+?)(['"])/g;

  const add = (m, a, b, c) => (extsOk.test(b) ? m : `${a}${b}.js${c}`);

  walk(root, (p) => {
    if (!p.endsWith(".ts")) return;
    const s = fs.readFileSync(p, "utf8");
    const out = s.replace(re1, add).replace(re2, add).replace(re3, add);
    if (out !== s) {
      fs.writeFileSync(p, out, "utf8");
      console.log("patched", p);
    }
  });
}

patchSharedTsconfig();
patchRelativeSpecifiersToJsExt();
