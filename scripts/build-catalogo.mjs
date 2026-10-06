// Expande src/data/roles.source.js a src/data/catalogo.json y verifica las invariantes.
// Si una cifra deja de ser coherente, este script falla y no escribe nada.
//   npm run catalogo
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { AREAS, CIUDADES, ROLES, CURSOS, MALLAS, CARRERA_AREAS } from '../src/data/roles.source.js';

const AQUI = dirname(fileURLToPath(import.meta.url));
const MIN_MUESTRA = 30; // por debajo de esto no se muestra cifra y no se cobra la consulta

const fallos = [];
const avisos = [];
const check = (cond, msg) => { if (!cond) fallos.push(msg); };
const aviso = (cond, msg) => { if (!cond) avisos.push(msg); };
const red10 = (x) => Math.round(x / 10) * 10;

// ── Expansión ────────────────────────────────────────────────────────
const roles = ROLES.map((r) => {
  const [p25, med, p75] = r.sal;

  const porCiudad = {};
  for (const c of CIUDADES) {
    const n = Math.round(r.decl * c.peso);
    porCiudad[c.k] = n >= MIN_MUESTRA
      ? { p25: red10(p25 * c.mult), med: red10(med * c.mult), p75: red10(p75 * c.mult), n,
          ofertas: Math.round(r.ofertas * c.peso) }
      : { n, ofertas: Math.round(r.ofertas * c.peso) }; // sin cifras: muestra insuficiente
  }

  const habilidades = r.hab.map(([k, pct, tendencia]) => ({ k, pct, tendencia }));
  const skills = new Set(habilidades.map((h) => h.k));

  return {
    id: r.id, nombre: r.n, area: r.a, nivel: r.niv,
    sinonimos: r.sin,
    ofertas: r.ofertas,
    habilidades,
    salario: { p25, med, p75, n: r.decl },
    porCiudad,
    cursos: CURSOS.filter((c) => skills.has(c.skill)).map((c) => c.id),
  };
});

// ── Invariantes ──────────────────────────────────────────────────────
const ids = new Set();
let sinDatosCombos = 0;

for (const r of roles) {
  check(!ids.has(r.id), `id duplicado: ${r.id}`);
  ids.add(r.id);
  check(AREAS.includes(r.area), `${r.id}: área desconocida "${r.area}"`);
  check(r.sinonimos.length > 0, `${r.id}: sin sinónimos, el buscador dependerá del nombre exacto`);

  const { p25, med, p75, n } = r.salario;
  check(p25 < med && med < p75, `${r.id}: percentiles incoherentes ${p25}/${med}/${p75}`);
  check(p25 >= 1200, `${r.id}: p25 ${p25} por debajo del sueldo mínimo`);
  check(n < r.ofertas, `${r.id}: declaran salario ${n} >= ofertas ${r.ofertas}`);
  check(n >= MIN_MUESTRA, `${r.id}: muestra nacional ${n} < ${MIN_MUESTRA}, el rol sería inconsultable`);

  check(r.habilidades.length >= 4, `${r.id}: menos de 4 habilidades`);
  for (const h of r.habilidades) {
    check(h.pct > 0 && h.pct <= 100, `${r.id}: "${h.k}" con ${h.pct}%`);
  }
  const pcts = r.habilidades.map((h) => h.pct);
  check(pcts.every((p, i) => i === 0 || pcts[i - 1] >= p), `${r.id}: habilidades no ordenadas de mayor a menor`);

  let sumaN = 0, sumaOfertas = 0;
  for (const [ciudad, c] of Object.entries(r.porCiudad)) {
    sumaN += c.n;
    sumaOfertas += c.ofertas;
    if (c.n < MIN_MUESTRA) { sinDatosCombos++; check(c.med === undefined, `${r.id}/${ciudad}: muestra ${c.n} pero trae cifras`); }
    else check(c.p25 < c.med && c.med < c.p75, `${r.id}/${ciudad}: percentiles incoherentes tras el ajuste`);
  }
  check(sumaN <= r.salario.n, `${r.id}: la suma por ciudad (${sumaN}) supera la muestra nacional (${r.salario.n})`);
  check(sumaOfertas <= r.ofertas, `${r.id}: la suma de ofertas por ciudad supera el total`);
}

for (const a of AREAS) check(roles.some((r) => r.area === a), `el área "${a}" no tiene ningún rol`);
for (const c of CURSOS) check(roles.some((r) => r.cursos.includes(c.id)), `curso huérfano, ningún rol lo usa: ${c.id}`);

const todasLasSkills = new Set(roles.flatMap((r) => r.habilidades.map((h) => h.k)));
for (const [carrera, malla] of Object.entries(MALLAS)) {
  check(CARRERA_AREAS[carrera], `la carrera "${carrera}" no tiene áreas asignadas`);
  // Una materia de la malla que nadie pide es un hallazgo legítimo ("enseñamos algo sin demanda"),
  // no un error de datos: solo no aparecerá en la tabla de brechas, que va dirigida por la demanda.
  for (const s of malla) aviso(todasLasSkills.has(s), `"${carrera}": "${s}" está en la malla pero ningún rol la pide`);
}

// La pantalla de "sin datos suficientes" tiene que ser alcanzable de verdad
check(sinDatosCombos > 0, `ningún rol/ciudad cae por debajo de ${MIN_MUESTRA}: la pantalla "sin datos" sería inalcanzable`);

if (fallos.length) {
  console.error(`\n✗ ${fallos.length} problema(s) en el catálogo:\n`);
  for (const f of fallos) console.error(`  · ${f}`);
  process.exit(1);
}
for (const a of avisos) console.warn(`  ! ${a}`);

// ── Salida ───────────────────────────────────────────────────────────
const catalogo = {
  minMuestra: MIN_MUESTRA,
  areas: AREAS,
  ciudades: CIUDADES.map((c) => c.k),
  roles,
  cursos: CURSOS,
  mallas: MALLAS,
  carreraAreas: CARRERA_AREAS,
};

writeFileSync(join(AQUI, '../src/data/catalogo.json'), JSON.stringify(catalogo, null, 1));

const totalOfertas = roles.reduce((s, r) => s + r.ofertas, 0);
console.log(`✓ catalogo.json — ${roles.length} roles en ${AREAS.length} áreas, ${totalOfertas.toLocaleString('es-PE')} ofertas`);
console.log(`  ${sinDatosCombos} combinaciones rol/ciudad por debajo de n=${MIN_MUESTRA} (alimentan "sin datos suficientes")`);
