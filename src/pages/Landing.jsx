import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import catalogo from '../data/catalogo.json';
import ContenidoMetodologia from '../components/metodologia.jsx';
import Modal from '../components/Modal.jsx';
import AnimarNumero from '../components/AnimarNumero.jsx';
import { FEATURES, PLANES, TOTAL_OFERTAS, fmt, ventanaAnalisis } from '../data/contenido.js';

const DEMO_ROLES = [
  { id: 'analista-datos-jr', label: 'Datos', insight: 'SQL y Excel lideran la demanda. Power BI es lo que más creció este trimestre.' },
  { id: 'desarrollador-frontend-jr', label: 'Frontend', insight: 'React y TypeScript concentran más del 70 % de las búsquedas técnicas.' },
  { id: 'analista-marketing-digital', label: 'Marketing', insight: 'Google Analytics y Meta Ads son el estándar mínimo exigido en Lima.' },
];

export default function Landing() {
  const ir = useNavigate();
  const { hash } = useLocation();
  const [verMetodologia, setVerMetodologia] = useState(false);
  const [rolId, setRolId] = useState('analista-datos-jr');

  const demoActual = DEMO_ROLES.find((d) => d.id === rolId) ?? DEMO_ROLES[0];
  const rolActual = catalogo.roles.find((r) => r.id === rolId) ?? catalogo.roles[0];

  // Enlaces como /#metodologia (o la antigua /metodologia, que redirige aquí)
  // tienen que aterrizar en la sección, no al principio de la página.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <div className="pila">
      {/* ── Hero ── */}
      <section className="seccion seccion--pantalla">
        <div className="fila" style={{ gap: 48, alignItems: 'center' }}>
        <div className="pila" style={{ flex: '1 1 420px', minWidth: 0, gap: 24 }}>
          <span className="eti">{fmt(TOTAL_OFERTAS)} ofertas laborales en Perú · {ventanaAnalisis()}</span>
          <h1 className="display display--hero" style={{ margin: 0 }}>
            Pregúntale al mercado laboral <em style={{ color: 'var(--accent)' }}>antes</em> de decidir.
          </h1>
          <p className="lead" style={{ margin: 0, maxWidth: 520 }}>
            Qué habilidades piden las empresas, cuánto pagan y qué roles crecen. En lenguaje simple y con la fuente de cada cifra.
          </p>
          <div className="fila" style={{ gap: 12 }}>
            <button className="btn btn--acento btn--grande" onClick={() => ir('/registro')}>Prueba gratis · 3 consultas</button>
            <button className="btn btn--linea" onClick={() => ir('/login')}>Ya tengo cuenta</button>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Sin tarjeta. Sin suscripción.</span>
        </div>

        <div className="tarjeta" style={{ flex: '1 1 420px', minWidth: 0, borderRadius: 'var(--radius-2xl)', padding: 24, boxShadow: 'var(--shadow-hero)' }}>
          <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>DEMO EN VIVO</span>
            <div className="fila" style={{ gap: 6 }}>
              {DEMO_ROLES.map((dr) => (
                <button
                  key={dr.id}
                  className="chip"
                  aria-pressed={rolId === dr.id}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderColor: rolId === dr.id ? 'var(--accent)' : 'var(--border-subtle)',
                    background: rolId === dr.id ? 'var(--accent)' : 'rgba(242, 239, 233, 0.04)',
                    color: rolId === dr.id ? 'var(--text-dark)' : 'var(--text-muted)',
                    fontWeight: rolId === dr.id ? 600 : 400,
                  }}
                  onClick={() => setRolId(dr.id)}
                >
                  {dr.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ alignSelf: 'flex-end', maxWidth: '88%', background: '#2a2823', padding: '12px 16px', borderRadius: '16px 16px 4px 16px', fontSize: 14.5, lineHeight: 1.45, transition: 'all 0.25s ease' }}>
            ¿Qué habilidades piden para {rolActual.nombre} en Lima?
          </div>
          <div className="pila" style={{ gap: 14 }}>
            <p className="display" style={{ margin: 0, fontSize: 20, lineHeight: 1.25, letterSpacing: 0, minHeight: 48, transition: 'opacity 0.2s ease' }}>
              {demoActual.insight}
            </p>
            {rolActual.habilidades.slice(0, 4).map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(80px,118px) minmax(0,1fr) 44px', gap: 12, alignItems: 'center', fontSize: 13 }}>
                <span className="truncate" style={{ color: 'var(--text-secondary)' }} title={h.k}>{h.k}</span>
                <div className="barra"><span style={{ width: `${h.pct}%` }} /></div>
                <span className="mono" style={{ fontSize: 12.5, textAlign: 'right' }}>
                  <AnimarNumero valor={h.pct} />%
                </span>
              </div>
            ))}
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
              n = {fmt(rolActual.porCiudad?.Lima?.n ?? rolActual.salario.n)} ofertas · Lima · {ventanaAnalisis()}
            </span>
          </div>
        </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="como-funciona" className="seccion seccion--pantalla pila" style={{ gap: 28, justifyContent: 'center' }}>
        <div className="pila" style={{ gap: 8, maxWidth: 640 }}>
          <span className="eti">ARQUITECTURA DEL SISTEMA</span>
          <h2 className="display display--pag" style={{ margin: 0 }}>Cómo funciona LMI-U</h2>
          <p className="lead" style={{ margin: 0 }}>
            Tres principios diseñados para responder con certeza estadística antes de tomar una decisión laboral o curricular.
          </p>
        </div>
        <div className="rejilla--fina">
          {FEATURES.map((f) => (
            <div key={f.n} className="pila" style={{ gap: 10 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{f.n}</span>
              <strong style={{ fontSize: 18, fontWeight: 600 }}>{f.t}</strong>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)' }}>{f.d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Metodología ── va antes de los precios: la confianza en el dato es
          el argumento de venta, así que se gana antes de pedir dinero. */}
      <section id="metodologia" className="seccion seccion--pantalla pila" style={{ gap: 12, maxWidth: 960, justifyContent: 'center' }}>
        <div className="pila" style={{ gap: 8 }}>
          <span className="eti">TRANSPARENCIA</span>
          <h2 className="display display--pag" style={{ margin: 0 }}>Metodología y fuentes</h2>
          <p className="lead" style={{ margin: 0, maxWidth: '70ch' }}>
            Cada cifra indica cuántas ofertas la respaldan, de qué ámbito y en qué periodo.
          </p>
        </div>
        <ContenidoMetodologia compacto />
        <button className="btn btn--linea" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => setVerMetodologia(true)}>
          Ver metodología completa
        </button>
      </section>

      {/* ── Planes ── */}
      <section id="planes" className="seccion seccion--pantalla pila" style={{ gap: 24, justifyContent: 'center' }}>
        <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <h2 className="display display--pag" style={{ margin: 0 }}>Planes</h2>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Exportar a PDF está incluido en todos.</span>
        </div>
        <div className="rejilla">
          {PLANES.map((p) => (
            <div key={p.id} className={`tarjeta${p.destacado ? ' tarjeta--destacada' : ''}`}>
              <div className="fila" style={{ justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 16, fontWeight: 600 }}>{p.name}</strong>
                {p.tag && <span className="mono" style={{ fontSize: 11, padding: '4px 8px', borderRadius: 'var(--radius-full)', background: 'var(--accent)', color: 'var(--text-dark)' }}>{p.tag}</span>}
              </div>
              <div className="fila" style={{ alignItems: 'baseline', gap: 6 }}>
                <span className="display" style={{ fontSize: 46, lineHeight: 1 }}>{p.price}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{p.unit}</span>
              </div>
              <ul className="pila" style={{ gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                {p.items.map((i) => (
                  <li key={i} style={{ display: 'flex', gap: 10 }}><span style={{ color: 'var(--accent)' }}>—</span>{i}</li>
                ))}
              </ul>
              <button
                className={`btn ${p.destacado ? 'btn--acento' : 'btn--linea'}`}
                style={{ marginTop: 'auto' }}
                onClick={() => ir('/registro')}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Para universidades ── */}
      <section id="universidades" className="seccion seccion--pantalla" style={{ justifyContent: 'center' }}>
        <div className="tarjeta fila" style={{ borderRadius: 'var(--radius-2xl)', padding: 36, gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="pila" style={{ gap: 8, maxWidth: 600 }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>PARA UNIVERSIDADES</span>
            <strong className="display display--card">Licencia institucional para docentes y directores, con el nombre de tu universidad.</strong>
            <span style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Consultas ilimitadas, brechas frente a la malla curricular y reportes para comités.
            </span>
          </div>
          <a href="mailto:convenios@lmi-u.pe?subject=Consulta%20de%20Convenio%20Institucional" className="btn btn--linea">
            Solicitar información
          </a>
        </div>
      </section>

      <Modal abierto={verMetodologia} onCerrar={() => setVerMetodologia(false)} titulo="Metodología y fuentes">
        <ContenidoMetodologia />
      </Modal>
    </div>
  );
}
