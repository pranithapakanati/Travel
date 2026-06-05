/**
 * Default package data for detail pages (used when sessionStorage is empty or stale).
 * Keys: "{place}/{slug}"
 */
(function (g) {
  const TRIPON_PACKAGE_CATALOG = {
    "kuta/centipede-desert-atv-tour": {
      title: "Centipede Tour - Guided Arizona Desert Tour by ATV",
      location: "Arizona, USA",
      rating: "4.8",
      reviews: "269",
      days: "4 Days",
      price: "₹15,700",
      type: "friends",
      image: "assets/images/arizona.webp",
      detailImages: "/assets/images/arizona.webp,/assets/images/arizona1.webp,/assets/images/arizona2.webp",
      places: "Sonoran Desert trails,Cactus Canyon viewpoints,Desert camp base",
      activities: "Guided ATV ride,Desert photo stops,Safety briefing and gear",
      included: "ATV rental and helmet,Safety gear,Professional desert guide,Hotel pickup and drop-off"
    },
    "nusa-penida/molokini-turtle-town-snorkeling": {
      title: "Molokini and Turtle Town Snorkeling Adventure Aboard",
      location: "Nusa Penida, Indonesia",
      rating: "4.8",
      reviews: "269",
      days: "4 Days",
      price: "₹18,700",
      type: "family",
      image: "assets/images/molokini.webp",
      detailImages: "/assets/images/molokini.webp,/assets/images/molokini1.webp,/assets/images/molokini2.webp",
      places: "Molokini Crater,Turtle Town reef,Nusa Penida coastline",
      activities: "Snorkeling with sea turtles,Reef exploration,Boat cruise with crew",
      included: "Boat transfers,Snorkeling equipment,Lunch on board,Professional snorkel guide"
    },
    "london/westminster-walking-tour-westminster-abbey-entry": {
      title: "Westminster Walking Tour & Westminster Abbey Entry",
      location: "London, UK",
      rating: "4.8",
      reviews: "269",
      days: "4 Days",
      price: "₹78,300",
      type: "couple",
      image: "assets/images/westminster.webp",
      detailImages: "/assets/images/westminster.webp,/assets/images/westminster1.webp,/assets/images/westminster2.webp",
      places: "Westminster Abbey,Big Ben and Parliament,St James's Park",
      activities: "Guided walking tour,Abbey entry and highlights,River Thames photo walk",
      included: "Westminster Abbey entry,Expert local guide,Walking tour route map,Headsets where required"
    },
    "lombok/ultimate-circle-island-day-tour": {
      title: "All Inclusive Ultimate Circle Island Day Tour with Lunch",
      location: "Lombok, Indonesia",
      rating: "4.8",
      reviews: "269",
      days: "4 Days",
      price: "₹64,000",
      type: "family",
      image: "assets/images/circle.webp",
      detailImages: "/assets/images/circle.webp,/assets/images/circle1.webp,/assets/images/circle2.webp",
      places: "Senggigi coast,Sasak villages,Waterfall viewpoints",
      activities: "Circle island scenic drive,Traditional lunch stop,Cultural village visit",
      included: "Private transport,English-speaking guide,Lunch,Entrance fees on route"
    },
    "ubud/honey-moon-package-in-bali": {
      title: "Honey Moon Package in Bali",
      location: "Ubud, Indonesia",
      rating: "4.8",
      reviews: "136",
      days: "5 Days",
      price: "₹45,000",
      type: "couple",
      image: "assets/images/couple.webp",
      detailImages: "/assets/images/couple.webp,/assets/images/couple1.webp,/assets/images/couple2.webp",
      places: "Tanah Lot Temple,Ubud Rice Terraces,Campuhan Ridge,Tirta Empul",
      activities: "Balinese cooking class,Couple spa,Rice terrace walk,Traditional dance evening",
      included: "Boutique stay with breakfast,Couple spa session,Private transfers,Selected temple entries"
    },
    "nusa-penida/isolated-mountains-retreat": {
      title: "Isolated Mountains Retreat",
      location: "Nusa Penida, Indonesia",
      rating: "4.8",
      reviews: "136",
      days: "6 Days",
      price: "₹50,000",
      type: "couple",
      image: "assets/images/isolated.webp",
      detailImages: "/assets/images/isolated.webp,/assets/images/isolated1.webp,/assets/images/isolated2.webp",
      places: "Kelingking Beach,Diamond Beach,Broken Beach,Angel Billabong,Crystal Bay",
      activities: "Snorkel with manta rays,Island coastal drive,Cliff viewpoint hike,Sunset at the beach",
      included: "Fast-boat transfers,Scooter or van hire support,Breakfast daily,Snorkel gear on activity days"
    },
    "gili-trawangan/the-white-beach-land": {
      title: "The White Beach Land",
      location: "Gili Trawangan, Indonesia",
      rating: "4.8",
      reviews: "136",
      days: "7 Days",
      price: "₹75,000",
      type: "couple",
      image: "assets/images/gilli.webp",
      detailImages: "/assets/images/gilli.webp,/assets/images/gilli1.webp,/assets/images/gilli2.webp",
      places: "Gili Trawangan beaches,Gili Meno sandbar,Gili Air village,Turtle snorkeling point",
      activities: "Beach cycling,Snorkeling day trip,Sunset swing photo stop,Island café crawl",
      included: "Island transfers,Bicycle rental,Snorkeling trip,Breakfast at stay"
    },
    "seminyak/family-beach-resort-stay": {
      title: "Family Beach Resort Stay",
      location: "Seminyak, Indonesia",
      rating: "4.7",
      reviews: "98",
      days: "8 Days",
      price: "₹1,20,000",
      type: "family",
      image: "assets/images/semiyak81.webp",
      detailImages: "/assets/images/semiyak81.webp,/assets/images/semiyak82.webp,/assets/images/semiyak83.webp",
      places: "Seminyak Beach,Petitenget Temple,Ku De Ta sunset strip",
      activities: "Resort pool and beach time,Family dining crawl,Kids-friendly water play",
      included: "Resort accommodation,Daily breakfast,Airport transfers,Kids club access where available"
    },
    "ubud/cultural-village-explorer": {
      title: "Cultural Village Explorer",
      location: "Ubud, Indonesia",
      rating: "4.6",
      reviews: "74",
      days: "5 Days",
      price: "₹95,000",
      type: "family",
      image: "assets/images/ubud51.webp",
      detailImages: "/assets/images/ubud51.webp,/assets/images/ubud52.webp,/assets/images/ubud53.webp",
      places: "Ubud Monkey Forest,Rice Terrace Walk,Art Market,Traditional Dance",
      activities: "Village tour,Craft workshop,Local cuisine tasting,Temple visit",
      included: "Village guide,Craft workshop materials,Temple sarongs,Private family transport"
    },
    "kuta/waterpark-temples-tour": {
      title: "Waterpark & Temples Tour",
      location: "Kuta, Indonesia",
      rating: "4.9",
      reviews: "112",
      days: "7 Days",
      price: "₹1,10,000",
      type: "family",
      image: "assets/images/kuta61.webp",
      detailImages: "/assets/images/kuta61.webp,/assets/images/kuta62.webp,/assets/images/kuta63.webp",
      places: "Waterbom Bali,Uluwatu Temple,Tanah Lot,Tegenungan Waterfall",
      activities: "Waterpark day pass,Temple sunset visit,Family photo stops,Beach leisure time",
      included: "Waterpark tickets,Temple entries,Private van with driver,Lunch on tour days"
    },
    "canggu/adventure-surf-camp": {
      title: "Adventure Surf Camp",
      location: "Canggu, Indonesia",
      rating: "4.8",
      reviews: "162",
      days: "5 Days",
      price: "₹55,000",
      type: "friends",
      image: "assets/images/conggu.webp",
      detailImages: "/assets/images/conggu.webp,/assets/images/conggu1.webp,/assets/images/conggu2.webp",
      places: "Batu Bolong Beach,Echo Beach,Canggu rice lanes",
      activities: "Surf lessons with coach,Board rental sessions,Sunset beach barbecue,Scooter coastal loop",
      included: "Surf lessons,Board rental,Beach transfer support,Welcome drink on arrival day"
    },
    "mount-batur/volcano-trekking-trip": {
      title: "Volcano Trekking Trip",
      location: "Mount Batur, Indonesia",
      rating: "4.5",
      reviews: "88",
      days: "8 Days",
      price: "₹40,000",
      type: "friends",
      image: "assets/images/volcano.webp",
      detailImages: "/assets/images/volcano.webp,/assets/images/volcano1.webp,/assets/images/volcano2.webp",
      places: "Mount Batur summit,Lake Batur viewpoint,Hot springs village",
      activities: "Sunrise volcano trek,Breakfast after summit,Hot spring soak,Volcano crater photos",
      included: "Trek guide and torch,Light breakfast after hike,Transport to trailhead,Hot spring entry"
    },
    "nusa-lembongan/island-hopping-tour": {
      title: "Island Hopping Tour",
      location: "Nusa Lembongan, Indonesia",
      rating: "4.8",
      reviews: "140",
      days: "7 Days",
      price: "₹65,000",
      type: "friends",
      image: "assets/images/nusa61.webp",
      detailImages: "/assets/images/nusa61.webp,/assets/images/nusa62.webp,/assets/images/nusa63.webp",
      places: "Nusa Lembongan mangroves,Nusa Ceningan bridge,Blue Lagoon cliff",
      activities: "Island hopping by boat,Snorkeling stops,Cliff jumping viewpoint (optional),Beach chill time",
      included: "Boat hops between islands,Snorkel gear,Rice lunch on Ceningan,Harbour transfers"
    },
    "bedugul/lakeside-family-escape": {
      title: "Lakeside Family Escape",
      location: "Bedugul, Indonesia",
      rating: "4.6",
      reviews: "84",
      days: "6 Days",
      price: "₹88,000",
      type: "family",
      image: "assets/images/bedgul.webp",
      detailImages: "/assets/images/bedgul.webp,/assets/images/bedgul1.webp,/assets/images/bedgul2.webp",
      places: "Ulun Danu Beratan Temple,Handara Gate,Bedugul Botanical Garden",
      activities: "Lake temple visit,Family picnic by the lake,Garden walk,Strawberry farm stop",
      included: "Family room stay,Breakfast,Garden and temple entries,Private driver for day trips"
    },
    "uluwatu/luxury-island-escape": {
      title: "Luxury Island Escape",
      location: "Uluwatu, Indonesia",
      rating: "4.9",
      reviews: "121",
      days: "8 Days",
      price: "₹1,35,000",
      type: "couple",
      image: "assets/images/luxury.webp",
      detailImages: "/assets/images/luxury.webp,/assets/images/luxury1.webp,/assets/images/luxury2.webp",
      places: "Uluwatu Temple,Bingin Beach clifftops,Jimbaran Bay",
      activities: "Kecak dance at sunset,Private cliffside dining,Couple spa ritual,Infinity pool downtime",
      included: "Luxury villa or resort stay,Private airport transfers,Couple spa session,Kecak show tickets"
    },
    "uluwatu/cliffside-adventure-trail": {
      title: "Cliffside Adventure Trail",
      location: "Uluwatu, Indonesia",
      rating: "4.6",
      reviews: "92",
      days: "6 Days",
      price: "₹76,000",
      type: "friends",
      image: "assets/images/lake1.webp",
      detailImages: "/assets/images/lake1.webp,/assets/images/lake2.webp,/assets/images/lake3.webp",
      places: "Uluwatu cliffs,Padang Padang beach,Suluban cave beach",
      activities: "Coastal cliff trek,Surf spot check-ins,Sunset viewpoint hops,Beach barbecue evening",
      included: "Trail guide,Transport between viewpoints,Beach barbecue dinner,Drinking water on hikes"
    },
  };

  const TRIPON_DURATION_FOLDER_LABELS = {
    "4-days": "4 Days",
    "5-days": "5 Days",
    "6-days": "6 Days",
    "7-days": "7 Days",
    "8-days": "8 Days"
  };

  function triponDurationLabelFromFolder(folder) {
    const key = String(folder || "").toLowerCase().trim();
    return TRIPON_DURATION_FOLDER_LABELS[key] || "";
  }

  function triponDurationFolderFromDaysValue(daysValue) {
    const n = String(daysValue || "").match(/\d+/)?.[0];
    return n ? `${n}-days` : "";
  }

  function triponCatalogEntriesForDurationFolder(folder) {
    const label = triponDurationLabelFromFolder(folder);
    const n = String(folder || "").match(/^(\d+)-days$/)?.[1];
    if (!n) return [];
    return Object.entries(TRIPON_PACKAGE_CATALOG)
      .filter(([, entry]) => {
        const dayNum = String(entry.days || "").match(/\d+/)?.[0];
        return dayNum === n;
      })
      .map(([key, entry]) => {
        const [place, slug] = key.split("/");
        return { place, slug, ...entry };
      });
  }

  function triponGetCatalogEntry(place, slug) {
    const p = String(place || "").toLowerCase().trim();
    const s = String(slug || "").toLowerCase().trim();
    if (!p || !s) return null;
    return TRIPON_PACKAGE_CATALOG[`${p}/${s}`] || null;
  }

  /** Detail HTML path from catalog days (e.g. packages/bali/6-days/isolated-mountains-retreat.html). */
  function triponResolvePackageDetailPath(place, slug) {
    const entry = triponGetCatalogEntry(place, slug);
    if (!entry) {
      return "";
    }
    const folder = triponDurationFolderFromDaysValue(entry.days);
    const packageSlug = String(slug || "").toLowerCase().trim();
    if (!folder || !packageSlug) {
      return "";
    }
    return `packages/bali/${folder}/${packageSlug}.html`;
  }

  function triponSyncPackageCardCatalogAttrs(card) {
    if (!card) {
      return;
    }
    const place = card.getAttribute("data-package-place") || "";
    const slug = card.getAttribute("data-package-slug") || "";
    if (!place || !slug) {
      return;
    }
    const entry = triponGetCatalogEntry(place, slug);
    if (!entry) {
      return;
    }
    const dayNum = String(entry.days || "").match(/\d+/)?.[0] || "";
    if (dayNum) {
      card.setAttribute("data-days", dayNum);
      card.setAttribute("data-package-duration", `${dayNum}-days`);
    }
    const detailPath = triponResolvePackageDetailPath(place, slug);
    if (detailPath) {
      card.setAttribute("data-package-detail-href", detailPath);
    }
  }

  const TRIPON_PACKAGE_DETAIL_PATHS = Object.fromEntries(
    Object.entries(TRIPON_PACKAGE_CATALOG).map(([key]) => {
      const slash = key.indexOf("/");
      const place = key.slice(0, slash);
      const slug = key.slice(slash + 1);
      const path = triponResolvePackageDetailPath(place, slug);
      return path ? [key, path] : [];
    }).filter((pair) => pair.length === 2)
  );

  function triponEnsurePackageCardDetailHref(card) {
    triponSyncPackageCardCatalogAttrs(card);
  }

  /** Same order and offers as packages/index.html — single source for location package strips. */
  const TRIPON_PACKAGE_SCREEN_ORDER = [
    { place: "kuta", slug: "centipede-desert-atv-tour", offer: "10% off" },
    { place: "nusa-penida", slug: "molokini-turtle-town-snorkeling", offer: "10% off" },
    { place: "london", slug: "westminster-walking-tour-westminster-abbey-entry", offer: "10% off" },
    { place: "lombok", slug: "ultimate-circle-island-day-tour", offer: "10% off" },
    { place: "ubud", slug: "honey-moon-package-in-bali", offer: "10% off" },
    { place: "nusa-penida", slug: "isolated-mountains-retreat", offer: "15% off" },
    { place: "gili-trawangan", slug: "the-white-beach-land", offer: "12% off" },
    { place: "seminyak", slug: "family-beach-resort-stay", offer: "8% off" },
    { place: "ubud", slug: "cultural-village-explorer", offer: "10% off" },
    { place: "kuta", slug: "waterpark-temples-tour", offer: "18% off" },
    { place: "canggu", slug: "adventure-surf-camp", offer: "20% off" },
    { place: "mount-batur", slug: "volcano-trekking-trip", offer: "5% off" },
    { place: "nusa-lembongan", slug: "island-hopping-tour", offer: "13% off" },
    { place: "bedugul", slug: "lakeside-family-escape", offer: "11% off" },
    { place: "uluwatu", slug: "luxury-island-escape", offer: "9% off" },
    { place: "uluwatu", slug: "cliffside-adventure-trail", offer: "10% off" }
  ];

  function triponEscapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function triponPackageAssetUrl(path) {
    let p = String(path || "").trim().replace(/\\/g, "/");
    if (!p) {
      return "";
    }
    if (/^(https?:)?\/\//i.test(p) || p.startsWith("data:")) {
      return p;
    }
    if (p.startsWith("/")) {
      return p;
    }
    if (p.startsWith("images/")) {
      return `/assets/images/${p.slice("images/".length)}`;
    }
    if (p.startsWith("assets/images/")) {
      return `/${p}`;
    }
    return `/assets/images/${p}`;
  }

  function triponPackageCsvAssetUrls(csv) {
    return String(csv || "")
      .split(",")
      .map((piece) => triponPackageAssetUrl(piece.trim()))
      .filter(Boolean)
      .join(",");
  }

  function triponPackageRatingStarsHtml(ratingStr) {
    const rating = parseFloat(ratingStr) || 0;
    const full = Math.min(5, Math.max(0, Math.round(rating)));
    let html = "";
    for (let i = 0; i < 5; i += 1) {
      html +=
        i < full
          ? '<i class="fa-solid fa-star"></i>'
          : '<i class="fa-regular fa-star"></i>';
    }
    return html;
  }

  function triponPackageNormalizePrice(priceStr) {
    return String(priceStr || "")
      .replace(/^From\s*/i, "")
      .trim();
  }

  function triponPackageParseInrAmount(priceStr) {
    const digits = String(priceStr || "").replace(/[^\d]/g, "");
    const amount = parseInt(digits, 10);
    return Number.isFinite(amount) ? amount : 0;
  }

  function triponPackageExtractPriceText(source) {
    const text =
      typeof source === "string"
        ? source
        : source?.textContent?.replace(/\s+/g, " ").trim() || "";
    if (!text) {
      return "";
    }
    const fromMatch = text.match(/From\s*(₹[\d,]+)/i);
    if (fromMatch?.[1]) {
      return triponPackageNormalizePrice(fromMatch[1]);
    }
    const inrMatches = text.match(/₹\d[\d,]*/g) || [];
    let best = "";
    let bestAmount = 0;
    inrMatches.forEach((piece) => {
      const amount = triponPackageParseInrAmount(piece);
      if (amount > bestAmount) {
        bestAmount = amount;
        best = piece;
      }
    });
    return triponPackageNormalizePrice(best);
  }

  function triponPackageFormatWasPrice(priceStr) {
    const amount = triponPackageParseInrAmount(priceStr);
    if (!amount) {
      return "";
    }
    const was = Math.round(amount * 1.12);
    if (was >= 100000) {
      const lakhs = was / 100000;
      const rounded = Math.round(lakhs * 10) / 10;
      return `₹${Number.isInteger(rounded) ? rounded : rounded.toFixed(1).replace(/\.0$/, "")}L`;
    }
    if (was >= 1000) {
      return `₹${Math.round(was / 1000)}K`;
    }
    return `₹${was.toLocaleString("en-IN")}`;
  }

  function triponPackageDaysToNightsLabel(daysStr) {
    const match = String(daysStr || "").match(/(\d+)/);
    if (!match) {
      return String(daysStr || "").trim();
    }
    const days = parseInt(match[1], 10);
    const nights = Math.max(0, days - 1);
    if (nights <= 0) {
      return `${days} Day${days === 1 ? "" : "s"}`;
    }
    return `${nights} Night${nights === 1 ? "" : "s"} / ${days} Day${days === 1 ? "" : "s"}`;
  }

  function triponBuildPackageMetaHtml(entry) {
    const price = triponPackageNormalizePrice(entry.price);
    const was = entry.priceWas || triponPackageFormatWasPrice(price);
    const duration = triponPackageDaysToNightsLabel(entry.days);
    const wasHtml = was
      ? `<span class="package-meta-price__was">${triponEscapeHtml(was)}</span>`
      : "";

    return `<div class="meta package-meta-row">
            <div class="package-meta-price">
              <div class="package-meta-price__row">
                <span class="package-meta-price__now">${triponEscapeHtml(price)}</span>
                ${wasHtml}
              </div>
              <span class="package-meta-price__label">Per Person</span>
            </div>
            <div class="package-meta-duration">
              <i class="fa-regular fa-calendar package-meta-duration-icon" aria-hidden="true"></i>
              <span class="package-meta-days-text">${triponEscapeHtml(duration)}</span>
            </div>
          </div>`;
  }

  function triponUpgradePackageCardMeta(card) {
    if (!card) {
      return;
    }
    const meta = card.querySelector(".meta");
    if (!meta) {
      return;
    }

    const place = card.getAttribute("data-package-place") || "";
    const slug = card.getAttribute("data-package-slug") || "";
    const catalogEntry = place && slug ? triponGetCatalogEntry(place, slug) : null;

    const existingPrice = card.querySelector(".package-meta-price__now")?.textContent?.trim() || "";
    const existingAmount = triponPackageParseInrAmount(existingPrice);
    if (card.dataset.triponMetaV2 === "1" && catalogEntry && existingAmount >= 100) {
      return;
    }
    if (card.dataset.triponMetaV2 === "1" && !catalogEntry && existingAmount >= 100) {
      return;
    }

    let entry = catalogEntry;
    if (!entry) {
      const daysText =
        meta.querySelector(".package-meta-days-text")?.textContent?.trim() ||
        meta.textContent.match(/\d+\s*Days?/i)?.[0] ||
        card.getAttribute("data-days")
          ? `${card.getAttribute("data-days")} Days`
          : "";
      const priceRaw = triponPackageExtractPriceText(meta);
      if (!priceRaw || triponPackageParseInrAmount(priceRaw) < 100) {
        return;
      }
      entry = { days: daysText, price: priceRaw };
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = triponBuildPackageMetaHtml(entry);
    meta.replaceWith(wrapper.firstElementChild);
    card.dataset.triponMetaV2 = "1";
  }

  function triponInitPackageCardMeta() {
    document.querySelectorAll(".package-card").forEach((card) => {
      triponSyncPackageCardCatalogAttrs(card);
      const brokenAmount = triponPackageParseInrAmount(
        card.querySelector(".package-meta-price__now")?.textContent || ""
      );
      if (brokenAmount > 0 && brokenAmount < 100) {
        delete card.dataset.triponMetaV2;
      }
      triponUpgradePackageCardMeta(card);
    });
  }

  function triponBuildPackageScreenCardHtml(item) {
    const entry = triponGetCatalogEntry(item.place, item.slug);
    if (!entry) {
      return "";
    }
    const dayNum = String(entry.days || "").match(/\d+/)?.[0] || "";
    const durationFolder = dayNum ? `${dayNum}-days` : "";
    const thumb = triponPackageAssetUrl(entry.image);
    const detailUrls = triponPackageCsvAssetUrls(entry.detailImages);
    const hoverUrls = detailUrls || triponPackageCsvAssetUrls(entry.detailImages);
    const placesAttr = entry.places
      ? ` data-package-places="${triponEscapeHtml(entry.places)}"`
      : "";
    const activitiesAttr = entry.activities
      ? ` data-package-activities="${triponEscapeHtml(entry.activities)}"`
      : "";
    const durationAttr = durationFolder
      ? ` data-package-duration="${triponEscapeHtml(durationFolder)}"`
      : "";

    return `<article class="package-card"${durationAttr} data-package-place="${triponEscapeHtml(item.place)}" data-package-slug="${triponEscapeHtml(item.slug)}" data-type="${triponEscapeHtml(entry.type)}" data-days="${triponEscapeHtml(dayNum)}"${placesAttr}${activitiesAttr} data-package-detail-images="${triponEscapeHtml(detailUrls)}" data-package-hover-images="${triponEscapeHtml(hoverUrls)}">
            <div class="package-thumb"><span class="offer">${triponEscapeHtml(item.offer)}</span><img src="${triponEscapeHtml(thumb)}" alt="${triponEscapeHtml(entry.title)}" /></div>
            <p class="location"><i class="fa-solid fa-location-dot"></i> ${triponEscapeHtml(entry.location)}</p>
            <h4>${triponEscapeHtml(entry.title)}</h4>
            <p class="rating">${triponPackageRatingStarsHtml(entry.rating)} <span>${triponEscapeHtml(entry.rating)} (${triponEscapeHtml(entry.reviews)})</span></p>
            ${triponBuildPackageMetaHtml(entry)}
          </article>`;
  }

  function triponRenderPackageScreenGrid(gridEl) {
    if (!gridEl) {
      return;
    }
    const html = TRIPON_PACKAGE_SCREEN_ORDER.map((item) => triponBuildPackageScreenCardHtml(item)).join("");
    gridEl.innerHTML = html;
    gridEl.dataset.triponPackageScreenRendered = "1";
    gridEl.querySelectorAll(".package-card").forEach((card) => {
      triponUpgradePackageCardMeta(card);
    });
  }

  function triponRenderContactExploreGrid(gridEl) {
    if (!gridEl || gridEl.dataset.triponContactExploreRendered === "1") {
      return;
    }
    const picks = TRIPON_PACKAGE_SCREEN_ORDER.slice(0, 4);
    gridEl.innerHTML = picks.map((item) => triponBuildPackageScreenCardHtml(item)).join("");
    gridEl.dataset.triponContactExploreRendered = "1";
    gridEl.querySelectorAll(".package-card").forEach((card) => {
      triponUpgradePackageCardMeta(card);
    });
  }

  function triponSyncPackageScreenFilters(filterSection) {
    if (!filterSection || filterSection.dataset.triponFiltersSynced === "1") {
      return;
    }
    const prevArrow = filterSection.querySelector(".package-day-arrow-prev");
    const nextArrow = filterSection.querySelector(".package-day-arrow-next");
    const chipMarkup = `
            <button class="chip" type="button">4 Days</button>
            <button class="chip chip-active" type="button">4 Nights 5 Days</button>
            <button class="chip" type="button">5 Nights 6 Days</button>
            <button class="chip" type="button">6 Nights 7 Days</button>
            <button class="chip" type="button">7 Nights 8 Days</button>
            <button class="chip chip-custom" type="button">Ask Custom Packages</button>`;
    filterSection.innerHTML = chipMarkup;
    if (prevArrow) {
      filterSection.insertBefore(prevArrow, filterSection.firstChild);
    }
    if (nextArrow) {
      filterSection.append(nextArrow);
    }
    filterSection.dataset.triponFiltersSynced = "1";
  }

  g.TRIPON_PACKAGE_CATALOG = TRIPON_PACKAGE_CATALOG;
  g.TRIPON_PACKAGE_SCREEN_ORDER = TRIPON_PACKAGE_SCREEN_ORDER;
  g.TRIPON_DURATION_FOLDER_LABELS = TRIPON_DURATION_FOLDER_LABELS;
  g.triponDurationLabelFromFolder = triponDurationLabelFromFolder;
  g.triponDurationFolderFromDaysValue = triponDurationFolderFromDaysValue;
  g.triponCatalogEntriesForDurationFolder = triponCatalogEntriesForDurationFolder;
  g.triponGetCatalogEntry = triponGetCatalogEntry;
  g.TRIPON_PACKAGE_DETAIL_PATHS = TRIPON_PACKAGE_DETAIL_PATHS;
  g.triponResolvePackageDetailPath = triponResolvePackageDetailPath;
  g.triponSyncPackageCardCatalogAttrs = triponSyncPackageCardCatalogAttrs;
  g.triponEnsurePackageCardDetailHref = triponEnsurePackageCardDetailHref;
  g.triponBuildPackageScreenCardHtml = triponBuildPackageScreenCardHtml;
  g.triponBuildPackageMetaHtml = triponBuildPackageMetaHtml;
  g.triponUpgradePackageCardMeta = triponUpgradePackageCardMeta;
  g.triponInitPackageCardMeta = triponInitPackageCardMeta;
  g.triponRenderPackageScreenGrid = triponRenderPackageScreenGrid;
  g.triponRenderContactExploreGrid = triponRenderContactExploreGrid;
  g.triponSyncPackageScreenFilters = triponSyncPackageScreenFilters;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", triponInitPackageCardMeta);
    } else {
      triponInitPackageCardMeta();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
