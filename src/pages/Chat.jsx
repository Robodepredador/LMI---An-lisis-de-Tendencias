import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp, CICLOS } from '../store.js';
import { consultar, cursosDe, rol, salarioDe, MIN_MUESTRA } from '../lib/consultar.js';
import { CompareTable, CourseCards } from '../viz/graficos.jsx';
import Puntos from '../viz/Puntos.jsx';
import Franja from '../viz/Franja.jsx';
import Tendencia from '../viz/Tendencia.jsx';
import Lumi, { LumiLogo } from '../mascota/Lumi.jsx';
import { filasDe } from '../lib/habilidades.js';
import { consejo, explicacion, titular } from '../lib/prosa.js';
import Modal from '../components/Modal.jsx';
import ContenidoMetodologia from '../components/metodologia.jsx';
import { fmt, ventanaAnalisis } from '../data/contenido.js';

const ETIQUETA = {
  habilidades: 'HABILIDADES',
  salarios: 'SALARIOS',
  tendencia: 'TENDENCIA',
  comparar: 'COMPARATIVA',
  cursos: 'CURSOS',
  brechas: 'BRECHAS',
  otro: 'CONSULTA',
};

// Tarjetas de preguntas destacadas que hacen otros estudiantes (Pantalla Consulta)
const PREGUNTAS_DESTACADAS = [
  {
    carrera: 'Contabilidad',
    tipo: 'Salarios',
    q: '¿Cuánto gana un asistente contable en Lima?',
  },
  {
    carrera: 'Psicología',
    tipo: 'Habilidades',
    q: '¿Qué piden para analista de selección?',
  },
  {
    carrera: 'Marketing',
    tipo: 'Tendencia',
    q: '¿Qué está creciendo para Community Manager en Lima?',
  },
];


// ── Un turno del hilo ────────────────────────────────────────────────
// Antes la pantalla solo sabia pintar UNA consulta: cada seguimiento
// reemplazaba la anterior en vez de continuarla. Ahora el hilo mapea esto.
function Turno({ consulta, cicloUsuario, onMetodologia, onPreguntar }) {
  const resultado = consulta?.resultado;
  const roles = (resultado?.roleIds ?? []).map(rol).filter(Boolean);
  const rolPrincipal = roles[0] || null;
  const ciudad = resultado?.ciudad || 'Lima';
  const esInsuficiente = resultado?.sinDatos
    || (rolPrincipal && salarioDe(rolPrincipal, ciudad).n < MIN_MUESTRA && resultado?.intent === 'salarios');
  const consultaActual = consulta;
  const cicloLabel = CICLOS[cicloUsuario] || '5to – 6to';
  const muestraTotal = roles.reduce((sum, r) => sum + (rolPrincipal ? salarioDe(r, ciudad).n : r.ofertas), 0);

  return (
    <div className="pila animate-fade-up" style={{ gap: 20 }}>
            {/* Sin cabecera: el rol y la ciudad ya los dice la ficha de la
                derecha, y "+ Nueva consulta" vive en la barra lateral. */}

            {/* Pregunta del usuario (burbuja púrpura a la derecha) */}
            <div
              style={{
                alignSelf: 'flex-end',
                background: 'var(--accent)',
                color: 'var(--accent-fg)',
                borderRadius: '22px 22px 6px 22px',
                padding: '14px 20px',
                fontSize: 16,
                maxWidth: 620,
                lineHeight: 1.45,
                boxShadow: '0 4px 14px rgba(75, 59, 255, 0.25)',
              }}
            >
              {consultaActual.pregunta}
            </div>

            {/* Si es una pregunta retomada (idéntico a Imagen 2): viñeta Lumi + respuesta */}
            {consultaActual.retomada ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, maxWidth: 680, margin: '4px 0 8px' }}>
                <Lumi pose="saluda" alto={64} />
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--linea)',
                    borderRadius: 20,
                    padding: '18px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    boxShadow: '0 4px 16px rgba(23, 21, 58, 0.05)',
                    flex: 1,
                  }}
                >
                  <strong style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                    Retomo tu pregunta guardada…
                  </strong>
                  <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    {resultado?.insight || (rolPrincipal ? `En ${ciudad}, las ofertas de ${rolPrincipal.nombre} piden sobre todo ${filasDe(rolPrincipal).slice(0, 3).map(f => f.nombre).join(', ')}. Python aparece en 4 de cada 10.` : 'Aquí tienes el análisis actualizado de tu consulta.')}
                  </p>
                </div>
              </div>
            ) : esInsuficiente ? (
              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radio-2xl)',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  maxWidth: 720,
                  border: '1px solid var(--linea)',
                }}
              >
                <div className="fila" style={{ alignItems: 'center', gap: 14 }}>
                  <Lumi pose="alerta" alto={84} />
                  <span style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 999, background: 'var(--alerta-bg)', color: 'var(--alerta-fg)' }}>
                    Muestra insuficiente
                  </span>
                </div>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, lineHeight: 1.15 }}>
                  Solo encontramos pocas ofertas para {rolPrincipal?.nombre || 'este rol'} en {ciudad}.
                </strong>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  Con menos de {MIN_MUESTRA} ofertas la cifra no es estadísticamente confiable, así que no la mostramos y <strong style={{ color: 'var(--text-primary)' }}>no descontamos tu consulta</strong>. Prueba ampliando la región a todo el país.
                </p>
                <div className="fila" style={{ gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn--acento"
                    onClick={() => onPreguntar(`¿Cuánto gana un ${rolPrincipal?.nombre || 'asistente'} en todo el país?`)}
                  >
                    Ver en todo el país
                  </button>
                  <button
                    type="button"
                    className="enlace"
                    onClick={() => onMetodologia()}
                    style={{ padding: '10px 14px', background: 'none', border: 0, cursor: 'pointer', fontSize: 14 }}
                  >
                    ¿Por qué exigimos mínimo 30 ofertas?
                  </button>
                </div>
              </div>
            ) : (
              /* CASO B: Resultado OK (Diseño a 2 Columnas idéntico a los diseñadores) */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, alignItems: 'start' }}>
                
                {/* ── Columna Izquierda: Respuesta + Viñeta Cómic de Lumi ── */}
                <div className="pila" style={{ gap: 16 }}>
                  {/* Tarjeta de Respuesta */}
                  <div style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 10, border: '1px solid var(--linea)' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                      Respuesta del analista
                    </span>
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: 'var(--text-primary)' }}>
                      {resultado?.insight || explicacion(rolPrincipal, resultado?.intent || 'habilidades', rolPrincipal ? filasDe(rolPrincipal) : [], ciudad)}
                    </p>
                  </div>

                  {/* Viñeta estilo Cómic de Lumi */}
                  {rolPrincipal && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, paddingTop: 10, position: 'relative' }}>
                      <Lumi pose="saluda" alto={120} />
                      <div style={{ position: 'relative', flex: 1, paddingBottom: 28 }}>
                        <div
                          style={{
                            background: 'var(--resalte)',
                            color: 'var(--resalte-fg)',
                            border: '3px solid var(--lumi-linea)',
                            borderRadius: 36,
                            padding: '18px 22px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            boxShadow: '0 6px 20px rgba(23, 21, 58, 0.08)',
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 800 }}>
                            Lumi piensa… · {cicloLabel} ciclo
                          </span>
                          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
                            {consejo(rolPrincipal, cicloUsuario, resultado?.intent || 'habilidades')}
                          </p>
                        </div>
                        {/* Conectores tipo burbuja cómic */}
                        <span style={{ position: 'absolute', left: 4, bottom: 12, width: 22, height: 22, borderRadius: 999, background: 'var(--resalte)', border: '3px solid var(--lumi-linea)' }} />
                        <span style={{ position: 'absolute', left: -10, bottom: -2, width: 13, height: 13, borderRadius: 999, background: 'var(--resalte)', border: '3px solid var(--lumi-linea)' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Columna Derecha: Tarjeta Analítica y Visualización ── */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: 26, display: 'flex', flexDirection: 'column', gap: 18, border: '1px solid var(--linea)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                    {ETIQUETA[resultado?.intent || 'habilidades']} · {rolPrincipal?.nombre || 'Rol'} · {ciudad}
                  </span>

                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                    {rolPrincipal ? titular(rolPrincipal, resultado?.intent || 'habilidades', filasDe(rolPrincipal)) : 'Análisis del Mercado Laboral'}
                  </strong>

                  {/* Renderizado de visualizaciones */}
                  {resultado?.intent === 'comparar' && roles.length > 1 && <CompareTable roles={roles} />}
                  {resultado?.intent === 'cursos' && <CourseCards cursos={cursosDe(roles)} />}

                  {rolPrincipal && !['comparar', 'cursos'].includes(resultado?.intent) && (
                    <>
                      {resultado?.intent === 'salarios' && salarioDe(rolPrincipal, ciudad).cifras && (
                        <Franja {...salarioDe(rolPrincipal, ciudad).cifras} />
                      )}
                      {resultado?.intent === 'tendencia' && (
                        <Tendencia filas={filasDe(rolPrincipal)} />
                      )}
                      {(!resultado?.intent || resultado?.intent === 'habilidades' || resultado?.intent === 'otro') && (
                        <Puntos filas={filasDe(rolPrincipal)} />
                      )}
                    </>
                  )}

                  {/* Caja De dónde sale este dato */}
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <div className="fila" style={{ justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: 13.5 }}>De dónde sale este dato</strong>
                      <button
                        type="button"
                        onClick={() => onMetodologia()}
                        className="enlace"
                        style={{ fontSize: 12.5, fontWeight: 600, background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer' }}
                      >
                        Ver muestra ↗
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '6px 14px', fontSize: 12.5 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Muestra</span>
                      <span>{fmt(muestraTotal)} ofertas únicas en {ciudad}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>Periodo</span>
                      <span>{ventanaAnalisis()}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>Portales</span>
                      <span>Computrabajo, Bumeran, LinkedIn</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

    </div>
  );
}

export default function Chat() {
  const { consultaId } = useParams();
  const ir = useNavigate();

  const usuario = useApp((s) => s.usuario);
  const restante = useApp((s) => s.restantes());
  const plan = useApp((s) => s.plan);
  const puedeConsultar = useApp((s) => s.puedeConsultar);
  const registrarConsulta = useApp((s) => s.registrarConsulta);
  const pendiente = useApp((s) => s.pendiente);
  const guardarPendiente = useApp((s) => s.guardarPendiente);
  const limpiarPendiente = useApp((s) => s.limpiarPendiente);
  const setRutaRetornoChat = useApp((s) => s.setRutaRetornoChat);
  const abrirModalPlanes = useApp((s) => s.abrirModalPlanes);
  const setHiloActual = useApp((s) => s.setHiloActual);
  const pagoReciente = useApp((s) => s.pagoReciente);
  const resetearIntentos = useApp((s) => s.resetearIntentos);
  const limpiarAvisoPago = useApp((s) => s.limpiarAvisoPago);

  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [preguntaActiva, setPreguntaActiva] = useState('');
  const [pasoCarga, setPasoCarga] = useState(0);
  const [verMetodologia, setVerMetodologia] = useState(false);
  const [toastCredito, setToastCredito] = useState('');

  const consultas = useApp((st) => st.consultas);
  // Al estar en /chat/:consultaId cargamos ese hilo específico;
  // si estamos en /chat (sin consultaId) estamos en pantalla limpia (hilo vacío) como Claude/GPT.
  const hilo = useMemo(
    () => (consultaId ? useApp.getState().hiloDe(consultaId) : []),
    [consultaId, consultas],
  );
  const ultima = hilo[hilo.length - 1] ?? null;

  const [preguntaBloqueada, setPreguntaBloqueada] = useState(pendiente || null);

  // Estado reactivo: consulta inicial (dashboard limpio), cargando inicial, o mostrando resultado/hilo
  const isConsulta = !cargando && hilo.length === 0 && !preguntaBloqueada;
  const isCargaInicial = cargando && hilo.length === 0;
  const isResultado = hilo.length > 0 || !!preguntaBloqueada;

  // Sincronizar hiloActual en el store
  useEffect(() => {
    if (consultaId) {
      setHiloActual(consultaId);
    }
  }, [consultaId, setHiloActual]);

  // Si consultaId fue puesto en URL pero no existe en el historial y no estamos cargando ni bloqueados, volver a /chat
  useEffect(() => {
    if (consultaId && hilo.length === 0 && !cargando && !preguntaBloqueada) {
      ir('/chat', { replace: true });
    }
  }, [consultaId, hilo.length, cargando, preguntaBloqueada, ir]);

  // Auto-scroll al final del hilo cuando cambian los mensajes o el estado de carga
  useEffect(() => {
    if (hilo.length > 0 || preguntaBloqueada) {
      requestAnimationFrame(() => {
        const h = document.querySelector('.hilo');
        if (h) h.scrollTo({ top: h.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [hilo.length, cargando, preguntaBloqueada]);

  const timerRef = useRef([]);
  useEffect(() => {
    return () => timerRef.current.forEach(clearTimeout);
  }, []);

  const abrirCheckoutEnNuevaPestana = (packId = '25') => {
    useApp.getState().setPack(String(packId));
    const targetHiloId = consultaId || (hilo.length > 0 ? (hilo[0].hiloId || hilo[0].id) : null);
    const rutaActual = targetHiloId ? `/chat/${targetHiloId}` : '/chat';
    setRutaRetornoChat(rutaActual);
    window.open(`/checkout?pack=${packId}`, '_blank');
  };

  const enviar = async (preguntaTexto, options = {}) => {
    const q = (preguntaTexto ?? texto).trim();
    if (!q || cargando) return;

    if (!puedeConsultar()) {
      setTexto('');
      guardarPendiente(q);
      setPreguntaBloqueada(q);
      const targetHiloId = consultaId || (hilo.length > 0 ? (hilo[0].hiloId || hilo[0].id) : null);
      const rutaActual = targetHiloId ? `/chat/${targetHiloId}` : '/chat';
      setRutaRetornoChat(rutaActual);
      return;
    }

    setTexto('');
    setPreguntaActiva(q);
    setPreguntaBloqueada(null);
    setCargando(true);
    setPasoCarga(0);

    // Si ya estamos en una consulta (consultaId existe), usamos ese hilo.
    // Si estamos en la pantalla limpia (/chat), creamos un nuevo hiloId.
    const targetHiloId = consultaId || crypto.randomUUID();

    // Animación de pasos de carga: 30% -> 65% -> 95%
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [
      setTimeout(() => setPasoCarga(1), 400),
      setTimeout(() => setPasoCarga(2), 900),
    ];

    try {
      const res = await consultar(q);
      const reg = registrarConsulta({
        pregunta: q,
        resultado: res,
        hiloId: targetHiloId,
        retomada: options.retomada || false,
      });
      if (reg.costo === 1) {
        const nuevoRestante = useApp.getState().restantes();
        setToastCredito(`Usaste 1 consulta · te quedan ${nuevoRestante ?? 'ilimitadas'}`);
        setTimeout(() => setToastCredito(''), 5000);
      }
      // Si era una nueva consulta (estábamos en /chat), navegamos a /chat/:targetHiloId
      if (!consultaId) {
        ir(`/chat/${targetHiloId}`, { replace: true });
      }
      requestAnimationFrame(() => {
        const h = document.querySelector('.hilo');
        if (h) h.scrollTo({ top: h.scrollHeight, behavior: 'smooth' });
      });
    } catch (err) {
      console.error('[Chat] Error:', err);
    } finally {
      setCargando(false);
    }
  };

  // Sincronizar pregunta bloqueada si hay pendiente y no hay créditos
  useEffect(() => {
    if (pendiente && !puedeConsultar()) {
      setPreguntaBloqueada(pendiente);
    }
  }, [pendiente, puedeConsultar]);

  // Reanudar automáticamente la pregunta pendiente al volver del pago con créditos
  useEffect(() => {
    if ((pendiente || preguntaBloqueada) && puedeConsultar() && !cargando) {
      const q = pendiente || preguntaBloqueada;
      setPreguntaBloqueada(null);
      limpiarPendiente();
      enviar(q, { retomada: true });
    }
  }, [pendiente, preguntaBloqueada, puedeConsultar, cargando]);

  // Auto-cerrar notificación emergente después de 8s
  useEffect(() => {
    if (pagoReciente) {
      const timer = setTimeout(() => {
        limpiarAvisoPago();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [pagoReciente, limpiarAvisoPago]);

  const nombreUsuario = (usuario?.nombre || 'Estudiante').split(' ')[0];
  const cicloUsuario = usuario?.ciclo ?? 2;
  const labelCreditos = plan === 'pro' || plan === 'institucional' ? 'Ilimitadas' : `${restante ?? 0} de 3`;
  const costLabel = plan === 'pro' ? 'incluida en Pro' : 'usa 1 crédito';

  // Datos para la visualización del resultado
  const resultado = ultima?.resultado;
  const roles = (resultado?.roleIds ?? []).map(rol).filter(Boolean);
  const rolPrincipal = roles[0];
  const ciudad = resultado?.ciudad || 'Lima';

  return (
    <div style={{ height: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-page)', overflow: 'hidden', position: 'relative' }}>
      
      {/* ── NOTIFICACIÓN EMERGENTE (Toast desde la derecha al confirmar pago) ── */}
      {pagoReciente && (
        <div
          role="status"
          aria-live="polite"
          className="toast-emergente"
          style={{
            position: 'fixed',
            top: 70,
            right: 24,
            zIndex: 1000,
            background: '#bef264',
            color: '#0f172a',
            borderRadius: 16,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(190, 242, 100, 0.4)',
            fontWeight: 700,
            fontSize: 13.5,
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0f172a', color: '#bef264', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, flexShrink: 0 }}>
            ✓
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <strong style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>¡Pago confirmado!</strong>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>25 consultas añadidas a tu cuenta</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 10 }}>
            <button
              type="button"
              onClick={() => resetearIntentos()}
              style={{
                background: 'rgba(15, 23, 42, 0.08)',
                border: '1px solid rgba(15, 23, 42, 0.15)',
                borderRadius: 8,
                cursor: 'pointer',
                padding: '5px 11px',
                fontSize: 12,
                fontWeight: 700,
                color: '#0f172a',
                transition: 'background 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.16)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)'; }}
            >
              Reiniciar demo
            </button>
            <button
              type="button"
              onClick={() => limpiarAvisoPago()}
              style={{
                background: 'none',
                border: 0,
                cursor: 'pointer',
                fontSize: 19,
                lineHeight: 1,
                color: '#0f172a',
                opacity: 0.6,
                padding: '2px 4px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
              aria-label="Cerrar notificación"
              title="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ── ÁREA SCROLLEABLE DE MENSAJES (.hilo) ── */}
      <div className="hilo" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div className="hilo__interior" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 32px 32px', maxWidth: 1040, width: '100%', margin: '0 auto' }}>
        
        {/* ═══════════════════════════════════════════════════════════
            ESTADO 1: PANTALLA "CONSULTA" (Estado Inicial / Dashboard)
           ═══════════════════════════════════════════════════════════ */}
        {isConsulta && (
          <div className="pila animate-fade-up" style={{ gap: 24, flex: 1 }}>
            <div className="fila" style={{ alignItems: 'center', gap: 18 }}>
              <Lumi pose="saluda" alto={96} />
              <div className="pila" style={{ gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
                  Lumi · tu analista del mercado laboral
                </span>
                <h1
                  className="display"
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  Hola, {nombreUsuario}. ¿Qué quieres saber de tu carrera?
                </h1>
              </div>
            </div>

            <span style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: -6 }}>
              Tienes {labelCreditos} consultas disponibles. Pregunta por cualquier rol, ciudad o carrera.
            </span>

            {/* Tarjetas de preguntas frecuentes que hacen otros estudiantes */}
            <div className="pila" style={{ gap: 14, marginTop: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', color: 'var(--text-secondary)' }}>
                PREGUNTAS QUE HACEN OTROS ESTUDIANTES
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {PREGUNTAS_DESTACADAS.map((p) => (
                  <button
                    key={p.q}
                    type="button"
                    onClick={() => enviar(p.q)}
                    style={{
                      font: 'inherit',
                      textAlign: 'left',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--linea)',
                      borderRadius: 'var(--radio-xl)',
                      padding: '22px 24px',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      minHeight: 160,
                      cursor: 'pointer',
                      boxShadow: 'var(--sombra-sm)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--sombra-hover)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--sombra-sm)';
                      e.currentTarget.style.borderColor = 'var(--linea)';
                    }}
                  >
                    <div className="fila" style={{ gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'var(--text-primary)', color: 'var(--accent-fg)' }}>
                        {p.carrera}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'var(--bg-elevated)', color: 'var(--accent)' }}>
                        {p.tipo}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, lineHeight: 1.25, flex: 1 }}>
                      {p.q}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                      Consultar · usa 1 crédito →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ESTADO 2: PANTALLA "CARGA INICIAL" (Checklist progresivo)
           ═══════════════════════════════════════════════════════════ */}
        {isCargaInicial && (
          <div
            className="animate-scale"
            style={{
              margin: 'auto',
              width: '100%',
              maxWidth: 560,
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radio-2xl)',
              padding: 36,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              border: '1px solid var(--linea)',
              boxShadow: 'var(--sombra-panel)',
            }}
          >
            <div className="fila" style={{ alignItems: 'center', gap: 14 }}>
              <Lumi pose="piensa" alto={76} />
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
                Lumi está revisando las ofertas…
              </span>
            </div>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
              {preguntaActiva}
            </strong>
            <div style={{ height: 10, background: 'var(--bg-elevated)', borderRadius: 'var(--radio-full)', overflow: 'hidden' }}>
              <div
                style={{
                  width: pasoCarga === 0 ? '30%' : pasoCarga === 1 ? '65%' : '95%',
                  height: 10,
                  background: 'var(--accent)',
                  borderRadius: 'var(--radio-full)',
                  transition: 'width 0.45s ease-out',
                }}
              />
            </div>
            <div className="pila" style={{ gap: 10, fontSize: 15 }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: pasoCarga === 0 ? 600 : 400 }}>
                {pasoCarga > 0 ? '✓' : '●'} Buscando ofertas en portales laborales peruanos
              </span>
              <span style={{ color: pasoCarga >= 1 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: pasoCarga === 1 ? 600 : 400 }}>
                {pasoCarga > 1 ? '✓' : pasoCarga === 1 ? '●' : '○'} Normalizando habilidades y sinónimos
              </span>
              <span style={{ color: pasoCarga >= 2 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: pasoCarga === 2 ? 600 : 400 }}>
                {pasoCarga >= 2 ? '●' : '○'} Calculando porcentajes y rangos salariales
              </span>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ESTADO 3: PANTALLA "RESULTADO" (2 Columnas idéntico a Diseñadores)
           ═══════════════════════════════════════════════════════════ */}
        {isResultado && (
          <div className="pila" style={{ gap: 20, flex: 1 }}>
            {hilo.map((c) => (
              <Turno key={c.id} consulta={c} cicloUsuario={cicloUsuario}
                     onMetodologia={() => setVerMetodologia(true)} onPreguntar={enviar} />
            ))}

            {/* Si está cargando un seguimiento dentro del hilo, mostrar la pregunta y Lumi analizando abajo */}
            {cargando && (
              <div className="pila animate-fade-up" style={{ gap: 14 }}>
                <div
                  style={{
                    alignSelf: 'flex-end',
                    background: 'var(--accent)',
                    color: 'var(--accent-fg)',
                    borderRadius: '22px 22px 6px 22px',
                    padding: '14px 20px',
                    fontSize: 16,
                    maxWidth: 620,
                    lineHeight: 1.45,
                    boxShadow: '0 4px 14px rgba(75, 59, 255, 0.25)',
                  }}
                >
                  {preguntaActiva}
                </div>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 20,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    border: '1px solid var(--linea)',
                    maxWidth: 480,
                  }}
                >
                  <Lumi pose="piensa" alto={54} />
                  <div className="pila" style={{ gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
                      Lumi está revisando las ofertas…
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {pasoCarga === 0 && 'Buscando ofertas en portales laborales peruanos…'}
                      {pasoCarga === 1 && 'Normalizando habilidades y sinónimos…'}
                      {pasoCarga >= 2 && 'Calculando salarios y métricas del mercado…'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Toast flotante de crédito consumido */}
            {toastCredito && (
              <div
                className="animate-scale"
                style={{
                  alignSelf: 'flex-start',
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: '9px 16px',
                  borderRadius: 999,
                  background: 'var(--resalte)',
                  color: 'var(--resalte-fg)',
                  boxShadow: 'var(--sombra-sm)',
                }}
              >
                {toastCredito}
              </div>
            )}

            {/* Si el usuario intentó consultar sin créditos (paywall bloqueado),
                mostrar la pregunta y la tarjeta de Lumi idéntica a Imagen 1 */}
            {preguntaBloqueada && (
              <div className="pila animate-fade-up" style={{ gap: 16 }}>
                {/* Pregunta del usuario (burbuja púrpura a la derecha) */}
                <div
                  style={{
                    alignSelf: 'flex-end',
                    background: 'var(--accent)',
                    color: 'var(--accent-fg)',
                    borderRadius: '22px 22px 6px 22px',
                    padding: '14px 20px',
                    fontSize: 16,
                    maxWidth: 620,
                    lineHeight: 1.45,
                    boxShadow: '0 4px 14px rgba(75, 59, 255, 0.25)',
                  }}
                >
                  {preguntaBloqueada}
                </div>

                {/* Tarjeta oscura de Lumi (Paywall) idéntica a Imagen 1 */}
                <div
                  style={{
                    background: '#14172a',
                    borderRadius: 22,
                    padding: '20px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 20,
                    maxWidth: 760,
                    width: '100%',
                    margin: '8px auto 0',
                    boxShadow: '0 8px 30px rgba(15, 23, 42, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 14,
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                      }}
                    >
                      <Lumi alto={46} pose="saluda" />
                    </div>
                    <div className="pila" style={{ gap: 4 }}>
                      <strong style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                        Usaste tus 3 consultas gratis
                      </strong>
                      <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.4 }}>
                        Guardé tu pregunta. La respondo apenas tengas créditos.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => abrirCheckoutEnNuevaPestana('25')}
                    style={{
                      background: '#bef264',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: 14.5,
                      padding: '12px 22px',
                      borderRadius: 999,
                      border: 0,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'transform 0.15s ease, background 0.15s ease',
                      boxShadow: '0 4px 14px rgba(190, 242, 100, 0.35)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Comprar 25 consultas · S/ 25 ↗
                  </button>
                </div>

                {/* Subtexto centrado de pestaña nueva */}
                <span
                  style={{
                    textAlign: 'center',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    marginTop: 2,
                  }}
                >
                  El pago se abre en una pestaña nueva. Este chat queda abierto.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

      {/* ── BARRA DE COMPOSER FIJA Y ESTABLE EN LA PARTE INFERIOR (FUERA DEL SCROLL) ── */}
      <div
        className="chat-composer"
        style={{
          flex: 'none',
          width: '100%',
          background: 'linear-gradient(rgba(247,247,252,0) 0%, var(--bg-page) 35%)',
          padding: '6px 32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Chips contextuales de sugerencia (solo en modo resultado si no está bloqueada ni retomada) */}
          {isResultado && rolPrincipal && !preguntaBloqueada && !ultima?.retomada && (
            <div className="fila" style={{ gap: 8, flexWrap: 'wrap' }}>
              {resultado?.intent !== 'salarios' && (
                <button
                  type="button"
                  className="chip chip--opcion"
                  disabled={cargando}
                  onClick={() => enviar(`¿Cuánto gana un ${rolPrincipal.nombre} en ${ciudad}?`)}
                >
                  ¿Cuánto paga?
                </button>
              )}
              {resultado?.intent !== 'habilidades' && (
                <button
                  type="button"
                  className="chip chip--opcion"
                  disabled={cargando}
                  onClick={() => enviar(`¿Qué habilidades piden para ${rolPrincipal.nombre}?`)}
                >
                  ¿Qué habilidades piden?
                </button>
              )}
              {resultado?.intent !== 'tendencia' && (
                <button
                  type="button"
                  className="chip chip--opcion"
                  disabled={cargando}
                  onClick={() => enviar(`¿Qué está creciendo para ${rolPrincipal.nombre}?`)}
                >
                  ¿Qué está creciendo?
                </button>
              )}
              {ciudad !== 'Arequipa' && (
                <button
                  type="button"
                  className="chip chip--opcion"
                  disabled={cargando}
                  onClick={() => enviar(`¿Qué piden para ${rolPrincipal.nombre} en Arequipa?`)}
                >
                  Ver en Arequipa
                </button>
              )}
            </div>
          )}

          {/* Barra flotante tipo píldora */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radio-full)',
              padding: '8px 10px 8px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              border: '1.5px solid var(--borde-campo)',
              boxShadow: '0 6px 24px rgba(23, 21, 58, 0.08)',
              width: '100%',
            }}
          >
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !cargando) enviar(); }}
              disabled={cargando}
              placeholder={cargando ? 'Lumi está procesando tu consulta…' : 'Pregúntale a Lumi...'}
              style={{
                flex: 1,
                font: "400 15px 'Onest', system-ui, sans-serif",
                border: 0,
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                minWidth: 0,
                opacity: cargando ? 0.6 : 1,
              }}
            />
            <button
              type="button"
              onClick={() => enviar()}
              disabled={!texto.trim() || cargando}
              style={{
                width: 38,
                height: 38,
                borderRadius: 999,
                border: 0,
                background: texto.trim() && !cargando ? 'var(--accent)' : '#c7d2fe',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 18,
                cursor: texto.trim() && !cargando ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease',
                flexShrink: 0,
              }}
              aria-label="Preguntar"
            >
              ↑
            </button>
          </div>

          {/* Texto de ayuda inferior solo en consulta inicial */}
          {isConsulta && (
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', textAlign: 'center' }}>
              Escribe con tus palabras: el rol, la ciudad y si quieres saber habilidades, sueldo o tendencia.
            </span>
          )}
        </div>
      </div>

      {/* Modal de metodología */}
      <Modal abierto={verMetodologia} onCerrar={() => setVerMetodologia(false)} titulo="Metodología y fuentes">
        <ContenidoMetodologia />
      </Modal>
    </div>
  );
}
