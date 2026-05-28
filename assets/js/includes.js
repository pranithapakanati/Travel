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
    const href = `${triponRelPrefix()}assets/css/navbar.css`;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function triponLoadStylesheetAsync(href, id) {
    if (id && document.getElementById(id)) {
      return;
    }
    if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
      return;
    }
    const link = document.createElement("link");
    if (id) {
      link.id = id;
    }
    link.rel = "stylesheet";
    link.href = href;
    link.media = "print";
    link.onload = function () {
      this.media = "all";
      this.onload = null;
    };
    document.head.appendChild(link);
  }

  function triponEnsureFooterStyles() {
    const id = "tripon-footer-luxury-css";
    if (document.getElementById(id)) {
      return;
    }
    triponLoadStylesheetAsync(`${triponRelPrefix()}assets/css/footer-luxury.css`, id);
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
          '<span class="tripon-site-ambient__orb tripon-site-ambient__orb--1"></span>' +
          '<span class="tripon-site-ambient__orb tripon-site-ambient__orb--2"></span>' +
          '<span class="tripon-site-ambient__orb tripon-site-ambient__orb--3"></span>' +
          '<span class="tripon-site-ambient__leaf tripon-site-ambient__leaf--tl"></span>' +
          '<span class="tripon-site-ambient__leaf tripon-site-ambient__leaf--br"></span>' +
          '<svg class="tripon-site-ambient__plane-path" viewBox="0 0 220 80" aria-hidden="true"><line x1="10" y1="60" x2="200" y2="20" /></svg>' +
          '<span class="tripon-site-ambient__plane" aria-hidden="true"><i class="fa-solid fa-paper-plane"></i></span>';
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
        return triponLoadNavbarScript().then(() => {
          if (typeof g.triponInitNavbar === "function") {
            g.triponInitNavbar();
          } else {
            triponPaintNavActiveFallback();
          }
        });
      })
      .catch((e) => {
        console.warn(
          "[Tripon] Shared HTML components could not be loaded. Use a local web server (http://localhost) instead of opening files directly from disk.",
          e
        );
      });
  }

  function triponLoadScript(src, opts) {
    const options = opts || {};
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.triponLoaded === "1") {
          resolve();
          return;
        }
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
          once: true,
        });
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      if (options.defer !== false) {
        s.defer = true;
      }
      s.onload = () => {
        s.dataset.triponLoaded = "1";
        resolve();
      };
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(s);
    });
  }

  function triponRunWhenIdle(fn, timeout) {
    if (typeof g.triponRunWhenIdle === "function") {
      g.triponRunWhenIdle(fn, timeout);
      return;
    }
    if (typeof g.requestIdleCallback === "function") {
      g.requestIdleCallback(fn, { timeout: timeout || 2200 });
      return;
    }
    g.setTimeout(fn, 1);
  }

  function triponPageNeedsGsap() {
    return !!document.querySelector(
      "[data-tripon-blogs-gsap], [data-tripon-family-tour-gsap], [data-tripon-trip-days], [data-tripon-reasons-gsap], [data-tripon-why-choose-gsap], [data-tripon-adventure-3d], .contact-luxury"
    );
  }

  function triponPageNeedsMotionPath() {
    return !!document.querySelector("[data-tripon-family-tour-gsap]");
  }

  function triponPageNeedsLuxuryPickers() {
    return !!document.querySelector(
      ".luxury-date-trigger, .luxury-guests-trigger, .input-box--luxury-date, .input-box--luxury-guests, .hero-booking-modal__form"
    );
  }

  function triponEnsureGsapBundle() {
    if (g.gsap && g.ScrollTrigger) {
      return Promise.resolve();
    }
    if (!triponPageNeedsGsap()) {
      return Promise.resolve();
    }

    const load = () => {
      const gsapSrc = "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js";
      const stSrc = "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/ScrollTrigger.min.js";
      const mpSrc = "https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/MotionPathPlugin.min.js";
      return triponLoadScript(gsapSrc)
        .then(() => triponLoadScript(stSrc))
        .then(() => (triponPageNeedsMotionPath() ? triponLoadScript(mpSrc) : Promise.resolve()));
    };

    const mobile = g.matchMedia("(max-width: 768px)").matches;
    const reduced = g.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (mobile || reduced) {
      return new Promise((resolve) => {
        triponRunWhenIdle(() => {
          load().then(resolve).catch(resolve);
        }, 2800);
      });
    }

    return load();
  }

  function triponEnsurePerfScript() {
    const prefix = triponRelPrefix();
    const src = `${prefix}assets/js/perf.js`;
    if (document.querySelector(`script[src="${src}"]`)) {
      return Promise.resolve();
    }
    return triponLoadScript(src, { defer: false });
  }

  function triponBootMain() {
    const prefix = triponRelPrefix();
    const loadLuxuryPickers = () => {
      if (!triponPageNeedsLuxuryPickers()) {
        return Promise.resolve();
      }
      if (g.TriponLuxuryCalendar) {
        return Promise.resolve();
      }
      return triponLoadScript(`${prefix}assets/js/package-details.js`);
    };

    return triponEnsurePerfScript()
      .catch(() => Promise.resolve())
      .then(() => triponInjectSiteAmbient())
      .then(() => triponInjectIncludes())
      .then(() => {
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

  function triponEnsurePackageDetailsStylesEarly() {
    if (!document.body?.classList.contains("package-details-page")) {
      return;
    }
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
