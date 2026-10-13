import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import '@fontsource-variable/anybody/wdth.css';
import '@fontsource-variable/familjen-grotesk';
import './index.css';
import { TiendaProvider } from './contexto/Tienda.jsx';
import Marco from './componentes/Marco.jsx';
import Inicio from './paginas/Inicio.jsx';
import { BASE } from './lib/base.js';

// La portada carga sola; el resto de páginas llega cuando se visitan
const Catalogo = lazy(() => import('./paginas/Catalogo.jsx'));
const Producto = lazy(() => import('./paginas/Producto.jsx'));
const Cesta = lazy(() => import('./paginas/Cesta.jsx'));
const Caja = lazy(() => import('./paginas/Caja.jsx'));
const Pedido = lazy(() => import('./paginas/Pedido.jsx'));
const Cuenta = lazy(() => import('./paginas/Cuenta.jsx'));
const Restablecer = lazy(() => import('./paginas/Restablecer.jsx'));
const Vender = lazy(() => import('./paginas/Vender.jsx'));
const Legal = lazy(() => import('./paginas/Legal.jsx'));
const NoEncontrada = lazy(() => import('./paginas/NoEncontrada.jsx'));
const Admin = lazy(() => import('./admin/Admin.jsx'));

const Cargando = () => <div className="min-h-[60vh]" aria-busy="true" />;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={BASE.replace(/\/$/, '') || '/'}>
      <TiendaProvider>
        <Suspense fallback={<Cargando />}>
          <Routes>
            <Route path="/admin/*" element={<Admin />} />
            <Route element={<Marco />}>
              <Route index element={<Inicio />} />
              <Route path="discos" element={<Catalogo tipo="vinilo" />} />
              <Route path="tocadiscos" element={<Catalogo tipo="tocadiscos" />} />
              <Route path="accesorios" element={<Catalogo tipo="accesorio" />} />
              <Route path="producto/:slug" element={<Producto />} />
              <Route path="cesta" element={<Cesta />} />
              <Route path="caja" element={<Caja />} />
              <Route path="pedido/:codigo" element={<Pedido />} />
              <Route path="cuenta" element={<Cuenta />} />
              <Route path="cuenta/restablecer" element={<Restablecer />} />
              <Route path="vender" element={<Vender />} />
              <Route path="legal/:pagina" element={<Legal />} />
              <Route path="*" element={<NoEncontrada />} />
            </Route>
          </Routes>
        </Suspense>
      </TiendaProvider>
    </BrowserRouter>
  </StrictMode>
);
