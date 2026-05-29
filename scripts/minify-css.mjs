#!/usr/bin/env node
/** Minify core Tripon stylesheets → parallel .min.css (sources unchanged). */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const files = [
  "assets/css/main.css",
  "assets/css/responsive.css",
  "assets/css/navbar.css",
  "assets/css/footer-luxury.css",
  "assets/css/site-ambient.css",
  "assets/css/package-details.css",
  "assets/css/contact-luxury.css",
  "assets/css/sitemap-page.css",
];

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: true, cwd: root });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))));
  });
}

for (const file of files) {
  const out = file.replace(/\.css$/, ".min.css");
  await run("npx", ["--yes", "clean-css-cli", "-o", out, file]);
  console.log(`${file} → ${out}`);
}

console.log("CSS minify complete.");
