// Puente entre lo que el estudiante elige en el registro y lo que el catálogo
// sabe responder. Las etiquetas visibles son exactamente las que el cliente
// aprobó en el prototipo v2; el mapeo a áreas es interno y nunca se muestra.
import catalogo from './catalogo.json' with { type: 'json' };

export const CARRERAS = [
  'Marketing', 'Administración', 'Ing. de Sistemas', 'Ing. Industrial', 'Contabilidad',
  'Psicología', 'Derecho', 'Diseño', 'Comunicaciones', 'Economía',
];

export const INTERESES = [
  'Marketing digital', 'Finanzas', 'Datos y analítica', 'Programación', 'Recursos humanos',
  'Diseño', 'Emprendimiento', 'Logística', 'Derecho corporativo', 'Sostenibilidad',
];

export const CIUDADES_REGISTRO = ['Lima', 'Arequipa', 'Trujillo', 'Otra'];

// Una carrera puede abrir varias áreas: un estudiante de Sistemas pregunta
// tanto por desarrollo como por datos.
const POR_CARRERA = {
  'Marketing':        ['Marketing', 'Datos y Analítica'],
  'Administración':   ['Administración', 'Finanzas'],
  'Ing. de Sistemas': ['Sistemas', 'Datos y Analítica'],
  'Ing. Industrial':  ['Ingeniería Industrial', 'Administración'],
  'Contabilidad':     ['Finanzas', 'Administración'],
  'Psicología':       ['Psicología', 'Administración'],
  'Derecho':          ['Derecho', 'Administración'],
  'Diseño':           ['Marketing', 'Sistemas'],
  'Comunicaciones':   ['Marketing', 'Psicología'],
  'Economía':         ['Finanzas', 'Datos y Analítica'],
};

const POR_INTERES = {
  'Marketing digital':  ['Marketing'],
  'Finanzas':           ['Finanzas'],
  'Datos y analítica':  ['Datos y Analítica'],
  'Programación':       ['Sistemas'],
  'Recursos humanos':   ['Psicología'],
  'Diseño':             ['Marketing'],
  'Emprendimiento':     ['Administración'],
  'Logística':          ['Ingeniería Industrial'],
  'Derecho corporativo':['Derecho'],
  'Sostenibilidad':     ['Ingeniería Industrial'],
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
