// Comprueba el tema: que los tokens existan, que no haya colores literales
// fuera de tokens.css, y que los pares que el usuario de verdad mira pasen
// contraste. Los umbrales no son decorativos: el botón primario deshabilitado
// del prototipo daba 1.64:1 y era ilegible en login y en los 4 pasos del
// registro.
//   node scripts/check-tema.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leer = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

// ── Contraste WCAG 2.1 ───────────────────────────────────────────────
const canal = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const luminancia = (hex) => {
  const h = hex.trim().replace('#', '');
  const n = h.length === 3 ? [...h].map((c) => c + c) : h.match(/../g);
  const [r, g, b] = n.map((c) => canal(parseInt(c, 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contraste = (a, b) => {
  const [hi, lo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// ── Lectura de tokens ────────────────────────────────────────────────
const css = leer('src/theme/tokens.css');

function bloque(selector) {
  const i = css.indexOf(selector);
  assert.notEqual(i, -1, `tokens.css debe declarar ${selector}`);
  const abre = css.indexOf('{', i);
  const cierra = css.indexOf('}', abre);
  return css.slice(abre + 1, cierra);
}

function tokensDe(selector) {
  return [...bloque(selector).matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]).sort();
}

function lector(selector) {
  const b = bloque(selector);
  return (nombre) => {
    const m = b.match(new RegExp(`${nombre}\\s*:\\s*([^;]+);`));
    assert.ok(m, `falta el token ${nombre} en ${selector}`);
    const v = m[1].trim();
    assert.match(v, /^#[0-9a-fA-F]{3,6}$/, `${nombre} debe ser un hex literal, no "${v}"`);
    return v;
  };
}

const t = lector(':root');

// ── Tokens obligatorios ──────────────────────────────────────────────
const OBLIGATORIOS = [
  '--bg-page', '--bg-surface', '--bg-elevated',
  '--text-primary', '--text-secondary',
  '--accent', '--accent-fg', '--accent-apagado', '--accent-apagado-fg',
  '--sobre-accent', '--sobre-accent-tenue',
  '--resalte', '--resalte-fg',
  '--linea', '--borde-campo',
  '--dato-1', '--dato-2', '--dato-3', '--dato-4', '--dato-5',
  '--alerta', '--alerta-bg', '--alerta-fg',
  '--estrella', '--lumi-linea',
];
for (const nombre of OBLIGATORIOS) t(nombre);

const declarados = tokensDe(':root');
for (const r of ['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'])
  assert.ok(declarados.includes(`--radio-${r}`), `falta --radio-${r}`);
for (const s of ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'])
  assert.ok(declarados.includes(`--tipo-${s}`), `falta --tipo-${s}`);

// ── Contraste, tema claro ────────────────────────────────────────────
assert.ok(contraste(t('--text-secondary'), t('--bg-surface')) >= 4.5,
  'texto secundario sobre tarjeta debe pasar AA');
assert.ok(contraste(t('--accent-fg'), t('--accent')) >= 4.5,
  'el texto del boton primario debe pasar AA');
assert.ok(contraste(t('--borde-campo'), t('--bg-surface')) >= 3,
  'el borde de campo debe pasar 1.4.11 (hoy #E4E2F3 da 1.27)');
assert.ok(contraste(t('--dato-2'), t('--bg-surface')) >= 3,
  'las barras no destacadas deben pasar 1.4.11 (hoy #C9C4FF da 1.64)');
assert.ok(contraste(t('--estrella'), t('--bg-surface')) >= 3,
  'las estrellas deben ser visibles (hoy #FFB020 da 1.83)');
assert.ok(contraste(t('--accent-apagado-fg'), t('--accent-apagado')) >= 4.5,
  'el boton primario deshabilitado debe leerse (hoy blanco sobre #C9C4FF da 1.64)');
assert.ok(contraste(t('--sobre-accent-tenue'), t('--accent')) >= 4.5,
  'las etiquetas de paso sobre indigo deben pasar AA (hoy #C9C4FF da 3.81)');

// ── Tema oscuro ──────────────────────────────────────────────────────
// La paridad se exige sobre tokens de COLOR. Fuentes, radios y escala
// tipográfica no cambian con el tema y viven solo en :root.
const esColor = (v) => /^(#[0-9a-fA-F]{3,6}|rgba?\()/.test(v.trim());
function coloresDe(selector) {
  const b = bloque(selector);
  return [...b.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
    .filter((m) => esColor(m[2]))
    .map((m) => m[1])
    .sort();
}

assert.ok(css.includes('[data-theme="dark"]'), 'tokens.css debe declarar [data-theme="dark"]');
assert.deepEqual(coloresDe(':root'), coloresDe('[data-theme="dark"]'),
  'cada token de color claro necesita su contraparte oscura');

const o = lector('[data-theme="dark"]');
assert.ok(contraste(o('--text-secondary'), o('--bg-surface')) >= 4.5,
  'texto secundario sobre tarjeta oscura debe pasar AA');
assert.ok(contraste(o('--accent-fg'), o('--accent')) >= 4.5,
  'en oscuro el acento es lima y su texto debe pasar AA');
assert.ok(contraste(o('--linea'), o('--bg-surface')) >= 1.2,
  'la linea divisoria debe distinguirse del fondo oscuro');
assert.ok(contraste(o('--text-primary'), o('--bg-page')) >= 4.5,
  'el texto principal sobre el fondo oscuro debe pasar AA');
assert.ok(contraste(o('--borde-campo'), o('--bg-surface')) >= 3,
  'el borde de campo tambien debe cumplir 1.4.11 en oscuro');
for (const d of ['--dato-1', '--dato-2', '--dato-3', '--dato-4', '--dato-5'])
  assert.ok(contraste(o(d), o('--bg-surface')) >= 3,
    `${d} debe distinguirse de la tarjeta oscura`);

// Review Focus #4: sin esto hay un destello de tema claro al recargar
assert.match(leer('index.html'), /localStorage[\s\S]*lmi-tema[\s\S]*data-theme/,
  'index.html necesita el script sincrono anti-destello antes de la hoja de estilos');

// ── Pureza de la capa de componentes ─────────────────────────────────
// Un color literal aquí es un color que el interruptor de tema no puede
// cambiar: en oscuro se queda como estaba y rompe la pantalla.
const compCompleto = leer('src/theme/componentes.css');
// @media print se exime: el papel no tiene tema, y forzar tokens ahí
// imprimiría el fondo oscuro.
const comp = compCompleto
  .replace(/@media\s+print\s*\{[\s\S]*?\n\}/g, '')
  // Un hex dentro de un comentario no es un color que el tema no pueda
  // cambiar: casi siempre es la explicación de por qué se dejó de usar.
  .replace(/\/\*[\s\S]*?\*\//g, '');
const literales = [...comp.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)].map((m) => m[0]);
assert.deepEqual(literales, [],
  `componentes.css no debe llevar colores literales: ${literales.join(', ')}`);

const ESCALA_RADIOS = ['8px', '14px', '16px', '20px', '24px', '28px', '999px', '50%', '0'];
const radios = [...comp.matchAll(/border-radius:\s*([^;]+);/g)]
  .flatMap((m) => m[1].trim().split(/\s+/))
  .filter((v) => !v.startsWith('var('));
assert.deepEqual(radios.filter((r) => !ESCALA_RADIOS.includes(r)), [],
  `todos los radios deben salir de la escala o de un token: ${radios.join(', ')}`);

console.log('check-tema: OK');
