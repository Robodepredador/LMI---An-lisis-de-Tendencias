// Qué habilidades entran en el gráfico y cómo se rotulan.
//
// El sistema de diseño pide "máximo 4 barras", pero en 16 de los 35 roles la
// habilidad que más creció no está entre las 4 primeras por porcentaje — y es
// justo de la que hablan el titular y el resaltado. Recortar a 4 dejaría al
// texto hablando de una fila invisible, así que la quinta entra cuando hace
// falta.

const TOPE = 4;

// Desempate estable: primero el porcentaje, luego lo que más creció, y al
// final el nombre. Sin el último criterio dos habilidades idénticas podrían
// alternarse entre renders.
export const porCrecimiento = (a, b) =>
  b.tendencia - a.tendencia || b.pct - a.pct || a.k.localeCompare(b.k, 'es');

const porRelevancia = (a, b) =>
  b.pct - a.pct || b.tendencia - a.tendencia || a.k.localeCompare(b.k, 'es');

export function filasDe(rol) {
  const todas = rol.habilidades ?? [];
  if (!todas.length) return [];

  // Si dos crecen igual, gana la que ademas se pide mas: "SQL, ya el mas
  // pedido, es tambien lo que mas crecio" es mejor historia que al reves.
  const crecio = [...todas].sort(porCrecimiento)[0];
  const cabeza = [...todas].sort(porRelevancia).slice(0, TOPE);
  const elegidas = cabeza.includes(crecio) ? cabeza : [...cabeza, crecio];

  return elegidas.sort(porRelevancia).map((h) => ({
    k: h.k,
    pct: h.pct,
    tendencia: h.tendencia,
    destacada: h.k === crecio.k,
    deCada10: Math.round(h.pct / 10),
  }));
}

// El rótulo lleva el porcentaje exacto. En el prototipo decía "8 de 10" y 34
// pares de valores distintos colapsaban al mismo texto: el gráfico contradecía
// al párrafo que tenía al lado. "De cada 10" sobrevive como subtítulo del
// gráfico, que es donde no afirma un orden.
export const rotulo = (fila) => `${fila.pct}%`;

export const etiquetaDelta = (n) =>
  (n > 0 ? `+${n} pts` : n < 0 ? `−${Math.abs(n)} pts` : 'sin cambio');
