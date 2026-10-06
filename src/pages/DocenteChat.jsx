import { useApp } from '../store.js';
import { getTenant } from '../data/tenant.js';
import { brechasDe } from '../lib/consultar.js';
import { GapTable } from '../viz/graficos.jsx';
import { ventanaAnalisis } from '../data/contenido.js';
import Chat from './Chat.jsx';

// Opción A: el mismo chat, sin límite, enmarcado en la carrera del docente.
// Las brechas abren el hilo como una primera respuesta y scrollean con él;
// fijarlas arriba dejaba la conversación sin sitio.
export default function DocenteChat() {
  const usuario = useApp((s) => s.usuario);
  const tenant = getTenant(useApp((s) => s.tenant));
  const carrera = usuario.carrera ?? 'Economía';
  const brechas = brechasDe(carrera);

  const encabezado = (
    <div className="pila" style={{ gap: 14 }}>
      <div className="fila" style={{ gap: 8 }}>
        <span className="insignia">{tenant.uni} · LICENCIA</span>
        <span className="insignia">Alcance: {carrera}</span>
        <span className="insignia">Consultas ilimitadas</span>
      </div>
      <GapTable brechas={brechas.slice(0, 6)} />
      <div className="fila" style={{ justifyContent: 'space-between', gap: 10 }}>
        <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
          Malla de {carrera} cargada por la Escuela · {ventanaAnalisis()}
        </span>
        <button className="chip" onClick={() => window.print()}>Exportar para comité curricular</button>
      </div>
    </div>
  );

  return <Chat encabezado={encabezado} />;
}
