// Comprueba el respaldo local de la consulta: lo que responde cuando /api/chat
// falla. Sin esto, un link abierto con varios estudiantes el mismo día agota la
// cuota de Gemini y la pantalla que viniste a mostrar dice "No pudimos procesar
// la consulta".
//   node scripts/check-respaldo.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const catalogo = JSON.parse(readFileSync(new URL('../src/data/catalogo.json', import.meta.url), 'utf8'));
const { resolverLocal } = await import('../src/lib/respaldo.js');

const rol = (id) => catalogo.roles.find((r) => r.id === id);

// ── Reconoce el rol por nombre y por sinónimo ────────────────────────
for (const r of catalogo.roles) {
  const porNombre = resolverLocal(`¿Qué piden para ${r.nombre}?`);
  assert.deepEqual(porNombre.roleIds, [r.id],
    `no reconoce "${r.nombre}" por su nombre (devolvio ${JSON.stringify(porNombre.roleIds)})`);

  for (const sin of r.sinonimos ?? []) {
    const porSin = resolverLocal(`¿Qué piden para ${sin}?`);
    assert.deepEqual(porSin.roleIds, [r.id],
      `no reconoce el sinonimo "${sin}" de ${r.id}`);
  }
}

// ── El bug del prototipo NO se reproduce ─────────────────────────────
// Allí cuatro roles colisionaban en la clave "analista de" y ganaba el último
// del bucle: toda pregunta sobre un "Analista de ..." respondía con Economía.
const marketing = resolverLocal('¿cuánto gana un analista de marketing digital?');
assert.notEqual(marketing.roleIds[0], 'analista-riesgos',
  'gana la coincidencia mas larga, no la ultima del bucle');
assert.ok(/marketing/.test(marketing.roleIds[0] ?? ''),
  `esperaba un rol de marketing, salio ${marketing.roleIds[0]}`);

// ── Intención ────────────────────────────────────────────────────────
assert.equal(resolverLocal('¿cuánto gana un analista de datos?').intent, 'salarios');
assert.equal(resolverLocal('¿cuánto paga un analista de datos junior?').intent, 'salarios');
assert.equal(resolverLocal('¿qué está creciendo para analista de datos?').intent, 'tendencia');
assert.equal(resolverLocal('¿qué habilidades piden para analista de datos?').intent, 'habilidades');

// ── Ciudad ───────────────────────────────────────────────────────────
assert.equal(resolverLocal('¿qué piden para analista de datos en Arequipa?').ciudad, 'Arequipa');
assert.equal(resolverLocal('¿qué piden para analista de datos en arequipa?').ciudad, 'Arequipa');
assert.equal(resolverLocal('¿qué piden para analista de datos?').ciudad, null,
  'sin ciudad mencionada no se inventa una');

// ── Fuera de alcance ─────────────────────────────────────────────────
const fuera = resolverLocal('¿cuál es la capital de Francia?');
assert.equal(fuera.fueraDeAlcance, true, 'una pregunta ajena al catalogo queda fuera de alcance');
assert.deepEqual(fuera.roleIds, []);
assert.equal(resolverLocal('').fueraDeAlcance, true, 'una pregunta vacia no revienta');

// ── Review Focus #3: la muestra mínima también sin API ───────────────
// El backend no afirma una cifra con menos de MIN_MUESTRA ofertas y no la
// cobra. El respaldo tiene que respetar exactamente la misma regla.
let probados = 0;
for (const r of catalogo.roles) {
  for (const [ciudad, datos] of Object.entries(r.porCiudad ?? {})) {
    const res = resolverLocal(`¿cuánto gana un ${r.nombre} en ${ciudad}?`);
    if (res.roleIds[0] !== r.id) continue;
    probados++;
    if (!datos.med || datos.n < catalogo.minMuestra) {
      assert.equal(res.sinDatos, true,
        `${r.id}/${ciudad}: n=${datos.n} esta bajo el minimo y debe marcar sinDatos`);
    } else {
      assert.equal(res.sinDatos, false,
        `${r.id}/${ciudad}: n=${datos.n} supera el minimo y no debe marcar sinDatos`);
    }
  }
}
assert.ok(probados > 20, `se esperaban muchas combinaciones rol/ciudad, se probaron ${probados}`);

// ── Forma de la respuesta ────────────────────────────────────────────
// Tiene que ser intercambiable con lo que devuelve /api/chat.
const r0 = resolverLocal('¿qué piden para analista de datos?');
for (const k of ['intent', 'roleIds', 'sugerencias', 'ciudad', 'insight', 'sinDatos', 'fueraDeAlcance']) {
  assert.ok(k in r0, `la respuesta local necesita la clave ${k} para ser intercambiable con /api/chat`);
}
assert.equal(r0.insight, '', 'el respaldo no inventa prosa: insight va vacio');
assert.equal(r0.local, true, 'la respuesta se marca como local');

console.log(`check-respaldo: OK (${catalogo.roles.length} roles, ${probados} combinaciones rol/ciudad)`);
