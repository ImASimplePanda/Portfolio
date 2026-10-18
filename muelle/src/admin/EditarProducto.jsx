import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Upload, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { subida } from '../lib/base.js';
import { usarTitulo } from '../lib/usarDatos.js';
import { FAMILIAS, TIPOS } from '../lib/formato.js';
import { pulsar, combinar, despertar } from '../lib/sonido.js';
import Teclado2D from '../componentes/Teclado2D.jsx';
import { useTienda } from '../contexto/Tienda.jsx';

const VACIO = { tipo: 'interruptores', titulo: '', marca: 'Muelle', familia: 'lineal', formato: '', color: '#efe2c4', resumen: '', descripcion: '', specs: {}, precio: '', stock: 1, destacado: false, activo: true, imagenes: [] };
const COLORES_JUEGO = [['letras', 'Letras'], ['letrasRotulo', 'Rótulo de letras'], ['mods', 'Modificadores'], ['modsRotulo', 'Rótulo de modificadores'], ['acento', 'Acento (Esc, Intro)'], ['acentoRotulo', 'Rótulo del acento']];

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
      precio: (p.precio / 100).toFixed(2).replace('.', ','), specs: p.specs && !Array.isArray(p.specs) ? p.specs : {}, imagenes: p.imagenes || [],
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

  const spec = (k) => d.specs?.[k] ?? '';
  const setSpec = (k, v) => setD((x) => ({ ...x, specs: { ...x.specs, [k]: v } }));
  const sonido = d.specs?.sonido ?? { tono: 1500, cuerpo: 0.5, brillo: 0.5 };
  const setSonido = (k, v) => setSpec('sonido', { ...sonido, familia: d.familia, [k]: Number(v) });
  const colores = d.specs?.colores ?? {};
  return (
    <form onSubmit={guardar} noValidate className="max-w-[900px]">
      <Link to="/admin/productos" className="text-sm text-serigrafia-tenue underline underline-offset-4">Volver a productos</Link>
      <h1 className="serigrafia text-5xl mt-2">{nuevo ? 'Nuevo producto' : d.titulo || 'Editar producto'}</h1>
      {mensaje ? <p role="alert" className="mt-6 rounded bg-alerta/15 text-alerta p-4 font-medium">{mensaje}</p> : null}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <C id="tipo" etiqueta="Tipo">
          <select className="campo" {...prop('tipo')}>{Object.entries(TIPOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
        </C>
        <C id="titulo" etiqueta="Nombre" error={errores.titulo}><input className="campo" {...prop('titulo')} maxLength={200} /></C>
        <C id="marca" etiqueta="Marca"><input className="campo" {...prop('marca')} maxLength={80} /></C>
        <C id="precio" etiqueta={d.tipo === 'interruptores' ? 'Precio del pack de 10 (€)' : 'Precio (€)'} error={errores.precio}><input className="campo" inputMode="decimal" {...prop('precio')} placeholder="7,00" /></C>
        <C id="stock" etiqueta={d.tipo === 'interruptores' ? 'Stock (packs)' : 'Stock'} error={errores.stock}><input className="campo" type="number" min="0" max="99999" {...prop('stock')} /></C>
        <C id="color" etiqueta="Color principal"><input className="campo !p-1 h-[2.875rem]" type="color" value={d.color || '#efe2c4'} onChange={set('color')} /></C>
        <C id="resumen" etiqueta="Resumen (una frase)" className="sm:col-span-2"><input className="campo" {...prop('resumen')} maxLength={300} /></C>
        {d.tipo === 'interruptores' ? (
          <>
            <C id="familia" etiqueta="Tipo de interruptor" error={errores.familia}><select className="campo" {...prop('familia')}>{Object.entries(FAMILIAS).map(([v, f]) => <option key={v} value={v}>{f.nombre}</option>)}</select></C>
            <C id="fuerza" etiqueta="Fuerza (g)"><input id="fuerza" className="campo" type="number" min="20" max="120" value={spec('fuerza')} onChange={(e) => setSpec('fuerza', Number(e.target.value))} /></C>
            <C id="recorrido" etiqueta="Recorrido (mm)"><input id="recorrido" className="campo" type="number" step="0.1" min="2" max="5" value={spec('recorrido')} onChange={(e) => setSpec('recorrido', Number(e.target.value))} /></C>
            <C id="carcasa" etiqueta="Material de la carcasa"><input id="carcasa" className="campo" value={spec('carcasa')} onChange={(e) => setSpec('carcasa', e.target.value)} maxLength={60} /></C>
            <fieldset className="sm:col-span-2 plano p-4 grid gap-3 sm:grid-cols-3">
              <legend className="font-semibold px-1">Sonido en la web</legend>
              {[['tono', 'Tono (Hz)', 800, 2600, 10], ['cuerpo', 'Cuerpo (grave)', 0, 1, 0.05], ['brillo', 'Brillo (agudo)', 0, 1, 0.05]].map(([k, t, min, max, paso]) => (
                <label key={k} className="grid gap-1 text-sm">{t}: <span className="numeros font-semibold">{sonido[k]}</span>
                  <input type="range" min={min} max={max} step={paso} value={sonido[k]} onChange={(e) => setSonido(k, e.target.value)} className="accent-[var(--color-cobre)]" />
                </label>
              ))}
              <button type="button" className="pad-linea sm:col-span-3 justify-self-start" onClick={() => { despertar(); pulsar(combinar({ ...sonido, familia: d.familia })); }}>Probar el sonido</button>
            </fieldset>
          </>
        ) : null}
        {d.tipo === 'teclas' ? (
          <>
            <C id="perfil" etiqueta="Perfil"><input id="perfil" className="campo" value={spec('perfil')} onChange={(e) => setSpec('perfil', e.target.value)} maxLength={40} /></C>
            <C id="material" etiqueta="Material"><input id="material" className="campo" value={spec('material')} onChange={(e) => setSpec('material', e.target.value)} maxLength={60} /></C>
            <fieldset className="sm:col-span-2 plano p-4 grid gap-4 sm:grid-cols-[1fr_1fr]">
              <legend className="font-semibold px-1">Colores del juego (los usa el teclado 3D)</legend>
              <div className="grid grid-cols-2 gap-3">
                {COLORES_JUEGO.map(([k, t]) => (
                  <label key={k} className="grid gap-1 text-sm">{t}<input type="color" className="campo !p-1 h-10" value={colores[k] || '#888888'} onChange={(e) => setSpec('colores', { ...colores, [k]: e.target.value })} /></label>
                ))}
              </div>
              <Teclado2D formato="65" colores={colores} carcasa="#1e102f" className="w-full h-auto self-center" titulo="Vista previa del juego" />
            </fieldset>
          </>
        ) : null}
        {d.tipo === 'teclado' ? (
          <C id="formato" etiqueta="Formato"><select className="campo" {...prop('formato')}><option value="">Sin indicar</option>{[['60', '60 %'], ['65', '65 %'], ['75', '75 %'], ['tkl', 'TKL']].map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></C>
        ) : null}
        <C id="descripcion" etiqueta="Descripción" className="sm:col-span-2"><textarea className="campo min-h-32" {...prop('descripcion')} maxLength={4000} /></C>
      </div>

      <fieldset className="mt-8">
        <legend className="font-semibold mb-3">Fotos</legend>
        <p className="text-sm text-serigrafia-tenue mb-3">JPG, PNG o WebP de hasta 12 MB. Se convierten a WebP en tres tamaños. Si no hay fotos, la tienda dibuja el producto.</p>
        <ul className="flex flex-wrap gap-3">
          {d.imagenes.map((img, i) => (
            <li key={img} className="relative">
              <img src={subida(img, 480)} alt={`Foto ${i + 1}`} className="size-28 object-cover rounded-lg border border-mascara-borde" width="112" height="112" />
              <button type="button" className="absolute -top-2 -right-2 size-8 grid place-items-center rounded-full bg-cobre text-mascara-honda" aria-label={`Quitar la foto ${i + 1}`} onClick={() => setD((x) => ({ ...x, imagenes: x.imagenes.filter((y) => y !== img) }))}><Trash2 size={15} /></button>
            </li>
          ))}
          <li>
            <label className="size-28 grid place-items-center text-center rounded-lg border-2 border-dashed border-mascara-borde hover:border-serigrafia-tenue cursor-pointer text-sm text-serigrafia-tenue focus-within:outline-2 focus-within:outline-cobre">
              <span className="grid justify-items-center gap-1"><Upload size={22} />{subiendo ? 'Subiendo…' : 'Añadir fotos'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={subir} disabled={subiendo} />
            </label>
          </li>
        </ul>
      </fieldset>

      <div className="mt-8 grid gap-3">
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="size-5 accent-[var(--color-cobre)]" checked={!!d.destacado} onChange={set('destacado')} /> Destacado en la portada</label>
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="size-5 accent-[var(--color-cobre)]" checked={!!d.activo} onChange={set('activo')} /> Visible en la tienda</label>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button type="submit" className="pad" disabled={guardando || subiendo}>{guardando ? 'Guardando…' : nuevo ? 'Crear producto' : 'Guardar cambios'}</button>
        {!nuevo ? <button type="button" className="pad-linea text-alerta" onClick={borrar}>Borrar producto</button> : null}
      </div>
    </form>
  );
}
