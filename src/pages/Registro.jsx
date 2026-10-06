import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Registro() {
  const ir = useNavigate();
  const registrar = useApp((s) => s.registrar);
  const [f, setF] = useState({ nombre: '', email: '', clave: '' });
  const [error, setError] = useState('');

  const campo = (k) => ({ value: f[k], onChange: (e) => { setF({ ...f, [k]: e.target.value }); setError(''); } });

  const crear = (datos) => {
    const r = registrar(datos);
    if (!r.ok) return setError(r.error);
    ir('/onboarding');
  };

  const enviar = (e) => {
    e.preventDefault();
    if (f.nombre.trim().length < 3) return setError('Escribe tu nombre completo.');
    if (!CORREO_OK.test(f.email)) return setError('Ese correo no parece válido.');
    if (f.clave.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    crear(f);
  };

  return (
    <div className="centrado">
      <div className="pila" style={{ width: '100%', maxWidth: 420, gap: 22 }}>
        <div className="pila" style={{ gap: 8 }}>
          <h1 className="display" style={{ margin: 0, fontSize: 38 }}>Crea tu cuenta</h1>
          <span style={{ fontSize: 14.5, color: 'var(--text-muted)' }}>3 consultas gratis cada mes. Sin tarjeta.</span>
        </div>

        <form className="pila" style={{ gap: 14 }} onSubmit={enviar} noValidate>
          <button
            type="button"
            className="btn btn--linea"
            style={{ padding: 14, borderRadius: 'var(--radius-md)', fontWeight: 500 }}
            onClick={() => crear({ nombre: 'Camila Flores', email: 'camila.flores@gmail.com', clave: 'google-oauth' })}
          >
            Continuar con Google
          </button>

          <div className="separador">o con tu correo</div>

          {error && <div className="aviso-error" role="alert">{error}</div>}

          <label className="campo">
            Nombre completo
            <input {...campo('nombre')} placeholder="Tu nombre y apellido" autoComplete="name" />
          </label>
          <label className="campo">
            Correo
            <input {...campo('email')} type="email" placeholder="tu@correo.com" autoComplete="email" />
          </label>
          <label className="campo">
            Contraseña
            <input {...campo('clave')} type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
          </label>

          <button type="submit" className="btn btn--acento btn--grande btn--bloque" style={{ marginTop: 4 }}>
            Crear cuenta gratis
          </button>

          <span style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </span>
        </form>
      </div>
    </div>
  );
}
