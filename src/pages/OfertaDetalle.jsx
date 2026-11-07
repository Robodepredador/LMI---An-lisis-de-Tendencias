// Detalle de oferta. Dos columnas: lo que dice el aviso, y tu match contra él.

import { Link, Navigate, useParams } from 'react-router-dom';
import { urlPortal } from '../data/mercado.js';
import { estadoRequisito, matchDe, ofertaPorId, tonoMatch } from '../lib/mercado.js';
import { BarraMatch, SinDiagnostico } from '../components/mercado.jsx';
import { useMotor } from '../lib/motor.js';

function Requisito({ req, skills }) {
  const est = estadoRequisito(req, skills);
  return (
    <div className="pila" style={{ gap: 8, padding: '16px 0', borderTop: '1px solid var(--linea)' }}>
      <div className="fila" style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 15 }}>{req.k}</strong>
        <span className="insignia">
          {req.t === 'O' ? 'Obligatorio' : 'Deseable'} · {req.n}
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: 12, fontWeight: 700, padding: '3px 10px',
          borderRadius: 'var(--radio-full)', background: est.bg, color: est.fg, whiteSpace: 'nowrap',
        }}>
          {est.icono} {est.texto}
        </span>
      </div>
      <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        «{req.f}»
      </span>
    </div>
  );
}

export default function OfertaDetalle() {
  const { ofertaId } = useParams();
  const { listo, skills, esPro } = useMotor();
  const oferta = ofertaPorId(ofertaId);

  if (!listo) return <SinDiagnostico que="El detalle de una oferta" />;
  if (!oferta) return <Navigate to="/ofertas" replace />;

  const m = matchDe(oferta, skills);
  const tono = tonoMatch(m.pct);
  const faltaAlgo = m.faltan.length > 0;

  return (
    <div className="panel">
      <Link to="/ofertas" className="btn btn--linea" style={{ alignSelf: 'flex-start' }}>
        ← Volver a mis ofertas
      </Link>

      <div className="pila" style={{ gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {oferta.empresa} · {oferta.portal} · hace {oferta.dias} {oferta.dias === 1 ? 'día' : 'días'}
        </span>
        <h1 className="display display--pag" style={{ margin: 0 }}>{oferta.puesto}</h1>
        <div className="chips">
          <span className="insignia">{oferta.ciudad}</span>
          <span className="insignia">{oferta.modalidad}</span>
          <span className="insignia">{oferta.sueldo}</span>
        </div>
      </div>

      <div className="fila" style={{ gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* ── Lo que dice el aviso ── */}
        <div className="pila" style={{ gap: 4, flex: 1, minWidth: 300 }}>
          <span className="eti" style={{ fontWeight: 600 }}>LO QUE DICE EL AVISO</span>
          {oferta.req.map((r) => <Requisito key={r.k} req={r} skills={skills} />)}
        </div>

        {/* ── Tu match ── */}
        <aside
          className="pila"
          style={{
            gap: 16, width: 300, flex: 'none', padding: 24,
            borderRadius: 'var(--radio-xl)', background: 'var(--bg-surface)',
            border: '1px solid var(--linea)', position: 'sticky', top: 16,
          }}
        >
          <div className="pila" style={{ gap: 8, padding: 16, borderRadius: 'var(--radio-lg)', background: tono.bg, color: tono.fg, alignItems: 'center' }}>
            <span style={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{m.pct}%</span>
            <span style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.4 }}>
              {m.obligHechas} de {m.obligTotal} obligatorias.
              {faltaAlgo ? ` Te falta: ${m.faltan.join(', ')}.` : ' No te falta ninguna.'}
            </span>
            <div style={{ width: '100%' }}><BarraMatch pct={m.pct} alto={8} /></div>
          </div>

          {[['OBLIGATORIAS', m.obligatorias], ['DESEABLES', m.deseables]].map(([titulo, lista]) => lista.length > 0 && (
            <div key={titulo} className="pila" style={{ gap: 8 }}>
              <span className="eti" style={{ fontWeight: 600 }}>{titulo}</span>
              {lista.map((r) => {
                const est = estadoRequisito(r, skills);
                return (
                  <div key={r.k} className="fila" style={{ gap: 8, justifyContent: 'space-between', fontSize: 13.5 }}>
                    <span>{r.k}</span>
                    <span style={{ color: est.fg, fontWeight: 600, whiteSpace: 'nowrap' }}>{est.icono} {est.texto}</span>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="pila" style={{ gap: 10 }}>
            <Link to={`/cv?oferta=${oferta.id}`} className="btn btn--acento btn--bloque">
              Adaptar mi CV a esta oferta
            </Link>
            {faltaAlgo && (
              <Link to="/ruta" className="btn btn--linea btn--bloque">
                Cubrir {m.faltan[0]}: ver ruta
              </Link>
            )}
            {/* Una empresa inventada no tiene aviso real que enlazar, y un
                href="#" se lee como botón roto: esto abre el buscador del
                portal con el rol y la ciudad (§7.7). */}
            <a
              href={urlPortal(oferta)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--linea btn--bloque"
            >
              Postular en {oferta.portal} ↗
            </a>
          </div>

          {!esPro && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Estás viendo este aviso con el plan gratis. Con Pro estudiante ves los
              {' '}demás ordenados por tu brecha.
            </span>
          )}
        </aside>
      </div>
    </div>
  );
}
