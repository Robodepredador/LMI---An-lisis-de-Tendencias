import { useState } from 'react';
import { celdasDe, etiquetaDelta, rotulo } from '../lib/habilidades.js';

// Cuadrícula de 10 puntos por habilidad. El porcentaje exacto va en el rótulo;
// "de cada 10" es el subtítulo del gráfico, no la cifra de cada fila — en el
// prototipo 82% y 77% salían ambos como "8 de 10" y contradecían al párrafo.
//
// Con `evidencia` cada fila gana el estado del usuario y un panel con las
// frases literales de los avisos. Sin ella se dibuja igual que siempre: el
// chat responde para los 35 roles del catálogo y la evidencia existe para
// cuatro, así que en los otros 31 no se renderiza ningún botón — y un botón
// que no se renderiza no puede llevar a ninguna parte (§7.12 del plan).
export default function Puntos({ filas, skills = null, evidencia = null, onRuta, onOfertas, onDiagnostico }) {
  const [abierta, setAbierta] = useState(null);
  const conEstado = Boolean(evidencia);

  return (
    <div className="puntos">
      <span className="puntos__sub">De cada 10 ofertas, cuántas lo piden</span>
      {filas.map((f) => {
        const ev = conEstado ? evidencia(f.k) : null;
        const tiene = skills ? skills.includes(f.k) || (f.atomicas ?? []).some((a) => skills.includes(a)) : null;
        const expandible = Boolean(ev);
        const estaAbierta = abierta === f.k;

        return (
          <div key={f.k} className="pila" style={{ gap: 8 }}>
            <div
              className={`puntos__fila${f.destacada ? ' puntos__fila--on' : ''}`}
              onClick={expandible ? () => setAbierta(estaAbierta ? null : f.k) : undefined}
              style={expandible ? { cursor: 'pointer' } : undefined}
            >
              <span className="puntos__nombre">
                {f.k}
                {f.destacada && <span className="puntos__marca">lo que más creció</span>}
              </span>
              <span className="puntos__celdas" aria-hidden="true">
                {celdasDe(f).map((llena, i) => (
                  <span key={i} className={`puntos__celda${llena ? ' puntos__celda--on' : ''}`} />
                ))}
              </span>
              <span className="puntos__cifra">
                <strong>{rotulo(f)}</strong>
                <span className={`insignia${f.tendencia > 0 ? ' insignia--sube' : f.tendencia < 0 ? ' insignia--baja' : ''}`}>
                  {etiquetaDelta(f.tendencia)}
                </span>
              </span>
            </div>

            {/* El chip de estado y el enlace solo donde hay evidencia. */}
            {expandible && (
              <div
                className="fila"
                style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}
              >
                {skills ? (
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, padding: '2px 9px',
                    borderRadius: 'var(--radio-full)',
                    background: tiene ? 'var(--resalte)' : 'var(--alerta-bg)',
                    color: tiene ? 'var(--resalte-fg)' : 'var(--alerta-fg)',
                  }}>
                    {tiene ? '✓ Lo tienes' : '✗ Te falta'}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="enlace"
                    style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: 'var(--accent)' }}
                    onClick={(e) => { e.stopPropagation(); onDiagnostico?.(); }}
                  >
                    Haz tu diagnóstico para ver qué te falta →
                  </button>
                )}
                <button
                  type="button"
                  className="enlace"
                  style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: 'var(--accent)' }}
                  onClick={(e) => { e.stopPropagation(); setAbierta(estaAbierta ? null : f.k); }}
                >
                  {estaAbierta ? 'Ocultar lo que piden ↑' : 'Ver qué piden exactamente →'}
                </button>
              </div>
            )}

            {/* El panel, debajo de su fila. */}
            {expandible && estaAbierta && (
              <div
                className="pila animate-fade-up"
                style={{
                  gap: 12, padding: 16,
                  borderRadius: 16, background: 'var(--bg-elevated)', border: '1px solid var(--linea)',
                }}
              >
                <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                  <strong>En {ev.conteo.toLocaleString('es-PE')} de {ev.total.toLocaleString('es-PE')} ofertas.</strong>{' '}
                  {ev.resumen}
                </span>
                <div className="pila" style={{ gap: 10 }}>
                  {ev.frags.map((fr) => (
                    <span key={fr.f} className="pila" style={{ gap: 2 }}>
                      <span style={{ fontSize: 13, lineHeight: 1.5, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        «{fr.f}»
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                        {fr.empresa} · {fr.portal}
                      </span>
                    </span>
                  ))}
                </div>
                {skills && (
                  <div className="fila" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn--acento"
                      style={{ fontSize: 13, padding: '9px 16px' }}
                      onClick={(e) => { e.stopPropagation(); onRuta?.(f.k, tiene); }}
                    >
                      {tiene ? `Destacarlo en mi CV` : `Generar ruta para ${f.k}`}
                    </button>
                    <button
                      type="button"
                      className="btn btn--linea"
                      style={{ fontSize: 13, padding: '9px 16px' }}
                      onClick={(e) => { e.stopPropagation(); onOfertas?.(f.k); }}
                    >
                      Ver ofertas que lo piden
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
