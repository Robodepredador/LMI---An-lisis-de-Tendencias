import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { PACKS, proximaRenovacion } from '../data/contenido.js';
import Modal from './Modal.jsx';

export default function ModalPlanes() {
  const ir = useNavigate();
  const modalPlanes = useApp((s) => s.modalPlanes);
  const cerrarModalPlanes = useApp((s) => s.cerrarModalPlanes);
  const pack = useApp((s) => s.pack);
  const setPack = useApp((s) => s.setPack);
  const pendiente = useApp((s) => s.pendiente);

  const continuarAlPago = () => {
    cerrarModalPlanes();
    ir('/checkout');
  };

  return (
    <Modal abierto={modalPlanes} onCerrar={cerrarModalPlanes} titulo="Elige cómo seguir">
      <div className="pila" style={{ gap: 20 }}>
        {pendiente ? (
          <p style={{ margin: 0, fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Tu pregunta «<strong style={{ color: 'var(--text-primary)' }}>{pendiente}</strong>» quedó guardada y se responderá apenas elijas una opción.
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Elige el plan que mejor se adapte a tus necesidades para seguir consultando el mercado laboral.
          </p>
        )}

        <div className="pila" style={{ gap: 10 }}>
          {PACKS.map((p) => (
            <button
              key={p.id}
              className="opcion animate-scale"
              aria-pressed={pack === p.id}
              aria-label={`${p.k}, ${p.precio}. ${p.d}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 }}
              onClick={() => setPack(p.id)}
            >
              <span className="radio" data-on={pack === p.id} aria-hidden="true" />
              <span className="pila" style={{ gap: 4, flex: 1, minWidth: 0 }}>
                <span className="fila" style={{ gap: 8 }}>
                  <strong style={{ fontSize: 15 }}>{p.k}</strong>
                  {p.tag && (
                    <span className="mono" style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'var(--accent)', color: 'var(--text-dark)', fontWeight: 600 }}>
                      {p.tag}
                    </span>
                  )}
                </span>
                <small style={{ color: 'var(--text-muted)' }}>{p.d}</small>
              </span>
              <span className="display" style={{ fontSize: 24, whiteSpace: 'nowrap' }}>{p.precio}</span>
            </button>
          ))}
        </div>

        <div className="fila" style={{ gap: 10, marginTop: 4 }}>
          <button className="btn btn--acento btn--grande" style={{ flex: 1 }} onClick={continuarAlPago}>
            Continuar al pago
          </button>
          <button className="btn btn--linea btn--grande" onClick={cerrarModalPlanes}>
            Esperar al {proximaRenovacion()}
          </button>
        </div>

        <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.45 }}>
          Créditos válidos por 12 meses · Plan Pro sin permanencia ni penalidades
        </span>
      </div>
    </Modal>
  );
}
