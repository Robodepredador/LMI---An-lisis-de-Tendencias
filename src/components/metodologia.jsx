import { AVISO_DATOS, METODOLOGIA, cobertura } from '../data/contenido.js';

// Un solo cuerpo de contenido para los dos sitios donde aparece la metodología.
// Si cambia la política de datos, cambia en un archivo, no en dos pantallas que
// se desincronizan.
//
// `compacto` (landing): resúmenes de una línea, para que la sección quepa en
// una pantalla. El detalle íntegro se lee en el diálogo, que sí scrollea.
export default function ContenidoMetodologia({ compacto = false }) {
  return (
    <>
      {/* El aviso va primero: dar las cifras en grande y confesar al final que
          son simuladas es lo que destruye la confianza. */}
      <aside className={compacto ? 'nota nota--compacta' : 'nota'} role="note">
        <span className="nota__eti">AVISO</span>
        <div className={compacto ? 'fila' : 'pila'} style={{ gap: compacto ? 8 : 6, fontSize: compacto ? 12.5 : 14 }}>
          <strong style={{ fontSize: compacto ? 13 : 15, fontWeight: 600 }}>{AVISO_DATOS.t}:</strong>
          <span style={{ lineHeight: 1.45, color: 'var(--text-secondary)' }}>{AVISO_DATOS.d}</span>
        </div>
      </aside>

      <section className="pila" style={{ gap: compacto ? 8 : 12 }}>
        {!compacto && <h3 className="doc__titulo-bloque">El catálogo de esta demostración</h3>}
        <dl className={compacto ? 'cifras cifras--compacto' : 'cifras'}>
          {cobertura().map((c) => (
            <div key={c.k} className="cifras__celda">
              <dt className="display cifras__valor">{c.v}</dt>
              <dd className="cifras__clave">{c.k}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pila" style={{ gap: compacto ? 8 : 12 }}>
        {!compacto && <h3 className="doc__titulo-bloque">Cómo se calcula cada cifra</h3>}
        <div className={compacto ? 'doc__lista doc__lista--rejilla' : 'doc__lista'}>
          {METODOLOGIA.map((m, i) => (
            <section key={m.t} className="doc__seccion">
              <h4 className="doc__seccion-titulo">
                <span className="mono doc__num">{String(i + 1).padStart(2, '0')}</span>
                {m.t}
              </h4>
              <p className="doc__seccion-cuerpo">{compacto ? m.r : m.d}</p>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
