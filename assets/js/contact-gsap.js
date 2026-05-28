/**
 * Contact page — luxury GSAP + ScrollTrigger animations.
 */
(function (g) {
  "use strict";

  const EASE = "power3.out";

  function splitTitleChars(el) {
    const text = el.textContent || "";
    el.textContent = "";
    const chars = [];
    [...text].forEach((char) => {
      const span = document.createElement("span");
      span.className = "contact-cl-char";
      span.textContent = char === " " ? "\u00a0" : char;
      span.style.display = "inline-block";
      el.appendChild(span);
      chars.push(span);
    });
    return chars;
  }

  function triponInitContactGsap() {
    const section = document.querySelector(".contact-luxury, #contactScreen.contact-luxury");
    if (!section || section.dataset.contactGsapReady === "1") {
      return;
    }

    const gsap = g.gsap;
    const ScrollTrigger = g.ScrollTrigger;
    if (!gsap || !ScrollTrigger) {
      return;
    }

    section.dataset.contactGsapReady = "1";
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = g.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const title = section.querySelector(".contact-hero__title, .contact-shell > h2");
    const subtitle = section.querySelector(".contact-subtitle");
    const glassCard = section.querySelector(".contact-glass-card");
    const formHeading = section.querySelector(".contact-form__heading, .contact-form h3");
    const fields = section.querySelectorAll(".contact-cl-field");
    const submitBtn = section.querySelector(".contact-submit");
    const socialCards = section.querySelectorAll(".contact-social .social-card");
    const plane = section.querySelector(".contact-luxury__plane");
    const orbs = section.querySelectorAll(".contact-luxury__orb");
    const leaves = section.querySelectorAll(".contact-luxury__leaf");

    if (reduceMotion) {
      gsap.set([title, subtitle, glassCard, formHeading, fields, submitBtn, socialCards], {
        clearProps: "all",
        opacity: 1,
      });
      return;
    }

    let titleChars = [];
    if (title) {
      titleChars = splitTitleChars(title);
      gsap.set(titleChars, { yPercent: 110, opacity: 0, filter: "blur(8px)" });
    }
    if (subtitle) gsap.set(subtitle, { y: 24, opacity: 0 });
    if (glassCard) gsap.set(glassCard, { y: 48, opacity: 0 });
    if (formHeading) gsap.set(formHeading, { y: 20, opacity: 0 });
    if (fields.length) gsap.set(fields, { y: 28, opacity: 0 });
    if (submitBtn) gsap.set(submitBtn, { y: 20, opacity: 0 });
    if (socialCards.length) gsap.set(socialCards, { y: 40, opacity: 0 });

    const introTl = gsap.timeline({ defaults: { ease: EASE } });

    if (titleChars.length) {
      introTl.to(titleChars, {
        yPercent: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
        stagger: 0.025,
      });
    }
    if (subtitle) {
      introTl.to(subtitle, { y: 0, opacity: 1, duration: 0.85 }, "-=0.55");
    }
    if (glassCard) {
      introTl.to(
        glassCard,
        { y: 0, opacity: 1, duration: 1.1, ease: EASE },
        "-=0.65"
      );
    }
    if (formHeading) {
      introTl.to(formHeading, { y: 0, opacity: 1, duration: 0.75 }, "-=0.75");
    }
    if (fields.length) {
      introTl.to(
        fields,
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 },
        "-=0.55"
      );
    }
    if (submitBtn) {
      introTl.to(submitBtn, { y: 0, opacity: 1, duration: 0.7 }, "-=0.35");
    }

    if (socialCards.length) {
      gsap.to(socialCards, {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.1,
        ease: EASE,
        scrollTrigger: {
          trigger: section.querySelector(".contact-social"),
          start: "top 82%",
          once: true,
        },
      });
    }

    if (glassCard) {
      const quickX = gsap.quickTo(glassCard, "rotateY", { duration: 0.6, ease: EASE });
      const quickY = gsap.quickTo(glassCard, "rotateX", { duration: 0.6, ease: EASE });

      glassCard.addEventListener(
        "pointermove",
        (event) => {
          const rect = glassCard.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          quickX(px * 6);
          quickY(py * -4);
        },
        { passive: true }
      );
      glassCard.addEventListener("pointerleave", () => {
        quickX(0);
        quickY(0);
      });
    }

    [plane, ...orbs, ...leaves].filter(Boolean).forEach((el, i) => {
      gsap.to(el, {
        y: "+=12",
        duration: 3.5 + i * 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    section.addEventListener(
      "pointermove",
      (event) => {
        const rect = section.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        section.style.setProperty("--cl-mx", `${x}%`);
        section.style.setProperty("--cl-my", `${y}%`);
      },
      { passive: true }
    );

    socialCards.forEach((card) => {
      card.addEventListener(
        "pointermove",
        (event) => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotateY: px * 10,
            rotateX: py * -8,
            duration: 0.4,
            ease: EASE,
          });
        },
        { passive: true }
      );
      card.addEventListener("pointerleave", () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: EASE });
      });
    });
  }

  g.triponInitContactGsap = triponInitContactGsap;

  function boot() {
    if (g.gsap && g.ScrollTrigger) {
      triponInitContactGsap();
      return;
    }
    g.setTimeout(boot, 40);
  }

  if (document.querySelector(".contact-luxury")) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(window);
