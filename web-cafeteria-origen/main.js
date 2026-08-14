(function () {
  "use strict";

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------- Splash ---------- */
  function initSplash() {
    const splash = $("[data-splash]");
    if (!splash) return;
    const hide = () => splash.classList.add("is-out");
    if (document.readyState === "complete") setTimeout(hide, 500);
    else window.addEventListener("load", () => setTimeout(hide, 350));
    setTimeout(hide, 3500);
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = $("[data-nav]");
    if (!nav) return;
    const on = () => nav.classList.toggle("is-scrolled", scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
  }

  /* ---------- Hero video: gate by reduced-motion & connection ---------- */
  function initHeroVideo() {
    const video = $("[data-hero-video]");
    if (!video) return;
    if (reduced) {
      video.pause();
      video.removeAttribute("autoplay");
      video.style.display = "none";
      return;
    }
    const play = () => video.play().catch(() => {});
    if (video.readyState >= 2) play();
    else video.addEventListener("loadeddata", play, { once: true });
  }

  /* ---------- Mesh gradient drift (already CSS-animated; JS not required) ---------- */

  /* ---------- Magnetic buttons ---------- */
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

  /* ---------- Tilt 3D cards ---------- */
  function initTilt() {
    if (matchMedia("(hover: none)").matches) return;
    $$("[data-tilt-card]").forEach(card => {
      const MAX = 7;
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------- Process card videos: play only in view ---------- */
  function initCardVideos() {
    const videos = $$(".process-card-video");
    if (!videos.length) return;
    if (reduced) { videos.forEach(v => v.style.display = "none"); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.play().catch(() => {});
        else e.target.pause();
      });
    }, { threshold: 0.35 });
    videos.forEach(v => io.observe(v));
  }

  /* ---------- Reveals ---------- */
  function initReveals() {
    const els = $$("[data-reveal]");
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(el => io.observe(el));

    setTimeout(() => {
      $$("[data-reveal]:not(.is-revealed)").forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---------- Count up ---------- */
  function initCountUp() {
    const counters = $$("[data-count-to]");
    if (!counters.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.countTo);
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const suffix = el.dataset.suffix || "";
        const dur = 1300;
        const t0 = performance.now();
        function frame(t) {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.3 });
    counters.forEach(c => io.observe(c));
  }

  /* ---------- Reservation form (simulated, cinematic submit) ---------- */
  function initContactForm() {
    const form = $("[data-contact-form]");
    const success = $("[data-contact-success]");
    if (!form || !success) return;
    const submitBtn = form.querySelector("[type=submit]");
    const msg = $("[data-contact-success-msg]");

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (form.classList.contains("is-sending") || form.classList.contains("is-sent")) return;
      if (!form.reportValidity()) return;

      form.classList.add("is-sending");
      submitBtn.disabled = true;

      await new Promise(r => setTimeout(r, 700 + Math.random() * 500));

      const firstName = (form.elements.name.value || "").trim().split(/\s+/)[0] || "";
      if (msg) msg.textContent = firstName
        ? `${firstName}, hemos recibido tu reserva. Te confirmamos por email.`
        : "Hemos recibido tu reserva. Te confirmamos por email.";

      form.classList.remove("is-sending");
      form.classList.add("is-sent");
      success.setAttribute("aria-hidden", "false");
      success.classList.add("is-visible");
    });
  }

  /* ---------- Smooth anchors ---------- */
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
        behavior: reduced ? "auto" : "smooth",
      });
    });
  }

  function boot() {
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initHeroVideo, "initHeroVideo");
    safe(initMagnetic, "initMagnetic");
    safe(initTilt, "initTilt");
    safe(initCardVideos, "initCardVideos");
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");
    safe(initContactForm, "initContactForm");
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
