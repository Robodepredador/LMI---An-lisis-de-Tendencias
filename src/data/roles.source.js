// Fuente curada del catálogo. Editar aquí; `npm run catalogo` regenera catalogo.json
// y falla si alguna cifra deja de ser coherente.
//
// hab:  [habilidad, % de ofertas que la piden, cambio en puntos vs. año anterior]
// sal:  [p25, mediana, p75] en soles brutos mensuales, a nivel nacional
// decl: cuántas de las `ofertas` declaran salario (siempre < ofertas)

export const AREAS = [
  'Datos y Analítica', 'Finanzas', 'Marketing', 'Ingeniería Industrial',
  'Derecho', 'Sistemas', 'Psicología', 'Administración',
];

// peso = reparto de ofertas por ciudad; mult = ajuste salarial sobre la mediana nacional
export const CIUDADES = [
  { k: 'Lima',     peso: 0.56, mult: 1.00 },
  { k: 'Arequipa', peso: 0.11, mult: 0.86 },
  { k: 'Trujillo', peso: 0.075, mult: 0.82 },
  { k: 'Cusco',    peso: 0.035, mult: 0.80 },
  { k: 'Remoto',   peso: 0.11, mult: 1.08 },
];

export const ROLES = [
  // ── Datos y Analítica ──────────────────────────────────────────────
  { id: 'analista-datos-jr', n: 'Analista de Datos junior', a: 'Datos y Analítica', niv: 'junior',
    sin: ['analista de data', 'data analyst', 'analista datos'], ofertas: 1264, decl: 708, sal: [2600, 3400, 4300],
    hab: [['SQL', 81, 19], ['Excel avanzado', 74, 2], ['Power BI', 63, 19], ['Python', 52, 6], ['Estadística', 41, 0], ['Comunicar resultados', 38, 4]] },
  { id: 'analista-bi-jr', n: 'Analista de BI junior', a: 'Datos y Analítica', niv: 'junior',
    sin: ['business intelligence', 'analista bi', 'desarrollador bi'], ofertas: 712, decl: 406, sal: [2900, 3700, 4800],
    hab: [['Power BI', 89, 14], ['SQL', 86, 8], ['Excel avanzado', 68, -3], ['Modelado de datos', 58, 11], ['DAX', 44, 16], ['ETL', 37, 9]] },
  { id: 'data-scientist-jr', n: 'Data Scientist junior', a: 'Datos y Analítica', niv: 'junior',
    sin: ['científico de datos', 'data science'], ofertas: 389, decl: 218, sal: [3800, 4800, 6200],
    hab: [['Python', 91, 7], ['Estadística', 84, 3], ['SQL', 77, 5], ['Machine learning', 72, 21], ['Inglés intermedio', 64, 6], ['Pandas', 59, 12]] },
  { id: 'ingeniero-datos', n: 'Ingeniero de Datos', a: 'Datos y Analítica', niv: 'semi-senior',
    sin: ['data engineer', 'ingeniero de data'], ofertas: 296, decl: 160, sal: [4200, 5600, 7400],
    hab: [['SQL', 88, 4], ['Python', 79, 9], ['ETL', 74, 13], ['Cloud (AWS/Azure)', 66, 24], ['Spark', 41, 15], ['Airflow', 33, 18]] },
  { id: 'analista-datos-semi', n: 'Analista de Datos semi-senior', a: 'Datos y Analítica', niv: 'semi-senior',
    sin: ['analista de datos ssr', 'analista datos senior'], ofertas: 437, decl: 240, sal: [3900, 4900, 6100],
    hab: [['SQL', 87, 6], ['Power BI', 71, 12], ['Python', 64, 14], ['Estadística', 52, 2], ['Gestión de stakeholders', 44, 8]] },

  // ── Finanzas ───────────────────────────────────────────────────────
  { id: 'analista-financiero', n: 'Analista Financiero', a: 'Finanzas', niv: 'junior',
    sin: ['analista de finanzas', 'finanzas corporativas'], ofertas: 1041, decl: 593, sal: [2800, 3600, 4700],
    hab: [['Excel avanzado', 92, 1], ['Análisis financiero', 78, 3], ['SAP', 51, 7], ['Inglés intermedio', 46, 5], ['Power BI', 38, 17], ['NIIF', 34, 2]] },
  { id: 'analista-riesgos', n: 'Analista de Riesgos', a: 'Finanzas', niv: 'junior',
    sin: ['riesgo crediticio', 'gestión de riesgos', 'risk analyst'], ofertas: 488, decl: 278, sal: [3100, 3900, 5000],
    hab: [['Excel avanzado', 88, 0], ['Modelos de riesgo', 62, 9], ['SQL', 57, 22], ['Normativa SBS', 48, 4], ['SAS o R', 34, -6]] },
  { id: 'analista-inversiones', n: 'Analista de Inversiones', a: 'Finanzas', niv: 'junior',
    sin: ['inversiones', 'portafolio', 'equity research'], ofertas: 214, decl: 120, sal: [3600, 4600, 6000],
    hab: [['Excel avanzado', 94, 0], ['Valorización', 71, 5], ['Inglés avanzado', 68, 8], ['Bloomberg', 39, 3], ['Python', 27, 15]] },
  { id: 'asistente-contable', n: 'Asistente Contable', a: 'Finanzas', niv: 'junior',
    sin: ['auxiliar contable', 'contabilidad'], ofertas: 1583, decl: 839, sal: [1500, 1950, 2500],
    hab: [['Excel', 86, 0], ['SUNAT y tributario', 71, 3], ['Concar o Siscont', 64, -2], ['NIIF', 32, 4], ['SAP', 28, 9]] },
  { id: 'analista-credito', n: 'Analista de Créditos', a: 'Finanzas', niv: 'junior',
    sin: ['créditos', 'evaluación crediticia'], ofertas: 667, decl: 360, sal: [2200, 2800, 3600],
    hab: [['Evaluación crediticia', 84, 2], ['Excel', 79, 0], ['Normativa SBS', 52, 6], ['Atención al cliente', 47, 3]] },

  // ── Marketing ──────────────────────────────────────────────────────
  { id: 'analista-marketing-digital', n: 'Analista de Marketing Digital', a: 'Marketing', niv: 'junior',
    sin: ['marketing digital', 'performance marketing'], ofertas: 892, decl: 491, sal: [2400, 3100, 4100],
    hab: [['Google Analytics', 82, 6], ['Meta Ads', 77, 11], ['Google Ads', 71, 8], ['Excel', 58, 0], ['SEO', 49, 4], ['Looker Studio', 37, 19]] },
  { id: 'community-manager', n: 'Community Manager', a: 'Marketing', niv: 'junior',
    sin: ['redes sociales', 'social media'], ofertas: 1147, decl: 665, sal: [1800, 2300, 3000],
    hab: [['Gestión de redes', 91, 1], ['Creación de contenido', 84, 7], ['Canva y diseño básico', 66, 5], ['Meta Ads', 52, 13], ['Analítica de redes', 44, 9]] },
  { id: 'especialista-seo-sem', n: 'Especialista SEO/SEM', a: 'Marketing', niv: 'semi-senior',
    sin: ['seo', 'sem', 'posicionamiento web'], ofertas: 263, decl: 147, sal: [3000, 3900, 5100],
    hab: [['SEO técnico', 88, 9], ['Google Analytics', 83, 3], ['Google Ads', 79, 4], ['Semrush o Ahrefs', 61, 12], ['HTML básico', 43, 0]] },
  { id: 'analista-investigacion-mercados', n: 'Analista de Investigación de Mercados', a: 'Marketing', niv: 'junior',
    sin: ['investigación de mercado', 'market research', 'estudios de mercado'], ofertas: 318, decl: 175, sal: [2500, 3200, 4200],
    hab: [['Excel avanzado', 81, 0], ['Diseño de encuestas', 79, 2], ['Estadística', 63, 4], ['Presentación de hallazgos', 58, 6], ['SPSS', 57, -8]] },

  // ── Ingeniería Industrial ──────────────────────────────────────────
  { id: 'analista-procesos', n: 'Analista de Procesos', a: 'Ingeniería Industrial', niv: 'junior',
    sin: ['mejora continua', 'procesos', 'lean'], ofertas: 741, decl: 430, sal: [2600, 3300, 4300],
    hab: [['Excel avanzado', 86, 0], ['Mapeo de procesos', 81, 4], ['Lean y Six Sigma', 74, 11], ['Power BI', 41, 21], ['AutoCAD', 29, -4]] },
  { id: 'analista-logistica', n: 'Analista de Logística', a: 'Ingeniería Industrial', niv: 'junior',
    sin: ['supply chain', 'cadena de suministro', 'almacén'], ofertas: 968, decl: 523, sal: [2300, 3000, 3900],
    hab: [['Excel avanzado', 89, 0], ['Gestión de inventarios', 77, 3], ['Indicadores logísticos', 64, 8], ['SAP MM/WM', 58, 7], ['Negociación con proveedores', 42, 2]] },
  { id: 'analista-calidad', n: 'Analista de Calidad', a: 'Ingeniería Industrial', niv: 'junior',
    sin: ['aseguramiento de calidad', 'iso', 'qa industrial'], ofertas: 534, decl: 288, sal: [2400, 3100, 4000],
    hab: [['ISO 9001', 83, 2], ['Excel', 79, 0], ['Auditorías internas', 68, 5], ['Estadística aplicada', 44, 3], ['HACCP', 37, 6]] },
  { id: 'jefe-produccion', n: 'Jefe de Producción', a: 'Ingeniería Industrial', niv: 'semi-senior',
    sin: ['supervisor de producción', 'planta'], ofertas: 387, decl: 209, sal: [4500, 5800, 7600],
    hab: [['Gestión de equipos', 88, 3], ['Indicadores de producción', 84, 2], ['Seguridad industrial', 76, 6], ['Lean y Six Sigma', 71, 9], ['SAP PP', 48, 5]] },

  // ── Derecho ────────────────────────────────────────────────────────
  { id: 'asistente-legal', n: 'Asistente Legal', a: 'Derecho', niv: 'junior',
    sin: ['auxiliar legal', 'practicante de derecho', 'asistente de abogado'], ofertas: 824, decl: 470, sal: [1600, 2100, 2700],
    hab: [['Redacción de documentos', 89, 1], ['Gestión de expedientes', 82, 2], ['Investigación jurídica', 71, 3], ['Excel', 46, 4]] },
  { id: 'abogado-corporativo-jr', n: 'Abogado Corporativo junior', a: 'Derecho', niv: 'junior',
    sin: ['abogado corporativo', 'derecho corporativo', 'legal corporativo'], ofertas: 412, decl: 239, sal: [2900, 3800, 5000],
    hab: [['Contratos', 91, 3], ['Derecho societario', 84, 2], ['Inglés intermedio', 57, 9], ['Cumplimiento normativo', 52, 11], ['Due diligence', 48, 6]] },
  { id: 'analista-cumplimiento', n: 'Analista de Cumplimiento', a: 'Derecho', niv: 'junior',
    sin: ['compliance', 'cumplimiento normativo', 'oficial de cumplimiento'], ofertas: 297, decl: 163, sal: [3200, 4100, 5300],
    hab: [['Prevención LAFT', 86, 14], ['Normativa SBS', 68, 5], ['Excel', 63, 0], ['Auditoría', 59, 3], ['Inglés intermedio', 51, 7]] },
  { id: 'abogado-laboral-jr', n: 'Abogado Laboral junior', a: 'Derecho', niv: 'junior',
    sin: ['derecho laboral', 'abogado laboralista'], ofertas: 236, decl: 135, sal: [2700, 3500, 4600],
    hab: [['Derecho laboral', 94, 1], ['Litigios', 72, 2], ['SUNAFIL', 63, 8], ['Negociación colectiva', 48, 4]] },

  // ── Sistemas ───────────────────────────────────────────────────────
  { id: 'desarrollador-backend-jr', n: 'Desarrollador Backend junior', a: 'Sistemas', niv: 'junior',
    sin: ['backend', 'programador backend', 'desarrollador java', 'desarrollador node'], ofertas: 1038, decl: 561, sal: [3000, 3900, 5200],
    hab: [['Java o Node.js', 88, 5], ['SQL', 84, 2], ['APIs REST', 81, 7], ['Git', 79, 3], ['Docker', 47, 18], ['Cloud (AWS/Azure)', 43, 22]] },
  { id: 'desarrollador-frontend-jr', n: 'Desarrollador Frontend junior', a: 'Sistemas', niv: 'junior',
    sin: ['frontend', 'programador frontend', 'desarrollador react'], ofertas: 794, decl: 437, sal: [2800, 3600, 4800],
    hab: [['JavaScript', 93, 1], ['HTML y CSS', 91, 0], ['React', 78, 12], ['Git', 76, 3], ['TypeScript', 54, 23], ['Figma', 38, 7]] },
  { id: 'analista-soporte-ti', n: 'Analista de Soporte TI', a: 'Sistemas', niv: 'junior',
    sin: ['soporte técnico', 'mesa de ayuda', 'help desk'], ofertas: 1296, decl: 687, sal: [1900, 2400, 3100],
    hab: [['Windows y Office 365', 88, 0], ['Atención al usuario', 84, 3], ['Redes básicas', 71, 2], ['Active Directory', 52, 4], ['SQL básico', 33, 6]] },
  { id: 'analista-qa', n: 'Analista QA', a: 'Sistemas', niv: 'junior',
    sin: ['qa', 'tester', 'control de calidad software', 'quality assurance'], ofertas: 467, decl: 266, sal: [2700, 3500, 4600],
    hab: [['Pruebas funcionales', 89, 1], ['Jira', 74, 2], ['SQL', 61, 4], ['Automatización con Selenium', 58, 16], ['Pruebas de API', 46, 13]] },
  { id: 'analista-ciberseguridad-jr', n: 'Analista de Ciberseguridad junior', a: 'Sistemas', niv: 'junior',
    sin: ['ciberseguridad', 'seguridad informática', 'security analyst', 'soc'], ofertas: 258, decl: 150, sal: [3500, 4500, 5800],
    hab: [['Gestión de vulnerabilidades', 81, 17], ['Redes y firewalls', 76, 4], ['Inglés intermedio', 67, 5], ['ISO 27001', 63, 8], ['SIEM', 54, 21]] },

  // ── Psicología ─────────────────────────────────────────────────────
  { id: 'psicologo-organizacional', n: 'Psicólogo Organizacional', a: 'Psicología', niv: 'junior',
    sin: ['psicología organizacional', 'psicólogo laboral'], ofertas: 583, decl: 315, sal: [2100, 2700, 3500],
    hab: [['Evaluación psicolaboral', 86, 2], ['Clima y cultura', 73, 6], ['Capacitación', 68, 4], ['Excel', 57, 0], ['Gestión del desempeño', 51, 7]] },
  { id: 'analista-seleccion', n: 'Analista de Selección', a: 'Psicología', niv: 'junior',
    sin: ['reclutamiento', 'selección de personal', 'recruiter', 'talent acquisition'], ofertas: 1124, decl: 629, sal: [2000, 2600, 3400],
    hab: [['Entrevista por competencias', 91, 2], ['Fuentes de reclutamiento', 82, 5], ['LinkedIn Recruiter', 64, 11], ['Excel', 61, 0], ['Employer branding', 38, 14]] },
  { id: 'psicologo-clinico-jr', n: 'Psicólogo Clínico junior', a: 'Psicología', niv: 'junior',
    sin: ['psicología clínica', 'terapeuta', 'psicólogo asistencial'], ofertas: 341, decl: 194, sal: [1900, 2500, 3300],
    hab: [['Evaluación psicológica', 89, 1], ['Historia clínica', 81, 2], ['Intervención breve', 74, 5], ['Terapia cognitivo-conductual', 62, 7]] },
  { id: 'analista-clima-cultura', n: 'Analista de Clima y Cultura', a: 'Psicología', niv: 'junior',
    sin: ['clima laboral', 'cultura organizacional', 'engagement'], ofertas: 187, decl: 107, sal: [2400, 3100, 4000],
    hab: [['Análisis de clima', 88, 4], ['Diseño de encuestas', 84, 3], ['Excel avanzado', 71, 0], ['Comunicación interna', 66, 5], ['Power BI', 34, 18]] },

  // ── Administración ─────────────────────────────────────────────────
  { id: 'asistente-administrativo', n: 'Asistente Administrativo', a: 'Administración', niv: 'junior',
    sin: ['auxiliar administrativo', 'asistente de gerencia', 'recepción'], ofertas: 1872, decl: 1030, sal: [1400, 1800, 2300],
    hab: [['Excel', 87, 0], ['Office 365', 84, 2], ['Atención al cliente', 79, 1], ['Gestión documental', 71, 2], ['Facturación', 48, 3]] },
  { id: 'analista-rrhh', n: 'Analista de Recursos Humanos', a: 'Administración', niv: 'junior',
    sin: ['rrhh', 'recursos humanos', 'gestión humana', 'analista de personal'], ofertas: 946, decl: 501, sal: [2200, 2900, 3700],
    hab: [['Excel avanzado', 86, 0], ['Planilla y beneficios', 82, 2], ['Legislación laboral', 68, 4], ['Selección', 59, 3], ['Indicadores de RRHH', 47, 12]] },
  { id: 'coordinador-operaciones', n: 'Coordinador de Operaciones', a: 'Administración', niv: 'semi-senior',
    sin: ['operaciones', 'jefe de operaciones', 'coordinador operativo'], ofertas: 512, decl: 271, sal: [3400, 4400, 5700],
    hab: [['Gestión de equipos', 87, 3], ['Excel avanzado', 84, 0], ['Indicadores operativos', 81, 6], ['Mejora de procesos', 66, 8], ['Negociación', 54, 2]] },
  { id: 'analista-comercial', n: 'Analista Comercial', a: 'Administración', niv: 'junior',
    sin: ['análisis comercial', 'inteligencia comercial', 'trade'], ofertas: 703, decl: 387, sal: [2300, 3000, 3900],
    hab: [['Excel avanzado', 91, 0], ['Análisis de ventas', 84, 3], ['CRM (Salesforce o HubSpot)', 56, 15], ['Negociación', 48, 2], ['Power BI', 44, 20]] },
];

export const CURSOS = [
  { id: 'sql-datum',         skill: 'SQL',                        t: 'SQL para análisis de datos: de cero a intermedio', p: 'Academia Datum · en línea',        meta: ['6 semanas', 'S/ 180', '4.7 ★'] },
  { id: 'powerbi-codigolab', skill: 'Power BI',                   t: 'Power BI aplicado: dashboards para negocio',       p: 'CódigoLab · en vivo',              meta: ['5 semanas', 'S/ 240', '4.6 ★'] },
  { id: 'ruta-analista',     skill: 'SQL',                        t: 'Ruta Analista de Datos junior',                    p: 'Escuela Andes Online · a tu ritmo', meta: ['12 semanas', 'S/ 390', 'Certificado'] },
  { id: 'python-datos',      skill: 'Python',                     t: 'Python para análisis y automatización',            p: 'Academia Datum · en línea',        meta: ['8 semanas', 'S/ 260', '4.8 ★'] },
  { id: 'excel-avanzado',    skill: 'Excel avanzado',             t: 'Excel avanzado para analistas',                    p: 'CódigoLab · a tu ritmo',           meta: ['4 semanas', 'S/ 120', '4.5 ★'] },
  { id: 'ingles-negocios',   skill: 'Inglés intermedio',          t: 'Inglés para entornos corporativos',                p: 'Instituto Lima Idiomas · en vivo', meta: ['16 semanas', 'S/ 540', '4.4 ★'] },
  { id: 'lean-six',          skill: 'Lean y Six Sigma',           t: 'Lean Six Sigma Yellow Belt',                       p: 'Escuela Andes Online · en línea',  meta: ['7 semanas', 'S/ 310', 'Certificado'] },
  { id: 'ads-performance',   skill: 'Meta Ads',                   t: 'Campañas de performance en Meta y Google',         p: 'CódigoLab · en vivo',              meta: ['5 semanas', 'S/ 220', '4.6 ★'] },
  { id: 'js-react',          skill: 'React',                      t: 'React desde cero para desarrolladores junior',     p: 'Academia Datum · a tu ritmo',      meta: ['10 semanas', 'S/ 350', '4.7 ★'] },
  { id: 'iso-27001',         skill: 'ISO 27001',                  t: 'Fundamentos de seguridad de la información',       p: 'Escuela Andes Online · en línea',  meta: ['6 semanas', 'S/ 280', '4.5 ★'] },
  { id: 'competencias-rrhh', skill: 'Entrevista por competencias', t: 'Entrevista por competencias en la práctica',      p: 'Instituto Lima Idiomas · en vivo', meta: ['4 semanas', 'S/ 190', '4.6 ★'] },
  { id: 'contratos-legal',   skill: 'Contratos',                  t: 'Redacción y negociación de contratos',             p: 'CódigoLab · en línea',             meta: ['6 semanas', 'S/ 300', '4.5 ★'] },
  { id: 'sap-logistica',     skill: 'SAP MM/WM',                  t: 'SAP para logística y almacenes',                   p: 'Escuela Andes Online · en vivo',   meta: ['8 semanas', 'S/ 420', '4.4 ★'] },
  { id: 'analytics-ga4',     skill: 'Google Analytics',           t: 'Google Analytics 4 para marketing',                p: 'CódigoLab · a tu ritmo',           meta: ['4 semanas', 'S/ 160', '4.6 ★'] },
];

// Malla curricular por carrera — base de la vista docente de brechas
export const MALLAS = {
  'Economía':               ['Excel avanzado', 'Estadística', 'Inglés avanzado', 'Análisis financiero', 'Econometría'],
  'Administración':         ['Excel avanzado', 'Negociación', 'Gestión de equipos', 'Atención al cliente'],
  'Ingeniería de Sistemas': ['Java o Node.js', 'HTML y CSS', 'SQL', 'Redes básicas', 'Git'],
  'Psicología':             ['Evaluación psicológica', 'Clima y cultura', 'Estadística', 'Entrevista por competencias'],
};

// Áreas que alimentan cada carrera, para las brechas docentes
export const CARRERA_AREAS = {
  'Economía':               ['Finanzas', 'Datos y Analítica'],
  'Administración':         ['Administración', 'Marketing'],
  'Ingeniería de Sistemas': ['Sistemas', 'Datos y Analítica'],
  'Psicología':             ['Psicología', 'Administración'],
};
