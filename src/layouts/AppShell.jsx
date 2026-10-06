import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CONSULTAS_GRATIS, useApp } from '../store.js';
import { getTenant } from '../data/tenant.js';
import { proximaRenovacion, vigenciaCreditos } from '../data/contenido.js';
import ModalPlanes from '../components/ModalPlanes.jsx';

// El medidor de consumo. Es lo que traduce el plan a algo que el usuario
// entiende de un vistazo, así que vive en un solo sitio.
export function useMedidor() {
  const plan = useApp((s) => s.plan);
  const creditos = useApp((s) => s.creditos);
  const restantes = useApp((s) => s.restantes());
  const tenant = getTenant(useApp((s) => s.tenant));

  if (plan === 'institucional') {
    return { titulo: 'Licencia institucional', num: '∞', barra: null, corto: 'Ilimitado',
      nota: `${tenant.uni} · consultas ilimitadas`, cta: null };
  }
  if (plan === 'pro') {
    return { titulo: 'Plan Pro', num: '∞', barra: null, corto: 'Pro',
      nota: 'Consultas ilimitadas · renovación mensual', cta: null };
  }
  if (plan === 'creditos') {
    return { titulo: 'Créditos', num: String(creditos), barra: null, corto: `${creditos} cr.`,
      nota: `Válidos hasta el ${vigenciaCreditos()}`, cta: 'Comprar más' };
  }
  return {
    titulo: 'Plan gratis',
    num: `${restantes} de ${CONSULTAS_GRATIS}`,
    barra: (restantes / CONSULTAS_GRATIS) * 100,
    corto: `${restantes}/${CONSULTAS_GRATIS}`,
    nota: restantes === 0 ? `Se renueva el ${proximaRenovacion()}`
      : restantes === 1 ? 'Te queda 1 consulta este mes'
      : 'Consultas disponibles este mes',
    cta: restantes <= 1 ? 'Ver planes' : null,
  };
}

function Medidor({ compacto }) {
  const m = useMedidor();
  const abrirModalPlanes = useApp((s) => s.abrirModalPlanes);

  if (compacto) {
    return (
      <button className="btn" style={{ padding: '7px 10px', fontSize: 12, border: '1px solid var(--border-light)' }} onClick={abrirModalPlanes}>
        <span className="mono">{m.corto}</span>
      </button>
    );
  }

  return (
    <div className="pila" style={{ padding: 14, borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', gap: 10 }}>
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{m.titulo}</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.num}</span>
      </div>
      {m.barra !== null && (
        <div className="barra" style={{ height: 6 }}><span style={{ width: `${m.barra}%` }} /></div>
      )}
      <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{m.nota}</span>
      {m.cta && (
        <button
          className="enlace"
          style={{ fontSize: 13, fontWeight: 600, textAlign: 'left', padding: 0, background: 'none', border: 0, cursor: 'pointer', color: 'var(--accent)' }}
          onClick={abrirModalPlanes}
        >
          {m.cta}
        </button>
      )}
    </div>
  );
}

export default function AppShell() {
  const usuario = useApp((s) => s.usuario);
  const consultas = useApp((s) => s.consultas);
  const nuevaConsulta = useApp((s) => s.nuevaConsulta);
  const tenant = getTenant(useApp((s) => s.tenant));
  const ir = useNavigate();
  const { pathname } = useLocation();

  // Sin sesión no hay app: se vuelve al inicio.
  if (!usuario) return <Navigate to="/login" replace />;

  const esDocente = usuario.tipo === 'docente';

  return (
    <div className="app-shell">
      <aside className="app-shell__lado">
        <button className="marca" style={{ padding: '0 6px' }} onClick={() => ir(esDocente ? '/docente' : '/chat')}>
          <span className="marca__mono" aria-hidden="true">{tenant.mono}</span>
          <span className="pila" style={{ alignItems: 'flex-start', lineHeight: 1.15 }}>
            <strong style={{ fontSize: 15, fontWeight: 600 }}>{tenant.name}</strong>
            {tenant.powered && <span style={{ fontSize: 10.5, color: 'var(--text-dim)' }}>con tecnología LMI-U</span>}
          </span>
        </button>

        {!esDocente && (
          <button
            className="btn btn--linea"
            style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', textAlign: 'left' }}
            onClick={() => { nuevaConsulta(); ir('/chat'); }}
          >
            + Nueva consulta
          </button>
        )}

        {esDocente && (
          <div className="pila" style={{ gap: 2 }}>
            <NavLink to="/docente" end className={({ isActive }) => `lado__item${isActive ? ' lado__item--on' : ''}`}>Chat ampliado</NavLink>
            <NavLink to="/docente/panel" className={({ isActive }) => `lado__item${isActive ? ' lado__item--on' : ''}`}>Panel de carrera</NavLink>
          </div>
        )}

        <div className="pila" style={{ gap: 2, minHeight: 0, overflow: 'auto' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', padding: '0 10px 8px', letterSpacing: '.04em' }}>HISTORIAL</span>
          {consultas.length === 0 && (
            <span style={{ padding: '4px 10px', fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.45 }}>Tus consultas aparecerán aquí.</span>
          )}
          {consultas.slice(0, 12).map((c) => (
            <Link key={c.id} to={`/chat/${c.id}`} className={`lado__item${pathname === `/chat/${c.id}` ? ' lado__item--on' : ''}`}>
              {c.pregunta}
            </Link>
          ))}
        </div>

        <div className="pila" style={{ marginTop: 'auto', gap: 10 }}>
          <Medidor />
          <button className="fila" style={{ gap: 10, padding: '8px 6px', borderRadius: 'var(--radius-md)', background: 'none', border: 0, color: 'inherit', cursor: 'pointer', textAlign: 'left' }} onClick={() => ir('/cuenta')}>
            <span className="avatar" aria-hidden="true">{usuario.iniciales}</span>
            <span className="pila" style={{ lineHeight: 1.25, minWidth: 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>{usuario.nombre}</span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{usuario.rol}</span>
            </span>
          </button>
        </div>
      </aside>

      <main className="app-shell__main">
        <header className="app-shell__cabecera">
          <button className="marca" onClick={() => ir(esDocente ? '/docente' : '/chat')}>
            <span className="marca__mono" aria-hidden="true">{tenant.mono}</span>
            <strong style={{ fontSize: 15, fontWeight: 600 }}>{tenant.name}</strong>
          </button>
          <div className="fila" style={{ gap: 8 }}>
            <Medidor compacto />
            <button className="avatar" style={{ border: 0, cursor: 'pointer' }} onClick={() => ir('/cuenta')} aria-label="Ir a mi cuenta">
              {usuario.iniciales}
            </button>
          </div>
        </header>
        <Outlet />
      </main>
      <ModalPlanes />
    </div>
  );
}
