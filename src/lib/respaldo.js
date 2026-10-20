// Resuelve una pregunta contra el catálogo, sin red y sin modelo.
//
// Es el plan B de `consultar()`: si /api/chat se cae, se queda sin cuota o
// devuelve algo ilegible, el estudiante ve una respuesta real en vez de
// "No pudimos procesar la consulta". Un link compartido con varios
// estudiantes el mismo día agota la cuota de Gemini sin esfuerzo.
//
// No inventa prosa: `insight` va vacío y la pantalla lo plantilla desde el
// catálogo igual que en el camino normal.

import catalogo from '../data/catalogo.json' with { type: 'json' };

const norm = (s) => (s ?? '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^\w\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// Índice de claves: nombre y sinónimos de cada rol, ordenado de más larga a
// más corta. Gana la coincidencia MÁS LARGA, no la última: en el prototipo el
// bucle dejaba ganar a la última y cuatro roles colisionaban en "analista de",
// así que toda pregunta sobre un "Analista de ..." respondía con Economía.
// Nadie escribe "Analista de Datos junior": escribe "analista de datos". Cada
// clave entra también sin su sufijo de seniority.
const sinNivel = (k) => k.replace(/\s+(junior|jr|senior|sr|trainee|practicante)\b/g, '').trim();

const clavesDe = (r) => [...new Set(
  [r.nombre, ...(r.sinonimos ?? [])].flatMap((k) => [norm(k), sinNivel(norm(k))]),
)].filter(Boolean);

const CLAVES = catalogo.roles
  .flatMap((r) => clavesDe(r).map((k) => ({ id: r.id, k })))
  .sort((a, b) => b.k.length - a.k.length);

const CIUDADES = catalogo.ciudades.map((c) => ({ c, n: norm(c) }));

// Por palabra completa, no por subcadena: sinónimos cortos y legítimos como
// "qa", "bi" o "cm" aparecerían dentro de otras palabras.
const contiene = (texto, clave) => ` ${texto} `.includes(` ${clave} `);

function intencionDe(t) {
  if (/\b(gana|ganan|sueldo|sueldos|paga|pagan|salari\w*|cuanto)\b/.test(t)) return 'salarios';
  if (/\b(crece|creciendo|crecio|tendencia|sube|subiendo|futuro)\b/.test(t)) return 'tendencia';
  if (/\b(compara|comparar|versus|vs|o)\b.*\b(mejor|conviene)\b/.test(t)) return 'comparar';
  if (/\b(curso|cursos|estudiar|aprender|certificac\w*)\b/.test(t)) return 'cursos';
  return 'habilidades';
}

export function resolverLocal(pregunta) {
  const t = norm(pregunta);
  const vacio = {
    intent: 'habilidades', roleIds: [], sugerencias: [], ciudad: null,
    insight: '', sinDatos: false, fueraDeAlcance: true, local: true,
  };
  if (!t) return vacio;

  const hit = CLAVES.find((x) => contiene(t, x.k));
  if (!hit) return vacio;

  const rol = catalogo.roles.find((r) => r.id === hit.id);
  const ciudad = CIUDADES.find((x) => contiene(t, x.n))?.c ?? null;
  const intent = intencionDe(t);

  // Misma regla que el backend: bajo el mínimo no se afirma una cifra. El
  // store lee `sinDatos` para no cobrar la consulta.
  const ambito = ciudad ? rol.porCiudad?.[ciudad] : rol.salario;
  const sinDatos = intent === 'salarios'
    && (!ambito?.med || (ambito?.n ?? 0) < catalogo.minMuestra);

  return {
    intent, roleIds: [rol.id], sugerencias: [], ciudad,
    insight: '', sinDatos, fueraDeAlcance: false, local: true,
  };
}
