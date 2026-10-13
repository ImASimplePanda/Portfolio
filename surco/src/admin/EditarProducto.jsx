import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Upload02Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { api } from '../lib/api.js';
import { subida } from '../lib/base.js';
import { usarTitulo } from '../lib/usarDatos.js';
import { GRADOS, ORDEN_GRADOS } from '../lib/formato.js';
import { useTienda } from '../contexto/Tienda.jsx';

const VACIO = { tipo: 'vinilo', titulo: '', artista: '', sello: '', catalogo: '', anio: '', pais: '', genero: '', formato: 'LP', estado_disco: 'VG+', estado_funda: 'VG+', marca: '', descripcion: '', tracklist: '', precio: '', stock: 1, destacado: false, activo: true, imagenes: [] };

function C({ id, etiqueta, error, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="etiqueta">{etiqueta}</label>
      {children}
      {error ? <p id={`${id}-error`} className="error-campo">{error}</p> : null}
    </div>
  );
}

export default function EditarProducto() {
  const { id } = useParams();
  const nuevo = !id;
  usarTitulo(nuevo ? 'Nuevo producto' : 'Editar producto');
  const [d, setD] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const navegar = useNavigate();
  const { avisar } = useTienda();

  useEffect(() => {
    if (nuevo) return;
    api(`/admin/productos/${id}`).then(({ producto: p }) => setD({
      ...VACIO, ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v ?? ''])),
      precio: (p.precio / 100).toFixed(2).replace('.', ','), tracklist: (p.tracklist || []).join('\n'), imagenes: p.imagenes || [],
    })).catch((e) => setMensaje(e.message));
  }, [id, nuevo]);

  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const prop = (k) => ({ id: k, value: d[k] ?? '', onChange: set(k), 'aria-invalid': errores[k] ? 'true' : undefined, 'aria-describedby': errores[k] ? `${k}-error` : undefined });

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true); setMensaje(''); setErrores({});
    try {
      const r = await api(nuevo ? '/admin/productos' : `/admin/productos/${id}`, { metodo: nuevo ? 'POST' : 'PUT', datos: d });
      avisar(nuevo ? 'Producto creado' : 'Cambios guardados', r.producto.titulo);
      if (nuevo) navegar(`/admin/productos/${r.producto.id}`, { replace: true });
    } catch (err) {
      setErrores(err.campos || {});
      setMensaje(err.message);
      const primero = Object.keys(err.campos || {})[0];
      if (primero) requestAnimationFrame(() => document.getElementById(primero)?.focus());
    } finally {
      setGuardando(false);
    }
  };

  const subir = async (e) => {
    const ficheros = [...(e.target.files || [])];
    e.target.value = '';
    setSubiendo(true);
    for (const f of ficheros) {
      const fd = new FormData();
      fd.append('imagen', f);
      try {
        const r = await api('/admin/imagenes', { metodo: 'POST', formulario: fd });
        setD((x) => ({ ...x, imagenes: [...x.imagenes, r.imagen] }));
      } catch (err) {
        avisar(`No se ha subido ${f.name}`, err.message);
      }
    }
    setSubiendo(false);
  };

  const borrar = async () => {
    if (!window.confirm('¿Borrar este producto? Si ya se vendió alguna vez, se ocultará en vez de borrarse.')) return;
    const r = await api(`/admin/productos/${id}`, { metodo: 'DELETE' });
    avisar(r.oculto ? 'Producto ocultado' : 'Producto borrado');
    navegar('/admin/productos', { replace: true });
  };

  const disco = d.tipo === 'vinilo';
  return (
    <form onSubmit={guardar} noValidate className="max-w-[900px]">
      <Link to="/admin/productos" className="text-sm text-gris underline underline-offset-4">Volver a productos</Link>
      <h1 className="rotulo text-5xl mt-2">{nuevo ? 'Nuevo producto' : d.titulo || 'Editar producto'}</h1>
      {mensaje ? <p role="alert" className="mt-6 rounded-2xl bg-alerta-claro text-alerta p-4 font-medium">{mensaje}</p> : null}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <C id="tipo" etiqueta="Tipo">
          <select className="campo" {...prop('tipo')}><option value="vinilo">Disco</option><option value="tocadiscos">Tocadiscos</option><option value="accesorio">Accesorio</option></select>
        </C>
        <C id="titulo" etiqueta="Título" error={errores.titulo}><input className="campo" {...prop('titulo')} maxLength={200} /></C>
        {disco ? <C id="artista" etiqueta="Artista"><input className="campo" {...prop('artista')} maxLength={200} /></C> : <C id="marca" etiqueta="Marca"><input className="campo" {...prop('marca')} maxLength={80} /></C>}
        <C id="precio" etiqueta="Precio (€)" error={errores.precio}><input className="campo" inputMode="decimal" {...prop('precio')} placeholder="24,00" /></C>
        <C id="stock" etiqueta="Stock" error={errores.stock}><input className="campo" type="number" min="0" max="9999" {...prop('stock')} /></C>
        <C id="anio" etiqueta="Año"><input className="campo" type="number" min="1890" max="2100" {...prop('anio')} /></C>
        {disco ? (
          <>
            <C id="sello" etiqueta="Sello"><input className="campo" {...prop('sello')} maxLength={120} /></C>
            <C id="catalogo" etiqueta="Número de catálogo"><input className="campo" {...prop('catalogo')} maxLength={60} /></C>
            <C id="pais" etiqueta="País"><input className="campo" {...prop('pais')} maxLength={60} /></C>
            <C id="genero" etiqueta="Género"><input className="campo" {...prop('genero')} maxLength={60} list="generos" /></C>
            <datalist id="generos">{['Jazz', 'Soul y funk', 'Rock', 'Pop español', 'Latin', 'Electrónica', 'Folk canario', 'Bossa nova', 'Reggae', 'Clásica', 'Flamenco'].map((g) => <option key={g} value={g} />)}</datalist>
            <C id="formato" etiqueta="Formato"><select className="campo" {...prop('formato')}>{['LP', '2LP', '7"', '10"', '12"', 'Caja'].map((f) => <option key={f}>{f}</option>)}</select></C>
            <C id="estado_disco" etiqueta="Estado del disco"><select className="campo" {...prop('estado_disco')}>{ORDEN_GRADOS.map((g) => <option key={g} value={g}>{g}, {GRADOS[g].nombre}</option>)}</select></C>
            <C id="estado_funda" etiqueta="Estado de la funda"><select className="campo" {...prop('estado_funda')}>{ORDEN_GRADOS.map((g) => <option key={g} value={g}>{g}, {GRADOS[g].nombre}</option>)}</select></C>
            <C id="tracklist" etiqueta="Canciones (una por línea)" className="sm:col-span-2"><textarea className="campo min-h-40" {...prop('tracklist')} /></C>
          </>
        ) : null}
        <C id="descripcion" etiqueta="Descripción" className="sm:col-span-2"><textarea className="campo min-h-32" {...prop('descripcion')} maxLength={4000} /></C>
      </div>

      <fieldset className="mt-8">
        <legend className="font-semibold mb-3">Fotos</legend>
        <p className="text-sm text-gris mb-3">JPG, PNG o WebP de hasta 12 MB. Se convierten a WebP en tres tamaños. La primera es la portada.</p>
        <ul className="flex flex-wrap gap-3">
          {d.imagenes.map((img, i) => (
            <li key={img} className="relative">
              <img src={subida(img, 480)} alt={`Foto ${i + 1}`} className="size-28 object-cover rounded-lg border border-linea" width="112" height="112" />
              <button type="button" className="absolute -top-2 -right-2 size-8 grid place-items-center rounded-full bg-tinta text-white" aria-label={`Quitar la foto ${i + 1}`} onClick={() => setD((x) => ({ ...x, imagenes: x.imagenes.filter((y) => y !== img) }))}><HugeiconsIcon icon={Delete02Icon} size={15} /></button>
            </li>
          ))}
          <li>
            <label className="size-28 grid place-items-center text-center rounded-lg border-2 border-dashed border-linea hover:border-tinta cursor-pointer text-sm text-gris focus-within:outline-2 focus-within:outline-cobalto">
              <span className="grid justify-items-center gap-1"><HugeiconsIcon icon={Upload02Icon} size={22} />{subiendo ? 'Subiendo…' : 'Añadir fotos'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={subir} disabled={subiendo} />
            </label>
          </li>
        </ul>
      </fieldset>

      <div className="mt-8 grid gap-3">
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="size-5 accent-cobalto" checked={!!d.destacado} onChange={set('destacado')} /> Destacado en la portada</label>
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="size-5 accent-cobalto" checked={!!d.activo} onChange={set('activo')} /> Visible en la tienda</label>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button type="submit" className="boton" disabled={guardando || subiendo}>{guardando ? 'Guardando…' : nuevo ? 'Crear producto' : 'Guardar cambios'}</button>
        {!nuevo ? <button type="button" className="boton-linea text-alerta" onClick={borrar}>Borrar producto</button> : null}
      </div>
    </form>
  );
}
