import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* ── Cliente de la API ─────────────────────────────────────────────
   `credentials: "same-origin"` es lo que hace viajar la cookie de
   sesión. Sin eso todo devuelve 401 y cuesta media tarde encontrarlo. */
export async function api(ruta, opciones = {}) {
  const r = await fetch(`/api${ruta}`, {
    credentials: "same-origin",
    headers: opciones.body ? { "content-type": "application/json" } : undefined,
    ...opciones,
    body: opciones.body ? JSON.stringify(opciones.body) : undefined,
  });
  let datos = null;
  try {
    datos = await r.json();
  } catch {
    /* respuesta sin cuerpo */
  }
  if (!r.ok) {
    const e = new Error(datos?.error || "No se ha podido completar la operación.");
    e.estado = r.status;
    throw e;
  }
  return datos;
}

/* ── Formato ───────────────────────────────────────────────────────
   El dinero llega en céntimos enteros desde el servidor y sólo se
   convierte aquí, al pintarlo. Nunca se calcula en coma flotante. */
export const eur = (cent) =>
  (cent / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });

export const fecha = (iso) =>
  new Date(iso.replace(" ", "T") + (iso.includes("Z") ? "" : "Z")).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function nivelStock(n) {
  if (n <= 0) return { clase: "sin", texto: "Sin stock" };
  if (n < 50) return { clase: "bajo", texto: `${n} ud.` };
  return { clase: "ok", texto: `${n} ud.` };
}

/* ── Enrutado por hash ─────────────────────────────────────────────
   Cuatro vistas no justifican una librería de rutas de 20 kB. El hash
   da atrás/adelante del navegador y enlaces compartibles. */
const suscribir = (fn) => {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
};

export function useRuta() {
  const hash = useSyncExternalStore(
    suscribir,
    () => window.location.hash.slice(1) || "/",
    () => "/",
  );
  const ir = useCallback((destino) => {
    window.location.hash = destino;
    window.scrollTo(0, 0);
  }, []);
  return [hash, ir];
}

/* ── Pedido en curso ───────────────────────────────────────────────
   El borrador se guarda EN LA CUENTA del cliente, no en el navegador.
   Asi sobrevive a cerrar sesion, al cierre del navegador y se puede
   retomar desde otro equipo; y como vive tras el login, el borrador de
   un cliente no puede acabar delante de otro.

   Se guardan solo sku y cantidad. El nombre y el precio se toman del
   catalogo que ve ESTE cliente al pintarlo, asi que un cambio de precio
   nunca deja un importe viejo colgado en pantalla. */
const RETARDO_GUARDADO = 600;

export function usePedido(usuarioId) {
  const [lineas, setLineas] = useState([]); // [{ sku, cantidad }]
  const [nota, setNota] = useState("");
  const [catalogo, setCatalogo] = useState(() => new Map());
  const [estado, setEstado] = useState("cargando"); // cargando | guardado | guardando
  const [actualizado, setActualizado] = useState(null);

  const listo = useRef(false);
  const temporizador = useRef(null);

  /* Al entrar (o al cambiar de usuario) se trae SU borrador. */
  useEffect(() => {
    let vivo = true;
    /* El estado ya arranca en "cargando"; al cambiar de usuario el
       componente se desmonta y se vuelve a montar, asi que no hace falta
       ponerlo a mano y de paso el efecto no llama a setState de forma
       sincrona. */
    listo.current = false;
    api("/borrador")
      .then((d) => {
        if (!vivo) return;
        setLineas(Array.isArray(d.lineas) ? d.lineas : []);
        setNota(d.nota || "");
        setActualizado(d.actualizado);
      })
      .catch(() => vivo && setLineas([]))
      .finally(() => {
        if (!vivo) return;
        setEstado("guardado");
        listo.current = true;
      });
    return () => {
      vivo = false;
    };
  }, [usuarioId]);

  /* Guardado con retardo: escribir una cantidad no puede disparar una
     peticion por tecla. */
  useEffect(() => {
    if (!listo.current) return;
    setEstado("guardando");
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      api("/borrador", { method: "PUT", body: { lineas, nota } })
        .then((d) => {
          setActualizado(d.actualizado);
          setEstado("guardado");
        })
        .catch(() => setEstado("guardado"));
    }, RETARDO_GUARDADO);
    return () => clearTimeout(temporizador.current);
  }, [lineas, nota]);

  const poner = useCallback((producto, cantidad) => {
    const c = Math.floor(Number(cantidad));
    setLineas((prev) => {
      const resto = prev.filter((l) => l.sku !== producto.sku);
      if (!Number.isFinite(c) || c < 1) return resto;
      return [...resto, { sku: producto.sku, cantidad: c }];
    });
  }, []);

  const quitar = useCallback((sku) => setLineas((p) => p.filter((l) => l.sku !== sku)), []);

  const vaciar = useCallback(() => {
    setLineas([]);
    setNota("");
    api("/borrador", { method: "DELETE" }).catch(() => {});
  }, []);

  /* El catalogo del cliente, para poder pintar nombres y precios. */
  const revisar = useCallback((productos) => {
    setCatalogo(new Map(productos.map((p) => [p.sku, p])));
  }, []);

  /* Lineas ya resueltas contra el catalogo actual. Lo que ya no exista
     en el catalogo de este cliente simplemente no se pinta. */
  const detalle = lineas
    .map((l) => {
      const p = catalogo.get(l.sku);
      if (!p) return null;
      return {
        sku: l.sku,
        cantidad: l.cantidad,
        nombre: p.nombre,
        formato: p.formato,
        stock: p.stock,
        precio_cent: p.precio?.cent ?? 0,
      };
    })
    .filter(Boolean);

  const total = detalle.reduce((s, l) => s + l.precio_cent * l.cantidad, 0);

  return {
    lineas: detalle,
    crudas: lineas,
    nota,
    setNota,
    poner,
    quitar,
    vaciar,
    revisar,
    total,
    estado,
    actualizado,
  };
}
