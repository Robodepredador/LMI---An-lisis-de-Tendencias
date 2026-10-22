import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { CONSULTAS_GRATIS, useApp } from '../store.js';
import { fechaCorta, proximaRenovacion, vigenciaCreditos } from '../data/contenido.js';
import { alternarTema, leerTema } from '../lib/tema.js';
import Lumi from '../mascota/Lumi.jsx';

// Iconos vectoriales limpios y coherentes con el sistema de diseño
function IconoPerfil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconoPagos() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="6" y1="15" x2="10" y2="15" />
    </svg>
  );
}

function IconoConsumo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  );
}

function IconoTema() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconoReset() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconoSalir() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// Formateador relativo de timestamp para consultas
function formatearHoraConsulta(ts) {
  if (!ts) return 'Reciente';
  const d = new Date(ts);
  const ahora = new Date();
  const esHoy = d.toDateString() === ahora.toDateString();
  const ayer = new Date(ahora.getTime() - 864e5);
  const esAyer = d.toDateString() === ayer.toDateString();
  const horas = String(d.getHours()).padStart(2, '0');
  const minutos = String(d.getMinutes()).padStart(2, '0');
  const horaStr = `${horas}:${minutos}`;
  if (esHoy) return `Hoy, ${horaStr}`;
  if (esAyer) return `Ayer, ${horaStr}`;
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${meses[d.getMonth()]}, ${horaStr}`;
}

export default function MenuPerfil() {
  const usuario = useApp((s) => s.usuario);
  const plan = useApp((s) => s.plan);
  const creditos = useApp((s) => s.creditos);
  const usadasMes = useApp((s) => s.usadasMes) || 0;
  const restantes = useApp((s) => s.restantes());
  const pagos = useApp((s) => s.pagos) || [];
  const consultas = useApp((s) => s.consultas) || [];
  const salir = useApp((s) => s.salir);
  const resetearIntentos = useApp((s) => s.resetearIntentos);
  const abrirModalPlanes = useApp((s) => s.abrirModalPlanes);
  const setRutaRetornoChat = useApp((s) => s.setRutaRetornoChat);
  const actualizarPerfil = useApp((s) => s.actualizarPerfil);

  const ir = useNavigate();
  const { pathname } = useLocation();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [drawerActivo, setDrawerActivo] = useState(null); // 'perfil' | 'pagos' | 'consumo' | null
  const [tema, setTema] = useState(leerTema);

  const botonRef = useRef(null);
  const menuRef = useRef(null);

  // Estados del formulario "Editar perfil"
  const [nombre, setNombre] = useState('');
  const [uni, setUni] = useState('');
  const [carrera, setCarrera] = useState('');
  const [ciclo, setCiclo] = useState(8);
  const [region, setRegion] = useState('');
  const [intereses, setIntereses] = useState([]);
  const [guardadoExito, setGuardadoExito] = useState(false);

  // Sincronizar datos al abrir "Editar perfil"
  useEffect(() => {
    if (drawerActivo === 'perfil' && usuario) {
      setNombre(usuario.nombre || '');
      setUni(usuario.uni || usuario.universidad || 'Universidad Nacional de San Agustín');
      setCarrera(usuario.carrera || 'Ingeniería de Sistemas');
      setCiclo(usuario.ciclo ?? 8);
      setRegion(usuario.region || usuario.ciudades?.[0] || 'Arequipa');
      setIntereses(
        usuario.intereses && usuario.intereses.length > 0
          ? usuario.intereses
          : ['Análisis de datos', 'Desarrollo web', 'Ciberseguridad', 'IA y machine learning']
      );
      setGuardadoExito(false);
    }
  }, [drawerActivo, usuario]);

  // Control de clic fuera y tecla Escape
  useEffect(() => {
    if (!menuAbierto && !drawerActivo) return;

    const alClicFuera = (e) => {
      // Si hay un drawer activo, el drawer y su backdrop gestionan su propio cierre
      if (drawerActivo) return;

      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        botonRef.current &&
        !botonRef.current.contains(e.target)
      ) {
        setMenuAbierto(false);
      }
    };

    const alEsc = (e) => {
      if (e.key === 'Escape') {
        if (drawerActivo) {
          setDrawerActivo(null); // Solo cierra el drawer, el popover sigue abierto
        } else {
          setMenuAbierto(false);
        }
      }
    };

    document.addEventListener('mousedown', alClicFuera);
    document.addEventListener('keydown', alEsc);
    return () => {
      document.removeEventListener('mousedown', alClicFuera);
      document.removeEventListener('keydown', alEsc);
    };
  }, [menuAbierto, drawerActivo]);

  if (!usuario) return null;

  const esOscuro = tema === 'oscuro';

  const alternarModoOscuro = () => {
    const nuevo = alternarTema();
    setTema(nuevo);
  };

  const abrirPlanes = () => {
    setMenuAbierto(false);
    setDrawerActivo(null);
    setRutaRetornoChat(pathname.startsWith('/chat') ? pathname : '/chat');
    abrirModalPlanes();
  };

  const handleGuardarPerfil = (e) => {
    e?.preventDefault();
    const iniciales = (nombre || usuario.nombre || 'VR')
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'VR';

    actualizarPerfil({
      nombre: nombre.trim() || usuario.nombre,
      uni: uni.trim(),
      universidad: uni.trim(),
      carrera: carrera.trim(),
      ciclo: Number(ciclo) || 1,
      region: region.trim(),
      ciudades: [region.trim() || 'Arequipa'],
      intereses,
      iniciales,
    });
    setGuardadoExito(true);
    setTimeout(() => {
      setDrawerActivo(null);
      setGuardadoExito(false);
    }, 600);
  };

  const toggleInteres = (chip) => {
    setIntereses((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const chipsInteresesDisponibles = [
    'Análisis de datos',
    'Desarrollo web',
    'Ciberseguridad',
    'IA y machine learning',
    'Gestión de proyectos',
    'UX',
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Botón Avatar en la cabecera */}
      <button
        ref={botonRef}
        type="button"
        className="avatar"
        style={{
          border: '2px solid transparent',
          borderColor: menuAbierto ? 'var(--accent)' : 'transparent',
          cursor: 'pointer',
          width: 36,
          height: 36,
          fontSize: 13.5,
          fontWeight: 700,
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
          transition: 'all 0.15s ease',
        }}
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-label="Abrir menú de usuario"
        aria-expanded={menuAbierto}
        title={`Conectado como ${usuario.nombre}`}
      >
        {usuario.iniciales}
      </button>

      {/* ── Popover emergente de perfil ── */}
      {menuAbierto && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 324,
            zIndex: 1000,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--linea)',
            borderRadius: 22,
            boxShadow: '0 18px 46px -6px rgba(15, 23, 42, 0.18), 0 6px 18px rgba(15, 23, 42, 0.08)',
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            animation: 'popoverScaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Cabecera del usuario: Avatar grande + Nombre + Correo/Rol */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '2px 4px 4px' }}>
            <span
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                background: 'var(--bg-surface)',
                color: 'var(--accent)',
                border: '1.5px solid var(--linea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {usuario.iniciales}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <strong
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {usuario.nombre}
              </strong>
              <span
                style={{
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {usuario.email || 'valeria.rios@demo.pe'} · {usuario.rol || 'Estudiante'}
              </span>
            </div>
          </div>

          {/* Tarjeta del Plan actual con barra de progreso y botón Ver opciones */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--linea)',
              borderRadius: 16,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                {plan === 'free'
                  ? 'Plan gratis'
                  : plan === 'creditos'
                    ? 'Créditos'
                    : plan === 'pro'
                      ? 'Plan Pro'
                      : 'Licencia institucional'}
              </strong>
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>
                {plan === 'free'
                  ? `${restantes} de ${CONSULTAS_GRATIS}`
                  : plan === 'creditos'
                    ? `${creditos} cr.`
                    : 'Ilimitado'}
              </span>
            </div>

            {/* Barra de progreso visual */}
            <div
              style={{
                width: '100%',
                height: 6,
                background: 'rgba(99, 102, 241, 0.15)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width:
                    plan === 'free'
                      ? `${(restantes / CONSULTAS_GRATIS) * 100}%`
                      : plan === 'creditos'
                        ? `${Math.min(100, (creditos / 25) * 100)}%`
                        : '100%',
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 999,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {plan === 'free'
                ? `${restantes} de ${CONSULTAS_GRATIS} consultas este mes · se renueva el ${proximaRenovacion()}`
                : plan === 'creditos'
                  ? `Válidos hasta el ${vigenciaCreditos()}`
                  : 'Consultas ilimitadas'}
            </span>

            <button
              type="button"
              onClick={abrirPlanes}
              style={{
                background: 'var(--accent)',
                color: '#ffffff',
                border: 0,
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'center',
                transition: 'filter 0.15s ease',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            >
              Ver opciones
            </button>
          </div>

          {/* Lista de opciones del menú */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Opción 1: Editar perfil */}
            <button
              type="button"
              onClick={() => setDrawerActivo('perfil')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 10,
                background: 'none',
                border: 0,
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><IconoPerfil /></span>
                <span>Editar perfil</span>
              </div>
            </button>

            {/* Opción 2: Pagos */}
            <button
              type="button"
              onClick={() => setDrawerActivo('pagos')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 10,
                background: 'none',
                border: 0,
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><IconoPagos /></span>
                <span>Pagos</span>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                {pagos.length === 0 ? 'Sin pagos' : `${pagos.length} pagos`}
              </span>
            </button>

            {/* Opción 3: Consumo */}
            <button
              type="button"
              onClick={() => setDrawerActivo('consumo')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 10,
                background: 'none',
                border: 0,
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><IconoConsumo /></span>
                <span>Consumo</span>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                {usadasMes} usadas este mes
              </span>
            </button>

            {/* Opción 4: Tema oscuro con interruptor interactivo */}
            <div
              onClick={alternarModoOscuro}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 500,
                userSelect: 'none',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><IconoTema /></span>
                <span>Tema oscuro</span>
              </div>
              {/* Interruptor toggle switch */}
              <div
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 999,
                  background: esOscuro ? 'var(--accent)' : '#cbd5e1',
                  position: 'relative',
                  transition: 'background 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    background: '#ffffff',
                    position: 'absolute',
                    top: 3,
                    left: 3,
                    transform: esOscuro ? 'translateX(18px)' : 'translateX(0)',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Separador sutil */}
          <div style={{ height: 1, background: 'var(--linea)', margin: '2px 0' }} />

          {/* Botones de acción inferiores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Reiniciar intentos */}
            <button
              type="button"
              onClick={() => {
                resetearIntentos();
                setMenuAbierto(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 12px',
                borderRadius: 10,
                background: 'none',
                border: 0,
                cursor: 'pointer',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontWeight: 500,
                textAlign: 'left',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ color: 'var(--text-secondary)', display: 'flex' }}><IconoReset /></span>
              <span>Reiniciar intentos (3 de 3)</span>
            </button>

            {/* Cerrar sesión */}
            <button
              type="button"
              onClick={() => {
                setMenuAbierto(false);
                salir();
                ir('/');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 12px',
                borderRadius: 10,
                background: 'none',
                border: 0,
                cursor: 'pointer',
                color: '#dc2626',
                fontSize: 14,
                fontWeight: 600,
                textAlign: 'left',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ color: '#dc2626', display: 'flex' }}><IconoSalir /></span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* ── DRAWERS LATERALES DESLIZABLES DESDE LA DERECHA (PORTAL A BODY) ── */}
      {drawerActivo && createPortal(
        <>
          {/* Backdrop con desenfoque suave */}
          <div
            onClick={() => setDrawerActivo(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(2px)',
              zIndex: 9990,
              animation: 'fadeInOverlay 0.2s ease-out',
            }}
          />

          {/* Panel deslizante */}
          <aside
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 440,
              maxWidth: '92vw',
              zIndex: 9999,
              background: 'var(--bg-elevated)',
              boxShadow: '-12px 0 40px rgba(15, 23, 42, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'drawerSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* ══════════════════════════════════════════════════════════
                DRAWER 1: EDITAR PERFIL
               ══════════════════════════════════════════════════════════ */}
            {drawerActivo === 'perfil' && (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '24px 28px 18px',
                    borderBottom: '1px solid var(--linea)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      Editar perfil
                    </h2>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Lumi usa estos datos para afinar sus respuestas.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerActivo(null)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--linea)',
                      borderRadius: 999,
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: 'var(--text-secondary)',
                      lineHeight: 1,
                      transition: 'all 0.15s ease',
                    }}
                    aria-label="Cerrar panel"
                  >
                    ×
                  </button>
                </div>

                <form
                  onSubmit={handleGuardarPerfil}
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                  }}
                >
                  {/* Nombre completo */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Valeria Ríos"
                      style={{
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--linea)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        font: "400 14px 'Onest', system-ui, sans-serif",
                        outline: 'none',
                      }}
                      required
                    />
                  </div>

                  {/* Universidad */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Universidad
                    </label>
                    <input
                      type="text"
                      value={uni}
                      onChange={(e) => setUni(e.target.value)}
                      placeholder="Universidad Nacional de San Agustín"
                      style={{
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--linea)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        font: "400 14px 'Onest', system-ui, sans-serif",
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Carrera y Ciclo en fila */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Carrera
                      </label>
                      <input
                        type="text"
                        value={carrera}
                        onChange={(e) => setCarrera(e.target.value)}
                        placeholder="Ingeniería de Sistemas"
                        style={{
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1px solid var(--linea)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          font: "400 14px 'Onest', system-ui, sans-serif",
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Ciclo
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={ciclo}
                        onChange={(e) => setCiclo(e.target.value)}
                        placeholder="8"
                        style={{
                          padding: '11px 14px',
                          borderRadius: 10,
                          border: '1px solid var(--linea)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          font: "400 14px 'Onest', system-ui, sans-serif",
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Región donde buscas trabajo */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Región donde buscas trabajo
                    </label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Arequipa"
                      style={{
                        padding: '11px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--linea)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        font: "400 14px 'Onest', system-ui, sans-serif",
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Intereses en chips interactivos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Intereses
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {chipsInteresesDisponibles.map((chip) => {
                        const seleccionado = intereses.includes(chip);
                        return (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => toggleInteres(chip)}
                            style={{
                              padding: '7px 16px',
                              borderRadius: 999,
                              fontSize: 13,
                              fontWeight: seleccionado ? 700 : 500,
                              cursor: 'pointer',
                              border: seleccionado ? '1.5px solid var(--accent)' : '1px solid var(--linea)',
                              background: seleccionado ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)',
                              color: seleccionado ? 'var(--accent)' : 'var(--text-secondary)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </form>

                {/* Botones inferiores fijos */}
                <div
                  style={{
                    padding: '18px 28px',
                    borderTop: '1px solid var(--linea)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 12,
                    background: 'var(--bg-elevated)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setDrawerActivo(null)}
                    style={{
                      padding: '11px 20px',
                      borderRadius: 999,
                      border: '1px solid var(--linea)',
                      background: 'none',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardarPerfil}
                    style={{
                      padding: '11px 24px',
                      borderRadius: 999,
                      border: 0,
                      background: guardadoExito ? '#10b981' : 'var(--accent)',
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {guardadoExito ? '¡Guardado!' : 'Guardar cambios'}
                  </button>
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════
                DRAWER 2: PAGOS
               ══════════════════════════════════════════════════════════ */}
            {drawerActivo === 'pagos' && (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '24px 28px 18px',
                    borderBottom: '1px solid var(--linea)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      Pagos
                    </h2>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      Tus compras y boletas electrónicas.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerActivo(null)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--linea)',
                      borderRadius: 999,
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: 'var(--text-secondary)',
                      lineHeight: 1,
                      transition: 'all 0.15s ease',
                    }}
                    aria-label="Cerrar panel"
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  {pagos.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px 16px',
                        textAlign: 'center',
                        gap: 12,
                        margin: 'auto 0',
                      }}
                    >
                      <Lumi pose="pensativo" alto={88} />
                      <strong style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginTop: 8 }}>
                        No tienes pagos registrados
                      </strong>
                      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 280, margin: 0, lineHeight: 1.5 }}>
                        Cuando compres consultas, aquí verás cada pago con su boleta.
                      </p>
                      <button
                        type="button"
                        onClick={abrirPlanes}
                        style={{
                          background: 'none',
                          border: 0,
                          color: 'var(--accent)',
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '6px 12px',
                          marginTop: 6,
                        }}
                      >
                        Ver opciones
                      </button>
                    </div>
                  ) : (
                    pagos.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          border: '1px solid var(--linea)',
                          borderRadius: 14,
                          padding: '14px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'var(--bg-surface)',
                          gap: 14,
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                          <strong style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {p.concepto}
                          </strong>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {fechaCorta(p.ts)} · {p.metodo ? String(p.metodo).toUpperCase() : 'YAPE'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <strong className="mono" style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                            S/ {p.monto}
                          </strong>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 999,
                              border: '1px solid var(--linea)',
                              background: 'var(--bg-elevated)',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: 'var(--text-primary)',
                            }}
                          >
                            Boleta
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* ══════════════════════════════════════════════════════════
                DRAWER 3: CONSUMO
               ══════════════════════════════════════════════════════════ */}
            {drawerActivo === 'consumo' && (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '24px 28px 18px',
                    borderBottom: '1px solid var(--linea)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      Consumo
                    </h2>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {usadasMes} usadas este mes · {restantes !== null ? `${restantes} disponibles` : 'ilimitadas'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerActivo(null)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--linea)',
                      borderRadius: 999,
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: 'var(--text-secondary)',
                      lineHeight: 1,
                      transition: 'all 0.15s ease',
                    }}
                    aria-label="Cerrar panel"
                  >
                    ×
                  </button>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 18,
                  }}
                >
                  {/* Barra de progreso segmentada */}
                  <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                    {[1, 2, 3].map((seg) => (
                      <div
                        key={seg}
                        style={{
                          flex: 1,
                          height: 7,
                          borderRadius: 999,
                          background:
                            usadasMes >= seg
                              ? 'var(--accent)'
                              : 'var(--linea)',
                          transition: 'background 0.3s ease',
                        }}
                      />
                    ))}
                  </div>

                  {/* Lista de consultas realizadas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {consultas.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '40px 16px',
                          color: 'var(--text-secondary)',
                          fontSize: 13.5,
                        }}
                      >
                        Todavía no has realizado consultas este mes.
                      </div>
                    ) : (
                      consultas.slice(0, 15).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setDrawerActivo(null);
                            ir(c.hiloId ? `/chat/${c.hiloId}` : `/chat/${c.id}`);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--linea)',
                            borderRadius: 12,
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.background = 'var(--bg-elevated)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--linea)';
                            e.currentTarget.style.background = 'var(--bg-surface)';
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {c.pregunta}
                          </span>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%',
                            }}
                          >
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              {formatearHoraConsulta(c.ts)}
                            </span>
                            <span
                              style={{
                                background: c.costo ? 'var(--bg-elevated)' : '#bef264',
                                color: c.costo ? 'var(--text-secondary)' : '#0f172a',
                                border: c.costo ? '1px solid var(--linea)' : 0,
                                borderRadius: 999,
                                padding: '2px 8px',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {c.costo ? '1 consulta' : 'sin costo'}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {consultas.length > 0 && (
                    <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', textAlign: 'left', marginTop: 4 }}>
                      Toca una consulta para abrirla en el chat.
                    </span>
                  )}
                </div>
              </>
            )}
          </aside>
        </>,
        document.body
      )}
    </div>
  );
}
