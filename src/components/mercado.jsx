// Las piezas que comparten las cinco pantallas del motor de decisión.
// Están aquí y no copiadas en cada una porque el chip de estado y la tarjeta
// de bloqueo aparecen en todas, y si se separan el tester ve dos diseños
// distintos para la misma cosa.

import { Link } from 'react-router-dom';
import { useApp } from '../store.js';
import { tonoMatch } from '../lib/mercado.js';
import Lumi from '../mascota/Lumi.jsx';

// Cabecera común: etiqueta, titular y bajada.
export function Cabecera({ eti, titulo, children, accion }) {
  return (
    <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
      <div className="pila" style={{ gap: 8, minWidth: 0 }}>
        <span className="eti" style={{ alignSelf: 'flex-start', fontWeight: 600, color: 'var(--accent)' }}>{eti}</span>
        <h1 className="display display--pag" style={{ margin: 0 }}>{titulo}</h1>
        {children && <p className="lead" style={{ margin: 0 }}>{children}</p>}
      </div>
      {accion}
    </div>
  );
}

// Lo tienes / Te falta. El estado del usuario junto a cada habilidad: es lo
// que convierte el dato de mercado en algo sobre él.
export function ChipEstado({ tiene, compacto = false }) {
  return (
    <span
      style={{
        fontSize: compacto ? 11 : 12,
        fontWeight: 700,
        padding: compacto ? '2px 8px' : '4px 10px',
        borderRadius: 'var(--radio-full)',
        whiteSpace: 'nowrap',
        background: tiene ? 'var(--resalte)' : 'var(--alerta-bg)',
        color: tiene ? 'var(--resalte-fg)' : 'var(--alerta-fg)',
      }}
    >
      {tiene ? '✓ Lo tienes' : '✗ Te falta'}
    </span>
  );
}

export function BarraMatch({ pct, alto = 8 }) {
  const tono = tonoMatch(pct);
  return (
    <div className="barra" style={{ height: alto }}>
      <span style={{ width: `${pct}%`, background: tono.barra }} />
    </div>
  );
}

// La etiqueta "Pro" de la barra lateral y de los botones de acción.
export function EtiquetaPro() {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '2px 8px',
      borderRadius: 'var(--radio-full)',
      background: 'var(--bg-noche)', color: 'var(--sobre-noche)',
      whiteSpace: 'nowrap',
    }}>
      Pro
    </span>
  );
}

// El muro. El contenido NO se oculta: se desenfoca y se le pone encima una
// tarjeta noche que dice qué se compra. El plan gratis tiene que mostrar lo
// suficiente para que el tester entienda qué se está perdiendo, nunca un
// espacio en blanco (anti-objetivo del plan).
export function BloqueoPro({ titulo, detalle, destino, children }) {
  const abrirPaywall = useApp((s) => s.abrirPaywall);
  return (
    <div style={{ position: 'relative' }}>
      <div
        aria-hidden="true"
        style={{ filter: 'blur(7px)', pointerEvents: 'none', userSelect: 'none' }}
      >
        {children}
      </div>
      <div
        className="pila animate-scale"
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          className="pila"
          style={{
            gap: 14, maxWidth: 440, padding: 28,
            borderRadius: 'var(--radio-3xl)',
            background: 'var(--bg-noche)',
            color: 'var(--sobre-noche)',
            boxShadow: 'var(--sombra-modal)',
            textAlign: 'center', alignItems: 'center',
          }}
        >
          <Lumi pose="alerta" alto={72} />
          <strong className="display" style={{ fontSize: 24, color: 'var(--blanco-fijo)', lineHeight: 1.15 }}>
            {titulo}
          </strong>
          {detalle && <span style={{ fontSize: 14, lineHeight: 1.5 }}>{detalle}</span>}
          <button
            type="button"
            className="btn"
            style={{ background: 'var(--lima-fija)', color: 'var(--sobre-lima-fija)', fontWeight: 700 }}
            onClick={() => abrirPaywall(destino, destino)}
          >
            Desbloquear · S/ 19/mes
          </button>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Sin permanencia · cancela cuando quieras</span>
        </div>
      </div>
    </div>
  );
}

// Sin diagnóstico no hay nada que ordenar por brecha. En vez de una pantalla
// vacía, la invitación a hacerlo: ningún camino termina en nada.
export function SinDiagnostico({ que }) {
  return (
    <div className="panel">
      <div className="tarjeta" style={{ alignItems: 'center', textAlign: 'center', gap: 16, padding: 40 }}>
        <Lumi pose="saluda" alto={96} />
        <h1 className="display display--card" style={{ margin: 0 }}>Primero, tu diagnóstico</h1>
        <p className="lead" style={{ margin: 0, maxWidth: 460 }}>
          {que} se ordena contra tu propia brecha, así que necesito saber qué sabes hoy.
          Son 3 pasos y no tienes que escribir nada.
        </p>
        <Link to="/diagnostico" className="btn btn--acento btn--grande">Hacer mi diagnóstico →</Link>
      </div>
    </div>
  );
}

// Los tres botones de acción. Van juntos porque son la respuesta a "¿y ahora
// qué hago?", que es el agujero que este trabajo viene a tapar. Sin texto
// libre: cada uno lleva a una pantalla concreta.
export function AccionesSugeridas({ esPro, N, siguiente, pct, cuello = [] }) {
  const abrirPaywall = useApp((s) => s.abrirPaywall);

  // Con 0 ofertas alcanzables, prometer "para esas 0 ofertas" o "donde ya
  // calzo" es ofrecer nada. El siguiente paso real es la ruta.
  const enCero = N === 0;
  const skillsCuello = cuello.length ? cuello.join(' y ') : siguiente;
  const acciones = enCero
    ? [
      { destino: '/ruta', texto: siguiente ? `Empezar por ${siguiente} y llegar a ${pct}%` : 'Ver mi ruta de aprendizaje',
        sub: skillsCuello ? `${skillsCuello}, con cursos gratis y un proyecto` : 'Ordenada por ofertas desbloqueadas' },
      { destino: '/ofertas', texto: 'Ver en cuáles estoy más cerca', sub: 'Ordenadas por la menor brecha' },
      { destino: '/cv', texto: 'Afinar mi CV con lo que ya tengo', sub: 'Con las frases exactas que usan los avisos' },
    ]
    : [
      { destino: '/cv', texto: `Optimizar los bullets de mi CV para esas ${N.toLocaleString('es-PE')} ofertas`,
        sub: 'Con las frases exactas que usan los avisos' },
      { destino: '/ruta', texto: siguiente ? `Ver los recursos más rápidos para subir a ${pct}%` : 'Ver mi ruta de aprendizaje',
        sub: skillsCuello ? `${skillsCuello}, con cursos gratis y un proyecto` : 'Ordenada por ofertas desbloqueadas' },
      { destino: '/ofertas', texto: 'Ver las ofertas donde ya calzas', sub: 'Ordenadas por la menor brecha' },
    ];

  return (
    <div className="pila" style={{ gap: 10 }}>
      <span className="eti" style={{ fontWeight: 700, color: 'var(--accent)' }}>¿QUÉ HAGO AHORA?</span>
      {acciones.map((a) => {
        const contenido = (
          <>
            <span className="accion-card__texto">
              <span className="accion-card__titulo">{a.texto}</span>
              <span className="accion-card__sub">{a.sub}</span>
            </span>
            {esPro ? <span aria-hidden="true" style={{ color: 'var(--accent)', fontWeight: 700 }}>→</span> : <EtiquetaPro />}
          </>
        );
        return esPro ? (
          <Link key={a.destino} to={a.destino} className="accion-card">{contenido}</Link>
        ) : (
          <button key={a.destino} type="button" className="accion-card" onClick={() => abrirPaywall(a.destino, a.destino)}>
            {contenido}
          </button>
        );
      })}
    </div>
  );
}

// Un botón que lleva a su pantalla si eres Pro y abre el paywall si no, pero
// que SIEMPRE lleva a alguna parte. Un botón que no hace nada se lee como
// "la app todavía no hace eso", y ahí se cae lo que se está midiendo.
export function AccionPro({ destino, esPro, clase = 'btn--linea', onBloqueo, children }) {
  const abrirPaywall = useApp((s) => s.abrirPaywall);
  const abrir = onBloqueo ?? abrirPaywall;

  if (esPro) {
    return (
      <Link to={destino} className={`btn ${clase}`}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={`btn ${clase}`} style={{ gap: 10 }} onClick={() => abrir(destino, destino)}>
      {children}
      <EtiquetaPro />
    </button>
  );
}
