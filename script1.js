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
      const shouldAutoMoveLeft = row.classList.contains("reviews-row-top") || row.classList.contains("reviews-row-bottom");
      let rowAutoTimer = null;
      let autoScrollIndex = 0;
      const shouldPackageStyleMove = shouldAutoMoveLeft && !isMediaRow;

      if (!cards.length) {
        return;
      }

      if (shouldPackageStyleMove) {
        const baseCards = Array.from(row.querySelectorAll(".reviews-card"));
        const isSmallReviewLayout = () => window.matchMedia("(max-width: 425px)").matches;
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
          const singleCardWidth = "calc(100% - 12px)";
          const desktopCardWidth = "calc((100% - 40px) / 3)";
          const targetWidth = isSmallReviewLayout() ? singleCardWidth : desktopCardWidth;
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
      }

      const renderRow = () => {
        cards.forEach((card, idx) => {
          const isActive = idx === activeIndex;
          card.style.opacity = "1";
          card.style.transform = isMediaRow ? "translateY(0)" : (isActive ? "translateY(-2px)" : "translateY(0)");
          card.style.transition = "all 220ms ease";
        });
        if (isMediaRow) {
          cards[activeIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
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

      const moveRowLeftByOneCard = () => {
        if (!shouldPackageStyleMove) {
          return;
        }
        const rowCards = Array.from(row.querySelectorAll(".reviews-card"));
        if (rowCards.length < 2) {
          return;
        }
        autoScrollIndex = (autoScrollIndex + 1) % rowCards.length;
        row.scrollTo({
          left: rowCards[autoScrollIndex].offsetLeft,
          behavior: "smooth"
        });
      };

      const startRowAutoplay = () => {
        stopRowAutoplay();
        if (!shouldAutoMoveLeft || cards.length < 2) {
          return;
        }
        rowAutoTimer = window.setInterval(() => {
          if (isMediaRow) {
            activeIndex = (activeIndex + 1) % cards.length;
            renderRow();
            return;
          }
          moveRowLeftByOneCard();
        }, 2600);
      };

      if (shouldPackageStyleMove) {
        row.addEventListener(
          "scroll",
          () => {
            const rowCards = Array.from(row.querySelectorAll(".reviews-card"));
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
      }

      row.addEventListener("mouseenter", stopRowAutoplay);
      row.addEventListener("mouseleave", startRowAutoplay);
      row.addEventListener("touchstart", stopRowAutoplay, { passive: true });
      row.addEventListener("touchend", startRowAutoplay);

      renderRow();
      startRowAutoplay();
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
    const travelDateInput = heroSection.querySelector('.search-box .field input[type="date"]');
    const travelDateField = travelDateInput?.closest(".field");

    const openTravelDatePicker = () => {
      if (!travelDateInput) {
        return;
      }
      travelDateInput.focus();
      if (typeof travelDateInput.showPicker === "function") {
        travelDateInput.showPicker();
      }
    };

    travelDateField?.addEventListener("click", openTravelDatePicker);
    travelDateInput?.addEventListener("focus", openTravelDatePicker);

    const sendBtn = heroSection.querySelector(".send-btn");
    sendBtn?.addEventListener("click", () => {
      const values = Array.from(searchInputs).map((input) => input.value.trim());
      const hasEmptyValue = values.some((value) => !value);
      if (hasEmptyValue) {
        showStatus("Please fill all travel details");
        return;
      }
      showSubmitPopup();
      heroSection.querySelector(".search-box")?.reset();
    });

    const mobileHeroBookingTrigger = document.querySelector("#mobileHeroBookingTrigger");
    const mobilePrefModal = document.querySelector("#mobilePrefModal");
    const mobilePrefClose = document.querySelector("#mobilePrefClose");
    const mobilePrefSteps = Array.from(document.querySelectorAll(".mobile-pref-step"));
    const mobilePrefNext = document.querySelector("#mobilePrefNext");
    const mobilePrefPrev = document.querySelector("#mobilePrefPrev");
    const mobilePrefActions = document.querySelector("#mobilePrefActions");
    let mobilePrefStepIndex = 0;

    const isMobilePrefStepValid = () => {
      const stepNumber = mobilePrefStepIndex + 1;
      if (stepNumber === 1) return Boolean(document.querySelector('input[name="stayDuration"]:checked'));
      if (stepNumber === 2) return Boolean(document.querySelector('input[name="travelerCount"]:checked'));
      if (stepNumber === 3) return Boolean(document.querySelector('input[name="travelPreference"]:checked'));
      if (stepNumber === 4) return Boolean(document.querySelector('input[name="travelerName"]')?.value.trim());
      if (stepNumber === 5) {
        const phone = document.querySelector('input[name="travelerPhone"]')?.value.trim() || "";
        return phone.length >= 10;
      }
      if (stepNumber === 6) return Boolean(document.querySelector('input[name="bookingTime"]:checked'));
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
        // Step 1: show Previous only after user picks an option.
        // Step 2-6: always show Previous.
        const shouldShowPrevious = currentStep > 1 || (currentStep === 1 && isCurrentStepValid);
        mobilePrefPrev.style.visibility = shouldShowPrevious ? "visible" : "hidden";
        mobilePrefPrev.style.pointerEvents = shouldShowPrevious ? "auto" : "none";
      }
    };

    const hideMobilePrefModal = () => {
      if (!mobilePrefModal) {
        return;
      }
      mobilePrefModal.classList.remove("active");
      mobilePrefModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      mobilePrefStepIndex = 0;
      paintMobilePrefStep();
    };

    const showMobilePrefModal = () => {
      if (!mobilePrefModal) {
        return;
      }
      mobilePrefModal.classList.add("active");
      mobilePrefModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      mobilePrefStepIndex = 0;
      paintMobilePrefStep();
    };

    mobileHeroBookingTrigger?.addEventListener("click", showMobilePrefModal);
    mobilePrefClose?.addEventListener("click", hideMobilePrefModal);
    mobilePrefNext?.addEventListener("click", () => {
      if (!isMobilePrefStepValid()) {
        showStatus("Please select or fill this step");
        return;
      }
      mobilePrefStepIndex = Math.min(mobilePrefStepIndex + 1, mobilePrefSteps.length - 1);
      paintMobilePrefStep();
    });
    mobilePrefPrev?.addEventListener("click", () => {
      mobilePrefStepIndex = Math.max(mobilePrefStepIndex - 1, 0);
      paintMobilePrefStep();
    });
    mobilePrefModal?.addEventListener("click", (event) => {
      if (event.target === mobilePrefModal) {
        hideMobilePrefModal();
      }
    });

    const mobileStepInputs = Array.from(
      mobilePrefModal?.querySelectorAll('input[type="radio"], input[type="text"], input[type="tel"], input[type="email"]') || []
    );
    mobileStepInputs.forEach((input) => {
      input.addEventListener("change", paintMobilePrefStep);
      input.addEventListener("input", paintMobilePrefStep);
    });
    paintMobilePrefStep();

    // Desktop homepage: first auto-open at 10s, then every 15s.
    if (homeScreen && window.matchMedia("(min-width: 992px)").matches) {
      const tryOpenDesktopPrefModal = () => {
        if (mobilePrefModal?.classList.contains("active")) {
          return;
        }
        showMobilePrefModal();
      };

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
    const items = Array.from(section.querySelectorAll(".place-item"));
    const controls = section.querySelectorAll(".arrow-controls button");
    const ANIMATION_MS = 480;
    const isSwipeLayout = () => window.matchMedia("(max-width: 430px)").matches;
    let isAnimating = false;
    let activeSwipeIndex = 0;

    const applySwipeCardStyles = () => {
      if (!row || !isSwipeLayout()) {
        return;
      }
      const rowWidth = row.getBoundingClientRect().width;
      const cardWidth = Math.max(220, Math.round(rowWidth - 12));
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
      setImportant(row, "padding", "0 6px 4px");
      setImportant(row, "align-items", "flex-start");
      row.classList.add("hide-mobile-scrollbar");

      items.forEach((item) => {
        setImportant(item, "flex", `0 0 ${cardWidth}px`);
        setImportant(item, "min-width", `${cardWidth}px`);
        setImportant(item, "max-width", `${cardWidth}px`);
        setImportant(item, "display", "grid");
        setImportant(item, "grid-template-columns", "40px minmax(0, 1fr)");
        setImportant(item, "column-gap", "8px");
        setImportant(item, "align-items", "start");
        setImportant(item, "text-align", "left");
        setImportant(item, "height", "auto");
        setImportant(item, "min-height", "0");
        setImportant(item, "padding", "10px");
        setImportant(item, "border-radius", "12px");
        setImportant(item, "border", "1px solid #e6ebf2");
        setImportant(item, "background", "#ffffff");
        setImportant(item, "scroll-snap-align", "start");

        const content = item.querySelector(".place-content");
        const title = item.querySelector(".place-content h3");
        const subtitle = item.querySelector(".place-content span");
        const icon = item.querySelector(".place-icon");
        if (content) {
          setImportant(content, "display", "flex");
          setImportant(content, "flex-direction", "column");
          setImportant(content, "justify-content", "center");
          setImportant(content, "min-width", "0");
          setImportant(content, "row-gap", "4px");
        }
        if (icon) {
          setImportant(icon, "width", "40px");
          setImportant(icon, "height", "40px");
          setImportant(icon, "font-size", "16px");
          setImportant(icon, "border", "none");
          setImportant(icon, "background", "radial-gradient(circle at 30% 30%, #d8f2ed 0%, #8ad4bf 100%)");
          setImportant(icon, "color", "#1b3b34");
          setImportant(icon, "font-family", "inherit");
          setImportant(icon, "font-weight", "600");
        }
        if (title) {
          setImportant(title, "margin", "0");
          setImportant(title, "line-height", "1.2");
          setImportant(title, "color", "#1f2937");
          setImportant(title, "font-size", "16px");
        }
        if (subtitle) {
          setImportant(subtitle, "margin", "0");
          setImportant(subtitle, "line-height", "1.35");
          setImportant(subtitle, "white-space", "normal");
          setImportant(subtitle, "color", "#6b7280");
          setImportant(subtitle, "background", "transparent");
        }
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

    const shiftLeft = () => {
      if (!row || items.length < 2 || isAnimating) {
        return;
      }
      if (isSwipeLayout()) {
        activeSwipeIndex = (activeSwipeIndex + 1) % items.length;
        row.scrollTo({ left: items[activeSwipeIndex].offsetLeft, behavior: "smooth" });
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

    if (row && items.length > 1) {
      window.setInterval(() => {
        shiftLeft();
      }, 3200);
    }
  });

  // Location things: selectable activity cards + quick jump from "20+ More"
  const locationThingsSection = document.querySelector(".location-things");
  if (locationThingsSection) {
    const thingCards = Array.from(locationThingsSection.querySelectorAll(".location-things-grid article"));
    const packagesTarget = document.querySelector(".location-packages");

    const setActiveThing = (card) => {
      thingCards.forEach((node) => node.classList.remove("is-active"));
      card.classList.add("is-active");
    };

    thingCards.forEach((card, idx) => {
      card.style.cursor = "pointer";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");

      const activateCard = () => {
        if (card.classList.contains("location-more-card")) {
          packagesTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
          showStatus("Showing package offers");
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

  // Location packages: days chips filtering + right arrow rotation
  const locationPackagesSection = document.querySelector(".location-packages");
  if (locationPackagesSection) {
    const filterSection = locationPackagesSection.querySelector(".package-screen-filters");
    const chips = Array.from(filterSection?.querySelectorAll(".chip") || []);
    const cards = Array.from(locationPackagesSection.querySelectorAll(".package-screen-grid .package-card"));
    const nextArrow = locationPackagesSection.querySelector(".location-packages-arrow");
    const VISIBLE_CARDS = 3;
    let startIndex = 0;
    let selectedDays = null;

    const extractDaysFromChip = (chip) => chip.textContent.match(/\d+/g)?.[1] || null;

    const getCurrentPool = () => {
      const dayMatched = selectedDays ? cards.filter((card) => card.dataset.days === selectedDays) : cards.slice();
      if (dayMatched.length >= VISIBLE_CARDS) {
        return dayMatched;
      }

      const withFallback = dayMatched.slice();
      cards.forEach((card) => {
        if (!withFallback.includes(card)) {
          withFallback.push(card);
        }
      });
      return withFallback;
    };

    const renderVisibleCards = () => {
      const pool = getCurrentPool();
      const visibleCount = Math.min(VISIBLE_CARDS, pool.length);

      cards.forEach((card) => {
        card.style.display = "none";
      });

      for (let i = 0; i < visibleCount; i += 1) {
        const cardIndex = (startIndex + i) % pool.length;
        pool[cardIndex].style.display = "block";
      }

      if (nextArrow) {
        nextArrow.disabled = pool.length <= visibleCount;
      }
      animateVisiblePackageCards(cards);
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((node) => node.classList.remove("chip-active"));
        chip.classList.add("chip-active");

        if (chip.classList.contains("chip-custom")) {
          showStatus("Custom package feature coming soon!");
          selectedDays = null;
        } else {
          selectedDays = extractDaysFromChip(chip);
        }

        startIndex = 0;
        renderVisibleCards();
      });
    });

    nextArrow?.addEventListener("click", () => {
      const pool = getCurrentPool();
      if (pool.length <= VISIBLE_CARDS) {
        return;
      }
      startIndex = (startIndex + 1) % pool.length;
      renderVisibleCards();
    });

    const defaultChip = filterSection?.querySelector(".chip-active:not(.chip-custom)");
    selectedDays = defaultChip ? extractDaysFromChip(defaultChip) : null;
    renderVisibleCards();
  }

  // Packages page: filter cards by selected day chip
  const packagesScreenSection = document.querySelector(".packages-screen");
  if (packagesScreenSection) {
    const filterSection = packagesScreenSection.querySelector(".package-screen-filters");
    const chips = Array.from(filterSection?.querySelectorAll(".chip") || []);
    const cards = Array.from(packagesScreenSection.querySelectorAll(".package-screen-grid .package-card"));
    const packageTrack = packagesScreenSection.querySelector(".package-screen-grid");
    const VISIBLE_CARDS = 3;
    const supportsHoverImageSwap = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const packageImageLoadCache = new Map();
    let packageAutoScrollTimer = null;
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
      const dayMatched = selectedDays ? cards.filter((card) => card.dataset.days === selectedDays) : cards.slice();
      if (dayMatched.length >= VISIBLE_CARDS) {
        return dayMatched;
      }

      const withFallback = dayMatched.slice();
      cards.forEach((card) => {
        if (!withFallback.includes(card)) {
          withFallback.push(card);
        }
      });
      return withFallback;
    };

    const stopPackageAutoplay = () => {
      if (packageAutoScrollTimer) {
        window.clearInterval(packageAutoScrollTimer);
        packageAutoScrollTimer = null;
      }
    };

    const getVisiblePackageCards = () => cards.filter((card) => card.style.display !== "none");

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

    const startPackageAutoplay = () => {
      stopPackageAutoplay();
      const visibleCards = getVisiblePackageCards();
      if (!packageTrack || visibleCards.length < 2 || !isPackagesScreenVisible) {
        return;
      }
      packageAutoScrollTimer = window.setInterval(() => {
        scrollToPackage(activePackageIndex + 1);
      }, 3000);
    };

    const applyPackagesDayFilter = () => {
      const pool = getPackagesPool();
      cards.forEach((card) => {
        card.style.display = pool.includes(card) ? "block" : "none";
      });
      activePackageIndex = 0;
      const firstVisibleCard = getVisiblePackageCards()[0];
      if (firstVisibleCard) {
        packageTrack?.scrollTo({ left: firstVisibleCard.offsetLeft, behavior: "smooth" });
      } else {
        packageTrack?.scrollTo({ left: 0, behavior: "smooth" });
      }
      animateVisiblePackageCards(cards);
      startPackageAutoplay();
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

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((node) => node.classList.remove("chip-active"));
        chip.classList.add("chip-active");

        if (chip.classList.contains("chip-custom")) {
          selectedDays = null;
          applyPackagesDayFilter();
          showStatus("Custom package feature coming soon!");
          return;
        }

        selectedDays = extractDaysFromChip(chip);
        applyPackagesDayFilter();
      });
    });

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

    const packagesVisibilityObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isPackagesScreenVisible = Boolean(entry?.isIntersecting);
        if (isPackagesScreenVisible) {
          startPackageAutoplay();
        } else {
          stopPackageAutoplay();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
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

    const startPackageAutoplay = () => {
      stopPackageAutoplay();
      const visibleCards = getVisiblePackageCards();
      if (!packageTrack || visibleCards.length < 2 || !isPackageSectionVisible) {
        return;
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
          startPackageAutoplay();
        } else {
          stopPackageAutoplay();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
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

    const startTestimonialAutoplay = () => {
      stopTestimonialAutoplay();
      if (reviewCards.length < 2 || !isTestimonialsVisible) {
        return;
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
            startTestimonialAutoplay();
          } else {
            stopTestimonialAutoplay();
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
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

  // Blog details meta row: share actions + related-card filtering by tag
  const blogDetailsMetaRow = document.querySelector(".blog-details-meta-row");
  if (blogDetailsMetaRow) {
    const shareLinks = Array.from(blogDetailsMetaRow.querySelectorAll(".blog-details-share a"));
    const tagChips = Array.from(blogDetailsMetaRow.querySelectorAll(".blog-details-tags span"));
    const relatedCards = Array.from(document.querySelectorAll(".blog-details-related-grid .blog-related-card"));
    let activeTag = null;

    const currentUrl = encodeURIComponent(window.location.href);
    const currentTitle = encodeURIComponent(document.title || "Tripon Blog Details");

    const shareTargets = {
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
      X: `https://twitter.com/intent/tweet?url=${currentUrl}&text=${currentTitle}`,
      LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`
    };

    shareLinks.forEach((link) => {
      const label = link.getAttribute("aria-label") || "";
      link.addEventListener("click", (event) => {
        event.preventDefault();
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

  const blogRatingItems = Array.from(document.querySelectorAll(".blog-details-rating-item"));
  blogRatingItems.forEach((item) => {
    const label = item.querySelector("span")?.textContent?.trim() || "Rating";
    const starText = item.querySelector("strong");
    if (!starText) {
      return;
    }

    let selectedRating = 5;
    starText.textContent = "";
    starText.classList.add("blog-rating-stars");

    for (let value = 1; value <= 5; value += 1) {
      const starBtn = document.createElement("button");
      starBtn.type = "button";
      starBtn.className = "blog-rating-star";
      starBtn.textContent = "★";
      starBtn.setAttribute("aria-label", `${label} rating ${value} star${value > 1 ? "s" : ""}`);

      const paintStars = () => {
        const stars = Array.from(starText.querySelectorAll(".blog-rating-star"));
        stars.forEach((starNode, idx) => {
          starNode.classList.toggle("is-active", idx < selectedRating);
        });
      };

      starBtn.addEventListener("click", () => {
        selectedRating = value;
        paintStars();
      });

      starText.appendChild(starBtn);
      paintStars();
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

  blogCommentPopupClose?.addEventListener("click", hideBlogCommentPopup);
  blogCommentPopup?.addEventListener("click", (event) => {
    if (event.target === blogCommentPopup) {
      hideBlogCommentPopup();
    }
  });

  if (blogCommentForm) {
    blogCommentForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const inputs = blogCommentForm.querySelectorAll("input, textarea");
      const hasEmptyField = Array.from(inputs).some((input) => !input.value.trim());

      if (hasEmptyField) {
        showStatus("Please fill all fields");
        return;
      }

      showBlogCommentPopup();
      blogCommentForm.reset();
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
  const submitPopup = document.querySelector("#submitPopup");
  const submitPopupClose = document.querySelector("#submitPopupClose");

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
    submitPopup.classList.add("active");
    submitPopup.setAttribute("aria-hidden", "false");
  };

  submitPopupClose?.addEventListener("click", hideSubmitPopup);
  submitPopup?.addEventListener("click", (event) => {
    if (event.target === submitPopup) {
      hideSubmitPopup();
    }
  });

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const inputs = contactForm.querySelectorAll("input, textarea");
      let isEmpty = false;

      inputs.forEach((input) => {
        if (!input.value.trim()) {
          isEmpty = true;
        }
      });

      if (isEmpty) {
        showStatus("Please fill all fields");
        return;
      }

      showSubmitPopup();
      contactForm.reset();
    });
  }

  // Contact explore: horizontal card slider + favorite toggle
  const contactExploreWrap = document.querySelector(".contact-explore-wrap");
  if (contactExploreWrap) {
    const exploreGrid = contactExploreWrap.querySelector(".contact-explore-grid");
    const favButtons = contactExploreWrap.querySelectorAll(".contact-explore-fav");
    const cards = exploreGrid ? Array.from(exploreGrid.querySelectorAll(".contact-explore-card")) : [];

    let activeIndex = 0;
    let contactExploreAutoTimer = null;

    const renderExploreCards = () => {
      if (!cards.length) {
        return;
      }
      cards.forEach((card) => {
        card.style.opacity = "1";
        card.style.transform = "none";
        card.style.transition = "none";
      });
      if (exploreGrid) {
        exploreGrid.scrollTo({ left: cards[activeIndex].offsetLeft, behavior: "smooth" });
      } else {
        cards[activeIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    };

    const stopExploreAutoplay = () => {
      if (contactExploreAutoTimer) {
        window.clearInterval(contactExploreAutoTimer);
        contactExploreAutoTimer = null;
      }
    };

    const startExploreAutoplay = () => {
      stopExploreAutoplay();
      if (!exploreGrid || cards.length < 2) {
        return;
      }
      contactExploreAutoTimer = window.setInterval(() => {
        activeIndex = (activeIndex + 1) % cards.length;
        renderExploreCards();
      }, 2800);
    };

    if (exploreGrid) {
      exploreGrid.addEventListener(
        "scroll",
        () => {
          const nearestIndex = cards.reduce((bestIndex, card, idx) => {
            const bestDistance = Math.abs(cards[bestIndex].offsetLeft - exploreGrid.scrollLeft);
            const currentDistance = Math.abs(card.offsetLeft - exploreGrid.scrollLeft);
            return currentDistance < bestDistance ? idx : bestIndex;
          }, 0);
          activeIndex = nearestIndex;
        },
        { passive: true }
      );
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
    startExploreAutoplay();
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
