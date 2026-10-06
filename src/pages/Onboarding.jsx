import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import catalogo from '../data/catalogo.json';
import { useApp } from '../store.js';
import { ROLES_PERFIL } from '../data/contenido.js';

const alternar = (lista, v) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

export default function Onboarding() {
  const ir = useNavigate();
  const usuario = useApp((s) => s.usuario);
  const actualizarPerfil = useApp((s) => s.actualizarPerfil);

  const [rol, setRol] = useState(usuario?.rol ?? 'Estudiante');
  const [areas, setAreas] = useState(usuario?.areas?.length ? usuario.areas : [catalogo.areas[0]]);
  const [ciudades, setCiudades] = useState(usuario?.ciudades?.length ? usuario.ciudades : ['Lima']);

  // Sin cuenta no hay perfil que configurar.
  if (!usuario) return <Navigate to="/registro" replace />;

  const empezar = () => {
    actualizarPerfil({ rol, areas, ciudades });
    ir('/chat');
  };

  return (
    <div className="seccion pila" style={{ maxWidth: 640, gap: 32, paddingBottom: 40 }}>
      <div className="pila" style={{ gap: 12 }}>
        <span className="eti">PASO 1 DE 1 · 30 SEGUNDOS</span>
        <h1 className="display display--pag" style={{ margin: 0 }}>Cuéntanos de ti para afinar las respuestas</h1>
      </div>

      <div className="pila" style={{ gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>¿Cómo te describes?</span>
        <div className="rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px,100%), 1fr))', gap: 10 }}>
          {ROLES_PERFIL.map(([k, d]) => (
            <button key={k} className="opcion" aria-pressed={rol === k} aria-label={`${k}: ${d}`} onClick={() => setRol(k)}>
              <span>{k}</span>
              <small>{d}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="pila" style={{ gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>¿Qué áreas te interesan?</span>
        <div className="fila" style={{ gap: 8 }}>
          {catalogo.areas.map((a) => (
            <button key={a} className="chip" aria-pressed={areas.includes(a)} onClick={() => setAreas(alternar(areas, a))}>{a}</button>
          ))}
        </div>
      </div>

      <div className="pila" style={{ gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>¿Dónde buscas trabajo?</span>
        <div className="fila" style={{ gap: 8 }}>
          {catalogo.ciudades.map((c) => (
            <button key={c} className="chip" aria-pressed={ciudades.includes(c)} onClick={() => setCiudades(alternar(ciudades, c))}>{c}</button>
          ))}
        </div>
      </div>

      <button
        className="btn btn--acento btn--grande"
        style={{ alignSelf: 'flex-start' }}
        onClick={empezar}
        disabled={areas.length === 0 || ciudades.length === 0}
      >
        Empezar a preguntar
      </button>
      {(areas.length === 0 || ciudades.length === 0) && (
        <span style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: -24 }}>Elige al menos un área y una ciudad.</span>
      )}
    </div>
  );
}
