import catalogo from './catalogo.json';

export const fmt = (n) => n.toLocaleString('es-PE');

export const TOTAL_OFERTAS = catalogo.roles.reduce((s, r) => s + r.ofertas, 0);

// Fechas derivadas: ninguna cifra de periodo va escrita a mano.
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export const ventanaAnalisis = () => {
  const fin = new Date();
  const ini = new Date(fin.getTime() - 90 * 864e5);
  const abrev = (d) => MESES[d.getMonth()].slice(0, 3);
  return `${abrev(ini)}–${abrev(fin)} ${fin.getFullYear()}`;
};

export const proximaRenovacion = () => {
  const d = new Date();
  const p = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return `1 de ${MESES[p.getMonth()]}`;
};

export const fechaCorta = (ts) => {
  const d = new Date(ts);
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};

// ── Copy de la landing ───────────────────────────────────────────────
// Las tres funciones son el recorrido real del producto, no el dashboard
// informativo de antes (§9.10). Sin esto, el feedback del tester se mediría
// contra una promesa que ya no es la del producto.
export const FEATURES = [
  {
    n: '01', t: 'Tu diagnóstico', tono: 'accento',
    titular: '“Sabes con cuántas ofertas calzas hoy.”',
    d: 'Tres pasos y no escribes nada: subes tu CV o marcas lo que sabes, eliges a qué apuntas, y te decimos en cuántas de las ofertas activas cumples todos los requisitos obligatorios.',
  },
  {
    n: '02', t: 'Tu cuello de botella', tono: 'resalte',
    titular: '“Sabes qué te falta y cuánto vale aprenderlo.”',
    d: 'No una lista de habilidades: las dos que más ofertas te desbloquean, con cuántas gana cada una y el salto de sueldo típico que implican.',
  },
  {
    n: '03', t: 'Las ofertas donde ya calzas', tono: 'suave',
    titular: '“Dejas de leer 30 avisos para encontrar uno.”',
    d: 'Los avisos ordenados por tu propia brecha, no por fecha. En cada uno, qué piden exactamente, qué te falta para postular y el enlace al portal.',
  },
  {
    n: '04', t: 'Tu ruta y tu CV', tono: 'noche',
    titular: '“Sales con un plan y un CV, no con un dato.”',
    d: 'Qué estudiar primero y con qué recursos gratis, y tu CV reescrito con las palabras literales de los avisos. Nunca te agregamos experiencia que no tienes.',
  },
];

// Dos planes y nada más. Los paquetes de créditos y el Pro de S/ 29 salieron
// de toda la app, landing incluida: ese modelo quedó inviable (§6.3).
export const PLANES = [
  {
    id: 'free', name: 'Gratis', price: 'S/ 0', unit: '', destacado: false, tag: '',
    items: [
      'Explorador de tendencias por carrera y rol',
      '1 diagnóstico de perfil al mes',
      'Tu % de compatibilidad y las skills que te faltan',
      '3 consultas a Lumi al mes',
    ], cta: 'Empezar gratis'
  },
  {
    id: 'pro', name: 'Pro estudiante', price: 'S/ 19', unit: '/mes', destacado: true, tag: 'Para decidir',
    items: [
      'Ofertas ordenadas por tu probabilidad de éxito, con enlace para postular',
      'Adaptador de CV con las frases exactas de los avisos',
      'Ruta de aprendizaje con recursos gratis y baratos',
      'Diagnósticos y consultas a Lumi ilimitados',
    ], cta: 'Activar Pro estudiante'
  },
];

// Un solo producto que se compra. La pasarela ya no elige entre paquetes.
export const PRO = {
  id: 'pro',
  k: 'Pro estudiante',
  d: 'Ofertas, ruta y CV desbloqueados · cancela cuando quieras',
  precio: 'S/ 19/mes',
  monto: 19,
};

export const METODOS_PAGO = [
  { id: 'tarjeta', k: 'Tarjeta', d: 'Visa, Mastercard, Amex, Diners' },
  { id: 'yape', k: 'Yape', d: 'Con código de aprobación' },
  { id: 'plin', k: 'Plin', d: 'Escanea un QR' },
  { id: 'pagoefectivo', k: 'PagoEfectivo', d: 'Agentes o banca móvil' },
];

export const ROLES_PERFIL = [
  ['Estudiante', 'Aún en la universidad'],
  ['Egresado', 'Terminé mi carrera'],
  ['Postulante', 'Elijo qué estudiar'],
  ['En transición', 'Quiero cambiar de rubro'],
];

// ── Metodología ──────────────────────────────────────────────────────
export const cobertura = () => [
  { v: fmt(TOTAL_OFERTAS), k: 'ofertas analizadas' },
  { v: String(catalogo.roles.length), k: 'roles en el catálogo' },
  { v: String(catalogo.ciudades.length), k: 'ámbitos geográficos' },
  { v: '90 días', k: 'ventana de análisis' },
];

export const METODOLOGIA = [
  {
    t: 'Fuentes', r: 'Bolsas de empleo y portales corporativos, sin duplicados.',
    d: 'Bolsas de empleo públicas y privadas, portales de empleo corporativos y estadísticas oficiales de empleo (INEI) como referencia. Eliminamos ofertas duplicadas publicadas en más de un portal.'
  },
  {
    t: 'Habilidades', r: 'Proporción de ofertas del rol que la mencionan.',
    d: 'El porcentaje es la proporción de ofertas del rol que mencionan la habilidad. Un modelo de lenguaje normaliza sinónimos (por ejemplo, “MS Excel” y “Excel avanzado”) y un equipo revisa una muestra cada mes.'
  },
  {
    t: 'Salarios', r: 'Solo ofertas con rango declarado; mediana y P25–P75.',
    d: 'Usamos solo ofertas con rango salarial declarado. Mostramos la mediana y el rango entre el percentil 25 y 75, en sueldo bruto mensual.'
  },
  {
    t: 'Mínimo de muestra', r: `Menos de ${catalogo.minMuestra} ofertas: no mostramos cifra ni cobramos.`,
    d: `No mostramos cifras con menos de ${catalogo.minMuestra} ofertas. En ese caso te sugerimos ampliar región o periodo, y la consulta no se cobra.`
  },
  {
    t: 'Limitaciones', r: 'El empleo informal está subrepresentado.',
    d: 'Las ofertas publicadas no cubren todo el empleo: el trabajo informal y las contrataciones por referidos están subrepresentados.'
  },
];

// El jurado va a preguntar de dónde salen los datos. Adelantarse es defendible;
// que lo descubran preguntando, no.
export const AVISO_DATOS = {
  t: 'Sobre los datos de esta demostración',
  d: `Las cifras son un conjunto sintético: ${catalogo.roles.length} roles con distribuciones plausibles para el mercado peruano, no recolectadas de ofertas reales. La metodología descrita aquí es la que aplicaría el producto en producción.`,
};
