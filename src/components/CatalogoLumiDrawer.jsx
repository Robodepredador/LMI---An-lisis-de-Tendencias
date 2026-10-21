import { useState } from 'react';
import Lumi, { LumiLogo } from '../mascota/Lumi.jsx';

export default function CatalogoLumiDrawer() {
  const [abierto, setAbierto] = useState(false);
  const visible = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('catalogo-lumi');

  if (!visible) return null;

  return (
    <>
      {/* Botón flotante inferior derecho */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          font: "700 14px 'Onest', system-ui, sans-serif",
          padding: '8px 16px 8px 10px',
          borderRadius: 999,
          border: 0,
          background: 'var(--text-primary)',
          color: 'var(--accent-fg)',
          boxShadow: 'var(--sombra-panel)',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        aria-label="Abrir catálogo de Lumi"
      >
        <LumiLogo alto={26} />
        {abierto ? 'Cerrar' : 'Catálogo Lumi'}
      </button>

      {/* Drawer deslizable */}
      {abierto && (
        <>
          <div
            onClick={() => setAbierto(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--bg-overlay)',
              zIndex: 44,
              backdropFilter: 'blur(2px)',
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 380,
              maxWidth: '90vw',
              zIndex: 45,
              background: 'var(--bg-surface)',
              boxShadow: '-12px 0 40px rgba(23,21,58,0.18)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'deslizar-derecha 0.3s ease-out',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '22px 24px',
                borderBottom: '1px solid var(--linea)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>
                  Catálogo de Lumi
                </strong>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Poses y animaciones activas de la mascota
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: 0,
                  background: 'var(--bg-elevated)',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px 40px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Pose 1: Saluda */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px minmax(0, 1fr)',
                  gap: 16,
                  alignItems: 'center',
                  background: 'var(--bg-page)',
                  borderRadius: 20,
                  padding: 14,
                  border: '1px solid var(--linea)',
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 16,
                    height: 110,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                  }}
                >
                  <Lumi pose="saluda" alto={86} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800 }}>
                    Saluda
                  </strong>
                  <span style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                    Flota, la antena brilla, parpadea y agita la lupa; las barras suben y bajan.
                  </span>
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'var(--bg-elevated)',
                      color: 'var(--accent)',
                    }}
                  >
                    Landing · bienvenida · registro
                  </span>
                </div>
              </div>

              {/* Pose 2: Piensa */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px minmax(0, 1fr)',
                  gap: 16,
                  alignItems: 'center',
                  background: 'var(--bg-page)',
                  borderRadius: 20,
                  padding: 14,
                  border: '1px solid var(--linea)',
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 16,
                    height: 110,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                  }}
                >
                  <Lumi pose="piensa" alto={86} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800 }}>
                    Piensa
                  </strong>
                  <span style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                    Inclina la cabeza, mira a los lados y golpea el mentón con la mano.
                  </span>
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'var(--bg-elevated)',
                      color: 'var(--accent)',
                    }}
                  >
                    Carga · viñeta "Lumi piensa…"
                  </span>
                </div>
              </div>

              {/* Pose 3: Celebra */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px minmax(0, 1fr)',
                  gap: 16,
                  alignItems: 'center',
                  background: 'var(--bg-page)',
                  borderRadius: 20,
                  padding: 14,
                  border: '1px solid var(--linea)',
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 16,
                    height: 110,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                  }}
                >
                  <Lumi pose="celebra" alto={86} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800 }}>
                    Celebra
                  </strong>
                  <span style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                    Salta con los brazos arriba y lanza confeti festejando la recarga.
                  </span>
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'var(--bg-elevated)',
                      color: 'var(--accent)',
                    }}
                  >
                    Pago confirmado
                  </span>
                </div>
              </div>

              {/* Pose 4: Alerta */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px minmax(0, 1fr)',
                  gap: 16,
                  alignItems: 'center',
                  background: 'var(--bg-page)',
                  borderRadius: 20,
                  padding: 14,
                  border: '1px solid var(--linea)',
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 16,
                    height: 110,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                  }}
                >
                  <Lumi pose="alerta" alto={86} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800 }}>
                    Alerta
                  </strong>
                  <span style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                    Antena en coral intermitente, gotita de preocupación y leve temblor.
                  </span>
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'var(--bg-elevated)',
                      color: 'var(--accent)',
                    }}
                  >
                    Muestra insuficiente · sin créditos
                  </span>
                </div>
              </div>

              {/* Pose 5: Logo */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px minmax(0, 1fr)',
                  gap: 16,
                  alignItems: 'center',
                  background: 'var(--bg-page)',
                  borderRadius: 20,
                  padding: 14,
                  border: '1px solid var(--linea)',
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 16,
                    height: 110,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                  }}
                >
                  <LumiLogo alto={52} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800 }}>
                    Logo Marca
                  </strong>
                  <span style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                    Estático. Solo la cabeza, para cabecera, pie de página y favicon.
                  </span>
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'var(--bg-elevated)',
                      color: 'var(--accent)',
                    }}
                  >
                    Marca oficial
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
