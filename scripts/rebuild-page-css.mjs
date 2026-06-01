/**
 * Rebuild split page CSS from git HEAD main.css (preserves @media blocks).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const gitMain = execSync("git show HEAD:assets/css/main.css", {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 50 * 1024 * 1024,
});
const lines = gitMain.split(/\r?\n/);

function slice(start1, end1) {
  return lines.slice(start1 - 1, end1).join("\n");
}

function writeCss(name, body) {
  const file = path.join(root, "assets/css", name);
  const content = `/* ${name.replace(".css", "")} — restored from git main.css */\n\n${body.trim()}\n`;
  fs.writeFileSync(file, content, "utf8");
  console.log(`Wrote ${name} (${content.length} bytes)`);
}

// --- all-locations hub (lines 67–899) ---
writeCss("all-locations-page.css", slice(67, 899));

// --- blog details base + 900px block ---
const blog900 = slice(1679, 1720);
const blog425 = `@media (max-width: 425px) {
  .blog-details-page {
    width: 100%;
    max-width: 100%;
    overflow-x: clip;
  }

  .blog-details-rating-grid,
  .blog-details-form-grid,
  .blog-details-gallery,
  .blog-details-related-grid {
    grid-template-columns: 1fr !important;
  }
}`;

const blog900b = `@media (max-width: 900px) {
  .blog-details-hero {
    width: 100%;
  }

  .blog-details-nav-row {
    grid-template-columns: 1fr;
  }

  .blog-details-related-shell {
    grid-template-columns: minmax(0, 1fr);
  }

  .blog-related-arrow {
    display: none;
  }

  .blog-details-related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}`;

const blog600 = `@media (max-width: 600px) {
  .blog-details-main {
    padding: 0 12px;
  }

  .blog-details-rating-grid,
  .blog-details-form-grid,
  .blog-details-gallery,
  .blog-details-related-grid {
    grid-template-columns: 1fr;
  }
}`;

writeCss(
  "blog-details-page.css",
  [slice(902, 1421), blog900, blog900b, blog600, blog425].join("\n\n")
);

// --- location detail (contiguous blocks + location-only @media) ---
const loc900 = `@media (max-width: 900px) {
  .location-shell,
  .location-blogs {
    width: min(100%, calc(100% - 28px));
  }

  .location-shell {
    padding: 20px 14px 0;
  }

  .location-blogs {
    padding: 40px 14px 36px;
  }

  .location-blogs .bali-blogs-grid {
    gap: 20px;
    row-gap: 24px;
    width: 100%;
    transform: none;
  }

  .location-blogs .location-blogs-btn {
    margin-top: 32px;
  }

  .location-packages {
    margin-top: 32px;
    padding: 0 14px;
  }

  .location-packages .package-screen-title {
    font-size: 34px;
  }

  .location-packages .location-packages-arrow {
    display: none;
  }

  .location-shell h1 {
    font-size: 30px;
  }

  .location-mini-badge {
    width: 100%;
  }

  .location-mini-badge h2 {
    font-size: 30px;
  }

  .location-stats-row {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .location-stats-row strong {
    font-size: 34px;
  }

  .location-stats-row small {
    font-size: 16px;
  }

  .location-things-grid {
    grid-template-columns: 1fr;
  }

  .location-things-grid span {
    font-size: 32px;
  }

  .location-more-card strong {
    font-size: 34px;
  }

  .location-offer-grid {
    grid-template-columns: 1fr;
  }
}`;

const loc900376 = `@media (max-width: 900px) and (min-width: 376px) {
  .location-page .location-shell {
    width: min(100%, calc(100% - 16px));
  }
}`;

writeCss(
  "location-page.css",
  [
    slice(13238, 14604),
    slice(14635, 14645),
    slice(14668, 14703),
    loc900376,
    loc900,
  ].join("\n\n")
);

// Hub pages use .location-blogs on all-locations — copy grid rules into all-locations file
const hubBlogs = `
/* Bali blogs strip on locations hub (uses .location-blogs) */
.all-locations-page .location-blogs {
  width: 100%;
  max-width: none;
  margin: 20px 0 0;
  padding: 60px 56px;
}

.all-locations-page .location-blogs .bali-blogs-grid {
  width: 84%;
  margin: 0 auto;
  gap: 16px;
  align-items: stretch;
}

.all-locations-page .location-blogs h2 {
  text-align: center;
  margin: 0 0 20px;
}

@media (min-width: 769px) {
  .all-locations-page .location-blogs .bali-blogs-grid {
    grid-template-rows: repeat(2, 248px);
  }

  .all-locations-page .location-blogs .bali-card,
  .all-locations-page .location-blogs .bali-card--featured {
    min-height: 248px;
    max-height: 248px;
    height: 100%;
  }
}

@media (max-width: 900px) {
  .all-locations-page .location-blogs {
    width: min(100%, calc(100% - 28px));
    padding: 40px 14px 36px;
  }

  .all-locations-page .location-blogs .bali-blogs-grid {
    gap: 20px;
    row-gap: 24px;
    width: 100%;
    transform: none;
  }
}
`;

const allLocPath = path.join(root, "assets/css/all-locations-page.css");
fs.appendFileSync(allLocPath, hubBlogs, "utf8");
console.log("Appended hub .location-blogs rules to all-locations-page.css");
