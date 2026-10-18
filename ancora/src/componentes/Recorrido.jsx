import { useEffect, useRef, useState } from 'react';

// Recorrido gobernado por scroll: 120 fotogramas del reloj desmontándose, pintados en un canvas.
// El motor no pasa por el render de React: escribe en el lienzo y en variables CSS por refs.
// Lo único que sube a estado es el tramo en el que estás (cinco veces en todo el recorrido).

const BASE = import.meta.env.BASE_URL;
const TOTAL = 120;
const TROZO = 24;
const FUNDIDO = 3; // fotogramas que tarda un rótulo en aparecer o irse
const FONDO = '#111215';

// Tramos medidos en el vídeo (diferencia media entre fotogramas): dónde sale cada pieza.
// `fot` es el tramo real; `desde`/`hasta`, la ventana del rótulo, dentro de la parte más quieta.
export const TRAMOS = [
  { id: 'montado', nombre: 'Montado', fot: [1, 11], desde: -99, hasta: 11, p: [0, 0.1] },
  { id: 'cristal', nombre: 'Cristal', fot: [12, 30], desde: 21, hasta: 30, p: [0.1, 0.3] },
  { id: 'esfera', nombre: 'Esfera', fot: [31, 50], desde: 42, hasta: 51, p: [0.3, 0.45] },
  { id: 'puentes', nombre: 'Rotor y puentes', fot: [51, 82], desde: 68, hasta: 82, p: [0.45, 0.66] },
  { id: 'calibre', nombre: 'Calibre', fot: [83, 120], desde: 93, hasta: 999, p: [0.66, 1] },
];

// Del avance del scroll (0..1) al fotograma: más recorrido de scroll donde hay rótulo, para que
// cada pieza se quede quieta lo bastante como para leerla. Lo demás pasa más deprisa.
const MAPA = [[0, 1], [0.06, 6], [0.1, 11], [0.2, 21], [0.27, 29], [0.36, 42], [0.43, 50], [0.55, 68], [0.64, 81], [0.74, 94], [1, 120]];
function fotogramaDe(p) {
  for (let i = 1; i < MAPA.length; i++) {
    const [p1, f1] = MAPA[i];
    const [p0, f0] = MAPA[i - 1];
    if (p <= p1) return f0 + ((p - p0) / (p1 - p0)) * (f1 - f0);
  }
  return TOTAL;
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Apaisado: el fotograma ocupa el escenario de la derecha (el texto vive a la izquierda).
// Vertical: cabe entero arriba y el texto va debajo, sobre el fondo de la página.
function encaje(cw, ch, W, H) {
  const vertical = ch / cw > 1.05;
  if (vertical) {
    // Las piezas ocupan del 10 % al 93 % del ancho del fotograma: se puede recortar algo de los lados
    const e = Math.min((cw / W) * 1.24, (ch * 0.5) / H);
    const dw = W * e;
    const dh = H * e;
    const dy = Math.max(ch * 0.07, ch * 0.33 - dh / 2);
    return { dx: (cw - dw) / 2 - cw * 0.05, dy, dw, dh, vertical };
  }
  const ancho = cw * (cw < 1100 ? 0.78 : 0.74);
  const e = Math.min(ancho / W, (ch * 1.02) / H);
  const dw = W * e;
  const dh = H * e;
  return { dx: cw - dw + cw * 0.01, dy: (ch - dh) / 2, dw, dh, vertical };
}

export default function Recorrido({ alCambiarTramo }) {
  const seccion = useRef(null);
  const lienzo = useRef(null);
  const rotulos = useRef([]);
  const relleno = useRef(null);
  const [tramo, setTramo] = useState(0);
  const avisoRef = useRef(alCambiarTramo);
  avisoRef.current = alCambiarTramo;

  useEffect(() => {
    const canvas = lienzo.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    // Se elige un juego al cargar y no se cambia al girar el móvil (para no descargar los dos)
    const juego = window.innerWidth < 760 ? 'pq' : 'gr';
    const url = (i) => `${BASE}ruta/${juego}/${String(i).padStart(4, '0')}.webp`;
    const imgs = new Array(TOTAL + 1);
    const listas = new Array(TOTAL + 1).fill(false);
    const grupos = new Set();
    let pedido = 1;
    let dibujado = -1;
    let tramoActual = -1;
    let vivo = true;

    function pintar(f) {
      // el más cercano que ya esté cargado
      let i = f;
      for (let d = 0; d < TOTAL; d++) {
        if (listas[f - d]) { i = f - d; break; }
        if (listas[f + d]) { i = f + d; break; }
      }
      if (!listas[i]) return;
      const img = imgs[i];
      const { width: cw, height: ch } = canvas;
      const r = encaje(cw, ch, img.naturalWidth, img.naturalHeight);
      ctx.fillStyle = FONDO;
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, r.dx, r.dy, r.dw, r.dh);
      // Fundir los bordes del fotograma con el fondo de la página
      const borde = Math.min(r.dw, r.dh) * 0.16;
      const fundir = (x0, y0, x1, y1, rx, ry, rw, rh) => {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, FONDO);
        g.addColorStop(1, 'rgba(17,18,21,0)');
        ctx.fillStyle = g;
        ctx.fillRect(rx, ry, rw, rh);
      };
      fundir(r.dx, 0, r.dx + borde, 0, r.dx - 1, r.dy - 1, borde + 1, r.dh + 2);
      fundir(r.dx + r.dw, 0, r.dx + r.dw - borde, 0, r.dx + r.dw - borde, r.dy - 1, borde + 1, r.dh + 2);
      fundir(0, r.dy, 0, r.dy + borde * 0.8, r.dx, r.dy - 1, r.dw, borde * 0.8 + 1);
      fundir(0, r.dy + r.dh, 0, r.dy + r.dh - borde, r.dx, r.dy + r.dh - borde, r.dw, borde + 1);
      if (r.dy > 0) { ctx.fillStyle = FONDO; ctx.fillRect(0, 0, cw, r.dy); ctx.fillRect(0, r.dy + r.dh, cw, ch); }
      dibujado = i;
    }

    function pedirGrupo(g) {
      if (g < 0 || g * TROZO >= TOTAL || grupos.has(g)) return;
      grupos.add(g);
      for (let i = g * TROZO + 1; i <= Math.min(TOTAL, (g + 1) * TROZO); i++) {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (!vivo) return;
          listas[i] = true;
          // repinta el que toca, no el primero: si ya dejaste de bajar no te quedas con otro
          if (dibujado < 0 || Math.abs(i - pedido) < Math.abs(dibujado - pedido)) pintar(pedido);
        };
        img.src = url(i);
        imgs[i] = img;
      }
    }
    const grupoListo = (g) => {
      for (let i = g * TROZO + 1; i <= Math.min(TOTAL, (g + 1) * TROZO); i++) if (!listas[i]) return false;
      return true;
    };

    function medir() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      dibujado = -1;
    }

    function pasada() {
      const caja = seccion.current;
      if (!caja) return;
      const r = caja.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      const p = clamp(-r.top / recorrido, 0, 1);
      const fc = fotogramaDe(p);
      const f = clamp(Math.round(fc), 1, TOTAL);

      const g = Math.floor((f - 1) / TROZO);
      pedirGrupo(g);
      if (grupoListo(g) || (f - 1) % TROZO >= TROZO - 7) pedirGrupo(g + 1);

      if (f !== pedido || dibujado < 0) { pedido = f; pintar(f); }

      TRAMOS.forEach((t, i) => {
        const el = rotulos.current[i];
        if (!el) return;
        const o = clamp(Math.min((fc - t.desde) / FUNDIDO, (t.hasta - fc) / FUNDIDO), 0, 1);
        el.style.setProperty('--op', o.toFixed(3));
        el.style.setProperty('--vis', o > 0.01 ? 'visible' : 'hidden');
      });
      if (relleno.current) relleno.current.style.transform = `scaleX(${p.toFixed(4)})`;

      const nuevo = TRAMOS.findIndex((t) => p < t.p[1]);
      const actual = nuevo < 0 ? TRAMOS.length - 1 : nuevo;
      if (actual !== tramoActual) {
        tramoActual = actual;
        setTramo(actual);
        avisoRef.current?.(TRAMOS[actual].id);
      }
    }

    let pendiente = false;
    const alScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => { pendiente = false; pasada(); });
    };
    const alRedimensionar = () => { medir(); pasada(); };

    medir();
    pedirGrupo(0);
    pasada();
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alRedimensionar);
    return () => {
      vivo = false;
      window.removeEventListener('scroll', alScroll);
      window.removeEventListener('resize', alRedimensionar);
      imgs.forEach((img) => { if (img) img.onload = null; });
    };
  }, []);

  const ref = (i) => (el) => { rotulos.current[i] = el; };
  const caja = 'rotulo absolute left-5 right-5 bottom-[13svh] landscape:bottom-auto landscape:top-1/2 landscape:-translate-y-1/2 landscape:left-[6vw] landscape:right-auto landscape:w-[min(27rem,30vw)]';

  return (
    <section ref={seccion} id="recorrido" aria-labelledby="recorrido-t" className="relative h-[620svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={lienzo} aria-hidden="true" className="absolute inset-0 h-full w-full" />

        {/* Los rótulos se repiten en prosa para lectores de pantalla (lista oculta de abajo) */}
        <div aria-hidden="true">
          <div ref={ref(0)} className={caja} style={{ '--op': 1, '--vis': 'visible' }}>
            <p className="grabado">Áncora A-41 · Medianoche</p>
            <p className="titular mt-5 text-[clamp(3rem,5.6vw,5.6rem)] text-white">El tiempo, <em>por dentro.</em></p>
            <p className="mt-6 max-w-[34ch] text-acero-tenue">Un automático de 41 mm montado a mano en Madrid. Baja despacio: lo desmontamos pieza a pieza.</p>
          </div>
          {[
            ['01', 'Cristal', <>Zafiro de nueve en la escala de <em>Mohs.</em></>, 'Solo un diamante lo raya. Lleva antirreflejos por dentro, para que la esfera se lea a pleno sol.'],
            ['02', 'Esfera', <>Catorce capas de laca <em>azul.</em></>, 'El rayado solar se graba sobre latón y la laca se da a mano, capa a capa. Los índices se colocan uno a uno.'],
            ['03', 'Rotor y puentes', <>Acabados que nadie verá. <em>Salvo tú.</em></>, 'Côtes de Genève en los puentes y perlado en la platina. El rotor gira en los dos sentidos y da cuerda con cada gesto.'],
            ['04', 'Calibre A-1', <>212 piezas. <em>Una sola persona.</em></>, '28.800 alternancias por hora, 26 rubíes y 72 horas de reserva de marcha. Lo monta y lo regula un solo relojero.'],
          ].map(([n, grabado, titulo, texto], i) => (
            <div key={n} ref={ref(i + 1)} className={caja}>
              <p className="grabado"><span className="text-acero">{n}</span> — {grabado}</p>
              <p className="titular mt-5 text-[clamp(2.3rem,3.8vw,3.9rem)] text-white">{titulo}</p>
              <p className="mt-5 max-w-[36ch] text-acero-tenue">{texto}</p>
            </div>
          ))}
        </div>

        <h2 id="recorrido-t" className="sr-only">El A-41, pieza a pieza</h2>
        <ol className="sr-only">
          <li>Cristal de zafiro de dureza 9 en la escala de Mohs, con antirreflejos interior.</li>
          <li>Esfera azul medianoche con rayado solar sobre latón y catorce capas de laca dadas a mano.</li>
          <li>Rotor bidireccional y puentes con Côtes de Genève; platina perlada.</li>
          <li>Calibre A-1 de 212 piezas: 28.800 alternancias por hora, 26 rubíes y 72 horas de reserva de marcha, montado por un solo relojero.</li>
        </ol>

        {/* Indicación de bajar, solo al principio */}
        <div aria-hidden="true" className="rotulo pointer-events-none absolute bottom-[4.2rem] left-[6vw] hidden landscape:flex items-center gap-3 grabado"
          style={{ '--op': tramo === 0 ? 1 : 0, '--vis': 'visible', transition: 'opacity 400ms var(--ease-out)' }}>
          <span className="relative block h-9 w-[1px] overflow-hidden bg-linea"><span className="absolute inset-x-0 top-0 h-3 bg-acero animate-[bajar_1.8s_var(--ease-soft)_infinite]" /></span>
          Baja para desmontarlo
        </div>

        {/* Riel de avance: cada nombre encima de su tramo real del recorrido */}
        <div aria-hidden="true" className="absolute inset-x-5 landscape:inset-x-[6vw] bottom-6">
          <div className="relative h-[2px] bg-linea">
            <div ref={relleno} className="absolute inset-0 origin-left bg-acero" style={{ transform: 'scaleX(0)' }} />
          </div>
          <div className="relative mt-2.5 h-4">
            {TRAMOS.map((t, i) => (
              <span key={t.id} className={`absolute top-0 grabado !text-[0.66rem] whitespace-nowrap transition-colors duration-300 ${i === tramo ? '!text-acero' : ''} ${i !== tramo ? 'max-sm:hidden' : 'max-sm:!left-0'}`}
                style={{ left: `${t.p[0] * 100}%` }}>{t.nombre}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
