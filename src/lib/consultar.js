import catalogo from '../data/catalogo.json';

export const MIN_MUESTRA = catalogo.minMuestra;

export const rol = (id) => catalogo.roles.find((r) => r.id === id);
export const curso = (id) => catalogo.cursos.find((c) => c.id === id);

// El salario del ámbito pedido; si no hay ciudad, el nacional.
// Devuelve `null` en `cifras` cuando la muestra no llega al mínimo.
export function salarioDe(r, ciudad) {
  const porCiudad = ciudad ? r.porCiudad[ciudad] : null;
  const fuente = porCiudad ?? r.salario;
  return {
    ambito: porCiudad ? ciudad : 'todo el país',
    n: fuente.n,
    cifras: fuente.med ? { p25: fuente.p25, med: fuente.med, p75: fuente.p75 } : null,
  };
}

// Las cursos sugeridos para cerrar brechas: los asociados a las habilidades
// del rol, sin repetir.
export function cursosDe(roles) {
  const ids = [...new Set(roles.flatMap((r) => r.cursos))];
  return ids.map(curso).filter(Boolean).slice(0, 3);
}

// Brechas de una carrera: lo que más pide el mercado en sus áreas, cruzado
// contra la malla. Va dirigido por la demanda, así que una materia de la malla
// que nadie pide simplemente no aparece.
export function brechasDe(carrera) {
  const areas = catalogo.carreraAreas[carrera] ?? [];
  const malla = catalogo.mallas[carrera] ?? [];
  const delArea = catalogo.roles.filter((x) => areas.includes(x.area));
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Normalización de sinónimos, que es lo que la metodología promete hacer:
  // "Excel" y "Excel avanzado" son la misma competencia. La variante con más
  // demanda da nombre a la familia; si no, saldrían como filas separadas.
  const bruto = new Map();
  for (const r of delArea) {
    for (const h of r.habilidades) {
      bruto.set(h.k, (bruto.get(h.k) ?? 0) + h.pct * r.ofertas);
    }
  }
  const nombres = [...bruto.keys()];
  const canonico = (k) => nombres
    .filter((o) => norm(o).includes(norm(k)) || norm(k).includes(norm(o)))
    .sort((a, b) => bruto.get(b) - bruto.get(a))[0] ?? k;

  const demanda = new Map();
  for (const r of delArea) {
    for (const h of r.habilidades) {
      const k = canonico(h.k);
      const prev = demanda.get(k) ?? { peso: 0, ofertas: 0 };
      demanda.set(k, { peso: prev.peso + h.pct * r.ofertas, ofertas: prev.ofertas + r.ofertas });
    }
  }

  const estaEnMalla = (k) => malla.some((m) => norm(m).includes(norm(k)) || norm(k).includes(norm(m)));

  return [...demanda.entries()]
    .map(([k, v]) => ({ k, pct: Math.round(v.peso / v.ofertas), enMalla: estaEnMalla(k) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);
}

export class ErrorConsulta extends Error {}

export async function consultar(pregunta) {
  let res;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pregunta }),
    });
  } catch {
    // Sin red no hay forma de distinguir un fallo del servidor de uno del cable.
    throw new ErrorConsulta('No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.');
  }

  let datos;
  try { datos = await res.json(); } catch { throw new ErrorConsulta('La respuesta del servidor no se pudo leer.'); }
  if (!res.ok) throw new ErrorConsulta(datos?.error ?? 'No pudimos procesar la consulta.');

  return {
    intent: datos.intent ?? 'otro',
    roleIds: datos.roleIds ?? [],
    sugerencias: datos.sugerencias ?? [],
    ciudad: datos.ciudad ?? null,
    insight: datos.insight ?? '',
    sinDatos: !!datos.sinDatos,
    fueraDeAlcance: !!datos.fueraDeAlcance,
  };
}

// Sugerencias del chat vacío, afinadas con el perfil: se preguntan cosas que
// el catálogo sí puede responder.
export function sugerenciasPara(perfil) {
  const areas = perfil?.areas?.length ? perfil.areas : catalogo.areas.slice(0, 2);
  const ciudad = perfil?.ciudades?.[0] && perfil.ciudades[0] !== 'Todo Perú' ? perfil.ciudades[0] : 'Lima';
  const deArea = (a) => catalogo.roles.filter((r) => r.area === a);

  const a1 = deArea(areas[0]);
  const a2 = deArea(areas[1] ?? areas[0]);

  return [
    { tag: 'HABILIDADES', q: `¿Qué habilidades piden para ${a1[0]?.nombre}?` },
    { tag: 'SALARIOS', q: `¿Cuánto gana un ${(a1[1] ?? a1[0])?.nombre} en ${ciudad}?` },
    { tag: 'COMPARAR', q: `Compara ${a1[0]?.nombre} con ${(a1[1] ?? a2[0])?.nombre}` },
    { tag: 'BRECHAS', q: `¿Qué cursos me ayudan para ${(a2[0] ?? a1[0])?.nombre}?` },
  ].filter((s) => !s.q.includes('undefined'));
}

// Indicadores del panel docente. Todo sale del catálogo: ningún número aquí
// está escrito a mano ni pasa por el modelo.
export function panelDe(carrera) {
  const areas = catalogo.carreraAreas[carrera] ?? [];
  const roles = catalogo.roles.filter((r) => areas.includes(r.area));
  const brechas = brechasDe(carrera);

  const ofertas = roles.reduce((s, r) => s + r.ofertas, 0);
  const junior = roles.filter((r) => r.nivel === 'junior');
  const medianas = junior.map((r) => r.salario.med).sort((a, b) => a - b);
  const medianaEntrada = medianas.length ? medianas[Math.floor(medianas.length / 2)] : null;
  const muestraSalarial = junior.reduce((s, r) => s + r.salario.n, 0);
  const fueraDeMalla = brechas.slice(0, 10).filter((b) => !b.enMalla);

  const contratan = [...roles].sort((a, b) => b.ofertas - a.ofertas).slice(0, 5);

  return { areas, roles, brechas, ofertas, medianaEntrada, muestraSalarial, fueraDeMalla, contratan };
}
