// ================== GALLERY / LIGHTBOX ==================
/** Package detail pages use cinematic stack gallery in package-details.js */
const triponUsePackageDetailsGallery = document.body?.classList.contains("package-details-page");

/** Gallery imgs that are actually shown (package details hides extras until you add URLs). */
function getActiveGalleryImages() {
  return Array.from(document.querySelectorAll(".image-grid .gallery-img")).filter(
    (img) => !img.classList.contains("gallery-img--empty") && img.style.display !== "none" && img.getAttribute("src")
  );
}

function updateImageGridDots(activeIndex = 0) {
  const dotsRoot = document.getElementById("imageGridDots");
  if (!dotsRoot) {
    return;
  }
  const dots = Array.from(dotsRoot.querySelectorAll(".image-grid-dot"));
  const galleryCount = getActiveGalleryImages().length;
  const visibleCount = Math.max(1, Math.min(dots.length, galleryCount || dots.length));
  dots.forEach((dot, index) => {
    const show = index < visibleCount;
    dot.style.display = show ? "" : "none";
    dot.classList.toggle("is-active", show && index === activeIndex);
  });
}
const lightbox = triponUsePackageDetailsGallery ? null : document.getElementById("lightbox");
const lightboxImg = triponUsePackageDetailsGallery ? null : document.getElementById("lightbox-img");
const lightboxCount = triponUsePackageDetailsGallery ? null : document.getElementById("lightbox-count");
const lightboxPlayBtn = triponUsePackageDetailsGallery ? null : document.getElementById("lightbox-play");
const lightboxProgressFill = triponUsePackageDetailsGallery ? null : document.getElementById("lightbox-progress-fill");
const lightboxFullscreenHint = triponUsePackageDetailsGallery ? null : document.getElementById("lightbox-fullscreen-hint");

let currentIndex = 0;
let isSlideshowPlaying = false;
let slideshowFrameId = null;
let slideshowStartTime = 0;
const slideDurationMs = 1000;
let fullscreenHintTimeout = null;

lightboxImg?.addEventListener("dblclick", (event) => {
  event.preventDefault();
  lightboxImg.classList.toggle("is-zoomed-out");
});


// Package details page logic: assets/js/package-details.js

/**
 * Resolve package image paths for detail pages and related cards.
 */
function triponResolvePackageImageSrc(src) {
  const raw = String(src || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:")) return raw;
  if (/^(https?:)?\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) {
    try {
      return new URL(raw, window.location.origin || window.location.href).href;
    } catch (_e) {
      return raw;
    }
  }
  let path = raw.replace(/\\/g, "/");
  if (path.startsWith("./")) path = path.slice(2);
  while (path.startsWith("../")) path = path.slice(3);
  if (path.startsWith("images/")) {
    path = "/assets/images/" + path.slice("images/".length);
  } else if (path.startsWith("assets/images/")) {
    path = "/" + path;
  } else {
    try {
      return new URL(raw, document.baseURI || window.location.href).href;
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
    if (/\/packages\/[^/]+\/[^/]+\.html?$/i.test(loc) || loc.includes("/packages/package-details")) {
      return new URL(`../../${tail}`, window.location.href).href;
    }
    if (loc.includes("/packages/package-details")) {
      return new URL(`../${tail}`, window.location.href).href;
    }
    return new URL(tail, window.location.href).href;
  } catch (_e2) {
    return path;
  }
}

if (typeof window !== "undefined") {
  window.triponResolvePackageImageSrc = triponResolvePackageImageSrc;
}

// select location box
const locationBox = document.querySelector('.location');
const locationDropdownWrapper = document.querySelector('.location-dropdown-wrapper');
const locationPill = locationDropdownWrapper?.querySelector('.location-pill');
const locationDropdownMenu = locationDropdownWrapper?.querySelector('.location-dropdown');
const homeMobileMenuToggle = document.querySelector("#homeMobileMenuToggle");
const homeMobileMenuOverlay = document.querySelector("#homeMobileMenuOverlay");
const homeMobileDrawerClose = document.querySelector("#homeMobileDrawerClose");
const homeMobileDrawerLinks = Array.from(document.querySelectorAll(".home-mobile-drawer-nav a"));
const homeMobileLocationToggle = document.querySelector("#homeMobileLocationToggle");
const homeMobileLocationList = document.querySelector("#homeMobileLocationList");
const homeMobileLocationIcon = homeMobileLocationToggle?.querySelector(".home-mobile-location-icon");

// Legacy dropdown in old navbar.
locationBox?.addEventListener('click', (e) => {
  e.stopPropagation();
  locationBox.classList.toggle('active');
});

locationPill?.addEventListener("click", (event) => {
  event.stopPropagation();
  locationDropdownWrapper.classList.toggle("active");
  locationDropdownMenu?.classList.toggle("active");
  const isOpen = locationDropdownWrapper.classList.toggle("is-open");
  locationPill.setAttribute("aria-expanded", String(isOpen));
});

locationDropdownMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const displayName = link.textContent.trim();
    locationPill.textContent = `${displayName} `;
    const chevron = document.createElement("i");
    chevron.className = "fa-solid fa-chevron-down location-chevron";
    chevron.setAttribute("aria-hidden", "true");
    locationPill.appendChild(chevron);
    locationDropdownWrapper?.classList.remove("active");
    locationDropdownMenu?.classList.remove("active");
    locationDropdownWrapper?.classList.remove("is-open");
    locationPill?.setAttribute("aria-expanded", "false");
  });
});

const closeHomeMobileDrawer = () => {
  if (!homeMobileMenuOverlay) return;
  homeMobileMenuOverlay.classList.remove("active");
  homeMobileMenuOverlay.setAttribute("aria-hidden", "true");
  homeMobileMenuToggle?.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
};

if (!window.triponNavbarHandlesMobile) {
homeMobileMenuToggle?.addEventListener("click", () => {
  const isOpen = homeMobileMenuOverlay?.classList.contains("active");
  if (isOpen) {
    closeHomeMobileDrawer();
    return;
  }
  if (!homeMobileMenuOverlay) return;
  homeMobileMenuOverlay.classList.add("active");
  homeMobileMenuOverlay.setAttribute("aria-hidden", "false");
  homeMobileMenuToggle.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
});

homeMobileDrawerClose?.addEventListener("click", closeHomeMobileDrawer);
homeMobileDrawerLinks.forEach((link) => {
  link.addEventListener("click", closeHomeMobileDrawer);
});

homeMobileMenuOverlay?.addEventListener("click", (event) => {
  if (event.target === homeMobileMenuOverlay) {
    closeHomeMobileDrawer();
  }
});
}

homeMobileLocationToggle?.addEventListener("click", () => {
  const isOpen = homeMobileLocationList?.classList.contains("active");
  homeMobileLocationList?.classList.toggle("active", !isOpen);
  homeMobileLocationToggle.setAttribute("aria-expanded", String(!isOpen));
  if (homeMobileLocationIcon) {
    homeMobileLocationIcon.textContent = isOpen ? "+" : "−";
  }
});

// close dropdown when clicking outside
document.addEventListener('click', () => {
  locationBox?.classList.remove('active');
  locationDropdownWrapper?.classList.remove("active");
  locationDropdownMenu?.classList.remove("active");
  locationDropdownWrapper?.classList.remove("is-open");
  locationPill?.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeHomeMobileDrawer();
    if (!triponUsePackageDetailsGallery && lightbox?.style.display === "flex") {
      closeLightbox();
    }
  }
});

// Open lightbox
function updateLightboxView() {
  const galleryList = getActiveGalleryImages();
  if (!galleryList.length || !lightboxImg) return;
  currentIndex = Math.min(currentIndex, galleryList.length - 1);
  lightboxImg.classList.remove("is-zoomed-out");
  lightboxImg.src = galleryList[currentIndex].src;
  if (lightboxCount) {
    lightboxCount.textContent = `${currentIndex + 1} / ${galleryList.length}`;
  }
  updateImageGridDots(currentIndex);
}


function setProgress(value) {
  if (!lightboxProgressFill) return;
  const boundedValue = Math.max(0, Math.min(100, value));
  lightboxProgressFill.style.width = `${boundedValue}%`;
}

function showFullscreenHint() {
  if (!lightboxFullscreenHint) return;
  lightboxFullscreenHint.classList.add("show");
  if (fullscreenHintTimeout) {
    window.clearTimeout(fullscreenHintTimeout);
  }
  fullscreenHintTimeout = window.setTimeout(() => {
    lightboxFullscreenHint.classList.remove("show");
  }, 2300);
}

function hideFullscreenHint() {
  if (!lightboxFullscreenHint) return;
  lightboxFullscreenHint.classList.remove("show");
  if (fullscreenHintTimeout) {
    window.clearTimeout(fullscreenHintTimeout);
    fullscreenHintTimeout = null;
  }
}

function lockPageForGalleryLightbox() {
  document.body.classList.add("gallery-lightbox-open");
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function unlockPageForGalleryLightbox() {
  document.body.classList.remove("gallery-lightbox-open");
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.style.display = "none";
  unlockPageForGalleryLightbox();
  stopSlideshow(true);
  hideFullscreenHint();
}

function setSlideshowButtonState(isPlaying) {
  if (!lightboxPlayBtn) return;
  lightboxPlayBtn.innerHTML = isPlaying ? "&#10074;&#10074;" : "&#9658;";
  lightboxPlayBtn.setAttribute("aria-label", isPlaying ? "Pause slideshow" : "Start slideshow");
}

function setPlayButtonVisibility(shouldShow) {
  if (!lightboxPlayBtn) return;
  lightboxPlayBtn.style.display = shouldShow ? "inline-flex" : "none";
  if (!shouldShow) {
    stopSlideshow(true);
  }
}

function stopSlideshow(resetProgress = true) {
  isSlideshowPlaying = false;
  if (slideshowFrameId) {
    window.cancelAnimationFrame(slideshowFrameId);
    slideshowFrameId = null;
  }
  setSlideshowButtonState(false);
  if (resetProgress) setProgress(0);
}

function runSlideshowProgress(timestamp) {
  if (!isSlideshowPlaying) return;
  if (!slideshowStartTime) slideshowStartTime = timestamp;
  const elapsed = timestamp - slideshowStartTime;
  const percentage = (elapsed / slideDurationMs) * 100;
  setProgress(percentage);

  if (elapsed >= slideDurationMs) {
    setProgress(100);
    const galleryList = getActiveGalleryImages();
    if (currentIndex >= galleryList.length - 1) {
      stopSlideshow(false);
      return;
    }
    currentIndex += 1;
    updateLightboxView();
    slideshowStartTime = 0;
    setProgress(0);
  }

  slideshowFrameId = window.requestAnimationFrame(runSlideshowProgress);
}

function startSlideshow() {
  if (getActiveGalleryImages().length <= 1) return;
  currentIndex = 0;
  updateLightboxView();
  isSlideshowPlaying = true;
  setSlideshowButtonState(true);
  slideshowStartTime = 0;
  setProgress(0);
  if (slideshowFrameId) window.cancelAnimationFrame(slideshowFrameId);
  slideshowFrameId = window.requestAnimationFrame(runSlideshowProgress);
}

if (!triponUsePackageDetailsGallery) {
document.querySelector(".image-grid")?.addEventListener("click", (event) => {
  const img = event.target.closest(".gallery-img");
  if (!img || img.classList.contains("gallery-img--empty")) return;
  const galleryList = getActiveGalleryImages();
  const index = galleryList.indexOf(img);
  if (index < 0 || !lightbox) return;
  lightbox.style.display = "flex";
  lockPageForGalleryLightbox();
  currentIndex = index;
  updateLightboxView();
  stopSlideshow(true);
  setPlayButtonVisibility(index === galleryList.length - 1);
  showFullscreenHint();
});

const lightboxCloseEl = document.querySelector(".close");
const lightboxNextEl = document.querySelector(".next");
const lightboxPrevEl = document.querySelector(".prev");
if (lightboxCloseEl) {
  lightboxCloseEl.onclick = () => closeLightbox();
}
if (lightboxNextEl) {
  lightboxNextEl.onclick = () => {
    const galleryList = getActiveGalleryImages();
    if (!galleryList.length) return;
    currentIndex = (currentIndex + 1) % galleryList.length;
    updateLightboxView();
    if (isSlideshowPlaying) startSlideshow();
  };
}
if (lightboxPrevEl) {
  lightboxPrevEl.onclick = () => {
    const galleryList = getActiveGalleryImages();
    if (!galleryList.length) return;
    currentIndex = (currentIndex - 1 + galleryList.length) % galleryList.length;
    updateLightboxView();
    if (isSlideshowPlaying) startSlideshow();
  };
}

lightboxPlayBtn?.addEventListener("click", () => {
  if (isSlideshowPlaying) {
    stopSlideshow(false);
    return;
  }
  startSlideshow();
});
}



// ================== ACCORDION ==================
const headers = document.querySelectorAll(".accordion-header");

headers.forEach((header) => {
  header.addEventListener("click", () => {
    const content = header.nextElementSibling;
    const item = header.closest(".accordion-item");
    const isSectionOpen = content.classList.contains("open");

    if (isSectionOpen) {
      header.classList.remove("active");
      item?.classList.remove("active");
      content.style.maxHeight = null;
      content.classList.remove("open");
      return;
    }

    header.classList.add("active");
    item?.classList.add("active");

    if (content.id === "packageItineraryContent") {
      content.style.maxHeight = null;
      content.classList.add("open");
      window.refreshPackageItineraryAccordionHeight?.();
    } else if (content.id === "packageDetailFaqContent") {
      content.style.maxHeight = null;
      content.classList.add("open");
    } else {
      content.style.maxHeight = `${content.scrollHeight}px`;
      content.classList.add("open");
    }
  });
});


// Instagram showcase: continuous moving strip effect
const instaSections = document.querySelectorAll(".instagram-showcase");
if (instaSections.length) {
  instaSections.forEach((instaSection) => {
    const strip = instaSection.querySelector(".instagram-strip");
    if (!strip) return;

    strip.style.setProperty("display", "block", "important");
    strip.style.setProperty("overflow-x", "hidden", "important");
    strip.style.setProperty("overflow-y", "hidden", "important");
    strip.style.setProperty("max-height", "256px", "important");
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
          if (isHiddenSet) image.setAttribute("aria-hidden", "true");
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
    if (!marqueeTrack) return;

    let animationId = null;
    let lastTimestamp = 0;
    let offsetX = 0;
    let loopWidth = 0;
    const pixelsPerSecond = 32;

    const ensureTrackCopies = () => {
      const baseCount = Number(strip.dataset.baseCount || "0");
      if (!baseCount) return;
      const allImages = Array.from(marqueeTrack.querySelectorAll("img"));
      const baseImages = allImages.slice(0, baseCount);
      const baseWidth =
        baseImages.reduce((acc, img) => acc + img.getBoundingClientRect().width, 0) +
        Math.max(0, baseImages.length - 1) * 6;
      if (!baseWidth) return;

      const requiredCopies = Math.max(2, Math.ceil(strip.clientWidth / baseWidth) + 1);
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
      loopWidth = baseImages.reduce((acc, img) => acc + img.getBoundingClientRect().width, 0);
      loopWidth += Math.max(0, baseImages.length - 1) * 6;
      if (offsetX >= loopWidth && loopWidth > 0) offsetX %= loopWidth;
    };

    const animateStrip = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
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
    Array.from(marqueeTrack.querySelectorAll("img")).forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", measureLoopWidth, { once: true });
      }
    });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animationId = window.requestAnimationFrame(animateStrip);
    }

    window.addEventListener("beforeunload", () => {
      if (animationId) window.cancelAnimationFrame(animationId);
    });
  });
}



// SHARE FUNCTION (other pages — native share / clipboard fallback)
const shareBtn = document.getElementById("shareBtn");
const sharePopupOverlay = document.getElementById("sharePopup");
if (shareBtn && !sharePopupOverlay) {
  shareBtn.addEventListener("click", async () => {
    const shareData = {
      title: "Trip to Paris",
      text: "Check out this amazing tour!",
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  });
}

const stars = document.querySelectorAll("#rating i");
const ratingText = document.getElementById("ratingText");

let currentRating = 0;

function highlightStars(value) {
  stars.forEach((star) => {
    if (star.getAttribute("data-value") <= value) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

function updateStars(value) {
  stars.forEach((star) => {
    if (star.getAttribute("data-value") <= value) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

if (stars.length && ratingText) {
  if (localStorage.getItem("userRating")) {
    currentRating = Number(localStorage.getItem("userRating"));
    updateStars(currentRating);
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const value = star.getAttribute("data-value");
      currentRating = value;
      localStorage.setItem("userRating", value);
      updateStars(value);
      ratingText.textContent = `${value}.0 (You rated)`;
    });

    star.addEventListener("mouseover", () => {
      const value = star.getAttribute("data-value");
      highlightStars(value);
    });

    star.addEventListener("mouseout", () => {
      updateStars(currentRating);
    });
  });
}

const reviewsBtn = document.getElementById("reviewsBtn");
const packagesBtn = document.getElementById("packagesBtn");
const contactBtn = document.getElementById("contactBtn");
const reviewsModal = document.getElementById("reviewsModal");
const packagesModal = document.getElementById("packagesModal");
const contactModal = document.getElementById("contactModal");
const modalCloses = document.querySelectorAll(".modal-close");
const contactForm = document.getElementById("contactForm");

function openModal(modal) {
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modal) {
  if (modal) {
    modal.classList.remove("active");
  }
}

reviewsBtn?.addEventListener("click", () => openModal(reviewsModal));
packagesBtn?.addEventListener("click", () => openModal(packagesModal));
contactBtn?.addEventListener("click", () => openModal(contactModal));

modalCloses.forEach(button => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal-overlay");
    closeModal(modal);
  });
});

[reviewsModal, packagesModal, contactModal].forEach(modal => {
  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  }
});

if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    alert("Thanks! Your message has been sent.");
    closeModal(contactModal);
    contactForm.reset();
  });
}




