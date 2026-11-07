// Los cálculos del motor de decisión. Probados en scripts/check-mercado.mjs.
//
// EL ORDEN DE LAS OPERACIONES IMPORTA (§7.10 y §10.2 del plan). El prototipo
// calculaba `pct = round(n/base·100)` y `N = round(n·T/base)` por caminos
// distintos, y entonces `pct === round(N/T·100)` era FALSO: por fuerza bruta
// rompía por un punto en 800 de 15 360 casos. El tester ve la cifra grande y
// el "en N de T ofertas" en la misma tarjeta, así que descuadrar ahí se nota
// de un vistazo. Aquí `pct` se deriva de N y T ya redondeados y la invariante
// es verdadera por construcción.

import {
  PERFILES, CANDIDATAS, COMPUESTAS, EXCLUYENTES, OFERTAS, EVIDENCIA,
  RECURSOS, MIN_MUESTRA, habilidadesDe, ofertasPorCiudad,
} from '../data/mercado.js';

export { MIN_MUESTRA };

const redondear50 = (v) => Math.round(v / 50) * 50;

export const soles = (v) => `S/ ${redondear50(v).toLocaleString('en-US')}`;

// ── Universo de ofertas ──────────────────────────────────────────────
// `ofertas` es "ofertas activas" en todas las pantallas; `n` queda para los
// sueldos y para MIN_MUESTRA, que es lo que la metodología llama muestra
// (§7.11). Mezclarlos es lo que haría que el chat dijera 314 y el
// diagnóstico 695 del mismo rol y la misma ciudad.
export function totalDe(rol, ciudades = []) {
  const pc = ofertasPorCiudad(rol);
  return ciudades.reduce((a, c) => a + (pc[c]?.ofertas ?? 0), 0);
}

// La base del porcentaje: la suma de la tabla de alcance del rol. Equivale al
// total de Lima + Arequipa de ese rol, y check-mercado lo verifica contra el
// catálogo para que no se desincronicen en silencio.
export function baseDe(rol, tabla = PERFILES[rol]) {
  return (tabla ?? []).reduce((a, p) => a + p.n, 0);
}

// Hay rol con evidencia cargada? El chat degrada con gracia donde no (§7.12).
export const tieneEvidencia = (rol) => Boolean(EVIDENCIA[rol]);

// ── Skills de display vs. atómicas ───────────────────────────────────
// 'Java o Node.js' se satisface con Java O con Node.js. Si se usaran las
// claves del catálogo en la capa de datos, el match se rompería en silencio:
// ningún aviso pide literalmente "Java o Node.js".
export function atomicasDe(display) {
  return COMPUESTAS[display] ?? [display];
}

export function tieneSkill(display, skills = []) {
  return atomicasDe(display).some((a) => skills.includes(a));
}

// ── El % calzas ──────────────────────────────────────────────────────
export function calc(rol, skills = [], ciudades = [], tabla = PERFILES[rol]) {
  const filas = tabla ?? [];
  const base = baseDe(rol, filas);
  const T = totalDe(rol, ciudades);
  const alcanzables = filas.filter((p) => p.s.every((x) => skills.includes(x)));
  const n = alcanzables.reduce((a, p) => a + p.n, 0);
  // 1) n  2) T  3) N  4) pct — en este orden, nunca pct desde n/base.
  const N = base ? Math.round((n * T) / base) : 0;
  const pct = T ? Math.round((N / T) * 100) : 0;
  const sueldo = n ? alcanzables.reduce((a, p) => a + p.n * p.sal, 0) / n : 0;
  return {
    n, N, T, base, pct, alcanzables,
    // MIN_MUESTRA gatea el DENOMINADOR (§7.14). El numerador pequeño se
    // muestra: "calzas con 12 de 695" es el producto funcionando.
    suficiente: T >= MIN_MUESTRA,
    sueldo: sueldo ? redondear50(sueldo) : 0,
  };
}

// El reporte muestra sueldo típico, y para `analista-qa` solo Lima declara
// mediana (§7.15). Si ninguna ciudad elegida la declara, el reporte omite la
// cifra: un dato menos nunca es tan caro como dos datos que se contradicen.
export function sueldoDisponible(rol, ciudades = []) {
  const pc = ofertasPorCiudad(rol);
  return ciudades.some((c) => pc[c]?.med != null);
}

// ── Cuello de botella ────────────────────────────────────────────────
export function candidatos(rol, skills = []) {
  let c = (CANDIDATAS[rol] ?? []).filter((k) => !skills.includes(k));
  // A quien ya sabe Java no se le recomienda Node.js para las mismas ofertas.
  for (const [a, b] of EXCLUYENTES) {
    if (skills.includes(a)) c = c.filter((k) => k !== b);
    if (skills.includes(b)) c = c.filter((k) => k !== a);
  }
  return c;
}

const ganancia = (rol, skills, k, ciudades, tabla) =>
  calc(rol, [...skills, k], ciudades, tabla).n - calc(rol, skills, ciudades, tabla).n;

// Greedy: en cada paso, la skill que más ofertas desbloquea. Si NINGUNA
// desbloquea nada por sí sola se evalúa el mejor par — sin eso, una skill que
// solo sirve acompañada se queda fuera de la ruta para siempre. Pasa de
// verdad con estos datos: quien tiene Node.js, SQL, Git y APIs REST no gana
// nada con Docker ni con Cloud por separado, y 60 ofertas con las dos.
export function camino(rol, skills = [], ciudades = [], tabla = PERFILES[rol], pasos = 3) {
  const ruta = [];
  let actual = [...skills];
  while (ruta.length < pasos) {
    const cand = candidatos(rol, actual);
    if (!cand.length) break;
    let mejor = null;
    let mejorGanancia = 0;
    for (const k of cand) {
      const g = ganancia(rol, actual, k, ciudades, tabla);
      if (g > mejorGanancia) { mejorGanancia = g; mejor = [k]; }
    }
    if (!mejor) {
      const nBase = calc(rol, actual, ciudades, tabla).n;
      for (const a of cand) {
        for (const b of cand) {
          if (a >= b) continue;
          const g = calc(rol, [...actual, a, b], ciudades, tabla).n - nBase;
          if (g > mejorGanancia) { mejorGanancia = g; mejor = [a, b]; }
        }
      }
    }
    if (!mejor) break;
    for (const k of mejor) {
      const g = ganancia(rol, actual, k, ciudades, tabla);
      actual = [...actual, k];
      const c = calc(rol, actual, ciudades, tabla);
      ruta.push({ skill: k, gana: g, pct: c.pct, N: c.N, sueldo: c.sueldo, par: mejor.length > 1 });
    }
  }
  return ruta;
}

// ── Match de una oferta ──────────────────────────────────────────────
// Obligatorias que tiene ÷ obligatorias totales. Las deseables se cuentan y
// se muestran aparte, NUNCA dentro del porcentaje.
export function matchDe(oferta, skills = []) {
  const obligatorias = oferta.req.filter((r) => r.t === 'O');
  const deseables = oferta.req.filter((r) => r.t === 'D');
  const tiene = (r) => skills.includes(r.k);
  const obligHechas = obligatorias.filter(tiene).length;
  const desHechas = deseables.filter(tiene).length;
  return {
    oferta,
    obligatorias,
    deseables,
    obligHechas,
    obligTotal: obligatorias.length,
    desHechas,
    desTotal: deseables.length,
    faltan: obligatorias.filter((r) => !tiene(r)).map((r) => r.k),
    faltanDeseables: deseables.filter((r) => !tiene(r)).map((r) => r.k),
    pct: obligatorias.length ? Math.round((obligHechas / obligatorias.length) * 100) : 100,
    tiene,
  };
}

// El tono del match sale de tokens, nunca de un hex: 100% resalte, ≥75%
// elevado, menos alerta.
export function tonoMatch(pct) {
  if (pct === 100) return { bg: 'var(--resalte)', fg: 'var(--resalte-fg)', barra: 'var(--accent)' };
  if (pct >= 75) return { bg: 'var(--bg-elevated)', fg: 'var(--accent)', barra: 'var(--dato-2)' };
  return { bg: 'var(--alerta-bg)', fg: 'var(--alerta-fg)', barra: 'var(--alerta)' };
}

export function estadoRequisito(req, skills = []) {
  if (skills.includes(req.k)) return { icono: '✓', texto: 'Lo tienes', bg: 'var(--resalte)', fg: 'var(--resalte-fg)' };
  if (req.t === 'O') return { icono: '✗', texto: 'Te falta', bg: 'var(--alerta-bg)', fg: 'var(--alerta-fg)' };
  return { icono: '○', texto: 'Te falta', bg: 'var(--bg-elevated)', fg: 'var(--text-secondary)' };
}

// ── Listado de ofertas ───────────────────────────────────────────────
export const ofertasDe = (rol) => OFERTAS.filter((o) => o.rol === rol);
export const ofertaPorId = (id) => OFERTAS.find((o) => o.id === id);

// Orden por defecto: obligatorias que faltan ↑, luego deseables que faltan ↑,
// luego fecha. "Más recientes" es solo por fecha.
export function ordenarOfertas(rol, skills, orden = 'brecha') {
  const lista = ofertasDe(rol).map((o) => matchDe(o, skills));
  if (orden === 'fecha') return lista.sort((a, b) => a.oferta.dias - b.oferta.dias);
  return lista.sort((a, b) =>
    a.faltan.length - b.faltan.length
    || a.faltanDeseables.length - b.faltanDeseables.length
    || a.oferta.dias - b.oferta.dias);
}

// ── Evidencia del chat ───────────────────────────────────────────────
// El conteo se DERIVA del universo, no se guarda (§7.11): el pct de la
// habilidad en el catálogo por las ofertas activas de las ciudades elegidas.
export function evidenciaDe(rol, display, ciudades = []) {
  const ev = EVIDENCIA[rol]?.[display];
  if (!ev) return null;
  const pct = habilidadesDe(rol).find((h) => h.k === display)?.pct ?? 0;
  const T = totalDe(rol, ciudades);
  return { ...ev, conteo: Math.round((pct / 100) * T), total: T };
}

// ── Ruta de aprendizaje ──────────────────────────────────────────────
export const recursosDe = (skill) => RECURSOS[skill] ?? [];

// Los recomendados: los más rápidos gratis más un proyecto.
export const recomendadosDe = (skill) => recursosDe(skill).filter((r) => r.rec);

// Dónde se aprende. El recurso con página propia lleva su `url` en el
// catálogo; para las plataformas sin página fija el enlace es su buscador
// con el título exacto: lleva al material aunque el aviso no apunte a un
// video concreto. La Biblioteca UNSA y las guías LMI-U no se enlazan
// porque no viven en la web.
const BUSQUEDA = {
  YouTube: 'https://www.youtube.com/results?search_query=',
  Udemy: 'https://www.udemy.com/courses/search/?q=',
  Coursera: 'https://www.coursera.org/search?query=',
  'Microsoft Learn': 'https://learn.microsoft.com/es-es/search/?terms=',
};
export const enlaceDe = (r) => {
  if (r.url) return r.url;
  const base = BUSQUEDA[r.plataforma];
  return base ? base + encodeURIComponent(r.titulo) : null;
};

// Semanas a razón del tiempo que el usuario declaró (6 h por defecto).
export function semanasDe(horas, horasSemana = 6) {
  return Math.max(1, Math.ceil(horas / Math.max(1, horasSemana)));
}

// La ruta completa: cada paso con sus recursos y el tramo de semanas.
export function rutaDe(rol, skills = [], ciudades = [], horasSemana = 6, soloGratis = false) {
  let semanaInicio = 1;
  return camino(rol, skills, ciudades).map((paso) => {
    const recursos = recursosDe(paso.skill).filter((r) => !soloGratis || r.precio === 0);
    const horas = recomendadosDe(paso.skill).reduce((a, r) => a + r.horas, 0)
      || recursos.reduce((a, r) => a + r.horas, 0);
    const semanas = semanasDe(horas, horasSemana);
    const tramo = { desde: semanaInicio, hasta: semanaInicio + semanas - 1 };
    semanaInicio += semanas;
    return { ...paso, recursos, horas, semanas, tramo };
  });
}
