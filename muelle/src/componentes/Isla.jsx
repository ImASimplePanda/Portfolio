import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ShoppingBag, Check, TriangleAlert } from 'lucide-react';
import Cifra from './Cifra.jsx';
import { useTienda } from '../contexto/Tienda.jsx';

// Isla de avisos (técnica de la Dynamic Island de SmoothUI): la pastilla de la cesta crece
// con un muelle para contar lo que acaba de pasar y vuelve a su tamaño.
export default function Isla({ abrir }) {
  const { unidades, avisos } = useTienda();
  const quieto = useReducedMotion();
  const aviso = avisos.at(-1);
  return (
    <motion.button type="button" layout onClick={abrir}
      className="relative flex items-center gap-2.5 h-11 pl-3.5 pr-4 rounded-full bg-cobre text-mascara-honda font-semibold overflow-hidden"
      style={{ borderRadius: 999 }}
      transition={quieto ? { duration: 0 } : { type: 'spring', bounce: 0.35, duration: 0.45 }}
      aria-haspopup="dialog">
      <span className="sr-only">Cesta: </span>
      <ShoppingBag size={19} strokeWidth={2} aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        {aviso ? (
          <motion.span key={aviso.id} className="flex items-center gap-2 whitespace-nowrap text-[0.92rem]"
            initial={{ opacity: 0, filter: 'blur(4px)', y: 6 }} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} exit={{ opacity: 0, filter: 'blur(4px)', y: -6 }}>
            {aviso.tipo === 'error' ? <TriangleAlert size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
            <span className="max-w-[46vw] truncate">{aviso.titulo}</span>
          </motion.span>
        ) : (
          <motion.span key="n" className="numeros" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Cifra valor={unidades} /><span className="sr-only"> {unidades === 1 ? 'producto' : 'productos'}</span>
          </motion.span>
        )}
      </AnimatePresence>
      <span className="sr-only" role="status">{aviso ? `${aviso.titulo}. ${aviso.descripcion}` : ''}</span>
    </motion.button>
  );
}

