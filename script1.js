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

  const homeRoot = document.querySelector("#homeScreen");

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

      if (!cards.length || !arrows.length) {
        return;
      }

      const renderRow = () => {
        cards.forEach((card, idx) => {
          const isActive = idx === activeIndex;
          card.style.opacity = isActive ? "1" : "0.58";
          card.style.transform = isActive ? "translateY(-2px)" : "translateY(0)";
          card.style.transition = "all 220ms ease";
        });
        cards[activeIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
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

      renderRow();
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
    const editableFields = heroSection.querySelectorAll(".search-box .field");
    editableFields.forEach((field) => {
      field.style.cursor = "pointer";
      field.addEventListener("click", () => {
        const label = field.querySelector("label")?.textContent?.trim() || "Value";
        const valueHolder = field.querySelector("span:last-child");
        const current = valueHolder?.textContent?.trim() || "";
        const next = window.prompt(`Enter ${label}`, current);
        if (next !== null && valueHolder) {
          valueHolder.textContent = next.trim() || current;
        }
      });
    });

    const sendBtn = heroSection.querySelector(".send-btn");
    sendBtn?.addEventListener("click", () => {
      const values = Array.from(editableFields).map((field) =>
        field.querySelector("span:last-child")?.textContent?.trim() || ""
      );
      const hasPlaceholders = values.some((value) => /enter|select|guests/i.test(value));
      showStatus(hasPlaceholders ? "Please fill all travel details" : "Trip request sent");
    });
  }

  // Adventure section: simple previous/next place slider
  const adventureSections = document.querySelectorAll(".adventure");

   adventureSections.forEach((section) => {
    const items = Array.from(section.querySelectorAll(".place-item"));
    const controls = section.querySelectorAll(".arrow-controls button");

    let activeIndex = 0;

    const paint = () => {
     items.forEach((item, idx) => {
      item.style.opacity = idx === activeIndex ? "1" : "0.45";
      item.style.transform = idx === activeIndex ? "translateY(-2px)" : "translateY(0)";
      item.style.transition = "all 220ms ease";
    });
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
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      paint();
    });

    controls[1]?.addEventListener("click", () => {
      activeIndex = (activeIndex + 1) % items.length;
      paint();
    });

    paint();
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
    const articleTitle = reasonsSection.querySelector(".reason-text article h3");
    const articleCopy = reasonsSection.querySelector(".reason-text article p");
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

    topics.forEach((topic) => {
      topic.style.cursor = "pointer";
      topic.addEventListener("click", () => {
        setActive(topics, topic);
        const marker = reasonsSection.querySelector(".reason-marker");
        const textBox = reasonsSection.querySelector(".reason-text");
        if (marker && textBox) {
          const topicTop = topic.getBoundingClientRect().top;
          const boxTop = textBox.getBoundingClientRect().top;
          marker.style.top = (topicTop - boxTop) + "px";
        }
        const key = topic.textContent?.trim() || "";
        const selected = reasonContent[key];
        if (selected && articleTitle && articleCopy) {
          articleTitle.textContent = selected.title;
          articleCopy.textContent = selected.body;
        }
      });
    });

    const initMarker = () => {
      const marker = reasonsSection.querySelector(".reason-marker");
      const activeTopic = reasonsSection.querySelector(".reason-text h4.active");
      const textBox = reasonsSection.querySelector(".reason-text");
      if (marker && activeTopic && textBox) {
        const topicTop = activeTopic.getBoundingClientRect().top;
        const boxTop = textBox.getBoundingClientRect().top;
        marker.style.top = (topicTop - boxTop) + "px";
      }
    };
    requestAnimationFrame(initMarker);

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

    const extractDaysFromChip = (chip) => chip.textContent.match(/\d+/g)?.[1] || null;

    const applyPackagesDayFilter = (selectedDays) => {
      cards.forEach((card) => {
        const cardDays = card.dataset.days || "";
        const shouldShow = !selectedDays || cardDays === selectedDays;
        card.style.display = shouldShow ? "block" : "none";
      });
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((node) => node.classList.remove("chip-active"));
        chip.classList.add("chip-active");

        if (chip.classList.contains("chip-custom")) {
          applyPackagesDayFilter(null);
          showStatus("Custom package feature coming soon!");
          return;
        }

        const selectedDays = extractDaysFromChip(chip);
        applyPackagesDayFilter(selectedDays);
      });
    });

    const defaultChip = filterSection?.querySelector(".chip-active:not(.chip-custom)");
    const defaultDays = defaultChip ? extractDaysFromChip(defaultChip) : null;
    applyPackagesDayFilter(defaultDays);
  }

  // Popular packages: tab filtering
  const packageSection = document.querySelector(".popular-packages");
  if (packageSection) {
    const tabs = Array.from(packageSection.querySelectorAll(".package-tabs button"));
    const cards = Array.from(packageSection.querySelectorAll(".package-card"));

    const applyPackageFilter = (type) => {
      cards.forEach((card) => {
        const cardType = card.dataset.type || "";
        const visible = type === "all" || type === cardType;
        card.style.display = visible ? "block" : "none";
      });
    };


    // Show only couple cards on load (All tab active shows all)
    applyPackageFilter("all");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setActive(tabs, tab);
        const type = (tab.textContent || "").trim().toLowerCase();
        applyPackageFilter(type);
      });
    });

    packageSection.querySelector(".see-all")?.addEventListener("click", () => {
      setActive(tabs, tabs[0]);
      applyPackageFilter("all");
      showStatus("Showing all packages");
    });
  }

  // Testimonials: compact read-more behavior for longer cards
  const testimonials = document.querySelector(".testimonials");
  if (testimonials) {
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

  // Instagram showcase: image preview in a simple modal
  const instaSection = homeRoot?.querySelector(".instagram-showcase");
  if (instaSection) {
    const images = instaSection.querySelectorAll(".instagram-strip img");
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

    images.forEach((image) => {
      image.style.cursor = "zoom-in";
      image.addEventListener("click", () => {
        modalImg.src = image.currentSrc || image.src;
        modalImg.alt = image.alt || "Instagram image";
        modal.style.display = "flex";
      });
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
    const prevBtn = contactExploreWrap.querySelector(".contact-explore-prev");
    const nextBtn = contactExploreWrap.querySelector(".contact-explore-next");
    const favButtons = contactExploreWrap.querySelectorAll(".contact-explore-fav");
    const cards = exploreGrid ? Array.from(exploreGrid.querySelectorAll(".contact-explore-card")) : [];

    let activeIndex = 0;

    const renderExploreCards = () => {
      if (!cards.length) {
        return;
      }
      cards.forEach((card, idx) => {
        const isActive = idx === activeIndex;
        card.style.opacity = isActive ? "1" : "0.62";
        card.style.transform = isActive ? "translateY(-3px)" : "translateY(0)";
        card.style.transition = "all 220ms ease";
      });
      cards[activeIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    };

    prevBtn?.addEventListener("click", () => {
      if (!cards.length) {
        return;
      }
      activeIndex = (activeIndex - 1 + cards.length) % cards.length;
      renderExploreCards();
    });

    nextBtn?.addEventListener("click", () => {
      if (!cards.length) {
        return;
      }
      activeIndex = (activeIndex + 1) % cards.length;
      renderExploreCards();
    });

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
