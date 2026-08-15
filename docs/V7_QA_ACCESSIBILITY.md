# QA y accesibilidad (Fase 7J)

**Estado:** octava fase de V7 con trabajo real. Cierra el punto que
`docs/V7_PRODUCT_AUDIT.md` (7A, §12) definió para esta fase: cobertura de
accesibilidad al 100%, verificación de objetivo táctil en toda la app, y
decisión sobre framework de testing (§7.5) — todo previo al QA en
dispositivo real y la Release Candidate de 7K. No toca `android.package`,
`ios.bundleIdentifier`, `versionCode` ni configuración EAS.

A diferencia de fases anteriores, **7J no agregó una sola pantalla ni
función nueva** — es una auditoría con evidencia, no una construcción.
Donde encontró algo mal, lo corrigió; donde no, lo documenta con el
método usado para poder confiar en el resultado.

---

## 1. Cobertura de `accessibilityLabel`/`accessibilityRole`

7A midió 59% (69 de 117 elementos `Pressable`) sobre el código de
entonces. Desde 7C, la Regla UX transversal #2
(`docs/V7_UX_ARCHITECTURE.md` §13.2) exige `accessibilityLabel`/
`accessibilityRole` en todo control nuevo o reestructurado — así que la
pregunta real de 7J no era "cuánto falta" sino "¿el hábito se sostuvo en
7C–7I, o quedó deuda nueva sin detectar?".

**Método** (reproducible, no una revisión visual): para cada archivo
`.tsx` de `src/`, se localizó cada apertura `<Pressable` y se analizó el
bloque de props hasta el cierre del tag (`>`), buscando
`accessibilityLabel` y `accessibilityRole` dentro de ese bloque. Un
`Pressable` con `accessible={false}` se excluye a propósito: es la
técnica correcta para ocultar del lector de pantalla un elemento
duplicado (ver hallazgo below).

**Resultado: 0 de 51 elementos `Pressable` sin cobertura.** Todos los
`TouchableOpacity`/`TouchableHighlight` del código viejo ya habían sido
migrados a `Pressable` antes de esta fase (cero ocurrencias). Los
"huecos" de conteo que aparecieron en una primera pasada por archivo
(comparar cantidad de `<Pressable` contra cantidad de
`accessibilityLabel` en el mismo archivo) resultaron ser falsos
positivos, verificados uno por uno:

- `BodySilhouette.tsx`: cada parte del cuerpo tiene dos regiones táctiles
  espejadas (brazo/mano/pierna/pie izquierdo y derecho, que son la misma
  `region` en el modelo de datos). La copia espejada usa
  `accessible={false}` + `importantForAccessibility="no"` a propósito,
  para que TalkBack no anuncie "Brazo" dos veces al recorrer la pantalla
  — es la técnica correcta, no una etiqueta faltante.
- `AacManagerScreen.tsx`, `RoutineManagerScreen.tsx`,
  `ProfileFormScreen.tsx`: el conteo por archivo salía bajo porque varios
  controles comparten un único componente local (`IconButton`) que
  parametriza `accessibilityLabel` — un `Pressable` en el código fuente,
  N controles reales en pantalla, todos cubiertos.

Los componentes base que más se reusan ya fuerzan esto por tipos, no por
disciplina: `BigButton` construye `accessibilityRole="button"` +
`accessibilityLabel={label}` siempre, y `EntityGridCard` declara
`accessibilityLabel` como prop **obligatoria** (no opcional) — un
`EntityGridCard` sin etiqueta no compila.

**Conclusión: el hallazgo §6.5 de 7A está cerrado.** No fue necesario
tocar código de accesibilidad en esta fase porque el hábito instalado
desde 7C ya lo había resuelto de forma incremental.

---

## 2. Objetivo táctil ≥48dp

7A encontró una sola violación (`AacManagerScreen` `iconButton` en
40×40), corregida en 7C junto con otras 12 instancias de la misma clase
de problema en todo el código.

**Método:** búsqueda de toda declaración `width`/`height` numérica fija
en archivos `.tsx` de `src/`, filtrando cualquier valor menor a 48 (con y
sin nombre de estilo sugerente de botón/ícono/control, para no dar por
buena ninguna exclusión). Complementado con revisión manual de los
componentes con tamaños táctiles no triviales (`PinPad`, `ChoiceGame`,
`MemoryScreen`, `SequenceScreen`, `GameFrame`).

**Resultado: 0 declaraciones de ancho/alto fijo por debajo de 48dp en
todo `src/`.** Los tamaños táctiles "grandes" del código (fichas de 130,
cartas de 92, teclas de PIN de 72) están todos por encima del piso;
`touchTargets.minimum` (o su alias `minTouchTarget`) se referencia en 17
archivos para los controles pequeños (íconos, chips, botones
secundarios).

**Conclusión: el hallazgo §6.4 de 7A sigue cerrado**, y la Regla UX
transversal #1 (48dp sin excepción desde 7C) se sostuvo en 7D–7I sin
regresiones.

---

## 3. QA en dispositivo real (teléfono + tablet)

**Esto es lo único de 7J que este entorno no puede ejecutar por sí
mismo** — no hay ningún dispositivo Android físico ni emulador con
TalkBack disponible acá, igual que 7F/7G/7H/7I ya habían señalado cada
uno en su cierre.

Lo que sí se hizo fue preparar el terreno para que esa verificación, en
manos del usuario, sea concreta y no un "probar la app en general":

- `docs/QA_ANDROID_INTERNAL_TESTING.md` §18 (Rotación/orientación) ganó
  dos puntos específicos de tablet en vertical: que ninguna pantalla se
  vea cortada o con tarjetas deformadas, y que las grillas (`EntityGridCard`,
  tarjetas AAC vía `cardWidthForBoardSize`) aprovechen el ancho extra con
  más columnas en vez de espacio vacío o tarjetas estiradas — el
  comportamiento que §13.4 de la arquitectura V7 exige sin necesidad de
  abrir soporte landscape.
- `docs/QA_ANDROID_INTERNAL_TESTING.md` gana una **sección 23** nueva,
  dedicada a TalkBack: recorrer Mi Voz, gestión de tarjetas, Mi Día,
  Juegos y la barra de tabs con el lector de pantalla activado, sin mirar
  la pantalla, verificando que lo que se anuncia tiene sentido — que es
  precisamente lo que un análisis estático de código (§1 de este
  documento) no puede probar: una etiqueta puede estar presente en el
  código y sonar mal o en el orden equivocado al leerse en voz alta.

---

## 4. Framework de testing (§7.5 de 7A) — decisión explícita: no agregar

7A señaló que el proyecto no tiene ningún framework de testing instalado
(`jest`, `@testing-library/react-native`, etc.) y preguntó si hacía falta
uno para cumplir la Regla 5 ("ejecutar pruebas disponibles" en cada
fase). La respuesta, ya operativa desde 7C: **se interpretó "pruebas
disponibles" como `tsc --noEmit` + `eslint`**, ambas ejecutadas al cierre
de las 9 fases anteriores sin objeción. No apareció en ningún momento un
requisito explícito de tests automatizados por parte del usuario.

**Se decide no instalar un framework de testing en 7J**, por las mismas
razones que 7I usó para no formalizar interfaces de repositorio: no hay
ningún consumidor real todavía (ningún caso de regresión que un test
hubiera evitado, ninguna lógica lo bastante compleja como para que la
verificación manual de cada fase no alcance) y agregar `jest` +
`@testing-library/react-native` + mocks nativos (`expo-audio`,
`expo-file-system`, `expo-speech`, `@react-native-async-storage`) es una
dependencia nueva no trivial, con su propio tiempo de configuración, que
nadie pidió. Si en algún momento se decide que sí hace falta —
típicamente cuando aparece un bug de regresión que un test hubiera
evitado, o cuando el criterio de aceptación de V7 lo exige por escrito —
es una decisión para retomar entonces, no algo que conviene improvisar
acá.

---

## 5. Archivos modificados

**Ninguno de código** (`src/`) — la auditoría no encontró nada que
corregir.

**Documentación:**
- `docs/QA_ANDROID_INTERNAL_TESTING.md` (§18 ampliada con tablet, §23
  nueva de TalkBack/objetivo táctil).
- `docs/V7_QA_ACCESSIBILITY.md` (este documento).

---

## 6. Qué funciona

- Cobertura de `accessibilityLabel`/`accessibilityRole`: 100% de los
  elementos `Pressable` del código, verificado de forma reproducible
  (no una revisión visual puntual).
- Objetivo táctil ≥48dp: 100% de los controles, sin regresiones desde 7C.
- `npx tsc --noEmit` y `npx eslint .`: sin errores ni warnings (sin
  cambios de código, el resultado es el mismo que en el cierre de 7I).

## 7. Qué queda pendiente

- **La verificación en sí, con TalkBack y en una tablet Android real**
  — este entorno no tiene el hardware; el checklist (§23 y la ampliación
  de §18 de `docs/QA_ANDROID_INTERNAL_TESTING.md`) queda listo para que
  el usuario la ejecute.
- Framework de testing: decisión explícita de no instalar uno todavía
  (§4), no un olvido.
- Alto contraste (Accesibilidad, señalado desde 7H): sigue sin una
  paleta alternativa en el Design System.

---

## Cierre de Fase 7J

`npx tsc --noEmit` y `npx eslint .` sin errores. No se tocó
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS. Detenido aquí, a la espera de autorización para iniciar la Fase 7K
(Release Candidate) — que según el plan de 7A es la última fase de V7.
