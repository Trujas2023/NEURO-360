# Auditoría de producto — Sense & Play Adventures 360 V7 (Fase 7A)

**Estado:** solo lectura. Este documento no modifica código, no renombra ni
elimina nada, no toca `android.package`, `ios.bundleIdentifier`,
`versionCode`, configuración EAS ni credenciales. Es el entregable único de
la Fase 7A ("RECONSTRUCCIÓN PROFESIONAL V7").

**Rama auditada:** `claude/mi-voz-aac-pro-fase-2-cure6m` (working tree
limpio, `HEAD` = `a3bc728` — "feat(aac): grabación de voz personalizada por
tarjeta").

**Método:** inspección directa de los 34 archivos de pantalla, los 4
navegadores, la capa de almacenamiento completa, el sistema de theming, los
componentes compartidos, `app.json`, y búsquedas dirigidas (`grep`) por
patrones de riesgo: `TODO`/`FIXME`/"próximamente", `onPress` vacíos,
`console.*` residual, cobertura de `accessibilityLabel`, uso de
`Dimensions`/tablet, `FlatList`, animaciones y `reduceMotion`, i18n,
estadísticas/respaldo. No se ejecutó la app en un dispositivo o emulador
real (el entorno no tiene uno disponible); las observaciones de
comportamiento en tiempo de ejecución están marcadas explícitamente como
inferidas del código, no verificadas visualmente.

---

## 1. Diagnóstico técnico

**El proyecto no es un prototipo.** A diferencia de lo que el brief V7
advierte evitar ("apariencia de prototipo, dashboard web o conjunto de
tarjetas genéricas"), el código real que hay detrás de cada pantalla es
sólido: TypeScript estricto sin `any` sueltos, cero `console.*` residual,
cero `onPress` vacíos, cero pantallas con datos inventados o simulados. Las
seis fases de "V2" (Fases 1–6, más el trabajo de grabación de voz) ya
construyeron los cuatro sistemas que pide V7 — Mi Voz, Mundo Sensorial,
Calma 360 y Modo Adulto existen y funcionan de verdad, no son fachada. El
`docs/V2_ARCHITECTURE_AUDIT.md` (Fase 0 de V2) describía Mundo Sensorial y
Juega & Regula como "NO EXISTE"; hoy ambos están completos y ese documento
está desactualizado en ese punto específico (ver §6.1).

Donde el proyecto sí se queda corto frente al techo que pide V7 no es en
"si funciona", sino en **tres ejes concretos**:

1. **Sistema visual explícitamente provisional.** `src/shared/theme/colors.ts`
   dice literalmente en su propio comentario: *"Paleta provisional de Fase
   1... El diseño definitivo se cierra en la Fase 10 (diseño definitivo)"*
   (`colors.ts:1-6`). No hay tipografía de marca (0 fuentes cargadas —
   `assets/fonts/` solo tiene `.gitkeep`), no hay iconografía propia (toda
   la app usa emoji del sistema operativo como único lenguaje visual — ver
   §6.3), y no hay ilustración ni branding en la pantalla de bienvenida
   (`WelcomeScreen.tsx`: un emoji 🌈 dentro de un círculo blanco). El
   resultado funciona, pero visualmente sí se lee como una app en
   construcción, no como un producto terminado.
2. **Centro Adulto disperso, no unificado.** `AdultHomeScreen.tsx` es una
   lista de perfiles con **7 botones por fila** (Tarjetas/Ajustes
   AAC/Mi Día/Sensorial/Juegos/Editar/Eliminar) que se envuelven en varias
   líneas (`flexWrap: 'wrap'`, `AdultHomeScreen.tsx:152-158`). No existe
   ninguna pantalla de Estadísticas, Accesibilidad ni Respaldo/Exportación
   (confirmado por búsqueda: cero resultados de
   `estadística|statistic|respaldo|backup|exportar` en todo `src/`, fuera
   de comentarios de tipos no relacionados). Esto es exactamente el gap que
   V7-D pide cerrar.
3. **Deuda de documentación y navegación huérfana**, pequeña pero real (ver
   §6.1 y §7).

**Identidad técnica (verificado, sin tocar):** `android.package` =
`com.senseplayadventures.app`, `ios.bundleIdentifier` = igual,
`android.versionCode` = `5`, `expo.version` = `0.1.0`, Expo SDK 57.0.11,
React Native 0.86.2, React 19.2.3, TypeScript 6.0.3 estricto. `npx tsc
--noEmit` y `npx eslint .` pasan sin errores ni warnings sobre el estado
actual del repositorio (verificado en esta auditoría, sin tocar código).

---

## 2. Inventario completo de pantallas

34 archivos de pantalla, agrupados por sistema. "Alcanzable" = tiene una
ruta de navegación real que un usuario puede tocar para llegar ahí (no solo
estar registrada en un stack).

| # | Pantalla | Sistema | Alcanzable | Modo |
|---|---|---|---|---|
| 1 | `WelcomeScreen` | Shell | Sí (arranque) | — |
| 2 | `ProfileSelectorScreen` | Perfiles | Sí | — |
| 3 | `ProfileFormScreen` | Perfiles | Sí | Adulto |
| 4 | `HomeScreen` | Shell | Sí (tab Inicio) | Niño |
| 5 | `ComingSoonScreen` | Shell | **No** (huérfana, ver §7.1) | — |
| 6 | `AacHomeScreen` | Mi Voz | Sí (tab Mi Voz) | Niño |
| 7 | `AacCategoryScreen` | Mi Voz | Sí | Niño |
| 8 | `AacManagerScreen` | Mi Voz | Sí | Adulto |
| 9 | `AacCardFormScreen` | Mi Voz | Sí | Adulto |
| 10 | `AacSettingsScreen` | Mi Voz | Sí | Adulto |
| 11 | `CalmCommunicationScreen` | Calma | Sí (tab Calma) | Niño |
| 12 | `PainFlowScreen` | Calma | Sí | Niño |
| 13 | `OverwhelmFlowScreen` | Calma | Sí | Niño |
| 14 | `SensoryHomeScreen` | Sensorial | Sí | Niño |
| 15 | `BubblesScreen` | Sensorial | Sí | Niño |
| 16 | `BreathingScreen` | Sensorial | Sí | Niño |
| 17 | `VisualTrackingScreen` | Sensorial | Sí | Niño |
| 18 | `SensoryPaintScreen` | Sensorial | Sí | Niño |
| 19 | `CauseEffectScreen` | Sensorial | Sí | Niño |
| 20 | `SensorySettingsScreen` | Sensorial | Sí | Adulto |
| 21 | `GamesHomeScreen` | Juegos | Sí | Niño |
| 22 | `ColorMatchScreen` | Juegos | Sí | Niño |
| 23 | `ShapeMatchScreen` | Juegos | Sí | Niño |
| 24 | `EmotionsScreen` | Juegos | Sí | Niño |
| 25 | `CategorySortScreen` | Juegos | Sí | Niño |
| 26 | `MemoryScreen` | Juegos | Sí | Niño |
| 27 | `SequenceScreen` | Juegos | Sí | Niño |
| 28 | `GamesSettingsScreen` | Juegos | Sí | Adulto |
| 29 | `MyDayScreen` | Mi Día | Sí (tab Mi Día) | Niño |
| 30 | `RoutineManagerScreen` | Mi Día | Sí | Adulto |
| 31 | `RoutineFormScreen` | Mi Día | Sí | Adulto |
| 32 | `HelpScreen` | Ayuda | Sí (1 toque global) | Niño |
| 33 | `PinGateScreen` | Modo Adulto | Sí | — |
| 34 | `AdultHomeScreen` | Modo Adulto | Sí | Adulto |

33/34 pantallas son alcanzables por un usuario real. Solo `ComingSoonScreen`
está registrada en `RootNavigator` sin que nada navegue a ella — es código
muerto, no una función a medio hacer (ver §7.1).

---

## 3. Inventario de funciones reales

Confirmado leyendo el código de cada pantalla/hook/repositorio (no solo el
nombre del archivo). "Real" = produce el resultado, persiste cuando
corresponde, maneja error y sobrevive reinicio — el criterio de "terminado"
de la Regla 6.

### A. Mi Voz (AAC)
Categorías (23, 3 virtuales), pictogramas (emoji + foto de cámara/galería),
TTS con velocidad/tono configurables, **grabación de voz familiar completa**
(permiso just-in-time, persistencia en `Paths.document`, reproducción con
prioridad sobre TTS, limpieza de archivos al editar/eliminar — ver
`docs/QA_ANDROID_INTERNAL_TESTING.md` §10), barra de frase (agregar/quitar
una/quitar última/limpiar/hablar), "Guardar frase" (persistida, reusable),
favoritos y "más usados" (`usageCount`/`lastUsedAt` reales), recientes,
buscador offline, personalización de cuadrícula (`boardSize`) y tamaño de
texto, 4 niveles de comunicación adaptativos (`LEVEL_1`..`LEVEL_4`, cada uno
con layout propio en `AacHomeScreen.tsx:46-154`), multi-perfil (cada perfil
tiene sus propias tarjetas, clave de storage por perfil), Modo Niño vs.
Adulto (crear/editar/eliminar tarjeta y grabación solo tras PIN).
**Comunicación rápida**: existe como `QuickCommunication` (Calma, Ayuda) y
como Nivel 1 de Mi Voz — cubierto, aunque repartido en dos sistemas en vez
de ser una función nombrada una sola vez.

### B. Mundo Sensorial
5 actividades reales con lógica propia (no las 6 originales del roadmap —
"Sonidos y ritmo" no se construyó, ver §4): Revienta burbujas (spawn por
intensidad, `Animated`), Respiración guiada (patrones 3-3-4/4-4-4/4-2-6,
animación de expansión/contracción), Seguimiento visual, Pintura sensorial
(`react-native-svg` + `PanResponder`, con modos trazo/partículas/glow/
formas), Causa-efecto. Entrada por necesidad ("¿Qué necesitas ahora?", no
por nombre de actividad). Ajustes de intensidad/velocidad por perfil,
persistidos. Todas respetan `reduceMotion`.

### C. Calma 360
15 frases de comunicación inmediata (`EMERGENCY_VOCABULARY`), 2 flujos
guiados reales con árbol de decisión: "Me duele" (silueta corporal → zona →
intensidad → cualidad → frase compuesta) y "Tengo miedo/Estoy saturado"
(disparador → necesidad → frase compuesta). Enlace directo a Mundo
Sensorial. **Falta el botón "Necesito un descanso" y sonidos relajantes**
explícitos que pide V7 (ver §4) — hay comunicación rápida y flujos guiados,
pero no un temporizador de descanso ni una biblioteca de sonidos
ambientales dentro de Calma (los sonidos ambientales quedaron pendientes
deliberadamente por licencias, según instrucción explícita del usuario en
la fase de voz).

### D. Juega & Regula
6 juegos completos con motor de rondas compartido (`ChoiceGame`,
`GameFrame`): colores, formas, emociones, clasificar por categoría, memoria
visual, secuencias. Feedback sin puntuación punitiva (`GameFeedback: 'good'
| 'retry'`, nunca "error" ni cuenta regresiva — decisión explícita en el
código, `GameFrame.tsx:8-13`), dificultad y duración de sesión
configurables por perfil, "Terminar" siempre visible.

### Mi Día (no es uno de los 4 sistemas V7 pero existe y es real)
10 rutinas predeterminadas, CRUD completo (crear/editar/duplicar/reordenar/
eliminar rutina y pasos), 3 modos de presentación (lista, Primero/Después,
Ahora/Después/Terminado), temporizador visual, refuerzo sonoro al
completar, foto y duración por paso.

### Modo Adulto (D, parcial — ver gaps en §4)
PIN de 4 dígitos (creación en 2 pasos con confirmación, barrera parental no
criptográfica, documentado así a propósito en `pinRepository.ts`), gestión
de perfiles (alta/edición/eliminación con confirmación, foto o color de
avatar), acceso a la administración de cada sistema (AAC, Mi Día,
Sensorial, Juegos) **por perfil**, cada uno con su propia pantalla de
ajustes.

### Transversal
Persistencia 100% local (`AsyncStorage`, sin red), limpieza en cascada al
eliminar un perfil (`profileDataRegistry.ts` — patrón registro/callback,
cada feature se desregistra sola sin acoplarse a `ProfilesContext`),
`reduceMotion` respetado en Sensorial y Mi Día, `soundEnabled` respetado en
todos los puntos que hablan, accesibilidad básica (`accessibilityRole`,
`accessibilityLabel`, `accessibilityHint`, `accessibilityLiveRegion`) en la
mayoría de controles interactivos (69 `accessibilityLabel` sobre 117
`Pressable` detectados — cobertura real, no completa, ver §6.4).

---

## 4. Funciones incompletas

Nada de lo siguiente es una pantalla vacía ni un botón muerto: son piezas
del alcance V7 que el código actual no cubre todavía, identificadas por
comparación directa contra la Regla 2 del brief.

1. **"Sonidos y ritmo"** (6ª actividad de Mundo Sensorial en el roadmap
   original) — no tiene pantalla ni ruta. `assets/sounds/` está vacío
   (solo `.gitkeep`); no hay ningún audio ambiental bundleado en el repo.
   Pendiente deliberadamente por licencias (instrucción explícita previa
   del usuario), no un olvido.
2. **"Acuario interactivo"** (pedido explícitamente en el brief V7-B) — no
   existe ninguna actividad con ese nombre ni ese concepto en
   `sensory-world`. Es una actividad nueva, no una variante de las 5
   existentes.
3. **Botón "Necesito un descanso" con temporizador dedicado** (V7-C) — hoy
   Calma tiene comunicación rápida y flujos guiados, pero no un botón con
   ese texto exacto ni una actividad de "descanso" con temporizador propio
   (el temporizador visual que sí existe es de `daily-routine`, para
   rutinas, no para pausas de regulación).
4. **Sonidos relajantes / estímulos visuales dedicados en Calma** (V7-C) —
   Mundo Sensorial cubre estímulos visuales (burbujas, seguimiento,
   pintura) pero Calma no tiene su propia sección de sonidos/estímulos
   independiente; hoy remite a Mundo Sensorial vía un botón.
5. **Estadísticas** (V7-D) — cero implementación. Ni pantalla, ni modelo de
   datos agregado, ni cálculo derivado (los únicos números que existen son
   `usageCount`/`lastUsedAt` por tarjeta AAC, sin ninguna vista que los
   agregue o presente).
6. **Accesibilidad como sección propia de Modo Adulto** (V7-D) — hoy
   `reduceMotion`/tamaño de texto/qué mostrar en tarjeta viven repartidos
   dentro de `AacSettingsScreen` y `ProfileFormScreen`; no hay una pantalla
   de "Accesibilidad" centralizada donde un adulto configure todo junto
   (contraste, tamaño global de texto/tarjetas, reducción de movimiento
   para toda la app en un solo lugar, no por módulo).
7. **Respaldo/exportación de configuración** (V7-D) — cero implementación;
   no hay forma de exportar o respaldar perfiles/tarjetas/rutinas fuera del
   dispositivo. Coherente con la política de privacidad "todo local, nada
   en la nube" ya aplicada en el resto de la app, pero un respaldo *local*
   (a un archivo, para reinstalar el teléfono) no existe.
8. **Centro Adulto unificado** (V7-D, arquitectura) — existe la
   funcionalidad de administración, pero repartida en `AdultHomeScreen`
   (lista de perfiles + 7 botones por fila) en vez de una landing con
   secciones navegables (Perfiles / AAC / Sensorial / Juegos / Mi Día /
   Sonido / Accesibilidad / Estadísticas / Respaldo), como pide
   explícitamente V7-D.
9. **Multi-idioma** — toda la app está en español, sin capa de i18n
   (`react-intl`/`i18next`/similar: cero referencias en `src/`). No es un
   requisito explícito de V7, pero es una limitación real si el alcance
   comercial lo necesita más adelante.

---

## 5. Botones/rutas sin funcionalidad

**Hallazgo principal: no hay ningún botón "decorativo" en la app.** Se
verificó con `grep` exhaustivo (`onPress={() => {}}`, `onPress={undefined}`,
`TODO`, `FIXME`, "próximamente", "no implementad*"): cero resultados fuera
de comentarios explicativos legítimos y el propio texto de
`ComingSoonScreen`. Cada `onPress` de la app dispara una acción real
(navegar, hablar, guardar, borrar, alternar un estado).

La única pieza de navegación sin función real es estructural, no un botón
individual:

- **`ComingSoon` route** (`RootNavigator.tsx:56`, tipo en
  `navigation/types.ts:7`): registrada en el stack raíz con un componente
  real (`ComingSoonScreen.tsx`) pero **ningún botón de la app navega a
  ella** (verificado con `grep` de todos los `navigate(...)` del código:
  cero ocurrencias de `'ComingSoon'`). Es un remanente de cuando Mundo
  Sensorial y Juega & Regula todavía no existían (`docs/
  V2_ARCHITECTURE_AUDIT.md §4.6-4.7`) y hoy ambos apuntan a sus pantallas
  reales. No es una función incompleta — es código huérfano que sobrevivió
  a la migración y debería eliminarse en 7D (no se propone reutilizar).

---

## 6. Problemas UX/UI

### 6.1 Documentación y comentarios desincronizados del código real
Varios comentarios en el código describen un estado que ya no es cierto,
señal de que la documentación no se actualizó al cerrar Fases 5-6:
- `HomeScreen.tsx:16-19`: *"Mundo Sensorial y Juega & Regula todavía no
  tienen módulo real... así que no se muestran como botones aquí"* — el
  código de abajo sí los muestra como botones reales
  (`HomeScreen.tsx:66-85`) y navegan a pantallas funcionales. Comentario
  obsoleto, no afecta comportamiento pero confunde a cualquiera que lea el
  archivo.
- `CalmCommunicationScreen.tsx:22-23`: *"ese módulo todavía es un stub —
  `ComingSoonScreen`"*, refiriéndose a Mundo Sensorial — falso hoy, el
  botón de la línea 46-50 navega a `SensoryHome`, una pantalla real.
- `AdultHomeScreen.tsx:12-14`: *"La Fase 8 amplía esta pantalla..."* — usa
  la numeración de fases del roadmap V1 (`docs/ROADMAP.md`), que ya no
  corresponde a las fases V2/V7 actuales.
- Estilo `comingSoonNote` definido en `HomeScreen.tsx:147-152` pero nunca
  usado en el JSX — CSS muerto, remanente del mismo cambio.

### 6.2 Paleta y tipografía explícitamente provisionales
Ya cubierto en §1 — se repite aquí porque es, con diferencia, el hallazgo
de mayor impacto visual: `colors.ts` se autodescribe como "provisional",
sin tipografía de marca ni iconografía propia. Cualquier trabajo de 7C
(Design System) debe partir de que **hoy no hay una decisión visual
definitiva que preservar**, solo tokens de trabajo.

### 6.3 Iconografía 100% emoji, sin librería de íconos
Cada acción de la app (Ayuda 🆘, Hablar 🔊, Grabar 🎙️, Sensorial 🌈,
Juegos 🎮, favoritos ⭐/☆, mover ↑/↓...) se representa con un emoji Unicode
del sistema, no con un ícono vectorial propio. Es funcional y accesible por
lectores de pantalla (llevan `accessibilityLabel` en la mayoría de casos),
pero el renderizado de emoji varía por fabricante de Android (Samsung,
Xiaomi, stock) y no transmite una identidad visual consistente —
exactamente el tipo de detalle que separa "se ve como una app terminada"
de "se ve como un prototipo", que el brief V7 pide evitar explícitamente.

### 6.4 Objetivo táctil por debajo del propio estándar de la app
`src/shared/theme/touchTargets.ts` define `minimum: 48` como *"piso de
accesibilidad general"* citando el estándar móvil de 48×48dp. Sin embargo,
`AacManagerScreen.tsx:208-217` (`iconButton`, usado para favorito/mover
arriba/mover abajo en la gestión de tarjetas) mide **40×40**, por debajo de
ese piso que la propia app se impuso. Es la única violación encontrada de
este tipo (se verificó el resto de botones pequeños del código y todos
cumplen ≥48dp), pero está en una pantalla de uso frecuente en Modo Adulto.

### 6.5 Cobertura de accesibilidad incompleta, no ausente
69 de 117 elementos `Pressable` tienen `accessibilityLabel` explícito
(59%). El resto son mayormente `BigButton` (que sí construye
`accessibilityLabel` automáticamente a partir de `label`, así que su
cobertura real es más alta de lo que el conteo crudo sugiere) y algunos
`Pressable` de tarjetas de contenido (colores/formas de los juegos) donde
falta confirmar caso por caso si el lector de pantalla anuncia algo útil.
No se puede afirmar "accesibilidad completa" sin una pasada dedicada
(parte de 7J).

### 6.6 Redundancia de navegación entre Home y la barra inferior
`HomeScreen` repite como botones "Calma" y "Mi Día", que ya son tabs
permanentes de la barra inferior (`MainTabs.tsx`), mientras que "Sensorial"
y "Jugar" **no** son tabs — solo se llega a ellos desde Home o desde
Calma. Esto crea dos clases de sistemas principales sin que la barra de
navegación lo refleje: 4 tabs "de primer nivel" (Inicio/Mi Voz/Calma/Mi
Día) más 2 sistemas igual de importantes (Sensorial, Jugar) que están "un
nivel más abajo" sin que haya una razón de producto explicada para esa
jerarquía. Es una decisión de arquitectura de navegación pendiente de
justificar o corregir en 7D, no un bug.

### 6.7 Bloqueo de orientación a portrait, sin adaptación a tablet
`app.json:7`: `"orientation": "portrait"` — la app fuerza vertical en todo
dispositivo, incluidas tablets Android. No hay uso de
`useWindowDimensions`/breakpoints salvo `cardWidthForBoardSize`
(columnas de tarjetas AAC) y una referencia en `BubblesScreen` (probable
límite del lienzo de burbujas). No existe ninguna adaptación de layout para
pantallas grandes (más columnas, paneles laterales, tipografía escalada) —
la Regla 1.10 del brief pide explícitamente revisar esto, y hoy la
respuesta es "no adaptado, solo escalado por el sistema operativo".

### 6.8 Listas con `ScrollView` + `.map()` en vez de `FlatList`
Cero usos de `FlatList` en todo el código (confirmado). Con los volúmenes
actuales (decenas de tarjetas/rutinas por perfil) no es un problema de
rendimiento perceptible, pero si 7E amplía mucho el vocabulario por
defecto o si un perfil acumula cientos de tarjetas personalizadas, las
grillas más grandes (`AacHomeScreen`, `AacManagerScreen`) empezarán a
notarlo. Señalado ya en la auditoría V2 anterior, sigue sin resolverse.

### 6.9 Fila de acciones densa en `AacManagerScreen`
Cada tarjeta en gestión (Modo Adulto) tiene 5 controles en una fila que se
envuelve (`favorito, mover arriba, mover abajo, Editar, Eliminar` —
`AacManagerScreen.tsx:72-106`). Funciona, pero es la pantalla con mayor
densidad de controles por elemento de lista de toda la app; candidata
directa a rediseño en 7C/7E (acciones deslizables o menú contextual en vez
de 5 botones fijos).

---

## 7. Problemas de arquitectura

### 7.1 Navegación huérfana (`ComingSoon`)
Cubierto en §5. Recomendación: eliminar la ruta, su tipo y el archivo de
pantalla en 7D, ya no cumple ningún propósito.

### 7.2 Modo Adulto sin unificar
Cubierto en §4.8. La funcionalidad de administración existe y es correcta
por sistema; lo que falta es una capa de organización (landing +
secciones), no reescribir ninguna de las pantallas de ajustes existentes.

### 7.3 Sin `storageVersion` ni migraciones formales
Cada feature sigue el patrón "`null` en AsyncStorage = sembrar datos por
defecto, `[]` = el adulto lo vació a propósito" (`aacCardsRepository.ts`,
`routinesRepository.ts`, `gameSettingsRepository.ts`,
`sensorySettingsRepository.ts` — mismo patrón repetido 4 veces). Funciona
hoy porque todos los cambios de esquema han sido aditivos (campos
opcionales con default en lectura). Si V7 necesita un cambio de esquema no
aditivo en algún momento (p. ej. cambiar la semántica de `boardSize`, ya
señalado como pendiente desde V2), no hay mecanismo de migración real, solo
valores por defecto.

### 7.4 Repositorios como funciones sueltas, no interfaces
`aacCardsRepository`, `routinesRepository`, `gameSettingsRepository`,
`sensorySettingsRepository`, `profilesRepository`, `pinRepository`,
`savedPhrasesRepository`: cada uno expone funciones async sueltas
(`getX`/`saveX`/`removeX`) sobre el mismo helper genérico
(`services/storage/asyncStorage.ts`). Es un patrón consistente y
reutilizable tal cual (no hace falta reescribirlo), pero no son interfaces
formales inyectables — si 7I quiere una capa de repositorio desacoplada
para, por ejemplo, testear con mocks, hoy tocaría envolver, no solo usar.

### 7.5 Sin framework de testing
`package.json` no tiene script `test` ni ninguna dependencia de testing
(`jest`, `@testing-library/react-native`, etc.) instalada. La Regla 5 del
brief V7 pide "ejecutar pruebas disponibles" en cada fase — hoy no hay
ninguna que ejecutar. Si el criterio de aceptación de V7 lo requiere
literalmente, hay que decidir e instalar un framework antes de 7B, porque
ninguna fase posterior tiene nada que correr todavía.

### 7.6 Sin vínculo de EAS versionado en el repo
No hay `expo.extra.eas.projectId` en `app.json` (aunque sí existe
`eas.json` con perfiles `development`/`preview`/`production`). El vínculo
con el proyecto de Google Play Internal Testing ya usado depende de
autenticación de cuenta (`EXPO_TOKEN`/`eas login`), no de nada versionado
en git — esto ya se resolvió operativamente en la sesión de build anterior,
se registra aquí solo como nota de arquitectura, sin acción pendiente de
V7.

### 7.7 Grid layouts manuales repetidos en cada pantalla `*Home`
`SensoryHomeScreen`, `GamesHomeScreen`, `MyDayScreen` (vista de lista) y
`AacHomeScreen` reimplementan cada uno su propia grilla de tarjetas con
`flexDirection: 'row', flexWrap: 'wrap'` y estilos de `card` casi
idénticos (ancho fijo ~150, `borderRadius: radius.lg`, borde de color,
emoji + texto centrado) en vez de compartir un componente. No es un bug,
pero es duplicación real de un patrón visual que 7C debería extraer a un
componente común del Design System (p. ej. `EntityGridCard`).

---

## 8. Elementos reutilizables (base sólida para V7, no reconstruir)

- **Todos los repositorios de `services/storage`** y el patrón
  `profileDataRegistry` (registro/callback para limpieza en cascada al
  borrar un perfil) — arquitectura correcta, envolver, no reescribir.
- **`services/audio` completo** (`speech.ts`, `recordingStorage.ts`,
  `recordingPlayback.ts`) — grabación de voz recién construida, cumple
  todos los requisitos de privacidad/persistencia/manejo de errores
  verificados en la fase anterior.
- **Los 6 juegos y su motor compartido** (`ChoiceGame`, `GameFrame`) —
  diseño sin puntuación punitiva, feedback consistente, ya alineado con el
  espíritu del brief V7-B.
- **Las 5 actividades de Mundo Sensorial** y su entrada por necesidad
  ("¿Qué necesitas ahora?") — decisión de UX ya validada, reutilizar el
  patrón para la 6ª actividad pendiente.
- **Los 2 flujos guiados de Calma** (dolor, saturación) con construcción de
  frase compuesta — patrón reutilizable si V7 agrega más flujos guiados.
  y `Mi Día` (rutinas, temporizador visual, 3 modos de presentación) —
  completos y correctos, no forman parte del alcance de los 4 sistemas V7
  pero no hay razón para tocarlos salvo que se integren visualmente al
  nuevo Design System.
- **Sistema de niveles de comunicación de Mi Voz** (`LEVEL_1`..`LEVEL_4`,
  `AacHomeScreen.tsx`) — adaptación real de interfaz por perfil, patrón de
  valor que otros sistemas (Sensorial, Juegos) podrían adoptar si V7 quiere
  niveles de complejidad también ahí.
- **`BigButton`, `ScreenContainer`, `ProfileAvatar`** — API limpia,
  variantes cubren los casos reales usados en toda la app; el rediseño 7C
  debería restylear estos componentes, no reemplazarlos por otros nuevos.
- **PIN de adulto y `PinPad`** — funcional, documentado como barrera
  parental (no criptográfica) a propósito; reutilizable tal cual.
- **`useAacCards`, `useRoutines`, `useGameSettings`, `useSensorySettings`,
  `useSavedPhrases`** — hooks ya resuelven carga/guardado/estado optimista
  correctamente; base correcta para cualquier extensión de datos.

---

## 9. Elementos que deben reconstruirse

- **Sistema visual completo** (colores, tipografía, iconografía): no es que
  esté "mal", es que el propio código dice que es un *placeholder*
  deliberado. Reconstruir en 7C es literalmente completar un trabajo ya
  marcado como pendiente, no deshacer una decisión final.
- **`AdultHomeScreen`**: reemplazar la lista de perfiles + 7 botones por
  fila por un Centro Adulto real con secciones navegables (ver propuesta en
  §10). Las pantallas de ajustes a las que hoy apunta (`AacManager`,
  `AacSettings`, `RoutineManager`, `SensorySettings`, `GamesSettings`) se
  conservan tal cual, solo cambia cómo se llega a ellas.
  Aac­ManagerScreen: la fila de 5 acciones por tarjeta (§6.9) — repensar
  como menú contextual o acciones deslizables al mismo tiempo que se
  corrige el objetivo táctil de 40dp (§6.4).
- **`WelcomeScreen`**: hoy es un emoji en un círculo; es la primera
  impresión de la app y el lugar de mayor impacto de una identidad visual
  real (7C/7D).
- **Grids duplicadas** (§7.7): extraer a un componente común antes de que
  7E/7F/7G agreguen más pantallas que copien el mismo patrón otra vez.
- **`ComingSoonScreen` y la ruta `ComingSoon`**: eliminar, no reconstruir
  (ver §7.1) — no cumple ningún propósito ya.

---

## 10. Propuesta de arquitectura V7 (para discutir, no implementada)

Reutilizar la estructura de carpetas por dominio ya existente
(`src/features/*`, `src/shared`, `src/services`) — es correcta y ya sigue
el patrón que V7 necesita. El trabajo real es de **contenido de cada
sistema y de una capa de organización nueva**, no de reestructurar
carpetas.

| Sistema V7 | Base existente | Trabajo real de V7 |
|---|---|---|
| A. Mi Voz | `features/aac-communicator` (completo, incl. voz) | Ninguna reconstrucción funcional pendiente; sí aplica el nuevo Design System (7C) a sus pantallas |
| B. Mundo Sensorial | `features/sensory-world` (5/6 actividades) | Agregar Sonidos y ritmo + Acuario interactivo; aplicar Design System |
| C. Calma 360 | `features/calm` (comunicación + 2 flujos guiados) | Agregar "Necesito un descanso" con temporizador propio y sonidos relajantes/estímulos visuales dedicados; aplicar Design System |
| D. Modo Adulto | `features/parent-mode` + pantallas de ajustes dispersas en cada feature | Construir Centro Adulto unificado (landing + secciones); agregar Estadísticas, Accesibilidad y Respaldo como secciones nuevas |

Nueva capa transversal propuesta (no existe hoy):
- `src/features/adult-center` (o ampliar `parent-mode`): landing con
  secciones, más las 3 pantallas nuevas (Estadísticas, Accesibilidad,
  Respaldo).
- `src/shared/theme` v2: mismos nombres de token que hoy (`colors`,
  `typography`, `spacing`, `radius`, `shadows`, `touchTargets`,
  `semanticColors`) con valores definitivos — no renombrar tokens para no
  romper los ~40 archivos que ya los importan.
- Un componente `EntityGridCard` compartido para reemplazar las 4 grillas
  duplicadas (§7.7).

Persistencia: sin cambios de fondo. Los repositorios existentes se quedan;
si 7I decide formalizar interfaces, se envuelven, no se reescriben.

---

## 11. Árbol propuesto de navegación

Mantiene la barra inferior de 4 tabs actual (correcta y ya validada), pero
resuelve la inconsistencia de §6.6 dándole a Sensorial y Jugar el mismo
nivel de acceso que Calma/Mi Día, sin agregar más tabs (5-6 tabs en una
barra inferior de niño ya sería demasiada carga cognitiva):

```
Welcome → ProfileSelector ⇄ ProfileForm
ProfileSelector → PinGate → AdultCenter (nuevo, reemplaza AdultHome)
  AdultCenter → { Perfiles, AAC, Sensorial, Juegos, Mi Día,
                  Sonido/Voz, Accesibilidad (nuevo), Estadísticas (nuevo),
                  Respaldo (nuevo) }
ProfileSelector → MainTabs (Modo Niño)

MainTabs (barra inferior, sin cambios de fondo):
  Inicio  → accesos a los 4 sistemas + Ayuda (ya existe, corrige §6.6
            dando a Sensorial/Jugar la misma jerarquía visual que
            Calma/Mi Día en la grilla de Home, no agregarlos como tabs)
  Mi Voz  → AacNavigator (AacHome/AacCategory, sin cambios)
  Calma   → CalmCommunicationScreen → { PainFlow, OverwhelmFlow,
            NuevoDescanso (nuevo), SensoryHome }
  Mi Día  → MyDayScreen (sin cambios)

Fuera de tabs (alcanzables desde Home, 1-2 toques, sin cambios de fondo):
  SensoryHome → 6 actividades (5 existentes + Sonidos y ritmo nuevo)
                 + Acuario interactivo (nuevo)
  GamesHome → 6 juegos (sin cambios)
  Help → frases de auxilio (sin cambios)
```

`ComingSoon` se elimina del árbol por completo (§7.1).

---

## 12. Plan exacto para Fases 7B–7K

**7B — Arquitectura UX/UI.** Sin código todavía: mockups/especificación de
cada pantalla a tocar (Home, AdultCenter y sus secciones nuevas,
WelcomeScreen, las grillas duplicadas). Define el árbol de navegación final
(§11) y lo somete a aprobación antes de construir nada.

**7C — Design System.** Tokens definitivos de color/tipografía (reemplazan
los "provisionales" de `colors.ts` sin renombrar el archivo ni las claves
existentes), selección de una librería de iconos vectorial (reemplaza
emoji donde el brief lo exige — puede convivir con emoji donde ya funciona
bien, p. ej. reacciones/celebración), estados pressed/disabled/loading/
error consistentes, componente `EntityGridCard` compartido. Restylea
`BigButton`/`ScreenContainer`/`ProfileAvatar` in-place.

**7D — Navegación y Home.** Implementa el árbol de §11: nuevo
`AdultCenter` (landing + secciones, sin tocar las pantallas de ajustes
existentes todavía, solo cómo se llega a ellas), corrige la jerarquía
Sensorial/Jugar en Home, elimina `ComingSoon`.

**7E — Mi Voz AAC.** Aplica el Design System nuevo a las pantallas
existentes (sin romper función). Sin construcción funcional nueva prevista
salvo que 7A/7B detecten algo adicional durante el rediseño.

**7F — Mundo Sensorial.** Construye "Sonidos y ritmo" y "Acuario
interactivo" (las 2 actividades que faltan del alcance V7-B), con audios
con licencia verificada (no reutilizar el bloqueo de "sin audios sin
licencia" de la fase de voz — resolverlo activamente aquí, con fuente
legal identificada antes de escribir código).

**7G — Calma 360.** Construye "Necesito un descanso" (temporizador
dedicado) y sonidos relajantes/estímulos visuales propios de Calma (mismo
requisito de licencia que 7F).

**7H — Modo Adulto.** Construye las 3 secciones nuevas del Centro Adulto:
Estadísticas (agregando `usageCount`/`lastUsedAt`/rutinas completadas/
juegos jugados en vistas reales), Accesibilidad (configuración centralizada
de tamaño de texto/reducción de movimiento/contraste para toda la app, no
por módulo), Respaldo (exportar/importar configuración local a un archivo).

**7I — Persistencia y perfiles.** Decide si se formalizan interfaces de
repositorio (§7.4) y si se agrega `storageVersion`/migraciones formales
(§7.3), en función de lo que 7H necesite para Estadísticas/Respaldo.

**7J — QA y accesibilidad.** Pasada dedicada de accesibilidad (cobertura
100% de `accessibilityLabel`/`accessibilityRole` en controles
interactivos, verificar objetivo táctil ≥48dp en toda la app incluyendo el
hallazgo de §6.4), pruebas manuales en dispositivo real Android (teléfono y
tablet, para cerrar el gap de §6.7), decisión sobre framework de testing
(§7.5) si el criterio de aceptación lo exige.

**7K — Release Candidate.** Verificación final (`tsc`, `eslint`, `expo
config`), confirmación de identidad técnica sin cambios, incremento de
`versionCode` (recién aquí, no antes), build AAB de validación.

Cada fase, al terminar: ejecutar TypeScript y ESLint, documentar archivos
modificados, indicar qué funciona y qué queda pendiente, commit propio, y
esperar autorización antes de la siguiente — tal como exige la Regla 5.

---

## Cierre de Fase 7A

No se modificó, renombró ni eliminó ningún archivo de código. No se tocó
`android.package`, `ios.bundleIdentifier`, `versionCode` ni configuración
EAS. Este documento es el único entregable de 7A y queda a la espera de
autorización explícita antes de iniciar 7B.
