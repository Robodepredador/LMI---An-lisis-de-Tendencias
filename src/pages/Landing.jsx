import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CasosYResenas,
  ConoceLumi,
  Funciones,
  Pie,
  PlanesYComparativa,
} from './landing/Secciones.jsx';
import ContenidoMetodologia from '../components/metodologia.jsx';
import Modal from '../components/Modal.jsx';
import InterruptorTema from '../components/InterruptorTema.jsx';
import { LumiLogo } from '../mascota/Lumi.jsx';

// ── Barra de Navegación de la Landing (Diseño de Laptop) ──────────────
function LandingNav() {
  const ir = useNavigate();

  const desplazarA = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="landing-nav">
      <div className="landing-nav__inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <LumiLogo alto={36} />
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, whiteSpace: 'nowrap' }}>
            LMI-U
          </strong>
        </div>

        <div className="landing-nav__links">
          <button type="button" className="landing-nav__link" onClick={() => desplazarA('sec-lumi')}>
            Conoce a Lumi
          </button>
          <button type="button" className="landing-nav__link" onClick={() => desplazarA('sec-funciones')}>
            Funciones
          </button>
          <button type="button" className="landing-nav__link" onClick={() => desplazarA('sec-casos')}>
            Casos de éxito
          </button>
          <button type="button" className="landing-nav__link" onClick={() => desplazarA('sec-planes')}>
            Planes
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 15, fontWeight: 500, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => ir('/login')}
            style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className="landing-nav__btn-prueba"
            onClick={() => ir('/registro')}
          >
            Prueba gratis
          </button>
          <InterruptorTema />
        </div>
      </div>
    </nav>
  );
}

// ── Hero Section (Prototipo Image 3) ──────────────────────────────────
function Hero() {
  const ir = useNavigate();

  return (
    <section className="hero-seccion">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <h1 className="hero-titulo">
          Descubre qué pide el mercado para tu carrera <span className="hero-resalte">antes</span> de graduarte.
        </h1>
        <p style={{ margin: 0, fontSize: 19, lineHeight: 1.55, color: 'var(--text-secondary)', maxWidth: 540 }}>
          Analizamos miles de ofertas publicadas en Perú para decirte qué habilidades piden las empresas, cuánto pagan y qué roles crecen. Cada cifra enlaza a su fuente.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="hero-cta"
            onClick={() => ir('/registro')}
          >
            Prueba gratis · 3 consultas
          </button>
        </div>
      </div>

      <div className="hero-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LumiLogo alto={50} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
            Lumi encontró esto · Community Manager · Lima
          </span>
        </div>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, lineHeight: 1.15 }}>
          Además de redes, 1 de cada 2 ofertas ya pide Meta Ads y Excel.
        </strong>
        <div className="hero-card__inner">
          <div className="hero-bar-row">
            <span>Gestión de redes</span>
            <div className="hero-bar-track">
              <div className="hero-bar-fill-muted" style={{ width: '91%' }} />
            </div>
            <strong>91%</strong>
          </div>
          <div className="hero-bar-row">
            <strong>Meta Ads</strong>
            <div className="hero-bar-track">
              <div className="hero-bar-fill-accent" style={{ width: '52%' }} />
            </div>
            <strong>52%</strong>
          </div>
          <div className="hero-bar-row">
            <strong>Excel</strong>
            <div className="hero-bar-track">
              <div className="hero-bar-fill-accent" style={{ width: '48%' }} />
            </div>
            <strong>48%</strong>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            640 ofertas · Computrabajo, Bumeran, LinkedIn · jul–oct 2026
          </span>
        </div>
      </div>
    </section>
  );
}

// ── Página Principal Landing ──────────────────────────────────────────
export default function Landing() {
  const { hash } = useLocation();
  const [verMetodologia, setVerMetodologia] = useState(false);

  useEffect(() => {
    const handler = () => setVerMetodologia(true);
    window.addEventListener('abrir-metodologia', handler);
    return () => window.removeEventListener('abrir-metodologia', handler);
  }, []);

  useEffect(() => {
    if (!hash) return;
    if (hash === '#metodologia') {
      const t = setTimeout(() => setVerMetodologia(true), 0);
      return () => clearTimeout(t);
    }
    const targetId = hash.slice(1);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <div className="landing-page">
      {/* Barra superior de navegación */}
      <LandingNav />

      {/* Hero */}
      <Hero />

      {/* Conoce a Lumi */}
      <ConoceLumi />

      {/* Funciones */}
      <Funciones />

      {/* Casos de éxito y Reseñas */}
      <CasosYResenas />

      {/* Planes y Comparativa */}
      <PlanesYComparativa />

      {/* Footer */}
      <Pie onAbrirMetodologia={() => setVerMetodologia(true)} />

      {/* Modal de metodología */}
      <Modal abierto={verMetodologia} onCerrar={() => setVerMetodologia(false)} titulo="Metodología y fuentes">
        <ContenidoMetodologia />
      </Modal>
    </div>
  );
}
