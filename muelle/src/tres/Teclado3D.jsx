import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { teclas } from '../lib/distribuciones.js';
import { colorDe } from '../componentes/Teclado2D.jsx';

// Teclado 3D hecho con primitivas, en milímetros (se escala a metros al final).
// Capas de abajo arriba: carcasa, PCB, placa, interruptores y teclas. `despiece` ({current: 0..1})
// separa las capas en vertical; `pulsadas` ({current: Set}) hunde las teclas que se están tocando.

const U = 19.05;
const ALTO_TECLA = 8.5;

// Una geometría por tamaño de tecla (no una por tecla): 88 teclas comparten 8 o 9 geometrías
const geometrias = new Map();
function cajaRedondeada(w, h, d, r, seg = 2) {
  const k = [w, h, d, r, seg].map((n) => n.toFixed(2)).join('|');
  if (!geometrias.has(k)) geometrias.set(k, new RoundedBoxGeometry(w, h, d, seg, r));
  return geometrias.get(k);
}

// Los interruptores no se mueven uno a uno: cada pieza es un único InstancedMesh (4 llamadas de dibujo en vez de 350)
function Instanciadas({ posiciones, geometria, material, desplazamiento }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    posiciones.forEach(([x, y, z], i) => ref.current.setMatrixAt(i, m.makeTranslation(x, y + desplazamiento, z)));
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [posiciones, desplazamiento]);
  return <instancedMesh ref={ref} args={[geometria, material, posiciones.length]} key={posiciones.length} />;
}
const GEO_BASE = new THREE.BoxGeometry(14, 4, 14);
const GEO_TAPA = new THREE.BoxGeometry(11, 2.6, 11);
const GEO_VASTAGO_A = new THREE.BoxGeometry(6, 4, 2);
const GEO_VASTAGO_B = new THREE.BoxGeometry(2, 4, 6);
const reducido = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MATERIAL_PLACA = {
  aluminio: { color: '#c3c6ca', metalness: 0.85, roughness: 0.35 },
  laton: { color: '#c9a04a', metalness: 1, roughness: 0.3 },
  policarbonato: { color: '#e9eef2', metalness: 0, roughness: 0.25, transparent: true, opacity: 0.55 },
  fr4: { color: '#d8c98e', metalness: 0.05, roughness: 0.6 },
};

// Rótulos: un único lienzo con una celda por tecla (del ancho de la tecla), para no crear 88 texturas
function usarRotulos(lista, colores) {
  return useMemo(() => {
    const px = 96; // píxeles por unidad de tecla
    const ancho = 2048;
    const celdas = [];
    let x = 0;
    let y = 0;
    let altoFila = 0;
    for (const t of lista) {
      const w = Math.round(t.u * px);
      const h = Math.round((t.h || 1) * px);
      if (x + w > ancho) { x = 0; y += altoFila; altoFila = 0; }
      celdas.push({ x, y, w, h });
      x += w;
      altoFila = Math.max(altoFila, h);
    }
    const alto = y + altoFila;
    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    const g = lienzo.getContext('2d');
    lista.forEach((t, i) => {
      const [fondo, tinta] = colorDe(t.papel, colores);
      const c = celdas[i];
      g.fillStyle = fondo;
      g.fillRect(c.x, c.y, c.w, c.h);
      if (t.rotulo) {
        g.fillStyle = tinta;
        g.font = `600 ${t.rotulo.length > 2 ? 19 : 30}px "Hanken Grotesk Variable", system-ui, sans-serif`;
        g.textBaseline = 'top';
        g.fillText(t.rotulo, c.x + 14, c.y + 12);
      }
    });
    const tex = new THREE.CanvasTexture(lienzo);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return { tex, celdas, ancho, alto };
  }, [lista, colores]);
}

function usarCircuito(lista, ancho, alto) {
  return useMemo(() => {
    const px = 40;
    const W = Math.round(ancho * px);
    const H = Math.round(alto * px);
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#4a2d6b';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = '#c9a04a';
    g.lineWidth = 2;
    g.lineJoin = 'round';
    for (const t of lista) {
      const cx = (t.x + t.u / 2) * px;
      const cy = (t.y + (t.h || 1) / 2) * px;
      // pista: baja y gira 45° hacia la fila de abajo, como el rutado de una matriz de teclado
      g.beginPath();
      g.moveTo(cx - 6, cy - 6);
      g.lineTo(cx - 6, cy + 8);
      g.lineTo(cx + 4, cy + 18);
      g.stroke();
      g.fillStyle = '#d9a94e';
      g.beginPath(); g.arc(cx - 6, cy - 6, 4.5, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(cx + 5, cy - 9, 4.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2c1943';
      g.beginPath(); g.arc(cx - 6, cy - 6, 1.8, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(cx + 5, cy - 9, 1.8, 0, Math.PI * 2); g.fill();
    }
    // Serigrafía junto a U1 (el microcontrolador, borde delantero) y J1 (el USB-C, canto izquierdo)
    g.fillStyle = '#f1ecf7';
    g.font = '600 16px "Chakra Petch", sans-serif';
    g.fillText('U1', W * 0.58 + 36, H - 10);
    g.fillText('J1', 8, H - 6);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [lista, ancho, alto]);
}

function Capa({ despiece, sube, children }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const t = despiece?.current ?? 0;
    const e = t * t * (3 - 2 * t);
    ref.current.position.y = sube * e;
  });
  return <group ref={ref}>{children}</group>;
}

export default function Teclado3D({ ola = false, capaActiva = null, formato = '65', colores, carcasa = { hex: '#4a2d52', material: 'aluminio' }, placa = 'aluminio', interruptor = '#efe2c4', despiece, pulsadas, onTecla }) {
  const { lista, ancho, alto } = useMemo(() => teclas(formato), [formato]);
  const rot = usarRotulos(lista, colores);
  const circuito = usarCircuito(lista, ancho, alto);
  const W = ancho * U;
  const D = alto * U;
  const bisel = 12;

  // Planos superiores de cada tecla, con su celda del lienzo de rótulos
  const caras = useMemo(() => lista.map((t, i) => {
    const geo = new THREE.PlaneGeometry(t.u * U - 7.2, (t.h || 1) * U - 7.2);
    const c = rot.celdas[i];
    const u0 = c.x / rot.ancho;
    const u1 = (c.x + c.w) / rot.ancho;
    const vArriba = 1 - c.y / rot.alto;
    const vAbajo = 1 - (c.y + c.h) / rot.alto;
    const uv = geo.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, u0 + uv.getX(k) * (u1 - u0), vAbajo + uv.getY(k) * (vArriba - vAbajo));
    return geo;
  }), [lista, rot]);

  const matCara = useMemo(() => new THREE.MeshStandardMaterial({ map: rot.tex, roughness: 0.62 }), [rot]);
  const matTeclas = useMemo(() => {
    const m = {};
    for (const papel of ['letra', 'mod', 'acento']) m[papel] = new THREE.MeshStandardMaterial({ color: colorDe(papel, colores)[0], roughness: 0.6 });
    return m;
  }, [colores]);
  const matCarcasa = useMemo(() => new THREE.MeshPhysicalMaterial(
    carcasa.material === 'policarbonato' ? { color: carcasa.hex, roughness: 0.18, transmission: 0.55, thickness: 6, transparent: true, opacity: 0.85 }
      : carcasa.material === 'madera' ? { color: carcasa.hex, roughness: 0.75, metalness: 0, clearcoat: 0.3 }
        : { color: carcasa.hex, roughness: 0.38, metalness: 0.7 },
  ), [carcasa.hex, carcasa.material]);
  const matPlaca = useMemo(() => new THREE.MeshStandardMaterial(MATERIAL_PLACA[placa] || MATERIAL_PLACA.aluminio), [placa]);
  const matInterruptor = useMemo(() => new THREE.MeshStandardMaterial({ color: interruptor, roughness: 0.45 }), [interruptor]);
  const matPcb = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a2d6b', roughness: 0.55 }), []);
  const matCircuito = useMemo(() => new THREE.MeshStandardMaterial({ map: circuito, roughness: 0.5, metalness: 0.1 }), [circuito]);
  const matCarcasaInterruptor = useMemo(() => new THREE.MeshStandardMaterial({ color: '#17151b', roughness: 0.5 }), []);
  const matTapa = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b8b2c4', roughness: 0.15, transparent: true, opacity: 0.55 }), []);
  const matChip = useMemo(() => new THREE.MeshStandardMaterial({ color: '#141317', roughness: 0.35 }), []);
  const matUsb = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c9ccd0', roughness: 0.25, metalness: 0.9 }), []);

  const invalidate = useThree((s) => s.invalidate);
  // La capa que se está leyendo en la anatomía brilla un poco en cobre
  useEffect(() => {
    const grupos = [Object.values(matTeclas).concat(matCara), [matInterruptor, matCarcasaInterruptor, matTapa], [matPlaca], [matPcb, matCircuito, matChip], [matCarcasa]];
    grupos.forEach((mats, i) => mats.forEach((m) => {
      m.emissive = new THREE.Color(i === capaActiva ? '#d9a94e' : '#000000');
      m.emissiveIntensity = i === capaActiva ? 0.22 : 0;
    }));
    invalidate();
  }, [invalidate, capaActiva, matTeclas, matCara, matInterruptor, matCarcasaInterruptor, matTapa, matPlaca, matPcb, matCircuito, matChip, matCarcasa]);

  // Teclas hundidas: cada grupo baja hacia su objetivo con algo de muelle
  const refs = useRef([]);
  const alturas = useRef(lista.map(() => 0));
  useEffect(() => { alturas.current = lista.map(() => 0); }, [lista]);
  // Al aparecer, una ola de pulsaciones recorre el teclado de izquierda a derecha (una sola vez)
  const inicioOla = useRef(ola && !reducido() ? -1 : null);
  useFrame((estado, dt) => {
    const s = pulsadas?.current;
    const ahora = estado.clock.elapsedTime;
    if (inicioOla.current === -1) inicioOla.current = ahora + 0.35;
    const tOla = inicioOla.current == null ? null : ahora - inicioOla.current;
    let moviendo = false;
    for (let i = 0; i < lista.length; i++) {
      const g = refs.current[i];
      if (!g) continue;
      let objetivo = s?.has(lista[i].codigo) ? -3.4 : 0;
      if (tOla != null) {
        const f = tOla - (lista[i].x + lista[i].y * 0.6) * 0.045;
        if (f > 0 && f < 0.16) objetivo = Math.min(objetivo, -2.8);
      }
      alturas.current[i] += (objetivo - alturas.current[i]) * Math.min(1, dt * 38);
      if (Math.abs(objetivo - alturas.current[i]) > 0.02) moviendo = true;
      g.position.y = alturas.current[i];
    }
    if (tOla != null) {
      if (tOla > 1.6) inicioOla.current = null;
      moviendo = true;
    }
    // Render bajo demanda: solo se pide otro fotograma mientras algo se mueve
    if (moviendo) estado.invalidate();
  });

  const posInterruptores = useMemo(() => lista.map((t) => [-W / 2 + (t.x + t.u / 2) * U, 8.5, -D / 2 + (t.y + (t.h || 1) / 2) * U]), [lista, W, D]);

  const x0 = -W / 2;
  const z0 = -D / 2;
  const centro = (t) => [x0 + (t.x + t.u / 2) * U, z0 + (t.y + (t.h || 1) / 2) * U];

  return (
    <group scale={0.001} rotation={[0.1, 0, 0]}>
      {/* carcasa */}
      <mesh geometry={cajaRedondeada(W + bisel * 2, 18, D + bisel * 2, 6, 4)} position={[0, -9, 0]} material={matCarcasa} />
      {/* PCB */}
      <Capa despiece={despiece} sube={26}>
        <mesh position={[0, 1.2, 0]} material={matPcb}><boxGeometry args={[W + 2, 1.6, D + 2]} /></mesh>
        <mesh position={[0, 2.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={matCircuito}><planeGeometry args={[W, D]} /></mesh>
        {/* U1: el microcontrolador, en el borde delantero, y J1: el USB-C que asoma por el canto izquierdo */}
        <mesh position={[W * 0.08, 3.6, -z0 - 8]} material={matChip}><boxGeometry args={[26, 3, 12]} /></mesh>
        <mesh position={[x0 - 3, 3.4, -z0 - 14]} material={matUsb}><boxGeometry args={[12, 3.6, 9]} /></mesh>
      </Capa>
      {/* placa */}
      <Capa despiece={despiece} sube={52}>
        <mesh position={[0, 5, 0]} material={matPlaca}><boxGeometry args={[W + 1, 1.5, D + 1]} /></mesh>
      </Capa>
      {/* interruptores */}
      <Capa despiece={despiece} sube={82}>
        {/* carcasa del interruptor (abajo oscura, arriba translúcida) y el vástago en cruz de su color */}
        <Instanciadas posiciones={posInterruptores} geometria={GEO_BASE} material={matCarcasaInterruptor} desplazamiento={-1.6} />
        <Instanciadas posiciones={posInterruptores} geometria={GEO_TAPA} material={matTapa} desplazamiento={1.6} />
        <Instanciadas posiciones={posInterruptores} geometria={GEO_VASTAGO_A} material={matInterruptor} desplazamiento={4.6} />
        <Instanciadas posiciones={posInterruptores} geometria={GEO_VASTAGO_B} material={matInterruptor} desplazamiento={4.6} />
      </Capa>
      {/* teclas */}
      <Capa despiece={despiece} sube={124}>
        {lista.map((t, i) => {
          const [cx, cz] = centro(t);
          const w = t.u * U - 4.2;
          const d = (t.h || 1) * U - 4.2;
          return (
            <group key={i} position={[cx, 15, cz]}>
              <group ref={(el) => { refs.current[i] = el; }}
                onPointerDown={onTecla ? (e) => { e.stopPropagation(); onTecla(t.codigo, t.u, true); } : undefined}
                onPointerUp={onTecla ? (e) => { e.stopPropagation(); onTecla(t.codigo, t.u, false); } : undefined}>
                <mesh geometry={cajaRedondeada(w, ALTO_TECLA, d, 1.6)} material={matTeclas[t.papel]} />
                <mesh geometry={caras[i]} material={matCara} rotation={[-Math.PI / 2, 0, 0]} position={[0, ALTO_TECLA / 2 + 0.05, 0]} />
              </group>
            </group>
          );
        })}
      </Capa>
    </group>
  );
}
