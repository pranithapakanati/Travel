(function (g) {
  function triponRelPrefix() {
    const path = (g.location.pathname || "").replace(/\\/g, "/");
    if (/\/blogs\//i.test(path) || /\/locations\//i.test(path) || /\/packages\//i.test(path)) {
      return "../";
    }
    return "";
  }

  function applyComponentUrls(html) {
    return html.split("__TRIPON_REL__").join(triponRelPrefix());
  }

  function triponPaintNavActive() {
    const key = document.body && document.body.dataset ? document.body.dataset.triponNav : "";
    if (!key) {
      return;
    }
    document.querySelectorAll(".main-nav a.is-active").forEach((el) => el.classList.remove("is-active"));
    document.querySelectorAll(".home-mobile-drawer-nav a.is-active").forEach((el) => el.classList.remove("is-active"));
    document.querySelectorAll(".contact-btn.is-active").forEach((el) => el.classList.remove("is-active"));
    document.querySelectorAll(".main-nav a[data-nav-key]").forEach((el) => {
      if (el.getAttribute("data-nav-key") === key) {
        el.classList.add("is-active");
      }
    });
    document.querySelectorAll(".home-mobile-drawer-nav a[data-nav-key]").forEach((el) => {
      if (el.getAttribute("data-nav-key") === key) {
        el.classList.add("is-active");
      }
    });
    if (key === "contact") {
      document.querySelector(".contact-btn")?.classList.add("is-active");
    }
    const baliLink = document.querySelector("#homeMobileLocationList a[href$='index.html'], #homeMobileLocationList a[href*='index.html']");
    if (baliLink && /bali/i.test(baliLink.textContent || "")) {
      baliLink.classList.add("is-active");
    }
  }

  function triponApplyFooterExtraClass() {
    const extra = document.body && document.body.dataset ? document.body.dataset.triponFooterClass : "";
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
    const base = triponRelPrefix() + "components/";
    return Promise.all([
      fetch(base + "navbar.html").then((r) => {
        if (!r.ok) {
          throw new Error("navbar " + r.status);
        }
        return r.text();
      }),
      fetch(base + "footer.html").then((r) => {
        if (!r.ok) {
          throw new Error("footer " + r.status);
        }
        return r.text();
      }),
      fetch(base + "popups.html").then((r) => {
        if (!r.ok) {
          throw new Error("popups " + r.status);
        }
        return r.text();
      }),
    ])
      .then(([navT, footT, popT]) => {
        const navHtml = applyComponentUrls(navT);
        const footHtml = applyComponentUrls(footT);
        const popHtml = applyComponentUrls(popT);
        const navZone = document.getElementById("tripon-navbar-zone");
        const footZone = document.getElementById("tripon-footer-zone");
        const popZone = document.getElementById("tripon-popups-zone");
        if (navZone) {
          navZone.innerHTML = navHtml;
        }
        if (footZone) {
          footZone.innerHTML = footHtml;
        }
        if (popZone) {
          popZone.innerHTML = popHtml;
        }
        triponApplyFooterExtraClass();
        triponPaintNavActive();
      })
      .catch((e) => {
        console.warn(
          "[Tripon] Shared HTML components could not be loaded. Use a local web server (http://localhost) instead of opening files directly from disk.",
          e
        );
      });
  }

  function triponBootMain() {
    return triponInjectIncludes().then(() => {
      return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = triponRelPrefix() + "assets/js/main.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load main.js"));
        document.body.appendChild(s);
      });
    });
  }

  g.triponRelPrefix = triponRelPrefix;
  g.triponInjectIncludes = triponInjectIncludes;
  g.triponBootMain = triponBootMain;
})(typeof window !== "undefined" ? window : globalThis);
