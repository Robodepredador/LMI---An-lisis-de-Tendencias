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
    detalle: 'Egresado · 25 créditos comprados, con historial',
    perfil: {
      email: 'diego.ramos@demo.pe', nombre: 'Diego Ramos', iniciales: 'DR',
      rol: 'Egresado', areas: ['Marketing', 'Administración'], ciudades: ['Lima', 'Remoto'], tipo: 'personal',
    },
    estado: {
      plan: 'creditos', creditos: 21, usadasMes: 3,
      pendiente: null, tenant: 'LMI-U', docenteOpcion: null,
      consultas: [
        {
          id: 'demo-c1', ts: diasAtras(1), costo: 1,
          pregunta: '¿Qué habilidades piden para Analista de Marketing Digital?',
          resultado: { intent: 'habilidades', roleIds: ['analista-marketing-digital'], ciudad: null,
            insight: 'Google Analytics aparece en 82 % de las ofertas y Meta Ads subió 11 puntos en el último año.',
            sinDatos: false, fueraDeAlcance: false, sugerencias: [] },
        },
        {
          id: 'demo-c2', ts: diasAtras(2), costo: 1,
          pregunta: '¿Cuánto paga un Analista Comercial en Lima?',
          resultado: { intent: 'salarios', roleIds: ['analista-comercial'], ciudad: 'Lima',
            insight: 'La mediana en Lima es S/ 3,000 con un rango de S/ 2,300 a S/ 3,900.',
            sinDatos: false, fueraDeAlcance: false, sugerencias: [] },
        },
        {
          id: 'demo-c3', ts: diasAtras(4), costo: 0,
          pregunta: '¿Cuánto gana un community manager en Cusco?',
          resultado: { intent: 'salarios', roleIds: ['community-manager'], ciudad: 'Cusco',
            insight: '', sinDatos: true, fueraDeAlcance: false, sugerencias: [] },
        },
        {
          id: 'demo-c4', ts: diasAtras(6), costo: 1,
          pregunta: 'Compara Analista Comercial con Analista de Marketing Digital',
          resultado: { intent: 'comparar', roleIds: ['analista-comercial', 'analista-marketing-digital'], ciudad: null,
            insight: 'Excel avanzado es el punto en común; se separan en herramientas de campaña frente a análisis de ventas.',
            sinDatos: false, fueraDeAlcance: false, sugerencias: [] },
        },
      ],
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
