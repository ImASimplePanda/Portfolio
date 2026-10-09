/* Hondura — la página es una inmersión. Un solo bucle por fotograma gobierna
   la profundidad, el ordenador de buceo, las capas de agua y los tramos. */
(function () {
  "use strict";

  var d = document, h = d.documentElement, W = window;
  h.classList.add("js");
  var RM = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = W.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var A = W.anime && W.anime.animate ? W.anime : null;
  if (!RM) h.classList.add("js-motion");
  if (!A) h.classList.add("sin-anime");

  function safe(fn, n) { try { fn(); } catch (e) { if (W.console) console.warn("[hondura] " + n, e); } }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sstep(a, b, v) { var x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  var main = $("#main");
  var esInicio = d.body.classList.contains("inicio");
  var lenis = null, agua = null, vh = W.innerHeight, scrollY = W.scrollY;
  var raton = { x: W.innerWidth / 2, y: W.innerHeight * 0.45, tx: W.innerWidth / 2, ty: W.innerHeight * 0.45 };
  var tareas = [];  // funciones que corren en el bucle

  /* ---------- Scroll suave (solo escritorio con ratón y sin movimiento reducido) ---------- */
  function initLenis() {
    if (RM || !FINE || !W.Lenis) return;
    lenis = new W.Lenis({ autoRaf: false, lerp: 0.11, wheelMultiplier: 0.9, anchors: { offset: -72 } });
  }

  /* ---------- Navegación ---------- */
  function initNav() {
    var nav = $("#nav"), btn = $(".nav__toggle"), menu = $("#menu");
    if (!nav) return;
    var solida = null;
    tareas.push(function () {
      var s = !esInicio || scrollY > 40;
      if (s !== solida) { nav.classList.toggle("solida", s); solida = s; }
    });
    if (!btn || !menu) return;
    function set(open) {
      btn.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("abierto", open);
      btn.querySelector(".sr").textContent = open ? btn.dataset.cerrar : btn.dataset.abrir;
    }
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    d.addEventListener("keydown", function (e) { if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { set(false); btn.focus(); } });
    d.addEventListener("click", function (e) { if (!nav.contains(e.target)) set(false); });
  }

  /* ---------- Profundidad ---------- */
  var tramosD = [], prof = 0, profPint = -1;
  function medir() {
    vh = W.innerHeight;
    var y0 = W.scrollY;
    tramosD = $$("[data-d0]", main).map(function (el) {
      var r = el.getBoundingClientRect();
      return { el: el, top: r.top + y0, h: r.height, d0: +el.dataset.d0, d1: +el.dataset.d1, sticky: el.classList.contains("tramo") };
    });
  }
  function profundidadEn(y) {
    var probe = y + vh * 0.5, n = tramosD.length;
    if (!n) return 0;
    if (probe < tramosD[0].top) return tramosD[0].d0;
    for (var i = 0; i < n; i++) {
      var t = tramosD[i];
      if (probe <= t.top + t.h) {
        var p = t.sticky ? clamp((y - t.top) / Math.max(1, t.h - vh), 0, 1) : clamp((probe - t.top) / t.h, 0, 1);
        var e = t.sticky ? sstep(0.18, 0.82, p) : p;
        return t.d0 + (t.d1 - t.d0) * e;
      }
    }
    return tramosD[n - 1].d1;
  }

  function initProfundidad() {
    if (!esInicio) return;
    medir();
    var capas = $$(".agua__capa").slice(1), stops = [0, 8, 20, 30, 40], capaOp = [-1, -1, -1, -1];
    var linterna = $("#linterna"), linOp = -1, linX = -1, linY = -1;
    var hudProf = $("#hudProf"), hudBar = $("#hudBar"), hudTemp = $("#hudTemp"), hudZona = $("#hudZona"), hudMarca = $("#hudMarca");
    var escala = $(".hud__escala"), escalaH = escala ? escala.clientHeight : 0;
    var zonas = hudZona ? JSON.parse(hudZona.dataset.zonas) : [], zonaAct = -1;
    var txt = { p: "", b: "", t: "" }, marcaY = -1;
    W.addEventListener("resize", function () { if (escala) escalaH = escala.clientHeight; }, { passive: true });

    tareas.push(function () {
      var objetivo = profundidadEn(scrollY);
      prof += (objetivo - prof) * (RM ? 1 : 0.14);
      if (Math.abs(objetivo - prof) < 0.005) prof = objetivo;
      var dd = prof;
      if (agua) { agua.setDepth(dd); agua.setScroll(scrollY); }

      // capas de color: cada una cubre a la anterior (solo opacidad)
      for (var i = 0; i < capas.length; i++) {
        var o = clamp((dd - stops[i]) / (stops[i + 1] - stops[i]), 0, 1);
        if (Math.abs(o - capaOp[i]) > 0.003) { capas[i].style.opacity = o.toFixed(3); capaOp[i] = o; }
      }
      // linterna: aparece en el fondo y sigue al cursor
      if (linterna) {
        var lo = sstep(27, 35, dd);
        if (Math.abs(lo - linOp) > 0.003) { linterna.style.opacity = lo.toFixed(3); linOp = lo; }
        if (lo > 0) {
          if (!RM) { raton.x += (raton.tx - raton.x) * 0.12; raton.y += (raton.ty - raton.y) * 0.12; }
          else { raton.x = raton.tx; raton.y = raton.ty; }
          var rx = Math.round(raton.x), ry = Math.round(raton.y);
          if (rx !== linX || ry !== linY) { linterna.style.transform = "translate3d(" + rx + "px," + ry + "px,0)"; linX = rx; linY = ry; }
        }
      }
      // ordenador de buceo
      if (dd === profPint) return;
      profPint = dd;
      var p = dd.toFixed(1), b = (1 + dd / 10).toFixed(1), te = (23.4 - dd * 0.085).toFixed(1);
      if (hudProf && p !== txt.p) { hudProf.textContent = p; txt.p = p; }
      if (hudBar && b !== txt.b) { hudBar.textContent = b; txt.b = b; }
      if (hudTemp && te !== txt.t) { hudTemp.textContent = te; txt.t = te; }
      if (hudMarca && escalaH) {
        var my = Math.round((dd / 40) * escalaH);
        if (my !== marcaY) { hudMarca.style.transform = "translateY(" + (my - 4) + "px) rotate(45deg)"; marcaY = my; }
      }
      var z = dd < 3 ? 0 : dd < 15 ? 1 : dd < 22 ? 2 : dd < 31 ? 3 : 4;
      if (hudZona && z !== zonaAct) { hudZona.textContent = zonas[z] || ""; zonaAct = z; }
    });

    if (FINE) {
      W.addEventListener("pointermove", function (e) { raton.tx = e.clientX; raton.ty = e.clientY; }, { passive: true });
    }
  }

  /* ---------- Superficie: la foto se aleja al sumergirse ---------- */
  function initHero() {
    var hero = $(".hero"), foto = $(".hero__foto img"), txtEl = $(".hero__txt");
    if (!hero || !foto || RM) return;
    var ult = -1;
    tareas.push(function () {
      var hh = hero.offsetHeight || vh;
      if (scrollY > hh * 1.1 && ult >= 1) return;
      var p = clamp(scrollY / hh, 0, 1);
      if (p === ult) return;
      ult = p;
      foto.style.transform = "translate3d(0," + (p * 14).toFixed(2) + "%,0) scale(" + (1 + p * 0.08).toFixed(4) + ")";
      foto.style.opacity = (1 - sstep(0.35, 1, p)).toFixed(3);
      txtEl.style.transform = "translate3d(0," + (-p * 80).toFixed(1) + "px,0)";
      txtEl.style.opacity = (1 - sstep(0.15, 0.7, p)).toFixed(3);
    });
  }

  /* ---------- Tramos: aparecer · quedarse · irse ---------- */
  function initTramos() {
    var tr = $$(".tramo").map(function (el) {
      return { el: el, v: $(".tramo__ventana", el), img: $(".tramo__img", el), txt: $(".tramo__txt", el), last: -1 };
    });
    if (!tr.length) return;
    tareas.push(function () {
      for (var i = 0; i < tr.length; i++) {
        var t = tr[i], top = t.el.offsetTop, hgt = t.el.offsetHeight;
        if (scrollY + vh < top - 50 || scrollY > top + hgt + 50) {
          if (t.last !== -2) { if (t.v) t.v.style.opacity = "0"; if (t.txt) t.txt.style.opacity = "0"; t.last = -2; }
          continue;
        }
        var p = clamp((scrollY - top + vh * 0.6) / (hgt - vh * 0.4), 0, 1);
        if (Math.abs(p - t.last) < 0.0005) continue;
        t.last = p;
        var aV = Math.min(sstep(0.02, 0.24, p), 1 - sstep(0.78, 0.97, p));
        var aT = Math.min(sstep(0.16, 0.34, p), 1 - sstep(0.7, 0.88, p));
        if (t.v) {
          t.v.style.opacity = aV.toFixed(3);
          if (!RM) t.v.style.transform = "scale(" + (1.06 - 0.06 * sstep(0, 0.5, p) + 0.03 * sstep(0.75, 1, p)).toFixed(4) + ")";
          if (t.img && !RM) t.img.style.transform = "translate3d(0," + ((0.5 - p) * 6).toFixed(2) + "%,0) scale(1.08)";
        }
        if (t.txt) {
          t.txt.style.opacity = aT.toFixed(3);
          if (!RM) t.txt.style.transform = "translate3d(0," + ((1 - sstep(0.16, 0.34, p)) * 16 - sstep(0.7, 0.88, p) * 12).toFixed(1) + "px,0)";
        }
      }
    });
  }

  /* ---------- Revelado al entrar (anime.js, escalonado por lotes) ---------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length || RM || !("IntersectionObserver" in W)) { els.forEach(function (e) { e.classList.add("dentro"); }); return; }
    var empezados = new WeakSet(), cola = [], prog = false;
    function lanzar() {
      prog = false;
      var lote = cola.splice(0);
      if (!lote.length) return;
      lote.forEach(function (e) { empezados.add(e); });
      if (A) {
        A.animate(lote, {
          opacity: [0, 1], translateY: [16, 0], duration: 850, ease: "outQuart",
          delay: A.stagger(70),
          onComplete: function () { lote.forEach(function (e) { e.classList.add("dentro"); }); }
        });
      } else {
        lote.forEach(function (e, i) { setTimeout(function () { e.classList.add("dentro"); }, i * 70); });
      }
      lote.forEach(function (e) { safe(function () { contar(e); }, "contar"); });
    }
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        cola.push(e.target);
      });
      if (cola.length && !prog) { prog = true; requestAnimationFrame(lanzar); }
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.02 });
    els.forEach(function (e) { obs.observe(e); });
    // red de seguridad: si algo falla, el contenido aparece igual
    setTimeout(function () {
      els.forEach(function (e) {
        if (!empezados.has(e) && e.getBoundingClientRect().top < vh) { obs.unobserve(e); e.classList.add("dentro"); }
      });
    }, 3000);
  }

  function contar(el) {
    var b = el.querySelector("[data-cuenta]");
    if (!b || !A) return;
    var fin = parseInt(b.dataset.cuenta, 10);
    if (!(fin > 1) || fin > 1000) return;
    var o = { v: 0 };
    A.animate(o, { v: fin, duration: 1300, ease: "outQuart", delay: 200, modifier: Math.round, onUpdate: function () { b.textContent = String(Math.round(o.v)); }, onComplete: function () { b.textContent = String(fin); } });
  }

  /* ---------- Mapa de puntos de buceo ---------- */
  function initMapa() {
    var pins = $$(".pin[data-punto]"), fichas = $$(".ficha"), cont = $(".fichas");
    if (!pins.length) return;
    cont.classList.add("js-fichas");
    var act = pins[0].dataset.punto;
    fichas.forEach(function (f) { f.hidden = f.dataset.ficha !== act; });
    function elegir(id, foco) {
      if (id === act) return;
      act = id;
      pins.forEach(function (p) { p.setAttribute("aria-pressed", String(p.dataset.punto === id)); });
      fichas.forEach(function (f) {
        var on = f.dataset.ficha === id;
        f.hidden = !on;
        if (on && A && !RM) A.animate(f, { opacity: [0, 1], translateX: [14, 0], duration: 420, ease: "outQuart" });
        if (on && A && !RM) A.animate(f.querySelector(".rango__fill"), { opacity: [0, 1], duration: 500, ease: "outQuart" });
      });
      if (foco) { var f = $("#ficha-" + id); if (f && W.innerWidth < 860) f.scrollIntoView({ block: "nearest", behavior: RM ? "auto" : "smooth" }); }
    }
    pins.forEach(function (p) {
      p.addEventListener("click", function () { elegir(p.dataset.punto, true); });
      if (FINE) p.addEventListener("pointerenter", function () { elegir(p.dataset.punto, false); });
    });

    // inclinación 3D muy leve siguiendo al cursor (unos grados, con retardo)
    var mapa = $(".mapa"), plano = $(".mapa__plano");
    if (!mapa || !plano || !FINE || RM) return;
    var rx = 26, rz = -6, trx = 26, trz = -6, dentro = false, pint = "";
    mapa.addEventListener("pointermove", function (e) {
      var r = mapa.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      trx = 26 - ny * 6; trz = -6 + nx * 5; dentro = true;
    }, { passive: true });
    mapa.addEventListener("pointerleave", function () { trx = 26; trz = -6; dentro = false; });
    tareas.push(function () {
      if (W.innerWidth < 861) return;
      rx += (trx - rx) * 0.08; rz += (trz - rz) * 0.08;
      var s = "rotateX(" + rx.toFixed(2) + "deg) rotateZ(" + rz.toFixed(2) + "deg)";
      if (s !== pint) { plano.style.transform = s; pint = s; }
    });
  }

  /* ---------- Formulario de reserva ---------- */
  function initForm() {
    var f = $("#form");
    if (!f) return;
    var M = JSON.parse(f.dataset.msg), btn = f.querySelector('[type="submit"]'), estado = $("#form-estado"), resumen = $("#form-resumen");
    f.setAttribute("novalidate", "");
    var fecha = $("#f-fecha"), manana = new Date(); manana.setDate(manana.getDate() + 1);
    var iso = function (x) { return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
    if (fecha) fecha.min = iso(manana);

    // "Reservar" en una experiencia la deja elegida
    $$("[data-exp]").forEach(function (a) {
      a.addEventListener("click", function () { var s = $("#f-exp"); if (s) { s.value = a.dataset.exp; validar(s.closest(".campo"), true); } });
    });

    var reglas = {
      exp: function (v) { return v ? "" : M.requerido; },
      fecha: function (v) { return !v ? M.requerido : v < iso(manana) ? M.fecha : ""; },
      personas: function (v) { var n = Number(v); return !v ? M.requerido : (n % 1 || n < 1 || n > 8) ? M.personas : ""; },
      nivel: function (v) { return v ? "" : M.requerido; },
      nombre: function (v) { return v.trim() ? "" : M.requerido; },
      email: function (v) { return !v.trim() ? M.requerido : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : M.email; },
      priv: function (v, el) { return el.checked ? "" : M.privacidad; }
    };
    var intentado = false;
    function validar(c, mostrar) {
      var id = c.dataset.campo, el = c.querySelector("input, select, textarea"), err = c.querySelector(".campo__err");
      var regla = reglas[id];
      var msg = regla ? regla(el.value || "", el) : "";
      if (mostrar) {
        if (msg) { el.setAttribute("aria-invalid", "true"); err.textContent = msg; err.hidden = false; }
        else { el.removeAttribute("aria-invalid"); err.textContent = ""; err.hidden = true; }
      }
      return msg ? { el: el, msg: msg, label: c.dataset.etiqueta || (c.querySelector("label").textContent || "").replace("*", "").trim() } : null;
    }
    var campos = $$("[data-campo]", f);
    campos.forEach(function (c) {
      var el = c.querySelector("input, select, textarea");
      el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "blur", function () { if (intentado) validar(c, true); });
      el.addEventListener("input", function () { if (intentado && el.getAttribute("aria-invalid")) validar(c, true); });
    });

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      intentado = true;
      var errores = campos.map(function (c) { return validar(c, true); }).filter(Boolean);
      var ul = resumen.querySelector("ul");
      ul.textContent = "";
      if (errores.length) {
        errores.forEach(function (er) {
          var li = d.createElement("li"), a = d.createElement("a");
          a.href = "#" + er.el.id; a.textContent = er.label + ": " + er.msg;
          a.addEventListener("click", function (ev) { ev.preventDefault(); er.el.focus(); });
          li.appendChild(a); ul.appendChild(li);
        });
        resumen.hidden = false;
        if (lenis) lenis.scrollTo(resumen, { offset: -110, immediate: RM });
        else resumen.scrollIntoView({ block: "center", behavior: RM ? "auto" : "smooth" });
        resumen.focus({ preventScroll: true });
        estado.textContent = ""; estado.className = "form__estado";
        return;
      }
      resumen.hidden = true;
      if ($("#f-honey").value) { estado.textContent = M.ok; estado.className = "form__estado ok"; f.reset(); return; }
      btn.disabled = true; btn.textContent = M.enviando;
      estado.textContent = ""; estado.className = "form__estado";
      var datos = {};
      new FormData(f).forEach(function (v, k) { datos[k] = v; });
      fetch(f.dataset.ajax, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(datos) })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (j) {
          if (j && (j.success === true || j.success === "true")) {
            estado.textContent = M.ok; estado.className = "form__estado ok";
            f.reset(); intentado = false; if (fecha) fecha.min = iso(manana);
          } else { throw new Error("formsubmit"); }
        })
        .catch(function () { estado.textContent = M.fallo; estado.className = "form__estado ko"; })
        .then(function () { btn.disabled = false; btn.textContent = M.enviar; });
    });
  }

  /* ---------- Agua WebGL: se carga tras la carga de la página ---------- */
  function initAgua() {
    var canvas = $("#aguaGL");
    if (!canvas || !main.dataset.gl) return;
    var con = navigator.connection;
    if (con && (con.saveData || /2g/.test(con.effectiveType || ""))) return;
    var movil = W.innerWidth < 760 || !FINE;
    function arrancar() {
      var s = d.createElement("script");
      s.src = main.dataset.gl; s.async = true;
      s.onload = function () {
        safe(function () {
          agua = W.HonduraAgua(canvas, { scale: movil ? 0.4 : 0.55, fps: movil ? 30 : 60, lite: movil, still: RM });
          if (agua) agua.setDepth(prof);
        }, "agua");
      };
      d.body.appendChild(s);
    }
    var ir = function () { (W.requestIdleCallback || function (f) { setTimeout(f, 300); })(arrancar, { timeout: 2000 }); };
    if (d.readyState === "complete") ir(); else W.addEventListener("load", ir, { once: true });
  }

  /* ---------- Bucle único ---------- */
  function bucle(t) {
    if (lenis) lenis.raf(t);
    scrollY = lenis ? lenis.scroll : W.scrollY;
    for (var i = 0; i < tareas.length; i++) tareas[i](t);
    if (agua) agua.render(t);
    requestAnimationFrame(bucle);
  }

  function iniciar() {
    safe(initLenis, "lenis");
    safe(initNav, "nav");
    safe(initProfundidad, "profundidad");
    safe(initHero, "hero");
    safe(initTramos, "tramos");
    safe(initReveals, "reveals");
    safe(initMapa, "mapa");
    safe(initForm, "form");
    safe(initAgua, "agua");
    var reMedir = function () { safe(medir, "medir"); };
    W.addEventListener("resize", reMedir, { passive: true });
    W.addEventListener("load", reMedir, { once: true });
    if ("ResizeObserver" in W && main) new ResizeObserver(reMedir).observe(main);
    requestAnimationFrame(bucle);
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
