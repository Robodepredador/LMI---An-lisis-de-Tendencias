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

// ── Rigs de Lumi ─────────────────────────────────────────────────────
// Las ilustraciones ya venían articuladas: cada parte móvil tiene su clase.
// Si una se pierde al portarlas a JSX, la animación de esa pose desaparece
// sin que nada falle a gritos.
const lumi = readFileSync(new URL('../src/mascota/Lumi.jsx', import.meta.url), 'utf8');

const RIGS = {
  saluda:  ['shadow', 'float', 'bulb', 'arm', 'bar', 'b2', 'b3', 'eyes'],
  piensa:  ['shadow', 'float', 'head', 'bulb', 'eyes', 'lids', 'hand'],
  celebra: ['shadow', 'cf', 'c2', 'c3', 'c4', 'jump', 'la', 'ra', 'bulb'],
  alerta:  ['shake', 'bulb', 'eyes', 'drop'],
};

const clasesEnArchivo = new Set(
  [...lumi.matchAll(/className="([^"]+)"/g)].flatMap((m) => m[1].split(' ')),
);

for (const [pose, clases] of Object.entries(RIGS)) {
  assert.ok(lumi.includes(pose + ':'), `falta la pose ${pose}`);
  for (const c of clases) {
    assert.ok(clasesEnArchivo.has(c), `${pose} perdio la clase ${c} del rig`);
  }
}

// El contorno #17153A es exactamente el color de la tarjeta noche: literal,
// Lumi desaparece en el footer y en todo el tema oscuro.
assert.ok(!/#17153A/i.test(lumi),
  'el contorno debe salir de var(--lumi-linea), no de un literal');
assert.ok(lumi.includes('var(--lumi-linea)'), 'el contorno usa el token');

console.log('check-datos: rigs de Lumi OK');

// ── Animaciones de Lumi ──────────────────────────────────────────────
const lumiCss = readFileSync(new URL('../src/mascota/lumi.css', import.meta.url), 'utf8');

// Cada pose hace lo que su ilustración representa, según el catálogo de la
// mascota: saluda flota y agita la lupa, piensa inclina la cabeza y golpea el
// mentón, celebra salta y lanza confeti, alerta tiembla y suda.
const KEYFRAMES = [
  'flota', 'ladea', 'golpea', 'parpadea', 'mira', 'brilla',
  'saluda-brazo', 'barras', 'salta', 'confeti', 'tiembla', 'gotea',
];
for (const k of KEYFRAMES) {
  assert.ok(lumiCss.includes(`@keyframes ${k}`), `falta el keyframe ${k}`);
}

// Review Focus #5: reducir movimiento tiene que parar TODO, no casi todo.
const i = lumiCss.indexOf('prefers-reduced-motion');
assert.ok(i > 0, 'falta el bloque de reducir movimiento');
const reduce = lumiCss.slice(i);
for (const c of ['float', 'head', 'hand', 'eyes', 'lids', 'bulb', 'arm', 'bar',
                 'jump', 'la', 'ra', 'cf', 'shake', 'drop', 'shadow']) {
  assert.ok(reduce.includes(`.${c}`), `${c} debe detenerse con reducir movimiento`);
}

// El logo es la marca: no se anima en ninguna parte.
assert.ok(!/\.lumi-logo[^{]*\{[^}]*animation/.test(lumiCss), 'el logo no se anima');

console.log('check-datos: animaciones de Lumi OK');

// ── Landing: lo que no se puede publicar ─────────────────────────────
import { readdirSync } from 'node:fs';
const dirLanding = new URL('../src/pages/landing/', import.meta.url);
const landing = readdirSync(dirLanding)
  .map((f) => readFileSync(new URL(f, dirLanding), 'utf8')).join('\n')
  + readFileSync(new URL('../src/pages/Landing.jsx', import.meta.url), 'utf8');

// Las cifras de cobertura salen del catálogo, no escritas a mano.
for (const cifra of ['48,200', '48200', '60 roles', '8 regiones', '8 ámbitos']) {
  assert.ok(!landing.includes(cifra), `"${cifra}" debe salir de cobertura(), no escrita a mano`);
}
assert.ok(landing.includes('cobertura'), 'la landing usa cobertura() para las cifras');

// Ningún enlace sin href: no recibe foco ni se activa con Enter.
assert.ok(!/<a(?![^>]*href)(?![^>]*\{)/.test(landing),
  'ningun <a> sin href en la landing');

console.log('check-datos: landing OK');
