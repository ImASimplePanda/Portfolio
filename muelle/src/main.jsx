import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from 'react-router';
import '@fontsource/chakra-petch/600.css';
import '@fontsource-variable/hanken-grotesk';
import './index.css';
import { setNonce } from 'get-nonce';

// Nonce de la CSP para los estilos que crea el panel lateral (bloqueo del scroll)
const nonce = document.querySelector('meta[property="csp-nonce"]')?.content;
if (nonce) setNonce(nonce);
import { TiendaProvider } from './contexto/Tienda.jsx';
import Marco from './componentes/Marco.jsx';
import Inicio from './paginas/Inicio.jsx';
import { BASE } from './lib/base.js';
import { paginas, precargarAlApuntar, precargarEnReposo } from './lib/precarga.js';

precargarEnReposo();
precargarAlApuntar();

// La portada carga sola; el resto de páginas llega cuando se visitan
const Catalogo = lazy(paginas.catalogo);
const Producto = lazy(paginas.producto);
const Cesta = lazy(paginas.cesta);
const Caja = lazy(paginas.caja);
const Pedido = lazy(() => import('./paginas/Pedido.jsx'));
const Cuenta = lazy(() => import('./paginas/Cuenta.jsx'));
const Restablecer = lazy(() => import('./paginas/Restablecer.jsx'));
const Montador = lazy(paginas.montador);
const Legal = lazy(() => import('./paginas/Legal.jsx'));
const NoEncontrada = lazy(() => import('./paginas/NoEncontrada.jsx'));
const Admin = lazy(() => import('./admin/Admin.jsx'));

const Cargando = () => <div className="min-h-[100svh]" aria-busy="true" />;

// Router de datos: permite las transiciones de vista entre páginas (enlaces con viewTransition)
const Raiz = () => <Suspense fallback={<Cargando />}><Outlet /></Suspense>;
const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<Raiz />}>
    <Route path="/admin/*" element={<Admin />} />
    <Route element={<Marco />}>
      <Route index element={<Inicio />} />
      <Route path="tienda" element={<Catalogo />} />
      <Route path="tienda/:seccion" element={<Catalogo />} />
      <Route path="montador" element={<Montador />} />
      <Route path="producto/:slug" element={<Producto />} />
      <Route path="cesta" element={<Cesta />} />
      <Route path="caja" element={<Caja />} />
      <Route path="pedido/:codigo" element={<Pedido />} />
      <Route path="cuenta" element={<Cuenta />} />
      <Route path="cuenta/restablecer" element={<Restablecer />} />
      <Route path="legal/:pagina" element={<Legal />} />
      <Route path="*" element={<NoEncontrada />} />
    </Route>
  </Route>,
), { basename: BASE.replace(/\/$/, '') || '/' });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TiendaProvider>
      <RouterProvider router={router} />
    </TiendaProvider>
  </StrictMode>
);
