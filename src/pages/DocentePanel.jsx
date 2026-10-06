import { useState } from 'react';
import { useApp } from '../store.js';
import { getTenant } from '../data/tenant.js';
import { panelDe } from '../lib/consultar.js';
import { GapTable } from '../viz/graficos.jsx';
import AnimarNumero from '../components/AnimarNumero.jsx';
import { fmt, ventanaAnalisis } from '../data/contenido.js';
import catalogo from '../data/catalogo.json';

const CARRERAS = Object.keys(catalogo.carreraAreas);
const AMBITOS = ['Todo Perú', ...catalogo.ciudades];

// Opción B: panel por carrera. Los filtros de carrera y ámbito funcionan;
// el de periodo no, porque el catálogo no tiene dimensión temporal.
export default function DocentePanel() {
  const usuario = useApp((s) => s.usuario);
  const tenant = getTenant(useApp((s) => s.tenant));

  const [carrera, setCarrera] = useState(usuario.carrera ?? CARRERAS[0]);
  const [ambito, setAmbito] = useState('Todo Perú');

  const p = panelDe(carrera);

  const kpis = [
    {
      k: 'Ofertas para egresados',
      v: <AnimarNumero valor={p.ofertas} formatear={fmt} />,
      d: `en ${p.areas.join(' y ')}`,
      c: 'var(--success-fg)',
    },
    {
      k: 'Mediana salarial de entrada',
      v: p.medianaEntrada ? <>S/ <AnimarNumero valor={p.medianaEntrada} formatear={fmt} /></> : '—',
      d: `n = ${fmt(p.muestraSalarial)} con salario`,
      c: 'var(--text-dim)',
    },
    {
      k: 'Habilidades top fuera de malla',
      v: `${p.fueraDeMalla.length} de 10`,
      d: p.fueraDeMalla.slice(0, 3).map((b) => b.k).join(', ') || '—',
      c: 'var(--error-fg)',
    },
  ];

  return (
    <div className="panel animate-fade">
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div className="pila" style={{ gap: 6 }}>
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{tenant.uni.toUpperCase()} · LICENCIA INSTITUCIONAL</span>
          <h1 className="display display--pag" style={{ margin: 0 }}>{carrera}</h1>
        </div>
        <div className="fila" style={{ gap: 8 }}>
          <label className="filtro">
            <span className="visualmente-oculto">Carrera</span>
            <select value={carrera} onChange={(e) => setCarrera(e.target.value)}>
              {CARRERAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="filtro">
            <span className="visualmente-oculto">Ámbito</span>
            <select value={ambito} onChange={(e) => setAmbito(e.target.value)}>
              {AMBITOS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <button className="btn btn--claro" style={{ fontSize: 13, padding: '9px 14px' }} onClick={() => window.print()}>
            Exportar informe
          </button>
        </div>
      </div>

      <div className="rejilla" style={{ gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px,100%), 1fr))' }}>
        {kpis.map((k, idx) => (
          <div key={k.k} className="tarjeta animate-fade-up" style={{ padding: 20, gap: 6, borderRadius: 'var(--radius-lg)', animationDelay: `${idx * 80}ms` }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k.k}</span>
            <span className="display" style={{ fontSize: 38, lineHeight: 1 }}>{k.v}</span>
            <span className="mono" style={{ fontSize: 12, color: k.c }}>{k.d}</span>
          </div>
        ))}
      </div>

      <div className="fila" style={{ gap: 12, alignItems: 'stretch' }}>
        <div style={{ flex: '1.4 1 420px', minWidth: 0 }}>
          <GapTable brechas={p.brechas} />
        </div>
        <div className="tarjeta" style={{ flex: '1 1 300px', minWidth: 0, padding: 20, gap: 12, borderRadius: 'var(--radius-lg)' }}>
          <strong style={{ fontSize: 15, fontWeight: 600 }}>Roles que más contratan</strong>
          {p.contratan.map((r, i) => (
            <div key={r.id} className="fila" style={{ justifyContent: 'space-between', gap: 10, fontSize: 13.5, padding: '8px 0', borderTop: i === 0 ? 0 : '1px solid rgba(242,239,233,.06)' }}>
              <span className="truncate">{r.nombre}</span>
              <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{fmt(r.ofertas)}</span>
            </div>
          ))}
        </div>
      </div>

      <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
        n = {fmt(p.ofertas)} ofertas en {p.areas.join(' y ')} · {ambito} · {ventanaAnalisis()} · Malla de {carrera} cargada por la Escuela
      </span>
    </div>
  );
}
