import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store.js';
import { consultar, cursosDe, rol, salarioDe, sugerenciasPara, MIN_MUESTRA } from '../lib/consultar.js';
import { CompareTable, CourseCards, SalaryChart, SkillBars } from '../viz/graficos.jsx';
import Modal from '../components/Modal.jsx';
import ContenidoMetodologia from '../components/metodologia.jsx';
import { fmt, ventanaAnalisis } from '../data/contenido.js';

const ETIQUETA = {
  habilidades: 'HABILIDADES', salarios: 'SALARIOS', comparar: 'COMPARATIVA',
  cursos: 'CURSOS', brechas: 'BRECHAS', otro: 'CONSULTA',
};

const Burbuja = ({ children }) => (
  <div
    className="animate-slide"
    style={{
      alignSelf: 'flex-end',
      maxWidth: '80%',
      background: '#2a2823',
      padding: '12px 16px',
      borderRadius: '16px 16px 4px 16px',
      fontSize: 15,
      lineHeight: 1.45,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}
  >
    {children}
  </div>
);

// ── Una respuesta del asistente ──────────────────────────────────────
function Respuesta({ consulta, onPreguntar, onMetodologia }) {
  const { resultado: r, costo } = consulta;
  // El historial vive en localStorage y puede venir de una versión anterior del
  // esquema: un registro raro no debe tumbar la página entera.
  const roles = (r?.roleIds ?? []).map(rol).filter(Boolean);
  const sugeridos = (r?.sugerencias ?? []).map(rol).filter(Boolean);

  if (r.fueraDeAlcance) {
    return (
      <article className="pila animate-fade-up" style={{ gap: 14 }}>
        <p className="display" style={{ margin: 0, fontSize: 'clamp(1.15rem,2.4vw,1.4rem)', lineHeight: 1.3 }}>
          Solo puedo responder sobre el mercado laboral peruano: habilidades, salarios, roles y brechas de formación.
        </p>
        <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Esta consulta no se descontó.</span>
      </article>
    );
  }

  if (roles.length === 0) {
    return (
      <article className="pila animate-fade-up" style={{ gap: 14 }}>
        <p className="display" style={{ margin: 0, fontSize: 'clamp(1.15rem,2.4vw,1.4rem)', lineHeight: 1.3 }}>
          No tengo ese rol en el catálogo todavía.
        </p>
        {sugeridos.length > 0 && (
          <>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Sí puedo responderte sobre estos, que son parecidos:</span>
            <div className="fila" style={{ gap: 8 }}>
              {sugeridos.map((s, idx) => (
                <button
                  key={s.id}
                  className="chip animate-scale"
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => onPreguntar(`¿Qué habilidades piden para ${s.nombre}?`)}
                >
                  {s.nombre}
                </button>
              ))}
            </div>
          </>
        )}
        <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Esta consulta no se descontó.</span>
      </article>
    );
  }

  if (r.sinDatos) {
    const s = salarioDe(roles[0], r.ciudad);
    return (
      <article className="pila animate-fade-up" style={{ gap: 14 }}>
        <div className="mono fila animate-fade" style={{ gap: 8, fontSize: 11.5, color: 'var(--text-dim)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-dim)' }} />
          SIN DATOS SUFICIENTES · NO SE COBRÓ
        </div>
        <p className="display animate-fade-up" style={{ margin: 0, fontSize: 'clamp(1.15rem,2.4vw,1.4rem)', lineHeight: 1.3, animationDelay: '40ms' }}>
          Solo tenemos {s.n} ofertas con salario declarado para {roles[0].nombre} en {s.ambito}. Son menos de {MIN_MUESTRA}, así que no mostramos una cifra que podría engañarte.
        </p>
        <div className="fila" style={{ gap: 8 }}>
          <button className="chip animate-scale" onClick={() => onPreguntar(`¿Cuánto gana un ${roles[0].nombre} en todo el país?`)}>
            Ver en todo el país
          </button>
          <button className="chip animate-scale" style={{ animationDelay: '80ms' }} onClick={() => onPreguntar(`¿Qué habilidades piden para ${roles[0].nombre}?`)}>
            Ver habilidades
          </button>
        </div>
        <span className="mono animate-fade" style={{ fontSize: 12, color: 'var(--text-dim)', animationDelay: '120ms' }}>
          <button className="enlace" onClick={onMetodologia}>Por qué exigimos un mínimo de muestra</button>
        </span>
      </article>
    );
  }

  const cursos = r.intent === 'cursos' ? cursosDe(roles) : [];
  const muestra = roles.reduce((s, x) => s + salarioDe(x, r.ciudad).n, 0);

  return (
    <article className="pila animate-fade-up" style={{ gap: 18 }}>
      <div className="mono fila animate-fade" style={{ gap: 8, fontSize: 11.5, color: 'var(--text-dim)' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
        {ETIQUETA[r.intent]} · {costo === 1 ? '1 CONSULTA' : 'SIN COSTO'}
      </div>

      {r.insight && (
        <p className="display animate-fade-up" style={{ margin: 0, fontSize: 'clamp(1.25rem,2.6vw,1.6rem)', lineHeight: 1.25, letterSpacing: 0, textWrap: 'pretty', animationDelay: '50ms' }}>
          {r.insight}
        </p>
      )}

      {r.intent === 'comparar' && roles.length > 1 && <CompareTable roles={roles} />}
      {r.intent === 'salarios' && <SalaryChart roles={roles} ciudad={r.ciudad} />}
      {r.intent === 'cursos' && cursos.length > 0 && <CourseCards cursos={cursos} />}
      {!['comparar', 'salarios', 'cursos'].includes(r.intent) && roles.map((x) => <SkillBars key={x.id} rol={x} />)}

      <div className="fila animate-fade" style={{ justifyContent: 'space-between', gap: 10, animationDelay: '150ms' }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          {r.intent === 'salarios' ? `${fmt(muestra)} ofertas con salario declarado` : `${fmt(roles.reduce((s, x) => s + x.ofertas, 0))} ofertas`}
          {' · '}{r.ciudad ?? 'todo el país'} · {ventanaAnalisis()} · <button className="enlace" onClick={onMetodologia}>Metodología</button>
        </span>
        <button className="chip" onClick={() => window.print()}>Exportar PDF</button>
      </div>
    </article>
  );
}

// ── Página ───────────────────────────────────────────────────────────
// `encabezado` se pinta DENTRO del hilo, no encima: si va fuera, se lleva
// media pantalla y deja la conversación en una rendija que scrollea por
// detrás de su borde.
export default function Chat({ encabezado }) {
  const { consultaId } = useParams();
  const ir = useNavigate();
  const hilo = useRef(null);

  const usuario = useApp((s) => s.usuario);
  const consultas = useApp((s) => s.consultas);
  const pendiente = useApp((s) => s.pendiente);
  const puedeConsultar = useApp((s) => s.puedeConsultar);
  const registrarConsulta = useApp((s) => s.registrarConsulta);
  const guardarPendiente = useApp((s) => s.guardarPendiente);
  const limpiarPendiente = useApp((s) => s.limpiarPendiente);
  const abrirModalPlanes = useApp((s) => s.abrirModalPlanes);

  const [texto, setTexto] = useState('');
  const [verMetodologia, setVerMetodologia] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null); // { pregunta, mensaje }

  // Una consulta concreta del historial, o el hilo abierto ahora mismo.
  const hiloDesde = useApp((s) => s.hiloDesde);
  const visibles = consultaId
    ? consultas.filter((c) => c.id === consultaId)
    : consultas.filter((c) => c.ts >= hiloDesde).slice().reverse();

  // Desplazamiento cinemático fluido hacia el nuevo mensaje o respuesta
  useEffect(() => {
    const el = hilo.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [visibles.length, cargando, error, pendiente]);

  // Si hay una pregunta guardada del paywall y ya se puede consultar (acaba de
  // pagar), se responde sola. Es lo que vuelve cierto el "no se pierde".
  const reanudada = useRef(false);
  useEffect(() => {
    if (!pendiente || consultaId || reanudada.current || !puedeConsultar()) return;
    reanudada.current = true;
    limpiarPendiente();
    enviar(pendiente);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendiente, consultaId]);

  const enviar = async (pregunta) => {
    const q = pregunta.trim();
    if (!q || cargando) return;
    setTexto('');
    setError(null);

    // El límite se comprueba antes de gastar una llamada a la API.
    if (!puedeConsultar()) { guardarPendiente(q); return; }

    setCargando(true);
    try {
      const resultado = await consultar(q);
      registrarConsulta({ pregunta: q, resultado });
      if (consultaId) ir('/chat');
    } catch (e) {
      // No se registra nada: una consulta fallida no se cobra.
      setError({ pregunta: q, mensaje: e.message });
    } finally {
      setCargando(false);
    }
  };

  const vacio = visibles.length === 0 && !cargando && !error && !pendiente;

  return (
    <>
      <div className="hilo" ref={hilo}>
        <div className="hilo__interior">
          {encabezado}

          {vacio && (
            <div className="pila" style={{ gap: 28, paddingTop: 'clamp(8px, 4vw, 48px)' }}>
              <div className="pila" style={{ gap: 10 }}>
                <h1 className="display display--pag" style={{ margin: 0 }}>Hola, {usuario.nombre.split(' ')[0]}.</h1>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: 'var(--text-muted)', maxWidth: 540 }}>
                  Pregunta lo que quieras sobre el mercado laboral de{' '}
                  <span style={{ color: 'var(--text-primary)' }}>{usuario.areas?.[0] ?? 'cualquier área'}</span> en{' '}
                  <span style={{ color: 'var(--text-primary)' }}>{usuario.ciudades?.[0] ?? 'Perú'}</span>.
                </p>
              </div>
              <div className="rejilla" style={{ gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px,100%), 1fr))' }}>
                {sugerenciasPara(usuario).map((s, idx) => (
                  <button
                    key={s.q}
                    className="sugerencia animate-fade-up"
                    style={{ animationDelay: `${idx * 60}ms` }}
                    onClick={() => enviar(s.q)}
                  >
                    <span className="mono" style={{ fontSize: 11, fontWeight: 500, color: 'var(--accent)' }}>{s.tag}</span>
                    {s.q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {visibles.map((c) => (
            <div key={c.id} className="pila" style={{ gap: 28 }}>
              <Burbuja>{c.pregunta}</Burbuja>
              <Respuesta consulta={c} onPreguntar={enviar} onMetodologia={() => setVerMetodologia(true)} />
            </div>
          ))}

          {cargando && (
            <div className="pila animate-fade" style={{ gap: 12 }}>
              <div className="mono fila" style={{ gap: 8, fontSize: 11.5, color: 'var(--text-dim)' }}>
                <span className="latido" /> CONSULTANDO EL CATÁLOGO
              </div>
              <div className="pila" style={{ gap: 10 }}>
                <div className="esqueleto" style={{ width: '70%', height: 22 }} />
                <div className="esqueleto" style={{ width: '100%', height: 120 }} />
              </div>
            </div>
          )}

          {error && (
            <div className="pila animate-fade-up" style={{ gap: 28 }}>
              <Burbuja>{error.pregunta}</Burbuja>
              <div className="fila animate-scale" style={{ gap: 14, alignItems: 'flex-start', padding: 18, borderRadius: 'var(--radius-lg)', border: '1px solid var(--error-border)', background: 'var(--error-bg)' }}>
                <span style={{ flex: 'none', width: 22, height: 22, borderRadius: '50%', background: 'var(--error)', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>!</span>
                <div className="pila" style={{ gap: 8 }}>
                  <strong style={{ fontSize: 15, fontWeight: 600 }}>No pudimos completar la consulta</strong>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-secondary)' }}>{error.mensaje} No se descontó ninguna consulta.</span>
                  <button className="btn btn--claro" style={{ alignSelf: 'flex-start', padding: '8px 14px', fontSize: 13 }} onClick={() => enviar(error.pregunta)}>
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          )}

          {pendiente && (
            <div className="pila animate-fade-up" style={{ gap: 28 }}>
              <Burbuja>{pendiente}</Burbuja>
              <div className="pila bloqueo__aviso animate-scale" style={{ gap: 10 }}>
                  <strong style={{ fontSize: 17, fontWeight: 600 }}>Llegaste al límite de tu plan gratis</strong>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                    Tu pregunta quedó guardada. Elige una opción y la respondemos enseguida.
                  </span>
                  <div className="fila" style={{ gap: 8 }}>
                  <button className="btn btn--acento" onClick={abrirModalPlanes}>Ver opciones · desde S/ 12</button>
                  <button className="btn btn--linea" onClick={limpiarPendiente}>Descartar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Composer texto={texto} setTexto={setTexto} enviar={enviar} cargando={cargando} bloqueado={!!pendiente} />

      {/* Popup y no navegación: consultar la metodología no debe costar
          perder el hilo de la conversación. */}
      <Modal abierto={verMetodologia} onCerrar={() => setVerMetodologia(false)} titulo="Metodología y fuentes">
        <ContenidoMetodologia />
      </Modal>
    </>
  );
}

// ── Composer ─────────────────────────────────────────────────────────
function Composer({ texto, setTexto, enviar, cargando, bloqueado }) {
  const plan = useApp((s) => s.plan);
  const restantes = useApp((s) => s.restantes());

  const nota = restantes === null
    ? 'Consultas ilimitadas · las respuestas sin datos suficientes no se cobran'
    : plan === 'creditos'
      ? `${restantes} consultas disponibles · las respuestas sin datos no se cobran`
      : restantes === 0
        ? 'Plan gratis agotado · tu próxima pregunta queda guardada'
        : 'Cada pregunta usa 1 consulta. Las respuestas sin datos suficientes no se cobran.';

  return (
    <div className="composer">
      <form
        className="composer__caja"
        onSubmit={(e) => { e.preventDefault(); enviar(texto); }}
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={bloqueado ? 'Tienes una pregunta esperando' : 'Pregunta sobre habilidades, salarios o roles…'}
          disabled={cargando}
          aria-label="Tu pregunta"
        />
        <button type="submit" className="composer__enviar" disabled={cargando || !texto.trim()} aria-label="Enviar pregunta">↑</button>
      </form>
      <span style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.4 }}>{nota}</span>
    </div>
  );
}
