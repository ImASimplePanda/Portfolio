import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { geometria } from '../lib/geometria.js';
import { OPCIONES, porId } from '../lib/configuracion.js';

// Bici completa hecha con primitivas. Medidas en milímetros (se escala a metros al final).
// `despiece` es una referencia {current: 0..1}: a 1 las piezas están separadas, a 0 montadas.

const ARRIBA = new THREE.Vector3(0, 1, 0);

function Tubo({ a, b, r = 12, r2, material, children }) {
  const { pos, quat, largo } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    return {
      pos: va.clone().add(vb).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(ARRIBA, dir.clone().normalize()),
      largo: dir.length(),
    };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} material={material} castShadow>
      {/* r2 es el radio del extremo b (tubos que se estrechan, como las patas de la horquilla) */}
      <cylinderGeometry args={[r2 ?? r, r, largo, 24, 1]} />
      {children}
    </mesh>
  );
}

function Rueda({ radio, neumatico, perfil, disco, dinamo, materiales, delantera }) {
  const llanta = radio - neumatico;
  const radios = useMemo(() => {
    const p = [];
    const n = 28;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const lado = i % 2 ? 1 : -1;
      const b = a + lado * 0.25; // radios cruzados
      p.push(Math.cos(a) * 24, Math.sin(a) * 24, lado * 30, Math.cos(b) * (llanta - perfil), Math.sin(b) * (llanta - perfil), lado * 4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    return geo;
  }, [llanta, perfil]);
  return (
    <group>
      <mesh material={materiales.goma} castShadow>
        <torusGeometry args={[radio - neumatico / 2, neumatico / 2, 18, 120]} />
      </mesh>
      <mesh material={materiales.llanta} scale={[1, 1, 20 / perfil]}>
        <torusGeometry args={[llanta - perfil / 2, perfil / 2, 10, 120]} />
      </mesh>
      <lineSegments geometry={radios} material={materiales.radio} />
      <mesh material={materiales.metal} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[delantera && dinamo ? 34 : 20, delantera && dinamo ? 34 : 20, delantera ? 100 : 135, 24]} />
      </mesh>
      {disco ? (
        <mesh material={materiales.disco} position={[0, 0, -52]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[80, 80, 2, 48]} />
        </mesh>
      ) : null}
    </group>
  );
}

function Manillar({ tipo, materiales }) {
  const geo = useMemo(() => {
    const ancho = tipo === 'gravel' ? 0.2 : 0.205;
    const abajo = tipo === 'gravel' ? 0.25 : 0.215;
    const lado = (s) => [
      [-0.045, -0.125, s * abajo], [0.015, -0.135, s * abajo], [0.07, -0.115, s * (abajo - 0.004)],
      [0.088, -0.05, s * (ancho + (abajo - ancho) * 0.4)], [0.06, -0.004, s * ancho], [0.02, 0, s * (ancho - 0.02)],
    ];
    const pts = tipo === 'recto'
      ? [[-0.06, 0, -0.31], [-0.02, 0, -0.22], [0, 0, -0.1], [0, 0, 0.1], [-0.02, 0, 0.22], [-0.06, 0, 0.31]]
      : [...lado(-1), [0, 0, 0], ...lado(1).reverse()];
    const curva = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0] * 1000, p[1] * 1000, p[2] * 1000)));
    return new THREE.TubeGeometry(curva, 120, 12, 12, false);
  }, [tipo]);
  return (
    <group>
      <mesh geometry={geo} material={tipo === 'recto' ? materiales.metal : materiales.cinta} castShadow />
      {tipo === 'recto'
        ? [-1, 1].map((s) => (
            <mesh key={s} position={[-50, 0, s * 275]} rotation={[Math.PI / 2, 0.3 * s, 0]} material={materiales.cinta}>
              <cylinderGeometry args={[17, 17, 110, 20]} />
            </mesh>
          ))
        : [-1, 1].map((s) => (
            <group key={s} position={[70, 4, s * (tipo === 'gravel' ? 202 : 206)]}>
              <mesh rotation={[0, 0, 0.45]} material={materiales.goma}><capsuleGeometry args={[15, 50, 6, 12]} /></mesh>
              <mesh position={[30, -60, 0]} rotation={[0, 0, 0.12]} material={materiales.metal}><boxGeometry args={[10, 95, 14]} /></mesh>
            </group>
          ))}
    </group>
  );
}

function Sillin({ material }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(140, 0);
    s.bezierCurveTo(130, 22, 60, 26, 0, 34);
    s.bezierCurveTo(-60, 70, -120, 78, -130, 50);
    s.bezierCurveTo(-140, 0, -140, 0, -130, -50);
    s.bezierCurveTo(-120, -78, -60, -70, 0, -34);
    s.bezierCurveTo(60, -26, 130, -22, 140, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 18, bevelEnabled: true, bevelThickness: 10, bevelSize: 8, bevelSegments: 4, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  return <mesh geometry={geo} material={material} castShadow />;
}

// Grupo que se separa del resto cuando la bici está desmontada
function Pieza({ despiece, hacia, giro = 0, children }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const t = despiece?.current ?? 0;
    const e = t * t * (3 - 2 * t);
    ref.current.position.set(hacia[0] * e, hacia[1] * e, hacia[2] * e);
    ref.current.rotation.z = giro * e;
  });
  return <group ref={ref}>{children}</group>;
}

export function usarMateriales(config) {
  const acabado = porId(OPCIONES.acabados, config.acabado);
  const cinta = porId(OPCIONES.cintas, config.cinta).hex;
  const m = useMemo(() => ({
    pintura: new THREE.MeshPhysicalMaterial({ clearcoat: 1, clearcoatRoughness: 0.12 }),
    laton: new THREE.MeshStandardMaterial({ color: '#c6953f', metalness: 1, roughness: 0.3 }),
    iridiscente: new THREE.MeshPhysicalMaterial({ color: '#8d84c9', metalness: 1, roughness: 0.18, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 800] }),
    goma: new THREE.MeshStandardMaterial({ color: '#1b1b1c', roughness: 0.92 }),
    llanta: new THREE.MeshStandardMaterial({ color: '#1f2124', metalness: 0.5, roughness: 0.42 }),
    radio: new THREE.LineBasicMaterial({ color: '#8b8f93' }),
    metal: new THREE.MeshStandardMaterial({ color: '#2a2c2f', metalness: 0.75, roughness: 0.38 }),
    plata: new THREE.MeshStandardMaterial({ color: '#c9ccce', metalness: 1, roughness: 0.22 }),
    disco: new THREE.MeshStandardMaterial({ color: '#c3c6c9', metalness: 0.7, roughness: 0.35 }),
    cinta: new THREE.MeshStandardMaterial({ roughness: 0.8 }),
    sillin: new THREE.MeshStandardMaterial({ roughness: 0.6 }),
  }), []);

  // Los colores se aplican fuera de useMemo para poder cambiarlos sin crear materiales nuevos
  const p = m.pintura;
  if (acabado.tipo === 'titanio') { p.color.set('#b4b4ae'); p.metalness = 1; p.roughness = 0.34; p.clearcoat = 0; }
  else if (acabado.tipo === 'crudo') { p.color.set('#6c7175'); p.metalness = 0.85; p.roughness = 0.42; p.clearcoat = 1; }
  else if (acabado.tipo === 'metal') { p.color.set(acabado.hex); p.metalness = 0.65; p.roughness = 0.28; p.clearcoat = 1; }
  else { p.color.set(acabado.hex); p.metalness = 0.05; p.roughness = 0.38; p.clearcoat = 1; }
  m.cinta.color.set(cinta);
  m.sillin.color.set(config.extras.includes('sillin') ? '#7a4a1e' : '#1d1d1f');
  return m;
}

export default function Bici({ config, despiece, girarRuedas = false }) {
  const g = useMemo(() => geometria(config), [config]);
  const mat = usarMateriales(config);
  const ruedas = porId(OPCIONES.ruedas, config.ruedas);
  const trans = config.transmision;
  const acabado = config.acabado;
  const titanio = config.material === 'titanio';
  const tubos = titanio ? { dir: 22, diag: 19, hor: 15.9, sil: 15.9 } : { dir: 22, diag: 17.5, hor: 14.3, sil: 14.3 };

  const ruedaT = useRef();
  const ruedaD = useRef();
  useFrame((_, dt) => {
    if (!girarRuedas) return;
    if (ruedaT.current) ruedaT.current.rotation.z -= dt * 1.2;
    if (ruedaD.current) ruedaD.current.rotation.z -= dt * 1.2;
  });

  const v = (p, z = 0) => [p[0], p[1], z];
  const R = g.radioRueda;
  const ancho = 66; // separación de las vainas en el eje trasero (a cada lado)
  const centroX = (g.ejeTrasero[0] + g.ejeDelantero[0]) / 2;
  const plato = trans === 'single' ? 'plata' : 'metal';
  const conCambio = !['single', 'alfine'].includes(trans);
  const uniones = acabado === 'visto'
    ? [g.pedalier, g.horizontalAtras, g.horizontalDelante, g.diagonalDelante, g.tiranteArriba]
    : [];

  return (
    <group scale={0.001} position={[-centroX * 0.001, -g.suelo * 0.001, 0]}>
      {/* cuadro */}
      <group>
        <Tubo a={v(g.direccionArriba)} b={v(g.direccionAbajo)} r={tubos.dir} material={mat.pintura} />
        <Tubo a={v(g.pedalier)} b={v(g.diagonalDelante)} r={tubos.diag} material={mat.pintura} />
        <Tubo a={v(g.horizontalAtras)} b={v(g.horizontalDelante)} r={tubos.hor} material={mat.pintura} />
        <Tubo a={v(g.pedalier)} b={v(g.sillinArriba)} r={tubos.sil} material={mat.pintura} />
        <mesh position={v(g.pedalier)} rotation={[Math.PI / 2, 0, 0]} material={mat.pintura}>
          <cylinderGeometry args={[21, 21, 86, 24]} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s}>
            <Tubo a={v(g.pedalier, s * 30)} b={v(g.ejeTrasero, s * ancho)} r={11} r2={8} material={mat.pintura} />
            <Tubo a={v(g.tiranteArriba, s * 14)} b={v(g.ejeTrasero, s * ancho)} r={8} r2={7} material={mat.pintura} />
          </group>
        ))}
        {uniones.map((p, i) => (
          <mesh key={i} position={v(p)} material={mat.laton}>
            <sphereGeometry args={[i === 0 ? 26 : 19, 20, 14]} />
          </mesh>
        ))}
        {acabado === 'anodizado' ? (
          <Tubo a={v([g.diagonalDelante[0] * 0.3, g.diagonalDelante[1] * 0.3])} b={v([g.diagonalDelante[0] * 0.72, g.diagonalDelante[1] * 0.72])} r={tubos.diag + 0.6} material={mat.iridiscente} />
        ) : null}
      </group>

      {/* horquilla, con portabultos y guardabarros delantero */}
      <Pieza despiece={despiece} hacia={[200, 170, 0]} giro={0.15}>
        <Tubo a={v(g.coronaHorquilla)} b={v([g.coronaHorquilla[0] + 8, g.coronaHorquilla[1] + 30])} r={20} material={mat.pintura} />
        <mesh position={v(g.coronaHorquilla)} material={mat.pintura}>
          <boxGeometry args={[46, 26, 118]} />
        </mesh>
        {[-1, 1].map((s) => (
          <Tubo key={s} a={v(g.coronaHorquilla, s * 50)} b={v(g.ejeDelantero, s * 50)} r={14} r2={9} material={mat.pintura} />
        ))}
        {config.extras.includes('portabultos') ? (
          <group position={[g.ejeDelantero[0], g.ejeDelantero[1] + R + 70, 0]}>
            <mesh material={mat.metal}><boxGeometry args={[300, 10, 200]} /></mesh>
            {[-1, 1].map((s) => <Tubo key={s} a={[110, 0, s * 95]} b={[10, -R - 60, s * 55]} r={6} material={mat.metal} />)}
          </group>
        ) : null}
      </Pieza>

      <Pieza despiece={despiece} hacia={[400, 40, 0]}>
        <group position={v(g.ejeDelantero)}>
          <group ref={ruedaD}>
            <Rueda radio={R} neumatico={g.g.neumatico} perfil={ruedas.perfil} disco={g.g.manillar !== 'recto' || trans !== 'single'} dinamo={config.ruedas === 'dinamo'} materiales={mat} delantera />
          </group>
          {config.extras.includes('guardabarros') ? (
            <mesh material={mat.plata} rotation={[0, 0, Math.PI * -0.08]} scale={[1, 1, 7]}>
              <torusGeometry args={[R + 24, 5, 8, 80, Math.PI * 0.85]} />
            </mesh>
          ) : null}
        </group>
      </Pieza>

      <Pieza despiece={despiece} hacia={[-400, 40, 0]}>
        <group position={v(g.ejeTrasero)}>
          <group ref={ruedaT}>
            <Rueda radio={R} neumatico={g.g.neumatico} perfil={ruedas.perfil} disco materiales={mat} />
          </group>
          {trans === 'alfine' ? (
            <mesh material={mat.plata} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[46, 46, 80, 32]} /></mesh>
          ) : null}
          {config.extras.includes('guardabarros') ? (
            <mesh material={mat.plata} rotation={[0, 0, Math.PI * 0.32]} scale={[1, 1, 7]}>
              <torusGeometry args={[R + 24, 5, 8, 80, Math.PI * 0.8]} />
            </mesh>
          ) : null}
        </group>
      </Pieza>

      {/* tija y sillín */}
      <Pieza despiece={despiece} hacia={[-80, 360, 0]}>
        <Tubo a={v(g.sillinArriba)} b={v([g.sillin[0] + 6, g.sillin[1] - 28])} r={13.5} material={mat.metal} />
        <group position={[g.sillin[0] + 15, g.sillin[1] - 18, 0]}>
          <Sillin material={mat.sillin} />
        </group>
      </Pieza>

      {/* potencia y manillar */}
      <Pieza despiece={despiece} hacia={[160, 320, 0]} giro={-0.2}>
        <Tubo a={v(g.direccionArriba)} b={v(g.tuboArriba)} r={16} material={mat.metal} />
        <Tubo a={v(g.tuboArriba)} b={v(g.potencia)} r={16} material={mat.metal} />
        <group position={v(g.potencia)}>
          <Manillar tipo={g.g.manillar} materiales={mat} />
        </group>
      </Pieza>

      {/* transmisión */}
      <Pieza despiece={despiece} hacia={[0, -140, 380]}>
        {/* plato: corona dentada y araña de cinco brazos */}
        <mesh position={v(g.pedalier, 52)} material={mat[plato]}>
          <torusGeometry args={[92, 7, 8, 72]} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2 + 0.3;
          return <Tubo key={i} a={v(g.pedalier, 52)} b={[g.pedalier[0] + Math.cos(a) * 88, g.pedalier[1] + Math.sin(a) * 88, 52]} r={6} material={mat[plato]} />;
        })}
        <mesh position={v(g.pedalier, 54)} rotation={[Math.PI / 2, 0, 0]} material={mat.metal}>
          <cylinderGeometry args={[30, 30, 10, 32]} />
        </mesh>
        {[[1, 0], [-1, Math.PI]].map(([s, fase]) => {
          const a = -0.9 + fase;
          const pie = [g.pedalier[0] + Math.cos(a) * 170, g.pedalier[1] + Math.sin(a) * 170];
          return (
            <group key={s}>
              <Tubo a={v(g.pedalier, s * 60)} b={v(pie, s * 70)} r={11} material={mat.metal} />
              <mesh position={v(pie, s * 110)} material={mat.metal}><boxGeometry args={[90, 18, 70]} /></mesh>
            </group>
          );
        })}
        {[98, -98].map((dy, i) => (
          <Tubo key={i} a={[g.pedalier[0], g.pedalier[1] + dy, 52]} b={[g.ejeTrasero[0], g.ejeTrasero[1] + (dy > 0 ? 42 : -42), 52]} r={trans === 'single' ? 6 : 4} material={trans === 'single' ? mat.goma : mat.metal} />
        ))}
        {conCambio ? (
          <mesh position={[g.ejeTrasero[0] + 10, g.ejeTrasero[1] - 70, 58]} material={mat.metal}><boxGeometry args={[40, 90, 18]} /></mesh>
        ) : null}
      </Pieza>
    </group>
  );
}
