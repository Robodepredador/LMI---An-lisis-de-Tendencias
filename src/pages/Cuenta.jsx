import { Link, useNavigate } from 'react-router-dom';
import { CONSULTAS_GRATIS, useApp } from '../store.js';
import { fechaCorta, proximaRenovacion, vigenciaCreditos } from '../data/contenido.js';
import { METODOS_PAGO } from '../data/contenido.js';

const Bloque = ({ titulo, extra, children }) => (
  <section className="pila" style={{ gap: 12 }}>
    <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{titulo}</h2>
      {extra}
    </div>
    {children}
  </section>
);

const Vacio = ({ children }) => (
  <span style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>{children}</span>
);

export default function Cuenta() {
  const ir = useNavigate();
  const { usuario, plan, creditos, consultas, pagos, usadasMes, salir, resetearIntentos } = useApp();
  const restantes = useApp((s) => s.restantes());

  const cerrar = () => { salir(); ir('/', { replace: true }); };

  const resumenPlan = {
    free: { t: 'Plan gratis', d: `${restantes} de ${CONSULTAS_GRATIS} consultas este mes · se renueva el ${proximaRenovacion()}` },
    creditos: { t: 'Créditos', d: `${creditos} consultas disponibles · válidas hasta el ${vigenciaCreditos()}` },
    pro: { t: 'Plan Pro', d: 'Consultas ilimitadas · se renueva cada mes' },
    institucional: { t: 'Licencia institucional', d: 'Consultas ilimitadas mientras la licencia esté activa' },
  }[plan];

  return (
    <div className="seccion pila" style={{ maxWidth: 720, gap: 32, paddingBottom: 48 }}>
      <Link to="/chat" className="btn btn--linea" style={{ alignSelf: 'flex-start' }}>← Volver al chat</Link>

      <div className="fila" style={{ gap: 14, alignItems: 'center' }}>
        <span className="avatar" style={{ width: 48, height: 48, fontSize: 16 }} aria-hidden="true">{usuario.iniciales}</span>
        <div className="pila" style={{ gap: 2 }}>
          <h1 className="display" style={{ margin: 0, fontSize: 28 }}>{usuario.nombre}</h1>
          <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{usuario.email} · {usuario.rol}</span>
        </div>
      </div>

      <Bloque
        titulo="Tu plan"
        extra={plan !== 'institucional' && (
          <Link to="/planes" style={{ fontSize: 13.5, fontWeight: 600 }}>
            {plan === 'free' ? 'Ver opciones' : plan === 'creditos' ? 'Comprar más' : 'Gestionar'}
          </Link>
        )}
      >
        <div className="tarjeta" style={{ padding: 18, gap: 6 }}>
          <strong style={{ fontSize: 15 }}>{resumenPlan.t}</strong>
          <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{resumenPlan.d}</span>
        </div>
      </Bloque>

      <Bloque titulo="Consumo" extra={<span style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>{usadasMes} usadas este mes</span>}>
        {consultas.length === 0 ? (
          <Vacio>Todavía no has hecho consultas.</Vacio>
        ) : (
          <div className="tarjeta" style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
            {consultas.slice(0, 10).map((c, i) => (
              <Link
                key={c.id}
                to={`/chat/${c.id}`}
                className="fila"
                style={{ justifyContent: 'space-between', gap: 12, padding: '13px 18px', borderTop: i === 0 ? 0 : '1px solid var(--border-subtle)', color: 'inherit' }}
              >
                <span className="truncate" style={{ fontSize: 13.5, minWidth: 0 }}>{c.pregunta}</span>
                <span className="mono" style={{ fontSize: 12, color: c.costo ? 'var(--text-muted)' : 'var(--success-fg)', whiteSpace: 'nowrap' }}>
                  {c.costo ? '1 consulta' : 'sin costo'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Bloque>

      <Bloque titulo="Pagos">
        {pagos.length === 0 ? (
          <Vacio>No tienes pagos registrados.</Vacio>
        ) : (
          <div className="tarjeta" style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
            {pagos.map((p, i) => (
              <div key={p.id} className="fila" style={{ justifyContent: 'space-between', gap: 12, padding: '13px 18px', borderTop: i === 0 ? 0 : '1px solid var(--border-subtle)' }}>
                <span className="pila" style={{ gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 13.5 }}>{p.concepto}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    {fechaCorta(p.ts)} · {METODOS_PAGO.find((m) => m.id === p.metodo)?.k ?? p.metodo}
                  </span>
                </span>
                <span className="fila" style={{ gap: 12 }}>
                  <span className="mono" style={{ fontSize: 13 }}>S/ {p.monto}</span>
                  <button className="chip" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => window.print()}>Boleta</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </Bloque>

      <div className="fila" style={{ gap: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 24, flexWrap: 'wrap' }}>
        <button
          className="btn btn--claro"
          onClick={() => { resetearIntentos(); ir('/chat'); }}
          title="Restaura 3 consultas gratis y limpia el historial para nuevas pruebas"
        >
          Reiniciar intentos (3 de 3)
        </button>
        <Link to="/onboarding" className="btn btn--linea">Editar perfil</Link>
        <button className="btn btn--linea" onClick={cerrar}>Cerrar sesión</button>
      </div>
    </div>
  );
}
