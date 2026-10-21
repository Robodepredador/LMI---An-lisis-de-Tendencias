import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CICLOS, useApp } from '../store.js';
import {
  CARRERAS, CIUDADES_REGISTRO, INTERESES, areasDePerfil, ciudadDeRegistro,
} from '../data/taxonomia.js';
import Lumi, { LumiLogo } from '../mascota/Lumi.jsx';

const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PASOS = ['Cuenta', 'Tus estudios', 'Intereses', '¿Cómo nos conociste?'];

// Lumi dice algo distinto en cada paso: explica para qué sirve lo que se está
// pidiendo, que es la diferencia entre un formulario y una conversación.
const MENSAJES = [
  '¡Hola! Soy Lumi. En 4 pasos armamos tu perfil para darte datos a tu medida.',
  'Con tu carrera y tu ciclo te digo qué priorizar antes de tus prácticas.',
  'Así te aviso cuando algo de tu interés empiece a crecer en el mercado.',
  '¡Último paso! Gracias por contarnos cómo llegaste.',
];

const PERFILES = ['Estudiante', 'Egresado', 'Postulante', 'En transición'];
const OBJETIVOS = ['Conseguir prácticas', 'Mi primer empleo', 'Elegir especialidad', 'Cambiar de rubro', 'Subir mi sueldo'];
const FUENTES = ['TikTok', 'Instagram', 'LinkedIn', 'Un amigo o compañero', 'Mi universidad', 'Un docente', 'Google', 'Feria laboral', 'Otro'];

const AYUDAS = [
  'Completa nombre, correo y una contraseña de 8 caracteres.',
  'Indica tu universidad y tu carrera.',
  'Elige al menos un área y tu objetivo.',
  'Elige una opción y acepta los términos.',
];

function Chips({ opciones, elegido, onElegir, multiple = false }) {
  const activo = (o) => (multiple ? elegido.includes(o) : elegido === o);
  return (
    <div className="chips">
      {opciones.map((o) => (
        <button
          key={o}
          type="button"
          className={`chip chip--opcion${activo(o) ? ' chip--on' : ''}`}
          aria-pressed={activo(o)}
          onClick={() => onElegir(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function Registro() {
  const ir = useNavigate();
  const registrar = useApp((s) => s.registrar);
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(false);
  const [f, setF] = useState({
    nombre: '', email: '', clave: '',
    perfil: 'Estudiante', uni: '', carrera: null, ciclo: 2, ciudad: 'Lima',
    intereses: [], objetivo: null,
    fuente: null, referido: '', terminos: false,
  });

  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setError(''); };
  const campo = (k) => ({ value: f[k], onChange: (e) => set(k, e.target.value) });
  const alternar = (o) => set('intereses', f.intereses.includes(o)
    ? f.intereses.filter((x) => x !== o)
    : [...f.intereses, o]);

  const listo = [
    f.nombre.trim().length >= 3 && CORREO_OK.test(f.email) && f.clave.length >= 8,
    f.uni.trim().length > 0 && !!f.carrera,
    f.intereses.length > 0 && !!f.objetivo,
    !!f.fuente && f.terminos,
  ][paso];

  const crear = (datos = {}) => {
    const r = registrar({
      nombre: f.nombre, email: f.email, clave: f.clave,
      rol: f.perfil, ciclo: f.ciclo, carrera: f.carrera, uni: f.uni,
      intereses: f.intereses, objetivo: f.objetivo, fuente: f.fuente,
      areas: areasDePerfil({ carrera: f.carrera, intereses: f.intereses }),
      ciudades: [ciudadDeRegistro(f.ciudad)],
      ...datos,
    });
    if (!r.ok) { setPaso(0); return setError(r.error); }
    ir('/chat');
  };

  const siguiente = () => {
    if (!listo) return setIntento(true);
    setIntento(false);
    if (paso < 3) return setPaso(paso + 1);
    crear();
  };

  return (
    <div className="registro">
      <aside className="registro__lado">
        {/* Sin barra de navegación, la marca es lo único que ancla la pantalla
            y la única salida de vuelta al inicio. */}
        <Link to="/" className="registro__marca" aria-label="Volver al inicio de LMI-U">
          <LumiLogo alto={34} />
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--tipo-xl)', fontWeight: 800 }}>LMI-U</strong>
        </Link>
        <div className="registro__pasos">
          {PASOS.map((p, i) => (
            <div key={p} className={`registro__paso${i === paso ? ' registro__paso--on' : ''}${i < paso ? ' registro__paso--hecho' : ''}`}>
              <span className="registro__punto">{i < paso ? '✓' : i + 1}</span>
              {p}
            </div>
          ))}
        </div>
        <div className="registro__lumi">
          <div className="registro__burbuja">
            <strong>Lumi</strong>
            {MENSAJES[paso]}
          </div>
          <Lumi pose="saluda" alto={150} />
        </div>
      </aside>

      <div className="registro__form">
        <span className="eti">Paso {paso + 1} de 4</span>
        <div className="registro__barra"><span style={{ width: `${(paso + 1) * 25}%` }} /></div>

        {error && <div className="aviso-error" role="alert">{error}</div>}

        {paso === 0 && (
          <>
            <h1 className="display display--pag" style={{ margin: 0 }}>Crea tu cuenta</h1>
            <button type="button" className="btn btn--linea btn--bloque"
              onClick={() => crear({ nombre: 'Camila Flores', email: 'camila.flores@gmail.com', clave: 'google-oauth' })}>
              Continuar con Google
            </button>
            <div className="separador">o con tu correo</div>
            <label className="campo">
              Nombre completo
              <input {...campo('nombre')} placeholder="Tu nombre y apellido" autoComplete="name" />
            </label>
            <label className="campo">
              Correo
              <input {...campo('email')} type="email" placeholder="tu@correo.edu.pe" autoComplete="email" />
            </label>
            <label className="campo">
              Contraseña
              <input {...campo('clave')} type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            </label>
          </>
        )}

        {paso === 1 && (
          <>
            <h1 className="display display--pag" style={{ margin: 0 }}>Cuéntanos de tus estudios</h1>
            <div className="campo">Soy<Chips opciones={PERFILES} elegido={f.perfil} onElegir={(o) => set('perfil', o)} /></div>
            <label className="campo">
              Universidad o instituto
              <input {...campo('uni')} placeholder="Ej. Universidad Nacional Mayor de San Marcos" autoComplete="organization" />
            </label>
            <div className="campo">Carrera<Chips opciones={CARRERAS} elegido={f.carrera} onElegir={(o) => set('carrera', o)} /></div>
            <div className="campo">Ciclo<Chips opciones={CICLOS} elegido={CICLOS[f.ciclo]} onElegir={(o) => set('ciclo', CICLOS.indexOf(o))} /></div>
            <div className="campo">Ciudad<Chips opciones={CIUDADES_REGISTRO} elegido={f.ciudad} onElegir={(o) => set('ciudad', o)} /></div>
          </>
        )}

        {paso === 2 && (
          <>
            <h1 className="display display--pag" style={{ margin: 0 }}>¿Qué te interesa?</h1>
            <div className="campo">
              Áreas que quieres explorar: elige todas las que quieras<span style={{ fontWeight: 400 }}></span>
              <Chips opciones={INTERESES} elegido={f.intereses} onElegir={alternar} multiple />
            </div>
            <div className="campo">Tu objetivo ahora<Chips opciones={OBJETIVOS} elegido={f.objetivo} onElegir={(o) => set('objetivo', o)} /></div>
          </>
        )}

        {paso === 3 && (
          <>
            <h1 className="display display--pag" style={{ margin: 0 }}>¿Cómo nos conociste?</h1>
            <Chips opciones={FUENTES} elegido={f.fuente} onElegir={(o) => set('fuente', o)} />
            <label className="registro__terminos">
              <input type="checkbox" checked={f.terminos} onChange={(e) => set('terminos', e.target.checked)} />
              Acepto los términos y la política de privacidad
            </label>
          </>
        )}

        <div className="registro__pie">
          <button type="button" className="btn btn--linea"
            onClick={() => (paso === 0 ? ir('/login') : (setPaso(paso - 1), setIntento(false)))}>
            {paso === 0 ? 'Ya tengo cuenta' : '← Atrás'}
          </button>
          {/* Deshabilitado va en lavanda con texto oscuro: en el prototipo era
              blanco sobre lavanda y no se leía. */}
          <button type="button" className={`btn btn--acento btn--grande${listo ? '' : ' btn--apagado'}`}
            style={{ flex: 1 }} onClick={siguiente}>
            {paso === 3 ? 'Crear cuenta y empezar' : 'Continuar'}
          </button>
        </div>
        <span className="registro__ayuda">
          {listo ? (paso === 3 ? 'Tendrás 3 consultas gratis cada mes.' : ' ') : (intento ? AYUDAS[paso] : ' ')}
        </span>
        {paso === 0 && (
          <span style={{ fontSize: 'var(--tipo-sm)', color: 'var(--text-secondary)', textAlign: 'center' }}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </span>
        )}
      </div>
    </div>
  );
}
