import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { CUENTAS_DEMO } from '../data/demo.js';

export default function Login() {
  const ir = useNavigate();
  const { entrar, entrarDemo } = useApp();

  const [f, setF] = useState({ email: '', clave: '' });
  const [error, setError] = useState('');

  const campo = (k) => ({ value: f[k], onChange: (e) => { setF({ ...f, [k]: e.target.value }); setError(''); } });

  const enviar = (e) => {
    e.preventDefault();
    const r = entrar(f);
    if (!r.ok) return setError(r.error);
    ir('/chat');
  };

  // Solo mostramos cuentas personales (estudiantes / egresados) para no alterar la interfaz
  const cuentasValidas = CUENTAS_DEMO.filter((c) => c.perfil?.tipo !== 'docente');

  return (
    <div className="centrado">
      <div className="pila animate-fade-up" style={{ width: '100%', maxWidth: 420, gap: 22 }}>
        <div className="pila" style={{ gap: 6 }}>
          <h1 className="display" style={{ margin: 0, fontSize: 38 }}>Inicia sesión</h1>
          <span style={{ fontSize: 14.5, color: 'var(--text-muted)' }}>
            Ingresa a tu cuenta para consultar el mercado laboral.
          </span>
        </div>

        {error && <div className="aviso-error animate-scale" role="alert">{error}</div>}

        <form className="pila" style={{ gap: 14 }} onSubmit={enviar} noValidate>
          <label className="campo">
            Correo electrónico
            <input {...campo('email')} type="email" placeholder="tu@correo.com" autoComplete="email" />
          </label>
          <label className="campo">
            Contraseña
            <input {...campo('clave')} type="password" placeholder="Tu contraseña" autoComplete="current-password" />
          </label>
          <button type="submit" className="btn btn--acento btn--grande btn--bloque" style={{ marginTop: 4 }}>
            Entrar
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            ¿No tienes cuenta? <Link to="/registro">Créala gratis</Link>
          </span>
        </form>

        <div className="separador">o prueba con una cuenta de demostración</div>

        <div className="pila" style={{ gap: 8 }}>
          {cuentasValidas.map((c) => (
            <button
              key={c.id}
              className="opcion animate-scale"
              aria-label={`Entrar como ${c.etiqueta}. ${c.detalle}`}
              onClick={() => { entrarDemo(c.id); ir('/chat'); }}
            >
              <strong style={{ fontSize: 14.5 }}>{c.etiqueta}</strong>
              <small style={{ color: 'var(--text-muted)' }}>{c.detalle}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
