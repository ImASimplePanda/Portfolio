/* Bookit: mejora progresiva. Todo funciona sin JS; esto lo hace inmediato. */

const base = document.body.dataset.base || '';
const csrf = document.body.dataset.csrf;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const vt = (fn) => (document.startViewTransition && !reduce.matches ? document.startViewTransition(fn) : (fn(), null));

/* ---------- Aviso flotante ---------- */
const toastEl = document.querySelector('[data-toast]');
let toastTimer;
function toast(msg, { error = false, link = null } = {}) {
  if (!toastEl) return;
  clearTimeout(toastTimer);
  toastEl.classList.toggle('toast--error', error);
  toastEl.innerHTML = '';
  const sw = document.createElement('span');
  sw.className = 'toast__swatch';
  const tx = document.createElement('span');
  tx.className = 'toast__text';
  tx.textContent = msg;
  toastEl.append(sw, tx);
  if (link) {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.label;
    toastEl.append(a);
  }
  toastEl.classList.add('is-open');
  const hide = () => { toastTimer = setTimeout(() => toastEl.classList.remove('is-open'), 3600); };
  hide();
  toastEl.onmouseenter = toastEl.onfocusin = () => clearTimeout(toastTimer);
  toastEl.onmouseleave = toastEl.onfocusout = hide;
}

/* ---------- Petición ---------- */
async function send(form, extra = {}) {
  const data = new FormData(form);
  for (const [k, v] of Object.entries(extra)) data.set(k, v);
  const res = await fetch(form.getAttribute('action'), {
    method: 'POST',
    body: data,
    headers: { Accept: 'application/json', 'X-Bookit': '1', 'X-CSRF': csrf },
    credentials: 'same-origin',
  });
  let json = {};
  try { json = await res.json(); } catch { json = { ok: false, error: 'Algo ha fallado. Recarga la página.' }; }
  return { status: res.status, ...json };
}

function setBag(count) {
  document.querySelectorAll('[data-bagcount]').forEach((el) => {
    el.hidden = count < 1;
    el.innerHTML = `<span class="visually-hidden">, </span>${count}<span class="visually-hidden"> libros</span>`;
    el.classList.remove('is-bump');
    void el.offsetWidth;
    if (!reduce.matches) el.classList.add('is-bump');
  });
}

/* El color del libro viaja hasta la cesta: dice dónde ha ido sin tener que leer el aviso */
function flyToBag(btn) {
  const bag = [...document.querySelectorAll('.tool--bag')].find((el) => el.offsetParent !== null);
  if (reduce.matches || !bag || !Element.prototype.animate) return Promise.resolve();
  const from = btn.getBoundingClientRect();
  const to = bag.querySelector('.icon').getBoundingClientRect();
  const src = btn.closest('[data-col], .card, .pre__item, .book, .rec')?.querySelector('.cover') || document.documentElement;
  const chip = document.createElement('span');
  chip.className = 'fly';
  chip.setAttribute('aria-hidden', 'true');
  chip.dataset.col = src.dataset.col || document.documentElement.dataset.col;
  const x0 = from.left + from.width / 2 - 8, y0 = from.top + from.height / 2 - 12;
  chip.style.left = `${x0}px`;
  chip.style.top = `${y0}px`;
  document.body.append(chip);
  const dx = to.left + to.width / 2 - 8 - x0, dy = to.top + to.height / 2 - 12 - y0;
  const anim = chip.animate([
    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 40}px) scale(0.9)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0.2 },
  ], { duration: 380, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
  return anim.finished.catch(() => {}).finally(() => chip.remove());
}

function loading(btn, on) {
  if (!btn) return;
  btn.classList.toggle('is-loading', on);
  btn.setAttribute('aria-busy', on ? 'true' : 'false');
}

/* ---------- Añadir a la cesta ---------- */
document.addEventListener('submit', async (ev) => {
  const form = ev.target;

  if (form.matches('[data-add]')) {
    ev.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn.classList.contains('is-loading')) return;
    const label = btn.querySelector('.btn__label');
    const original = label?.textContent;
    loading(btn, true);
    try {
      const r = await send(form);
      if (!r.ok) throw new Error(r.error);
      if (r.redirect) { location.href = r.redirect; return; }
      await flyToBag(btn);
      setBag(r.count);
      toast(r.msg, { link: { href: `${base}/cesta`, label: 'Ver cesta' } });
      if (label) {
        label.textContent = 'En la cesta';
        btn.classList.add('is-done');
        setTimeout(() => { label.textContent = original; btn.classList.remove('is-done'); }, 1800);
      }
    } catch (e) {
      toast(e.message && e.message !== 'Failed to fetch' ? e.message : 'Sin conexión. Inténtalo otra vez.', { error: true });
    } finally {
      loading(btn, false);
    }
  }

  /* ---------- Deseados ---------- */
  if (form.matches('[data-wish]')) {
    ev.preventDefault();
    const btn = form.querySelector('button');
    const was = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!was));
    btn.classList.toggle('is-pop', !was && !reduce.matches);
    try {
      const r = await send(form);
      if (r.login) { location.href = r.redirect; return; }
      if (!r.ok) throw new Error(r.error);
      btn.setAttribute('aria-pressed', String(r.on));
      const t = btn.getAttribute('aria-label').split(': ').slice(1).join(': ');
      btn.setAttribute('aria-label', `${r.on ? 'Quitar de deseados' : 'Guardar en deseados'}: ${t}`);
      btn.title = r.on ? 'Quitar de deseados' : 'Guardar en deseados';
      toast(r.msg, r.on ? { link: { href: `${base}/deseados`, label: 'Ver deseados' } } : {});
      const grid = form.closest('[data-wishgrid]');
      if (grid && !r.on) {
        const card = form.closest('.card');
        await vt(() => card.remove())?.finished;
        if (!grid.children.length) location.reload();
      }
    } catch (e) {
      btn.setAttribute('aria-pressed', String(was));
      toast(e.message || 'No se ha podido guardar.', { error: true });
    }
  }

  /* ---------- Cesta: quitar ---------- */
  if (form.matches('[data-remove]')) {
    ev.preventDefault();
    const line = form.closest('.line');
    line.classList.add('is-busy');
    try {
      const r = await send(form);
      if (!r.ok) throw new Error(r.error);
      setBag(r.count);
      if (r.count === 0) { location.reload(); return; }
      await vt(() => line.remove())?.finished;
      updateTotals(r.subtotal);
      toast(r.msg);
    } catch (e) {
      line.classList.remove('is-busy');
      toast(e.message || 'No se ha podido quitar.', { error: true });
    }
  }

  /* ---------- Boletín ---------- */
  if (form.matches('[data-news]')) {
    ev.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const msg = form.querySelector('.field__msg');
    const btn = form.querySelector('button');
    msg.className = 'field__msg';
    if (!input.value.trim() || !input.checkValidity()) {
      msg.textContent = input.value.trim() ? 'a ese correo le falta algo (por ejemplo, la @).' : 'escribe tu correo.';
      msg.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    loading(btn, true);
    try {
      const r = await send(form);
      if (!r.ok) throw new Error(r.error);
      msg.textContent = r.msg;
      msg.classList.add('is-ok');
      form.reset();
    } catch (e) {
      msg.textContent = e.message || 'no se ha podido apuntar. Inténtalo otra vez.';
      msg.classList.add('is-error');
    } finally {
      loading(btn, false);
    }
  }

  /* ---------- Confirmar pedido: estado de carga ---------- */
  if (form.matches('[data-checkout]')) {
    loading(form.querySelector('button[type="submit"]'), true);
  }
});

/* ---------- Cesta: cantidades ---------- */
document.addEventListener('click', async (ev) => {
  const step = ev.target.closest('[data-qty] button[data-step]');
  if (!step) return;
  ev.preventDefault();
  const form = step.closest('form');
  const line = form.closest('.line');
  const out = form.querySelector('output');
  const current = Number(out.textContent);
  const next = current + Number(step.dataset.step);
  if (next < 0) return;
  line.classList.add('is-busy');
  try {
    const r = await send(form, { qty: next });
    if (!r.ok) throw new Error(r.error);
    setBag(r.count);
    if (r.count === 0) { location.reload(); return; }
    if (r.qty === 0) {
      await vt(() => line.remove())?.finished;
    } else {
      out.textContent = r.qty;
      const plus = form.querySelector('[data-step="1"]');
      plus.disabled = r.qty >= Number(plus.dataset.max);
      form.querySelectorAll('button[data-step]').forEach((b) => { b.value = r.qty + Number(b.dataset.step); });
      const price = line.querySelector('[data-line-price]');
      price.textContent = euros(r.qty * Number(price.dataset.unit));
    }
    updateTotals(r.subtotal);
  } catch (e) {
    toast(e.message || 'No se ha podido cambiar la cantidad.', { error: true });
  } finally {
    line.classList.remove('is-busy');
  }
});

const euros = (cent) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cent / 100);
function updateTotals(subtotal) {
  document.querySelectorAll('[data-subtotal], [data-total]').forEach((el) => { el.textContent = subtotal; });
}

/* ---------- Portada: cambiar de colección retiñe la página ---------- */
const switches = document.querySelectorAll('[data-switch]');
if (switches.length) {
  const hero = document.querySelector('.hero');
  switches.forEach((btn) => {
    btn.addEventListener('click', () => {
      const col = btn.dataset.switch;
      if (document.documentElement.dataset.col === col) return;
      hero.classList.add('is-switching');
      document.documentElement.dataset.col = col;
      switches.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      document.querySelectorAll('[data-shelf-for]').forEach((el) => { el.hidden = el.dataset.shelfFor !== col; });
    });
  });
}

/* ---------- Filtros: aplicar al cambiar ---------- */
document.querySelectorAll('[data-filters] select').forEach((sel) => {
  sel.addEventListener('change', () => sel.form.requestSubmit());
});

/* ---------- Transición entre páginas: la cubierta viaja a su ficha ---------- */
const slugOf = (href) => {
  try { return new URL(href, location.href).pathname.match(/\/libro\/([a-z0-9-]+)/)?.[1] ?? null; } catch { return null; }
};
const clearNames = () => document.querySelectorAll('.cover[style*="view-transition-name"]:not([data-vt-fixed])').forEach((c) => c.style.removeProperty('view-transition-name'));

document.addEventListener('click', (ev) => {
  const a = ev.target.closest('a[href*="/libro/"]');
  if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
  const slug = slugOf(a.href);
  if (!slug) return;
  clearNames();
  const cover = a.matches('.cover') ? a : a.closest('.card, .pre__item, .shelf__item, .feature, .line')?.querySelector('.cover');
  if (cover) cover.style.viewTransitionName = `c-${slug}`;
});

window.addEventListener('pagereveal', (ev) => {
  if (!ev.viewTransition || !window.navigation?.activation?.from) return;
  const slug = slugOf(navigation.activation.from.url);
  if (!slug || location.pathname.includes('/libro/')) return;
  const cover = [...document.querySelectorAll(`a.cover[href$="/libro/${slug}"]`)].find((c) => c.offsetParent !== null);
  if (cover) {
    cover.style.viewTransitionName = `c-${slug}`;
    ev.viewTransition.finished.finally(() => cover.style.removeProperty('view-transition-name'));
  }
});
window.addEventListener('pageshow', (ev) => { if (ev.persisted) clearNames(); });
