// Sonido de las teclas sintetizado con Web Audio (sin grabaciones).
// Un golpe de tecla es la suma de: el plástico al tocar fondo (ruido filtrado en una banda),
// el "thock" grave de la carcasa (un seno que cae rápido) y, en los clicky, el clic del muelle.
// Cada interruptor trae sus parámetros; la placa y la carcasa los modifican.

let ctx = null;
let ruido = null;
let salida = null;

function preparar() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  // 0,4 s de ruido blanco reutilizable
  ruido = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
  const d = ruido.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  salida = ctx.createDynamicsCompressor();
  salida.threshold.value = -12;
  salida.connect(ctx.destination);
  return ctx;
}

let silencio = false;
export const silenciar = (v) => { silencio = v; };
export const estaSilenciado = () => silencio;

// Algunos navegadores arrancan el audio en pausa hasta el primer gesto del usuario
export function despertar() {
  const c = preparar();
  if (c && c.state === 'suspended') c.resume();
}

function golpeRuido(t, { frecuencia, q = 2.5, ganancia, caida, tipo = 'bandpass' }) {
  const f = ctx.createBufferSource();
  f.buffer = ruido;
  f.playbackRate.value = 0.9 + Math.random() * 0.2;
  const filtro = ctx.createBiquadFilter();
  filtro.type = tipo;
  filtro.frequency.value = frecuencia;
  filtro.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ganancia, t + 0.0015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + caida);
  f.connect(filtro).connect(g).connect(salida);
  f.start(t, Math.random() * 0.3, caida + 0.02);
}

function golpeTono(t, { frecuencia, ganancia, caida, tipo = 'sine' }) {
  const o = ctx.createOscillator();
  o.type = tipo;
  o.frequency.setValueAtTime(frecuencia * 1.6, t);
  o.frequency.exponentialRampToValueAtTime(frecuencia, t + 0.012);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ganancia, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + caida);
  o.connect(g).connect(salida);
  o.start(t);
  o.stop(t + caida + 0.02);
}

// Valores por defecto: un lineal neutro en placa de aluminio
export const SONIDO_BASE = { familia: 'lineal', tono: 1500, cuerpo: 0.5, brillo: 0.5, volumen: 0.8 };

// La placa y la carcasa cambian el carácter: latón más agudo y metálico, policarbonato más grave
export const MODIFICADORES = {
  placa: { aluminio: { tono: 1, cuerpo: 1 }, laton: { tono: 1.18, cuerpo: 0.85 }, policarbonato: { tono: 0.8, cuerpo: 1.25 }, fr4: { tono: 0.92, cuerpo: 1.1 } },
  carcasa: { aluminio: { tono: 1, cuerpo: 1.05 }, policarbonato: { tono: 0.95, cuerpo: 0.9 }, madera: { tono: 0.85, cuerpo: 1.3 } },
};

export function combinar(sonido, placa, carcasa) {
  const p = MODIFICADORES.placa[placa] || MODIFICADORES.placa.aluminio;
  const c = MODIFICADORES.carcasa[carcasa] || MODIFICADORES.carcasa.aluminio;
  return { ...SONIDO_BASE, ...sonido, tono: (sonido?.tono ?? SONIDO_BASE.tono) * p.tono * c.tono, cuerpo: Math.min(1.2, (sonido?.cuerpo ?? SONIDO_BASE.cuerpo) * p.cuerpo * c.cuerpo) };
}

// Pulsación (al bajar). `ancho` > 2 para las barras largas: suenan más graves y con algo de vibración.
export function pulsar(s = SONIDO_BASE, ancho = 1) {
  if (silencio) return;
  const c = preparar();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  const t = c.currentTime + 0.002;
  const v = s.volumen ?? 0.8;
  const variacion = 0.95 + Math.random() * 0.1;
  const larga = ancho >= 2;
  const tono = s.tono * variacion * (larga ? 0.62 : 1);

  if (s.familia === 'clicky') {
    // El clic del muelle llega antes de tocar fondo
    golpeRuido(t, { frecuencia: 5200, q: 6, ganancia: 0.55 * v, caida: 0.012, tipo: 'bandpass' });
  }
  const retraso = s.familia === 'tactil' ? 0.009 : s.familia === 'clicky' ? 0.014 : 0.004;
  if (s.familia === 'tactil') golpeRuido(t, { frecuencia: tono * 0.7, q: 1.5, ganancia: 0.1 * v, caida: 0.01 });
  golpeRuido(t + retraso, { frecuencia: tono, q: 1.2 + s.brillo * 3, ganancia: 0.5 * v, caida: 0.035 + (1 - s.brillo) * 0.025 });
  golpeTono(t + retraso, { frecuencia: 150 + (1 - s.cuerpo) * 120, ganancia: 0.45 * s.cuerpo * v, caida: 0.05 + s.cuerpo * 0.03 });
  if (larga) golpeRuido(t + retraso + 0.01, { frecuencia: 900, q: 8, ganancia: 0.08 * v, caida: 0.06 });
}

// Soltar la tecla: un golpe más suave y algo más agudo (el vástago vuelve arriba)
export function soltar(s = SONIDO_BASE, ancho = 1) {
  if (silencio || !ctx) return;
  const t = ctx.currentTime + 0.002;
  const v = (s.volumen ?? 0.8) * 0.45;
  if (s.familia === 'clicky') golpeRuido(t, { frecuencia: 4600, q: 6, ganancia: 0.3 * v, caida: 0.01 });
  golpeRuido(t + 0.003, { frecuencia: s.tono * 1.25 * (ancho >= 2 ? 0.7 : 1), q: 2, ganancia: 0.35 * v, caida: 0.025 });
}
