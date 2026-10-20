# Migración del prototipo LMI-U v2 a la app desplegada

**Fecha:** 2026-10-20
**Estado:** diseño aprobado, pendiente de plan de implementación

---

## 1. Intención y por qué

El equipo tiene dos prototipos divergentes:

| | `lmi-prototype/` (este repo) | `LMI-U Prototipo.html` |
|---|---|---|
| Tema | `#12110f` oscuro cálido, Newsreader serif, acento `#D9A15A` | Índigo `#4B3BFF`, Bricolage Grotesque + Onest, fondo claro |
| Estado | Desplegado en Vercel, backend Gemini real, 60 roles | Artefacto de un solo archivo, sin backend, 12 roles fijos |
| Aprobación del cliente | rechazado en test con usuarios | **aprobado** |

Los hexes del tema actual coinciden exactamente con la columna "ANTES" del
documento `LMI-U Sistema de Diseno.dc.html`. El diseño que el cliente aprobó
vive en un artefacto desechable; el código que se puede desplegar sigue
llevando el diseño que los usuarios rechazaron ("se parece a Claude", "lo
relacioné con una IA para encontrar trabajo").

Este trabajo cierra esa brecha: **la app desplegada pasa a verse y comportarse
como el prototipo v2 aprobado.**

### Para qué se usa el resultado

El entregable es un link de Vercel que el equipo comparte con estudiantes de
últimos ciclos y egresados. **Lo recorren solos, sin nadie al lado**, y de ahí
sale el feedback. El éxito no es "funciona": es que el estudiante entienda qué
está viendo y llegue al final sin trabarse.

Dos consecuencias que mandan sobre el resto del documento:

1. **Tiene que sentirse una app de verdad.** El usuario fue explícito: la barra
   "FLUJO" que el prototipo pone arriba para saltar entre pantallas **no se
   migra**. Se navega por el flujo real.
2. **Nada puede verse como maqueta.** Las etiquetas "Placeholder", los
   "Nombre Apellido" y los recuadros "Foto del estudiante" salen.

---

## 2. Objetivos

- La app desplegada se ve como el prototipo v2 en las 8 pantallas del recorrido
  del estudiante: landing, login, registro, consulta, resultado, planes, pago,
  confirmación.
- Los tres gráficos del prototipo reemplazan a los actuales en la pantalla de
  resultado: cuadrícula de 10 puntos (habilidades), franja P25–P75 (sueldos),
  líneas por trimestre (tendencia).
- La mascota Lumi se anima en las cuatro poses donde aparece, haciendo lo que
  la ilustración representa.
- Modo oscuro completo, con interruptor visible.
- La consulta nunca muestra un error de infraestructura al estudiante.

## 3. No-objetivos

- **Rediseñar para celular.** Los clientes lo abren en computadora. Se conserva
  el comportamiento responsive que la app ya tiene; no se invierte en diseñar
  vistas de teléfono.
- **Rediseñar las vistas de docente** (`DocenteChat`, `DocentePanel`). El
  público que da feedback son estudiantes; esas pantallas no les dicen nada.
- **Cambiar el modelo de negocio, los precios o el catálogo de datos.**
- **Reemplazar el backend.** Gemini se queda como está.

## 4. Anti-objetivos

Cosas que harían fracasar esto aunque técnicamente funcione:

- Que un estudiante llegue a una pantalla y no pueda volver.
- Que un estudiante quede encerrado sin poder repetir el recorrido.
- Que la pantalla de resultado muestre "No pudimos procesar la consulta".
- Que el estudiante se dé cuenta de que está viendo una maqueta.
- Que al migrar se pierdan capacidades que la app ya tiene hoy (sinónimos de
  roles, periodo calculado, regla de muestra mínima, paywall que guarda la
  pregunta pendiente).

---

## 5. Punto de partida: qué hay hoy

Verificado leyendo el código, no asumido.

**Pila:** React 19 + Vite 8 + react-router-dom 7 + zustand 5. Backend: una
única función serverless `api/chat.js` con `@google/genai`. Despliegue en
Vercel con `vercel.json` reescribiendo todo menos `/api/` a `index.html`.

**El tema ya está centralizado.** Esto es lo que hace viable la migración:

| | Tokens | Colores crudos |
|---|---|---|
| `src/theme/componentes.css` (25 KB, 90 clases) | 183 usos de `var(--…)` | 16 |
| JSX (20 archivos) | 182 usos de `var(--…)` | 5 |

Cambiar `:root` en `src/theme/global.css` repinta la aplicación entera. Los
`style={{}}` en línea se usan para maquetación (gap, grid), no para color.

**Capa de componentes existente:** `.btn` (+ `--acento`, `--linea`, `--claro`,
`--grande`, `--bloque`), `.tarjeta`, `.chip`, `.campo`, `.eti`, `.display`,
`.lead`, `.nota`, `.composer`, `.modal`, `.app-shell`, `.visualmente-oculto`.

**Lo que la app ya hace mejor que el prototipo** y hay que conservar:

- 35 roles en `catalogo.json` (verificado), generado por
  `scripts/build-catalogo.mjs` desde `src/data/roles.source.js`, con tabla de
  sinónimos por rol (`sin: [...]`). 5 ámbitos: Lima, Arequipa, Trujillo, Cusco,
  Remoto. 24.231 ofertas en total. `cobertura()` en `src/data/contenido.js` ya
  deriva esas cifras del catálogo.
- Enrutado de la pregunta por el modelo en dos llamadas: la primera ve solo
  nombres y sinónimos **sin una sola cifra**, la segunda ve únicamente las
  cifras de los roles acertados. Los gráficos los dibuja el front desde el
  catálogo. Ninguna cifra en pantalla pasa por el modelo.
- `periodoActual()` / `sincronizarPeriodo()`: el periodo se calcula, no está
  escrito a mano.
- `MIN_MUESTRA` desde el catálogo, con la regla de no cobrar.
- Store con `plan`, `creditos`, `usadasMes`, `periodo`, `pagos`, y `pendiente`
  (la pregunta que se guarda al chocar con el paywall).
- `<html lang="es">`, `prefers-reduced-motion` respetado, clase
  `.visualmente-oculto`.
- Scripts de verificación: `npm run verify` encadena `build-catalogo`,
  `check-store` y `check-chat`.

**Lo que NO hay que portar del prototipo**, porque está roto ahí y resuelto
aquí:

- El parser de texto libre del prototipo recorta cada rol a dos palabras, cuatro
  roles colisionan en la clave `"analista de"` y gana el último del bucle: toda
  pregunta sobre un "Analista de …" responde con datos de Analista de Riesgos
  (Economía), cobrando el crédito. En la app esto lo resuelve el modelo con el
  índice de sinónimos.
- El periodo `"jul – oct 2026"` escrito a mano en el markup.
- El botón "Tu plan actual" fijo en la tarjeta Gratis, que nunca refleja el plan
  real.
- El muro de pago que reaparece a un usuario Pro.

---

## 6. Decisiones tomadas por el usuario

Estas son suyas, en sus palabras:

1. **La barra FLUJO no se migra.** "Si quiero que se simule que es una app."
2. **El flujo real se queda como está:** para llegar a planes y pago hay que
   registrarse y gastar las 3 consultas gratis. Se le planteó que un estudiante
   curioso quizá nunca llegue ahí y respondió "por ahora está bien ese flujo".
3. **Modo oscuro: sí**, con **interruptor visible** en la app (no solo por
   preferencia del sistema).
4. **Los gráficos del prototipo son los que van** en la pantalla de resultado.
5. **Respaldo local de la consulta: dentro del alcance.**
6. **Casos y reseñas:** nombres inventados creíbles, y las etiquetas de
   placeholder se eliminan.
7. **Cerrar sesión normal** en el menú de cuenta para poder repetir el
   recorrido (aprobado explícitamente).

---

## 7. Decisiones tomadas por el diseñador de este documento

Marcadas como propias. El usuario no las pidió; puede revertirlas.

1. **Objetivo escritorio.** No se rediseña para celular; no se rompe lo
   responsive que ya existe.
2. **Las vistas de docente se ocultan**, no se rediseñan ni se borran. Las
   rutas siguen existiendo para no romper enlaces; simplemente no hay forma de
   llegar a ellas desde la interfaz del estudiante.
3. **Interruptor de tema:** en la navegación de la landing y en la barra
   lateral de la app. Recuerda la elección; la primera visita arranca por la
   preferencia del sistema.
4. **Avatares con iniciales** sobre colores de marca para las reseñas y los
   casos, en vez de fotos de personas inventadas.
5. **Se conserva el aviso de datos sintéticos** que ya trae el modal de
   metodología ("las cifras son un conjunto sintético con distribuciones
   plausibles para Perú"). El link se reenvía; conviene que quede dicho en
   alguna parte sin romper la sensación de app.
6. **Tres correcciones a cómo leen los datos los gráficos**, sin tocar su
   aspecto (detalle en §9).
7. **El modo oscuro se deriva del claro.** No existe ninguna pantalla de
   referencia; ver §8.

---

## 8. Restricciones y riesgos conocidos

**El modo oscuro se aprueba a ciegas.** El sistema de diseño define 8 colores
oscuros (`#0F0E29` fondo, `#17153A` tarjeta, `#221F52` elevado, `#C6F24E` como
color de acción, `#8A80FF` para datos, `#F4F3FF` texto, `#B3AEE0` secundario,
`#FF8A6E` coral claro) pero **el prototipo no los usa en ninguna pantalla**:
`#0F0E29` aparece cero veces. No es portar, es diseñar. El cliente aprobó el
tema claro, no este.

**El modo oscuro vuelve obligatorio el arreglo de la mascota.** Los SVG de Lumi
tienen el contorno en `#17153A`, exactamente el color de la tarjeta noche. Ya
se ve roto hoy en el footer del prototipo, y hay un parche en el muro de pago
(`background:#FFFFFF; border-radius:16px; padding:4px` sobre la imagen) que lo
confirma. En modo oscuro esto pasa en todas las pantallas. La variante oscura
del set entra al camino crítico.

**El sistema de diseño se contradice a sí mismo** y hay que resolverlo al
escribir los tokens (§9).

**Sin red o sin cuota de Gemini, hoy la app muere.** `api/chat.js` responde 503
si falta `GEMINI_API_KEY`, y `consultar()` en `src/lib/consultar.js` lanza
`ErrorConsulta`. No hay plan B. Con un link abierto y varios estudiantes
entrando el mismo día, la cuota se agota.

**Las animaciones dependen de un hallazgo ya verificado**, no de una apuesta
(§10).

---

## 9. El trabajo

### 9.1 Tokens y tipografía

Reescribir `:root` en `src/theme/global.css` y la línea de fuentes en
`index.html` (Newsreader + Schibsted Grotesk + JetBrains Mono → Bricolage
Grotesque + Onest).

Los `--border-*` actuales son `rgba(242,239,233,.08)` — claro sobre oscuro.
Hay que invertirlos.

**Colores que el prototipo usa y el sistema de diseño no documenta.** Todos
necesitan nombre de token:

| Color | Para qué | Usos en el prototipo |
|---|---|---|
| `#EEEDF8` | línea divisoria | 26 |
| `#E4E2F3` | borde de campo y de tarjeta | 16 |
| `#D6D3F5`, `#B3AEE0`, `#F4F3FF`, `#2E2A66`, `#221F52` | texto y bordes sobre superficies noche **dentro del tema claro** | 31 |
| `#C9C4FF`, `#9A92FF`, `#8A80FF` | rampa de datos de los gráficos | 10 |
| `#E4E1FF` / `#2F3A0E` | texto sobre índigo / sobre lima | 7 |
| `#B23A1E`, `#FFE6DF`, `#FFD2C6` | set de alerta | 8 |
| `#FFB020` | estrellas de reseña | 4 |

`#9A96C4` aparece una sola vez y es un accidente: unificar.

**Coral `#FF6B4A`** está declarado en el sistema como color de alerta pero
falla como texto sobre blanco (2.82:1) y el prototipo lo usa **una sola vez**;
el error real usa `#B23A1E`. Reetiquetarlo como fondo/acento y documentar
`#B23A1E` como texto de alerta.

**Escalas.** El sistema declara 4 radios (8/14/24/pill) pero el propio
documento usa 10 y el prototipo 17; declara 5 pasos tipográficos
(64/40/24/18/13) y el prototipo usa 24 tamaños, con nueve consecutivos entre 11
y 19 px. Hay que **declarar la escala que de verdad se usa y colapsar el
resto**. Propuesta: radios 8/14/16/20/24/28/pill; tipografía 12/13/15/17/20/24/
34/46/64. Los tres tamaños 13/14/15 (155 usos combinados) cumplen el mismo rol.

**Contrastes que hay que arreglar** (medidos):

| Par | Ratio | Dónde |
|---|---|---|
| blanco sobre `#C9C4FF` | **1.64** | botón "Continuar"/"Ingresar" cuando el formulario está incompleto — ilegible en login y en los 4 pasos del registro |
| `#E4E2F3` sobre blanco | **1.27** | borde de todos los campos; incumple WCAG 1.4.11 |
| `#C9C4FF` sobre blanco | **1.64** | barras no destacadas |
| `#9A92FF` sobre blanco | **2.65** | puntos no destacados |
| `#FFB020` sobre blanco | **1.83** | estrellas de reseña |
| `#C9C4FF` sobre índigo | **3.81** | etiquetas de paso del registro (15 px/600, no es texto grande) |

Lo que sí pasa holgado y no se toca: `#55527A` sobre blanco (7.31), `#4B3BFF`
sobre blanco (6.23), noche sobre lima (13.46).

### 9.2 Modo oscuro

Segundo bloque de tokens activado por atributo en la raíz, con el interruptor
descrito en §7.3. Hay que decidir el equivalente oscuro de cada token nuevo de
§9.1, no solo de los 8 que el sistema documenta.

### 9.3 Capa de componentes

Repasar `.btn` y sus variantes, `.tarjeta`, `.campo`, `.chip`, `.composer`,
`.nota`, `.modal`. El prototipo usa 6 variantes de botón más un circular de
46 px para enviar; el sistema documenta 4. Documentar las que queden.

El componente "Fuente" (muestra, periodo, portales, **enlace**) es obligatorio
en cada cifra según el sistema. En el prototipo la tarjeta del hero lo
incumple: tiene los tres primeros datos y ningún enlace. Al migrar, se cumple.

### 9.4 Los tres gráficos

Reescribir `src/viz/graficos.jsx` (281 líneas). `SkillBars` → cuadrícula de 10
puntos. `SalaryChart` → franja P25–P75 con mediana. Gráfico de líneas por
trimestre: nuevo. `CompareTable`, `CourseCards` y `GapTable` no tienen
equivalente en el prototipo y se conservan tal como están, reskineadas.

**Las tres correcciones** (decisión del diseñador, el aspecto no cambia):

1. **El redondeo a "de 10" empata valores distintos.** 82 % y 77 % salen ambos
   como "8 de 10" con la misma cantidad de celdas llenas, mientras el texto al
   lado dice "lo básico es Google Analytics: 82 %" y "lo que más creció es Meta
   Ads". Texto y gráfico se contradicen a la vista. Hay que preservar el orden
   que el texto afirma.
2. **El resaltado marca "lo que más creció" pero el ojo lee "lo que más
   piden".** En Psicología la fila índigo es la tercera, con 4 de 10, mientras
   la primera con 8 de 10 va en lavanda pálido. Igual en el gráfico de líneas:
   en Derecho, Diseño e Ing. de Sistemas la línea gruesa destacada es la más
   baja del gráfico. Hay que desambiguarlo (etiqueta directa en la línea,
   subtítulo que diga qué significa el resaltado, o ambas).
3. **La leyenda del gráfico de líneas no sirve:** tres de las cuatro series
   comparten exactamente el mismo lavanda.

Además: los extremos de la franja salarial (`P25×0.7` y `P75×1.25`) se muestran
como si fueran el mínimo y el máximo del mercado. Son relleno de eje. O se
quitan o se etiquetan como escala.

### 9.5 Landing

Es el grueso del trabajo. Secciones del prototipo contra las actuales:

| Prototipo v2 | Hoy en la app |
|---|---|
| Hero + tarjeta de insight | Hero |
| **Conoce a Lumi** (índigo, 3 tarjetas con borde 3px) | — |
| **Funciones** (4 tarjetas bicolor) | "Cómo funciona" (reformular) |
| **Casos de éxito** (3 tarjetas) | — |
| **Reseñas** (mosaico 4,8 + 3 reseñas) | — |
| Planes + tabla comparativa | Planes |
| Footer noche con tira de metodología | — |
| — | Universidades |

El menú de navegación del prototipo tiene un bug a no replicar: `navs` incluye
`['','sec-resenas']`, una etiqueta vacía que deja un hueco clicable.

El mosaico "4,8 · De 312 reseñas verificadas" no lleva fuente ni marca de
placeholder, mientras las reseñas de al lado sí la llevan. Por la regla del
propio sistema ("nada sin respaldo") hay que resolverlo al quitar las etiquetas.

### 9.6 Registro

Fusionar `pages/Registro.jsx` y `pages/Onboarding.jsx` en el asistente de 4
pasos con el panel índigo, los pasos marcados y la burbuja de Lumi. El guardián
`SoloInvitados` ya existe y se conserva.

**Un defecto del prototipo a no replicar:** el registro pide la carrera "para
darte datos a tu medida" y después la ignora — las tres preguntas de ejemplo de
la pantalla de consulta están fijas en el código. En la app, `sugerenciasPara()`
ya usa el perfil: hay que mantener ese comportamiento.

### 9.7 Respaldo de la consulta

Si `/api/chat` falla (sin red, sin clave, 429, 503, respuesta ilegible), la
pregunta se resuelve localmente contra `catalogo.json`, que ya trae la tabla de
sinónimos por rol. El estudiante no ve un error de infraestructura.

Queda a criterio del constructor si el respaldo se nota o es silencioso, pero
no debe presentar como respaldada una cifra que no lo esté.

### 9.8 Cerrar sesión

Entrada normal en el menú de cuenta. `Cuenta.jsx` ya existe y se reskinea.

---

## 10. Animación de Lumi

**El rig ya existe.** Esto está verificado abriendo los SVG, no supuesto. Las
ilustraciones no son siluetas aplanadas: cada parte móvil ya tiene clase.

| Pose | Clases en el SVG | Lo que el catálogo promete |
|---|---|---|
| `piensa` | `shadow` `float` `head` `bulb` `eyes` `lids` `hand` | "Inclina la cabeza, mira a los lados y golpea el mentón con la mano" |
| `saluda` | `shadow` `float` `bulb` `arm` `bar` `b2` `b3` `eyes` | "Flota, la antena brilla, parpadea y agita la lupa; las barras suben y bajan" |
| `celebra` | `shadow` `cf` `c2` `c3` `c4` `jump` `la` `ra` `bulb` | "Salta con los brazos arriba y lanza confeti" |
| `alerta` | `shake` `bulb` `eyes` `drop` | "Antena en coral intermitente, gota de sudor y un pequeño temblor" |
| `logo` | ninguna | estático a propósito — **no se anima** |

La correspondencia es exacta, una a una. Quien ilustró a Lumi armó el rig,
nombró cada pieza y describió el movimiento, y entregó sin la hoja de estilos.
Lo que falta son keyframes, no arte.

El rig está bien construido: en `piensa`, `.head` es un grupo con antena,
orejas, cara, pantalla y ojos que rota como unidad; `.lids` son solo los dos
círculos lima de los ojos, aislados para el parpadeo; `.hand` lleva brazo, puño
y nudillo juntos para rotar desde el hombro; `.shadow` está fuera de `.float`
para encogerse cuando el cuerpo sube.

**Verificado funcionando.** Se escribieron ~14 líneas de CSS dentro del SVG de
`piensa` y se cargó como `<img src>`: flotación, inclinación de cabeza,
movimiento de ojos, parpadeo, brillo de antena y sombra reactiva, sin
JavaScript y sin librerías. Dos capturas en instantes distintos muestran el
cambio.

**Montaje recomendado:** `<style>` dentro del SVG para `saluda`, `piensa` y
`alerta` — son estados continuos y el bucle es lo correcto. `celebra` en línea
como componente React, porque el salto con confeti tiene que dispararse una vez
al confirmar el pago, no repetirse para siempre.

`@media (prefers-reduced-motion: reduce)` va dentro del propio SVG. Hoy el
catálogo afirma que "las animaciones se desactivan con reducir movimiento" y es
falso: el prototipo no tiene una sola regla. Con esto pasa a ser cierto.

**Riesgos:** los `transform-origin` se calibran mirando el resultado, no por
cálculo. Y la cara de `piensa` transmite tristeza, no concentración (cejas
caídas, boca hacia abajo) justo al lado de un consejo optimista; la animación
ayuda, pero cerrarlo bien pide retocar dos `<path>`.

**Dónde aparece cada pose hoy:** `saluda` en landing, los 4 pasos del registro
y la cabecera de consulta; `piensa` en la pantalla de carga y en la burbuja
"Lumi piensa…"; `celebra` en la confirmación de pago; `alerta` en muestra
insuficiente y sin créditos; `logo` en nav, footer, login, registro y barra
lateral.

**Dos cosas más del prototipo a arreglar al migrar:** en los 4 pasos del
registro siempre sale la misma pose (solo cambia el texto de la burbuja), y la
misma burbuja "Lumi piensa…" repite texto idéntico en cada turno de un hilo
porque depende solo del ciclo y el rol.

---

## 11. Lo que queda a criterio del constructor

- El orden de las fases y qué se verifica en cada una.
- Cómo se estructuran los componentes nuevos de la landing.
- La curva y los tiempos exactos de cada animación, dentro de lo que describe
  el catálogo.
- La forma concreta de desambiguar el resaltado de los gráficos (§9.4.2).
- Si el respaldo de la consulta se anuncia o es silencioso (§9.7).
- Los valores oscuros de los tokens que el sistema no documenta (§9.2).
- Los nombres inventados de casos y reseñas.

## 12. Verificación

El repo ya trae `npm run verify` (`build-catalogo` + `check-store` +
`check-chat`) y `npm run lint` (oxlint). Deben seguir pasando.

Además, el recorrido completo de las 8 pantallas tiene que poder hacerse solo,
sin callejones sin salida, en claro y en oscuro.

---

## 13. Revisión del constructor y resolución (2026-10-20)

Un revisor con ojos frescos leyó este documento y el repo. Sus datos fueron
verificados contra el código; todos resultaron correctos. El usuario delegó las
nueve decisiones resultantes. **Todas las de §13.2 son decisiones del autor de
este documento, no del usuario ni del cliente.**

### 13.1 Correcciones aplicadas

- §5 decía "60 roles": son **35**. Corregido.
- `periodoActual()` (`'YYYY-MM'`, renueva el plan gratis) y `ventanaAnalisis()`
  (la etiqueta "jul – oct 2026") son dos cosas distintas.
- **"Cerrar sesión" ya existe** en `src/pages/Cuenta.jsx:114`. §6.7 y §9.8 son
  reskin, no construcción.

### 13.2 Las nueve decisiones

**1. Reseñas y casos: creíbles, sin sellos de verificación.**
Se mantienen los nombres inventados y se quitan las etiquetas "Placeholder"
(instrucción del usuario). Se eliminan además:
- el sello `✓ Verificada` de cada reseña,
- el texto "De 312 reseñas verificadas con correo universitario" del mosaico,
- las cifras de resultado medidas de los casos ("+18% sobre la propuesta",
  "2 meses de la consulta a la oferta", "4 electivos elegidos con datos"),
  que se reemplazan por la descripción cualitativa del caso.

El mosaico conserva la nota "4,8" solo si se acompaña de un conteo que no
afirme verificación; si no, se reemplaza por un titular de sección. Razón: una
reseña con nombre inventado en un prototipo es práctica normal; una certificada
como verificada con un conteo exacto es un registro fabricado, y el link se
reenvía. Avatares con iniciales (§7.4). El aviso de datos sintéticos del modal
se conserva (§7.5).

**2. Las cifras de la landing salen del catálogo, no del diseño.**
`cobertura()` ya deriva ofertas/roles/ámbitos de `catalogo.json`; se usa eso.
La tira del footer dirá los números reales (24.231 · 35 · 5) en vez de
"48,200 · 60 · 8", y la tarjeta del hero tomará su muestra del rol que muestre.
Razón: la app ya hace lo correcto y copiar el diseño literal sería una
regresión; autorizar ~25 roles nuevos es una fase de datos que el cliente no
aprobó. **El diseño visual no cambia, solo los dígitos.**

**3. El enlace del componente Fuente abre la metodología, y se llama así.**
El enlace no apunta a Computrabajo ni al INEI: nombrar una fuente real para una
cifra sintética es peor que no enlazar. Abre el modal de metodología (muestra,
periodo, portales, método y el aviso de datos sintéticos) y se etiqueta
**"Ver metodología"**, no "Ver fuente" ni "Ver muestra". Cumple el comentario
del test ("mostrar una fuente y un link") sin afirmar algo falso.

**4. El gráfico de tendencia dibuja los dos puntos que existen, no cuatro.**
El catálogo tiene un solo `tendencia` por habilidad, sin serie temporal. Se
dibuja trimestre anterior (`pct − tendencia`) → trimestre actual (`pct`), con
el mismo lenguaje visual (líneas, destacado, leyenda) y el eje rotulado en
consecuencia. Razón: replicar la interpolación inventada del prototipo —cuya
curva depende del largo del nombre de la habilidad— contradice de frente §9.7 y
la decisión 3. **Esto es una desviación visible del diseño aprobado y el
cliente debería verla.**

**5. El gráfico muestra 4 habilidades, más la que más creció si quedó fuera.**
Máximo 5 filas. En 16 de 35 roles la habilidad de mayor crecimiento no está
entre las 4 primeras por porcentaje, y es justo de la que hablan el titular y
el resaltado. Recortar a 4 la escondería. Se marca explícitamente como "la que
más creció" para que el resaltado deje de ser ambiguo (resuelve §9.4.2).

**6. `texto` y `accion` se plantillan localmente, no los escribe el modelo.**
`insight` de Gemini sigue siendo la única prosa del modelo. Consecuencias:
- añadir `tip` por rol a `roles.source.js` (35 entradas, dato autorado acotado),
- añadir `ciclo` al registro, al store y a `check-store.mjs` (hoy 0 apariciones
  en `src/`),
- variar `accion` por tema además de por ciclo y rol, para que la burbuja deje
  de repetir texto idéntico en cada turno (§10).
Razón: la arquitectura es "ninguna cifra en pantalla pasa por el modelo", y el
respaldo de §9.7 tiene que reproducir todo sin API.

**7. Los chips del registro se quedan como los aprobó el cliente; se escribe el
mapeo.** Las tres listas (10 carreras, 10 intereses, 4 ciudades) no coinciden
con la taxonomía del catálogo (8 áreas, 5 ámbitos). Se escribe
`carrera → áreas` para las 10 carreras e `interés → áreas` para los 10
intereses; "Otra" como ciudad mapea a "Todo Perú". Es más trabajo que cambiar
los chips, pero no altera una pantalla aprobada y hace que la carrera
efectivamente importe (§9.6).

**8. Los cuatro rigs se montan en línea como componentes React.**
Un SVG dentro de `<img>` es un documento aislado: ve `prefers-color-scheme`
pero no el `data-theme` del anfitrión, así que no puede seguir el interruptor
manual que pidió el usuario (§6.3). Inline resuelve modo oscuro, interruptor y
tokens de color con una sola fuente de verdad; los keyframes viven en
`componentes.css`. El hallazgo de §10 sigue siendo válido: cambia el montaje,
no la viabilidad. El logo sigue estático y puede quedarse como `<img>`.
**Sub-decisión:** los SVG se tratan como fuente editable. Recolorear el contorno
vía token y retocar dos `<path>` de `piensa` está dentro del alcance; no hay
dependencia externa en el camino crítico.

**9. No se publica el precio sin verificar de LinkedIn Premium.**
La celda "Aprox. S/ 150/mes*" se reemplaza por una cualitativa ("Suscripción
mensual de pago") y desaparece el asterisco junto con su nota. Quitar la nota
dejando el precio era la única forma en que cumplir §6.6 empeoraba la página.

### 13.3 Decisiones menores del revisor, adoptadas

- La sección "Universidades" de la landing actual se cae.
- `npm run verify` necesita servidor vivo y `GEMINI_API_KEY` por `check-chat`;
  se añade una prueba offline del respaldo de §9.7 y `check:chat` queda
  opcional.

### 13.4 Lo que el cliente debería revisar

Tres de estas decisiones cambian algo que ya aprobó:
1. Las reseñas pierden el sello de verificación y los casos sus cifras de
   resultado (decisión 1).
2. Los números de la tira de metodología bajan a los reales (decisión 2).
3. El gráfico de tendencia pasa de cuatro puntos a dos (decisión 4).
