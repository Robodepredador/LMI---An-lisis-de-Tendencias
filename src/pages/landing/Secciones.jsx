import { useNavigate } from 'react-router-dom';
import Lumi, { LumiLogo } from '../../mascota/Lumi.jsx';
import { cobertura } from '../../data/contenido.js';

// ── Conoce a Lumi ────────────────────────────────────────────────────
export function ConoceLumi() {
  const ir = useNavigate();

  return (
    <section id="sec-lumi" className="sec-lumi-proto">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <span style={{ alignSelf: 'flex-start', fontSize: 14, fontWeight: 700, padding: '6px 12px', borderRadius: 'var(--radio-full)', background: 'var(--resalte)', color: 'var(--resalte-fg)' }}>
          Conoce a Lumi
        </span>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 50, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
          Tu analista del mercado laboral, en tu bolsillo.
        </h2>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: 'var(--sobre-accent-tenue)', maxWidth: 520 }}>
          Lumi lee miles de ofertas cada semana y te cuenta lo que encontró en palabras simples. Siempre con la fuente a la mano.
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <Lumi pose="saluda" alto={250} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
export function CasosYResenas() {
  return (
    <>
      <section id="sec-casos" className="sec-casos-proto">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>CASOS DE ÉXITO</span>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 46, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.02 }}>
              Lo que cambió después de consultar.
            </h2>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, padding: '7px 12px', borderRadius: 'var(--radio-full)', background: 'var(--alerta-bg)', color: 'var(--alerta-fg)' }}>
            Placeholder · reemplazar con casos reales
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {/* Caso 1 */}
          <div className="caso-card-proto">
            <div className="caso-foto-placeholder">Foto del estudiante</div>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>
              Consiguió prácticas en una agencia tras aprender Meta Ads.
            </strong>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Marketing · 6to ciclo. Vio que la herramienta crecía 13 puntos y llevó un curso corto antes de postular.
            </span>
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 'var(--radio-full)', background: 'var(--resalte)', color: 'var(--resalte-fg)' }}>
                2 meses
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 'var(--radio-full)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                de la consulta a la oferta
              </span>
            </div>
          </div>

          {/* Caso 2 */}
          <div className="caso-card-proto">
            <div className="caso-foto-placeholder">Foto del estudiante</div>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>
              Negoció su primer sueldo 18% por encima de la oferta inicial.
            </strong>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Contabilidad · egresada. Llevó la mediana de su rol en Lima a la entrevista.
            </span>
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 'var(--radio-full)', background: 'var(--resalte)', color: 'var(--resalte-fg)' }}>
                +18%
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 'var(--radio-full)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                sobre la propuesta
              </span>
            </div>
          </div>

          {/* Caso 3 */}
          <div className="caso-card-proto">
            <div className="caso-foto-placeholder">Foto del estudiante</div>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>
              Eligió su especialidad comparando dos roles.
            </strong>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Ing. Industrial · 5to ciclo. Comparó Mejora Continua con Supply Chain y eligió electivos.
            </span>
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 'var(--radio-full)', background: 'var(--resalte)', color: 'var(--resalte-fg)' }}>
                4 electivos
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 'var(--radio-full)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                elegidos con datos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Reseñas */}
      <section id="sec-resenas" className="sec-resenas-proto">
        {/* Card 1: 4.8 Reseñas */}
        <div style={{ background: 'var(--bg-noche)', color: 'var(--sobre-accent)', borderRadius: 'var(--radio-2xl)', padding: 30, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--sobre-noche)' }}>RESEÑAS</span>
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 68, fontWeight: 800, lineHeight: 1 }}>4,8</strong>
          <span style={{ fontSize: 20, color: 'var(--estrella)', letterSpacing: 3 }}>★★★★★</span>
          <span style={{ fontSize: 15, color: 'var(--sobre-noche)', lineHeight: 1.5 }}>De 312 reseñas verificadas con correo universitario.</span>
        </div>

        {/* Card 2 */}
        <div className="resena-card-proto">
          <span style={{ fontSize: 16, color: 'var(--estrella)', letterSpacing: 2 }}>★★★★★</span>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
            “En mis clases de marketing nunca nos dijeron que pedían tanto Excel. Aquí lo vi en una consulta.”
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radio-full)', background: 'var(--resalte)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ fontSize: 14 }}>Nombre Apellido</strong>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Marketing · 5to ciclo</span>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>✓ Verificada · placeholder</span>
        </div>

        {/* Card 3 */}
        <div className="resena-card-proto">
          <span style={{ fontSize: 16, color: 'var(--estrella)', letterSpacing: 2 }}>★★★★★</span>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
            “Me gustó que cada dato tenga su fuente. Le mostré el link a mi profesora y lo usamos en clase.”
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radio-full)', background: 'var(--accent-apagado)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ fontSize: 14 }}>Nombre Apellido</strong>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Economía · 8vo ciclo</span>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>✓ Verificada · placeholder</span>
        </div>

        {/* Card 4 */}
        <div className="resena-card-proto">
          <span style={{ fontSize: 16, color: 'var(--estrella)', letterSpacing: 2 }}>★★★★☆</span>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
            “Con el plan gratis me alcanzó para ver qué piden en Derecho corporativo. Compraré créditos para prácticas.”
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radio-full)', background: 'var(--alerta-bg)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ fontSize: 14 }}>Nombre Apellido</strong>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Derecho · 2do ciclo</span>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>✓ Verificada · placeholder</span>
        </div>
      </section>
    </>
  );
}

// ── Planes & Comparativa ─────────────────────────────────────────────
export function PlanesYComparativa() {
  const ir = useNavigate();

  return (
    <>
    <section id="sec-planes" className="sec-planes-proto">
      <div className="sec-planes-proto__inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>PLANES</span>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 46, fontWeight: 800, letterSpacing: '-0.03em' }}>
          Precios de estudiante.
        </h2>
        <p style={{ margin: 0, fontSize: 17, color: 'var(--text-secondary)' }}>
          Empieza gratis. Paga solo si necesitas más.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {/* Plan Gratis */}
        <div className="plan-card-proto">
          <strong style={{ fontSize: 18 }}>Gratis</strong>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800 }}>S/ 0</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 16 }}>
            <span>✓ 3 consultas al mes</span>
            <span>✓ Lima Metropolitana</span>
            <span>✓ Exportar a PDF</span>
          </div>
          <button
            type="button"
            onClick={() => ir('/registro')}
            style={{
              marginTop: 'auto',
              font: '600 16px var(--font-body)',
              padding: 16,
              borderRadius: 'var(--radio-full)',
              border: '2px solid var(--text-primary)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            Empezar gratis
          </button>
        </div>

        {/* Plan Créditos */}
        <div className="plan-card-proto plan-card-proto--destacado">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 18 }}>Créditos</strong>
            <span style={{ fontSize: 13, fontWeight: 700, padding: '5px 11px', borderRadius: 'var(--radio-full)', background: 'var(--resalte)', color: 'var(--resalte-fg)' }}>
              Más elegido
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800 }}>S/ 12</span>
            <span style={{ color: 'var(--text-secondary)' }}>10 consultas</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 16 }}>
            <span>✓ O 25 consultas por S/ 25</span>
            <span>✓ Todas las regiones</span>
            <span>✓ Válidos 12 meses</span>
          </div>
          <button
            type="button"
            onClick={() => ir('/registro')}
            style={{
              marginTop: 'auto',
              font: '600 16px var(--font-body)',
              padding: 16,
              borderRadius: 'var(--radio-full)',
              border: 0,
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              cursor: 'pointer'
            }}
          >
            Comprar créditos
          </button>
        </div>

        {/* Plan Pro */}
        <div className="plan-card-proto plan-card-proto--noche">
          <strong style={{ fontSize: 18 }}>Pro</strong>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800 }}>S/ 29</span>
            <span style={{ color: 'var(--sobre-noche)' }}>/mes</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 16, color: 'var(--sobre-accent-tenue)' }}>
            <span>✓ Consultas ilimitadas</span>
            <span>✓ Todas las regiones</span>
            <span>✓ Historial y comparativas</span>
          </div>
          <button
            type="button"
            onClick={() => ir('/registro')}
            style={{
              marginTop: 'auto',
              font: '600 16px var(--font-body)',
              padding: 16,
              borderRadius: 'var(--radio-full)',
              border: 0,
              background: 'var(--resalte)',
              color: 'var(--resalte-fg)',
              cursor: 'pointer'
            }}
          >
            Activar Pro
          </button>
        </div>
      </div>

      </div>
    </section>

    {/* La comparativa sale de Planes: juntas no caben en una pantalla, y al
        hacer clic en "Planes" lo que tiene que verse son los tres planes. */}
    <section id="sec-comparativa" className="sec-comparativa-proto">
      <div className="comparativa-card">
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>
          ¿Cómo se compara?
        </strong>
        <div className="comparativa-grid">
          <span />
          <strong style={{ padding: 12, background: 'var(--bg-elevated)', borderRadius: '12px 12px 0 0', color: 'var(--accent)' }}>
            LMI-U
          </strong>
          <strong style={{ padding: 12 }}>LinkedIn Premium</strong>
          <strong style={{ padding: 12 }}>Bolsas de empleo</strong>

          <span style={{ padding: '12px 0', borderTop: '1px solid var(--linea)' }}>Precio</span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', background: 'var(--bg-elevated)', fontWeight: 700 }}>
            Desde S/ 0 · S/ 12
          </span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', color: 'var(--text-secondary)' }}>
            Aprox. S/ 150/mes*
          </span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', color: 'var(--text-secondary)' }}>
            Gratis
          </span>

          <span style={{ padding: '12px 0', borderTop: '1px solid var(--linea)' }}>Habilidades que piden por carrera</span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', background: 'var(--bg-elevated)', fontWeight: 700 }}>
            ✓
          </span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', color: 'var(--text-secondary)' }}>
            Parcial
          </span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', color: 'var(--text-secondary)' }}>
            —
          </span>

          <span style={{ padding: '12px 0', borderTop: '1px solid var(--linea)' }}>Salarios con fuente, Perú</span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', background: 'var(--bg-elevated)', fontWeight: 700 }}>
            ✓
          </span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', color: 'var(--text-secondary)' }}>
            —
          </span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', color: 'var(--text-secondary)' }}>
            Solo si la oferta lo dice
          </span>

          <span style={{ padding: '12px 0', borderTop: '1px solid var(--linea)' }}>Preguntas libres sobre el mercado</span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', background: 'var(--bg-elevated)', fontWeight: 700, borderRadius: '0 0 12px 12px' }}>
            ✓
          </span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', color: 'var(--text-secondary)' }}>
            —
          </span>
          <span style={{ padding: 12, borderTop: '1px solid var(--linea)', color: 'var(--text-secondary)' }}>
            —
          </span>
        </div>
        <span style={{ fontSize: 'var(--tipo-xs)', color: 'var(--text-secondary)' }}>
          *Precio referencial de LinkedIn Premium Career; verificar antes de publicar.
        </span>
      </div>
    </section>
    </>
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
