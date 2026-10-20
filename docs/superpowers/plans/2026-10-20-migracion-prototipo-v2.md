# Migración del prototipo LMI-U v2 — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La app desplegada en Vercel se ve y se comporta como el prototipo v2 aprobado, con modo oscuro, los tres gráficos nuevos y la mascota Lumi animada.

**Architecture:** El tema ya está centralizado (183 `var(--…)` contra 16 colores crudos en `componentes.css`), así que el reskin se hace reescribiendo `:root` y la capa de 90 clases, no tocando los componentes uno a uno. Los datos derivados (selección de habilidades, serie de tendencia, respaldo de consulta) se extraen a funciones puras en `src/lib/` para poder probarlas con el idioma que el repo ya usa: scripts `node:assert`. Los cuatro rigs de Lumi se montan en línea como componentes React para que sigan el interruptor de tema.

**Tech Stack:** React 19, Vite 8, react-router-dom 7, zustand 5, `@google/genai`, oxlint. Pruebas: `node:assert/strict` en `scripts/check-*.mjs` — **no se introduce ningún framework de test**.

**Spec:** `docs/superpowers/specs/2026-10-20-migracion-prototipo-v2-design.md`

## Global Constraints

- Objetivo escritorio. No se rediseña para celular; no se rompe lo responsive existente.
- Ninguna cifra en pantalla pasa por el modelo. `insight` de Gemini es la única prosa generada.
- Ninguna fecha ni cifra de cobertura escrita a mano: salen de `catalogo.json` vía `cobertura()` y `ventanaAnalisis()` en `src/data/contenido.js`.
- El componente Fuente lleva muestra + periodo + portales + enlace en cada cifra. El enlace abre el modal de metodología y se etiqueta **"Ver metodología"**.
- Prohibido publicar: sello `✓ Verificada`, el texto "De 312 reseñas verificadas con correo universitario", cifras de resultado medidas en casos de éxito, y el precio sin verificar de LinkedIn Premium.
- Fuentes: `Bricolage Grotesque` (display) + `Onest` (cuerpo). Se retiran Newsreader, Schibsted Grotesk y JetBrains Mono.
- Paleta clara: índigo `#4B3BFF` acción · lima `#C6F24E` resalte · noche `#17153A` texto · blanco `#FFFFFF` tarjeta · `#F7F7FC` fondo · `#F3F2FF` lavanda · `#55527A` humo.
- Paleta oscura: `#0F0E29` fondo · `#17153A` tarjeta · `#221F52` elevado · `#C6F24E` acción · `#8A80FF` datos · `#F4F3FF` texto · `#B3AEE0` secundario · `#FF8A6E` coral.
- Escala de radios: 8 / 14 / 16 / 20 / 24 / 28 / pill. Escala tipográfica: 12 / 13 / 15 / 17 / 20 / 24 / 34 / 46 / 64.
- Todo texto de interfaz en español.
- `npm run lint` (oxlint) debe pasar al final de cada tarea.

## Review Focus

Cinco cosas que la spec implica, que ningún entregable obvio ejercita, y que muerden a un estudiante real. Cada una tiene su prueba asignada a la tarea dueña del código.

1. **Dos habilidades con el mismo `pct`** — el selector debe ser determinista y no perder ninguna fila. *(Task 6)*
2. **`tendencia` negativa o cero** — la pendiente baja, la pastilla va en coral y el titular no dice "creció". 10 de las 179 habilidades del catálogo tienen tendencia ≤ 0. *(Task 8)*
3. **Muestra bajo el mínimo en el respaldo local** — sin API, la regla de no cobrar tiene que aplicarse igual que en el backend. *(Task 14)*
4. **Recarga con tema oscuro activo** — el tema persiste y no hay destello de tema claro antes de hidratar. *(Task 2)*
5. **`prefers-reduced-motion: reduce`** — ninguna animación de Lumi corre, en ninguna pose. *(Task 10)*

---

## Estructura de archivos

**Se crean:**
- `src/theme/tokens.css` — `:root` claro + `[data-theme="dark"]`. Único sitio con colores literales.
- `src/lib/habilidades.js` — selección y ordenamiento de habilidades para los gráficos (puro).
- `src/lib/tendencia.js` — serie de 2 puntos por habilidad (puro).
- `src/lib/respaldo.js` — resolución local de una pregunta contra el catálogo (puro).
- `src/lib/tema.js` — lectura, escritura y aplicación del tema.
- `src/mascota/Lumi.jsx` — los 4 rigs inline + el logo.
- `src/mascota/lumi.css` — keyframes por pose.
- `src/viz/Puntos.jsx`, `src/viz/Franja.jsx`, `src/viz/Tendencia.jsx` — un gráfico por archivo.
- `src/data/taxonomia.js` — mapeos carrera→áreas e interés→áreas.
- `src/pages/landing/*.jsx` — una sección por archivo.
- `scripts/check-tema.mjs`, `scripts/check-datos.mjs`, `scripts/check-graficos.mjs`, `scripts/check-respaldo.mjs`.

**Se modifican:** `src/theme/global.css`, `src/theme/componentes.css`, `index.html`, `src/data/roles.source.js`, `scripts/build-catalogo.mjs`, `src/store.js`, `scripts/check-store.mjs`, `src/lib/consultar.js`, `src/viz/graficos.jsx`, `src/pages/{Landing,Registro,Login,Chat,Planes,Checkout,Confirmacion,Cuenta}.jsx`, `src/layouts/{PublicLayout,AppShell}.jsx`, `src/App.jsx`, `package.json`.

**Se eliminan:** `src/pages/Onboarding.jsx` (se funde en Registro).

---

## FASE 1 — Tema

### Task 1: Tokens claros y tipografía

**Files:**
- Create: `src/theme/tokens.css`, `scripts/check-tema.mjs`
- Modify: `src/theme/global.css`, `index.html`, `package.json`

**Interfaces:**
- Produces: los nombres de token que el resto del plan usa. Semánticos, no literales: `--bg-page`, `--bg-surface`, `--bg-elevated`, `--text-primary`, `--text-secondary`, `--accent`, `--accent-fg`, `--accent-apagado`, `--accent-apagado-fg`, `--sobre-accent`, `--sobre-accent-tenue`, `--resalte`, `--resalte-fg`, `--linea`, `--borde-campo`, `--dato-1` … `--dato-4`, `--alerta`, `--alerta-bg`, `--alerta-fg`, `--estrella`, `--lumi-linea`, `--radio-{sm,md,lg,xl,2xl,3xl,full}`, `--tipo-{xs,sm,base,lg,xl,2xl,3xl,4xl,5xl}`.

`--dato-1` … `--dato-4` son la rampa del gráfico de tendencia y deben ser mutuamente distinguibles: hoy tres de las cuatro series comparten el mismo lavanda (Task 8). `--lumi-linea` es el contorno de la mascota (Task 9).

- [ ] **Step 1: Escribir la prueba de contraste que falla**

`scripts/check-tema.mjs` — lee `src/theme/tokens.css`, extrae los valores de `:root`, y calcula contraste WCAG:

```js
import assert from 'node:assert/strict';
// contraste(a, b) -> ratio; implementación estándar de luminancia relativa
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
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-tema.mjs`
Expected: FAIL — `src/theme/tokens.css` no existe.

- [ ] **Step 3: Escribir `src/theme/tokens.css` con el bloque `:root` claro**

Valores de la spec §9.1. Los tres que hoy fallan contraste se oscurecen hasta pasar el umbral conservando el tono: `--borde-campo`, `--dato-2`, `--estrella`. `--dato-1` es el índigo de acción, `--dato-2` y `--dato-3` la rampa de datos. `#9A96C4` no se porta: era un accidente de una sola aparición.

- [ ] **Step 4: Importar tokens desde `global.css` y cambiar las fuentes en `index.html`**

`global.css` importa `tokens.css` y conserva reset, scrollbar y utilidades. `--font-display: 'Bricolage Grotesque'`, `--font-body: 'Onest'`. El `<link>` de Google Fonts pide solo esas dos familias, subconjunto latino.

- [ ] **Step 5: Añadir `check:tema` a los scripts y encadenarlo en `verify`**

- [ ] **Step 6: Ejecutar y verificar que pasa**

Run: `node scripts/check-tema.mjs && npm run lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/theme/tokens.css src/theme/global.css index.html scripts/check-tema.mjs package.json
git commit -m "feat(tema): tokens claros v2, Bricolage + Onest, contraste AA"
```

---

### Task 2: Modo oscuro e interruptor

**Files:**
- Create: `src/lib/tema.js`
- Modify: `src/theme/tokens.css`, `index.html`, `src/layouts/PublicLayout.jsx`, `src/layouts/AppShell.jsx`, `scripts/check-tema.mjs`

**Interfaces:**
- Consumes: los nombres de token de Task 1.
- Produces: `leerTema(): 'claro' | 'oscuro'`, `aplicarTema(t: 'claro'|'oscuro'): void`, `alternarTema(): 'claro'|'oscuro'`. El atributo es `data-theme="dark"` en `<html>`; la clave de `localStorage` es `lmi-tema`.

- [ ] **Step 1: Ampliar `check-tema.mjs` con las pruebas que fallan**

```js
assert.ok(bloqueOscuro, 'tokens.css debe declarar [data-theme="dark"]');
assert.deepEqual(tokensDe(':root').sort(), tokensDe('[data-theme="dark"]').sort(),
  'cada token claro necesita su contraparte oscura');
assert.ok(contraste(o('--text-secondary'), o('--bg-surface')) >= 4.5,
  'texto secundario sobre tarjeta oscura debe pasar AA');
assert.ok(contraste(o('--accent-fg'), o('--accent')) >= 4.5,
  'en oscuro el acento es lima y su texto debe pasar AA');
assert.ok(contraste(o('--linea'), o('--bg-surface')) >= 1.2,
  'la linea divisoria debe distinguirse del fondo oscuro');
// Review Focus #4: sin esto hay un destello de tema claro al recargar
assert.match(leer('index.html'), /localStorage[\s\S]*lmi-tema[\s\S]*data-theme/,
  'index.html necesita el script sincrono anti-destello antes de la hoja de estilos');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-tema.mjs`
Expected: FAIL — no existe `[data-theme="dark"]`.

- [ ] **Step 3: Añadir el bloque `[data-theme="dark"]` a `tokens.css`**

Valores de la spec §9.2 para los 8 documentados; el resto se deriva manteniendo el mismo papel semántico. En oscuro `--accent` es lima `#C6F24E` con `--accent-fg` noche, y `--dato-1` es `#8A80FF`.

- [ ] **Step 4: Implementar `src/lib/tema.js`**

`leerTema()` devuelve lo guardado en `localStorage`, y si no hay nada, `matchMedia('(prefers-color-scheme: dark)')`.

- [ ] **Step 5: Añadir el script anti-destello en `index.html`**

Un `<script>` síncrono en `<head>`, antes de la hoja de estilos, que lee `localStorage.lmi-tema` y pone `data-theme` en `<html>`. Cubre el Review Focus #4: sin esto hay un destello de tema claro al recargar.

- [ ] **Step 6: Añadir el interruptor a los dos layouts**

Botón con `aria-pressed` y texto accesible en `.visualmente-oculto`, en la navegación de `PublicLayout` y en la barra lateral de `AppShell`.

- [ ] **Step 7: Ejecutar y verificar que pasa**

Run: `node scripts/check-tema.mjs && npm run lint`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/theme/tokens.css src/lib/tema.js index.html src/layouts scripts/check-tema.mjs
git commit -m "feat(tema): modo oscuro con interruptor y persistencia"
```

---

### Task 3: Capa de componentes

**Files:**
- Modify: `src/theme/componentes.css`, `scripts/check-tema.mjs`

- [ ] **Step 1: Añadir la prueba de pureza de tokens**

```js
const crudos = coloresLiteralesEn('src/theme/componentes.css');
assert.deepEqual(crudos, [], `componentes.css no debe llevar colores literales: ${crudos}`);
const radios = radiosEn('src/theme/componentes.css');
assert.deepEqual(radios.filter(r => !ESCALA_RADIOS.includes(r)), [],
  'todos los radios deben salir de la escala declarada');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-tema.mjs`
Expected: FAIL — hoy hay 16 literales (`#fff`, `#ddd`, `#555`, `#2a2823`, `#111`).

- [ ] **Step 3: Reskinear las 90 clases contra los tokens**

`.btn` y variantes (`--acento` índigo con sombra, `--linea` borde noche, `--claro`, `--grande`, `--bloque`), más la variante lima que el prototipo usa en "Activar Pro" y el circular de 46 px del compositor. `.tarjeta`, `.campo` (borde `--borde-campo`, foco `--accent`), `.chip`, `.composer`, `.nota`, `.modal`, `.app-shell`. Sombra solo en el CTA primario.

- [ ] **Step 4: Dar al compositor un foco visible**

Hoy lleva `outline:none` con `border:0`, así que el estilo global de foco no se ve. Cubre teclado.

- [ ] **Step 5: Ejecutar y verificar que pasa**

Run: `node scripts/check-tema.mjs && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/theme/componentes.css scripts/check-tema.mjs
git commit -m "feat(tema): capa de componentes sobre tokens v2"
```

---

## FASE 2 — Datos

### Task 4: `tip` por rol y `ciclo` de usuario

**Files:**
- Create: `scripts/check-datos.mjs`
- Modify: `src/data/roles.source.js`, `scripts/build-catalogo.mjs`, `src/store.js`, `scripts/check-store.mjs`, `package.json`

**Interfaces:**
- Produces: cada rol de `catalogo.json` gana `tip: string`. El store gana `ciclo: 0|1|2|3` dentro de `usuario`, con `CICLOS = ['1ro – 2do','3ro – 4to','5to – 6to','7mo o más']` exportado desde `src/store.js`.

- [ ] **Step 1: Escribir la prueba que falla**

```js
assert.equal(catalogo.roles.filter(r => !r.tip).length, 0,
  'todos los roles necesitan tip para la burbuja de Lumi');
assert.ok(catalogo.roles.every(r => r.tip.length >= 10 && !/\.$/.test(r.tip)),
  'el tip es una frase breve sin punto final: se incrusta en otra oracion');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-datos.mjs`
Expected: FAIL — ningún rol tiene `tip`.

- [ ] **Step 3: Añadir `tip` a los 35 roles de `roles.source.js`**

Forma: sintagma nominal que encaja en "priorizaría ___ antes de postular a prácticas". Se deriva de las dos habilidades de mayor `tendencia` del propio rol, por ejemplo `'un curso corto de Power BI y DAX'`. Propagarlo en el mapeo de `scripts/build-catalogo.mjs:35` (`id, nombre: r.n, area: r.a, nivel: r.niv` → añadir `tip: r.tip`) y añadir ahí la invariante de presencia.

- [ ] **Step 4: Añadir `ciclo` al store y al registro**

`registrar()` acepta `ciclo`; se persiste con el resto del perfil. Añadir a `check-store.mjs`:

```js
assert.equal(s().registrar({ ...datos, ciclo: 2 }).ok, true);
assert.equal(s().usuario.ciclo, 2, 'el ciclo se guarda en el perfil');
```

- [ ] **Step 5: Ejecutar y verificar que pasa**

Run: `npm run catalogo && node scripts/check-datos.mjs && node scripts/check-store.mjs`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/data/roles.source.js src/data/catalogo.json scripts/ src/store.js package.json
git commit -m "feat(datos): tip por rol y ciclo de usuario"
```

---

### Task 5: Taxonomía carrera e intereses

**Files:**
- Create: `src/data/taxonomia.js`
- Modify: `scripts/check-datos.mjs`

**Interfaces:**
- Produces: `CARRERAS: string[]` (las 10 del prototipo), `INTERESES: string[]` (los 10), `CIUDADES_REGISTRO: string[]` (Lima, Arequipa, Trujillo, Otra), `areasDe(carrera: string): string[]`, `areasDeIntereses(intereses: string[]): string[]`, `ciudadDeRegistro(etiqueta: string): string` — "Otra" devuelve `'Todo Perú'`.

- [ ] **Step 1: Escribir la prueba que falla**

```js
assert.equal(CARRERAS.length, 10);
for (const c of CARRERAS) {
  const a = areasDe(c);
  assert.ok(a.length > 0, `la carrera ${c} debe mapear a al menos un area`);
  assert.ok(a.every(x => catalogo.areas.includes(x)), `${c} mapea a un area inexistente`);
}
for (const i of INTERESES) {
  assert.ok(areasDeIntereses([i]).length > 0, `el interes ${i} debe mapear a un area`);
}
assert.equal(ciudadDeRegistro('Otra'), 'Todo Perú');
assert.ok(CIUDADES_REGISTRO.slice(0,3).every(c => catalogo.ciudades.includes(c)));
```

`catalogo.ciudades` son Lima, Arequipa, Trujillo, Cusco y Remoto. `catalogo.areas` son 8. No existe `catalogo.ambitos`.

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-datos.mjs`
Expected: FAIL — `src/data/taxonomia.js` no existe.

- [ ] **Step 3: Implementar `src/data/taxonomia.js`**

Las etiquetas visibles son exactamente las que el cliente aprobó; el mapeo es interno. Una carrera puede abrir varias áreas (Ing. de Sistemas → Datos y Analítica + Tecnología).

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `node scripts/check-datos.mjs && npm run lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/taxonomia.js scripts/check-datos.mjs
git commit -m "feat(datos): taxonomia carrera e intereses hacia areas del catalogo"
```

---

## FASE 3 — Gráficos

### Task 6: Selección de habilidades

**Files:**
- Create: `src/lib/habilidades.js`, `scripts/check-graficos.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `filasDe(rol): Fila[]` donde `Fila = { k: string, pct: number, tendencia: number, destacada: boolean, deCada10: number }`. Devuelve las 4 de mayor `pct`, más la de mayor `tendencia` si quedó fuera (máximo 5). `destacada` marca la de mayor `tendencia`. También `rotulo(fila): string` (Task 7) y `etiquetaDelta(n: number): string` (Task 8) viven en este archivo.
- Nota de forma: en `catalogo.json` un rol es `{ id, nombre, area, nivel, sinonimos, ofertas, habilidades, salario, porCiudad, cursos }` y una habilidad es `{ k, pct, tendencia }`. Los nombres cortos (`n`, `a`, `sin`, `hab`) son solo de `roles.source.js`; `scripts/build-catalogo.mjs:35` los renombra.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
for (const rol of catalogo.roles) {
  const f = filasDe(rol);
  assert.ok(f.length >= 4 && f.length <= 5, `${rol.id}: entre 4 y 5 filas`);
  const crecio = [...rol.habilidades].sort((a,b) => b.tendencia - a.tendencia)[0];
  assert.ok(f.some(x => x.k === crecio.k),
    `${rol.id}: la habilidad que mas crecio debe estar presente`);
  assert.equal(f.filter(x => x.destacada).length, 1, `${rol.id}: exactamente una destacada`);
  assert.deepEqual(f.map(x => x.pct), [...f.map(x => x.pct)].sort((a,b) => b-a),
    `${rol.id}: las filas van ordenadas por porcentaje`);
}
// Review Focus #1: empate de pct no pierde filas ni es aleatorio
const empate = { habilidades: [
  { k: 'A', pct: 70, tendencia: 1 }, { k: 'B', pct: 70, tendencia: 2 },
  { k: 'C', pct: 50, tendencia: 3 }, { k: 'D', pct: 40, tendencia: 0 },
  { k: 'E', pct: 40, tendencia: 0 }] };
assert.deepEqual(filasDe(empate).map(x => x.k), filasDe(empate).map(x => x.k),
  'el desempate debe ser determinista');
assert.equal(new Set(filasDe(empate).map(x => x.k)).size, filasDe(empate).length,
  'ninguna fila se duplica ni se pierde en un empate');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-graficos.mjs`
Expected: FAIL — `src/lib/habilidades.js` no existe.

- [ ] **Step 3: Implementar `filasDe`**

Desempate por `tendencia` descendente y luego por nombre, para que sea estable. `deCada10` es `Math.round(pct/10)` y se usa solo para dibujar celdas, nunca para afirmar el orden.

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `node scripts/check-graficos.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/habilidades.js scripts/check-graficos.mjs package.json
git commit -m "feat(viz): seleccion de habilidades con la que mas crecio siempre visible"
```

---

### Task 7: Cuadrícula de puntos y franja salarial

**Files:**
- Create: `src/viz/Puntos.jsx`, `src/viz/Franja.jsx`
- Modify: `src/lib/habilidades.js` (añade `rotulo`), `src/viz/graficos.jsx`, `scripts/check-graficos.mjs`

**Interfaces:**
- Consumes: `filasDe` de Task 6.
- Produces: `<Puntos filas={Fila[]} />` y `<Franja p25 med p75 moneda />`.

- [ ] **Step 1: Escribir la prueba que falla**

La contradicción de §9.4.1 se resuelve en el rótulo, no en las celdas:

```js
for (const rol of catalogo.roles) {
  const f = filasDe(rol);
  for (let i = 1; i < f.length; i++) {
    if (f[i-1].pct !== f[i].pct) {
      assert.notEqual(rotulo(f[i-1]), rotulo(f[i]),
        `${rol.id}: dos porcentajes distintos no pueden mostrar el mismo rotulo`);
    }
  }
}
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-graficos.mjs`
Expected: FAIL — hoy 34 pares distintos colapsan al mismo "N de 10".

- [ ] **Step 3: Implementar `rotulo(fila)` en `src/lib/habilidades.js` y `Puntos.jsx`**

El rótulo lleva el porcentaje exacto; "de cada 10" queda como subtítulo del gráfico, no como cifra por fila. Las celdas llenas usan `--dato-1` en la destacada y `--dato-2` en el resto; las vacías `--linea`. La pastilla de delta usa `--resalte` en positivo y `--alerta-bg`/`--alerta-fg` en negativo — hoy el prototipo pinta los negativos en lavanda y pierde la codificación.

- [ ] **Step 4: Implementar `Franja.jsx`**

Tres tarjetas P25 / Mediana / P75 más la franja. **Los extremos del eje no se rotulan con cifras**: eran `P25×0.7` y `P75×1.25`, relleno presentado como mínimo y máximo del mercado.

- [ ] **Step 5: Ejecutar y verificar que pasa**

Run: `node scripts/check-graficos.mjs && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/viz scripts/check-graficos.mjs
git commit -m "feat(viz): cuadricula de puntos y franja salarial"
```

---

### Task 8: Gráfico de tendencia

**Files:**
- Create: `src/lib/tendencia.js`, `src/viz/Tendencia.jsx`
- Modify: `scripts/check-graficos.mjs`

**Interfaces:**
- Consumes: `filasDe` de Task 6.
- Produces: `serieDe(filas): Serie[]` donde `Serie = { k, desde: number, hasta: number, delta: number, destacada: boolean, color: string }`. Dos puntos, no cuatro: `desde = pct − tendencia`, `hasta = pct`. Y `etiquetaDelta(n: number): string` en `src/lib/habilidades.js`: `'+9 pts'`, `'−4 pts'`, `'sin cambio'`. Los colores salen de `--dato-1` … `--dato-4` (Task 1).

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
for (const rol of catalogo.roles) {
  const s = serieDe(filasDe(rol));
  assert.ok(s.every(x => x.desde >= 0 && x.hasta <= 100), `${rol.id}: puntos dentro de 0-100`);
  assert.equal(new Set(s.map(x => x.color)).size, s.length,
    `${rol.id}: cada serie necesita color propio o la leyenda no sirve`);
}
// Review Focus #2: tendencia negativa o cero
const baja = [{ k: 'Concar', pct: 54, tendencia: -3, destacada: false }];
assert.ok(serieDe(baja)[0].desde > serieDe(baja)[0].hasta, 'una tendencia negativa baja');
const plana = [{ k: 'Excel', pct: 58, tendencia: 0, destacada: false }];
assert.equal(serieDe(plana)[0].delta, 0);
assert.equal(etiquetaDelta(0), 'sin cambio', 'cero no se muestra como "+0 pts"');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-graficos.mjs`
Expected: FAIL — `src/lib/tendencia.js` no existe.

- [ ] **Step 3: Implementar `serieDe` y `etiquetaDelta`**

Los colores salen de `--dato-1` para la destacada y de una rampa de 4 valores distinguibles para el resto: hoy tres de cuatro series comparten el mismo lavanda y la leyenda es inútil.

- [ ] **Step 4: Implementar `Tendencia.jsx`**

Cada línea lleva su etiqueta en el extremo derecho, no solo en la leyenda. Subtítulo: "del trimestre anterior al actual". Un segundo subtítulo aclara que el resaltado marca lo que más creció, no lo que más piden — resuelve la ambigüedad de §9.4.2. Marcas del eje en múltiplos de 10.

- [ ] **Step 5: Ejecutar y verificar que pasa**

Run: `node scripts/check-graficos.mjs && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/tendencia.js src/viz/Tendencia.jsx scripts/check-graficos.mjs
git commit -m "feat(viz): tendencia de dos puntos con leyenda distinguible"
```

---

## FASE 4 — Lumi

### Task 9: Los rigs en línea

**Files:**
- Create: `src/mascota/Lumi.jsx`
- Modify: `scripts/check-datos.mjs`

**Interfaces:**
- Produces: `<Lumi pose="saluda"|"piensa"|"celebra"|"alerta" alto={number} />` y `<LumiLogo alto />`. El logo no se anima.

- [ ] **Step 1: Escribir la prueba que falla**

```js
const src = leer('src/mascota/Lumi.jsx');
for (const [pose, clases] of Object.entries({
  saluda:  ['shadow','float','bulb','arm','bar','b2','b3','eyes'],
  piensa:  ['shadow','float','head','bulb','eyes','lids','hand'],
  celebra: ['shadow','cf','c2','c3','c4','jump','la','ra','bulb'],
  alerta:  ['shake','bulb','eyes','drop'],
})) {
  for (const c of clases) {
    assert.ok(bloqueDe(src, pose).includes(`"${c}`), `${pose} perdio la clase ${c} del rig`);
  }
}
assert.equal(colorLiteralEn(src, '#17153A'), 0,
  'el contorno debe salir de un token o desaparece sobre tarjeta noche');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-datos.mjs`
Expected: FAIL — `src/mascota/Lumi.jsx` no existe.

- [ ] **Step 3: Portar los 5 SVG a JSX conservando cada clase del rig**

Los originales están en el bundle del prototipo; ya extraídos en `scratchpad/proto/assets/`. El contorno `#17153A` pasa a `var(--lumi-linea)`, que en claro es noche y en oscuro `--text-primary`: resuelve el logo que hoy desaparece en el footer. Se retira el `<metadata>` C2PA. Se retocan dos `<path>` de `piensa` (cejas y boca) para que lea concentración y no tristeza.

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `node scripts/check-datos.mjs && npm run lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/mascota/Lumi.jsx scripts/check-datos.mjs
git commit -m "feat(lumi): rigs en linea con contorno por token"
```

---

### Task 10: Animaciones

**Files:**
- Create: `src/mascota/lumi.css`
- Modify: `src/mascota/Lumi.jsx`, `scripts/check-datos.mjs`

- [ ] **Step 1: Escribir la prueba que falla**

```js
const css = leer('src/mascota/lumi.css');
for (const k of ['flota','ladea','golpea','parpadea','mira','brilla','saluda-brazo',
                 'barras','salta','confeti','tiembla','gotea'])
  assert.ok(css.includes(`@keyframes ${k}`), `falta el keyframe ${k}`);
// Review Focus #5
const bloque = css.slice(css.indexOf('prefers-reduced-motion'));
for (const c of ['float','head','hand','eyes','lids','bulb','arm','bar','jump','la','ra','cf','shake','drop'])
  assert.ok(bloque.includes(`.${c}`), `${c} debe detenerse con reducir movimiento`);
assert.ok(!css.includes('.logo'), 'el logo no se anima');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-datos.mjs`
Expected: FAIL — `lumi.css` no existe.

- [ ] **Step 3: Escribir los keyframes por pose**

Cada pose hace lo que su ilustración representa, según el catálogo:
- **saluda** — flota, la antena brilla, parpadea, agita la lupa, las tres barras suben y bajan desfasadas.
- **piensa** — flota, inclina la cabeza, mira a los lados, parpadea, golpea el mentón con la mano.
- **celebra** — salta, los dos brazos suben, el confeti cae con retardos distintos por pieza.
- **alerta** — tiembla, la antena parpadea en coral, la gota cae y vuelve.

Cada grupo lleva su `transform-origin`: `.head` en el cuello (≈ `100px 140px`), `.hand` en el hombro (≈ `138px 160px`), `.lids` en el centro de los ojos (≈ `102px 84px`). **Se calibran mirando el resultado, no por cálculo.** La sombra escala al inverso de la flotación.

- [ ] **Step 4: Verificar las cuatro poses en el navegador**

Levantar `npm run dev` y comprobar que cada pose se mueve como la describe el catálogo, en claro y en oscuro, y que con "reducir movimiento" activo ninguna corre.

- [ ] **Step 5: Ejecutar y verificar que pasa**

Run: `node scripts/check-datos.mjs && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/mascota/
git commit -m "feat(lumi): animaciones por pose con reducir movimiento"
```

---

## FASE 5 — Pantallas

### Task 11: Pantalla de resultado

**Files:**
- Create: `src/lib/prosa.js`
- Modify: `src/pages/Chat.jsx`, `src/components/metodologia.jsx`, `scripts/check-graficos.mjs`

**Interfaces:**
- Consumes: Tasks 6, 7, 8, 9, 10; `tip` y `ciclo` de Task 4.
- Produces: `titular(rol, tema, filas): string`, `explicacion(rol, tema, filas, ambito): string`, `consejo(rol, ciclo, tema): string`.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
for (const rol of catalogo.roles) for (const tema of ['habilidades','salarios','tendencia']) {
  const t = titular(rol, tema, filasDe(rol));
  assert.ok(!/\+0 pts|\+-/.test(t), `${rol.id}/${tema}: titular mal formado`);
  // Review Focus #2 en la prosa
  const crecio = [...rol.habilidades].sort((a,b)=>b.tendencia-a.tendencia)[0];
  if (crecio.tendencia <= 0) assert.ok(!/creci|sube/.test(t),
    `${rol.id}: no se puede decir que crecio si ninguna crecio`);
}
assert.notEqual(consejo(rol, 2, 'habilidades'), consejo(rol, 2, 'salarios'),
  'el consejo varia por tema: hoy la burbuja repite texto identico en cada turno');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-graficos.mjs`
Expected: FAIL — `src/lib/prosa.js` no existe.

- [ ] **Step 3: Implementar `src/lib/prosa.js`**

`consejo` usa `tip` del rol y `CICLOS[ciclo]`. Nada de esto pasa por el modelo.

- [ ] **Step 4: Montar la pantalla de resultado**

Dos columnas: respuesta + burbuja de Lumi a la izquierda, ficha con titular, gráfico y Fuente a la derecha. El enlace de Fuente abre el modal y dice **"Ver metodología"**. El modal conserva el aviso de datos sintéticos. `insight` de Gemini se muestra donde ya se mostraba.

- [ ] **Step 5: Ejecutar y verificar que pasa**

Run: `node scripts/check-graficos.mjs && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/prosa.js src/pages/Chat.jsx src/components/metodologia.jsx scripts/check-graficos.mjs
git commit -m "feat(resultado): prosa local, graficos nuevos y fuente honesta"
```

---

### Task 12: Registro de 4 pasos

**Files:**
- Modify: `src/pages/Registro.jsx`, `src/App.jsx`, `src/lib/consultar.js`, `scripts/check-store.mjs`
- Delete: `src/pages/Onboarding.jsx`

**Interfaces:**
- Consumes: `taxonomia.js` (Task 5), `ciclo` (Task 4), `<Lumi pose="saluda" />` (Tasks 9-10).

- [ ] **Step 1: Escribir la prueba que falla**

```js
s().registrar({ ...datos, carrera: 'Marketing', intereses: ['Datos y analítica'], ciclo: 2 });
const sug = sugerenciasPara(s().usuario);
assert.ok(sug.length > 0, 'el perfil debe producir sugerencias');
assert.ok(sug.some(x => /marketing|datos/i.test(x.q)),
  'la carrera elegida en el registro debe influir en las sugerencias');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-store.mjs`
Expected: FAIL — el perfil no lleva carrera mapeada a áreas.

- [ ] **Step 3: Fundir Registro y Onboarding en el asistente de 4 pasos**

Paso 1 cuenta, 2 estudios, 3 intereses, 4 cómo nos conociste. Panel índigo a la izquierda con los pasos marcados y la burbuja de Lumi, cuyo texto cambia por paso. El botón de continuar **nunca va blanco sobre lavanda**: deshabilitado se dibuja con `--accent` atenuado y texto que pasa AA, apoyado en la pista que ya existe debajo. `<label htmlFor>` e `id` en cada campo; `type="email"` y `autocomplete` en los correos. Retirar la ruta `/onboarding` de `App.jsx`.

- [ ] **Step 4: Conectar el perfil a `sugerenciasPara()`**

`registrar()` guarda `areas` derivadas con `areasDe(carrera)` más `areasDeIntereses(intereses)`, y `ciudades` con `ciudadDeRegistro`.

- [ ] **Step 5: Ejecutar y verificar que pasa**

Run: `node scripts/check-store.mjs && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/Registro.jsx src/App.jsx src/lib/consultar.js scripts/check-store.mjs
git rm src/pages/Onboarding.jsx
git commit -m "feat(registro): asistente de 4 pasos con perfil que si se usa"
```

---

### Task 13: Landing

**Files:**
- Create: `src/pages/landing/{Hero,ConoceLumi,Funciones,Casos,Resenas,Planes,Comparativa,Pie}.jsx`
- Modify: `src/pages/Landing.jsx`, `src/layouts/PublicLayout.jsx`, `scripts/check-datos.mjs`

**Interfaces:**
- Consumes: `cobertura()` y `ventanaAnalisis()` de `src/data/contenido.js`; `<Lumi pose="saluda" />`.

- [ ] **Step 1: Escribir la prueba que falla**

```js
const landing = leerTodo('src/pages/landing/');
for (const prohibido of ['Verificada', '312 reseñas', 'Placeholder',
                         'Foto del estudiante', 'Nombre Apellido', 'S/ 150'])
  assert.ok(!landing.includes(prohibido), `la landing no debe publicar "${prohibido}"`);
for (const cifra of ['48,200', '48200', '60 roles', '8 regiones'])
  assert.ok(!landing.includes(cifra), `"${cifra}" debe salir de cobertura(), no escrita a mano`);
assert.ok(!/<a(?![^>]*href)/.test(landing), 'ningun enlace sin href: no recibe foco');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-datos.mjs`
Expected: FAIL — las secciones no existen.

- [ ] **Step 3: Construir las ocho secciones**

Hero con tarjeta de insight que **sí lleva enlace de Fuente**. "Conoce a Lumi" en índigo con las tres tarjetas de borde grueso. Funciones en cuatro tarjetas bicolor. Casos y Reseñas con nombres inventados creíbles, avatares de iniciales, **sin sellos de verificación ni cifras de resultado medidas**. Comparativa sin el precio de LinkedIn. Pie noche con la tira de metodología alimentada por `cobertura()`. La sección "Universidades" se cae. El menú no lleva la etiqueta vacía que el prototipo tiene en `navs`.

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `node scripts/check-datos.mjs && npm run lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/landing src/pages/Landing.jsx src/layouts/PublicLayout.jsx scripts/check-datos.mjs
git commit -m "feat(landing): secciones v2 con cifras reales y sin sellos falsos"
```

---

## FASE 6 — Robustez y cierre

### Task 14: Respaldo local de la consulta

**Files:**
- Create: `src/lib/respaldo.js`, `scripts/check-respaldo.mjs`
- Modify: `src/lib/consultar.js`, `package.json`

**Interfaces:**
- Produces: `resolverLocal(pregunta: string): { intent, roleIds, ciudad, insight: '', sinDatos, fueraDeAlcance, local: true }`. Misma forma que devuelve `/api/chat`.

- [ ] **Step 1: Escribir las pruebas que fallan**

```js
assert.deepEqual(resolverLocal('¿Cuánto gana un analista de datos en Arequipa?').roleIds,
  ['analista-datos-jr'], 'resuelve por nombre y por sinonimo');
assert.equal(resolverLocal('¿Cuánto gana un analista de datos en Arequipa?').intent, 'salarios');
assert.equal(resolverLocal('¿cuál es la capital de Francia?').fueraDeAlcance, true);
// Review Focus #3: la regla de muestra minima tambien sin API
const r = resolverLocal('¿cuánto paga un analista de calidad en Cusco?');
if (muestraDe(r) < catalogo.minMuestra)
  assert.equal(r.sinDatos, true, 'bajo el minimo no se afirma cifra ni se cobra');
// el bug del prototipo no se reproduce
assert.notEqual(resolverLocal('¿qué piden para analista de marketing digital?').roleIds[0],
  'analista-riesgos', 'la coincidencia mas larga gana, no la ultima');
```

- [ ] **Step 2: Ejecutar para verificar que falla**

Run: `node scripts/check-respaldo.mjs`
Expected: FAIL — `src/lib/respaldo.js` no existe.

- [ ] **Step 3: Implementar `resolverLocal`**

Normaliza acentos y mayúsculas, construye el índice desde `catalogo.json` con `nombre` y `sinonimos[]`, y **gana la coincidencia más larga**, no la última. `intent` por palabras clave. Sin coincidencia, `fueraDeAlcance`. Las ciudades salen de `catalogo.ciudades`.

- [ ] **Step 4: Enganchar el respaldo en `consultar()`**

Si `fetch` falla, si `res.ok` es falso, o si el cuerpo no se puede leer, se cae a `resolverLocal` en vez de lanzar `ErrorConsulta`. `ErrorConsulta` se conserva para lo que el respaldo tampoco resuelve. El resultado lleva `local: true` para que la interfaz pueda omitir el `insight` del modelo sin inventar prosa.

- [ ] **Step 5: Ejecutar y verificar que pasa**

Run: `node scripts/check-respaldo.mjs && npm run lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/respaldo.js src/lib/consultar.js scripts/check-respaldo.mjs package.json
git commit -m "feat(consulta): respaldo local cuando la API falla"
```

---

### Task 15: Cierre

**Files:**
- Modify: `src/App.jsx`, `src/pages/{Cuenta,Login,Planes,Checkout,Confirmacion}.jsx`, `src/layouts/AppShell.jsx`, `package.json`

- [ ] **Step 1: Reskinear las pantallas restantes**

Login (botón que nunca va blanco sobre lavanda, `type="email"`, `autocomplete`), Cuenta (el "Cerrar sesión" de `Cuenta.jsx:114` ya existe: solo reskin), Planes, Checkout, Confirmación con `<Lumi pose="celebra" />`. En Planes, el plan actual sale del store, no fijo en la tarjeta Gratis, y el muro no reaparece a un usuario Pro.

- [ ] **Step 2: Ocultar las vistas de docente**

Se quitan los enlaces de la interfaz del estudiante; las rutas siguen existiendo para no romper enlaces compartidos.

- [ ] **Step 3: Dejar `check:chat` opcional y encadenar lo demás en `verify`**

`check-chat.mjs` necesita servidor vivo y `GEMINI_API_KEY`. `npm run verify` encadena `catalogo`, `check-tema`, `check-datos`, `check-graficos`, `check-respaldo` y `check-store`, todos sin red.

- [ ] **Step 4: Recorrer el flujo completo en el navegador**

Las 8 pantallas, en claro y en oscuro, sin callejones sin salida: landing → login → registro → consulta → resultado → planes → pago → confirmación → cerrar sesión → repetir.

- [ ] **Step 5: Ejecutar la verificación completa**

Run: `npm run verify && npm run lint && npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: cierre de la migracion v2"
```

---

## Qué queda fuera, a la vista

Tres decisiones del plan se apartan de lo que el cliente aprobó y conviene mostrárselas:

1. Las reseñas pierden el sello "✓ Verificada" y los casos sus cifras de resultado medidas (Task 13).
2. La tira de metodología baja a las cifras reales del catálogo: 24.231 ofertas, 35 roles, 5 ámbitos (Task 13).
3. El gráfico de tendencia pasa de cuatro puntos trimestrales a dos (Task 8).
