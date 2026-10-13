import ChromaGrid from '../components/rb/ChromaGrid.jsx';
import { artistas } from '../data/estudio.js';

export default function Artistas() {
  const items = artistas.map((a) => ({
    image: a.foto,
    alt: `Retrato de ${a.nombre} en el estudio`,
    title: a.nombre,
    subtitle: `${a.estilo}, desde ${a.desde}`,
    accent: '#ff4127',
  }));
  return (
    <section className="seccion artistas" id="artistas" aria-labelledby="artistas-t">
      <div className="envoltura">
        <h2 id="artistas-t" className="titular">Cuatro manos, un solo color</h2>
        <p className="entradilla">Cada artista firma su estilo. Si no sabes con quién, cuéntanos la idea y te lo decimos nosotros.</p>
        <ChromaGrid items={items} columns={4} minCardWidth={220} aspectRatio="4 / 5" cardRadius={2} radius={300} grayscale={1} dim={0.06} glow={0.35} />
      </div>
    </section>
  );
}
