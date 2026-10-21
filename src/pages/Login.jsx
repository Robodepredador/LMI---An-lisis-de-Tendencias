import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { CUENTAS_DEMO } from '../data/demo.js';
import { LumiLogo } from '../mascota/Lumi.jsx';
import GoogleIcon from '../mascota/GoogleIcon.jsx';

export default function Login() {
  const ir = useNavigate();
  const { entrar, entrarDemo } = useApp();

  const [f, setF] = useState({ email: '', clave: '' });
  const [error, setError] = useState('');

  const campo = (k) => ({
    value: f[k],
    onChange: (e) => {
      setF({ ...f, [k]: e.target.value });
      setError('');
    },
  });

  const enviar = (e) => {
    e.preventDefault();
    if (!f.email || !f.clave) {
      return setError('Por favor completa tu correo y contraseña.');
    }
    const r = entrar(f);
    if (!r.ok) return setError(r.error);
    ir('/chat');
  };

  const loginConGoogle = () => {
    // Simulación de Google SSO con el perfil de estudiante Valeria
    entrarDemo('valeria');
    ir('/chat');
  };

  const cuentasValidas = CUENTAS_DEMO.filter((c) => c.perfil?.tipo !== 'docente');

  return (
    <div className="centrado" style={{ padding: '48px 24px', background: 'var(--bg-page)', minHeight: 'calc(100vh - 72px)' }}>
      <div
        className="pila animate-fade-up"
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radio-3xl)',
          padding: '36px 32px',
          gap: 18,
          border: '1px solid var(--linea)',
          boxShadow: 'var(--sombra-panel)',
        }}
      >
        <div className="fila" style={{ alignItems: 'center', gap: 10 }}>
          <LumiLogo alto={34} />
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800 }}>LMI-U</strong>
        </div>

        <div className="pila" style={{ gap: 4 }}>
          <h1 className="display" style={{ margin: 0, fontSize: 32, letterSpacing: '-0.02em' }}>Inicia sesión</h1>
          <span style={{ fontSize: 14.5, color: 'var(--text-secondary)' }}>
            Y empieza tus 3 consultas gratis del mes.
          </span>
        </div>

        {error && <div className="aviso-error animate-scale" role="alert">{error}</div>}

        <button
          type="button"
          onClick={loginConGoogle}
          style={{
            font: "600 15px 'Onest', system-ui, sans-serif",
            padding: '13px 16px',
            borderRadius: 'var(--radio-full)',
            border: '1.5px solid var(--linea)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
        >
          <GoogleIcon />
          Continuar con Google
        </button>

        <div className="fila" style={{ alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--linea)' }} />
          o con tu correo
          <span style={{ flex: 1, height: 1, background: 'var(--linea)' }} />
        </div>

        <form className="pila" style={{ gap: 14 }} onSubmit={enviar} noValidate>
          <label className="campo" style={{ gap: 6, fontSize: 13.5, fontWeight: 600 }}>
            Correo
            <input
              {...campo('email')}
              type="email"
              placeholder="tu@correo.edu.pe"
              autoComplete="email"
              style={{
                font: "400 15px 'Onest', system-ui, sans-serif",
                padding: '13px 14px',
                borderRadius: 'var(--radio-sm)',
                border: '1.5px solid var(--borde-campo)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            />
          </label>
          <label className="campo" style={{ gap: 6, fontSize: 13.5, fontWeight: 600 }}>
            <div className="fila" style={{ justifyContent: 'space-between' }}>
              <span>Contraseña</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--accent)', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</span>
            </div>
            <input
              {...campo('clave')}
              type="password"
              placeholder="Tu contraseña"
              autoComplete="current-password"
              style={{
                font: "400 15px 'Onest', system-ui, sans-serif",
                padding: '13px 14px',
                borderRadius: 'var(--radio-sm)',
                border: '1.5px solid var(--borde-campo)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            />
          </label>

          <button
            type="submit"
            className="btn btn--acento btn--bloque"
            style={{
              padding: '15px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 'var(--radio-full)',
              marginTop: 4,
            }}
          >
            Ingresar
          </button>

          <div className="fila" style={{ justifyContent: 'center', gap: 6, fontSize: 14, paddingTop: 6 }}>
            <span style={{ color: 'var(--text-secondary)' }}>¿No tienes cuenta?</span>
            <Link to="/registro" style={{ color: 'var(--accent)', fontWeight: 600 }}>Crea una gratis</Link>
          </div>
        </form>

        <div className="pila" style={{ borderTop: '1px solid var(--linea)', paddingTop: 14, gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 600 }}>
            O accede directamente con un perfil demo:
          </span>
          <div className="fila" style={{ gap: 8 }}>
            {cuentasValidas.map((c) => (
              <button
                key={c.id}
                type="button"
                className="chip chip--opcion"
                style={{ flex: 1, padding: '9px 12px', fontSize: 12.5, textAlign: 'center', justifyContent: 'center' }}
                onClick={() => { entrarDemo(c.id); ir('/chat'); }}
              >
                <strong>{c.etiqueta}</strong> ({c.perfil?.rol})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

