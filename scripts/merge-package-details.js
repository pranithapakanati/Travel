/**
 * Merges package-details-page logic from ui.js into package-details.js and trims ui.js.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const uiPath = path.join(root, "assets", "js", "ui.js");
const pdPath = path.join(root, "assets", "js", "package-details.js");

const uiLines = fs.readFileSync(uiPath, "utf8").split(/\r?\n/);

function slice(start, end) {
  return uiLines.slice(start - 1, end).join("\n");
}

let pageLogic = [
  slice(42, 1850),
  slice(2164, 2343),
].join("\n\n");

pageLogic = pageLogic.replace(/\bpackageName\b/g, "title");

const indent = (src) =>
  src
    .split("\n")
    .map((line) => (line.length ? "  " + line : line))
    .join("\n");

const pageBlock = `
  /* ========== Package page: itinerary, context, related cards ========== */
${indent(pageLogic)}

  function initPackageDetailsPageContent() {
    applyPackageDetailFromContext();
    injectDynamicPackageItinerary(detailParamLike, initialPackagePageContext, detailParams);
    triponHydratePackageRelatedTrack();
    triponInitPackageRelatedCardClicks();
    triponInitRelatedCardHover();
    initPackageDetailsRelatedCarouselLoop();
  }

`;

let pd = fs.readFileSync(pdPath, "utf8");
if (pd.includes("initPackageDetailsPageContent")) {
  console.log("package-details.js already merged; skipping insert");
} else {
  pd = pd.replace(
    "  /* ========== Booking card ========== */",
    pageBlock + "  /* ========== Booking card ========== */"
  );
  pd = pd.replace(
    `  function triponInitPackageDetailsPage() {
    initPackageDetailsBookingCard();
    initPackageDetailsSharePopup();
    initPackageDetailsBestsellerPopup();
  }`,
    `  function triponInitPackageDetailsPage() {
    initPackageDetailsPageContent();
    initPackageDetailsBookingCard();
    initPackageDetailsSharePopup();
    initPackageDetailsBestsellerPopup();
  }`
  );
  fs.writeFileSync(pdPath, pd, "utf8");
  console.log("Inserted page logic into package-details.js");
}

if (!uiLines[41]?.includes("package-details.js")) {
  const removeRanges = [
    [42, 1855],
    [2164, 2344],
  ].sort((a, b) => b[0] - a[0]);
  let newUiLines = [...uiLines];
  for (const [start, end] of removeRanges) {
    newUiLines.splice(start - 1, end - start + 1);
  }
  newUiLines.splice(
    41,
    0,
    "",
    "// Package details page logic: assets/js/package-details.js",
    ""
  );
  fs.writeFileSync(uiPath, newUiLines.join("\n"), "utf8");
  console.log("Trimmed ui.js");
}
