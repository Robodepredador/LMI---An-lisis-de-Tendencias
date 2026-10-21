import { etiquetaDelta } from '../lib/habilidades.js';
import { ALTO_ETIQUETA, ejeDe, posicionesDe, serieDe } from '../lib/tendencia.js';

const W = 680, H = 230, X0 = 46, X1 = 380, Y0 = 16, Y1 = 178;

// Dos puntos por habilidad: trimestre anterior y actual. Cada línea lleva su
// nombre al extremo derecho, porque una leyenda de cuatro colores parecidos no
// se puede leer — y porque el resaltado marca lo que más CRECIÓ, no lo que más
// se pide, que es lo contrario de lo que el ojo asume.
export default function Tendencia({ filas }) {
  const series = serieDe(filas);
  const eje = ejeDe(series);
  // Las etiquetas se reparten para no pisarse: con dos series que terminan
  // cerca, los textos se montaban (pasaba en 22 de 35 roles).
  const etiquetas = posicionesDe(series, { alto: Y1 - Y0, altoEtiqueta: ALTO_ETIQUETA });
  const py = (v) => Y0 + (eje.y(v) / 100) * (Y1 - Y0);
  const marcas = [eje.min, Math.round((eje.min + eje.max) / 2), eje.max];

  return (
    <div className="tendencia">
      <span className="tendencia__sub">% de ofertas que lo piden, del trimestre anterior al actual</span>
      <svg viewBox={`0 0 ${W} ${H}`} className="tendencia__svg" role="img"
           aria-label={series.map((s) => `${s.k}: ${s.desde}% a ${s.hasta}%`).join('. ')}>
        {marcas.map((m) => (
          <g key={m}>
            <line x1={X0} x2={X1} y1={py(m)} y2={py(m)} className="tendencia__guia" />
            <text x={X0 - 10} y={py(m) + 4} textAnchor="end" className="tendencia__marca">{m}%</text>
          </g>
        ))}
        <text x={X0} y={H - 10} textAnchor="start" className="tendencia__marca">Trimestre anterior</text>
        <text x={X1} y={H - 10} textAnchor="end" className="tendencia__marca">Actual</text>

        {series.map((s, i) => {
          const yPunto = py(s.hasta);
          const yTexto = Y0 + etiquetas[i].yEtiqueta;
          return (
          <g key={s.k} style={{ color: s.color }}>
            <line x1={X0} y1={py(s.desde)} x2={X1} y2={yPunto}
                  className={`tendencia__linea${s.destacada ? ' tendencia__linea--on' : ''}`} />
            <circle cx={X1} cy={yPunto} r={s.destacada ? 6 : 4} className="tendencia__punto" />
            {/* Guía del punto a su etiqueta cuando se tuvo que desplazar. */}
            {Math.abs(yTexto - yPunto) > 1 && (
              <line x1={X1 + 5} y1={yPunto} x2={X1 + 14} y2={yTexto - 4}
                    className="tendencia__guia-etiqueta" />
            )}
            <text x={X1 + 18} y={yTexto}
                  className={`tendencia__nombre${s.destacada ? ' tendencia__nombre--on' : ''}`}>
              {s.k} {etiquetaDelta(s.delta)}
            </text>
          </g>
          );
        })}
      </svg>
      <span className="tendencia__pie">
        La línea gruesa marca lo que <strong>más creció</strong>, que no siempre es lo que más se pide.
      </span>
    </div>
  );
}
