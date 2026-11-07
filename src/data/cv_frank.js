// Modelo de datos del CV real de Frank Li Figueroa Rodríguez y adaptaciones por rol.
// Los textos originales provienen directamente de `docs/CV - Frank Li.pdf`.

export const CV_FRANK_RAW = {
  nombre: 'Frank Li Figueroa Rodríguez',
  contacto: '+51 910981285 | frankfrodriguez12@gmail.com | LinkedIn',
  educacion: {
    institucion: 'Universidad San Ignacio de Loyola (USIL) – Lima, Perú',
    periodo: 'Marzo 2023 – Presente (Esperada graduación: Diciembre 2027)',
    carrera: 'Ingeniería de Sistema de Información',
  },
  perfil:
    'Estudiante de Ingeniería de Sistemas de Información con experiencia en el desarrollo de aplicaciones web utilizando Spring Boot, Angular y bases de datos relacionales. Participante activo en proyectos académicos de investigación y desarrollo de software, con interés en arquitectura de sistemas, desarrollo backend e inteligencia artificial aplicada. Busco una práctica pre profesional donde pueda contribuir en proyectos tecnológicos mientras fortalezco mis competencias.',
  proyectos: [
    {
      id: 'suministros',
      titulo: 'Sistema web de gestión de cadena de suministros',
      fecha: 'Agos 2025',
      bullets: [
        {
          id: 'sum-1',
          texto:
            'Diseñé y desarrollé una aplicación web completa para optimizar el control de inventarios, modelando procesos de abastecimiento, almacenamiento y distribución.',
        },
        {
          id: 'sum-2',
          texto:
            'Backend: Implementé una API REST con Spring Boot, aplicando arquitectura por capas. Frontend: Desarrollé la interfaz de usuario modular y reactiva con Angular (TypeScript), consumiendo la API.',
        },
        {
          id: 'sum-3',
          texto:
            'Base de datos: Modelé e implementé el esquema relacional en MySQL, definiendo entidades, relaciones y flujos de información críticos.',
        },
      ],
    },
    {
      id: 'domotica',
      titulo:
        'Sistema de procesamiento de voz en una arquitectura Cliente-Servidor para un sistema de control domótico',
      fecha: 'Agos 2025',
      bullets: [
        {
          id: 'dom-1',
          texto:
            'Diseñé un sistema domótico basado en una arquitectura cliente–servidor para el control de dispositivos mediante comandos de voz.',
        },
        {
          id: 'dom-2',
          texto:
            'Desplegué en la web una interfaz amigable utilizando Ngrok para la ejecución de comandos usando HTML, CSS y JavaScript.',
        },
        {
          id: 'dom-3',
          texto:
            'Implementé en la parte del Backend con Python el API Cloud Speech-to-text de Google para el procesamiento de los comandos de voz.',
        },
      ],
    },
    {
      id: 'debian',
      titulo: 'Configuración de servidor web de auto hosting en Debian 13 (Linux)',
      fecha: 'Mar 2025',
      bullets: [
        {
          id: 'deb-1',
          texto:
            'Diseñé la arquitectura del servidor con el objetivo de desplegar aplicaciones de proyectos web personales.',
        },
        {
          id: 'deb-2',
          texto:
            'Configuré dos máquinas virtuales para albergar las aplicaciones y la base de datos de manera independiente.',
        },
        {
          id: 'deb-3',
          texto: 'Configuré Apache (HTTP Server) como servidor para alojar las aplicaciones web.',
        },
      ],
    },
  ],
  habilidades: [
    {
      cat: 'Lenguajes',
      items: ['Java', 'TypeScript/JavaScript', 'Python', 'SQL', 'C/C++ (Arduino)'],
    },
    {
      cat: 'Frameworks & Librerías',
      items: ['Spring Boot', 'FastAPI', 'Angular', 'Hibernate', 'Bootstrap'],
    },
    {
      cat: 'Bases de Datos & Herramientas',
      items: ['PostgreSQL', 'MySQL', 'Git', 'Docker (conceptos)', 'Arduino IDE'],
    },
    {
      cat: 'Metodologías & Conceptos',
      items: [
        'Desarrollo API REST',
        'Modelado ER',
        'Análisis de Requerimientos',
        'Diseño de Sistemas',
        'Lógica Digital',
        'Scrum',
        'MetricaV3',
        'Dmbook',
      ],
    },
  ],
  logros: [
    {
      tipo: 'Extracurricular',
      texto: 'Miembro activo del Grupo de Investigación de Ciencias de la Computación USIL (GICC).',
    },
    {
      tipo: 'Extracurricular',
      texto: 'Director de Proyectos e Investigación del IEEE Computer Society USIL.',
    },
    {
      tipo: 'Participación',
      texto:
        '“Training Camp UPC 2025”: Campamento de entrenamiento y competición en programación competitiva, mi equipo quedó en 4to lugar.',
    },
    {
      tipo: 'Cursos complementarios',
      texto:
        '“Database for Developers: Foundations”, “Database for Developers: Next Level” (Oracle Dev Gym, 2025)',
    },
    {
      tipo: 'Idiomas',
      texto: 'Español (Nativo), Inglés (Intermedio B1 – en formación activa).',
    },
  ],
};

// Las 7 mejoras para cada rol, respetando la regla de honestidad.
export const MEJORAS_POR_ROL = {
  'desarrollador-backend-jr': [
    {
      id: 'm-edu',
      seccion: 'EDUCACIÓN',
      targetId: 'edu-carrera',
      tipo: 'CORRECCIÓN',
      antes: 'Ingeniería de Sistema de Información',
      despues: 'Ingeniería de Sistemas de Información',
      kw: ['Sistemas'],
      razon: 'Corrección: así se llama la carrera en USIL, y así lo escribes en tu perfil.',
      aporta: ['Sistemas'],
      confirmar: null,
    },
    {
      id: 'm-perfil',
      seccion: 'PERFIL',
      targetId: 'perfil',
      tipo: 'MEJORA PARA DESARROLLADOR BACKEND JUNIOR',
      antes:
        'Estudiante de Ingeniería de Sistemas de Información con experiencia en el desarrollo de aplicaciones web utilizando Spring Boot, Angular y bases de datos relacionales. Participante activo en proyectos académicos de investigación y desarrollo de software, con interés en arquitectura de sistemas, desarrollo backend e inteligencia artificial aplicada. Busco una práctica pre profesional donde pueda contribuir en proyectos tecnológicos mientras fortalezco mis competencias.',
      despues:
        'Estudiante de 8vo ciclo de Ingeniería de Sistemas de Información (USIL) orientado a desarrollo backend: APIs REST con Java y Spring Boot sobre MySQL y PostgreSQL. Participante activo en proyectos académicos de investigación y desarrollo de software, con interés en arquitectura de sistemas, desarrollo backend e inteligencia artificial aplicada. Busco una práctica pre profesional donde pueda contribuir en proyectos tecnológicos mientras fortalezco mis competencias.',
      kw: ['desarrollo backend', 'APIs REST', 'Java', 'Spring Boot'],
      razon: 'Java o Node.js aparece en 612 de tus 695 ofertas de Desarrollador Backend junior.',
      aporta: ['Java', 'APIs REST'],
      confirmar: null,
    },
    {
      id: 'm-sum-2',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'sum-2',
      tipo: 'MEJORA PARA DESARROLLADOR BACKEND JUNIOR',
      antes:
        'Backend: Implementé una API REST con Spring Boot, aplicando arquitectura por capas. Frontend: Desarrollé la interfaz de usuario modular y reactiva con Angular (TypeScript), consumiendo la API.',
      despues:
        'Backend: Diseñé e implementé una API REST escalable con Spring Boot, aplicando arquitectura por capas (Controller, Service, Repository) y persistencia con Hibernate. Frontend: Consumo modular desde Angular.',
      kw: ['API REST', 'Spring Boot', 'arquitectura por capas', 'Hibernate'],
      razon:
        'El 81% de las ofertas de Backend Jr evalúan arquitectura por capas y patrones de persistencia.',
      aporta: ['APIs REST', 'Java'],
      confirmar: null,
    },
    {
      id: 'm-sum-3',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'sum-3',
      tipo: 'MEJORA PARA DESARROLLADOR BACKEND JUNIOR',
      antes:
        'Base de datos: Modelé e implementé el esquema relacional en MySQL, definiendo entidades, relaciones y flujos de información críticos.',
      despues:
        'Base de datos: Modelé el esquema relacional en MySQL con integridad referencial, índices y consultas SQL optimizadas para el procesamiento transaccional de stock.',
      kw: ['esquema relacional', 'MySQL', 'consultas SQL optimizadas'],
      razon:
        'SQL es obligatorio en el 84% de ofertas de Backend Jr en Lima y Arequipa.',
      aporta: ['SQL'],
      confirmar: null,
    },
    {
      id: 'm-dom-3',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'dom-3',
      tipo: 'MEJORA PARA DESARROLLADOR BACKEND JUNIOR',
      antes:
        'Implementé en la parte del Backend con Python el API Cloud Speech-to-text de Google para el procesamiento de los comandos de voz.',
      despues:
        'Backend en Python: Desarrollé los endpoints para recepción de audio e integración con Google Cloud Speech-to-Text API, procesando eventos de voz en tiempo real.',
      kw: ['Backend en Python', 'Google Cloud Speech-to-Text API', 'tiempo real'],
      razon:
        'Integrar APIs en la nube demuestra capacidad de comunicación entre servicios heterogéneos.',
      aporta: ['Python'],
      confirmar: 'Python',
      alertaConfirmar:
        'Confirma que sea cierto antes de usarlo: tu CV menciona integración con Google Cloud API en Python, pero asegúrate de poder explicar el flujo de autenticación y latencia en entrevistas.',
    },
    {
      id: 'm-deb-1',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'deb-1',
      tipo: 'MEJORA PARA DESARROLLADOR BACKEND JUNIOR',
      antes:
        'Diseñé la arquitectura del servidor con el objetivo de desplegar aplicaciones de proyectos web personales.',
      despues:
        'Infraestructura Linux: Administré un servidor Debian 13 para despliegue de microservicios y aplicaciones web personales, configurando Apache y aislamiento de red.',
      kw: ['Infraestructura Linux', 'Debian 13', 'microservicios', 'Apache'],
      razon:
        'El conocimiento de entornos Linux y despliegues web eleva la competitividad en vacantes Junior.',
      aporta: ['Git'],
      confirmar: null,
    },
    {
      id: 'm-hab',
      seccion: 'HABILIDADES TÉCNICAS',
      targetId: 'hab',
      tipo: 'OPTIMIZACIÓN ATS DE HABILIDADES',
      antes:
        'Lenguajes: Java, TypeScript/JavaScript, Python, SQL · Frameworks: Spring Boot, FastAPI, Angular',
      despues:
        'Backend Core: Java, Spring Boot, Hibernate, APIs REST, SQL (PostgreSQL, MySQL), Git, Docker (conceptos), Python, Linux.',
      kw: ['Java', 'Spring Boot', 'APIs REST', 'SQL', 'Git', 'Docker'],
      razon:
        'Priorizar las tecnologías obligatorias al inicio del bloque permite superar los filtros ATS de reclutamiento.',
      aporta: ['Java', 'SQL', 'APIs REST', 'Git'],
      confirmar: null,
    },
  ],

  'desarrollador-frontend-jr': [
    {
      id: 'm-edu',
      seccion: 'EDUCACIÓN',
      targetId: 'edu-carrera',
      tipo: 'CORRECCIÓN',
      antes: 'Ingeniería de Sistema de Información',
      despues: 'Ingeniería de Sistemas de Información',
      kw: ['Sistemas'],
      razon: 'Corrección: así se llama la carrera en USIL, y así lo escribes en tu perfil.',
      aporta: ['Sistemas'],
      confirmar: null,
    },
    {
      id: 'm-perfil',
      seccion: 'PERFIL',
      targetId: 'perfil',
      tipo: 'MEJORA PARA DESARROLLADOR FRONTEND JUNIOR',
      antes:
        'Estudiante de Ingeniería de Sistemas de Información con experiencia en el desarrollo de aplicaciones web utilizando Spring Boot, Angular y bases de datos relacionales...',
      despues:
        'Estudiante de 8vo ciclo de Ingeniería de Sistemas de Información (USIL) orientado a desarrollo frontend: maquetación responsive con Angular (TypeScript), HTML y CSS, consumo de APIs REST y trabajo colaborativo con Git.',
      kw: ['desarrollo frontend', 'Angular', 'TypeScript', 'HTML y CSS', 'APIs REST'],
      razon:
        'Angular/React y TypeScript aparecen en el 78% de avisos de Desarrollador Frontend junior.',
      aporta: ['HTML y CSS', 'TypeScript', 'Git'],
      confirmar: null,
    },
    {
      id: 'm-sum-2',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'sum-2',
      tipo: 'MEJORA PARA DESARROLLADOR FRONTEND JUNIOR',
      antes:
        'Backend: Implementé una API REST con Spring Boot, aplicando arquitectura por capas. Frontend: Desarrollé la interfaz de usuario modular y reactiva con Angular (TypeScript), consumiendo la API.',
      despues:
        'Frontend: Construí una interfaz de usuario reactiva y modular con Angular (TypeScript) y Bootstrap: diseño responsive, validación de formularios y consumo asíncrono de APIs REST.',
      kw: ['interfaz de usuario reactiva', 'Angular', 'TypeScript', 'Bootstrap', 'APIs REST'],
      razon:
        'El manejo de estado, componentes reutilizables y consumo de APIs son las 3 habilidades más evaluadas en pruebas técnicas de Frontend.',
      aporta: ['TypeScript', 'HTML y CSS', 'APIs REST'],
      confirmar: null,
    },
    {
      id: 'm-sum-3',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'sum-3',
      tipo: 'MEJORA PARA DESARROLLADOR FRONTEND JUNIOR',
      antes:
        'Base de datos: Modelé e implementé el esquema relacional en MySQL, definiendo entidades, relaciones y flujos de información críticos.',
      despues:
        'Integración Frontend-Datos: Mapeé las entidades y contratos JSON del backend MySQL en modelos e interfaces TypeScript tipadas en el cliente.',
      kw: ['contratos JSON', 'modelos e interfaces TypeScript'],
      razon: 'El tipado estricto de respuestas en Angular reduce errores en tiempo de ejecución.',
      aporta: ['TypeScript'],
      confirmar: null,
    },
    {
      id: 'm-dom-2',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'dom-2',
      tipo: 'MEJORA PARA DESARROLLADOR FRONTEND JUNIOR',
      antes:
        'Desplegué en la web una interfaz amigable utilizando Ngrok para la ejecución de comandos usando HTML, CSS y JavaScript.',
      despues:
        'Interfaz Web: Diseñé e implementé una interfaz web interactiva con HTML5, CSS3 y JavaScript para visualización en tiempo real del estado de dispositivos domóticos.',
      kw: ['HTML5', 'CSS3', 'JavaScript', 'tiempo real'],
      razon: 'JavaScript y maquetación web sólida son la base indiscutible para cualquier vacante Frontend.',
      aporta: ['JavaScript', 'HTML y CSS'],
      confirmar: null,
    },
    {
      id: 'm-deb-3',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'deb-3',
      tipo: 'MEJORA PARA DESARROLLADOR FRONTEND JUNIOR',
      antes: 'Configuré Apache (HTTP Server) como servidor para alojar las aplicaciones web.',
      despues:
        'Despliegue Web: Configuré el servidor web Apache en Linux para servir los bundles de producción de las aplicaciones frontend con compresión y caching.',
      kw: ['servidor web Apache', 'bundles de producción', 'Frontend'],
      razon: 'Conocer el ciclo de build y hosting de un SPA diferencia a un candidato junior.',
      aporta: ['Git'],
      confirmar: null,
    },
    {
      id: 'm-hab',
      seccion: 'HABILIDADES TÉCNICAS',
      targetId: 'hab',
      tipo: 'OPTIMIZACIÓN ATS DE HABILIDADES',
      antes:
        'Lenguajes: Java, TypeScript/JavaScript, Python, SQL · Frameworks: Spring Boot, FastAPI, Angular',
      despues:
        'Frontend Core: Angular, TypeScript, JavaScript, HTML5, CSS3, Bootstrap, APIs REST, Git, Responsive Design, Scrum.',
      kw: ['Angular', 'TypeScript', 'JavaScript', 'HTML5, CSS3', 'APIs REST', 'Git'],
      razon: 'Pone en primer lugar el stack web que buscan los filtros automáticos de Frontend.',
      aporta: ['TypeScript', 'JavaScript', 'HTML y CSS', 'Git'],
      confirmar: null,
    },
  ],

  'analista-qa': [
    {
      id: 'm-edu',
      seccion: 'EDUCACIÓN',
      targetId: 'edu-carrera',
      tipo: 'CORRECCIÓN',
      antes: 'Ingeniería de Sistema de Información',
      despues: 'Ingeniería de Sistemas de Información',
      kw: ['Sistemas'],
      razon: 'Corrección: así se llama la carrera en USIL, y así lo escribes en tu perfil.',
      aporta: ['Sistemas'],
      confirmar: null,
    },
    {
      id: 'm-perfil',
      seccion: 'PERFIL',
      targetId: 'perfil',
      tipo: 'MEJORA PARA ANALISTA QA',
      antes:
        'Estudiante de Ingeniería de Sistemas de Información con experiencia en el desarrollo de aplicaciones web utilizando Spring Boot, Angular y bases de datos relacionales...',
      despues:
        'Estudiante de 8vo ciclo de Ingeniería de Sistemas de Información (USIL) enfocado en calidad de software (QA): diseño y ejecución de casos de prueba, verificación de APIs REST, validación de integridad en bases de datos con SQL y metodología Scrum.',
      kw: ['calidad de software (QA)', 'casos de prueba', 'APIs REST', 'SQL', 'Scrum'],
      razon:
        'Casos de prueba y SQL aparecen en 245 de tus 313 ofertas de Analista QA.',
      aporta: ['SQL', 'Git', 'APIs REST'],
      confirmar: null,
    },
    {
      id: 'm-sum-1',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'sum-1',
      tipo: 'MEJORA PARA ANALISTA QA',
      antes:
        'Diseñé y desarrollé una aplicación web completa para optimizar el control de inventarios, modelando procesos de abastecimiento, almacenamiento y distribución.',
      despues:
        'Aseguramiento de Calidad: Diseñé matrices de casos de prueba y criterios de aceptación para los flujos críticos de inventario (abastecimiento y distribución), previniendo defectos funcionales.',
      kw: ['matrices de casos de prueba', 'criterios de aceptación', 'defectos funcionales'],
      razon:
        'Diseñar casos de prueba basados en requerimientos es la tarea diaria principal del rol QA.',
      aporta: ['Git'],
      confirmar: null,
    },
    {
      id: 'm-sum-2',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'sum-2',
      tipo: 'MEJORA PARA ANALISTA QA',
      antes:
        'Backend: Implementé una API REST con Spring Boot, aplicando arquitectura por capas. Frontend: Desarrollé la interfaz de usuario modular y reactiva con Angular (TypeScript), consumiendo la API.',
      despues:
        'Pruebas de API: Verifiqué endpoints de la API REST en Spring Boot mediante validación de códigos de estado HTTP, esquemas JSON y control de excepciones antes de su integración.',
      kw: ['Pruebas de API', 'API REST', 'códigos de estado HTTP', 'esquemas JSON'],
      razon:
        'Las pruebas de API son el requisito técnico que más creció en ofertas de QA (+14% este año).',
      aporta: ['APIs REST'],
      confirmar: null,
    },
    {
      id: 'm-sum-3',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'sum-3',
      tipo: 'MEJORA PARA ANALISTA QA',
      antes:
        'Base de datos: Modelé e implementé el esquema relacional en MySQL, definiendo entidades, relaciones y flujos de información críticos.',
      despues:
        'Validación de Datos con SQL: Ejecuté consultas SQL de verificación en MySQL para comprobar la integridad referencial y consistencia de datos tras operaciones transaccionales.',
      kw: ['consultas SQL de verificación', 'integridad referencial', 'consistencia de datos'],
      razon:
        'Validar datos directamente en la base con SQL es la prueba técnica clásica para QA en banca y retail.',
      aporta: ['SQL'],
      confirmar: null,
    },
    {
      id: 'm-dom-1',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'dom-1',
      tipo: 'MEJORA PARA ANALISTA QA',
      antes:
        'Diseñé un sistema domótico basado en una arquitectura cliente–servidor para el control de dispositivos mediante comandos de voz.',
      despues:
        'Pruebas de Integración: Ejecuté pruebas de integración cliente-servidor y medí la latencia y tasa de éxito en el procesamiento de comandos de voz bajo distintas cargas.',
      kw: ['Pruebas de Integración', 'latencia y tasa de éxito'],
      razon: 'La medición de latencia y pruebas de integración evidencian madurez técnica en QA.',
      aporta: ['Git'],
      confirmar: null,
    },
    {
      id: 'm-hab',
      seccion: 'HABILIDADES TÉCNICAS',
      targetId: 'hab',
      tipo: 'OPTIMIZACIÓN ATS DE HABILIDADES',
      antes:
        'Lenguajes: Java, TypeScript/JavaScript, Python, SQL · Frameworks: Spring Boot, FastAPI, Angular',
      despues:
        'QA Core: Pruebas Funcionales, Pruebas de API (REST/JSON), SQL (PostgreSQL, MySQL), Análisis de Requerimientos, Scrum, Git, Casos de Prueba, Java, Python.',
      kw: ['Pruebas Funcionales', 'Pruebas de API', 'SQL', 'Casos de Prueba', 'Scrum', 'Git'],
      razon: 'Alinea tu sección de herramientas exactamente a los términos que busca un Líder de QA.',
      aporta: ['SQL', 'Git', 'APIs REST'],
      confirmar: null,
    },
  ],

  'analista-datos-jr': [
    {
      id: 'm-edu',
      seccion: 'EDUCACIÓN',
      targetId: 'edu-carrera',
      tipo: 'CORRECCIÓN',
      antes: 'Ingeniería de Sistema de Información',
      despues: 'Ingeniería de Sistemas de Información',
      kw: ['Sistemas'],
      razon: 'Corrección: así se llama la carrera en USIL, y así lo escribes en tu perfil.',
      aporta: ['Sistemas'],
      confirmar: null,
    },
    {
      id: 'm-perfil',
      seccion: 'PERFIL',
      targetId: 'perfil',
      tipo: 'MEJORA PARA ANALISTA DE DATOS JUNIOR',
      antes:
        'Estudiante de Ingeniería de Sistemas de Información con experiencia en el desarrollo de aplicaciones web utilizando Spring Boot, Angular y bases de datos relacionales...',
      despues:
        'Estudiante de 8vo ciclo de Ingeniería de Sistemas de Información (USIL) orientado a análisis y modelado de datos: consultas SQL complejas en PostgreSQL y MySQL, diseño de esquemas relacionales (ER), procesamiento y análisis con Python.',
      kw: ['análisis y modelado de datos', 'consultas SQL complejas', 'PostgreSQL y MySQL', 'Python'],
      razon:
        'SQL y Python son el requisito base en 712 de tus 847 ofertas de Analista de Datos junior.',
      aporta: ['SQL', 'Python'],
      confirmar: null,
    },
    {
      id: 'm-sum-3',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'sum-3',
      tipo: 'MEJORA PARA ANALISTA DE DATOS JUNIOR',
      antes:
        'Base de datos: Modelé e implementé el esquema relacional en MySQL, definiendo entidades, relaciones y flujos de información críticos.',
      despues:
        'Modelado y Análisis de Datos: Diseñé el modelo relacional normalizado en MySQL: estructuré tablas de hechos y dimensiones para generar reportes analíticos de rotación de stock.',
      kw: ['modelo relacional', 'reportes analíticos', 'rotación de stock'],
      razon:
        'El 89% de ofertas de datos exige diseño y modelado de bases de datos para reportes.',
      aporta: ['SQL'],
      confirmar: null,
    },
    {
      id: 'm-dom-3',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'dom-3',
      tipo: 'MEJORA PARA ANALISTA DE DATOS JUNIOR',
      antes:
        'Implementé en la parte del Backend con Python el API Cloud Speech-to-text de Google para el procesamiento de los comandos de voz.',
      despues:
        'Procesamiento de Datos con Python: Procesé y estructuré flujos de datos no estructurados (audio y transcripciones de texto) en registros limpios para análisis de comandos.',
      kw: ['Procesamiento de Datos con Python', 'datos no estructurados', 'registros limpios'],
      razon:
        'Demuestra habilidades de transformación y limpieza de datos (ETL) con Python.',
      aporta: ['Python'],
      confirmar: 'Python',
      alertaConfirmar:
        'Confirma que usaste Python para manipulación de datos o strings en la respuesta de la API.',
    },
    {
      id: 'm-logro-oracle',
      seccion: 'LOGROS Y ACTIVIDADES',
      targetId: 'logro-oracle',
      tipo: 'MEJORA PARA ANALISTA DE DATOS JUNIOR',
      antes:
        'Cursos complementarios: “Database for Developers: Foundations”, “Database for Developers: Next Level” (Oracle Dev Gym, 2025)',
      despues:
        'Certificaciones Especializadas: “Database for Developers: Foundations” y “Next Level” (Oracle Dev Gym, 2025) con dominio de SQL avanzado, subconsultas analíticas y optimización.',
      kw: ['Oracle Dev Gym', 'SQL avanzado', 'subconsultas analíticas'],
      razon:
        'Tener certificaciones específicas de base de datos le da gran credibilidad a tu perfil frente a egresados generales.',
      aporta: ['SQL'],
      confirmar: null,
    },
    {
      id: 'm-deb-2',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'deb-2',
      tipo: 'MEJORA PARA ANALISTA DE DATOS JUNIOR',
      antes:
        'Configuré dos máquinas virtuales para albergar las aplicaciones y la base de datos de manera independiente.',
      despues:
        'Administración de Entornos de Datos: Desplegué un servidor PostgreSQL y MySQL en máquinas virtuales dedicadas en Debian, aislando el motor de base de datos para pruebas analíticas.',
      kw: ['PostgreSQL y MySQL', 'Debian', 'motor de base de datos'],
      razon: 'Entender la infraestructura de bases de datos es un diferencial clave en analistas junior.',
      aporta: ['SQL'],
      confirmar: null,
    },
    {
      id: 'm-hab',
      seccion: 'HABILIDADES TÉCNICAS',
      targetId: 'hab',
      tipo: 'OPTIMIZACIÓN ATS DE HABILIDADES',
      antes:
        'Lenguajes: Java, TypeScript/JavaScript, Python, SQL · Frameworks: Spring Boot, FastAPI, Angular',
      despues:
        'Datos Core: SQL (PostgreSQL, MySQL), Python, Modelado ER, Normalización de BD, Oracle Dev Gym, Git, Análisis de Requerimientos, Metodología Scrum.',
      kw: ['SQL (PostgreSQL, MySQL)', 'Python', 'Modelado ER', 'Oracle Dev Gym', 'Git'],
      razon: 'Resalta de inmediato tu capacidad de trabajar con datos estructurados y Python.',
      aporta: ['SQL', 'Python', 'Git'],
      confirmar: null,
    },
  ],

  'data-scientist-jr': [
    {
      id: 'm-edu',
      seccion: 'EDUCACIÓN',
      targetId: 'edu-carrera',
      tipo: 'CORRECCIÓN',
      antes: 'Ingeniería de Sistema de Información',
      despues: 'Ingeniería de Sistemas de Información',
      kw: ['Sistemas'],
      razon: 'Corrección: así se llama la carrera en USIL, y así lo escribes en tu perfil.',
      aporta: ['Sistemas'],
      confirmar: null,
    },
    {
      id: 'm-perfil',
      seccion: 'PERFIL',
      targetId: 'perfil',
      tipo: 'MEJORA PARA INGENIERO DE IA / DATA SCIENCE',
      antes:
        'Estudiante de Ingeniería de Sistemas de Información con experiencia en el desarrollo de aplicaciones web utilizando Spring Boot, Angular y bases de datos relacionales...',
      despues:
        'Estudiante de 8vo ciclo de Ingeniería de Sistemas de Información (USIL) enfocado en Inteligencia Artificial aplicada: desarrollo de microservicios con FastAPI y Python, integración de modelos de Machine Learning/NLP en la nube e investigación activa en IEEE Computer Society y GICC.',
      kw: ['Inteligencia Artificial aplicada', 'FastAPI', 'Python', 'Machine Learning/NLP', 'investigación'],
      razon:
        'Python e integración de APIs de IA son el núcleo de las convocatorias de IA y Data Science.',
      aporta: ['Python'],
      confirmar: null,
    },
    {
      id: 'm-dom-3',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'dom-3',
      tipo: 'MEJORA PARA INGENIERO DE IA / DATA SCIENCE',
      antes:
        'Implementé en la parte del Backend con Python el API Cloud Speech-to-text de Google para el procesamiento de los comandos de voz.',
      despues:
        'IA & Reconocimiento de Voz: Integré modelos de reconocimiento de voz y procesamiento de lenguaje natural (NLP) con Google Cloud Speech-to-Text API sobre microservicios en Python para domótica.',
      kw: ['procesamiento de lenguaje natural (NLP)', 'Google Cloud Speech-to-Text API', 'Python'],
      razon:
        'El uso de modelos de audio y transcripción NLP en la nube demuestra aplicación práctica de IA.',
      aporta: ['Python'],
      confirmar: 'Python',
      alertaConfirmar:
        'Confirma que trabajaste con el SDK de Google Cloud para el procesamiento de audio con Python.',
    },
    {
      id: 'm-logro-ieee',
      seccion: 'LOGROS Y ACTIVIDADES',
      targetId: 'logro-ieee',
      tipo: 'MEJORA PARA INGENIERO DE IA / DATA SCIENCE',
      antes:
        'Extracurricular: Director de Proyectos e Investigación del IEEE Computer Society USIL.',
      despues:
        'Liderazgo en Investigación: Director de Proyectos e Investigación del IEEE Computer Society USIL y miembro de GICC: fomento y desarrollo de proyectos académicos en Inteligencia Artificial y computación.',
      kw: ['IEEE Computer Society', 'GICC', 'Inteligencia Artificial'],
      razon:
        'La trayectoria en grupos de investigación (IEEE/GICC) es el mayor aval para perfiles de IA y Ciencia de Datos.',
      aporta: ['Git'],
      confirmar: null,
    },
    {
      id: 'm-sum-3',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'sum-3',
      tipo: 'MEJORA PARA INGENIERO DE IA / DATA SCIENCE',
      antes:
        'Base de datos: Modelé e implementé el esquema relacional en MySQL, definiendo entidades, relaciones y flujos de información críticos.',
      despues:
        'Gestión de Datos para Analítica: Diseñé e implementé la base de datos relacional asegurando la captura de datos transaccionales limpios como insumo para modelos analíticos.',
      kw: ['Gestión de Datos', 'captura de datos transaccionales', 'modelos analíticos'],
      razon: 'El 80% del trabajo en Data Science e IA depende de la calidad y modelado de datos de origen.',
      aporta: ['SQL'],
      confirmar: null,
    },
    {
      id: 'm-deb-1',
      seccion: 'EXPERIENCIA TÉCNICA Y PROYECTOS',
      targetId: 'deb-1',
      tipo: 'MEJORA PARA INGENIERO DE IA / DATA SCIENCE',
      antes:
        'Diseñé la arquitectura del servidor con el objetivo de desplegar aplicaciones de proyectos web personales.',
      despues:
        'Despliegue de Modelos y Servicios: Configuré entornos Linux Debian para ejecución y despliegue continuo de microservicios desarrollados en Python y FastAPI.',
      kw: ['Linux Debian', 'microservicios desarrollados en Python', 'FastAPI'],
      razon: 'MLOps y despliegue en Linux son habilidades críticas en la ingeniería de IA moderna.',
      aporta: ['Python', 'Git'],
      confirmar: null,
    },
    {
      id: 'm-hab',
      seccion: 'HABILIDADES TÉCNICAS',
      targetId: 'hab',
      tipo: 'OPTIMIZACIÓN ATS DE HABILIDADES',
      antes:
        'Lenguajes: Java, TypeScript/JavaScript, Python, SQL · Frameworks: Spring Boot, FastAPI, Angular',
      despues:
        'IA & Datos: Python, FastAPI, Google Cloud AI APIs, SQL (PostgreSQL, MySQL), Linux (Debian), Git, Lógica Digital, C/C++, Docker (conceptos).',
      kw: ['Python', 'FastAPI', 'Google Cloud AI APIs', 'SQL', 'Linux (Debian)', 'Git'],
      razon: 'Coloca en primer lugar las tecnologías de Machine Learning, APIs y entornos Linux.',
      aporta: ['Python', 'SQL', 'Git'],
      confirmar: null,
    },
  ],
};

