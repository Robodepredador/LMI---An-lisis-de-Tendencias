// Diagnóstico rápido · 3 pasos, sin escribir nada.
//
// Es la puerta de entrada del producto: da valor antes de pedir que el
// estudiante escriba algo. Al terminar, guarda el diagnóstico y lleva al
// reporte de brecha.

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CICLOS, useApp } from '../store.js';
import {
  CIUDADES_DEFECTO, CIUDADES_DIAG, ROLES_MOTOR, SKILLS_CV, SKILLS_OFRECIDAS,
  CV_DEMO, nombreRol,
} from '../data/mercado.js';
import { calc, camino, totalDe } from '../lib/mercado.js';
import Lumi from '../mascota/Lumi.jsx';

const MAX_MB = 5;
const MIN_SKILLS = 5;

function Stepper({ paso }) {
  const pasos = [['1', 'Tu perfil'], ['2', 'Tu meta'], ['3', 'Tu diagnóstico']];
  return (
    <div className="diag-pasos">
      {pasos.map(([n, t], i) => {
        const idx = i + 1;
        const hecho = paso > idx;
        const activo = paso === idx;
        return (
          <div
            key={n}
            className={`diag-paso${activo ? ' diag-paso--activo' : ''}`}
            aria-current={activo ? 'step' : undefined}
          >
            <span
              aria-hidden="true"
              style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, flex: 'none',
                background: hecho ? 'var(--resalte)' : activo ? 'var(--accent)' : 'var(--bg-surface)',
                color: hecho ? 'var(--resalte-fg)' : activo ? 'var(--accent-fg)' : 'var(--text-secondary)',
                border: hecho || activo ? '0' : '1px solid var(--linea)',
                transition: 'all var(--duration) var(--ease-out)',
              }}
            >
              {hecho ? '✓' : n}
            </span>
            <span className="diag-paso__txt">{t}</span>
          </div>
        );
      })}
    </div>
  );
}

// La tarjeta NO puede ser un <button>: dentro van un <select>, un
// <input type="file"> y los chips, y un control dentro de otro es HTML
// inválido además de dejar la tarjeta sin nombre accesible. El botón es solo
// la cabecera; el cuerpo vive fuera de él.
function RadioCard({ activa, onClick, titulo, descripcion, children }) {
  return (
    <div
      className="pila diag-opcion"
      style={{
        gap: 14,
        borderRadius: 'var(--radio-xl)',
        background: activa ? 'var(--bg-surface)' : 'var(--bg-elevated)',
        border: activa ? '2px solid var(--accent)' : '1px solid var(--linea)',
        boxShadow: activa ? '0 4px 16px rgba(75, 59, 255, 0.06)' : 'none',
        transition: 'all var(--duration) var(--ease-out)',
      }}
    >
      <button
        type="button"
        role="radio"
        aria-checked={activa}
        onClick={onClick}
        className="fila"
        style={{
          gap: 12, alignItems: 'center', cursor: 'pointer', textAlign: 'left',
          background: 'none', border: 0, padding: 0, font: 'inherit',
          color: 'var(--text-primary)', width: '100%',
        }}
      >
        <span className="radio" data-on={activa} aria-hidden="true" />
        <span className="pila" style={{ gap: 2 }}>
          <strong style={{ fontSize: 15.5, letterSpacing: '-0.01em' }}>{titulo}</strong>
          {descripcion && (
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 400 }}>{descripcion}</span>
          )}
        </span>
      </button>
      {activa && children}
    </div>
  );
}

export default function Diagnostico() {
  const ir = useNavigate();
  const [params] = useSearchParams();
  const usuario = useApp((s) => s.usuario);
  const perfilGuardado = useApp((s) => s.perfil);
  const diagnostico = useApp((s) => s.diagnostico);
  const guardarPerfilMotor = useApp((s) => s.guardarPerfilMotor);
  const guardarDiagnostico = useApp((s) => s.guardarDiagnostico);
  const puedeDiagnosticar = useApp((s) => s.puedeDiagnosticar);
  const abrirPaywall = useApp((s) => s.abrirPaywall);

  const rehacer = params.get('rehacer') === '1';

  const [paso, setPaso] = useState(1);
  const [modo, setModo] = useState(perfilGuardado?.modoEntrada ?? 'cv');
  const [cvSubido, setCvSubido] = useState(Boolean(perfilGuardado?.cvParseado));
  const [archivoNombre, setArchivoNombre] = useState(perfilGuardado?.cvParseado ?? '');
  const [errorCv, setErrorCv] = useState('');
  const [skills, setSkills] = useState(perfilGuardado?.skills ?? []);
  const [ciclo, setCiclo] = useState(perfilGuardado?.ciclo ?? usuario?.ciclo ?? 3);
  const [rol, setRol] = useState(perfilGuardado?.rolObjetivo ?? ROLES_MOTOR[0]);
  const [ciudades, setCiudades] = useState(perfilGuardado?.ciudades ?? CIUDADES_DEFECTO);
  const [cargaPaso, setCargaPaso] = useState(0);
  const temporizadores = useRef([]);
  const archivoRef = useRef(null);

  const esFrank = Boolean(usuario?.nombre?.includes('Frank') || archivoNombre?.toLowerCase().includes('frank'));
  const metaCv = esFrank
    ? {
        archivo: archivoNombre || 'CV - Frank Li.pdf',
        paginas: 1,
        carrera: 'Ingeniería de Sistemas de Información',
        universidad: 'Universidad San Ignacio de Loyola (USIL)',
        skills: ['Java', 'SQL', 'APIs REST', 'Git', 'Python', 'Docker', 'HTML y CSS', 'JavaScript', 'TypeScript', 'Inglés intermedio'],
      }
    : CV_DEMO;

  // Entrar con un diagnóstico hecho lleva al reporte, no lo repite (§7.8). El
  // límite de 1/mes no castiga a quien solo quiere volver a mirarlo.
  useEffect(() => {
    if (diagnostico && !rehacer) ir('/diagnostico/resultado', { replace: true });
  }, [diagnostico, rehacer, ir]);

  // Rehacerlo sí consume el cupo: en gratis con el cupo gastado, el muro.
  useEffect(() => {
    if (rehacer && !puedeDiagnosticar()) {
      abrirPaywall('diagnostico', '/diagnostico/resultado');
      ir('/diagnostico/resultado', { replace: true });
    }
  }, [rehacer, puedeDiagnosticar, abrirPaywall, ir]);

  useEffect(() => () => temporizadores.current.forEach(clearTimeout), []);

  const alternar = (lista, x) => (lista.includes(x) ? lista.filter((y) => y !== x) : [...lista, x]);

  const subirCv = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrorCv(`El archivo pesa más de ${MAX_MB} MB. Sube uno más liviano.`);
      return;
    }
    if (f.type && f.type !== 'application/pdf') {
      setErrorCv('Por ahora solo leemos PDF.');
      return;
    }
    const nombre = f.name;
    setArchivoNombre(nombre);
    setErrorCv('');
    setCvSubido(true);
    const esArchivoFrank = nombre.toLowerCase().includes('frank') || Boolean(usuario?.nombre?.includes('Frank'));
    if (esArchivoFrank) {
      setSkills(['Java', 'SQL', 'APIs REST', 'Git', 'Python', 'Docker', 'HTML y CSS', 'JavaScript', 'TypeScript', 'Inglés intermedio']);
    } else {
      setSkills(SKILLS_CV);
    }
  };

  const paso1Valido = modo === 'cv' ? cvSubido : skills.length >= MIN_SKILLS;
  const paso2Valido = Boolean(rol) && ciudades.length > 0;

  const lanzar = () => {
    const perfil = {
      modoEntrada: modo,
      cvParseado: modo === 'cv' ? (archivoNombre || metaCv.archivo) : null,
      skills,
      carrera: usuario?.carrera ?? metaCv.carrera,
      universidad: usuario?.universidad ?? metaCv.universidad,
      ciclo,
      rolObjetivo: rol,
      ciudades,
      tiempoSemanal: perfilGuardado?.tiempoSemanal ?? 6,
      presupuesto: perfilGuardado?.presupuesto ?? 0,
    };
    guardarPerfilMotor(perfil);
    setPaso(3);
    setCargaPaso(0);
    temporizadores.current = [
      setTimeout(() => setCargaPaso(1), 450),
      setTimeout(() => setCargaPaso(2), 1000),
      setTimeout(() => {
        const c = calc(rol, skills, ciudades);
        guardarDiagnostico({
          fecha: Date.now(),
          rol,
          ciudades,
          pctHoy: c.pct,
          nHoy: c.N,
          total: c.T,
          sueldo: c.sueldo,
          camino: camino(rol, skills, ciudades).map((p) => ({ skill: p.skill, gana: p.gana, pct: p.pct, par: p.par })),
        });
        ir('/diagnostico/resultado', { replace: true });
      }, 1600),
    ];
  };

  const nombrePila = usuario?.nombre?.split(' ')[0] ?? 'ahí';

  return (
    <div className="panel panel--diagnostico">
      <div className="diag-cabecera animate-fade-up">
        <div className="diag-cabecera__lumi">
          <Lumi pose={paso === 3 ? 'piensa' : 'saluda'} alto={80} />
        </div>
        <div className="diag-cabecera__texto">
          <span className="eti" style={{ fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em' }}>
            DIAGNÓSTICO RÁPIDO · 3 PASOS, SIN ESCRIBIR
          </span>
          <h1 className="display display--pag" style={{ margin: 0, lineHeight: 1.18 }}>
            {nombrePila}, veamos con cuántas ofertas calzas hoy
          </h1>
        </div>
      </div>

      <Stepper paso={paso} />

      {/* ── Paso 1 · Tu perfil ── */}
      {paso === 1 && (
        <div className="pila animate-fade-up" style={{ gap: 16 }}>
          {/* Dos columnas: CV a la izquierda, carrera y skills a la derecha.
              En pantallas angostas se apilan solas (auto-fit). */}
          <div
            className="diag-opciones"
            role="radiogroup"
            aria-label="Cómo quieres contarnos lo que sabes"
          >
          <RadioCard
            activa={modo === 'cv'}
            onClick={() => setModo('cv')}
            titulo="Subir mi CV en PDF"
            descripcion="Lo leemos y detectamos tus skills por ti."
          >
            {!cvSubido ? (
              <>
                <button
                  type="button"
                  onClick={() => archivoRef.current?.click()}
                  className="pila"
                  style={{
                    gap: 10, alignItems: 'center', textAlign: 'center', padding: '28px 24px',
                    borderRadius: 20, border: '2px dashed var(--borde-campo)',
                    background: 'var(--bg-elevated)', cursor: 'pointer',
                    font: 'inherit', color: 'var(--text-primary)', width: '100%',
                    transition: 'border-color var(--duration) var(--ease-out), background var(--duration) var(--ease-out), transform var(--duration) var(--ease-out)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.background = 'var(--bg-surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--borde-campo)';
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--linea)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <strong style={{ fontSize: 15 }}>Arrastra tu CV o haz clic para elegirlo</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Máx. {MAX_MB} MB · lo leemos para detectar tus skills, no lo compartimos
                  </span>
                </button>
                <input
                  ref={archivoRef}
                  type="file"
                  accept="application/pdf"
                  onChange={subirCv}
                  className="visualmente-oculto"
                  tabIndex={-1}
                  aria-hidden="true"
                />
                {errorCv && <span className="aviso-error">{errorCv}</span>}
              </>
            ) : (
              <div className="pila" style={{ gap: 12 }}>
                <div className="fila" style={{ gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="pila" style={{ gap: 2 }}>
                    <strong style={{ fontSize: 14 }}>{archivoNombre || metaCv.archivo}</strong>
                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                      {metaCv.paginas} {metaCv.paginas === 1 ? 'página' : 'páginas'} · leído hace un momento
                    </span>
                  </span>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => { setCvSubido(false); setSkills([]); }}
                  >
                    Cambiar archivo
                  </button>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Esto es lo que detecté. Quita o agrega lo que haga falta:
                </span>
                <div className="chips">
                  {SKILLS_OFRECIDAS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={skills.includes(s)}
                      className={`chip chip--opcion${skills.includes(s) ? ' chip--on' : ''}`}
                      onClick={() => setSkills(alternar(skills, s))}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </RadioCard>

          <RadioCard
            activa={modo === 'skills'}
            onClick={() => setModo('skills')}
            titulo="Elegir carrera y skills"
            descripcion="¿Sin CV a la mano? Marca lo que ya sabes usar."
          >
            <div className="pila" style={{ gap: 14 }}>
              <div className="fila" style={{ gap: 12, flexWrap: 'wrap' }}>
                <span className="pila" style={{ gap: 2 }}>
                  <span className="eti">CARRERA</span>
                  <strong style={{ fontSize: 14 }}>{usuario?.carrera ?? metaCv.carrera}</strong>
                </span>
                <span className="pila" style={{ gap: 2 }}>
                  <span className="eti">UNIVERSIDAD</span>
                  <strong style={{ fontSize: 14 }}>{usuario?.universidad ?? metaCv.universidad}</strong>
                </span>
              </div>
              <label className="campo">
                Ciclo
                <select value={ciclo} onChange={(e) => setCiclo(Number(e.target.value))}>
                  {CICLOS.map((c, i) => <option key={c} value={i}>{c}</option>)}
                </select>
              </label>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Marca lo que ya sabes usar. Mínimo {MIN_SKILLS}
                {skills.length > 0 && ` · llevas ${skills.length}`}:
              </span>
              <div className="chips">
                {SKILLS_OFRECIDAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={skills.includes(s)}
                    className={`chip chip--opcion${skills.includes(s) ? ' chip--on' : ''}`}
                    onClick={() => setSkills(alternar(skills, s))}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </RadioCard>
          </div>

          <button
            className={`btn btn--acento btn--grande diag-continuar${paso1Valido ? '' : ' btn--apagado'}`}
            style={{ alignSelf: 'flex-start' }}
            disabled={!paso1Valido}
            onClick={() => setPaso(2)}
          >
            Continuar →
          </button>
        </div>
      )}

      {/* ── Paso 2 · Tu meta ── */}
      {paso === 2 && (
        <div className="pila animate-fade-up" style={{ gap: 20 }}>
          <div className="pila" style={{ gap: 12 }}>
            <span className="eti" style={{ fontWeight: 600 }}>¿A QUÉ ROL APUNTAS?</span>
            <div className="rejilla">
              {ROLES_MOTOR.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="pila"
                  aria-pressed={rol === r}
                  onClick={() => setRol(r)}
                  style={{
                    gap: 6, padding: 18, textAlign: 'left', cursor: 'pointer', font: 'inherit',
                    borderRadius: 'var(--radio-lg)',
                    background: rol === r ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                    border: rol === r ? '2px solid var(--accent)' : '1px solid var(--linea)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <strong style={{ fontSize: 14.5, lineHeight: 1.25 }}>{nombreRol(r)}</strong>
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    {totalDe(r, ciudades).toLocaleString('es-PE')} ofertas activas
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pila" style={{ gap: 10 }}>
            <span className="eti" style={{ fontWeight: 600 }}>¿DÓNDE BUSCAS?</span>
            <div className="chips">
              {CIUDADES_DIAG.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={ciudades.includes(c)}
                  className={`chip chip--opcion${ciudades.includes(c) ? ' chip--on' : ''}`}
                  onClick={() => setCiudades(alternar(ciudades, c))}
                >
                  {c}
                </button>
              ))}
            </div>
            {ciudades.length === 0 && (
              <span style={{ fontSize: 13, color: 'var(--alerta-fg)' }}>
                Elige al menos una: sin ciudades no hay mercado contra el que compararte.
              </span>
            )}
          </div>

          <div className="diag-acciones">
            <button className="btn btn--linea" onClick={() => setPaso(1)}>← Atrás</button>
            <button
              className={`btn btn--acento btn--grande${paso2Valido ? '' : ' btn--apagado'}`}
              disabled={!paso2Valido}
              onClick={lanzar}
            >
              Ver mi diagnóstico →
            </button>
          </div>
        </div>
      )}

      {/* ── Paso 3 · Cruzando ── */}
      {paso === 3 && (
        <div className="tarjeta diag-carga animate-scale">
          <Lumi pose="piensa" alto={76} />
          <strong style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
            Lumi está cruzando tu perfil con el mercado…
          </strong>
          <div className="barra" style={{ width: '100%', maxWidth: 360 }}>
            <span style={{ width: cargaPaso === 0 ? '30%' : cargaPaso === 1 ? '65%' : '95%' }} />
          </div>
          <div className="pila" style={{ gap: 8, fontSize: 13.5 }}>
            {[
              'Leyendo tu perfil',
              `Cruzando con ${totalDe(rol, ciudades).toLocaleString('es-PE')} ofertas activas`,
              'Calculando tu brecha y lo que desbloqueas',
            ].map((t, i) => (
              <span key={t} style={{ color: cargaPaso >= i ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {cargaPaso > i ? '✓' : '●'} {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
