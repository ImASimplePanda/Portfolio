import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import Bici from './Bici.jsx';

// Escenario de estudio: luz de softbox generada en el momento (sin descargar mapas de entorno),
// sombra de contacto en el suelo y la bici. Se para cuando sale de la pantalla.

function Giro({ activo, velocidad = 0.12, children }) {
  const ref = useRef();
  useFrame((_, dt) => { if (activo && ref.current) ref.current.rotation.y += dt * velocidad; });
  return <group ref={ref}>{children}</group>;
}

// Coloca la cámara de inicio (vista de tres cuartos desde el lado de la transmisión)
function Camara({ distancia }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0.55 * distancia, 0.55 * distancia * 0.45 + 0.35, distancia);
    camera.lookAt(0, 0.48, 0);
  }, [camera, distancia]);
  return null;
}

export default function Escena({ config, despiece, giro = false, controles = true, distancia = 2.6, className = '', etiqueta }) {
  const caja = useRef();
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' });
    if (caja.current) io.observe(caja.current);
    return () => io.disconnect();
  }, []);
  const quieto = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div ref={caja} className={`relative ${className}`} role="img" aria-label={etiqueta}>
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        shadows={false}
        camera={{ fov: 30, near: 0.05, far: 30, position: [1.4, 0.95, distancia] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Camara distancia={distancia} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[2, 4, 3]} intensity={1.1} />
        <Environment resolution={256} frames={1} environmentIntensity={0.6}>
          {/* fondo claro del estudio: es lo que reflejan las piezas metálicas */}
          <color attach="background" args={['#cfd2cd']} />
          <Lightformer form="rect" intensity={3} position={[0, 4, 1]} rotation-x={Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={1.6} position={[-4, 1.5, 2]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
          <Lightformer form="rect" intensity={1.2} position={[4, 1, -2]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} />
          <Lightformer form="ring" color="#e8c26b" intensity={0.8} position={[0, 1, -5]} scale={3} />
        </Environment>
        <Giro activo={giro && !quieto}>
          <Bici config={config} despiece={despiece} girarRuedas={giro && !quieto} />
        </Giro>
        <ContactShadows position={[0, 0, 0]} opacity={0.42} scale={4} blur={2.4} far={1.2} resolution={512} color="#1a1e21" />
        {controles ? (
          <OrbitControls target={[0, 0.48, 0]} enablePan={false} minDistance={1.4} maxDistance={4.2} minPolarAngle={0.35} maxPolarAngle={Math.PI / 2 - 0.04} enableDamping />
        ) : null}
      </Canvas>
    </div>
  );
}
