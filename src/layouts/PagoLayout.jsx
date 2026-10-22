import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { getTenant } from '../data/tenant.js';
import { LumiLogo } from '../mascota/Lumi.jsx';

export default function PagoLayout() {
  const usuario = useApp((s) => s.usuario);
  const tenant = getTenant(useApp((s) => s.tenant));
  const rutaRetornoChat = useApp((s) => s.rutaRetornoChat) || '/chat';
  const ir = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const original = document.title;
    document.title = 'Pago seguro · LMI-U';
    return () => {
      document.title = original;
    };
  }, []);

  if (!usuario) return <Navigate to="/login" replace />;

  const esConfirmacion = pathname === '/confirmacion';

  return (
    <div className="pago-layout animate-fade" style={{ minHeight: '100svh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Cabecera dedicada y segura (como en pestaña independiente) ── */}
      <nav className="nav" style={{ justifyContent: 'space-between', padding: '14px clamp(16px, 4vw, 48px)', borderBottom: '1px solid var(--linea)', background: 'var(--bg-page)' }}>
        <button
          type="button"
          onClick={() => {
            if (window.opener) window.close();
            else ir(rutaRetornoChat);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'inherit' }}
          title="Volver al chat"
        >
          <LumiLogo alto={34} />
          <div className="pila" style={{ alignItems: 'flex-start', lineHeight: 1.15 }}>
            <strong style={{ fontSize: 16, fontWeight: 800 }}>{tenant.name}</strong>
          </div>
        </button>

        {/* Indicador de pestaña de chat activa idéntico a Imagen 2 */}
        <div className="fila solo-desktop" style={{ gap: 8, alignItems: 'center', fontSize: 13.5, color: 'var(--text-secondary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)' }} />
          <span>Tu chat sigue abierto en la otra pestaña</span>
        </div>

        <div className="fila" style={{ gap: 10, alignItems: 'center' }}>
          <span
            className="avatar"
            style={{ width: 34, height: 34, fontSize: 12, fontWeight: 700 }}
            title={`Conectado como ${usuario.nombre}`}
          >
            {usuario.iniciales}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{usuario.nombre.split(' ')[0]}</span>
        </div>
      </nav>

      {/* ── Contenido Principal de la Pasarela ── */}
      <main style={{ flex: 1, width: '100%', maxWidth: 1120, margin: '0 auto', padding: 'clamp(20px, 3.5vw, 40px) 16px', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
}
