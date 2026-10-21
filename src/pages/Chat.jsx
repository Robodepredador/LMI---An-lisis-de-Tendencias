import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp, CICLOS } from '../store.js';
import { consultar, cursosDe, rol, salarioDe, MIN_MUESTRA } from '../lib/consultar.js';
import { CompareTable, CourseCards } from '../viz/graficos.jsx';
import Puntos from '../viz/Puntos.jsx';
import Franja from '../viz/Franja.jsx';
import Tendencia from '../viz/Tendencia.jsx';
import Lumi from '../mascota/Lumi.jsx';
import { filasDe } from '../lib/habilidades.js';
import { consejo, explicacion, titular } from '../lib/prosa.js';
import Modal from '../components/Modal.jsx';
import ContenidoMetodologia from '../components/metodologia.jsx';
import { fmt, ventanaAnalisis } from '../data/contenido.js';

const ETIQUETA = {
  habilidades: 'HABILIDADES',
  salarios: 'SALARIOS',
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

export default function Chat() {
  const { consultaId } = useParams();
  const ir = useNavigate();

  const usuario = useApp((s) => s.usuario);
  const consultas = useApp((s) => s.consultas);
  const restante = useApp((s) => s.restantes());
  const plan = useApp((s) => s.plan);
  const puedeConsultar = useApp((s) => s.puedeConsultar);
  const registrarConsulta = useApp((s) => s.registrarConsulta);
  const abrirModalPlanes = useApp((s) => s.abrirModalPlanes);

  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [preguntaActiva, setPreguntaActiva] = useState('');
  const [pasoCarga, setPasoCarga] = useState(0);
  const [verMetodologia, setVerMetodologia] = useState(false);
  const [toastCredito, setToastCredito] = useState('');

  // Consulta visible seleccionada del historial o la última generada
  const consultaActual = consultaId
    ? consultas.find((c) => c.id === consultaId)
    : consultas[0] || null;

  // Estado reactivo: consulta inicial (vacío), cargando, o mostrando resultado
  const isConsulta = !cargando && (!consultaActual || (consultas.length === 0 && !consultaId));
  const isResultado = !cargando && !!consultaActual;

  const timerRef = useRef([]);
  useEffect(() => {
    return () => timerRef.current.forEach(clearTimeout);
  }, []);

  const enviar = async (preguntaTexto) => {
    const q = (preguntaTexto ?? texto).trim();
    if (!q || cargando) return;

    if (!puedeConsultar()) {
      abrirModalPlanes();
      return;
    }

    setTexto('');
    setPreguntaActiva(q);
    setCargando(true);
    setPasoCarga(0);

    // Animación de pasos de carga: 30% -> 65% -> 95%
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [
      setTimeout(() => setPasoCarga(1), 400),
      setTimeout(() => setPasoCarga(2), 900),
    ];

    try {
      const res = await consultar(q);
      const reg = registrarConsulta({ pregunta: q, resultado: res });
      if (reg.costo === 1) {
        const nuevoRestante = useApp.getState().restantes();
        setToastCredito(`Usaste 1 consulta · te quedan ${nuevoRestante ?? 'ilimitadas'}`);
        setTimeout(() => setToastCredito(''), 5000);
      }
      if (consultaId) ir('/chat');
    } catch (err) {
      console.error('[Chat] Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const nombreUsuario = (usuario?.nombre || 'Estudiante').split(' ')[0];
  const cicloUsuario = usuario?.ciclo ?? 2;
  const cicloLabel = CICLOS[cicloUsuario] || '5to – 6to';
  const labelCreditos = plan === 'pro' || plan === 'institucional' ? 'Ilimitadas' : `${restante ?? 0} de 3`;
  const costLabel = plan === 'pro' ? 'incluida en Pro' : 'usa 1 crédito';

  // Datos para la visualización del resultado
  const resultado = consultaActual?.resultado;
  const roles = (resultado?.roleIds ?? []).map(rol).filter(Boolean);
  const rolPrincipal = roles[0];
  const ciudad = resultado?.ciudad || 'Lima';
  const esInsuficiente = resultado?.sinDatos || (rolPrincipal && salarioDe(rolPrincipal, ciudad).n < MIN_MUESTRA && resultado?.intent === 'salarios');

  const muestraTotal = roles.reduce((sum, r) => sum + (rolPrincipal ? salarioDe(r, ciudad).n : r.ofertas), 0);

  return (
    <div className="hilo" style={{ background: 'var(--bg-page)', minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      <div className="hilo__interior" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, padding: '32px 40px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        
        {/* ═══════════════════════════════════════════════════════════
            ESTADO 1: PANTALLA "CONSULTA" (Estado Inicial / Dashboard)
           ═══════════════════════════════════════════════════════════ */}
        {isConsulta && (
          <div className="pila animate-fade-up" style={{ gap: 24 }}>
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

            {/* Barra flotante tipo píldora inferior */}
            <div style={{ position: 'sticky', bottom: 0, margin: 'auto -40px -32px', padding: '16px 40px 24px', background: 'linear-gradient(rgba(247,247,252,0), var(--bg-page) 30%)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radio-full)',
                  padding: '8px 8px 8px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: '1.5px solid var(--borde-campo)',
                  boxShadow: '0 6px 24px rgba(23, 21, 58, 0.08)',
                }}
              >
                <input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') enviar(); }}
                  placeholder="¿Cuánto gana un asistente contable en Lima?"
                  style={{
                    flex: 1,
                    font: "400 16px 'Onest', system-ui, sans-serif",
                    border: 0,
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    minWidth: 0,
                  }}
                />
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {costLabel}
                </span>
                <button
                  type="button"
                  onClick={() => enviar()}
                  disabled={!texto.trim()}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 999,
                    border: 0,
                    background: texto.trim() ? 'var(--accent)' : 'var(--accent-apagado)',
                    color: texto.trim() ? 'var(--accent-fg)' : 'var(--accent-apagado-fg)',
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: texto.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease',
                  }}
                  aria-label="Consultar"
                >
                  →
                </button>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 24 }}>
                Escribe con tus palabras: el rol, la ciudad y si quieres saber habilidades, sueldo o tendencia.
              </span>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ESTADO 2: PANTALLA "CARGA" (Checklist progresivo)
           ═══════════════════════════════════════════════════════════ */}
        {cargando && (
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

            {/* CASO A: Muestra insuficiente */}
            {esInsuficiente ? (
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
                    onClick={() => enviar(`¿Cuánto gana un ${rolPrincipal?.nombre || 'asistente'} en todo el país?`)}
                  >
                    Ver en todo el país
                  </button>
                  <button
                    type="button"
                    className="enlace"
                    onClick={() => setVerMetodologia(true)}
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
                        onClick={() => setVerMetodologia(true)}
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

            {/* Pie Flotante con Sugerencias y Barra de Re-pregunta */}
            <div style={{ position: 'sticky', bottom: 0, margin: 'auto -40px -32px', padding: '16px 40px 24px', background: 'linear-gradient(rgba(247,247,252,0), var(--bg-page) 30%)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rolPrincipal && (
                <div className="fila" style={{ gap: 8, flexWrap: 'wrap' }}>
                  {resultado?.intent !== 'salarios' && (
                    <button
                      type="button"
                      className="chip chip--opcion"
                      onClick={() => enviar(`¿Cuánto gana un ${rolPrincipal.nombre} en ${ciudad}?`)}
                    >
                      ¿Cuánto paga?
                    </button>
                  )}
                  {resultado?.intent !== 'habilidades' && (
                    <button
                      type="button"
                      className="chip chip--opcion"
                      onClick={() => enviar(`¿Qué habilidades piden para ${rolPrincipal.nombre}?`)}
                    >
                      ¿Qué habilidades piden?
                    </button>
                  )}
                  {resultado?.intent !== 'tendencia' && (
                    <button
                      type="button"
                      className="chip chip--opcion"
                      onClick={() => enviar(`¿Qué está creciendo para ${rolPrincipal.nombre}?`)}
                    >
                      ¿Qué está creciendo?
                    </button>
                  )}
                  {ciudad !== 'Arequipa' && (
                    <button
                      type="button"
                      className="chip chip--opcion"
                      onClick={() => enviar(`¿Qué piden para ${rolPrincipal.nombre} en Arequipa?`)}
                    >
                      Ver en Arequipa
                    </button>
                  )}
                </div>
              )}

              <div
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radio-full)',
                  padding: '8px 8px 8px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: '1.5px solid var(--borde-campo)',
                  boxShadow: '0 6px 24px rgba(23, 21, 58, 0.08)',
                }}
              >
                <input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') enviar(); }}
                  placeholder="Sigue preguntando sobre este rol o el mercado…"
                  style={{
                    flex: 1,
                    font: "400 15px 'Onest', system-ui, sans-serif",
                    border: 0,
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    minWidth: 0,
                  }}
                />
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {costLabel}
                </span>
                <button
                  type="button"
                  onClick={() => enviar()}
                  disabled={!texto.trim()}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    border: 0,
                    background: texto.trim() ? 'var(--accent)' : 'var(--accent-apagado)',
                    color: texto.trim() ? 'var(--accent-fg)' : 'var(--accent-apagado-fg)',
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: texto.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Preguntar"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de metodología */}
      <Modal abierto={verMetodologia} onCerrar={() => setVerMetodologia(false)} titulo="Metodología y fuentes">
        <ContenidoMetodologia />
      </Modal>
    </div>
  );
}
