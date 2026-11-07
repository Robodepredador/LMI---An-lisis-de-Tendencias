// Mercado: lo que el scraper traerá y hoy es mock.
//
// Regla que manda sobre este archivo (§7.1 del plan): aquí va SOLO lo que no
// existe en `catalogo.json`. Las habilidades del rol, las ofertas por ciudad y
// la muestra se leen de allí. Si se copiaran, en la primera corrección del
// catálogo el diagnóstico y el chat empezarían a decir cosas distintas del
// mismo rol.
//
// Los nombres de skill tienen DOS NIVELES y no se pueden aplanar (§10.1):
//   · display  — las claves de `catalogo.json`, compuestas incluidas
//                ('Java o Node.js'). Es lo que el chat y el reporte muestran.
//   · atómicas — 'Java', 'Node.js'. Es lo que el usuario marca y lo que piden
//                los avisos, porque ningún aviso pide "Java o Node.js".
// `COMPUESTAS` es el puente: tener la de display es tener ALGUNA de las suyas.
//
// Forma de los datos, contra las cuatro entidades del scraper:
//   Ofertas_Normalizadas  → OFERTAS            (id, rol, empresa, puesto…)
//   Requisitos_Oferta     → OFERTAS[].req      (k=skill, t=tipo, n=nivel, f=contexto_uso)
//   Catalogo_Recursos     → RECURSOS           (por skill)
//   Perfil_Usuario        → el `perfil` del store, no este archivo
// Y tres que el prototipo tiene y el scraper derivará:
//   PERFILES   — tabla de alcance por rol: el dataset que produce el %
//   EVIDENCIA  — resumen y frases literales por skill, para el panel del chat
//   BULLETS    — el CV de la persona demo, reescrito por rol

// Con el atributo de tipo, igual que `respaldo.js` y `consultar.js`: así los
// scripts de verificación pueden importar este módulo en Node, no solo Vite.
import catalogo from './catalogo.json' with { type: 'json' };

const rolDe = (id) => catalogo.roles.find((r) => r.id === id);

// Los cuatro roles con avisos cargados (§6.8). El chat sigue respondiendo
// para los 35 del catálogo; lo que existe para cuatro es la evidencia.
export const ROLES_MOTOR = [
  'desarrollador-backend-jr',
  'desarrollador-frontend-jr',
  'analista-qa',
  'analista-datos-jr',
];

// Cusco existe en el catálogo pero no declara mediana salarial, y el reporte
// muestra sueldo típico (§7.15). Las cuatro del handoff son las que tienen
// con qué responder.
export const CIUDADES_DIAG = ['Lima', 'Arequipa', 'Trujillo', 'Remoto'];
export const CIUDADES_DEFECTO = ['Lima', 'Arequipa'];

// Única compuesta del catálogo en estos cuatro roles.
export const COMPUESTAS = {
  'Java o Node.js': ['Java', 'Node.js'],
};

// Pares que no se recomiendan juntos: a quien ya sabe Java no se le propone
// Node.js para las mismas ofertas (§10.2).
export const EXCLUYENTES = [['Java', 'Node.js']];

// Lo que el paso 1 ofrece marcar. Es la unión de las atómicas que usan las
// tablas de alcance, más las que los avisos piden como deseables.
export const SKILLS_OFRECIDAS = [
  'Java', 'Node.js', 'Python', 'SQL', 'Git', 'APIs REST', 'Docker', 'Cloud (AWS/Azure)',
  'JavaScript', 'HTML y CSS', 'React', 'TypeScript', 'Figma',
  'Pruebas funcionales', 'Jira', 'Automatización con Selenium', 'Pruebas de API',
  'Excel avanzado', 'Power BI', 'Estadística', 'Comunicar resultados',
  'Inglés intermedio',
];

// Lo que el lector de PDF "detecta" en el CV de la persona demo. No se parsea
// el archivo (no-objetivo del plan): se acepta y se devuelve esto.
export const SKILLS_CV = ['Java', 'SQL', 'Git', 'Python', 'HTML y CSS'];

export const CV_DEMO = {
  archivo: 'CV_Valeria_Rios.pdf',
  paginas: 2,
  carrera: 'Ingeniería de Sistemas',
  universidad: 'Universidad Nacional de San Agustín (UNSA)',
  ciclo: 3, // índice en CICLOS → '7mo o más'
};

/* ═══════════════════════════════════════════════════════════════════
   PERFILES · la tabla de alcance que produce el %

   Cada fila es un conjunto de skills y cuántas ofertas del mercado de
   referencia lo piden como obligatorio completo, con su sueldo medio.
   El % calzas suma las filas cuyo conjunto cabe dentro del del usuario.

   RESTRICCIÓN (§10.1): las filas de cada rol suman el total de ofertas de
   Lima + Arequipa de ese rol — 695 / 532 / 313 / 847. Ese total es la `base`
   del cálculo. `check-mercado.mjs` lo verifica contra `catalogo.json`, así
   que no hay forma de que se desincronicen en silencio.
   ═══════════════════════════════════════════════════════════════════ */
export const PERFILES = {
  // base 695 = Lima 581 + Arequipa 114. Filas del prototipo, sin tocar.
  'desarrollador-backend-jr': [
    { s: ['Java', 'SQL', 'Git'], n: 150, sal: 3200 },
    { s: ['Java', 'SQL', 'Git', 'APIs REST'], n: 140, sal: 3600 },
    { s: ['Java', 'SQL', 'APIs REST', 'Docker'], n: 125, sal: 4100 },
    { s: ['Node.js', 'SQL', 'Git', 'APIs REST'], n: 80, sal: 3800 },
    { s: ['Node.js', 'APIs REST', 'Docker', 'Cloud (AWS/Azure)'], n: 60, sal: 4600 },
    { s: ['Java', 'SQL'], n: 66, sal: 1500 },
    { s: ['Python', 'SQL', 'Git', 'APIs REST'], n: 44, sal: 3300 },
    { s: ['Java', 'APIs REST', 'Docker', 'Cloud (AWS/Azure)'], n: 30, sal: 4800 },
  ],
  // base 532 = Lima 445 + Arequipa 87
  'desarrollador-frontend-jr': [
    { s: ['JavaScript', 'HTML y CSS'], n: 95, sal: 1600 },
    { s: ['JavaScript', 'HTML y CSS', 'Git'], n: 110, sal: 2900 },
    { s: ['JavaScript', 'HTML y CSS', 'React', 'Git'], n: 100, sal: 3400 },
    { s: ['JavaScript', 'HTML y CSS', 'React', 'Git', 'TypeScript'], n: 72, sal: 4000 },
    { s: ['JavaScript', 'HTML y CSS', 'React', 'Figma'], n: 50, sal: 3300 },
    { s: ['JavaScript', 'HTML y CSS', 'React', 'Git', 'TypeScript', 'Figma'], n: 40, sal: 4400 },
    { s: ['HTML y CSS', 'Figma'], n: 35, sal: 1800 },
    { s: ['JavaScript', 'React', 'TypeScript'], n: 30, sal: 3900 },
  ],
  // base 313 = Lima 262 + Arequipa 51
  'analista-qa': [
    { s: ['Pruebas funcionales'], n: 60, sal: 1500 },
    { s: ['Pruebas funcionales', 'Jira'], n: 70, sal: 2600 },
    { s: ['Pruebas funcionales', 'Jira', 'SQL'], n: 55, sal: 3000 },
    { s: ['Pruebas funcionales', 'Jira', 'SQL', 'Automatización con Selenium'], n: 45, sal: 3700 },
    { s: ['Pruebas funcionales', 'Jira', 'Automatización con Selenium'], n: 30, sal: 3400 },
    { s: ['Pruebas funcionales', 'Jira', 'SQL', 'Automatización con Selenium', 'Pruebas de API'], n: 25, sal: 4300 },
    { s: ['Pruebas funcionales', 'SQL'], n: 18, sal: 2400 },
    { s: ['Pruebas funcionales', 'Jira', 'Pruebas de API'], n: 10, sal: 3500 },
  ],
  // base 847 = Lima 708 + Arequipa 139
  'analista-datos-jr': [
    { s: ['Excel avanzado'], n: 120, sal: 1500 },
    { s: ['Excel avanzado', 'SQL'], n: 165, sal: 2700 },
    { s: ['Excel avanzado', 'SQL', 'Power BI'], n: 150, sal: 3300 },
    { s: ['Excel avanzado', 'SQL', 'Power BI', 'Comunicar resultados'], n: 120, sal: 3800 },
    { s: ['Excel avanzado', 'SQL', 'Power BI', 'Python'], n: 100, sal: 4200 },
    { s: ['Excel avanzado', 'SQL', 'Power BI', 'Python', 'Estadística', 'Comunicar resultados'], n: 72, sal: 4900 },
    { s: ['SQL', 'Python'], n: 70, sal: 3600 },
    { s: ['Excel avanzado', 'SQL', 'Estadística'], n: 50, sal: 3000 },
  ],
};

// Candidatas del greedy por rol: las que se pueden aprender y mueven el %.
export const CANDIDATAS = {
  'desarrollador-backend-jr': ['APIs REST', 'Docker', 'Cloud (AWS/Azure)', 'SQL', 'Git', 'Java', 'Node.js'],
  'desarrollador-frontend-jr': ['React', 'TypeScript', 'Git', 'Figma', 'JavaScript', 'HTML y CSS'],
  'analista-qa': ['Automatización con Selenium', 'Pruebas de API', 'SQL', 'Jira', 'Pruebas funcionales'],
  'analista-datos-jr': ['SQL', 'Power BI', 'Python', 'Excel avanzado', 'Estadística', 'Comunicar resultados'],
};

/* ═══════════════════════════════════════════════════════════════════
   OFERTAS · 8 avisos por rol, cada uno con sus requisitos y la frase
   literal de cada requisito. Es el activo que sostiene el matchmaker,
   el detalle, el panel del chat y el adaptador de CV.
   t: 'O' obligatorio · 'D' deseable
   ═══════════════════════════════════════════════════════════════════ */
export const OFERTAS = [
  // ── Backend junior (los 6 del prototipo, sin reescribir, más 2) ──
  { id: 'b1', rol: 'desarrollador-backend-jr', empresa: 'Logística Pacífico', puesto: 'Programador Java junior', ciudad: 'Arequipa', modalidad: 'Presencial', sueldo: 'S/ 2,600 – 3,000', portal: 'Bumeran', dias: 2, req: [
    { k: 'Java', t: 'O', n: 'Intermedio', f: 'Mantener y mejorar el sistema de despacho escrito en Java 11.' },
    { k: 'SQL', t: 'O', n: 'Básico', f: 'Consultas en Oracle para reportes de rutas y entregas.' },
    { k: 'Git', t: 'O', n: 'Básico', f: 'Versionar cambios en el repositorio del equipo.' },
    { k: 'Docker', t: 'D', n: 'Básico', f: 'Deseable: conocer Docker para levantar el ambiente local.' },
    { k: 'Spring Boot', t: 'D', n: 'Básico', f: 'Deseable: haber usado Spring Boot en algún proyecto.' },
  ] },
  { id: 'b2', rol: 'desarrollador-backend-jr', empresa: 'Banco del Altiplano', puesto: 'Practicante de desarrollo de software', ciudad: 'Lima', modalidad: 'Presencial', sueldo: 'S/ 1,500', portal: 'Computrabajo', dias: 1, req: [
    { k: 'Java', t: 'O', n: 'Básico', f: 'Apoyar en el desarrollo de módulos internos en Java.' },
    { k: 'SQL', t: 'O', n: 'Básico', f: 'Elaborar consultas SQL para validar datos de clientes.' },
    { k: 'Git', t: 'D', n: 'Básico', f: 'Deseable: manejo de Git.' },
    { k: 'APIs REST', t: 'D', n: 'Básico', f: 'Deseable: haber consumido servicios REST.' },
  ] },
  { id: 'b3', rol: 'desarrollador-backend-jr', empresa: 'Fintech Andina', puesto: 'Desarrollador Backend junior (Java)', ciudad: 'Lima', modalidad: 'Híbrido', sueldo: 'S/ 3,200 – 3,800', portal: 'Computrabajo', dias: 3, req: [
    { k: 'Java', t: 'O', n: 'Intermedio', f: 'Desarrollar y mantener microservicios en Java 17 con Spring Boot para el core de pagos.' },
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'Escribir consultas y procedimientos en PostgreSQL para la conciliación diaria.' },
    { k: 'Git', t: 'O', n: 'Básico', f: 'Trabajar con Git Flow y revisiones de código en GitLab.' },
    { k: 'APIs REST', t: 'O', n: 'Intermedio', f: 'Diseñar y documentar endpoints REST (OpenAPI) que consume la app móvil.' },
    { k: 'Docker', t: 'D', n: 'Básico', f: 'Deseable: empaquetar servicios en contenedores para los ambientes de QA.' },
    { k: 'Inglés intermedio', t: 'D', n: 'Intermedio', f: 'Deseable: leer documentación técnica en inglés.' },
  ] },
  { id: 'b4', rol: 'desarrollador-backend-jr', empresa: 'Kallpa Digital', puesto: 'Desarrollador Backend junior (Python)', ciudad: 'Arequipa', modalidad: 'Remoto', sueldo: 'S/ 2,800 – 3,300', portal: 'LinkedIn', dias: 5, req: [
    { k: 'Python', t: 'O', n: 'Intermedio', f: 'Construir servicios en Python (FastAPI) para clientes de retail.' },
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'Modelar tablas y optimizar consultas en MySQL.' },
    { k: 'Git', t: 'O', n: 'Básico', f: 'Flujo de trabajo con ramas y pull requests en GitHub.' },
    { k: 'APIs REST', t: 'O', n: 'Intermedio', f: 'Exponer y versionar APIs REST para la app de pedidos.' },
    { k: 'Docker', t: 'D', n: 'Básico', f: 'Deseable: desplegar con Docker Compose.' },
  ] },
  { id: 'b5', rol: 'desarrollador-backend-jr', empresa: 'Grupo Retail Sur', puesto: 'Desarrollador Backend junior', ciudad: 'Lima', modalidad: 'Híbrido', sueldo: 'S/ 3,500 – 4,200', portal: 'Bumeran', dias: 1, req: [
    { k: 'Java', t: 'O', n: 'Intermedio', f: 'Desarrollar servicios de inventario en Java con Spring.' },
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'Consultas sobre SQL Server para el stock por tienda.' },
    { k: 'APIs REST', t: 'O', n: 'Intermedio', f: 'Integrar la plataforma de e-commerce vía APIs REST.' },
    { k: 'Docker', t: 'O', n: 'Básico', f: 'Contenerizar las APIs para desplegarlas en el clúster de la empresa.' },
    { k: 'Cloud (AWS/Azure)', t: 'D', n: 'Básico', f: 'Deseable: experiencia con servicios de Azure.' },
  ] },
  { id: 'b6', rol: 'desarrollador-backend-jr', empresa: 'Inti Cloud', puesto: 'Desarrollador Node.js junior', ciudad: 'Lima', modalidad: 'Remoto', sueldo: 'S/ 3,800 – 4,500', portal: 'LinkedIn', dias: 4, req: [
    { k: 'Node.js', t: 'O', n: 'Intermedio', f: 'Desarrollar APIs en Node.js con Express y TypeScript.' },
    { k: 'SQL', t: 'O', n: 'Básico', f: 'Consultas en PostgreSQL.' },
    { k: 'Git', t: 'O', n: 'Básico', f: 'Revisiones de código en GitHub.' },
    { k: 'APIs REST', t: 'O', n: 'Intermedio', f: 'Diseñar endpoints REST para integraciones con pasarelas de pago.' },
    // El prototipo decía solo "Deseable: Docker.": entre comillas angulares, en
    // el detalle de la oferta, eso se lee como maqueta sin terminar.
    { k: 'Docker', t: 'D', n: 'Básico', f: 'Deseable: Docker para levantar los servicios en tu máquina.' },
    { k: 'Cloud (AWS/Azure)', t: 'D', n: 'Básico', f: 'Deseable: haber desplegado algo en AWS (Lambda, S3).' },
  ] },
  { id: 'b7', rol: 'desarrollador-backend-jr', empresa: 'Seguros Costa', puesto: 'Desarrollador junior de integraciones', ciudad: 'Lima', modalidad: 'Híbrido', sueldo: 'S/ 3,000 – 3,600', portal: 'Bumeran', dias: 6, req: [
    { k: 'Java', t: 'O', n: 'Básico', f: 'Mantener los procesos batch de pólizas escritos en Java 8.' },
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'Consultas y vistas en Oracle para el área de siniestros.' },
    { k: 'APIs REST', t: 'O', n: 'Básico', f: 'Consumir las APIs REST de las clínicas afiliadas.' },
    { k: 'Cloud (AWS/Azure)', t: 'D', n: 'Básico', f: 'Deseable: desplegar servicios en AWS (EC2, RDS) con apoyo del equipo de infraestructura.' },
  ] },
  { id: 'b8', rol: 'desarrollador-backend-jr', empresa: 'Yanapay', puesto: 'Backend junior · billetera digital', ciudad: 'Remoto', modalidad: 'Remoto', sueldo: 'S/ 4,000 – 4,800', portal: 'LinkedIn', dias: 8, req: [
    { k: 'Node.js', t: 'O', n: 'Intermedio', f: 'Mantener los servicios de la billetera en Node.js con NestJS.' },
    { k: 'APIs REST', t: 'O', n: 'Intermedio', f: 'Versionar las APIs REST que consumen los comercios afiliados.' },
    { k: 'Docker', t: 'O', n: 'Intermedio', f: 'Cada servicio viaja en su propia imagen Docker.' },
    { k: 'Cloud (AWS/Azure)', t: 'O', n: 'Básico', f: 'Operar lo que escribes en AWS: ECS, RDS y colas SQS.' },
    { k: 'SQL', t: 'D', n: 'Intermedio', f: 'Deseable: PostgreSQL para la conciliación de saldos.' },
  ] },

  // ── Frontend junior ──
  { id: 'f1', rol: 'desarrollador-frontend-jr', empresa: 'Estudio Mantaro', puesto: 'Practicante de desarrollo web', ciudad: 'Arequipa', modalidad: 'Presencial', sueldo: 'S/ 1,400', portal: 'Computrabajo', dias: 2, req: [
    { k: 'HTML y CSS', t: 'O', n: 'Básico', f: 'Maquetar las páginas de campaña a partir del diseño entregado.' },
    { k: 'JavaScript', t: 'O', n: 'Básico', f: 'Agregar interacciones simples con JavaScript: carruseles, validaciones de formulario.' },
    { k: 'Figma', t: 'D', n: 'Básico', f: 'Deseable: leer el diseño en Figma y sacar medidas sin preguntar.' },
    { k: 'Git', t: 'D', n: 'Básico', f: 'Deseable: Git para que tus cambios no se pisen con los del equipo.' },
  ] },
  { id: 'f2', rol: 'desarrollador-frontend-jr', empresa: 'Tiendas Nazca', puesto: 'Desarrollador Frontend junior', ciudad: 'Lima', modalidad: 'Híbrido', sueldo: 'S/ 2,800 – 3,300', portal: 'Bumeran', dias: 1, req: [
    { k: 'HTML y CSS', t: 'O', n: 'Intermedio', f: 'Maquetar vistas responsive del catálogo con CSS Grid y Flexbox.' },
    { k: 'JavaScript', t: 'O', n: 'Intermedio', f: 'JavaScript moderno: módulos, promesas y fetch contra nuestra API.' },
    { k: 'Git', t: 'O', n: 'Básico', f: 'Ramas y pull requests en GitHub para cada cambio de tienda.' },
    { k: 'React', t: 'D', n: 'Básico', f: 'Deseable: haber hecho algo en React, aunque sea un proyecto de curso.' },
  ] },
  { id: 'f3', rol: 'desarrollador-frontend-jr', empresa: 'Fintech Andina', puesto: 'Frontend junior (React)', ciudad: 'Lima', modalidad: 'Híbrido', sueldo: 'S/ 3,400 – 4,000', portal: 'Computrabajo', dias: 3, req: [
    { k: 'React', t: 'O', n: 'Intermedio', f: 'Construir componentes en React con hooks para el panel de pagos.' },
    { k: 'JavaScript', t: 'O', n: 'Intermedio', f: 'JavaScript ES2022: destructuring, async/await, manejo de errores.' },
    { k: 'HTML y CSS', t: 'O', n: 'Intermedio', f: 'Respetar el sistema de diseño: tokens de color y escala tipográfica.' },
    { k: 'Git', t: 'O', n: 'Básico', f: 'Revisión de código en GitLab antes de cada despliegue.' },
    { k: 'TypeScript', t: 'D', n: 'Básico', f: 'Deseable: estamos migrando a TypeScript y te tocará escribir tipos.' },
  ] },
  { id: 'f4', rol: 'desarrollador-frontend-jr', empresa: 'Inti Cloud', puesto: 'Frontend junior · panel de clientes', ciudad: 'Remoto', modalidad: 'Remoto', sueldo: 'S/ 3,900 – 4,600', portal: 'LinkedIn', dias: 4, req: [
    { k: 'React', t: 'O', n: 'Intermedio', f: 'Pantallas del panel en React con React Router y estado compartido.' },
    { k: 'TypeScript', t: 'O', n: 'Intermedio', f: 'Todo el frontend está en TypeScript: tipar props y respuestas de la API.' },
    { k: 'JavaScript', t: 'O', n: 'Intermedio', f: 'Fundamentos sólidos de JavaScript antes de los tipos.' },
    { k: 'HTML y CSS', t: 'O', n: 'Intermedio', f: 'CSS moderno sin framework: variables, grid y contenedores.' },
    { k: 'Git', t: 'O', n: 'Básico', f: 'Un pull request por tarea, revisado por el equipo.' },
    { k: 'Figma', t: 'D', n: 'Básico', f: 'Deseable: trabajar directo contra el archivo de Figma del producto.' },
  ] },
  { id: 'f5', rol: 'desarrollador-frontend-jr', empresa: 'Municipalidad de Trujillo', puesto: 'Desarrollador web junior', ciudad: 'Trujillo', modalidad: 'Presencial', sueldo: 'S/ 2,500 – 2,900', portal: 'Computrabajo', dias: 7, req: [
    { k: 'HTML y CSS', t: 'O', n: 'Intermedio', f: 'Mantener el portal de trámites y que cumpla accesibilidad.' },
    { k: 'JavaScript', t: 'O', n: 'Básico', f: 'Validaciones y formularios en JavaScript sin dependencias.' },
    { k: 'Git', t: 'D', n: 'Básico', f: 'Deseable: Git para versionar el portal.' },
  ] },
  { id: 'f6', rol: 'desarrollador-frontend-jr', empresa: 'Estudio Mantaro', puesto: 'Frontend junior con diseño', ciudad: 'Arequipa', modalidad: 'Híbrido', sueldo: 'S/ 3,000 – 3,500', portal: 'Bumeran', dias: 5, req: [
    { k: 'React', t: 'O', n: 'Básico', f: 'Las landings de clientes se arman con componentes en React.' },
    { k: 'HTML y CSS', t: 'O', n: 'Intermedio', f: 'Animaciones y transiciones en CSS, sin librerías.' },
    { k: 'Figma', t: 'O', n: 'Intermedio', f: 'Tomar el diseño de Figma y llevarlo a código sin perder el detalle.' },
    { k: 'JavaScript', t: 'O', n: 'Intermedio', f: 'JavaScript para la interacción de cada pieza.' },
  ] },
  { id: 'f7', rol: 'desarrollador-frontend-jr', empresa: 'Grupo Retail Sur', puesto: 'Frontend junior · e-commerce', ciudad: 'Lima', modalidad: 'Híbrido', sueldo: 'S/ 3,200 – 3,800', portal: 'Bumeran', dias: 2, req: [
    { k: 'JavaScript', t: 'O', n: 'Intermedio', f: 'La tienda corre sobre JavaScript propio: hay que entenderlo antes de tocarlo.' },
    { k: 'HTML y CSS', t: 'O', n: 'Intermedio', f: 'Plantillas del catálogo y del checkout, responsive.' },
    { k: 'React', t: 'O', n: 'Básico', f: 'El carrito nuevo está en React y lo vas a mantener.' },
    { k: 'Git', t: 'O', n: 'Básico', f: 'Versionar en GitHub con revisión previa.' },
    { k: 'TypeScript', t: 'D', n: 'Básico', f: 'Deseable: TypeScript para el carrito nuevo.' },
  ] },
  { id: 'f8', rol: 'desarrollador-frontend-jr', empresa: 'Yanapay', puesto: 'Frontend junior · app de pagos', ciudad: 'Remoto', modalidad: 'Remoto', sueldo: 'S/ 4,000 – 4,700', portal: 'LinkedIn', dias: 9, req: [
    { k: 'React', t: 'O', n: 'Intermedio', f: 'La app de comercios es React con TypeScript de punta a punta.' },
    { k: 'TypeScript', t: 'O', n: 'Intermedio', f: 'Tipos estrictos: nada de `any` en el código de pagos.' },
    { k: 'JavaScript', t: 'O', n: 'Intermedio', f: 'Base de JavaScript para entender qué compila TypeScript.' },
    { k: 'Git', t: 'O', n: 'Intermedio', f: 'Git con rebase y commits que se entienden solos.' },
    { k: 'Figma', t: 'D', n: 'Básico', f: 'Deseable: el diseño vive en Figma y se actualiza cada semana.' },
  ] },

  // ── Analista QA ──
  { id: 'q1', rol: 'analista-qa', empresa: 'Banco del Altiplano', puesto: 'Practicante de calidad de software', ciudad: 'Lima', modalidad: 'Presencial', sueldo: 'S/ 1,500', portal: 'Computrabajo', dias: 2, req: [
    { k: 'Pruebas funcionales', t: 'O', n: 'Básico', f: 'Ejecutar los casos de prueba del canal web y registrar los resultados.' },
    { k: 'Jira', t: 'D', n: 'Básico', f: 'Deseable: haber reportado incidencias en Jira.' },
    { k: 'SQL', t: 'D', n: 'Básico', f: 'Deseable: consultas simples para revisar si el dato se guardó.' },
    { k: 'Excel avanzado', t: 'D', n: 'Básico', f: 'Deseable: llevar la matriz de casos en Excel.' },
  ] },
  { id: 'q2', rol: 'analista-qa', empresa: 'Fintech Andina', puesto: 'Analista QA junior', ciudad: 'Lima', modalidad: 'Híbrido', sueldo: 'S/ 2,900 – 3,400', portal: 'Computrabajo', dias: 1, req: [
    { k: 'Pruebas funcionales', t: 'O', n: 'Intermedio', f: 'Diseñar y ejecutar casos de prueba para el core de pagos, con evidencias.' },
    { k: 'Jira', t: 'O', n: 'Básico', f: 'Registrar y hacer seguimiento de defectos en Jira hasta su cierre.' },
    { k: 'SQL', t: 'O', n: 'Básico', f: 'Consultas en PostgreSQL para validar que el dato quedó como debía.' },
    { k: 'Automatización con Selenium', t: 'D', n: 'Básico', f: 'Deseable: haber automatizado algún flujo con Selenium.' },
  ] },
  { id: 'q3', rol: 'analista-qa', empresa: 'Grupo Retail Sur', puesto: 'Analista de pruebas junior', ciudad: 'Lima', modalidad: 'Híbrido', sueldo: 'S/ 3,100 – 3,600', portal: 'Bumeran', dias: 3, req: [
    { k: 'Pruebas funcionales', t: 'O', n: 'Intermedio', f: 'Plan de pruebas de cada release del e-commerce, con criterios de aceptación.' },
    { k: 'Jira', t: 'O', n: 'Intermedio', f: 'Jira y Xray: casos, ejecuciones y trazabilidad con las historias.' },
    { k: 'Automatización con Selenium', t: 'O', n: 'Básico', f: 'Mantener la suite de regresión en Selenium WebDriver con Java.' },
    { k: 'SQL', t: 'D', n: 'Básico', f: 'Deseable: SQL Server para revisar el stock después de cada prueba.' },
  ] },
  { id: 'q4', rol: 'analista-qa', empresa: 'Inti Cloud', puesto: 'QA Engineer junior', ciudad: 'Remoto', modalidad: 'Remoto', sueldo: 'S/ 3,800 – 4,400', portal: 'LinkedIn', dias: 4, req: [
    { k: 'Automatización con Selenium', t: 'O', n: 'Intermedio', f: 'La regresión corre sola en cada despliegue: Selenium Grid sobre contenedores.' },
    { k: 'Pruebas de API', t: 'O', n: 'Intermedio', f: 'Probar las APIs REST con Postman y colecciones versionadas en el repo.' },
    { k: 'Pruebas funcionales', t: 'O', n: 'Intermedio', f: 'Diseñar los casos antes de automatizarlos, no al revés.' },
    { k: 'Jira', t: 'O', n: 'Básico', f: 'Defectos en Jira, con pasos y evidencia.' },
    { k: 'SQL', t: 'D', n: 'Básico', f: 'Deseable: consultas para preparar datos de prueba.' },
  ] },
  { id: 'q5', rol: 'analista-qa', empresa: 'Seguros Costa', puesto: 'Analista QA junior · pólizas', ciudad: 'Lima', modalidad: 'Presencial', sueldo: 'S/ 2,700 – 3,200', portal: 'Bumeran', dias: 6, req: [
    { k: 'Pruebas funcionales', t: 'O', n: 'Intermedio', f: 'Certificar los cálculos de prima antes de cada pase a producción.' },
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'Consultas en Oracle para cuadrar los montos que arroja el sistema.' },
    { k: 'Jira', t: 'O', n: 'Básico', f: 'Seguimiento de defectos en Jira con el equipo de desarrollo.' },
  ] },
  { id: 'q6', rol: 'analista-qa', empresa: 'Kallpa Digital', puesto: 'QA junior · automatización', ciudad: 'Arequipa', modalidad: 'Remoto', sueldo: 'S/ 3,000 – 3,500', portal: 'LinkedIn', dias: 5, req: [
    { k: 'Automatización con Selenium', t: 'O', n: 'Intermedio', f: 'Escribir y mantener pruebas automatizadas con Selenium y pytest.' },
    { k: 'Pruebas funcionales', t: 'O', n: 'Intermedio', f: 'Saber qué vale la pena automatizar y qué se prueba a mano.' },
    { k: 'Jira', t: 'O', n: 'Básico', f: 'Jira para el tablero del equipo y los defectos.' },
    { k: 'Pruebas de API', t: 'D', n: 'Básico', f: 'Deseable: probar endpoints REST con Postman.' },
  ] },
  { id: 'q7', rol: 'analista-qa', empresa: 'Municipalidad de Trujillo', puesto: 'Analista de pruebas', ciudad: 'Trujillo', modalidad: 'Presencial', sueldo: 'S/ 2,400 – 2,800', portal: 'Computrabajo', dias: 8, req: [
    { k: 'Pruebas funcionales', t: 'O', n: 'Básico', f: 'Probar el portal de trámites antes de cada actualización.' },
    { k: 'Excel avanzado', t: 'O', n: 'Básico', f: 'Llevar la matriz de casos y el reporte de avance en Excel.' },
    { k: 'Jira', t: 'D', n: 'Básico', f: 'Deseable: Jira o cualquier gestor de incidencias.' },
    { k: 'SQL', t: 'D', n: 'Básico', f: 'Deseable: SQL para verificar los trámites registrados.' },
  ] },
  { id: 'q8', rol: 'analista-qa', empresa: 'Yanapay', puesto: 'QA junior · billetera digital', ciudad: 'Remoto', modalidad: 'Remoto', sueldo: 'S/ 4,000 – 4,600', portal: 'LinkedIn', dias: 10, req: [
    { k: 'Pruebas de API', t: 'O', n: 'Intermedio', f: 'El 80% de lo que probamos son APIs REST: Postman, Newman y contratos.' },
    { k: 'Automatización con Selenium', t: 'O', n: 'Intermedio', f: 'La app de comercios se prueba automatizada con Selenium.' },
    { k: 'Pruebas funcionales', t: 'O', n: 'Intermedio', f: 'Casos de borde de dinero: redondeos, reversas, doble cobro.' },
    { k: 'Jira', t: 'O', n: 'Intermedio', f: 'Jira con tablero propio de calidad y métricas de escape.' },
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'Consultas de conciliación en PostgreSQL para validar cada movimiento.' },
  ] },

  // ── Analista de datos junior ──
  { id: 'd1', rol: 'analista-datos-jr', empresa: 'Tiendas Nazca', puesto: 'Practicante de análisis comercial', ciudad: 'Lima', modalidad: 'Presencial', sueldo: 'S/ 1,500', portal: 'Computrabajo', dias: 1, req: [
    { k: 'Excel avanzado', t: 'O', n: 'Intermedio', f: 'Tablas dinámicas y BUSCARV para el reporte semanal de ventas por tienda.' },
    { k: 'Comunicar resultados', t: 'O', n: 'Básico', f: 'Presentar el reporte semanal al jefe comercial en diez minutos.' },
    { k: 'SQL', t: 'D', n: 'Básico', f: 'Deseable: consultas básicas para sacar el dato sin pedirlo a sistemas.' },
    { k: 'Power BI', t: 'D', n: 'Básico', f: 'Deseable: haber visto Power BI, aunque sea en un curso.' },
  ] },
  { id: 'd2', rol: 'analista-datos-jr', empresa: 'Grupo Retail Sur', puesto: 'Analista de datos junior', ciudad: 'Lima', modalidad: 'Híbrido', sueldo: 'S/ 2,800 – 3,300', portal: 'Bumeran', dias: 2, req: [
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'Consultas y vistas en SQL Server para el tablero de ventas diarias.' },
    { k: 'Excel avanzado', t: 'O', n: 'Intermedio', f: 'Tablas dinámicas y Power Query para cerrar el mes.' },
    { k: 'Power BI', t: 'O', n: 'Básico', f: 'Mantener los tableros de Power BI que ve la gerencia comercial.' },
    { k: 'Comunicar resultados', t: 'D', n: 'Básico', f: 'Deseable: presentar los hallazgos a jefaturas sin tecnicismos.' },
  ] },
  { id: 'd3', rol: 'analista-datos-jr', empresa: 'Fintech Andina', puesto: 'Analista de datos junior · riesgo', ciudad: 'Lima', modalidad: 'Híbrido', sueldo: 'S/ 3,300 – 3,900', portal: 'Computrabajo', dias: 3, req: [
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'Consultas en PostgreSQL sobre el histórico de transacciones.' },
    { k: 'Python', t: 'O', n: 'Básico', f: 'pandas para limpiar y cruzar los archivos de los bureaus de crédito.' },
    { k: 'Power BI', t: 'O', n: 'Básico', f: 'Tablero de mora por cosecha, actualizado cada semana.' },
    { k: 'Excel avanzado', t: 'O', n: 'Intermedio', f: 'Excel sigue siendo el idioma del área de riesgos.' },
    { k: 'Estadística', t: 'D', n: 'Básico', f: 'Deseable: entender qué es una distribución y cuándo una diferencia es ruido.' },
  ] },
  { id: 'd4', rol: 'analista-datos-jr', empresa: 'Inti Cloud', puesto: 'Data Analyst junior', ciudad: 'Remoto', modalidad: 'Remoto', sueldo: 'S/ 3,900 – 4,600', portal: 'LinkedIn', dias: 4, req: [
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'SQL es la herramienta principal: CTEs, ventanas y agregaciones.' },
    { k: 'Python', t: 'O', n: 'Intermedio', f: 'pandas y matplotlib para los análisis que no caben en un tablero.' },
    { k: 'Power BI', t: 'O', n: 'Intermedio', f: 'Modelo semántico en Power BI y medidas en DAX.' },
    { k: 'Comunicar resultados', t: 'O', n: 'Intermedio', f: 'Cada análisis termina en una recomendación escrita, no en un gráfico.' },
    { k: 'Estadística', t: 'D', n: 'Intermedio', f: 'Deseable: pruebas de hipótesis para los experimentos de producto.' },
    { k: 'Excel avanzado', t: 'D', n: 'Básico', f: 'Deseable: Excel para lo que piden las áreas.' },
  ] },
  { id: 'd5', rol: 'analista-datos-jr', empresa: 'Seguros Costa', puesto: 'Analista de información junior', ciudad: 'Lima', modalidad: 'Presencial', sueldo: 'S/ 2,600 – 3,100', portal: 'Bumeran', dias: 6, req: [
    { k: 'Excel avanzado', t: 'O', n: 'Intermedio', f: 'Reportes de siniestralidad en Excel, con tablas dinámicas y macros simples.' },
    { k: 'SQL', t: 'O', n: 'Básico', f: 'Consultas en Oracle para extraer la data de pólizas.' },
    { k: 'Estadística', t: 'O', n: 'Básico', f: 'Promedios, medianas y percentiles aplicados a la siniestralidad.' },
  ] },
  { id: 'd6', rol: 'analista-datos-jr', empresa: 'Kallpa Digital', puesto: 'Analista de datos junior', ciudad: 'Arequipa', modalidad: 'Remoto', sueldo: 'S/ 3,000 – 3,500', portal: 'LinkedIn', dias: 5, req: [
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'Consultas en MySQL para los reportes de los clientes de retail.' },
    { k: 'Power BI', t: 'O', n: 'Intermedio', f: 'Un tablero por cliente, con su propio modelo de datos.' },
    { k: 'Excel avanzado', t: 'O', n: 'Intermedio', f: 'Power Query para los archivos que llegan por correo.' },
    { k: 'Comunicar resultados', t: 'D', n: 'Básico', f: 'Deseable: explicar el tablero al cliente en una llamada de 20 minutos.' },
  ] },
  { id: 'd7', rol: 'analista-datos-jr', empresa: 'Municipalidad de Trujillo', puesto: 'Analista de estadística', ciudad: 'Trujillo', modalidad: 'Presencial', sueldo: 'S/ 2,500 – 2,900', portal: 'Computrabajo', dias: 9, req: [
    { k: 'Excel avanzado', t: 'O', n: 'Intermedio', f: 'Consolidar los padrones en Excel y publicar el resumen mensual.' },
    { k: 'Estadística', t: 'O', n: 'Intermedio', f: 'Indicadores de población y muestreo para las encuestas distritales.' },
    { k: 'SQL', t: 'D', n: 'Básico', f: 'Deseable: SQL para consultar la base de contribuyentes.' },
  ] },
  { id: 'd8', rol: 'analista-datos-jr', empresa: 'Yanapay', puesto: 'Analista de datos junior · producto', ciudad: 'Remoto', modalidad: 'Remoto', sueldo: 'S/ 4,100 – 4,900', portal: 'LinkedIn', dias: 11, req: [
    { k: 'SQL', t: 'O', n: 'Intermedio', f: 'Toda la métrica de producto se calcula en SQL sobre el data warehouse.' },
    { k: 'Python', t: 'O', n: 'Intermedio', f: 'Python para los análisis de cohortes y la detección de fraude temprano.' },
    { k: 'Power BI', t: 'O', n: 'Intermedio', f: 'Tableros de adopción por comercio, en Power BI.' },
    { k: 'Estadística', t: 'O', n: 'Intermedio', f: 'Diseñar y leer pruebas A/B sin confundir ruido con resultado.' },
    { k: 'Comunicar resultados', t: 'O', n: 'Intermedio', f: 'Escribir el memo que decide si una función se queda o se retira.' },
    { k: 'Excel avanzado', t: 'D', n: 'Básico', f: 'Deseable: Excel para lo que pide finanzas.' },
  ] },
];

/* ═══════════════════════════════════════════════════════════════════
   EVIDENCIA · por rol y skill de display: qué piden exactamente.
   El CONTEO no se guarda: se deriva de `pct` del catálogo y del universo
   de ofertas de las ciudades elegidas (§7.11), para que el chat y el
   diagnóstico no puedan decir cifras distintas del mismo rol.

   Las frases son del mercado, no solo de los 8 avisos cargados: alguna
   cita una empresa que no está en OFERTAS. Por eso los fragmentos son
   texto y no enlaces (§9.4).
   ═══════════════════════════════════════════════════════════════════ */
export const EVIDENCIA = {
  'desarrollador-backend-jr': {
    'Java o Node.js': { resumen: 'Casi todas piden Java con Spring Boot. Node.js aparece sobre todo en startups con trabajo remoto.', frags: [
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Desarrollar y mantener microservicios en Java 17 con Spring Boot para el core de pagos.' },
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'Desarrollar APIs en Node.js con Express y TypeScript.' },
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'Desarrollar servicios de inventario en Java con Spring.' },
    ] },
    'SQL': { resumen: 'Piden escribir consultas y procedimientos, no administrar bases de datos.', frags: [
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Escribir consultas y procedimientos en PostgreSQL para la conciliación diaria.' },
      { empresa: 'Kallpa Digital', portal: 'LinkedIn', f: 'Modelar tablas y optimizar consultas en MySQL.' },
      { empresa: 'Banco del Altiplano', portal: 'Computrabajo', f: 'Elaborar consultas SQL para validar datos de clientes.' },
    ] },
    'APIs REST': { resumen: 'En la mayoría es obligatorio. Piden diseñar y documentar endpoints, no solo consumirlos.', frags: [
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Diseñar y documentar endpoints REST (OpenAPI) que consume la app móvil.' },
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'Diseñar endpoints REST para integraciones con pasarelas de pago.' },
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'Integrar la plataforma de e-commerce vía APIs REST.' },
    ] },
    'Git': { resumen: 'Ramas, pull requests y revisión de código en equipo.', frags: [
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Trabajar con Git Flow y revisiones de código en GitLab.' },
      { empresa: 'Kallpa Digital', portal: 'LinkedIn', f: 'Flujo de trabajo con ramas y pull requests en GitHub.' },
    ] },
    'Docker': { resumen: 'No piden administrar clusters de Kubernetes: piden contenerizar APIs en Spring Boot o Node.', frags: [
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'Contenerizar las APIs para desplegarlas en el clúster de la empresa.' },
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Deseable: empaquetar servicios en contenedores para los ambientes de QA.' },
    ] },
    'Cloud (AWS/Azure)': { resumen: 'Casi siempre aparece como deseable. No piden administrar infraestructura: piden haber desplegado una API.', frags: [
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'Deseable: haber desplegado algo en AWS (Lambda, S3).' },
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'Deseable: experiencia con servicios de Azure.' },
      { empresa: 'Seguros Costa', portal: 'Bumeran', f: 'Deseable: desplegar servicios en AWS (EC2, RDS) con apoyo del equipo de infraestructura.' },
    ] },
  },
  'desarrollador-frontend-jr': {
    'JavaScript': { resumen: 'Es la base de todo y nadie la salta: piden JavaScript moderno antes que cualquier framework.', frags: [
      { empresa: 'Tiendas Nazca', portal: 'Bumeran', f: 'JavaScript moderno: módulos, promesas y fetch contra nuestra API.' },
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'JavaScript ES2022: destructuring, async/await, manejo de errores.' },
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'La tienda corre sobre JavaScript propio: hay que entenderlo antes de tocarlo.' },
    ] },
    'HTML y CSS': { resumen: 'Piden maquetar responsive a mano, con grid y flexbox, no arrastrar componentes de una librería.', frags: [
      { empresa: 'Tiendas Nazca', portal: 'Bumeran', f: 'Maquetar vistas responsive del catálogo con CSS Grid y Flexbox.' },
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'CSS moderno sin framework: variables, grid y contenedores.' },
      { empresa: 'Municipalidad de Trujillo', portal: 'Computrabajo', f: 'Mantener el portal de trámites y que cumpla accesibilidad.' },
    ] },
    'React': { resumen: 'Es el framework por defecto. En los junior piden componentes y hooks, no arquitectura.', frags: [
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Construir componentes en React con hooks para el panel de pagos.' },
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'Pantallas del panel en React con React Router y estado compartido.' },
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'El carrito nuevo está en React y lo vas a mantener.' },
    ] },
    'Git': { resumen: 'Un pull request por tarea y revisión antes de desplegar. Es la forma de trabajar, no una herramienta más.', frags: [
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'Un pull request por tarea, revisado por el equipo.' },
      { empresa: 'Yanapay', portal: 'LinkedIn', f: 'Git con rebase y commits que se entienden solos.' },
    ] },
    'TypeScript': { resumen: 'La skill que más crece del rol. Casi nadie la pide como obligatoria todavía, y ahí está la ventaja.', frags: [
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'Todo el frontend está en TypeScript: tipar props y respuestas de la API.' },
      { empresa: 'Yanapay', portal: 'LinkedIn', f: 'Tipos estrictos: nada de `any` en el código de pagos.' },
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Deseable: estamos migrando a TypeScript y te tocará escribir tipos.' },
    ] },
    'Figma': { resumen: 'No piden diseñar: piden leer el archivo y sacar medidas y tokens sin preguntar.', frags: [
      { empresa: 'Estudio Mantaro', portal: 'Bumeran', f: 'Tomar el diseño de Figma y llevarlo a código sin perder el detalle.' },
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'Deseable: trabajar directo contra el archivo de Figma del producto.' },
    ] },
  },
  'analista-qa': {
    'Pruebas funcionales': { resumen: 'Es la base del rol: diseñar casos y dejar evidencia, no solo "probar hasta que falle".', frags: [
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Diseñar y ejecutar casos de prueba para el core de pagos, con evidencias.' },
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'Plan de pruebas de cada release del e-commerce, con criterios de aceptación.' },
      { empresa: 'Yanapay', portal: 'LinkedIn', f: 'Casos de borde de dinero: redondeos, reversas, doble cobro.' },
    ] },
    'Jira': { resumen: 'Lo piden casi todas y se aprende en una tarde: reportar un defecto con pasos y evidencia.', frags: [
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Registrar y hacer seguimiento de defectos en Jira hasta su cierre.' },
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'Jira y Xray: casos, ejecuciones y trazabilidad con las historias.' },
    ] },
    'SQL': { resumen: 'Para QA el SQL es de lectura: validar que el dato quedó como el caso de prueba esperaba.', frags: [
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Consultas en PostgreSQL para validar que el dato quedó como debía.' },
      { empresa: 'Seguros Costa', portal: 'Bumeran', f: 'Consultas en Oracle para cuadrar los montos que arroja el sistema.' },
      { empresa: 'Yanapay', portal: 'LinkedIn', f: 'Consultas de conciliación en PostgreSQL para validar cada movimiento.' },
    ] },
    'Automatización con Selenium': { resumen: 'Es el salto de sueldo del rol: la regresión que antes se hacía a mano ahora corre sola.', frags: [
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'Mantener la suite de regresión en Selenium WebDriver con Java.' },
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'La regresión corre sola en cada despliegue: Selenium Grid sobre contenedores.' },
      { empresa: 'Kallpa Digital', portal: 'LinkedIn', f: 'Escribir y mantener pruebas automatizadas con Selenium y pytest.' },
    ] },
    'Pruebas de API': { resumen: 'La que menos gente tiene y la que más piden los remotos: Postman y contratos, no interfaz.', frags: [
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'Probar las APIs REST con Postman y colecciones versionadas en el repo.' },
      { empresa: 'Yanapay', portal: 'LinkedIn', f: 'El 80% de lo que probamos son APIs REST: Postman, Newman y contratos.' },
    ] },
  },
  'analista-datos-jr': {
    'SQL': { resumen: 'La skill que más crece del rol y la que aparece primero en cada aviso. Piden consultas, no administrar la base.', frags: [
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'SQL es la herramienta principal: CTEs, ventanas y agregaciones.' },
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'Consultas y vistas en SQL Server para el tablero de ventas diarias.' },
      { empresa: 'Yanapay', portal: 'LinkedIn', f: 'Toda la métrica de producto se calcula en SQL sobre el data warehouse.' },
    ] },
    'Excel avanzado': { resumen: 'Sigue siendo el idioma de las áreas que piden el dato. Tablas dinámicas y Power Query, no fórmulas raras.', frags: [
      { empresa: 'Tiendas Nazca', portal: 'Computrabajo', f: 'Tablas dinámicas y BUSCARV para el reporte semanal de ventas por tienda.' },
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'Tablas dinámicas y Power Query para cerrar el mes.' },
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'Excel sigue siendo el idioma del área de riesgos.' },
    ] },
    'Power BI': { resumen: 'Lo pide casi dos de cada tres avisos y crece rápido. Piden mantener tableros y medidas, no instalar el servidor.', frags: [
      { empresa: 'Grupo Retail Sur', portal: 'Bumeran', f: 'Mantener los tableros de Power BI que ve la gerencia comercial.' },
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'Modelo semántico en Power BI y medidas en DAX.' },
      { empresa: 'Kallpa Digital', portal: 'LinkedIn', f: 'Un tablero por cliente, con su propio modelo de datos.' },
    ] },
    'Python': { resumen: 'Donde aparece, es para pandas: limpiar y cruzar archivos. No piden desarrollar software.', frags: [
      { empresa: 'Fintech Andina', portal: 'Computrabajo', f: 'pandas para limpiar y cruzar los archivos de los bureaus de crédito.' },
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'pandas y matplotlib para los análisis que no caben en un tablero.' },
    ] },
    'Estadística': { resumen: 'No piden un curso de maestría: piden no confundir ruido con resultado.', frags: [
      { empresa: 'Yanapay', portal: 'LinkedIn', f: 'Diseñar y leer pruebas A/B sin confundir ruido con resultado.' },
      { empresa: 'Seguros Costa', portal: 'Bumeran', f: 'Promedios, medianas y percentiles aplicados a la siniestralidad.' },
    ] },
    'Comunicar resultados': { resumen: 'La que nadie pone en el CV y decide la entrevista: cada análisis termina en una recomendación escrita.', frags: [
      { empresa: 'Inti Cloud', portal: 'LinkedIn', f: 'Cada análisis termina en una recomendación escrita, no en un gráfico.' },
      { empresa: 'Yanapay', portal: 'LinkedIn', f: 'Escribir el memo que decide si una función se queda o se retira.' },
      { empresa: 'Kallpa Digital', portal: 'LinkedIn', f: 'Deseable: explicar el tablero al cliente en una llamada de 20 minutos.' },
    ] },
  },
};

/* ═══════════════════════════════════════════════════════════════════
   PORQUE · por qué conviene aprender esta skill ahora. Global por skill:
   SQL es la misma cosa en backend, QA y datos (§10.1).
   ═══════════════════════════════════════════════════════════════════ */
export const PORQUE = {
  'Java': 'Es la obligatoria de casi todos los avisos del rol en Perú, y la que te abre las ofertas de banca y seguros.',
  'Node.js': 'Es la alternativa a Java en las startups y en casi todo lo remoto. Con una de las dos basta.',
  'Python': 'Aquí no es para desarrollar: es para limpiar y cruzar datos con pandas, que es lo que piden los avisos.',
  'SQL': 'Aparece en casi todos los avisos y es de lectura: consultas para sacar o validar el dato, no administrar la base.',
  'Git': 'Se aprende en una tarde y es obligatoria en casi todas. No saberla es el filtro más barato de pasar.',
  'APIs REST': 'Es obligatoria en la mayoría de las ofertas que hoy no alcanzas. Piden diseñar y documentar endpoints.',
  'Docker': 'Las empresas piden contenerizar APIs, no administrar clusters. Con tu proyecto de billetera lo practicas.',
  'Cloud (AWS/Azure)': 'Casi siempre es deseable. Basta con haber desplegado una API para mencionarlo con evidencia.',
  'JavaScript': 'Es la base del rol y ningún aviso la salta. Los frameworks vienen después y se apoyan en ella.',
  'HTML y CSS': 'Piden maquetar responsive a mano. Es lo que separa a quien copia componentes de quien los construye.',
  'React': 'Es el framework por defecto del mercado peruano. Sin él, dos de cada tres avisos del rol quedan fuera.',
  'TypeScript': 'La que más crece del rol y todavía casi nadie la exige. Aprenderla ahora es llegar antes que el mercado.',
  'Figma': 'No es diseñar: es leer el archivo y sacar medidas sin preguntar. Dos tardes y aparece en tu CV con evidencia.',
  'Pruebas funcionales': 'Es la base del rol: diseñar casos con criterios de aceptación y dejar evidencia de cada ejecución.',
  'Jira': 'Lo pide casi todo aviso de calidad y se aprende rápido. Reportar bien un defecto es la mitad del trabajo.',
  'Automatización con Selenium': 'Es el salto de sueldo del rol: pasar de ejecutar la regresión a que corra sola.',
  'Pruebas de API': 'La que menos gente tiene y la que más piden los puestos remotos. Postman y contratos, sin interfaz.',
  'Excel avanzado': 'Sigue siendo el idioma de las áreas que te piden el dato. Tablas dinámicas y Power Query cubren el 90%.',
  'Power BI': 'Casi dos de cada tres avisos lo piden y crece rápido. Un tablero propio ya es evidencia suficiente.',
  'Estadística': 'No piden una maestría: piden no confundir ruido con resultado cuando presentas una diferencia.',
  'Comunicar resultados': 'La que nadie pone en el CV y decide la entrevista: terminar cada análisis en una recomendación escrita.',
  'Spring Boot': 'Es el marco con el que las empresas peruanas escriben Java. Va junto con la skill, no aparte.',
  'Inglés intermedio': 'Casi siempre es deseable y solo para leer documentación. No piden conversación.',
};

/* ═══════════════════════════════════════════════════════════════════
   RECURSOS · catálogo por skill. `rec` marca los recomendados: los más
   rápidos gratis, más un proyecto que deja evidencia para el CV.
   ═══════════════════════════════════════════════════════════════════ */
export const RECURSOS = {
  'APIs REST': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'API REST con Spring Boot desde cero', precio: 0, horas: 6, rating: 4.7, rec: true },
    { tipo: 'Curso', plataforma: 'Udemy', titulo: 'Spring Boot 3: APIs REST profesionales', precio: 39, horas: 14, rating: 4.6 },
    { tipo: 'Libro', plataforma: 'Biblioteca UNSA', titulo: 'Diseño de APIs REST, capítulos 1 a 4', precio: 0, horas: 5 },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'API de una billetera digital: cuentas, transferencias y documentación OpenAPI', precio: 0, horas: 10, rec: true },
  ],
  'Docker': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Docker para desarrolladores backend', precio: 0, horas: 3, rating: 4.8, rec: true },
    { tipo: 'Curso', plataforma: 'Coursera', titulo: 'Contenedores con Docker (modo auditoría)', precio: 0, horas: 12, rating: 4.6 },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Conteneriza tu API de billetera con Docker Compose y PostgreSQL', precio: 0, horas: 4, rec: true },
  ],
  'Cloud (AWS/Azure)': [
    { tipo: 'Curso', plataforma: 'AWS Skill Builder', url: 'https://explore.skillbuilder.aws', titulo: 'Fundamentos de la nube de AWS', precio: 0, horas: 6, rating: 4.7, rec: true },
    { tipo: 'Curso', plataforma: 'Udemy', titulo: 'Despliega tu API en AWS con EC2 y RDS', precio: 45, horas: 9, rating: 4.5 },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Publica tu API en AWS con capa gratuita y deja la URL en el CV', precio: 0, horas: 5, rec: true },
  ],
  'Java': [
    { tipo: 'Curso', plataforma: 'YouTube', titulo: 'Java desde cero hasta POO', precio: 0, horas: 12, rating: 4.7, rec: true },
    { tipo: 'Libro', plataforma: 'Biblioteca UNSA', titulo: 'Java: cómo programar, capítulos 1 a 8', precio: 0, horas: 14 },
  ],
  'Node.js': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Node.js y Express desde cero', precio: 0, horas: 8, rating: 4.7, rec: true },
    { tipo: 'Curso', plataforma: 'Udemy', titulo: 'NestJS: APIs de verdad con Node', precio: 35, horas: 11, rating: 4.6 },
  ],
  'SQL': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'SQL para desarrolladores y analistas', precio: 0, horas: 5, rating: 4.8, rec: true },
    { tipo: 'Curso', plataforma: 'SQLBolt', url: 'https://sqlbolt.com', titulo: 'Ejercicios interactivos de SQL', precio: 0, horas: 4, rating: 4.7 },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Responde 10 preguntas de negocio sobre una base de ventas real', precio: 0, horas: 6, rec: true },
  ],
  'Git': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Git y GitHub en una tarde', precio: 0, horas: 3, rating: 4.8, rec: true },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Sube tus proyectos de clase a GitHub con README y commits legibles', precio: 0, horas: 3, rec: true },
  ],
  'Python': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Python y pandas para analistas', precio: 0, horas: 7, rating: 4.7, rec: true },
    { tipo: 'Curso', plataforma: 'Kaggle Learn', url: 'https://www.kaggle.com/learn/pandas', titulo: 'Pandas', precio: 0, horas: 4, rating: 4.8 },
  ],
  'JavaScript': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'JavaScript moderno: módulos, promesas y fetch', precio: 0, horas: 8, rating: 4.8, rec: true },
    { tipo: 'Curso', plataforma: 'javascript.info', url: 'https://es.javascript.info', titulo: 'El tutorial de JavaScript moderno', precio: 0, horas: 15, rating: 4.9 },
  ],
  'HTML y CSS': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'CSS Grid y Flexbox a fondo', precio: 0, horas: 5, rating: 4.8, rec: true },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Maqueta tres pantallas responsive sin framework y publícalas', precio: 0, horas: 8, rec: true },
  ],
  'React': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'React con hooks desde cero', precio: 0, horas: 9, rating: 4.7, rec: true },
    { tipo: 'Curso', plataforma: 'react.dev', url: 'https://es.react.dev/learn', titulo: 'Aprende React (tutorial oficial)', precio: 0, horas: 6, rating: 4.9 },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Panel de pedidos en React: lista, filtros y detalle', precio: 0, horas: 10, rec: true },
  ],
  'TypeScript': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'TypeScript para quien ya sabe JavaScript', precio: 0, horas: 4, rating: 4.7, rec: true },
    { tipo: 'Curso', plataforma: 'Udemy', titulo: 'TypeScript aplicado a React', precio: 32, horas: 10, rating: 4.6 },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Migra tu panel de React a TypeScript sin usar `any`', precio: 0, horas: 6, rec: true },
  ],
  'Figma': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Figma para desarrolladores: medidas, tokens y export', precio: 0, horas: 2, rating: 4.6, rec: true },
  ],
  'Pruebas funcionales': [
    { tipo: 'Curso', plataforma: 'YouTube', titulo: 'Fundamentos de pruebas de software (base ISTQB)', precio: 0, horas: 8, rating: 4.6, rec: true },
    { tipo: 'Libro', plataforma: 'Biblioteca UNSA', titulo: 'Fundamentos de pruebas de software, capítulos 1 a 5', precio: 0, horas: 10 },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Escribe el plan de pruebas de una app de delivery y ejecútalo con evidencias', precio: 0, horas: 8, rec: true },
  ],
  'Jira': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Jira para QA: defectos, tableros y trazabilidad', precio: 0, horas: 2, rating: 4.5, rec: true },
  ],
  'Automatización con Selenium': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Selenium WebDriver desde cero', precio: 0, horas: 7, rating: 4.7, rec: true },
    { tipo: 'Curso', plataforma: 'Udemy', titulo: 'Automatización con Selenium, Java y TestNG', precio: 42, horas: 16, rating: 4.6 },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Automatiza la regresión de un carrito de compras y súbela a GitHub', precio: 0, horas: 10, rec: true },
  ],
  'Pruebas de API': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Postman para probar APIs REST', precio: 0, horas: 3, rating: 4.7, rec: true },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Colección de Postman que prueba una API pública de punta a punta', precio: 0, horas: 5, rec: true },
  ],
  'Excel avanzado': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Tablas dinámicas y Power Query', precio: 0, horas: 5, rating: 4.7, rec: true },
    { tipo: 'Curso', plataforma: 'Udemy', titulo: 'Excel para análisis de datos', precio: 29, horas: 12, rating: 4.6 },
  ],
  'Power BI': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Power BI desde cero: modelo, relaciones y DAX', precio: 0, horas: 6, rating: 4.7, rec: true },
    { tipo: 'Curso', plataforma: 'Microsoft Learn', url: 'https://learn.microsoft.com/es-es/training/career-paths/data-analyst', titulo: 'Analista de datos con Power BI', precio: 0, horas: 14, rating: 4.7 },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Tablero de ventas con medidas en DAX y publicado en la web', precio: 0, horas: 8, rec: true },
  ],
  'Estadística': [
    { tipo: 'Curso', plataforma: 'Khan Academy', url: 'https://es.khanacademy.org/math/statistics-probability', titulo: 'Estadística y probabilidad', precio: 0, horas: 10, rating: 4.8, rec: true },
    { tipo: 'Libro', plataforma: 'Biblioteca UNSA', titulo: 'Estadística aplicada, capítulos 1 a 6', precio: 0, horas: 12 },
  ],
  'Comunicar resultados': [
    { tipo: 'Libro', plataforma: 'Biblioteca UNSA', titulo: 'Storytelling with Data, capítulos 1 a 4', precio: 0, horas: 6, rec: true },
    { tipo: 'Proyecto', plataforma: 'Guía LMI-U', titulo: 'Escribe un memo de una página con la recomendación de tu último análisis', precio: 0, horas: 3, rec: true },
  ],
  'Spring Boot': [
    { tipo: 'Video', plataforma: 'YouTube', titulo: 'Spring Boot desde cero', precio: 0, horas: 8, rating: 4.7, rec: true },
  ],
  'Inglés intermedio': [
    { tipo: 'Curso', plataforma: 'Duolingo', url: 'https://www.duolingo.com', titulo: 'Inglés técnico para leer documentación', precio: 0, horas: 20, rating: 4.4, rec: true },
  ],
};

/* ═══════════════════════════════════════════════════════════════════
   BULLETS · el CV de la persona demo, reescrito por rol.

   `antes` es su historia y es la misma apunte donde apunte: una sola
   persona, un solo CV (§7.13). Lo que cambia con el rol es `despues`,
   porque las palabras que se resaltan salen de los requisitos del rol
   objetivo. La tabla es plana a propósito: `antes` se repite en las
   cuatro filas de cada bullet (§10.1).

   `aporta` son las skills que el bullet reescrito deja demostradas.
   `pide`  son las que el rol pedía para este bullet y NO están en el CV:
   la pantalla las compara con `perfil.skills` y de ahí salen la nota y
   la advertencia. Nunca se agrega una skill que el usuario no tiene.
   ═══════════════════════════════════════════════════════════════════ */
const ANTES = {
  perfil: 'Estudiante de sistemas con ganas de aprender.',
  inventario: 'Hice un sistema de inventario para un curso de la universidad usando Java y MySQL.',
  equipo: 'Trabajé en equipo con Git en un proyecto de 4 personas.',
  web: 'Hice una página web para una tienda con HTML y CSS.',
  practica: 'Practicante de soporte TI en la Municipalidad Provincial (6 meses).',
};

export const BULLETS = [
  // ── Backend junior (los cinco del prototipo, sin reescribir) ──
  { id: 'b-perfil', rol: 'desarrollador-backend-jr', sec: 'PERFIL', antes: ANTES.perfil,
    despues: 'Estudiante de Ingeniería de Sistemas (8vo ciclo) orientada a desarrollo backend con Java y SQL.',
    kw: ['desarrollo backend', 'Java', 'SQL'], aporta: ['Java', 'SQL'], pide: [] },
  { id: 'b-inventario', rol: 'desarrollador-backend-jr', sec: 'PROYECTOS', antes: ANTES.inventario,
    despues: 'Desarrollé un sistema de inventario en Java con MySQL: diseñé el modelo relacional y escribí consultas SQL para reportes de stock.',
    kw: ['Java', 'modelo relacional', 'consultas SQL'], aporta: ['Java', 'SQL'], pide: [] },
  { id: 'b-equipo', rol: 'desarrollador-backend-jr', sec: 'PROYECTOS', antes: ANTES.equipo,
    despues: 'Usé Git con ramas, pull requests y revisión de código en un equipo de 4 desarrolladores.',
    kw: ['Git', 'pull requests', 'revisión de código'], aporta: ['Git'], pide: [] },
  { id: 'b-web', rol: 'desarrollador-backend-jr', sec: 'PROYECTOS', antes: ANTES.web,
    despues: 'Desarrollé el sitio web responsive de una tienda local con HTML y CSS (5 páginas).',
    kw: ['responsive'], aporta: ['HTML y CSS'], pide: ['APIs REST'] },
  { id: 'b-practica', rol: 'desarrollador-backend-jr', sec: 'EXPERIENCIA', antes: ANTES.practica,
    despues: 'Practicante de soporte TI (6 meses): automaticé reportes de incidencias con Python y consultas SQL.',
    kw: ['Python', 'consultas SQL'], aporta: ['Python', 'SQL'], pide: [], confirmar: 'Python' },

  // ── Frontend junior ──
  { id: 'f-perfil', rol: 'desarrollador-frontend-jr', sec: 'PERFIL', antes: ANTES.perfil,
    despues: 'Estudiante de Ingeniería de Sistemas (8vo ciclo) orientada a desarrollo frontend: maquetación responsive con HTML y CSS y trabajo en equipo con Git.',
    kw: ['desarrollo frontend', 'maquetación responsive', 'HTML y CSS'], aporta: ['HTML y CSS', 'Git'], pide: ['JavaScript'] },
  { id: 'f-web', rol: 'desarrollador-frontend-jr', sec: 'PROYECTOS', antes: ANTES.web,
    despues: 'Desarrollé el sitio responsive de una tienda local con HTML y CSS: maqueté 5 vistas con CSS Grid y Flexbox, sin framework.',
    kw: ['responsive', 'CSS Grid', 'Flexbox'], aporta: ['HTML y CSS'], pide: ['React'] },
  { id: 'f-inventario', rol: 'desarrollador-frontend-jr', sec: 'PROYECTOS', antes: ANTES.inventario,
    despues: 'Construí la interfaz de un sistema de inventario: pantallas de alta, búsqueda y reporte de stock sobre una base MySQL.',
    kw: ['interfaz', 'pantallas', 'búsqueda'], aporta: ['HTML y CSS'], pide: ['JavaScript', 'React'] },
  { id: 'f-equipo', rol: 'desarrollador-frontend-jr', sec: 'PROYECTOS', antes: ANTES.equipo,
    despues: 'Usé Git con ramas, pull requests y revisión de código en un equipo de 4 personas: un pull request por tarea.',
    kw: ['Git', 'pull requests', 'revisión de código'], aporta: ['Git'], pide: [] },
  { id: 'f-practica', rol: 'desarrollador-frontend-jr', sec: 'EXPERIENCIA', antes: ANTES.practica,
    despues: 'Practicante de soporte TI (6 meses): mantuve las páginas internas del portal y automaticé reportes con Python.',
    kw: ['páginas internas', 'Python'], aporta: ['Python'], pide: [], confirmar: 'Python' },

  // ── Analista QA ──
  { id: 'q-perfil', rol: 'analista-qa', sec: 'PERFIL', antes: ANTES.perfil,
    despues: 'Estudiante de Ingeniería de Sistemas (8vo ciclo) orientada a calidad de software: validación de datos con SQL y seguimiento de incidencias en equipo.',
    kw: ['calidad de software', 'validación de datos', 'SQL'], aporta: ['SQL'], pide: ['Pruebas funcionales'] },
  { id: 'q-inventario', rol: 'analista-qa', sec: 'PROYECTOS', antes: ANTES.inventario,
    despues: 'Desarrollé y probé un sistema de inventario en Java con MySQL: diseñé casos de prueba para alta y baja de stock y validé cada resultado con consultas SQL.',
    kw: ['casos de prueba', 'consultas SQL'], aporta: ['SQL'], pide: ['Pruebas funcionales'] },
  { id: 'q-equipo', rol: 'analista-qa', sec: 'PROYECTOS', antes: ANTES.equipo,
    despues: 'Trabajé con Git y revisión de código en un equipo de 4 personas: reporté y seguí los defectos encontrados hasta su cierre.',
    kw: ['revisión de código', 'defectos', 'hasta su cierre'], aporta: ['Git'], pide: ['Jira'] },
  { id: 'q-web', rol: 'analista-qa', sec: 'PROYECTOS', antes: ANTES.web,
    despues: 'Desarrollé y verifiqué el sitio responsive de una tienda local: probé los formularios en 5 vistas y dejé la evidencia de cada caso.',
    kw: ['verifiqué', 'probé los formularios', 'evidencia'], aporta: ['HTML y CSS'], pide: ['Automatización con Selenium'] },
  { id: 'q-practica', rol: 'analista-qa', sec: 'EXPERIENCIA', antes: ANTES.practica,
    despues: 'Practicante de soporte TI (6 meses): registré y clasifiqué incidencias de los usuarios y automaticé su reporte con Python y consultas SQL.',
    kw: ['registré y clasifiqué incidencias', 'consultas SQL'], aporta: ['Python', 'SQL'], pide: ['Jira'], confirmar: 'Python' },

  // ── Analista de datos junior ──
  { id: 'd-perfil', rol: 'analista-datos-jr', sec: 'PERFIL', antes: ANTES.perfil,
    despues: 'Estudiante de Ingeniería de Sistemas (8vo ciclo) orientada a análisis de datos: consultas SQL y automatización de reportes con Python.',
    kw: ['análisis de datos', 'consultas SQL', 'Python'], aporta: ['SQL', 'Python'], pide: ['Power BI'] },
  { id: 'd-practica', rol: 'analista-datos-jr', sec: 'EXPERIENCIA', antes: ANTES.practica,
    despues: 'Practicante de soporte TI (6 meses): automaticé el reporte mensual de incidencias con Python y consultas SQL, y lo entregué a jefatura cada mes.',
    kw: ['automaticé el reporte', 'consultas SQL', 'Python'], aporta: ['Python', 'SQL'], pide: ['Comunicar resultados'], confirmar: 'Python' },
  { id: 'd-inventario', rol: 'analista-datos-jr', sec: 'PROYECTOS', antes: ANTES.inventario,
    despues: 'Modelé la base de un sistema de inventario en MySQL y escribí las consultas SQL de los reportes de stock y rotación.',
    kw: ['Modelé la base', 'consultas SQL', 'rotación'], aporta: ['SQL'], pide: ['Power BI'] },
  { id: 'd-equipo', rol: 'analista-datos-jr', sec: 'PROYECTOS', antes: ANTES.equipo,
    despues: 'Trabajé con Git en un equipo de 4 personas: versioné los scripts de datos y documenté cada cambio para que el equipo pudiera reproducirlo.',
    kw: ['versioné los scripts', 'documenté', 'reproducirlo'], aporta: ['Git'], pide: [] },
  { id: 'd-web', rol: 'analista-datos-jr', sec: 'PROYECTOS', antes: ANTES.web,
    despues: 'Desarrollé el sitio de una tienda local con HTML y CSS y le monté el seguimiento de visitas para reportar el tráfico semanal.',
    kw: ['seguimiento de visitas', 'reportar el tráfico'], aporta: ['HTML y CSS'], pide: ['Power BI', 'Estadística'] },
];

// El orden de las secciones en la hoja del CV completo.
export const SECCIONES_CV = ['PERFIL', 'EXPERIENCIA', 'PROYECTOS'];

// ── Lo que se lee del catálogo, nunca se copia ───────────────────────
export const habilidadesDe = (rol) => rolDe(rol)?.habilidades ?? [];
export const ofertasPorCiudad = (rol) => rolDe(rol)?.porCiudad ?? {};
export const nombreRol = (rol) => rolDe(rol)?.nombre ?? rol;
export const MIN_MUESTRA = catalogo.minMuestra;

// Buscador del portal con el rol y la ciudad en la URL (§7.7). Una empresa
// inventada no tiene aviso real que enlazar, y un href="#" se lee como botón
// roto: esto lleva al buscador del portal, que es donde el aviso estaría.
// ponytail: un solo patrón de búsqueda por portal; si un portal cambia su
// buscador, se corrige aquí y no en seis pantallas.
export function urlPortal({ portal, puesto, ciudad }) {
  // En el buscador de LinkedIn los paréntesis y el punto medio del puesto no
  // rompen la URL pero sí la búsqueda: se quedan como texto literal.
  const q = encodeURIComponent(puesto.replace(/[·()]/g, ' ').replace(/\s+/g, ' ').trim());
  const c = encodeURIComponent(ciudad === 'Remoto' ? 'Peru' : ciudad);
  if (portal === 'LinkedIn') return `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${c}`;
  const s = slug(puesto);
  if (portal === 'Bumeran') return `https://www.bumeran.com.pe/empleos-busqueda-${s}.html`;
  return `https://pe.computrabajo.com/trabajo-de-${s}`;
}

// Los puestos llevan paréntesis, puntos medios y tildes —"Frontend junior
// (React)", "Backend junior · billetera digital"— y `encodeURIComponent` no
// escapa los paréntesis: el enlace salía como
// `trabajo-de-frontend-junior-(react)` y el portal devolvía un 404. Para el
// tester eso es un botón roto, que es justo lo que el plan no tolera.
export function slug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
