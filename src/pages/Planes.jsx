import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { PACKS, proximaRenovacion } from '../data/contenido.js';

export default function Planes() {
  const ir = useNavigate();
  const pack = useApp((s) => s.pack);
  const setPack = useApp((s) => s.setPack);
  const pendiente = useApp((s) => s.pendiente);

  const elegido = PACKS.find((p) => p.id === pack) ?? PACKS[1];

  return (
    <div className="seccion animate-fade" style={{ maxWidth: 1040, padding: 'clamp(20px, 3.5vw, 40px) clamp(16px, 3vw, 32px)' }}>
      <div className="pasarela">
        {/* ── Columna 1: Selección del Plan ── */}
        <div className="pasarela__principal">
          <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/chat" className="btn btn--linea" style={{ padding: '6px 14px', fontSize: 13, gap: 6 }}>
              ← Volver al chat
            </Link>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>PLANES Y TARIFAS</span>
          </div>

          <div className="pila" style={{ gap: 6 }}>
            <h1 className="display" style={{ margin: 0, fontSize: 32 }}>Elige cómo seguir</h1>
            {pendiente ? (
              <span style={{ fontSize: 14.5, color: 'var(--text-secondary)' }}>
                Tu pregunta «<strong style={{ color: 'var(--text-primary)' }}>{pendiente}</strong>» quedó guardada y se responderá apenas elijas una opción.
              </span>
            ) : (
              <span style={{ fontSize: 14.5, color: 'var(--text-muted)' }}>
                Selecciona la opción de créditos o suscripción que mejor se adapte a tus consultas.
              </span>
            )}
          </div>

          <div className="pila" style={{ gap: 10 }}>
            {PACKS.map((p) => (
              <button
                key={p.id}
                className="opcion animate-scale"
                aria-pressed={pack === p.id}
                aria-label={`${p.k}, ${p.precio}. ${p.d}`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 }}
                onClick={() => setPack(p.id)}
              >
                <span className="radio" data-on={pack === p.id} aria-hidden="true" />
                <span className="pila" style={{ gap: 4, flex: 1, minWidth: 0 }}>
                  <span className="fila" style={{ gap: 8 }}>
                    <strong style={{ fontSize: 15.5 }}>{p.k}</strong>
                    {p.tag && (
                      <span className="mono" style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'var(--accent)', color: 'var(--text-dark)', fontWeight: 600 }}>
                        {p.tag}
                      </span>
                    )}
                  </span>
                  <small style={{ color: 'var(--text-muted)' }}>{p.d}</small>
                </span>
                <span className="display" style={{ fontSize: 24, whiteSpace: 'nowrap' }}>{p.precio}</span>
              </button>
            ))}
          </div>

          <div className="pila" style={{ gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
              • <strong>Créditos:</strong> Válidos por 12 meses. No vencen mientras uses la plataforma.<br />
              • <strong>Plan Pro:</strong> Renovación mensual automática. Cancela en cualquier momento sin penalidad.
            </span>
          </div>
        </div>

        {/* ── Columna 2: Resumen del Plan Seleccionado ── */}
        <aside className="pasarela__resumen-card animate-fade-up">
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-dim)', letterSpacing: '.06em' }}>
            RESUMEN DE SELECCIÓN
          </span>

          <div className="pasarela__item-plan">
            <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div className="pila" style={{ gap: 4 }}>
                <strong style={{ fontSize: 17 }}>{elegido.k}</strong>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{elegido.d}</span>
              </div>
              <span className="display" style={{ fontSize: 22, whiteSpace: 'nowrap' }}>{elegido.precio}</span>
            </div>
          </div>

          <div className="pila" style={{ gap: 10, fontSize: 13.5, color: 'var(--text-secondary)' }}>
            <strong style={{ fontSize: 13.5, color: 'var(--text-primary)' }}>¿Qué incluye tu selección?</strong>
            <div className="fila" style={{ gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--accent)' }}>✓</span>
              <span>Acceso ilimitado a análisis de habilidades y salarios</span>
            </div>
            <div className="fila" style={{ gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--accent)' }}>✓</span>
              <span>Muestras estadísticas oficiales del mercado peruano</span>
            </div>
            <div className="fila" style={{ gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--accent)' }}>✓</span>
              <span>Exportación de informes a PDF</span>
            </div>
          </div>

          <div className="pasarela__desglose" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <div className="pasarela__desglose-fila">
              <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>Total</strong>
              <strong className="display" style={{ fontSize: 26, color: 'var(--text-primary)' }}>
                {elegido.precio}
              </strong>
            </div>
          </div>

          <div className="pila" style={{ gap: 10 }}>
            <button className="btn btn--acento btn--grande btn--bloque" onClick={() => ir('/checkout')}>
              Continuar al pago →
            </button>
            <Link to="/chat" className="btn btn--linea btn--bloque" style={{ textAlign: 'center' }}>
              Esperar al {proximaRenovacion()}
            </Link>
          </div>

          <div className="pila" style={{ gap: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <div className="pasarela__seguridad">
              <span>🔒</span>
              <span>Pasarela 100% segura con Yape, Plin y tarjetas</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
