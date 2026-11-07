import { useMemo, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CONSULTAS_GRATIS, DIAGNOSTICOS_GRATIS, useApp } from '../store.js';
import { getTenant } from '../data/tenant.js';
import { proximaRenovacion } from '../data/contenido.js';
import Paywall from '../components/Paywall.jsx';
import { EtiquetaPro } from '../components/mercado.jsx';
import MenuPerfil from '../components/MenuPerfil.jsx';
import { LumiLogo } from '../mascota/Lumi.jsx';

// Las cinco secciones del motor de decisión. La barra lateral ya no es
// "nueva consulta + historial": eso pasó a ser una sección más.
const SECCIONES = [
  { ruta: '/chat', texto: 'Consultar a Lumi', pro: false },
  { ruta: '/diagnostico', texto: 'Mi diagnóstico', pro: false },
  { ruta: '/ofertas', texto: 'Ofertas para mí', pro: true },
  { ruta: '/ruta', texto: 'Ruta de aprendizaje', pro: true },
  { ruta: '/cv', texto: 'Adaptar mi CV', pro: true },
];

// El medidor de consumo. Es lo que traduce el plan a algo que el usuario
// entiende de un vistazo, así que vive en un solo sitio.
export function useMedidor() {
  const plan = useApp((s) => s.plan);
  const restantes = useApp((s) => s.restantes());
  const diagnosticosMes = useApp((s) => s.diagnosticosMes);
  const tenant = getTenant(useApp((s) => s.tenant));

  if (plan === 'institucional') {
    return {
      titulo: 'Licencia institucional', num: '∞', barra: null, corto: 'Ilimitado',
      nota: `${tenant.uni} · todo desbloqueado`, cta: null
    };
  }
  if (plan === 'pro') {
    return {
      titulo: 'Pro estudiante', num: '∞', barra: null, corto: 'Pro',
      nota: 'Todo desbloqueado · renovación mensual', cta: null
    };
  }
  const diagRestantes = Math.max(0, DIAGNOSTICOS_GRATIS - diagnosticosMes);
  return {
    titulo: 'Plan gratis',
    num: `${restantes} de ${CONSULTAS_GRATIS}`,
    barra: (restantes / CONSULTAS_GRATIS) * 100,
    corto: `${restantes}/${CONSULTAS_GRATIS}`,
    // En gratis el medidor dice las dos cosas: las consultas y si queda el
    // diagnóstico del mes. Son los dos muros que el tester puede chocar.
    nota: diagRestantes > 0
      ? `${restantes} ${restantes === 1 ? 'consulta' : 'consultas'} y tu diagnóstico del mes`
      : restantes === 0
        ? `Sin consultas ni diagnóstico · se renueva el ${proximaRenovacion()}`
        : `${restantes} ${restantes === 1 ? 'consulta' : 'consultas'} · diagnóstico del mes usado`,
    cta: restantes <= 1 || diagRestantes === 0 ? 'Ver Pro estudiante' : null,
  };
}

function Medidor({ compacto }) {
  const m = useMedidor();
  const plan = useApp((s) => s.plan);
  const restantes = useApp((s) => s.restantes());
  const { pathname } = useLocation();
  const setRutaRetornoChat = useApp((s) => s.setRutaRetornoChat);
  const abrirPaywall = useApp((s) => s.abrirPaywall);

  const mostrarPlanes = () => {
    setRutaRetornoChat(pathname.startsWith('/chat') ? pathname : '/chat');
    abrirPaywall('general', pathname);
  };

  if (compacto) {
    const esPro = plan === 'pro' || plan === 'institucional';
    const esCero = !esPro && restantes === 0;
    return (
      <button
        type="button"
        style={{
          background: esCero ? 'var(--alerta-bg)' : 'var(--resalte)',
          color: esCero ? 'var(--alerta-fg)' : 'var(--resalte-fg)',
          border: esCero ? '1px solid var(--alerta)' : '0',
          borderRadius: 'var(--radio-full)',
          padding: '7px 18px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all var(--duration) var(--ease-out)',
        }}
        onClick={mostrarPlanes}
        title="Ver tu plan"
      >
        {esPro ? m.corto : esCero ? '0 consultas' : `${restantes} consultas`}
      </button>
    );
  }

  return (
    <div className="pila" style={{ padding: 14, borderRadius: 'var(--radio-lg)', background: 'var(--bg-elevated)', border: '1px solid var(--linea)', gap: 10 }}>
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{m.titulo}</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.num}</span>
      </div>
      {m.barra !== null && (
        <div className="barra" style={{ height: 6 }}><span style={{ width: `${m.barra}%` }} /></div>
      )}
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{m.nota}</span>
      {m.cta && (
        <button
          className="enlace"
          style={{ fontSize: 13, fontWeight: 600, textAlign: 'left', padding: 0, background: 'none', border: 0, cursor: 'pointer', color: 'var(--accent)' }}
          onClick={mostrarPlanes}
        >
          {m.cta}
        </button>
      )}
    </div>
  );
}

export default function AppShell() {
  const usuario = useApp((s) => s.usuario);
  // Suscribirse a conversaciones daria la FUNCION, que nunca cambia: zustand
  // no avisaria nunca y el historial se quedaria congelado. Hay que
  // suscribirse a los datos y derivar.
  const consultas = useApp((s) => s.consultas);
  const charlas = useMemo(() => useApp.getState().conversaciones(), [consultas]);
  const nuevaConsulta = useApp((s) => s.nuevaConsulta);
  const diagnostico = useApp((s) => s.diagnostico);
  const plan = useApp((s) => s.plan);
  const tenant = getTenant(useApp((s) => s.tenant));
  const ir = useNavigate();
  const { pathname } = useLocation();

  const [sidebarAbierta, setSidebarAbierta] = useState(true);

  // Sin sesión no hay app: se vuelve al inicio.
  if (!usuario) return <Navigate to="/login" replace />;

  const esDocente = usuario.tipo === 'docente';
  const esPro = plan === 'pro' || plan === 'institucional';

  // "Mi diagnóstico" lleva al reporte si ya existe uno: entrar a mirarlo no
  // consume el cupo del mes (§7.8).
  const rutaDe = (s) => (s.ruta === '/diagnostico' && diagnostico ? '/diagnostico/resultado' : s.ruta);
  const activa = (s) => pathname === s.ruta
    || (s.ruta === '/diagnostico' && pathname.startsWith('/diagnostico'))
    || (s.ruta === '/ofertas' && pathname.startsWith('/ofertas'))
    || (s.ruta === '/chat' && pathname.startsWith('/chat'));

  return (
    <div className="app-shell">
      <aside className={`app-shell__lado ${!sidebarAbierta ? 'app-shell__lado--cerrado' : ''}`}>
        <button className="marca" style={{ padding: '0 6px', gap: 10 }} onClick={() => ir(esDocente ? '/docente' : '/diagnostico')}>
          <LumiLogo alto={32} />
          <span className="pila" style={{ alignItems: 'flex-start', lineHeight: 1.15 }}>
            <strong style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>{tenant.name}</strong>
            {tenant.powered && <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>con tecnología LMI-U</span>}
          </span>
        </button>

        {!esDocente && (
          <nav className="pila" style={{ gap: 2 }}>
            {SECCIONES.map((s) => (
              <Link
                key={s.ruta}
                to={rutaDe(s)}
                className={`lado__item${activa(s) ? ' lado__item--on' : ''}`}
                style={activa(s) ? { background: 'var(--bg-elevated)', fontWeight: 600 } : undefined}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.texto}</span>
                {s.pro && !esPro && <EtiquetaPro />}
              </Link>
            ))}
          </nav>
        )}

        {!esDocente && (
          <button
            className="btn btn--linea"
            style={{ borderRadius: 'var(--radio-md)', background: 'var(--bg-elevated)', textAlign: 'left', fontSize: 14, padding: '10px 14px' }}
            onClick={() => {
              if (!useApp.getState().puedeConsultar()) {
                useApp.getState().setRutaRetornoChat('/chat');
                useApp.getState().abrirPaywall('consultas', '/chat');
                return;
              }
              nuevaConsulta();
              ir('/chat');
            }}
          >
            + Nueva consulta
          </button>
        )}

        <div className="pila" style={{ gap: 2, minHeight: 0, overflow: 'auto' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '0 10px 8px', letterSpacing: '.04em' }}>HISTORIAL</span>
          {charlas.length === 0 && (
            <span style={{ padding: '4px 10px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>Tus consultas aparecerán aquí.</span>
          )}
          {/* Una fila por conversación, no por pregunta: los seguimientos
              viven dentro de su charla, como en Claude o ChatGPT. */}
          {charlas.map((h) => (
            <div key={h.id} className="fila-historial">
              <Link
                to={`/chat/${h.id}`}
                className={`lado__item${pathname === `/chat/${h.id}` ? ' lado__item--on' : ''}`}
                title={h.titulo}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {h.titulo}
                </span>
                {h.consultas.length > 1 && (
                  <span className="lado__item-cuenta" title={`${h.consultas.length} preguntas en esta charla`}>
                    {h.consultas.length}
                  </span>
                )}
              </Link>
              <button
                type="button"
                className="lado__item-borrar"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  useApp.getState().eliminarHilo(h.id);
                  if (pathname === `/chat/${h.id}`) {
                    nuevaConsulta();
                    ir('/chat');
                  }
                }}
                title="Eliminar consulta del historial"
                aria-label="Eliminar consulta del historial"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="pila" style={{ marginTop: 'auto', gap: 10 }}>
          <Medidor />
        </div>
      </aside>

      <main className="app-shell__main">
        <header className="app-shell__cabecera">
          <div className="fila" style={{ gap: 12, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setSidebarAbierta(!sidebarAbierta)}
              title={sidebarAbierta ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
              aria-label="Alternar barra lateral"
              style={{
                background: 'none',
                border: 0,
                cursor: 'pointer',
                padding: '6px 8px',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background var(--duration) var(--ease-out), color var(--duration) var(--ease-out)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
            {!sidebarAbierta && (
              <button className="marca animate-fade" onClick={() => ir(esDocente ? '/docente' : '/diagnostico')}>
                <LumiLogo alto={32} />
                <strong style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>{tenant.name}</strong>
              </button>
            )}
          </div>
          <div className="fila" style={{ gap: 12, alignItems: 'center' }}>
            <Medidor compacto />
            <MenuPerfil />
          </div>
        </header>
        <Outlet />
      </main>
      <Paywall />
    </div>
  );
}
