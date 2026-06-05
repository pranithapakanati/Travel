/**
 * TRIPON Header — dropdowns, mobile drawer
 */
(function (g) {
  "use strict";

  if (g.triponNavbarHandlesMobile) return;
  g.triponNavbarHandlesMobile = true;

  function triponIsHomePage() {
    const path = (g.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    const navKey = (document.body?.dataset?.triponNav || "").toLowerCase();
    if (navKey && navKey !== "home") {
      return false;
    }
    if (
      /\/(packages|locations|blogs|company|offers)(\/|$)/.test(path) ||
      /\/(contact|people-reviews|cancellation-policy)(\/|$)/.test(path)
    ) {
      return false;
    }
    const segments = path.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "";
    if (/^index\.html?$/i.test(last)) {
      return segments.length <= 1;
    }
    if (path.endsWith("/")) {
      return segments.length <= 1;
    }
    if (!last.includes(".")) {
      return segments.length <= 1;
    }
    return false;
  }

  function triponResolveNavKey() {
    const key = document.body?.dataset?.triponNav || "";
    if (key) return key;
    const path = (g.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    if (path.includes("people-reviews")) return "people-reviews";
    if (path.includes("contact")) return "contact";
    if (path.includes("/blogs")) return "blogs";
    if (path.includes("/packages")) return "packages";
    if (path.includes("/locations")) return "locations";
    if (triponIsHomePage()) return "home";
    return "";
  }

  function triponPaintNavActive() {
    const key = triponResolveNavKey();
    document
      .querySelectorAll(
        ".tripon-header__link, .tripon-header__panel a, .tripon-nav__link, .main-nav a, .tripon-mobile-nav__item, .tripon-footer-nav__link"
      )
      .forEach((el) => el.classList.remove("is-active"));

    if (!key) return;

    document.querySelectorAll(`[data-nav-key="${key}"]`).forEach((el) => {
      if (el.closest(".tripon-footer")) return;
      el.classList.add("is-active");
    });

  }

  function triponBindHeaderDropdowns() {
    const dropdownItems = document.querySelectorAll(".tripon-header__item--dropdown");
    let timer = null;

    const closeAll = () => {
      dropdownItems.forEach((item) => {
        item.classList.remove("tripon-header__item--open");
        item.querySelectorAll(".tripon-header__panel, .tripon-header__flyout").forEach((el) => {
          el.setAttribute("hidden", "");
        });
        item.querySelector(".tripon-header__link--trigger")?.setAttribute("aria-expanded", "false");
      });
      document.getElementById("triponNavbar")?.classList.remove("tripon-header--mega-open");
    };

    const open = (item) => {
      closeAll();
      item.classList.add("tripon-header__item--open");
      item.querySelectorAll(".tripon-header__panel, .tripon-header__flyout").forEach((el) => {
        el.removeAttribute("hidden");
      });
      item.querySelector(".tripon-header__link--trigger")?.setAttribute("aria-expanded", "true");
      if (item.querySelector(".tripon-header__flyout")) {
        document.getElementById("triponNavbar")?.classList.add("tripon-header--mega-open");
      }
    };

    dropdownItems.forEach((item) => {
      const flyouts = item.querySelectorAll(".tripon-header__panel, .tripon-header__flyout");
      const trigger = item.querySelector(".tripon-header__link--trigger");

      item.addEventListener("mouseenter", () => {
        clearTimeout(timer);
        open(item);
      });
      item.addEventListener("mouseleave", () => {
        timer = setTimeout(closeAll, 150);
      });
      flyouts.forEach((flyout) => {
        flyout.addEventListener("mouseenter", () => clearTimeout(timer));
        flyout.addEventListener("mouseleave", () => {
          timer = setTimeout(closeAll, 150);
        });
      });
      trigger?.addEventListener("click", (e) => {
        e.preventDefault();
        item.classList.contains("tripon-header__item--open") ? closeAll() : open(item);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".tripon-header__bar")) closeAll();
    });
  }

  function triponBindScrollHeader() {
    const header = document.getElementById("triponNavbar");
    if (!header) return;

    let lastY = 0;
    let ticking = false;

    const tick = () => {
      const y = g.scrollY || 0;
      header.classList.toggle("tripon-header--scrolled", y > 24);
      if (y < 60) header.classList.remove("tripon-header--hidden");
      else if (y > lastY + 5) header.classList.add("tripon-header--hidden");
      else if (y < lastY - 5) header.classList.remove("tripon-header--hidden");
      lastY = y;
      ticking = false;
    };

    g.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          g.requestAnimationFrame(tick);
        }
      },
      { passive: true }
    );
    tick();
  }

  function triponBindMobileMenu() {
    const overlay = document.getElementById("homeMobileMenuOverlay");
    const toggle = document.getElementById("homeMobileMenuToggle");
    const closeBtn = document.getElementById("homeMobileDrawerClose");
    const panel = document.getElementById("homeMobileDrawer");
    const locationToggle = document.getElementById("homeMobileLocationToggle");
    const locationList = document.getElementById("homeMobileLocationList");
    const locationIcon = locationToggle?.querySelector(".home-mobile-location-icon");
    const mobileNav = overlay?.querySelector(".home-mobile-drawer-nav");
    const socialFab = document.getElementById("triponSocialFab");
    const socialFabPointerEvents = socialFab?.style?.pointerEvents || "";
    if (!overlay || !toggle) return;

    const setLocationExpanded = (expanded) => {
      if (!locationToggle || !locationList) {
        return;
      }
      locationToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      locationList.classList.toggle("active", expanded);
      if (locationIcon) {
        locationIcon.textContent = expanded ? "−" : "+";
      }
    };

    let savedScrollY = 0;
    let savedBodyPosition = "";
    let savedBodyTop = "";
    let savedBodyWidth = "";
    let savedHtmlOverflow = "";
    let savedBodyOverflow = "";

    const lockBackgroundScroll = () => {
      savedScrollY = g.scrollY || g.pageYOffset || 0;
      savedBodyPosition = document.body.style.position || "";
      savedBodyTop = document.body.style.top || "";
      savedBodyWidth = document.body.style.width || "";
      savedHtmlOverflow = document.documentElement.style.overflow || "";
      savedBodyOverflow = document.body.style.overflow || "";

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.width = "100%";
    };

    const unlockBackgroundScroll = () => {
      document.documentElement.style.overflow = savedHtmlOverflow;
      document.body.style.overflow = savedBodyOverflow;
      document.body.style.position = savedBodyPosition;
      document.body.style.top = savedBodyTop;
      document.body.style.width = savedBodyWidth;
      g.scrollTo(0, savedScrollY);
    };

    const preventBackgroundMove = (event) => {
      const target = event.target;
      const insidePanel = target instanceof Element && panel && panel.contains(target);
      if (!insidePanel) {
        event.preventDefault();
      }
    };

    const close = () => {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      overlay.removeEventListener("touchmove", preventBackgroundMove);
      overlay.removeEventListener("wheel", preventBackgroundMove);
      if (socialFab) {
        socialFab.style.pointerEvents = socialFabPointerEvents;
      }
      unlockBackgroundScroll();
    };
    const open = () => {
      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      lockBackgroundScroll();
      overlay.addEventListener("touchmove", preventBackgroundMove, { passive: false });
      overlay.addEventListener("wheel", preventBackgroundMove, { passive: false });
      if (socialFab) {
        socialFab.style.pointerEvents = "none";
      }
    };

    toggle.addEventListener("click", () => (overlay.classList.contains("active") ? close() : open()));
    closeBtn?.addEventListener("click", close);
    overlay.querySelector("[data-tripon-menu-close]")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.classList.contains("tripon-mobile-menu__backdrop")) close();
    });
    if (locationToggle && locationList) {
      const initialExpanded =
        locationToggle.getAttribute("aria-expanded") === "true" ||
        locationList.classList.contains("active");
      setLocationExpanded(initialExpanded);
      locationToggle.addEventListener("click", () => {
        const expanded = locationToggle.getAttribute("aria-expanded") === "true";
        setLocationExpanded(!expanded);
      });
    }
    const mobileNavHrefByKey = {
      home: `${triponResolveRelPrefix()}index.html`,
      locations: `${triponResolveRelPrefix()}locations/`,
      packages: `${triponResolveRelPrefix()}packages/`,
      contact: `${triponResolveRelPrefix()}company/contact-us.html`,
      "people-reviews": `${triponResolveRelPrefix()}company/people-reviews.html`,
    };

    mobileNav?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const a = target.closest(".tripon-mobile-nav__item");
      if (!(a instanceof HTMLAnchorElement)) {
        return;
      }
      if (!mobileNav.contains(a)) {
        return;
      }
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const navKey = (a.getAttribute("data-nav-key") || "").trim();
        const mappedHref = navKey ? mobileNavHrefByKey[navKey] : "";
        const href = mappedHref || a.getAttribute("href") || "";
        if (!href) {
          return;
        }
        const targetUrl = new URL(href, g.location.href).toString();
        g.location.assign(targetUrl);
      }, true);
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  function triponResolveRelPrefix() {
    if (typeof g.triponRelPrefix === "function") {
      return g.triponRelPrefix();
    }
    const path = (g.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    if (/\/packages\/bali\/[^/]+\/[^/]+\.html?$/i.test(path)) {
      return "../../../";
    }
    if (/\/packages\/[^/]+\/[^/]+\.html?$/i.test(path) || /\/locations\/bali\/[^/]+\.html?$/i.test(path)) {
      return "../../";
    }
    if (/\/(blogs|locations|packages|company|offers)(\/|$)/i.test(path)) {
      return "../";
    }
    return "";
  }

  function triponOpenBookingPopup() {
    if (typeof g.triponOpenBookingPopup === "function") {
      g.triponOpenBookingPopup();
      return true;
    }
    if (typeof g.triponShowMobilePrefModal === "function") {
      g.triponShowMobilePrefModal();
      return true;
    }
    const modal = document.getElementById("mobilePrefModal");
    if (modal) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return true;
    }
    g.location.href = `${triponResolveRelPrefix()}company/contact-us.html`;
    return false;
  }

  const TRIPON_DEST_STORAGE_KEY = "tripon_selected_destination";

  const TRIPON_DEST_COUNTRY = {
    Bali: "INDONESIA",
    Thailand: "THAILAND",
    Maldives: "MALDIVES",
    Dubai: "UAE",
    Indonesia: "INDONESIA",
    Singapore: "SINGAPORE",
  };

  const TRIPON_DEST_FROM_HASH = {
    bali: "Bali",
    thailand: "Thailand",
    maldives: "Maldives",
    dubai: "Dubai",
    singapore: "Singapore",
    indonesia: "Indonesia",
  };

  function triponResolveSelectedDestination() {
    const hash = (g.location.hash || "").replace(/^#/, "").toLowerCase();
    if (hash && TRIPON_DEST_FROM_HASH[hash]) {
      return TRIPON_DEST_FROM_HASH[hash];
    }
    const path = (g.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    if (/\/locations\/bali(\/|$)/.test(path)) {
      return "Bali";
    }
    try {
      const stored = g.localStorage?.getItem(TRIPON_DEST_STORAGE_KEY);
      if (stored) {
        return stored;
      }
    } catch (_err) {
      /* ignore */
    }
    return "Bali";
  }

  function triponApplySelectedDestination(label) {
    const name = (label || "").trim();
    if (!name) {
      return;
    }

    const labelEl = document.getElementById("triponDestPickerLabel");
    const trigger = document.getElementById("triponDestPickerTrigger");
    if (labelEl) {
      labelEl.textContent = name;
    }
    if (trigger) {
      trigger.setAttribute("aria-label", `Selected destination, ${name}`);
    }

    const mobileToggle = document.getElementById("homeMobileLocationToggle");
    const mobileToggleLabel = mobileToggle?.querySelector("span");
    if (mobileToggleLabel && !mobileToggleLabel.classList.contains("home-mobile-location-icon")) {
      mobileToggleLabel.textContent = name;
    }

    const country = TRIPON_DEST_COUNTRY[name] || name.toUpperCase();
    document.querySelectorAll(".mobile-pref-brand").forEach((brand) => {
      brand.textContent = "";
      brand.append(document.createTextNode(`${name} `));
      const countrySpan = document.createElement("span");
      countrySpan.textContent = country;
      brand.appendChild(countrySpan);
    });

    document.querySelectorAll(".mobile-pref-title").forEach((title) => {
      if (/stay in /i.test(title.textContent)) {
        title.textContent = title.textContent.replace(/stay in [^.?!]+/i, `stay in ${name}`);
      }
    });

    document.querySelectorAll(".tripon-dest-gallery__kicker").forEach((kicker) => {
      kicker.textContent = `Discover ${name}`;
    });

    if (typeof g.triponAnimateHeroDestinationLine === "function") {
      g.triponAnimateHeroDestinationLine(name);
    } else {
      const destLine = document.querySelector("[data-hero-dest-line] .hero-t-line__inner");
      if (destLine) {
        destLine.textContent = `${name} !`;
      }
    }

    try {
      g.localStorage?.setItem(TRIPON_DEST_STORAGE_KEY, name);
    } catch (_err) {
      /* ignore */
    }

    g.dispatchEvent(new CustomEvent("tripon:destination-change", { detail: { label: name, country } }));
  }

  function triponBindDestinationPicker() {
    const picker = document.querySelector("[data-tripon-dest-picker]");
    if (!picker) {
      return;
    }

    triponApplySelectedDestination(triponResolveSelectedDestination());

    const onPick = (link) => {
      const label =
        link.getAttribute("data-tripon-dest-label") ||
        link.querySelector("strong")?.textContent?.trim() ||
        link.textContent.trim();
      if (label) {
        triponApplySelectedDestination(label);
      }
    };

    picker.querySelectorAll("[data-tripon-dest-label]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const label = (link.getAttribute("data-tripon-dest-label") || "").trim().toLowerCase();
        onPick(link);
        if (label && label !== "bali") {
          event.preventDefault();
        }
      });
    });

    document.querySelectorAll("#homeMobileLocationList [data-tripon-dest-label]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const label = (link.getAttribute("data-tripon-dest-label") || "").trim().toLowerCase();
        onPick(link);
        if (label && label !== "bali") {
          event.preventDefault();
        }
      });
    });

    g.addEventListener("hashchange", () => {
      const fromHash = (g.location.hash || "").replace(/^#/, "").toLowerCase();
      if (fromHash && TRIPON_DEST_FROM_HASH[fromHash]) {
        triponApplySelectedDestination(TRIPON_DEST_FROM_HASH[fromHash]);
      }
    });
  }

  function triponBindPlanMyTripCta() {
    document.querySelectorAll("[data-tripon-open-booking], #triponPlanMyTripBtn").forEach((btn) => {
      if (btn.dataset.triponBookingBound === "1") {
        return;
      }
      btn.dataset.triponBookingBound = "1";
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        triponOpenBookingPopup();
      });
    });
  }

  function triponInitNavbar() {
    document.body.classList.add("tripon-nav-ready", "has-tripon-navbar");
    if (triponIsHomePage()) {
      document.body.classList.add("tripon-home-page");
    } else {
      document.body.classList.remove("tripon-home-page");
    }

    triponPaintNavActive();
    triponBindHeaderDropdowns();
    triponBindScrollHeader();
    triponBindMobileMenu();
    triponBindPlanMyTripCta();
    triponBindDestinationPicker();
  }

  g.triponInitNavbar = triponInitNavbar;
  g.triponPaintNavActive = triponPaintNavActive;
  g.triponOpenBookingPopupFromNav = triponOpenBookingPopup;
  g.triponApplySelectedDestination = triponApplySelectedDestination;
  g.triponResolveSelectedDestination = triponResolveSelectedDestination;
})(window);
