import Lumi, { LumiLogo } from '../../mascota/Lumi.jsx';

// Banco de pruebas de la mascota. No es una ruta del producto: sirve para
// mirar las cuatro poses moviéndose a la vez, en claro y en oscuro.
const POSES = ['saluda', 'piensa', 'celebra', 'alerta'];

export default function Mascota() {
  return (
    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 28, background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <LumiLogo alto={44} /><strong style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Catálogo de Lumi</strong>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {POSES.map((p) => (
          <figure key={p} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center',
                                   background: 'var(--bg-surface)', borderRadius: 'var(--radio-2xl)', padding: 20 }}>
            <Lumi pose={p} alto={190} titulo={`Lumi ${p}`} />
            <figcaption style={{ fontWeight: 600 }}>{p}</figcaption>
          </figure>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {POSES.map((p) => (
          <figure key={p} style={{ margin: 0, display: 'flex', justifyContent: 'center',
                                   background: 'var(--bg-noche)', borderRadius: 'var(--radio-2xl)', padding: 20 }}>
            <Lumi pose={p} alto={150} />
          </figure>
        ))}
      </div>
    </div>
  );
}
