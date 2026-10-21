// Puente entre lo que el estudiante elige en el registro y lo que el catálogo
// sabe responder. Las etiquetas visibles son exactamente las que el cliente
// aprobó en el prototipo v2; el mapeo a áreas es interno y nunca se muestra.
import catalogo from './catalogo.json' with { type: 'json' };

// Solo entran carreras que el catálogo pueda responder. Ofrecer Medicina o
// Educación, con cero roles de salud o docencia en las 8 áreas, haría que el
// estudiante eligiera la suya y recibiera cosas que no le tocan: peor que una
// lista corta.
export const CARRERAS = [
  'Administración', 'Negocios Internacionales', 'Contabilidad', 'Economía', 'Finanzas',
  'Marketing', 'Publicidad', 'Comunicaciones', 'Diseño',
  'Ing. de Sistemas', 'Ing. de Software', 'Ciencia de Datos', 'Estadística',
  'Ing. Industrial', 'Ing. Civil', 'Ing. Mecánica', 'Ing. Ambiental',
  'Psicología', 'Recursos Humanos', 'Derecho',
];

export const INTERESES = [
  'Marketing digital', 'Publicidad y marca', 'Investigación de mercados', 'Ventas',
  'Finanzas', 'Contabilidad y tributación', 'Banca y riesgos',
  'Datos y analítica', 'Inteligencia artificial', 'Programación',
  'Desarrollo web y móvil', 'Ciberseguridad', 'Soporte y sistemas',
  'Recursos humanos', 'Selección de personal',
  'Logística', 'Calidad y procesos', 'Gestión de proyectos',
  'Derecho corporativo', 'Emprendimiento', 'Comercio exterior', 'Sostenibilidad',
];

export const CIUDADES_REGISTRO = ['Lima', 'Arequipa', 'Trujillo', 'Otra'];

// Una carrera puede abrir varias áreas: un estudiante de Sistemas pregunta
// tanto por desarrollo como por datos.
const POR_CARRERA = {
  // Negocio y finanzas
  'Administración':           ['Administración', 'Finanzas'],
  'Negocios Internacionales': ['Administración', 'Finanzas'],
  'Contabilidad':             ['Finanzas', 'Administración'],
  'Economía':                 ['Finanzas', 'Datos y Analítica'],
  'Finanzas':                 ['Finanzas', 'Datos y Analítica'],
  // Marketing y comunicación
  'Marketing':        ['Marketing', 'Datos y Analítica'],
  'Publicidad':       ['Marketing'],
  'Comunicaciones':   ['Marketing', 'Psicología'],
  'Diseño':           ['Marketing', 'Sistemas'],
  // Tecnología y datos
  'Ing. de Sistemas': ['Sistemas', 'Datos y Analítica'],
  'Ing. de Software': ['Sistemas'],
  'Ciencia de Datos': ['Datos y Analítica', 'Sistemas'],
  'Estadística':      ['Datos y Analítica', 'Finanzas'],
  // Ingenierías de operaciones
  'Ing. Industrial': ['Ingeniería Industrial', 'Administración'],
  'Ing. Civil':      ['Ingeniería Industrial', 'Administración'],
  'Ing. Mecánica':   ['Ingeniería Industrial'],
  'Ing. Ambiental':  ['Ingeniería Industrial'],
  // Personas y legal
  'Psicología':       ['Psicología', 'Administración'],
  'Recursos Humanos': ['Psicología', 'Administración'],
  'Derecho':          ['Derecho', 'Administración'],
};

const POR_INTERES = {
  'Marketing digital':        ['Marketing'],
  'Publicidad y marca':       ['Marketing'],
  'Investigación de mercados':['Marketing', 'Datos y Analítica'],
  'Ventas':                   ['Marketing', 'Administración'],
  'Finanzas':                 ['Finanzas'],
  'Contabilidad y tributación':['Finanzas'],
  'Banca y riesgos':          ['Finanzas'],
  'Datos y analítica':        ['Datos y Analítica'],
  'Inteligencia artificial':  ['Datos y Analítica'],
  'Programación':             ['Sistemas'],
  'Desarrollo web y móvil':   ['Sistemas'],
  'Ciberseguridad':           ['Sistemas'],
  'Soporte y sistemas':       ['Sistemas'],
  'Recursos humanos':         ['Psicología', 'Administración'],
  'Selección de personal':    ['Psicología'],
  'Logística':                ['Ingeniería Industrial'],
  'Calidad y procesos':       ['Ingeniería Industrial'],
  'Gestión de proyectos':     ['Ingeniería Industrial', 'Administración'],
  'Derecho corporativo':      ['Derecho'],
  'Emprendimiento':           ['Administración'],
  'Comercio exterior':        ['Administración'],
  'Sostenibilidad':           ['Ingeniería Industrial'],
};

export const areasDe = (carrera) => POR_CARRERA[carrera] ?? [];

export const areasDeIntereses = (intereses = []) =>
  [...new Set(intereses.flatMap((i) => POR_INTERES[i] ?? []))];

// "Otra" no es una ciudad del catálogo: significa que no filtramos por ciudad.
export const TODO_PERU = 'Todo Perú';
export const ciudadDeRegistro = (etiqueta) =>
  (catalogo.ciudades.includes(etiqueta) ? etiqueta : TODO_PERU);

// Las áreas del perfil, para `sugerenciasPara()`: la carrera manda y los
// intereses amplían.
export const areasDePerfil = ({ carrera, intereses } = {}) =>
  [...new Set([...areasDe(carrera), ...areasDeIntereses(intereses)])];
