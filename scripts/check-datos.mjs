// Comprueba el catálogo y la taxonomía: que cada rol traiga lo que la pantalla
// de resultado necesita, y que los chips que el cliente aprobó en el registro
// mapeen a áreas que el catálogo sabe responder.
//   node scripts/check-datos.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const catalogo = JSON.parse(readFileSync(new URL('../src/data/catalogo.json', import.meta.url), 'utf8'));

// ── tip: el consejo de Lumi se plantilla localmente, no lo escribe el modelo ──
const sinTip = catalogo.roles.filter((r) => !r.tip);
assert.deepEqual(sinTip.map((r) => r.id), [],
  'todos los roles necesitan tip para la burbuja de Lumi');

for (const r of catalogo.roles) {
  assert.ok(r.tip.length >= 10,
    `${r.id}: el tip es demasiado corto ("${r.tip}")`);
  assert.ok(!/\.$/.test(r.tip),
    `${r.id}: el tip es un sintagma sin punto final, se incrusta en otra oracion ("${r.tip}")`);
  // El tip tiene que hablar de habilidades que este rol de verdad pide, o el
  // consejo de Lumi queda desconectado del gráfico que tiene al lado.
  const suyas = r.habilidades.map((h) => h.k);
  assert.ok(suyas.some((k) => r.tip.includes(k)),
    `${r.id}: el tip no nombra ninguna habilidad del rol ("${r.tip}")`);
}

console.log(`check-datos: OK (${catalogo.roles.length} roles)`);

// ── Taxonomía del registro ───────────────────────────────────────────
const { CARRERAS, INTERESES, CIUDADES_REGISTRO, areasDe, areasDeIntereses, ciudadDeRegistro, areasDePerfil, TODO_PERU } =
  await import('../src/data/taxonomia.js');

assert.equal(CARRERAS.length, 10, 'las 10 carreras del registro aprobado');
assert.equal(INTERESES.length, 10, 'los 10 intereses del registro aprobado');

for (const c of CARRERAS) {
  const a = areasDe(c);
  assert.ok(a.length > 0, `la carrera ${c} debe mapear a al menos un area`);
  for (const x of a) assert.ok(catalogo.areas.includes(x), `${c} mapea al area inexistente "${x}"`);
  // Un area sin roles deja al estudiante sin nada que preguntar.
  assert.ok(catalogo.roles.some((r) => a.includes(r.area)),
    `ninguna area de ${c} tiene roles en el catalogo`);
}

for (const i of INTERESES) {
  const a = areasDeIntereses([i]);
  assert.ok(a.length > 0, `el interes ${i} debe mapear a un area`);
  for (const x of a) assert.ok(catalogo.areas.includes(x), `${i} mapea al area inexistente "${x}"`);
}

assert.equal(ciudadDeRegistro('Otra'), TODO_PERU, '"Otra" no filtra por ciudad');
assert.equal(ciudadDeRegistro('Lima'), 'Lima');
for (const c of CIUDADES_REGISTRO.slice(0, 3))
  assert.ok(catalogo.ciudades.includes(c), `${c} debe existir en el catalogo`);

assert.deepEqual(areasDePerfil({ carrera: 'Marketing', intereses: ['Datos y analítica'] }).sort(),
  ['Datos y Analítica', 'Marketing'], 'el perfil combina carrera e intereses sin repetir');

console.log('check-datos: taxonomia OK');
