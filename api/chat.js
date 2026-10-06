// Único código de servidor del proyecto. La GEMINI_API_KEY vive en una variable
// de entorno y nunca llega al navegador.
//
// Dos llamadas, a propósito:
//   1. ENRUTAR  — el modelo ve solo el índice de roles (nombres y sinónimos, sin
//                 una sola cifra) y decide qué se está preguntando.
//   2. REDACTAR — el modelo ve ÚNICAMENTE las cifras de los roles que acertó.
//
// Partirlo así es lo que impide que invente un salario: en el paso 1 no hay
// números que copiar, y en el paso 2 solo están los correctos. Los gráficos los
// dibuja el front desde el catálogo, así que ninguna cifra en pantalla pasa por
// el modelo.
import { GoogleGenAI, Type } from '@google/genai';
import catalogo from '../src/data/catalogo.json' with { type: 'json' };

// En orden de preferencia, medido contra la API real, no elegido de catálogo:
// los Flash completos devuelven 429 (cuota agotada) o 503 (saturación) a
// menudo, mientras los Lite responden. La tarea es clasificar una pregunta y
// escribir dos frases, así que un Lite sobra y es más rápido.
const MODELOS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash', // por si la cuota de los completos vuelve
];
const REINTENTOS = 1;

// 503 es saturación momentánea: vale la pena reintentar el mismo modelo.
// 429 (cuota) y 404 (modelo retirado) no mejoran esperando: se pasa al siguiente.
const transitorio = (e) => e?.status === 503;
const otroModelo = (e) => e?.status === 429 || e?.status === 404 || e?.status === 503;

async function generar(ai, peticion) {
  let ultimo;
  for (const model of MODELOS) {
    for (let intento = 0; intento <= REINTENTOS; intento++) {
      try {
        return await ai.models.generateContent({ ...peticion, model });
      } catch (e) {
        ultimo = e;
        if (!otroModelo(e)) throw e; // un 400 es culpa nuestra: no se disimula
        if (transitorio(e) && intento < REINTENTOS) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        break;
      }
    }
    console.warn(`[api/chat] ${model} no disponible (${ultimo?.status}), probando el siguiente`);
  }
  throw ultimo;
}

const INTENTS = ['habilidades', 'salarios', 'comparar', 'cursos', 'brechas', 'otro'];

// ── Índice sin cifras, para el paso de enrutado ──────────────────────
const INDICE = catalogo.roles
  .map((r) => `${r.id} | ${r.nombre} | ${r.area} | ${r.sinonimos.join(', ')}`)
  .join('\n');

const SYS_ENRUTAR = `Eres el enrutador de LMI-U, un buscador del mercado laboral peruano.
Recibes la pregunta de una persona y la traduces a una consulta sobre este catálogo.

CATÁLOGO (id | nombre | área | sinónimos):
${INDICE}

ÁMBITOS GEOGRÁFICOS: ${catalogo.ciudades.join(', ')}

Reglas:
- roleIds solo puede contener ids que aparezcan literalmente arriba. Nunca inventes uno.
- Si la pregunta es sobre un trabajo que NO está en el catálogo, deja roleIds vacío,
  pon fueraDeAlcance en false y llena sugerencias con 2 o 3 ids de los roles más
  parecidos que SÍ existan.
- fueraDeAlcance es true solo si la pregunta no trata de trabajo, carreras, sueldos
  ni habilidades (por ejemplo el clima o un chiste).
- "comparar" requiere 2 o 3 roleIds.
- ciudad solo si la persona la menciona; si no, null.`;

const ESQUEMA_ENRUTAR = {
  type: Type.OBJECT,
  properties: {
    intent: { type: Type.STRING, enum: INTENTS },
    roleIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'ids del catálogo; vacío si ninguno coincide' },
    sugerencias: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'ids cercanos cuando no hay coincidencia' },
    ciudad: { type: Type.STRING, nullable: true },
    fueraDeAlcance: { type: Type.BOOLEAN },
  },
  required: ['intent', 'roleIds', 'sugerencias', 'fueraDeAlcance'],
  propertyOrdering: ['intent', 'roleIds', 'sugerencias', 'ciudad', 'fueraDeAlcance'],
};

// ── Ficha con cifras, solo de los roles acertados ────────────────────
function ficha(rol, ciudad) {
  const s = ciudad && rol.porCiudad[ciudad] ? rol.porCiudad[ciudad] : rol.salario;
  const donde = ciudad && rol.porCiudad[ciudad] ? ciudad : 'todo el país';
  const sueldo = s.med
    ? `salario en ${donde}: mediana S/ ${s.med}, rango S/ ${s.p25} a S/ ${s.p75} (n=${s.n})`
    : `sin muestra suficiente en ${donde} (n=${s.n}, mínimo ${catalogo.minMuestra})`;
  const hab = rol.habilidades.map((h) => `${h.k} ${h.pct}%${h.tendencia ? ` (${h.tendencia > 0 ? '+' : ''}${h.tendencia} pts)` : ''}`).join(', ');
  return `${rol.nombre} — ${rol.ofertas} ofertas. Habilidades: ${hab}. ${sueldo}.`;
}

const SYS_REDACTAR = `Eres LMI-U. Escribe el titular que acompaña a un gráfico de datos laborales.

Reglas estrictas:
- Máximo 2 frases, en español neutro de Perú.
- Usa SOLO las cifras que aparecen en los datos que recibes. Si un número no está ahí,
  no lo menciones. Jamás inventes ni redondees a un valor distinto.
- No repitas todas las cifras: destaca lo más útil (lo que más se pide, lo que creció,
  la mediana) porque el gráfico ya muestra el detalle.
- No saludes ni te presentes. Ve directo al hallazgo.`;

const ESQUEMA_REDACTAR = {
  type: Type.OBJECT,
  properties: { insight: { type: Type.STRING } },
  required: ['insight'],
};

const vacio = (extra = {}) => ({ intent: 'otro', roleIds: [], sugerencias: [], ciudad: null, fueraDeAlcance: false, insight: '', ...extra });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Usa POST.' });

  const pregunta = (req.body?.pregunta ?? '').toString().trim();
  if (!pregunta) return res.status(400).json({ error: 'Falta la pregunta.' });
  if (pregunta.length > 500) return res.status(400).json({ error: 'La pregunta es demasiado larga.' });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'El servicio de consultas no está configurado (falta GEMINI_API_KEY).' });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    // ── 1. Enrutar ──
    const r1 = await generar(ai, {
      contents: pregunta,
      config: { systemInstruction: SYS_ENRUTAR, responseMimeType: 'application/json', responseJsonSchema: ESQUEMA_ENRUTAR },
    });

    let ruta;
    try { ruta = JSON.parse(r1.text); } catch { return res.status(200).json(vacio()); }

    // El modelo puede devolver un id que no existe pese a la instrucción: se filtra.
    const existe = (id) => catalogo.roles.some((r) => r.id === id);
    const roleIds = (ruta.roleIds ?? []).filter(existe).slice(0, 3);
    const sugerencias = (ruta.sugerencias ?? []).filter(existe).slice(0, 3);
    const ciudad = catalogo.ciudades.includes(ruta.ciudad) ? ruta.ciudad : null;
    const intent = INTENTS.includes(ruta.intent) ? ruta.intent : 'otro';

    if (ruta.fueraDeAlcance || roleIds.length === 0) {
      return res.status(200).json(vacio({ intent, sugerencias, ciudad, fueraDeAlcance: !!ruta.fueraDeAlcance }));
    }

    // ¿Hay muestra suficiente para lo que pide? Se decide con el dato, no con el modelo.
    const roles = roleIds.map((id) => catalogo.roles.find((r) => r.id === id));
    const sinDatos = intent === 'salarios' && roles.every((r) => {
      const s = ciudad && r.porCiudad[ciudad] ? r.porCiudad[ciudad] : r.salario;
      return !s.med;
    });

    if (sinDatos) {
      return res.status(200).json(vacio({ intent, roleIds, ciudad, sinDatos: true }));
    }

    // ── 2. Redactar, viendo solo las cifras de estos roles ──
    const datos = roles.map((r) => ficha(r, ciudad)).join('\n');
    const r2 = await generar(ai, {
      contents: `Pregunta: ${pregunta}\n\nDatos disponibles:\n${datos}`,
      config: { systemInstruction: SYS_REDACTAR, responseMimeType: 'application/json', responseJsonSchema: ESQUEMA_REDACTAR },
    });

    let insight = '';
    try { insight = JSON.parse(r2.text).insight ?? ''; } catch { insight = ''; }

    return res.status(200).json({ intent, roleIds, sugerencias: [], ciudad, insight, sinDatos: false, fueraDeAlcance: false });
  } catch (e) {
    console.error('[api/chat]', e);
    return res.status(502).json({ error: 'No pudimos procesar la consulta.' });
  }
}
