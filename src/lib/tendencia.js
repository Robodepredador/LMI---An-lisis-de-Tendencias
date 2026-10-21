// La serie de tendencia tiene DOS puntos, no cuatro.
//
// El catálogo guarda un solo `tendencia` por habilidad: cuántos puntos
// porcentuales se movió respecto del trimestre anterior. No hay serie
// temporal. El prototipo dibujaba cuatro trimestres interpolando, y la forma
// de la curva dependía del largo del nombre de la habilidad — una tendencia
// inventada en un producto que vende cifras con fuente.
//
// Con dos puntos reales se dice lo mismo sin inventar nada.

// Cuatro tonos distintos. En el prototipo tres de las cuatro series
// compartían el mismo lavanda y la leyenda no servía para nada.
const COLORES = ['var(--dato-1)', 'var(--dato-2)', 'var(--dato-3)', 'var(--dato-4)', 'var(--dato-5)'];

const acotar = (v) => Math.max(0, Math.min(100, v));

export function serieDe(filas) {
  // La destacada se dibuja al final para que quede encima del resto.
  const orden = [...filas].sort((a, b) => Number(a.destacada) - Number(b.destacada));
  return orden.map((f, i) => ({
    k: f.k,
    desde: acotar(f.pct - f.tendencia),
    hasta: acotar(f.pct),
    delta: f.tendencia,
    destacada: !!f.destacada,
    color: COLORES[i % COLORES.length],
  }));
}

// Escala del eje: múltiplos de 10 que envuelven la serie, con un respiro.
export function ejeDe(series) {
  const todos = series.flatMap((s) => [s.desde, s.hasta]);
  const min = Math.max(0, Math.floor(Math.min(...todos) / 10) * 10 - 5);
  const max = Math.min(100, Math.ceil(Math.max(...todos) / 10) * 10 + 5);
  const span = max - min || 1;
  return { min, max, y: (v) => 100 - ((v - min) / span) * 100 };
}

// Alto de una etiqueta de serie, en unidades del viewBox del gráfico.
// El SVG se escala a ~0.7 en pantalla, asi que hace
// falta mas margen del que sugiere el tamano de letra en CSS.
export const ALTO_ETIQUETA = 19;

// Dónde va la etiqueta de cada serie en el extremo derecho.
//
// Lo natural sería ponerla a la altura de su propio punto final, pero cuando
// dos series terminan cerca los textos se montan: pasaba en 22 de los 35
// roles, con el peor caso a 3.8px para texto de 12. Así que se reparten:
// cada una arranca en su altura ideal y luego se empujan hacia abajo lo justo
// para no tocarse, y si el bloque se sale por abajo se sube entero.
export function posicionesDe(series, { alto = 100, altoEtiqueta = ALTO_ETIQUETA } = {}) {
  const eje = ejeDe(series);
  const ideales = series
    // eje.y devuelve 0 arriba y 100 abajo; la etiqueta nace a la altura del
    // punto final de su serie.
    .map((s, i) => ({ i, k: s.k, destacada: s.destacada, y: (eje.y(s.hasta) / 100) * alto }))
    .sort((a, b) => a.y - b.y);

  let anterior = -Infinity;
  for (const p of ideales) {
    p.yEtiqueta = Math.max(p.y, anterior + altoEtiqueta);
    anterior = p.yEtiqueta;
  }

  // Si el apilado se desbordó por abajo, baja todo el bloque lo necesario.
  const exceso = anterior - alto;
  if (exceso > 0) {
    for (const p of ideales) p.yEtiqueta -= exceso;
  }

  return ideales.sort((a, b) => a.i - b.i);
}
