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

  /* ---------- Persistent scene video ---------- */
  function initSceneVideo() {
    var video = $("#scene-video");
    var scene = $("[data-scene]");
    if (!video || !scene) return;
    if (reduced) { document.documentElement.classList.add("no-video"); return; }

    var ready = false, safety = null;
    function checkReady() {
      if (!ready && video.readyState >= 2) {
        ready = true;
        if (safety) clearTimeout(safety);
        scene.classList.add("is-ready");
      }
    }
    video.addEventListener("loadeddata", checkReady);
    video.addEventListener("canplay", checkReady);
    video.addEventListener("error", function () { document.documentElement.classList.add("no-video"); });
    safety = setTimeout(function () { if (!ready) document.documentElement.classList.add("no-video"); }, 8000);
    checkReady();

    var playPromise = video.play();
    if (playPromise && playPromise.catch) playPromise.catch(function () {});
  }

  /* ---------- Scroll-driven "camera" drift + lerped progress ---------- */
  function initScrollCamera() {
    if (reduced) return;
    var video = $("#scene-video");
    if (!video) return;
    var target = 0, current = 0;
    function onScroll() {
      var max = document.documentElement.scrollHeight - innerHeight;
      target = max > 0 ? scrollY / max : 0;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    function tick() {
      current += (target - current) * 0.05;
      var scale = 1 + current * 0.08;
      var y = current * 40;
      video.style.transform = "scale(" + scale + ") translateY(" + (-y) + "px)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Floating dust particles ---------- */
  function initDust() {
    var layer = $("[data-dust]");
    if (!layer) return;
    var n = 22;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      var left = Math.random() * 100;
      var bottom = Math.random() * 100;
      var dur = 10 + Math.random() * 14;
      var delay = Math.random() * dur;
      s.style.left = left + "%";
      s.style.bottom = bottom + "%";
      s.style.animationDuration = dur + "s";
      s.style.animationDelay = "-" + delay + "s";
      layer.appendChild(s);
    }
  }

  /* ---------- Kinetic hero title (word stagger) ---------- */
  function initKineticTitle() {
    var el = $("[data-kinetic]");
    if (!el || reduced) return;
    var text = el.textContent.trim();
    var words = text.split(/\s+/);
    el.innerHTML = words.map(function (w, i) {
      return '<span class="word" style="animation-delay:' + (0.15 + i * 0.09) + 's">' + w + "</span>";
    }).join(" ");
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
    var els = $$("[data-reveal], [data-reveal-left], [data-reveal-right]");
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

  /* ---------- Count-up stats ---------- */
  function initCountUp() {
    var els = $$("[data-count-to]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target;
        var to = parseFloat(el.dataset.countTo);
        var suffix = el.dataset.countSuffix || "";
        var decimals = el.dataset.countTo.includes(".") ? 1 : 0;
        if (reduced) { el.textContent = to.toFixed(decimals) + suffix; return; }
        var start = null, dur = 1400;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min(1, (ts - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (to * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Tracklist rows: click to "play" (visual only) ---------- */
  function initTracklist() {
    var rows = $$("[data-track-row]");
    if (!rows.length) return;
    rows.forEach(function (row) {
      row.addEventListener("click", function () {
        rows.forEach(function (r) { r.classList.remove("is-active"); });
        row.classList.add("is-active");
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    var items = $$("[data-faq-item]");
    if (!items.length) return;
    items.forEach(function (item) {
      var q = $("[data-faq-q]", item);
      var a = $("[data-faq-a]", item);
      if (!q || !a) return;
      function setOpen(open) {
        item.classList.toggle("is-open", open);
        a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
      }
      q.addEventListener("click", function () {
        var open = !item.classList.contains("is-open");
        items.forEach(function (other) { if (other !== item) setOpen.call(other, false); });
        setOpen(open);
      });
    });
    var first = items[0];
    if (first) {
      var a = $("[data-faq-a]", first);
      first.classList.add("is-open");
      if (a) a.style.maxHeight = a.scrollHeight + "px";
    }
  }

  /* ---------- Presave form (no backend — simulated) ---------- */
  function initPresaveForm() {
    var form = $("[data-presave-form]");
    if (!form) return;
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("input", form);
      if (!input.value || !input.value.includes("@")) {
        input.style.borderColor = "var(--accent-2)";
        return;
      }
      var wrap = form.closest("[data-presave-wrap]");
      var success = $("[data-presave-success]", wrap);
      wrap.classList.add("is-sent");
      if (success) success.classList.add("is-visible");
    });
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initSceneVideo, "initSceneVideo");
    safe(initScrollCamera, "initScrollCamera");
    safe(initDust, "initDust");
    safe(initKineticTitle, "initKineticTitle");
    safe(initMagnetic, "initMagnetic");
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");
    safe(initTracklist, "initTracklist");
    safe(initFaq, "initFaq");
    safe(initPresaveForm, "initPresaveForm");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
