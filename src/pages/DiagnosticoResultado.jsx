// Reporte de brecha. Es la pantalla que convierte el dato de mercado en una
// decisión: no termina en un gráfico, termina en tres botones que llevan a
// algún sitio.

import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CICLOS, useApp } from '../store.js';
import { habilidadesDe, nombreRol, PORQUE } from '../data/mercado.js';
import {
  calc, camino, matchDe, ofertasDe, recomendadosDe, soles, sueldoDisponible, tieneSkill,
} from '../lib/mercado.js';
import { AccionesSugeridas, BarraMatch, ChipEstado } from '../components/mercado.jsx';
import { useMotor } from '../lib/motor.js';
import Lumi from '../mascota/Lumi.jsx';

function TarjetaOfertaMini({ m }) {
  const { oferta } = m;
  return (
    <div className="pila" style={{ gap: 8, padding: 16, borderRadius: 'var(--radio-lg)', background: 'var(--bg-surface)', border: '1px solid var(--linea)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {oferta.empresa} · {oferta.portal}
      </span>
      <strong style={{ fontSize: 14.5, lineHeight: 1.25 }}>{oferta.puesto}</strong>
      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
        {oferta.ciudad} · {oferta.modalidad} · {oferta.sueldo}
      </span>
      <div className="fila" style={{ gap: 8, alignItems: 'center' }}>
        <strong style={{ fontSize: 20, fontWeight: 800 }}>{m.pct}%</strong>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {m.obligHechas} de {m.obligTotal} obligatorias
        </span>
      </div>
      <BarraMatch pct={m.pct} alto={6} />
    </div>
  );
}

export default function DiagnosticoResultado() {
  const ir = useNavigate();
  const { diagnostico, skills, rol, ciudades, esPro, perfil } = useMotor();
  const usuario = useApp((s) => s.usuario);
  const abrirPaywall = useApp((s) => s.abrirPaywall);

  // Sin diagnóstico no hay reporte: se hace primero.
  if (!diagnostico || !rol) return <Navigate to="/diagnostico" replace />;

  const hoy = calc(rol, skills, ciudades);
  const ruta = camino(rol, skills, ciudades);
  const cuello = ruta.slice(0, 2);
  const conCuello = calc(rol, [...skills, ...cuello.map((p) => p.skill)], ciudades);
  const habilidades = habilidadesDe(rol);
  const haySueldo = sueldoDisponible(rol, ciudades);

  // El caso de 0 ofertas alcanzables tiene su propio diseño: el cuello de
  // botella pasa a ser el protagonista en vez de un porcentaje vacío.
  const enCero = hoy.N === 0;

  const topOfertas = ofertasDe(rol)
    .map((o) => matchDe(o, skills))
    .sort((a, b) => b.pct - a.pct || a.faltan.length - b.faltan.length)
    .slice(0, 3);

  const masFrena = ruta[0]?.skill;
  const horasFrena = masFrena
    ? recomendadosDe(masFrena).reduce((a, r) => a + r.horas, 0)
    : 0;

  const cicloTexto = CICLOS[perfil?.ciclo ?? usuario?.ciclo];
  const listaOfertas = topOfertas;

  return (
    <div className="panel">
      {/* ── Cabecera ── */}
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div className="pila" style={{ gap: 6, minWidth: 0 }}>
          <span className="eti" style={{ fontWeight: 700, color: 'var(--accent)' }}>
            TU DIAGNÓSTICO · {nombreRol(rol)} · {ciudades.join(', ')}
          </span>
          <h1 className="display display--pag" style={{ margin: 0 }}>
            Esto es lo que el mercado ve en tu perfil
          </h1>
        </div>
        <button
          type="button"
          className="enlace"
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: 'var(--accent)' }}
          onClick={() => ir('/diagnostico?rehacer=1')}
        >
          Rehacer diagnóstico
        </button>
      </div>

      <div className="reporte">
        {/* ═════ Columna izquierda: el dato ═════ */}
        <div className="reporte__col">
          {!hoy.suficiente ? (
            <div className="reporte__card">
              <strong style={{ fontSize: 15 }}>Faltan ofertas para darte una cifra</strong>
              <span style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Con las ciudades que elegiste hay menos de 30 avisos activos y cualquier porcentaje
                sería ruido. Agrega una ciudad y vuelve a verlo.
              </span>
            </div>
          ) : (
            <div className="reporte__card animate-fade-up" style={{ gap: 14 }}>
              <span className="eti" style={{ fontWeight: 700 }}>TU VALOR ACTUAL</span>
              <span className="display" style={{ fontSize: 'clamp(64px, 7vw, 92px)', lineHeight: 0.95, fontWeight: 800, letterSpacing: '-0.03em' }}>
                {hoy.pct}%
              </span>
              <span style={{ fontSize: 15, lineHeight: 1.5 }}>
                de las ofertas activas te aceptarían hoy: cumples todos sus requisitos
                obligatorios en <strong>{hoy.N.toLocaleString('es-PE')} de {hoy.T.toLocaleString('es-PE')}</strong>.
              </span>
              {haySueldo && hoy.sueldo > 0 && (
                <span style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  Sueldo típico de esas ofertas: {soles(hoy.sueldo)}
                </span>
              )}
            </div>
          )}

          {/* ── Lo que piden vs. lo que tienes ── */}
          <div className="reporte__card" style={{ gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
              Lo que piden vs. lo que tienes
            </span>
            {habilidades.map((h) => {
              const tiene = tieneSkill(h.k, skills);
              return (
                <div key={h.k} className="reporte__habilidad">
                  <strong style={{ fontSize: 14, minWidth: 0 }}>{h.k}</strong>
                  <div className="reporte__habilidad-dato">
                    <div className="barra" style={{ height: 6 }}>
                      <span style={{ width: `${h.pct}%`, background: 'var(--dato-2)' }} />
                    </div>
                    <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{h.pct}% de ofertas</span>
                  </div>
                  <ChipEstado tiene={tiene} compacto />
                </div>
              );
            })}
          </div>
        </div>

        {/* ═════ Columna derecha: la decisión ═════ */}
        <div className="reporte__col">
          {cuello.length > 0 && (
            <div
              className="pila animate-fade-up"
              style={{
                gap: 14, padding: '24px 26px',
                borderRadius: 'var(--radio-2xl)',
                background: 'var(--resalte)', color: 'var(--resalte-fg)',
                border: '3px solid var(--lumi-linea)',
              }}
            >
              <span className="eti" style={{ fontWeight: 700, color: 'var(--resalte-fg)', opacity: 0.8 }}>
                TU CUELLO DE BOTELLA
              </span>
              <strong className="display" style={{ fontSize: 'clamp(20px, 2.1vw, 26px)', lineHeight: 1.2 }}>
                {enCero
                  ? `Todavía no cumples todas las obligatorias de ninguna oferta. Con ${cuello.map((p) => p.skill).join(' y ')} pasas a ${conCuello.N.toLocaleString('es-PE')}.`
                  : `Si aprendes ${cuello.map((p) => p.skill).join(' y ')}, desbloqueas el ${conCuello.pct}% de las ofertas.`}
              </strong>

              <div className="pila" style={{ gap: 8 }}>
                {[['Hoy', hoy.pct, 'var(--lumi-linea)'], ['Después', conCuello.pct, 'var(--accent)']].map(([k, p, color]) => (
                  <div key={k} className="fila" style={{ gap: 12, alignItems: 'center', flexWrap: 'nowrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, width: 62, flex: 'none' }}>{k}</span>
                    <div className="barra" style={{ flex: 1, height: 10, background: 'var(--bg-surface)' }}>
                      <span style={{ width: `${p}%`, background: color }} />
                    </div>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, width: 40, textAlign: 'right', flex: 'none' }}>{p}%</span>
                  </div>
                ))}
              </div>

              <span style={{ fontSize: 14, lineHeight: 1.5 }}>
                Pasas de {hoy.N.toLocaleString('es-PE')} a {conCuello.N.toLocaleString('es-PE')} ofertas
                {/* Con 0 alcanzables no hay sueldo del que partir: decir "pasa de
                    S/ 0" se lee como "hoy ganarías cero". */}
                {haySueldo && conCuello.sueldo > 0 && (hoy.N === 0
                  ? `, y el sueldo típico de esas ofertas es ${soles(conCuello.sueldo)}.`
                  : conCuello.sueldo > hoy.sueldo
                    ? `, y el sueldo típico sube de ${soles(hoy.sueldo)} a ${soles(conCuello.sueldo)}.`
                    : '.')}
                {!(haySueldo && conCuello.sueldo > 0) && '.'}
              </span>
            </div>
          )}

          {/* ── Lumi piensa ── */}
          {masFrena && (
            <div className="pensamiento animate-fade-up">
              <div style={{ flexShrink: 0 }}>
                <Lumi pose="piensa" alto={88} />
              </div>
              <div className="pensamiento__globo">
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>
                  Lumi piensa…{cicloTexto ? ` · ${cicloTexto} ciclo` : ''}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.55 }}>
                  <strong>{masFrena}</strong> es lo que más te frena
                  {horasFrena > 0 && `: con unas ${horasFrena} horas puedes ponerla en tu CV con evidencia`}.{' '}
                  {PORQUE[masFrena]}
                </span>
              </div>
            </div>
          )}

          {/* ── ¿Qué hago ahora? ── */}
          <AccionesSugeridas
            esPro={esPro}
            N={hoy.N}
            siguiente={ruta[0]?.skill}
            pct={conCuello.pct}
            cuello={cuello.map((p) => p.skill)}
          />
        </div>
      </div>

      {/* ── Ofertas donde ya calzas ── */}
      <div className="reporte__card" style={{ gap: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
          {hoy.N === 0 ? 'Ofertas donde estás más cerca' : 'Ofertas donde ya calzas'}
        </span>
        {esPro ? (
          <>
            <div className="rejilla">
              {topOfertas.map((m) => (
                <Link key={m.oferta.id} to={`/ofertas/${m.oferta.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  <TarjetaOfertaMini m={m} />
                </Link>
              ))}
            </div>
            <Link to="/ofertas" className="btn btn--linea" style={{ alignSelf: 'flex-start' }}>
              Ver todas mis ofertas →
            </Link>
          </>
        ) : (
          <div style={{ position: 'relative' }}>
            <div aria-hidden="true" className="pila" style={{ gap: 10, filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
              {listaOfertas.map((m) => (
                <div
                  key={m.oferta.id}
                  className="fila"
                  style={{ justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderRadius: 'var(--radio-lg)', background: 'var(--bg-elevated)', flexWrap: 'nowrap' }}
                >
                  <span className="pila" style={{ gap: 2 }}>
                    <strong style={{ fontSize: 14 }}>{m.oferta.puesto}</strong>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.oferta.empresa} · {m.oferta.ciudad}</span>
                  </span>
                  <ChipEstado tiene={m.faltan.length === 0} compacto />
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button type="button" className="btn-noche" onClick={() => abrirPaywall('/ofertas', '/ofertas')}>
                {hoy.N === 0
                  ? 'Ver en cuáles estoy más cerca · Pro estudiante'
                  : `Ver mis ${hoy.N.toLocaleString('es-PE')} ofertas · Pro estudiante`}
              </button>
            </div>
          </div>
        )}
      </div>

      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Diagnóstico de {usuario?.nombre} · {new Date(diagnostico.fecha).toLocaleDateString('es-PE')}.
        Las cifras salen del catálogo de {hoy.T.toLocaleString('es-PE')} ofertas activas de las ciudades que elegiste.
      </span>
    </div>
  );
}
