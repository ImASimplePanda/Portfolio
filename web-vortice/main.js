(function () {
  "use strict";

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------- Inits ---------- */

  function initNav() {
    const nav = $("[data-nav]");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMouseGradient() {
    const el = $("[data-mouse-gradient]");
    if (!el) return;
    let raf = null, mx = 50, my = 50;
    function apply() {
      document.documentElement.style.setProperty("--mx", mx + "%");
      document.documentElement.style.setProperty("--my", my + "%");
      raf = null;
    }
    window.addEventListener("mousemove", e => {
      mx = (e.clientX / window.innerWidth) * 100;
      my = (e.clientY / window.innerHeight) * 100;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
  }

  function initHeroInvert() {
    const title = $("[data-invert]");
    if (!title || !fineHover) return;
    title.addEventListener("mouseover", e => {
      if (!title.contains(e.relatedTarget)) title.classList.add("is-inverted");
    });
    title.addEventListener("mouseout", e => {
      if (!title.contains(e.relatedTarget)) title.classList.remove("is-inverted");
    });
  }

  function initCursor() {
    const root = $("[data-cursor-root]");
    if (!root || !fineHover) return;
    document.documentElement.classList.add("has-cursor");
    const ring = $(".cursor-ring", root);
    const dot = $(".cursor-dot", root);
    let tx = 0, ty = 0, rx = 0, ry = 0, firstMove = false;

    window.addEventListener("mousemove", e => {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      if (!firstMove) {
        firstMove = true;
        rx = tx; ry = ty;
        if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        root.classList.add("is-ready");
      }
    }, { passive: true });

    function tick() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    const HOVERABLES = "a, button, .work-row, [data-magnetic]";
    document.addEventListener("mouseover", e => { if (e.target.closest(HOVERABLES)) root.classList.add("is-interactive"); });
    document.addEventListener("mouseout", e => {
      if (e.target.closest(HOVERABLES) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOVERABLES)))
        root.classList.remove("is-interactive");
    });
  }

  function initMagnetic() {
    if (!fineHover) return;
    $$("[data-magnetic]").forEach(el => {
      const strength = parseFloat(el.dataset.magneticStrength || "0.25");
      const inner = document.createElement("span");
      inner.className = "magnetic-inner";
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
      el.classList.add("has-magnetic");
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) - r.width / 2) * strength;
        ty = ((e.clientY - r.top) - r.height / 2) * strength;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        inner.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  function initWorkAccordion() {
    $$("[data-work-row]").forEach(row => {
      const toggle = () => row.classList.toggle("is-open");
      row.addEventListener("click", toggle);
      row.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  }

  function initReveals() {
    const targets = $$(".reveal, .stat, .work-row, .process-item, .section-title");
    targets.forEach(t => t.classList.add("reveal"));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    targets.forEach(t => io.observe(t));

    setTimeout(() => {
      $$(".reveal:not(.is-visible)").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  function initCountUp() {
    const counters = $$("[data-count-to]");
    if (!counters.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.countTo);
        const suffix = el.dataset.suffix || "";
        const dur = 1200;
        const t0 = performance.now();
        function frame(t) {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.2 });
    counters.forEach(c => io.observe(c));
  }

  function initSmoothAnchors() {
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const navOffset = 70;
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - navOffset,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initMouseGradient, "initMouseGradient");
    safe(initHeroInvert, "initHeroInvert");
    safe(initCursor, "initCursor");
    safe(initMagnetic, "initMagnetic");
    safe(initWorkAccordion, "initWorkAccordion");
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");
    safe(initSmoothAnchors, "initSmoothAnchors");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
