// Ruta de aprendizaje. Las skills que te faltan, ordenadas por cuántas
// ofertas desbloquea cada una, con lo gratis primero y las horas que cuesta.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PORQUE } from '../data/mercado.js';
import { enlaceDe, rutaDe } from '../lib/mercado.js';
import { BloqueoPro, Cabecera, SinDiagnostico } from '../components/mercado.jsx';
import { useMotor } from '../lib/motor.js';
import { useApp } from '../store.js';

const ICONO = { Curso: '🎓', Video: '▶', Libro: '📘', Proyecto: '🔨' };

function Recurso({ r }) {
  const enlace = enlaceDe(r);
  return (
    <div
      className="fila"
      style={{
        gap: 12, padding: '12px 14px', alignItems: 'center', flexWrap: 'wrap',
        borderRadius: 'var(--radio-md)',
        background: r.rec ? 'var(--bg-elevated)' : 'transparent',
        border: r.rec ? '1px solid var(--linea)' : '1px solid transparent',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 15 }}>{ICONO[r.tipo] ?? '•'}</span>
      <span className="pila" style={{ gap: 2, flex: 1, minWidth: 180 }}>
        <strong style={{ fontSize: 13.5, lineHeight: 1.35 }}>{r.titulo}</strong>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {r.tipo} · {r.plataforma} · {r.horas} h
          {r.rating ? ` · ★ ${r.rating}` : ''}
        </span>
      </span>
      <span style={{
        fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
        color: r.precio === 0 ? 'var(--resalte-fg)' : 'var(--text-secondary)',
        background: r.precio === 0 ? 'var(--resalte)' : 'transparent',
        padding: r.precio === 0 ? '3px 10px' : 0,
        borderRadius: 'var(--radio-full)',
      }}>
        {/* El precio del recurso va exacto: `soles()` redondea a S/ 50 porque
            es para sueldos típicos, y un curso de S/ 39 mostrado como S/ 50
            es una cifra falsa en la pantalla que vende honestidad. */}
        {r.precio === 0 ? 'Gratis' : `S/ ${r.precio}`}
      </span>
      {r.rec && <span className="plan-etiqueta">Recomendado</span>}
      {enlace && (
        <a
          href={enlace}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
            color: 'var(--accent)', textDecoration: 'none',
          }}
        >
          Abrir ↗
          <span className="visualmente-oculto">: {r.titulo} en {r.plataforma}, se abre en otra pestaña</span>
        </a>
      )}
    </div>
  );
}

export default function Ruta() {
  const { listo, rol, skills, ciudades, esPro, perfil } = useMotor();
  const guardarPerfilMotor = useApp((s) => s.guardarPerfilMotor);
  const [soloGratis, setSoloGratis] = useState(false);
  // Las skills con las que entró a la pantalla. La ruta se calcula contra
  // estas y no contra las de ahora: marcar una como aprendida la suma al
  // perfil, y si recalculáramos el paso desaparecería de golpe en vez de
  // quedarse en verde con su "Deshacer". Al volver a entrar ya no sale,
  // que es lo correcto: deja de ser una brecha.
  const [base] = useState(skills);
  const aprendida = (skill) => skills.includes(skill);
  // Marcarla cuenta de verdad: entra al perfil, así que el diagnóstico, el
  // match de las ofertas y las habilidades del CV la dan por sabida.
  const marcar = (skill, si) => guardarPerfilMotor({
    skills: si ? [...skills, skill] : skills.filter((k) => k !== skill),
  });

  if (!listo) return <SinDiagnostico que="La ruta de aprendizaje" />;

  const horasSemana = perfil?.tiempoSemanal ?? 6;
  const ruta = rutaDe(rol, base, ciudades, horasSemana, soloGratis);
  const totalHoras = ruta.reduce((a, p) => a + (aprendida(p.skill) ? 0 : p.horas), 0);

  const contenido = (
    <div className="pila" style={{ gap: 18 }}>
      {ruta.map((paso) => (
        <div key={paso.skill} className="fila" style={{ gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div
            className="pila"
            style={{
              width: 120, flex: 'none', gap: 2, padding: 14, alignItems: 'center',
              borderRadius: 'var(--radio-lg)',
              background: aprendida(paso.skill) ? 'var(--resalte)' : 'var(--bg-elevated)',
              color: aprendida(paso.skill) ? 'var(--resalte-fg)' : 'inherit',
              border: '1px solid var(--linea)',
            }}
          >
            {aprendida(paso.skill) ? (
              <>
                <span style={{ fontSize: 12.5, fontWeight: 700, textAlign: 'center' }}>Aprendida</span>
                <span aria-hidden="true" style={{ fontSize: 15 }}>✓</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 12.5, fontWeight: 700, textAlign: 'center' }}>
                  {paso.tramo.desde === paso.tramo.hasta
                    ? `Semana ${paso.tramo.desde}`
                    : `Semanas ${paso.tramo.desde}–${paso.tramo.hasta}`}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{paso.horas} h</span>
              </>
            )}
          </div>

          <div
            className="pila"
            style={{
              gap: 12, flex: 1, minWidth: 260, padding: 20,
              borderRadius: 'var(--radio-xl)', background: 'var(--bg-surface)',
              border: '1px solid var(--linea)',
            }}
          >
            <div className="fila" style={{ gap: 10, justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <strong className="display" style={{ fontSize: 20 }}>{paso.skill}</strong>
              <span style={{
                fontSize: 13, fontWeight: 700, padding: '4px 12px',
                borderRadius: 'var(--radio-full)', background: 'var(--resalte)', color: 'var(--resalte-fg)',
              }}>
                +{paso.gana.toLocaleString('es-PE')} ofertas · llegas a {paso.pct}%
              </span>
            </div>
            {paso.par && (
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Esta y la siguiente van juntas: por separado ninguna de las dos desbloquea nada.
              </span>
            )}
            <span style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {PORQUE[paso.skill]}
            </span>
            {aprendida(paso.skill) ? (
              <div
                className="fila"
                style={{
                  gap: 12, padding: '12px 14px', flexWrap: 'wrap', alignItems: 'center',
                  borderRadius: 'var(--radio-md)', background: 'var(--bg-elevated)',
                }}
              >
                <span style={{ fontSize: 13, flex: 1, minWidth: 200 }}>
                  Ya cuenta en tu diagnóstico y en la sección Habilidades de tu CV.
                </span>
                <Link to="/cv" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' }}>
                  Ver mi CV
                </Link>
                <button
                  type="button"
                  className="enlace"
                  style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}
                  onClick={() => marcar(paso.skill, false)}
                >
                  Deshacer
                </button>
              </div>
            ) : (
              <>
                <div className="pila" style={{ gap: 6 }}>
                  {paso.recursos.map((r) => <Recurso key={r.titulo} r={r} />)}
                </div>
                <div className="fila">
                  <button
                    type="button"
                    className="btn btn--linea"
                    onClick={() => marcar(paso.skill, true)}
                  >
                    Ya lo aprendí
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="panel">
      <Cabecera eti="RUTA DE APRENDIZAJE" titulo="Qué aprender primero para desbloquear más ofertas">
        Ordenada por cuántas ofertas te abre cada skill, no por lo que esté de moda.
        A {horasSemana} horas por semana son unas {totalHoras} horas en total.
      </Cabecera>

      {esPro && (
        <div className="fila" style={{ gap: 8 }}>
          <button
            type="button"
            className={`chip chip--opcion${soloGratis ? ' chip--on' : ''}`}
            onClick={() => setSoloGratis(!soloGratis)}
          >
            Solo gratis
          </button>
        </div>
      )}

      {esPro ? contenido : (
        <BloqueoPro
          titulo={ruta[0] ? `Tu ruta a ${ruta[ruta.length - 1].pct}% está lista.` : 'Tu ruta está lista.'}
          detalle="Qué estudiar, en qué orden y con qué recursos gratis. Con las horas que cuesta cada paso."
          destino="/ruta"
        >
          {contenido}
        </BloqueoPro>
      )}
    </div>
  );
}
