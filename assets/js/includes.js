(function (g) {
  function triponRelPrefix() {
    const path = (g.location.pathname || "").replace(/\\/g, "/");
    if (/\/packages\/bali\/[^/]+\/[^/]+\.html?$/i.test(path)) {
      return "../../../";
    }
    if (
      /\/packages\/[^/]+\/[^/]+\.html?$/i.test(path) ||
      /\/locations\/bali\/[^/]+\.html?$/i.test(path)
    ) {
      return "../../";
    }
    if (
      /\/blogs\//i.test(path) ||
      /\/locations\//i.test(path) ||
      /\/packages\//i.test(path) ||
      /\/company\//i.test(path)
    ) {
      return "../";
    }
    return "";
  }

  function applyComponentUrls(html) {
    return html.split("__TRIPON_REL__").join(triponRelPrefix());
  }

  /** Inject navbar.css once per page */
  function triponEnsureNavbarStyles() {
    const id = "tripon-navbar-stylesheet";
    if (document.getElementById(id)) {
      return;
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `${triponRelPrefix()}assets/css/navbar.css`;
    document.head.appendChild(link);
  }

  function triponEnsureFooterStyles() {
    const id = "tripon-footer-luxury-css";
    if (document.getElementById(id)) {
      return;
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `${triponRelPrefix()}assets/css/footer-luxury.css`;
    document.head.appendChild(link);
  }

  /** Contact-style ambient background on every page */
  function triponEnsureSiteAmbientStyles() {
    const id = "tripon-site-ambient-stylesheet";
    if (document.getElementById(id)) {
      return;
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `${triponRelPrefix()}assets/css/site-ambient.css`;
    document.head.appendChild(link);
  }

  function triponInjectSiteAmbient() {
    if (document.getElementById("triponSiteAmbient")) {
      document.body?.classList.add("has-tripon-site-ambient");
      return Promise.resolve();
    }

    const prefix = triponRelPrefix();
    return fetch(`${prefix}components/site-ambient.html`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`site-ambient ${r.status}`);
        }
        return r.text();
      })
      .then((html) => {
        if (!document.body || document.getElementById("triponSiteAmbient")) {
          return;
        }
        document.body.insertAdjacentHTML("afterbegin", html.trim());
        document.body.classList.add("has-tripon-site-ambient");
      })
      .catch(() => {
        /* Fallback if fetch fails (file://) */
        if (!document.body || document.getElementById("triponSiteAmbient")) {
          return;
        }
        const wrap = document.createElement("div");
        wrap.className = "tripon-site-ambient";
        wrap.id = "triponSiteAmbient";
        wrap.setAttribute("aria-hidden", "true");
        wrap.innerHTML =
          '<svg class="home-ambient__routes tripon-site-ambient__routes" viewBox="0 0 520 200" preserveAspectRatio="none" aria-hidden="true">' +
          '<path class="home-ambient__route" d="M20,120 C120,40 200,160 320,80 S480,140 500,60" />' +
          '<path class="home-ambient__route home-ambient__route--alt" d="M40,160 C160,100 280,180 400,100 S500,30 510,90" />' +
          '<circle class="home-ambient__node" cx="120" cy="72" r="4" />' +
          '<circle class="home-ambient__node home-ambient__node--alt" cx="320" cy="88" r="4" />' +
          '<circle class="home-ambient__node" cx="480" cy="58" r="4" />' +
          "</svg>";
        document.body.insertBefore(wrap, document.body.firstChild);
        document.body.classList.add("has-tripon-site-ambient");
      });
  }

  function triponLoadNavbarScript() {
    return new Promise((resolve, reject) => {
      if (typeof g.triponInitNavbar === "function") {
        resolve();
        return;
      }
      const src = `${triponRelPrefix()}assets/js/navbar.js`;
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("navbar.js failed")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load navbar.js"));
      document.body.appendChild(script);
    });
  }

  function triponPaintNavActiveFallback() {
    if (typeof g.triponPaintNavActive === "function") {
      g.triponPaintNavActive();
      return;
    }
    const key = document.body?.dataset?.triponNav || "";
    if (!key) {
      return;
    }
    document
      .querySelectorAll(
        ".tripon-header__link, .tripon-header__panel a, .tripon-nav__link, .main-nav a, .tripon-mobile-nav__item, .home-mobile-drawer-nav a, .tripon-footer-nav__link, .tripon-footer__link-list a, .tripon-footer__sitemap-title a"
      )
      .forEach((el) => el.classList.remove("is-active"));
    document.querySelectorAll(`[data-nav-key="${key}"]`).forEach((el) => {
      if (el.closest(".tripon-footer")) return;
      el.classList.add("is-active");
    });
    if (key === "contact" || key === "people-reviews" || key === "about") {
      document.querySelector('[data-nav-key="company"]')?.classList.add("is-active");
    }
    if (key === "people-reviews") {
      document.querySelector('[data-nav-key="home"]')?.classList.add("is-active");
    }
  }

  function triponFooterA11ySync() {
    const footerNav = document.querySelector(".tripon-footer-nav");
    if (footerNav) {
      footerNav.setAttribute("aria-hidden", "true");
    }

    const headerNav = document.querySelector("#triponNavbar .tripon-header__nav");
    const footerDupKeys = new Set([
      "home",
      "locations",
      "packages",
      "contact",
      "people-reviews",
    ]);
    const mq = window.matchMedia("(min-width: 769px)");

    const sync = () => {
      const headerNavVisible =
        mq.matches &&
        headerNav &&
        getComputedStyle(headerNav).display !== "none";
      document
        .querySelectorAll(".tripon-footer__link-list a[data-nav-key]")
        .forEach((link) => {
          const key = (link.getAttribute("data-nav-key") || "").trim();
          if (headerNavVisible && footerDupKeys.has(key)) {
            link.setAttribute("aria-hidden", "true");
            link.setAttribute("tabindex", "-1");
          } else {
            link.removeAttribute("aria-hidden");
            link.removeAttribute("tabindex");
          }
        });
    };

    sync();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", sync);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(sync);
    }
  }

  function triponApplyFooterExtraClass() {
    const extra = document.body?.dataset?.triponFooterClass || "";
    if (!extra) {
      return;
    }
    const footer = document.querySelector(".tripon-footer");
    if (!footer) {
      return;
    }
    extra.split(/\s+/).filter(Boolean).forEach((c) => footer.classList.add(c));
  }

  function triponInjectIncludes() {
    const base = `${triponRelPrefix()}components/`;
    triponEnsureNavbarStyles();
    triponEnsureFooterStyles();
    if (triponIsPackageDetailsPage()) {
      triponEnsureFontAwesome();
    }

    return Promise.all([
      fetch(`${base}navbar.html`).then((r) => {
        if (!r.ok) {
          throw new Error(`navbar ${r.status}`);
        }
        return r.text();
      }),
      fetch(`${base}mobile-menu.html`).then((r) => {
        if (!r.ok) {
          throw new Error(`mobile-menu ${r.status}`);
        }
        return r.text();
      }),
      fetch(`${base}footer.html`).then((r) => {
        if (!r.ok) {
          throw new Error(`footer ${r.status}`);
        }
        return r.text();
      }),
      fetch(`${base}popups.html`).then((r) => {
        if (!r.ok) {
          throw new Error(`popups ${r.status}`);
        }
        return r.text();
      }),
    ])
      .then(([navT, mobileT, footT, popT]) => {
        const navHtml = applyComponentUrls(navT);
        const mobileHtml = applyComponentUrls(mobileT);
        const footHtml = applyComponentUrls(footT);
        const popHtml = applyComponentUrls(popT);
        const navZone = document.getElementById("tripon-navbar-zone");
        const footZone = document.getElementById("tripon-footer-zone");
        const popZone = document.getElementById("tripon-popups-zone");

        if (navZone) {
          navZone.innerHTML = `${navHtml}${mobileHtml}`;
        }
        if (footZone) {
          footZone.innerHTML = footHtml;
        }
        if (popZone) {
          popZone.innerHTML = popHtml;
        }

        triponApplyFooterExtraClass();
        triponFooterA11ySync();
        return triponLoadNavbarScript().then(() => {
          if (typeof g.triponInitNavbar === "function") {
            g.triponInitNavbar();
          } else {
            triponPaintNavActiveFallback();
          }
          triponFooterA11ySync();
        });
      })
      .catch((e) => {
        console.warn(
          "[Tripon] Shared HTML components could not be loaded. Use a local web server (http://localhost) instead of opening files directly from disk.",
          e
        );
      });
  }

  function triponLoadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(s);
    });
  }

  function triponPageNeedsGsap() {
    return !!document.querySelector(
      "[data-tripon-blogs-gsap], [data-tripon-family-tour-gsap], [data-tripon-trip-days], [data-tripon-reasons-gsap], [data-tripon-adventure-3d]"
    );
  }

  function triponEnsureGsapBundle() {
    if (g.gsap && g.ScrollTrigger) {
      return Promise.resolve();
    }
    if (!triponPageNeedsGsap()) {
      return Promise.resolve();
    }
    const gsapSrc = "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js";
    const stSrc = "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/ScrollTrigger.min.js";
    return triponLoadScript(gsapSrc).then(() => triponLoadScript(stSrc));
  }

  function triponBootMain() {
    const prefix = triponRelPrefix();
    const loadLuxuryPickers = () => {
      if (g.TriponLuxuryCalendar) {
        return Promise.resolve();
      }
      return triponLoadScript(`${prefix}assets/js/package-details.js`);
    };

    return triponInjectSiteAmbient().then(() => triponInjectIncludes()).then(() => {
      return triponEnsureGsapBundle().then(() => {
        return loadLuxuryPickers().then(() => {
          return triponLoadScript(`${prefix}assets/js/packages-catalog.js`).then(() => {
            return triponLoadScript(`${prefix}assets/js/main.js`);
          });
        });
      });
    });
  }

  g.triponRelPrefix = triponRelPrefix;
  g.triponInjectIncludes = triponInjectIncludes;
  g.triponBootMain = triponBootMain;
  g.triponEnsureNavbarStyles = triponEnsureNavbarStyles;

  function triponEnsureFooterStylesEarly() {
    if (!document.getElementById("tripon-footer-zone")) {
      return;
    }
    triponEnsureFooterStyles();
  }

  function triponMarkNavbarLayoutEarly() {
    if (!document.getElementById("tripon-navbar-zone")) {
      return;
    }
    document.body?.classList.add("has-tripon-navbar");
    const navKey = (document.body?.dataset?.triponNav || "").toLowerCase();
    const path = (g.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    const innerRoute =
      navKey && navKey !== "home" ||
      /\/(packages|locations|blogs|company|offers)(\/|$)/.test(path);
    if (innerRoute) {
      document.body?.classList.remove("tripon-home-page");
    }
  }

  function triponIsPackageDetailsPage() {
    if (document.body?.classList.contains("package-details-page")) {
      return true;
    }
    const path = (g.location.pathname || "").replace(/\\/g, "/");
    return /\/packages\/[^/]+\/[^/]+\/[^/]+\.html?$/i.test(path);
  }

  function triponPageNeedsLuxuryPickerStyles() {
    return (
      triponIsPackageDetailsPage() ||
      !!document.querySelector(".home-screen .search-box input[type='date'], .hero .search-box")
    );
  }

  function triponEnsureFontAwesome() {
    if (
      document.getElementById("tripon-font-awesome-css") ||
      document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]')
    ) {
      return;
    }
    const link = document.createElement("link");
    link.id = "tripon-font-awesome-css";
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    document.head.appendChild(link);
  }

  function triponEnsureRoutePageStyles() {
    const prefix = triponRelPrefix();
    const add = (file, id) => {
      if (document.getElementById(id) || document.querySelector(`link[href*="${file}"]`)) {
        return;
      }
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `${prefix}assets/css/${file}`;
      document.head.appendChild(link);
    };

    const hasStaticLocation = !!document.querySelector("[data-static-location-page='true']");
    const hasHub =
      document.body?.classList.contains("all-locations-page") ||
      !!document.querySelector("[data-all-locations-hub='true']") ||
      (!!document.querySelector(".all-locations-main-wrap") &&
        !hasStaticLocation &&
        !document.querySelector(".location-shell"));
    const hasBlogDetails = !!document.querySelector(".blog-details-page");
    const hasLocationDetail =
      hasStaticLocation || (!!document.querySelector(".location-shell") && !hasHub);

    if (hasHub) {
      add("all-locations-page.css", "tripon-all-locations-page-css");
    }
    if (hasBlogDetails) {
      add("blog-details-page.css", "tripon-blog-details-page-css");
    }
    if (hasLocationDetail) {
      add("location-page.css", "tripon-location-page-css");
    }
  }

  function triponEnsurePackageDetailsStylesEarly() {
    if (!triponPageNeedsLuxuryPickerStyles()) {
      return;
    }
    if (document.querySelector('link[href*="package-details"]')) {
      return;
    }
    triponEnsureFontAwesome();
    const id = "tripon-package-details-css";
    if (document.getElementById(id)) {
      return;
    }
    const prefix = triponRelPrefix();
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `${prefix}assets/css/package-details.css`;
    document.head.appendChild(link);
  }

  /* Load navbar.css + layout class as early as possible */
  function triponBootstrapNavbarAssets() {
    triponMarkNavbarLayoutEarly();
    triponEnsureNavbarStyles();
    triponEnsureFooterStylesEarly();
    triponEnsureSiteAmbientStyles();
    triponEnsurePackageDetailsStylesEarly();
    triponEnsureRoutePageStyles();
  }

  function triponBootstrapSiteAmbient() {
    triponEnsureSiteAmbientStyles();
    if (document.body) {
      triponInjectSiteAmbient();
    } else {
      document.addEventListener("DOMContentLoaded", () => triponInjectSiteAmbient(), { once: true });
    }
  }

  if (document.head) {
    triponBootstrapNavbarAssets();
  } else {
    document.addEventListener("DOMContentLoaded", triponBootstrapNavbarAssets, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", triponBootstrapSiteAmbient, { once: true });
  } else {
    triponBootstrapSiteAmbient();
  }
})(typeof window !== "undefined" ? window : globalThis);
