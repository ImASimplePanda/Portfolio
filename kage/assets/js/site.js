/* Kage — page choreography.
 *
 * Drives one continuous camera from scroll, reveals headings word by word,
 * keeps the navigation, chapter rail and foreground cutout layers in step with
 * the active section, and provides the cinema hold behind each play control.
 */

import { createWorld } from './scene.js';

const root = document.documentElement;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (t) => t * t * (3 - 2 * t);

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
let reduced = motionQuery.matches;

/* --------------------------------------------------------------- sections */

const sections = [...document.querySelectorAll('[data-shot]')].map((el) => ({
  el,
  key: el.dataset.key,
  shot: Number(el.dataset.shot),
  inner: el.querySelector('.chapter__inner'),
  top: 0,
  height: 1,
}));

const fgSets = new Map(
  [...document.querySelectorAll('.fg-set')].map((el) => [el.dataset.for, el]),
);
const navLinks = new Map(
  [...document.querySelectorAll('.nav__link')].map((a) => [a.hash.slice(1), a]),
);
const railItems = new Map(
  [...document.querySelectorAll('.rail__item')].map((a) => [a.dataset.rail, a]),
);

function measure() {
  for (const s of sections) {
    const box = s.el.getBoundingClientRect();
    s.top = box.top + window.scrollY;
    s.height = Math.max(1, box.height);
  }
}

/* ------------------------------------------------------- heading reveals */

function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((word, i) => {
    const outer = document.createElement('span');
    outer.className = 'word';
    outer.style.setProperty('--i', String(i));
    const inner = document.createElement('span');
    inner.textContent = word;
    outer.appendChild(inner);
    el.appendChild(outer);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
}

document.querySelectorAll('[data-split]').forEach(splitWords);

const revealTargets = [
  ...document.querySelectorAll('[data-split], [data-reveal]'),
];

if (reduced || !('IntersectionObserver' in window)) {
  revealTargets.forEach((el) => el.classList.add('is-in'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.14 },
  );
  revealTargets.forEach((el) => observer.observe(el));
}

/* ------------------------------------------------------------- the world */

let world = null;
try {
  world = createWorld({
    canvas: document.getElementById('world'),
    quality: window.innerWidth < 760 || navigator.hardwareConcurrency <= 4 ? 'low' : 'high',
    reducedMotion: reduced,
  });
  world.setSize(window.innerWidth, window.innerHeight);
  world.post.uFade.value = 0;
} catch (err) {
  root.classList.add('no-webgl');
  console.warn('Kage: WebGL no disponible; se muestra la noche estática.', err);
}

/* -------------------------------------------------------- scroll → camera */

/* Hold near the composed shot for most of a section, then hand off quickly. */
const handoff = (u) => smooth(clamp((u - 0.52) / 0.48, 0, 1));

let activeKey = null;
let targetShot = 0;
let veils = [];

function setActive(key) {
  if (key === activeKey) return;
  activeKey = key;
  for (const [name, el] of fgSets) el.dataset.active = String(name === key);
  for (const [name, el] of navLinks) {
    if (name === key) el.setAttribute('aria-current', 'true');
    else el.removeAttribute('aria-current');
  }
  for (const [name, el] of railItems) {
    if (name === key) el.setAttribute('aria-current', 'true');
    else el.removeAttribute('aria-current');
  }
}

function onScroll() {
  const vh = window.innerHeight;
  const head = window.scrollY + vh * 0.5;

  let index = 0;
  let local = 0;
  for (let i = 0; i < sections.length; i += 1) {
    const s = sections[i];
    if (head >= s.top || i === 0) {
      index = i;
      local = clamp((head - s.top) / s.height, 0, 1);
    }
  }

  targetShot = clamp(index + handoff(local), 0, sections.length - 1);
  setActive(sections[index].key);

  // fade and blur each section out as its shot hands over to the next
  veils = sections.map((s) => {
    if (!s.inner) return null;
    const start = s.top - vh * 0.5;
    const u = clamp((window.scrollY - start) / s.height, 0, 1);
    const exit = clamp((u - 0.76) / 0.24, 0, 1);
    const enter = 1 - clamp(u / 0.1, 0, 1);
    return { inner: s.inner, value: Math.max(exit, enter) };
  });
  for (const v of veils) {
    if (v) v.inner.style.setProperty('--veil', v.value.toFixed(3));
  }
}

/* ------------------------------------------------------------- parallax */

const parallaxImages = [...document.querySelectorAll('[data-parallax]')];
const fgImages = [...document.querySelectorAll('.fg')];

function applyParallax() {
  if (reduced) return;
  const vh = window.innerHeight;
  for (const img of parallaxImages) {
    const box = img.getBoundingClientRect();
    if (box.bottom < -200 || box.top > vh + 200) continue;
    const centre = (box.top + box.height / 2) / vh - 0.5;
    img.style.setProperty('--shift', `${(-centre * 26).toFixed(2)}px`);
  }
}

/* --------------------------------------------------------------- pointer */

let pointerX = 0;
let pointerY = 0;
let cursorX = 0;
let cursorY = 0;
let ringX = 0;
let ringY = 0;

const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');

if (finePointer.matches && !reduced) {
  const hot = 'a, button, [data-parallax]';
  window.addEventListener('pointermove', (e) => {
    // only claim the cursor once the pointer has actually moved, so the dot
    // never sits parked in the top-left corner of a fresh page
    if (!root.classList.contains('has-cursor')) {
      cursorX = ringX = e.clientX;
      cursorY = ringY = e.clientY;
      root.classList.add('has-cursor');
    }
    cursorX = e.clientX;
    cursorY = e.clientY;
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    ring.classList.toggle('is-hot', Boolean(e.target.closest?.(hot)));
  }, { passive: true });
}

/* ---------------------------------------------------------- cinema holds */

const cinemaNote = document.getElementById('cinema-note');
let cinema = null;

function enterCinema(shot) {
  cinema = { shot, start: performance.now(), from: shot, to: shot + (reduced ? 0 : 0.34) };
  root.classList.add('is-cinema');
  cinemaNote.setAttribute('aria-hidden', 'false');
}

function exitCinema() {
  if (!cinema) return;
  cinema = null;
  root.classList.remove('is-cinema');
  cinemaNote.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-play]').forEach((button) => {
  button.addEventListener('click', () => {
    const shot = Number(button.dataset.play);
    const section = sections.find((s) => s.shot === shot);
    if (section) {
      const y = section.top + section.height * 0.3 - window.innerHeight * 0.5;
      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    }
    // let the smooth scroll settle before the text steps out of the way
    window.setTimeout(() => enterCinema(shot), reduced ? 0 : 620);
  });
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    exitCinema();
    closeNav();
  }
});
window.addEventListener('wheel', exitCinema, { passive: true });
window.addEventListener('touchmove', exitCinema, { passive: true });
window.addEventListener('pointerdown', (e) => {
  if (cinema && !e.target.closest('[data-play]')) exitCinema();
});

/* ------------------------------------------------------------ mobile nav */

const navToggle = document.getElementById('nav-toggle');
const navPanel = document.getElementById('nav-panel');

function closeNav() {
  navPanel.dataset.open = 'false';
  navToggle.setAttribute('aria-expanded', 'false');
}

navToggle.addEventListener('click', () => {
  const open = navPanel.dataset.open === 'true';
  navPanel.dataset.open = String(!open);
  navToggle.setAttribute('aria-expanded', String(!open));
  if (!open) navPanel.querySelector('.nav__link')?.focus();
});

document.querySelector('[data-nav-close]')?.addEventListener('click', () => {
  closeNav();
  navToggle.focus();
});

navPanel.querySelectorAll('.nav__link').forEach((link) => {
  link.addEventListener('click', closeNav);
});

/* ------------------------------------------------------------- the frame */

let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

function resize() {
  // ignore the address-bar height wobble on mobile, which would thrash the RTs
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w === lastWidth && Math.abs(h - lastHeight) < 90) {
    measure();
    onScroll();
    return;
  }
  lastWidth = w;
  lastHeight = h;
  if (world) world.setSize(w, h);
  measure();
  onScroll();
}

function frame(now) {
  requestAnimationFrame(frame);
  if (!world) return;

  let shot = targetShot;
  if (cinema) {
    const t = clamp((now - cinema.start) / 9000, 0, 1);
    shot = cinema.from + (cinema.to - cinema.from) * smooth(t);
    if (t >= 1) exitCinema();
  }
  world.setProgress(shot);
  world.setPointer(pointerX, pointerY);
  world.render();

  // the fade-in on first paint
  const fade = world.post.uFade;
  if (fade.value < 1) fade.value = Math.min(1, fade.value + 0.012);

  if (root.classList.contains('has-cursor')) {
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    ringX += (cursorX - ringX) * 0.16;
    ringY += (cursorY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;
  }

  // foreground layers drift a little against the pointer, by depth
  if (!reduced) {
    for (const img of fgImages) {
      const depth = Number(img.dataset.depth) || 1;
      img.style.transform = `${img.classList.contains('fg--flip') ? 'scaleX(-1) ' : ''}translate3d(${(-pointerX * depth * 9).toFixed(2)}px, ${(pointerY * depth * 3).toFixed(2)}px, 0)`;
    }
  }
}

/* ------------------------------------------------------------------ boot */

measure();
onScroll();
applyParallax();
if (world) world.jumpTo(targetShot);

let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    onScroll();
    applyParallax();
  });
}, { passive: true });

window.addEventListener('resize', resize, { passive: true });
window.addEventListener('load', () => {
  measure();
  onScroll();
});

motionQuery.addEventListener('change', (e) => {
  reduced = e.matches;
  if (world) world.setReducedMotion(reduced);
  if (reduced) {
    root.classList.remove('has-cursor');
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }
});

requestAnimationFrame(frame);
