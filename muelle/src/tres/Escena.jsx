import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Teclado3D from './Teclado3D.jsx';

// Escenario: luz de estudio generada en el momento (sin descargar mapas de entorno), sombra de
// contacto y el teclado. Se para cuando sale de la pantalla para no gastar batería.

function Camara({ distancia, altura }) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    camera.position.set(0, altura * distancia, distancia);
    camera.lookAt(0, 0, 0.01);
    invalidate();
  }, [camera, invalidate, distancia, altura]);
  return null;
}

// Luz de estudio: tres paneles emisivos alrededor, horneados una vez en un mapa de entorno (PMREM).
// Es lo mismo que hacían <Environment> y <Lightformer>, sin arrastrar sus cargadores de HDR.
function Entorno() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const estudio = new THREE.Scene();
    estudio.background = new THREE.Color('#3a2356');
    const panel = (geo, color, intensidad, pos, rot, esc) => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensidad), side: THREE.DoubleSide, toneMapped: false }));
      m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...esc);
      estudio.add(m);
    };
    const plano = new THREE.PlaneGeometry(1, 1);
    const anillo = new THREE.RingGeometry(0.5, 1, 48);
    panel(plano, '#ffffff', 3, [0, 3, 0.5], [Math.PI / 2, 0, 0], [4, 2, 1]);
    panel(plano, '#ffffff', 1.4, [-3, 1, 1], [0, Math.PI / 2, 0], [3, 1.5, 1]);
    panel(anillo, '#f0c36a', 1.2, [2.5, 1, -2], [0, 0, 0], [2, 2, 2]);
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromScene(estudio, 0.04);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.7;
    invalidate();
    return () => {
      scene.environment = null;
      rt.dispose(); pm.dispose(); plano.dispose(); anillo.dispose();
      estudio.traverse((o) => o.material?.dispose());
    };
  }, [gl, scene, invalidate]);
  return null;
}

// Render bajo demanda: se pinta un fotograma solo cuando pasa algo (tecla, toque, scroll)
function Despertador({ visible }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => { if (visible) invalidate(); }, [visible, invalidate]);
  useEffect(() => {
    const f = () => invalidate();
    const ev = ['keydown', 'keyup', 'pointerdown', 'pointerup', 'blur'];
    ev.forEach((e) => window.addEventListener(e, f));
    window.addEventListener('scroll', f, { passive: true });
    return () => { ev.forEach((e) => window.removeEventListener(e, f)); window.removeEventListener('scroll', f); };
  }, [invalidate]);
  return null;
}

export default function Escena({ distancia = 0.42, altura = 0.95, controles = false, className = '', etiqueta, ...teclado }) {
  const caja = useRef();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '120px' });
    if (caja.current) io.observe(caja.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={caja} className={`relative ${className}`} role="img" aria-label={etiqueta}>
      <Canvas frameloop={visible ? 'demand' : 'never'} dpr={[1, 1.5]} camera={{ fov: 32, near: 0.01, far: 10, position: [0, 0.4, 0.42] }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <Camara distancia={distancia} altura={altura} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[0.3, 1, 0.4]} intensity={1.2} />
        <Entorno />
        <Despertador visible={visible} />
        <Teclado3D {...teclado} />
        <ContactShadows position={[0, -0.02, 0]} opacity={0.55} scale={0.8} blur={2.2} far={0.12} resolution={256} frames={2} color="#0d0616" />
        {controles ? <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.25} maxPolarAngle={1.2} enableDamping /> : null}
      </Canvas>
    </div>
  );
}
