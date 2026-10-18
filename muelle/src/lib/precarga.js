import { precargar } from './usarDatos.js';
import { BASE } from './base.js';

// Código de cada página (las mismas funciones que usa React.lazy, así el módulo se comparte)
export const paginas = {
  catalogo: () => import('../paginas/Catalogo.jsx'),
  producto: () => import('../paginas/Producto.jsx'),
  cesta: () => import('../paginas/Cesta.jsx'),
  caja: () => import('../paginas/Caja.jsx'),
  montador: () => import('../paginas/Montador.jsx'),
  escena: () => import('../tres/Escena.jsx'),
};

const TIPOS = { teclados: 'teclado', interruptores: 'interruptores', teclas: 'teclas', accesorios: 'accesorios' };

// Adelanta el código y los datos de la página a la que apunta un enlace
export function precargarEnlace(to) {
  if (typeof to !== 'string') return;
  const [ruta] = to.split('?');
  let m;
  if ((m = ruta.match(/^\/tienda(?:\/([a-z]+))?$/))) {
    paginas.catalogo();
    const p = new URLSearchParams();
    if (m[1] && TIPOS[m[1]]) p.set('tipo', TIPOS[m[1]]);
    p.set('por', '24');
    precargar(`/productos?${p}`);
  } else if ((m = ruta.match(/^\/producto\/([\w-]+)$/))) {
    paginas.producto();
    precargar(`/productos/${m[1]}`);
  } else if (ruta === '/montador') {
    paginas.montador(); paginas.escena();
    precargar('/montador/piezas');
  } else if (ruta === '/cesta') paginas.cesta();
  else if (ruta === '/caja') paginas.caja();
}

// En un momento libre tras cargar, se baja el código de las páginas más visitadas (no en ahorro de datos)
export function precargarEnReposo() {
  if (navigator.connection?.saveData) return;
  const ir = () => { paginas.catalogo(); paginas.producto(); paginas.montador(); paginas.cesta(); };
  const cuando = window.requestIdleCallback || ((f) => setTimeout(f, 1500));
  window.addEventListener('load', () => cuando(ir, { timeout: 4000 }), { once: true });
}

// Delegación: un solo oyente para todos los enlaces internos (ratón encima o foco con teclado)
export function precargarAlApuntar() {
  const raiz = BASE.replace(/\/$/, '');
  const f = (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || a.origin !== location.origin) return;
    let ruta = a.pathname;
    if (raiz && ruta.startsWith(raiz)) ruta = ruta.slice(raiz.length) || '/';
    precargarEnlace(ruta + a.search);
  };
  document.addEventListener('pointerover', f, { passive: true });
  document.addEventListener('focusin', f);
  document.addEventListener('touchstart', f, { passive: true });
}
