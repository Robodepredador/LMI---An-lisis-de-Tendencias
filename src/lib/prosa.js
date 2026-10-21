// El texto de la pantalla de resultado se plantilla aquí, con las cifras del
// catálogo delante. No pasa por el modelo: `insight` de Gemini es la única
// prosa generada del proyecto, y el respaldo local (sin API) tiene que poder
// producir esta pantalla igual.

import { etiquetaDelta } from './habilidades.js';

export const CICLOS = ['1ro – 2do', '3ro – 4to', '5to – 6to', '7mo o más'];

const soles = (v) => 'S/ ' + Math.round(v / 50) * 50;
const masPedida = (filas) => filas[0];
const queCrecio = (filas) => filas.find((f) => f.destacada) ?? filas[0];

export function titular(rol, tema, filas) {
  const crecio = queCrecio(filas);
  const top = masPedida(filas);

  if (tema === 'salarios') {
    const { med, p75 } = rol.salario;
    if (!med) return `Pocas ofertas de ${rol.nombre} declaran sueldo.`;
    return `Lo típico es ${soles(med)} al mes. La parte alta llega a ${soles(p75)}.`;
  }

  if (tema === 'tendencia') {
    // Nada creció: decir "lo que más creció" sería falso.
    if (crecio.tendencia <= 0) {
      return `Ninguna habilidad de ${rol.nombre} ganó terreno este trimestre.`;
    }
    const baja = [...filas].sort((a, b) => a.tendencia - b.tendencia)[0];
    return baja.tendencia < 0
      ? `${crecio.k} sube ${etiquetaDelta(crecio.tendencia)}; ${baja.k} pierde presencia.`
      : `${crecio.k} sube ${etiquetaDelta(crecio.tendencia)}; ${baja.k} se mantiene casi igual.`;
  }

  // habilidades
  if (crecio.tendencia <= 0) {
    return `${top.k} es lo que más piden: aparece en ${top.pct}% de las ofertas.`;
  }
  return `${crecio.k} es lo que más creció: ${etiquetaDelta(crecio.tendencia)} en un trimestre.`;
}

export function explicacion(rol, tema, filas, ambito) {
  const donde = ambito ? ` en ${ambito}` : '';
  const crecio = queCrecio(filas);
  const top = masPedida(filas);

  if (tema === 'salarios') {
    const { p25, med, p75 } = rol.salario;
    if (!med) {
      return `Muy pocas ofertas de ${rol.nombre}${donde} declaran sueldo, así que no mostramos un rango: sería adivinar.`;
    }
    return [
      `La mitad de las ofertas con sueldo declarado paga entre ${soles(p25)} y ${soles(p75)} brutos al mes para ${rol.nombre}${donde}.`,
      `Las que piden ${top.k} se concentran en la parte alta del rango.`,
    ].join(' ');
  }

  if (tema === 'tendencia') {
    const baja = [...filas].sort((a, b) => a.tendencia - b.tendencia)[0];
    const primera = crecio.tendencia > 0
      ? `Comparado con el trimestre anterior, ${crecio.k} es lo que más aparece de nuevo en ofertas de ${rol.nombre}${donde}.`
      : `Comparado con el trimestre anterior, ninguna habilidad de ${rol.nombre}${donde} ganó terreno.`;
    const segunda = baja.tendencia < 0
      ? `${baja.k} pierde presencia, así que no conviene que sea tu única fortaleza.`
      : `${baja.k} se mantiene casi igual.`;
    return `${primera} ${segunda}`;
  }

  const partes = [
    `Para ${rol.nombre}${donde}, lo básico es ${top.k}: aparece en ${top.pct}% de las ofertas.`,
  ];
  if (crecio.tendencia > 0 && crecio.k !== top.k) {
    partes.push(`Lo que más creció este trimestre es ${crecio.k} (${etiquetaDelta(crecio.tendencia)}).`);
  }
  const excel = filas.find((f) => /excel/i.test(f.k));
  if (excel && excel.k !== top.k) {
    partes.push(`${excel.k} sigue presente en ${excel.pct}% de las ofertas, aunque no sea el foco del rol.`);
  }
  return partes.join(' ');
}

// El consejo de Lumi. Varía por ciclo y por tema: en el prototipo repetía el
// mismo texto en cada turno del hilo porque solo miraba el rol.
export function consejo(rol, ciclo = 2, tema = 'habilidades') {
  const tramo = CICLOS[ciclo] ?? CICLOS[2];
  const temprano = ciclo <= 1;

  if (tema === 'salarios') {
    return temprano
      ? `Aún no te toca negociar sueldo, pero guarda este rango: en ${tramo} ciclo es el momento de elegir electivos que te acerquen a la parte alta.`
      : `Si yo estuviera en ${tramo} ciclo, llevaría este rango a la entrevista y priorizaría ${rol.tip}.`;
  }

  if (tema === 'tendencia') {
    return temprano
      ? `Estás a tiempo de seguir esta tendencia ciclo a ciclo. Yo elegiría electivos que incluyan ${rol.tip}.`
      : `En ${tramo} ciclo esta tendencia ya te afecta: yo me pondría con ${rol.tip} antes de postular.`;
  }

  return temprano
    ? `Aún tienes tiempo. Yo empezaría por lo básico y dejaría ${rol.tip} para más adelante.`
    : `Si yo estuviera en ${tramo} ciclo, priorizaría ${rol.tip} antes de postular a prácticas.`;
}
