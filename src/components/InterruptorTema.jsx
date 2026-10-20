import { useState } from 'react';
import { alternarTema, leerTema } from '../lib/tema.js';

// El interruptor es visible a propósito: el estudiante elige, no su sistema.
export default function InterruptorTema({ className = '' }) {
  // El script de index.html ya aplicó el tema antes de pintar, así que el
  // estado arranca de ahí: no hace falta un efecto que provoque otro render.
  const [tema, setTema] = useState(leerTema);

  const oscuro = tema === 'oscuro';
  return (
    <button
      type="button"
      className={`interruptor-tema ${className}`.trim()}
      aria-pressed={oscuro}
      onClick={() => setTema(alternarTema())}
    >
      <span aria-hidden="true">{oscuro ? '☾' : '☀'}</span>
      <span className="visualmente-oculto">
        {oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      </span>
    </button>
  );
}
