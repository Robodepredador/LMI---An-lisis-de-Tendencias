// El paywall. Reemplaza a ModalPlanes en toda la app: un solo muro, no dos
// (§7.4). Y no es un obstáculo, es el instrumento de medición — el tester
// tiene que poder ver qué compra, cruzar la puerta y usar la app en modo Pro.
// Si no la cruza, no puede decir si pagaría.

import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { PLANES } from '../data/contenido.js';
import Modal from './Modal.jsx';

// El titular depende de dónde se tocó, para que el muro hable de lo que la
// persona acaba de intentar hacer y no de "planes y tarifas".
const TITULARES = {
  '/ofertas': 'Ya calzas con varias ofertas. Te muestro cuáles.',
  '/ruta': 'Tu ruta para subir ese porcentaje está lista.',
  '/cv': 'Tu CV reescrito con las palabras de los avisos.',
  diagnostico: 'Ya usaste tu diagnóstico de este mes.',
  consultas: 'Ya usaste tus 3 consultas de este mes.',
  general: 'Gratis te dice qué. Pro te dice cómo.',
};

function Columna({ plan, destacada }) {
  return (
    <div
      className="pila"
      style={{
        gap: 14, padding: 24, flex: 1, minWidth: 240,
        borderRadius: 'var(--radio-xl)',
        background: destacada ? 'var(--bg-surface)' : 'var(--bg-elevated)',
        border: destacada ? '2px solid var(--accent)' : '1px solid var(--linea)',
      }}
    >
      <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <strong style={{ fontSize: 15 }}>{plan.name}</strong>
        {plan.tag && <span className="plan-etiqueta">{plan.tag}</span>}
      </div>
      <div className="fila" style={{ alignItems: 'baseline', gap: 4 }}>
        <span className="display" style={{ fontSize: 34 }}>{plan.price}</span>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{plan.unit}</span>
      </div>
      <ul className="pila" style={{ gap: 10, margin: 0, padding: 0, listStyle: 'none' }}>
        {plan.items.map((i) => (
          <li key={i} className="fila" style={{ gap: 8, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.45 }}>
            <span aria-hidden="true" style={{ color: destacada ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 700 }}>
              {destacada ? '✓' : '·'}
            </span>
            <span style={{ color: destacada ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Paywall() {
  const ir = useNavigate();
  const paywall = useApp((s) => s.paywall);
  const cerrarPaywall = useApp((s) => s.cerrarPaywall);
  const pendiente = useApp((s) => s.pendiente);

  const [gratis, pro] = PLANES;

  // "Activar Pro estudiante" NO activa el plan de golpe: abre el checkout
  // simulado, y es al confirmar el pago cuando se desbloquea (§6.4). Cruzar
  // la pasarela es justo lo que se está midiendo.
  const activar = () => {
    cerrarPaywall();
    ir('/checkout');
  };

  return (
    <Modal abierto={Boolean(paywall)} onCerrar={cerrarPaywall} titulo={TITULARES[paywall] ?? TITULARES.general}>
      <div className="pila" style={{ gap: 20 }}>
        {pendiente ? (
          <p style={{ margin: 0, fontSize: 'var(--tipo-base)', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Tu pregunta «<strong style={{ color: 'var(--text-primary)' }}>{pendiente}</strong>» quedó guardada
            y se responderá apenas actives tu plan.
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 'var(--tipo-base)', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            El plan gratis te dice qué pide el mercado. Pro estudiante te dice qué hacer con eso:
            en qué avisos ya eres competitivo, qué aprender primero y cómo reescribir tu CV para ellos.
          </p>
        )}

        <div className="fila" style={{ gap: 14, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <Columna plan={gratis} />
          <Columna plan={pro} destacada />
        </div>

        <div className="pila" style={{ gap: 10 }}>
          <button className="btn btn--acento btn--grande btn--bloque" onClick={activar}>
            Activar Pro estudiante a S/ 19/mes
          </button>
          <button className="btn btn--linea btn--bloque" onClick={cerrarPaywall}>
            Seguir con el plan gratis
          </button>
        </div>

        <span style={{ fontSize: 'var(--tipo-xs)', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.45 }}>
          Sin permanencia · cancela cuando quieras · Tarjeta, Yape, Plin o PagoEfectivo
        </span>
      </div>
    </Modal>
  );
}
