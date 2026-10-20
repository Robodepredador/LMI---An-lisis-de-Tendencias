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
const { rotulo, celdasDe, bandaDe } = await import('../src/lib/habilidades.js');
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
