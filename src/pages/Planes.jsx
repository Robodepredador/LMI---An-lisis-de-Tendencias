import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { PLANES, PRO, proximaRenovacion } from '../data/contenido.js';

// Pantalla de planes con ruta propia. El paywall la cubre dentro de la app,
// pero esta sigue viva para el enlace "Ver Pro estudiante" de la cuenta y
// para cualquier link compartido.
export default function Planes() {
  const ir = useNavigate();
  const pendiente = useApp((s) => s.pendiente);
  const plan = useApp((s) => s.plan);
  const rutaRetornoChat = useApp((s) => s.rutaRetornoChat) || '/chat';
  const [gratis, pro] = PLANES;

  const yaEsPro = plan === 'pro' || plan === 'institucional';

  return (
    <div className="seccion animate-fade" style={{ maxWidth: 1040, padding: 'clamp(20px, 3.5vw, 40px) clamp(16px, 3vw, 32px)' }}>
      <div className="pasarela">
        <div className="pasarela__principal">
          <div className="pila" style={{ gap: 8 }}>
            <span className="eti" style={{ alignSelf: 'flex-start' }}>PLANES</span>
            <h1 className="display" style={{ margin: 0, fontSize: 32 }}>
              Gratis te dice qué. Pro te dice cómo.
            </h1>
            {pendiente ? (
              <span style={{ fontSize: 14.5, color: 'var(--text-secondary)' }}>
                Tu pregunta «<strong style={{ color: 'var(--text-primary)' }}>{pendiente}</strong>» quedó
                guardada y se responderá apenas actives tu plan.
              </span>
            ) : (
              <span style={{ fontSize: 14.5, color: 'var(--text-secondary)' }}>
                El plan gratis te dice qué pide el mercado. Pro estudiante te dice qué hacer con eso.
              </span>
            )}
          </div>

          <div className="fila" style={{ gap: 14, alignItems: 'stretch', flexWrap: 'wrap' }}>
            {[gratis, pro].map((p) => {
              const destacada = p.id === 'pro';
              return (
                <div
                  key={p.id}
                  className="pila"
                  style={{
                    gap: 14, padding: 24, flex: 1, minWidth: 250,
                    borderRadius: 'var(--radio-xl)',
                    background: destacada ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                    border: destacada ? '2px solid var(--accent)' : '1px solid var(--linea)',
                  }}
                >
                  <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <strong style={{ fontSize: 15.5 }}>{p.name}</strong>
                    {p.tag && <span className="plan-etiqueta">{p.tag}</span>}
                  </div>
                  <div className="fila" style={{ alignItems: 'baseline', gap: 4 }}>
                    <span className="display" style={{ fontSize: 34 }}>{p.price}</span>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{p.unit}</span>
                  </div>
                  <ul className="pila" style={{ gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
                    {p.items.map((i) => (
                      <li key={i} className="fila" style={{ gap: 8, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.45 }}>
                        <span aria-hidden="true" style={{ color: destacada ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 700 }}>
                          {destacada ? '✓' : '·'}
                        </span>
                        <span style={{ color: destacada ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="pasarela__resumen-card animate-fade-up">
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-secondary)', letterSpacing: '.06em' }}>
            RESUMEN DE SELECCIÓN
          </span>

          <div className="pasarela__item-plan">
            <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div className="pila" style={{ gap: 4 }}>
                <strong style={{ fontSize: 17 }}>{PRO.k}</strong>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{PRO.d}</span>
              </div>
              <span className="display" style={{ fontSize: 22, whiteSpace: 'nowrap' }}>{PRO.precio}</span>
            </div>
          </div>

          <div className="pila" style={{ gap: 10, fontSize: 13.5, color: 'var(--text-secondary)' }}>
            <strong style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>¿Qué desbloqueas?</strong>
            {PRO_INCLUYE.map((t) => (
              <div key={t} className="fila" style={{ gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)' }}>✓</span>
                <span>{t}</span>
              </div>
            ))}
          </div>

          <div className="pasarela__desglose" style={{ borderTop: '1px solid var(--linea)', paddingTop: 14 }}>
            <div className="pasarela__desglose-fila">
              <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>Total</strong>
              <strong className="display" style={{ fontSize: 26, color: 'var(--text-primary)' }}>{PRO.precio}</strong>
            </div>
          </div>

          <div className="pila" style={{ gap: 10 }}>
            {yaEsPro ? (
              <button className="btn btn--linea btn--bloque" onClick={() => ir('/diagnostico')}>
                Ya lo tienes activo · volver a la app
              </button>
            ) : (
              <button className="btn btn--acento btn--grande btn--bloque" onClick={() => ir('/checkout')}>
                Activar Pro estudiante →
              </button>
            )}
            <button onClick={() => ir(rutaRetornoChat)} className="btn btn--linea btn--bloque" style={{ textAlign: 'center' }}>
              Seguir gratis hasta el {proximaRenovacion()}
            </button>
          </div>

          <div className="pila" style={{ gap: 8, borderTop: '1px solid var(--linea)', paddingTop: 14 }}>
            <div className="pasarela__seguridad">
              <span>🔒</span>
              <span>Sin permanencia · Tarjeta, Yape, Plin o PagoEfectivo</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const PRO_INCLUYE = [
  'Las ofertas donde ya calzas, ordenadas por tu brecha',
  'Tu ruta de aprendizaje con recursos gratis primero',
  'Tu CV reescrito con las frases de los avisos',
  'Diagnósticos y consultas a Lumi sin límite',
];
