# De dashboard informativo a motor de decisión

**Fecha:** 2026-10-23
**Estado:** dos revisiones resueltas (§13 constructor · §14 handoff y repo) ·
sin puntos abiertos · pendiente de aprobación del usuario
**Handoff de origen:** `design_handoff_motor_decision/` (`LMI-U Prototipo v2.dc.html`, variante **A** de cada pantalla)

---

## 1. Intención y por qué

La app ya está desplegada en Vercel y ya se ve como el prototipo v2 aprobado
(ese trabajo se cerró el 2026-10-20). Lo que no hace todavía es **servir para
decidir algo**. Hoy el estudiante pregunta, recibe un porcentaje bien
presentado, y se lleva el dato a ChatGPT o directamente a Computrabajo. La app
le dijo *qué* pasa en el mercado y lo dejó solo con el *cómo*.

Este trabajo cierra ese hueco: la app pasa a decirle **con cuántas ofertas
calza hoy, qué le falta exactamente, en qué orden aprenderlo, en qué avisos
concretos ya es competitivo y cómo reescribir su CV para ellos.**

### Para qué se usa el resultado

El entregable es el mismo link de Vercel. El dueño del producto lo manda a
amigos suyos, estudiantes de Ingeniería de Sistemas. Entran por la landing,
"inician sesión" contra la sesión simulada que ya existe, recorren la app
**solos y sin que nadie les explique nada**, y de ahí sale el feedback. Las dos
preguntas que se quieren responder son:

1. ¿La app cumple lo que la landing les prometió?
2. ¿Pagarían por la cuenta Pro?

No hay fuente de datos real. Todos los números son ficticios y eso está
decidido: lo que se valida es la propuesta de valor, no la tubería de datos.

Tres consecuencias que mandan sobre el resto del documento:

1. **Ningún botón puede no llevar a ninguna parte.** Con datos inventados da
   igual que una cifra sea falsa; no da igual que un botón no haga nada,
   porque el tester lo lee como "la app todavía no hace eso" y ahí se cae la
   expectativa que se está midiendo.
2. **El paywall es el instrumento de medición, no un obstáculo.** El tester
   tiene que poder ver qué compra, cruzar la puerta y usar la app en modo Pro.
   Si no la cruza, no puede decir si pagaría.
3. **Nada puede verse como maqueta.** Igual que en la spec anterior: sin
   etiquetas "Placeholder", sin opciones apagadas "porque es un prototipo".

### Por qué el público encaja con los datos del prototipo

Afortunada coincidencia: todo el mock del prototipo es de **Desarrollador
Backend junior** — Java, SQL, APIs REST, Docker, Cloud. Es exactamente el
mercado que miran unos estudiantes de Ingeniería de Sistemas, así que las
cifras inventadas les van a resultar plausibles y van a poder juzgar si el
consejo tiene sentido.

---

## 2. Objetivos

- El estudiante obtiene un **diagnóstico sin escribir nada**: elige cómo
  contar lo que sabe, a qué rol apunta y dónde, y recibe su porcentaje de
  compatibilidad con el mercado.
- El diagnóstico desemboca en un **reporte de brecha** que nombra el cuello de
  botella: "si aprendes X e Y, desbloqueas el Z% de las ofertas", con el salto
  de sueldo típico que eso implica.
- El resultado del chat deja de terminar en un gráfico: cada habilidad lleva
  el **estado del usuario** (Lo tienes / Te falta), las **frases literales** de
  los avisos que la piden, y **botones que llevan a la acción siguiente**.
- El estudiante ve **ofertas ordenadas por su propia brecha**, no por fecha, y
  en cada una qué le falta para postular.
- Existe una **ruta de aprendizaje** ordenada por ofertas desbloqueadas, con
  recursos gratis primero y las horas que cuesta cada paso.
- Existe un **adaptador de CV** que reescribe sus bullets con las palabras de
  los avisos y que **nunca le agrega experiencia que no tiene**.
- El modelo de negocio queda en **dos planes**: Gratis y Pro estudiante
  S/ 19/mes, coherentes en la landing, el paywall, la pasarela y la cuenta.
- La navegación de la app refleja el nuevo producto: la barra lateral deja de
  ser "nueva consulta + historial" y pasa a ser las cinco secciones del motor
  de decisión.

## 3. No-objetivos

- **Datos reales ni scraper.** Todo sale de mock. La forma de los datos imita
  las cuatro entidades que tendrá el scraper (`Ofertas_Normalizadas`,
  `Requisitos_Oferta`, `Catalogo_Recursos`, `Perfil_Usuario`) para que
  enchufarlo después no obligue a reescribir las pantallas, y nada más.
- **Lectura real de PDF.** "Subir mi CV en PDF" acepta el archivo y devuelve
  las skills detectadas desde el mock. No se parsea el PDF.
- **Cobro real.** La pasarela sigue siendo la simulada que ya existe (Yape,
  Plin, tarjeta con Luhn, PagoEfectivo). No se integra ningún procesador.
- **Variante B de ninguna pantalla.** Decisión del usuario: solo A.
- **Rediseñar para celular.** Se conserva el responsive que la app ya tiene.
  No se diseña para móvil.
- **Las vistas docente.** Siguen ocultas como las dejó la T15 anterior.

## 4. Anti-objetivos

Cosas que harían fracasar el trabajo aunque técnicamente funcione:

- **Que el tester se quede sin saber qué hacer después.** Si llega al
  porcentaje y la pantalla no le ofrece un siguiente paso concreto, el trabajo
  no sirvió: ese es exactamente el problema que viene a resolver.
- **Que el CV invente experiencia.** Si el adaptador le pone "APIs REST" a
  alguien que no las ha usado, el producto se vuelve un generador de mentiras
  y pierde la confianza que lo sostiene. La regla es dura: si la skill no está
  en su CV, no se agrega; se avisa.
- **Que convivan dos precios.** Un tester que ve S/ 19 en el paywall y S/ 29
  en la landing no evalúa el producto, evalúa si la app está terminada.
- **Que las pantallas Pro se vean vacías en plan gratis.** El plan gratis debe
  mostrar lo suficiente para que el tester entienda qué se está perdiendo (de
  ahí el desenfoque con la tarjeta encima), nunca un espacio en blanco.
- **Romper lo que ya está en producción.** El chat, la landing, el login y el
  pago funcionan hoy para usuarios reales. Nada de esto puede quedar peor.

---

## 5. Punto de partida: qué hay hoy

| Pieza | Estado |
|---|---|
| Stack | React 19, React Router v7, Zustand con `persist` (`lmiu`), Vite 8 |
| Tema | `src/theme/tokens.css` v2 "Impulso", claro y `[data-theme="dark"]`, único archivo con hex literales |
| Pantallas | landing, login, registro, chat, planes, checkout, confirmación, cuenta |
| Mascota | `src/mascota/Lumi.jsx` con 4 poses animadas (`saluda`, `piensa`, `celebra`, `alerta`) y `LumiLogo` |
| Datos | `src/data/catalogo.json`: 35 roles, 5 ciudades, `minMuestra: 30` |
| Backend | `api/chat.js`: dos llamadas a Gemini (enrutar sin cifras → redactar con las cifras del rol acertado) |
| Respaldo | `src/lib/respaldo.js` responde sin red para 35 roles y 175 combinaciones rol/ciudad |
| Pruebas | `npm run verify` encadena 6 scripts con `node:assert`; `npm run lint` (oxlint); `npm run build` |

### Lo que el catálogo ya trae y el prototipo duplicaba

Hallazgo que ahorra trabajo y evita que los números se separen: el mock del
prototipo **no es nuevo**, es el catálogo que ya existe, copiado a mano.

| En el prototipo | En `catalogo.json` |
|---|---|
| `ROLE_SK` (Java o Node.js 88, SQL 84, APIs REST 81, Git 79, Docker 47, Cloud 43) | `roles['desarrollador-backend-jr'].habilidades`, idénticas, con sus tendencias +5/+2/+7/+3/+18/+22 |
| `CIUDADES = { Lima: 581, Arequipa: 114, Trujillo: 78, Remoto: 114 }` | `porCiudad[c].ofertas`, los mismos cuatro números |
| "314 ofertas" del chat | `porCiudad.Lima.n` = 314 |
| Las 4 tarjetas de rol del paso 2 | `desarrollador-backend-jr`, `desarrollador-frontend-jr`, `analista-qa`, `analista-datos-jr` ya existen |

Lo único de verdad nuevo son las **6 ofertas con sus requisitos y sus frases
literales**, el **catálogo de recursos** y los **bullets de CV**.

**Y eso es un solo rol.** El prototipo trae seis estructuras de datos
—`OFERTAS` (6 avisos), `PERFILES` (8 filas), `EVID`, `REC`, `PORQUE` y
`BULLETS`— y las seis son de Backend junior. La decisión §6.8 de escribir unos
8 avisos para cuatro roles no viene del handoff: lo multiplica por 5,3× en
avisos y por 4× en las otras cinco estructuras. Ese es el delta real entre lo
que el handoff entregó y lo que este plan pide, y es lo que manda sobre el
calendario (§10.1).

### Estado de la verificación hoy

`npm run verify` **está en rojo antes de empezar**, por dos cosas ajenas a
este trabajo y posteriores a la T15:

1. `check-tema` falla: hay hex literales en JSX en `MenuPerfil.jsx`,
   `AppShell.jsx`, `PagoLayout.jsx`, `Chat.jsx`, `Checkout.jsx` y
   `landing/Secciones.jsx` (`#bef264`, `#0f172a`, `#14172a`, `#dc2626`…).
2. `check-store` falla: `Diego entra con saldo` espera 21 créditos y encuentra
   25.

`npm run lint` y `npm run build` pasan (lint con avisos preexistentes).

---

## 6. Decisiones que tomó el usuario

Estas salieron de la conversación y no se discuten en el plan:

1. **Variante A** en las ocho pantallas.
2. **Esto se suma, no reemplaza.** El chat con Lumi sigue siendo una sección
   de la app; el diagnóstico pasa a ser la puerta de entrada.
3. **El modelo de negocio queda en dos planes.** Gratis y Pro estudiante
   S/ 19/mes. Los paquetes de créditos (S/ 12 / S/ 25) y el Pro de S/ 29
   **salen de toda la app, landing incluida**: "ese modelo de negocio ya queda
   inviable".
4. **"Activar Pro estudiante" pasa por la pasarela.** No se activa de golpe
   como en el prototipo: abre el checkout simulado y, al confirmar, se
   desbloquean las funciones prometidas.
5. **El plan gratis se queda en un diagnóstico al mes**, como dice el handoff,
   y eso es deliberado: "la idea es que se queden con las ganas de jugar con
   el diagnóstico y me digan si llegaron al modo de pago". El muro es parte
   del experimento.
6. **El chat se implementa tal cual el handoff**, incluido que `api/chat.js`
   responda con el contexto de la base (fragmentos `contexto_uso`, conteos) y
   no con teoría general.
7. **Datos ficticios, recorrido completo.** Lo que se valida es la propuesta
   de valor; lo que no se tolera es un callejón sin salida.
8. **Se escriben avisos para los cuatro roles de sistemas** — Backend,
   Frontend, QA y Analista de Datos junior — unos 8 por rol. Razón: no todos
   los testers apuntan a backend, y el que elige QA tiene que poder recorrer
   lo mismo que los demás.
9. **La landing se reescribe al motor de decisión.** El titular y las tres
   funciones dejan de prometer el dashboard informativo. Sin eso, el feedback
   se mide contra una promesa que ya no es la del producto.
10. **Las dos cuentas demo arrancan en plan gratis.** Nadie se salta la
    pasarela, porque cruzarla es lo que se está midiendo. Diego Ramos pasa a
    ser otro estudiante en gratis, con historial de consultas en vez de pagos.

11. **Los bullets del CV se escriben para los cuatro roles.** Unos 5 por rol,
    ~20 en total. Es el mismo motivo de la decisión 8: el que elige QA tiene
    que poder recorrer lo mismo que los demás, y el adaptador de CV es
    justamente la pantalla cuyo argumento de venta es la honestidad.
    Decidido el 2026-10-26, sobre la pregunta que abrió §14.3.

---

## 7. Decisiones que tomó el diseñador de este documento

Mías, no suyas. Están aquí para que las pueda rechazar leyendo.

1. **Los datos nuevos derivan de `catalogo.json`, no lo duplican.** Un archivo
   nuevo `src/data/mercado.js` aporta solo lo que no existe (ofertas,
   requisitos con sus frases, recursos, bullets) y lee de `catalogo.json` todo
   lo que ya está (habilidades del rol, ofertas por ciudad, muestra). Si se
   copiaran los números, en la primera corrección del catálogo el diagnóstico
   y el chat empezarían a decir cosas distintas del mismo rol.

2. **Tres tokens nuevos para la tarjeta noche: `--lima-fija`,
   `--sobre-lima-fija`, `--blanco-fijo`**, declarados con el mismo valor en
   `:root` y en `[data-theme="dark"]`. Razón: el prototipo pone `#C6F24E`
   literal en las tarjetas oscuras porque ahí el lima tiene que seguir siendo
   lima, y en tema oscuro `--resalte` se vuelve índigo. Y `check-tema`
   prohíbe hex literales en JSX. Sin estos tokens habría que elegir entre
   romper la prueba o romper el diseño.

3. **Las dos pruebas rojas del repo se arreglan dentro de este trabajo.** No
   es limpieza gratuita: al quitar los créditos hay que tocar `demo.js`,
   `store.js` y `check-store.mjs` de todos modos, y los archivos con hex
   literales son casi los mismos que este plan reescribe. Dejar `verify` en
   rojo haría imposible saber si lo nuevo rompió algo.

4. **El paywall nuevo reemplaza a `ModalPlanes` en toda la app.** Un solo
   paywall, no dos. El medidor de la barra lateral y el badge de la cabecera
   abren el nuevo.

5. **`plan: 'institucional'` se conserva.** No es un plan que se compre: lo
   asigna el tenant de marca blanca. Solo desaparece `'creditos'`.

6. **Los botones del CV hacen algo de verdad.** "Copiar texto" usa
   `navigator.clipboard`; "Descargar PDF" abre el diálogo de impresión con una
   hoja `@media print` (la app ya tiene un bloque print). Nada decorativo,
   nada de librerías nuevas.

7. **"Postular en &lt;portal&gt; ↗" abre el buscador del portal** en una
   pestaña nueva (`target="_blank" rel="noopener"`), con el rol y la ciudad en
   la URL. Una empresa inventada no tiene aviso real que enlazar, y un `href="#"`
   se lee como botón roto.

8. **El diagnóstico se guarda y se puede volver a ver, no se repite.** Entrar
   a "Mi diagnóstico" con un diagnóstico hecho lleva al reporte; "Rehacer
   diagnóstico" es lo que consume el cupo del mes. Así el límite de 1/mes no
   castiga a quien solo quiere volver a mirar su reporte.

9. **En plan Pro el diagnóstico es ilimitado.** El handoff solo fija el límite
   del gratis; "todo desbloqueado" en el medidor Pro implica esto.

10. **El porcentaje casi no cambia al elegir ciudades, y eso es correcto.**
    El porcentaje es una propiedad del perfil de skills contra la distribución
    de requisitos del mercado; lo que cambia con las ciudades es el tamaño del
    mercado, no la competitividad. Los chips de ciudad sí hacen algo —mueven N
    y T de forma proporcional—, y el mock no tiene requisitos distintos por
    ciudad que justifiquen mover la razón.

    **La fórmula del prototipo no sostiene la invariante que este plan
    afirmaba, y por eso cambia.** Con `pct = round(n/695·100)` y
    `N = round(n·total/695)` el porcentaje se redondea por un camino y N por
    otro, así que `pct === round(N/T·100)` es **falso**. Por fuerza bruta sobre
    las 10 skills y las 15 combinaciones de ciudad del mock rompe por un punto
    en **800 de 15 360 casos (5,2%)**, y no en esquinas raras: las skills por
    defecto de Valeria más APIs REST y Docker, en Lima, dan `pct` 27 y `N/T`
    28.

    Por eso `pct` **se deriva de N y T ya redondeados**, en este orden: `n` es
    la suma de las filas alcanzables de `perfiles`, `T` las ofertas de las
    ciudades elegidas, `N = round(n·T/base)` con `base` la suma de la tabla del
    rol, y recién entonces `pct = round(N/T·100)`. La invariante pasa a ser
    verdadera por construcción en lugar de ser una afirmación que la prueba
    desmiente.

    El precio es que el porcentaje deja de estar clavado: cada combinación de
    ciudad queda a **un punto como máximo** del porcentaje de referencia, así
    que dos combinaciones pueden diferir en dos. Se paga a gusto: el tester ve
    la cifra grande y el "en N de T ofertas" en la misma tarjeta (§9.3), donde
    descuadrar se nota de un vistazo, mientras que uno o dos puntos entre Lima
    y Lima + Arequipa no los ve nunca.

11. **Un solo universo de ofertas.** `porCiudad[c].ofertas` es "ofertas
    activas" en todas las pantallas. `n` queda reservado para los sueldos y
    para `MIN_MUESTRA`, que es exactamente lo que la metodología ya llama
    "muestra". Los conteos de evidencia del chat se derivan del mismo universo
    (`round(pct/100 · ofertasDelUniverso)`) y nunca del `ofertas` a nivel de
    rol (1038, que no cuadra con la suma de sus ciudades, 923). Sin esta regla
    el chat diría 314 y el diagnóstico 695 del mismo rol y la misma ciudad,
    que es justo el fallo que §7.1 viene a evitar.

    **Y esto mueve seis cifras que el handoff ya traía escritas.** En el
    prototipo `EVID.n` es el `pct` de la skill sobre 314, el `n` salarial de
    Lima: 88% → 276. Con esta regla pasa a calcularse sobre el universo de
    ofertas, 88% de 695 → 612. Los seis conteos de evidencia del chat cambian
    de valor a propósito; los resúmenes y los fragmentos literales no se
    tocan.

12. **El chat degrada con gracia en los roles sin avisos.** El chip de estado
    y el panel de frases literales se dibujan solo donde hay evidencia
    cargada; en el resto de los 35 roles el chat se comporta exactamente como
    hoy. Ningún botón lleva a ninguna parte porque el botón no se renderiza.
    Y si el estudiante todavía no tiene diagnóstico, en lugar del chip va una
    invitación a hacerlo, enlazada a `/diagnostico`.

13. **El CV que se adapta es el de la persona demo.** La cuenta demo Valeria
    Ríos se alinea con la persona del CV y del diagnóstico: Ingeniería de
    Sistemas, UNSA, 8vo ciclo, Arequipa, con las skills del mock. Como no hay
    autenticación real, la persona demo *es* el avatar del tester, así que la
    pantalla muestra su propio CV y no el de un desconocido. **Los avisos del
    adaptador se derivan de `perfil.skills`**, no son texto fijo: a quien
    marcó APIs REST en el paso 1 no se le puede decir que no la tiene, en la
    única pantalla cuyo argumento de venta es la honestidad.

14. **`MIN_MUESTRA` sigue gateando el denominador, y el 0% tiene diseño.** El
    umbral de 30 se aplica al universo de ofertas de las ciudades elegidas,
    igual que hoy gatea los sueldos por `n`. El numerador pequeño no se
    esconde: "calzas con 12 de 695" es una respuesta legítima y es el producto
    funcionando. El caso de 0 ofertas alcanzables sí necesita diseño, y es
    este: el reporte muestra 0% y la tarjeta de cuello de botella pasa a ser
    la protagonista — "Todavía no cumples todas las obligatorias de ninguna
    oferta. Con X e Y pasas a N."

15. **Cusco se queda fuera de los chips de ciudad, y el sueldo necesita una
    segunda puerta.** Cusco existe en el catálogo pero no tiene mediana
    salarial declarada, y el reporte muestra sueldo típico. Las cuatro del
    handoff (Lima, Arequipa, Trujillo, Remoto) sí tienen con qué responder
    **para Backend, Frontend y Analista de Datos**. Para `analista-qa` no:
    solo Lima declara mediana; Arequipa, Trujillo y Remoto no. Y como las
    ciudades por defecto son Lima y Arequipa, un tester que apunta a QA
    entraría a una pantalla donde el reporte habla de sueldo mientras el chat,
    del mismo rol y la misma ciudad, se calla por falta de muestra.

    Resolución: el sueldo típico del reporte sale de la tabla `perfiles`, pero
    **se gatea con la misma regla que el chat** — si ninguna de las ciudades
    elegidas declara mediana para ese rol, el reporte omite la cifra de sueldo
    y muestra solo ofertas y brecha. Un dato menos nunca es tan caro como dos
    datos que se contradicen. Los chips de ciudad se quedan iguales en los
    cuatro roles.

---

## 8. Restricciones y riesgos conocidos

- **`check-tema` prohíbe hex literales en todo `src/**/*.js(x)`** salvo
  `mascota/` y `tenant.js`, y exige que cada token de color de `:root` tenga
  contraparte en `[data-theme="dark"]`. Todo color nuevo pasa por
  `tokens.css`.
- **`componentes.css` no admite ni un literal**, ni siquiera `rgba()`. Las
  sombras y velos nuevos salen de tokens.
- **El store persiste en `localStorage` bajo `lmiu` con `version: 2`.** Quitar
  `'creditos'` deja usuarios ya desplegados con `plan: 'creditos'` guardado en
  el navegador. Hay que subir a `version: 3` y migrar: quien tenga créditos
  pasa a `free` sin perder su historial. Si no, un tester que ya entró verá un
  plan que no existe.
- **El tema oscuro invierte acento y resalte** (acento lima, resalte índigo).
  Toda pantalla nueva se revisa en los dos temas.
- **`prefers-reduced-motion: reduce` deja a Lumi quieta** y eso ya está
  probado. Las animaciones nuevas (`fadeInUp`, `scaleIn`, `slideInRight`)
  respetan la misma regla.
- **Riesgo de alcance:** las pantallas Pro no funcionan sin datos escritos a
  mano, y son seis estructuras × cuatro roles (§6.8, §6.11, §10.1). El riesgo
  ya no es que falte un rol entero, sino que falte **una** estructura de un
  rol: avisos de QA sin sus bullets de CV, o sin sus recursos, deja una
  pantalla Pro vacía para un rol que el paso 2 ofrece. Lo atrapa
  `check-mercado.mjs` (§12), no la lectura.
- **Riesgo de credibilidad:** los bullets del CV y las frases de los avisos
  son textos inventados que un estudiante de sistemas va a leer con lupa. Si
  suenan a relleno, el adaptador pierde el efecto. Los del prototipo se usan
  tal cual, sin reescribirlos "para mejorarlos"; los de los otros tres roles
  se escriben imitando ese nivel de detalle, que es el que los hace creíbles
  —herramientas y versiones concretas, no "manejo de bases de datos".

---

## 9. El trabajo

### 9.1 Navegación (`AppShell`)

La barra lateral conserva su ancho de 260px y sus estilos. Cambia su
contenido: "+ Nueva consulta" y el historial dejan de ser lo primero.

Cinco secciones, en este orden:

| Sección | Ruta | Nota |
|---|---|---|
| Mi diagnóstico | `/diagnostico`, o `/diagnostico/resultado` si ya existe uno | — |
| Ofertas para mí | `/ofertas` | etiqueta "Pro" en plan gratis |
| Ruta de aprendizaje | `/ruta` | etiqueta "Pro" |
| Adaptar mi CV | `/cv` | etiqueta "Pro" |
| Consultar a Lumi | `/chat` | la pantalla actual |

Debajo: `HISTORIAL` como hoy, y el medidor al fondo. Ítem activo con
`background: var(--bg-elevated)` y peso 600. Etiqueta Pro: 11px/700,
`padding: 2px 8px`, `background: var(--bg-noche)`, `color: var(--sobre-noche)`.

**Tras el login, un usuario sin diagnóstico aterriza en `/diagnostico`**, no en
el chat vacío. Con diagnóstico hecho, en `/diagnostico/resultado`.

Hoy ese destino está escrito a mano en cuatro sitios y los cuatro apuntan al
chat: `Login.jsx:30` (entrar), `:36` (registro), `:170` (entrar con cuenta
demo) y `SoloInvitados` en `App.jsx:26` (sesión ya abierta). Pasa a ser uno
solo, derivado de si hay diagnóstico, para que no vuelvan a separarse.

### 9.2 Diagnóstico rápido · `/diagnostico` (variante A)

Columna de 760px centrada. Arriba, Lumi `saluda` a 88px junto a
"Diagnóstico rápido · 3 pasos, sin escribir" y el h1 con el nombre del
usuario. Debajo, un stepper de 3 tarjetas: Tu perfil / Tu meta / Tu
diagnóstico. El paso hecho muestra "✓" sobre `--resalte`; el activo, su número
sobre `--accent`.

**Paso 1 — Tu perfil.** Dos radio-cards (borde 2px `--accent` la activa):

- *Subir mi CV en PDF*: dropzone con borde 2px punteado `--borde-campo`, radio
  20, fondo `--bg-elevated`, "Máx. 5 MB · lo leemos para detectar tus skills,
  no lo compartimos". Tras subirlo, la ficha del archivo con "Cambiar archivo"
  y los chips de skills detectadas para confirmar o corregir.
- *Elegir carrera y skills*: carrera y universidad (del perfil del usuario),
  ciclo con los `CICLOS` del store, y chips de skills. **Mínimo 5.**

"Continuar" queda en `--accent-apagado` hasta que el paso sea válido (CV
subido, o 5 skills marcadas).

**Paso 2 — Tu meta.** Tarjetas de rol con su número de ofertas activas, y
ciudades en chips de selección múltiple (Lima y Arequipa marcadas por
defecto; también Trujillo y Remoto). Botones "Atrás" (`btn--linea`) y "Ver mi
diagnóstico" (`btn--acento`).

**Paso 3 — Tu diagnóstico.** La tarjeta de carga que ya existe en `Chat.jsx`,
reutilizada: Lumi `piensa`, barra 30 → 65 → 95%, y el checklist "Leyendo tu
perfil / Cruzando con N ofertas activas / Calculando tu brecha y lo que
desbloqueas". Al terminar, navega a `/diagnostico/resultado`.

### 9.3 Reporte de brecha · `/diagnostico/resultado` (variante A, narrativo)

- **"TU VALOR ACTUAL"**: el porcentaje a 96px, "de las ofertas activas te
  aceptarían hoy: cumples todos sus requisitos obligatorios en N de T", y el
  sueldo típico de esas ofertas.
- **"TU CUELLO DE BOTELLA"**: tarjeta `--resalte` con borde 3px
  `--lumi-linea` y radio 28. "Si aprendes X e Y, desbloqueas el Z% de las
  ofertas", las dos barras Hoy / Después, y el salto de ofertas y de sueldo
  típico.
- **"Lo que piden vs. lo que tienes"**: una fila por habilidad del rol, con su
  % de ofertas y el chip Lo tienes / Te falta.
- **Globo de Lumi** (`piensa`, 104px) con el consejo que nombra la habilidad
  que más frena y las horas que cuesta.
- **"¿QUÉ HAGO AHORA?"**: los tres botones de acción, **sin texto libre**:
  optimizar los bullets del CV para esas N ofertas · ver los recursos más
  rápidos para subir a Z% · ver las ofertas donde ya calzas. Cada uno con su
  etiqueta "Pro" en plan gratis.
- **"Ofertas donde ya calzas"**: el top 3, con `filter: blur(7px)` y
  `pointer-events: none` en plan gratis, y el botón "Ver mis N ofertas · Pro
  estudiante" encima.
- "Rehacer diagnóstico" arriba a la derecha: consume el cupo del mes, y en
  gratis con el cupo gastado abre el paywall.

### 9.4 Resultado del chat con CTAs · `/chat/:id` (variante A, acciones en línea)

Se conserva todo el turno actual: la burbuja de la pregunta, la respuesta del
analista, el globo de Lumi, la cuadrícula `Puntos` y "De dónde sale este
dato". Se agrega:

- En cada fila de habilidades, el **chip de estado del usuario** (Lo tienes /
  Te falta) y el enlace "Ver qué piden exactamente →".
- Al tocar la fila se despliega **debajo** un panel (`--bg-elevated`, radio
  16) con: "En N de T ofertas. &lt;resumen&gt;", 2 o 3 **fragmentos literales**
  de avisos («…» + Empresa · Portal), y dos botones: `Generar ruta para X`
  (o `Destacarlo en mi CV` si ya la tiene) y `Ver ofertas que lo piden`.
- Debajo del turno, **"SIGUIENTE PASO SUGERIDO"** con los tres botones de
  acción.

**Los fragmentos no siempre tienen un aviso cargado detrás.** En el prototipo
la evidencia de Cloud cita a "Seguros Costa", que no está en `OFERTAS`: la
evidencia es del mercado, no solo de los avisos de la lista. Eso es más
honesto y se conserva, pero obliga a una regla: **los fragmentos son texto, no
enlaces.** El que lleva a alguna parte es `Ver ofertas que lo piden`, que
filtra la lista por la skill. Así la evidencia no se recorta y el
anti-objetivo de "ningún botón sin destino" se cumple igual.

**Roles sin avisos cargados.** El chat responde para los 35 roles del
catálogo y la evidencia existe para cuatro. En los otros 31, la fila no lleva
chip ni panel y la pantalla queda como hoy (§7.12). Y sin diagnóstico hecho,
donde iría el chip va "Haz tu diagnóstico para ver qué te falta →".

**`api/chat.js`** pasa a incluir en el paso de redactar los fragmentos
`contexto_uso` y los conteos de los requisitos del rol, para que la respuesta
hable de lo que los avisos dicen y no de teoría general. Las reglas que ya
existen no se tocan: el paso de enrutar sigue sin ver cifras, y el modelo
sigue sin poder usar un número que no esté en los datos que recibe.

### 9.5 Matchmaker · `/ofertas` (variante A, tarjetas)

Título "No leas 30 avisos. Empieza por los que te faltan menos." y segmented
**Menor brecha / Más recientes**. Orden por defecto: obligatorias que faltan ↑,
luego deseables que faltan ↑, luego fecha.

Cada tarjeta: empresa · portal · antigüedad; el puesto en display 20px; chips
de ciudad, modalidad y sueldo; chips de obligatorias (✓ sobre `--resalte`, ✗
sobre `--alerta-bg`/`--alerta-fg`); y "Te falta: …". A la derecha, el match en
40px/800, "3 de 4 obligatorias", la barra y "deseables x/y".

Color del match: 100% → `--resalte`; ≥75% → `--bg-elevated`/`--accent`; menos
→ `--alerta-bg`/`--alerta-fg`.

En plan gratis la lista va con `filter: blur(7px)` y `pointer-events: none`, y
encima una tarjeta `--bg-noche`: "Ya calzas con N ofertas. Te muestro cuáles."
con el botón lima "Desbloquear · S/ 19/mes".

**El número que promete la tarjeta y el que entrega la lista no son el mismo,
y hay que decirlo.** N es una cifra de mercado (de 695 ofertas activas cumples
todas las obligatorias en 216); la lista muestra los avisos que están
cargados. La pantalla desbloqueada encabeza con eso en claro — "Te mostramos
los 8 avisos que tenemos cargados de esas 216" — porque un tester que paga
esperando 216 y recibe 8 deja de evaluar el producto y empieza a evaluar si
la app está terminada.

### 9.6 Detalle de oferta · `/ofertas/:id` (variante A, dos columnas)

Izquierda, **"LO QUE DICE EL AVISO"**: por requisito, el nombre, el chip
"Obligatorio/Deseable · nivel" y el fragmento literal entre comillas
angulares.

Derecha, pegada al scroll: el match a 56px, "x de y obligatorias. Te falta:
…", la barra, y las listas de OBLIGATORIAS y DESEABLES con su estado. Debajo:
`Adaptar mi CV a esta oferta` (acento), `Cubrir X: ver ruta` (línea, solo si
falta algo) y "Postular en &lt;portal&gt; ↗".

### 9.7 Ruta de aprendizaje · `/ruta` (variante A, por semanas)

Las skills que faltan, ordenadas por el greedy de ofertas desbloqueadas. Chip
"Solo gratis" para filtrar. Columna izquierda de 120px con "Semanas 1–3 / n h"
(a 6 h por semana, de `tiempo_disponible_semanal`), y a la derecha una tarjeta
por skill con "+N ofertas · llegas a Z%", el porqué, y sus recursos.

Cada recurso: tipo (Curso / Video / Libro / Proyecto), plataforma, horas,
rating y precio ("Gratis" o "S/ n"). Los recomendados — los más rápidos
gratis más un proyecto — resaltados con `--bg-elevated`.

Mismo tratamiento de plan gratis: desenfoque y tarjeta noche encima.

### 9.8 Adaptador de CV · `/cv` y `/cv?oferta=:id` (variante A, pestañas)

Subtítulo: "No inventamos experiencia: si algo no está en tu CV, te avisamos."

Dos pestañas:

- **Antes y después por bullet**: una tarjeta por bullet, con "Antes" en
  `--text-secondary` y "Después" con las palabras clave resaltadas sobre
  `--resalte`. Debajo, la nota de origen («revisión de código» aparece en 97
  ofertas) y el botón "Aceptar cambio". Las advertencias van en
  `--alerta-fg` y con peso 600.
- **CV completo**: la hoja con el CV reescrito, por secciones.

Botones "Descargar PDF" y "Copiar texto".

**La regla dura:** si la skill no está en el CV (p. ej. APIs REST), **no se
agrega**; se muestra el aviso de que se sumará cuando termine el proyecto de
su ruta. Si se infiere un uso (Python en una experiencia), se pide
confirmación explícita.

### 9.9 Paywall · reemplaza a `ModalPlanes` (variante A, comparativa)

Se abre desde cualquier acción Pro en plan gratis y **guarda el destino**.

"Gratis te dice qué. Pro te dice cómo." Dos columnas:

| Gratis · S/ 0 | Pro estudiante · S/ 19/mes (borde 2px `--accent`) |
|---|---|
| Explorador de tendencias por carrera y rol | Ofertas ordenadas por tu probabilidad de éxito, con enlace para postular |
| 1 diagnóstico de perfil al mes | Adaptador de CV con las frases exactas de los avisos |
| Tu % de compatibilidad y las skills que te faltan | Ruta de aprendizaje con recursos gratis y baratos |
| 3 consultas a Lumi al mes | Consultas a Lumi ilimitadas |

Pie: "Sin permanencia · cancela cuando quieras · Tarjeta, Yape, Plin o
PagoEfectivo".

**"Activar Pro estudiante" abre el checkout simulado** (decisión del usuario,
§6.4). Al confirmar el pago, la app lleva al destino guardado y muestra el
toast lima con Lumi `celebra`: "¡Pro estudiante activado!".

### 9.10 Dos planes en toda la app

| Dónde | Qué cambia |
|---|---|
| `contenido.js` | `PLANES` queda en Gratis y Pro estudiante; `PACKS` desaparece y lo reemplaza un único plan de S/ 19 |
| `landing/Secciones.jsx` | la sección de planes muestra los dos planes nuevos, con el beneficio del motor de decisión y no "3 consultas / todas las regiones" |
| `Landing.jsx` (hero) | el titular deja de ser "Descubre qué pide el mercado para tu carrera antes de graduarte" y pasa a prometer el motor de decisión: con cuántas ofertas calzas hoy y qué te falta para las demás |
| `contenido.js` (`FEATURES`) | las tres funciones dejan de ser Habilidades / Salarios / Comparar y pasan a ser el recorrido real: tu diagnóstico, las ofertas donde ya calzas, tu ruta y tu CV |
| `store.js` | `plan: 'free' \| 'pro' \| 'institucional'`; fuera `'creditos'` y `creditos`; `confirmarPago` cobra S/ 19 y deja `plan: 'pro'`; `version: 3` con migración de `'creditos'` → `'free'` |
| `Planes.jsx`, `Checkout.jsx`, `Confirmacion.jsx`, `Cuenta.jsx` | hablan de la suscripción, no de créditos |
| `AppShell` (medidor) | en gratis, consultas restantes **y** si queda el diagnóstico del mes; en Pro, "∞ · Todo desbloqueado" |
| `MenuPerfil.jsx` | fuera la fila de créditos |

---

## 10. Datos y cálculos

### 10.1 Forma de los datos

`src/data/mercado.js`, nuevo, con la forma que tendrá el scraper:

| Entidad | Campos | Dónde se usa |
|---|---|---|
| `ofertas` | `id, rol, empresa, puesto, ciudad, modalidad, sueldo, portal, url, fecha` | matchmaker, detalle, "Postular ↗" |
| `requisitos` | `ofertaId, skill, tipo` (`Obligatorio`/`Deseable`), `nivel`, `contextoUso` | match %, fragmentos «…», CV |
| `recursos` | `skill, tipo, plataforma, precio, horas, rating, url, recomendado` | ruta |
| `perfiles` | la tabla de alcance por rol: `skills[] → { ofertas, sueldo }` | el cálculo del % |
| `evidencia` | por rol y skill: `conteo, resumen, fragmentos[] { empresa, portal, frase }` | el panel del chat (§9.4) |
| `porque` | por rol y skill: por qué conviene aprenderla ahora | las tarjetas de la ruta (§9.7) |
| `bullets` | `id, rol, seccion, antes, despues, clavesResaltadas, skillsQueAporta, skillsQueFaltan` | adaptador de CV |

`evidencia` y `porque` son `EVID` y `PORQUE` del prototipo. Están en la tabla
porque §9.4 y §9.7 las dibujan y la primera versión de esta lista no las
pedía: son dos datasets más, también × 4 roles.

**Cobertura:** cuatro roles (`desarrollador-backend-jr`,
`desarrollador-frontend-jr`, `analista-qa`, `analista-datos-jr`), unos 8 avisos
cada uno, cada aviso con sus 4–6 requisitos y la frase literal de cada uno.
Son ~32 avisos y ~160 frases de texto ficticio: es el activo más caro del
trabajo y el que sostiene todas las pantallas Pro.

**La tabla `perfiles` son ~8 filas escritas a mano por rol, no algo que se
genere.** Así está en el prototipo, y sus ocho filas suman 695: el total de
Lima + Arequipa, que es el mercado de referencia de Backend. De ahí sale la
restricción que hay que respetar al escribir las otras tres: **las filas de
cada rol suman el total de ofertas de las ciudades de ese rol** — Frontend
532, QA 313, Analista de Datos 847. Ese total es la `base` del cálculo (§10.2)
y deja de ir escrito a mano como el `695` del prototipo. Sin esto, el
porcentaje de un rol se mide contra el mercado de otro.

**Los bullets del CV se escriben para los cuatro roles** (§6.11). Los cinco
del prototipo hablan de Java, MySQL y Git, y eso solo le sirve a quien apunta
a Backend: §7.13 resolvió que las *advertencias* se deriven de `perfil.skills`
y eso sigue en pie, pero el *contenido* no se adapta, y un tester de QA
abriría la pantalla cuyo argumento de venta es la honestidad para leer
reescrituras sobre microservicios en Java. Son ~5 por rol, ~20 en total, y los
cinco del prototipo son los de Backend.

**Lo que se escribe cuatro veces es el "después", no el "antes".** La persona
demo es una sola (§7.13): sus proyectos y su práctica en la municipalidad son
los mismos apunte a donde apunte. Lo que cambia con el rol es la reescritura,
porque las palabras que se resaltan salen de los `requisitos` del rol
objetivo: el mismo proyecto de inventario se cuenta con casos de prueba y
evidencias para QA, y con modelo relacional y consultas para Backend. Así el
trabajo real son ~5 "antes" y ~20 "después".

La tabla se queda **plana: una fila por rol y bullet**, con el `antes`
repetido en las cuatro. Es duplicación deliberada y no es la que §7.1 prohíbe
—ahí el riesgo era que dos pantallas dijeran cifras distintas del mismo rol—:
aquí son textos de pantallas que nunca se ven juntas, y una tabla con join
para ahorrar cuatro frases no se paga.

**Los bullets no llevan `nota` fija.** Llevan qué skills aporta el bullet
reescrito y cuáles se le pidieron y no están en el CV; la nota y la advertencia
se redactan en pantalla contra `perfil.skills` (§7.13). Así la regla de
honestidad sigue siendo verdad cuando el tester edita sus skills.

**Los nombres de skill tienen dos niveles y no se pueden aplanar.** La capa de
display usa las claves que ya trae `catalogo.json`, compuestas incluidas
(`Java o Node.js`, `APIs REST`, `Cloud (AWS/Azure)`…), para que una habilidad
sea la misma cosa en el chat y en el diagnóstico. La capa de datos —`perfiles`
y `requisitos`— usa skills **atómicas** (`Java`, `Node.js`, `Python`), porque
ningún aviso pide literalmente "Java o Node.js". El puente es el que el
prototipo ya trae: la fila de display declara qué atómicas la satisfacen
(`Java o Node.js` se satisface con `Java` o con `Node.js`) y "la tienes" es
tener **alguna**. Si se usan las claves del catálogo en la capa de datos, el
match se rompe en silencio: ninguna oferta calza con nadie. `check-mercado.mjs`
verifica que cada compuesta se resuelva a atómicas que existen.

### 10.2 Los cálculos

Van a `src/lib/mercado.js`, probados con `node:assert` igual que
`habilidades.js`:

- **`% calzas`** = ofertas donde el usuario cumple **todas** las obligatorias ÷
  ofertas activas del rol en las ciudades elegidas. Quien lo produce es la
  tabla `perfiles`, no los avisos: 32 avisos están muy por debajo de
  `MIN_MUESTRA` y no pueden sostener un porcentaje. La tabla suma las filas
  cuyo conjunto de skills es subconjunto de las del usuario, sobre el mercado
  de referencia del rol. **El orden de las operaciones importa** y es el de
  §7.10: `n` = suma de las filas alcanzables, `T` = ofertas de las ciudades
  elegidas, `N = round(n·T/base)` con `base` = la suma de la tabla del rol, y
  recién entonces `pct = round(N/T·100)`. Derivar `pct` de `n/base` en vez de
  `N/T` deja la cifra grande y el "N de T" de la misma tarjeta descuadrados en
  un punto el 5% de las veces.
- **`Match %` de una oferta** = obligatorias que tiene ÷ obligatorias totales.
  Las deseables se cuentan y se muestran aparte, nunca dentro del porcentaje.
- **Cuello de botella** = greedy: en cada paso, la skill que más ofertas
  desbloquea. **Si ninguna desbloquea nada por sí sola, se evalúa el mejor
  par** — sin eso, una skill que solo sirve acompañada se queda fuera de la
  ruta para siempre.
- **Sueldo típico** = promedio ponderado del sueldo de las ofertas
  alcanzables, redondeado a S/ 50.
- **Java y Node.js son excluyentes** como candidatas: a quien ya sabe Java no
  se le recomienda Node.js para las mismas ofertas.
- **`MIN_MUESTRA` (30) se mantiene**, aplicado al universo de ofertas de las
  ciudades elegidas. El numerador pequeño se muestra; el 0% tiene su propio
  diseño (§7.14).

### 10.3 Estado (Zustand)

Se agrega al store, persistido como hoy:

```
perfil      { modoEntrada, cvParseado, skills[], carrera, universidad, ciclo,
              rolObjetivo, ciudades[], tiempoSemanal, presupuesto }
diagnostico { fecha, pctHoy, nHoy, total, camino[] }
plan        'free' | 'pro' | 'institucional'
diagnosticosMes            // límite de 1 en gratis
paywallDestino             // a dónde ir tras activar Pro
```

**Cinco de esos campos no existen hoy en ninguna parte** y §9.2 los pide "del
perfil del usuario": `universidad`, `tiempoSemanal` y `presupuesto` no están
en el store ni en las cuentas demo (la palabra "universidad" solo aparece en
copy de `Registro.jsx`, `MenuPerfil.jsx` y `tenant.js`), y `modoEntrada` y
`cvParseado` son nuevos. `carrera` y `ciclo` sí existen, con `CICLOS` en
`store.js:11`. Hay que sumarlos al estado inicial, a `registrar` y a las dos
cuentas demo, o el paso 1 arranca con campos vacíos que el tester lee como un
formulario a medio hacer.

---

## 11. Lo que queda a criterio del constructor

- Cómo partir las pantallas en componentes: un archivo por pantalla en
  `src/pages/` es suficiente, con los trozos compartidos (chip de estado,
  barra de match, tarjeta de bloqueo Pro) en `src/components/`.
- Qué animaciones de las cuatro ya definidas aplicar a cada bloque.
- El texto exacto de los avisos de validación.
- Cómo se ordenan los `useEffect` y la navegación interna del stepper.

No queda ningún punto abierto: la revisión del constructor se resolvió
completa en §13, y la segunda revisión en §14, con su única decisión cerrada
en §6.11.

---

## 12. Verificación

- `npm run verify` **en verde**, incluidas las dos pruebas que hoy fallan. El
  script nuevo **se agrega a la cadena de `verify` en `package.json`**, que
  está escrita a mano: si no se suma ahí, no corre nunca.
- Un script nuevo `check-mercado.mjs` cubre los cálculos: que el % calzas
  cuente solo obligatorias completas, que el match no mezcle deseables, que el
  greedy encuentre el par cuando ninguna skill sirve sola, que el sueldo
  redondee a S/ 50, que por debajo de `MIN_MUESTRA` no salga cifra, que las
  filas de `perfiles` de cada rol sumen el total de ofertas de sus ciudades,
  que cada skill compuesta se resuelva a atómicas que existen, que los nombres
  de la capa de display existan en `catalogo.json`, que cada aviso tenga al
  menos una obligatoria y frase literal en todos sus requisitos, y que **los
  cuatro roles tengan las seis estructuras completas** — avisos, perfiles,
  recursos, evidencia, porqués y bullets de CV. Esa última es la que atrapa el
  olvido más probable: escribir los avisos de los cuatro y dejar un rol sin
  bullets, que deja una pantalla Pro vacía para un rol que el paso 2 ofrece.
- **`pct === round(N/T·100)` se verifica por fuerza bruta**, nunca con un caso
  de ejemplo: todas las combinaciones de skills × todas las de ciudad. Son
  15 360 casos y corren en menos de un segundo. Con la fórmula de §7.10 pasan
  los 15 360; con la del prototipo fallan 800, de modo que un caso de ejemplo
  habría pasado y la prueba no habría servido de nada.
- **Cambiar de ciudad mueve N y T y deja el porcentaje a un punto del de
  referencia**, no clavado: es la consecuencia de derivar `pct` de N/T
  (§7.10). La prueba afirma eso —el desvío de cada combinación respecto del %
  sin ciudades no pasa de UN punto— y no la igualdad. Medido: en los cuatro
  roles y las 15 combinaciones de ciudad, el desvío nunca llega a dos. Como
  una combinación puede ir un punto arriba y otra un punto abajo, dos de ellas
  sí pueden diferir en dos; el mercado más chico de los chips (Trujillo en QA,
  35 ofertas) es donde pasa.
- `npm run lint` sin avisos nuevos.
- `npm run build` pasa.
- En navegador, los dos temas, el recorrido completo de un tester:
  landing → login → diagnóstico (3 pasos) → reporte → tocar una acción Pro →
  paywall → checkout → confirmación → ofertas → detalle → ruta → CV → chat,
  sin un solo botón que no lleve a ninguna parte y sin errores en consola.
- El límite de 1 diagnóstico al mes en gratis se verifica a mano: el segundo
  intento abre el paywall, no una pantalla rota.
- Un tester que ya había entrado con `plan: 'creditos'` guardado en su
  navegador abre la app y aterriza en plan gratis con su historial intacto.

---

## 13. Revisión del constructor y resolución (2026-10-23)

Un ingeniero sin acceso a la conversación leyó este documento, el handoff y el
código, y devolvió ocho preguntas. Ninguna era un detalle de redacción. Esto
es lo que pasó con cada una.

### 13.1 Lo que decidió el usuario

| # | Pregunta | Decisión |
|---|---|---|
| 6 | El paywall promete ~216 ofertas y detrás hay 6 | Se escriben ~8 avisos por rol para cuatro roles (~32), y la pantalla desbloqueada dice en claro cuántos de esos 216 están cargados (§6.8, §9.5) |
| 7 | ¿La landing cambia su promesa o solo sus precios? | Se reescribe el titular y las tres funciones al motor de decisión (§6.9, §9.10) |
| 8 | ¿Alguna cuenta demo arranca en Pro? | No: las dos en gratis, para que nadie se salte la pasarela que se está midiendo (§6.10) |

### 13.2 Lo que resolvió el diseñador de este documento

| # | Pregunta | Resolución |
|---|---|---|
| 1 | ¿Qué dataset produce el % y se mueve con las ciudades? | La tabla `perfiles`; el % no se mueve y es correcto que no se mueva, porque `pct === N/T` siempre (§7.10, §10.2). **Corregido en §14.2 punto 1:** con la fórmula del prototipo esa igualdad era falsa, y §7.10 ahora deriva `pct` de N/T para que sea verdad |
| 4 | ¿`n` o `ofertas` es "ofertas activas"? | `ofertas` es el universo en todas las pantallas; `n` queda para sueldos y `MIN_MUESTRA` (§7.11) |
| 2 | El chat responde para 35 roles y la evidencia cubre 4 | El chip y el panel se dibujan solo donde hay evidencia; sin diagnóstico, una invitación a hacerlo (§7.12, §9.4) |
| 3 | El CV muestra la historia de una persona inventada | La persona demo *es* el avatar del tester y se alinea con la del CV; y los avisos se derivan de `perfil.skills` en vez de ser texto fijo, que era lo único que rompía de verdad la regla de honestidad (§7.13, §10.1) |
| 5 | ¿Qué gatea `MIN_MUESTRA` y qué se ve cuando muerde? | Gatea el denominador; el numerador pequeño se muestra, y el 0% recibe su propio diseño (§7.14) |

El revisor también señaló que Cusco queda fuera de los chips de ciudad sin
explicación: ahora está explicada (§7.15).

### 13.3 Lo que el usuario debería mirar al leer

Las quince decisiones de §7 son mías, no suyas. Las que más cambian lo que
verá el tester son la §7.10 (el porcentaje casi no se mueve al cambiar de
ciudad: ver §14.4, que explica por qué ahora puede moverse un punto), la §7.12
(el chat nuevo solo se activa en cuatro de los 35 roles) y la §7.13 (el CV
adaptado es el de la persona demo).

La pregunta que §14.3 le hizo —si los bullets del CV se escriben para los
cuatro roles o el adaptador se ofrece solo en Backend— quedó contestada: los
cuatro (§6.11).

---

## 14. Segunda revisión: el plan contra el handoff y el repo (2026-10-26)

§13 revisó el documento. Esta revisión lo contrasta con sus **dos fuentes**: el
handoff (`design_handoff_motor_decision/`, incluida la clase del prototipo con
sus datos mock y su lógica) y el repo tal como está hoy. Se comprobaron una por
una las afirmaciones de §5 y §7, y se ejecutó el algoritmo del prototipo por
fuerza bruta.

### 14.1 Lo que quedó confirmado

Todo §5 es exacto: el stack, los seis scripts de `verify`, las dos pruebas
rojas (los mismos seis archivos con hex, los mismos valores, Diego 25 ≠ 21),
las cifras que el catálogo ya trae, los cuatro roles de sistemas, Cusco sin
mediana, los once tokens que §9 nombra, las cuatro animaciones con sus clases
en `global.css`, el bloque `@media print` y la tarjeta de carga de `Chat.jsx`.
`npm run lint` y `npm run build` pasan.

También quedó confirmado que el plan es fiel al handoff en diseño —variante A,
tokens, copy y medidas— y que donde se separa lo hace a propósito y lo dice:
§6.4 (la pasarela en vez del `plan: 'pro'` directo del prototipo), §6.8, §6.9,
§6.10, §7.8 y §7.11.

### 14.2 Las diez correcciones

| # | Hueco | Dónde se arregló |
|---|---|---|
| 1 | La invariante `pct === round(N/T·100)` era **falsa**: 800 fallos de 15 360 por doble redondeo | §7.10 (fórmula nueva), §10.2, §12 |
| 2 | El `695` estaba fijo y `perfiles` sin dimensionar; son ~8 filas a mano y suman el mercado **de su rol** (695 / 532 / 313 / 847) | §10.1, §10.2, §12 |
| 3 | Los nombres de skill tienen **dos niveles** (compuesta en display, atómicas en datos) y §10.1 los aplanaba: el match se rompía en silencio | §10.1, §12 |
| 4 | `EVID` y `PORQUE` las dibujan §9.4 y §9.7, y la tabla de datos no las pedía | §10.1 |
| 5 | Los conteos de evidencia del chat **cambian de valor** respecto del prototipo (276 → 612) y no se decía | §7.11 |
| 6 | Los bullets del CV son de Backend: un tester de QA lee reescrituras sobre Java | §10.1 · decidido por el usuario en §6.11 (ver §14.3) |
| 7 | Un fragmento de evidencia cita una empresa que no está en `ofertas`: no puede ser un enlace | §9.4 |
| 8 | `analista-qa` solo declara mediana en Lima: el reporte hablaría de sueldo donde el chat se calla | §7.15 |
| 9 | `check-mercado.mjs` no entraba en la cadena de `verify`, escrita a mano en `package.json` | §12 |
| 10 | Cinco campos del perfil no existen, y el destino tras el login está escrito a mano en cuatro sitios, los cuatro al chat | §10.3, §9.1 |

### 14.3 La decisión que esto abrió, y cómo quedó

Nueve de las diez correcciones no cambiaron el alcance: arreglan una fórmula,
nombran dos datasets que de todos modos había que escribir, y listan lo que
falta en el store y en el ruteo. **La 6 sí lo cambiaba**, así que se preguntó
en vez de decidirse aquí.

**Resuelta el 2026-10-26: los bullets del CV se escriben para los cuatro
roles** (§6.11, §10.1). Son ~20 en vez de 5. El argumento es el que el usuario
ya había usado en §6.8 para los avisos —no todos los testers apuntan a
backend— y en esta pantalla pesa más, porque es la que vende la honestidad del
producto: mostrarle bullets de Java a quien apuntó a QA rompe justo el
anti-objetivo del CV que miente.

Consecuencia de alcance: las seis estructuras de datos del prototipo se
escriben para los cuatro roles, los bullets incluidos. Lo que de verdad se
cuadruplica es el "después" de cada bullet, no el "antes" (§10.1). No queda
ningún punto abierto.

### 14.4 Lo que cambia para el tester

De las diez, una sola se nota en pantalla: la **1**. El porcentaje ahora se
deriva de N y T, así que cada combinación de ciudad queda a un punto del de
referencia en vez de clavada, y dos combinaciones pueden diferir en dos. Se cambió a propósito: el tester tiene la cifra grande y el
"en N de T ofertas" en la misma tarjeta (§9.3), donde que no cuadren se ve de
un vistazo, mientras que un punto de diferencia entre Lima y Lima + Arequipa
no lo ve nunca.
