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
  '--dato-1', '--dato-2', '--dato-3', '--dato-4',
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

console.log('check-tema: OK');
