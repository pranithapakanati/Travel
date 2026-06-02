import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mainPath = path.join(root, "assets/css/main.css");

const targets = {
  allLocations: path.join(root, "assets/css/all-locations-page.css"),
  blogDetails: path.join(root, "assets/css/blog-details-page.css"),
  locationPage: path.join(root, "assets/css/location-page.css"),
  contactPage: path.join(root, "assets/css/contact-page.css"),
  peopleReviews: path.join(root, "assets/css/people-reviews-page.css"),
};

const RE = {
  allLocations:
    /(all-locations|all-location-card|tripon-dest-gallery|tripon-coverflow|\[data-all-locations-hub|\[data-tripon-dest-gallery|allLocationsView)/i,
  blogDetails: /(blog-details|blog-related)/i,
  contactPage: /(contact-|contact-page)/i,
  peopleReviews:
    /(people-reviews|reviews-page|reviews-shell|reviews-row|reviews-metric|reviews-bali-blogs|testimonial|review-card|review-head)/i,
  locationPage:
    /(\.location-|location-page|location-shell|location-things|location-packages|location-blogs|location-intro|location-stats|location-offer|\[data-static-location-page)/i,
};

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
    const prelude = input.slice(i, open).trim();
    const body = input.slice(open + 1, close);
    const raw = input.slice(i, close + 1);
    out.push({ start: i, end: close + 1, prelude, body, raw });
    i = close + 1;
  }
  return out;
}

function classifyPrelude(prelude) {
  if (RE.allLocations.test(prelude)) return "allLocations";
  if (RE.blogDetails.test(prelude)) return "blogDetails";
  if (RE.contactPage.test(prelude)) return "contactPage";
  if (RE.peopleReviews.test(prelude)) return "peopleReviews";
  if (RE.locationPage.test(prelude)) return "locationPage";
  return null;
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
    const prelude = body.slice(i, open).trim();
    const raw = body.slice(i, close + 1);
    out.push({ prelude, raw });
    i = close + 1;
  }
  return out;
}

const css = fs.readFileSync(mainPath, "utf8");
const blocks = splitTopLevel(css);

const movedByTarget = {
  allLocations: [],
  blogDetails: [],
  locationPage: [],
  contactPage: [],
  peopleReviews: [],
};

let rebuilt = "";
let cursor = 0;
let movedCount = 0;

for (const block of blocks) {
  rebuilt += css.slice(cursor, block.start);
  cursor = block.end;

  if (!/^@media/i.test(block.prelude)) {
    rebuilt += block.raw;
    continue;
  }

  const inner = splitInnerRules(block.body);
  const keep = [];
  const moveMap = {
    allLocations: [],
    blogDetails: [],
    locationPage: [],
    contactPage: [],
    peopleReviews: [],
  };

  for (const rule of inner) {
    const key = classifyPrelude(rule.prelude);
    if (key) {
      moveMap[key].push(rule.raw);
      movedCount += 1;
    } else {
      keep.push(rule.raw);
    }
  }

  for (const key of Object.keys(moveMap)) {
    if (moveMap[key].length) {
      movedByTarget[key].push(`${block.prelude} {\n${moveMap[key].join("\n\n")}\n}`);
    }
  }

  if (keep.length) {
    rebuilt += `${block.prelude} {\n${keep.join("\n\n")}\n}`;
  }
}
rebuilt += css.slice(cursor);

for (const [key, filePath] of Object.entries(targets)) {
  if (!fs.existsSync(filePath)) continue;
  if (!movedByTarget[key].length) continue;
  const current = fs.readFileSync(filePath, "utf8").trimEnd();
  const appended =
    `${current}\n\n/* Responsive media queries moved from main.css */\n\n` +
    `${movedByTarget[key].join("\n\n")}\n`;
  fs.writeFileSync(filePath, appended, "utf8");
}

fs.writeFileSync(mainPath, rebuilt, "utf8");

console.log(`moved media rules: ${movedCount}`);
for (const [k, chunks] of Object.entries(movedByTarget)) {
  console.log(`${k}: ${chunks.length} media blocks updated`);
}
