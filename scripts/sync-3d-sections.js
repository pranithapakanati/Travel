/**
 * Sync adventure + blog sections from index.html to inner pages.
 * Adventure and blogs markup live only in index.html (no component partials).
 * Run: node scripts/sync-3d-sections.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const INDEX = path.join(ROOT, "index.html");

function relPrefix(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  if (rel === "index.html") return "";
  try {
    const html = fs.readFileSync(filePath, "utf8");
    if (/<base\s+href=["']\/["']/i.test(html)) {
      return "/";
    }
  } catch (_) {
    /* ignore */
  }
  if (/^packages\/bali\/[^/]+\/index\.html$/.test(rel)) return "../../../";
  if (/^locations\/bali\/[^/]+\.html$/.test(rel)) return "../../";
  if (/^(packages|locations|blogs|company)\//.test(rel)) return "../";
  return "";
}

function extractBlock(html, startNeedle, endNeedle) {
  const start = html.indexOf(startNeedle);
  if (start === -1) return null;
  const end = html.indexOf(endNeedle, start);
  if (end === -1) return null;
  return html.slice(start, end).trimEnd();
}

function toTemplate(block) {
  return block.replace(/src="assets\//g, 'src="__TRIPON_REL__assets/').replace(/href="blogs\//g, 'href="__TRIPON_REL__blogs/');
}

function applyTemplate(template, prefix, opts = {}) {
  const heading = opts.adventureHeading || "Let\u2019s go on an adventure";
  const blogsExtra = opts.blogsExtraClass ? ` ${opts.blogsExtraClass.trim()}` : "";
  return template
    .split("__TRIPON_REL__")
    .join(prefix)
    .split("__ADVENTURE_HEADING__")
    .join(heading)
    .replace('class="bali-blogs"', `class="bali-blogs${blogsExtra}"`);
}

function indentBlock(block, spaces) {
  const pad = " ".repeat(spaces);
  return block
    .split("\n")
    .map((line) => (line.trim() ? pad + line : line))
    .join("\n");
}

function replaceAdventure(html, replacement, indent = 6) {
  const block = indentBlock(replacement, indent);
  const shimRe =
    /<div class="home-screen location-adventure-home-shim">\s*<section class="adventure">[\s\S]*?<\/section>\s*<\/div>/;
  if (shimRe.test(html)) {
    return html.replace(shimRe, block);
  }
  const legacyRe = /<section class="adventure">[\s\S]*?<\/section>/;
  if (legacyRe.test(html)) {
    return html.replace(legacyRe, block);
  }
  return html;
}

function replaceBlogs(html, replacement, indent = 6) {
  const block = indentBlock(replacement, indent);
  const re = /<section[^>]*class="bali-blogs[^"]*"[^>]*>[\s\S]*?<\/section>/;
  if (re.test(html)) {
    return html.replace(re, block);
  }
  return html;
}

function walkHtmlFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === "node_modules" || name === ".git") continue;
      walkHtmlFiles(full, out);
    } else if (name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

function pageOptions(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const opts = { blogsExtraClass: "" };

  if (/^packages\//.test(rel)) {
    opts.adventureHeading = "Know More About Locations";
    opts.blogsExtraClass = "reviews-bali-blogs";
  } else if (/^locations\/bali\/[^/]+\.html$/.test(rel)) {
    opts.blogsExtraClass = "location-blogs";
  } else if (/^locations\//.test(rel)) {
    opts.blogsExtraClass = "reviews-bali-blogs";
  } else if (/^company\/people-reviews/.test(rel)) {
    opts.blogsExtraClass = "reviews-bali-blogs";
  }

  return opts;
}

function main() {
  const indexHtml = fs.readFileSync(INDEX, "utf8");

  const adventureTpl = toTemplate(
    extractBlock(
      indexHtml,
      '<section class="adventure adventure--3d"',
      '\n\n      <section class="trip-days'
    )
  );
  const blogsTpl = toTemplate(
    extractBlock(
      indexHtml,
      "<!-- Blogs All About Bali — grid -->",
      '\n\n      <section class="subscribe-showcase">'
    ).replace(/<!-- Blogs All About Bali — grid -->\n\s*/, "")
  );

  if (!adventureTpl || !blogsTpl) {
    console.error("Could not extract adventure/blog sections from index.html");
    process.exit(1);
  }

  const adventureTemplate = adventureTpl.replace(
    "<h2>Let\u2019s go on an adventure</h2>",
    "<h2>__ADVENTURE_HEADING__</h2>"
  );

  const files = walkHtmlFiles(ROOT).filter((f) => {
    const rel = path.relative(ROOT, f).replace(/\\/g, "/");
    return !rel.startsWith("components/");
  });

  let updated = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    if (rel === "index.html") continue;

    let html = fs.readFileSync(file, "utf8");
    const original = html;
    const prefix = relPrefix(file);
    const opts = pageOptions(file);
    const hasLegacyAdventureSection =
      html.includes('class="adventure"') && !html.includes("data-tripon-adventure-3d");
    const hasBlogsSection = html.includes('class="bali-blogs');
    const needsBlogGridSync =
      hasBlogsSection &&
      (html.includes("bali-blogs--3d") ||
        html.includes("bali-card-3d") ||
        !html.includes("bali-blogs-grid"));
    const needsAssetPathFix =
      html.includes("../assets/images/") &&
      (html.includes("data-tripon-adventure-3d") || html.includes("bali-blogs--3d") || html.includes("bali-card-3d"));

    if (needsAssetPathFix) {
      html = html.split("../assets/images/").join(`${prefix}assets/images/`);
    }
    if (hasLegacyAdventureSection) {
      html = replaceAdventure(html, applyTemplate(adventureTemplate, prefix, opts), rel.includes("locations/bali/") ? 8 : 6);
    }
    if (needsBlogGridSync) {
      const blogIndent = rel.includes("locations/bali/") ? 8 : 6;
      html = replaceBlogs(html, applyTemplate(blogsTpl, prefix, opts), blogIndent);
    }

    if (html !== original) {
      fs.writeFileSync(file, html, "utf8");
      updated += 1;
      console.log("updated:", rel);
    }
  }

  console.log(`Done. ${updated} file(s) updated.`);
}

main();
