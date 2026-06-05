/**
 * Animate On Scroll — init for Tripon fade/slide/reveal sections.
 * Expects AOS 2.3.4 from cdnjs (static link/script tags with SRI on each page).
 */
(function (g) {
  "use strict";

  const AOS_CDN_JS =
    "https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js";

  function triponRelPrefix() {
    if (typeof g.triponRelPrefix === "function") {
      return g.triponRelPrefix();
    }
    return "";
  }

  function triponLoadStylesheet(href, id) {
    if (document.getElementById(id) || document.querySelector(`link[href="${href}"]`)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load ${href}`));
      document.head.appendChild(link);
    });
  }

  function triponPageUsesAos() {
    return !!document.querySelector("[data-aos]");
  }

  function triponWaitForAosLibrary() {
    if (g.AOS) {
      return Promise.resolve();
    }
    const script = document.querySelector(`script[src="${AOS_CDN_JS}"], script[src*="aos/2.3.4/aos.js"]`);
    if (!script) {
      return Promise.reject(new Error("AOS script tag is missing from the page."));
    }
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const finishIfReady = () => {
        if (g.AOS) {
          resolve();
          return true;
        }
        if (attempts++ > 240) {
          reject(new Error("AOS failed to load."));
          return true;
        }
        return false;
      };
      const poll = () => {
        if (!finishIfReady()) {
          g.requestAnimationFrame(poll);
        }
      };
      script.addEventListener("load", poll, { once: true });
      script.addEventListener("error", () => reject(new Error("AOS script failed to load.")), { once: true });
      poll();
    });
  }

  function triponEnsureAosBundle() {
    if (!triponPageUsesAos()) {
      return Promise.resolve();
    }

    const prefix = triponRelPrefix();
    return triponWaitForAosLibrary().then(() =>
      triponLoadStylesheet(`${prefix}assets/css/tripon-aos.css`, "tripon-aos-custom-css")
    );
  }

  function triponInitAos() {
    if (!triponPageUsesAos() || !g.AOS) {
      return;
    }
    if (document.body.dataset.triponAosReady === "1") {
      g.AOS.refresh();
      return;
    }

    document.body.dataset.triponAosReady = "1";
    document.body.classList.add("tripon-aos-ready");

    const reduceMotion = g.matchMedia("(prefers-reduced-motion: reduce)").matches;

    g.AOS.init({
      once: true,
      offset: 80,
      duration: 800,
      easing: "ease-out-cubic",
      disable: reduceMotion,
    });
  }

  function triponRefreshAos() {
    if (g.AOS && document.body.dataset.triponAosReady === "1") {
      g.AOS.refresh();
    }
  }

  g.triponEnsureAosBundle = triponEnsureAosBundle;
  g.triponInitAos = triponInitAos;
  g.triponRefreshAos = triponRefreshAos;
})(window);
