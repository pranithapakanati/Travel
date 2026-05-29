#!/usr/bin/env node
/**
 * Point HTML at minified CSS; defer non-critical sheets; async Font Awesome.
 * Does not remove CSS rules (no purge) — layout-safe.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function walkHtml(dir, files = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walkHtml(p, files);
    else if (e.isFile() && extname(e.name) === ".html") files.push(p);
  }
  return files;
}

function isPackageDetailsHtml(html, filePath) {
  if (/package-details-page/i.test(html)) return true;
  if (/class="search-box"/i.test(html) && /type="date"/i.test(html)) return true;
  return /[/\\]packages[/\\][^/\\]+[/\\][^/\\]+[/\\][^/\\]+\.html?$/i.test(filePath);
}

function asyncStylesheetTag(href) {
  return (
    `<link rel="stylesheet" href="${href}" media="print" ` +
    `onload="this.media='all';this.onload=null;" />\n` +
    `  <noscript><link rel="stylesheet" href="${href}" /></noscript>`
  );
}

function asyncFontAwesomeTag(href) {
  return (
    `<link rel="stylesheet" href="${href}" media="print" ` +
    `onload="this.media='all';this.onload=null;" crossorigin="anonymous" referrerpolicy="no-referrer" />\n` +
    `  <noscript><link rel="stylesheet" href="${href}" crossorigin="anonymous" /></noscript>`
  );
}

function patch(html, filePath) {
  let out = html;
  const isPd = isPackageDetailsHtml(html, filePath);

  if (!isPd) {
    out = out.replace(/\s*<link[^>]*package-details\.css[^>]*>\s*/gi, "\n");
  } else {
    out = out.replace(/package-details\.css/g, "package-details.min.css");
  }

  out = out.replace(/href="([^"]*\/)?assets\/css\/main\.css"/g, (m, p) =>
    `href="${p || ""}assets/css/main.min.css"`
  );

  out = out.replace(
    /<link\s+rel="stylesheet"\s+href="([^"]*responsive)\.css"[^>]*\/?>/gi,
    (_, base) => asyncStylesheetTag(`${base}.min.css`)
  );

  out = out.replace(
    /<link\s+rel="stylesheet"\s+href="([^"]*site-ambient)\.css"[^>]*\/?>/gi,
    (_, base) => asyncStylesheetTag(`${base}.min.css`)
  );

  out = out.replace(
    /<link\s+rel="stylesheet"\s+href="(https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.5\.0\/css\/all\.min\.css)"[^>]*\/?>/gi,
    (_, href) => asyncFontAwesomeTag(href)
  );

  out = out.replace(/href="([^"]*\/)?assets\/css\/(navbar|footer-luxury|contact-luxury|sitemap-page)\.css"/g, (m, p, name) =>
    `href="${p || ""}assets/css/${name}.min.css"`
  );

  return out === html ? null : out;
}

let n = 0;
for (const file of walkHtml(root)) {
  const html = readFileSync(file, "utf8");
  const next = patch(html, file);
  if (next) {
    writeFileSync(file, next, "utf8");
    n++;
    console.log("patched:", file.replace(root, ""));
  }
}
console.log(`Patched ${n} HTML file(s).`);
