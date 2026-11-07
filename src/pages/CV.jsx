// Adaptador de CV Interactivo In-Situ.
// Muestra la hoja real del CV del estudiante (Frank Li) en formato de documento
// y permite aplicar mejoras contextuales basadas en el rol objetivo y datos de mercado.

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../store.js';
import { useMotor } from '../lib/motor.js';
import { ofertaPorId } from '../lib/mercado.js';
import { nombreRol } from '../data/mercado.js';
import { BloqueoPro, Cabecera, SinDiagnostico } from '../components/mercado.jsx';
import { CV_FRANK_RAW, MEJORAS_POR_ROL } from '../data/cv_frank.js';
import '../theme/cv-documento.css';

const ROLES_DISPONIBLES = [
  { id: 'desarrollador-backend-jr', label: 'Backend Jr' },
  { id: 'desarrollador-frontend-jr', label: 'Frontend Jr' },
  { id: 'analista-qa', label: 'Analista QA' },
  { id: 'analista-datos-jr', label: 'Analista de Datos Jr' },
  { id: 'data-scientist-jr', label: 'Ingeniero de IA' },
];

function partirKeywords(texto, keywords = []) {
  if (!keywords.length) return [{ t: texto, kw: false }];
  let partes = [{ t: texto, kw: false }];
  for (const kw of keywords) {
    partes = partes
      .flatMap((p) => {
        if (p.kw) return [p];
        const trozos = p.t.split(kw);
        return trozos.flatMap((x, i) =>
          i < trozos.length - 1 ? [{ t: x, kw: false }, { t: kw, kw: true }] : [{ t: x, kw: false }]
        );
      })
      .filter((p) => p.t);
  }
  return partes;
}

function TextoConBadges({ texto, keywords = [] }) {
  const partes = partirKeywords(texto, keywords);
  return (
    <>
      {partes.map((p, i) =>
        p.kw ? (
          <span key={`${p.t}-${i}`} className="cv-kw-badge">
            {p.t}
          </span>
        ) : (
          <span key={`${p.t}-${i}`}>{p.t}</span>
        )
      )}
    </>
  );
}

function TarjetaMejora({ mejora, aplicada, confirmada, onAplicar, onConfirmar, onCerrar }) {
  const necesitaConfirmar = Boolean(mejora.confirmar);

  return (
    <div className="cv-tarjeta-mejora" onClick={(e) => e.stopPropagation()}>
      <div className="cv-tarjeta-etiqueta">{mejora.tipo}</div>

      <div className="cv-tarjeta-propuesta">
        <TextoConBadges texto={mejora.despues} keywords={mejora.kw} />
      </div>

      <div className="cv-tarjeta-razon">{mejora.razon}</div>

      {necesitaConfirmar && (
        <div className="cv-alerta-confirmar">
          <span className="cv-alerta-confirmar-texto">
            {mejora.alertaConfirmar ||
              `Confirma que sea cierto antes de usarlo: tu CV menciona ${mejora.confirmar}, pero no dónde lo usaste.`}
          </span>
          <button
            type="button"
            className={`chip chip--opcion${confirmada ? ' chip--on' : ''}`}
            onClick={onConfirmar}
            style={{ fontSize: 12.5 }}
          >
            {confirmada ? `✓ Confirmado: usé ${mejora.confirmar} ahí` : `Sí, usé ${mejora.confirmar} ahí`}
          </button>
        </div>
      )}

      <div className="cv-tarjeta-acciones">
        <button
          type="button"
          className={aplicada ? 'cv-btn-deshacer' : 'cv-btn-aplicar'}
          onClick={onAplicar}
        >
          {aplicada ? '✓ Aplicado (Deshacer)' : 'Aplicar en mi CV'}
        </button>
        <button type="button" className="cv-btn-cerrar" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default function CV() {
  const [params] = useSearchParams();
  const { listo, rol: rolDiagnostico, esPro } = useMotor();
  const usuario = useApp((s) => s.usuario);

  const [rolSeleccionado, setRolSeleccionado] = useState(
    rolDiagnostico || 'desarrollador-backend-jr'
  );
  const [vista, setVista] = useState('mejoras'); // 'mejoras' | 'original'
  const [aplicadas, setAplicadas] = useState([]);
  const [confirmadas, setConfirmadas] = useState([]);
  const [abierta, setAbierta] = useState(null);
  const [copiado, setCopiado] = useState(false);

  if (!listo) return <SinDiagnostico que="El adaptador de CV" />;

  const ofertaId = params.get('oferta');
  const oferta = ofertaId ? ofertaPorId(ofertaId) : null;

  const mejoras = MEJORAS_POR_ROL[rolSeleccionado] || MEJORAS_POR_ROL['desarrollador-backend-jr'];
  const mejorasMap = Object.fromEntries(mejoras.map((m) => [m.id, m]));

  const buscarMejora = (id) => mejorasMap[id];
  const estaAplicada = (id) => aplicadas.includes(id);
  const estaConfirmada = (id) => confirmadas.includes(id);

  const alternarAplicada = (id) => {
    const mej = buscarMejora(id);
    if (!mej) return;
    if (mej.confirmar && !estaConfirmada(id) && !estaAplicada(id)) {
      setConfirmadas((prev) => [...prev, id]);
    }
    setAplicadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const alternarConfirmada = (id) => {
    setConfirmadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const aplicarTodas = () => {
    const todosIds = mejoras.map((m) => m.id);
    const aConfirmarIds = mejoras.filter((m) => m.confirmar).map((m) => m.id);
    setConfirmadas((prev) => Array.from(new Set([...prev, ...aConfirmarIds])));
    setAplicadas(todosIds);
    setAbierta(null);
  };

  const copiarTexto = async () => {
    const lines = [
      CV_FRANK_RAW.nombre,
      CV_FRANK_RAW.contacto,
      '',
      'EDUCACIÓN',
      CV_FRANK_RAW.educacion.institucion,
      CV_FRANK_RAW.educacion.periodo,
      estaAplicada('m-edu') ? buscarMejora('m-edu').despues : CV_FRANK_RAW.educacion.carrera,
      '',
      'PERFIL',
      estaAplicada('m-perfil') ? buscarMejora('m-perfil').despues : CV_FRANK_RAW.perfil,
      '',
      'EXPERIENCIA TÉCNICA Y PROYECTOS',
      ...CV_FRANK_RAW.proyectos.flatMap((p) => [
        `${p.titulo} (${p.fecha})`,
        ...p.bullets.map((b) => {
          const m = mejoras.find((x) => x.targetId === b.id);
          const t = m && estaAplicada(m.id) ? m.despues : b.texto;
          return `• ${t}`;
        }),
        '',
      ]),
      'HABILIDADES TÉCNICAS',
      estaAplicada('m-hab')
        ? buscarMejora('m-hab').despues
        : CV_FRANK_RAW.habilidades.map((h) => `${h.cat}: ${h.items.join(', ')}`).join('\n'),
      '',
      'LOGROS Y ACTIVIDADES',
      ...CV_FRANK_RAW.logros.map((l) => `• ${l.tipo}: ${l.texto}`),
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // fallback sin portapapeles
    }
  };

  const renderBloqueMejorable = (mejoraId, textoOriginal, esParrafo = false) => {
    if (vista === 'original') {
      return <span>{textoOriginal}</span>;
    }

    const mejora = buscarMejora(mejoraId);
    if (!mejora) return <span>{textoOriginal}</span>;

    const aplicada = estaAplicada(mejoraId);
    const confirmada = estaConfirmada(mejoraId);
    const estaAbierta = abierta === mejoraId;
    const claseHighlight = aplicada ? 'cv-verde' : 'cv-lila';

    return (
      <div style={{ position: 'relative' }}>
        <div
          className={esParrafo ? `cv-bloque-interactivo ${claseHighlight}` : `cv-linea-interactiva ${claseHighlight}`}
          onClick={() => setAbierta(estaAbierta ? null : mejoraId)}
          title="Toca para ver y aplicar la mejora"
        >
          {aplicada ? (
            <TextoConBadges texto={mejora.despues} keywords={mejora.kw} />
          ) : (
            <span>{textoOriginal}</span>
          )}
        </div>

        {estaAbierta && (
          <TarjetaMejora
            mejora={mejora}
            aplicada={aplicada}
            confirmada={confirmada}
            onAplicar={() => alternarAplicada(mejoraId)}
            onConfirmar={() => alternarConfirmada(mejoraId)}
            onCerrar={() => setAbierta(null)}
          />
        )}
      </div>
    );
  };

  const contenido = (
    <div className="cv-contenedor">
      {/* ── Barra de selección de rol y controles ── */}
      <div className="cv-controles-barra">
        <div className="cv-roles-selector">
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
            ROL OBJETIVO:
          </span>
          {ROLES_DISPONIBLES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`chip chip--opcion${rolSeleccionado === r.id ? ' chip--on' : ''}`}
              onClick={() => {
                setRolSeleccionado(r.id);
                setAbierta(null);
              }}
              style={{ fontSize: 12.5 }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="fila" style={{ gap: 10, alignItems: 'center' }}>
          <div className="cv-selector-vistas">
            <button
              type="button"
              className={`cv-btn-vista${vista === 'mejoras' ? ' cv-btn-vista--activo' : ''}`}
              onClick={() => setVista('mejoras')}
            >
              Con mejoras
            </button>
            <button
              type="button"
              className={`cv-btn-vista${vista === 'original' ? ' cv-btn-vista--activo' : ''}`}
              onClick={() => {
                setVista('original');
                setAbierta(null);
              }}
            >
              Original
            </button>
          </div>

          {vista === 'mejoras' && (
            <>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {aplicadas.length} de {mejoras.length} mejoras aplicadas
              </span>
              <button
                type="button"
                className="btn btn--linea"
                style={{ padding: '6px 14px', fontSize: 12.5, fontWeight: 700 }}
                onClick={aplicarTodas}
              >
                Aplicar todas
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Instrucción contextual ── */}
      <div className="cv-instruccion-barra">
        {vista === 'mejoras' ? (
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Las líneas en <strong className="cv-txt-lila">lila</strong> tienen una mejora para{' '}
            <strong>{nombreRol(rolSeleccionado)}</strong>; tócalas para verla y aplicarla. Las{' '}
            <strong className="cv-txt-verde">verdes</strong> ya están aplicadas.{' '}
            {mejoras.some((m) => m.confirmar) && '1 necesita que confirmes algo antes.'}
          </span>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Así está el PDF que subiste. Cambia a «Con mejoras» para editarlo y adaptarlo a{' '}
            <strong>{nombreRol(rolSeleccionado)}</strong>.
          </span>
        )}
      </div>

      {/* ── Hoja de CV A4 Document Preview ── */}
      <div className="cv-hoja">
        {/* Cabecera del Documento */}
        <div className="cv-hoja-header">
          <h1 className="cv-hoja-nombre">{usuario?.nombre || CV_FRANK_RAW.nombre}</h1>
          <div className="cv-hoja-contacto">{CV_FRANK_RAW.contacto}</div>
        </div>

        {/* EDUCACIÓN */}
        <div className="cv-seccion">
          <div className="cv-seccion-titulo">EDUCACIÓN</div>
          <div className="pila" style={{ gap: 2 }}>
            <strong style={{ fontSize: 14 }}>{CV_FRANK_RAW.educacion.institucion}</strong>
            <span style={{ fontSize: 12.5, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              {CV_FRANK_RAW.educacion.periodo}
            </span>
            <div style={{ marginTop: 2 }}>
              {renderBloqueMejorable('m-edu', CV_FRANK_RAW.educacion.carrera)}
            </div>
          </div>
        </div>

        {/* PERFIL */}
        <div className="cv-seccion">
          <div className="cv-seccion-titulo">PERFIL</div>
          {renderBloqueMejorable('m-perfil', CV_FRANK_RAW.perfil, true)}
        </div>

        {/* EXPERIENCIA TÉCNICA Y PROYECTOS */}
        <div className="cv-seccion">
          <div className="cv-seccion-titulo">EXPERIENCIA TÉCNICA Y PROYECTOS</div>
          <div className="pila" style={{ gap: 16 }}>
            {/* Proyecto 1: Cadena de Suministros */}
            <div className="pila" style={{ gap: 6 }}>
              <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: 13.5 }}>Sistema web de gestión de cadena de suministros</strong>
                <span style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-secondary)' }}>Agos 2025</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.55 }}>
                <li>
                  {renderBloqueMejorable(
                    'm-sum-1',
                    'Diseñé y desarrollé una aplicación web completa para optimizar el control de inventarios, modelando procesos de abastecimiento, almacenamiento y distribución.'
                  )}
                </li>
                <li style={{ marginTop: 4 }}>
                  {renderBloqueMejorable(
                    'm-sum-2',
                    'Backend: Implementé una API REST con Spring Boot, aplicando arquitectura por capas. Frontend: Desarrollé la interfaz de usuario modular y reactiva con Angular (TypeScript), consumiendo la API.'
                  )}
                </li>
                <li style={{ marginTop: 4 }}>
                  {renderBloqueMejorable(
                    'm-sum-3',
                    'Base de datos: Modelé e implementé el esquema relacional en MySQL, definiendo entidades, relaciones y flujos de información críticos.'
                  )}
                </li>
              </ul>
            </div>

            {/* Proyecto 2: Procesamiento de Voz Domótico */}
            <div className="pila" style={{ gap: 6 }}>
              <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: 13.5 }}>
                  Sistema de procesamiento de voz en una arquitectura Cliente-Servidor para un sistema de control domótico
                </strong>
                <span style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-secondary)' }}>Agos 2025</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.55 }}>
                <li>
                  {renderBloqueMejorable(
                    'm-dom-1',
                    'Diseñé un sistema domótico basado en una arquitectura cliente–servidor para el control de dispositivos mediante comandos de voz.'
                  )}
                </li>
                <li style={{ marginTop: 4 }}>
                  {renderBloqueMejorable(
                    'm-dom-2',
                    'Desplegué en la web una interfaz amigable utilizando Ngrok para la ejecución de comandos usando HTML, CSS y JavaScript.'
                  )}
                </li>
                <li style={{ marginTop: 4 }}>
                  {renderBloqueMejorable(
                    'm-dom-3',
                    'Implementé en la parte del Backend con Python el API Cloud Speech-to-text de Google para el procesamiento de los comandos de voz.'
                  )}
                </li>
              </ul>
            </div>

            {/* Proyecto 3: Servidor Debian 13 */}
            <div className="pila" style={{ gap: 6 }}>
              <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: 13.5 }}>Configuración de servidor web de auto hosting en Debian 13 (Linux)</strong>
                <span style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-secondary)' }}>Mar 2025</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.55 }}>
                <li>
                  {renderBloqueMejorable(
                    'm-deb-1',
                    'Diseñé la arquitectura del servidor con el objetivo de desplegar aplicaciones de proyectos web personales.'
                  )}
                </li>
                <li style={{ marginTop: 4 }}>
                  {renderBloqueMejorable(
                    'm-deb-2',
                    'Configuré dos máquinas virtuales para albergar las aplicaciones y la base de datos de manera independiente.'
                  )}
                </li>
                <li style={{ marginTop: 4 }}>
                  {renderBloqueMejorable(
                    'm-deb-3',
                    'Configuré Apache (HTTP Server) como servidor para alojar las aplicaciones web.'
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* HABILIDADES TÉCNICAS */}
        <div className="cv-seccion">
          <div className="cv-seccion-titulo">HABILIDADES TÉCNICAS</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            {renderBloqueMejorable(
              'm-hab',
              '• Lenguajes: Java, TypeScript/JavaScript, Python, SQL, C/C++ (Arduino)\n• Frameworks: Spring Boot, FastAPI, Angular, Hibernate, Bootstrap\n• Bases de Datos & Herramientas: PostgreSQL, MySQL, Git, Docker (conceptos), Arduino IDE\n• Metodologías: Desarrollo API REST, Modelado ER, Scrum, Dmbook.',
              true
            )}
          </div>
        </div>

        {/* LOGROS Y ACTIVIDADES */}
        <div className="cv-seccion" style={{ marginBottom: 0 }}>
          <div className="cv-seccion-titulo">LOGROS Y ACTIVIDADES</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
            <li>
              {renderBloqueMejorable(
                'm-logro-ieee',
                'Extracurricular: Director de Proyectos e Investigación del IEEE Computer Society USIL.'
              )}
            </li>
            <li>Miembro activo del Grupo de Investigación de Ciencias de la Computación USIL (GICC).</li>
            <li>
              Participación: “Training Camp UPC 2025”: Campamento de programación competitiva, 4to lugar.
            </li>
            <li>
              {renderBloqueMejorable(
                'm-logro-oracle',
                'Cursos complementarios: “Database for Developers: Foundations”, “Database for Developers: Next Level” (Oracle Dev Gym, 2025).'
              )}
            </li>
            <li>Idiomas: Español (Nativo), Inglés (Intermedio B1 – en formación activa).</li>
          </ul>
        </div>
      </div>

      {/* ── Acciones inferiores ── */}
      <div className="cv-acciones-inferior fila" style={{ gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn--acento" onClick={() => window.print()}>
          Descargar PDF
        </button>
        <button type="button" className="btn btn--linea" onClick={copiarTexto}>
          {copiado ? '✓ Copiado al portapapeles' : 'Copiar texto'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="panel">
      <Cabecera
        eti={`ADAPTAR MI CV · ${nombreRol(rolSeleccionado).toUpperCase()}`}
        titulo="Tu CV, con las palabras que usan los avisos"
      >
        No inventamos experiencia: si algo no está en tu CV, no lo agregamos y te avisamos.
        {oferta && ` Adaptado a «${oferta.puesto}» de ${oferta.empresa}.`}
      </Cabecera>

      {esPro ? (
        contenido
      ) : (
        <BloqueoPro
          titulo="Tu CV reescrito con las palabras de los avisos."
          detalle={`Bullet por bullet, con las frases exactas que piden las ofertas de ${nombreRol(
            rolSeleccionado
          )} — y sin inventarte experiencia.`}
          destino="/cv"
        >
          {contenido}
        </BloqueoPro>
      )}
    </div>
  );
}
