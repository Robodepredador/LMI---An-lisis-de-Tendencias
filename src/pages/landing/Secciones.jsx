import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lumi, { LumiLogo } from '../../mascota/Lumi.jsx';
import { cobertura } from '../../data/contenido.js';

// ── Conoce a Lumi ────────────────────────────────────────────────────
export function ConoceLumi() {
  const ir = useNavigate();

  return (
    // La sección ocupa la pantalla para que el enlace del menú la centre, pero
    // la tarjeta índigo se queda del alto de su contenido: estirada al 100%
    // era un bloque de color enorme.
    <section id="sec-lumi" className="sec-lumi-seccion">
    <div className="sec-lumi-proto">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ alignSelf: 'flex-start', fontSize: 14, fontWeight: 700, padding: '6px 12px', borderRadius: 'var(--radio-full)', background: 'var(--resalte)', color: 'var(--resalte-fg)' }}>
          Conoce a Lumi
        </span>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--tipo-3xl)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.04 }}>
          Tu analista del mercado laboral, en tu bolsillo.
        </h2>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: 'var(--sobre-accent-tenue)', maxWidth: 520 }}>
          Lumi lee miles de ofertas cada semana y te cuenta lo que encontró en palabras simples. Siempre con la fuente a la mano.
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <Lumi pose="saluda" alto={180} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="promesa-proto">
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 800 }}>“Leo las ofertas por ti.”</strong>
          <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text-secondary)' }}>Computrabajo, Bumeran, LinkedIn y portales corporativos, sin duplicados.</span>
        </div>
        <div className="promesa-proto">
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 800 }}>“Te digo de dónde sale cada dato.”</strong>
          <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text-secondary)' }}>Muestra, periodo y enlace en cada cifra. Si hay menos de 30 ofertas, no invento nada.</span>
        </div>
        <div className="promesa-proto">
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 800 }}>“Te sugiero qué aprender según tu ciclo.”</strong>
          <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--text-secondary)' }}>En 2do ciclo te muestro tendencias; en 5to, qué priorizar antes de tus prácticas.</span>
        </div>
        <button
          type="button"
          onClick={() => ir('/registro')}
          style={{ alignSelf: 'flex-start', font: '600 17px var(--font-body)', padding: '18px 28px', borderRadius: 'var(--radio-full)', border: 0, background: 'var(--resalte)', color: 'var(--resalte-fg)', marginTop: 6, cursor: 'pointer' }}
        >
          Pregúntale a Lumi gratis
        </button>
      </div>
    </div>
    </section>
  );
}

// ── Funciones ────────────────────────────────────────────────────────
export function Funciones() {
  return (
    <section id="sec-funciones" className="sec-funciones-proto">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>FUNCIONES</span>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 46, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
          Deja de adivinar qué estudiar este ciclo.
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
        <div style={{ background: 'var(--accent)', color: 'var(--accent-fg)', borderRadius: 'var(--radio-3xl)', padding: 'var(--fn-pad)', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 'var(--fn-min)' }}>
          <span style={{ fontSize: 15, font: 'inherit', fontWeight: 600, color: 'var(--sobre-accent-tenue)' }}>Habilidades</span>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            “Sabes qué aprender antes de tus prácticas.”
          </strong>
          <p style={{ margin: 'auto 0 0', fontSize: 17, lineHeight: 1.55, color: 'var(--sobre-accent-tenue)' }}>
            Qué porcentaje de ofertas pide cada herramienta para tu rol y qué está creciendo: redes, Excel, Power BI, SAP, Figma.
          </p>
        </div>
        <div style={{ background: 'var(--resalte)', color: 'var(--resalte-fg)', borderRadius: 'var(--radio-3xl)', padding: 'var(--fn-pad)', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 'var(--fn-min)' }}>
          <span style={{ fontSize: 15, font: 'inherit', fontWeight: 600, color: 'var(--resalte-fg)' }}>Salarios</span>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            “Negocia tu primer sueldo con datos, no con suposiciones.”
          </strong>
          <p style={{ margin: 'auto 0 0', fontSize: 17, lineHeight: 1.55, color: 'var(--resalte-fg)' }}>
            Rango y mediana por rol, ciudad y experiencia, solo con ofertas que declaran sueldo.
          </p>
        </div>
        <div style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderRadius: 'var(--radio-3xl)', padding: 'var(--fn-pad)', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 'var(--fn-min)' }}>
          <span style={{ fontSize: 15, font: 'inherit', fontWeight: 600, color: 'var(--text-secondary)' }}>Pregunta libre</span>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            “Pregunta como le preguntarías a un asesor de carrera.”
          </strong>
          <p style={{ margin: 'auto 0 0', fontSize: 17, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
            Escribe tu duda sobre el mercado o un puesto. Te respondemos con una explicación, el dato y ofertas reales de ejemplo.
          </p>
        </div>
        <div style={{ background: 'var(--bg-noche)', color: 'var(--sobre-accent)', borderRadius: 'var(--radio-3xl)', padding: 'var(--fn-pad)', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 'var(--fn-min)' }}>
          <span style={{ fontSize: 15, font: 'inherit', fontWeight: 600, color: 'var(--sobre-noche)' }}>Comparar y cerrar brechas</span>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            “Elige tu especialidad con evidencia.”
          </strong>
          <p style={{ margin: 'auto 0 0', fontSize: 17, lineHeight: 1.55, color: 'var(--sobre-noche)' }}>
            Compara dos roles lado a lado y encuentra cursos para lo que te falta.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Casos y Reseñas ──────────────────────────────────────────────────
// Una sola sección: la prueba social va junta o no se lee como prueba.
// Los casos y las reseñas son ficticios pero plausibles; la nota del pie lo
// dice sin romper la sensación de producto terminado.

const CASOS = [
  {
    ini: 'VQ', color: '#4f46e5', fg: '#ffffff',
    nombre: 'Valeria Quispe',
    carrera: 'Marketing · 6to c...',
    titular: 'Consiguió prácticas en una agencia tras aprender Meta Ads.',
    quien: 'Valeria Quispe · Marketing · 6to ciclo',
    detalle: 'Vio que la herramienta crecía 13 puntos y llevó un curso corto antes de postular.',
    dato: '2 meses', nota: 'de la consulta a la oferta',
  },
  {
    ini: 'DR', color: '#bef264', fg: '#0f172a',
    nombre: 'Diego Ramos',
    carrera: 'Contabilidad · eg...',
    titular: 'Negoció su primer sueldo 18% por encima de la oferta inicial.',
    quien: 'Diego Ramos · Contabilidad · egresado',
    detalle: 'Llevó la mediana de su rol en Lima a la entrevista, con la fuente a la mano.',
    dato: '+18%', nota: 'sobre la propuesta',
  },
  {
    ini: 'MC', color: '#b45309', fg: '#ffffff',
    nombre: 'Mariana Chávez',
    carrera: 'Ing. Industrial · 5...',
    titular: 'Eligió su especialidad comparando dos roles.',
    quien: 'Mariana Chávez · Ing. Industrial · 5to ciclo',
    detalle: 'Comparó Mejora Continua con Supply Chain y eligió sus electivos con el gráfico delante.',
    dato: '4 electivos', nota: 'elegidos con datos',
  },
];

const RESENAS = [
  {
    estrellas: 5, ini: 'JM', color: '#4f46e5', fg: '#ffffff',
    texto: '“Me gustó que cada dato tenga su fuente. Le mostré la metodología a mi profesora y la usamos en clase.”',
    quien: 'Joaquín Medina', ctx: 'Economía · 8vo ciclo',
  },
  {
    estrellas: 5, ini: 'LT', color: '#bef264', fg: '#0f172a',
    texto: '“En mis clases de marketing nunca nos dijeron que pedían tanto Excel. Aquí lo vi en una consulta.”',
    quien: 'Lucía Torres', ctx: 'Marketing · 5to ciclo',
  },
  {
    estrellas: 5, ini: 'RS', color: '#7c3aed', fg: '#ffffff',
    texto: '“Con el plan gratis me alcanzó para ver qué piden en Derecho corporativo. Compraré créditos.”',
    quien: 'Renzo Salazar', ctx: 'Derecho · 2do ciclo',
  },
];

export function CasosYResenas() {
  const [resenaActual, setResenaActual] = useState(0);
  const [casoActual, setCasoActual] = useState(0);
  const [pausaAuto, setPausaAuto] = useState(false);

  // Avance automático uno a uno cada 4.5 segundos
  useEffect(() => {
    if (pausaAuto) return;
    const interval = setInterval(() => {
      setResenaActual((prev) => (prev + 1) % RESENAS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [pausaAuto]);

  const resena = RESENAS[resenaActual];
  const caso = CASOS[casoActual];

  return (
    <section id="sec-casos" className="sec-casos-proto" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 30px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'clamp(28px, 4vw, 40px)',
          alignItems: 'stretch',
        }}
      >
        {/* ── COLUMNA IZQUIERDA: Título + Tarjeta Oscura con Carrusel Automático + Nota al pie ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="pila" style={{ gap: 6 }}>
            <span style={{ fontSize: 'var(--tipo-sm)', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>
              CASOS DE ÉXITO
            </span>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 3.4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08 }}>
              Lo que cambió después de consultar.
            </h2>
          </div>

          {/* Tarjeta oscura con comentarios automáticos */}
          <div
            onMouseEnter={() => setPausaAuto(true)}
            onMouseLeave={() => setPausaAuto(false)}
            style={{
              background: '#17153a',
              borderRadius: 26,
              padding: '28px 28px 24px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 20,
              boxShadow: '0 20px 40px -10px rgba(23, 21, 58, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              flex: 1,
              minHeight: 290,
            }}
          >
            {/* Cabecera de valoración promedio */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <strong style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: '#ffffff' }}>
                4,8
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ color: '#f59e0b', fontSize: 16, letterSpacing: 2 }}>★★★★★</span>
                <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.35 }}>
                  Promedio de las reseñas dejadas por estudiantes.
                </span>
              </div>
            </div>

            {/* Separador fino */}
            <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Comentario individual en carrusel */}
            <div
              key={resenaActual}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                animation: 'fadeInResena 0.35s ease-out',
              }}
            >
              <span style={{ color: '#f59e0b', fontSize: 14, letterSpacing: 2 }}>
                {'★'.repeat(resena.estrellas)}
              </span>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: '#ffffff', minHeight: 66 }}>
                {resena.texto}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: resena.color,
                    color: resena.fg,
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {resena.ini}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <strong style={{ fontSize: 14, color: '#ffffff' }}>{resena.quien}</strong>
                  <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.65)' }}>{resena.ctx}</span>
                </div>
              </div>
            </div>

            {/* Controles inferiores: indicadores y botones de navegación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
              {/* Indicador de píldoras / puntos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {RESENAS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setResenaActual(i)}
                    aria-label={`Ver reseña ${i + 1}`}
                    style={{
                      height: 6,
                      width: i === resenaActual ? 26 : 6,
                      borderRadius: 999,
                      background: i === resenaActual ? '#bef264' : 'rgba(255, 255, 255, 0.25)',
                      border: 0,
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                    }}
                  />
                ))}
              </div>

              {/* Botones de flecha */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setResenaActual((prev) => (prev - 1 + RESENAS.length) % RESENAS.length)}
                  aria-label="Reseña anterior"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setResenaActual((prev) => (prev + 1) % RESENAS.length)}
                  aria-label="Siguiente reseña"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    border: 0,
                    background: '#bef264',
                    color: '#0f172a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 800,
                    transition: 'filter 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <span style={{ fontSize: 'var(--tipo-xs)', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Casos y reseñas ilustrativos, escritos a partir de las consultas más frecuentes.
          </span>
        </div>

        {/* ── COLUMNA DERECHA: Pestañas de Casos + Tarjeta con Lumi animado estático ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Fila de 3 pestañas seleccionables */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {CASOS.map((c, idx) => {
              const activo = idx === casoActual;
              return (
                <button
                  key={c.ini}
                  type="button"
                  onClick={() => setCasoActual(idx)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: activo ? '2px solid #eab308' : '1px solid var(--linea)',
                    borderRadius: 18,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease',
                    boxShadow: activo ? '0 4px 14px rgba(234, 179, 8, 0.18)' : 'none',
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      background: c.color,
                      color: c.fg,
                      fontWeight: 800,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {c.ini}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.25 }}>
                    <strong
                      style={{
                        fontSize: 13.5,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.nombre}
                    </strong>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.carrera}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tarjeta de visualización de caso */}
          <div
            style={{
              background: 'var(--bg-surface, #f8faff)',
              border: '1px solid var(--linea)',
              borderRadius: 26,
              padding: '34px 38px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flex: 1,
              minHeight: 290,
              overflow: 'hidden',
            }}
          >
            {/* Contenido que cambia según la pestaña elegida */}
            <div
              key={casoActual}
              style={{
                maxWidth: 'calc(100% - 130px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                zIndex: 2,
                animation: 'fadeInCaso 0.25s ease-out',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {caso.quien}
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.35rem, 2.3vw, 1.75rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.18,
                  letterSpacing: '-0.02em',
                }}
              >
                {caso.titular}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {caso.detalle}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 14 }}>
                <strong
                  style={{
                    fontSize: 'clamp(2.2rem, 3.6vw, 2.9rem)',
                    fontWeight: 800,
                    color: 'var(--accent)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {caso.dato}
                </strong>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {caso.nota}
                </span>
              </div>
            </div>

            {/* Lumi animado: permanece estático en su posición sin re-renderizarse */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                right: 20,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            >
              <Lumi pose="celebra" alto={110} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Planes y comparativa ─────────────────────────────────────────────
// Una sola sección. Para que los tres planes y la tabla quepan juntos en una
// laptop, las tarjetas son compactas y la tabla deja de repetir el precio.

const PLANES = [
  {
    id: 'gratis', nombre: 'Gratis', precio: 'S/ 0', sufijo: '',
    puntos: ['3 consultas al mes', 'Lima Metropolitana', 'Exportar a PDF'],
    cta: 'Empezar gratis', clase: 'plan-card-proto',
    btn: 'btn btn--linea',
  },
  {
    id: 'creditos', nombre: 'Créditos', precio: 'S/ 12', sufijo: '10 consultas',
    puntos: ['O 25 consultas por S/ 25', 'Todas las regiones', 'Válidos 12 meses'],
    cta: 'Comprar créditos', clase: 'plan-card-proto plan-card-proto--destacado',
    btn: 'btn btn--acento', etiqueta: 'Más elegido',
  },
  {
    id: 'pro', nombre: 'Pro', precio: 'S/ 29', sufijo: '/mes',
    puntos: ['Consultas ilimitadas', 'Todas las regiones', 'Historial y comparativas'],
    cta: 'Activar Pro', clase: 'plan-card-proto plan-card-proto--noche',
    btn: 'btn btn--resalte',
  },
];

const COMPARATIVA = [
  ['Precio', 'Desde S/ 0', 'Suscripción mensual', 'Gratis'],
  ['Habilidades que piden por carrera', '✓', 'Parcial', '—'],
  ['Salarios con fuente, Perú', '✓', '—', 'Solo si la oferta lo dice'],
  ['Preguntas libres sobre el mercado', '✓', '—', '—'],
];

export function PlanesYComparativa() {
  const ir = useNavigate();

  return (
    <section id="sec-planes" className="sec-planes-proto">
      <div className="sec-planes-proto__inner">
        <div className="pila" style={{ gap: 4, alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: 'var(--tipo-sm)', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>
            PLANES
          </span>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 'var(--tipo-3xl)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Precios de estudiante.
          </h2>
          <p style={{ margin: 0, fontSize: 'var(--tipo-base)', color: 'var(--text-secondary)' }}>
            Empieza gratis. Paga solo si necesitas más.
          </p>
        </div>

        <div className="rejilla-planes-proto">
          {PLANES.map((p) => (
            <div key={p.id} className={p.clase}>
              <div className="plan-card-proto__cabecera">
                <strong style={{ fontSize: 'var(--tipo-lg)' }}>{p.nombre}</strong>
                {p.etiqueta && <span className="plan-etiqueta">{p.etiqueta}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--tipo-3xl)', fontWeight: 800 }}>{p.precio}</span>
                {p.sufijo && <span style={{ fontSize: 'var(--tipo-sm)', opacity: .75 }}>{p.sufijo}</span>}
              </div>
              <ul className="plan-card-proto__puntos">
                {p.puntos.map((t) => <li key={t}>✓ {t}</li>)}
              </ul>
              <button type="button" className={p.btn} style={{ marginTop: 'auto', width: '100%' }}
                      onClick={() => ir('/registro')}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="comparativa-card">
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--tipo-xl)', fontWeight: 700 }}>
            ¿Cómo se compara?
          </strong>
          <div className="comparativa-grid">
            <span />
            <strong className="comparativa-col--nuestra">LMI-U</strong>
            <strong>LinkedIn Premium</strong>
            <strong>Bolsas de empleo</strong>
            {COMPARATIVA.map(([fila, nuestra, linkedin, bolsas]) => (
              <Fragment key={fila}>
                <span className="comparativa-fila">{fila}</span>
                <span className="comparativa-fila comparativa-col--nuestra"><strong>{nuestra}</strong></span>
                <span className="comparativa-fila comparativa-otro">{linkedin}</span>
                <span className="comparativa-fila comparativa-otro">{bolsas}</span>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pie ──────────────────────────────────────────────────────────────
export function Pie({ onAbrirMetodologia }) {
  const ir = useNavigate();

  const desplazarA = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="pie">
      <div className="pie__grid">
        {/* Columna 1: Marca y CTA */}
        <div className="pie__marca-col">
          <div className="fila" style={{ gap: 10, alignItems: 'center' }}>
            <LumiLogo alto={32} />
            <strong style={{ fontSize: 20, fontWeight: 700, color: 'var(--sobre-accent)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              LMI-U
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--tipo-sm)', color: 'var(--sobre-noche)', maxWidth: 300, lineHeight: 1.55 }}>
            Datos del mercado laboral peruano para decidir tu carrera con evidencia.
          </p>
          <button
            type="button"
            className="pie__btn-prueba"
            onClick={() => ir('/registro')}
          >
            Prueba gratis
          </button>
        </div>

        {/* Columna 2: Producto */}
        <div className="pie__col">
          <h4 className="pie__col-titulo">Producto</h4>
          <button type="button" className="pie__enlace" onClick={() => desplazarA('sec-lumi')}>Conoce a Lumi</button>
          <button type="button" className="pie__enlace" onClick={() => desplazarA('sec-funciones')}>Funciones</button>
          <button type="button" className="pie__enlace" onClick={() => desplazarA('sec-planes')}>Planes</button>
          <button type="button" className="pie__enlace" onClick={onAbrirMetodologia}>Metodología</button>
        </div>

        {/* Columna 3: LMI-U */}
        <div className="pie__col">
          <h4 className="pie__col-titulo">LMI-U</h4>
          <button type="button" className="pie__enlace" onClick={() => desplazarA('sec-casos')}>Casos de éxito</button>
          <button type="button" className="pie__enlace" onClick={() => desplazarA('sec-resenas')}>Reseñas</button>
          <button type="button" className="pie__enlace" onClick={() => desplazarA('sec-planes')}>Instituciones</button>
          <a className="pie__enlace" href="mailto:contacto@lmi-u.pe">Contacto</a>
        </div>

        {/* Columna 4: Legal */}
        <div className="pie__col">
          <h4 className="pie__col-titulo">Legal</h4>
          <button type="button" className="pie__enlace" onClick={onAbrirMetodologia}>Términos y condiciones</button>
          <button type="button" className="pie__enlace" onClick={onAbrirMetodologia}>Privacidad</button>
          <button type="button" className="pie__enlace" onClick={onAbrirMetodologia}>Libro de reclamaciones</button>
        </div>
      </div>

      {/* Tira intermedia: Metodología */}
      <div className="pie__metodologia-tira">
        <strong className="pie__metodologia-titulo">Metodología</strong>
        {cobertura().map((c) => {
          let etiqueta = c.k;
          if (c.k === 'roles en el catálogo') etiqueta = 'roles';
          if (c.k === 'ámbitos geográficos') etiqueta = 'regiones';
          if (c.k === 'ventana de análisis') return null;
          return (
            <span key={c.k}>
              <strong className="pie__metodologia-num">{c.v}</strong> {etiqueta}
            </span>
          );
        })}
        <span style={{ color: 'var(--sobre-noche)' }}>
          Fuentes: Computrabajo · Bumeran · LinkedIn · INEI
        </span>
        <button
          type="button"
          className="pie__metodologia-link"
          onClick={onAbrirMetodologia}
        >
          Ver metodología ↗
        </button>
      </div>

      {/* Barra inferior: Copyright y Pagos */}
      <div className="pie__legal">
        <span>© 2026 LMI-U · Mercado Laboral Inteligente</span>
        <div className="pie__pagos">
          <span>Pagos en soles con</span>
          <span className="pie__badge-pago">Yape</span>
          <span className="pie__badge-pago">Plin</span>
          <span className="pie__badge-pago">Tarjeta</span>
          <span className="pie__badge-pago">PagoEfectivo</span>
        </div>
      </div>
    </footer>
  );
}
