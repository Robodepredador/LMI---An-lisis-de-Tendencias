import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store.js';
import { METODOS_PAGO, PACKS } from '../data/contenido.js';
import { celularValido, esRechazada, formatearTarjeta, formatearVencimiento, marcaDe, validarTarjeta } from '../lib/pago.js';

export default function Checkout() {
  const ir = useNavigate();
  const [searchParams] = useSearchParams();
  const pack = useApp((s) => s.pack);
  const setPack = useApp((s) => s.setPack);
  const pendiente = useApp((s) => s.pendiente);
  const metodo = useApp((s) => s.metodoPago);
  const setMetodoPago = useApp((s) => s.setMetodoPago);
  const confirmarPago = useApp((s) => s.confirmarPago);
  const rutaRetornoChat = useApp((s) => s.rutaRetornoChat) || '/chat';

  // Leer pack desde la URL si viene en ?pack=25
  const packParam = searchParams.get('pack');
  useEffect(() => {
    if (packParam && PACKS.some((p) => p.id === packParam)) {
      setPack(packParam);
    }
  }, [packParam, setPack]);

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
    await new Promise((r) => setTimeout(r, 800));

    if (metodo === 'tarjeta' && esRechazada(tarjeta.numero)) {
      setProcesando(false);
      return setError('Tu banco rechazó la operación. Prueba con otra tarjeta o elige otro método.');
    }

    confirmarPago();
    setProcesando(false);
    ir('/confirmacion', { replace: true });
  };

  return (
    <div className="seccion animate-fade" style={{ maxWidth: 1060, padding: 'clamp(20px, 3.5vw, 40px) clamp(16px, 3vw, 32px)' }}>
      <div className="pasarela">
        {/* ── Columna 1: Selección e Ingreso de Información ── */}
        <div className="pasarela__principal">
          <div className="pila" style={{ gap: 8 }}>
            <h1 className="display" style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Finalizar compra</h1>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
              Al terminar, vuelves a tu chat y Lumi responde tu pregunta guardada.
            </span>
            {pendiente && (
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--linea)',
                  borderRadius: 16,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 4,
                }}
              >
                <span style={{ fontSize: 20 }} role="img" aria-label="Consulta">💬</span>
                <span style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  «<strong>{pendiente}</strong>» queda guardada hasta que confirmes.
                </span>
              </div>
            )}
          </div>

          {/* Paso 1: Método de Pago (Cuadrícula 2x2 como en el diseño) */}
          <div className="pila" style={{ gap: 12 }}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.04em' }}>
              1 · MÉTODO DE PAGO
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {METODOS_PAGO.map((m) => {
                const activo = metodo === m.id;
                return (
                  <button
                    key={m.id}
                    className="opcion"
                    aria-pressed={activo}
                    aria-label={`${m.k}. ${m.d}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px 18px',
                      borderRadius: 16,
                      border: activo ? '2px solid #4f46e5' : '1.5px solid var(--linea)',
                      background: activo ? '#f5f3ff' : 'var(--bg-surface)',
                      boxShadow: activo ? '0 0 0 1px #4f46e5' : 'none',
                    }}
                    onClick={() => { setMetodoPago(m.id); setError(''); }}
                  >
                    <span className="radio" data-on={activo} aria-hidden="true" />
                    <span className="pila" style={{ gap: 2, flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <strong style={{ fontSize: 15, fontWeight: 700 }}>{m.k}</strong>
                      <small style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{m.d}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paso 2: Información del Pago */}
          <div className="pila" style={{ gap: 12 }}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.04em' }}>
              2. DATOS DE LA OPERACIÓN
            </span>

            {error && <div className="aviso-error animate-scale" role="alert">{error}</div>}

            {metodo === 'tarjeta' && (
              <div className="pila animate-fade" style={{ gap: 14, background: 'var(--bg-elevated)', padding: 20, borderRadius: 'var(--radio-lg)', border: '1px solid var(--linea)' }}>
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
              <div className="pila animate-fade" style={{ gap: 14, background: 'var(--bg-elevated)', padding: 20, borderRadius: 'var(--radio-lg)', border: '1px solid var(--linea)' }}>
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
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Te enviaremos una solicitud a tu app Yape para autorizar el pago.
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

        {/* ── Columna 2: Resumen del Pedido (Order Summary idéntico a Imagen 2) ── */}
        <aside
          className="animate-fade-up"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--linea)',
            borderRadius: 24,
            padding: '28px',
            boxShadow: '0 8px 30px rgba(23, 21, 58, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            position: 'sticky',
            top: 24,
          }}
        >
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-secondary)', letterSpacing: '.06em', fontWeight: 700 }}>
            RESUMEN
          </span>

          <div
            style={{
              background: '#f5f3ff',
              borderRadius: 16,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div className="pila" style={{ gap: 4 }}>
              <strong style={{ fontSize: 17, fontWeight: 800 }}>{elegido.k}</strong>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{elegido.d}</span>
              {elegido.tag && (
                <span
                  style={{
                    alignSelf: 'flex-start',
                    background: '#bef264',
                    color: '#0f172a',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 999,
                    marginTop: 4,
                  }}
                >
                  {elegido.tag}
                </span>
              )}
            </div>
            <span className="display" style={{ fontSize: 24, fontWeight: 800 }}>{elegido.precio}</span>
          </div>

          <div className="pasarela__desglose" style={{ gap: 12 }}>
            <div className="pasarela__desglose-fila">
              <span style={{ fontSize: 14 }}>Subtotal neto</span>
              <span className="mono" style={{ fontSize: 14 }}>S/ {neto}</span>
            </div>
            <div className="pasarela__desglose-fila">
              <span style={{ fontSize: 14 }}>IGV (18%)</span>
              <span className="mono" style={{ fontSize: 14 }}>S/ {igv}</span>
            </div>
            <div className="pasarela__desglose-fila" style={{ borderTop: '1px solid var(--linea)', paddingTop: 14, marginTop: 4 }}>
              <strong style={{ fontSize: 18, color: 'var(--text-primary)', fontWeight: 800 }}>Total</strong>
              <strong className="display" style={{ fontSize: 32, color: 'var(--text-primary)', fontWeight: 800 }}>
                S/ {elegido.monto}
              </strong>
            </div>
          </div>

          <button
            className="btn btn--acento btn--grande btn--bloque"
            onClick={pagar}
            disabled={procesando}
            style={{ fontSize: 16, padding: '16px', borderRadius: 14, fontWeight: 700 }}
          >
            {procesando ? 'Procesando pago seguro…' : `Confirmar y pagar S/ ${elegido.monto}`}
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.opener) window.close();
              else ir(rutaRetornoChat);
            }}
            className="enlace"
            style={{
              textAlign: 'center',
              fontSize: 13.5,
              color: 'var(--accent)',
              textDecoration: 'underline',
              background: 'none',
              border: 0,
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            Cancelar y volver al chat
          </button>

          <div className="pila" style={{ gap: 8, borderTop: '1px solid var(--linea)', paddingTop: 14, fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <div className="fila" style={{ gap: 8 }}>
              <span>🔒</span>
              <span>Conexión cifrada SSL</span>
            </div>
            <div className="fila" style={{ gap: 8 }}>
              <span>🧾</span>
              <span>Boleta electrónica automática</span>
            </div>
            <div className="fila" style={{ gap: 8 }}>
              <span>⚡</span>
              <span>Créditos disponibles al instante</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
