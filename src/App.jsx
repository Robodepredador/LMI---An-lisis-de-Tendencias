import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './store.js';
import { getTenant } from './data/tenant.js';

import PublicLayout from './layouts/PublicLayout.jsx';
import AppShell from './layouts/AppShell.jsx';
import Landing from './pages/Landing.jsx';
import Registro from './pages/Registro.jsx';
import Login from './pages/Login.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Chat from './pages/Chat.jsx';
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
  const docenteOpcion = useApp((s) => s.docenteOpcion);
  if (!usuario) return children;
  if (usuario.tipo !== 'docente') return <Navigate to="/chat" replace />;
  return <Navigate to={docenteOpcion === 'B' ? '/docente/panel' : '/docente'} replace />;
}

function RutaDocente({ children }) {
  const usuario = useApp((s) => s.usuario);
  if (!usuario || usuario.tipo !== 'docente') return <Navigate to="/chat" replace />;
  return children;
}

function NoEncontrado() {
  return (
    <div className="seccion seccion--angosta pila" style={{ gap: 16 }}>
      <span className="eti">ERROR 404</span>
      <h1 className="display display--pag" style={{ margin: 0 }}>Esta página no existe</h1>
      <p className="lead" style={{ margin: 0 }}>Puede que el enlace esté mal escrito o que la página haya cambiado de sitio.</p>
      <a href="/" className="btn btn--linea" style={{ alignSelf: 'flex-start' }}>← Volver al inicio</a>
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
    document.documentElement.style.setProperty('--accent', getTenant(tenant).accent);
  }, [tenant]);

  // Cambiar de ruta devuelve el scroll arriba; si no, se entra a media página.
  // Con hash no: ahí el destino es una sección concreta y este scroll la pisaría.
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);

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
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>

      <Route element={<AppShell />}>
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:consultaId" element={<Chat />} />
        <Route path="/planes" element={<Planes />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
        <Route path="/cuenta" element={<Cuenta />} />
        <Route path="/docente" element={<RutaDocente><DocenteChat /></RutaDocente>} />
        <Route path="/docente/panel" element={<RutaDocente><DocentePanel /></RutaDocente>} />
      </Route>
    </Routes>
  );
}
