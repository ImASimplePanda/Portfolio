import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import '@fontsource-variable/big-shoulders-display';
import '@fontsource-variable/schibsted-grotesk';
import './index.css';
import { SesionProvider } from './contexto/Sesion.jsx';
import Marco from './componentes/Marco.jsx';
import Inicio from './paginas/Inicio.jsx';
import { BASE } from './lib/base.js';

const Configurador = lazy(() => import('./paginas/Configurador.jsx'));
const Cita = lazy(() => import('./paginas/Cita.jsx'));
const VerCita = lazy(() => import('./paginas/VerCita.jsx'));
const Pedido = lazy(() => import('./paginas/Pedido.jsx'));
const Legal = lazy(() => import('./paginas/Legal.jsx'));
const NoEncontrada = lazy(() => import('./paginas/NoEncontrada.jsx'));
const Taller = lazy(() => import('./taller/Taller.jsx'));

const Cargando = () => <div className="min-h-[70vh]" aria-busy="true" />;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={BASE.replace(/\/$/, '') || '/'}>
      <SesionProvider>
        <Suspense fallback={<Cargando />}>
          <Routes>
            <Route path="/taller/*" element={<Taller />} />
            <Route element={<Marco />}>
              <Route index element={<Inicio />} />
              <Route path="configurador" element={<Configurador />} />
              <Route path="configurador/:codigo" element={<Configurador />} />
              <Route path="cita" element={<Cita />} />
              <Route path="cita/:codigo" element={<VerCita />} />
              <Route path="pedido/:codigo" element={<Pedido />} />
              <Route path="legal/:pagina" element={<Legal />} />
              <Route path="*" element={<NoEncontrada />} />
            </Route>
          </Routes>
        </Suspense>
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
);
