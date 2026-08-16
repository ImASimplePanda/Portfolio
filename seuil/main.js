(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------- Nav ---------- */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var on = function () { nav.classList.toggle("is-scrolled", scrollY > 30); };
    on();
    window.addEventListener("scroll", on, { passive: true });

    var toggle = $("[data-nav-toggle]");
    var links = $("[data-nav-links]");
    var scrim = $("[data-nav-scrim]");
    if (!toggle || !links) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      links.classList.toggle("is-open", open);
      if (scrim) scrim.classList.toggle("is-visible", open);
      document.documentElement.classList.toggle("nav-locked", open);
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    if (scrim) scrim.addEventListener("click", function () { setOpen(false); });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  /* ---------- Hero ambient loop video ---------- */
  function initHeroVideo() {
    var video = $("#threshold-video");
    var hero = $("[data-hero]");
    if (!video || !hero) return;
    if (reduced) { document.documentElement.classList.add("no-video"); return; }

    var ready = false, failed = false, safety = null;
    function checkReady() {
      if (!ready && video.readyState >= 2) {
        ready = true;
        if (safety) clearTimeout(safety);
        hero.classList.add("is-ready");
      }
    }
    video.addEventListener("loadeddata", checkReady);
    video.addEventListener("canplay", checkReady);
    video.addEventListener("error", function () {
      failed = true;
      document.documentElement.classList.add("no-video");
    });
    safety = setTimeout(function () {
      if (!ready) { failed = true; document.documentElement.classList.add("no-video"); }
    }, 8000);
    checkReady();

    var playPromise = video.play();
    if (playPromise && playPromise.catch) playPromise.catch(function () {});
  }

  /* ---------- Mouse-follow glow (hero + feature cards) ---------- */
  function initGlow() {
    if (!fineHover) return;
    var targets = $$("[data-glow]");
    if (!targets.length) return;
    targets.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!fineHover) return;
    $$("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.dataset.magneticStrength || "0.25");
      var inner = document.createElement("span");
      inner.className = "magnetic-inner";
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
      el.classList.add("has-magnetic");
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) - r.width / 2) * strength;
        ty = ((e.clientY - r.top) - r.height / 2) * strength;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("mouseleave", function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
      function loop() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        inner.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
        raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------- Reveals ---------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.03, rootMargin: "0px 0px -3% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---------- Typewriter tagline ---------- */
  function initTypewriter() {
    var el = $("[data-typewriter]");
    if (!el || reduced) return;
    var text = el.textContent;
    el.textContent = "";
    el.style.visibility = "visible";
    var i = 0;
    function type() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(type, 18);
      }
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { type(); io.disconnect(); }
      });
    }, { threshold: 0.6 });
    io.observe(el);
  }

  /* ---------- Waitlist form (no backend — simulated submit) ---------- */
  function initCtaForm() {
    var form = $("[data-cta-form]");
    if (!form) return;
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("input", form);
      if (!input.value || !input.value.includes("@")) {
        input.style.borderColor = "var(--pearl-3)";
        return;
      }
      var wrap = form.closest("[data-cta-wrap]");
      var success = $("[data-cta-success]", wrap);
      wrap.classList.add("is-sent");
      if (success) success.classList.add("is-visible");
    });
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initHeroVideo, "initHeroVideo");
    safe(initGlow, "initGlow");
    safe(initMagnetic, "initMagnetic");
    safe(initReveals, "initReveals");
    safe(initTypewriter, "initTypewriter");
    safe(initCtaForm, "initCtaForm");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
