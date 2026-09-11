import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/* ---------------------------------------------------------------
   Preferencia de movimiento reducido, reactiva.
   useSyncExternalStore evita desincronizarse si el usuario la cambia
   con la página abierta.
   --------------------------------------------------------------- */
const mmReduce =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function suscribir(fn) {
  mmReduce?.addEventListener("change", fn);
  return () => mmReduce?.removeEventListener("change", fn);
}

export function useMovimientoReducido() {
  return useSyncExternalStore(
    suscribir,
    () => mmReduce?.matches ?? false,
    () => false,
  );
}

/* ---------------------------------------------------------------
   Consulta de medios genérica (para el punto de corte del escritorio)
   --------------------------------------------------------------- */
export function useMedia(consulta) {
  const [coincide, setCoincide] = useState(
    () => typeof window !== "undefined" && window.matchMedia(consulta).matches,
  );
  useEffect(() => {
    const mm = window.matchMedia(consulta);
    const fn = () => setCoincide(mm.matches);
    fn();
    mm.addEventListener("change", fn);
    return () => mm.removeEventListener("change", fn);
  }, [consulta]);
  return coincide;
}

/* ---------------------------------------------------------------
   Revelado al entrar en pantalla.
   Umbral bajo, deja de observar al entrar, y red de seguridad a los
   2,5 s: el contenido nunca depende de que la animación funcione.
   --------------------------------------------------------------- */
export function useEnPantalla(ref) {
  const reduce = useMovimientoReducido();
  /* si el navegador no trae IntersectionObserver se arranca ya revelado,
     así el efecto nunca tiene que llamar a setState de forma síncrona */
  const [visto, setVisto] = useState(
    () => typeof window !== "undefined" && !("IntersectionObserver" in window),
  );

  useEffect(() => {
    if (visto || reduce) return;
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setVisto(true);
        obs.unobserve(el);
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.03 },
    );
    obs.observe(el);

    const red = setTimeout(() => setVisto(true), 2500);
    return () => {
      obs.disconnect();
      clearTimeout(red);
    };
  }, [ref, reduce, visto]);

  /* con movimiento reducido se revela siempre: derivado, no en el estado */
  return reduce || visto;
}

/* ---------------------------------------------------------------
   Scroll: una sola pasada por fotograma y listener pasivo.
   La función se guarda en una ref para no volver a suscribirse en
   cada render.
   --------------------------------------------------------------- */
export function useScrollRaf(fn, activo = true) {
  const fnRef = useRef(fn);
  /* escribir en una ref durante el render rompe las reglas de React;
     se sincroniza después de cada render */
  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    if (!activo) return;
    let pendiente = false;

    const alScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        pendiente = false;
        fnRef.current(window.scrollY);
      });
    };

    window.addEventListener("scroll", alScroll, { passive: true });
    alScroll();
    return () => window.removeEventListener("scroll", alScroll);
  }, [activo]);
}

/* ---------------------------------------------------------------
   Medida al cargar y al redimensionar, nunca dentro del bucle
   --------------------------------------------------------------- */
export function useMedir(medir, deps = []) {
  const medirRef = useRef(medir);
  useEffect(() => {
    medirRef.current = medir;
  });

  useEffect(() => {
    let t;
    const conRetardo = () => {
      clearTimeout(t);
      t = setTimeout(() => medirRef.current(), 150);
    };
    medirRef.current();
    window.addEventListener("resize", conRetardo, { passive: true });
    window.addEventListener("load", () => medirRef.current());
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", conRetardo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ---------------------------------------------------------------
   Contador
   --------------------------------------------------------------- */
export function useContador(hasta, activo) {
  const reduce = useMovimientoReducido();
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (!activo || reduce) return;
    let id;
    let t0 = null;
    const dur = 1200;
    const paso = (t) => {
      if (t0 === null) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      setValor(Math.round(hasta * (1 - Math.pow(1 - p, 4))));
      if (p < 1) id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [hasta, activo, reduce]);

  /* sin animación se enseña la cifra final directamente */
  return reduce ? hasta : valor;
}
