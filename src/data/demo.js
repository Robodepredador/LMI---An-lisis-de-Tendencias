// Cuentas de demostración: permiten entrar a cualquier estado de un clic,
// sin recorrer el embudo entero. Patrón de "probar con una cuenta demo".
//
// Forma de `resultado` (la comparten el chat, el historial y lib/consultar.js):
//   { intent, roleIds: [roleId], ciudad, insight, sinDatos, fueraDeAlcance, sugerencias: [roleId] }

const diasAtras = (d) => Date.now() - d * 864e5; // fechas relativas: nunca se quedan viejas

export const CUENTAS_DEMO = [
  {
    id: 'valeria',
    etiqueta: 'Valeria Ríos',
    detalle: 'Estudiante · plan gratis, 3 consultas sin usar',
    perfil: {
      email: 'valeria.rios@demo.pe', nombre: 'Valeria Ríos', iniciales: 'VR',
      rol: 'Estudiante', areas: ['Datos y Analítica'], ciudades: ['Lima'], tipo: 'personal',
    },
    estado: {
      plan: 'free', creditos: 0, usadasMes: 0,
      consultas: [], pagos: [], pendiente: null,
      tenant: 'LMI-U', docenteOpcion: null,
    },
  },
  {
    id: 'diego',
    etiqueta: 'Diego Ramos',
    detalle: 'Egresado · 25 créditos comprados',
    perfil: {
      email: 'diego.ramos@demo.pe', nombre: 'Diego Ramos', iniciales: 'DR',
      rol: 'Egresado', areas: ['Marketing', 'Administración'], ciudades: ['Lima', 'Remoto'], tipo: 'personal',
    },
    estado: {
      plan: 'creditos', creditos: 25, usadasMes: 0,
      pendiente: null, tenant: 'LMI-U', docenteOpcion: null,
      consultas: [],
      pagos: [
        { id: 'demo-p1', ts: diasAtras(7), concepto: '25 consultas', monto: 25, metodo: 'yape' },
      ],
    },
  },
  {
    id: 'martin',
    etiqueta: 'Martín Salas',
    detalle: 'Director de Economía · licencia institucional, sin límite',
    perfil: {
      email: 'msalas@uandina.edu.pe', nombre: 'Martín Salas', iniciales: 'MS',
      rol: 'Director · Economía', carrera: 'Economía', areas: [], ciudades: ['Todo Perú'], tipo: 'docente',
    },
    estado: {
      plan: 'institucional', creditos: 0, usadasMes: 0,
      consultas: [], pagos: [], pendiente: null,
      tenant: 'Universidad Andina del Sur', docenteOpcion: 'A',
    },
  },
];
