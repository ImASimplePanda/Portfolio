import { useEffect, useState } from "react";
import { api } from "../lib/nucleo.js";
import { useSesion } from "../lib/contexto.js";

const CUENTAS_DEMO = [
  ["compras@hotelmaspalomas.test", "Cadena hotelera", "−15 %"],
  ["pedidos@restaurantevegueta.test", "Restaurante", "−8 %"],
  ["hola@tiendateror.test", "Tienda", "tarifa general"],
  ["admin@almogaren.test", "Dirección", "panel"],
];

export function Puerta() {
  const { entrar } = useSesion();
  const [categorias, setCategorias] = useState([]);
  const [productores, setProductores] = useState([]);
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [barraFija, setBarraFija] = useState(false);

  /* Una sola pasada por fotograma y listener pasivo: mover la barra no
     puede costar fluidez al scroll. */
  useEffect(() => {
    let pendiente = false;
    const alScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        pendiente = false;
        setBarraFija(window.scrollY > window.innerHeight * 0.7);
      });
    };
    window.addEventListener("scroll", alScroll, { passive: true });
    alScroll();
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  /* La portada lee del catálogo real: las categorías y los productores
     que se ven aquí salen de la misma base que el almacén. */
  useEffect(() => {
    api("/categorias").then((d) => setCategorias(d.categorias)).catch(() => {});
    api("/productores").then((d) => setProductores(d.productores)).catch(() => {});
  }, []);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await entrar(email, clave);
      window.location.hash = "/catalogo";
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const referencias = categorias.reduce((s, c) => s + c.n, 0);

  return (
    <div className="puerta">
      <header className={`p-barra${barraFija ? " fija" : ""}`}>
        <a className="marca" href="#/">
          <span className="marca-n">Almogarén</span>
          <span className="marca-s">Despensa insular</span>
        </a>
        <a className="btn btn-sec btn-min" href="#acceso">
          Acceso clientes
        </a>
      </header>

      <section className="p-hero">
        <div className="p-hero-media">
          {/* AVIF para la imagen del primer pliegue y WebP de respaldo.
              Cuatro escalones y no tres porque a sangre cubre de 390 a
              2560 px de viewport. fetchpriority alto y sin lazy: es el LCP.
              Para cambiarla por video, sustituye este <picture> por un
              <video muted playsinline loop poster="/img/hero__costa_960.webp">. */}
          <picture>
            <source
              type="image/avif"
              srcSet="/img/hero__costa_640.avif 640w, /img/hero__costa_960.avif 960w, /img/hero__costa_1400.avif 1400w, /img/hero__costa_1920.avif 1920w"
              sizes="100vw"
            />
            <img
              src="/img/hero__costa_1400.webp"
              srcSet="/img/hero__costa_640.webp 640w, /img/hero__costa_960.webp 960w, /img/hero__costa_1400.webp 1400w, /img/hero__costa_1920.webp 1920w"
              sizes="100vw"
              width="1920"
              height="1280"
              fetchPriority="high"
              decoding="async"
              alt=""
            />
          </picture>
        </div>
        <div className="p-hero-velo" />

        <div className="p-hero-in">
          <p className="rotulo">Gran Canaria · desde 2016</p>
          <h1>El género de la isla, en su cocina antes de las siete.</h1>
          <p className="entrada">
            Siete productores de la isla, una sola furgoneta y un catálogo con
            el precio que usted tiene acordado. Ni tarifas genéricas ni
            llamadas para preguntar si queda queso.
          </p>
          <div className="p-hero-acciones">
            <a className="btn" href="#acceso">
              Entrar al catálogo
            </a>
            <a className="btn btn-sec" href="#movemos">
              Ver qué movemos
            </a>
          </div>
        </div>

        <div className="franja">
          <dl className="franja-in">
            <div>
              <dt>Referencias</dt>
              <dd>
                {referencias || "—"}
                <small>en {categorias.length || "—"} familias</small>
              </dd>
            </div>
            <div>
              <dt>Productores</dt>
              <dd>
                {productores.length || "—"}
                <small>todos en la isla</small>
              </dd>
            </div>
            <div>
              <dt>Corte de pedido</dt>
              <dd>
                18:00
                <small>reparto al día siguiente</small>
              </dd>
            </div>
            <div>
              <dt>Zona de reparto</dt>
              <dd>
                Toda la isla
                <small>
                  sur y cumbre, <span className="ej">días alternos</span>
                </small>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="seccion" id="movemos">
        <div className="sec-cab">
          <h2>Lo que movemos</h2>
          <p className="rotulo">Catálogo vivo · sin precios hasta iniciar sesión</p>
        </div>
        <ul className="tiras">
          {categorias.map((c, i) => (
            <li className="tira" key={c.categoria}>
              <span className="tira-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="tira-nom">{c.categoria}</span>
              <span className="tira-meta oculta-movil">
                {c.n} {c.n === 1 ? "referencia" : "referencias"}
              </span>
              <span className="tira-meta">→</span>
            </li>
          ))}
          {!categorias.length && (
            <li className="cargando">Cargando catálogo…</li>
          )}
        </ul>
      </section>

      <section className="seccion" style={{ paddingTop: 0 }}>
        <div className="sec-cab">
          <h2>Con quién trabajamos</h2>
          <p className="rotulo">Trato directo, sin intermediarios</p>
        </div>
        <div className="productores">
          {productores.map((p) => (
            <article className="productor" key={p.id}>
              <p className="zona">{p.zona}</p>
              <h3>{p.nombre}</h3>
              <p>{p.nota}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="oscuro">
        <section className="seccion">
          <div className="sec-cab">
            <h2>Cómo funciona</h2>
            <p className="rotulo">Sin llamadas ni hojas de cálculo</p>
          </div>
          <div className="pasos">
            <div className="paso">
              <p className="paso-n">Paso 1</p>
              <h3>Le abrimos cuenta</h3>
              <p>
                Un comercial visita, acuerda condiciones y le damos acceso. No
                hay registro automático: en mayorista cada tarifa se negocia.
              </p>
            </div>
            <div className="paso">
              <p className="paso-n">Paso 2</p>
              <h3>Pide cuando le venga bien</h3>
              <p>
                Entra y ve sus precios, no una tarifa genérica. El stock que
                aparece es el real del almacén en ese momento.
              </p>
            </div>
            <div className="paso">
              <p className="paso-n">Paso 3</p>
              <h3>Lo tiene por la mañana</h3>
              <p>
                Pedido antes de las 18:00, reparto al día siguiente. Puede
                seguir el estado desde su cuenta sin llamar a nadie.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="seccion" id="acceso">
        <div className="acceso">
          <div>
            <div className="sec-cab">
              <h2>Acceso de clientes</h2>
            </div>
            <p style={{ color: "var(--medio)", maxWidth: "46ch", marginBottom: "1.5rem" }}>
              El catálogo con precios es privado porque cada cliente tiene el
              suyo. Si todavía no trabaja con nosotros, escriba a{" "}
              <span className="ej">comercial@pendiente</span> y le visitamos.
            </p>
            <p style={{ color: "var(--medio)", maxWidth: "46ch", fontSize: ".9rem" }}>
              ¿Ha olvidado la contraseña? Su comercial puede restablecerla desde
              el panel; por seguridad no se envía por correo automáticamente.
            </p>
          </div>

          <div className="acceso-caja">
            <h2>Entrar</h2>
            <p className="sub">Con el correo que nos dio de alta.</p>

            <form className="form" onSubmit={enviar}>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <div className="campo">
                <label htmlFor="email">Correo</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="campo">
                <label htmlFor="clave">Contraseña</label>
                <input
                  id="clave"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                />
              </div>
              <button className="btn" type="submit" disabled={enviando}>
                {enviando ? "Comprobando…" : "Entrar"}
              </button>
            </form>

            <div className="demo">
              <strong>Cuentas de prueba</strong> — contraseña{" "}
              <span className="ej">almogaren</span>
              <table>
                <tbody>
                  {CUENTAS_DEMO.map(([c, quien, nota]) => (
                    <tr key={c}>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail(c);
                            setClave("almogaren");
                          }}
                        >
                          {quien}
                        </button>
                      </td>
                      <td>{nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <footer className="p-pie">
        <div className="p-pie-in">
          <span>
            <strong>Almogarén</strong> · Despensa insular
          </span>
          <span>
            Sitio de demostración. Productores, precios, stock y clientes son de
            ejemplo. Los tipos de producto y los sellos DOP/IGP sí son reales.
          </span>
          <span className="mono">
            Dirección y contacto: <span className="ej">pendiente</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
