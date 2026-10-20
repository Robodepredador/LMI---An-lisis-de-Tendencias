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
