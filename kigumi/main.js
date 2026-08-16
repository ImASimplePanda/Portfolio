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

  /* ---------- Scroll-scrubbed disassembly sequence ---------- */
  function initScrubber() {
    var section = $("[data-scrubber]");
    var canvas = $("#scrub-canvas");
    if (!section || !canvas || reduced) return;

    var FRAME_COUNT = parseInt(canvas.dataset.frames, 10) || 96;
    var PATH = canvas.dataset.path || "assets/frames/frame-";
    var PAD = 3;
    var ctx = canvas.getContext("2d");
    var images = new Array(FRAME_COUNT);
    var loaded = 0;
    var loadingBar = $("[data-scrubber-loading]");
    var loadingFill = $("[data-scrubber-loading-fill]");
    var hint = $("[data-scrubber-hint]");
    var progressFill = $("[data-scrubber-progress-fill]");
    var counter = $("[data-scrubber-counter]");
    var texts = $$("[data-scrubber-text]");
    var ready = false;

    function frameSrc(i) {
      var n = String(i + 1).padStart(PAD, "0");
      return PATH + n + ".webp";
    }

    function resizeCanvas() {
      var dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(currentFrame);
    }

    var currentFrame = 0;
    function drawFrame(i) {
      var img = images[i];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = innerWidth, ch = innerHeight;
      ctx.clearRect(0, 0, cw, ch);
      var scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      var x = (cw - w) / 2, y = (ch - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    }

    function preload() {
      for (var i = 0; i < FRAME_COUNT; i++) {
        (function (idx) {
          var img = new Image();
          img.onload = img.onerror = function () {
            loaded++;
            var pct = Math.round((loaded / FRAME_COUNT) * 100);
            if (loadingFill) loadingFill.style.width = pct + "%";
            if (loaded === FRAME_COUNT) onReady();
            if (idx === 0) drawFrame(0);
          };
          img.src = frameSrc(idx);
          images[idx] = img;
        })(i);
      }
    }

    function onReady() {
      ready = true;
      if (loadingBar) loadingBar.classList.add("is-hidden");
      resizeCanvas();
      onScroll();
    }

    var scrollHandler = null;
    function onScroll() {
      if (!ready) return;
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - innerHeight;
      var progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      currentFrame = Math.min(FRAME_COUNT - 1, Math.floor(progress * (FRAME_COUNT - 1)));
      drawFrame(currentFrame);

      if (progressFill) progressFill.style.width = (progress * 100) + "%";
      if (counter) counter.textContent = String(currentFrame + 1).padStart(2, "0") + " / " + String(FRAME_COUNT).padStart(2, "0");
      if (hint) hint.classList.toggle("is-hidden", progress > 0.04);

      texts.forEach(function (t) {
        var from = parseFloat(t.dataset.from);
        var to = parseFloat(t.dataset.to);
        t.classList.toggle("is-active", progress >= from && progress < to);
      });
    }

    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("scroll", function () {
      if (!scrollHandler) {
        scrollHandler = requestAnimationFrame(function () { onScroll(); scrollHandler = null; });
      }
    }, { passive: true });

    resizeCanvas();
    preload();
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!fineHover) return;
    $$("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.dataset.magneticStrength || "0.2");
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
      els.forEach(function (el) {
        if (!el.classList.contains("is-revealed") && el.getBoundingClientRect().top < innerHeight) {
          el.classList.add("is-revealed");
        }
      });
    }, 6000);
  }

  /* ---------- CTA form (no backend — simulated) ---------- */
  function initCtaForm() {
    var form = $("[data-cta-form]");
    if (!form) return;
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("input", form);
      if (!input.value || !input.value.includes("@")) {
        input.style.borderColor = "var(--accent)";
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
    safe(initScrubber, "initScrubber");
    safe(initMagnetic, "initMagnetic");
    safe(initReveals, "initReveals");
    safe(initCtaForm, "initCtaForm");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
