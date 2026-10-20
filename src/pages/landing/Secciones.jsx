import { Link } from 'react-router-dom';
import Lumi from '../../mascota/Lumi.jsx';
import { cobertura, ventanaAnalisis } from '../../data/contenido.js';

// ── Conoce a Lumi ────────────────────────────────────────────────────
const PROMESAS = [
  ['“Leo las ofertas por ti.”', 'Computrabajo, Bumeran, LinkedIn y portales corporativos, sin duplicados.'],
  ['“Te digo de dónde sale cada dato.”', 'Muestra, periodo y metodología en cada cifra. Si hay menos de 30 ofertas, no invento nada.'],
  ['“Te sugiero qué aprender según tu ciclo.”', 'En 2do ciclo te muestro tendencias; en 5to, qué priorizar antes de tus prácticas.'],
];

export function ConoceLumi() {
  return (
    <section id="lumi" className="sec-lumi">
      <div className="pila" style={{ gap: 18 }}>
        <span className="chip chip--resalte" style={{ alignSelf: 'flex-start' }}>Conoce a Lumi</span>
        <h2 className="display display--pag" style={{ margin: 0 }}>Tu analista del mercado laboral, en tu bolsillo.</h2>
        <p className="lead" style={{ margin: 0, color: 'var(--sobre-accent-tenue)' }}>
          Lumi lee miles de ofertas cada semana y te cuenta lo que encontró en palabras simples.
          Siempre con la metodología a la mano.
        </p>
        <Lumi pose="saluda" alto={240} titulo="Lumi, la mascota de LMI-U" />
      </div>
      <div className="pila" style={{ gap: 14 }}>
        {PROMESAS.map(([t, d]) => (
          <div key={t} className="promesa">
            <strong>{t}</strong>
            <span>{d}</span>
          </div>
        ))}
        <Link to="/registro" className="btn btn--resalte btn--grande" style={{ alignSelf: 'flex-start', marginTop: 6 }}>
          Pregúntale a Lumi gratis
        </Link>
      </div>
    </section>
  );
}

// ── Funciones ────────────────────────────────────────────────────────
const FUNCIONES = [
  ['Habilidades', '“Sabes qué aprender antes de tus prácticas.”',
    'Qué porcentaje de ofertas pide cada herramienta para tu rol y qué está creciendo.', 'fn--accion'],
  ['Salarios', '“Negocia tu primer sueldo con datos, no con suposiciones.”',
    'Rango y mediana por rol, ciudad y experiencia, solo con ofertas que declaran sueldo.', 'fn--resalte'],
  ['Pregunta libre', '“Pregunta como le preguntarías a un asesor de carrera.”',
    'Escribe tu duda sobre el mercado o un puesto. Te respondemos con una explicación y el dato.', 'fn--suave'],
  ['Comparar y cerrar brechas', '“Elige tu especialidad con evidencia.”',
    'Compara dos roles lado a lado y encuentra cursos para lo que te falta.', 'fn--noche'],
];

export function Funciones() {
  return (
    <section id="funciones" className="seccion pila" style={{ gap: 32 }}>
      <div className="pila" style={{ gap: 10 }}>
        <span className="eti">Funciones</span>
        <h2 className="display display--pag" style={{ margin: 0 }}>Deja de adivinar qué estudiar este ciclo.</h2>
      </div>
      <div className="rejilla-fn">
        {FUNCIONES.map(([eti, t, d, clase]) => (
          <article key={t} className={`fn ${clase}`}>
            <span className="fn__eti">{eti}</span>
            <strong className="fn__titular">{t}</strong>
            <p className="fn__texto">{d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── Casos ────────────────────────────────────────────────────────────
// Nombres creíbles, sin cifras de resultado medidas: no hay nadie a quien se
// le haya medido un "+18%", y publicarlo sería inventar un registro.
const CASOS = [
  ['VQ', 'Valeria Quispe', 'Marketing · 6to ciclo',
    'Vio que Meta Ads crecía y llevó un curso corto antes de postular a prácticas en una agencia.'],
  ['DR', 'Diego Ramos', 'Contabilidad · egresado',
    'Llevó la mediana de su rol en Lima a la entrevista y supo qué rango pedir.'],
  ['MC', 'Mariana Chávez', 'Ing. Industrial · 5to ciclo',
    'Comparó Mejora Continua con Supply Chain y eligió sus electivos con el gráfico delante.'],
];

export function Casos() {
  return (
    <section id="casos" className="seccion pila" style={{ gap: 32 }}>
      <div className="pila" style={{ gap: 10 }}>
        <span className="eti">Para qué sirve</span>
        <h2 className="display display--pag" style={{ margin: 0 }}>Lo que cambió después de consultar.</h2>
      </div>
      <div className="rejilla-casos">
        {CASOS.map(([ini, nombre, ctx, texto]) => (
          <article key={nombre} className="caso">
            <div className="caso__quien">
              <span className="avatar">{ini}</span>
              <div className="pila" style={{ gap: 2 }}>
                <strong>{nombre}</strong>
                <span className="caso__ctx">{ctx}</span>
              </div>
            </div>
            <p className="caso__texto">{texto}</p>
          </article>
        ))}
      </div>
      <span className="nota nota--compacta">
        Historias de uso ilustrativas, escritas a partir de las consultas más frecuentes.
      </span>
    </section>
  );
}

// ── Pie ──────────────────────────────────────────────────────────────
export function Pie() {
  return (
    <footer className="pie">
      <div className="pie__cobertura">
        <strong>Metodología</strong>
        {cobertura().map((c) => (
          <span key={c.k}><strong>{c.v}</strong> {c.k}</span>
        ))}
        <span>Ventana: {ventanaAnalisis()}</span>
        <Link to="/#metodologia">Ver metodología ↗</Link>
      </div>
      <div className="pie__legal">
        <span>© 2026 LMI-U · Inteligencia de mercado laboral en Perú</span>
        <div className="pie__pagos">
          <span>Pagos en soles con</span>
          {['Yape', 'Plin', 'Tarjeta', 'PagoEfectivo'].map((m) => <span key={m} className="chip">{m}</span>)}
        </div>
      </div>
    </footer>
  );
}
