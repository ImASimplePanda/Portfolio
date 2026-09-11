import "./estilo.css";
import { useEffect } from "react";
import { useRuta, usePedido } from "./lib/nucleo.js";
import { ProveedorSesion } from "./lib/sesion.jsx";
import { useSesion } from "./lib/contexto.js";
import { Puerta } from "./paginas/Puerta.jsx";
import { Catalogo } from "./paginas/Catalogo.jsx";
import { Pedidos } from "./paginas/Pedidos.jsx";
import { Panel } from "./paginas/Panel.jsx";
import { Cuenta } from "./paginas/Cuenta.jsx";

function Almacen() {
  const { usuario, salir } = useSesion();
  const [ruta, ir] = useRuta();
  const pedido = usePedido(usuario.id);
  const gestiona = usuario.rol !== "cliente";

  const vistas = [
    ["/catalogo", "Catálogo"],
    ["/pedidos", gestiona ? "Pedidos" : "Mis pedidos"],
    ...(gestiona ? [["/panel", "Panel"]] : []),
    ["/cuenta", "Mi cuenta"],
  ];

  /* Una ruta que no existe, o el panel sin permiso, cae al catálogo. */
  useEffect(() => {
    const validas = vistas.map(([r]) => r);
    if (!validas.includes(ruta)) ir("/catalogo");
  }, [ruta]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <header className="a-barra">
        <a className="marca" href="#/catalogo">
          <span className="marca-n">Almogarén</span>
          <span className="marca-s">Despensa insular</span>
        </a>
        <nav className="a-nav" aria-label="Secciones">
          {vistas.map(([r, t]) => (
            <button key={r} aria-current={ruta === r ? "page" : undefined} onClick={() => ir(r)}>
              {t}
            </button>
          ))}
        </nav>
        <div className="a-yo">
          <span className="empresa">{usuario.empresa || usuario.nombre}</span>
          {usuario.tarifa && <span className="tarifa">{usuario.tarifa} −{usuario.descuento_pct}%</span>}
          <button onClick={salir}>Salir</button>
        </div>
      </header>

      <main className="a-cuerpo">
        {ruta === "/catalogo" && <Catalogo pedido={pedido} ir={ir} />}
        {ruta === "/pedidos" && <Pedidos />}
        {ruta === "/panel" && gestiona && <Panel />}
        {ruta === "/cuenta" && <Cuenta />}
      </main>
    </div>
  );
}

function Raiz() {
  const { usuario, cargando } = useSesion();
  if (cargando) return <p className="cargando">Cargando…</p>;
  return usuario ? <Almacen /> : <Puerta />;
}

export default function App() {
  return (
    <ProveedorSesion>
      <Raiz />
    </ProveedorSesion>
  );
}
