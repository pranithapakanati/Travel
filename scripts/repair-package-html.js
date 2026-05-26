/**
 * Repairs package detail HTML files corrupted by a bad batch script.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "packages");

function findDetailFiles(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      findDetailFiles(p, out);
    } else if (ent.name.endsWith(".html")) {
      const raw = fs.readFileSync(p, "utf8");
      if (raw.includes("package-details-page")) {
        out.push(p);
      }
    }
  }
  return out;
}

function extractBestDocument(raw) {
  const chunks = [];
  let start = 0;
  while (true) {
    const docStart = raw.indexOf("<!DOCTYPE html>", start);
    if (docStart === -1) break;
    const docEnd = raw.indexOf("</html>", docStart);
    if (docEnd === -1) break;
    const chunk = raw.slice(docStart, docEnd + 7);
    chunks.push(chunk);
    start = docEnd + 7;
  }

  const scored = chunks
    .filter((c) => c.includes("triponBootMain") && c.includes("responsive.css"))
    .map((c) => ({
      c,
      score:
        (c.includes("package-details.js") ? 10 : 0) +
        (c.includes("package-details.css") ? 10 : 0) +
        (!c.includes("-match") && !c.includes("$(&") ? 20 : 0) +
        (c.match(/<!DOCTYPE html>/g)?.length === 1 ? 5 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.c || chunks[chunks.length - 1] || raw;
}

function normalizeHead(content, assetPrefix) {
  content = content.replace(
    /<link rel="stylesheet" href="[^"]*main\.css" \/>\s*[\s\S]*?<link rel="stylesheet" href="[^"]*responsive\.css" \/>/,
    `<link rel="stylesheet" href="${assetPrefix}assets/css/main.css" />\n  <link rel="stylesheet" href="${assetPrefix}assets/css/responsive.css" />`
  );

  if (!content.includes("package-details.css")) {
    content = content.replace(
      /(<link rel="stylesheet" href="[^"]*responsive\.css" \/>)/,
      `$1\n  <link rel="stylesheet" href="${assetPrefix}assets/css/package-details.css" />`
    );
  }

  content = content.replace(
    /\s*<link rel="stylesheet" href="[^"]*package-details\.css" \/>/g,
    ""
  );
  content = content.replace(
    /(<link rel="stylesheet" href="[^"]*responsive\.css" \/>)/,
    `$1\n  <link rel="stylesheet" href="${assetPrefix}assets/css/package-details.css" />`
  );

  return content;
}

function normalizeScripts(content, assetPrefix) {
  content = content.replace(/\s*<script src="[^"]*package-details\.js"><\/script>/g, "");
  content = content.replace(
    /(<script src="[^"]*ui\.js"><\/script>)/,
    `$1\n  <script src="${assetPrefix}assets/js/package-details.js"></script>`
  );
  return content;
}

const files = findDetailFiles(path.join(root, "bali"));
let fixed = 0;

for (const file of files) {
  let raw = fs.readFileSync(file, "utf8");
  const needsRepair =
    raw.includes("-match 'responsive") ||
    raw.includes("$(&") ||
    (raw.match(/<!DOCTYPE html>/g) || []).length > 1;

  if (!needsRepair) {
    const prefix = raw.includes("../../../assets") ? "../../../" : raw.includes("../../assets") ? "../../" : "../";
    let content = raw;
    const before = content;
    content = normalizeHead(content, prefix);
    content = normalizeScripts(content, prefix);
    if (content !== before) {
      fs.writeFileSync(file, content, "utf8");
      console.log("Normalized", path.relative(root, file));
      fixed++;
    }
    continue;
  }

  let content = extractBestDocument(raw);
  const prefix = content.includes("../../../assets") ? "../../../" : content.includes("../../assets") ? "../../" : "../";
  content = normalizeHead(content, prefix);
  content = normalizeScripts(content, prefix);
  fs.writeFileSync(file, content, "utf8");
  console.log("Repaired", path.relative(root, file));
  fixed++;
}

console.log("Done.", fixed, "files touched");
