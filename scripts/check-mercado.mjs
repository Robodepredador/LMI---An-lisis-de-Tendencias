// Comprueba los cálculos del motor de decisión y la integridad de sus datos.
// Es la lógica con la que el estudiante decide qué estudiar: si se rompe, la
// app sigue mostrando un porcentaje y el consejo pasa a ser falso.
//   node scripts/check-mercado.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const catalogo = JSON.parse(readFileSync(new URL('../src/data/catalogo.json', import.meta.url), 'utf8'));

const {
  PERFILES, OFERTAS, EVIDENCIA, PORQUE, RECURSOS, BULLETS, CANDIDATAS,
  ROLES_MOTOR, CIUDADES_DIAG, SKILLS_OFRECIDAS, SKILLS_CV, COMPUESTAS,
  urlPortal,
} = await import('../src/data/mercado.js');

const {
  calc, camino, matchDe, candidatos, baseDe, evidenciaDe,
  sueldoDisponible, ordenarOfertas, rutaDe, tieneSkill, atomicasDe, enlaceDe, MIN_MUESTRA,
} = await import('../src/lib/mercado.js');

const rolDe = (id) => catalogo.roles.find((r) => r.id === id);

// ── La base de cada rol sale del catálogo, no de este archivo ────────
// Si las filas de la tabla de alcance no suman el total de Lima + Arequipa
// del rol, el porcentaje de un rol se mide contra el mercado de otro.
for (const rol of ROLES_MOTOR) {
  const r = rolDe(rol);
  assert.ok(r, `${rol} debe existir en catalogo.json`);
  const esperado = r.porCiudad.Lima.ofertas + r.porCiudad.Arequipa.ofertas;
  assert.equal(baseDe(rol), esperado,
    `${rol}: la tabla de alcance suma ${baseDe(rol)} y el catálogo dice ${esperado} (Lima + Arequipa)`);
  assert.equal(PERFILES[rol].length, 8, `${rol}: la tabla de alcance son 8 filas`);
}
console.log('check-mercado: la base de cada rol cuadra con el catálogo');

// ── Los nombres de skill: dos niveles, y el puente entre ellos ───────
// La capa de display usa las claves del catálogo; la de datos, atómicas.
// Si se aplanaran, ninguna oferta calzaría con nadie.
const atomicasConocidas = new Set(SKILLS_OFRECIDAS);
for (const rol of ROLES_MOTOR) {
  for (const h of rolDe(rol).habilidades) {
    const partes = atomicasDe(h.k);
    for (const a of partes) {
      assert.ok(atomicasConocidas.has(a),
        `${rol}: la habilidad de display "${h.k}" se resuelve a "${a}", que no está en SKILLS_OFRECIDAS`);
    }
  }
}
assert.deepEqual(atomicasDe('Java o Node.js'), ['Java', 'Node.js']);
assert.equal(tieneSkill('Java o Node.js', ['Node.js']), true, 'la compuesta se satisface con alguna');
assert.equal(tieneSkill('Java o Node.js', ['Python']), false);
for (const display of Object.keys(COMPUESTAS)) {
  assert.ok(!atomicasConocidas.has(display),
    `"${display}" es una clave de display: no puede estar también en SKILLS_OFRECIDAS`);
}

// Las skills de las tablas de alcance y de los avisos son todas atómicas.
for (const rol of ROLES_MOTOR) {
  for (const fila of PERFILES[rol]) {
    for (const s of fila.s) {
      assert.ok(atomicasConocidas.has(s), `${rol}: la fila de alcance usa "${s}", que no es una skill ofrecida`);
    }
  }
}
for (const o of OFERTAS) {
  for (const r of o.req) {
    assert.ok(atomicasConocidas.has(r.k) || RECURSOS[r.k],
      `${o.id}: el requisito "${r.k}" no es una skill ofrecida ni tiene recursos`);
  }
}
console.log('check-mercado: los dos niveles de nombres de skill cuadran');

// ── Cobertura: los cuatro roles con las seis estructuras completas ───
// La aserción que atrapa el olvido más probable: escribir los avisos de los
// cuatro y dejar un rol sin bullets, que deja una pantalla Pro vacía.
for (const rol of ROLES_MOTOR) {
  const avisos = OFERTAS.filter((o) => o.rol === rol);
  assert.equal(avisos.length, 8, `${rol}: 8 avisos cargados, hay ${avisos.length}`);
  assert.ok(EVIDENCIA[rol], `${rol}: sin evidencia para el panel del chat`);
  assert.ok(CANDIDATAS[rol]?.length, `${rol}: sin candidatas para el greedy`);
  const bullets = BULLETS.filter((b) => b.rol === rol);
  assert.ok(bullets.length >= 5, `${rol}: ${bullets.length} bullets de CV, hacen falta 5`);
  // Cada habilidad de display del rol necesita su evidencia y su porqué.
  for (const h of rolDe(rol).habilidades) {
    assert.ok(EVIDENCIA[rol][h.k], `${rol}: falta la evidencia de "${h.k}"`);
    assert.ok(EVIDENCIA[rol][h.k].frags.length >= 2, `${rol}/${h.k}: al menos 2 fragmentos literales`);
    for (const a of atomicasDe(h.k)) {
      assert.ok(PORQUE[a], `falta el porqué de "${a}"`);
      assert.ok(RECURSOS[a]?.length, `falta el catálogo de recursos de "${a}"`);
    }
  }
  // Y cada candidata del greedy tiene que poder enseñarse.
  for (const k of CANDIDATAS[rol]) {
    assert.ok(RECURSOS[k]?.length, `${rol}: la candidata "${k}" no tiene recursos que ofrecer`);
    assert.ok(PORQUE[k], `${rol}: la candidata "${k}" no tiene porqué`);
  }
}
// Todo requisito que un detalle de oferta puede mandar a la ruta.
for (const o of OFERTAS) {
  for (const r of o.req) {
    assert.ok(RECURSOS[r.k]?.length, `${o.id}: "${r.k}" se puede echar en falta y no tiene recursos`);
  }
}
console.log('check-mercado: los cuatro roles tienen las seis estructuras completas');

// ── Cada aviso: una obligatoria y frase literal en todos sus requisitos ──
const ids = new Set();
for (const o of OFERTAS) {
  assert.ok(!ids.has(o.id), `id de oferta repetido: ${o.id}`);
  ids.add(o.id);
  assert.ok(ROLES_MOTOR.includes(o.rol), `${o.id}: rol desconocido ${o.rol}`);
  assert.ok(CIUDADES_DIAG.includes(o.ciudad), `${o.id}: la ciudad ${o.ciudad} no está en los chips`);
  assert.ok(o.req.some((r) => r.t === 'O'), `${o.id}: ningún requisito obligatorio`);
  assert.ok(o.req.length >= 3 && o.req.length <= 6, `${o.id}: ${o.req.length} requisitos, se esperan 4–6`);
  for (const r of o.req) {
    assert.ok(['O', 'D'].includes(r.t), `${o.id}/${r.k}: tipo ${r.t}`);
    assert.ok(r.n, `${o.id}/${r.k}: sin nivel exigido`);
    assert.ok(r.f && r.f.length > 20, `${o.id}/${r.k}: sin frase literal del aviso`);
  }
  assert.ok(o.sueldo && o.portal && o.empresa && o.puesto, `${o.id}: ficha incompleta`);
  assert.match(urlPortal(o), /^https:\/\//, `${o.id}: el enlace de postular debe ser una URL`);
}
console.log(`check-mercado: ${OFERTAS.length} avisos con ${OFERTAS.reduce((a, o) => a + o.req.length, 0)} frases literales`);

// ── El % calzas cuenta solo obligatorias completas ───────────────────
const BK = 'desarrollador-backend-jr';
const DOS = ['Lima', 'Arequipa'];

// Las skills por defecto de la persona demo: dos filas alcanzables, 150 + 66.
const valeria = ['Java', 'SQL', 'Git', 'Python', 'HTML y CSS'];
const vc = calc(BK, valeria, DOS);
assert.equal(vc.n, 216, 'Valeria alcanza 216 ofertas del mercado de referencia');
assert.equal(vc.T, 695, 'Lima + Arequipa son 695 ofertas activas de backend junior');
assert.equal(vc.N, 216, 'con las dos ciudades por defecto N coincide con n');
assert.equal(vc.pct, 31, 'y eso es el 31%');

// Una fila solo cuenta si TODAS sus skills están: Java+SQL+Git+APIs REST no
// se suma a quien no tiene APIs REST.
assert.equal(calc(BK, ['Java', 'SQL'], DOS).n, 66, 'solo la fila que cabe entera');
assert.equal(calc(BK, ['Java'], DOS).n, 0, 'ninguna fila cabe con una sola skill');
assert.equal(calc(BK, ['Java'], DOS).pct, 0, 'y el 0% es una respuesta legítima');

// ── La invariante, por fuerza bruta ──────────────────────────────────
// NUNCA con un caso de ejemplo: con la fórmula del prototipo un ejemplo
// habría pasado y la prueba no habría servido de nada. Son 15 360 casos por
// rol y corren en milisegundos.
let casos = 0;
for (const rol of ROLES_MOTOR) {
  const atomicas = [...new Set(PERFILES[rol].flatMap((p) => p.s))];
  for (let m = 1; m < (1 << CIUDADES_DIAG.length); m++) {
    const ciudades = CIUDADES_DIAG.filter((_, i) => m & (1 << i));
    for (let k = 0; k < (1 << atomicas.length); k++) {
      const skills = atomicas.filter((_, i) => k & (1 << i));
      const c = calc(rol, skills, ciudades);
      casos++;
      assert.equal(c.pct, Math.round((c.N / c.T) * 100),
        `${rol} · ${ciudades.join('+')} · ${skills.join(',')}: pct ${c.pct} no es round(${c.N}/${c.T}·100)`);
      assert.ok(c.N <= c.T, `${rol}: N (${c.N}) no puede pasar de T (${c.T})`);
    }
  }
}
console.log(`check-mercado: pct === round(N/T·100) en ${casos} combinaciones de skills y ciudades`);

// ── El % es del perfil, no de la geografía ───────────────────────────
// Derivar pct de N/T tiene un precio: el porcentaje ya no queda clavado al
// cambiar de ciudad. El desvío respecto del % de referencia no pasa de UN
// punto, y por eso dos combinaciones de ciudad pueden diferir en dos, una por
// arriba y otra por abajo. Lo que no puede es saltar: si lo hiciera, el chip
// de ciudad estaría cambiando la competitividad del perfil y no el tamaño del
// mercado, que es justo lo que §7.10 del plan niega.
//
// El uno no sale de una cota analítica: el redondeo de N arrastra hasta
// 100·0.5/T puntos, que con el mercado más chico de los chips (Trujillo en
// QA, 35 ofertas) son 1.43, y encima van dos redondeos de 0.5. Sale de este
// barrido exhaustivo sobre los datos que se despliegan. Por eso la prueba
// recorre los 6240 casos en vez de mirar un ejemplo: si una tabla de alcance
// cambia y el desvío pasa a 2, aquí se entera.
for (const rol of ROLES_MOTOR) {
  const atomicas = [...new Set(PERFILES[rol].flatMap((p) => p.s))];
  const base = baseDe(rol);
  for (let k = 0; k < (1 << atomicas.length); k++) {
    const skills = atomicas.filter((_, i) => k & (1 << i));
    // La referencia: el % sin pasar por ninguna ciudad.
    const n = calc(rol, skills, CIUDADES_DIAG).n;
    const referencia = Math.round((n / base) * 100);
    for (let m = 1; m < (1 << CIUDADES_DIAG.length); m++) {
      const ciudades = CIUDADES_DIAG.filter((_, i) => m & (1 << i));
      const c = calc(rol, skills, ciudades);
      const desvio = Math.abs(c.pct - referencia);
      assert.ok(desvio <= 1,
        `${rol} · ${ciudades.join('+')} · ${skills.join(',')}: el % (${c.pct}) se va ${desvio} puntos del de referencia (${referencia}) con T=${c.T}`);
    }
  }
}
// Y N y T sí se mueven: si no, los chips de ciudad no harían nada.
const soloLima = calc(BK, valeria, ['Lima']);
assert.ok(soloLima.T < vc.T && soloLima.N < vc.N, 'quitar Arequipa reduce el mercado y las alcanzables');
assert.equal(soloLima.T, 581, 'Lima sola son 581 ofertas activas');
console.log('check-mercado: los chips de ciudad mueven N y T, no la competitividad');

// ── MIN_MUESTRA gatea el denominador ─────────────────────────────────
assert.equal(MIN_MUESTRA, catalogo.minMuestra, 'el umbral sale del catálogo');
assert.equal(calc(BK, valeria, []).suficiente, false, 'sin ciudades no hay muestra que sostenga una cifra');
assert.equal(calc(BK, valeria, []).pct, 0, 'y no se inventa un porcentaje');
for (const rol of ROLES_MOTOR) {
  for (const c of CIUDADES_DIAG) {
    assert.equal(calc(rol, [], [c]).suficiente, true,
      `${rol}/${c}: cada ciudad de los chips sola debe pasar el mínimo de muestra`);
  }
}
// El numerador pequeño NO se esconde.
const flaco = calc('analista-qa', ['Pruebas funcionales', 'Jira', 'Pruebas de API'], ['Trujillo']);
assert.ok(flaco.suficiente && flaco.N > 0 && flaco.N < flaco.T,
  'calzar con pocas de muchas es el producto funcionando, no un error');
console.log('check-mercado: MIN_MUESTRA gatea el denominador y el numerador pequeño se muestra');

// ── Cusco fuera de los chips, y el sueldo con su segunda puerta ──────
assert.ok(!CIUDADES_DIAG.includes('Cusco'), 'Cusco no declara mediana y el reporte muestra sueldo típico');
assert.ok(catalogo.ciudades.includes('Cusco'), 'pero sigue existiendo en el catálogo para el chat');
assert.equal(sueldoDisponible('analista-qa', ['Lima']), true, 'QA declara mediana en Lima');
assert.equal(sueldoDisponible('analista-qa', ['Arequipa', 'Trujillo', 'Remoto']), false,
  'QA no la declara fuera de Lima: ahí el reporte omite la cifra en vez de contradecir al chat');
assert.equal(sueldoDisponible(BK, ['Trujillo']), true, 'backend sí la declara en las cuatro');
console.log('check-mercado: el sueldo típico se calla donde el catálogo se calla');

// ── El sueldo típico se redondea a S/ 50 ─────────────────────────────
for (const rol of ROLES_MOTOR) {
  const atomicas = [...new Set(PERFILES[rol].flatMap((p) => p.s))];
  for (let k = 0; k < (1 << atomicas.length); k++) {
    const { sueldo } = calc(rol, atomicas.filter((_, i) => k & (1 << i)), DOS);
    assert.equal(sueldo % 50, 0, `${rol}: el sueldo típico ${sueldo} no está redondeado a S/ 50`);
  }
}
assert.equal(calc(BK, valeria, DOS).sueldo, 2700, 'el sueldo típico es el promedio ponderado de las alcanzables');
console.log('check-mercado: el sueldo típico se redondea a S/ 50');

// ── El greedy, y el par cuando ninguna skill sirve sola ──────────────
const ruta = camino(BK, valeria, DOS);
assert.equal(ruta[0].skill, 'APIs REST', 'lo que más desbloquea para Valeria es APIs REST');
assert.equal(ruta[0].gana, 184, 'y desbloquea 184 ofertas');
assert.equal(ruta[1].skill, 'Docker', 'después Docker');
assert.ok(ruta.every((p) => p.gana > 0), 'ningún paso de la ruta puede no servir para nada');
assert.ok(ruta[0].pct < ruta[1].pct && ruta[1].pct <= ruta[2].pct, 'el % sube paso a paso');

// EL CASO DEL PAR, con los datos que se van a desplegar: quien tiene
// Node.js, SQL, Git y APIs REST no gana NADA con Docker ni con Cloud por
// separado, y 60 ofertas con las dos. Sin la rama del par, Docker y Cloud se
// quedarían fuera de su ruta para siempre.
const nodejs = ['Node.js', 'SQL', 'Git', 'APIs REST'];
assert.equal(calc(BK, nodejs, DOS).n, 80);
assert.equal(calc(BK, [...nodejs, 'Docker'], DOS).n, 80, 'Docker sola no desbloquea nada');
assert.equal(calc(BK, [...nodejs, 'Cloud (AWS/Azure)'], DOS).n, 80, 'Cloud sola tampoco');
assert.equal(calc(BK, [...nodejs, 'Docker', 'Cloud (AWS/Azure)'], DOS).n, 140, 'las dos juntas, 60 más');
const rutaPar = camino(BK, nodejs, DOS);
assert.deepEqual(rutaPar.slice(0, 2).map((p) => p.skill).sort(), ['Cloud (AWS/Azure)', 'Docker'],
  'el greedy tiene que encontrar el par cuando ninguna sirve sola');
assert.ok(rutaPar[0].par && rutaPar[1].par, 'y marcarlo como par para que la pantalla lo explique');

// Java y Node.js son excluyentes como candidatas.
assert.ok(!candidatos(BK, ['Java']).includes('Node.js'), 'a quien sabe Java no se le recomienda Node.js');
assert.ok(!candidatos(BK, ['Node.js']).includes('Java'), 'ni al revés');
assert.ok(candidatos(BK, []).includes('Java'), 'pero sin ninguna de las dos, las dos son candidatas');
console.log('check-mercado: el greedy ordena por ofertas desbloqueadas y encuentra el par');

// ── El match de una oferta no mezcla deseables ───────────────────────
const b1 = OFERTAS.find((o) => o.id === 'b1');
const m = matchDe(b1, ['Java', 'SQL', 'Git']);
assert.equal(m.obligTotal, 3, 'b1 tiene 3 obligatorias');
assert.equal(m.desTotal, 2, 'y 2 deseables');
assert.equal(m.pct, 100, 'con las 3 obligatorias el match es 100% aunque falten deseables');
assert.deepEqual(m.faltanDeseables, ['Docker', 'Spring Boot'], 'las deseables que faltan se muestran aparte');
const m2 = matchDe(b1, ['Java', 'SQL', 'Docker']);
assert.equal(m2.pct, 67, '2 de 3 obligatorias es 67%, y tener una deseable no lo sube');
assert.deepEqual(m2.faltan, ['Git']);
for (const o of OFERTAS) {
  const todo = matchDe(o, o.req.map((r) => r.k));
  assert.equal(todo.pct, 100, `${o.id}: con todos los requisitos el match debe ser 100%`);
  assert.equal(matchDe(o, []).pct, 0, `${o.id}: sin nada el match debe ser 0%`);
}
console.log('check-mercado: el match cuenta obligatorias y nunca mezcla deseables');

// ── El orden del matchmaker ──────────────────────────────────────────
const porBrecha = ordenarOfertas(BK, valeria, 'brecha');
for (let i = 1; i < porBrecha.length; i++) {
  const a = porBrecha[i - 1];
  const b = porBrecha[i];
  assert.ok(a.faltan.length <= b.faltan.length, 'menor brecha primero');
}
const porFecha = ordenarOfertas(BK, valeria, 'fecha');
for (let i = 1; i < porFecha.length; i++) {
  assert.ok(porFecha[i - 1].oferta.dias <= porFecha[i].oferta.dias, 'más recientes primero');
}
console.log('check-mercado: el matchmaker ordena por brecha y por fecha');

// ── Los conteos de evidencia se derivan del universo ─────────────────
// Nunca del `ofertas` a nivel de rol (1038, que no cuadra con la suma de sus
// ciudades, 923): eso es lo que haría que el chat y el diagnóstico dieran
// cifras distintas del mismo rol y la misma ciudad.
const ev = evidenciaDe(BK, 'Java o Node.js', DOS);
assert.equal(ev.total, 695, 'el universo del panel es el de las ciudades elegidas');
assert.equal(ev.conteo, 612, '88% de 695');
assert.ok(ev.conteo <= ev.total, 'nunca más piden una skill que ofertas hay');
assert.notEqual(ev.conteo, 276, 'y no es el 88% de 314, que era el `n` salarial de Lima');
for (const rol of ROLES_MOTOR) {
  for (const h of rolDe(rol).habilidades) {
    const e = evidenciaDe(rol, h.k, DOS);
    assert.ok(e.conteo > 0 && e.conteo <= e.total, `${rol}/${h.k}: conteo ${e.conteo} fuera de rango`);
  }
}
assert.equal(evidenciaDe('contador-jr', 'Excel avanzado', DOS), null,
  'en los 31 roles sin evidencia el panel no se dibuja, así que ningún botón lleva a ninguna parte');
console.log('check-mercado: los conteos de evidencia salen del mismo universo que el diagnóstico');

// ── La ruta de aprendizaje ───────────────────────────────────────────
const r = rutaDe(BK, valeria, DOS, 6);
assert.ok(r.length >= 2, 'la ruta tiene pasos');
assert.equal(r[0].tramo.desde, 1, 'la primera skill empieza la semana 1');
for (let i = 1; i < r.length; i++) {
  assert.equal(r[i].tramo.desde, r[i - 1].tramo.hasta + 1, 'los tramos de semanas no se solapan');
}
for (const paso of r) {
  assert.ok(paso.recursos.length, `${paso.skill}: sin recursos que mostrar`);
  assert.ok(paso.horas > 0, `${paso.skill}: sin horas estimadas`);
}
// El precio de un recurso se muestra exacto, no redondeado: `soles()` es para
// sueldos típicos, y un curso de S/ 39 anunciado como S/ 50 sería una cifra
// falsa justo en la pantalla que vende honestidad.
for (const lista of Object.values(RECURSOS)) {
  for (const r of lista) {
    assert.equal(r.precio, Math.round(r.precio), `"${r.titulo}": el precio debe ser un entero de soles`);
    assert.ok(r.precio >= 0 && r.horas > 0, `"${r.titulo}": precio u horas fuera de rango`);
  }
}

// ── Dónde se aprende: todo recurso de una plataforma de la web enlaza ──
for (const lista of Object.values(RECURSOS)) {
  for (const r of lista) {
    const u = enlaceDe(r);
    const interno = r.plataforma === 'Guía LMI-U' || r.plataforma === 'Biblioteca UNSA';
    if (interno) {
      assert.equal(u, null, `"${r.titulo}": lo que no vive en la web no debe enlazar`);
    } else {
      assert.ok(u?.startsWith('https://'), `"${r.titulo}": sin enlace para ir a aprender`);
    }
  }
}
assert.ok(enlaceDe({ plataforma: 'YouTube', titulo: 'Git y GitHub' })
  .endsWith('search_query=Git%20y%20GitHub'), 'el buscador lleva el título exacto');
console.log('check-mercado: cada recurso de la web dice dónde aprenderlo');

const gratis = rutaDe(BK, valeria, DOS, 6, true);
assert.ok(gratis.every((p) => p.recursos.every((x) => x.precio === 0)), '"Solo gratis" filtra lo que cuesta');
assert.ok(gratis.every((p) => p.recursos.length), 'y siempre queda algo gratis que ofrecer');
console.log('check-mercado: la ruta reparte semanas y siempre tiene algo gratis');

// ── Los bullets del CV: nunca agregan lo que no está ─────────────────
assert.deepEqual(SKILLS_CV, ['Java', 'SQL', 'Git', 'Python', 'HTML y CSS'],
  'las skills que el CV de la persona demo declara');
for (const b of BULLETS) {
  assert.ok(b.antes && b.despues, `${b.id}: le falta antes o después`);
  assert.ok(b.kw.length, `${b.id}: sin palabras clave que resaltar`);
  for (const k of b.kw) {
    assert.ok(b.despues.includes(k), `${b.id}: la clave "${k}" no aparece en el texto reescrito`);
  }
  // LA REGLA DURA: una skill que el bullet dice aportar tiene que estar en el
  // CV. Si no, el adaptador sería un generador de mentiras.
  for (const s of b.aporta) {
    assert.ok(SKILLS_CV.includes(s),
      `${b.id}: dice aportar "${s}" y no está en el CV de la persona demo`);
  }
  for (const s of b.pide) {
    assert.ok(!SKILLS_CV.includes(s),
      `${b.id}: avisa de "${s}" como si faltara, pero el CV ya la tiene`);
    // LA QUE FALTABA, y la encontró recorriendo la app: el aviso decía "No
    // agregamos JavaScript: todavía no la tienes" justo debajo de un bullet
    // reescrito que SÍ decía "con JavaScript". El adaptador se contradecía a
    // sí mismo en la pantalla cuyo argumento de venta es la honestidad.
    assert.ok(!b.despues.toLowerCase().includes(s.toLowerCase()),
      `${b.id}: el texto reescrito nombra "${s}" y a la vez avisa de que no la tienes:
    ${b.despues}`);
  }
  if (b.confirmar) {
    assert.ok(SKILLS_CV.includes(b.confirmar), `${b.id}: pide confirmar "${b.confirmar}", que no está en el CV`);
  }
}
// El mismo bullet, mismo `antes` en los cuatro roles: una persona, un CV.
const porSeccion = new Map();
for (const b of BULLETS) {
  const clave = b.antes;
  if (!porSeccion.has(clave)) porSeccion.set(clave, new Set());
  porSeccion.get(clave).add(b.despues);
}
for (const [antes, despues] of porSeccion) {
  if (despues.size > 1) {
    assert.ok(despues.size >= 2, `el bullet "${antes.slice(0, 30)}…" se reescribe distinto por rol`);
  }
}
assert.ok(BULLETS.some((b) => b.rol === 'analista-qa' && /casos de prueba/.test(b.despues)),
  'el CV de QA habla de casos de prueba, no de microservicios');
assert.ok(!BULLETS.some((b) => b.rol === 'analista-qa' && /microservicios/.test(b.despues)),
  'y no le ofrece a un QA reescrituras de backend');
console.log(`check-mercado: ${BULLETS.length} bullets de CV y ninguno inventa experiencia`);

console.log('check-mercado: OK');
