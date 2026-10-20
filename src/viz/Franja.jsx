import { bandaDe } from '../lib/habilidades.js';

const soles = (v) => 'S/ ' + Math.round(v / 50) * 50;

// P25 / mediana / P75 más la franja. Los extremos del eje NO llevan cifra:
// son relleno de escala, y rotulados se leían como el mínimo y el máximo del
// mercado peruano, que es un dato que nadie midió.
export default function Franja({ p25, med, p75 }) {
  const { bandL, bandW, medL } = bandaDe(p25, med, p75);
  return (
    <div className="franja">
      <div className="franja__cifras">
        <div className="franja__caja">
          <span className="franja__eti">Entrada (P25)</span>
          <strong>{soles(p25)}</strong>
        </div>
        <div className="franja__caja franja__caja--on">
          <span className="franja__eti">Mediana</span>
          <strong>{soles(med)}</strong>
        </div>
        <div className="franja__caja">
          <span className="franja__eti">Parte alta (P75)</span>
          <strong>{soles(p75)}</strong>
        </div>
      </div>
      <div className="franja__pista" aria-hidden="true">
        <span className="franja__rango" style={{ left: `${bandL}%`, width: `${bandW}%` }} />
        <span className="franja__mediana" style={{ left: `${medL}%` }} />
      </div>
      <span className="franja__nota">
        Franja = la mitad central de las ofertas · línea = mediana · sueldo bruto mensual
      </span>
    </div>
  );
}
