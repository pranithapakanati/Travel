document.addEventListener("DOMContentLoaded", () => {
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

  contactBtn?.addEventListener("click", () => {
    showContactScreen();
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

  const blogContactBtn = document.querySelector(".blog-contact-btn");
  blogContactBtn?.addEventListener("click", () => {
    window.location.href = "contact_us.html";
  });

  paintNavState("home");

  const wantMoreBtn = document.querySelector(".want-more-btn");
  wantMoreBtn?.addEventListener("click", () => {
    window.location.href = "blog.html";
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
        { src: "images/img1.png", alt: "Bali beach" },
        { src: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1600&q=80", alt: "Bali cliffside coast" },
        { src: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1600&q=80", alt: "Tropical Bali island view" },
        { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80", alt: "Sunset beach in Bali" }
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

    const mobileHeroBookingTrigger = document.querySelector("#mobileHeroBookingTrigger");
    const mobilePrefClose = document.querySelector("#mobilePrefClose");
    const mobilePrefSteps = Array.from(document.querySelectorAll(".mobile-pref-step"));
    const mobilePrefNext = document.querySelector("#mobilePrefNext");
    const mobilePrefPrev = document.querySelector("#mobilePrefPrev");
    const mobilePrefActions = document.querySelector("#mobilePrefActions");
    let mobilePrefStepIndex = 0;

    const PREF_MODAL_POST_INTERACTION_COOLDOWN_MS = 40000;
    let prefModalAutoOpenSuppressedUntil = 0;
    const schedulePrefModalAutoCooldown = () => {
      prefModalAutoOpenSuppressedUntil = Math.max(
        prefModalAutoOpenSuppressedUntil,
        Date.now() + PREF_MODAL_POST_INTERACTION_COOLDOWN_MS
      );
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
        return phone.length >= 10;
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
        mobilePrefPrev.style.visibility = shouldShowPrevious ? "visible" : "hidden";
        mobilePrefPrev.style.pointerEvents = shouldShowPrevious ? "auto" : "none";
      }
    };

    const hideMobilePrefModal = () => {
      mobilePrefModal.classList.remove("active");
      mobilePrefModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      mobilePrefStepIndex = 0;
      paintMobilePrefStep();
      schedulePrefModalAutoCooldown();
    };

    const showMobilePrefModal = () => {
      blurHeroTravelDateIfFocused();
      mobilePrefModal.classList.add("active");
      mobilePrefModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      mobilePrefStepIndex = 0;
      paintMobilePrefStep();
    };

    const advanceMobilePrefStep = () => {
      mobilePrefStepIndex = Math.min(mobilePrefStepIndex + 1, mobilePrefSteps.length - 1);
      paintMobilePrefStep();
    };

    mobilePrefModal.querySelectorAll('input[name="travelerName"]').forEach((node) => bindNameFieldNoDigits(node));

    mobileHeroBookingTrigger?.addEventListener("click", showMobilePrefModal);
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
    if (window.matchMedia("(min-width: 992px)").matches) {
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

    items.forEach((item) => {
      const locationLink = item.getAttribute("data-location-link");
      if (locationLink) {
        item.style.cursor = "pointer";
        item.addEventListener("click", () => {
          window.location.href = locationLink;
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
        card.style.opacity = idx === activeIndex ? "1" : "0.65";
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
    const defaultReasonImage = reasonImage?.getAttribute("src") || "images/reason.png";
    const reasonSlides = {
      Festivals: [
        {
          image: "images/festive.png",
          title: "Galungan Festival",
          body: "Galungan celebrates the victory of dharma over adharma. Villages fill with decorated penjor bamboo poles, temple prayers, and family gatherings across Bali."
        },
        {
          image: "images/festive1.png",
          title: "Nyepi: Day of Silence",
          body: "Nyepi marks the Balinese New Year with a full day of silence, no travel, and no lights. The night before includes colorful ogoh-ogoh parades and rituals."
        },
        {
          image: "images/festive2.png",
          title: "Kuningan Traditions",
          body: "Kuningan closes the festive cycle with temple visits and offerings. Families wear traditional dress and share special dishes to honor ancestral blessings."
        }
      ],
      "Peace and Quiet": [
        {
          image: "images/peace.jpg",
          title: "Ubud Morning Calm",
          body: "Start your day with misty rice terraces, slow village walks, and temple bells that create a peaceful rhythm away from city noise."
        },
        {
          image: "images/peace1.jpg",
          title: "Silent Beach Hours",
          body: "Quiet bays in Bali offer gentle waves, soft sunsets, and relaxed corners where you can unwind without crowds."
        },
        {
          image: "images/peace2.jpg",
          title: "Spa and Wellness Retreats",
          body: "Traditional Balinese wellness sessions, herbal baths, and nature-view spas help you reconnect and recharge in a serene setting."
        }
      ],
      "Romantic Ambience": [
        {
          image: "images/ambience.jpeg",
          title: "Candlelight by the Coast",
          body: "Enjoy private sunset dinners near the ocean, where soft lights, sea breeze, and calm waves create a romantic Bali evening."
        },
        {
          image: "images/ambience1.jpg",
          title: "Villa Escape for Couples",
          body: "Peaceful pool villas and tropical gardens provide intimate spaces for couples to relax and celebrate special moments together."
        },
        {
          image: "images/ambience2.png",
          title: "Golden Hour Memories",
          body: "From cliff viewpoints to dreamy beaches, Bali's golden hour offers perfect scenes for romantic walks and unforgettable photos."
        }
      ],
      "Ease of Travel": [
        {
          image: "images/travel.jpg",
          title: "Seamless Local Transfers",
          body: "Move comfortably between popular Bali spots with reliable drivers, app-based rides, and easy day-trip planning."
        },
        {
          image: "images/travel1.jpg",
          title: "Smart Island Routes",
          body: "Plan efficient routes between beaches, temples, and cafes so you spend more time exploring and less time commuting."
        },
        {
          image: "images/travel2.jpg",
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
    const supportsHoverImageSwap = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const packageImageLoadCache = new Map();
    let packageAutoScrollTimer = null;
    let isPackagesAutoStepRunning = false;
    let packageAutoStepResetTimer = null;
    let selectedDays = null;
    let activePackageIndex = 0;
    let isPackagesScreenVisible = false;
    const coupleHoverImages = [
      "images/couple.jpg",
      "images/couple1.jpg",
      "images/couple2.jpg",
      "images/couple3.jpeg",
      "images/couple4.jpg",
      "images/couple5.jpg"
    ];
    const friendsHoverImages = [
      "images/friends.jpg",
      "images/friends1.jpg",
      "images/friends2.webp",
      "images/friends3.jpg",
      "images/friends4.jpg",
      "images/friends5.jpg",
      "images/friends6.jpg"
    ];
    const familyHoverImages = [
      "images/couple1.jpg",
      "images/couple2.jpg",
      "images/friends1.jpg",
      "images/friends3.jpg"
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
      const hoverPool = cardType === "couple"
        ? coupleHoverImages
        : cardType === "friends"
          ? friendsHoverImages
          : cardType === "family"
            ? familyHoverImages
            : null;

      if (!hoverPool?.length) {
        return;
      }

      const hoverSrc = hoverPool[idx % hoverPool.length];
      imageNode.dataset.originalSrc = imageNode.getAttribute("src") || "";
      imageNode.style.transition = "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)";
      void preloadPackageImage(hoverSrc);
      void preloadPackageImage(imageNode.dataset.originalSrc || "");
      let swapRequestId = 0;

      const setImageWithSwipe = async (nextSrc) => {
        if (!nextSrc || imageNode.getAttribute("src") === nextSrc) {
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

      if (supportsHoverImageSwap) {
        card.addEventListener("mouseenter", () => {
          setImageWithSwipe(hoverSrc);
        });
        card.addEventListener("mouseleave", () => {
          setImageWithSwipe(imageNode.dataset.originalSrc || "");
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
      "images/couple.jpg",
      "images/couple1.jpg",
      "images/couple2.jpg",
      "images/couple3.jpeg",
      "images/couple4.jpg",
      "images/couple5.jpg"
    ];
    const friendsHoverImages = [
      "images/friends.jpg",
      "images/friends1.jpg",
      "images/friends2.webp",
      "images/friends3.jpg",
      "images/friends4.jpg",
      "images/friends5.jpg",
      "images/friends6.jpg"
    ];
    const familyHoverImages = [
      "images/couple1.jpg",
      "images/couple2.jpg",
      "images/friends1.jpg",
      "images/friends3.jpg"
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

    const supportsHoverImageSwap = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
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
      const hoverPool = cardType === "couple"
        ? coupleHoverImages
        : cardType === "friends"
          ? friendsHoverImages
          : cardType === "family"
            ? familyHoverImages
          : null;

      if (!hoverPool?.length) {
        return;
      }

      const hoverSrc = hoverPool[idx % hoverPool.length];
      imageNode.dataset.originalSrc = imageNode.getAttribute("src") || "";
      imageNode.style.transition = "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)";
      void preloadPackageImage(hoverSrc);
      void preloadPackageImage(imageNode.dataset.originalSrc || "");
      let swapRequestId = 0;

      const setImageWithSwipe = async (nextSrc) => {
        if (!nextSrc || imageNode.getAttribute("src") === nextSrc) {
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
        // Restart swipe-reveal animation only after source is available.
        void imageNode.offsetWidth;
        imageNode.classList.add("package-image-swipe");
        imageNode.style.opacity = "1";
        imageNode.style.transform = "scale(1.03)";
      };

      if (supportsHoverImageSwap) {
        card.addEventListener("mouseenter", () => {
          setImageWithSwipe(hoverSrc);
        });

        card.addEventListener("mouseleave", () => {
          setImageWithSwipe(imageNode.dataset.originalSrc || "");
        });
      }
    });

    packageSection.querySelector(".see-all")?.addEventListener("click", () => {
      setActive(tabs, tabs[0]);
      applyPackageFilter("all");
      startPackageAutoplay();
      showStatus("Showing all packages");
    });
  }

  // Testimonials: compact read-more behavior for longer cards
  const testimonials = document.querySelector(".testimonials");
  if (testimonials) {
    const testimonialWall = testimonials.querySelector(".testimonial-wall");
    const reviewCards = Array.from(testimonialWall?.querySelectorAll(".review-card") || []);
    let testimonialAutoScrollTimer = null;
    let testimonialActiveIndex = 0;
    let isTestimonialsVisible = false;

    const scrollToTestimonial = (index) => {
      if (!reviewCards.length) {
        return;
      }
      testimonialActiveIndex = (index + reviewCards.length) % reviewCards.length;
      reviewCards[testimonialActiveIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start"
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
      if (reviewCards.length < 2 || !isTestimonialsVisible) {
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
      testimonialWall.addEventListener("touchend", startTestimonialAutoplay);

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
        { threshold: 0.01, rootMargin: "0px" }
      );

      testimonialsObserver.observe(testimonials);
    }

    const texts = testimonials.querySelectorAll(".review-text");
    texts.forEach((node) => {
      const text = node.textContent?.trim() || "";
      if (text.length > 150) {
        const short = `${text.slice(0, 150)}...`;
        node.dataset.fullText = text;
        node.dataset.shortText = short;
        node.textContent = short;
        node.style.cursor = "pointer";
        node.addEventListener("click", () => {
          const expanded = node.getAttribute("data-expanded") === "true";
          node.textContent = expanded ? (node.dataset.shortText || "") : (node.dataset.fullText || "");
          node.setAttribute("data-expanded", String(!expanded));
        });
      }
    });
  }

  // Video banner CTA
  const spotlightBtn = document.querySelector(".spotlight-btn");
  spotlightBtn?.addEventListener("click", () => {
    showStatus("3D view feature coming soon");
  });

  // Family-tour CTA -> packages section
  const familyBtn = document.querySelector(".family-tour-btn");
  familyBtn?.addEventListener("click", () => {
    document.querySelector(".popular-packages")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Why choose cards: click highlight
  const whyCards = Array.from(document.querySelectorAll(".why-card"));
  if (whyCards.length) {
    whyCards.forEach((card, idx) => {
      if (idx === 0) {
        card.style.transform = "translateY(-2px)";
      }
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        whyCards.forEach((c) => {
          c.style.outline = "none";
          c.style.transform = "translateY(0)";
        });
        card.style.outline = "2px solid rgba(10, 139, 83, 0.35)";
        card.style.transform = "translateY(-2px)";
      });
    });
  }

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

  // Bali blogs: fake play controls and share actions
  const blogSections = document.querySelectorAll(".bali-blogs");

  blogSections.forEach((blogSection) => {

  // Blog click
    const blogCards = blogSection.querySelectorAll(".bali-card");

    blogCards.forEach((card) => {
      card.style.cursor = "pointer";

      card.addEventListener("click", () => {
       const blogLink = card.getAttribute("data-blog-link");
       if (blogLink) {
         window.location.href = blogLink;
         return;
       }
       const pageName = window.location.pathname.split("/").pop();
       if (["location.html", "packages.html", "people_reviews.html"].includes(pageName)) {
         window.location.href = "blog_details.html";
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
    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const card = btn.closest(".bali-card");
      const title = card?.querySelector("h3")?.textContent?.trim() || "Tripon Blog";
      const blogLink = card?.getAttribute("data-blog-link");
      const shareUrl = blogLink
        ? new URL(blogLink, window.location.href).toString()
        : window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text: "Check out this Bali blog!",
            url: shareUrl,
          });
          return;
        } catch (error) {
          // If user closes native share sheet, avoid noisy error toasts.
        }
      }

      try {
        await navigator.clipboard.writeText(shareUrl);
        showStatus("Link copied!");
      } catch (error) {
        window.prompt("Copy this link:", shareUrl);
      }
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
    const recentLinks = Array.from(blogMain.querySelectorAll(".recent-post-item[data-recent-post]"));
    const blogReadMoreLinks = Array.from(blogMain.querySelectorAll(".blog-post-copy a"));
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

    recentLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const targetId = link.dataset.recentPost || "";
        const targetRow = postRows.find((row) => row.dataset.postId === targetId);
        if (!targetRow) return;
        // Ensure target post is visible before scrolling.
        searchInput && (searchInput.value = "");
        activeFilter = null;
        categoryLinks.forEach((node) => node.classList.remove("is-active"));
        tagItems.forEach((node) => node.classList.remove("is-active"));
        applyBlogFilters();
        targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
        targetRow.style.transition = "box-shadow 220ms ease";
        targetRow.style.boxShadow = "0 0 0 2px rgba(31, 161, 104, 0.28)";
        window.setTimeout(() => {
          targetRow.style.boxShadow = "";
        }, 1200);
      });
    });

    blogReadMoreLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = "blog_details.html";
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
        slug: "dublin-pubs",
        pageTitle: "Tripon — Pubs with History: Dublin",
        heroSrc: "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1800&q=80",
        heroAlt: "Historic European city street at dusk",
        heroH1: "Pubs with History: 7 of Dublin's Most Storied Drinking Dens",
        breadcrumb: "Home / Blog / Europe / Pubs with History",
        leadTitle: "The Brazen Head",
        leadBody:
          "At over eight hundred years old, The Brazen Head is one of Dublin's most iconic pubs. Tucked near the River Liffey, it blends old brick walls, low wooden ceilings, and live Irish music into an experience that feels deeply rooted in the city's past. Today it remains a must-visit stop for traditional food, local stories, and a true taste of Irish pub heritage.",
        points: [
          "Live trad sessions most nights of the week.",
          "Hearty Irish plates and local ales on tap.",
          "Stories of writers and revolutionaries who drank here.",
          "Short walk from the Liffey and Temple Bar."
        ],
        quote:
          "\"The Brazen Head reminds you that Dublin's best nights still happen where timber beams meet candlelight and song.\"",
        longcopy:
          "Donec purus posuere nullam lacus aliquam egestas arcu. A egestas a, tellus massa, ornare vulputate. Erat enim eget laoreet ullamcorper lectus aliquet nullam tempus id. Dignissim convallis quam aliquam rhoncus, lectus nullam viverra. Bibendum dignissim tortor, phasellus pellentesque commodo, turpis vel eu.",
        subcopies: [
          "Neque nulla porta ut urna rutrum. Aliquam cursus arcu tincidunt mus dictum sit euismod cum id. Dictum integer ultricies arcu fermentum fermentum sem consectetur.",
          "Donec purus posuere nullam lacus aliquam egestas arcu. Tellus massa, ornare vulputate. Erat enim eget laoreet ullamcorper lectus aliquet nullam tempus id.",
          "Neque nulla porta ut urna rutrum. Aliquam cursus arcu tincidunt mus dictum sit euismod cum id. Faucibus ipsum felis et duis fames."
        ],
        gallery: [
          {
            src: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80",
            alt: "Warm pub interior with wooden bar",
            caption: "Low ceilings and candlelit corners set the mood."
          },
          {
            src: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=80",
            alt: "Friends sharing drinks at a table",
            caption: "Evenings here stretch long after sunset."
          }
        ],
        tags: ["Adventure", "Culture", "Food"],
        author: {
          name: "Brooklyn Simmons",
          role: "Travel Writer",
          bio: "Etiam vitae leo et diam pellentesque porta. Sed eleifend ultricies risus, vel rutrum erat commodo ut. Praesent finibus congue euismod. Curabitur placerat finibus lacus.",
          img: "https://i.pravatar.cc/90?img=47",
          imgAlt: "Brooklyn Simmons profile photo"
        },
        navPreview: "Pubs with History: Dublin's storied drinking dens"
      },
      {
        slug: "algarve-coast",
        pageTitle: "Tripon — Algarve Coast Road Trip",
        heroSrc: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
        heroAlt: "Turquoise ocean meeting golden cliffs",
        heroH1: "Algarve Coast: Cliffs, Coves, and Slow Sunsets",
        breadcrumb: "Home / Blog / Europe / Portugal",
        leadTitle: "Seven Stops Along the Southern Edge",
        leadBody:
          "Portugal's Algarve pairs dramatic sea arches with sleepy fishing villages. Rent a small car, pack sunscreen, and hop between boardwalk trails, hidden coves, and seafood grills where the catch was swimming that morning.",
        points: [
          "Benagil sea cave by kayak at calm tide.",
          "Sagres for wide-open Atlantic views.",
          "Olhão market for grilled sardines and fruit.",
          "Lagos old town for cobblestone evenings."
        ],
        quote: "\"The Algarve teaches you to measure distance in viewpoints, not kilometers.\"",
        longcopy:
          "Curabitur placerat finibus lacus. Risus dui ut viverra venenatis ipsum tincidunt non, proin. Euismod pharetra sit ac nisi. Erat lacus, amet quisque urna faucibus. Rhoncus praesent faucibus rhoncus nec adipiscing tristique sed facilisis velit.",
        subcopies: [
          "Pack layers: Atlantic breezes cool even bright afternoons. Book sea-cave tours early; slots fill fast in summer.",
          "Parking near popular beaches is tight mid-day—arrive before ten or after four for easier access.",
          "Local vinho verde pairs beautifully with grilled fish; ask servers for the house white."
        ],
        gallery: [
          {
            src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80",
            alt: "Cliffs and turquoise water",
            caption: "Sea stacks along the southern coastline."
          },
          {
            src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
            alt: "Small boat on calm water",
            caption: "Calm mornings are ideal for paddling out."
          }
        ],
        tags: ["Nature", "Road trip", "Beach"],
        author: {
          name: "Cameron Lee",
          role: "Photojournalist",
          bio: "Cameron documents coastal communities across Europe. His work focuses on sustainable tourism and small-business guides for independent travelers.",
          img: "https://i.pravatar.cc/90?img=12",
          imgAlt: "Cameron Lee profile photo"
        },
        navPreview: "Algarve: cliffs, coves, and slow sunsets"
      },
      {
        slug: "tokyo-nights",
        pageTitle: "Tripon — Tokyo After Dark",
        heroSrc: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1800&q=80",
        heroAlt: "Neon city street at night in Tokyo",
        heroH1: "Tokyo After Dark: Alleys, Izakayas, and Late Trains",
        breadcrumb: "Home / Blog / Asia / Japan",
        leadTitle: "How to Explore Without a Rigid Plan",
        leadBody:
          "Tokyo rewards wandering. Duck into lantern-lit alleys, follow the smell of yakitori smoke, and hop the last trains with locals. This guide keeps logistics light so you can focus on small shops, vinyl bars, and convenience-store snacks that deserve their own fan club.",
        points: [
          "Golden Gai for micro-bars and conversation.",
          "Omoide Yokocho for grilled skewers and beer.",
          "Last train times—screens update in real time.",
          "IC cards work on trains, lockers, and vending machines."
        ],
        quote: "\"The best Tokyo night is the one where you miss one train and discover three new streets.\"",
        longcopy:
          "Sem libero, tortor suspendisse et, purus euismod posuere sit. Risus dui ut viverra venenatis ipsum tincidunt non, proin. Euismod pharetra sit ac nisi. Erat lacus, amet quisque urna faucibus. Vitae et leo vulputate dictumst ullamcorper.",
        subcopies: [
          "Carry cash: some izakayas and ticket windows still prefer yen notes.",
          "Station lockers are plentiful; note your bay number before you wander.",
          "Quiet cars on certain lines—watch platform decals before boarding."
        ],
        gallery: [
          {
            src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
            alt: "Lanterns along a narrow alley",
            caption: "Yokocho alleys glow after sunset."
          },
          {
            src: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
            alt: "City skyline at blue hour",
            caption: "Blue hour from a rooftop viewing deck."
          }
        ],
        tags: ["City", "Nightlife", "Food"],
        author: {
          name: "Aiko Taneda",
          role: "Local Guide Editor",
          bio: "Aiko writes neighborhood-first guides for first-time visitors to Japan, with an emphasis on respectful etiquette and transit-friendly routes.",
          img: "https://i.pravatar.cc/90?img=32",
          imgAlt: "Aiko Taneda profile photo"
        },
        navPreview: "Tokyo after dark: alleys and izakayas"
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

      setText("blogDetailsNavPrevSub", prevPost.navPreview);
      setText("blogDetailsNavNextSub", nextPost.navPreview);

      document.querySelectorAll(".blog-details-tags span").forEach((chip) => chip.classList.remove("is-active"));
      document.querySelectorAll(".blog-details-related-grid .blog-related-card").forEach((card) => {
        card.style.removeProperty("display");
      });

      window.history.replaceState(null, "", `#${post.slug}`);
    };

    const fromHash = () => {
      const raw = (window.location.hash || "").replace(/^#/, "");
      if (!raw) {
        return 0;
      }
      const idx = blogDetailPosts.findIndex((p) => p.slug === raw);
      return idx >= 0 ? idx : 0;
    };

    blogDetailIndex = fromHash();
    applyBlogDetailPost(blogDetailIndex);

    window.addEventListener("hashchange", () => {
      applyBlogDetailPost(fromHash());
    });

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
    const modal = document.createElement("div");
    const modalImg = document.createElement("img");
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(6, 10, 16, 0.82)";
    modal.style.display = "none";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "9998";
    modal.style.padding = "24px";
    modalImg.style.maxWidth = "min(92vw, 980px)";
    modalImg.style.maxHeight = "88vh";
    modalImg.style.borderRadius = "10px";
    modal.appendChild(modalImg);
    document.body.appendChild(modal);

    const bindInstagramPreview = (imageNodes) => {
      imageNodes.forEach((image) => {
        image.style.cursor = "zoom-in";
        image.addEventListener("click", () => {
          modalImg.src = image.currentSrc || image.src;
          modalImg.alt = image.alt || "Instagram image";
          modal.style.display = "flex";
        });
      });
    };

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
        strip.dataset.marqueeReady = "true";
      }

      const marqueeTrack = strip.querySelector(".instagram-marquee-track");
      const marqueeImages = Array.from(marqueeTrack?.querySelectorAll("img") || []);
      bindInstagramPreview(marqueeImages);

      if (marqueeTrack && marqueeImages.length) {
        let animationId = null;
        let lastTimestamp = 0;
        let offsetX = 0;
        let loopWidth = 0;
        const pixelsPerSecond = 32;

        const measureLoopWidth = () => {
          const allImages = Array.from(marqueeTrack.querySelectorAll("img"));
          const baseCount = Math.floor(allImages.length / 2);
          const baseImages = allImages.slice(0, baseCount);
          loopWidth = baseImages.reduce((acc, img) => acc + img.getBoundingClientRect().width, 0);
          loopWidth += Math.max(0, baseImages.length - 1) * 6;
          if (offsetX >= loopWidth && loopWidth > 0) {
            offsetX %= loopWidth;
          }
        };

        const animateStrip = (timestamp) => {
          if (!lastTimestamp) {
            lastTimestamp = timestamp;
          }
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

    modal.addEventListener("click", () => {
      modal.style.display = "none";
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
    let contactSubmitTimer = null;

    const contactFields = {
      fullNameInput: contactForm.querySelector("#contactFullName"),
      phoneInput: contactForm.querySelector("#contactPhoneNumber"),
      emailInput: contactForm.querySelector("#contactEmailId"),
      locationInput: contactForm.querySelector("#contactLocation"),
      messageInput: contactForm.querySelector("#contactMessage")
    };

    bindNameFieldNoDigits(contactFields.fullNameInput);
    bindNameFieldNoDigits(contactFields.locationInput);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
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
      field?.addEventListener("input", () => {
        clearInvalid(field);
        if (field.checkValidity()) {
          clearContactValidationTooltip();
        }
      });
    });

    contactFields.phoneInput?.addEventListener("input", () => {
      const digitsOnly = (contactFields.phoneInput.value || "").replace(/\D/g, "").slice(0, 10);
      contactFields.phoneInput.value = digitsOnly;
      const isPartialPhone = digitsOnly.length > 0 && digitsOnly.length < 10;
      contactFields.phoneInput.classList.toggle("contact-phone-partial", isPartialPhone);
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (contactSubmitBtn?.disabled) {
        return;
      }

      const fullName = contactFields.fullNameInput?.value.trim() || "";
      const rawPhone = contactFields.phoneInput?.value.trim() || "";
      const phoneDigitsOnly = rawPhone.replace(/\D/g, "");
      const emailValue = contactFields.emailInput?.value.trim() || "";
      const locationValue = contactFields.locationInput?.value.trim() || "";
      const messageValue = contactFields.messageInput?.value.trim() || "";
      const hasValidPhone = phoneDigitsOnly.length === 10;
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
});
