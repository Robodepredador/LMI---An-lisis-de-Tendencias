// Comprueba la lógica de los gráficos antes de que se dibuje nada. Es donde
// el prototipo se contradecía: redondeaba 82% y 77% al mismo "8 de 10" y
// destacaba una fila que el ojo leía como la más grande.
//   node scripts/check-graficos.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const catalogo = JSON.parse(readFileSync(new URL('../src/data/catalogo.json', import.meta.url), 'utf8'));
const { filasDe, porCrecimiento } = await import('../src/lib/habilidades.js');

// ── Selección de filas ───────────────────────────────────────────────
for (const rol of catalogo.roles) {
  const f = filasDe(rol);

  assert.ok(f.length >= 4 && f.length <= 5,
    `${rol.id}: entre 4 y 5 filas, salieron ${f.length}`);

  // La habilidad que más creció es de la que habla el titular: si el gráfico
  // la esconde, el texto y la imagen dicen cosas distintas. Pasa en 16 de 35
  // roles, donde no está entre las 4 primeras por porcentaje.
  const crecio = [...rol.habilidades].sort(porCrecimiento)[0];
  assert.ok(f.some((x) => x.k === crecio.k),
    `${rol.id}: la habilidad que mas crecio (${crecio.k}) debe estar presente`);

  assert.equal(f.filter((x) => x.destacada).length, 1,
    `${rol.id}: exactamente una fila destacada`);
  assert.equal(f.find((x) => x.destacada).k, crecio.k,
    `${rol.id}: la destacada es la que mas crecio`);

  assert.deepEqual(f.map((x) => x.pct), [...f.map((x) => x.pct)].sort((a, b) => b - a),
    `${rol.id}: las filas van ordenadas por porcentaje`);

  assert.equal(new Set(f.map((x) => x.k)).size, f.length,
    `${rol.id}: ninguna fila repetida`);
}

// ── Review Focus #1: empate de porcentaje ────────────────────────────
const empate = { habilidades: [
  { k: 'A', pct: 70, tendencia: 1 }, { k: 'B', pct: 70, tendencia: 2 },
  { k: 'C', pct: 50, tendencia: 3 }, { k: 'D', pct: 40, tendencia: 0 },
  { k: 'E', pct: 40, tendencia: 0 },
] };
const una = filasDe(empate).map((x) => x.k);
const otra = filasDe(empate).map((x) => x.k);
assert.deepEqual(una, otra, 'el desempate debe ser determinista');
assert.equal(new Set(una).size, una.length, 'ningun empate duplica filas');
assert.ok(una.includes('C'), 'la que mas crecio entra aunque empate por porcentaje');

// Un rol con exactamente 4 habilidades no necesita la quinta fila.
const justas = { habilidades: [
  { k: 'A', pct: 80, tendencia: 1 }, { k: 'B', pct: 60, tendencia: 9 },
  { k: 'C', pct: 50, tendencia: 2 }, { k: 'D', pct: 40, tendencia: 0 },
] };
assert.equal(filasDe(justas).length, 4, 'con 4 habilidades no se inventa una quinta fila');

console.log(`check-graficos: filas OK (${catalogo.roles.length} roles)`);

// ── Rótulos: regresión de la contradicción del prototipo ─────────────
const { rotulo, celdasDe, bandaDe, etiquetaDelta } = await import('../src/lib/habilidades.js');
for (const rol of catalogo.roles) {
  const f = filasDe(rol);
  for (let i = 1; i < f.length; i++) {
    if (f[i - 1].pct !== f[i].pct) {
      assert.notEqual(rotulo(f[i - 1]), rotulo(f[i]),
        `${rol.id}: ${f[i-1].k} (${f[i-1].pct}%) y ${f[i].k} (${f[i].pct}%) no pueden mostrar el mismo rotulo`);
    }
  }
}

// ── Celdas de la cuadrícula ──────────────────────────────────────────
for (const rol of catalogo.roles) {
  for (const fila of filasDe(rol)) {
    const c = celdasDe(fila);
    assert.equal(c.length, 10, `${rol.id}/${fila.k}: la cuadricula es de 10 celdas`);
    assert.equal(c.filter(Boolean).length, fila.deCada10,
      `${rol.id}/${fila.k}: las celdas llenas deben coincidir con deCada10`);
    assert.deepEqual(c, [...c].sort((a, b) => b - a),
      `${rol.id}/${fila.k}: las llenas van primero, sin huecos intercalados`);
  }
}
assert.equal(celdasDe({ pct: 0, deCada10: 0 }).filter(Boolean).length, 0, '0% no llena ninguna celda');
assert.equal(celdasDe({ pct: 100, deCada10: 10 }).filter(Boolean).length, 10, '100% llena las diez');

// ── Franja salarial ──────────────────────────────────────────────────
for (const rol of catalogo.roles) {
  const { p25, med, p75 } = rol.salario;
  if (!med) continue;
  const b = bandaDe(p25, med, p75);
  for (const k of ['bandL', 'bandW', 'medL']) {
    assert.ok(b[k] >= 0 && b[k] <= 100, `${rol.id}: ${k} fuera de 0-100 (${b[k]})`);
  }
  assert.ok(b.medL >= b.bandL && b.medL <= b.bandL + b.bandW,
    `${rol.id}: la mediana cae fuera de la franja`);
  assert.ok(b.bandW > 0, `${rol.id}: la franja no puede tener ancho cero`);
}
// Un rol donde los tres percentiles coinciden no debe dividir por cero.
const plano = bandaDe(3000, 3000, 3000);
assert.ok(Number.isFinite(plano.medL) && Number.isFinite(plano.bandW),
  'percentiles iguales no pueden producir NaN');

console.log('check-graficos: celdas y franja OK');

// ── Serie de tendencia ───────────────────────────────────────────────
// Dos puntos, no cuatro: el catálogo tiene un solo `tendencia` por habilidad
// y ninguna serie temporal. En el prototipo la curva estaba sintetizada y su
// forma dependía del largo del nombre de la habilidad.
const { serieDe } = await import('../src/lib/tendencia.js');

for (const rol of catalogo.roles) {
  const s = serieDe(filasDe(rol));
  assert.ok(s.length >= 4 && s.length <= 5, `${rol.id}: una serie por fila`);
  for (const x of s) {
    assert.ok(x.desde >= 0 && x.desde <= 100, `${rol.id}/${x.k}: desde fuera de 0-100 (${x.desde})`);
    assert.ok(x.hasta >= 0 && x.hasta <= 100, `${rol.id}/${x.k}: hasta fuera de 0-100 (${x.hasta})`);
  }
  assert.equal(new Set(s.map((x) => x.color)).size, s.length,
    `${rol.id}: cada serie necesita color propio o la leyenda no sirve`);
  assert.equal(s.filter((x) => x.destacada).length, 1, `${rol.id}: una sola destacada`);
}

// ── Review Focus #2: tendencia negativa o cero ───────────────────────
const baja = serieDe([{ k: 'Concar', pct: 54, tendencia: -3, destacada: false }]);
assert.ok(baja[0].desde > baja[0].hasta, 'una tendencia negativa dibuja la pendiente hacia abajo');
assert.equal(baja[0].delta, -3);

const plana = serieDe([{ k: 'Excel', pct: 58, tendencia: 0, destacada: false }]);
assert.equal(plana[0].desde, plana[0].hasta, 'tendencia cero es una linea horizontal');
assert.equal(etiquetaDelta(0), 'sin cambio', 'cero no se muestra como "+0 pts"');
assert.equal(etiquetaDelta(-4), '−4 pts', 'el negativo lleva signo menos tipografico');

// Una habilidad que ya estaba al 100% no puede "venir" de más de 100.
const tope = serieDe([{ k: 'X', pct: 100, tendencia: -5, destacada: true }]);
assert.ok(tope[0].desde <= 100, 'el punto de partida no se sale del eje');

console.log('check-graficos: tendencia OK');

// ── Prosa de la pantalla de resultado ────────────────────────────────
// titular, explicacion y consejo se plantillan aquí, no los escribe el modelo:
// la arquitectura del proyecto es que ninguna cifra en pantalla pase por él, y
// el respaldo local tiene que poder reproducirlos sin API.
const { titular, explicacion, consejo } = await import('../src/lib/prosa.js');
const TEMAS = ['habilidades', 'salarios', 'tendencia'];

for (const rol of catalogo.roles) {
  const filas = filasDe(rol);
  for (const tema of TEMAS) {
    const t = titular(rol, tema, filas);
    assert.ok(t && t.length > 10, `${rol.id}/${tema}: titular vacio`);
    assert.ok(!/\+0 pts|\+-|undefined|NaN/.test(t), `${rol.id}/${tema}: titular mal formado "${t}"`);

    // Review Focus #2 en la prosa: no se puede decir que algo creció si nada creció.
    const crecio = [...rol.habilidades].sort(porCrecimiento)[0];
    if (crecio.tendencia <= 0) {
      assert.ok(!/creci[oó]|sube|m[aá]s creci/.test(t.toLowerCase()),
        `${rol.id}/${tema}: dice que crecio algo que no crecio ("${t}")`);
    }

    const e = explicacion(rol, tema, filas, 'Lima');
    assert.ok(!/ {2}|undefined|NaN/.test(e), `${rol.id}/${tema}: explicacion mal formada "${e}"`);
    assert.ok(e.trim() === e, `${rol.id}/${tema}: la explicacion tiene espacios sueltos en los bordes`);
  }
}

// El consejo varía por tema: en el prototipo la burbuja repetía texto idéntico
// en cada turno del hilo porque solo dependía del ciclo y del rol.
const rol0 = catalogo.roles[0];
assert.notEqual(consejo(rol0, 2, 'habilidades'), consejo(rol0, 2, 'salarios'),
  'el consejo debe variar por tema');
assert.notEqual(consejo(rol0, 0, 'habilidades'), consejo(rol0, 3, 'habilidades'),
  'el consejo debe variar por ciclo');
for (let c = 0; c < 4; c++) {
  for (const tema of TEMAS) {
    const s = consejo(rol0, c, tema);
    assert.ok(s && !/undefined|NaN/.test(s), `consejo(${c}, ${tema}) mal formado: "${s}"`);
  }
}

console.log('check-graficos: prosa OK');
