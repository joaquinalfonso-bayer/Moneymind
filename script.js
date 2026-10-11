/* =========================================================
   MONEYMIND — Interactions & GSAP animations
   ========================================================= */
(() => {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* -------------------------------------------------------
     1. Testimonials data (injected)
     ------------------------------------------------------- */
  const testimonials = [
    { name: "Mike L.", src: "Google Play Store" },
    { name: "Sarah K.", src: "Apple Store" },
    { name: "Daniel R.", src: "Google Play Store" },
    { name: "Priya S.", src: "Apple Store" },
    { name: "James T.", src: "Google Play Store" },
    { name: "Ana M.", src: "Apple Store" },
  ];
  const playIcon = `<svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 3.5v17l9-8.5zM4 3.5l12 6.8L13 12m-9 8.5 12-6.8L13 12"/></svg>`;
  const appleIcon = `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M12 6 7.5 15M12 6l4.5 9M6 15h12" stroke="#D4FF5A" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  const track = $("#track");
  track.innerHTML = testimonials.map(t => `
    <article class="tcard tilt-soft">
      <div class="tcard__src">${t.src.startsWith("Google") ? playIcon : appleIcon}${t.src}</div>
      <p class="tcard__quote">“It's a must-have tool for anyone looking to take control of their financial future.”</p>
      <div class="tcard__foot">
        <div class="tcard__line"></div>
        <div class="tcard__stars">&#9733; &#9733; &#9733; &#9733; &#9733;</div>
        <div class="tcard__name">${t.name}</div>
      </div>
    </article>`).join("");

  /* -------------------------------------------------------
     2. Split headings into words (keeps nested spans/colors)
     ------------------------------------------------------- */
  function splitWords(el) {
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            const outer = document.createElement("span");
            outer.className = "sw";
            const inner = document.createElement("span");
            inner.textContent = p;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    };
    walk(el);
  }
  $$(".split-words").forEach(splitWords);

  // Splash wordmark characters
  const splashWord = $("#splashWord");
  splashWord.innerHTML = splashWord.textContent.split("").map(c => `<span class="ch">${c}</span>`).join("");

  /* -------------------------------------------------------
     3. Custom cursor
     ------------------------------------------------------- */
  if (!isTouch) {
    const dot = $("#cursorDot"), ring = $("#cursorRing");
    const dx = gsap.quickTo(dot, "x", { duration: 0.08 }), dy = gsap.quickTo(dot, "y", { duration: 0.08 });
    const rx = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("mousemove", e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    $$("a, button, .card, .tcard").forEach(el => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
  }

  /* -------------------------------------------------------
     4. Splash screen -> hero intro
     ------------------------------------------------------- */
  // Initial hidden states for hero
  gsap.set(".hero__title .word", { yPercent: 110 });
  gsap.set(".hero-anim", { autoAlpha: 0, y: 30 });
  gsap.set("#heroPhone", { autoAlpha: 0, x: 220, rotateY: -60, rotateZ: 25 });
  gsap.set(".nav", { autoAlpha: 0, y: -30 });

  const counter = { v: 0 };
  const splashTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  splashTl
    .from(".splash__logo", { scale: 0, rotate: -180, duration: 0.9, ease: "back.out(1.8)" })
    .from(".splash__word .ch", { yPercent: 110, autoAlpha: 0, stagger: 0.045, duration: 0.6 }, "-=0.4")
    .from([".splash__meta", ".splash__bar"], { autoAlpha: 0, y: 10, duration: 0.4 }, "-=0.3")
    .to(".splash__rings span", {
      keyframes: [{ opacity: 0.7, scale: 1, duration: 0 }, { opacity: 0, scale: 9, duration: 2 }],
      stagger: { each: 0.35, repeat: 1 }, ease: "power1.out",
    }, 0.2)
    .to(counter, {
      v: 100, duration: reduceMotion ? 0.3 : 1.8, ease: "power2.inOut",
      onUpdate: () => {
        const v = Math.round(counter.v);
        $("#splashCount").textContent = v;
        $("#splashBar").style.width = v + "%";
      },
    }, 0.6)
    .to(".splash__center", { scale: 0.9, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, "+=0.15")
    .to(".splash__rings", { autoAlpha: 0, duration: 0.3 }, "<")
    .to(".splash__panel--top", { yPercent: -100, duration: 0.9, ease: "expo.inOut" })
    .to(".splash__panel--bottom", { yPercent: 100, duration: 0.9, ease: "expo.inOut" }, "<")
    .add(() => {
      $("#splash").remove();
      document.body.classList.remove("is-loading");
      ScrollTrigger.refresh();
    })
    .add(heroIntro(), "-=0.55");

  function heroIntro() {
    return gsap.timeline({ defaults: { ease: "power4.out" } })
      .to(".nav", { autoAlpha: 1, y: 0, duration: 0.8 })
      .to(".hero__title .word", { yPercent: 0, duration: 1.1, stagger: 0.08 }, 0.1)
      .to(".hero-anim", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.35)
      .to("#heroPhone", {
        autoAlpha: 1, x: 0, rotateX: 8, rotateY: -22, rotateZ: 12, duration: 1.6, ease: "expo.out",
        onComplete: startHeroPhoneLoop,
      }, 0.2);
  }

  /* -------------------------------------------------------
     5. Hero: 3D phone (mouse tilt + float), glow breathing
     ------------------------------------------------------- */
  function startHeroPhoneLoop() {
    if (reduceMotion) return;
    gsap.to("#heroVisual", { y: -18, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });

    if (!isTouch) {
      const phone = $("#heroPhone");
      const rY = gsap.quickTo(phone, "rotateY", { duration: 0.8, ease: "power3" });
      const rX = gsap.quickTo(phone, "rotateX", { duration: 0.8, ease: "power3" });
      $(".hero").addEventListener("mousemove", e => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        rY(-22 + nx * 30);
        rX(8 - ny * 20);
      });
      $(".hero").addEventListener("mouseleave", () => { rY(-22); rX(8); });
    }
  }
  // Hero background video: hide placeholder once a video loads; pause when off-screen
  const heroVideo = $(".hero__video");
  if (heroVideo) {
    heroVideo.addEventListener("loadeddata", () => {
      const ph = $(".hero__video-ph");
      if (ph) ph.style.display = "none";
    });
    if (reduceMotion) { heroVideo.removeAttribute("autoplay"); heroVideo.pause(); }
    ScrollTrigger.create({
      trigger: ".hero", start: "top top", end: "bottom top",
      onLeave: () => heroVideo.pause(),
      onEnterBack: () => { if (!reduceMotion) heroVideo.play().catch(() => {}); },
    });
  }

  // Hero parallax on scroll
  gsap.to(".hero__copy", {
    yPercent: -25, opacity: 0.2, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to("#heroVisual", {
    yPercent: 18, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* -------------------------------------------------------
     6. Nav state + mobile menu
     ------------------------------------------------------- */
  ScrollTrigger.create({
    start: 80,
    onUpdate: self => $("#nav").classList.toggle("is-scrolled", self.scroll() > 80),
  });
  $("#burger").addEventListener("click", () => $(".nav__links").classList.toggle("is-open"));

  /* -------------------------------------------------------
     7. Generic scroll reveals
     ------------------------------------------------------- */
  $$(".split-words").forEach(h => {
    gsap.from($$(".sw > span", h), {
      yPercent: 115, rotate: 4, duration: 1, ease: "power4.out", stagger: 0.05,
      scrollTrigger: { trigger: h, start: "top 85%" },
    });
  });

  $$(".pill-tag").forEach(p => {
    gsap.from(p, {
      scale: 0, autoAlpha: 0, duration: 0.7, ease: "back.out(2)",
      scrollTrigger: { trigger: p, start: "top 88%" },
    });
  });

  $$(".reveal-up").forEach(el => {
    gsap.from(el, {
      y: 40, autoAlpha: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
  });

  /* -------------------------------------------------------
     8. Ratings counter
     ------------------------------------------------------- */
  $$("[data-count]").forEach(el => {
    const target = parseFloat(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.8, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => (el.textContent = obj.v.toFixed(1)),
    });
  });

  /* -------------------------------------------------------
     9. About rings (rotation, pulse, scroll parallax)
     ------------------------------------------------------- */
  const rings = $$("#aboutRings circle");
  gsap.from(rings, {
    attr: { r: 0 }, opacity: 0, duration: 1.6, ease: "expo.out", stagger: 0.08,
    scrollTrigger: { trigger: ".about", start: "top 75%" },
  });
  if (!reduceMotion) {
    rings.forEach((c, i) => {
      gsap.to(c, {
        opacity: 0.35, duration: 1.6 + i * 0.15, ease: "sine.inOut",
        yoyo: true, repeat: -1, delay: i * 0.2,
      });
    });
  }
  gsap.fromTo("#aboutRings", { scale: 0.85, rotate: -10 }, {
    scale: 1.15, rotate: 10, ease: "none",
    scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true },
  });
  if (!reduceMotion) {
    gsap.to(".btn--glow", {
      boxShadow: "0 0 70px rgba(212,255,90,0.75)", duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1,
    });
  }

  /* -------------------------------------------------------
     10. Features bento: 3D entrance + tilt
     ------------------------------------------------------- */
  gsap.from(".bento .card", {
    y: 120, rotateX: -25, autoAlpha: 0, transformOrigin: "50% 100%",
    duration: 1.1, ease: "power3.out", stagger: 0.12,
    scrollTrigger: { trigger: ".bento", start: "top 82%" },
  });

  gsap.from(".card__rings span", {
    scale: 0.4, autoAlpha: 0, duration: 1.2, stagger: 0.15, ease: "expo.out",
    scrollTrigger: { trigger: ".card--icon", start: "top 80%" },
  });
  if (!reduceMotion) {
    gsap.to("#icon3d", { y: -10, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
  }

  // Phones inside cards slide up as they enter
  $$(".card .phone").forEach(p => {
    gsap.from(p, {
      yPercent: 30, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: p.closest(".card"), start: "top 75%" },
    });
  });

  gsap.from("#alertPill", {
    y: -30, scale: 0.6, autoAlpha: 0, duration: 0.9, ease: "back.out(2.2)",
    scrollTrigger: { trigger: "#alertPill", start: "top 80%" },
    onComplete: () => {
      if (!reduceMotion) gsap.to("#alertPill", { y: -4, duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    },
  });

  function addTilt(el, { max = 10, lift = 10, glare = true } = {}) {
    if (isTouch || reduceMotion) return;
    gsap.set(el, { transformPerspective: 1000 });
    const rX = gsap.quickTo(el, "rotateX", { duration: 0.6, ease: "power3" });
    const rY = gsap.quickTo(el, "rotateY", { duration: 0.6, ease: "power3" });
    const z = gsap.quickTo(el, "z", { duration: 0.6, ease: "power3" });
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rY((px - 0.5) * max * 2);
      rX(-(py - 0.5) * max * 2);
      z(lift * 4);
      if (glare) { el.style.setProperty("--gx", px * 100 + "%"); el.style.setProperty("--gy", py * 100 + "%"); }
    });
    el.addEventListener("mouseleave", () => { rX(0); rY(0); z(0); });
  }
  $$(".tilt").forEach(el => addTilt(el, { max: 8 }));
  $$(".tilt-soft").forEach(el => addTilt(el, { max: 10, glare: false }));

  // 3D icon follows mouse within its card
  if (!isTouch && !reduceMotion) {
    const icon = $("#icon3d");
    const card = $(".card--icon");
    gsap.set(icon, { transformPerspective: 600 });
    const iX = gsap.quickTo(icon, "rotateX", { duration: 0.5, ease: "power3" });
    const iY = gsap.quickTo(icon, "rotateY", { duration: 0.5, ease: "power3" });
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      iY(((e.clientX - r.left) / r.width - 0.5) * 50);
      iX(-((e.clientY - r.top) / r.height - 0.5) * 50);
    });
    card.addEventListener("mouseleave", () => { iX(0); iY(0); });
  }

  /* -------------------------------------------------------
     11. Testimonials carousel
     ------------------------------------------------------- */
  const cards = $$(".tcard", track);
  let index = 0;
  const visible = () => (window.innerWidth <= 960 ? 1 : 3);
  const maxIndex = () => Math.max(0, cards.length - visible());

  function goTo(i) {
    index = Math.max(0, Math.min(i, maxIndex()));
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const step = cards[0].getBoundingClientRect().width + gap;
    gsap.to(track, { x: -index * step, duration: 0.9, ease: "expo.out" });
    gsap.fromTo(cards.slice(index, index + visible()),
      { rotateY: -12 }, { rotateY: 0, duration: 0.9, ease: "power3.out", stagger: 0.05 });
    $("#prevBtn").disabled = index === 0;
    $("#nextBtn").disabled = index === maxIndex();
  }
  $("#prevBtn").addEventListener("click", () => goTo(index - 1));
  $("#nextBtn").addEventListener("click", () => goTo(index + 1));
  window.addEventListener("resize", () => goTo(index));
  goTo(0);

  // drag / swipe
  let startX = null;
  track.addEventListener("pointerdown", e => { startX = e.clientX; });
  window.addEventListener("pointerup", e => {
    if (startX === null) return;
    const d = e.clientX - startX;
    if (Math.abs(d) > 50) goTo(index + (d < 0 ? 1 : -1));
    startX = null;
  });

  gsap.from(cards, {
    y: 80, rotateX: -20, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.1,
    scrollTrigger: { trigger: ".carousel", start: "top 85%" },
  });

  /* -------------------------------------------------------
     12. CTA banner
     ------------------------------------------------------- */
  gsap.from("#ctaBanner", {
    clipPath: "inset(12% 12% 12% 12% round 24px)", duration: 1.3, ease: "expo.out",
    scrollTrigger: { trigger: "#ctaBanner", start: "top 85%" },
  });
  gsap.fromTo(".cta__bigm path", { strokeDasharray: 1400, strokeDashoffset: 1400 }, {
    strokeDashoffset: 0, duration: 2, ease: "power2.inOut",
    scrollTrigger: { trigger: "#ctaBanner", start: "top 80%" },
  });
  gsap.fromTo("#ctaPhone", { y: 160, rotateX: 25 }, {
    y: 0, rotateX: 0, ease: "none", transformPerspective: 1000,
    scrollTrigger: { trigger: "#ctaBanner", start: "top bottom", end: "center center", scrub: 1 },
  });

  /* -------------------------------------------------------
     13. Footer
     ------------------------------------------------------- */
  gsap.from(".footer__col", {
    y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
    scrollTrigger: { trigger: ".footer", start: "top 85%" },
  });
  gsap.fromTo("#footerGiant", { xPercent: -42, yPercent: 30 }, {
    xPercent: -50, yPercent: 0, ease: "none",
    scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: 1 },
  });

  /* -------------------------------------------------------
     14. Magnetic buttons
     ------------------------------------------------------- */
  if (!isTouch && !reduceMotion) {
    $$(".magnetic").forEach(el => {
      const mx = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      const my = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.35);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("mouseleave", () => { mx(0); my(0); });
    });
  }

  // Smooth anchor scrolling that accounts for the fixed nav
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      $(".nav__links").classList.remove("is-open");
      window.scrollTo({ top: target.offsetTop - 60, behavior: "smooth" });
    });
  });
})();
