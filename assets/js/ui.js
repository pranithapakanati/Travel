// ================== GALLERY / LIGHTBOX ==================
/** Gallery imgs that are actually shown (package details hides extras until you add URLs). */
function getActiveGalleryImages() {
  return Array.from(document.querySelectorAll(".image-grid .gallery-img")).filter(
    (img) => !img.classList.contains("gallery-img--empty") && img.style.display !== "none" && img.getAttribute("src")
  );
}

function updateImageGridDots(activeIndex = 0) {
  const dotsRoot = document.getElementById("imageGridDots");
  if (!dotsRoot) {
    return;
  }
  const dots = Array.from(dotsRoot.querySelectorAll(".image-grid-dot"));
  const galleryCount = getActiveGalleryImages().length;
  const visibleCount = Math.max(1, Math.min(dots.length, galleryCount || dots.length));
  dots.forEach((dot, index) => {
    const show = index < visibleCount;
    dot.style.display = show ? "" : "none";
    dot.classList.toggle("is-active", show && index === activeIndex);
  });
}
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCount = document.getElementById("lightbox-count");
const lightboxPlayBtn = document.getElementById("lightbox-play");
const lightboxProgressFill = document.getElementById("lightbox-progress-fill");
const lightboxFullscreenHint = document.getElementById("lightbox-fullscreen-hint");

let currentIndex = 0;
let isSlideshowPlaying = false;
let slideshowFrameId = null;
let slideshowStartTime = 0;
const slideDurationMs = 1000;
let fullscreenHintTimeout = null;

lightboxImg?.addEventListener("dblclick", (event) => {
  event.preventDefault();
  lightboxImg.classList.toggle("is-zoomed-out");
});

// --------- Package itinerary (duration, destination, places, activities) ---------
function escapeHtmlItinerary(raw) {
  return String(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cleanSnippet(raw, maxLen = 160) {
  let s = String(raw || "")
    .replace(/^[\s.•●○◦\-–—]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length > maxLen) s = `${s.slice(0, maxLen - 1).trim()}…`;
  return s;
}

/**
 * Turn package card / data-attribute image paths into a URL that works from
 * packages/package-details.html (where "images/..." would wrongly resolve
 * under a wrong images/... path).
 */
function triponResolvePackageImageSrc(src) {
  const raw = String(src || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:")) return raw;
  if (/^(https?:)?\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) {
    try {
      return new URL(raw, window.location.origin || window.location.href).href;
    } catch (_e) {
      return raw;
    }
  }
  let path = raw.replace(/\\/g, "/");
  if (path.startsWith("./")) path = path.slice(2);
  while (path.startsWith("../")) path = path.slice(3);
  if (path.startsWith("images/")) {
    path = "/assets/images/" + path.slice("images/".length);
  } else if (path.startsWith("assets/images/")) {
    path = "/" + path;
  } else {
    try {
      return new URL(raw, document.baseURI || window.location.href).href;
    } catch (_e) {
      return raw;
    }
  }
  try {
    const origin = window.location.origin;
    if (origin && origin !== "null") {
      return new URL(path, origin).href;
    }
  } catch (_e) {
    /* fall through */
  }
  const loc = (window.location.pathname || "").replace(/\\/g, "/");
  const tail = path.startsWith("/") ? path.slice(1) : path;
  try {
    if (loc.includes("/packages/package-details") || loc.includes("/packages/package-details")) {
      return new URL(`../${tail}`, window.location.href).href;
    }
    return new URL(tail, window.location.href).href;
  } catch (_e2) {
    return path;
  }
}

function pickFirstText(...values) {
  for (const v of values) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return "";
}

function clampItineraryDays(n) {
  if (!Number.isFinite(n) || n < 1) return 3;
  return Math.min(Math.floor(n), 21);
}

function parseDurationDays(text) {
  const t = pickFirstText(text);
  if (!t) return 3;
  if (/half\s*-\s*day|half\s*day/i.test(t)) return 1;
  const daysMatch = t.match(/(\d+)\s*days?/i);
  if (daysMatch) return clampItineraryDays(Number(daysMatch[1]));
  const nums = t.match(/\d+/g)?.map(Number) || [];
  if (!nums.length) return 3;
  if (/night/i.test(t)) return clampItineraryDays(Math.max(...nums));
  return clampItineraryDays(Math.max(...nums));
}

function parseCommaListParam(value) {
  if (value == null || !String(value).trim()) return [];
  return String(value)
    .split("|")
    .flatMap((part) => part.split(","))
    .map((s) => cleanSnippet(s, 120))
    .filter(Boolean);
}

function readInitialPackagePageContext() {
  const durationItem = Array.from(document.querySelectorAll(".info-row .info-item")).find((el) =>
    /\bduration\b/i.test(el.querySelector(".info-label")?.textContent || "")
  );
  const daysText = durationItem?.querySelector(".info-value")?.textContent?.trim() || "";
  const fullLocation =
    document.querySelector(".top-bar .left-section .location span")?.textContent?.trim() || "";
  const title = document.querySelector(".title-section h1")?.textContent?.trim() || "";

  let highlightsUl = null;
  const left = document.querySelector(".content .left") || document.querySelector(".left");
  if (left) {
    const h3Highlight = Array.from(left.querySelectorAll("h3")).find((node) =>
      /highlight/i.test(node.textContent)
    );
    const nextEl = h3Highlight?.nextElementSibling;
    if (nextEl?.tagName === "UL") highlightsUl = nextEl;
  }

  const highlights = highlightsUl
    ? Array.from(highlightsUl.querySelectorAll("li")).map((li) => cleanSnippet(li.textContent)).filter(Boolean)
    : [];

  const includedRoot = document.querySelector(".accordion .accordion-item:first-of-type .accordion-content ul");
  const included = includedRoot
    ? Array.from(includedRoot.querySelectorAll("li")).map((li) => cleanSnippet(li.textContent)).filter(Boolean)
    : [];

  const destination = fullLocation.split(",")[0].trim() || "your destination";

  return { daysText, fullLocation, destination, title, highlights, included };
}

function simpleHashItinerary(str) {
  let h = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function uniqPreserveStrings(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const t = cleanSnippet(item, 200);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function includedToFriendlyBullet(line) {
  const t = line.toLowerCase();
  if (/pickup|drop|transfer|shuttle/i.test(t))
    return "Coordinated transfers so you can relax between stops.";
  if (/lunch|breakfast|meal|buffet|dining/i.test(t))
    return "Meals lined up exactly as promised in your inclusions.";
  if (/snorkel|gear|equipment/i.test(t))
    return "Gear and on-site guidance for water-based moments.";
  if (/boat|speedboat|cruise|ferry/i.test(t))
    return "Scenic crossings by boat woven into the day’s rhythm.";
  return `Included perk: ${line}`;
}

function typeFlavorPhrase(packageType) {
  const n = (packageType || "").toLowerCase();
  if (n === "couple") return "romantic pacing with quiet viewpoints";
  if (n === "family") return "kid-friendly pacing with breathing room";
  if (n === "friends") return "social, high-energy highlights";
  return "comfortable pacing and time to wander";
}

function buildExperiencePool(ctx) {
  const attractions = uniqPreserveStrings(ctx.attractions || []);
  const activities = uniqPreserveStrings(ctx.activities || []);
  const fromHighlights = uniqPreserveStrings(ctx.highlightPool || []).map((x) => cleanSnippet(x, 200));
  const fromIncluded = (ctx.includedPool || []).map((x) => cleanSnippet(includedToFriendlyBullet(x), 200));

  return uniqPreserveStrings([...attractions, ...activities, ...fromHighlights, ...fromIncluded]);
}

/** Destination-tuned bullets (prepended — consumed before generic filler). */
function regionalAccentLines(dest) {
  const d = dest.toLowerCase();
  const lines = [];

  const add = (arr) => {
    arr.forEach((x) => lines.push(x));
  };

  if (/uluwatu/i.test(d)) {
    add([
      `Pura Luhur Uluwatu clifftop walk — sash provided if needed.`,
      `Kecak fire-dance dusk timing with ocean backdrop.`,
      `Padang Padang or Suluban steps — tidal timing matters.`,
      `Single-fin reefs & respectful surf-lineup etiquette.`,
      `Jimbaran-style seafood grills if you drift north for dinner.`,
      `El Kabron–style sunset decks (venue rotation by season).`,
      `Bingin viewpoint photos without crowding narrow lanes.`,
    ]);
  } else if (/ubud/i.test(d)) {
    add([
      `Tegallalang or Ceking rice-terrace ridge stroll.`,
      `Sacred Monkey Forest pace — secure loose items.`,
      `Campuhan Ridge easy walk — morning cool preferred.`,
      `Ubud royal palace & Saraswati lotus ponds.`,
      `Art market haggling with smile-and-walk-away grace.`,
      `Traditional dance dusk shows near central Ubud.`,
    ]);
  } else if (/seminyak|petitenget/i.test(d)) {
    add([
      `Eat Street tasting trail from satay to modern bistros.`,
      `Petitenget temple dress code quick stop.`,
      `Double Six–style sundown lounger rotation.`,
      `Designer boutiques between Jl. Kayu Aya hops.`,
      `Late swim at patrolled Seminyak beach strips.`,
    ]);
  } else if (/canggu/i.test(d)) {
    add([
      `Berawa to Batu Bolong scooter loop with helmet discipline.`,
      `Volcanic-black sand lounges and mellow surf.`,
      `Café-flatwhite crawl through leafy side roads.`,
      `Echo Beach grills as lanterns light up.`,
      `Rice-pocket shortcuts between trending brunch spots.`,
    ]);
  } else if (/sanur/i.test(d)) {
    add([
      `Sanur sunrise boardwalk glide — mellow reef shelf.`,
      `Le Mayeur legacy museum within garden calm.`,
      `Mangrove kayak or kayak-glide window tides.`,
      `Boat doorway to Nusa islands from sunrise coast.`,
      `Vintage beachfront hotels with porch tea rhythm.`,
    ]);
  } else if (/nusa penida/i.test(d)) {
    add([
      `Kelingking viewpoint descent planning — hydrate first.`,
      `Angel’s Billabong tide-table respect — slippery rocks.`,
      `Broken Beach & natural arch panorama loop.`,
      `Crystal Bay snorkel pacing with fins and flotation.`,
      `Fast-boat docking grace — nimble luggage packing.`,
    ]);
  } else if (/gili/i.test(d)) {
    add([
      `Horse-cart–free shoreline segments — choose quieter arcs.`,
      `Circum-island pedal with tropical downpour dodge.`,
      `Turtle snorkel points with buoy line courtesy.`,
      `Swing-set photo etiquette — swift fair queues.`,
      `Lantern-lit beach BBQ options by night breeze.`,
    ]);
  }

  if (/bali/i.test(d) && !lines.length) {
    add([
      `Blessing-ready sarong & sash kit for sacred entries.`,
      `Canang walkway mindfulness — gentle step-around.`,
      `Warung platter sharing — spoon-right-hand courtesy cues.`,
      `Volcano silhouette backdrop from southern cliff roads.`,
      `Blessing-water optional participation at family temples.`,
      `Island-hop boat spray prep — lite dry layers.`,
    ]);
  }

  return uniqPreserveStrings(lines);
}

/** Long list of filler lines — each used at most once across the trip. */
function buildUniqueFallbackBulletBank(dest, packageType) {
  const flavor = typeFlavorPhrase(packageType);
  const coreBank = [
    `Sunrise stroll while ${dest} is still quiet.`,
    `Mid-morning swim or pool dip before peak heat.`,
    `Coastal viewpoints with plenty of pause for photos.`,
    `Coffee stop at a local roastery or breezy terrace.`,
    `Afternoon shaded walk through side streets.`,
    `Sunset vantage — watch the glow roll over ${dest}.`,
    `Evening meal focused on regional flavours.`,
    `Half-day beach time with towels and a good book.`,
    `Short heritage loop: architecture, stories, and photo breaks.`,
    `Market browse for snacks, fruit, and small gifts.`,
    `Artisan quarter — pottery, woodwork, or weaving demos.`,
    `Active block: light hike, bike path, or water sport taster.`,
    `Spa or massage window to reset after travel days.`,
    `Cliff-top or hill trail with wide-open views.`,
    `Hidden cove or calmer beach away from the main strip.`,
    `Seafood lunch by the water when timing allows.`,
    `Temple or shrine visit with respectful dress and calm pacing.`,
    `Rice-field edge drive with green panoramas.`,
    `Village stop for home-style cooking or tea.`,
    `Rooftop or deck drinks as the heat softens.`,
    `Snorkel, paddle, or reef swim if conditions look good.`,
    `Boat hop or short crossing to a nearby islet.`,
    `Surf check, lesson, or shore break watch — your pick.`,
    `Cooking class or tasting menu as a hands-on memory.`,
    `Yoga, stretch, or meditation block to keep things ${flavor}.`,
    `Boutique crawl for clothes, jewellery, or design pieces.`,
    `Night market energy: lights, music, and street bites.`,
    `Photography route mapped to golden-hour light.`,
    `Family-friendly pool games or shallow-water play.`,
    `Short nap or downtime — pacing stays ${flavor}.`,
    `Scenic ridge road with viewpoints every few kilometres.`,
    `Harbour walk watching boats come and go.`,
    `Coffee plantation or farm tour if available nearby.`,
    `Waterfall or freshwater dip on a hotter afternoon.`,
    `Canoe, kayak, or calm lagoon paddle.`,
    `Dance, music, or cultural show one evening.`,
    `Craft workshop: batik, mask painting, or similar.`,
    `Picnic assembly from bakery + deli staples.`,
    `Lighthouse or landmark selfie stop en route.`,
    `Underwater viewpoint: glass boat or submarine-style ride where offered.`,
    `Golf tee time, ATV line, or zipline bolt-on (optional add-on).`,
    `Reading hour at a hammock café.`,
    `Local rum, arak, or craft spirit tasting sampler.`,
    `Street-food crawl with guidance on what is mild vs spicy.`,
    `Botanical stroll — orchids, spices, or tropical trees.`,
    `Evening barefoot walk along the shoreline.`,
    `Kids’ ice-cream pause after sightseeing.`,
    `Courier bag drop: laundry pickup so bags stay light.`,
    `Morning drone-style viewpoint without the drone — high decks only.`,
    `Lagoon boardwalk birdwatching.`,
    `Historic fort, gate, or old town stone lanes.`,
    `Chocolate or coffee pairing board.`,
    `Volunteer-lite beach clean or reef-care talk if scheduled.`,
    `Silent hour: phones away, tide sounds only.`,
    `Moonrise swim only when tides and local guidance allow.`,
    `Shaded boardwalk stroll away from midday glare.`,
    `Shell collecting at low tide with gentle footprints.`,
    `Inland breezes — short drive to greener ridges near ${dest}.`,
    `Tropical fruit plate pause at a quiet terrace.`,
    `Sketch or journal hour beneath a pergola.`,
    `Family sandcastle stretch on a wide shoreline.`,
    `Watch wind-surf or kite lines from the promenade.`,
    `Reapply reef-safe SPF before peak UV blocks.`,
    `Rinse sandy feet before returning indoors.`,
    `Post office or stamp corner for handwritten notes.`,
    `Ferry observation deck breeze between islands.`,
    `Rainy-window alternative — gallery, café, or craft mall.`,
    `Laundry turnaround so suitcases breathe easier.`,
    `Small bills ready for kiosk snacks and iced drinks.`,
    `Power-bank café pit stop during long outings.`,
    `Light stretch circuit after uneven paths or stairs.`,
    `Welcome drink ritual where properties offer one.`,
    `Fresh coconut roadside stop — hydrate before heat.`,
    `Balanced brunch before a heavier sightseeing push.`,
    `Ask your guide where spice levels sit on your comfort scale.`,
    `Rainbow-lit sky chase after passing showers.`,
    `Dry sack for electronics when boats splash.`,
    `Sun hat refill at a kiosk if you travelled light.`,
    `One-more-sunset pigment memory before dinner.`,
    `Low-tidal shelf walk with mindful footing.`,
    `High-tide watch from railing or upper deck.`,
    `Calm float session with noodle or buoy support.`,
    `Beach volleyball as spectator—or join politely if invited.`,
    `Cliff etiquette: keep setbacks and respect closures.`,
    `Wildlife etiquette: distance, silence, no flash.`,
    `Coral etiquette: careful fins, buoyancy, buoy lines.`,
    `Boat etiquette: barefoot zones, seated boarding.`,
    `Life jacket sizing check before aquatic legs.`,
    `Spare dry layer sealed for splashes or drizzle.`,
    `Mosquito-dusk precaution if humidity climbs.`,
    `Quick cleanse after buzzing market tastings.`,
    `Lip balm with SPF alongside facial sunscreen.`,
    `Cooling balm hour after reef salt or sunny walks.`,
    `Quiet hotel night rhythm — blackout + soft fan hum.`,
    `Hydration checkpoints every few hours.`,
    `Curate a short “keepers” gallery before you fly.`,
  ];

  return uniqPreserveStrings([
    ...regionalAccentLines(dest),
    ...purposefulPlanningLines(dest, packageType),
    ...coreBank,
  ]);
}

function titleKeyLine(line) {
  return String(line || "")
    .replace(/^Day\s*\d+\s*·\s*/i, "")
    .trim()
    .toLowerCase();
}

const MIDDLE_TITLE_COASTAL = [
  (dest) => `Coastal cliffs & golden hour — ${dest}`,
  (dest) => `Beach rhythm & long lunch — ${dest}`,
  (dest) => `Reef, paddle, or water play — ${dest}`,
  (dest) => `Harbour routes & bayside dining — ${dest}`,
  (dest) => `Hidden shores & quieter coves — ${dest}`,
  (dest) => `Island-hop timing & reef windows — ${dest}`,
  (dest) => `Sunset perch & sea breeze — ${dest}`,
  (dest) => `Boat timetable & lagoon hops — ${dest}`,
  (dest) => `Fishing harbour & grill-to-table eve — ${dest}`,
];

const MIDDLE_TITLE_INTRACOAST_MERGED = [
  (dest) => `Temples & tradition — ${dest}`,
  (dest) => `Markets, bites & artisan lanes — ${dest}`,
  (dest) => `Viewpoints & scenic drives — ${dest}`,
  (dest) => `Nature trails & green pockets — ${dest}`,
  (dest) => `Spa, stretch & slow reset — ${dest}`,
  (dest) => `Design shops & café hopping — ${dest}`,
  (dest) => `Heritage walk & neighbourhood stories — ${dest}`,
  (dest) => `Rice terraces & countryside loop — ${dest}`,
  (dest) => `Cooking aromas & tasting tables — ${dest}`,
  (dest) => `River gorge or canyon viewpoint — ${dest}`,
  (dest) => `Family picnics & shaded breaks — ${dest}`,
  (dest) => `Photo route & postcard frames — ${dest}`,
  (dest) => `Wellness soak & herbal tea pause — ${dest}`,
  (dest) => `Vintage quarter & nostalgic corners — ${dest}`,
  (dest) => `Active outing & outdoor stretch — ${dest}`,
  (dest) => `Night markets & lanterns — ${dest}`,
];

const MIDDLE_TITLE_CITY_MAJOR = [
  (dest) => `Museums, galleries & grand avenues — ${dest}`,
  (dest) => `Royal quarters & ceremonial façades — ${dest}`,
  (dest) => `Historic core & skyline viewpoints — ${dest}`,
  (dest) => `Riverfront walks & landmark bridges — ${dest}`,
  (dest) => `Food halls, markets & supper clubs — ${dest}`,
  (dest) => `Theatre district or live show evening — ${dest}`,
  (dest) => `Parklands, palaces & garden calm — ${dest}`,
  (dest) => `Neighbourhood hop: boutiques & bakeries — ${dest}`,
  (dest) => `Cabinet-of-curiosities museum pace — ${dest}`,
  (dest) => `Street-art alleys & design quarters — ${dest}`,
  (dest) => `Cathedral climbs & skyline rewards — ${dest}`,
  (dest) => `Literary plaques & scholarly corners — ${dest}`,
  (dest) => `Pub heritage & craft taprooms — ${dest}`,
  (dest) => `Sunrise jog or quiet riverfront miles — ${dest}`,
  (dest) => `Iconic ticketing day — queues planned early — ${dest}`,
  (dest) => `Vintage markets & antiques crawl — ${dest}`,
];

/** Pick title decks so inland/city trips avoid “harbour/beach/island” phrasing unless the place fits. */
function middleDayTitleBuildersForDestination(dest, pkgTitle) {
  const dl = `${dest} ${pkgTitle}`.toLowerCase();
  const coastalHints =
    /\b(island|atoll|lagoon|coral|reef|surf|beach|bali|phuket|krabi|phi|phi phi|maldives|mauritius|seychelles|gili| lombok|sicily|crete|coast|cape\s+town|mykonos|santorini|gold\s+coast|bondi|honolulu|cancun)\b/;
  const cityHints =
    /\b(london|paris|rome|tokyo|new\s+york|nyc|dubai|berlin|barcelona|madrid|vienna|istanbul|hong\s+kong|singapore|copenhagen|edinburgh|dublin|mumbai|delhi|budapest)\b/;
  let core = [...MIDDLE_TITLE_INTRACOAST_MERGED];
  if (coastalHints.test(dl)) core = [...core, ...MIDDLE_TITLE_COASTAL];
  else if (cityHints.test(dl)) core = [...MIDDLE_TITLE_CITY_MAJOR, ...core];
  return core;
}

function reserveUniqueMiddleTitle(dayIndex, dest, pkgTitle, totalDays, focusSnippet, usedTitleNorm) {
  const h = simpleHashItinerary(`${pkgTitle}|${dest}|${totalDays}|mid`);
  const builders = middleDayTitleBuildersForDestination(dest, pkgTitle);
  if (focusSnippet && focusSnippet.length >= 8 && focusSnippet.length <= 52) {
    const focused = `${focusSnippet} spotlight — ${dest}`;
    const k = titleKeyLine(focused);
    if (!usedTitleNorm.has(k)) {
      usedTitleNorm.add(k);
      return `Day ${dayIndex} · ${focused}`;
    }
  }

  let idx = (h + dayIndex * 31) % builders.length;
  for (let tries = 0; tries < builders.length; tries += 1) {
    const line = builders[idx](dest);
    const nk = titleKeyLine(line);
    if (!usedTitleNorm.has(nk)) {
      usedTitleNorm.add(nk);
      return `Day ${dayIndex} · ${line}`;
    }
    idx = (idx + 1) % builders.length;
  }

  const fallback = `Custom route ${dayIndex} around ${dest}`;
  usedTitleNorm.add(titleKeyLine(fallback));
  return `Day ${dayIndex} · ${fallback}`;
}

function buildTerminalDayTitles(dayIndex, totalDays, kind, dest, pkgTitle) {
  const h = simpleHashItinerary(`${pkgTitle}|${dest}|${totalDays}|${kind}`);
  if (kind === "first") {
    const opts = [
      `Arrival & mellow evening — ${dest}`,
      `Welcome to ${dest} — settle & soft explore`,
      `Touch down — first evening in ${dest}`,
    ];
    return `Day ${dayIndex} · ${opts[h % opts.length]}`;
  }
  const opts = [
    `Soft morning & onward journey — ${dest}`,
    `Farewell rituals & departure — ${dest}`,
    `Last breakfast & checkout — ${dest}`,
  ];
  return `Day ${dayIndex} · ${opts[(h + dayIndex * 3) % opts.length]}`;
}

function capitalizeSent(s) {
  const t = cleanSnippet(s, 200);
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function popUniqueBullets(queue, usedNorm, budget) {
  const out = [];
  while (queue.length && out.length < budget) {
    const raw = queue.shift();
    const line = capitalizeSent(raw);
    const k = line.toLowerCase();
    if (!line || usedNorm.has(k)) continue;
    usedNorm.add(k);
    out.push(line);
  }
  return out;
}

function takeFromFallbackBank(bank, bankCursor, usedNorm, budget) {
  const out = [];
  while (bankCursor.value < bank.length && out.length < budget) {
    const line = bank[bankCursor.value];
    bankCursor.value += 1;
    const k = line.toLowerCase();
    if (usedNorm.has(k)) continue;
    usedNorm.add(k);
    out.push(line);
  }
  return out;
}

/** Spread real package stops evenly across middle days so late days still get attractions. */
function splitPoolForTrip(queueItems, totalDays) {
  const items = [...queueItems];
  const middleCount = Math.max(totalDays - 2, 0);
  const buckets = Array.from({ length: middleCount }, () => []);
  let firstReserve = [];
  let lastReserve = [];

  if (totalDays <= 1) {
    return { firstReserve: items, buckets, lastReserve: [] };
  }

  if (middleCount === 0) {
    if (items.length) firstReserve.push(items.shift());
    if (items.length) lastReserve.push(items.pop());
    items.forEach((it, idx) => {
      if (idx % 2 === 0) firstReserve.push(it);
      else lastReserve.push(it);
    });
    return { firstReserve: uniqPreserveStrings(firstReserve), buckets, lastReserve: uniqPreserveStrings(lastReserve) };
  }

  if (items.length <= middleCount + 2) {
    items.forEach((it, idx) => {
      buckets[idx % middleCount].push(it);
    });
    return {
      firstReserve: [],
      buckets: buckets.map((b) => uniqPreserveStrings(b)),
      lastReserve: [],
    };
  }

  firstReserve.push(items.shift());
  if (totalDays >= 3 && items.length > 0) lastReserve.push(items.pop());

  items.forEach((it, idx) => {
    buckets[idx % middleCount].push(it);
  });

  return {
    firstReserve: uniqPreserveStrings(firstReserve),
    buckets: buckets.map((b) => uniqPreserveStrings(b)),
    lastReserve: uniqPreserveStrings(lastReserve),
  };
}

function pushUniquePoolStrings(target, usedNorm, rawArr, capLen = 24) {
  rawArr.slice(0, capLen).forEach((raw) => {
    const line = capitalizeSent(raw);
    const k = line.toLowerCase();
    if (!line || usedNorm.has(k)) return;
    usedNorm.add(k);
    target.push(line);
  });
}

/** Plan-shaped lines consumed before etiquette / micro-tip filler so middle days read like real itineraries. */
function purposefulPlanningLines(dest, packageType) {
  const f = typeFlavorPhrase(packageType);
  return uniqPreserveStrings([
    `Morning loop: clustered landmarks near ${dest} before heat.`,
    `Afternoon corridor: neighbourhoods you skipped on arrival day.`,
    `Beach or pool depth in the AM; inland culture block after lunch.`,
    `Half-day excursion radius, half-day loose for ${f}.`,
    `Sunrise outing, midday slowdown, sunset coastal return.`,
    `Ticketed highlights first; flexible eat-and stroll after.`,
    `Two-anchor rhythm: Landmark A calibrated early, Landmark B relaxed late.`,
    `Market-buy morning; chef-led tasting or long dinner payoff.`,
    `Water morning (boat, snorkel, swim); dry-ground storytelling afternoon.`,
    `Scenic driving string with viewpoints every 40–50 minutes.`,
    `Village introductions today; bigger icons can wait for tomorrow.`,
    `Icon sprint: timed entries bundled with shaded breaks.`,
    `Map-three-pins day — self-guided with optional guide assist.`,
    `Wellness layering: soak, massage window, stretches, herbal tea.`,
    `Evening-sector focus: lanterns, shoreline breeze, live music pockets.`,
    `Contrast routing: busiest strip versus quiet residential lanes.`,
    `Weekday pacing to dodge purely weekend-heavy venues.`,
    `Photography scouts midday; exposures at softer light windows.`,
    `Family cadence: shaded walks, playgrounds, hydration pit stops.`,
    `Active climb or canyon window with recovery dip after.`,
    `Harbour-energy morning; ridge-road or plateau afternoon.`,
    `Retail-and-gallery crawl exchanging coffee for culture.`,
    `Catch-up pass for bookmarks you saved earlier in ${dest}.`,
    `Laundry & bag reset so the second half of the trip stays light.`,
    `Self-guided wheels day with three agreed meet-up checkpoints.`,
  ]);
}

function isBaliLikePlace(dest, pkgTitle) {
  const t = `${dest} ${pkgTitle}`.toLowerCase();
  return /\bbali\b|\bubud\b|\buluwatu\b|\bcanggu\b|\bseminyak\b|\bsanur\b|\bkuta\b|\bjimbaran\b|\bnusa\s*penida\b|\bgili\b|\bdenpasar\b|\btanah\s*lot\b|\bbedugul\b/.test(t);
}

function ordinalEnglish(n) {
  const words = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "eleventh",
    "twelfth",
    "thirteenth",
    "fourteenth",
    "fifteenth",
    "sixteenth",
    "seventeenth",
    "eighteenth",
    "nineteenth",
    "twentieth",
  ];
  return n >= 1 && n <= words.length ? words[n - 1] : `${n}th`;
}

function uniqAddLine(text, bucket, used) {
  const t = cleanSnippet(text, 520);
  if (!t) return false;
  const k = t.toLowerCase();
  if (used.has(k)) return false;
  used.add(k);
  bucket.push(t);
  return true;
}

function pickPickupDropTimes(dayIndex, totalDays, seed) {
  const pickups = ["06:45 AM", "07:15 AM", "07:45 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:15 AM"];
  const drops = ["16:45", "17:15", "17:45", "18:00", "18:30", "19:00"];
  const pi = (seed + dayIndex * 17) % pickups.length;
  const di = (seed + dayIndex * 13) % drops.length;
  return { pu: pickups[pi], drop: drops[di] };
}

function joinChips(parts) {
  const u = uniqPreserveStrings(parts.map((p) => cleanSnippet(p, 80)).filter(Boolean));
  return u.slice(0, 9).join(" | ");
}

function visitDescriptor(stopName, dest) {
  const s = stopName.toLowerCase();
  if (/temple|pura|ulun/i.test(s))
    return `Balinese devotional architecture and lake or cliff backdrops—with respectful dress cues from your escort where needed.`;
  if (/forest|monkey/i.test(s)) return `A canopy-covered sanctuary stroll with guarded belongings and serene wildlife etiquette.`;
  if (/rice|terrace|tegallalang|jatiluwih/i.test(s))
    return `Layered emerald paddies and irrigation stories framed for leisurely photos along the ridges.`;
  if (/gold|silver|celuk|smith/i.test(s)) return `Bench-side glimpses of filigree waxwork, casting, and polished keepsakes worth comparing.`;
  if (/wood|carv|mas\s|sculpt/i.test(s)) return `Aromatic timber studios where chiselled forms range from miniature deities to statement panels.`;
  if (/batik|textile|weav|tohpati/i.test(s)) return `Pattern-dye demonstrations and heirloom fabrics you can unpack thread-by-thread with artisans.`;
  if (/spice|plantation|coffee|cocoa/i.test(s))
    return `A guided aromatic walk—coffee, cacao, cloves, vanilla—rounding out with tastings that linger on the palate.`;
  if (/village|kampung|^celuk|^mas|^ubud|^tohpati|^kintamani/i.test(s))
    return `Neighbourhood pace, maker conversations, and photo pauses calibrated to respectful distances.`;
  if (/volcano|batur|kintamani|caldera/i.test(s))
    return `Cool upland vistas across caldera rims and mirror lakes—with café stops angled for panorama light.`;
  if (/tanjung benoa|water\s*sport|parasail|jetski/i.test(s))
    return `Sheltered lagoon setups for tandem flights, donut rides, or jet skis—extras typically settled on-site.`;
  if (/uluwatu|cliff\s*temple/i.test(s))
    return `Marble pathways along limestone precipices crowned by spirited sunset skies and chanting traditions below.`;
  if (/tanah\s*lot/i.test(s)) return `Ocean-swept shrine silhouettes softened by tidal mist and lanterns as dusk gathers.`;
  if (/buyan|tamblingan|twin\s*lake|handara|wanagiri|hidden\s*hill|gate/i.test(s))
    return `Twin caldera moods, sculpted gates through highland mist, and lookouts perched over forested ridges.`;
  if (/benoa|harbour|sanur|fast\s*boat|nusa\s*penida|penida|angel|broken|kelingking|crystal\s*bay/i.test(s))
    return `Timed sea crossings, dramatic cliff overlooks, tidal pools, and snorkel-worthy coves—as swells safely allow.`;
  if (/beach|bay|coast/i.test(s)) return `Salt breeze, sheltered shallows for wading, and colour-rich reef glimpses offshore.`;
  if (/museum|gallery|historic|castle|palace|abbey|tower|bridge/i.test(s))
    return `Stories embedded in stonework plus curated pacing so each gallery or hall has breathing room.`;
  if (/market|bazaar/i.test(s)) return `Aisle-by-aisle tastings, souvenir scouting, and local pricing cues from your host.`;

  return `Curated narration, purposeful photo breaks, and timing that keeps crowds from rushing the rhythm around ${dest}.`;
}

/** Pick unique string from list (rotates seed); ensures not in usedTitles (lowercase compare). */
function pickUniqueHeading(candidates, dayIndex, seed, usedTitles) {
  const clean = uniqPreserveStrings(candidates.map((c) => cleanSnippet(String(c), 120)).filter(Boolean));
  let i = (seed + dayIndex * 43) % clean.length;
  for (let t = 0; t < clean.length; t += 1) {
    const cand = clean[i];
    const k = cand.toLowerCase();
    if (!usedTitles.has(k)) {
      usedTitles.add(k);
      return cand;
    }
    i = (i + 1) % clean.length;
  }
  const fallback = `Signature discovery arc ${dayIndex} — customised`;
  usedTitles.add(fallback.toLowerCase());
  return fallback;
}

/** Rich multi-segment itineraries: narrative paragraphs + timed checklist inspired by brochure tours. */
function buildRichItineraryDays(n, dest, pkgTitle, pool, packageType) {
  const usedTitles = new Set();
  const usedPara = new Set();
  const usedCheck = new Set();
  const seed = simpleHashItinerary(`${pkgTitle}|${dest}|${n}|rich`);
  const queueRaw = uniqPreserveStrings(pool.map((x) => cleanSnippet(x, 200)).filter(Boolean));
  const { firstReserve, buckets, lastReserve } = splitPoolForTrip(queueRaw, n);
  const bali = isBaliLikePlace(dest, pkgTitle);
  const out = [];

  const roleCycleBali = [
    "villages_terraces",
    "south_waters_cliff",
    "free_easy",
    "lakes_mountains",
    "temples_spirit",
    "island_boat",
  ];
  const roleCycleGen = ["culture_loop", "flavours_markets", "free_easy_gen", "nature_lens", "icon_day", "river_park"];

  const padBadge = (d) => `Day ${String(d).padStart(2, "0")} :`;

  /** Middle-day thematic key */
  function middleRoleFor(d) {
    const seq = bali ? roleCycleBali : roleCycleGen;
    return seq[(d - 2 + seed + Math.floor(seed / 7)) % seq.length];
  }

  /** Build arrival day */
  if (n >= 1) {
    const d = 1;
    const narratives = [];
    const checklist = [];

    let headlineCandidates;
    let p1Variants;
    let p2Variants;
    if (bali) {
      headlineCandidates = [
        `Arrival in Bali · Island of the Gods`,
        `Touchdown in Bali · Gateway to Culture & Sea`,
        `Welcome to Bali — First Evening Immersion`,
        `Bali Opens — Floral Welcomes & Gentle Breeze`,
        `Hello Bali · Temple Bells & Frangipani Air`,
      ];
      p1Variants = [
        `Welcome to Bali — affectionately crowned the Island of the Gods. After journeying in, loosen your shoulders while the tropics soften the skyline and friendly faces set the tempo.`,
        `Your Balinese chapters begin gently: incense on the breeze, gamelan hinted from far courtyards, and unhurried hospitality that turns check-in into ritual rather than paperwork.`,
      ];
      p2Variants = [
        `From baggage claim onward, savour small luxuries curated for weary travellers—a garland greeting when offered, chilled mineral water, and an escorted transfer that narrates neighbourhoods en route.`,
        `Ease into dusk with shoreline air, rooftop mocktails, or a quiet café wander; tomorrow’s adventures will deepen the mythology of this emerald island.`,
      ];
    } else {
      headlineCandidates = [
        `Arrival · ${dest} Welcomes You`,
        `First Light in ${dest} — Gentle Introduction`,
        `Touchdown · ${dest} Hospitality Unfolds`,
        `Gate Opens — Discover ${dest}`,
        `${dest} Awaits — Easy Arrival Rhythm`,
      ];
      p1Variants = [
        `Welcome to ${dest}. After transit, reclaim your breath as the skyline, sounds, and street rhythm orient you quicker than any map.`,
        `Your getaway opens with practical calm: concierge coordination, refreshments where provided, and time to decompress before bolder sightseeing.`,
      ];
      p2Variants = [
        `Let the concierge or driver flag photo-worthy corners nearby—sunset vantage, riverside plaza, heritage lane—whatever fits your stamina tonight.`,
        `Keep luggage light-handed; hydrate, freshen up, then choose between an early supper circuit or restorative sleep ahead of fuller days.`,
      ];
    }

    const headline = pickUniqueHeading(headlineCandidates, d, seed, usedTitles);
    uniqAddLine(p1Variants[(seed + d * 5) % p1Variants.length], narratives, usedPara);
    uniqAddLine(p2Variants[(seed + d * 11) % p2Variants.length], narratives, usedPara);

    const chipBits = uniqPreserveStrings([...firstReserve, dest].map((x) => cleanSnippet(x, 72)).filter(Boolean));
    const chips = joinChips(chipBits.slice(0, 6));

    const arrivalLinesBali = [
      `Warm meet & greet at the airport`,
      `Fragrant floral garland welcome (where included)`,
      `Chilled bottled water on arrival`,
      `Private vehicle transfer toward your resort`,
      `Assisted hotel check-in with luggage handling`,
      `Leisure evening — sunset walk, spa menu, or early rest`,
    ];
    const arrivalLinesGen = [
      `Arrival coordination with your transfer team`,
      `Welcome refreshment tray or lounge access (if included)`,
      `Comfortable ride with introduction to central ${dest}`,
      `Hotel check-in assisted with baggage support`,
      `Neighbourhood orientation map & dining ideas shared`,
      `Unscripted evening — stroll, supper, or slow reset`,
    ];
    const arrBank = bali ? arrivalLinesBali : arrivalLinesGen;
    arrBank.forEach((line, idx) => {
      const variant = `${line} — Day ${d} segment ${idx + 1}`;
      uniqAddLine(variant, checklist, usedCheck);
    });

    out.push({
      dayIndex: d,
      badge: padBadge(d),
      headline,
      title: `Day ${d} · ${headline}`,
      chips,
      narratives,
      checklist,
    });
  }

  /** Middle days */
  for (let d = 2; d <= Math.max(n - 1, 1); d += 1) {
    const bucket = buckets[d - 2] || [];
    const role = middleRoleFor(d);
    const ord = ordinalEnglish(d);
    const { pu, drop } = pickPickupDropTimes(d, n, seed);
    const narratives = [];
    const checklist = [];

    const chips = joinChips(bucket.length ? bucket : [dest, `${dest} highlight route`]);

    let headlineCandidates;
    let narrA;
    let narrB;

    if (bali) {
      if (role === "villages_terraces") {
        headlineCandidates = [
          `East Bali Artisan & Terrace Circuit`,
          `Craft Villages, Spices & Rice Sculptures`,
          `Village Ateliers & Emerald Contours`,
        ];
        narrA = `The ${ord} full day leans into Bali’s hands and hills—batik presses, jewellery benches, aromatic gardens, then layered rice shelves that ripple like folded silk under the sun.`;
        narrB = `We thread narrow studio lanes before climbing to breezy ridges; every stop keeps craft stories legible without crowding artisans or their tools.`;
      } else if (role === "south_waters_cliff") {
        headlineCandidates = [
          `South Bali · Watersports & Cliff Temple Glory`,
          `Reef Play & Marble Temple Sunsets`,
          `Adrenaline Lagoon Mornings · Kecak-Ready Evenings`,
        ];
        narrA = `Morning adrenaline hums across sheltered lagoons—parasail arcs, donut rides, or jet skis—then afternoon light drifts toward temple ledges perched over open ocean drama.`;
        narrB = `Expect salt on your skin by noon and golden-hour chants riding the cliff wind; pacing leaves margin for rinsing off and swapping footwear before sacred steps.`;
      } else if (role === "free_easy") {
        headlineCandidates = [
          `Free Day · Leisure Your Way`,
          `Unscheduled Bliss in Bali`,
          `Choose-Your-Own Island Tempo`,
        ];
        narrA = `Treat this ${ord} daylight as sovereign time: savour hotel breakfast slowly, chase a spontaneous cooking class, or float in the pool while staff curate optional add-ons.`;
        narrB = `Retail therapy, volcanic sand walks, or quiet reading corners are all fair—our desk can map driver-on-call timing if you crave a spontaneous temple hop.`;
      } else if (role === "lakes_mountains") {
        headlineCandidates = [
          `Lake Country & Highland Gate Icons`,
          `Misty Crater Lakes & Scenic Portals`,
          `Bedugul Breezes · Temples Above the Water`,
        ];
        narrA = `Cooler altitudes unveil mirror lakes, shrine islands, and sculpted gates punched through jungle mist—ideal for unrushed shutters and reflective pauses.`;
        narrB = `We weave ridgelines with hydration breaks, mindful of altitude shifts, before spiralling back toward warmer coasts for supper.`;
      } else if (role === "temples_spirit") {
        headlineCandidates = [
          `Bali’s Iconic Temple Trail`,
          `Sanctuary Jungles & Ocean Shrines`,
          `Spirit Routes — Forest to Sea`,
        ];
        narrA = `This ${ord} odyssey contrasts humid monkey canopies with sea-spray shrines—each entrance timed to beat peak heat and souvenir stall swells.`;
        narrB = `Your guide decodes ceremonial dress and photography etiquette so respect stays as sharp as your wide-angle captures.`;
      } else {
        headlineCandidates = [
          `Island Hop & Hidden Coves`,
          `Sea Crossings · Karst Drama & Tide Pools`,
          `Offshore Odyssey with Timed Returns`,
        ];
        narrA = `Fast ferries skim turquoise channels toward cliff-sculpted bays, tidal windows, and snorkel corridors where turtles might cruise your peripheral vision.`;
        narrB = `Waves dictate stairs and reef entries; dry bags, reef-safe SPF, and nimble footwear keep the voyage polished from pier to pier.`;
      }
    } else {
      if (role === "culture_loop") {
        headlineCandidates = [
          `City Culture & Landmark Loop`,
          `Museums, Plazas & Living History`,
          `Urban Storytelling Day — ${dest}`,
        ];
        narrA = `The ${ord} chapter explores ${dest} through curated corridors—grand façades, curated galleries, and neighbourhood pockets where locals actually queue for pastries.`;
        narrB = `We balance ticketed interiors with alfresco café pauses so kids, photographers, and foodies stay equally engaged.`;
      } else if (role === "flavours_markets") {
        headlineCandidates = [
          `Market Mornings & Supper Rituals`,
          `Tasting Tables — ${dest} Edition`,
          `Gastro Walk + Chef’s Table Option`,
        ];
        narrA = `Morning stalls roll out spice pyramids while evening reservations capture chef narratives—today is equal parts aroma and anecdote across ${dest}.`;
        narrB = `Bring curiosity and comfortable shoes; dietary notes travel ahead so substitutes feel generous, not apologetic.`;
      } else if (role === "free_easy_gen") {
        headlineCandidates = [
          `Flexible Leisure · ${dest}`,
          `Choose-Your-Adventure Reset`,
          `DIY Excursions & Spa Windows`,
        ];
        narrA = `No fixed convoy today—linger over brunch, chase a cycling map, or request a bespoke driver quote for spur-of-the-moment museums.`;
        narrB = `Concierge desks stand by with three “if you feel like it” itineraries covering different energy levels.`;
      } else if (role === "nature_lens") {
        headlineCandidates = [
          `Nature & Viewpoint Safari`,
          `Ridges, Gardens & Skyline Vistas`,
          `Green Lung Immersion Near ${dest}`,
        ];
        narrA = `Forested trails, botanical glasshouses, or urban parks provide oxygen between museum-heavy days—cameras welcome, hiking layers optional.`;
        narrB = `Route difficulty stays moderate; bottled water and sun barriers are rotated like clockwork.`;
      } else if (role === "icon_day") {
        headlineCandidates = [
          `Bucket-List Icons — ${dest}`,
          `Signature Ticketing & Photo Windows`,
          `Marquee Stops Without the Rush`,
        ];
        narrA = `Timed entries, fast-track cues, and strategic lunch breaks prevent iconic ${dest} sights from feeling like a queue exercise.`;
        narrB = `Evening optionally layers theatre, skyline bars, or river cruises depending on stamina.`;
      } else {
        headlineCandidates = [
          `Riverfront & Old Quarter Drift`,
          `Waterways, Bridges & Cobble Calm`,
          `Slow Path Along ${dest}’s Liquid Spine`,
        ];
        narrA = `Follow promenades, crossing historic bridges, ducking into archives or micro-galleries en route—ideal for reflective travellers.`;
        narrB = `Boat hops or bike shares can swap in if weather smiles; rain plans pivot to covered arcades.`;
      }
    }

    const headline = pickUniqueHeading(headlineCandidates, d, seed + d * 19, usedTitles);
    uniqAddLine(narrA, narratives, usedPara);
    uniqAddLine(narrB, narratives, usedPara);
    if (narratives.length < 2) {
      uniqAddLine(
        `Day ${d} cadence (${dest}, ${ord} rhythm): hydrate between chapters, heed shade breaks, and let your coordinator flex sequence if traffic pulses shift.`,
        narratives,
        usedPara
      );
    }

    uniqAddLine(`${pu} — Hotel pick-up with driver briefing and bottled water aboard.`, checklist, usedCheck);

    const stops = bucket.length ? bucket.slice(0, 5) : [`${dest} landmark circuit`, `Signature viewpoint`, `Local lunch enclave`];
    stops.forEach((stop, idx) => {
      const nm = capitalizeSent(stop);
      const body = visitDescriptor(stop, dest);
      const line = `Visit ${nm}: ${body}${idx === stops.length - 1 ? "" : ""}`;
      uniqAddLine(line, checklist, usedCheck);
    });

    if (role.includes("free")) {
      uniqAddLine(`Optional À la carte add-ons: cooking lab, photography guide, or extended spa block (book on demand).`, checklist, usedCheck);
      uniqAddLine(`Concierge follow-up with tomorrow’s weather snapshot & outfit suggestions.`, checklist, usedCheck);
    } else {
      uniqAddLine(`Afternoon flexibility: bonus viewpoint, tasting flight, or boutique pause when traffic cooperates.`, checklist, usedCheck);
    }

    uniqAddLine(`${drop} — Return to hotel with drop-off assistance and next-day reminder pack.`, checklist, usedCheck);

    out.push({
      dayIndex: d,
      badge: padBadge(d),
      headline,
      title: `Day ${d} · ${headline}`,
      chips,
      narratives,
      checklist,
    });
  }

  /** Last day / departure */
  if (n >= 2) {
    const d = n;
    const narratives = [];
    const checklist = [];

    const headlineCandidates = bali
      ? [
          `End of Journey — Bali Farewell`,
          `Departure Day · Until the Island Calls Again`,
          `Final Morning & Airport Escort`,
          `Goodbye Bali — Seamless Transfer Out`,
        ]
      : [
          `End of Trip — ${dest} Send-Off`,
          `Departure Morning · Homeward Bound`,
          `Final Chapter in ${dest}`,
          `Checkout & Airport Coordination`,
        ];

    const headline = pickUniqueHeading(headlineCandidates, d, seed + 401 + d * 3, usedTitles);

    const p1 = bali
      ? `As the ${ordinalEnglish(d)} morning breaks, trade flip-flops for boarding passes with gratitude—${dest}’s temples, softened light, and ocean rumble now live in memory as much as megapixels.`
      : `The ${ordinalEnglish(d)} dawn in ${dest} leans practical: final espresso, deliberate packing, and the quiet satisfaction of a route fully inhabited.`;

    const p2 = bali
      ? `Ease through breakfast buffers, boutique sweeps if you wish, then assisted checkout and a private airport run timed to honour carrier check-in and immigration buffers.`
      : `Savour an unrushed brunch, tidy last errands on foot, then escorted departure toward your onward terminal—with porter cues if your suitcases multiplied souvenirs.`;

    uniqAddLine(p1, narratives, usedPara);
    uniqAddLine(p2, narratives, usedPara);

    const chips = joinChips([...lastReserve, bali ? "DPS airport timing" : `${dest} airport / station`]);

    uniqAddLine(
      `${bali ? "Late-morning / noon" : "Midday"} checkout window — suitcases rallied, minibars audited, invoices sealed without rush.`,
      checklist,
      usedCheck
    );
    uniqAddLine(
      `Dedicated transfer pacing toward your onward hub (buffer ~2–3 hours pre-flight internationally, adjust for domestic hops).`,
      checklist,
      usedCheck
    );
    uniqAddLine(`Assistance with luggage tags, porter coordination, and lounge access if your fare includes it.`, checklist, usedCheck);
    uniqAddLine(`Optional last-minute duty-free list or digital boarding pass check before curbside goodbye.`, checklist, usedCheck);

    out.push({
      dayIndex: d,
      badge: padBadge(d),
      headline,
      title: `Day ${d} · ${headline}`,
      chips,
      narratives,
      checklist,
    });
  }

  /** Single-day compression */
  if (n === 1) {
    const single = out[0];
    const bank = buildUniqueFallbackBulletBank(dest, packageType);
    const uniqCheck = new Set(single.checklist.map((x) => x.toLowerCase()));
    const bc = { value: 0 };
    while (single.checklist.length < 8 && bc.value < bank.length) {
      const need = Math.min(3, 9 - single.checklist.length);
      const batch = takeFromFallbackBank(bank, bc, uniqCheck, need);
      batch.forEach((ln) => {
        const k = ln.toLowerCase();
        if (uniqCheck.has(k)) return;
        uniqCheck.add(k);
        single.checklist.push(ln);
      });
    }
    pool.slice(0, 6).forEach((raw) => {
      const line = `Featured waypoint — ${capitalizeSent(raw)}: ${visitDescriptor(raw, dest)}`;
      uniqAddLine(line, single.checklist, usedCheck);
    });
  }

  return out.slice(0, n);
}

function buildDynamicItineraryDaysFromContext(ctx) {
  const dest = pickFirstText(ctx.destination, "your destination");
  const pkgTitle = pickFirstText(ctx.packageTitle, "Your trip");
  const packageType = ctx.packageType || "";
  const n = clampItineraryDays(ctx.numDays);

  const pool = buildExperiencePool(ctx);
  return buildRichItineraryDays(n, dest, pkgTitle, pool, packageType);
}

function renderPackageItineraryHtml(dayBlocks) {
  const sections = dayBlocks.map((day, idx) => {
    const badge =
      day.badge || `Day ${String(day.dayIndex != null ? day.dayIndex : 1).padStart(2, "0")} :`;
    const head = day.headline || (day.title || "").replace(/^Day\s*\d+\s*·\s*/i, "").trim() || "Highlights";

    const chipsBlock = day.chips
      ? `<p class="itinerary-rich-chips">${escapeHtmlItinerary(day.chips)}</p>`
      : "";

    const narrBlock = Array.isArray(day.narratives)
      ? day.narratives.map((p) => `<p class="itinerary-rich-para">${escapeHtmlItinerary(p)}</p>`).join("")
      : "";

    const listSource = Array.isArray(day.checklist)
      ? day.checklist
      : Array.isArray(day.bullets)
        ? day.bullets
        : [];

    const listBlock = listSource
      .map(
        (li) =>
          `<li class="itinerary-rich-check-item"><i class="fa-solid fa-circle-check itinerary-rich-check-icon" aria-hidden="true"></i><span>${escapeHtmlItinerary(li)}</span></li>`
      )
      .join("");

    const hid = typeof day.dayIndex === "number" ? day.dayIndex : 1;
    const panelId = `itinerary-day-panel-${idx}-${hid}`;

    return `<div class="itinerary-day-box">
  <button type="button" class="itinerary-day-box-toggle" aria-expanded="false" aria-controls="${panelId}">
    <span class="itinerary-day-box-badge">${escapeHtmlItinerary(badge)}</span>
    <span class="itinerary-day-box-title">${escapeHtmlItinerary(head)}</span>
    <span class="itinerary-day-box-chevron" aria-hidden="true"><i class="fa-solid fa-chevron-down itinerary-day-box-chevron-icon"></i></span>
  </button>
  <div id="${panelId}" class="itinerary-day-box-panel">
    <div class="itinerary-day-box-inner">
      ${chipsBlock}
      <div class="itinerary-rich-narr">${narrBlock}</div>
      <ul class="itinerary-rich-checklist">${listBlock}</ul>
    </div>
  </div>
</div>`;
  });
  return `<div class="package-itinerary-root package-itinerary-rich-root">${sections.join("")}</div>`;
}

/** Itinerary section uses CSS `max-height: none` when `.open`; clear any lingering inline px from other accordion logic. */
function refreshPackageItineraryAccordionHeight() {
  const mount = document.getElementById("packageItineraryContent");
  if (!mount?.classList.contains("open")) return;
  mount.style.maxHeight = null;
}

/** Collapsible day rows (orange badge + title + chevron). Delegated clicks; bind once per mount element. */
function setupItineraryDayBoxAccordion() {
  const root = document.getElementById("packageItineraryContent");
  if (!root || root.dataset.itineraryDayAccordionBound === "1") return;
  root.dataset.itineraryDayAccordionBound = "1";

  root.addEventListener("click", (event) => {
    const btn = event.target.closest(".itinerary-day-box-toggle");
    if (!btn || !root.contains(btn)) return;
    const row = btn.closest(".itinerary-day-box");
    const panel = row?.querySelector(".itinerary-day-box-panel");
    if (!row || !panel) return;

    const opens = !row.classList.contains("is-expanded");

    if (opens) {
      root.querySelectorAll(".itinerary-day-box.is-expanded").forEach((openRow) => {
        if (openRow === row) return;
        openRow.classList.remove("is-expanded");
        const ob = openRow.querySelector(".itinerary-day-box-toggle");
        ob?.setAttribute("aria-expanded", "false");
      });
    }

    row.classList.toggle("is-expanded", opens);
    btn.setAttribute("aria-expanded", String(opens));
    refreshPackageItineraryAccordionHeight();
  });

  let resizeTick = null;
  window.addEventListener("resize", () => {
    if (!document.body.contains(root)) return;
    window.clearTimeout(resizeTick);
    resizeTick = window.setTimeout(() => {
      refreshPackageItineraryAccordionHeight();
    }, 140);
  });
}

function buildItineraryMergeContext(initialCtx, detailParamsObj) {
  const fromQueryString = !!(detailParamsObj && String(detailParamsObj.toString()).trim());
  const title = pickFirstText(detailParamsObj.get?.("title"), initialCtx.title);
  const locationLine = pickFirstText(detailParamsObj.get?.("location"), initialCtx.fullLocation);
  const destination = locationLine.split(",")[0].trim() || initialCtx.destination;
  const daysText = pickFirstText(detailParamsObj.get?.("days"), initialCtx.daysText);
  const attractions = parseCommaListParam(detailParamsObj.get?.("places") || detailParamsObj.get?.("attractions"));
  const activities = parseCommaListParam(detailParamsObj.get?.("activities"));
  const packageType = pickFirstText(detailParamsObj.get?.("type"), "");

  const numDays = parseDurationDays(daysText);

  const highlightPool = fromQueryString ? [] : initialCtx.highlights.slice();
  const includedPool = fromQueryString ? [] : initialCtx.included.slice();

  return {
    packageTitle: title || "Trip",
    destination,
    numDays,
    packageType,
    attractions,
    activities,
    highlightPool,
    includedPool,
  };
}

function injectDynamicPackageItinerary(detailParamsObj, initialCtx) {
  const mount = document.getElementById("packageItineraryContent");
  if (!mount) return;
  const ctx = buildItineraryMergeContext(initialCtx, detailParamsObj);
  const days = buildDynamicItineraryDaysFromContext(ctx);
  mount.innerHTML = renderPackageItineraryHtml(days);
  setupItineraryDayBoxAccordion();
  refreshPackageItineraryAccordionHeight();
}

// Populate package details from selected package card state/path (clean URL).
const toPackageSlug = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "tripon-package";
const detailParams = new URLSearchParams(window.location.search);
const storedPackageRaw = sessionStorage.getItem("tripon_selected_package");
let storedPackage = null;
try {
  storedPackage = storedPackageRaw ? JSON.parse(storedPackageRaw) : null;
} catch (_error) {
  storedPackage = null;
}
const detailParamLike = {
  get(key) {
    const fromQuery = detailParams.get(key);
    if (fromQuery) return fromQuery;
    if (!storedPackage || typeof storedPackage !== "object") return "";
    return storedPackage[key] || "";
  },
  toString() {
    if (detailParams.toString()) return detailParams.toString();
    return storedPackage && typeof storedPackage === "object" ? "stored" : "";
  }
};
const initialPackagePageContext = readInitialPackagePageContext();

if (detailParamLike.toString()) {
  const title = detailParamLike.get("title");
  const locationText = detailParamLike.get("location");
  const ratingValue = detailParamLike.get("rating");
  const reviewsValue = detailParamLike.get("reviews");
  const daysText = detailParamLike.get("days");
  const packageType = detailParamLike.get("type");
  const priceText = detailParamLike.get("price");
  const imageUrl = detailParamLike.get("image");

  if (title) {
    const titleNode = document.querySelector(".title-section h1");
    if (titleNode) titleNode.textContent = title;
  }

  if (locationText) {
    const locationNode = document.querySelector(".top-bar .left-section .location span");
    if (locationNode) locationNode.textContent = locationText;
  }

  if (ratingValue || reviewsValue) {
    const ratingTextNode = document.querySelector("#ratingText");
    if (ratingTextNode) {
      const safeRating = ratingValue || "4.8";
      const safeReviews = reviewsValue || "136";
      ratingTextNode.textContent = `${safeRating} (${safeReviews})`;
    }
  }

  if (daysText) {
    const durationNode = document.querySelector(".info-item .info-value");
    if (durationNode) durationNode.textContent = daysText;
  }

  if (priceText) {
    const priceNode = document.querySelector(".booking-top .price-value");
    if (priceNode) priceNode.textContent = priceText;
  }

  const setGalleryImages = () => {
    const galleryNodes = Array.from(document.querySelectorAll(".image-grid .gallery-img"));
    const imageGrid = document.querySelector(".image-grid");
    if (!imageGrid) return;

    const resolvePkgImg = (src) => triponResolvePackageImageSrc(src);

    const sources = [];
    const detailImagesRaw = (detailParamLike.get("detailImages") || "").trim();

    if (detailImagesRaw) {
      detailImagesRaw
        .split(",")
        .map((piece) => piece.trim())
        .filter(Boolean)
        .forEach((piece) => {
          const resolved = resolvePkgImg(piece);
          if (resolved) {
            sources.push(resolved);
          }
        });
    } else {
      const primary = resolvePkgImg(imageUrl);
      if (primary) {
        sources.push(primary);
      }
      const extraRaw = (detailParamLike.get("gallery") || "").trim();
      if (extraRaw) {
        extraRaw.split(",").forEach((piece) => {
          const resolved = resolvePkgImg(piece.trim());
          if (resolved && !sources.includes(resolved)) {
            sources.push(resolved);
          }
        });
      }
    }

    const TRANSPARENT_PIXEL =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    galleryNodes.forEach((node, index) => {
      const nextSrc = sources[index] || "";
      const previewCard = node.closest(".side-image-preview-card");
      if (nextSrc) {
        node.classList.remove("gallery-img--empty");
        node.src = nextSrc;
        node.style.display = "";
        node.removeAttribute("hidden");
        if (previewCard) {
          previewCard.classList.remove("is-image-placeholder");
        }
      } else {
        node.classList.add("gallery-img--empty");
        node.src = TRANSPARENT_PIXEL;
        node.alt = "";
        node.style.display = "";
        node.removeAttribute("hidden");
        if (previewCard) {
          previewCard.classList.add("is-image-placeholder");
        }
      }
    });

    imageGrid.classList.remove("gallery-single", "gallery-empty");
    imageGrid.removeAttribute("hidden");
    updateImageGridDots(0);
  };

  setGalleryImages();

  const normalizedType = (packageType || "traveler").toLowerCase();
  const typeLabel =
    normalizedType === "couple"
      ? "couple"
      : normalizedType === "family"
        ? "family"
        : normalizedType === "friends"
          ? "friends"
          : "traveler";
  const typeNoun =
    typeLabel === "couple"
      ? "romantic moments"
      : typeLabel === "family"
        ? "family-friendly experiences"
        : typeLabel === "friends"
          ? "group adventures"
          : "memorable experiences";
  const dayNumber = (daysText || "").match(/\d+/)?.[0] || "5";
  const destination = (locationText || "Bali").split(",")[0].trim();
  const packageName = title || "Tripon Package";

  const overviewNode = document.querySelector(".left > p");
  if (overviewNode) {
    overviewNode.textContent = `${packageName} is designed for ${typeNoun} in ${destination}. This ${dayNumber}-day plan combines top sightseeing, local culture, and comfortable pacing so you can enjoy the destination without rush. Expect curated activities, smooth transfers, and enough leisure time to explore at your own style.`;
  }

  const highlightsList = document.querySelector(".left > ul");
  if (highlightsList) {
    const highlightItems = [
      `Handpicked experiences in and around ${destination}`,
      `${dayNumber}-day schedule balanced between activity and relaxation`,
      `Well-planned route suitable for ${typeLabel} travelers`,
      "Comfort-focused stays and local assistance throughout the trip",
      "Flexible time blocks for shopping, food, and photo spots"
    ];
    highlightsList.innerHTML = highlightItems.map((item) => `<li>${item}</li>`).join("");
  }

  const accordionPanels = document.querySelectorAll(".accordion-item .accordion-content");
  if (accordionPanels.length >= 5) {
    const includedItems = [
      "Accommodation as per itinerary",
      "Daily breakfast and selected meals",
      "Airport and local transfers",
      "Guided sightseeing and support team"
    ];
    accordionPanels[0].innerHTML = `<ul>${includedItems.map((item) => `<li>${item}</li>`).join("")}</ul>`;
    accordionPanels[2].innerHTML = "<p>Available throughout the year. Peak dates may fill fast, so advance booking is recommended.</p>";
    accordionPanels[4].innerHTML = `<p>Travelers choosing ${packageName} frequently appreciate the balance of comfort, sightseeing, and seamless coordination from the Tripon team.</p>`;
  }
  window.history.replaceState({}, "", "/packages/package-details.html");
}

injectDynamicPackageItinerary(detailParamLike, initialPackagePageContext);

// select location box
const locationBox = document.querySelector('.location');
const locationDropdownWrapper = document.querySelector('.location-dropdown-wrapper');
const locationPill = locationDropdownWrapper?.querySelector('.location-pill');
const locationDropdownMenu = locationDropdownWrapper?.querySelector('.location-dropdown');
const homeMobileMenuToggle = document.querySelector("#homeMobileMenuToggle");
const homeMobileMenuOverlay = document.querySelector("#homeMobileMenuOverlay");
const homeMobileDrawerClose = document.querySelector("#homeMobileDrawerClose");
const homeMobileDrawerLinks = Array.from(document.querySelectorAll(".home-mobile-drawer-nav a"));
const homeMobileLocationToggle = document.querySelector("#homeMobileLocationToggle");
const homeMobileLocationList = document.querySelector("#homeMobileLocationList");
const homeMobileLocationIcon = homeMobileLocationToggle?.querySelector(".home-mobile-location-icon");

// Legacy dropdown in old navbar.
locationBox?.addEventListener('click', (e) => {
  e.stopPropagation();
  locationBox.classList.toggle('active');
});

locationPill?.addEventListener("click", (event) => {
  event.stopPropagation();
  locationDropdownWrapper.classList.toggle("active");
  locationDropdownMenu?.classList.toggle("active");
  const isOpen = locationDropdownWrapper.classList.toggle("is-open");
  locationPill.setAttribute("aria-expanded", String(isOpen));
});

locationDropdownMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const displayName = link.textContent.trim();
    locationPill.textContent = `${displayName} `;
    const chevron = document.createElement("i");
    chevron.className = "fa-solid fa-chevron-down location-chevron";
    chevron.setAttribute("aria-hidden", "true");
    locationPill.appendChild(chevron);
    locationDropdownWrapper?.classList.remove("active");
    locationDropdownMenu?.classList.remove("active");
    locationDropdownWrapper?.classList.remove("is-open");
    locationPill?.setAttribute("aria-expanded", "false");
  });
});

const closeHomeMobileDrawer = () => {
  if (!homeMobileMenuOverlay) return;
  homeMobileMenuOverlay.classList.remove("active");
  homeMobileMenuOverlay.setAttribute("aria-hidden", "true");
  homeMobileMenuToggle?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
};

homeMobileMenuToggle?.addEventListener("click", () => {
  const isOpen = homeMobileMenuOverlay?.classList.contains("active");
  if (isOpen) {
    closeHomeMobileDrawer();
    return;
  }
  if (!homeMobileMenuOverlay) return;
  homeMobileMenuOverlay.classList.add("active");
  homeMobileMenuOverlay.setAttribute("aria-hidden", "false");
  homeMobileMenuToggle.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
});

homeMobileDrawerClose?.addEventListener("click", closeHomeMobileDrawer);
homeMobileDrawerLinks.forEach((link) => {
  link.addEventListener("click", closeHomeMobileDrawer);
});

homeMobileMenuOverlay?.addEventListener("click", (event) => {
  if (event.target === homeMobileMenuOverlay) {
    closeHomeMobileDrawer();
  }
});

homeMobileLocationToggle?.addEventListener("click", () => {
  const isOpen = homeMobileLocationList?.classList.contains("active");
  homeMobileLocationList?.classList.toggle("active", !isOpen);
  homeMobileLocationToggle.setAttribute("aria-expanded", String(!isOpen));
  if (homeMobileLocationIcon) {
    homeMobileLocationIcon.textContent = isOpen ? "+" : "−";
  }
});

// close dropdown when clicking outside
document.addEventListener('click', () => {
  locationBox?.classList.remove('active');
  locationDropdownWrapper?.classList.remove("active");
  locationDropdownMenu?.classList.remove("active");
  locationDropdownWrapper?.classList.remove("is-open");
  locationPill?.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeHomeMobileDrawer();
    if (lightbox?.style.display === "flex") {
      closeLightbox();
    }
  }
});

// Open lightbox
function updateLightboxView() {
  const galleryList = getActiveGalleryImages();
  if (!galleryList.length || !lightboxImg) return;
  currentIndex = Math.min(currentIndex, galleryList.length - 1);
  lightboxImg.classList.remove("is-zoomed-out");
  lightboxImg.src = galleryList[currentIndex].src;
  if (lightboxCount) {
    lightboxCount.textContent = `${currentIndex + 1} / ${galleryList.length}`;
  }
  updateImageGridDots(currentIndex);
}


function setProgress(value) {
  if (!lightboxProgressFill) return;
  const boundedValue = Math.max(0, Math.min(100, value));
  lightboxProgressFill.style.width = `${boundedValue}%`;
}

function showFullscreenHint() {
  if (!lightboxFullscreenHint) return;
  lightboxFullscreenHint.classList.add("show");
  if (fullscreenHintTimeout) {
    window.clearTimeout(fullscreenHintTimeout);
  }
  fullscreenHintTimeout = window.setTimeout(() => {
    lightboxFullscreenHint.classList.remove("show");
  }, 2300);
}

function hideFullscreenHint() {
  if (!lightboxFullscreenHint) return;
  lightboxFullscreenHint.classList.remove("show");
  if (fullscreenHintTimeout) {
    window.clearTimeout(fullscreenHintTimeout);
    fullscreenHintTimeout = null;
  }
}

function lockPageForGalleryLightbox() {
  document.body.classList.add("gallery-lightbox-open");
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function unlockPageForGalleryLightbox() {
  document.body.classList.remove("gallery-lightbox-open");
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.style.display = "none";
  unlockPageForGalleryLightbox();
  stopSlideshow(true);
  hideFullscreenHint();
}

function setSlideshowButtonState(isPlaying) {
  if (!lightboxPlayBtn) return;
  lightboxPlayBtn.innerHTML = isPlaying ? "&#10074;&#10074;" : "&#9658;";
  lightboxPlayBtn.setAttribute("aria-label", isPlaying ? "Pause slideshow" : "Start slideshow");
}

function setPlayButtonVisibility(shouldShow) {
  if (!lightboxPlayBtn) return;
  lightboxPlayBtn.style.display = shouldShow ? "inline-flex" : "none";
  if (!shouldShow) {
    stopSlideshow(true);
  }
}

function stopSlideshow(resetProgress = true) {
  isSlideshowPlaying = false;
  if (slideshowFrameId) {
    window.cancelAnimationFrame(slideshowFrameId);
    slideshowFrameId = null;
  }
  setSlideshowButtonState(false);
  if (resetProgress) setProgress(0);
}

function runSlideshowProgress(timestamp) {
  if (!isSlideshowPlaying) return;
  if (!slideshowStartTime) slideshowStartTime = timestamp;
  const elapsed = timestamp - slideshowStartTime;
  const percentage = (elapsed / slideDurationMs) * 100;
  setProgress(percentage);

  if (elapsed >= slideDurationMs) {
    setProgress(100);
    const galleryList = getActiveGalleryImages();
    if (currentIndex >= galleryList.length - 1) {
      stopSlideshow(false);
      return;
    }
    currentIndex += 1;
    updateLightboxView();
    slideshowStartTime = 0;
    setProgress(0);
  }

  slideshowFrameId = window.requestAnimationFrame(runSlideshowProgress);
}

function startSlideshow() {
  if (getActiveGalleryImages().length <= 1) return;
  currentIndex = 0;
  updateLightboxView();
  isSlideshowPlaying = true;
  setSlideshowButtonState(true);
  slideshowStartTime = 0;
  setProgress(0);
  if (slideshowFrameId) window.cancelAnimationFrame(slideshowFrameId);
  slideshowFrameId = window.requestAnimationFrame(runSlideshowProgress);
}

document.querySelector(".image-grid")?.addEventListener("click", (event) => {
  const img = event.target.closest(".gallery-img");
  if (!img || img.classList.contains("gallery-img--empty")) return;
  const galleryList = getActiveGalleryImages();
  const index = galleryList.indexOf(img);
  if (index < 0 || !lightbox) return;
  lightbox.style.display = "flex";
  lockPageForGalleryLightbox();
  currentIndex = index;
  updateLightboxView();
  stopSlideshow(true);
  setPlayButtonVisibility(index === galleryList.length - 1);
  showFullscreenHint();
});

const lightboxCloseEl = document.querySelector(".close");
const lightboxNextEl = document.querySelector(".next");
const lightboxPrevEl = document.querySelector(".prev");
if (lightboxCloseEl) {
  lightboxCloseEl.onclick = () => closeLightbox();
}
if (lightboxNextEl) {
  lightboxNextEl.onclick = () => {
    const galleryList = getActiveGalleryImages();
    if (!galleryList.length) return;
    currentIndex = (currentIndex + 1) % galleryList.length;
    updateLightboxView();
    if (isSlideshowPlaying) startSlideshow();
  };
}
if (lightboxPrevEl) {
  lightboxPrevEl.onclick = () => {
    const galleryList = getActiveGalleryImages();
    if (!galleryList.length) return;
    currentIndex = (currentIndex - 1 + galleryList.length) % galleryList.length;
    updateLightboxView();
    if (isSlideshowPlaying) startSlideshow();
  };
}

lightboxPlayBtn?.addEventListener("click", () => {
  if (isSlideshowPlaying) {
    stopSlideshow(false);
    return;
  }
  startSlideshow();
});



// ================== ACCORDION ==================
const headers = document.querySelectorAll(".accordion-header");

headers.forEach((header) => {
  header.addEventListener("click", () => {
    const content = header.nextElementSibling;
    header.classList.toggle("active");

    const isSectionOpen = content.classList.contains("open");
    if (isSectionOpen) {
      content.style.maxHeight = null;
      content.classList.remove("open");
      return;
    }

    if (content.id === "packageItineraryContent") {
      content.style.maxHeight = null;
      content.classList.add("open");
      refreshPackageItineraryAccordionHeight();
    } else if (content.id === "packageDetailFaqContent") {
      content.style.maxHeight = null;
      content.classList.add("open");
    } else {
      content.style.maxHeight = `${content.scrollHeight}px`;
      content.classList.add("open");
    }
  });
});

// ================== RELATED PACKAGES CAROUSEL ==================
const relatedTrack = document.querySelector(".pd-related-track");
const relatedPrev = document.querySelector(".pd-related-prev");
const relatedNext = document.querySelector(".pd-related-next");
const relatedCards = Array.from(document.querySelectorAll(".pd-related-card"));

if (relatedTrack && relatedPrev && relatedNext) {
  const slideAmount = () => Math.max(relatedTrack.clientWidth * 0.85, 260);

  relatedPrev.addEventListener("click", () => {
    relatedTrack.scrollBy({ left: -slideAmount(), behavior: "smooth" });
  });

  relatedNext.addEventListener("click", () => {
    relatedTrack.scrollBy({ left: slideAmount(), behavior: "smooth" });
  });
}

if (relatedCards.length) {
  relatedCards.forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const title = card.querySelector("h4")?.textContent?.trim() || "";
      const locationText = card.querySelector(".pd-related-location")?.textContent?.replace(/\s+/g, " ").trim() || "";
      const ratingRaw = card.querySelector(".pd-related-rating span")?.textContent?.trim() || "";
      const ratingMatch = ratingRaw.match(/(\d+(\.\d+)?)/);
      const reviewsMatch = ratingRaw.match(/\((\d+)\)/);
      const daysText = card.querySelector(".pd-related-meta span:first-child")?.textContent?.replace(/\s+/g, " ").trim() || "";
      const priceText = card.querySelector(".pd-related-meta span:last-child")?.textContent?.replace(/^From\s*/i, "").trim() || "";
      const imageSrc = card.querySelector("img")?.getAttribute("src") || "";
      const packageType = card.getAttribute("data-type") || "traveler";

      const imageUrl = imageSrc ? triponResolvePackageImageSrc(imageSrc) : "";
      const packageGallery = (card.getAttribute("data-package-gallery") || "").trim();
      const packageDetailImages = (card.getAttribute("data-package-detail-images") || "").trim();
      const payload = {
        title,
        location: locationText,
        rating: ratingMatch?.[1] || "",
        reviews: reviewsMatch?.[1] || "",
        days: daysText,
        price: priceText,
        type: packageType,
        image: imageUrl,
        gallery: packageGallery,
        detailImages: packageDetailImages
      };
      const slug = toPackageSlug(title);
      sessionStorage.setItem("tripon_selected_package", JSON.stringify(payload));
      sessionStorage.setItem("tripon_selected_package_slug", slug);
      window.location.href = "/packages/package-details.html";
    });
  });

  /* Hover carousel for related strip cards that define data-package-hover-images (Paris / Arizona trio). */
  const pdHoverOk =
    window.matchMedia("(hover: hover)").matches || !window.matchMedia("(pointer: coarse)").matches;
  if (pdHoverOk) {
    const preloadPdImg = ((cache) => (srcRaw) => {
      const resolved = String(srcRaw || "").trim();
      if (!resolved) return Promise.resolve(false);
      try {
        const url = triponResolvePackageImageSrc(resolved);
        if (cache.has(url)) return cache.get(url);
        const p = new Promise((resolve) => {
          const im = new Image();
          im.onload = () => resolve(true);
          im.onerror = () => resolve(false);
          im.src = url;
        });
        cache.set(url, p);
        return p;
      } catch (_e) {
        return Promise.resolve(false);
      }
    })(new Map());

    relatedCards.forEach((card) => {
      const raw = (card.getAttribute("data-package-hover-images") || "").trim();
      const hoverPool = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (hoverPool.length < 2) return;
      const imageNode = card.querySelector(":scope > img");
      if (!imageNode) return;
      imageNode.dataset.originalPdSrc = imageNode.getAttribute("src") || "";
      let hoverPdTimer = null;
      let hoverPdGen = 0;
      let hoverPdHi = 0;
      let hoverPdQueue = Promise.resolve();

      const clearPdHover = () => {
        if (hoverPdTimer != null) {
          window.clearInterval(hoverPdTimer);
          hoverPdTimer = null;
        }
      };

      hoverPool.forEach((s) => void preloadPdImg(s));

      card.addEventListener("mouseenter", () => {
        clearPdHover();
        hoverPdGen += 1;
        const gen = hoverPdGen;
        hoverPdHi = 0;
        hoverPdQueue = Promise.resolve();

        const enqueue = () => {
          if (gen !== hoverPdGen) return;
          hoverPdQueue = hoverPdQueue
            .then(async () => {
              if (gen !== hoverPdGen) return;
              const src = hoverPool[hoverPdHi % hoverPool.length];
              const ok = await preloadPdImg(src);
              if (gen !== hoverPdGen) return;
              if (!ok) {
                hoverPdHi = (hoverPdHi + 1) % hoverPool.length;
                return;
              }
              imageNode.src = triponResolvePackageImageSrc(src);
              hoverPdHi = (hoverPdHi + 1) % hoverPool.length;
            })
            .catch(() => {});
        };

        enqueue();
        hoverPdTimer = window.setInterval(enqueue, 2400);
      });

      card.addEventListener("mouseleave", () => {
        hoverPdGen += 1;
        hoverPdQueue = Promise.resolve();
        clearPdHover();
        hoverPdHi = 0;
        const back = imageNode.dataset.originalPdSrc || "";
        if (back) imageNode.setAttribute("src", back);
      });
    });
  }
}

// Package details — mobile/tablet: related cards advance in a loop (scroll left)
function initPackageDetailsRelatedCarouselLoop() {
  if (!document.body.classList.contains("package-details-page")) return;

  const section = document.querySelector(".pd-related");
  const track = document.querySelector(".pd-related-track");
  if (!section || !track) return;

  const carouselMq = window.matchMedia("(max-width: 768px)");
  const reduceMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  let autoplayTimer = null;
  let slideIndex = 0;
  let clonesReady = false;
  let isVisible = false;

  const getOriginalCards = () =>
    Array.from(track.querySelectorAll(".pd-related-card:not(.pd-related-card--clone)"));

  const removeClones = () => {
    track.querySelectorAll(".pd-related-card--clone").forEach((el) => el.remove());
    clonesReady = false;
    slideIndex = 0;
    track.scrollTo({ left: 0, behavior: "auto" });
  };

  const ensureClones = () => {
    if (clonesReady) return;
    const originals = getOriginalCards();
    originals.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add("pd-related-card--clone");
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      track.appendChild(clone);
    });
    clonesReady = originals.length > 0;
  };

  const getTrackWrap = () => track.parentElement;

  const getSlideStep = () => {
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 14;
    const first = track.querySelector(".pd-related-card:not(.pd-related-card--clone)");
    if (first && first.offsetWidth > 0) {
      return first.offsetWidth + gap;
    }
    const wrap = getTrackWrap();
    if (wrap && wrap.clientWidth > 0) {
      return wrap.clientWidth + gap;
    }
    return 0;
  };

  const scrollToSlide = (index, smooth) => {
    const step = getSlideStep();
    if (!step) return;
    track.scrollTo({
      left: index * step,
      behavior: smooth ? "smooth" : "auto"
    });
  };

  const advance = () => {
    const originals = getOriginalCards();
    const count = originals.length;
    if (count < 2) return;

    ensureClones();
    slideIndex += 1;

    if (slideIndex >= count) {
      scrollToSlide(count, true);
      window.setTimeout(() => {
        scrollToSlide(0, false);
        slideIndex = 0;
      }, 500);
      return;
    }

    scrollToSlide(slideIndex, true);
  };

  const stopAutoplay = () => {
    if (autoplayTimer != null) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const startAutoplay = (immediate = false) => {
    stopAutoplay();
    if (!carouselMq.matches || !isVisible || reduceMotionMq.matches) return;
    const originals = getOriginalCards();
    if (originals.length < 2) return;
    ensureClones();
    track.classList.add("pd-related-track--auto");
    if (immediate) advance();
    autoplayTimer = window.setInterval(advance, 3200);
  };

  const applyMediaMode = () => {
    if (!carouselMq.matches) {
      stopAutoplay();
      removeClones();
      track.classList.remove("pd-related-track--auto");
      return;
    }
    if (isVisible) startAutoplay(true);
  };

  track.addEventListener("click", (event) => {
    const cloneCard = event.target.closest(".pd-related-card--clone");
    if (!cloneCard) return;
    const clones = Array.from(track.querySelectorAll(".pd-related-card--clone"));
    const originals = getOriginalCards();
    const idx = clones.indexOf(cloneCard);
    if (idx >= 0 && originals[idx]) originals[idx].click();
  });

  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", () => startAutoplay());
  track.addEventListener("touchstart", stopAutoplay, { passive: true });
  track.addEventListener(
    "touchend",
    () => {
      window.setTimeout(() => startAutoplay(), 500);
    },
    { passive: true }
  );

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      isVisible = Boolean(entries[0]?.isIntersecting);
      if (isVisible && carouselMq.matches) {
        startAutoplay(true);
      } else {
        stopAutoplay();
      }
    },
    { threshold: 0.15 }
  );
  visibilityObserver.observe(section);

  if (typeof carouselMq.addEventListener === "function") {
    carouselMq.addEventListener("change", applyMediaMode);
  } else {
    carouselMq.addListener(applyMediaMode);
  }

  if (typeof reduceMotionMq.addEventListener === "function") {
    reduceMotionMq.addEventListener("change", applyMediaMode);
  } else {
    reduceMotionMq.addListener(applyMediaMode);
  }

  applyMediaMode();
}

initPackageDetailsRelatedCarouselLoop();

// Instagram showcase: continuous moving strip effect
const instaSections = document.querySelectorAll(".instagram-showcase");
if (instaSections.length) {
  instaSections.forEach((instaSection) => {
    const strip = instaSection.querySelector(".instagram-strip");
    if (!strip) return;

    strip.style.setProperty("display", "block", "important");
    strip.style.setProperty("overflow-x", "hidden", "important");
    strip.style.setProperty("overflow-y", "hidden", "important");
    strip.style.setProperty("scroll-snap-type", "none", "important");

    if (!strip.dataset.marqueeReady) {
      const originalImages = Array.from(strip.querySelectorAll("img"));
      const sourceItems = originalImages.map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.alt || "Instagram image"
      }));

      const track = document.createElement("div");
      track.className = "instagram-marquee-track";
      track.style.display = "flex";
      track.style.flexWrap = "nowrap";
      track.style.gap = "6px";
      track.style.width = "max-content";
      track.style.willChange = "transform";

      const appendImageSet = (isHiddenSet) => {
        sourceItems.forEach((item) => {
          const image = document.createElement("img");
          image.src = item.src;
          image.alt = item.alt;
          if (isHiddenSet) image.setAttribute("aria-hidden", "true");
          track.appendChild(image);
        });
      };

      appendImageSet(false);
      appendImageSet(true);
      strip.replaceChildren(track);
      strip.dataset.baseCount = String(sourceItems.length);
      strip.dataset.marqueeReady = "true";
    }

    const marqueeTrack = strip.querySelector(".instagram-marquee-track");
    if (!marqueeTrack) return;

    let animationId = null;
    let lastTimestamp = 0;
    let offsetX = 0;
    let loopWidth = 0;
    const pixelsPerSecond = 32;

    const ensureTrackCopies = () => {
      const baseCount = Number(strip.dataset.baseCount || "0");
      if (!baseCount) return;
      const allImages = Array.from(marqueeTrack.querySelectorAll("img"));
      const baseImages = allImages.slice(0, baseCount);
      const baseWidth =
        baseImages.reduce((acc, img) => acc + img.getBoundingClientRect().width, 0) +
        Math.max(0, baseImages.length - 1) * 6;
      if (!baseWidth) return;

      const requiredCopies = Math.max(2, Math.ceil(strip.clientWidth / baseWidth) + 1);
      const currentCopies = Math.max(1, Math.floor(allImages.length / baseCount));
      if (currentCopies >= requiredCopies) return;

      const sourceItems = baseImages.map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.alt || "Instagram image"
      }));
      for (let copyIdx = currentCopies; copyIdx < requiredCopies; copyIdx++) {
        sourceItems.forEach((item) => {
          const image = document.createElement("img");
          image.src = item.src;
          image.alt = item.alt;
          image.setAttribute("aria-hidden", "true");
          marqueeTrack.appendChild(image);
        });
      }
    };

    const measureLoopWidth = () => {
      ensureTrackCopies();
      const allImages = Array.from(marqueeTrack.querySelectorAll("img"));
      const baseCount = Number(strip.dataset.baseCount || Math.floor(allImages.length / 2));
      const baseImages = allImages.slice(0, baseCount);
      loopWidth = baseImages.reduce((acc, img) => acc + img.getBoundingClientRect().width, 0);
      loopWidth += Math.max(0, baseImages.length - 1) * 6;
      if (offsetX >= loopWidth && loopWidth > 0) offsetX %= loopWidth;
    };

    const animateStrip = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaMs = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (loopWidth > 0) {
        offsetX = (offsetX + (pixelsPerSecond * deltaMs) / 1000) % loopWidth;
        marqueeTrack.style.transform = `translate3d(${-offsetX}px, 0, 0)`;
      }

      animationId = window.requestAnimationFrame(animateStrip);
    };

    measureLoopWidth();
    window.addEventListener("resize", measureLoopWidth);
    Array.from(marqueeTrack.querySelectorAll("img")).forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", measureLoopWidth, { once: true });
      }
    });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animationId = window.requestAnimationFrame(animateStrip);
    }

    window.addEventListener("beforeunload", () => {
      if (animationId) window.cancelAnimationFrame(animationId);
    });
  });
}



// ================== BOOKING CARD (package details only) ==================
const bookingCardRoot = document.querySelector(".booking-card");
let prices = [94, 84, 20]; // Adult, Youth, Child
let values = [0, 0, 0];
let currencySymbol = "₹";

if (bookingCardRoot) {
const plusBtns = bookingCardRoot.querySelectorAll(".plus");
const minusBtns = bookingCardRoot.querySelectorAll(".minus");
const counts = bookingCardRoot.querySelectorAll(".count");
const extras = bookingCardRoot.querySelectorAll(".extra");
const totalPrice = bookingCardRoot.querySelector("#totalPrice");
const ticketPriceNodes = bookingCardRoot.querySelectorAll(".ticket-price");
const packageStartPriceNode = bookingCardRoot.querySelector(".booking-top .price-value");
const bookingDateInput = bookingCardRoot.querySelector("#date");
const bookingTimeInput = bookingCardRoot.querySelector("#time");
const bookingButton = bookingCardRoot.querySelector(".book-btn");
const bookingSubmitPopup = document.getElementById("bookingSubmitPopup");
const bookingSubmitPopupClose = document.getElementById("bookingSubmitPopupClose");
const bookingSubmitPopupIconClose = document.getElementById("bookingSubmitPopupIconClose");

function parseCurrencyAmount(rawValue) {
  const source = String(rawValue || "");
  const symbolMatch = source.match(/[₹$]/);
  const parsed = Number(source.replace(/[^0-9.]/g, ""));
  return {
    amount: Number.isFinite(parsed) ? parsed : 0,
    symbol: symbolMatch?.[0] || currencySymbol
  };
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

function formatPrice(value, symbol = currencySymbol) {
  return `${symbol}${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

function applyDynamicTicketPricing() {
  const { amount: startPrice, symbol } = parseCurrencyAmount(packageStartPriceNode?.textContent);
  currencySymbol = symbol || "₹";

  if (startPrice >= 10000) {
    const adult = roundToStep(startPrice * 0.1, 100);
    const youth = Math.max(400, roundToStep(adult * 0.85, 400));
    const child = Math.max(400, roundToStep(adult * 0.4, 400));
    prices = [adult, youth, child];
  } else {
    prices = [94, 84, 20];
  }

  ticketPriceNodes.forEach((node, index) => {
    if (node) node.textContent = formatPrice(prices[index] || 0);
  });
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const triponOpenBookingPicker = (input) => {
  if (!input) {
    return;
  }
  input.focus({ preventScroll: true });
  try {
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
  } catch (_) {
    // showPicker can throw if not allowed; fall back to click()
  }
  input.click();
};

const triponBindBookingPickerRow = (input) => {
  const row = input?.closest(".input-box");
  if (!row) {
    return;
  }
  const openPicker = (event) => {
    event.preventDefault();
    triponOpenBookingPicker(input);
  };
  row.addEventListener("click", openPicker);
  row.querySelector(".input-box-dropdown-icon")?.addEventListener("click", openPicker);
};

if (bookingCardRoot && bookingDateInput && bookingDateInput.type === "date") {
  bookingDateInput.min = getTodayDateString();
  const validateBookingDate = () => {
    if (!bookingDateInput.value) {
      bookingDateInput.setCustomValidity("");
      return;
    }
    if (bookingDateInput.value < bookingDateInput.min) {
      bookingDateInput.setCustomValidity("Invalid date. Please select a future date.");
      return;
    }
    bookingDateInput.setCustomValidity("");
  };

  validateBookingDate();
  bookingDateInput.addEventListener("input", validateBookingDate);
  bookingDateInput.addEventListener("change", validateBookingDate);
  triponBindBookingPickerRow(bookingDateInput);
}

if (bookingCardRoot && bookingTimeInput) {
  triponBindBookingPickerRow(bookingTimeInput);
}

// Update total
function updateTotal() {
  let total = 0;

  // Ticket calculation
  values.forEach((val, i) => {
    total += val * prices[i];
  });

  // Extras
  extras.forEach(extra => {
    if (extra.checked) {
      total += Number(extra.value);
    }
  });

  if (totalPrice) totalPrice.innerText = formatPrice(total);
}

// Plus / minus ticket counters
plusBtns.forEach((btn, i) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    values[i]++;
    counts[i].innerText = values[i];
    updateTotal();
  });
});

minusBtns.forEach((btn, i) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (values[i] > 0) {
      values[i]--;
      counts[i].innerText = values[i];
      updateTotal();
    }
  });
});

extras.forEach((extra) => {
  extra.addEventListener("change", updateTotal);
});

if (totalPrice) {
  applyDynamicTicketPricing();
  updateTotal();
}

function openBookingSubmitPopup() {
  if (!bookingSubmitPopup) return;
  bookingSubmitPopup.classList.add("active");
  bookingSubmitPopup.setAttribute("aria-hidden", "false");
}

function closeBookingSubmitPopup() {
  if (!bookingSubmitPopup) return;
  bookingSubmitPopup.classList.remove("active");
  bookingSubmitPopup.setAttribute("aria-hidden", "true");
}

bookingSubmitPopupClose?.addEventListener("click", closeBookingSubmitPopup);
bookingSubmitPopupIconClose?.addEventListener("click", closeBookingSubmitPopup);
bookingSubmitPopup?.addEventListener("click", (event) => {
  if (event.target === bookingSubmitPopup) {
    closeBookingSubmitPopup();
  }
});

const resetPackageBookButton = () => {
  if (!bookingButton) {
    return;
  }
  bookingButton.disabled = false;
  bookingButton.classList.remove("is-booking", "is-booked");
  bookingButton.innerHTML = 'Book Now <span class="book-arrow">↗</span>';
};

const openPackageBookingModal = () => {
  const mobilePrefModal = document.getElementById("mobilePrefModal");
  if (typeof window.triponShowMobilePrefModal === "function") {
    window.triponShowMobilePrefModal();
    return;
  }
  if (!mobilePrefModal) {
    openBookingSubmitPopup();
    return;
  }
  mobilePrefModal.classList.add("active");
  mobilePrefModal.setAttribute("aria-hidden", "false");
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
};

bookingButton?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (bookingDateInput?.valueMissing) {
    bookingDateInput.reportValidity();
    bookingDateInput.focus();
    return;
  }
  if (bookingTimeInput && bookingTimeInput.hasAttribute("required") && bookingTimeInput.valueMissing) {
    bookingTimeInput.reportValidity();
    bookingTimeInput.focus();
    return;
  }

  resetPackageBookButton();
  openPackageBookingModal();
});

const packagePrefModal = document.getElementById("mobilePrefModal");
if (packagePrefModal) {
  const watchPrefModalClosed = new MutationObserver(() => {
    if (!packagePrefModal.classList.contains("active")) {
      resetPackageBookButton();
    }
  });
  watchPrefModalClosed.observe(packagePrefModal, { attributes: true, attributeFilter: ["class"] });
}

} // end bookingCardRoot


// ================== PACKAGE DETAILS PAGE (modals & share) ==================

function initPackageDetailsPrefModalTweaks() {
  const modal = document.querySelector("#mobilePrefModal[data-disable-auto-open]");
  if (!modal) return;

  const step1 = modal.querySelector('.mobile-pref-step[data-step="1"]');
  const step1Radio = step1?.querySelector('input[type="radio"]');
  if (step1Radio) step1Radio.checked = true;

  const autoAdvanceFromStep1 = () => {
    if (modal.classList.contains("active") && step1?.classList.contains("active")) {
      modal.querySelector("#mobilePrefNext")?.click();
    }
  };

  new MutationObserver(autoAdvanceFromStep1).observe(modal, {
    attributes: true,
    attributeFilter: ["class"]
  });

  if (step1) {
    new MutationObserver(() => {
      if (step1.classList.contains("active")) {
        setTimeout(() => modal.querySelector("#mobilePrefNext")?.click(), 10);
      }
    }).observe(step1, { attributes: true, attributeFilter: ["class"] });
  }

  const stepMap = {
    "Next (2/6)": "Next (1/5)",
    "Next (3/6)": "Next (2/5)",
    "Next (4/6)": "Next (3/5)",
    "Next (5/6)": "Next (4/5)"
  };
  const nextBtn = modal.querySelector("#mobilePrefNext");
  const prevBtn = modal.querySelector("#mobilePrefPrev");

  if (nextBtn) {
    new MutationObserver(() => {
      const txt = nextBtn.textContent;
      if (stepMap[txt]) nextBtn.textContent = stepMap[txt];
      if (txt === "Submit" || stepMap[txt]) {
        const step2Active = modal.querySelector('.mobile-pref-step[data-step="2"]');
        if (step2Active?.classList.contains("active") && prevBtn) {
          prevBtn.style.display = "none";
        }
      }
    }).observe(nextBtn, { childList: true, characterData: true, subtree: true });
  }
}

function initPackageDetailsSharePopup() {
  const shareOverlay = document.getElementById("sharePopup");
  const shareCloseBtn = document.getElementById("sharePopupClose");
  const shareCopyBtn = document.getElementById("shareCopyBtn");
  const shareLinkInput = document.getElementById("shareLinkInput");
  if (!shareOverlay || !shareCloseBtn || !shareCopyBtn || !shareLinkInput) return;

  shareLinkInput.value = window.location.href;
  const shareSearchInput = document.getElementById("shareSearchInput");
  const appRows = shareOverlay.querySelectorAll(".share-app-row");

  const openSharePopup = () => {
    shareOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    if (shareSearchInput) {
      shareSearchInput.value = "";
      appRows.forEach((row) => {
        row.style.display = "";
      });
    }
  };

  const closeSharePopup = () => {
    shareOverlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  const origShareBtn = document.getElementById("shareBtn");
  if (origShareBtn) {
    const newBtn = origShareBtn.cloneNode(true);
    origShareBtn.parentNode.replaceChild(newBtn, origShareBtn);
    newBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSharePopup();
    });
  }

  shareCloseBtn.addEventListener("click", closeSharePopup);
  shareOverlay.addEventListener("click", (e) => {
    if (e.target === shareOverlay) closeSharePopup();
  });

  if (shareSearchInput) {
    shareSearchInput.addEventListener("input", () => {
      const query = shareSearchInput.value.trim().toLowerCase();
      appRows.forEach((row) => {
        const name = row.querySelector("span")?.textContent.toLowerCase() || "";
        row.style.display = name.includes(query) ? "" : "none";
      });
    });
  }

  const markCopied = () => {
    shareCopyBtn.textContent = "Copied!";
    setTimeout(() => {
      shareCopyBtn.textContent = "Copy";
    }, 2000);
  };

  shareCopyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(shareLinkInput.value).then(markCopied);
  });

  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent("Check out this amazing tour!");

  shareOverlay.querySelectorAll(".share-app-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      e.preventDefault();
      const type = row.getAttribute("data-share");
      let link = "";
      switch (type) {
        case "whatsapp":
          link = `https://wa.me/?text=${text}%20${url}`;
          break;
        case "telegram":
          link = `https://t.me/share/url?url=${url}&text=${text}`;
          break;
        case "gmail":
          link = `https://mail.google.com/mail/?view=cm&su=${text}&body=${url}`;
          break;
        case "instagram":
          link = "https://www.instagram.com/";
          break;
        case "facebook":
          link = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case "twitter":
          link = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
          break;
        case "copy":
          navigator.clipboard.writeText(window.location.href).then(markCopied);
          return;
        default:
          break;
      }
      if (link) window.open(link, "_blank");
    });
  });
}

function initPackageDetailsBestsellerPopup() {
  const badge = document.getElementById("bestsellerBadge");
  const popup = document.getElementById("bestsellerPopup");
  if (!badge || !popup) return;

  const categories = {
    beach: {
      icon: "fa-solid fa-umbrella-beach",
      title: "Top Beach Experience",
      sub: "A coastal paradise travelers love",
      reasons: [
        { icon: "fa-solid fa-water", text: "Crystal-clear waters & white sand" },
        { icon: "fa-solid fa-fish", text: "Snorkeling & marine life encounters" },
        { icon: "fa-solid fa-sailboat", text: "Island hopping adventures" },
        { icon: "fa-regular fa-star", text: "Rated 4.8+ by 12K travelers" },
        { icon: "fa-regular fa-heart", text: "Couples & honeymoon favorite" }
      ],
      stats: [
        { icon: "fa-solid fa-star", value: "4.8", label: "Rating" },
        { icon: "fa-solid fa-users", value: "30K+", label: "Bookings" },
        { icon: "fa-solid fa-sun", value: "#1", label: "Beach trip" }
      ],
      tags: ["Island Hopping", "Snorkeling", "Couples Favorite", "Scenic Views"]
    },
    adventure: {
      icon: "fa-solid fa-person-hiking",
      title: "Top Adventure Pick",
      sub: "Thrill-seekers can\u2019t get enough",
      reasons: [
        { icon: "fa-solid fa-mountain", text: "Thrilling outdoor activities" },
        { icon: "fa-solid fa-bolt", text: "Adrenaline-pumping experiences" },
        { icon: "fa-solid fa-route", text: "Expert-guided excursions" },
        { icon: "fa-regular fa-star", text: "Rated 4.7+ by adventure lovers" },
        { icon: "fa-solid fa-users", text: "Youth & group favorite" }
      ],
      stats: [
        { icon: "fa-solid fa-star", value: "4.7", label: "Rating" },
        { icon: "fa-solid fa-users", value: "22K+", label: "Bookings" },
        { icon: "fa-solid fa-fire-flame-curved", value: "Trending", label: "this month" }
      ],
      tags: ["Outdoor", "Thrilling", "Youth Favorite", "Guided Tour"]
    },
    honeymoon: {
      icon: "fa-solid fa-heart",
      title: "Honeymoon Favorite",
      sub: "Perfectly romantic getaway",
      reasons: [
        { icon: "fa-solid fa-champagne-glasses", text: "Romantic luxury experience" },
        { icon: "fa-regular fa-sun", text: "Stunning sunset & sunrise views" },
        { icon: "fa-solid fa-spa", text: "Couple-friendly spa & dining" },
        { icon: "fa-regular fa-star", text: "Rated 4.9 by honeymooners" },
        { icon: "fa-solid fa-gem", text: "Premium handpicked stays" }
      ],
      stats: [
        { icon: "fa-solid fa-star", value: "4.9", label: "Rating" },
        { icon: "fa-solid fa-heart", value: "18K+", label: "Couples" },
        { icon: "fa-solid fa-gem", value: "Premium", label: "experience" }
      ],
      tags: ["Romantic", "Sunset Views", "Luxury Stay", "Couple-Friendly"]
    },
    city: {
      icon: "fa-solid fa-city",
      title: "Top City Experience",
      sub: "Most popular urban exploration",
      reasons: [
        { icon: "fa-solid fa-landmark", text: "Iconic attractions & landmarks" },
        { icon: "fa-solid fa-map-location-dot", text: "Expert-guided walking tours" },
        { icon: "fa-solid fa-utensils", text: "Local food & culture immersion" },
        { icon: "fa-regular fa-star", text: "Rated 4.7 by first-time visitors" },
        { icon: "fa-solid fa-camera", text: "Instagram-worthy photo spots" }
      ],
      stats: [
        { icon: "fa-solid fa-star", value: "4.7", label: "Rating" },
        { icon: "fa-solid fa-users", value: "25K+", label: "Bookings" },
        { icon: "fa-solid fa-ranking-star", value: "#1", label: "City tour" }
      ],
      tags: ["Guided Tour", "Landmarks", "Culture", "First-Timer Friendly"]
    },
    family: {
      icon: "fa-solid fa-people-roof",
      title: "Family Favorite",
      sub: "Safe, fun & kid-approved",
      reasons: [
        { icon: "fa-solid fa-child-reaching", text: "Kid-friendly activities included" },
        { icon: "fa-solid fa-shield-halved", text: "Safe & well-organized itinerary" },
        { icon: "fa-solid fa-people-group", text: "Group activities for all ages" },
        { icon: "fa-regular fa-star", text: "Rated 4.8 by families" },
        { icon: "fa-regular fa-face-smile", text: "Hassle-free family experience" }
      ],
      stats: [
        { icon: "fa-solid fa-star", value: "4.8", label: "Rating" },
        { icon: "fa-solid fa-users", value: "20K+", label: "Families" },
        { icon: "fa-solid fa-award", value: "Top", label: "family pick" }
      ],
      tags: ["Kid-Friendly", "Safe", "Group Fun", "All Ages"]
    }
  };

  const beachWords = ["beach", "island", "snorkel", "coast", "sea", "ocean", "marine", "coral", "phi phi", "bay", "lagoon", "water", "shore", "surf", "dive", "reef", "tropical"];
  const adventureWords = ["adventure", "trek", "hike", "climb", "zip", "raft", "safari", "jungle", "expedition", "thrill", "extreme", "kayak", "bungee", "canyon"];
  const honeymoonWords = ["honeymoon", "romantic", "couple", "romance", "sunset cruise", "luxury retreat", "spa", "candlelight"];
  const cityWords = ["city", "walking tour", "museum", "temple", "palace", "market", "street", "downtown", "heritage", "monument", "landmark", "cathedral", "gallery"];
  const familyWords = ["family", "kids", "child", "waterpark", "zoo", "theme park", "amusement", "playground", "picnic"];

  const detectCategory = () => {
    const title = document.querySelector(".title-section h1")?.textContent || "";
    const overview = document.querySelector(".left p")?.textContent || "";
    const highlights = document.querySelector(".left ul")?.textContent || "";
    const blob = `${title} ${overview} ${highlights}`.toLowerCase();
    const scores = { beach: 0, adventure: 0, honeymoon: 0, city: 0, family: 0 };
    const tally = (words, key) => {
      words.forEach((w) => {
        if (blob.includes(w)) scores[key] += 1;
      });
    };
    tally(beachWords, "beach");
    tally(adventureWords, "adventure");
    tally(honeymoonWords, "honeymoon");
    tally(cityWords, "city");
    tally(familyWords, "family");
    let best = "beach";
    let max = 0;
    Object.keys(scores).forEach((k) => {
      if (scores[k] > max) {
        max = scores[k];
        best = k;
      }
    });
    return best;
  };

  const data = categories[detectCategory()];

  const bsPopupIcon = document.getElementById("bsPopupIcon");
  const bsPopupTitle = document.getElementById("bsPopupTitle");
  const bsPopupSub = document.getElementById("bsPopupSub");
  const listEl = document.getElementById("bsPopupList");
  const statsEl = document.getElementById("bsPopupStats");
  const tagsEl = document.getElementById("bsPopupTags");

  if (bsPopupIcon) bsPopupIcon.innerHTML = `<i class="${data.icon}"></i>`;
  if (bsPopupTitle) bsPopupTitle.textContent = data.title;
  if (bsPopupSub) bsPopupSub.textContent = data.sub;
  if (listEl) {
    listEl.innerHTML = data.reasons
      .map((r) => `<li><i class="${r.icon}"></i><span>${r.text}</span></li>`)
      .join("");
  }
  if (statsEl) {
    statsEl.innerHTML = data.stats
      .map((s) => `<div class="bestseller-stat"><i class="${s.icon}"></i><strong>${s.value}</strong> ${s.label}</div>`)
      .join("");
  }
  if (tagsEl) {
    tagsEl.innerHTML = data.tags.map((t) => `<span class="bestseller-tag">${t}</span>`).join("");
  }

  badge.addEventListener("click", (e) => {
    e.stopPropagation();
    popup.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!popup.contains(e.target) && e.target !== badge && !badge.contains(e.target)) {
      popup.classList.remove("active");
    }
  });
}

if (document.body?.classList.contains("package-details-page")) {
  initPackageDetailsPrefModalTweaks();
  initPackageDetailsSharePopup();
  initPackageDetailsBestsellerPopup();
}

// SHARE FUNCTION (other pages — native share / clipboard fallback)
const shareBtn = document.getElementById("shareBtn");
const sharePopupOverlay = document.getElementById("sharePopup");
if (shareBtn && !sharePopupOverlay) {
  shareBtn.addEventListener("click", async () => {
    const shareData = {
      title: "Trip to Paris",
      text: "Check out this amazing tour!",
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  });
}

const stars = document.querySelectorAll("#rating i");
const ratingText = document.getElementById("ratingText");

let currentRating = 0;

function highlightStars(value) {
  stars.forEach((star) => {
    if (star.getAttribute("data-value") <= value) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

function updateStars(value) {
  stars.forEach((star) => {
    if (star.getAttribute("data-value") <= value) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

if (stars.length && ratingText) {
  if (localStorage.getItem("userRating")) {
    currentRating = Number(localStorage.getItem("userRating"));
    updateStars(currentRating);
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const value = star.getAttribute("data-value");
      currentRating = value;
      localStorage.setItem("userRating", value);
      updateStars(value);
      ratingText.textContent = `${value}.0 (You rated)`;
    });

    star.addEventListener("mouseover", () => {
      const value = star.getAttribute("data-value");
      highlightStars(value);
    });

    star.addEventListener("mouseout", () => {
      updateStars(currentRating);
    });
  });
}

const reviewsBtn = document.getElementById("reviewsBtn");
const packagesBtn = document.getElementById("packagesBtn");
const contactBtn = document.getElementById("contactBtn");
const reviewsModal = document.getElementById("reviewsModal");
const packagesModal = document.getElementById("packagesModal");
const contactModal = document.getElementById("contactModal");
const modalCloses = document.querySelectorAll(".modal-close");
const contactForm = document.getElementById("contactForm");

function openModal(modal) {
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modal) {
  if (modal) {
    modal.classList.remove("active");
  }
}

reviewsBtn?.addEventListener("click", () => openModal(reviewsModal));
packagesBtn?.addEventListener("click", () => openModal(packagesModal));
contactBtn?.addEventListener("click", () => openModal(contactModal));

modalCloses.forEach(button => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal-overlay");
    closeModal(modal);
  });
});

[reviewsModal, packagesModal, contactModal].forEach(modal => {
  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  }
});

if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    alert("Thanks! Your message has been sent.");
    closeModal(contactModal);
    contactForm.reset();
  });
}




