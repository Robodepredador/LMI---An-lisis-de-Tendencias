// Comprueba lo único que separa esta app del prototipo: que el chat responda a
// lo que escribes. Llama a la API de verdad, así que cuesta tokens.
//   npm run check:chat            (con el servidor de desarrollo corriendo)
//   npm run check:chat -- 5174    (si está en otro puerto)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const puerto = process.argv[2] ?? '5173';
const catalogo = JSON.parse(readFileSync(new URL('../src/data/catalogo.json', import.meta.url)));
const rol = (id) => catalogo.roles.find((r) => r.id === id);

const preguntar = async (pregunta) => {
  const res = await fetch(`http://localhost:${puerto}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ pregunta }),
  });
  const datos = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${datos.error ?? ''}`);
  return datos;
};

const casos = [
  {
    titulo: 'enruta al rol correcto, no al del ejemplo',
    q: '¿Qué habilidades piden para analista de riesgos?',
    verifica: (r) => {
      assert.equal(r.intent, 'habilidades');
      assert.deepEqual(r.roleIds, ['analista-riesgos'], 'debe acertar el rol preguntado');
      assert.ok(r.insight.length > 10, 'debe redactar un titular');
    },
  },
  {
    titulo: 'entiende la ciudad y usa su muestra',
    q: '¿Cuánto gana un analista de BI en Arequipa?',
    verifica: (r) => {
      assert.equal(r.intent, 'salarios');
      assert.equal(r.ciudad, 'Arequipa');
      assert.ok(r.roleIds.includes('analista-bi-jr'));
      assert.equal(r.sinDatos, false, 'Arequipa sí tiene muestra para este rol');
    },
  },
  {
    titulo: 'muestra insuficiente: no inventa cifra',
    q: '¿Cuánto paga un analista de calidad en Cusco?',
    verifica: (r) => {
      assert.equal(r.sinDatos, true, 'Cusco no llega al mínimo de muestra');
      assert.equal(r.insight, '', 'sin datos no se redacta un titular con cifras');
    },
  },
  {
    titulo: 'rol fuera del catálogo: sugiere cercanos en vez de inventar',
    q: '¿Cuánto gana un chef ejecutivo en Lima?',
    verifica: (r) => {
      assert.deepEqual(r.roleIds, [], 'no debe inventar un rol que no existe');
      assert.ok(r.sugerencias.length > 0, 'debe ofrecer alternativas reales');
      for (const id of r.sugerencias) assert.ok(rol(id), `sugirió un id inexistente: ${id}`);
    },
  },
  {
    titulo: 'fuera de alcance: lo dice, no improvisa',
    q: '¿Qué tiempo va a hacer mañana en Lima?',
    verifica: (r) => {
      assert.equal(r.fueraDeAlcance, true);
      assert.deepEqual(r.roleIds, []);
    },
  },
  {
    titulo: 'comparar devuelve varios roles',
    q: 'Compara analista de datos junior con data scientist junior',
    verifica: (r) => {
      assert.equal(r.intent, 'comparar');
      assert.ok(r.roleIds.length >= 2, `esperaba 2 o más roles, llegaron ${r.roleIds.length}`);
    },
  },
];

// Ninguna cifra del titular puede inventarse: toda cantidad en soles que el
// modelo escriba tiene que existir en el catálogo para los roles que acertó.
function cifrasReales(r) {
  if (!r.insight) return;
  const montos = [...r.insight.matchAll(/S\/\s?([\d.,]+)/g)].map((m) => Number(m[1].replace(/[.,]/g, '')));
  if (montos.length === 0) return;
  const permitidos = new Set();
  for (const id of r.roleIds) {
    const x = rol(id);
    for (const s of [x.salario, ...Object.values(x.porCiudad)]) {
      for (const v of [s.p25, s.med, s.p75]) if (v) permitidos.add(v);
    }
  }
  for (const m of montos) {
    assert.ok(permitidos.has(m), `el titular cita S/ ${m}, que no está en el catálogo para esos roles`);
  }
}

let fallos = 0;
for (const c of casos) {
  try {
    const r = await preguntar(c.q);
    c.verifica(r);
    cifrasReales(r);
    console.log(`  ✓ ${c.titulo}`);
    if (r.insight) console.log(`      “${r.insight}”`);
  } catch (e) {
    fallos++;
    console.error(`  ✗ ${c.titulo}\n      ${c.q}\n      ${e.message}`);
  }
}

console.log(fallos ? `\n✗ ${fallos} de ${casos.length} casos fallaron` : `\n✓ chat: ${casos.length}/${casos.length} casos`);
process.exit(fallos ? 1 : 0);
