import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { getTenant } from '../data/tenant.js';
import InterruptorTema from '../components/InterruptorTema.jsx';

// "Cómo funciona", "Planes" y "Para universidades" apuntan a secciones de la
// landing. Si ya estamos en ella basta con desplazar; si no, hay que llegar
// primero y desplazar cuando la sección exista.
export function useIrASeccion() {
  const ir = useNavigate();
  const { pathname } = useLocation();
  return (id) => {
    if (id === 'metodologia') {
      if (pathname === '/') {
        window.dispatchEvent(new CustomEvent('abrir-metodologia'));
      } else {
        ir('/#metodologia');
      }
      return;
    }
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
  const { pathname } = useLocation();
  const volverALaApp = () => ir(usuario?.tipo === 'docente' ? '/docente' : '/chat');

  return (
    <div className="pila" style={{ minHeight: '100vh' }}>
      {pathname !== '/' && (
        <nav className="nav">
          <button className="marca" onClick={() => ir('/')} aria-label={`Ir al inicio de ${tenant.name}`}>
            <span className="marca__mono" aria-hidden="true">{tenant.mono}</span>
            <span className="pila" style={{ alignItems: 'flex-start', lineHeight: 1.15 }}>
              <strong style={{ fontSize: 15, fontWeight: 600 }}>{tenant.name}</strong>
              {tenant.powered && <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>con tecnología LMI-U</span>}
            </span>
          </button>

          <div className="fila" style={{ gap: 24, fontSize: 14 }}>
            <div className="nav__links">
              <button onClick={() => irA('sec-lumi')}>Conoce a Lumi</button>
              <button onClick={() => irA('sec-funciones')}>Funciones</button>
              <button onClick={() => irA('sec-casos')}>Casos de éxito</button>
              <button onClick={() => irA('sec-planes')}>Planes</button>
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
                <InterruptorTema />
                <Link to="/login" style={{ color: 'var(--text-primary)' }}>Iniciar sesión</Link>
                <Link to="/registro" className="btn btn--claro solo-desktop">Crear cuenta</Link>
              </>
            )}
          </div>
        </nav>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {pathname !== '/' && (
        <footer
          className="seccion"
          style={{
            borderTop: '1px solid var(--linea)',
            paddingBlock: 28,
            marginTop: 'auto',
          }}
        >
          <div className="fila" style={{ justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              © {new Date().getFullYear()} {tenant.name} · Inteligencia de mercado laboral en Perú
            </span>
            <div className="fila" style={{ gap: 20, fontSize: 13 }}>
              <button className="enlace" onClick={() => irA('metodologia')} style={{ color: 'var(--text-secondary)' }}>
                Metodología
              </button>
              <button className="enlace" onClick={() => irA('planes')} style={{ color: 'var(--text-secondary)' }}>
                Planes
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
