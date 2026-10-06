// Gráficos en CSS puro animados en tiempo real.
// Todas las cifras llegan por props desde el catálogo: ninguna pasa por el modelo.
import { useEffect, useState } from 'react';
import { fmt } from '../data/contenido.js';
import { salarioDe } from '../lib/consultar.js';
import AnimarNumero from '../components/AnimarNumero.jsx';

const Panel = ({ titulo, children }) => (
  <div className="pila animate-fade-up" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 20, gap: 14 }}>
    {titulo && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{titulo}</span>}
    {children}
  </div>
);

function AnimatedBar({ pct, height = 10, delay = 0 }) {
  const [w, setW] = useState(0);

  useEffect(() => {
    let timer;
    if (delay > 0) {
      timer = setTimeout(() => {
        setW(pct);
      }, delay);
    } else {
      const raf = requestAnimationFrame(() => setW(pct));
      return () => cancelAnimationFrame(raf);
    }
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className="barra" style={{ height }}>
      <span style={{ width: `${w}%` }} />
    </div>
  );
}

// ── Habilidades ──────────────────────────────────────────────────────
export function SkillBars({ rol }) {
  return (
    <Panel titulo="% de ofertas que piden cada habilidad">
      {rol.habilidades.map((h, i) => (
        <div key={i} className="barra-fila">
          <span style={{ color: '#d8d3ca' }}>{h.k}</span>
          <AnimatedBar pct={h.pct} delay={i * 45} />
          <span className="mono" style={{ fontSize: 13, fontWeight: 500, textAlign: 'right' }}>
            <AnimarNumero valor={h.pct} duracion={450 + i * 40} />%
          </span>
          <span
            className="mono animate-fade"
            style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--success-fg)', animationDelay: `${200 + i * 45}ms` }}
          >
            {h.tendencia > 0 ? `▲ +${h.tendencia} pts` : ''}
          </span>
        </div>
      ))}
    </Panel>
  );
}

// ── Comparativa ──────────────────────────────────────────────────────
const ALTA_DEMANDA = 70;

export function CompareTable({ roles }) {
  const habilidades = [...new Set(roles.flatMap((r) => r.habilidades.map((h) => h.k)))];
  const pct = (r, k) => r.habilidades.find((h) => h.k === k)?.pct ?? 0;
  const filas = habilidades
    .map((k) => ({ k, valores: roles.map((r) => pct(r, k)) }))
    .sort((a, b) => Math.max(...b.valores) - Math.max(...a.valores));

  return (
    <div className="pila animate-fade-up" style={{ gap: 10 }}>
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 440 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 12.5 }}>
              <th style={{ padding: '14px 16px', fontWeight: 500 }}>Habilidad</th>
              {roles.map((r) => (
                <th key={r.id} style={{ padding: '14px 12px', fontWeight: 500, textAlign: 'right' }}>
                  {r.nombre}
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 400 }}>n={fmt(r.ofertas)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f, filaIndex) => (
              <tr key={f.k} style={{ borderTop: '1px solid rgba(242,239,233,.06)' }}>
                <td style={{ padding: '11px 16px', color: '#d8d3ca' }}>{f.k}</td>
                {f.valores.map((v, i) => (
                  <td key={roles[i].id} style={{ padding: '6px 8px', textAlign: 'right' }}>
                    <span
                      className="mono"
                      style={{
                        display: 'inline-block', minWidth: 52, padding: '5px 8px', borderRadius: 8, fontSize: 13,
                        fontWeight: v >= ALTA_DEMANDA ? 600 : 400,
                        background: v >= ALTA_DEMANDA ? 'var(--accent)' : 'transparent',
                        color: v >= ALTA_DEMANDA ? 'var(--text-dark)' : 'var(--text-secondary)',
                        transition: 'all 0.35s ease',
                      }}
                    >
                      {v ? (
                        <>
                          <AnimarNumero valor={v} duracion={400 + filaIndex * 40} />%
                        </>
                      ) : (
                        '—'
                      )}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
        Recuadro relleno = alta demanda ({ALTA_DEMANDA} % o más de las ofertas). “—” = no aparece entre las más pedidas.
      </span>
    </div>
  );
}

// ── Salarios ─────────────────────────────────────────────────────────
function escala(valores) {
  const min = Math.floor(Math.min(...valores) / 1000) * 1000;
  const max = Math.ceil(Math.max(...valores) / 1000) * 1000;
  const rango = Math.max(max - min, 1000);
  const marcas = [];
  for (let v = min; v <= max; v += Math.max(1000, Math.round(rango / 5 / 1000) * 1000)) marcas.push(v);
  return { min, rango, marcas, pos: (v) => ((v - min) / rango) * 100 };
}

function SalaryRow({ r, s, e }) {
  const [animar, setAnimar] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimar(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const p25 = e.pos(s.cifras.p25);
  const p75 = e.pos(s.cifras.p75);
  const med = e.pos(s.cifras.med);

  return (
    <div className="pila" style={{ gap: 8 }}>
      <div className="fila" style={{ justifyContent: 'space-between', gap: 10, fontSize: 14 }}>
        <span>{r.nombre}</span>
        <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>
          S/ <AnimarNumero valor={s.cifras.med} formatear={fmt} />{' '}
          <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>· n={s.n}</span>
        </span>
      </div>
      <div style={{ position: 'relative', height: 14, borderRadius: 7, background: 'rgba(242,239,233,.06)' }}>
        <div
          style={{
            position: 'absolute',
            inset: '0 auto',
            left: `${animar ? p25 : med}%`,
            width: `${animar ? p75 - p25 : 0}%`,
            borderRadius: 7,
            background: 'color-mix(in oklch, var(--accent) 45%, transparent)',
            transition: 'all 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -3,
            left: `${animar ? med : p25}%`,
            width: 20,
            height: 20,
            marginLeft: -10,
            borderRadius: '50%',
            background: 'var(--accent)',
            border: '3px solid var(--bg-elevated)',
            transition: 'left 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
      <div className="mono" style={{ position: 'relative', height: 14, fontSize: 11.5, color: 'var(--text-muted)' }}>
        <span style={{ position: 'absolute', left: `${p25}%`, transition: 'all 0.4s ease' }}>
          S/ <AnimarNumero valor={s.cifras.p25} formatear={fmt} />
        </span>
        <span style={{ position: 'absolute', right: `${100 - p75}%`, transition: 'all 0.4s ease' }}>
          S/ <AnimarNumero valor={s.cifras.p75} formatear={fmt} />
        </span>
      </div>
    </div>
  );
}

export function SalaryChart({ roles, ciudad }) {
  const datos = roles
    .map((r) => ({ rol: r, s: salarioDe(r, ciudad) }))
    .filter((d) => d.s.cifras);

  if (datos.length === 0) return null;

  const e = escala(datos.flatMap((d) => [d.s.cifras.p25, d.s.cifras.p75]));

  return (
    <Panel titulo="Sueldo bruto mensual · rango del 25 % al 75 % de ofertas · ● mediana">
      {datos.map(({ rol: r, s }) => (
        <SalaryRow key={r.id} r={r} s={s} e={e} />
      ))}
      <div className="mono fila" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 10, fontSize: 11, color: 'var(--text-dim)' }}>
        {e.marcas.map((m) => <span key={m}>S/ {fmt(m)}</span>)}
      </div>
    </Panel>
  );
}

// ── Cursos ───────────────────────────────────────────────────────────
export function CourseCards({ cursos }) {
  return (
    <div className="rejilla" style={{ gap: 12 }}>
      {cursos.map((c, idx) => (
        <div
          key={c.id}
          className="tarjeta animate-fade-up"
          style={{
            padding: 18,
            gap: 10,
            borderRadius: 'var(--radius-lg)',
            transition: 'all var(--duration) var(--ease-out)',
            cursor: 'pointer',
            animationDelay: `${idx * 75}ms`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border-card)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span className="mono" style={{ fontSize: 11, color: 'var(--accent)' }}>{c.skill.toUpperCase()}</span>
          <strong style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.35 }}>{c.t}</strong>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{c.p}</span>
          <div className="fila mono" style={{ gap: 10, fontSize: 11.5, color: 'var(--text-dim)', marginTop: 'auto' }}>
            {c.meta.map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Brechas frente a la malla (vista docente) ────────────────────────
export function GapTable({ brechas }) {
  return (
    <Panel titulo="Lo que más pide el mercado, frente a la malla de la carrera">
      {brechas.map((b, i) => (
        <div key={i} className="barra-fila">
          <span style={{ color: '#d8d3ca' }}>{b.k}</span>
          <AnimatedBar pct={b.pct} delay={i * 40} />
          <span className="mono" style={{ fontSize: 13, fontWeight: 500, textAlign: 'right' }}>
            <AnimarNumero valor={b.pct} duracion={450 + i * 40} />%
          </span>
          <span
            className="mono animate-fade"
            style={{
              fontSize: 11, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap',
              background: b.enMalla ? 'var(--success-bg)' : 'oklch(0.7 0.15 28 / .18)',
              color: b.enMalla ? 'var(--success-fg)' : 'var(--error-fg)',
              transition: 'all 0.3s ease',
              animationDelay: `${200 + i * 40}ms`,
            }}
          >
            {b.enMalla ? 'En malla' : 'No está'}
          </span>
        </div>
      ))}
    </Panel>
  );
}
