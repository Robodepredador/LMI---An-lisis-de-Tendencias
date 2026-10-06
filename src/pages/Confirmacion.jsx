import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { fechaCorta, vigenciaCreditos } from '../data/contenido.js';
import { METODOS_PAGO } from '../data/contenido.js';

export default function Confirmacion() {
  const ir = useNavigate();
  const pagos = useApp((s) => s.pagos);
  const plan = useApp((s) => s.plan);
  const creditos = useApp((s) => s.creditos);
  const pendiente = useApp((s) => s.pendiente);

  const pago = pagos[0];
  // Llegar aquí sin haber pagado no tiene sentido.
  if (!pago) return <Navigate to="/planes" replace />;

  const metodo = METODOS_PAGO.find((m) => m.id === pago.metodo)?.k ?? pago.metodo;

  // La pregunta guardada NO se borra aquí: el chat la reanuda solo al entrar,
  // que es lo que hace cierto el "tu pregunta quedó guardada".
  const seguir = () => ir('/chat', { replace: true });

  return (
    <div className="seccion pila" style={{ maxWidth: 520, gap: 24 }}>
      <div className="pila" style={{ gap: 14, alignItems: 'flex-start' }}>
        <span className="tic" aria-hidden="true">✓</span>
        <h1 className="display" style={{ margin: 0, fontSize: 34 }}>Listo, ya puedes seguir preguntando</h1>
      </div>

      <div className="tarjeta" style={{ padding: 20, gap: 0 }}>
        {[
          ['Concepto', pago.concepto],
          ['Pagado con', metodo],
          ['Fecha', fechaCorta(pago.ts)],
          plan === 'creditos' ? ['Saldo', `${creditos} consultas`] : ['Plan', 'Pro · ilimitado'],
          plan === 'creditos' ? ['Válidos hasta', vigenciaCreditos()] : ['Se renueva', 'cada mes'],
          ['Total', `S/ ${pago.monto}`],
        ].map(([k, v], i) => (
          <div key={k} className="fila" style={{ justifyContent: 'space-between', gap: 12, padding: '11px 0', borderTop: i === 0 ? 0 : '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{k}</span>
            <span style={{ fontSize: 13.5 }}>{v}</span>
          </div>
        ))}
      </div>

      <div className="fila" style={{ gap: 10 }}>
        <button className="btn btn--acento btn--grande" onClick={seguir}>
          {pendiente ? 'Ver la respuesta a tu pregunta' : 'Volver al chat'}
        </button>
        <button className="btn btn--linea btn--grande" onClick={() => window.print()}>Descargar boleta</button>
      </div>
    </div>
  );
}
