(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* =============================================================
     Mounts (idempotent)
     ============================================================= */
  function mountRoutes() {
    var target = $("[data-routes]");
    if (!target || target.children.length > 0 || !data.routes) return;
    target.innerHTML = data.routes.map(function (r) {
      return '<li class="route-row" data-reveal>' +
        '<span class="route-code mono">' + escHTML(r.code) + '</span>' +
        '<span class="route-city">' + escHTML(r.city) + '</span>' +
        '<span class="route-meta mono">' + escHTML(r.meta) + '</span>' +
        '</li>';
    }).join("");
  }

  function mountTestimonials() {
    var target = $("[data-testimonials]");
    if (!target || target.children.length > 0 || !data.testimonials) return;
    target.innerHTML = data.testimonials.map(function (t) {
      return '<article class="testimonial" data-reveal>' +
        '<p class="testimonial-quote">' + escHTML(t.quote) + '</p>' +
        '<div><p class="testimonial-name">' + escHTML(t.name) + '</p>' +
        '<p class="testimonial-role">' + escHTML(t.role) + '</p></div>' +
        '</article>';
    }).join("");
  }

  function mountFaqs() {
    var target = $("[data-faqs]");
    if (!target || target.children.length > 0 || !data.faqs) return;
    target.innerHTML = data.faqs.map(function (f, i) {
      return '<div class="accordion-item' + (i === 0 ? " is-open" : "") + '" data-accordion-item>' +
        '<button class="accordion-q" type="button" aria-expanded="' + (i === 0 ? "true" : "false") + '">' +
        '<span>' + escHTML(f.q) + '</span><span class="plus mono">+</span></button>' +
        '<div class="accordion-a"><p>' + escHTML(f.a) + '</p></div>' +
        '</div>';
    }).join("");
  }

  function mountContact() {
    var email = $("[data-contact-email]");
    var phone = $("[data-contact-phone]");
    if (email && data.contact) { email.textContent = data.contact.email; email.href = "mailto:" + data.contact.email; }
    if (phone && data.contact) { phone.textContent = data.contact.phone; phone.href = "tel:" + data.contact.phone.replace(/\s+/g, ""); }
  }

  /* =============================================================
     Splash (double safety net)
     ============================================================= */
  function initSplash() {
    var splash = $("[data-splash]");
    if (!splash) return;
    var hide = function () { splash.classList.add("is-out"); };
    if (document.readyState === "complete") setTimeout(hide, 500);
    else window.addEventListener("load", function () { setTimeout(hide, 350); });
    setTimeout(hide, 3200);
  }

  /* =============================================================
     Nav (solidify + burger)
     ============================================================= */
  function initNav() {
    var nav = $("[data-nav]");
    if (nav) {
      var onScroll = function () {
        if (window.scrollY > 60) nav.classList.add("is-scrolled");
        else nav.classList.remove("is-scrolled");
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    var burger = $("[data-nav-burger]");
    var mobile = $("[data-nav-mobile]");
    if (burger && mobile) {
      burger.addEventListener("click", function () {
        var open = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!open));
        mobile.setAttribute("aria-hidden", String(open));
      });
      $$("a", mobile).forEach(function (a) {
        a.addEventListener("click", function () {
          burger.setAttribute("aria-expanded", "false");
          mobile.setAttribute("aria-hidden", "true");
        });
      });
    }
  }

  function initChapterRail() {
    var links = $$(".chapter-rail a");
    if (!links.length) return;
    var sections = links.map(function (d) { return document.querySelector(d.getAttribute("href")); }).filter(Boolean);
    var foregrounds = sections.map(function (s) { return s ? $("[data-foreground]", s) : null; });
    function update() {
      var y = window.scrollY + window.innerHeight * 0.4;
      var active = 0;
      sections.forEach(function (s, i) { if (s.offsetTop <= y) active = i; });
      links.forEach(function (d, i) { d.classList.toggle("is-active", i === active); });
      foregrounds.forEach(function (f, i) { if (f) f.classList.toggle("is-active", i === active); });
      if (window.__vesperAtmosphere) window.__vesperAtmosphere.setMode(active);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* =============================================================
     Hero background video — autoplay is intrusive motion, so it is
     paused (frozen on a calm frame) under prefers-reduced-motion.
     ============================================================= */
  function initHeroVideo() {
    var video = $("[data-hero-video]");
    if (!video) return;
    if (window.innerWidth < 720) return; // save mobile data — hidden by CSS, never fetched

    video.load();
    if (reduced) {
      video.removeAttribute("loop");
      var freeze = function () { try { video.currentTime = 2; } catch (e) {} video.pause(); };
      video.addEventListener("loadeddata", freeze, { once: true });
    } else {
      var play = function () { video.play().catch(function () {}); };
      video.addEventListener("loadeddata", play, { once: true });
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") play();
      });
    }
  }

  /* =============================================================
     Custom cursor — fine pointer only
     ============================================================= */
  function initCursor() {
    var root = $("[data-cursor-root]");
    if (!root || !fineHover) return;
    document.documentElement.classList.add("has-cursor");
    var ring = $(".cursor-ring", root);
    var dot = $(".cursor-dot", root);
    var tx = 0, ty = 0, rx = 0, ry = 0, firstMove = false;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
      if (!firstMove) {
        firstMove = true; rx = tx; ry = ty;
        if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
        root.classList.add("is-ready");
      }
    }, { passive: true });

    function tick() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    var HOVERABLES = "a, button, [data-cursor]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(HOVERABLES)) root.classList.add("is-interactive");
    });
    document.addEventListener("mouseout", function (e) {
      var t = e.target.closest && e.target.closest(HOVERABLES);
      if (t && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOVERABLES))) {
        root.classList.remove("is-interactive");
      }
    });
  }

  /* =============================================================
     Atmosphere — light rain at the gate, drifting embers on approach.
     Intrusive particle systems: fully skipped under reduced-motion.
     ============================================================= */
  function initAtmosphere() {
    if (reduced) return;
    var canvas = document.createElement("canvas");
    canvas.className = "atmosphere";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var mode = "none";

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var RAIN_COUNT = window.innerWidth < 720 ? 60 : 130;
    var rain = [];
    for (var i = 0; i < RAIN_COUNT; i++) {
      rain.push({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        len: 10 + Math.random() * 16, speed: 5 + Math.random() * 4, a: 0.08 + Math.random() * 0.14
      });
    }
    var EMBER_COUNT = window.innerWidth < 720 ? 30 : 60;
    var embers = [];
    for (var j = 0; j < EMBER_COUNT; j++) {
      embers.push({
        x: Math.random() * window.innerWidth, y: window.innerHeight + Math.random() * 200,
        r: 0.6 + Math.random() * 1.6, vy: -0.25 - Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.25,
        a: 0.15 + Math.random() * 0.45, flicker: Math.random() * Math.PI * 2
      });
    }

    function setMode(chapter) {
      if (chapter === 0 || chapter === 1) mode = "rain";
      else if (chapter === 4) mode = "embers";
      else mode = "none";
    }
    window.__vesperAtmosphere = { setMode: setMode };

    function frame(t) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (mode === "rain") {
        ctx.strokeStyle = "rgba(147,174,196,0.5)";
        ctx.lineWidth = 1;
        rain.forEach(function (p) {
          ctx.globalAlpha = p.a;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + p.len);
          ctx.stroke();
          p.y += p.speed; p.x -= 0.6;
          if (p.y > window.innerHeight) { p.y = -p.len; p.x = Math.random() * window.innerWidth; }
        });
        ctx.globalAlpha = 1;
      } else if (mode === "embers") {
        embers.forEach(function (p) {
          var flick = 0.7 + 0.3 * Math.sin(t * 0.002 + p.flicker);
          ctx.globalAlpha = p.a * flick;
          ctx.fillStyle = "#d9a54a";
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          p.x += p.vx; p.y += p.vy;
          if (p.y < -20) { p.y = window.innerHeight + 20; p.x = Math.random() * window.innerWidth; }
        });
        ctx.globalAlpha = 1;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 76;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* =============================================================
     Reveals
     ============================================================= */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    els.forEach(function (el) { el.classList.add("reveal-armed"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* =============================================================
     Split text word reveal
     ============================================================= */
  function splitWords(el) {
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var wrap = function (text) {
      return text.split(/(\s+)/).map(function (w) {
        return /^\s+$/.test(w) ? w : '<span class="split-word" aria-hidden="true">' + escHTML(w) + '</span>';
      }).join("");
    };
    var html = Array.prototype.map.call(el.childNodes, function (node) {
      if (node.nodeType === 3) return wrap(node.textContent);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        return "<" + tag + ">" + wrap(node.textContent) + "</" + tag + ">";
      }
      return "";
    }).join("");
    el.innerHTML = html;
    return el.querySelectorAll(".split-word");
  }

  function initSplitText() {
    var targets = $$("[data-split]");
    if (!targets.length) return;
    targets.forEach(function (el) {
      var parts = splitWords(el);
      if (!window.gsap) return;
      gsap.set(parts, { y: 22, opacity: 0 });
      gsap.to(parts, {
        y: 0, opacity: 1, duration: 0.9, stagger: 0.035, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true }
      });
    });
  }

  /* =============================================================
     Magnetic buttons
     ============================================================= */
  function initMagnetic() {
    if (!fineHover) return;
    $$("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.dataset.magneticStrength || "0.3");
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
      el.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      function loop() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        inner.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
        raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* =============================================================
     Accordion (FAQ)
     ============================================================= */
  function bindAccordionItem(item) {
    if (item.dataset.accordionBound) return;
    item.dataset.accordionBound = "1";
    var btn = $(".accordion-q", item);
    var panel = $(".accordion-a", item);
    if (!btn || !panel) return;
    var sync = function () {
      var open = item.classList.contains("is-open");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      item.parentElement.querySelectorAll(".accordion-item").forEach(function (other) {
        if (other !== item) { other.classList.remove("is-open"); $(".accordion-a", other).style.maxHeight = "0px"; other.querySelector(".accordion-q").setAttribute("aria-expanded", "false"); }
      });
      item.classList.toggle("is-open", willOpen);
      sync();
    });
    sync();
  }
  function initAccordion() {
    $$("[data-accordion-item]").forEach(bindAccordionItem);
    window.addEventListener("resize", function () {
      $$(".accordion-item.is-open .accordion-a").forEach(function (p) { p.style.maxHeight = p.scrollHeight + "px"; });
    });
  }

  /* =============================================================
     Contact form (simulated submit)
     ============================================================= */
  function initContactForm() {
    var form = $("[data-contact-form]");
    var success = $("[data-contact-success]");
    if (!form || !success) return;
    var submitBtn = form.querySelector('[type="submit"]');
    var msg = $("[data-contact-success-msg]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      if (!form.reportValidity()) return;

      form.classList.add("is-sending");
      if (submitBtn) submitBtn.disabled = true;

      setTimeout(function () {
        var firstName = (form.elements.name.value || "").trim().split(/\s+/)[0] || "Viajero";
        if (msg) msg.textContent = firstName + ", hemos anotado tu plaza. Te escribimos en cuanto se abra la puerta.";
        form.classList.remove("is-sending");
        form.classList.add("is-sent");
        success.setAttribute("aria-hidden", "false");
        success.classList.add("is-visible");
      }, 850);
    });
  }

  /* =============================================================
     Three.js — persistent night-flight scene
     ============================================================= */
  function initScene() {
    if (!window.THREE) return;
    var canvas = $("[data-canvas]");
    if (!canvas) return;

    var isMobile = window.innerWidth < 720;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x06070a, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06070a, 0.028);

    var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, 2, 15);

    var ambient = new THREE.AmbientLight(0x1a2436, 0.55);
    scene.add(ambient);
    var key = new THREE.DirectionalLight(0x8fb3ff, 0.85);
    key.position.set(10, 20, 6);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x3a4a6b, 0.3);
    rim.position.set(-12, 4, -10);
    scene.add(rim);

    /* ---- canvas textures ---- */
    function makeGlowTexture(hex1, hex2) {
      var c = document.createElement("canvas"); c.width = c.height = 256;
      var ctx = c.getContext("2d");
      var g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, hex1); g.addColorStop(0.4, hex2); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    }
    function makeStarTexture() {
      var c = document.createElement("canvas"); c.width = c.height = 32;
      var ctx = c.getContext("2d");
      var g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.4, "rgba(255,255,255,0.6)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(c);
    }
    function makeCloudTexture() {
      var c = document.createElement("canvas"); c.width = c.height = 256;
      var ctx = c.getContext("2d");
      for (var i = 0; i < 7; i++) {
        var x = 60 + Math.random() * 136, y = 90 + Math.random() * 90, r = 46 + Math.random() * 60;
        var g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, "rgba(255,255,255,0.55)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      return new THREE.CanvasTexture(c);
    }
    /* ---- starfield ---- */
    var starCount = isMobile ? 380 : 900;
    var starGeo = new THREE.BufferGeometry();
    var starPos = new Float32Array(starCount * 3);
    for (var i = 0; i < starCount; i++) {
      var radius = 60 + Math.random() * 140;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(1 - Math.random() * 1.1);
      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) * 0.6 + 4;
      starPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 30;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    var starMat = new THREE.PointsMaterial({
      map: makeStarTexture(), size: 1.7, sizeAttenuation: true,
      transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff
    });
    var stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ---- the vermilion moon (Vesper's signature, stays warm throughout) ---- */
    var glowTex = makeGlowTexture("rgba(255,240,225,1)", "rgba(197,48,30,0.55)");
    var moonMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xce4a29, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    var moon = new THREE.Sprite(moonMat);
    moon.position.set(26, 24, -70);
    moon.scale.set(34, 34, 1);
    scene.add(moon);
    var moonCoreMat = new THREE.SpriteMaterial({ map: makeStarTexture(), color: 0xf2ece0, transparent: true, depthWrite: false, opacity: 0.9 });
    var moonCore = new THREE.Sprite(moonCoreMat);
    moonCore.position.copy(moon.position);
    moonCore.scale.set(9, 9, 1);
    scene.add(moonCore);

    /* ---- clouds ---- */
    var cloudTex = makeCloudTexture();
    var cloudGroup = new THREE.Group();
    var cloudCount = isMobile ? 7 : 12;
    for (var c = 0; c < cloudCount; c++) {
      var cm = new THREE.SpriteMaterial({ map: cloudTex, color: 0xdfe6f2, transparent: true, opacity: 0.5, depthWrite: false });
      var spr = new THREE.Sprite(cm);
      var scale = 14 + Math.random() * 20;
      spr.scale.set(scale, scale * 0.55, 1);
      spr.position.set((Math.random() - 0.5) * 70, -6 - Math.random() * 10, -10 - Math.random() * 60);
      spr.userData.variance = 0.5 + Math.random() * 0.6;
      spr.userData.driftSpeed = (0.15 + Math.random() * 0.25) * (Math.random() < 0.5 ? -1 : 1);
      cloudGroup.add(spr);
    }
    scene.add(cloudGroup);

    /* ---- city lights (descent) ---- */
    var cityCount = isMobile ? 90 : 180;
    var cityGeo = new THREE.BufferGeometry();
    var cityPos = new Float32Array(cityCount * 3);
    for (var j = 0; j < cityCount; j++) {
      cityPos[j * 3] = (Math.random() - 0.5) * 90;
      cityPos[j * 3 + 1] = -16 - Math.random() * 3;
      cityPos[j * 3 + 2] = -20 - Math.random() * 70;
    }
    cityGeo.setAttribute("position", new THREE.BufferAttribute(cityPos, 3));
    var cityMat = new THREE.PointsMaterial({
      map: makeStarTexture(), size: 1.3, sizeAttenuation: true,
      transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xf2b46a
    });
    var cityLights = new THREE.Points(cityGeo, cityMat);
    scene.add(cityLights);

    scene.add(camera);

    /* ---- scroll-driven keyframes ---- */
    var frames = [
      { p: 0.00, pos: [0, 2, 15], fov: 55, fog: 0.026, lc: 0x8fb3ff, li: 0.85, star: 1.0, cloud: 0.12, moon: 0xce4a29, city: 0.0 },
      { p: 0.15, pos: [2.2, 1.6, 12.5], fov: 52, fog: 0.03, lc: 0xdba468, li: 1.05, star: 0.85, cloud: 0.22, moon: 0xd3552f, city: 0.12 },
      { p: 0.32, pos: [-1.4, 3.6, 9.5], fov: 59, fog: 0.06, lc: 0xb9c8e0, li: 1.0, star: 0.35, cloud: 0.85, moon: 0xd86a3c, city: 0.0 },
      { p: 0.50, pos: [1.8, 4.8, 10.5], fov: 49, fog: 0.016, lc: 0xe58a4a, li: 1.35, star: 0.12, cloud: 0.5, moon: 0xe0672f, city: 0.0 },
      { p: 0.68, pos: [-1.6, 4.0, 11.5], fov: 47, fog: 0.02, lc: 0xd9a54a, li: 0.95, star: 0.18, cloud: 0.4, moon: 0xd35430, city: 0.0 },
      { p: 0.85, pos: [0.6, 1.9, 8.5], fov: 54, fog: 0.042, lc: 0x7f9fc9, li: 0.8, star: 0.85, cloud: 0.28, moon: 0xc73e22, city: 0.95 },
      { p: 1.00, pos: [0, 1.3, 13], fov: 55, fog: 0.03, lc: 0x7f9fc9, li: 0.6, star: 0.92, cloud: 0.14, moon: 0xc5301e, city: 0.55 }
    ];
    var tmpColorA = new THREE.Color(), tmpColorB = new THREE.Color();
    function lerpNum(a, b, t) { return a + (b - a) * t; }
    function computeFrame(progress) {
      progress = Math.max(0, Math.min(1, progress));
      var a = frames[0], b = frames[frames.length - 1];
      for (var k = 0; k < frames.length - 1; k++) {
        if (progress >= frames[k].p && progress <= frames[k + 1].p) { a = frames[k]; b = frames[k + 1]; break; }
      }
      var span = (b.p - a.p) || 1;
      var t = (progress - a.p) / span;
      tmpColorA.setHex(a.lc); tmpColorB.setHex(b.lc);
      var lightColor = tmpColorA.clone().lerp(tmpColorB, t);
      tmpColorA.setHex(a.moon); tmpColorB.setHex(b.moon);
      var moonColor = tmpColorA.clone().lerp(tmpColorB, t);
      return {
        pos: [lerpNum(a.pos[0], b.pos[0], t), lerpNum(a.pos[1], b.pos[1], t), lerpNum(a.pos[2], b.pos[2], t)],
        fov: lerpNum(a.fov, b.fov, t),
        fog: lerpNum(a.fog, b.fog, t),
        lightColor: lightColor, lightIntensity: lerpNum(a.li, b.li, t),
        star: lerpNum(a.star, b.star, t), cloud: lerpNum(a.cloud, b.cloud, t),
        moonColor: moonColor, city: lerpNum(a.city, b.city, t)
      };
    }

    var target = computeFrame(0);
    var current = {
      pos: target.pos.slice(), fov: target.fov, fog: target.fog,
      lightColor: target.lightColor.clone(), lightIntensity: target.lightIntensity,
      star: target.star, cloud: target.cloud, moonColor: target.moonColor.clone(), city: target.city
    };

    function updateScrollProgress() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var progress = max > 0 ? window.scrollY / max : 0;
      target = computeFrame(progress);
    }
    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    /* ---- render loop ---- */
    var lerpFactor = reduced ? 1 : 0.06;
    function animate() {
      current.pos[0] = lerpNum(current.pos[0], target.pos[0], lerpFactor);
      current.pos[1] = lerpNum(current.pos[1], target.pos[1], lerpFactor);
      current.pos[2] = lerpNum(current.pos[2], target.pos[2], lerpFactor);
      current.fov = lerpNum(current.fov, target.fov, lerpFactor);
      current.fog = lerpNum(current.fog, target.fog, lerpFactor);
      current.lightIntensity = lerpNum(current.lightIntensity, target.lightIntensity, lerpFactor);
      current.star = lerpNum(current.star, target.star, lerpFactor);
      current.cloud = lerpNum(current.cloud, target.cloud, lerpFactor);
      current.city = lerpNum(current.city, target.city, lerpFactor);
      current.lightColor.lerp(target.lightColor, lerpFactor);
      current.moonColor.lerp(target.moonColor, lerpFactor);

      camera.position.set(current.pos[0], current.pos[1], current.pos[2]);
      camera.lookAt(current.pos[0] * -0.25, 1.5, -30);
      if (camera.fov !== current.fov) { camera.fov = current.fov; camera.updateProjectionMatrix(); }

      scene.fog.density = current.fog;
      key.color.copy(current.lightColor);
      key.intensity = current.lightIntensity;
      starMat.opacity = current.star;
      moonMat.color.copy(current.moonColor);
      cityMat.opacity = current.city;

      cloudGroup.children.forEach(function (spr) {
        spr.material.opacity = current.cloud * spr.userData.variance;
        if (!reduced) spr.position.x += spr.userData.driftSpeed * 0.01;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    function applySize() {
      var w = window.innerWidth, h = window.innerHeight;
      if (!w || !h) return; // ignore transient 0-size reads (backgrounded tab, etc.)
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    var resizeTo;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTo);
      resizeTo = setTimeout(applySize, 120);
    });
    // Safety re-check: a page that boots while backgrounded/prerendered can
    // read a transient 0×0 layout on first paint with no later resize event.
    setTimeout(applySize, 300);
    setTimeout(applySize, 1500);
  }

  /* =============================================================
     Boot
     ============================================================= */
  function boot() {
    safe(mountRoutes, "mountRoutes");
    safe(mountTestimonials, "mountTestimonials");
    safe(mountFaqs, "mountFaqs");
    safe(mountContact, "mountContact");

    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initHeroVideo, "initHeroVideo");
    safe(initCursor, "initCursor");
    safe(initAtmosphere, "initAtmosphere");
    safe(initChapterRail, "initChapterRail");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initMagnetic, "initMagnetic");
    safe(initAccordion, "initAccordion");
    safe(initContactForm, "initContactForm");
    safe(initScene, "initScene");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (e) {}
      safe(initSplitText, "initSplitText");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
