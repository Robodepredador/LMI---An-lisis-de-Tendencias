// Cuentas de demostración: permiten entrar a cualquier estado de un clic,
// sin recorrer el embudo entero. Patrón de "probar con una cuenta demo".
//
// LAS DOS CUENTAS DE ESTUDIANTE ARRANCAN EN PLAN GRATIS (§6.10). Nadie se
// salta la pasarela, porque cruzarla es lo que se está midiendo: si el tester
// entra ya en Pro, no puede decir si pagaría.
//
// Forma de `resultado` (la comparten el chat, el historial y lib/consultar.js):
//   { intent, roleIds: [roleId], ciudad, insight, sinDatos, fueraDeAlcance, sugerencias: [roleId] }
//
// En `estado`, `perfil` es el del DIAGNÓSTICO (skills, rol objetivo, ciudades);
// el `perfil` de arriba es la identidad de la cuenta. El store los guarda por
// separado para que escribir uno no borre el otro.

const diasAtras = (d) => Date.now() - d * 864e5; // fechas relativas: nunca se quedan viejas

const respuesta = (rol, ciudad, intent = 'habilidades') => ({
  intent, roleIds: [rol], ciudad, insight: '', sinDatos: false, fueraDeAlcance: false, sugerencias: [],
});

export const CUENTAS_DEMO = [
  {
    id: 'frank',
    etiqueta: 'Frank Li (CV Real)',
    detalle: 'Estudiante USIL · Frank Li Figueroa Rodríguez (CV Real · Pro)',
    perfil: {
      email: 'frankfrodriguez12@gmail.com', nombre: 'Frank Li Figueroa Rodríguez', iniciales: 'FL',
      rol: 'Estudiante', carrera: 'Ingeniería de Sistemas de Información',
      universidad: 'Universidad San Ignacio de Loyola (USIL)',
      ciclo: 3, // '7mo o más' — 8vo ciclo
      areas: ['Sistemas'], ciudades: ['Lima', 'Remoto'], tipo: 'personal',
    },
        estado: {
      plan: 'pro', usadasMes: 0,
      consultas: [], pagos: [], pendiente: null,
      perfil: null, diagnostico: null, diagnosticosMes: 0,
      tenant: 'LMI-U', docenteOpcion: null,
    },
  },
  {
    id: 'valeria',
    etiqueta: 'Valeria Ríos',
    detalle: 'Estudiante · plan gratis, sin diagnóstico hecho',
    perfil: {
      email: 'valeria.rios@demo.pe', nombre: 'Valeria Ríos', iniciales: 'VR',
      rol: 'Estudiante', carrera: 'Ingeniería de Sistemas',
      universidad: 'Universidad Nacional de San Agustín (UNSA)',
      ciclo: 3, // '7mo o más' — 8vo ciclo, la persona del CV (§7.13)
      areas: ['Sistemas'], ciudades: ['Arequipa'], tipo: 'personal',
    },
    estado: {
      plan: 'free', usadasMes: 0,
      consultas: [], pagos: [], pendiente: null,
      // Sin diagnóstico: aterriza en /diagnostico y lo hace, que es el
      // recorrido que se está midiendo.
      perfil: null, diagnostico: null, diagnosticosMes: 0,
      tenant: 'LMI-U', docenteOpcion: null,
    },
  },
  {
    id: 'diego',
    etiqueta: 'Diego Ramos',
    detalle: 'Egresado · plan gratis, con historial de consultas',
    perfil: {
      email: 'diego.ramos@demo.pe', nombre: 'Diego Ramos', iniciales: 'DR',
      rol: 'Egresado', carrera: 'Ingeniería de Sistemas',
      universidad: 'Universidad Nacional de Trujillo',
      ciclo: 3, areas: ['Sistemas'], ciudades: ['Lima', 'Remoto'], tipo: 'personal',
    },
    estado: {
      plan: 'free', usadasMes: 2,
      pendiente: null, tenant: 'LMI-U', docenteOpcion: null,
      perfil: null, diagnostico: null, diagnosticosMes: 0,
      // Historial en vez de pagos: ya no hay créditos que haber comprado.
      consultas: [
        { id: 'demo-d1', hiloId: 'demo-h1', ts: diasAtras(6), costo: 1, retomada: false,
          pregunta: '¿Qué habilidades piden para Desarrollador Backend junior en Lima?',
          resultado: respuesta('desarrollador-backend-jr', 'Lima') },
        { id: 'demo-d2', hiloId: 'demo-h1', ts: diasAtras(6), costo: 1, retomada: false,
          pregunta: '¿Cuánto paga ese rol?',
          resultado: respuesta('desarrollador-backend-jr', 'Lima', 'salarios') },
      ],
      pagos: [],
    },
  },
  {
    id: 'martin',
    etiqueta: 'Martín Salas',
    detalle: 'Director de Economía · licencia institucional, sin límite',
    perfil: {
      email: 'msalas@uandina.edu.pe', nombre: 'Martín Salas', iniciales: 'MS',
      rol: 'Director · Economía', carrera: 'Economía', universidad: 'Universidad Andina del Sur',
      areas: [], ciudades: ['Todo Perú'], tipo: 'docente',
    },
    estado: {
      plan: 'institucional', usadasMes: 0,
      consultas: [], pagos: [], pendiente: null,
      perfil: null, diagnostico: null, diagnosticosMes: 0,
      tenant: 'Universidad Andina del Sur', docenteOpcion: 'A',
    },
  },
];
