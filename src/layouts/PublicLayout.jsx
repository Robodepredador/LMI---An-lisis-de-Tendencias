import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { getTenant } from '../data/tenant.js';

// "Cómo funciona", "Planes" y "Para universidades" apuntan a secciones de la
// landing. Si ya estamos en ella basta con desplazar; si no, hay que llegar
// primero y desplazar cuando la sección exista.
export function useIrASeccion() {
  const ir = useNavigate();
  const { pathname } = useLocation();
  return (id) => {
    const desplazar = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    if (pathname === '/') {
      desplazar();
    } else {
      ir(`/#${id}`);
      setTimeout(desplazar, 50);
    }
  };
}

export default function PublicLayout() {
  const tenant = getTenant(useApp((s) => s.tenant));
  const usuario = useApp((s) => s.usuario);
  const irA = useIrASeccion();
  const ir = useNavigate();
  const volverALaApp = () => ir(usuario?.tipo === 'docente' ? '/docente' : '/chat');

  return (
    <div className="pila" style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <button className="marca" onClick={() => ir('/')} aria-label={`Ir al inicio de ${tenant.name}`}>
          <span className="marca__mono" aria-hidden="true">{tenant.mono}</span>
          <span className="pila" style={{ alignItems: 'flex-start', lineHeight: 1.15 }}>
            <strong style={{ fontSize: 15, fontWeight: 600 }}>{tenant.name}</strong>
            {tenant.powered && <span style={{ fontSize: 10.5, color: 'var(--text-dim)' }}>con tecnología LMI-U</span>}
          </span>
        </button>

        <div className="fila" style={{ gap: 24, fontSize: 14 }}>
          <div className="nav__links">
            <button onClick={() => irA('como-funciona')}>Cómo funciona</button>
            <button onClick={() => irA('metodologia')}>Metodología</button>
            <button onClick={() => irA('planes')}>Planes</button>
            <button onClick={() => irA('universidades')}>Para universidades</button>
          </div>
          {usuario ? (
            // Con sesión abierta, estas páginas se visitan desde dentro de la app:
            // ofrecer "iniciar sesión" aquí sería un despiste.
            <button className="fila" style={{ gap: 8, background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }} onClick={volverALaApp}>
              <span className="avatar" aria-hidden="true">{usuario.iniciales}</span>
              <span className="solo-desktop" style={{ fontSize: 14 }}>Volver a la app</span>
            </button>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-primary)' }}>Iniciar sesión</Link>
              <Link to="/registro" className="btn btn--claro solo-desktop">Crear cuenta</Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer
        className="seccion"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingBlock: 28,
          marginTop: 'auto',
        }}
      >
        <div className="fila" style={{ justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            © {new Date().getFullYear()} {tenant.name} · Inteligencia de mercado laboral en Perú
          </span>
          <div className="fila" style={{ gap: 20, fontSize: 13 }}>
            <button className="enlace" onClick={() => irA('metodologia')} style={{ color: 'var(--text-muted)' }}>
              Metodología
            </button>
            <button className="enlace" onClick={() => irA('planes')} style={{ color: 'var(--text-muted)' }}>
              Planes
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
