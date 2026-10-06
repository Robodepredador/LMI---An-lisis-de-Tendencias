import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.js';
import { METODOS_PAGO, PACKS } from '../data/contenido.js';
import { celularValido, esRechazada, formatearTarjeta, formatearVencimiento, marcaDe, validarTarjeta } from '../lib/pago.js';

export default function Checkout() {
  const ir = useNavigate();
  const pack = useApp((s) => s.pack);
  const pendiente = useApp((s) => s.pendiente);
  const metodo = useApp((s) => s.metodoPago);
  const setMetodoPago = useApp((s) => s.setMetodoPago);
  const confirmarPago = useApp((s) => s.confirmarPago);
  const abrirModalPlanes = useApp((s) => s.abrirModalPlanes);

  const [tarjeta, setTarjeta] = useState({ numero: '', vencimiento: '', cvv: '' });
  const [celular, setCelular] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  const elegido = PACKS.find((p) => p.id === pack) ?? PACKS[1];
  const marca = marcaDe(tarjeta.numero);

  // Desglose de impuestos (18% IGV peruano)
  const neto = (elegido.monto / 1.18).toFixed(2);
  const igv = (elegido.monto - (elegido.monto / 1.18)).toFixed(2);

  const pagar = async () => {
    setError('');

    if (metodo === 'tarjeta') {
      const problema = validarTarjeta(tarjeta);
      if (problema) return setError(problema);
    }
    if (metodo === 'yape' && !celularValido(celular)) {
      return setError('Escribe el número de celular asociado a Yape (9 dígitos, empieza en 9).');
    }

    setProcesando(true);
    await new Promise((r) => setTimeout(r, 900));

    if (metodo === 'tarjeta' && esRechazada(tarjeta.numero)) {
      setProcesando(false);
      return setError('Tu banco rechazó la operación. Prueba con otra tarjeta o elige otro método.');
    }

    confirmarPago();
    setProcesando(false);
    ir('/confirmacion', { replace: true });
  };

  return (
    <div className="seccion animate-fade" style={{ maxWidth: 1040, padding: 'clamp(20px, 3.5vw, 40px) clamp(16px, 3vw, 32px)' }}>
      <div className="pasarela">
        {/* ── Columna 1: Selección e Ingreso de Información ── */}
        <div className="pasarela__principal">
          <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => ir(-1)}
              className="btn btn--linea"
              style={{ padding: '6px 14px', fontSize: 13, gap: 6 }}
            >
              ← Volver
            </button>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>PASARELA DE PAGO SEGURA</span>
          </div>

          <div className="pila" style={{ gap: 6 }}>
            <h1 className="display" style={{ margin: 0, fontSize: 32 }}>Finalizar compra</h1>
            <span style={{ fontSize: 14.5, color: 'var(--text-muted)' }}>
              Elige tu método de pago preferido para activar tus consultas laborales.
            </span>
          </div>

          {/* Paso 1: Método de Pago */}
          <div className="pila" style={{ gap: 12 }}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.04em' }}>
              1. MÉTODO DE PAGO
            </span>
            <div className="pila" style={{ gap: 8 }}>
              {METODOS_PAGO.map((m) => (
                <button
                  key={m.id}
                  className="opcion"
                  aria-pressed={metodo === m.id}
                  aria-label={`${m.k}. ${m.d}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}
                  onClick={() => { setMetodoPago(m.id); setError(''); }}
                >
                  <span className="radio" data-on={metodo === m.id} aria-hidden="true" />
                  <span className="pila" style={{ gap: 3, flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 14.5 }}>{m.k}</strong>
                    <small style={{ color: 'var(--text-muted)' }}>{m.d}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Paso 2: Información del Pago */}
          <div className="pila" style={{ gap: 12 }}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.04em' }}>
              2. DATOS DE LA OPERACIÓN
            </span>

            {error && <div className="aviso-error animate-scale" role="alert">{error}</div>}

            {metodo === 'tarjeta' && (
              <div className="pila animate-fade" style={{ gap: 14, background: 'var(--bg-elevated)', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <label className="campo">
                  Número de tarjeta {marca && <span style={{ color: 'var(--accent)', fontWeight: 600 }}>· {marca}</span>}
                  <input
                    value={tarjeta.numero}
                    onChange={(e) => setTarjeta({ ...tarjeta, numero: formatearTarjeta(e.target.value) })}
                    placeholder="0000 0000 0000 0000"
                    inputMode="numeric"
                    autoComplete="cc-number"
                  />
                </label>
                <div className="fila" style={{ gap: 12 }}>
                  <label className="campo" style={{ flex: 1 }}>
                    Vencimiento
                    <input
                      value={tarjeta.vencimiento}
                      onChange={(e) => setTarjeta({ ...tarjeta, vencimiento: formatearVencimiento(e.target.value) })}
                      placeholder="MM/AA"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                    />
                  </label>
                  <label className="campo" style={{ flex: 1 }}>
                    Código de seguridad
                    <input
                      value={tarjeta.cvv}
                      onChange={(e) => setTarjeta({ ...tarjeta, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder={marca === 'Amex' ? '4 dígitos' : '3 dígitos'}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                    />
                  </label>
                </div>
              </div>
            )}

            {metodo === 'yape' && (
              <div className="pila animate-fade" style={{ gap: 14, background: 'var(--bg-elevated)', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                <label className="campo">
                  Celular asociado a tu cuenta Yape
                  <input
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="9XXXXXXXX"
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                </label>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Te enviaremos una solicitud de confirmación a tu app Yape para autorizar el pago.
                </span>
              </div>
            )}

            {metodo === 'plin' && (
              <div className="tarjeta fila animate-fade" style={{ gap: 16, alignItems: 'center', padding: 20 }}>
                <div className="qr" aria-hidden="true" />
                <div className="pila" style={{ gap: 6 }}>
                  <strong style={{ fontSize: 14.5 }}>Escanea el código QR</strong>
                  <span style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                    Desde tu app bancaria (Interbank, BBVA, Scotiabank o BanBif). La acreditación es inmediata.
                  </span>
                </div>
              </div>
            )}

            {metodo === 'pagoefectivo' && (
              <div className="tarjeta animate-fade" style={{ padding: 20, gap: 10 }}>
                <strong style={{ fontSize: 14.5 }}>Pago en efectivo o banca por internet</strong>
                <span style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  Al presionar pagar, generaremos un código CIP oficial. Podrás cancelarlo en agentes, bodegas o desde tu banca móvil en un plazo de 24 horas.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Columna 2: Resumen del Pedido (Order Summary) ── */}
        <aside className="pasarela__resumen-card animate-fade-up">
          <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-dim)', letterSpacing: '.06em' }}>
              RESUMEN DE COMPRA
            </span>
            <button
              onClick={abrirModalPlanes}
              className="enlace"
              style={{ fontSize: 12.5 }}
            >
              Cambiar plan
            </button>
          </div>

          <div className="pasarela__item-plan">
            <div className="fila" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div className="pila" style={{ gap: 4 }}>
                <strong style={{ fontSize: 16 }}>{elegido.k}</strong>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{elegido.d}</span>
              </div>
              <span className="display" style={{ fontSize: 20, whiteSpace: 'nowrap' }}>{elegido.precio}</span>
            </div>
            {elegido.tag && (
              <span className="mono" style={{ alignSelf: 'flex-start', fontSize: 10.5, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--accent)', color: 'var(--text-dark)', fontWeight: 600 }}>
                {elegido.tag}
              </span>
            )}
          </div>

          {pendiente && (
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', border: '1px solid color-mix(in oklch, var(--accent) 30%, transparent)', fontSize: 13, lineHeight: 1.45 }}>
              💬 <strong style={{ color: 'var(--accent)' }}>Tu pregunta guardada:</strong> «{pendiente}» se responderá en el chat al confirmar.
            </div>
          )}

          <div className="pasarela__desglose">
            <div className="pasarela__desglose-fila">
              <span>Subtotal neto</span>
              <span className="mono">S/ {neto}</span>
            </div>
            <div className="pasarela__desglose-fila">
              <span>IGV (18%)</span>
              <span className="mono">S/ {igv}</span>
            </div>
            <div className="pasarela__desglose-fila" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, marginTop: 4 }}>
              <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>Total a pagar</strong>
              <strong className="display" style={{ fontSize: 28, color: 'var(--text-primary)' }}>
                S/ {elegido.monto}
              </strong>
            </div>
          </div>

          <button
            className="btn btn--acento btn--grande btn--bloque"
            onClick={pagar}
            disabled={procesando}
            style={{ fontSize: 15.5, padding: 15 }}
          >
            {procesando ? 'Procesando pago seguro…' : `Confirmar y pagar S/ ${elegido.monto}`}
          </button>

          <div className="pila" style={{ gap: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <div className="pasarela__seguridad">
              <span>🔒</span>
              <span>Conexión cifrada SSL con procesamiento seguro</span>
            </div>
            <div className="pasarela__seguridad">
              <span>🧾</span>
              <span>Emisión de boleta electrónica automática</span>
            </div>
            <div className="pasarela__seguridad">
              <span>⚡</span>
              <span>Disponibilidad inmediata en tu cuenta</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
