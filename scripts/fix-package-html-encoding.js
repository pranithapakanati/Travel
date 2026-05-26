/**
 * Fixes UTF-8 mojibake in package detail HTML (from PowerShell Set-Content without BOM).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "packages", "bali");

const fromHex = (hex) => Buffer.from(hex, "hex").toString("utf8");

const REPLACEMENTS = [
  [fromHex("c383c2a2c3a2e282acc5a1c382c2b9"), "\u20b9"],
  [fromHex("c383c2a2c3a2e282acc2a0c382c290"), "\u2190"],
  [fromHex("c383c2a2c385e2809cc3a2e282acc2a2"), "\u2715"],
  [fromHex("c383e2809ac2b7"), "\u00b7"],
  ["\u00e2\u201a\u00b9", "\u20b9"],
  ["\u00e2\u2020\u2014", "\u2197"],
  ["\u00e2\u2020\u0090", "\u2190"],
  ["\u00e2\u0153\u2022", "\u2715"],
  ["\u00c3\u00a2\u00e2\u20ac\u00a1\u00c2\u00b9", "\u20b9"],
  ["\u00c3\u00a2\u00e2\u20ac\u00a0\u00e2\u20ac\u201d", "\u2197"],
  ["\u00c2\u00b7", "\u00b7"],
];

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (ent.name.endsWith(".html")) files.push(p);
  }
  return files;
}

let fixed = 0;
for (const file of walk(root)) {
  let text = fs.readFileSync(file, "utf8");
  if (!text.includes("package-details-page")) continue;
  const before = text;

  for (const [bad, good] of REPLACEMENTS) {
    if (bad) text = text.split(bad).join(good);
  }

  text = text.replace(
    /<h3 class="mobile-pref-title">[^<]*(?=Get a Call Back)/g,
    '<h3 class="mobile-pref-title">\u{1F4DE} '
  );

  if (text !== before) {
    fs.writeFileSync(file, text, { encoding: "utf8" });
    console.log("Fixed:", path.relative(root, file));
    fixed++;
  }
}

console.log(`Done. ${fixed} file(s) updated.`);
