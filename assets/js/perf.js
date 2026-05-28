/**
 * TRIPON — shared performance helpers (non-breaking UI).
 */
(function (g) {
  "use strict";

  function triponLoadStylesheet(href, id) {
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

  function triponEnsureFontAwesome() {
    const id = "tripon-fontawesome-css";
    if (document.getElementById(id)) {
      return;
    }
    const existing = document.querySelector('link[href*="font-awesome"][rel="stylesheet"]');
    if (existing) {
      existing.id = id;
      if (existing.media !== "all") {
        existing.media = "print";
        existing.onload = function () {
          this.media = "all";
          this.onload = null;
        };
        if (existing.sheet) {
          existing.media = "all";
        }
      }
      return;
    }
    triponLoadStylesheetAsync(
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
      id
    );
  }

  function triponRunWhenIdle(fn, timeout) {
    if (typeof g.requestIdleCallback === "function") {
      g.requestIdleCallback(fn, { timeout: timeout || 2000 });
      return;
    }
    g.setTimeout(fn, 1);
  }

  function triponIsMobilePerf() {
    return g.matchMedia("(max-width: 768px)").matches;
  }

  function triponDeferNonCriticalCss() {
    const prefix =
      typeof g.triponRelPrefix === "function" ? g.triponRelPrefix() : "";

    if (document.body?.classList.contains("package-details-page")) {
      return;
    }

    const needsPickers = !!document.querySelector(
      ".luxury-date-trigger, .luxury-guests-trigger, .input-box--luxury-date, .hero-booking-modal__form"
    );
    if (!needsPickers) {
      return;
    }

    if (!document.querySelector('link[href*="package-details.css"]')) {
      triponLoadStylesheetAsync(`${prefix}assets/css/package-details.css`, "tripon-package-details-deferred");
    }
  }

  function triponInitHeadPerf() {
    triponEnsureFontAwesome();
    triponDeferNonCriticalCss();
  }

  g.triponLoadStylesheet = triponLoadStylesheet;
  g.triponLoadStylesheetAsync = triponLoadStylesheetAsync;
  g.triponEnsureFontAwesome = triponEnsureFontAwesome;
  g.triponRunWhenIdle = triponRunWhenIdle;
  g.triponIsMobilePerf = triponIsMobilePerf;
  g.triponInitHeadPerf = triponInitHeadPerf;

  if (document.head) {
    triponInitHeadPerf();
  } else {
    document.addEventListener("DOMContentLoaded", triponInitHeadPerf, { once: true });
  }
})(typeof window !== "undefined" ? window : globalThis);
