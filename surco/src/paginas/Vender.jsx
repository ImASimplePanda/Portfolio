import { HugeiconsIcon } from '@hugeicons/react';
import { WhatsappIcon } from '@hugeicons/core-free-icons';
import { usarTitulo } from '../lib/usarDatos.js';

const pasos = [
  ['Mándanos fotos', 'De las portadas y de la lista de discos. Si son muchos, basta con unas fotos de los lomos.'],
  ['Te hacemos una oferta', 'En dos o tres días, en dinero o en crédito para la tienda (el crédito vale un 20 % más).'],
  ['Los revisamos juntos', 'En la tienda o vamos a tu casa si la colección es grande. Pagamos en el momento.'],
];

export default function Vender() {
  usarTitulo('Vender tus discos');
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-10 pt-12">
      <h1 className="rotulo text-[clamp(2.8rem,7vw,5.6rem)] max-w-[14ch]">Vende tus discos a Surco</h1>
      <p className="mt-6 max-w-[56ch] text-lg text-gris">Compramos vinilos de todos los géneros, tocadiscos y equipos de música. Nos interesan sobre todo jazz, soul, música canaria y ediciones originales.</p>
      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {pasos.map(([t, d], i) => (
          <li key={t} className="rounded-2xl bg-papel border border-linea p-6">
            <p className="rotulo-ancho text-4xl text-cobalto">{i + 1}</p>
            <h2 className="mt-3 font-semibold text-xl">{t}</h2>
            <p className="mt-2 text-gris">{d}</p>
          </li>
        ))}
      </ol>
      <div className="mt-12 flex flex-wrap gap-3">
        <a className="boton" href={`https://wa.me/34600000000?text=${encodeURIComponent('Hola, quiero venderos unos discos.')}`} target="_blank" rel="noopener">
          <HugeiconsIcon icon={WhatsappIcon} size={20} strokeWidth={1.6} /> Escribir por WhatsApp
        </a>
        <a className="boton-linea" href="mailto:compras@surco.test">compras@surco.test</a>
      </div>
    </div>
  );
}
