import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useTienda } from '../contexto/Tienda.jsx';
import { api } from '../lib/api.js';
import { usarTitulo } from '../lib/usarDatos.js';
import { CampoCuenta } from './Cuenta.jsx';

export default function Restablecer() {
  usarTitulo('Nueva contraseña');
  const [params] = useSearchParams();
  const { sesion, setSesion } = useTienda();
  const [clave, setClave] = useState('');
  const [error, setError] = useState(null);
  const navegar = useNavigate();

  const enviar = async (e) => {
    e.preventDefault();
    try {
      const r = await api('/cuenta/restablecer', { metodo: 'POST', datos: { token: params.get('token') || '', clave } });
      setSesion({ ...sesion, usuario: r.usuario });
      navegar('/cuenta', { replace: true });
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="mx-auto max-w-[480px] px-4 pt-12">
      <h1 className="rotulo text-[clamp(2.6rem,6vw,4rem)]">Elige una contraseña nueva</h1>
      <form onSubmit={enviar} noValidate className="mt-8 grid gap-5">
        {error && !error.campos?.clave ? <p role="alert" className="rounded-2xl bg-alerta-claro text-alerta p-4 font-medium">{error.message} {error.estado === 410 ? <Link to="/cuenta" className="underline">Pedir otro enlace</Link> : null}</p> : null}
        <CampoCuenta id="clave" etiqueta="Contraseña nueva (mínimo 10 caracteres)" type="password" autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} error={error?.campos?.clave} />
        <button type="submit" className="boton">Guardar y entrar</button>
      </form>
    </div>
  );
}
