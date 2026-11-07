import { useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './store.js';
import { getTenant } from './data/tenant.js';
import { destinoTrasLogin } from './lib/motor.js';

import PublicLayout from './layouts/PublicLayout.jsx';
import AppShell from './layouts/AppShell.jsx';
import Landing from './pages/Landing.jsx';
import PagoLayout from './layouts/PagoLayout.jsx';
import Registro from './pages/Registro.jsx';
import Login from './pages/Login.jsx';
import Chat from './pages/Chat.jsx';
import Diagnostico from './pages/Diagnostico.jsx';
import DiagnosticoResultado from './pages/DiagnosticoResultado.jsx';
import Ofertas from './pages/Ofertas.jsx';
import OfertaDetalle from './pages/OfertaDetalle.jsx';
import Ruta from './pages/Ruta.jsx';
import CV from './pages/CV.jsx';
import Planes from './pages/Planes.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmacion from './pages/Confirmacion.jsx';
import Cuenta from './pages/Cuenta.jsx';
import DocenteChat from './pages/DocenteChat.jsx';
import DocentePanel from './pages/DocentePanel.jsx';

// Con sesión abierta, el login y el registro no tienen sentido: una app real
// te manda adentro en vez de volver a pedirte la contraseña.
function SoloInvitados({ children }) {
  const usuario = useApp((s) => s.usuario);
  const diagnostico = useApp((s) => s.diagnostico);
  const docenteOpcion = useApp((s) => s.docenteOpcion);
  if (!usuario) return children;
  return <Navigate to={destinoTrasLogin({ usuario, diagnostico, docenteOpcion })} replace />;
}

function RutaDocente({ children }) {
  const usuario = useApp((s) => s.usuario);
  if (!usuario || usuario.tipo !== 'docente') return <Navigate to="/chat" replace />;
  return children;
}

function NoEncontrado() {
  const usuario = useApp((s) => s.usuario);
  const diagnostico = useApp((s) => s.diagnostico);
  const docenteOpcion = useApp((s) => s.docenteOpcion);

  // Con la sesión abierta, "el inicio" no es la landing: es la app. Mandar a
  // la página pública a quien solo tecleó mal una URL lo saca de donde estaba
  // y le hace volver a entrar.
  const sesion = Boolean(usuario);
  const destino = sesion ? destinoTrasLogin({ usuario, diagnostico, docenteOpcion }) : '/';
  const etiqueta = !sesion
    ? '← Volver al inicio'
    : usuario.tipo === 'docente'
      ? '← Volver al panel'
      : '← Volver a mi diagnóstico';

  return (
    <div className="seccion seccion--angosta pila" style={{ gap: 16 }}>
      <span className="eti">ERROR 404</span>
      <h1 className="display display--pag" style={{ margin: 0 }}>Esta página no existe</h1>
      <p className="lead" style={{ margin: 0 }}>Puede que el enlace esté mal escrito o que la página haya cambiado de sitio.</p>
      {/* <Link> y no <a href>: una recarga entera perdería el estado en vuelo
          y haría parpadear la app por un enlace mal escrito. */}
      <Link to={destino} className="btn btn--linea" style={{ alignSelf: 'flex-start' }}>{etiqueta}</Link>
    </div>
  );
}

export default function App() {
  const tenant = useApp((s) => s.tenant);
  const sincronizarPeriodo = useApp((s) => s.sincronizarPeriodo);
  const { pathname, hash } = useLocation();

  // El plan gratis se renueva solo al cambiar de mes: ninguna fecha va escrita a mano.
  useEffect(() => { sincronizarPeriodo(); }, [sincronizarPeriodo]);

  // Marca blanca: el acento del tenant manda sobre el token global.
  useEffect(() => {
    // Solo la marca blanca pisa el acento. LMI-U es la marca del producto: su
    // color vive en tokens.css, y asi el tema oscuro puede cambiarlo a lima
    // como manda el sistema de diseno.
    const t = getTenant(tenant);
    const raiz = document.documentElement.style;
    if (t.powered) raiz.setProperty('--accent', t.accent);
    else raiz.removeProperty('--accent');
  }, [tenant]);

  // Cambiar de ruta devuelve el scroll arriba; si no, se entra a media página.
  // Con hash no: ahí el destino es una sección concreta y este scroll la pisaría.
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);

  // Sincronización en vivo entre pestañas: cuando la pasarela confirma el pago
  // en la otra pestaña, la pestaña del chat se entera al instante sin recargar.
  useEffect(() => {
    const sincronizarPestanas = (e) => {
      if (e.key === 'lmiu') {
        useApp.persist?.rehydrate();
      }
    };
    window.addEventListener('storage', sincronizarPestanas);
    return () => window.removeEventListener('storage', sincronizarPestanas);
  }, []);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        {/* La metodología dejó de ser pantalla propia: en la landing es una
            sección y en la app un diálogo. La ruta vieja sigue viva para que
            los enlaces compartidos aterricen donde corresponde. */}
        <Route path="/metodologia" element={<Navigate to="/#metodologia" replace />} />
        <Route path="/registro" element={<SoloInvitados><Registro /></SoloInvitados>} />
        <Route path="/login" element={<SoloInvitados><Login /></SoloInvitados>} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>

      {/* Rutas principales de la aplicación (con barra lateral) */}
      <Route element={<AppShell />}>
        {/* Las cinco secciones del motor de decisión */}
        <Route path="/diagnostico" element={<Diagnostico />} />
        <Route path="/diagnostico/resultado" element={<DiagnosticoResultado />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/ofertas/:ofertaId" element={<OfertaDetalle />} />
        <Route path="/ruta" element={<Ruta />} />
        <Route path="/cv" element={<CV />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:consultaId" element={<Chat />} />
        <Route path="/cuenta" element={<Cuenta />} />
        <Route path="/docente" element={<RutaDocente><DocenteChat /></RutaDocente>} />
        <Route path="/docente/panel" element={<RutaDocente><DocentePanel /></RutaDocente>} />
      </Route>

      {/* Rutas de Pago dedicadas (fuera del chat, sin barra lateral) */}
      <Route element={<PagoLayout />}>
        <Route path="/planes" element={<Planes />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
      </Route>
    </Routes>
  );
}
