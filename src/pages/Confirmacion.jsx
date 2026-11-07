import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { METODOS_PAGO } from '../data/contenido.js';
import Lumi from '../mascota/Lumi.jsx';
import { descargarBoleta } from '../lib/boleta.js';

export default function Confirmacion() {
  const ir = useNavigate();
  const usuario = useApp((s) => s.usuario);
  const pagos = useApp((s) => s.pagos);
  const pendiente = useApp((s) => s.pendiente);
  const paywallDestino = useApp((s) => s.paywallDestino);
  const limpiarPaywallDestino = useApp((s) => s.limpiarPaywallDestino);
  const rutaRetornoChat = useApp((s) => s.rutaRetornoChat) || '/chat';

  const pago = pagos[0];
  // Llegar aquí sin haber pagado no tiene sentido.
  if (!pago) return <Navigate to="/planes" replace />;

  const metodo = METODOS_PAGO.find((m) => m.id === pago.metodo)?.k ?? pago.metodo;

  // Al activar, lleva al destino que guardó el paywall: la pantalla que la
  // persona quiso abrir antes de chocar con el muro (§9.9). Si llegó por otro
  // camino, al chat.
  const seguir = () => {
    const destino = paywallDestino ?? rutaRetornoChat;
    limpiarPaywallDestino();
    if (window.opener) window.close();
    else ir(destino, { replace: true });
  };

  return (
    <div
      className="animate-fade"
      style={{
        maxWidth: 480,
        width: '100%',
        margin: '20px auto',
        padding: '36px 32px',
        background: 'var(--bg-surface)',
        borderRadius: 28,
        border: '1px solid var(--linea)',
        boxShadow: '0 8px 30px rgba(23, 21, 58, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      {/* Lumi animado en modo de celebración (salta, agita brazos y cae confeti) */}
      <Lumi pose="celebra" alto={150} />

      <h1 className="display" style={{ margin: '4px 0 0', fontSize: 32, fontWeight: 800, textAlign: 'center' }}>
        ¡Pago confirmado!
      </h1>

      <span style={{ fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.45, maxWidth: 360 }}>
        Pro estudiante activado. Ya tienes tus ofertas, tu ruta y tu CV desbloqueados
        {pendiente ? ', y tu pregunta guardada te espera en el chat' : ''}.
      </span>

      {/* Recuadro de detalles de la transacción */}
      <div
        style={{
          width: '100%',
          background: 'var(--bg-elevated)',
          borderRadius: 16,
          border: '1px solid var(--linea)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 6,
        }}
      >
        <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Pagado con</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{metodo}</span>
        </div>
        <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Suscripción</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Mensual · cancela cuando quieras</span>
        </div>
        <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Total</span>
          <strong style={{ fontSize: 16, fontWeight: 800 }}>S/ {pago.monto}</strong>
        </div>
      </div>

      <button
        type="button"
        className="btn btn--acento btn--grande btn--bloque"
        onClick={seguir}
        style={{ borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, marginTop: 6 }}
      >
        Ir a lo que desbloqueé →
      </button>

      <button
        type="button"
        onClick={() => descargarBoleta(pago, usuario)}
        className="enlace"
        style={{
          background: 'none',
          border: 0,
          color: 'var(--accent)',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
          padding: '2px',
        }}
      >
        Descargar boleta
      </button>

      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', textAlign: 'center', marginTop: -4 }}>
        Sin permanencia: puedes cancelar la renovación cuando quieras.
      </span>
    </div>
  );
}
