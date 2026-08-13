# Auditoría de arquitectura — Sense & Play 360 V2 (Fase 0)

**Estado:** solo lectura. Este documento no modifica código, no renombra ni
elimina nada, no toca `android.package`, `ios.bundleIdentifier` ni
configuración EAS. Es el entregable de la Fase 0 del prompt maestro V2
("REINGENIERÍA PROFESIONAL COMPLETA").

**Rama auditada:** `claude/mi-voz-aac-pro-fase-2-cure6m` (working tree
limpio, `HEAD` = `3e02454` — "feat: add Mi Voz AAC Pro foundation").

---

## 1. Resumen ejecutivo

El proyecto **no es un punto de partida vacío**: ya tiene navegación,
perfiles con PIN de adulto, un comunicador AAC funcional y bastante
completo (incluye ya varias piezas que el prompt V2 pide: vocabulario
núcleo, categorías, buscador, favoritos/más usados/recientes, Calma 360,
personalización de tablero/texto, y un módulo "Mi Día" de rutinas). Lo que
**no existe todavía en absoluto** es Mundo Sensorial y Juega & Regula
(ambos son pantallas `ComingSoon`), y no hay un "Centro Adulto" unificado
(la administración está repartida en 5 pantallas de Modo Adulto
independientes).

En otras palabras: **V2 no arranca de cero en Mi Voz/Calma/Mi Día**, arranca
de una base sólida que hay que refactorizar y completar. Mundo Sensorial y
Juega & Regula sí son construcción nueva real (no hay una sola línea de
lógica de juego o de actividad sensorial hoy).

No hay riesgo inmediato de pérdida de datos: todo el almacenamiento es
aditivo (AsyncStorage + JSON, sin esquema estricto), y los tipos ya vienen
extendiéndose con campos opcionales desde la fase anterior. El riesgo real
de V2 está en tres frentes: (a) dependencias nuevas que V2 necesita y hoy
no están instaladas (audio de grabación/reproducción, animaciones,
gestos/dibujo, haptics), (b) la reestructuración de Home + bottom
navigation, que toca el punto de entrada de toda la app, y (c) que no
existe `eas.json` ni `extra.eas.projectId` versionado en el repo — el
vínculo con el proyecto EAS que ya publicó en Play Console vive fuera del
repositorio.

---

## 2. Archivos inspeccionados

Configuración raíz: `app.json`, `package.json`, `package-lock.json`,
`tsconfig.json`, `babel.config.js`, `eslint.config.js`, `.prettierrc.json`,
`.gitignore`, `App.tsx`, `index.ts`, `README.md`.

Documentación: `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`,
`docs/GOOGLE_PLAY_COMPLIANCE.md`, `docs/AAC_PRO_FASE2_PLAN.md` (de la fase
anterior de esta misma rama).

Código completo de: `src/app/**` (RootApp, RootNavigator, tipos de
navegación, WelcomeScreen, HomeScreen, ComingSoonScreen),
`src/features/aac-communicator/**` (tipos, categorías, vocabulario núcleo,
vocabulario de emergencia, tamaño de tablero, storage, hook, contexto de
frase, todos los componentes y pantallas), `src/features/daily-routine/**`
(tipos, storage, hook, seed, las 3 pantallas), `src/features/profiles/**`
(contexto, pantallas, `ProfileCard`), `src/features/parent-mode/**`
(`PinPad`, `PinGateScreen`, `AdultHomeScreen`), `src/features/sensory-games`
(solo `README.md`, no hay código), `src/services/storage/**`
(`asyncStorage`, `profilesRepository`, `pinRepository`,
`profileDataRegistry`), `src/services/audio/speech.ts`,
`src/shared/**` (theme, componentes, constantes, tipos, utils).

Estructura de `assets/` (contenido real de cada subcarpeta, no solo
nombres).

No se inspeccionó `node_modules/` más allá de confirmar qué paquetes están
declarados en `package.json` y cuáles no.

---

## 3. Mapa de arquitectura actual

```
App.tsx → index.ts → src/app/RootApp.tsx
  SafeAreaProvider
    ProfilesProvider (perfil activo global)
      NavigationContainer
        RootNavigator (native-stack, headers ocultos)
```

Stack: **Expo SDK 57** (managed, sin `android/`/`ios/` versionados) +
**React Native 0.86.2** + **React 19.2.3** + **TypeScript 6.0.3 estricto**.
Navegación con `@react-navigation/native` + `native-stack`. Persistencia
con `@react-native-async-storage/async-storage`. TTS con `expo-speech`.
Selección de imagen con `expo-image-picker`. `expo-build-properties` fija
`compileSdkVersion`/`targetSdkVersion` = 36, `minSdkVersion` = 24.

Alias de import (sincronizados en `tsconfig.json` y `babel.config.js`):
`@app`, `@features`, `@shared`, `@services`, `@assets`.

Organización por dominio bajo `src/features/*`, con `src/shared` (theme,
componentes, tipos, constantes) y `src/services` (storage, audio) como las
únicas capas transversales. No hay carpeta `src/app/navigation` con bottom
tabs — hoy toda la navegación es un único `native-stack` (sin tabs).

### 3.1 Grafo de navegación real (`RootStackParamList`)

```
Welcome → ProfileSelector ⇄ ProfileForm
ProfileSelector → PinGate → AdultHome
AdultHome → { AacManager, AacCardForm, AacSettings, RoutineManager, RoutineForm, ProfileForm }
ProfileSelector → Home (Modo Niño)
Home → { AacCommunicator, ComingSoon("Juega & Regula"), MyDay }
AacCommunicator (AacNavigator anidado) → { AacHome, AacCategory, AacCalm }
  AacCalm → ComingSoon("Mundo Sensorial")  [vía navigation.getParent()]
```

No existe bottom tab bar. No existe una pantalla "Ayuda" independiente (el
prompt V2 la pide accesible en 1 acción desde cualquier punto). La única
aproximación actual a "acceso rápido" es el botón **Calma** que agregué en
`AacLayout` (visible en todas las pantallas de "Mi Voz", no en `Home` ni en
el resto de la app).

---

## 4. Estado real por módulo (qué funciona, qué es fachada)

### 4.1 Perfiles — **funcional**

`features/profiles`: alta/edición/eliminación con confirmación, foto (cámara
o galería) o color de avatar con inicial, selección de perfil activo
persistida. `ChildProfilePreferences` ya tiene 13 campos (ver §6). Sin
`communicationLevel` ni preferencias sensoriales — eso es 100% nuevo para
V2.

### 4.2 Modo Adulto / PIN — **funcional pero disperso**

`PinGateScreen` crea/valida un PIN de 4 dígitos (barrera parental, no
criptográfica — documentado así a propósito, ver `pinRepository.ts`).
`AdultHomeScreen` es hoy la única puerta de entrada y solo lista perfiles
con 5 botones por fila (Tarjetas, Ajustes AAC, Mi Día, Editar, Eliminar).
**No existe** un "Centro Adulto" con secciones (Perfiles / AAC / Rutinas /
Sensorial / Juegos / Sonido / Accesibilidad / Estadísticas / Respaldo /
Privacidad) como pide V2 — hoy son 5 pantallas independientes accesibles
solo desde filas de perfil, sin una landing de Centro Adulto.

### 4.3 Mi Voz (AAC) — **funcional y bastante avanzado**

Ya incluye, de fases anteriores:
- Barra de frase persistente (`PhraseContext` + `PhraseBar`): agregar,
  quitar una palabra puntual, quitar la última, limpiar, hablar. **No
  existe** "Guardar frase" (persistir una frase armada para reuso) — lo
  pide V2 explícitamente y hoy no está.
- Ajuste **"Hablar al tocar"** (`speakOnTap`): ON habla cada tarjeta al
  instante; OFF solo la agrega a la frase.
- **Vocabulario núcleo** (`data/coreVocabulary.ts`, 24 palabras) siempre
  visible arriba de las categorías — cubre casi toda la lista V2 (falta
  *Parar*, *Abrir*, *Cerrar* explícitos; hoy están *Terminé*, *No quiero*,
  etc., que son equivalentes funcionales pero no literales).
- **23 categorías** (`constants/categories.ts`): 3 virtuales (Favoritos,
  Más usados, Recientes) + 20 reales. Cubren casi toda la lista V2 (falta
  *Palabras sociales* → ya existe con ese nombre exacto; todas las demás de
  la lista V2 también existen ya con el mismo o equivalente nombre).
- **Buscador AAC** (`AacSearch`) offline, sobre tarjetas + vocabulario
  núcleo.
- **Favoritos / Más usados / Recientes** con `usageCount`/`lastUsedAt` por
  tarjeta, actualizados automáticamente al tocar.
- **Personalización de cuadrícula**: `boardSize` (`2x2`/`2x3`/`3x3`/`3x4`/
  `4x4`, mapea a ancho de tarjeta) y `textSize`. **No coincide** con la
  nomenclatura V2 ("2/4/6/8 tarjetas/cuadrícula completa") — es un esquema
  de columnas, no de cantidad total; requiere decisión de diseño en Fase 2
  V2, no solo renombrar.
- Alta de tarjetas (`AacCardFormScreen`): texto, categoría, foto (cámara o
  galería), emoji, color, favorito. **No existe** selector de "icono"
  independiente del emoji (`imageType: 'icon'` de V2), ni grabación de
  audio, ni "probar voz" antes de guardar.

**Lo que V2 pide y no existe todavía:**
- `imageType` (`icon` / `localAsset` / `photo`) — hoy solo hay
  `emoji: string` + `imageUri?: string`, sin discriminación de tipo.
- Grabación de voz personalizada (`audioUri` ya existe como campo
  **reservado sin usar** en `AacCard`, ver §6) — no hay UI ni dependencia
  nativa de grabación instalada.
- Velocidad/tono de TTS configurables — `services/audio/speech.ts` solo
  expone `language`.
- `CommunicationLevel` (`LEVEL_1`..`LEVEL_4`) — no existe el campo ni la
  lógica de adaptación de interfaz.

### 4.4 Calma — **funcional, versión inicial**

`CalmCommunicationScreen` + `QuickCommunication`: 15 frases de
`data/emergencyVocabulary.ts` (superconjunto de las 12 que pide V2), cada
una habla de inmediato al tocarla. Enlace a "Mundo Sensorial" (hoy apunta
al stub `ComingSoon`, correcto dado que ese módulo no existe aún).

**No implementado:** los flujos guiados "¿Dónde te duele?" / "¿Cuánto?" /
"¿Cómo se siente?" y "¿Qué te molesta?" / "¿Qué necesitas?" — hoy Calma es
un panel plano de frases, sin árbol de decisión ni silueta corporal. Esto
es 100% construcción nueva para la Fase 3 de V2.

### 4.5 Mi Día — **funcional, versión inicial**

`features/daily-routine`: CRUD de rutinas y pasos (crear, editar rutina,
agregar/reordenar/eliminar paso), pantalla de niño con lista de rutinas →
pasos con indicador **Primero/Después** (basado en el primer paso no
completado) y botón "Hecho", más "Reiniciar rutina". Rutinas semilla:
"Prepararme para la escuela" e "Ir a dormir" (de las 10 rutinas
predeterminadas que pide V2, hoy solo hay 2 sembradas).

**No implementado:** duplicar rutina, modo alternativo "Ahora/Después/
Terminado", temporizador visual (gráfico, no numérico), refuerzo al
completar (animación/sonido), campo `duration`/`audio` por paso (los tipos
no los tienen todavía). `updatedAt` tampoco existe en `DailyRoutine` (solo
`createdAt`).

### 4.6 Mundo Sensorial — **NO EXISTE**

`src/features/sensory-games/README.md` es el único archivo del módulo,
describe la intención pero no hay una sola línea de código. Desde `Home` y
desde `Calma`, "Mundo Sensorial"/"Juega & Regula" navegan a
`ComingSoonScreen` (`"Esta sección estará disponible próximamente."`) —
exactamente la pantalla que el prompt V2 exige eliminar. Ninguna de las 6
actividades (burbujas, respiración, seguimiento visual, pintura, sonidos,
causa-efecto) tiene código, assets ni dependencias instaladas.

### 4.7 Juega & Regula — **NO EXISTE**

Mismo caso que Mundo Sensorial: solo un botón en `Home` que abre
`ComingSoon`. Cero lógica de juego, cero de los 6 minijuegos que pide V2.

### 4.8 Centro Adulto — **existe disperso, no unificado**

Ver §4.2. No hay secciones de Sensorial, Juegos, Sonido, Accesibilidad,
Estadísticas, Respaldo ni Privacidad — ninguna de esas 7 secciones tiene
pantalla propia hoy. "AAC" y "Rutinas" sí tienen su administración, pero
como pantallas sueltas por perfil, no como secciones de un Centro Adulto
central.

---

## 5. Almacenamiento / persistencia

Todo sobre `@react-native-async-storage/async-storage`, envuelto en un
helper JSON genérico (`services/storage/asyncStorage.ts`: `getItem`
tolera JSON corrupto devolviendo `null` en vez de lanzar). **No hay
`storageVersion` ni ninguna migración formal** — cada feature simplemente
lee `null` como "sembrar datos por defecto" y un array vacío como "el
adulto lo vació a propósito". Este patrón funciona pero no es lo que pide
V2 (`ProfileRepository`/`AacRepository`/`RoutineRepository`/
`SettingsRepository`/`StatisticsRepository` como interfaces desacopladas +
`migrateV1ToV2()`).

Claves usadas hoy (todas bajo el prefijo `sense-play/`):
- `sense-play/profiles`, `sense-play/active-profile-id` — perfiles.
- `sense-play/adult-pin` — PIN de adulto (texto plano, barrera parental).
- `sense-play/aac/cards/<profileId>` — tarjetas AAC, una clave por perfil.
- `sense-play/daily-routine/routines/<profileId>` — rutinas, una clave por
  perfil.

`services/storage/profileDataRegistry.ts` es el único mecanismo de
"desacoplamiento" real que existe: cada feature con datos por perfil se
registra una vez (`registerProfileDataCleanup`) y `ProfilesContext`
dispara la limpieza sin importar esos features directamente. Es un patrón
razonable y **reutilizable tal cual** para las interfaces de repositorio
que pide V2 (se puede envolver, no hace falta reescribirlo).

No hay ninguna estadística agregada persistida (rutinas completadas,
juegos jugados, actividades sensoriales usadas) — solo lo que se puede
derivar de `usageCount`/`lastUsedAt` en `AacCard`.

---

## 6. Modelo de datos actual vs. el que pide V2

### `AacCard` (hoy, `features/aac-communicator/types.ts`)

```ts
interface AacCard {
  id: string; categoryId: string; label: string; emoji: string;
  imageUri?: string; audioUri?: string; // reservado, sin usar
  color: string; isFavorite: boolean; order: number;
  usageCount?: number; lastUsedAt?: string; active?: boolean;
  createdAt: string;
}
```

Comparado con el modelo V2 (`spokenText`, `imageSource`, `imageType`,
`createdByUser`): falta `spokenText` explícito (hoy `label` cumple ambos
roles — texto visible y texto hablado son el mismo string), falta
`imageType` (discriminador `icon`/`localAsset`/`photo`), falta
`createdByUser` (hoy se infiere indirectamente: las tarjetas sembradas y
las creadas por el adulto conviven en el mismo array sin marca). Migración
viable de forma aditiva: agregar los 3 campos como opcionales con default
derivado (`createdByUser: true` si no es una de las sembradas originales,
`imageType: imageUri ? 'photo' : 'icon'`), sin tocar los ya guardados.

### `ChildProfile` / `ChildProfilePreferences` (hoy, `shared/types/index.ts`)

Ya tiene 13 campos de preferencias AAC (`speakOnTap`, `boardSize`,
`textSize`, 7 flags `show*`, `confirmBeforeDelete`, más los originales
`soundEnabled`/`reduceMotion`). **No tiene** `communicationLevel` ni
`SensoryPreferences` (`soundSensitive`, `lightSensitive`, `touchSensitive`,
`preferredCalmingTools`, `headphonesPreferred`) — 100% nuevo, aditivo sin
conflicto.

### `DailyRoutine` / `RoutineStep` (hoy, `features/daily-routine/types.ts`)

```ts
interface DailyRoutine { id; title; emoji; color; steps: RoutineStep[]; order; createdAt; }
interface RoutineStep { id; label; emoji; done; order; }
```

Falta `profileId` explícito en el tipo (hoy es implícito por la clave de
storage, no un campo del objeto), `updatedAt`, y en el paso: `image`
(distinto de `emoji`), `duration?`, `audio?`. Todo aditivo.

### Lo que no existe en absoluto todavía

`UserProfile.communicationLevel`, `SensoryPreferences`, cualquier modelo de
Mundo Sensorial (configuración de actividad, intensidad, velocidad, etc.),
cualquier modelo de Juega & Regula (`difficulty`, `duration`,
`soundEnabled`, `hapticEnabled` por juego), cualquier modelo de
estadísticas agregadas, `storageVersion`.

---

## 7. Dependencias: instaladas vs. necesarias para V2

**Instaladas hoy** (`package.json`): `expo` 57.0.11, `expo-build-properties`,
`expo-image-picker`, `expo-speech`, `expo-status-bar`,
`@react-navigation/native` + `native-stack`,
`@react-native-async-storage/async-storage`, `react-native-safe-area-context`,
`react-native-screens`, `react` 19.2.3, `react-native` 0.86.2.

**Sin instalar y necesarias para V2** (por sistema):
- **Mundo Sensorial**: animaciones fluidas de burbujas/respiración/
  seguimiento visual (`Animated`/`LayoutAnimation` de React Native
  alcanzan para lo básico, pero para partículas y trazo suave de "pintura
  sensorial" hace falta gestos — `react-native-gesture-handler` — y muy
  probablemente un lienzo — `@shopify/react-native-skia` o
  `react-native-svg`); sonidos ambientales con loop/volumen — necesita
  `expo-audio` (o `expo-av`, deprecado); vibración — `expo-haptics`.
- **Mi Voz / Calma**: grabación y reproducción de audio personalizado —
  `expo-audio`.
- **Rendimiento** (`FlatList`, memoización): no requiere dependencias
  nuevas, son componentes/hooks de React y React Native ya disponibles;
  hoy las listas usan `ScrollView` + `.map()` porque los conjuntos de
  datos son pequeños (decenas de tarjetas/rutinas), no hace falta
  `FlatList` con los volúmenes actuales, pero si V2 amplía mucho el
  vocabulario por defecto conviene migrar las grillas más grandes.
- **Testing**: no hay ningún framework de test configurado (`package.json`
  no tiene script `test` ni `jest`/`@testing-library` como dependencia).
  El prompt V2 pide "ejecutar tests disponibles" después de cada fase —
  hoy no hay ninguno que ejecutar; si se quiere cumplir literalmente ese
  criterio hay que decidir e instalar un framework antes de la Fase 1.

**Nada de lo anterior se instaló en esta auditoría** — es un inventario de
gaps, no un cambio.

---

## 8. Configuración Expo / identidad técnica (verificado, sin tocar)

- `expo.name` = "Sense & Play Adventures 360", `slug` =
  "sense-play-adventures-360".
- `android.package` = `com.senseplayadventures.app` ✅ sin tocar.
- `ios.bundleIdentifier` = `com.senseplayadventures.app` ✅ sin tocar.
- `expo.version` = `0.1.0`, `android.versionCode` = `1`.
- `android.permissions` = `[]` en `app.json` (los permisos de cámara/
  galería los agrega el config plugin de `expo-image-picker`
  automáticamente al generar el proyecto nativo).
- **No existe `eas.json`** en el repositorio, y `app.json` no tiene
  `expo.extra.eas.projectId`. Si el proyecto ya se compiló y publicó con
  EAS (como indica el contexto de la tarea), el vínculo con ese proyecto
  vive fuera de este repo (login local / configuración manual en otra
  máquina) — **riesgo real**: cualquier `eas build`/`eas submit` desde un
  entorno nuevo (como este) probablemente pedirá reconfigurar o vincular
  el proyecto existente. No se puede confirmar el estado de EAS solo
  leyendo el repositorio; hace falta verificarlo con la cuenta de Expo
  antes de cualquier build real (consistente con la regla del prompt de no
  generar AAB todavía).
- `assets/images`, `assets/sounds`, `assets/fonts` están **vacíos**
  (solo `.gitkeep`) — no hay ningún asset de audio ni imagen bundleado
  hoy; las fotos de perfil/tarjetas se generan en tiempo de ejecución
  (URIs locales del picker/cámara), y el TTS es 100% sintético
  (`expo-speech`). Esto contradice la premisa de "ya contiene... audios
  reales" mencionada en contexto previo de la tarea: **no hay audios
  reales bundleados en el repo**, solo TTS del sistema.

---

## 9. Problemas técnicos detectados

1. **Documentación desactualizada respecto al código real.**
   `docs/ROADMAP.md` marca la Fase 8 (Modo adulto/PIN) como pendiente
   (`[ ]`) cuando ya está implementada desde la Fase 2, y no menciona en
   absoluto el trabajo de la rama actual (vocabulario núcleo, categorías
   ampliadas, Calma 360, Mi Día). `docs/ARCHITECTURE.md` tampoco documenta
   nada posterior a la Fase 4. Antes de repartir trabajo en "fases V2"
   conviene decidir si `ROADMAP.md` se resetea/renombra para V2 o convive
   con el histórico — no lo decido en esta auditoría.
2. **Sin `storageVersion` ni migraciones formales.** El patrón actual
   ("`null` = sembrar, `[]` = vaciado intencional") funciona pero no
   escala a cambios de esquema más complejos (por ejemplo, si V2 cambia
   `boardSize` de "columnas" a "cantidad total de tarjetas", hace falta
   una migración real, no solo un default).
3. **`boardSize` actual no es compatible 1:1 con la nomenclatura V2**
   ("2/4/6/8/cuadrícula completa" vs. columnas `2x2`..`4x4`) — es una
   decisión de diseño pendiente, no un bug, pero afecta directamente a
   Fase 2 de V2.
4. **Sin tests.** No hay framework de testing instalado; el criterio de
   aceptación de V2 ("ejecutar tests disponibles" en cada fase) no tiene
   nada que ejecutar hoy.
5. **`eas.json` ausente / sin `projectId` en `app.json`.** Ver §8.
6. **Assets vacíos.** Ver §8 — cualquier actividad de Mundo Sensorial que
   dependa de sonidos ambientales pregrabados necesita assets reales que
   hoy no existen en el repo.
7. **Botón "Calma" en `AacLayout` solo vive dentro de "Mi Voz".** El
   requisito V2 de "Ayuda a máx. 1 acción desde cualquier pantalla" no se
   cumple globalmente todavía — hoy Calma es alcanzable en 1 toque solo
   *dentro* del comunicador, no desde `Home` ni desde Mi Día/Modo Adulto.
8. **No hay bottom tab bar.** Toda la navegación depende de botones dentro
   de cada pantalla; agregar una barra inferior persistente (Inicio/Mi
   Voz/Calma/Mi Día) es un cambio estructural de `RootNavigator`, no
   cosmético (hoy es un `native-stack` puro, sin tabs).
9. **`AacCardFormScreen` no ofrece "probar voz"** antes de guardar, y no
   hay velocidad/tono de TTS configurable — API de `expo-speech` ya lo
   soporta (`rate`, `pitch`), solo falta exponerlo.

Ninguno de estos puntos es un blocker para empezar V2; son decisiones y
trabajo pendiente a repartir en las fases del prompt maestro.

---

## 10. Riesgos de migración

- **Bajo** para los tipos existentes (`AacCard`, `ChildProfilePreferences`,
  `DailyRoutine`): todos los campos nuevos de V2 pueden agregarse como
  opcionales con default en lectura (`?? valor`), igual que se hizo en la
  fase anterior. No hace falta reescribir datos guardados.
- **Medio** para `boardSize`: si se decide cambiar la semántica (columnas
  → cantidad total de tarjetas), los perfiles que ya eligieron un
  `boardSize` deben mapearse explícitamente (`3x3` → ¿"9 tarjetas" o
  "cuadrícula completa"?) para no perder la preferencia guardada.
- **Medio-alto** para Home/navegación: introducir bottom tabs implica
  decidir si `RootNavigator` pasa a ser un stack que envuelve un
  `Tab.Navigator`, o si cada tab es su propio stack anidado (como ya se
  hace hoy con `AacNavigator`). Afecta a *todas* las pantallas existentes
  indirectamente (recalcular `navigation.getParent<...>()` en los lugares
  que hoy suben al stack raíz: `AacHomeScreen`, `CalmCommunicationScreen`).
- **Alto** para EAS/build: no se puede evaluar el riesgo real sin acceso a
  la cuenta de Expo/EAS asociada al proyecto ya publicado; se marca como
  bloqueante para la Fase de build, no para las fases de código.
- **Ninguno** identificado para pérdida de datos de usuario: no hay ningún
  cambio propuesto que requiera borrar o sobrescribir claves de
  AsyncStorage existentes.

---

## 11. Propuesta de arquitectura V2 (para discutir, no implementada)

Mapeo de los 6 sistemas del prompt a la estructura de carpetas actual —
**reutilizar features existentes, no recrearlos**:

| Sistema V2 | Base existente | Trabajo real de V2 |
| --- | --- | --- |
| 1. Mi Voz | `features/aac-communicator` (avanzado) | niveles AAC, `imageType`, grabación de voz, velocidad/tono TTS, "guardar frase" |
| 2. Calma | `features/aac-communicator` (Calma 360 ya vive ahí) | flujos guiados Me duele / Tengo miedo-Saturado, quizás extraer a `features/calm` propio si crece mucho |
| 3. Mundo Sensorial | `features/sensory-games` (solo README) | las 6 actividades completas, de cero |
| 4. Juega & Regula | `features/sensory-games` o nuevo `features/games` | los 6 juegos completos, de cero |
| 5. Mi Día | `features/daily-routine` (funcional) | duplicar rutina, Ahora/Después/Terminado, temporizador visual, refuerzo |
| 6. Centro Adulto | disperso en `parent-mode` + pantallas sueltas | unificar en una landing con secciones, agregar Sensorial/Juegos/Sonido/Accesibilidad/Estadísticas/Respaldo/Privacidad |

Persistencia: envolver los repositorios ya existentes
(`aacCardsRepository`, `routinesRepository`, `profilesRepository`,
`pinRepository`) detrás de las interfaces que pide V2
(`AacRepository`, `RoutineRepository`, `ProfileRepository`,
`SettingsRepository`, `StatisticsRepository`) sin reescribir su
implementación interna — son ya, de hecho, el mismo patrón (una función
por operación, una clave de AsyncStorage por perfil). Agregar
`storageVersion` + `migrateV1ToV2()` como una capa nueva y delgada sobre
`asyncStorage.ts`, ejecutada una vez al arrancar `RootApp`.

Navegación: envolver el `RootNavigator` actual en un `Tab.Navigator` de 4
tabs (Inicio/Mi Voz/Calma/Mi Día) manteniendo Modo Adulto y los flujos de
perfil como stacks fuera de las tabs (no tiene sentido un tab "Modo
Adulto" visible para el niño).

---

## 12. Plan exacto de Fase 1 (Design System + Navegación) — propuesto, sin implementar

1. **Tokens centralizados** en `shared/theme`: agregar `shadows` y
   `semanticColors` (hoy solo hay `colors`/`spacing`/`radius`/
   `typography`) sin romper los imports existentes (`colors`, `spacing`,
   etc. se mantienen; se agrega, no se reemplaza).
2. **Home rediseñado**: reescribir `src/app/screens/HomeScreen.tsx` con el
   layout del prompt (saludo + botón principal "Quiero comunicarme" +
   grilla 2x2 Calma/Sensorial/Jugar/Mi Día + Ayuda). Mundo Sensorial y
   Jugar seguirán apuntando a `ComingSoon` **hasta que existan de verdad**
   (Fases 5 y 6) — el prompt V2 prohíbe pantallas "próximamente" en
   navegación pública, así que hay que decidir explícitamente: u ocultar
   esos dos botones de Home hasta tener el módulo real, o aceptar que
   Fase 1 los deja visibles y se resuelven en Fases 5-6 (documentado como
   pendiente, no como bug).
3. **Bottom tab bar** (Inicio/Mi Voz/Calma/Mi Día): nuevo
   `Tab.Navigator` envolviendo el stack actual; requiere agregar
   `@react-navigation/bottom-tabs` (no instalado hoy).
4. **Pantalla de Ayuda**: nueva, con las 6 frases del prompt, reutilizando
   el patrón de `QuickCommunication` (hablar inmediato al tocar) ya
   existente en `aac-communicator`. Accesible desde Home y desde la bottom
   bar en como máximo 1 toque.
5. **Texto "¿Quién va a jugar?" → "¿Quién va a usar la app?"**: cambio de
   una línea en `ProfileSelectorScreen.tsx`.
6. Verificación: `npx tsc --noEmit`, `npx eslint .`, `npx expo config
   --json`, y confirmar que `android.package`/`ios.bundleIdentifier`/
   `version`/`versionCode` no cambiaron.
7. Commit único y separado: `feat(v2-phase-1): design system and
   navigation`.

Este plan **no se ejecuta todavía** — queda pendiente de aprobación antes
de tocar código, tal como exige el prompt maestro.
