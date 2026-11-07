// Matchmaker. No leas 30 avisos: empieza por los que te faltan menos.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { calc, ordenarOfertas, tonoMatch } from '../lib/mercado.js';
import { BarraMatch, BloqueoPro, Cabecera, SinDiagnostico } from '../components/mercado.jsx';
import { useMotor } from '../lib/motor.js';

function Tarjeta({ m }) {
  const { oferta } = m;
  const tono = tonoMatch(m.pct);
  return (
    <div
      className="fila"
      style={{
        gap: 20, padding: 20, alignItems: 'stretch', flexWrap: 'wrap',
        borderRadius: 'var(--radio-xl)', background: 'var(--bg-surface)',
        border: '1px solid var(--linea)',
      }}
    >
      <div className="pila" style={{ gap: 10, flex: 1, minWidth: 240 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {oferta.empresa} · {oferta.portal} · hace {oferta.dias} {oferta.dias === 1 ? 'día' : 'días'}
        </span>
        <strong className="display" style={{ fontSize: 20, lineHeight: 1.2 }}>{oferta.puesto}</strong>
        <div className="chips">
          <span className="insignia">{oferta.ciudad}</span>
          <span className="insignia">{oferta.modalidad}</span>
          <span className="insignia">{oferta.sueldo}</span>
        </div>
        <div className="chips">
          {m.obligatorias.map((r) => (
            <span
              key={r.k}
              style={{
                fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--radio-full)',
                background: m.tiene(r) ? 'var(--resalte)' : 'var(--alerta-bg)',
                color: m.tiene(r) ? 'var(--resalte-fg)' : 'var(--alerta-fg)',
              }}
            >
              {m.tiene(r) ? '✓' : '✗'} {r.k}
            </span>
          ))}
        </div>
        {m.faltan.length > 0 && (
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Te falta: <strong style={{ color: 'var(--alerta-fg)' }}>{m.faltan.join(', ')}</strong>
          </span>
        )}
        {m.faltan.length === 0 && (
          <span style={{ fontSize: 13, color: 'var(--resalte-fg)', fontWeight: 600 }}>
            Cumples todas sus obligatorias. Puedes postular hoy.
          </span>
        )}
      </div>

      <div
        className="pila"
        style={{
          gap: 8, width: 170, flex: 'none', padding: 16, alignItems: 'center',
          borderRadius: 'var(--radio-lg)', background: tono.bg, color: tono.fg,
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{m.pct}%</span>
        <span style={{ fontSize: 12.5, textAlign: 'center' }}>
          {m.obligHechas} de {m.obligTotal} obligatorias
        </span>
        <div style={{ width: '100%' }}><BarraMatch pct={m.pct} alto={6} /></div>
        <span style={{ fontSize: 12, opacity: 0.85 }}>
          deseables {m.desHechas}/{m.desTotal}
        </span>
        <Link to={`/ofertas/${oferta.id}`} className="btn btn--linea" style={{ padding: '8px 14px', fontSize: 13, borderColor: 'currentColor', color: 'inherit' }}>
          Ver detalle
        </Link>
      </div>
    </div>
  );
}

export default function Ofertas() {
  const { listo, rol, skills, ciudades, esPro } = useMotor();
  const [orden, setOrden] = useState('brecha');

  if (!listo) return <SinDiagnostico que="La lista de ofertas" />;

  const lista = ordenarOfertas(rol, skills, orden);
  const mercado = calc(rol, skills, ciudades);
  const calzaCompleto = lista.filter((m) => m.faltan.length === 0).length;

  const contenido = (
    <div className="pila" style={{ gap: 14 }}>
      {lista.map((m) => <Tarjeta key={m.oferta.id} m={m} />)}
    </div>
  );

  return (
    <div className="panel">
      <Cabecera eti="OFERTAS PARA MÍ" titulo="No leas 30 avisos. Empieza por los que te faltan menos.">
        Ordenadas por la brecha entre tu perfil y los requisitos obligatorios de cada aviso.
      </Cabecera>

      {esPro && (
        <>
          {/* El número que promete la tarjeta y el que entrega la lista no son
              el mismo, y hay que decirlo: un tester que paga esperando 216 y
              recibe 8 deja de evaluar el producto y empieza a evaluar si la
              app está terminada. */}
          <div className="nota">
            <span className="pila" style={{ gap: 4 }}>
              {/* Con 0 alcanzables la nota de honestidad se vuelve absurda
                  ("los 8 avisos que tenemos cargados de esas 0"): ahí lo
                  honesto es decir que todavía no calza con ninguna. */}
              <strong style={{ fontSize: 14.5 }}>
                {mercado.N === 0
                  ? `Todavía no cumples todas las obligatorias de ninguna, pero en estos ${lista.length} avisos estás más cerca`
                  : `Te mostramos los ${lista.length} avisos que tenemos cargados de esas ${mercado.N.toLocaleString('es-PE')}`}
              </strong>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {mercado.N === 0
                  ? `De las ${mercado.T.toLocaleString('es-PE')} ofertas activas no hay ninguna donde ya cumplas todo. Estos son los avisos que tenemos cargados, ordenados por lo poco que te falta en cada uno.`
                  : `${mercado.N.toLocaleString('es-PE')} es la cifra de mercado: de ${mercado.T.toLocaleString('es-PE')} ofertas activas cumples todas las obligatorias en esas. Aquí abajo están los avisos concretos que ya tenemos con su texto completo${calzaCompleto > 0 ? `, y en ${calzaCompleto} de ellos no te falta ninguna obligatoria` : ''}.`}
              </span>
            </span>
          </div>

          <div className="fila" style={{ gap: 8 }}>
            {[['brecha', 'Menor brecha'], ['fecha', 'Más recientes']].map(([k, t]) => (
              <button
                key={k}
                type="button"
                className={`chip chip--opcion${orden === k ? ' chip--on' : ''}`}
                onClick={() => setOrden(k)}
              >
                {t}
              </button>
            ))}
          </div>
        </>
      )}

      {esPro ? contenido : (
        <BloqueoPro
          titulo={mercado.N === 0
            ? 'Mira en cuáles estás más cerca de calzar.'
            : `Ya calzas con ${mercado.N.toLocaleString('es-PE')} ofertas. Te muestro cuáles.`}
          detalle="Cada aviso con su texto, qué te falta para postular y el enlace al portal."
          destino="/ofertas"
        >
          {contenido}
        </BloqueoPro>
      )}
    </div>
  );
}
