const triponInitMain = () => {
  const setActive = (items, activeItem, className = "active") => {
    items.forEach((item) => item.classList.remove(className));
    if (activeItem) {
      activeItem.classList.add(className);
    }
  };

  const showStatus = (message) => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "18px";
    toast.style.right = "18px";
    toast.style.padding = "10px 14px";
    toast.style.background = "#102937";
    toast.style.color = "#fff";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "13px";
    toast.style.zIndex = "9999";
    toast.style.boxShadow = "0 8px 18px rgba(0,0,0,0.2)";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1700);
  };

  /** Build a clean blogs/<slug>.html URL from any page depth. */
  const triponBlogDetailsBasePrefix = () => {
    const path = (window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    if (path.includes("/packages/package-details")) {
      return "../";
    }
    if (/\/locations(\/|$)/i.test(path)) {
      return "../";
    }
    return "";
  };

  const triponBlogDetailPageHref = (slug) => {
    const path = (window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
    if (/\/blogs\/[^/]+\.html?$/i.test(path)) {
      return `${encodeURIComponent(slug)}.html`;
    }
    const base = triponBlogDetailsBasePrefix();
    return `${base}blogs/${encodeURIComponent(slug)}.html`;
  };

  const triponBlogDetailsReplaceHistory = (postSlug) => {
    const pathRaw = window.location.pathname.replace(/\\/g, "/");

    const replaced = pathRaw.replace(
      /\/blogs\/[^/]+(?:\/|\.html)?$/iu,
      `/blogs/${encodeURIComponent(postSlug)}.html`
    );
    if (replaced !== pathRaw && /\/blogs\//iu.test(replaced)) {
      window.history.replaceState(null, "", replaced);
      return;
    }

    window.history.replaceState(null, "", `/blogs/${encodeURIComponent(postSlug)}.html`);
  };

  const buildStarIcons = (starText) => {
    const chars = Array.from((starText || "").replace(/\s+/g, "")).filter((ch) => ch === "★" || ch === "☆");
    if (!chars.length) {
      return "";
    }
    return chars
      .map((ch) => (ch === "★"
        ? '<i class="fa-solid fa-star" aria-hidden="true"></i>'
        : '<i class="fa-regular fa-star" aria-hidden="true"></i>'))
      .join("");
  };

  // Replace plain text stars with icon stars across pages.
  const replaceTextStarsWithIcons = () => {
    const ratingLikeNodes = Array.from(
      document.querySelectorAll(".rating, .contact-explore-rating, .blog-related-rating, .review-rating")
    );
    ratingLikeNodes.forEach((node) => {
      const rawText = node.textContent || "";
      const starText = rawText.match(/[★☆]+/)?.[0] || "";
      const icons = buildStarIcons(starText);
      if (!icons) {
        return;
      }
      const detailSpan = node.querySelector("span");
      node.innerHTML = detailSpan ? `${icons} ${detailSpan.outerHTML}` : icons;
    });

    const starOnlyNodes = Array.from(document.querySelectorAll(".stars, .reviews-stars"));
    starOnlyNodes.forEach((node) => {
      const rawText = node.textContent || "";
      const starText = rawText.match(/[★☆]+/)?.[0] || "";
      const icons = buildStarIcons(starText);
      if (!icons) {
        return;
      }
      node.innerHTML = icons;
    });

    const metricStarNodes = Array.from(document.querySelectorAll(".reviews-metrics h3"));
    metricStarNodes.forEach((node) => {
      const rawText = node.textContent || "";
      const starText = rawText.match(/[★☆]+/)?.[0] || "";
      if (!starText) {
        return;
      }
      const icons = buildStarIcons(starText);
      if (!icons) {
        return;
      }
      const numericText = rawText.replace(/[★☆]/g, "").trim();
      node.innerHTML = `${numericText} <span>${icons}</span>`;
    });
  };

  /** Removes all Unicode digit characters (for name fields: letters only, no numbers). */
  const stripUnicodeDigitsFromString = (value) => {
    if (typeof value !== "string") {
      return "";
    }
    try {
      return value.replace(/\p{Nd}/gu, "");
    } catch {
      return value.replace(/\d/g, "").replace(/[\uFF10-\uFF19]/g, "");
    }
  };

  const bindNameFieldNoDigits = (input) => {
    if (!input) {
      return;
    }
    input.addEventListener("input", () => {
      const prev = input.value;
      const next = stripUnicodeDigitsFromString(prev);
      if (next !== prev) {
        const start = input.selectionStart ?? prev.length;
        const end = input.selectionEnd ?? prev.length;
        input.value = next;
        const newStart = stripUnicodeDigitsFromString(prev.slice(0, start)).length;
        const newEnd = stripUnicodeDigitsFromString(prev.slice(0, end)).length;
        input.setSelectionRange(newStart, newEnd);
      }
    });
    input.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      if (e.key && /^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });
  };

  const sanitizePhoneValue = (raw, maxDigits) => {
    const digits = (raw || "").replace(/\D/g, "");
    let result = "";
    for (let i = 0; i < digits.length && result.length < maxDigits; i++) {
      if (result.length < 5 && "12345".includes(digits[i])) continue;
      result += digits[i];
    }
    return result;
  };

  const bindPhoneFieldDigitsOnly = (input, maxDigits = 10) => {
    if (!input) {
      return;
    }
    input.addEventListener("input", () => {
      input.value = sanitizePhoneValue(input.value, maxDigits);
    });
    input.addEventListener("paste", () => {
      window.setTimeout(() => {
        input.value = sanitizePhoneValue(input.value, maxDigits);
      }, 0);
    });
  };

  const animateVisiblePackageCards = (cards) => {
    let visibleIndex = 0;
    cards.forEach((card) => {
      if (card.style.display === "none") {
        card.classList.remove("package-card-animate");
        return;
      }
      card.classList.remove("package-card-animate");
      card.style.animationDelay = `${visibleIndex * 90}ms`;
      // Force reflow so animation replays after each filter change.
      void card.offsetWidth;
      card.classList.add("package-card-animate");
      visibleIndex += 1;
    });
  };

  const homeRoot = document.querySelector("#homeScreen");
  replaceTextStarsWithIcons();

  // Navbar: switch between Home, People Reviews, and Packages screens
  const pageRoot = document.querySelector(".page");
  const homeScreen = document.querySelector("#homeScreen");
  const reviewsScreen = document.querySelector("#peopleReviewsScreen");
  const packagesScreen = document.querySelector("#packagesScreen");
  const contactScreen = document.querySelector("#contactScreen");
  const reviewsNavLink = document.querySelector('.main-nav a[data-view="reviews"]');
  const packagesNavLink = document.querySelector('.main-nav a[data-view="packages"]');
  const contactBtn = document.querySelector(".contact-btn");
  const reviewsContinueBtn = document.querySelector(".reviews-continue");

  const paintNavState = (active) => {
    [reviewsNavLink, packagesNavLink].forEach((link) => link?.classList.remove("is-active"));
    contactBtn?.classList.remove("is-active");
    if (active === "reviews") {
      reviewsNavLink?.classList.add("is-active");
    }
    if (active === "packages") {
      packagesNavLink?.classList.add("is-active");
    }
    if (active === "contact") {
      contactBtn?.classList.add("is-active");
    }
  };

  const showScreen = (view) => {
    if (!pageRoot || !homeScreen || !reviewsScreen || !packagesScreen || !contactScreen) {
      return;
    }

    pageRoot.classList.remove("reviews-active", "packages-active", "contact-active");
    if (view === "reviews") {
      pageRoot.classList.add("reviews-active");
    }
    if (view === "packages") {
      pageRoot.classList.add("packages-active");
    }
    if (view === "contact") {
      pageRoot.classList.add("contact-active");
    }

    paintNavState(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showReviewsScreen = () => {
    showScreen("reviews");
  };

  const showPackagesScreen = () => {
    showScreen("packages");
  };

  const showHomeScreen = () => {
    showScreen("home");
  };

  const showContactScreen = () => {
    showScreen("contact");
  };

  reviewsNavLink?.addEventListener("click", (event) => {
    event.preventDefault();
    showReviewsScreen();
  });

  packagesNavLink?.addEventListener("click", (event) => {
    event.preventDefault();
    showPackagesScreen();
  });

  reviewsContinueBtn?.addEventListener("click", () => {
    showHomeScreen();
  });

  contactBtn?.addEventListener("click", (event) => {
    if (pageRoot && homeScreen && reviewsScreen && packagesScreen && contactScreen) {
      event.preventDefault();
      showContactScreen();
    }
  });

  const homeMobileMenuToggle = document.querySelector("#homeMobileMenuToggle");
  const homeMobileMenuOverlay = document.querySelector("#homeMobileMenuOverlay");
  const homeMobileDrawerClose = document.querySelector("#homeMobileDrawerClose");
  const homeMobileDrawerLinks = Array.from(document.querySelectorAll(".home-mobile-drawer-nav a"));
  const homeMobileLocationToggle = document.querySelector("#homeMobileLocationToggle");
  const homeMobileLocationList = document.querySelector("#homeMobileLocationList");
  const homeMobileLocationIcon = homeMobileLocationToggle?.querySelector(".home-mobile-location-icon");

  const hideHomeMobileMenu = () => {
    if (!homeMobileMenuOverlay) {
      return;
    }
    homeMobileMenuOverlay.classList.remove("active");
    homeMobileMenuOverlay.setAttribute("aria-hidden", "true");
    homeMobileMenuToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  const showHomeMobileMenu = () => {
    if (!homeMobileMenuOverlay) {
      return;
    }
    homeMobileMenuOverlay.classList.add("active");
    homeMobileMenuOverlay.setAttribute("aria-hidden", "false");
    homeMobileMenuToggle?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  homeMobileMenuToggle?.addEventListener("click", () => {
    const isOpen = homeMobileMenuOverlay?.classList.contains("active");
    if (isOpen) {
      hideHomeMobileMenu();
      return;
    }
    showHomeMobileMenu();
  });

  homeMobileDrawerClose?.addEventListener("click", hideHomeMobileMenu);
  homeMobileMenuOverlay?.addEventListener("click", (event) => {
    if (event.target === homeMobileMenuOverlay) {
      hideHomeMobileMenu();
    }
  });
  homeMobileDrawerLinks.forEach((link) => {
    link.addEventListener("click", hideHomeMobileMenu);
  });
  homeMobileLocationToggle?.addEventListener("click", () => {
    const isOpen = homeMobileLocationList?.classList.contains("active");
    homeMobileLocationList?.classList.toggle("active", !isOpen);
    homeMobileLocationToggle.setAttribute("aria-expanded", String(!isOpen));
    if (homeMobileLocationIcon) {
      homeMobileLocationIcon.textContent = isOpen ? "+" : "−";
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideHomeMobileMenu();
    }
  });

  paintNavState("home");

  const triponPageRelPrefix = () =>
    (typeof window.triponRelPrefix === "function" ? window.triponRelPrefix() : "");

  document.querySelectorAll(".want-more-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = `${triponPageRelPrefix()}blogs.html`;
    });
  });

  document.querySelectorAll(".location-blogs-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = `${triponPageRelPrefix()}blogs.html`;
    });
  });

  // People reviews screen: row arrows + active card focus
  const reviewsShell = document.querySelector(".reviews-shell");
  if (reviewsShell) {
    const reviewRows = Array.from(reviewsShell.querySelectorAll(".reviews-row"));

    reviewRows.forEach((row) => {
      const cards = Array.from(row.querySelectorAll(".reviews-card, .reviews-media-card"));
      const arrows = Array.from(row.querySelectorAll(".reviews-side-arrow"));
      let activeIndex = 0;
      const isMediaRow = row.classList.contains("reviews-row-media");
      /* ≤768 mobile/tablet strips; narrow phones ≤430 stay one-card-wide (320 / 375 / 425 UX). */
      const reviewsMobileMql = window.matchMedia("(max-width: 768px)");
      const reviewsNarrowPhoneMql = window.matchMedia("(max-width: 430px)");
      const isReviewsMobileLayout = () => reviewsMobileMql.matches;
      const isReviewsNarrowPhone = () => reviewsNarrowPhoneMql.matches;
      const shouldAutoMoveLeft = row.classList.contains("reviews-row-top") || row.classList.contains("reviews-row-bottom");
      let rowAutoTimer = null;
      let autoScrollIndex = 0;
      let syncMediaRowLayout = () => {};
      const shouldPackageStyleMove = shouldAutoMoveLeft && !isMediaRow;
      const horizontalStripActive = () =>
        shouldPackageStyleMove || (isMediaRow && isReviewsMobileLayout());

      if (!cards.length) {
        return;
      }

      if (shouldPackageStyleMove) {
        const baseCards = Array.from(row.querySelectorAll(".reviews-card"));
        const isSmallReviewLayout = () => isReviewsMobileLayout();
        if (baseCards.length) {
          while (row.querySelectorAll(".reviews-card").length < 6) {
            baseCards.forEach((card) => {
              if (row.querySelectorAll(".reviews-card").length < 6) {
                row.appendChild(card.cloneNode(true));
              }
            });
          }
        }
        row.style.display = "flex";
        row.style.flexWrap = "nowrap";
        row.style.overflowX = "auto";
        row.style.overflowY = "hidden";
        row.style.scrollSnapType = "x mandatory";
        row.style.scrollBehavior = "smooth";
        row.style.scrollbarWidth = "none";
        row.style.gap = isSmallReviewLayout() ? "12px" : "20px";
        row.style.alignItems = "stretch";

        const applyReviewCardWidth = () => {
          const oneUpWidth = "min(100%, calc(100% - 12px))";
          const twoUpWidth = "calc((100% - 12px) / 2)";
          const desktopCardWidth = "calc((100% - 40px) / 3)";
          let targetWidth = desktopCardWidth;
          if (isSmallReviewLayout()) {
            targetWidth = isReviewsNarrowPhone() ? oneUpWidth : twoUpWidth;
          }
          row.style.gap = isSmallReviewLayout() ? "12px" : "20px";
          Array.from(row.querySelectorAll(".reviews-card")).forEach((cardNode) => {
            cardNode.style.flex = `0 0 ${targetWidth}`;
            cardNode.style.minWidth = targetWidth;
            cardNode.style.maxWidth = targetWidth;
            cardNode.style.scrollSnapAlign = "start";
            cardNode.style.margin = "0";
          });
        };
        applyReviewCardWidth();
        window.addEventListener("resize", applyReviewCardWidth);
        reviewsMobileMql.addEventListener("change", applyReviewCardWidth);
        reviewsNarrowPhoneMql.addEventListener("change", applyReviewCardWidth);
      } else if (isMediaRow) {
        const applyMediaStripWidth = () => {
          if (!isReviewsMobileLayout()) {
            return;
          }
          row.style.gap = "12px";
          const w = isReviewsNarrowPhone()
            ? "min(100%, calc(100% - 12px))"
            : "calc((100% - 12px) / 2)";
          Array.from(row.querySelectorAll(".reviews-media-card")).forEach((node) => {
            node.style.flex = `0 0 ${w}`;
            node.style.minWidth = w;
            node.style.maxWidth = w;
            node.style.scrollSnapAlign = "start";
            node.style.margin = "0";
          });
        };

        const clearMediaRowStripStyles = () => {
          row.style.display = "";
          row.style.flexWrap = "";
          row.style.overflowX = "";
          row.style.overflowY = "";
          row.style.scrollSnapType = "";
          row.style.scrollBehavior = "";
          row.style.scrollbarWidth = "";
          row.style.gap = "";
          row.style.alignItems = "";
          Array.from(row.querySelectorAll(".reviews-media-card")).forEach((node) => {
            node.style.flex = "";
            node.style.minWidth = "";
            node.style.maxWidth = "";
            node.style.scrollSnapAlign = "";
            node.style.margin = "";
          });
        };

        syncMediaRowLayout = () => {
          if (!isReviewsMobileLayout()) {
            clearMediaRowStripStyles();
            return;
          }
          row.style.display = "flex";
          row.style.flexWrap = "nowrap";
          row.style.overflowX = "auto";
          row.style.overflowY = "hidden";
          row.style.scrollSnapType = "x mandatory";
          row.style.scrollBehavior = "smooth";
          row.style.scrollbarWidth = "none";
          row.style.gap = "12px";
          row.style.alignItems = "stretch";
          applyMediaStripWidth();
        };

        syncMediaRowLayout();
        window.addEventListener("resize", applyMediaStripWidth);
      }

      const syncMediaVideos = () => {
        if (!isMediaRow) {
          return;
        }
        cards.forEach((card) => {
          const v = card.querySelector("video");
          if (v) {
            v.play().catch(() => {});
          }
        });
      };

      const renderRow = () => {
        cards.forEach((card, idx) => {
          const isActive = idx === activeIndex;
          card.classList.remove("is-media-active");
          card.style.opacity = "1";
          card.style.transform = isMediaRow ? "translateY(0)" : (isActive ? "translateY(-2px)" : "translateY(0)");
          card.style.transition = "all 220ms ease";
        });
        row.classList.remove("reviews-row-media--rotator");
        syncMediaVideos();
      };

      arrows.forEach((arrow) => {
        arrow.style.pointerEvents = "auto";
        arrow.style.cursor = "pointer";
        arrow.addEventListener("click", () => {
          const isNextArrow = arrow.classList.contains("reviews-side-arrow-right");
          if (isNextArrow) {
            activeIndex = (activeIndex + 1) % cards.length;
          } else {
            activeIndex = (activeIndex - 1 + cards.length) % cards.length;
          }
          renderRow();
        });
      });

      cards.forEach((card, idx) => {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
          activeIndex = idx;
          renderRow();
        });
      });

      const stopRowAutoplay = () => {
        if (rowAutoTimer) {
          window.clearInterval(rowAutoTimer);
          rowAutoTimer = null;
        }
      };

      const carouselCardSelector = () =>
        shouldPackageStyleMove ? ".reviews-card" : ".reviews-media-card";

      const moveRowLeftByOneCard = () => {
        if (!horizontalStripActive()) {
          return;
        }
        const rowCards = Array.from(row.querySelectorAll(carouselCardSelector()));
        if (rowCards.length < 2) {
          return;
        }
        autoScrollIndex = (autoScrollIndex + 1) % rowCards.length;
        row.scrollTo({
          left: rowCards[autoScrollIndex].offsetLeft,
          behavior: "smooth"
        });
      };

      const startRowAutoplay = (immediate = false) => {
        stopRowAutoplay();
        const wantsAutoplay = cards.length >= 2 && horizontalStripActive();
        if (!wantsAutoplay) {
          return;
        }
        const slideMs = 2600;
        if (immediate && horizontalStripActive()) {
          moveRowLeftByOneCard();
        }
        rowAutoTimer = window.setInterval(() => {
          moveRowLeftByOneCard();
        }, slideMs);
      };

      const onReviewsCarouselBreakpointChange = () => {
        syncMediaRowLayout();
        stopRowAutoplay();
        renderRow();
        startRowAutoplay(false);
      };
      reviewsMobileMql.addEventListener("change", onReviewsCarouselBreakpointChange);
      reviewsNarrowPhoneMql.addEventListener("change", onReviewsCarouselBreakpointChange);

      row.addEventListener(
        "scroll",
        () => {
          if (!horizontalStripActive()) {
            return;
          }
          const rowCards = Array.from(row.querySelectorAll(carouselCardSelector()));
          if (!rowCards.length) {
            return;
          }
          const nearestIndex = rowCards.reduce((bestIndex, card, idx) => {
            const bestDistance = Math.abs(rowCards[bestIndex].offsetLeft - row.scrollLeft);
            const currentDistance = Math.abs(card.offsetLeft - row.scrollLeft);
            return currentDistance < bestDistance ? idx : bestIndex;
          }, 0);
          autoScrollIndex = nearestIndex;
        },
        { passive: true }
      );

      row.addEventListener("mouseenter", stopRowAutoplay);
      row.addEventListener("mouseleave", startRowAutoplay);
      row.addEventListener("touchstart", stopRowAutoplay, { passive: true });
      row.addEventListener("touchend", startRowAutoplay);

      renderRow();
      startRowAutoplay(true);
    });
  }

  // People reviews screen: play 30-second place videos from selected media images
  const reviewsVideoTriggers = Array.from(document.querySelectorAll(".reviews-video-trigger"));
  const reviewsVideoOverlay = document.querySelector("#reviewsVideoOverlay");
  const reviewsVideoClose = document.querySelector("#reviewsVideoClose");
  const reviewsPlaceVideo = document.querySelector("#reviewsPlaceVideo");
  const reviewsPlaceVideoSource = document.querySelector("#reviewsPlaceVideoSource");

  if (reviewsVideoTriggers.length && reviewsVideoOverlay && reviewsVideoClose && reviewsPlaceVideo && reviewsPlaceVideoSource) {
    const openReviewsVideo = (videoSrc) => {
      if (videoSrc) {
        reviewsPlaceVideo.pause();
        reviewsPlaceVideoSource.src = videoSrc;
        reviewsPlaceVideo.load();
      }
      reviewsVideoOverlay.classList.add("active");
      reviewsVideoOverlay.setAttribute("aria-hidden", "false");
      reviewsPlaceVideo.currentTime = 0;
      reviewsPlaceVideo.play().catch(() => {});
    };

    const closeReviewsVideo = () => {
      reviewsPlaceVideo.pause();
      reviewsPlaceVideo.currentTime = 0;
      reviewsVideoOverlay.classList.remove("active");
      reviewsVideoOverlay.setAttribute("aria-hidden", "true");
    };

    reviewsVideoTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openReviewsVideo(trigger.getAttribute("data-video-src"));
      });

      trigger.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          openReviewsVideo(trigger.getAttribute("data-video-src"));
        }
      });
    });

    reviewsPlaceVideo.addEventListener("timeupdate", () => {
      if (reviewsPlaceVideo.currentTime >= 30) {
        closeReviewsVideo();
      }
    });

    reviewsVideoClose.addEventListener("click", closeReviewsVideo);
    reviewsVideoOverlay.addEventListener("click", (event) => {
      if (event.target === reviewsVideoOverlay) {
        closeReviewsVideo();
      }
    });
  }

  // Location dropdown toggle
  const locationWrapper = document.querySelector(".location-dropdown-wrapper");
  if (locationWrapper) {
    const locationPill = locationWrapper.querySelector(".location-pill");
    const locationDropdown = locationWrapper.querySelector(".location-dropdown");
    const locationLinks = locationDropdown.querySelectorAll("a");

    locationPill.addEventListener("click", () => {
      locationWrapper.classList.toggle("active");
      locationDropdown.classList.toggle("active");
    });

    locationLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const selectedLocation = link.dataset.location;
        const displayName = link.textContent.trim();
        locationPill.textContent = displayName + " ";
        const chevron = document.createElement("i");
        chevron.className = "fa-solid fa-chevron-down location-chevron";
        chevron.setAttribute("aria-hidden", "true");
        locationPill.appendChild(chevron);
        locationWrapper.classList.remove("active");
        locationDropdown.classList.remove("active");
        showStatus(`Selected: ${displayName}`);
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!locationWrapper.contains(e.target)) {
        locationWrapper.classList.remove("active");
        locationDropdown.classList.remove("active");
      }
    });
  }

  // Hero section: lightweight form behavior
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    const heroImage = heroSection.querySelector("img");
    if (heroImage) {
      const heroSlides = [
        { src: "/assets/images/img1.png", alt: "Bali beach" },
        { src: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=max&w=1600&q=80", alt: "Bali cliffside coast" },
        { src: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=max&w=1600&q=80", alt: "Tropical Bali island view" },
        { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=max&w=1600&q=80", alt: "Sunset beach in Bali" }
      ];
      const FADE_DURATION_MS = 1800;
      const SLIDE_INTERVAL_MS = 6500;
      let activeSlideIndex = Math.max(
        0,
        heroSlides.findIndex((slide) => (slide.src || "").includes("img1.png"))
      );
      let isSlideTransitioning = false;

      heroImage.style.transition = `opacity ${FADE_DURATION_MS}ms ease-in-out`;
      heroImage.style.opacity = "1";

      const preloadSlide = (slide) =>
        new Promise((resolve) => {
          const image = new Image();
          image.onload = () => resolve(slide);
          image.onerror = () => resolve(slide);
          image.src = slide.src;
        });

      const paintHeroSlide = async (index) => {
        const slide = heroSlides[index];
        if (!slide || isSlideTransitioning) {
          return;
        }

        isSlideTransitioning = true;
        const handleFadeOut = (event) => {
          if (event.propertyName !== "opacity") {
            return;
          }
          heroImage.removeEventListener("transitionend", handleFadeOut);
          heroImage.src = slide.src;
          heroImage.alt = slide.alt;
          window.requestAnimationFrame(() => {
            heroImage.addEventListener(
              "transitionend",
              (fadeInEvent) => {
                if (fadeInEvent.propertyName !== "opacity") {
                  return;
                }
                isSlideTransitioning = false;
              },
              { once: true }
            );
            heroImage.style.opacity = "1";
          });
        };

        heroImage.addEventListener("transitionend", handleFadeOut);
        heroImage.style.opacity = "0";
      };

      Promise.all(heroSlides.map(preloadSlide)).then(() => {
        window.setInterval(() => {
          if (isSlideTransitioning) {
            return;
          }
          activeSlideIndex = (activeSlideIndex + 1) % heroSlides.length;
          void paintHeroSlide(activeSlideIndex);
        }, SLIDE_INTERVAL_MS);
      });
    }

    const searchInputs = heroSection.querySelectorAll(".search-box .field input");
    const heroNameInput = heroSection.querySelector('.search-box .field input[type="text"]');
    const heroPhoneInput = heroSection.querySelector('.search-box .field input[type="tel"]');
    const travelDateInput = heroSection.querySelector('.search-box .field input[type="date"]');
    const heroTravelersInput = heroSection.querySelector('.search-box .field input[type="number"]');
    const travelDateField = travelDateInput?.closest(".field");
    const getTodayDateString = () => {
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      return localDate.toISOString().split("T")[0];
    };

    const validateHeroFields = () => {
      if (heroNameInput) {
        const nameValue = heroNameInput.value.trim();
        if (!nameValue) {
          heroNameInput.setCustomValidity("");
        } else if (nameValue.length < 2) {
          heroNameInput.setCustomValidity("Please enter at least 2 characters.");
        } else {
          heroNameInput.setCustomValidity("");
        }
      }

      if (heroPhoneInput) {
        const digitsOnly = heroPhoneInput.value.replace(/\D/g, "").slice(0, 10);
        heroPhoneInput.value = digitsOnly;
        if (!digitsOnly) {
          heroPhoneInput.setCustomValidity("");
        } else if (digitsOnly.length !== 10) {
          heroPhoneInput.setCustomValidity("Please enter a valid 10-digit phone number.");
        } else {
          heroPhoneInput.setCustomValidity("");
        }
      }

      if (heroTravelersInput) {
        const travelersValue = Number(heroTravelersInput.value);
        if (!heroTravelersInput.value) {
          heroTravelersInput.setCustomValidity("");
        } else if (Number.isNaN(travelersValue) || travelersValue < 1 || travelersValue > 20) {
          heroTravelersInput.setCustomValidity("Please enter travelers between 1 and 20.");
        } else {
          heroTravelersInput.setCustomValidity("");
        }
      }
    };

    if (travelDateInput) {
      travelDateInput.min = getTodayDateString();
      const validateTravelDate = () => {
        if (!travelDateInput.value) {
          travelDateInput.setCustomValidity("");
          return;
        }
        if (travelDateInput.value < travelDateInput.min) {
          travelDateInput.setCustomValidity("Invalid date. Please select a future date.");
          return;
        }
        travelDateInput.setCustomValidity("");
      };

      validateTravelDate();
      travelDateInput.addEventListener("input", validateTravelDate);
      travelDateInput.addEventListener("change", validateTravelDate);
    }

    bindNameFieldNoDigits(heroNameInput);
    validateHeroFields();
    heroNameInput?.addEventListener("input", validateHeroFields);
    heroPhoneInput?.addEventListener("input", validateHeroFields);
    heroTravelersInput?.addEventListener("input", validateHeroFields);

    const openTravelDatePicker = () => {
      if (!travelDateInput) {
        return;
      }
      travelDateInput.focus();
      if (typeof travelDateInput.showPicker === "function") {
        travelDateInput.showPicker();
      }
    };

    const closeTravelDatePicker = () => {
      if (!travelDateInput) {
        return;
      }
      if (document.activeElement === travelDateInput) {
        travelDateInput.blur();
      }
    };

    travelDateField?.addEventListener("click", openTravelDatePicker);
    travelDateInput?.addEventListener("click", openTravelDatePicker);

    const heroSearchForm = heroSection.querySelector(".search-box");
    const submitPopup = document.querySelector("#submitPopup");
    const submitPopupClose = document.querySelector("#submitPopupClose");
    const submitPopupIconClose = document.querySelector("#submitPopupIconClose");
    const hideSubmitPopup = () => {
      if (!submitPopup) {
        return;
      }
      submitPopup.classList.remove("active");
      submitPopup.setAttribute("aria-hidden", "true");
    };
    const showSubmitPopup = () => {
      if (!submitPopup) {
        return;
      }
      closeTravelDatePicker();
      submitPopup.classList.add("active");
      submitPopup.setAttribute("aria-hidden", "false");
    };
    submitPopupClose?.addEventListener("click", hideSubmitPopup);
    submitPopupIconClose?.addEventListener("click", hideSubmitPopup);
    submitPopup?.addEventListener("click", (event) => {
      if (event.target === submitPopup) {
        hideSubmitPopup();
      }
    });

    const clearHeroValidationState = () => {
      const fields = heroSection.querySelectorAll(".search-box .field");
      fields.forEach((field) => {
        field.classList.remove("hero-field-error");
        field.querySelector(".hero-validation-tooltip")?.remove();
      });
    };

    const showHeroValidationMessage = (input, message) => {
      const parentField = input?.closest(".field");
      if (!parentField) {
        return;
      }

      clearHeroValidationState();
      parentField.classList.add("hero-field-error");

      const tip = document.createElement("div");
      tip.className = "hero-validation-tooltip";
      tip.innerHTML = '<span class="hero-validation-icon" aria-hidden="true"></span><span class="hero-validation-text"></span>';
      tip.querySelector(".hero-validation-text").textContent = message;
      parentField.appendChild(tip);
      input.focus();
    };

    const getHeroValidationMessage = (input) => input?.validationMessage || "Please fill out this field.";

    heroSearchForm?.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        if (input.value.trim()) {
          clearHeroValidationState();
        }
      });
    });

    const sendBtn = heroSection.querySelector(".send-btn");
    let heroSendStateTimer = null;
    const setHeroSendButtonState = (state) => {
      if (!sendBtn) {
        return;
      }
      sendBtn.classList.remove("is-sending", "is-submitted");
      sendBtn.disabled = false;

      if (state === "sending") {
        sendBtn.classList.add("is-sending");
        sendBtn.textContent = "Sending";
        sendBtn.disabled = true;
        return;
      }

      if (state === "submitted") {
        sendBtn.classList.add("is-submitted");
        sendBtn.textContent = "Submitted";
        sendBtn.disabled = true;
        return;
      }

      sendBtn.textContent = "➤";
    };

    sendBtn?.addEventListener("click", () => {
      if (!heroSearchForm) {
        return;
      }
      if (sendBtn.disabled) {
        return;
      }
      const invalidInput = Array.from(heroSearchForm.querySelectorAll("input")).find((input) => !input.checkValidity());
      if (invalidInput) {
        showHeroValidationMessage(invalidInput, getHeroValidationMessage(invalidInput));
        return;
      }
      clearHeroValidationState();
      window.clearTimeout(heroSendStateTimer);
      setHeroSendButtonState("sending");
      heroSendStateTimer = window.setTimeout(() => {
        setHeroSendButtonState("submitted");
        heroSendStateTimer = window.setTimeout(() => {
          showSubmitPopup();
          heroSearchForm?.reset();
          setHeroSendButtonState("default");
        }, 550);
      }, 900);
    });
  }

  // Booking preferences modal: any page with #mobilePrefModal; desktop auto-open matches home (10s, then every 15s).
  const mobilePrefModal = document.querySelector("#mobilePrefModal");
  if (mobilePrefModal) {
    const blurHeroTravelDateIfFocused = () => {
      const travelDateInput = document.querySelector('.hero .search-box .field input[type="date"]');
      if (travelDateInput && document.activeElement === travelDateInput) {
        travelDateInput.blur();
      }
    };

    const mobileHeroBookingTrigger = document.querySelector(".mobile-hero-booking-trigger");
    const familyTourBookingTrigger = document.querySelector("#familyTourBookingTrigger");
    const mobilePrefClose = document.querySelector("#mobilePrefClose");
    const mobilePrefSteps = Array.from(document.querySelectorAll(".mobile-pref-step"));
    const mobilePrefNext = document.querySelector("#mobilePrefNext");
    const mobilePrefPrev = document.querySelector("#mobilePrefPrev");
    const mobilePrefActions = document.querySelector("#mobilePrefActions");
    let mobilePrefStepIndex = 0;

    const PREF_MODAL_POST_INTERACTION_COOLDOWN_MS = 40000;
    let prefModalAutoOpenSuppressedUntil = 0;
    let prefModalLockedScrollY = 0;
    const schedulePrefModalAutoCooldown = () => {
      prefModalAutoOpenSuppressedUntil = Math.max(
        prefModalAutoOpenSuppressedUntil,
        Date.now() + PREF_MODAL_POST_INTERACTION_COOLDOWN_MS
      );
    };

    const lockPageScrollForPrefModal = () => {
      prefModalLockedScrollY = window.scrollY || window.pageYOffset || 0;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${prefModalLockedScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    };

    const unlockPageScrollForPrefModal = () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, prefModalLockedScrollY);
    };

    const isActiveInPrefModalPauseRegion = () => {
      const el = document.activeElement;
      if (!el || el === document.body) {
        return false;
      }
      if (mobilePrefModal.classList.contains("active") && mobilePrefModal.contains(el)) {
        return true;
      }
      if (el.closest(".hero .search-box")) {
        return true;
      }
      if (el.closest(".contact-form")) {
        return true;
      }
      if (el.closest(".blog-details-comment-form")) {
        return true;
      }
      if (el.closest(".subscribe-showcase-form")) {
        return true;
      }
      if (el.closest(".submit-popup-overlay.active")) {
        return true;
      }
      if (el.closest(".reviews-video-overlay.active")) {
        return true;
      }
      return false;
    };

    const isMobilePrefStepValid = () => {
      const stepNumber = mobilePrefStepIndex + 1;
      const activeStep = mobilePrefSteps[mobilePrefStepIndex];
      if (!activeStep) {
        return false;
      }

      if (stepNumber >= 1 && stepNumber <= 3) {
        return Boolean(activeStep.querySelector('input[type="radio"]:checked'));
      }

      if (stepNumber === 4) {
        return Boolean(activeStep.querySelector('input[name="travelerName"]')?.value.trim());
      }

      if (stepNumber === 5) {
        const phone = activeStep.querySelector('input[name="travelerPhone"]')?.value.trim() || "";
        const phoneDigits = phone.replace(/\D/g, "");
        return phoneDigits.length === 10 || phoneDigits.length === 11;
      }

      if (stepNumber === 6) {
        return Boolean(activeStep.querySelector('input[type="radio"]:checked'));
      }

      return true;
    };

    const paintMobilePrefStep = () => {
      mobilePrefSteps.forEach((stepNode, idx) => {
        stepNode.classList.toggle("active", idx === mobilePrefStepIndex);
      });
      if (!mobilePrefNext || !mobilePrefPrev || !mobilePrefActions) {
        return;
      }

      const isFinalThankYou = mobilePrefStepIndex === 6;
      mobilePrefActions.style.display = isFinalThankYou ? "none" : "grid";

      if (!isFinalThankYou) {
        const currentStep = mobilePrefStepIndex + 1;
        const isCurrentStepValid = isMobilePrefStepValid();
        mobilePrefNext.textContent = currentStep === 6 ? "Submit" : `Next (${currentStep}/6)`;
        mobilePrefNext.classList.toggle("is-enabled", isCurrentStepValid);
        // Show Previous only from step 2 onwards.
        const shouldShowPrevious = currentStep > 1;
        mobilePrefPrev.style.display = shouldShowPrevious ? "block" : "none";
        mobilePrefPrev.style.pointerEvents = shouldShowPrevious ? "auto" : "none";
      }
    };

    const hideMobilePrefModal = () => {
      mobilePrefModal.classList.remove("active");
      mobilePrefModal.setAttribute("aria-hidden", "true");
      unlockPageScrollForPrefModal();
      mobilePrefStepIndex = 0;
      paintMobilePrefStep();
      schedulePrefModalAutoCooldown();
    };

    const showMobilePrefModal = () => {
      blurHeroTravelDateIfFocused();
      mobilePrefModal.classList.add("active");
      mobilePrefModal.setAttribute("aria-hidden", "false");
      lockPageScrollForPrefModal();
      mobilePrefStepIndex = 0;
      paintMobilePrefStep();
    };

    window.triponShowMobilePrefModal = showMobilePrefModal;
    window.triponHideMobilePrefModal = hideMobilePrefModal;

    const advanceMobilePrefStep = () => {
      mobilePrefStepIndex = Math.min(mobilePrefStepIndex + 1, mobilePrefSteps.length - 1);
      paintMobilePrefStep();
    };

    mobilePrefModal.querySelectorAll('input[name="travelerName"]').forEach((node) => bindNameFieldNoDigits(node));
    mobilePrefModal.querySelectorAll('input[name="travelerPhone"]').forEach((node) => bindPhoneFieldDigitsOnly(node, 11));

    mobileHeroBookingTrigger?.addEventListener("click", showMobilePrefModal);
    familyTourBookingTrigger?.addEventListener("click", showMobilePrefModal);
    mobilePrefClose?.addEventListener("click", hideMobilePrefModal);
    mobilePrefNext?.addEventListener("click", () => {
      if (!isMobilePrefStepValid()) {
        showStatus("Please select or fill this step");
        return;
      }
      advanceMobilePrefStep();
    });
    mobilePrefPrev?.addEventListener("click", () => {
      mobilePrefStepIndex = Math.max(mobilePrefStepIndex - 1, 0);
      paintMobilePrefStep();
    });
    mobilePrefModal.addEventListener("click", (event) => {
      if (event.target === mobilePrefModal) {
        hideMobilePrefModal();
      }
    });

    const mobileStepInputs = Array.from(
      mobilePrefModal.querySelectorAll('input[type="radio"], input[type="text"], input[type="tel"], input[type="email"]')
    );
    mobileStepInputs.forEach((input) => {
      input.addEventListener("change", () => {
        paintMobilePrefStep();

        // Auto-move to next step on radio option selection.
        if (input.type !== "radio") {
          return;
        }
        const inputStep = input.closest(".mobile-pref-step");
        const activeStep = mobilePrefSteps[mobilePrefStepIndex];
        const currentStep = mobilePrefStepIndex + 1;
        const isAutoAdvanceStep = currentStep === 1 || currentStep === 2 || currentStep === 3 || currentStep === 6;

        if (inputStep === activeStep && isAutoAdvanceStep && isMobilePrefStepValid()) {
          window.setTimeout(() => {
            advanceMobilePrefStep();
          }, 120);
        }
      });
      input.addEventListener("input", paintMobilePrefStep);
    });
    paintMobilePrefStep();

    // Desktop: first auto-open at 10s, then every 15s — paused while user is in a form/dialog, then cool down after.
    if (
      window.matchMedia("(min-width: 992px)").matches &&
      !mobilePrefModal.hasAttribute("data-disable-auto-open")
    ) {
      const PREF_MODAL_FOCUSOUT_SETTLE_MS = 400;
      let prefModalFocusOutSettleTimer = null;

      const tryOpenDesktopPrefModal = () => {
        if (mobilePrefModal.classList.contains("active")) {
          return;
        }
        if (Date.now() < prefModalAutoOpenSuppressedUntil) {
          return;
        }
        if (isActiveInPrefModalPauseRegion()) {
          return;
        }
        showMobilePrefModal();
      };

      document.addEventListener(
        "focusout",
        () => {
          window.clearTimeout(prefModalFocusOutSettleTimer);
          prefModalFocusOutSettleTimer = window.setTimeout(() => {
            if (!isActiveInPrefModalPauseRegion()) {
              schedulePrefModalAutoCooldown();
            }
          }, PREF_MODAL_FOCUSOUT_SETTLE_MS);
        },
        true
      );

      window.setTimeout(() => {
        tryOpenDesktopPrefModal();
        window.setInterval(() => {
          tryOpenDesktopPrefModal();
        }, 15000);
      }, 10000);
    }
  }

  // Adventure section: move place cards left/right one by one
  const adventureSections = document.querySelectorAll(".adventure, .adventure-section, [data-adventure-section]");

  adventureSections.forEach((section) => {
    const row = section.querySelector(".place-row");
    let items = Array.from(section.querySelectorAll(".place-item"));
    const initialPlaceOrder = row ? Array.from(row.querySelectorAll(".place-item")) : [];
    const controls = section.querySelectorAll(".arrow-controls button");
    const ANIMATION_MS = 480;
    const isSwipeLayout = () => window.matchMedia("(max-width: 430px)").matches;
    /** ≥431px: same as desktop — transform carousel, DOM rotate, timed advance (not native overflow-x scroll). */
    const usesAdventureTransformCarousel = () => window.matchMedia("(min-width: 431px)").matches;
    let isAnimating = false;
    let activeSwipeIndex = 0;
    let carouselIntervalId = null;

    const swipeRowPropList = [
      "display",
      "flex-wrap",
      "overflow-x",
      "overflow-y",
      "scrollbar-width",
      "-ms-overflow-style",
      "scroll-snap-type",
      "scroll-behavior",
      "gap",
      "padding",
      "align-items"
    ];

    const swipeItemPropList = [
      "flex",
      "width",
      "min-width",
      "max-width",
      "box-sizing",
      "display",
      "grid-template-columns",
      "column-gap",
      "flex-direction",
      "flex-wrap",
      "gap",
      "justify-content",
      "align-items",
      "text-align",
      "height",
      "min-height",
      "padding",
      "border-radius",
      "border",
      "background",
      "scroll-snap-align",
      "box-shadow",
      "color",
      "overflow"
    ];

    const swipeContentPropList = [
      "display",
      "flex-direction",
      "justify-content",
      "min-width",
      "width",
      "flex",
      "order",
      "row-gap",
      "overflow"
    ];
    const swipeIconPropList = [
      "display",
      "flex",
      "flex-shrink",
      "order",
      "position",
      "z-index",
      "align-self",
      "margin-top",
      "min-width",
      "max-width",
      "place-items",
      "visibility",
      "opacity",
      "width",
      "height",
      "font-size",
      "border",
      "background",
      "color",
      "font-family",
      "font-weight",
      "border-radius",
      "box-shadow"
    ];
    const swipeTitlePropList = [
      "margin",
      "line-height",
      "color",
      "font-size",
      "font-weight",
      "white-space",
      "display",
      "overflow",
      "overflow-wrap",
      "word-break",
      "-webkit-box-orient",
      "-webkit-line-clamp",
      "line-clamp"
    ];
    const swipeSubtitlePropList = [
      "margin",
      "margin-top",
      "line-height",
      "white-space",
      "color",
      "background",
      "padding",
      "border-radius",
      "display",
      "max-width",
      "font-size",
      "box-sizing",
      "overflow",
      "overflow-wrap",
      "word-break",
      "-webkit-box-orient",
      "-webkit-line-clamp",
      "line-clamp"
    ];

    const clearSwipeCardStyles = () => {
      if (!row) {
        return;
      }
      swipeRowPropList.forEach((prop) => row.style.removeProperty(prop));
      row.classList.remove("hide-mobile-scrollbar");
      items.forEach((item) => {
        swipeItemPropList.forEach((prop) => item.style.removeProperty(prop));
        const content = item.querySelector(".place-content");
        const title = item.querySelector(".place-content h3");
        const subtitle = item.querySelector(".place-content span");
        const icon = item.querySelector(".place-icon");
        if (content) {
          swipeContentPropList.forEach((prop) => content.style.removeProperty(prop));
        }
        if (icon) {
          swipeIconPropList.forEach((prop) => icon.style.removeProperty(prop));
        }
        if (title) {
          swipeTitlePropList.forEach((prop) => title.style.removeProperty(prop));
        }
        if (subtitle) {
          swipeSubtitlePropList.forEach((prop) => subtitle.style.removeProperty(prop));
        }
      });
    };

    const fitSwipeAdventureSubtitleFonts = () => {
      if (!row || !isSwipeLayout()) {
        return;
      }

      row.querySelectorAll(".place-item:not(.place-item-see-all)").forEach((item) => {
        const content = item.querySelector(".place-content");
        const subtitle = item.querySelector(".place-content span");
        if (!content || !subtitle) {
          return;
        }
        const cap = Math.max(64, Math.floor(content.getBoundingClientRect().width));

        /* Shrink pill text so the full line fits inside the white card (scroll row width caps max-width). */
        for (let fs = 10; fs >= 6.5; fs -= 0.5) {
          subtitle.style.setProperty("font-size", `${fs}px`, "important");
          if (subtitle.scrollWidth <= cap + 1) {
            break;
          }
        }
      });
    };

    const applySwipeCardStyles = () => {
      if (!row) {
        return;
      }
      if (!isSwipeLayout()) {
        clearSwipeCardStyles();
        return;
      }

      const rowWidth = row.clientWidth || row.getBoundingClientRect().width;
      /** Card grows with subtitle pill up to viewport row width — fixed px width caused pill overflow outside the white card */
      const maxCardWidthPx = Math.max(220, Math.round(rowWidth));
      const vwRaw =
        typeof window !== "undefined" ? window.visualViewport?.width ?? window.innerWidth : rowWidth;
      const vwPxRounded =
        typeof vwRaw === "number" && Number.isFinite(vwRaw) ? Math.round(vwRaw) : maxCardWidthPx;
      /** Swipe strip is ≤430px; older rules only tweaked 321–375px so 390-wide emulators kept `white-space: normal` on see-all → wrapped title/pill */
      const setImportant = (node, prop, value) => {
        node.style.setProperty(prop, value, "important");
      };

      setImportant(row, "display", "flex");
      setImportant(row, "flex-wrap", "nowrap");
      setImportant(row, "overflow-x", "auto");
      setImportant(row, "overflow-y", "hidden");
      setImportant(row, "scrollbar-width", "none");
      setImportant(row, "-ms-overflow-style", "none");
      setImportant(row, "scroll-snap-type", "x mandatory");
      setImportant(row, "scroll-behavior", "smooth");
      setImportant(row, "gap", "12px");
      setImportant(row, "padding", "0 4px 4px");
      setImportant(row, "align-items", "flex-start");
      row.classList.add("hide-mobile-scrollbar");

      items.forEach((item) => {
        const isSeeAll = item.classList.contains("place-item-see-all");
        const itemMaxWidthPx =
          isSeeAll ? Math.max(maxCardWidthPx, vwPxRounded - 8) : maxCardWidthPx;

        setImportant(item, "flex", "0 0 auto");
        setImportant(item, "width", "max-content");
        setImportant(item, "min-width", `min(220px, ${maxCardWidthPx}px)`);
        setImportant(item, "max-width", `${itemMaxWidthPx}px`);
        setImportant(item, "text-align", "left");
        setImportant(item, "height", "auto");
        setImportant(item, "min-height", "0");
        setImportant(item, "padding", isSeeAll ? "12px 10px" : "10px 12px");
        setImportant(item, "box-sizing", "border-box");
        setImportant(item, "border-radius", "14px");
        setImportant(item, "scroll-snap-align", "start");
        setImportant(item, "box-shadow", "none");

        if (isSeeAll) {
          /* Flex row keeps the Bali icon from disappearing (grid + max-content was collapsing the icon track on some widths). */
          item.style.removeProperty("grid-template-columns");
          item.style.removeProperty("column-gap");
          setImportant(item, "display", "flex");
          setImportant(item, "flex-direction", "row");
          setImportant(item, "flex-wrap", "nowrap");
          setImportant(item, "align-items", "flex-start");
          setImportant(item, "justify-content", "flex-start");
          setImportant(item, "gap", "12px");
          setImportant(item, "overflow", "visible");
          setImportant(item, "border", "1px solid rgba(255, 255, 255, 0.35)");
          setImportant(
            item,
            "background",
            "linear-gradient(120deg, #0f7c6b 0%, #17a589 100%)"
          );
          setImportant(item, "color", "#ffffff");
        } else {
          item.style.removeProperty("flex-direction");
          item.style.removeProperty("flex-wrap");
          item.style.removeProperty("gap");
          item.style.removeProperty("justify-content");
          setImportant(item, "display", "grid");
          setImportant(item, "column-gap", "12px");
          setImportant(item, "align-items", "center");
          setImportant(item, "grid-template-columns", "44px max-content");
          setImportant(item, "border", "1px solid #e6ebf2");
          setImportant(item, "background", "#ffffff");
        }

        const content = item.querySelector(".place-content");
        const title = item.querySelector(".place-content h3");
        const subtitle = item.querySelector(".place-content span");
        const icon = item.querySelector(".place-icon");
        if (content) {
          setImportant(content, "display", "flex");
          setImportant(content, "flex-direction", "column");
          setImportant(content, "justify-content", "center");
          setImportant(content, "min-width", "0");
          setImportant(content, "width", isSeeAll ? "auto" : "100%");
          if (isSeeAll) {
            setImportant(content, "flex", "1 1 auto");
            setImportant(content, "order", "1");
          } else {
            content.style.removeProperty("flex");
            content.style.removeProperty("order");
          }
          setImportant(content, "overflow", "visible");
          setImportant(content, "row-gap", "6px");
        }
        if (icon) {
          if (isSeeAll) {
            setImportant(icon, "display", "grid");
            setImportant(icon, "flex", "0 0 44px");
            setImportant(icon, "flex-shrink", "0");
            setImportant(icon, "order", "0");
            setImportant(icon, "position", "relative");
            setImportant(icon, "z-index", "1");
            setImportant(icon, "align-self", "flex-start");
            setImportant(icon, "margin-top", "2px");
            setImportant(icon, "min-width", "44px");
            setImportant(icon, "max-width", "44px");
            setImportant(icon, "place-items", "center");
            setImportant(icon, "visibility", "visible");
            setImportant(icon, "opacity", "1");
            setImportant(icon, "width", "44px");
            setImportant(icon, "height", "44px");
            setImportant(icon, "font-size", "18px");
            setImportant(icon, "border-radius", "50%");
            setImportant(icon, "border", "2px solid rgba(255, 255, 255, 0.9)");
            setImportant(icon, "background", "#f5fffb");
            setImportant(icon, "color", "#0f7c6b");
            setImportant(icon, "font-family", '"Caveat", cursive');
            setImportant(icon, "font-weight", "700");
            setImportant(icon, "box-shadow", "none");
          } else {
            icon.style.removeProperty("flex");
            icon.style.removeProperty("flex-shrink");
            icon.style.removeProperty("order");
            icon.style.removeProperty("position");
            icon.style.removeProperty("z-index");
            icon.style.removeProperty("align-self");
            icon.style.removeProperty("margin-top");
            icon.style.removeProperty("min-width");
            icon.style.removeProperty("max-width");
            setImportant(icon, "width", "40px");
            setImportant(icon, "height", "40px");
            setImportant(icon, "font-size", "16px");
            setImportant(icon, "border-radius", "50%");
            setImportant(icon, "border", "none");
            setImportant(icon, "background", "radial-gradient(circle at 30% 30%, #d8f2ed 0%, #8ad4bf 100%)");
            setImportant(icon, "color", "#1b3b34");
            setImportant(icon, "font-family", "inherit");
            setImportant(icon, "font-weight", "600");
            setImportant(icon, "box-shadow", "none");
          }
        }
        if (title) {
          setImportant(title, "margin", "0");
          setImportant(title, "line-height", "1.2");
          if (isSeeAll) {
            setImportant(title, "color", "#ffffff");
            setImportant(title, "font-size", "clamp(13px, 3.95vw, 17px)");
            setImportant(title, "font-weight", "800");
            setImportant(title, "white-space", "normal");
            setImportant(title, "overflow-wrap", "anywhere");
            setImportant(title, "word-break", "break-word");
            setImportant(title, "display", "-webkit-box");
            setImportant(title, "-webkit-box-orient", "vertical");
            setImportant(title, "-webkit-line-clamp", "2");
            setImportant(title, "line-clamp", "2");
            setImportant(title, "overflow", "hidden");
            setImportant(title, "line-height", "1.2");
          } else {
            setImportant(title, "color", "#1f2937");
            setImportant(title, "font-size", "16px");
            setImportant(title, "font-weight", "700");
          }
        }
        if (subtitle) {
          if (isSeeAll) {
            setImportant(subtitle, "white-space", "normal");
            setImportant(subtitle, "overflow-wrap", "anywhere");
            setImportant(subtitle, "word-break", "break-word");
            setImportant(subtitle, "display", "-webkit-box");
            setImportant(subtitle, "-webkit-box-orient", "vertical");
            setImportant(subtitle, "-webkit-line-clamp", "2");
            setImportant(subtitle, "line-clamp", "2");
            setImportant(subtitle, "overflow", "hidden");
            setImportant(subtitle, "font-size", "clamp(9px, 2.85vw, 11px)");
            setImportant(subtitle, "margin", "0");
            setImportant(subtitle, "margin-top", "3px");
            setImportant(subtitle, "line-height", "1.35");
            setImportant(subtitle, "max-width", "100%");
            setImportant(subtitle, "box-sizing", "border-box");
            setImportant(subtitle, "padding", "4px 8px");
            setImportant(subtitle, "color", "#f2fffb");
            setImportant(subtitle, "background", "rgba(255, 255, 255, 0.22)");
            setImportant(subtitle, "border-radius", "999px");
          } else {
            /* Single-line pill, fully visible — same readability as wider (e.g. 320px full-bleed) cards */
            setImportant(subtitle, "white-space", "nowrap");
            setImportant(subtitle, "margin", "0");
            setImportant(subtitle, "margin-top", "1px");
            setImportant(subtitle, "line-height", "1.35");
            setImportant(subtitle, "max-width", "none");
            setImportant(subtitle, "box-sizing", "border-box");
            setImportant(subtitle, "overflow", "visible");
            setImportant(subtitle, "font-size", "10px");
            setImportant(subtitle, "color", "#5d6678");
            setImportant(subtitle, "background", "#d9dee8");
            setImportant(subtitle, "padding", "3px 8px");
            setImportant(subtitle, "border-radius", "999px");
            setImportant(subtitle, "display", "inline-block");
          }
        }
      });

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          fitSwipeAdventureSubtitleFonts();
        });
      });
    };

    applySwipeCardStyles();
    window.addEventListener("resize", applySwipeCardStyles);

    const getMoveDistance = () => {
      const firstItem = row?.querySelector(".place-item");
      if (!firstItem || !row) {
        return 0;
      }
      const rowStyles = window.getComputedStyle(row);
      const gapValue = Number.parseFloat(rowStyles.columnGap || rowStyles.gap || "0") || 0;
      return firstItem.getBoundingClientRect().width + gapValue;
    };

    const restorePlaceRowOrderAndClearMotion = () => {
      if (!row || initialPlaceOrder.length === 0) {
        return;
      }
      initialPlaceOrder.forEach((node) => {
        if (node.parentNode === row) {
          row.appendChild(node);
        }
      });
      items = Array.from(row.querySelectorAll(".place-item"));
      row.style.removeProperty("transition");
      row.style.removeProperty("transform");
      isAnimating = false;
    };

    const shiftLeft = () => {
      if (!row || items.length < 2 || isAnimating) {
        return;
      }
      if (isSwipeLayout()) {
        activeSwipeIndex = (activeSwipeIndex + 1) % items.length;
        row.scrollTo({ left: items[activeSwipeIndex].offsetLeft, behavior: "smooth" });
        return;
      }
      if (!usesAdventureTransformCarousel()) {
        return;
      }
      const distance = getMoveDistance();
      if (!distance) {
        return;
      }
      const first = items[0];
      isAnimating = true;
      row.style.transition = `transform ${ANIMATION_MS}ms ease`;
      row.style.transform = `translateX(-${distance}px)`;

      const handleEnd = (event) => {
        if (event.propertyName !== "transform") {
          return;
        }
        row.removeEventListener("transitionend", handleEnd);
        row.style.transition = "none";
        row.style.transform = "translateX(0)";
        row.appendChild(first);
        items.push(items.shift());
        isAnimating = false;
      };

      row.addEventListener("transitionend", handleEnd);
    };

    const shiftRight = () => {
      if (!row || items.length < 2 || isAnimating) {
        return;
      }
      if (isSwipeLayout()) {
        activeSwipeIndex = (activeSwipeIndex - 1 + items.length) % items.length;
        row.scrollTo({ left: items[activeSwipeIndex].offsetLeft, behavior: "smooth" });
        return;
      }
      if (!usesAdventureTransformCarousel()) {
        return;
      }
      const distance = getMoveDistance();
      if (!distance) {
        return;
      }

      const last = items[items.length - 1];
      row.style.transition = "none";
      row.insertBefore(last, row.firstElementChild);
      items.unshift(items.pop());
      row.style.transform = `translateX(-${distance}px)`;

      window.requestAnimationFrame(() => {
        isAnimating = true;
        row.style.transition = `transform ${ANIMATION_MS}ms ease`;
        row.style.transform = "translateX(0)";
      });

      row.addEventListener(
        "transitionend",
        (event) => {
          if (event.propertyName !== "transform") {
            return;
          }
          isAnimating = false;
        },
        { once: true }
      );
    };

    const resolveLocationHref = (rawLink) => String(rawLink || "").trim();

    items.forEach((item) => {
      const locationLink = item.getAttribute("data-location-link");
      if (locationLink) {
        item.style.cursor = "pointer";
        item.addEventListener("click", () => {
          window.location.href = resolveLocationHref(locationLink);
        });
      }
    });

    controls[0]?.addEventListener("click", () => {
      shiftRight();
    });

    controls[1]?.addEventListener("click", () => {
      shiftLeft();
    });

    if (row) {
      row.addEventListener(
        "scroll",
        () => {
          if (!isSwipeLayout()) {
            return;
          }
          const nearestIndex = items.reduce((bestIndex, item, idx) => {
            const bestDistance = Math.abs(items[bestIndex].offsetLeft - row.scrollLeft);
            const currentDistance = Math.abs(item.offsetLeft - row.scrollLeft);
            return currentDistance < bestDistance ? idx : bestIndex;
          }, 0);
          activeSwipeIndex = nearestIndex;
        },
        { passive: true }
      );
    }

    const syncAdventureCarouselAutomation = () => {
      if (carouselIntervalId != null) {
        window.clearInterval(carouselIntervalId);
        carouselIntervalId = null;
      }
      if (!row || items.length < 2) {
        return;
      }
      /* Phones (≤430px): reset transform/DOM rotation from wider viewports — keep auto-slide via scrollTo in shiftLeft. */
      if (!usesAdventureTransformCarousel()) {
        restorePlaceRowOrderAndClearMotion();
      }
      carouselIntervalId = window.setInterval(() => {
        shiftLeft();
      }, 3200);
    };

    syncAdventureCarouselAutomation();
    window.addEventListener("resize", syncAdventureCarouselAutomation);
  });

  // Location page: toggle between "all locations" grid and detail view
  const allLocationsView = document.getElementById("allLocationsView");
  const locationDetailView = document.getElementById("locationDetailView");
  if (allLocationsView && locationDetailView) {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    const locIdx = pathSegments.findIndex(function (s) { return s.toLowerCase() === "locations"; });
    const rawSeg = (locIdx >= 0 ? pathSegments[locIdx + 1] || "" : "").toLowerCase();
    const nextSeg = (locIdx >= 0 ? pathSegments[locIdx + 2] || "" : "").toLowerCase();
    let locSlug = "";
    if (rawSeg && /\.html?$/i.test(rawSeg)) {
      locSlug = rawSeg.replace(/\.html?$/i, "");
    } else if (rawSeg && /\.html?$/i.test(nextSeg)) {
      locSlug = rawSeg;
    } else {
      locSlug = rawSeg.replace(/\.html?$/i, "");
    }
    if (locSlug === "all" || locSlug === "index" || !locSlug) {
      allLocationsView.style.display = "";
      locationDetailView.style.display = "none";
      document.body.classList.add("all-locations-page");
    } else {
      allLocationsView.style.display = "none";
      locationDetailView.style.display = "";
    }
  }

  // Location page: bind content by slug from pathname
  const locationPageRoot = document.querySelector(".location-page");
  if (locationPageRoot) {
    const alternateImageExtension = (path) => {
      if (!path || typeof path !== "string") return "";
      if (/\.png(\?.*)?$/i.test(path)) {
        return path.replace(/\.png(\?.*)?$/i, ".jpg$1");
      }
      if (/\.jpe?g(\?.*)?$/i.test(path)) {
        return path.replace(/\.jpe?g(\?.*)?$/i, ".png$1");
      }
      return "";
    };
    const bindImageExtensionFallback = (img) => {
      if (!img || img.dataset.imageFallbackBound === "1") return;
      img.dataset.imageFallbackBound = "1";
      img.addEventListener("error", () => {
        if (img.dataset.imageFallbackTried === "1") return;
        const currentSrc = img.getAttribute("src") || "";
        const fallbackSrc = alternateImageExtension(currentSrc);
        if (!fallbackSrc || fallbackSrc === currentSrc) return;
        img.dataset.imageFallbackTried = "1";
        img.src = fallbackSrc;
      });
    };
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    let locationFromPath = "";
    const locationIdx = pathParts.findIndex((segment) => segment.toLowerCase() === "locations");
    if (locationIdx >= 0) {
      const segA = pathParts[locationIdx + 1] || "";
      const segB = pathParts[locationIdx + 2] || "";
      if (/\.html?$/i.test(segA)) {
        locationFromPath = segA.replace(/\.html?$/i, "").toLowerCase();
      } else if (segA && /\.html?$/i.test(segB)) {
        locationFromPath = segA.toLowerCase();
      } else if (segA) {
        locationFromPath = segA.toLowerCase();
      }
    }
    const skipLocationDynamicBinding =
      locationFromPath === "all" ||
      locationFromPath === "index" ||
      !locationFromPath ||
      locationPageRoot.getAttribute("data-static-location-page") === "true";

    if (!skipLocationDynamicBinding) {
    const locationKey = (locationFromPath || "ubud").toLowerCase();
    const locationThingsOverrides = {
      ubud: [
        { image: "/assets/images/ubud1.png", title: "Monkey Forest" }, { image: "/assets/images/ubud2.png", title: "Tegallalang Rice Terrace" },
        { image: "/assets/images/ubud3.png", title: "Tirta Empul Temple" }, { image: "/assets/images/ubud4.png", title: "Ubud Art Market" },
        { image: "/assets/images/ubud5.png", title: "Campuhan Ridge Walk" }, { image: "/assets/images/ubud6.png", title: "Tegenungan Waterfall" },
        { image: "/assets/images/ubud7.png", title: "Goa Gajah Elephant Cave" }, { image: "/assets/images/ubud8.png", title: "Ubud Royal Palace" },
        { image: "/assets/images/ubud9.png", title: "Saraswati Temple" }, { image: "/assets/images/ubud10.png", title: "Bali Swing" },
        { image: "/assets/images/ubud11.png", title: "Tukad Cepung Waterfall" }, { image: "/assets/images/ubud12.png", title: "Kanto Lampo Waterfall" },
        { image: "/assets/images/ubud13.png", title: "Ubud Cooking Class" }, { image: "/assets/images/ubud14.png", title: "Gunung Kawi Temple" },
        { image: "/assets/images/ubud15.png", title: "Traditional Dance Show" }, { image: "/assets/images/ubud16.png", title: "Yoga Retreat" },
        { image: "/assets/images/ubud17.png", title: "Cycling Through Villages" }, { image: "/assets/images/ubud18.png", title: "Pura Taman Saraswati" },
        { image: "/assets/images/ubud19.png", title: "Jatiluwih Rice Fields" }, { image: "/assets/images/ubud20.png", title: "Ubud Night Market" }
      ],
      kuta: [
        { image: "/assets/images/kuta1.png", title: "Kuta Beach" }, { image: "/assets/images/kuta2.png", title: "Waterbom Bali" },
        { image: "/assets/images/kuta3.png", title: "Beachwalk Shopping" }, { image: "/assets/images/kuta4.png", title: "Surf Lessons" },
        { image: "/assets/images/kuta5.png", title: "Kuta Night Market" }, { image: "/assets/images/kuta6.png", title: "Sea Turtle Conservation" },
        { image: "/assets/images/kuta7.png", title: "Discovery Mall" }, { image: "/assets/images/kuta8.png", title: "Kuta Beach Sunset" },
        { image: "/assets/images/kuta9.png", title: "Dream Museum Zone" }, { image: "/assets/images/kuta10.png", title: "Circus Waterpark" },
        { image: "/assets/images/kuta11.png", title: "Tuban Beach" }, { image: "/assets/images/kuta12.png", title: "Hard Rock Hotel Area" },
        { image: "/assets/images/kuta13.png", title: "Vihara Dharmayana Temple" }, { image: "/assets/images/kuta14.png", title: "Ground Zero Monument" },
        { image: "/assets/images/kuta15.png", title: "Kuta Square" }, { image: "/assets/images/kuta16.png", title: "Beach Volleyball" },
        { image: "/assets/images/kuta17.png", title: "Parasailing Adventure" }, { image: "/assets/images/kuta18.png", title: "Legian Street Walk" },
        { image: "/assets/images/kuta19.png", title: "Kuta Art Market" }, { image: "/assets/images/kuta20.png", title: "Massage on the Beach" }
      ],
      seminyak: [
        { image: "/assets/images/seminyak1.png", title: "Seminyak Beach Sunset" }, { image: "/assets/images/seminyak2.png", title: "Potato Head Beach Club" },
        { image: "/assets/images/seminyak3.png", title: "Petitenget Temple" }, { image: "/assets/images/seminyak4.png", title: "Eat Street Dining" },
        { image: "/assets/images/seminyak5.png", title: "Ku De Ta Beach Club" }, { image: "/assets/images/seminyak6.png", title: "Seminyak Flea Market" },
        { image: "/assets/images/seminyak7.png", title: "Boutique Shopping" }, { image: "/assets/images/seminyak8.png", title: "Bodywork Spa" },
        { image: "/assets/images/seminyak9.png", title: "Double Six Beach" }, { image: "/assets/images/seminyak10.png", title: "La Plancha Beach Bar" },
        { image: "/assets/images/seminyak11.png", title: "Bali Riding Stables" }, { image: "/assets/images/seminyak12.png", title: "Oberoi Street Walk" },
        { image: "/assets/images/seminyak13.png", title: "Mrs Sippy Bali" }, { image: "/assets/images/seminyak14.png", title: "Motel Mexicola" },
        { image: "/assets/images/seminyak15.png", title: "Echo Beach Trip" }, { image: "/assets/images/seminyak16.png", title: "Sunset Yoga Session" },
        { image: "/assets/images/seminyak17.png", title: "Cocoon Beach Club" }, { image: "/assets/images/seminyak18.png", title: "Villa Pool Day" },
        { image: "/assets/images/seminyak19.png", title: "Gallery Hopping" }, { image: "/assets/images/seminyak20.png", title: "Night Street Food" }
      ],
      lombok: [
        { image: "/assets/images/lambok1.png", title: "Mount Rinjani Trek" }, { image: "/assets/images/lambok2.png", title: "Gili Trawangan" },
        { image: "/assets/images/lambok3.png", title: "Tanjung Aan Beach" }, { image: "/assets/images/lambok4.png", title: "Sendang Gile Waterfall" },
        { image: "/assets/images/lambok5.png", title: "Sasak Village Tour" }, { image: "/assets/images/lambok6.png", title: "Pink Beach" },
        { image: "/assets/images/lambok7.png", title: "Gili Meno Lake" }, { image: "/assets/images/lambok8.png", title: "Selong Belanak Beach" },
        { image: "/assets/images/lambok9.png", title: "Benang Stokel Waterfall" }, { image: "/assets/images/lambok10.png", title: "Kuta Lombok" },
        { image: "/assets/images/lambok11.png", title: "Merese Hill Viewpoint" }, { image: "/assets/images/lambok12.png", title: "Gili Air Snorkeling" },
        { image: "/assets/images/lambok13.png", title: "Sembalun Valley" }, { image: "/assets/images/lambok14.png", title: "Pura Lingsar Temple" },
        { image: "/assets/images/lambok15.png", title: "Mawun Beach" }, { image: "/assets/images/lambok16.png", title: "Traditional Weaving" },
        { image: "/assets/images/lambok17.png", title: "Bukit Pergasingan" }, { image: "/assets/images/lambok18.png", title: "Narmada Water Palace" },
        { image: "/assets/images/lambok19.png", title: "Sunset at Malimbu Hill" }, { image: "/assets/images/lambok20.png", title: "Tiu Kelep Waterfall" }
      ],
      "nusa-penida": [
        { image: "/assets/images/nusa1.png", title: "Kelingking Beach" }, { image: "/assets/images/nusa2.png", title: "Broken Beach" },
        { image: "/assets/images/nusa3.png", title: "Angel's Billabong" }, { image: "/assets/images/nusa4.png", title: "Diamond Beach" },
        { image: "/assets/images/nusa5.png", title: "Crystal Bay" }, { image: "/assets/images/nusa6.png", title: "Manta Point Dive" },
        { image: "/assets/images/nusa7.png", title: "Atuh Beach" }, { image: "/assets/images/nusa8.png", title: "Teletubbies Hill" },
        { image: "/assets/images/nusa9.png", title: "Rumah Pohon Treehouse" }, { image: "/assets/images/nusa10.png", title: "Tembeling Beach" },
        { image: "/assets/images/nusa11.png", title: "Peguyangan Waterfall" }, { image: "/assets/images/nusa12.png", title: "Pura Goa Giri Putri" },
        { image: "/assets/images/nusa13.png", title: "Banah Cliff Point" }, { image: "/assets/images/nusa14.png", title: "Suwehan Beach" },
        { image: "/assets/images/nusa15.png", title: "Gamat Bay Snorkeling" }, { image: "/assets/images/nusa16.png", title: "Thousand Islands Viewpoint" },
        { image: "/assets/images/nusa17.png", title: "Saren Cliff Point" }, { image: "/assets/images/nusa18.png", title: "Toyapakeh Wall Dive" },
        { image: "/assets/images/nusa19.png", title: "Pura Dalem Penataran Ped" }, { image: "/assets/images/nusa20.png", title: "Island Road Trip" }
      ],
      uluwatu: [
        { image: "/assets/images/uluwatu1.png", title: "Uluwatu Temple" }, { image: "/assets/images/uluwatu2.png", title: "Kecak Fire Dance" },
        { image: "/assets/images/uluwatu3.png", title: "Padang Padang Beach" }, { image: "/assets/images/uluwatu4.png", title: "Suluban Beach" },
        { image: "/assets/images/uluwatu5.png", title: "Single Fin Beach Club" }, { image: "/assets/images/uluwatu6.png", title: "Nyang Nyang Beach" },
        { image: "/assets/images/uluwatu7.png", title: "Bingin Beach" }, { image: "/assets/images/uluwatu8.png", title: "Dreamland Beach" },
        { image: "/assets/images/uluwatu9.png", title: "Balangan Beach" }, { image: "/assets/images/uluwatu10.png", title: "GWK Cultural Park" },
        { image: "/assets/images/uluwatu11.png", title: "Sunday Beach Club" }, { image: "/assets/images/uluwatu12.png", title: "Blue Point Beach" },
        { image: "/assets/images/uluwatu13.png", title: "Cliff Sunset Viewpoint" }, { image: "/assets/images/uluwatu14.png", title: "Surf at Uluwatu Reef" },
        { image: "/assets/images/uluwatu15.png", title: "Melasti Beach" }, { image: "/assets/images/uluwatu16.png", title: "Karma Beach Club" },
        { image: "/assets/images/uluwatu17.png", title: "Savaya Day Club" }, { image: "/assets/images/uluwatu18.png", title: "Jimbaran Seafood Dinner" },
        { image: "/assets/images/uluwatu19.png", title: "Temple Monkey Encounters" }, { image: "/assets/images/uluwatu20.png", title: "Cliff Coastal Walk" }
      ]
    };
    const locationContentMap = {
      ubud: {
        label: "Ubud",
        miniMeta: "20+ Activities, 18 Sight Seeing",
        miniImage: "/assets/images/location1.png",
        visitors: "100K+",
        places: "20+",
        oneWord: "Cultural",
        historyIntro:
          "Ubud, located in the uplands of Bali, has a rich and layered history that blends spirituality, royal patronage, artistic growth, and village traditions across centuries.",
        historyPoints: [
          "Ancient Origins: Ubud developed as a sacred area where Hindu priests, healers, and local communities gathered for meditation, rituals, and traditional learning in a calm natural setting.",
          "Kingdom Era Influence: During historical Balinese kingdoms, Ubud became a recognized center for ceremonial arts, temple culture, and royal-supported performances tied to community identity.",
          "Dutch Colonial Period: Although Bali experienced colonial pressure, Ubud retained much of its cultural continuity through village customs, temple activities, and artistic social structures.",
          "Artistic Renaissance: In the early twentieth century, Ubud drew local and international artists who helped document, promote, and elevate Balinese dance, painting, carving, and music traditions.",
          "Royal Patronage: The royal family of Ubud played a major role in preserving cultural institutions, supporting artists, and hosting festivals that strengthened the town's heritage reputation.",
          "Community and Agriculture: Rice terrace systems, local markets, and village cooperation shaped Ubud's social rhythm, combining farming life with ritual and artistic expression.",
          "Modern Cultural Growth: Ubud evolved into a global destination for culture and wellness while still maintaining traditional ceremonies, craft villages, and temple-centered community values.",
          "Present Identity: Today, Ubud stands as a balanced mix of heritage, creativity, nature, and mindful travel, where old traditions continue to coexist with modern tourism."
        ],
        historyImage: "https://images.unsplash.com/photo-1532186651327-6ac23687d189?auto=format&fit=crop&w=1400&q=80",
        historyImageAlt: "Temple in Ubud",
        bestTimeIntro: "The best time to travel to Ubud, Bali, largely depends on your preferences and what you aim to experience during your visit.",
        bestTimeSeasons: [
          { title: "Dry Season (April to October)", details: [{ label: "Peak Season (July and August)", text: "This period sees the highest influx of tourists due to dry weather and pleasant temperatures. Expect clear skies, ideal for outdoor activities and cultural sightseeing." }, { label: "Shoulder Seasons (April to June, September to October)", text: "These months offer similar weather to peak season but with fewer crowds and better value stays." }] },
          { title: "Wet Season (November to March)", details: [{ label: "Rainy Season", text: "The wet season brings frequent showers and humidity, while offering lush landscapes and lower prices." }, { label: "Festivals and Cultural Events", text: "Traditional ceremonies and festival windows can make travel more culturally immersive." }] }
        ],
        bestTimeOutro: "If you prefer sunny weather with fewer crowds, shoulder months are ideal; if you enjoy culture and lower costs, wet months can still be rewarding.",
        thingsTitle: "Things To Do in Ubud",
        things: [
          { image: "/assets/images/location1.png", title: "Monkey Forest" }, { image: "/assets/images/location2.png", title: "Puri Saren Agung" }, { image: "/assets/images/location3.png", title: "Traditional Dance" }, { image: "/assets/images/location4.png", title: "Art Market" }, { image: "/assets/images/location5.png", title: "Rice Terraces" }, { image: "/assets/images/location6.png", title: "Hike to Waterfalls" }, { image: "/assets/images/location7.png", title: "Cooking Class" }, { image: "/assets/images/location.png", title: "Sacred Temples" }
        ]
      },
      kuta: {
        label: "Kuta, Gali",
        miniMeta: "16+ Activities, 20 Sight Seeing",
        miniImage: "/assets/images/location2.png",
        visitors: "180K+",
        places: "16+",
        oneWord: "Beachlife",
        historyIntro: "Kuta, once a modest coastal settlement, has grown into one of Bali's most recognized beach destinations through decades of tourism, surf culture, and urban development.",
        historyPoints: [
          "Fishing Village Roots: Kuta historically began as a simple fishing community where coastal livelihoods and local trading activities shaped everyday social and economic life.",
          "Early Tourism Shift: As international travelers discovered Bali's coastline, Kuta gradually transitioned from a quiet beach village into a popular stop for leisure tourism.",
          "Surf Culture Expansion: During the 1970s and beyond, Kuta became globally known for beginner-friendly waves, attracting surfers and helping build its international identity.",
          "Commercial Development: Hotels, restaurants, shopping strips, and transport access expanded rapidly, transforming Kuta into one of the island's most active visitor zones.",
          "Urban Connectivity: Its proximity to Ngurah Rai International Airport made Kuta a practical gateway for first-time tourists and short-stay holiday travelers.",
          "Local Economy Evolution: Beach vendors, family businesses, tour operators, and hospitality workers all contributed to Kuta's growth as a high-volume tourism district.",
          "Cultural Continuity: Despite modernization, temple ceremonies, local traditions, and community rituals continue to be part of Kuta's identity and seasonal rhythm.",
          "Current Character: Today Kuta represents a lively blend of beach culture, nightlife, shopping convenience, and classic Bali holiday energy."
        ],
        historyImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
        historyImageAlt: "Kuta beach sunset",
        bestTimeIntro: "The best time to visit Kuta depends on whether you prefer peak beach energy or calmer travel days with easier movement.",
        bestTimeSeasons: [
          { title: "Dry Season (April to October)", details: [{ label: "Peak Season (July and August)", text: "Kuta is at its liveliest with packed beaches, active nightlife, and a vibrant holiday atmosphere." }, { label: "Shoulder Seasons (May to June, September)", text: "You still get excellent beach weather, surfing conditions, and sunset views, but with more manageable crowds." }] },
          { title: "Wet Season (November to March)", details: [{ label: "Rainy Season", text: "Kuta remains warm and travel-friendly, though short rain spells are common and rates are usually lower." }, { label: "Best For Relaxed Travel", text: "If you prefer quieter beaches and easier restaurant bookings, wet months can still be enjoyable with flexible planning." }] }
        ],
        bestTimeOutro: "For balanced weather and value, shoulder months are often the most practical choice for Kuta.",
        thingsTitle: "Things To Do in Kuta",
        things: [
          { image: "/assets/images/location3.png", title: "Kuta Beach Sunset" }, { image: "/assets/images/location4.png", title: "Surfing Lessons" }, { image: "/assets/images/location5.png", title: "Beach Walk Mall" }, { image: "/assets/images/location6.png", title: "Waterbom Bali" }, { image: "/assets/images/location7.png", title: "Street Shopping" }, { image: "/assets/images/location.png", title: "Nightlife Spots" }, { image: "/assets/images/location1.png", title: "Beach Cafes" }, { image: "/assets/images/location2.png", title: "Temple Visits" }
        ]
      },
      lombok: {
        label: "Lombok",
        miniMeta: "15+ Activities, 10 Sight Seeing",
        miniImage: "/assets/images/location3.png",
        visitors: "90K+",
        places: "15+",
        oneWord: "Scenic",
        historyIntro: "Lombok has a distinctive cultural and geographic history shaped by Sasak traditions, volcanic landscapes, coastal livelihoods, and a slower tourism trajectory than Bali.",
        historyPoints: [
          "Sasak Heritage Foundations: Lombok's history is deeply rooted in Sasak language, customs, architecture, and village traditions that continue to shape local identity today.",
          "Agrarian and Maritime Life: Farming, weaving, and coastal fishing historically sustained communities, creating a resilient economy tied to both land and sea cycles.",
          "Volcanic Geography Influence: Mount Rinjani played a major role in spiritual beliefs, settlement patterns, and travel movement across the island's interior regions.",
          "Regional Trade Links: Lombok participated in historical island trade networks, connecting local products and craftsmanship with wider Indonesian maritime routes.",
          "Cultural Preservation: Because large-scale tourism arrived later, many villages retained stronger continuity in rituals, crafts, and traditional social structures.",
          "Craft and Community Skills: Handwoven textiles, local markets, and village-based production remain important symbols of Lombok's cultural and economic heritage.",
          "Tourism Transformation: Adventure and eco-focused travel gradually expanded Lombok's profile, especially through trekking, island hopping, and waterfall exploration.",
          "Present-Day Identity: Modern Lombok is known for blending authentic local culture with nature-driven tourism in a quieter, more spacious island environment."
        ],
        historyImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
        historyImageAlt: "Lombok scenic mountain view",
        bestTimeIntro: "Lombok is ideal for outdoor exploration during drier months with calmer sea conditions and better visibility for nature routes.",
        bestTimeSeasons: [
          { title: "Dry Season (May to October)", details: [{ label: "Peak Season (July and August)", text: "Popular among trekkers and adventure travelers, especially around Mount Rinjani and island routes." }, { label: "Shoulder Seasons (May to June, September)", text: "Great for mixed itineraries with beaches, waterfalls, and village experiences while avoiding heavy crowds." }] },
          { title: "Wet Season (November to April)", details: [{ label: "Rainy Season", text: "Lombok turns lush and green, and accommodation rates are often lower, though routes may require flexibility." }, { label: "Best For Nature Lovers", text: "This season suits travelers who enjoy dramatic landscapes and fewer tourists with adaptive planning." }] }
        ],
        bestTimeOutro: "For active itineraries in Lombok, dry and shoulder months usually provide the best balance of comfort and accessibility.",
        thingsTitle: "Things To Do in Lombok",
        things: [
          { image: "/assets/images/location5.png", title: "Mount Rinjani Trek" }, { image: "/assets/images/location6.png", title: "Sasak Village Tour" }, { image: "/assets/images/location7.png", title: "Pink Beach" }, { image: "/assets/images/location.png", title: "Gili Island Hop" }, { image: "/assets/images/location1.png", title: "Waterfall Hike" }, { image: "/assets/images/location2.png", title: "Snorkeling Spots" }, { image: "/assets/images/location3.png", title: "Coastal Drives" }, { image: "/assets/images/location4.png", title: "Sunrise Viewpoints" }
        ]
      },
      seminyak: { label: "Seminyak", miniMeta: "18+ Activities, 14 Sight Seeing", miniImage: "/assets/images/location4.png", visitors: "130K+", places: "18+", oneWord: "Trendy", historyIntro: "Seminyak transformed from a quieter coastal extension into a premium destination known for lifestyle travel, dining culture, boutique retail, and modern beach experiences.", historyPoints: ["Coastal Extension Origins: Seminyak initially developed as a calmer neighboring area to Kuta, with lower density and a more relaxed shoreline atmosphere.", "Hospitality Growth: Over time, upscale villas, curated stays, and premium service models helped Seminyak emerge as a higher-end Bali destination.", "Lifestyle Development: Beach clubs, wellness spaces, and design-focused venues shaped a distinct identity centered around comfort and contemporary travel culture.", "Culinary Reputation: The district became one of Bali's strongest dining corridors, offering international cuisine, local fusion concepts, and destination restaurants.", "Retail and Design Influence: Boutique shopping, interior brands, and local artisan collaborations elevated Seminyak's appeal for style-oriented travelers.", "Community and Ritual Life: Despite commercial growth, local temple ceremonies and neighborhood traditions continue to anchor cultural continuity in the area.", "Traveler Profile Expansion: Seminyak attracted couples, families, and remote professionals seeking convenience, aesthetics, and premium leisure experiences.", "Current Positioning: Today Seminyak is recognized for combining modern luxury, beachside relaxation, and elements of Balinese cultural heritage."], historyImage: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1400&q=80", historyImageAlt: "Seminyak beach view", bestTimeIntro: "Seminyak is best during dry months for beach sunsets, shopping walks, and outdoor dining experiences.", bestTimeSeasons: [{ title: "Dry Season (April to October)", details: [{ label: "Peak Season (July and August)", text: "Seminyak is busiest with beach clubs, luxury stays, and high-demand dining." }, { label: "Shoulder Seasons (May to June, September)", text: "You still get clear sunsets and excellent weather while enjoying easier reservations." }] }, { title: "Wet Season (November to March)", details: [{ label: "Rainy Season", text: "Warm tropical weather continues with occasional showers and better hotel value." }, { label: "Best For Slow Travel", text: "Great for cafe culture, spa routines, and boutique exploration with fewer crowds." }] }], bestTimeOutro: "For a balanced Seminyak trip with comfort and fewer queues, shoulder season works very well.", thingsTitle: "Things To Do in Seminyak", things: [{ image: "/assets/images/location4.png", title: "Seminyak Beach Sunset" }, { image: "/assets/images/location5.png", title: "Beach Clubs" }, { image: "/assets/images/location6.png", title: "Boutique Shopping" }, { image: "/assets/images/location7.png", title: "Spa & Wellness" }, { image: "/assets/images/location.png", title: "Cafe Hopping" }, { image: "/assets/images/location1.png", title: "Petitenget Temple" }, { image: "/assets/images/location2.png", title: "Night Dining Streets" }, { image: "/assets/images/location3.png", title: "Artisan Markets" }] },
      "nusa-penida": { label: "Nusa Penida", miniMeta: "14+ Activities, 12 Sight Seeing", miniImage: "/assets/images/location5.png", visitors: "85K+", places: "14+", oneWord: "Dramatic", historyIntro: "Nusa Penida has evolved from a remote island community into a sought-after nature destination known for steep cliffs, sacred sites, and dramatic marine landscapes.", historyPoints: ["Island Community Roots: Historically, Nusa Penida was home to fishing families and temple-centered communities shaped by sea-based livelihoods and spiritual traditions.", "Geographic Isolation: Its rugged roads and steep coastal terrain kept tourism limited for many years, preserving natural viewpoints and village character.", "Temple and Ritual Significance: Sacred sites and ceremonial practices have long played a central role in social and cultural life across the island.", "Access and Tourism Rise: Fast-boat connectivity from Bali significantly increased visitor movement and encouraged overnight stays and guided excursions.", "Photographic Recognition: Iconic cliff landscapes such as Kelingking and Diamond Beach gained global visibility through digital travel media and photography.", "Infrastructure Improvements: Better roads and transport links gradually opened western and eastern routes to a wider range of travelers.", "Marine Adventure Appeal: Snorkeling and diving ecosystems, including manta experiences, strengthened Nusa Penida's position in nature-based tourism.", "Current Destination Identity: Today Nusa Penida is known for dramatic scenery, ocean adventure, and spiritual heritage within a compact island setting."], historyImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80", historyImageAlt: "Nusa Penida cliff coast", bestTimeIntro: "Nusa Penida is best when sea crossings are smoother and visibility is clear for viewpoints.", bestTimeSeasons: [{ title: "Dry Season (April to October)", details: [{ label: "Peak Season (July and August)", text: "The island sees high visitor numbers, especially at major photo viewpoints." }, { label: "Shoulder Seasons (May to June, September)", text: "Good sea and weather conditions remain with lower crowd pressure." }] }, { title: "Wet Season (November to March)", details: [{ label: "Rainy Season", text: "Rougher crossings and short storms can occur, requiring flexible route timing." }, { label: "Best For Flexible Itineraries", text: "You can still enjoy dramatic scenery during clear weather windows." }] }], bestTimeOutro: "For safer crossings and better outdoor comfort, dry or shoulder months are recommended.", thingsTitle: "Things To Do in Nusa Penida", things: [{ image: "/assets/images/location5.png", title: "Kelingking Beach Viewpoint" }, { image: "/assets/images/location6.png", title: "Broken Beach" }, { image: "/assets/images/location7.png", title: "Angel's Billabong" }, { image: "/assets/images/location.png", title: "Diamond Beach" }, { image: "/assets/images/location1.png", title: "Crystal Bay Snorkeling" }, { image: "/assets/images/location2.png", title: "Manta Point Tour" }, { image: "/assets/images/location3.png", title: "Island Road Trip" }, { image: "/assets/images/location4.png", title: "Sunset Cliff Stops" }] },
      uluwatu: { label: "Uluwatu", miniMeta: "12+ Activities, 9 Sight Seeing", miniImage: "/assets/images/location6.png", visitors: "95K+", places: "12+", oneWord: "Clifftop", historyIntro: "Uluwatu has a strong cultural and geographic identity built around cliffside temples, ocean-facing landscapes, and one of Bali's most recognized surf regions.", historyPoints: ["Temple-Centered Origins: Uluwatu's early identity formed around coastal settlements and the spiritual significance of Uluwatu Temple on the cliff edge.", "Sacred Landscape Influence: High limestone cliffs and ocean-facing terrain made the area both ceremonially important and visually distinctive.", "Surf Destination Emergence: International surfers helped establish Uluwatu as a renowned wave destination, increasing global attention over time.", "Cultural Performance Legacy: Sunset Kecak dance events near the temple became a defining attraction that connects visitors with Balinese storytelling traditions.", "Heritage Preservation: Temple management and local communities continue to protect ritual practices and sacred customs within a growing tourism environment.", "Hospitality Expansion: Boutique stays, cliffside venues, and curated travel services developed as Uluwatu's popularity rose among premium travelers.", "Coastal Exploration Growth: Hidden beaches and cove access routes attracted photographers, surfers, and sunset-seeking visitors from around the world.", "Present-Day Character: Uluwatu now represents a blend of spiritual heritage, dramatic coastal scenery, surf culture, and destination-level sunset experiences."], historyImage: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1400&q=80", historyImageAlt: "Uluwatu temple cliff", bestTimeIntro: "Uluwatu is most enjoyable during dry weather when cliff roads and beach access are easier.", bestTimeSeasons: [{ title: "Dry Season (April to October)", details: [{ label: "Peak Season (July and August)", text: "Uluwatu is vibrant with temple visits, Kecak dance crowds, and busy sunset venues." }, { label: "Shoulder Seasons (May to June, September)", text: "Excellent weather for clifftop experiences and surfing with fewer queues." }] }, { title: "Wet Season (November to March)", details: [{ label: "Rainy Season", text: "Humidity and occasional rain increase, and sea conditions can be less predictable." }, { label: "Best For Relaxed Exploration", text: "Good for quieter stays and flexible sightseeing plans." }] }], bestTimeOutro: "Shoulder months give a great mix of views, weather, and manageable crowd levels in Uluwatu.", thingsTitle: "Things To Do in Uluwatu", things: [{ image: "/assets/images/location6.png", title: "Uluwatu Temple" }, { image: "/assets/images/location7.png", title: "Kecak Dance Show" }, { image: "/assets/images/location.png", title: "Clifftop Sunset Spots" }, { image: "/assets/images/location1.png", title: "Padang Padang Beach" }, { image: "/assets/images/location2.png", title: "Suluban Beach" }, { image: "/assets/images/location3.png", title: "Surfing Breaks" }, { image: "/assets/images/location4.png", title: "Seafood Dinner by Coast" }, { image: "/assets/images/location5.png", title: "Scenic Cliff Walks" }] }
    };

    const selectedLocation = locationContentMap[locationKey] || locationContentMap.ubud;
    const overrideThings = locationThingsOverrides[locationKey];
    if (Array.isArray(overrideThings) && overrideThings.length) {
      selectedLocation.things = overrideThings;
    }
    document.getElementById("locationName")?.replaceChildren(document.createTextNode(selectedLocation.label));
    document.getElementById("locationHeading")?.replaceChildren(document.createTextNode(selectedLocation.label));

    const miniImg = locationPageRoot.querySelector(".location-mini-badge img");
    if (miniImg) {
      miniImg.src = selectedLocation.miniImage;
      miniImg.alt = `${selectedLocation.label} icon`;
      bindImageExtensionFallback(miniImg);
    }
    const miniMeta = locationPageRoot.querySelector(".location-mini-badge p");
    if (miniMeta) miniMeta.textContent = selectedLocation.miniMeta;

    const stats = locationPageRoot.querySelectorAll(".location-stats-row article");
    if (stats[0]) stats[0].innerHTML = `<strong>${selectedLocation.visitors}</strong><small>Monthly Visitors</small>`;
    if (stats[1]) stats[1].innerHTML = `<strong>${selectedLocation.places}</strong><small>Iconic Places</small>`;
    if (stats[2]) stats[2].innerHTML = `<strong>${selectedLocation.oneWord}</strong><small>One Word About ${selectedLocation.label}</small>`;

    const historySection = locationPageRoot.querySelector(".location-copy-block--history");
    if (historySection) {
      const intro = historySection.querySelector("p");
      const list = historySection.querySelector("ol");
      const image = historySection.querySelector("img");
      if (intro) intro.textContent = selectedLocation.historyIntro;
      if (list) list.innerHTML = selectedLocation.historyPoints.map((point) => `<li>${point}</li>`).join("");
      if (image) {
        image.src = selectedLocation.historyImage;
        image.alt = selectedLocation.historyImageAlt;
        bindImageExtensionFallback(image);
      }
    }

    const seasonSection = locationPageRoot.querySelector(".location-copy-block--season");
    if (seasonSection) {
      const paragraphs = seasonSection.querySelectorAll("p");
      const list = seasonSection.querySelector("ol");
      if (paragraphs[0]) paragraphs[0].textContent = selectedLocation.bestTimeIntro;
      if (list) {
        list.innerHTML = (selectedLocation.bestTimeSeasons || [])
          .map((season) => `<li><strong>${season.title}</strong><ul>${season.details.map((detail) => `<li><u>${detail.label}</u>: ${detail.text}</li>`).join("")}</ul></li>`)
          .join("");
      }
      if (paragraphs[1]) paragraphs[1].textContent = selectedLocation.bestTimeOutro;
    }

    const thingsHeading = locationPageRoot.querySelector(".location-things h3");
    if (thingsHeading) thingsHeading.textContent = selectedLocation.thingsTitle;
    const thingsGrid = locationPageRoot.querySelector(".location-things-grid");
    const thingsExtra = locationPageRoot.querySelector(".location-things-gallery-extra");
    const primaryThings = selectedLocation.things.slice(0, 8);
    const extraThings = selectedLocation.things.slice(8);
    if (thingsGrid) {
      thingsGrid.innerHTML = `${primaryThings.map((item) => `<article><img src="${item.image}" alt="${item.title}" /><span>${item.title}</span></article>`).join("")}
        <article class="location-more-card" id="locationThingsMoreCard"><img src="${selectedLocation.things[0]?.image || "/assets/images/location.png"}" alt="More activities" /><span><strong>${extraThings.length || 20}+ More</strong><small>Activities & Sightseetings</small></span></article>`;
      thingsGrid.querySelectorAll("img").forEach((img) => bindImageExtensionFallback(img));
    }
    if (thingsExtra) {
      thingsExtra.innerHTML = (extraThings.length ? extraThings : selectedLocation.things.slice(0, 12))
        .map((item) => `<img src="${item.image}" alt="${item.title}" />`)
        .join("");
      thingsExtra.querySelectorAll("img").forEach((img) => bindImageExtensionFallback(img));
    }

    // Keep executable URL on static/local servers.
    // (Path-style routes like /locations/slug require server rewrite support.)
    }
  }

  // Location things: selectable activity cards + gallery lightbox from "20+ More"
  const locationThingsSection = document.querySelector(".location-things");
  if (locationThingsSection) {
    const thingCards = Array.from(locationThingsSection.querySelectorAll(".location-things-grid article"));
    const lightbox = document.getElementById("locationThingsLightbox");
    const lightboxImg = document.getElementById("locationThingsLightboxImg");
    const lightboxCaption = lightbox?.querySelector(".location-things-lightbox-caption");
    const lightboxCounter = lightbox?.querySelector(".location-things-lightbox-counter");
    const moreCard = document.getElementById("locationThingsMoreCard");

    const setActiveThing = (card) => {
      thingCards.forEach((node) => node.classList.remove("is-active"));
      card.classList.add("is-active");
    };

    const collectGalleryItems = () => {
      const items = [];
      thingCards.forEach((card) => {
        if (card.classList.contains("location-more-card")) {
          return;
        }
        const img = card.querySelector("img");
        if (!img?.src) {
          return;
        }
        const caption =
          card.querySelector("span")?.textContent?.replace(/\s+/g, " ").trim() || img.alt || "Activity";
        items.push({ src: img.currentSrc || img.src, alt: img.alt || caption, caption });
      });
      locationThingsSection.querySelectorAll(".location-things-gallery-extra img").forEach((img) => {
        if (!img.src) {
          return;
        }
        const cap = img.alt?.trim() || "Ubud experience";
        items.push({ src: img.currentSrc || img.src, alt: img.alt || cap, caption: cap });
      });
      return items;
    };

    let galleryItems = [];
    let galleryIndex = 0;
    let lightboxReturnFocus = null;

    const renderLightbox = () => {
      if (!lightbox || !lightboxImg || galleryItems.length === 0) {
        return;
      }
      const item = galleryItems[galleryIndex];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
      if (lightboxCaption) {
        lightboxCaption.textContent = item.caption;
      }
      if (lightboxCounter) {
        lightboxCounter.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
      }
    };

    const openLightbox = () => {
      if (!lightbox) {
        return;
      }
      galleryItems = collectGalleryItems();
      if (galleryItems.length === 0) {
        showStatus("No gallery images available");
        return;
      }
      galleryIndex = 0;
      renderLightbox();
      lightboxReturnFocus = document.activeElement;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lightbox.querySelector(".location-things-lightbox-close")?.focus({ preventScroll: true });
    };

    const closeLightbox = () => {
      if (!lightbox?.classList.contains("is-open")) {
        return;
      }
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lightboxImg) {
        lightboxImg.removeAttribute("src");
      }
      const back = lightboxReturnFocus;
      lightboxReturnFocus = null;
      if (back instanceof HTMLElement && document.contains(back)) {
        back.focus({ preventScroll: true });
      } else {
        moreCard?.focus({ preventScroll: true });
      }
    };

    const stepLightbox = (delta) => {
      if (galleryItems.length === 0) {
        return;
      }
      galleryIndex = (galleryIndex + delta + galleryItems.length) % galleryItems.length;
      renderLightbox();
    };

    if (lightbox) {
      lightbox.querySelector(".location-things-lightbox-prev")?.addEventListener("click", (e) => {
        e.stopPropagation();
        stepLightbox(-1);
      });
      lightbox.querySelector(".location-things-lightbox-next")?.addEventListener("click", (e) => {
        e.stopPropagation();
        stepLightbox(1);
      });
      lightbox.querySelector(".location-things-lightbox-close")?.addEventListener("click", (e) => {
        e.stopPropagation();
        closeLightbox();
      });
      lightbox.querySelector(".location-things-lightbox-backdrop")?.addEventListener("click", closeLightbox);
      window.addEventListener("keydown", (event) => {
        if (!lightbox.classList.contains("is-open")) {
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          closeLightbox();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          stepLightbox(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          stepLightbox(1);
        }
      });
    }

    thingCards.forEach((card, idx) => {
      card.style.cursor = "pointer";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      const activateCard = () => {
        if (card.classList.contains("location-more-card")) {
          openLightbox();
          return;
        }

        setActiveThing(card);
        const title = card.querySelector("span")?.textContent?.trim() || "Activity";
        showStatus(`Selected: ${title}`);
      };

      card.addEventListener("click", activateCard);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateCard();
        }
      });

      if (idx === 0) {
        card.classList.add("is-active");
      }
    });
  }
  /*const adventureSection = homeRoot?.querySelectorAll(".adventure");
  if (adventureSection) {
    const items = Array.from(adventureSection.querySelectorAll(".place-item"));
    const controls = adventureSection.querySelectorAll(".arrow-controls button");
    let activeIndex = 0;

    const paint = () => {
      items.forEach((item, idx) => {
        item.style.opacity = idx === activeIndex ? "1" : "0.45";
        item.style.transform = idx === activeIndex ? "translateY(-2px)" : "translateY(0)";
        item.style.transition = "all 220ms ease";
      });
    };

    controls[0]?.addEventListener("click", () => {
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      paint();
    });
    controls[1]?.addEventListener("click", () => {
      activeIndex = (activeIndex + 1) % items.length;
      paint();
    });
    paint();
  }*/

  // Trip-days section: choose day card and cycle with arrows
  const daySection = document.querySelector(".trip-days");
  if (daySection) {
    const cards = Array.from(daySection.querySelectorAll(".day-card"));
    const controls = daySection.querySelectorAll(".arrow-controls.side button");
    let activeIndex = 0;

    const renderDays = () => {
      cards.forEach((card, idx) => {
        card.setAttribute("aria-pressed", String(idx === activeIndex));
        card.style.opacity = "1";
        card.style.transform = idx === activeIndex ? "scale(1.02)" : "scale(1)";
        card.style.transition = "all 180ms ease";
      });
    };

    cards.forEach((card, idx) => {
      card.addEventListener("click", () => {
        activeIndex = idx;
        renderDays();
        const selectedText = card.textContent?.trim() || "";
        const selectedDays = selectedText.match(/\d+/)?.[0];
        const targetUrl = selectedDays
          ? `packages.html?days=${encodeURIComponent(selectedDays)}`
          : "packages.html";
        window.location.href = targetUrl;
      });
    });

    controls[0]?.addEventListener("click", () => {
      activeIndex = (activeIndex - 1 + cards.length) % cards.length;
      renderDays();
    });
    controls[1]?.addEventListener("click", () => {
      activeIndex = (activeIndex + 1) % cards.length;
      renderDays();
    });

    renderDays();
  }

  // Reasons section: interactive topic switch
  const reasonsSection = document.querySelector(".reasons");
  if (reasonsSection) {
    const topics = Array.from(reasonsSection.querySelectorAll(".reason-text h4"));
    const reasonTextBox = reasonsSection.querySelector(".reason-text");
    const reasonArticle = reasonsSection.querySelector(".reason-text article");
    const articleTitle = reasonsSection.querySelector(".reason-text article h3");
    const articleCopy = reasonsSection.querySelector(".reason-text article p");
    const reasonImage = reasonsSection.querySelector(".reasons-layout img");
    const defaultReasonImage = reasonImage?.getAttribute("src") || "/assets/images/reason.png";
    const reasonSlides = {
      Festivals: [
        {
          image: "/assets/images/festive.png",
          title: "Galungan Festival",
          body: "Galungan celebrates the victory of dharma over adharma. Villages fill with decorated penjor bamboo poles, temple prayers, and family gatherings across Bali."
        },
        {
          image: "/assets/images/festive1.png",
          title: "Nyepi: Day of Silence",
          body: "Nyepi marks the Balinese New Year with a full day of silence, no travel, and no lights. The night before includes colorful ogoh-ogoh parades and rituals."
        },
        {
          image: "/assets/images/festive2.png",
          title: "Kuningan Traditions",
          body: "Kuningan closes the festive cycle with temple visits and offerings. Families wear traditional dress and share special dishes to honor ancestral blessings."
        }
      ],
      "Peace and Quiet": [
        {
          image: "/assets/images/peace.png",
          title: "Ubud Morning Calm",
          body: "Start your day with misty rice terraces, slow village walks, and temple bells that create a peaceful rhythm away from city noise."
        },
        {
          image: "/assets/images/peace1.png",
          title: "Silent Beach Hours",
          body: "Quiet bays in Bali offer gentle waves, soft sunsets, and relaxed corners where you can unwind without crowds."
        },
        {
          image: "/assets/images/peace2.png",
          title: "Spa and Wellness Retreats",
          body: "Traditional Balinese wellness sessions, herbal baths, and nature-view spas help you reconnect and recharge in a serene setting."
        }
      ],
      "Romantic Ambience": [
        {
          image: "/assets/images/ambience.png",
          title: "Candlelight by the Coast",
          body: "Enjoy private sunset dinners near the ocean, where soft lights, sea breeze, and calm waves create a romantic Bali evening."
        },
        {
          image: "/assets/images/ambience1.png",
          title: "Villa Escape for Couples",
          body: "Peaceful pool villas and tropical gardens provide intimate spaces for couples to relax and celebrate special moments together."
        },
        {
          image: "/assets/images/ambience2.png",
          title: "Golden Hour Memories",
          body: "From cliff viewpoints to dreamy beaches, Bali's golden hour offers perfect scenes for romantic walks and unforgettable photos."
        }
      ],
      "Ease of Travel": [
        {
          image: "/assets/images/travel.png",
          title: "Seamless Local Transfers",
          body: "Move comfortably between popular Bali spots with reliable drivers, app-based rides, and easy day-trip planning."
        },
        {
          image: "/assets/images/travel1.png",
          title: "Smart Island Routes",
          body: "Plan efficient routes between beaches, temples, and cafes so you spend more time exploring and less time commuting."
        },
        {
          image: "/assets/images/travel2.png",
          title: "Friendly Travel Support",
          body: "From pickup coordination to local guidance, smooth travel services make every part of your Bali journey stress-free."
        }
      ]
    };
    let reasonSlideIndex = 0;
    let reasonTimer = null;
    const reasonContent = {
      Festivals: {
        title: "The Culture",
        body: "This is a mixture of Hindu, Muslim and Buddhist culture. These people live together very harmoniously. You can also visit temples and mosques for a deeper understanding of their traditions."
      },
      "Peace and Quiet": {
        title: "Mindful Escapes",
        body: "Bali offers hidden retreats, lush valleys, and calming beaches where you can slow down and reconnect with nature away from crowded city routines."
      },
      "Romantic Ambience": {
        title: "Romantic Moments",
        body: "Sunset dinners, private villas, and scenic viewpoints make Bali one of the most romantic places for couples and honeymoon experiences."
      },
      "Ease of Travel": {
        title: "Easy to Explore",
        body: "From airport transfers to guided day trips, getting around the island is convenient and budget friendly for both short and long vacations."
      }
    };

    const stopReasonSlideshow = () => {
      if (reasonTimer) {
        window.clearInterval(reasonTimer);
        reasonTimer = null;
      }
    };

    const paintReasonSlide = (slides, index) => {
      const slide = slides[index];
      if (!slide || !articleTitle || !articleCopy || !reasonImage) {
        return;
      }
      reasonImage.classList.remove("festival-slide-spotlight");
      window.requestAnimationFrame(() => {
        reasonImage.src = slide.image;
        reasonImage.alt = slide.title;
        articleTitle.textContent = slide.title;
        articleCopy.textContent = slide.body;
        reasonImage.classList.add("festival-slide-spotlight");
      });
    };

    const startReasonSlideshow = (topicKey) => {
      const slides = reasonSlides[topicKey];
      if (!slides || !slides.length) {
        return false;
      }
      stopReasonSlideshow();
      reasonSlideIndex = 0;
      paintReasonSlide(slides, reasonSlideIndex);
      reasonTimer = window.setInterval(() => {
        reasonSlideIndex = (reasonSlideIndex + 1) % slides.length;
        paintReasonSlide(slides, reasonSlideIndex);
      }, 5000);
      return true;
    };

    const applyReasonTopic = (key) => {
      const selected = reasonContent[key];
      if (!selected || !articleTitle || !articleCopy) {
        return;
      }

      if (reasonSlides[key]) {
        startReasonSlideshow(key);
        return;
      }

      stopReasonSlideshow();
      articleTitle.textContent = selected.title;
      articleCopy.textContent = selected.body;
      if (reasonImage) {
        reasonImage.classList.remove("festival-slide-spotlight");
        reasonImage.src = defaultReasonImage;
        reasonImage.alt = "Bali culture dance";
      }
    };

    const moveReasonArticleBelowTopic = (topic) => {
      if (!reasonArticle || !reasonTextBox || !topic) {
        return;
      }
      reasonTextBox.insertBefore(reasonArticle, topic.nextSibling);
    };

    topics.forEach((topic) => {
      topic.style.cursor = "pointer";
      topic.addEventListener("click", () => {
        setActive(topics, topic);
        moveReasonArticleBelowTopic(topic);
        const marker = reasonsSection.querySelector(".reason-marker");
        if (marker && reasonTextBox) {
          const topicTop = topic.getBoundingClientRect().top;
          const boxTop = reasonTextBox.getBoundingClientRect().top;
          marker.style.top = (topicTop - boxTop) + "px";
        }
        const key = topic.textContent?.trim() || "";
        applyReasonTopic(key);
      });
    });

    const initMarker = () => {
      const marker = reasonsSection.querySelector(".reason-marker");
      const activeTopic = reasonsSection.querySelector(".reason-text h4.active");
      if (activeTopic) {
        moveReasonArticleBelowTopic(activeTopic);
      }
      if (marker && activeTopic && reasonTextBox) {
        const topicTop = activeTopic.getBoundingClientRect().top;
        const boxTop = reasonTextBox.getBoundingClientRect().top;
        marker.style.top = (topicTop - boxTop) + "px";
      }
    };
    requestAnimationFrame(initMarker);
    const activeKey = reasonsSection.querySelector(".reason-text h4.active")?.textContent?.trim() || "Festivals";
    const activeReason = reasonContent[activeKey];
    if (activeReason && articleTitle && articleCopy) {
      articleTitle.textContent = activeReason.title;
      articleCopy.textContent = activeReason.body;
    }
    if (reasonImage) {
      reasonImage.src = defaultReasonImage;
      reasonImage.alt = "Bali culture dance";
    }

    reasonsSection.querySelector(".more-blogs-btn")?.addEventListener("click", () => {
      homeRoot?.querySelector(".bali-blogs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // Location packages: ‹ › cycle day chips (≤768px); horizontal strip shows up to three cards for that duration (no autoplay)
  const locationPackagesSection = document.querySelector(".location-packages");
  if (locationPackagesSection) {
    const filterSection = locationPackagesSection.querySelector(".package-screen-filters");
    const chips = Array.from(filterSection?.querySelectorAll(".chip") || []);
    const packagesCustomSelectedClass = "packages-custom-selected";
    const chipDayDullClass = "chip-day-dull";
    const cards = Array.from(locationPackagesSection.querySelectorAll(".package-screen-grid .package-card"));
    const packageTrack = locationPackagesSection.querySelector(".package-screen-grid");
    const prevDayArrow = filterSection?.querySelector(".package-day-arrow-prev");
    const nextDayArrow = filterSection?.querySelector(".package-day-arrow-next");
    let selectedDays = null;
    const dayChips = chips.filter((chip) => !chip.classList.contains("chip-custom"));

    const extractDaysFromChip = (chip) => chip.textContent.match(/\d+/g)?.[1] || null;
    const getCardDaysValue = (card) => {
      const dataDays = card.dataset.days || null;
      if (dataDays) {
        return dataDays;
      }
      const metaText =
        card.querySelector(".package-meta-days-text")?.textContent?.trim() ||
        card.querySelector(".package-meta-duration")?.textContent?.trim() ||
        "";
      const visibleDays = metaText.match(/\d+/)?.[0] || null;
      return visibleDays || null;
    };

    const getCurrentPool = () => {
      const dayMatched = selectedDays ? cards.filter((card) => getCardDaysValue(card) === selectedDays) : cards.slice();
      return dayMatched.slice(0, 3);
    };

    const applyLocationPackagesTrackLayout = () => {
      cards.forEach((card) => {
        card.style.removeProperty("flex");
        card.style.removeProperty("minWidth");
        card.style.removeProperty("maxWidth");
        card.style.removeProperty("width");
      });
    };

    const applyLocationPackagesFilter = () => {
      applyLocationPackagesTrackLayout();
      const pool = getCurrentPool();
      cards.forEach((card) => {
        if (pool.includes(card)) {
          card.style.removeProperty("display");
        } else {
          card.style.display = "none";
        }
        card.classList.remove("package-card-animate");
      });
      packageTrack?.scrollTo({ left: 0, top: 0, behavior: "auto" });
      animateVisiblePackageCards(cards);
    };

    const moveLocationDayChip = (step) => {
      const activeIndex = dayChips.findIndex((c) => c.classList.contains("chip-active"));
      const dullIndex = dayChips.findIndex((c) => c.classList.contains(chipDayDullClass));
      const baseIndex = activeIndex >= 0 ? activeIndex : (dullIndex >= 0 ? dullIndex : 0);
      const targetIndex = (baseIndex + step + dayChips.length) % dayChips.length;
      dayChips[targetIndex]?.click();
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        if (chip.classList.contains("chip-custom")) {
          const previousDay =
            filterSection?.querySelector(".chip-active:not(.chip-custom)") ||
            filterSection?.querySelector(`.chip.${chipDayDullClass}:not(.chip-custom)`);
          chips.forEach((node) => node.classList.remove("chip-active"));
          chip.classList.add("chip-active");
          dayChips.forEach((d) => d.classList.remove(chipDayDullClass));
          previousDay?.classList.add(chipDayDullClass);
          filterSection?.classList.add(packagesCustomSelectedClass);
          showStatus("Custom package feature coming soon!");
          selectedDays = null;
        } else {
          dayChips.forEach((d) => d.classList.remove(chipDayDullClass));
          filterSection?.classList.remove(packagesCustomSelectedClass);
          chips.forEach((node) => node.classList.remove("chip-active"));
          chip.classList.add("chip-active");
          selectedDays = extractDaysFromChip(chip);
        }
        applyLocationPackagesFilter();
      });
    });

    if (filterSection && dayChips.length > 1 && prevDayArrow && nextDayArrow) {
      prevDayArrow.addEventListener("click", () => moveLocationDayChip(-1));
      nextDayArrow.addEventListener("click", () => moveLocationDayChip(1));
    }

    window.addEventListener("resize", applyLocationPackagesTrackLayout);

    const defaultChip = filterSection?.querySelector(".chip-active:not(.chip-custom)");
    selectedDays = defaultChip ? extractDaysFromChip(defaultChip) : null;
    applyLocationPackagesFilter();
  }

  // Packages page: filter cards by selected day chip
  const packagesScreenSection = document.querySelector(".packages-screen");
  if (packagesScreenSection) {
    const filterSection = packagesScreenSection.querySelector(".package-screen-filters");
    const chips = Array.from(filterSection?.querySelectorAll(".chip") || []);
    const dayChips = chips.filter((chip) => !chip.classList.contains("chip-custom"));
    const cards = Array.from(packagesScreenSection.querySelectorAll(".package-screen-grid .package-card"));
    const packageTrack = packagesScreenSection.querySelector(".package-screen-grid");
    const getPackagesVisibleCardsCount = () => 3;
    const supportsHoverImageSwap =
      window.matchMedia("(hover: hover)").matches || !window.matchMedia("(pointer: coarse)").matches;
    const packageImageLoadCache = new Map();
    let packageAutoScrollTimer = null;
    let isPackagesAutoStepRunning = false;
    let packageAutoStepResetTimer = null;
    let selectedDays = null;
    let activePackageIndex = 0;
    let isPackagesScreenVisible = false;
    const coupleHoverImages = [
      "/assets/images/couple.png",
      "/assets/images/couple1.png",
      "/assets/images/couple2.png",
      "/assets/images/couple3.png",
      "/assets/images/couple4.png",
      "/assets/images/couple5.png"
    ];
    const friendsHoverImages = [
      "/assets/images/friends.png",
      "/assets/images/friends1.png",
      "/assets/images/friends2.webp",
      "/assets/images/friends3.png",
      "/assets/images/friends4.png",
      "/assets/images/friends5.png",
      "/assets/images/friends6.png"
    ];
    const familyHoverImages = [
      "/assets/images/couple1.png",
      "/assets/images/couple2.png",
      "/assets/images/friends1.png",
      "/assets/images/friends3.png"
    ];

    const extractDaysFromChip = (chip) => chip.textContent.match(/\d+/g)?.[1] || null;
    const getCardDaysValue = (card) => {
      const dataDays = card.dataset.days || null;
      if (dataDays) {
        return dataDays;
      }
      const metaText =
        card.querySelector(".package-meta-days-text")?.textContent?.trim() ||
        card.querySelector(".package-meta-duration")?.textContent?.trim() ||
        "";
      const visibleDays = metaText.match(/\d+/)?.[0] || null;
      return visibleDays || null;
    };

    const preloadPackageImage = (src) => {
      if (!src) {
        return Promise.resolve(false);
      }
      if (packageImageLoadCache.has(src)) {
        return packageImageLoadCache.get(src);
      }
      const loadPromise = new Promise((resolve) => {
        const preloadImage = new Image();
        preloadImage.onload = () => resolve(true);
        preloadImage.onerror = () => resolve(false);
        preloadImage.src = src;
      });
      packageImageLoadCache.set(src, loadPromise);
      return loadPromise;
    };

    const getPackagesPool = () => {
      const dayMatched = selectedDays ? cards.filter((card) => getCardDaysValue(card) === selectedDays) : cards.slice();
      return dayMatched.slice(0, 3);
    };

    const stopPackageAutoplay = () => {};

    const getVisiblePackageCards = () => cards.filter((card) => card.style.display !== "none");

    const applyPackagesTrackLayout = () => {
      cards.forEach((card) => {
        card.style.flex = "";
        card.style.minWidth = "";
        card.style.maxWidth = "";
        card.style.width = "";
      });
    };

    const scrollToPackage = () => {};

    const runPackageLeftStep = () => {};

    const startPackageAutoplay = () => {};

    const applyPackagesDayFilter = () => {
      applyPackagesTrackLayout();
      const pool = getPackagesPool();
      cards.forEach((card) => {
        // Keep stylesheet `display:flex` on .package-card; `block` breaks column flex + .meta margin-top:auto.
        if (pool.includes(card)) {
          card.style.removeProperty("display");
        } else {
          card.style.display = "none";
        }
      });
      activePackageIndex = 0;
      packageTrack?.scrollTo({ left: 0, behavior: "auto" });
      animateVisiblePackageCards(cards);
    };

    cards.forEach((card, idx) => {
      const imageNode = card.querySelector(".package-thumb img");
      if (!imageNode) {
        return;
      }

      const cardType = card.dataset.type || "";
      const defaultPool =
        cardType === "couple"
          ? coupleHoverImages
          : cardType === "friends"
            ? friendsHoverImages
            : cardType === "family"
              ? familyHoverImages
              : null;

      const customHoverPool = (card.getAttribute("data-package-hover-images") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const hoverPool =
        customHoverPool.length >= 2 ? customHoverPool : defaultPool?.length ? defaultPool : null;

      if (!hoverPool?.length) {
        return;
      }

      const useCarousel = customHoverPool.length >= 2;
      imageNode.dataset.originalSrc = imageNode.getAttribute("src") || "";
      imageNode.style.transition =
        "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)";
      hoverPool.forEach((src) => void preloadPackageImage(src));
      void preloadPackageImage(imageNode.dataset.originalSrc || "");
      let swapRequestId = 0;

      const sameImageUrl = (a, b) => {
        if (!a || !b) return false;
        try {
          return new URL(a, window.location.href).href === new URL(b, window.location.href).href;
        } catch (_e) {
          return String(a).trim() === String(b).trim();
        }
      };

      const setImageWithSwipe = async (nextSrc, isCarouselStep = false) => {
        if (!nextSrc) {
          return;
        }
        const current = imageNode.currentSrc || imageNode.src || imageNode.getAttribute("src") || "";
        /* Carousel must allow revisiting thumb (couple.png) — same-url skip would hide the third slot. */
        if (!isCarouselStep && sameImageUrl(nextSrc, current)) {
          return;
        }
        const requestId = ++swapRequestId;
        const isImageReady = await preloadPackageImage(nextSrc);
        if (!isImageReady || requestId !== swapRequestId) {
          return;
        }
        imageNode.classList.remove("package-image-swipe");
        imageNode.style.opacity = "0.9";
        imageNode.style.transform = "scale(1.04)";
        imageNode.src = nextSrc;
        void imageNode.offsetWidth;
        imageNode.classList.add("package-image-swipe");
        imageNode.style.opacity = "1";
        imageNode.style.transform = "scale(1.03)";
      };

      let hoverCarouselTimerId = null;
      let hoverHi = 0;
      let hoverCarouselGeneration = 0;
      let carouselStepQueue = Promise.resolve();

      const clearHoverCarousel = () => {
        if (hoverCarouselTimerId != null) {
          window.clearInterval(hoverCarouselTimerId);
          hoverCarouselTimerId = null;
        }
      };

      if (supportsHoverImageSwap) {
        card.addEventListener("mouseenter", () => {
          clearHoverCarousel();
          if (!useCarousel) {
            const hoverSrc = hoverPool[idx % hoverPool.length];
            void setImageWithSwipe(hoverSrc);
            return;
          }
          hoverCarouselGeneration += 1;
          const gen = hoverCarouselGeneration;
          hoverHi = 0;
          carouselStepQueue = Promise.resolve();

          const enqueueCarouselStep = () => {
            if (gen !== hoverCarouselGeneration) return;
            carouselStepQueue = carouselStepQueue
              .then(async () => {
                if (gen !== hoverCarouselGeneration) return;
                const src = hoverPool[hoverHi % hoverPool.length];
                const ok = await preloadPackageImage(src);
                if (gen !== hoverCarouselGeneration) return;
                if (!ok) {
                  hoverHi = (hoverHi + 1) % hoverPool.length;
                  return;
                }
                imageNode.classList.remove("package-image-swipe");
                imageNode.style.opacity = "0.9";
                imageNode.style.transform = "scale(1.04)";
                imageNode.src = src;
                void imageNode.offsetWidth;
                imageNode.classList.add("package-image-swipe");
                imageNode.style.opacity = "1";
                imageNode.style.transform = "scale(1.03)";
                hoverHi = (hoverHi + 1) % hoverPool.length;
              })
              .catch(() => {});
          };

          enqueueCarouselStep();
          hoverCarouselTimerId = window.setInterval(enqueueCarouselStep, 2400);
        });
        card.addEventListener("mouseleave", () => {
          hoverCarouselGeneration += 1;
          carouselStepQueue = Promise.resolve();
          clearHoverCarousel();
          hoverHi = 0;
          void setImageWithSwipe(imageNode.dataset.originalSrc || "");
        });
      }
    });

    const packagesCustomSelectedClass = "packages-custom-selected";
    const chipDayDullClass = "chip-day-dull";

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        if (chip.classList.contains("chip-custom")) {
          const previousDay =
            filterSection?.querySelector(".chip-active:not(.chip-custom)") ||
            filterSection?.querySelector(`.chip.${chipDayDullClass}:not(.chip-custom)`);

          chips.forEach((node) => node.classList.remove("chip-active"));
          chip.classList.add("chip-active");
          dayChips.forEach((d) => d.classList.remove(chipDayDullClass));
          previousDay?.classList.add(chipDayDullClass);
          filterSection?.classList.add(packagesCustomSelectedClass);

          selectedDays = null;
          applyPackagesDayFilter();
          showStatus("Custom package feature coming soon!");
          return;
        }

        dayChips.forEach((d) => d.classList.remove(chipDayDullClass));
        filterSection?.classList.remove(packagesCustomSelectedClass);
        chips.forEach((node) => node.classList.remove("chip-active"));
        chip.classList.add("chip-active");

        selectedDays = extractDaysFromChip(chip);
        applyPackagesDayFilter();
      });
    });

    if (filterSection && dayChips.length > 1) {
      const createDayArrow = (direction) => {
        const arrow = document.createElement("button");
        arrow.type = "button";
        arrow.className = `package-day-arrow package-day-arrow-${direction}`;
        arrow.setAttribute("aria-label", direction === "prev" ? "Previous day option" : "Next day option");
        arrow.textContent = direction === "prev" ? "‹" : "›";
        return arrow;
      };

      const prevArrow = createDayArrow("prev");
      const nextArrow = createDayArrow("next");
      filterSection.prepend(prevArrow);
      filterSection.append(nextArrow);

      const moveDayChip = (step) => {
        const activeIndex = dayChips.findIndex((chip) => chip.classList.contains("chip-active"));
        const dullIndex = dayChips.findIndex((chip) => chip.classList.contains(chipDayDullClass));
        const baseIndex = activeIndex >= 0 ? activeIndex : (dullIndex >= 0 ? dullIndex : 0);
        const targetIndex = (baseIndex + step + dayChips.length) % dayChips.length;
        dayChips[targetIndex]?.click();
      };

      prevArrow.addEventListener("click", () => moveDayChip(-1));
      nextArrow.addEventListener("click", () => moveDayChip(1));
    }

    if (packageTrack) {
      packageTrack.classList.remove("one-by-one-package-slider");
      packageTrack.scrollTo({ left: 0, behavior: "auto" });
    }

    const packagesVisibilityObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isPackagesScreenVisible = Boolean(entry?.isIntersecting);
        if (!isPackagesScreenVisible) {
          stopPackageAutoplay();
        }
      },
      { threshold: 0.01, rootMargin: "0px" }
    );
    packagesVisibilityObserver.observe(packagesScreenSection);

    const defaultChip = filterSection?.querySelector(".chip-active:not(.chip-custom)");
    selectedDays = defaultChip ? extractDaysFromChip(defaultChip) : null;
    applyPackagesDayFilter();
  }

  // Popular packages: tab filtering
  const packageSection = document.querySelector(".popular-packages");
  if (packageSection) {
    const tabs = Array.from(packageSection.querySelectorAll(".package-tabs button"));
    const cards = Array.from(packageSection.querySelectorAll(".package-card"));
    const packageTrack = packageSection.querySelector(".package-grid-new");
    let packageAutoScrollTimer = null;
    let activePackageIndex = 0;
    let isPackageSectionVisible = false;
    const coupleHoverImages = [
      "/assets/images/couple.png",
      "/assets/images/couple1.png",
      "/assets/images/couple2.png",
      "/assets/images/couple3.png",
      "/assets/images/couple4.png",
      "/assets/images/couple5.png"
    ];
    const friendsHoverImages = [
      "/assets/images/friends.png",
      "/assets/images/friends1.png",
      "/assets/images/friends2.webp",
      "/assets/images/friends3.png",
      "/assets/images/friends4.png",
      "/assets/images/friends5.png",
      "/assets/images/friends6.png"
    ];
    const familyHoverImages = [
      "/assets/images/couple1.png",
      "/assets/images/couple2.png",
      "/assets/images/friends1.png",
      "/assets/images/friends3.png"
    ];

    const applyPackageFilter = (type) => {
      cards.forEach((card) => {
        const cardType = card.dataset.type || "";
        const visible = type === "all" || type === cardType;
        card.style.display = visible ? "block" : "none";
      });
      animateVisiblePackageCards(cards);
      activePackageIndex = 0;
      if (packageTrack) {
        packageTrack.scrollTo({ left: 0, behavior: "smooth" });
      }
    };

    const getVisiblePackageCards = () => cards.filter((card) => card.style.display !== "none");

    const stopPackageAutoplay = () => {
      if (packageAutoScrollTimer) {
        window.clearInterval(packageAutoScrollTimer);
        packageAutoScrollTimer = null;
      }
    };

    const scrollToPackage = (index) => {
      if (!packageTrack) {
        return;
      }
      const visibleCards = getVisiblePackageCards();
      if (!visibleCards.length) {
        return;
      }
      activePackageIndex = (index + visibleCards.length) % visibleCards.length;
      packageTrack.scrollTo({
        left: visibleCards[activePackageIndex].offsetLeft,
        behavior: "smooth"
      });
    };

    const startPackageAutoplay = (immediate = false) => {
      stopPackageAutoplay();
      const visibleCards = getVisiblePackageCards();
      if (!packageTrack || visibleCards.length < 2 || !isPackageSectionVisible) {
        return;
      }
      if (immediate) {
        scrollToPackage(activePackageIndex + 1);
      }
      packageAutoScrollTimer = window.setInterval(() => {
        scrollToPackage(activePackageIndex + 1);
      }, 3000);
    };


    // Show only couple cards on load (All tab active shows all)
    applyPackageFilter("all");
    if (packageTrack) {
      packageTrack.classList.add("one-by-one-package-slider");
      packageTrack.addEventListener(
        "scroll",
        () => {
          const visibleCards = getVisiblePackageCards();
          if (!visibleCards.length) {
            return;
          }
          const nearestIndex = visibleCards.reduce((bestIndex, card, idx) => {
            const bestDistance = Math.abs(visibleCards[bestIndex].offsetLeft - packageTrack.scrollLeft);
            const currentDistance = Math.abs(card.offsetLeft - packageTrack.scrollLeft);
            return currentDistance < bestDistance ? idx : bestIndex;
          }, 0);
          activePackageIndex = nearestIndex;
        },
        { passive: true }
      );
      packageTrack.addEventListener("mouseenter", stopPackageAutoplay);
      packageTrack.addEventListener("mouseleave", startPackageAutoplay);
      packageTrack.addEventListener("touchstart", stopPackageAutoplay, { passive: true });
      packageTrack.addEventListener("touchend", startPackageAutoplay);
    }

    const packageVisibilityObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isPackageSectionVisible = Boolean(entry?.isIntersecting);
        if (isPackageSectionVisible) {
          startPackageAutoplay(true);
        } else {
          stopPackageAutoplay();
        }
      },
      { threshold: 0.01, rootMargin: "0px" }
    );
    packageVisibilityObserver.observe(packageSection);

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setActive(tabs, tab);
        const type = (tab.textContent || "").trim().toLowerCase();
        applyPackageFilter(type);
        startPackageAutoplay();
      });
    });

    const supportsHoverImageSwap =
      window.matchMedia("(hover: hover)").matches || !window.matchMedia("(pointer: coarse)").matches;
    const packageImageLoadCache = new Map();

    const preloadPackageImage = (src) => {
      if (!src) {
        return Promise.resolve(false);
      }
      if (packageImageLoadCache.has(src)) {
        return packageImageLoadCache.get(src);
      }
      const loadPromise = new Promise((resolve) => {
        const preloadImage = new Image();
        preloadImage.onload = () => resolve(true);
        preloadImage.onerror = () => resolve(false);
        preloadImage.src = src;
      });
      packageImageLoadCache.set(src, loadPromise);
      return loadPromise;
    };

    cards.forEach((card, idx) => {
      const imageNode = card.querySelector(".package-thumb img");
      if (!imageNode) {
        return;
      }
      const cardType = card.dataset.type || "";
      const defaultPool =
        cardType === "couple"
          ? coupleHoverImages
          : cardType === "friends"
            ? friendsHoverImages
            : cardType === "family"
              ? familyHoverImages
              : null;

      const customHoverPool = (card.getAttribute("data-package-hover-images") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const hoverPool =
        customHoverPool.length >= 2 ? customHoverPool : defaultPool?.length ? defaultPool : null;

      if (!hoverPool?.length) {
        return;
      }

      const useCarousel = customHoverPool.length >= 2;
      imageNode.dataset.originalSrc = imageNode.getAttribute("src") || "";
      imageNode.style.transition =
        "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)";
      hoverPool.forEach((src) => void preloadPackageImage(src));
      void preloadPackageImage(imageNode.dataset.originalSrc || "");
      let swapRequestId = 0;

      const sameImageUrl = (a, b) => {
        if (!a || !b) return false;
        try {
          return new URL(a, window.location.href).href === new URL(b, window.location.href).href;
        } catch (_e) {
          return String(a).trim() === String(b).trim();
        }
      };

      const setImageWithSwipe = async (nextSrc, isCarouselStep = false) => {
        if (!nextSrc) {
          return;
        }
        const current = imageNode.currentSrc || imageNode.src || imageNode.getAttribute("src") || "";
        if (!isCarouselStep && sameImageUrl(nextSrc, current)) {
          return;
        }
        const requestId = ++swapRequestId;
        const isImageReady = await preloadPackageImage(nextSrc);
        if (!isImageReady || requestId !== swapRequestId) {
          return;
        }
        imageNode.classList.remove("package-image-swipe");
        imageNode.style.opacity = "0.9";
        imageNode.style.transform = "scale(1.04)";
        imageNode.src = nextSrc;
        void imageNode.offsetWidth;
        imageNode.classList.add("package-image-swipe");
        imageNode.style.opacity = "1";
        imageNode.style.transform = "scale(1.03)";
      };

      let hoverCarouselTimerId = null;
      let hoverHi = 0;
      let hoverCarouselGeneration = 0;
      let carouselStepQueue = Promise.resolve();

      const clearHoverCarousel = () => {
        if (hoverCarouselTimerId != null) {
          window.clearInterval(hoverCarouselTimerId);
          hoverCarouselTimerId = null;
        }
      };

      if (supportsHoverImageSwap) {
        card.addEventListener("mouseenter", () => {
          clearHoverCarousel();
          if (!useCarousel) {
            const hoverSrc = hoverPool[idx % hoverPool.length];
            void setImageWithSwipe(hoverSrc);
            return;
          }
          hoverCarouselGeneration += 1;
          const gen = hoverCarouselGeneration;
          hoverHi = 0;
          carouselStepQueue = Promise.resolve();

          const enqueueCarouselStep = () => {
            if (gen !== hoverCarouselGeneration) return;
            carouselStepQueue = carouselStepQueue
              .then(async () => {
                if (gen !== hoverCarouselGeneration) return;
                const src = hoverPool[hoverHi % hoverPool.length];
                const ok = await preloadPackageImage(src);
                if (gen !== hoverCarouselGeneration) return;
                if (!ok) {
                  hoverHi = (hoverHi + 1) % hoverPool.length;
                  return;
                }
                imageNode.classList.remove("package-image-swipe");
                imageNode.style.opacity = "0.9";
                imageNode.style.transform = "scale(1.04)";
                imageNode.src = src;
                void imageNode.offsetWidth;
                imageNode.classList.add("package-image-swipe");
                imageNode.style.opacity = "1";
                imageNode.style.transform = "scale(1.03)";
                hoverHi = (hoverHi + 1) % hoverPool.length;
              })
              .catch(() => {});
          };

          enqueueCarouselStep();
          hoverCarouselTimerId = window.setInterval(enqueueCarouselStep, 2400);
        });

        card.addEventListener("mouseleave", () => {
          hoverCarouselGeneration += 1;
          carouselStepQueue = Promise.resolve();
          clearHoverCarousel();
          hoverHi = 0;
          void setImageWithSwipe(imageNode.dataset.originalSrc || "");
        });
      }
    });

    packageSection.querySelector(".see-all")?.addEventListener("click", () => {
      window.location.href = "packages.html";
    });
  }

  // Package cards: open package details with selected card data
  const packageCards = Array.from(document.querySelectorAll(".package-card"));
  if (packageCards.length) {
    const toPackageSlug = (text) =>
      String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "tripon-package";
    const triponNormalizePackageImageRef = (src) => {
      const raw = String(src || "").trim();
      if (!raw) return "";
      if (raw.startsWith("data:") || /^(https?:)?\/\//i.test(raw)) return raw;
      if (raw.startsWith("/")) {
        try {
          return new URL(raw, window.location.origin || window.location.href).href;
        } catch (_e) {
          return raw;
        }
      }
      let path = raw.replace(/\\/g, "/").replace(/^\.\//, "");
      while (path.startsWith("../")) path = path.slice(3);
      if (path.startsWith("images/")) {
        path = "/assets/images/" + path.slice("images/".length);
      } else if (path.startsWith("assets/images/")) {
        path = "/" + path;
      } else {
        try {
          return new URL(raw, window.location.href).href;
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
    };
    const toAbsoluteImageUrl = (src) => triponNormalizePackageImageRef(src);
    const normalizeCsvImages = (csv) =>
      String(csv || "")
        .split(",")
        .map((piece) => triponNormalizePackageImageRef(piece.trim()))
        .filter(Boolean)
        .join(",");

    packageCards.forEach((card) => {
      // Skip package cards inside modals on details page, if any shared script usage occurs.
      if (card.closest(".modal-overlay")) return;

      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const title = card.querySelector("h4")?.textContent?.trim() || "";
        const locationText = card.querySelector(".location")?.textContent?.replace(/\s+/g, " ").trim() || "";
        const ratingRaw = card.querySelector(".rating span")?.textContent?.trim() || "";
        const ratingMatch = ratingRaw.match(/(\d+(\.\d+)?)/);
        const reviewsMatch = ratingRaw.match(/\((\d+)\)/);
        const daysText = card.querySelector(".package-meta-days-text")?.textContent?.trim() || "";
        const priceFromMeta = card.querySelector(".meta span:last-child")?.textContent?.trim() || "";
        const metaText = card.querySelector(".meta")?.textContent?.replace(/\s+/g, " ").trim() || "";
        const priceMatch = metaText.match(/From\s*([₹$]\s?[\d,]+(?:\.\d+)?)/i);
        const priceText = priceMatch?.[1]?.trim() || priceFromMeta.replace(/^From\s*/i, "").trim();
        const imageSrc = card.querySelector(".package-thumb img")?.getAttribute("src") || "";
        const packageType = card.getAttribute("data-type") || "";
        const packagePlaces = (card.getAttribute("data-package-places") || card.getAttribute("data-places") || "").trim();
        const packageActivities = (card.getAttribute("data-package-activities") || card.getAttribute("data-activities") || "").trim();
        const packageGallery = normalizeCsvImages(card.getAttribute("data-package-gallery") || "");
        const packageDetailImages = normalizeCsvImages(card.getAttribute("data-package-detail-images") || "");
        const payload = {
          title,
          location: locationText,
          rating: ratingMatch?.[1] || "",
          reviews: reviewsMatch?.[1] || "",
          days: daysText,
          type: packageType,
          price: priceText,
          image: imageSrc ? toAbsoluteImageUrl(imageSrc) : "",
          gallery: packageGallery,
          detailImages: packageDetailImages,
          places: packagePlaces,
          activities: packageActivities
        };
        const slug = toPackageSlug(title);
        sessionStorage.setItem("tripon_selected_package", JSON.stringify(payload));
        sessionStorage.setItem("tripon_selected_package_slug", slug);
        window.location.href = "/packages/package-details.html";
      });
    });
  }

  // Testimonials: read-more + horizontal carousel (desktop row / 320px one-by-one)
  const testimonials = document.querySelector(".testimonials");
  if (testimonials) {
    const testimonialWall = testimonials.querySelector(".testimonial-wall");
    const reviewCards = Array.from(testimonialWall?.querySelectorAll(".review-card") || []);
    const testimonialMobileMq = window.matchMedia("(max-width: 320px)");
    const testimonialReduceMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let testimonialAutoScrollTimer = null;
    let testimonialActiveIndex = 0;
    let isTestimonialsVisible = false;

    const scrollToTestimonial = (index, smooth = true) => {
      if (!reviewCards.length || !testimonialWall) return;
      testimonialActiveIndex = (index + reviewCards.length) % reviewCards.length;
      const card = reviewCards[testimonialActiveIndex];
      if (!card) return;
      const targetLeft = Math.max(0, card.offsetLeft - testimonialWall.offsetLeft);
      testimonialWall.scrollTo({
        left: targetLeft,
        behavior: smooth ? "smooth" : "auto"
      });
    };

    const stopTestimonialAutoplay = () => {
      if (testimonialAutoScrollTimer) {
        window.clearInterval(testimonialAutoScrollTimer);
        testimonialAutoScrollTimer = null;
      }
    };

    const startTestimonialAutoplay = (immediate = false) => {
      stopTestimonialAutoplay();
      if (
        testimonialReduceMotionMq.matches ||
        reviewCards.length < 2 ||
        !isTestimonialsVisible
      ) {
        return;
      }
      if (immediate) {
        scrollToTestimonial(testimonialActiveIndex + 1);
      }
      testimonialAutoScrollTimer = window.setInterval(() => {
        scrollToTestimonial(testimonialActiveIndex + 1);
      }, 2600);
    };

    if (testimonialWall && reviewCards.length) {
      testimonialWall.classList.add("one-by-one-slider");

      reviewCards.forEach((card, idx) => {
        card.addEventListener("click", () => {
          scrollToTestimonial(idx);
        });
      });

      testimonialWall.addEventListener("mouseenter", stopTestimonialAutoplay);
      testimonialWall.addEventListener("mouseleave", startTestimonialAutoplay);
      testimonialWall.addEventListener("touchstart", stopTestimonialAutoplay, { passive: true });
      testimonialWall.addEventListener("touchend", () => {
        window.setTimeout(startTestimonialAutoplay, 400);
      });

      const testimonialsObserver = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          isTestimonialsVisible = Boolean(entry?.isIntersecting);
          if (isTestimonialsVisible) {
            startTestimonialAutoplay(true);
          } else {
            stopTestimonialAutoplay();
          }
        },
        { threshold: 0.15, rootMargin: "0px" }
      );
      testimonialsObserver.observe(testimonials);

      if (typeof testimonialMobileMq.addEventListener === "function") {
        testimonialMobileMq.addEventListener("change", () => {
          scrollToTestimonial(testimonialActiveIndex, false);
        });
      } else {
        testimonialMobileMq.addListener(() => {
          scrollToTestimonial(testimonialActiveIndex, false);
        });
      }

      if (typeof testimonialReduceMotionMq.addEventListener === "function") {
        testimonialReduceMotionMq.addEventListener("change", startTestimonialAutoplay);
      } else {
        testimonialReduceMotionMq.addListener(startTestimonialAutoplay);
      }
    }

    const texts = testimonials.querySelectorAll(".review-text");
    texts.forEach((node) => {
      const text = node.textContent?.trim() || "";
      if (text.length > 150) {
        const short = `${text.slice(0, 150)}...`;
        node.dataset.fullText = text;
        node.dataset.shortText = short;
        node.textContent = short;
        node.addEventListener("click", () => {
          const expanded = node.getAttribute("data-expanded") === "true";
          node.textContent = expanded ? (node.dataset.shortText || "") : (node.dataset.fullText || "");
          node.setAttribute("data-expanded", String(!expanded));
        });
      }
    });
  }

  // Video banner CTA: open YouTube embed in popup
  const spotlightBtn = document.querySelector(".spotlight-btn");
  const spotlight3dModal = document.getElementById("spotlight3dModal");
  const spotlight3dIframe = document.getElementById("spotlight3dIframe");
  const spotlight3dClose = document.getElementById("spotlight3dClose");
  const SPOTLIGHT_3D_EMBED =
    "https://www.youtube.com/embed/LCqK7wZd2Pk?si=_a0c8ivdo5Jsbu0K";

  let spotlight3dLockedScrollY = 0;
  const lockScrollForSpotlight3d = () => {
    spotlight3dLockedScrollY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${spotlight3dLockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  };

  const unlockScrollForSpotlight3d = () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, spotlight3dLockedScrollY);
  };

  const openSpotlight3dModal = () => {
    if (!spotlight3dModal || !spotlight3dIframe) {
      showStatus("3D view feature coming soon");
      return;
    }
    spotlight3dModal.classList.add("active");
    spotlight3dModal.setAttribute("aria-hidden", "false");
    spotlight3dIframe.src = SPOTLIGHT_3D_EMBED;
    lockScrollForSpotlight3d();
    spotlight3dClose?.focus();
  };

  const closeSpotlight3dModal = () => {
    if (!spotlight3dModal || !spotlight3dIframe) {
      return;
    }
    spotlight3dModal.classList.remove("active");
    spotlight3dModal.setAttribute("aria-hidden", "true");
    spotlight3dIframe.src = "";
    unlockScrollForSpotlight3d();
    spotlightBtn?.focus();
  };

  spotlightBtn?.addEventListener("click", openSpotlight3dModal);

  if (spotlight3dModal && spotlight3dIframe) {
    spotlight3dClose?.addEventListener("click", closeSpotlight3dModal);
    spotlight3dModal.addEventListener("click", (e) => {
      if (e.target === spotlight3dModal) {
        closeSpotlight3dModal();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && spotlight3dModal.classList.contains("active")) {
        closeSpotlight3dModal();
      }
    });
  }

  // Why choose cards: keep static; no click highlight outline.

  // FAQ section: tab + accordion with category filtering
  const dealsSection = document.querySelector(".deals");
  if (dealsSection) {
    const faqTabs = Array.from(dealsSection.querySelectorAll(".faq-tabs button"));
    const faqItems = Array.from(dealsSection.querySelectorAll(".faq-item"));

    // Handle individual FAQ item toggle
    faqItems.forEach((item) => {
      const row = item.querySelector(".faq-row");
      row?.addEventListener("click", () => {
        const alreadyActive = item.classList.contains("active");
        faqItems.forEach((node) => {
          node.classList.remove("active");
        });
        if (!alreadyActive) {
          item.classList.add("active");
        }
      });
    });

    // Handle category tab filtering
    faqTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setActive(faqTabs, tab);
        const selectedCategory = (tab.textContent || "").trim().toLowerCase();
        faqItems.forEach((item) => {
          const itemCategory = item.dataset.category || "";
          const isVisible = selectedCategory === "general" || itemCategory === selectedCategory;
          item.style.display = isVisible ? "block" : "none";
          item.classList.remove("active");
        });
      });
    });

    // Show only general category on load
    const defaultCategory = "general";
    faqItems.forEach((item) => {
      item.style.display = item.dataset.category === defaultCategory ? "block" : "none";
    });
  }

  // Bali blogs: fake play controls + custom share modal
  let blogShareModalRoot = null;
  let blogShareModalPrevOverflow = "";

  const closeBlogShareModal = () => {
    if (!blogShareModalRoot) return;
    blogShareModalRoot.classList.remove("is-open");
    blogShareModalRoot.setAttribute("aria-hidden", "true");
    document.body.style.overflow = blogShareModalPrevOverflow || "";
  };

  function ensureBlogShareModal() {
    if (blogShareModalRoot) return blogShareModalRoot;

    const root = document.createElement("div");
    root.id = "blog-share-modal";
    root.className = "blog-share-modal";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "blog-share-modal-title");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <div class="blog-share-modal-backdrop" data-blog-share-close></div>
      <div class="blog-share-modal-panel">
        <div class="blog-share-modal-head">
          <h2 id="blog-share-modal-title" class="blog-share-modal-title">Share</h2>
          <button type="button" class="blog-share-modal-close" aria-label="Close">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div class="blog-share-modal-scroll-wrap">
          <button type="button" class="blog-share-modal-scroll-prev" aria-label="Previous share options">
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
          <div class="blog-share-modal-options" id="blogShareModalOptions">
            <a class="blog-share-option" data-share-key="whatsapp" href="#" target="_blank" rel="noopener noreferrer">
              <span class="blog-share-option-icon blog-share-option-icon--whatsapp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></span>
              <span class="blog-share-option-label">WhatsApp</span>
            </a>
            <a class="blog-share-option" data-share-key="sms" href="#">
              <span class="blog-share-option-icon blog-share-option-icon--messages"><i class="fa-solid fa-message" aria-hidden="true"></i></span>
              <span class="blog-share-option-label">Messages</span>
            </a>
            <a class="blog-share-option" data-share-key="facebook" href="#" target="_blank" rel="noopener noreferrer">
              <span class="blog-share-option-icon blog-share-option-icon--facebook"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></span>
              <span class="blog-share-option-label">Facebook</span>
            </a>
            <a class="blog-share-option" data-share-key="x" href="#" target="_blank" rel="noopener noreferrer">
              <span class="blog-share-option-icon blog-share-option-icon--x"><i class="fa-brands fa-x-twitter" aria-hidden="true"></i></span>
              <span class="blog-share-option-label">X</span>
            </a>
            <a class="blog-share-option" data-share-key="email" href="#">
              <span class="blog-share-option-icon blog-share-option-icon--email"><i class="fa-solid fa-envelope" aria-hidden="true"></i></span>
              <span class="blog-share-option-label">Email</span>
            </a>
            <a class="blog-share-option" data-share-key="reddit" href="#" target="_blank" rel="noopener noreferrer">
              <span class="blog-share-option-icon blog-share-option-icon--reddit"><i class="fa-brands fa-reddit-alien" aria-hidden="true"></i></span>
              <span class="blog-share-option-label">Reddit</span>
            </a>
          </div>
          <button type="button" class="blog-share-modal-scroll-next" aria-label="More share options">
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `;

    root.querySelector(".blog-share-modal-backdrop")?.addEventListener("click", closeBlogShareModal);
    root.querySelector(".blog-share-modal-close")?.addEventListener("click", closeBlogShareModal);

    const track = root.querySelector("#blogShareModalOptions");
    const scrollStep = 160;
    root.querySelector(".blog-share-modal-scroll-prev")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      track?.scrollBy({ left: -scrollStep, behavior: "smooth" });
    });
    root.querySelector(".blog-share-modal-scroll-next")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      track?.scrollBy({ left: scrollStep, behavior: "smooth" });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && blogShareModalRoot?.classList.contains("is-open")) {
        closeBlogShareModal();
      }
    });

    document.body.appendChild(root);
    blogShareModalRoot = root;
    return blogShareModalRoot;
  }

  const openBlogShareModal = (title, shareUrl) => {
    ensureBlogShareModal();
    const root = blogShareModalRoot;
    if (!root) return;

    const safeTitle = (title || "Tripon Blog").trim();
    const text = `${safeTitle}\n${shareUrl}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);
    const subject = encodeURIComponent(safeTitle);

    const hrefByKey = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      sms: `sms:?body=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(safeTitle)}&url=${encodedUrl}`,
      email: `mailto:?subject=${subject}&body=${encodedText}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(safeTitle)}`,
    };

    root.querySelectorAll("[data-share-key]").forEach((a) => {
      const key = a.getAttribute("data-share-key");
      if (key && hrefByKey[key]) {
        a.href = hrefByKey[key];
      }
    });

    if (root.classList.contains("is-open")) {
      return;
    }

    blogShareModalPrevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      root.querySelector(".blog-share-modal-close")?.focus();
    });
  };

  const blogSections = document.querySelectorAll(".bali-blogs");

  blogSections.forEach((blogSection) => {

  // Blog click
    const blogCards = blogSection.querySelectorAll(".bali-card");

    blogCards.forEach((card) => {
      card.style.cursor = "pointer";

      card.addEventListener("click", () => {
        const slug = (card.getAttribute("data-blog-slug") || "").trim();
        if (slug) {
          window.location.href = triponBlogDetailPageHref(slug);
          return;
        }
        const blogLink = card.getAttribute("data-blog-link");
        if (blogLink) {
          const m = blogLink.match(/\/blogs\/([^/?#]+?)(?:\.html|\/)/i);
          if (m?.[1]) {
            window.location.href = triponBlogDetailPageHref(m[1]);
            return;
          }
          window.location.href = blogLink;
          return;
        }
        const pageName = (window.location.pathname.split("/").pop() || "").toLowerCase();
        if (["packages.html", "people-reviews.html"].includes(pageName)) {
          window.location.href = triponBlogDetailPageHref("bali-tropical-journey");
          return;
        }
        const title = card.querySelector("h3")?.textContent || "";
        const desc = card.querySelector("p")?.textContent || "No description available";

        alert(`📍 ${title}\n\n${desc}`);
      });
   });

  // Play bar
   const playBars = blogSection.querySelectorAll(".blog-video-bar");
   playBars.forEach((bar) => {
    bar.addEventListener("click", () => {
       const fill = bar.querySelector(".blog-progress-fill");
      if (fill) {
        const current = parseInt(fill.style.width || "42", 10);
        const next = current >= 96 ? 18 : current + 22;
        fill.style.width = `${next}%`;
      }
    });
  });

  // Share buttons
  const shareButtons = blogSection.querySelectorAll(".blog-share-btn");

  shareButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const card = btn.closest(".bali-card");
      const title = card?.querySelector("h3")?.textContent?.trim() || "Tripon Blog";
      const blogSlug = (card?.getAttribute("data-blog-slug") || "").trim();
      const blogLink = card?.getAttribute("data-blog-link");
      let shareUrl = window.location.href;
      if (blogSlug) {
        shareUrl = new URL(triponBlogDetailPageHref(blogSlug), window.location.href).toString();
      } else if (blogLink) {
        const m = blogLink.match(/\/blogs\/([^/?#]+?)(?:\.html|\/)/i);
        shareUrl = m?.[1]
          ? new URL(triponBlogDetailPageHref(m[1]), window.location.href).toString()
          : new URL(blogLink, window.location.href).toString();
      }

      openBlogShareModal(title, shareUrl);
    });
  });

});

  // Blog page sidebar: search + category/tag filter + recent jump
  const blogMain = document.querySelector(".blog-main");
  if (blogMain) {
    const postRows = Array.from(blogMain.querySelectorAll(".blog-post-row"));
    const searchInput = blogMain.querySelector(".blog-search-box input");
    const categoryLinks = Array.from(blogMain.querySelectorAll(".blog-link-list a[data-blog-filter]"));
    const tagItems = Array.from(blogMain.querySelectorAll(".blog-tags [data-blog-tag]"));
    const sidebarSocialLinks = Array.from(blogMain.querySelectorAll(".blog-socials a"));
    let activeFilter = null;

    const matchesSearch = (row, query) => {
      if (!query) return true;
      const title = row.querySelector("h3")?.textContent?.toLowerCase() || "";
      const copy = row.querySelector(".blog-post-copy p:not(.blog-meta)")?.textContent?.toLowerCase() || "";
      const tags = (row.dataset.tags || "").toLowerCase();
      return title.includes(query) || copy.includes(query) || tags.includes(query);
    };

    const matchesFilter = (row, filter) => {
      if (!filter) return true;
      const category = (row.dataset.category || "").toLowerCase();
      const tags = (row.dataset.tags || "").toLowerCase();
      return category === filter || tags.includes(filter);
    };

    const applyBlogFilters = () => {
      const query = (searchInput?.value || "").trim().toLowerCase();
      let visibleCount = 0;
      postRows.forEach((row) => {
        const visible = matchesSearch(row, query) && matchesFilter(row, activeFilter);
        row.style.display = visible ? "grid" : "none";
        if (visible) visibleCount += 1;
      });
      if (!visibleCount && (query || activeFilter)) {
        showStatus("No matching posts found");
      }
    };

    const setActiveSidebarFilter = (filter) => {
      activeFilter = activeFilter === filter ? null : filter;
      categoryLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.blogFilter === activeFilter));
      tagItems.forEach((tag) => tag.classList.toggle("is-active", tag.dataset.blogTag === activeFilter));
      applyBlogFilters();
    };

    searchInput?.addEventListener("input", applyBlogFilters);
    searchInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const firstVisible = postRows.find((row) => row.style.display !== "none");
        firstVisible?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (event.key === "Escape") {
        searchInput.value = "";
        applyBlogFilters();
      }
    });

    categoryLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        setActiveSidebarFilter((link.dataset.blogFilter || "").toLowerCase());
      });
    });

    tagItems.forEach((tag) => {
      tag.style.cursor = "pointer";
      tag.addEventListener("click", () => {
        setActiveSidebarFilter((tag.dataset.blogTag || "").toLowerCase());
      });
    });

    postRows.forEach((row) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
          return;
        }
        const slug = (row.dataset.postId || "").trim();
        if (!slug) {
          return;
        }
        window.location.href = triponBlogDetailPageHref(slug);
      });
    });

    const socialTargets = {
      Facebook: "https://facebook.com",
      Instagram: "https://instagram.com",
      Pinterest: "https://pinterest.com",
      Twitter: "https://x.com"
    };
    sidebarSocialLinks.forEach((link) => {
      const label = link.getAttribute("aria-label") || "";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const target = socialTargets[label];
        if (target) {
          window.open(target, "_blank", "noopener,noreferrer");
        }
      });
    });

    applyBlogFilters();
  }

  // Blog details: Prev / Next swap in-place article content (circular list)
  const blogDetailsNavPrev = document.querySelector("#blogDetailsNavPrev");
  const blogDetailsNavNext = document.querySelector("#blogDetailsNavNext");
  if (blogDetailsNavPrev && blogDetailsNavNext) {
    const blogDetailPosts = [
      {
        slug: "bali-tropical-journey",
        pageTitle: "Tripon — Exploring Bali: A Tropical Journey",
        heroSrc:
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1800&q=80",
        heroAlt: "Balinese temple gate at dusk",
        heroH1: "Exploring Bali: A Tropical Journey",
        breadcrumb: "Home / Blog / Asia / Indonesia / Bali",
        leadTitle: "Temples, Terraces, and Island Rhythms",
        leadBody:
          "Bali blends Hindu ceremony with surf breaks and farmer-planted ribbons of green. Start with respectful temple visits, add a rice-terrace walk before midday heat, then trade the day for a beach sunset. Leave room for unplanned banjar festivals—they are the island at its most alive.",
        points: [
          "Carry a sarong for temple entries and sudden invitations to ceremonies.",
          "Hire local drivers for day trips; traffic peaks surprise first-timers.",
          "Balance Ubud calm with south-coast surf towns if you want contrast.",
          "Hydrate constantly; tropical afternoons call for slower pacing."
        ],
        quote: "\"Bali rewards travelers who move gently—early starts, soft voices, long evenings.\"",
        longcopy:
          "Support community guides in rural villages, tip fairly, and learn a few Indonesian pleasantries beyond tourist strips. Choose reef-safe sunscreen before snorkeling Nusa Penida or the east coast.",
        subcopies: [
          "Cash still matters at warungs; split ATM withdrawals to limit fees.",
          "Scooter riders should confirm insurance and helmet quality.",
          "Book reputable dive shops with small group ratios."
        ],
        gallery: [
          {
            src: "/assets/images/blog.png",
            alt: "Rice terraces in Bali",
            caption: "Walk terraces early for mist and cooler air."
          },
          {
            src: "/assets/images/blog1.png",
            alt: "Surfers on a Bali beach",
            caption: "South coast sunsets pair well with a fresh coconut stop."
          }
        ],
        tags: ["Culture", "Nature", "Beach"],
        author: {
          name: "Janna Auniman",
          role: "World Traveller",
          bio: "Janna chronicles Indonesian islands with an emphasis on respectful cultural visits.",
          img: "https://i.pravatar.cc/90?img=5",
          imgAlt: "Janna Auniman profile photo"
        },
        navPreview: "Exploring Bali: terraces, temples, and coastlines"
      },
      {
        slug: "bali-tech-nomad",
        pageTitle: "Tripon — Tech Nomad's Guide to Bali",
        heroSrc:
          "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1800&q=80",
        heroAlt: "Laptop workspace overlooking lush greenery",
        heroH1: "Tech Nomad's Guide to Bali Templates",
        breadcrumb: "Home / Blog / Asia / Indonesia / Bali / Remote work",
        leadTitle: "Reliable Wifi, Quiet Corners, Visa Realities",
        leadBody:
          "Bali attracts remote workers for good reason—cowork hubs, smoothie-powered cafés, and surf-between-meeting culture. Vet accommodation wifi with recent reviews, screenshot visa rules because they evolve, and build a respectful relationship with villas that were never designed for midnight video calls.",
        points: [
          "Test redundancy: eSIM plus local hotspot for critical calls.",
          "Choose neighborhoods by noise tolerance—nightlife strips vs sleepy banjars.",
          "Join communities that organise skill shares, not endless pitch nights.",
          "Schedule deep work blocks before communal lunch crowds."
        ],
        quote: "\"The best Bali work trip treats the island like a hometown, not a backdrop.\"",
        longcopy:
          "Balance screen time with movement—micro breaks prevent burnout in humid heat. Support local accountants or visa agents instead of grey-market shortcuts.",
        subcopies: [
          "Noise-cancelling headphones are non-negotiable on scooter commutes.",
          "Back up files before monsoon-season power blips.",
          "Respect sound curfews; villas share walls with families."
        ],
        gallery: [
          {
            src: "/assets/images/blog2.png",
            alt: "Team collaborating on laptops",
            caption: "Cowork spaces help with printers, mail, and community."
          },
          {
            src: "/assets/images/blog3.png",
            alt: "Minimal desk with plant",
            caption: "Private villas can work if you verify upload speeds first."
          }
        ],
        tags: ["City", "Work", "Travel tips"],
        author: {
          name: "Leo Vikram",
          role: "Software Engineer",
          bio: "Leo tests connectivity, visa logistics, and sustainable stays for remote teams.",
          img: "https://i.pravatar.cc/90?img=12",
          imgAlt: "Leo Vikram profile photo"
        },
        navPreview: "Bali for tech nomads: wifi, visas, routines"
      },
      {
        slug: "bali-ubud-secrets",
        pageTitle: "Tripon — Secrets of Ubud",
        heroSrc:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1800&q=80",
        heroAlt: "Lush jungle gorge in Ubud",
        heroH1: "Secrets of Ubud: Culture and Nature",
        breadcrumb: "Home / Blog / Asia / Indonesia / Bali / Ubud",
        leadTitle: "Beyond the Main Street Art Market",
        leadBody:
          "Ubud rewards travelers who step past souvenir stalls into morning walks through quiet banjar lanes, family-run cooking classes, and ridge trails that smell of rain on leaves. Hire local guides for cycling routes, ask permission before entering small temples, and carry small bills for community-run workshops.",
        points: [
          "Sunrise walks along Campuhan Ridge beat midday crowds.",
          "Traditional dance shows fund schools—choose heritage venues.",
          "Try herbal jamu tastings then balance with plenty of water.",
          "Book spa sessions midweek for quieter treatment rooms."
        ],
        quote: "\"Ubud's secret is rhythm—early nature, slow food, early sleep.\"",
        longcopy:
          "Respect ceremonial closures and ogoh-ogoh prep during festival weeks. Choose ethical elephant-free experiences and verify animal welfare policies before booking.",
        subcopies: [
          "Some yoga studios require advance booking for limited mats.",
          "Cash tips for drivers help offset fuel on steep highland roads.",
          "Mosquito repellent matters near rice fields after rain."
        ],
        gallery: [
          {
            src: "/assets/images/blog4.png",
            alt: "Balinese offering baskets",
            caption: "Morning markets overflow with offering flowers and snacks."
          },
          {
            src: "/assets/images/blog5.png",
            alt: "Forest path with sunlight",
            caption: "Hidden canyon trails require sturdy shoes, not flip-flops."
          }
        ],
        tags: ["Culture", "Wellness", "Nature"],
        author: {
          name: "Leo Vikram",
          role: "Software Engineer",
          bio: "Leo documents slow itineraries that keep tourist load light on residential streets.",
          img: "https://i.pravatar.cc/90?img=12",
          imgAlt: "Leo Vikram profile photo"
        },
        navPreview: "Ubud beyond the markets: trails and traditions"
      },
      {
        slug: "bali-beyond-beach",
        pageTitle: "Tripon — Adventures in Bali Beyond the Beach",
        heroSrc:
          "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1800&q=80",
        heroAlt: "Volcano view at sunrise in Bali",
        heroH1: "Adventures in Bali: Beyond the Beach",
        breadcrumb: "Home / Blog / Asia / Indonesia / Bali / Adventure",
        leadTitle: "Summits, Terraces, and Hidden Waterfalls",
        leadBody:
          "Bali's interior is an adventure playbook—optional sunrise volcano treks, canyoning trips with trained safety teams, and scooter loops past clove plantations. Pack layers for summit winds, confirm fitness honest with guides, and never swim alone under unmarked jungle falls.",
        points: [
          "Book licensed operators for canyoning and via ferrata routes.",
          "Start volcano hikes with headlamps; trails are dark before dawn.",
          "Carry reef shoes if exploring rocky coastal blowholes.",
          "Support village parking fees—they maintain trailhead toilets."
        ],
        quote: "\"The island's drama is not only in the waves—it is in the ridgelines behind them.\"",
        longcopy:
          "Spread intense activity days with pool or spa recovery. Respect locals who rely on pilgrimage trails—yield space, silence phones, pack out trash.",
        subcopies: [
          "Travel insurance covering altitude and adventure sports is wise.",
          "Hydration salts help after sweaty ascents.",
          "Drone rules tighten near temples—ask before flying."
        ],
        gallery: [
          {
            src: "/assets/images/blog6.png",
            alt: "Mountain ridge above clouds",
            caption: "Clear mornings reveal neighboring peaks and coast."
          },
          {
            src: "/assets/images/blog7.png",
            alt: "Jungle waterfall plunge pool",
            caption: "Go with locals who know seasonal water strength."
          }
        ],
        tags: ["Adventure", "Nature", "Hiking"],
        author: {
          name: "Sara Kumari",
          role: "Adventure Traveller",
          bio: "Sara scouts ethical outdoor operators across island destinations.",
          img: "https://i.pravatar.cc/90?img=47",
          imgAlt: "Sara Kumari profile photo"
        },
        navPreview: "Bali adventures: volcanoes, falls, ridge roads"
      }
    ];

    const $ = (id) => document.getElementById(id);
    let blogDetailIndex = 0;

    const applyBlogDetailPost = (index) => {
      const n = blogDetailPosts.length;
      const i = ((index % n) + n) % n;
      blogDetailIndex = i;
      const post = blogDetailPosts[i];
      const prevPost = blogDetailPosts[(i - 1 + n) % n];
      const nextPost = blogDetailPosts[(i + 1) % n];

      document.title = post.pageTitle;

      const heroImg = $("blogDetailsHeroImg");
      if (heroImg) {
        heroImg.src = post.heroSrc;
        heroImg.alt = post.heroAlt;
      }
      const setText = (id, text) => {
        const node = $(id);
        if (node) {
          node.textContent = text;
        }
      };

      setText("blogDetailsHeroTitle", post.heroH1);
      setText("blogDetailsBreadcrumb", post.breadcrumb);
      setText("blogDetailsLeadTitle", post.leadTitle);
      setText("blogDetailsLeadBody", post.leadBody);
      post.points.forEach((text, idx) => setText(`blogDetailsPoint${idx + 1}`, text));
      setText("blogDetailsQuote", post.quote);
      setText("blogDetailsLongcopy", post.longcopy);
      post.subcopies.forEach((text, idx) => setText(`blogDetailsSubcopy${idx + 1}`, text));

      const g1 = post.gallery[0];
      const g2 = post.gallery[1] || g1;
      const img1 = $("blogDetailsGalleryImg1");
      const img2 = $("blogDetailsGalleryImg2");
      if (img1 && g1) {
        img1.src = g1.src;
        img1.alt = g1.alt;
      }
      if (img2 && g2) {
        img2.src = g2.src;
        img2.alt = g2.alt;
      }
      setText("blogDetailsGalleryCap1", g1?.caption || "");
      setText("blogDetailsGalleryCap2", g2?.caption || "");

      post.tags.forEach((tag, idx) => setText(`blogDetailsTag${idx + 1}`, tag));

      const auth = post.author;
      const aImg = $("blogDetailsAuthorImg");
      if (aImg && auth) {
        aImg.src = auth.img;
        aImg.alt = auth.imgAlt;
      }
      setText("blogDetailsAuthorName", auth.name);
      setText("blogDetailsAuthorRole", auth.role);
      setText("blogDetailsAuthorBio", auth.bio);

      setText("blogDetailsNavPrevHeading", prevPost.heroH1);
      setText("blogDetailsNavPrevSub", prevPost.navPreview);
      setText("blogDetailsNavNextHeading", nextPost.heroH1);
      setText("blogDetailsNavNextSub", nextPost.navPreview);

      document.querySelectorAll(".blog-details-tags span").forEach((chip) => chip.classList.remove("is-active"));
      document.querySelectorAll(".blog-details-related-grid .blog-related-card").forEach((card) => {
        card.style.removeProperty("display");
      });

      triponBlogDetailsReplaceHistory(post.slug);
    };

    const slugToIndex = (rawSlug) => {
      const slug = decodeURIComponent(rawSlug || "").trim().toLowerCase();
      if (!slug) {
        return 0;
      }
      const idx = blogDetailPosts.findIndex((p) => String(p.slug).toLowerCase() === slug);
      return idx >= 0 ? idx : 0;
    };

    const fromPath = () => {
      const params = new URLSearchParams(window.location.search || "");
      const qs = params.get("post") || params.get("slug");
      if (qs) {
        return slugToIndex(qs);
      }

      const pathRaw = window.location.pathname.replace(/\\/g, "/");
      let match = pathRaw.match(/\/blogs\/([^/]+)\.html$/i);
      let raw = "";
      if (match?.[1]) {
        raw = match[1];
      } else {
        match = pathRaw.match(/\/blogs\/([^/]+)\/?$/i);
        if (match?.[1]) {
          raw = match[1].replace(/\.html$/i, "");
        } else {
          const parts = pathRaw.split("/").filter(Boolean);
          const blogIdx = parts.findIndex((segment) => segment.toLowerCase() === "blogs");
          const seg = blogIdx >= 0 ? parts[blogIdx + 1] || "" : "";
          raw = seg.replace(/\.html$/i, "");
        }
      }

      return slugToIndex(raw);
    };

    blogDetailIndex = fromPath();
    applyBlogDetailPost(blogDetailIndex);

    blogDetailsNavPrev.addEventListener("click", (event) => {
      event.preventDefault();
      applyBlogDetailPost(blogDetailIndex - 1);
    });

    blogDetailsNavNext.addEventListener("click", (event) => {
      event.preventDefault();
      applyBlogDetailPost(blogDetailIndex + 1);
    });
  }

  // Blog details meta row: share actions + related-card filtering by tag
  const blogDetailsMetaRow = document.querySelector(".blog-details-meta-row");
  if (blogDetailsMetaRow) {
    const shareLinks = Array.from(blogDetailsMetaRow.querySelectorAll(".blog-details-share a"));
    const tagChips = Array.from(blogDetailsMetaRow.querySelectorAll(".blog-details-tags span"));
    const relatedCards = Array.from(document.querySelectorAll(".blog-details-related-grid .blog-related-card"));
    let activeTag = null;

    shareLinks.forEach((link) => {
      const label = link.getAttribute("aria-label") || "";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const pageUrl = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(document.title || "Tripon Blog Details");
        const shareTargets = {
          Facebook: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
          X: `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`,
          LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`
        };
        const target = shareTargets[label];

        if (target) {
          window.open(target, "_blank", "noopener,noreferrer");
          return;
        }

        if (label === "Instagram") {
          navigator.clipboard.writeText(window.location.href);
          showStatus("Link copied for Instagram share");
        }
      });
    });

    const applyRelatedTagFilter = () => {
      relatedCards.forEach((card) => {
        if (!activeTag) {
          card.style.display = "block";
          return;
        }
        const tags = (card.dataset.relatedTags || "").toLowerCase();
        card.style.display = tags.includes(activeTag) ? "block" : "none";
      });
    };

    tagChips.forEach((chip) => {
      chip.style.cursor = "pointer";
      chip.addEventListener("click", () => {
        const clickedTag = chip.textContent.trim().toLowerCase();
        activeTag = activeTag === clickedTag ? null : clickedTag;
        tagChips.forEach((node) => node.classList.toggle("is-active", node.textContent.trim().toLowerCase() === activeTag));
        applyRelatedTagFilter();
      });
    });
  }

  // Blog details related cards: carousel arrows + favorite toggles
  const relatedShell = document.querySelector(".blog-details-related-shell");
  if (relatedShell) {
    const relatedGrid = relatedShell.querySelector(".blog-details-related-grid");
    const leftArrow = relatedShell.querySelector(".blog-related-arrow-left");
    const rightArrow = relatedShell.querySelector(".blog-related-arrow-right");
    const relatedCards = relatedGrid ? Array.from(relatedGrid.querySelectorAll(".blog-related-card")) : [];
    const favIcons = relatedGrid ? Array.from(relatedGrid.querySelectorAll(".blog-related-meta .fa-heart")) : [];

    const moveCard = (direction) => {
      if (!relatedGrid || relatedCards.length < 2) return;
      const cardsNow = Array.from(relatedGrid.querySelectorAll(".blog-related-card"));
      if (direction === "next") {
        const first = cardsNow[0];
        relatedGrid.appendChild(first);
      } else {
        const last = cardsNow[cardsNow.length - 1];
        relatedGrid.insertBefore(last, cardsNow[0]);
      }
    };

    rightArrow?.addEventListener("click", () => moveCard("next"));
    leftArrow?.addEventListener("click", () => moveCard("prev"));

    favIcons.forEach((icon) => {
      const holder = icon.closest(".blog-related-meta")?.lastElementChild;
      if (!(holder instanceof HTMLElement)) return;
      holder.style.cursor = "pointer";
      holder.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isFav = holder.classList.toggle("is-fav");
        icon.classList.remove("fa-regular", "fa-solid");
        icon.classList.add(isFav ? "fa-solid" : "fa-regular", "fa-heart");
      });
    });

    relatedCards.forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        showStatus("Tour details page coming soon");
      });
    });
  }

  // Blog details comment form: show success popup
  const blogCommentForm = document.querySelector(".blog-details-comment-form");
  const blogCommentPopup = document.querySelector("#blogCommentPopup");
  const blogCommentPopupClose = document.querySelector("#blogCommentPopupClose");
  const blogCommentPopupIconClose = document.querySelector("#blogCommentPopupIconClose");
  const blogReplySection = document.querySelector(".blog-details-reply");
  const blogCommentSubmitBtn = blogCommentForm?.querySelector(".blog-comment-submit");
  let blogCommentSubmitTimer = null;

  const blogRatingItems = Array.from(document.querySelectorAll(".blog-details-rating-item"));
  blogRatingItems.forEach((item) => {
    const label = item.querySelector("span")?.textContent?.trim() || "Rating";
    const starText = item.querySelector("strong");
    if (!starText) {
      return;
    }

    starText.replaceChildren();
    starText.classList.add("blog-rating-stars");

    const applyOneStarVisual = (btn, active) => {
      btn.classList.toggle("is-active", active);
      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-solid", active);
        icon.classList.toggle("fa-regular", !active);
      }
    };

    for (let value = 1; value <= 5; value += 1) {
      const starBtn = document.createElement("button");
      starBtn.type = "button";
      starBtn.className = "blog-rating-star";
      starBtn.innerHTML = '<i class="fa-solid fa-star" aria-hidden="true"></i>';
      let isOn = true;

      const syncAria = () => {
        starBtn.setAttribute(
          "aria-label",
          `${label}: star ${value} of 5, ${isOn ? "highlighted" : "not highlighted"}`
        );
        starBtn.setAttribute("aria-pressed", isOn ? "true" : "false");
      };

      starBtn.addEventListener("click", () => {
        isOn = !isOn;
        applyOneStarVisual(starBtn, isOn);
        syncAria();
      });

      applyOneStarVisual(starBtn, isOn);
      syncAria();
      starText.appendChild(starBtn);
    }
  });

  const hideBlogCommentPopup = () => {
    if (!blogCommentPopup) {
      return;
    }
    blogCommentPopup.classList.remove("active");
    blogCommentPopup.setAttribute("aria-hidden", "true");
  };

  const showBlogCommentPopup = () => {
    if (!blogCommentPopup) {
      return;
    }
    blogCommentPopup.classList.add("active");
    blogCommentPopup.setAttribute("aria-hidden", "false");
  };

  const setBlogCommentSubmitState = (state) => {
    if (!blogCommentSubmitBtn) {
      return;
    }
    blogCommentSubmitBtn.classList.remove("is-sending", "is-submitted");
    blogCommentSubmitBtn.disabled = false;
    if (state === "sending") {
      blogCommentSubmitBtn.classList.add("is-sending");
      blogCommentSubmitBtn.textContent = "Sending";
      blogCommentSubmitBtn.disabled = true;
      return;
    }
    if (state === "submitted") {
      blogCommentSubmitBtn.classList.add("is-submitted");
      blogCommentSubmitBtn.textContent = "Submitted";
      blogCommentSubmitBtn.disabled = true;
      return;
    }
    blogCommentSubmitBtn.textContent = "Post Comment";
  };

  blogCommentPopupClose?.addEventListener("click", hideBlogCommentPopup);
  blogCommentPopupIconClose?.addEventListener("click", hideBlogCommentPopup);
  blogCommentPopup?.addEventListener("click", (event) => {
    if (event.target === blogCommentPopup) {
      hideBlogCommentPopup();
    }
  });

  if (blogCommentForm) {
    const blogCommentEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const blogCommentNameLetterPattern = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/;

    const getBlogFieldErrorNode = (input) => {
      const describedBy = input.getAttribute("aria-describedby");
      if (!describedBy) {
        return null;
      }
      return document.getElementById(describedBy);
    };

    const clearBlogCommentField = (input) => {
      input.classList.remove("blog-details-input-invalid");
      const err = getBlogFieldErrorNode(input);
      if (err) {
        err.textContent = "";
      }
    };

    const clearBlogCommentFormErrors = () => {
      blogCommentForm.querySelectorAll("input, textarea").forEach(clearBlogCommentField);
    };

    const setBlogCommentFieldError = (input, message) => {
      input.classList.add("blog-details-input-invalid");
      const err = getBlogFieldErrorNode(input);
      if (err) {
        err.textContent = message;
      }
    };

    const blogCommentNameDigitPattern = /\p{Nd}/u;

    const validateBlogCommentName = (raw) => {
      const value = raw.trim();
      if (!value) {
        return "Please enter your name.";
      }
      if (blogCommentNameDigitPattern.test(value)) {
        return "Name cannot include numbers.";
      }
      if (value.length < 2) {
        return "Name must be at least 2 characters.";
      }
      if (value.length > 80) {
        return "Name must be at most 80 characters.";
      }
      if (!blogCommentNameLetterPattern.test(value)) {
        return "Name should include at least one letter.";
      }
      return "";
    };

    const validateBlogCommentEmail = (raw) => {
      const value = raw.trim();
      if (!value) {
        return "Please enter your email.";
      }
      if (!blogCommentEmailPattern.test(value)) {
        return "Please enter a valid email address.";
      }
      return "";
    };

    const validateBlogCommentTitle = (raw) => {
      const value = raw.trim();
      if (!value) {
        return "Please enter a title.";
      }
      if (value.length < 2) {
        return "Title must be at least 2 characters.";
      }
      if (value.length > 200) {
        return "Title must be at most 200 characters.";
      }
      return "";
    };

    const validateBlogCommentBody = (raw) => {
      const value = raw.trim();
      if (!value) {
        return "Please enter your comment.";
      }
      if (value.length < 10) {
        return "Comment must be at least 10 characters.";
      }
      if (value.length > 5000) {
        return "Comment must be at most 5000 characters.";
      }
      return "";
    };

    const validateBlogCommentForm = () => {
      const nameInput = blogCommentForm.querySelector("#blog-comment-name");
      const emailInput = blogCommentForm.querySelector("#blog-comment-email");
      const titleInput = blogCommentForm.querySelector("#blog-comment-title");
      const bodyInput = blogCommentForm.querySelector("#blog-comment-body");

      clearBlogCommentFormErrors();

      const checks = [
        { input: nameInput, run: () => validateBlogCommentName(nameInput?.value || "") },
        { input: emailInput, run: () => validateBlogCommentEmail(emailInput?.value || "") },
        { input: titleInput, run: () => validateBlogCommentTitle(titleInput?.value || "") },
        { input: bodyInput, run: () => validateBlogCommentBody(bodyInput?.value || "") }
      ];

      let firstInvalid = null;
      checks.forEach(({ input, run }) => {
        if (!input) {
          return;
        }
        const message = run();
        if (message) {
          setBlogCommentFieldError(input, message);
          if (!firstInvalid) {
            firstInvalid = input;
          }
        }
      });

      return firstInvalid;
    };

    const nameInputEl = blogCommentForm.querySelector("#blog-comment-name");
    bindNameFieldNoDigits(nameInputEl);

    blogCommentForm.querySelectorAll("input, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        clearBlogCommentField(field);
      });
      field.addEventListener("change", () => clearBlogCommentField(field));
    });

    blogCommentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (blogCommentSubmitBtn?.disabled) {
        return;
      }

      const firstInvalid = validateBlogCommentForm();
      if (firstInvalid) {
        firstInvalid.focus();
        showStatus("Please fix the highlighted fields.");
        return;
      }

      window.clearTimeout(blogCommentSubmitTimer);
      setBlogCommentSubmitState("sending");
      blogCommentSubmitTimer = window.setTimeout(() => {
        setBlogCommentSubmitState("submitted");
        blogCommentSubmitTimer = window.setTimeout(() => {
          showBlogCommentPopup();
          blogCommentForm.reset();
          clearBlogCommentFormErrors();
          setBlogCommentSubmitState("default");
        }, 550);
      }, 950);
    });
  }

  // Subscribe section: email validation
  const subscribeForm = document.querySelector(".subscribe-showcase-form");
  if (subscribeForm) {
    const input = subscribeForm.querySelector("input[type='email']");
    const triggerBtn = subscribeForm.querySelector("button");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const submitEmail = () => {
      const email = input?.value.trim() || "";
      if (!emailPattern.test(email)) {
        showStatus("Please enter a valid email");
        input?.focus();
        return;
      }
      showStatus("Subscribed successfully");
      if (input) {
        input.value = "";
      }
    };

    triggerBtn?.addEventListener("click", submitEmail);
    subscribeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitEmail();
    });
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitEmail();
      }
    });
  }

  // Instagram showcase: image preview + continuous marquee on every screen section
  const instaSections = document.querySelectorAll(".instagram-showcase");
  if (instaSections.length) {
    instaSections.forEach((instaSection) => {
      const strip = instaSection.querySelector(".instagram-strip");

      // Smooth continuous marquee (transform loop, no jump).
      if (!strip) {
        return;
      }
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
            if (isHiddenSet) {
              image.setAttribute("aria-hidden", "true");
            }
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
      const marqueeImages = Array.from(marqueeTrack?.querySelectorAll("img") || []);

      if (marqueeTrack && marqueeImages.length) {
        let animationId = null;
        let lastTimestamp = 0;
        let offsetX = 0;
        let loopWidth = 0;
        // Slower, smoother pace (and less likely to show loop seams).
        const pixelsPerSecond = 18;

        const ensureTrackCopies = () => {
          const baseCount = Number(strip.dataset.baseCount || "0");
          if (!baseCount) return;
          const allImages = Array.from(marqueeTrack.querySelectorAll("img"));
          const baseImages = allImages.slice(0, baseCount);
          // Round widths to keep copy math stable across zoom/sub-pixels.
          const baseWidth =
            baseImages.reduce((acc, img) => acc + Math.round(img.getBoundingClientRect().width), 0) +
            Math.max(0, baseImages.length - 1) * 6;
          if (!baseWidth) return;

          // Keep extra overflow so the loop never exposes an empty gap.
          const requiredCopies = Math.max(3, Math.ceil(strip.clientWidth / baseWidth) + 2);
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
          // Round widths to avoid sub-pixel accumulation causing visible gaps.
          loopWidth = baseImages.reduce((acc, img) => acc + Math.round(img.getBoundingClientRect().width), 0);
          loopWidth += Math.max(0, baseImages.length - 1) * 6;
          if (offsetX >= loopWidth && loopWidth > 0) {
            offsetX %= loopWidth;
          }
          // Reset timestamp so resize/load doesn’t create a big delta jump.
          lastTimestamp = 0;
        };

        const animateStrip = (timestamp) => {
          if (!lastTimestamp) {
            lastTimestamp = timestamp;
          }
          const deltaMs = timestamp - lastTimestamp;
          lastTimestamp = timestamp;

          if (loopWidth > 0) {
            offsetX += (pixelsPerSecond * deltaMs) / 1000;
            // Use subtraction (not float modulo) to keep the loop seam stable.
            while (offsetX >= loopWidth) {
              offsetX -= loopWidth;
            }
            marqueeTrack.style.transform = `translate3d(${-Math.round(offsetX)}px, 0, 0)`;
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
          if (animationId) {
            window.cancelAnimationFrame(animationId);
          }
        });
      }
    });
  }

  // Contact form submission
  const contactForm = document.querySelector(".contact-form");
  const submitPopupSuccess = document.querySelector("#submitPopupSuccess");
  const submitPopupError = document.querySelector("#submitPopupError");
  const submitPopupSuccessClose = document.querySelector("#submitPopupSuccessClose");
  const submitPopupErrorClose = document.querySelector("#submitPopupErrorClose");
  const submitPopupSuccessIconClose = document.querySelector("#submitPopupSuccessIconClose");
  const submitPopupErrorIconClose = document.querySelector("#submitPopupErrorIconClose");

  const hidePopup = (popupElement) => {
    if (!popupElement) {
      return;
    }
    popupElement.classList.remove("active");
    popupElement.setAttribute("aria-hidden", "true");
  };

  const showPopup = (popupElement) => {
    if (!popupElement) {
      return;
    }
    popupElement.classList.add("active");
    popupElement.setAttribute("aria-hidden", "false");
  };

  submitPopupSuccessClose?.addEventListener("click", () => hidePopup(submitPopupSuccess));
  submitPopupErrorClose?.addEventListener("click", () => hidePopup(submitPopupError));
  submitPopupSuccessIconClose?.addEventListener("click", () => hidePopup(submitPopupSuccess));
  submitPopupErrorIconClose?.addEventListener("click", () => hidePopup(submitPopupError));

  submitPopupSuccess?.addEventListener("click", (event) => {
    if (event.target === submitPopupSuccess) {
      hidePopup(submitPopupSuccess);
    }
  });

  submitPopupError?.addEventListener("click", (event) => {
    if (event.target === submitPopupError) {
      hidePopup(submitPopupError);
    }
  });

  if (contactForm) {
    const contactSubmitBtn = contactForm.querySelector(".contact-submit");
    const countryPicker = contactForm.querySelector("#contactCountryPicker");
    const countryTrigger = contactForm.querySelector("#contactCountryTrigger");
    const countryFlagImg = contactForm.querySelector("#contactCountryFlagImg");
    const countryCodeText = contactForm.querySelector("#contactCountryCodeText");
    const countryMenu = contactForm.querySelector("#contactCountryMenu");
    let contactSubmitTimer = null;

    const contactFields = {
      fullNameInput: contactForm.querySelector("#contactFullName"),
      countryCodeSelect: contactForm.querySelector("#contactCountryCode"),
      phoneInput: contactForm.querySelector("#contactPhoneNumber"),
      emailInput: contactForm.querySelector("#contactEmailId"),
      locationInput: contactForm.querySelector("#contactLocation"),
      messageInput: contactForm.querySelector("#contactMessage")
    };

    bindNameFieldNoDigits(contactFields.fullNameInput);
    bindNameFieldNoDigits(contactFields.locationInput);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const closeCountryMenu = () => {
      if (!countryPicker || !countryTrigger) {
        return;
      }
      countryPicker.classList.remove("open");
      countryTrigger.setAttribute("aria-expanded", "false");
    };

    const openCountryMenu = () => {
      if (!countryPicker || !countryTrigger) {
        return;
      }
      countryPicker.classList.add("open");
      countryTrigger.setAttribute("aria-expanded", "true");
    };

    countryTrigger?.addEventListener("click", () => {
      if (countryPicker?.classList.contains("open")) {
        closeCountryMenu();
        return;
      }
      openCountryMenu();
    });

    countryMenu?.querySelectorAll("button[data-code]").forEach((optionBtn) => {
      optionBtn.addEventListener("click", () => {
        const selectedCode = optionBtn.getAttribute("data-code") || "+91";
        const selectedCountry = optionBtn.getAttribute("data-country") || "in";
        if (contactFields.countryCodeSelect) {
          contactFields.countryCodeSelect.value = selectedCode;
        }
        if (countryFlagImg) {
          countryFlagImg.src = `https://flagcdn.com/w40/${selectedCountry}.png`;
        }
        if (countryCodeText) {
          countryCodeText.textContent = selectedCode;
        }
        closeCountryMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      if (!countryPicker?.contains(event.target)) {
        closeCountryMenu();
      }
    });
    const setContactSubmitState = (state) => {
      if (!contactSubmitBtn) {
        return;
      }
      contactSubmitBtn.classList.remove("is-sending", "is-submitted");
      contactSubmitBtn.disabled = false;

      if (state === "sending") {
        contactSubmitBtn.textContent = "Sending...";
        contactSubmitBtn.classList.add("is-sending");
        contactSubmitBtn.disabled = true;
        return;
      }

      if (state === "submitted") {
        contactSubmitBtn.textContent = "Submitted";
        contactSubmitBtn.classList.add("is-submitted");
        contactSubmitBtn.disabled = true;
        return;
      }

      contactSubmitBtn.textContent = "Submit";
    };

    const markInvalid = (inputElement) => {
      if (!inputElement) {
        return;
      }
      inputElement.classList.add("contact-invalid-field");
      const parentLabel = inputElement.closest("label");
      parentLabel?.classList.add("contact-invalid-label");
    };

    const clearInvalid = (inputElement) => {
      if (!inputElement) {
        return;
      }
      inputElement.classList.remove("contact-invalid-field");
      const parentLabel = inputElement.closest("label");
      parentLabel?.classList.remove("contact-invalid-label");
    };

    const clearContactValidationTooltip = () => {
      contactForm.querySelectorAll(".hero-validation-tooltip").forEach((node) => node.remove());
    };

    const showContactValidationTooltip = (inputElement, message) => {
      const parentLabel = inputElement?.closest("label");
      if (!parentLabel) {
        return;
      }
      clearContactValidationTooltip();
      const tip = document.createElement("div");
      tip.className = "hero-validation-tooltip";
      tip.innerHTML = '<span class="hero-validation-icon" aria-hidden="true"></span><span class="hero-validation-text"></span>';
      tip.querySelector(".hero-validation-text").textContent = message || "Please fill out this field.";
      parentLabel.appendChild(tip);
    };

    Object.values(contactFields).forEach((field) => {
      if (!field) {
        return;
      }
      const clearFieldErrorState = () => {
        clearInvalid(field);
        if (typeof field.checkValidity === "function" && field.checkValidity()) {
          clearContactValidationTooltip();
        }
      };
      field.addEventListener("input", clearFieldErrorState);
      field.addEventListener("change", clearFieldErrorState);
    });

    contactFields.phoneInput?.addEventListener("input", () => {
      const digitsOnly = (contactFields.phoneInput.value || "").replace(/\D/g, "").slice(0, 15);
      contactFields.phoneInput.value = digitsOnly;
      const isPartialPhone = digitsOnly.length > 0 && digitsOnly.length < 4;
      contactFields.phoneInput.classList.toggle("contact-phone-partial", isPartialPhone);
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (contactSubmitBtn?.disabled) {
        return;
      }

      const fullName = contactFields.fullNameInput?.value.trim() || "";
      const rawPhone = contactFields.phoneInput?.value.trim() || "";
      const selectedCountryCode = contactFields.countryCodeSelect?.value || "";
      const phoneDigitsOnly = rawPhone.replace(/\D/g, "");
      const countryCodeDigits = selectedCountryCode.replace(/\D/g, "");
      const totalPhoneDigits = `${countryCodeDigits}${phoneDigitsOnly}`;
      const emailValue = contactFields.emailInput?.value.trim() || "";
      const locationValue = contactFields.locationInput?.value.trim() || "";
      const messageValue = contactFields.messageInput?.value.trim() || "";
      const hasValidPhone = phoneDigitsOnly.length >= 4 && totalPhoneDigits.length >= 7 && totalPhoneDigits.length <= 15;
      const hasValidEmail = emailPattern.test(emailValue);

      Object.values(contactFields).forEach((field) => clearInvalid(field));

      if (!fullName) {
        markInvalid(contactFields.fullNameInput);
        hidePopup(submitPopupSuccess);
        hidePopup(submitPopupError);
        showContactValidationTooltip(contactFields.fullNameInput, "Please fill out this field.");
        contactFields.fullNameInput?.focus();
        return;
      }

      if (!hasValidPhone) {
        markInvalid(contactFields.phoneInput);
        hidePopup(submitPopupSuccess);
        hidePopup(submitPopupError);
        showContactValidationTooltip(contactFields.phoneInput, "Please enter a valid phone number.");
        contactFields.phoneInput?.focus();
        return;
      }

      if (!hasValidEmail) {
        markInvalid(contactFields.emailInput);
        hidePopup(submitPopupSuccess);
        hidePopup(submitPopupError);
        showContactValidationTooltip(contactFields.emailInput, "Please enter a valid email address.");
        contactFields.emailInput?.focus();
        return;
      }

      if (!locationValue) {
        markInvalid(contactFields.locationInput);
        hidePopup(submitPopupSuccess);
        hidePopup(submitPopupError);
        showContactValidationTooltip(contactFields.locationInput, "Please fill out this field.");
        contactFields.locationInput?.focus();
        return;
      }

      if (messageValue.length < 10) {
        markInvalid(contactFields.messageInput);
        hidePopup(submitPopupSuccess);
        hidePopup(submitPopupError);
        showContactValidationTooltip(contactFields.messageInput, "Message should be at least 10 characters.");
        contactFields.messageInput?.focus();
        return;
      }

      clearContactValidationTooltip();
      hidePopup(submitPopupError);
      window.clearTimeout(contactSubmitTimer);
      setContactSubmitState("sending");
      contactSubmitTimer = window.setTimeout(() => {
        setContactSubmitState("submitted");
        contactSubmitTimer = window.setTimeout(() => {
          showPopup(submitPopupSuccess);
          setContactSubmitState("default");
        }, 500);
      }, 1100);
    });
  }

  // Contact explore: horizontal card slider + favorite toggle
  const contactExploreWrap = document.querySelector(".contact-explore-wrap");
  if (contactExploreWrap) {
    const exploreGrid = contactExploreWrap.querySelector(".contact-explore-grid");
    const favButtons = contactExploreWrap.querySelectorAll(".contact-explore-fav");
    const cards = exploreGrid ? Array.from(exploreGrid.querySelectorAll(".contact-explore-card")) : [];

    let contactExploreAutoTimer = null;
    let isExploreAnimating = false;

    const renderExploreCards = () => {
      if (!cards.length || !exploreGrid) {
        return;
      }
      cards.forEach((card) => {
        card.style.opacity = "1";
        card.style.transform = "none";
        card.style.transition = "none";
      });
      exploreGrid.scrollLeft = 0;
    };

    const getExploreStep = () => {
      if (!exploreGrid || !cards.length) {
        return 0;
      }
      const firstCard = cards[0];
      if (!firstCard) {
        return 0;
      }
      const rowStyles = window.getComputedStyle(exploreGrid);
      const gap = Number.parseFloat(rowStyles.columnGap || rowStyles.gap || "0") || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const shiftExploreLeftOneByOne = () => {
      if (!exploreGrid || cards.length < 2 || isExploreAnimating) {
        return;
      }
      const firstCard = cards[0];
      const step = getExploreStep();
      if (!firstCard || !step) {
        return;
      }
      isExploreAnimating = true;
      exploreGrid.scrollTo({ left: step, behavior: "smooth" });
      window.setTimeout(() => {
        // Rotate cards in DOM so motion is always leftward (never snaps back to the right).
        exploreGrid.appendChild(firstCard);
        cards.push(cards.shift());
        exploreGrid.scrollLeft = 0;
        isExploreAnimating = false;
      }, 480);
    };

    const stopExploreAutoplay = () => {
      if (contactExploreAutoTimer) {
        window.clearInterval(contactExploreAutoTimer);
        contactExploreAutoTimer = null;
      }
    };

    const startExploreAutoplay = (immediate = false) => {
      stopExploreAutoplay();
      if (!exploreGrid || cards.length < 2) {
        return;
      }
      if (immediate) {
        shiftExploreLeftOneByOne();
      }
      contactExploreAutoTimer = window.setInterval(() => {
        shiftExploreLeftOneByOne();
      }, 2800);
    };
    let hasEnteredViewport = false;
    let isExploreInViewport = false;

    if (exploreGrid) {
      exploreGrid.addEventListener("mouseenter", stopExploreAutoplay);
      exploreGrid.addEventListener("mouseleave", startExploreAutoplay);
      exploreGrid.addEventListener("touchstart", stopExploreAutoplay, { passive: true });
      exploreGrid.addEventListener("touchend", startExploreAutoplay);
    }

    favButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const icon = button.querySelector("i");
        const isFav = button.classList.toggle("is-fav");
        if (icon) {
          icon.classList.remove("fa-regular", "fa-solid");
          icon.classList.add(isFav ? "fa-solid" : "fa-regular", "fa-heart");
        }
      });
    });

    renderExploreCards();

    if (contactExploreWrap && "IntersectionObserver" in window) {
      const exploreObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const nowVisible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.35);
          if (nowVisible) {
            isExploreInViewport = true;
            if (!hasEnteredViewport) {
              hasEnteredViewport = true;
              startExploreAutoplay(true);
            } else {
              startExploreAutoplay(false);
            }
            return;
          }
          isExploreInViewport = false;
          stopExploreAutoplay();
        },
        { threshold: [0.35, 0.6] }
      );
      exploreObserver.observe(contactExploreWrap);
    } else {
      // Fallback for older browsers: keep previous behavior.
      startExploreAutoplay(true);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopExploreAutoplay();
      } else if (isExploreInViewport) {
        startExploreAutoplay(false);
      }
    });
  }

  const pdTrack = document.querySelector(".pd-related-track");
  const pdPrev = document.querySelector(".pd-related-prev");
  const pdNext = document.querySelector(".pd-related-next");
  if (pdTrack && pdPrev && pdNext) {
    const slide = () => Math.max(pdTrack.clientWidth * 0.85, 260);
    pdPrev.addEventListener("click", () => {
      pdTrack.scrollBy({ left: -slide(), behavior: "smooth" });
    });
    pdNext.addEventListener("click", () => {
      pdTrack.scrollBy({ left: slide(), behavior: "smooth" });
    });
  }
  const pdRelatedCards = document.querySelectorAll(".pd-related-card");
  if (pdRelatedCards.length) {
    const pathRaw = (window.location.pathname || "").replace(/\\/g, "/");
    const packageDetailsHref = (() => {
      if (pathRaw.includes("/blogs/") || pathRaw.includes("/locations/")) {
        return "../packages/package-details.html";
      }
      if (pathRaw.includes("/packages/")) {
        return "package-details.html";
      }
      return "packages/package-details.html";
    })();
    pdRelatedCards.forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const titleEl = card.querySelector("h4");
        const title = (titleEl && titleEl.textContent ? titleEl.textContent : "").trim();
        const locRaw = card.querySelector(".pd-related-location");
        const loc = (locRaw && locRaw.textContent ? locRaw.textContent : "").replace(/\s+/g, " ").trim();
        const ratingSpan = card.querySelector(".pd-related-rating span");
        const ratingRaw = ratingSpan && ratingSpan.textContent ? ratingSpan.textContent : "";
        const ratingMatch = ratingRaw.match(/(\d+(\.\d+)?)/);
        const reviewsMatch = ratingRaw.match(/\((\d+)\)/);
        const daysEl = card.querySelector(".pd-related-meta span:first-child");
        const daysText = (daysEl && daysEl.textContent ? daysEl.textContent : "").replace(/\s+/g, " ").trim();
        const priceEl = card.querySelector(".pd-related-meta span:last-child");
        const priceText = (priceEl && priceEl.textContent ? priceEl.textContent : "").replace(/^From\s*/i, "").trim();
        const imgEl = card.querySelector("img");
        const imgSrc = imgEl ? imgEl.getAttribute("src") || "" : "";
        const packageType = card.getAttribute("data-type") || "traveler";
        const detailImages = (card.getAttribute("data-package-detail-images") || "").trim();
        const payload = {
          title,
          location: loc,
          rating: ratingMatch ? ratingMatch[1] : "",
          reviews: reviewsMatch ? reviewsMatch[1] : "",
          days: daysText,
          price: priceText,
          type: packageType,
          image: imgSrc,
          gallery: "",
          detailImages,
        };
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        sessionStorage.setItem("tripon_selected_package", JSON.stringify(payload));
        sessionStorage.setItem("tripon_selected_package_slug", slug);
        window.location.href = packageDetailsHref;
      });
    });
  }

  // Footer: social links open matching platforms
  const socialLinks = document.querySelectorAll(".tripon-socials a");
  const socialTargets = {
    X: "https://x.com",
    Facebook: "https://facebook.com",
    Instagram: "https://instagram.com",
    YouTube: "https://youtube.com"
  };
  socialLinks.forEach((link) => {
    const label = link.getAttribute("aria-label") || "";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = socialTargets[label];
      if (target) {
        window.open(target, "_blank", "noopener,noreferrer");
      }
    });
  });

  // Premium floating social FAB: markup is in HTML (#triponSocialFab); this wires behavior only.
  const triponSocialFab = document.getElementById("triponSocialFab");
  if (triponSocialFab && document.body?.dataset?.triponFab !== "off") {
    const wrap = triponSocialFab;
    const toggle = wrap.querySelector("#triponSocialFabToggle");
    const backdrop = wrap.querySelector("[data-tripon-fab-dismiss]");
    let open = false;

    const setOpen = (next) => {
      open = Boolean(next);
      wrap.classList.toggle("is-open", open);
      toggle?.setAttribute("aria-expanded", String(open));
      const sr = toggle?.querySelector(".tripon-social-fab__sr");
      if (sr) {
        sr.textContent = open ? "Close contact menu" : "Open contact menu";
      }
    };

    toggle?.addEventListener("click", () => setOpen(!open));
    backdrop?.addEventListener("click", () => setOpen(false));

    wrap.querySelectorAll(".tripon-social-fab__link").forEach((a) => {
      a.addEventListener("click", () => window.setTimeout(() => setOpen(false), 80));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggle?.focus();
      }
    });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", triponInitMain);
} else {
  triponInitMain();
}
