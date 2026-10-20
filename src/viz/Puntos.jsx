import { celdasDe, etiquetaDelta, rotulo } from '../lib/habilidades.js';

// Cuadrícula de 10 puntos por habilidad. El porcentaje exacto va en el rótulo;
// "de cada 10" es el subtítulo del gráfico, no la cifra de cada fila — en el
// prototipo 82% y 77% salían ambos como "8 de 10" y contradecían al párrafo.
export default function Puntos({ filas }) {
  return (
    <div className="puntos">
      <span className="puntos__sub">De cada 10 ofertas, cuántas lo piden</span>
      {filas.map((f) => (
        <div key={f.k} className={`puntos__fila${f.destacada ? ' puntos__fila--on' : ''}`}>
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
      ))}
    </div>
  );
}
