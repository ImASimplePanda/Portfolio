import { Component } from 'react';

// Si WebGL falla (equipo antiguo, navegador sin aceleración), se muestra el plano en su lugar
export class SinTres extends Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? this.props.alternativa : this.props.children; }
}

export function Campo({ id, etiqueta, error, ayuda, children }) {
  return (
    <div>
      <label htmlFor={id} className="etiqueta">{etiqueta}</label>
      {children}
      {ayuda && !error ? <p className="text-sm text-grafito mt-1">{ayuda}</p> : null}
      {error ? <p id={`${id}-error`} className="error-campo">{error}</p> : null}
    </div>
  );
}

// Bloque de contacto común a la cita y al encargo
export function DatosContacto({ datos, set, errores }) {
  const campo = (k, etiqueta, props) => (
    <Campo id={`c-${k}`} etiqueta={etiqueta} error={errores[k]}>
      <input id={`c-${k}`} className="campo" value={datos[k]} onChange={(e) => set({ ...datos, [k]: e.target.value })}
        aria-invalid={errores[k] ? 'true' : undefined} aria-describedby={errores[k] ? `c-${k}-error` : undefined} required {...props} />
    </Campo>
  );
  return (
    <div className="grid gap-4">
      {campo('nombre', 'Nombre y apellidos', { autoComplete: 'name', maxLength: 120 })}
      <div className="grid gap-4 sm:grid-cols-2">
        {campo('email', 'Correo', { type: 'email', autoComplete: 'email', inputMode: 'email', maxLength: 190 })}
        {campo('telefono', 'Teléfono', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', maxLength: 30 })}
      </div>
      <div>
        <label className="flex gap-3 items-start text-[0.95rem] leading-snug cursor-pointer">
          <input type="checkbox" className="mt-1 size-5 accent-[var(--color-tinta)] shrink-0" checked={datos.acepto} onChange={(e) => set({ ...datos, acepto: e.target.checked })}
            aria-invalid={errores.acepto ? 'true' : undefined} />
          <span>He leído la <a href={`${import.meta.env.BASE_URL}legal/privacidad`} target="_blank" rel="noopener" className="underline underline-offset-2">política de privacidad</a>. Usaremos tus datos solo para tu bici y tu cita.</span>
        </label>
        {errores.acepto ? <p className="error-campo">{errores.acepto}</p> : null}
      </div>
    </div>
  );
}

export const contactoVacio = { nombre: '', email: '', telefono: '', acepto: false };
