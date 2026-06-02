import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mainPath = path.join(root, "assets/css/main.css");
const contactPath = path.join(root, "assets/css/contact-page.css");
const reviewsPath = path.join(root, "assets/css/people-reviews-page.css");

const css = fs.readFileSync(mainPath, "utf8");

const CONTACT_RE = /(contact-|\.contact-screen|contact-active|contact-page)/i;
const REVIEWS_RE =
  /(people-reviews|reviews-active|reviews-page|testimonial|review-card|review-head|reviews-shell|reviews-row|reviews-metric|reviews-bali-blogs)/i;

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
  const blocks = [];
  let i = 0;
  while (i < input.length) {
    const nextComment = input.indexOf("/*", i);
    const nextBrace = input.indexOf("{", i);
    if (nextBrace === -1) break;
    const start = nextComment !== -1 && nextComment < nextBrace ? nextComment : i;
    const open = input.indexOf("{", start);
    if (open === -1) break;
    const close = findMatchingBrace(input, open);
    if (close === -1) break;
    const prelude = input.slice(start, open).trim();
    const body = input.slice(open + 1, close);
    blocks.push({ start, end: close + 1, prelude, body, raw: input.slice(start, close + 1) });
    i = close + 1;
  }
  return blocks;
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

function matchesContact(prelude) {
  return CONTACT_RE.test(prelude);
}

function matchesReviews(prelude) {
  return REVIEWS_RE.test(prelude);
}

const blocks = splitTopLevel(css);
const removeRanges = [];
const contactChunks = [];
const reviewChunks = [];

for (const block of blocks) {
  const p = block.prelude;
  if (/^@media/i.test(p)) {
    const inner = splitInnerRules(block.body);
    const contactInner = inner.filter((r) => matchesContact(r.prelude));
    const reviewInner = inner.filter((r) => matchesReviews(r.prelude));
    if (contactInner.length) {
      contactChunks.push(`${p} {\n${contactInner.map((r) => r.raw).join("\n\n")}\n}`);
    }
    if (reviewInner.length) {
      reviewChunks.push(`${p} {\n${reviewInner.map((r) => r.raw).join("\n\n")}\n}`);
    }
    if (contactInner.length || reviewInner.length) {
      removeRanges.push([block.start, block.end]);
    }
    continue;
  }

  const isContact = matchesContact(p);
  const isReview = matchesReviews(p);
  if (isContact) contactChunks.push(block.raw);
  if (isReview) reviewChunks.push(block.raw);
  if (isContact || isReview) removeRanges.push([block.start, block.end]);
}

removeRanges.sort((a, b) => a[0] - b[0]);
let result = "";
let cursor = 0;
for (const [s, e] of removeRanges) {
  if (s > cursor) result += css.slice(cursor, s);
  cursor = Math.max(cursor, e);
}
result += css.slice(cursor);

fs.writeFileSync(
  contactPath,
  `/* Contact page styles extracted from main.css */\n\n${contactChunks.join("\n\n")}\n`,
  "utf8"
);
fs.writeFileSync(
  reviewsPath,
  `/* People reviews styles extracted from main.css */\n\n${reviewChunks.join("\n\n")}\n`,
  "utf8"
);
fs.writeFileSync(mainPath, result, "utf8");

console.log(`contact chunks: ${contactChunks.length}`);
console.log(`reviews chunks: ${reviewChunks.length}`);
console.log(`removed ranges: ${removeRanges.length}`);
