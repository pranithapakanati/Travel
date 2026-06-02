import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mainPath = path.join(root, "assets/css/main.css");
const homeSectionsPath = path.join(root, "assets/css/home-sections.css");
const homeResponsivePath = path.join(root, "assets/css/home-responsive.css");

const HOME_RE =
  /(^|[\s,])(\.home-screen|\.hero\b|\.trip-days\b|\.trip-days--motion|\.reasons\b|\.reasons__|\.popular-packages\b|\.bali-blogs\b|\.family-tour\b|\.deals\b|\.faq-|\.subscribe-showcase\b|\.instagram\b|\.mobile-pref|\.adventure--3d)/i;

function skipComment(input, i) {
  if (input[i] === "/" && input[i + 1] === "*") {
    const end = input.indexOf("*/", i + 2);
    return end === -1 ? input.length : end + 2;
  }
  return i;
}

function findMatchingBrace(input, openIdx) {
  let i = openIdx + 1;
  let depth = 1;
  while (i < input.length) {
    if (input[i] === "/" && input[i + 1] === "*") {
      i = skipComment(input, i);
      continue;
    }
    if (input[i] === "{") depth += 1;
    else if (input[i] === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
    i += 1;
  }
  return -1;
}

function splitTopLevel(input) {
  const out = [];
  let i = 0;
  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i])) i += 1;
    if (i >= input.length) break;
    if (input[i] === "/" && input[i + 1] === "*") {
      i = skipComment(input, i);
      continue;
    }
    const open = input.indexOf("{", i);
    if (open === -1) break;
    const close = findMatchingBrace(input, open);
    if (close === -1) break;
    out.push({
      start: i,
      end: close + 1,
      prelude: input.slice(i, open).trim(),
      body: input.slice(open + 1, close),
      raw: input.slice(i, close + 1),
    });
    i = close + 1;
  }
  return out;
}

function splitInnerRules(body) {
  const out = [];
  let i = 0;
  while (i < body.length) {
    while (i < body.length && /\s/.test(body[i])) i += 1;
    if (i >= body.length) break;
    if (body[i] === "/" && body[i + 1] === "*") {
      i = skipComment(body, i);
      continue;
    }
    const open = body.indexOf("{", i);
    if (open === -1) break;
    const close = findMatchingBrace(body, open);
    if (close === -1) break;
    out.push({
      prelude: body.slice(i, open).trim(),
      raw: body.slice(i, close + 1),
    });
    i = close + 1;
  }
  return out;
}

const css = fs.readFileSync(mainPath, "utf8");
const blocks = splitTopLevel(css);

const movedSections = [];
const movedResponsive = [];
let output = "";
let cursor = 0;
let movedRules = 0;

for (const block of blocks) {
  output += css.slice(cursor, block.start);
  cursor = block.end;

  if (/^@media/i.test(block.prelude)) {
    const inner = splitInnerRules(block.body);
    const keep = [];
    const move = [];
    for (const rule of inner) {
      if (HOME_RE.test(rule.prelude)) {
        move.push(rule.raw);
        movedRules += 1;
      } else {
        keep.push(rule.raw);
      }
    }
    if (move.length) {
      movedResponsive.push(`${block.prelude} {\n${move.join("\n\n")}\n}`);
    }
    if (keep.length) {
      output += `${block.prelude} {\n${keep.join("\n\n")}\n}`;
    }
    continue;
  }

  if (HOME_RE.test(block.prelude)) {
    movedSections.push(block.raw);
    movedRules += 1;
  } else {
    output += block.raw;
  }
}
output += css.slice(cursor);

const sectionsContent =
  "/* Home sections extracted from main.css */\n\n" + movedSections.join("\n\n") + "\n";
const responsiveContent =
  "/* Home responsive media queries extracted from main.css */\n\n" +
  movedResponsive.join("\n\n") +
  "\n";

fs.writeFileSync(homeSectionsPath, sectionsContent, "utf8");
fs.writeFileSync(homeResponsivePath, responsiveContent, "utf8");
fs.writeFileSync(mainPath, output, "utf8");

console.log(`moved rules: ${movedRules}`);
console.log(`home sections blocks: ${movedSections.length}`);
console.log(`home responsive media blocks: ${movedResponsive.length}`);
