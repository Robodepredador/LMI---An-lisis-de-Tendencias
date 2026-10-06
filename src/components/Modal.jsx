import { useEffect, useRef } from 'react';

// Usa el <dialog> nativo en vez de un div con overlay: trae gratis la tecla
// Escape, el atrapado del foco, el backdrop y el aria-modal. Reimplementar eso
// a mano es la vía rápida a un diálogo inaccesible.
export default function Modal({ abierto, onCerrar, titulo, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-titulo"
      onClose={onCerrar}
      // Clic en el backdrop: el evento llega al propio <dialog>, no a su contenido.
      onClick={(e) => { if (e.target === ref.current) onCerrar(); }}
    >
      <div className="modal__caja">
        <header className="modal__cabecera">
          <h2 id="modal-titulo" className="display" style={{ margin: 0, fontSize: 26 }}>{titulo}</h2>
          <button className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </header>
        <div className="modal__cuerpo">{children}</div>
      </div>
    </dialog>
  );
}
