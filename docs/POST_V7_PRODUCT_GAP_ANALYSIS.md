# Auditoría de producto post-V7 — Gap Analysis

**Fecha:** 2026-08-15
**Alcance:** estado real de `main` (commit `d639687`), evaluado archivo por
archivo y flujo por flujo, no solo por resultado de `tsc`/`eslint`/build.
**Método:** lectura completa de los ~5.170 líneas de `src/` (100% de los
`.ts`/`.tsx` del repositorio), inspección de dependencias declaradas
(`package.json`), configuración (`app.json`), y verificación en vivo de
`npm run typecheck` y `npm run lint` tras instalar dependencias (ambos
**pasan sin errores** — confirmando exactamente la advertencia del pedido:
build limpio ≠ producto terminado).

Este documento es un diagnóstico. **No se modificó código de producto, no
se generó build, no se tocó `versionCode` ni configuración EAS.**

---

## 0. Resumen ejecutivo

V7 entrega una **base arquitectónica sólida y un comunicador AAC
genuinamente funcional**, pero el producto tal como se pidió (Mi Voz AAC +
Mundo Sensorial + Calma 360 + Mi Día + Modo Adulto, como una app comercial)
está lejos de completo:

- **Mundo Sensorial / "Juega & Regula" no existe.** Es un botón que abre un
  stub genérico (`ComingSoonScreen`) y una carpeta con un solo `README.md`.
  Cero juegos, cero código, cero dependencias de motor de juego instaladas.
- **"Calma 360" no es un módulo de regulación sensorial.** Es una grilla de
  15 frases de emergencia que se leen en voz alta (funcional, útil, pero
  literalmente una sub-función del comunicador AAC, no un módulo de
  respiración/regulación como sugiere el nombre y el mensaje del commit).
- **Mi Voz AAC** es lo más terminado del producto: CRUD real de tarjetas
  con foto, TTS real, frase construible, buscador, favoritos/más
  usados/recientes, personalización visual — todo persistido de verdad en
  `AsyncStorage`. Aun así tiene campos "fantasma" (`active`, `reduceMotion`)
  que existen en el modelo de datos y en la UI pero no hacen nada.
- **Modo Adulto** gestiona perfiles, tarjetas, ajustes AAC y rutinas — todo
  real — pero no tiene ni un solo ajuste global de la app (idioma, volumen
  maestro, cambiar PIN, exportar/borrar datos, política de privacidad),
  todos ellos requisitos para publicar en Google Play según el propio
  `docs/GOOGLE_PLAY_COMPLIANCE.md` del repositorio.
- **Home/Navegación** funciona sin rutas rotas, pero visualmente es un
  wireframe: sin tipografía propia (`assets/fonts` vacío), sin
  ilustraciones (`assets/images` vacío), sin sonidos propios
  (`assets/sounds` vacío), solo emojis del sistema sobre rectángulos de
  color. Se ve y se siente como un dashboard interno, no como una app de
  consumo publicada.

**Cumplimiento funcional real estimado: ~48–52%** de lo que "Mi Voz AAC
Pro + Mundo Sensorial + Calma 360 + Mi Día + Modo Adulto" promete como
producto. El detalle y la justificación de esta cifra están en la
sección 12.

---

## 1. Inventario real de funcionalidades

| Módulo | Qué existe en el código | Alcanzable desde la UI |
|---|---|---|
| Bienvenida / Selector de perfil | `WelcomeScreen`, `ProfileSelectorScreen`, `ProfileCard` | Sí |
| Alta/edición de perfil infantil (foto, color, sonido, reducir movimiento) | `ProfileFormScreen`, `ProfilesContext` | Sí |
| Mi Voz — vocabulario núcleo (24 palabras) | `CoreVocabularyRow`, `data/coreVocabulary.ts` | Sí (solo lectura, no editable) |
| Mi Voz — categorías (23) y tarjetas | `AacHomeScreen`, `AacCategoryScreen`, `AacCardTile` | Sí |
| Mi Voz — buscador offline | `AacSearch.tsx` | Sí |
| Mi Voz — barra de frase (agregar/quitar/hablar/limpiar) | `PhraseContext`, `PhraseBar` | Sí |
| Mi Voz — Favoritos / Más usados / Recientes | `AacCategoryScreen` + `useAacCards.incrementUsage` | Sí |
| Mi Voz — alta/edición/borrado de tarjetas con foto (galería o cámara) | `AacManagerScreen`, `AacCardFormScreen` | Sí (Modo Adulto) |
| Mi Voz — ajustes de personalización (tablero, texto, qué mostrar) | `AacSettingsScreen` | Sí (Modo Adulto) |
| Mi Voz — grabación de voz familiar | Campo `audioUri` reservado en `types.ts:29`, sin UI, sin dependencia de audio | **No** |
| Calma 360 (frases rápidas de emergencia) | `CalmCommunicationScreen`, `QuickCommunication`, `emergencyVocabulary.ts` | Sí (solo dentro de Mi Voz) |
| Calma 360 — herramientas de regulación (respiración, temporizadores, etc.) | No existe código alguno | **No** |
| Mundo Sensorial / Juega & Regula (6 juegos) | `src/features/sensory-games/README.md` únicamente | **No** — abre `ComingSoonScreen` |
| Mi Día — rutinas visuales con pasos, Primero/Después | `MyDayScreen`, `useRoutines`, `defaultRoutines.ts` | Sí |
| Mi Día — alta/edición/borrado de rutinas y pasos | `RoutineManagerScreen`, `RoutineFormScreen` | Sí (Modo Adulto) |
| Modo Adulto — PIN de acceso (crear/verificar) | `PinGateScreen`, `pinRepository.ts` | Sí |
| Modo Adulto — cambiar/recuperar PIN | No existe | **No** |
| Modo Adulto — ajustes globales de la app (idioma, volumen, privacidad, borrar datos) | No existe | **No** |
| Texto a voz (TTS) | `services/audio/speech.ts` (expo-speech, cola anti-superposición) | Sí |

---

## 2. Matriz requisito vs. implementación

| Requisito (pedido/commits) | Estado | Evidencia |
|---|---|---|
| Construcción real de frases | ✅ REALMENTE FUNCIONAL | `PhraseContext.tsx:38-46`, `PhraseBar.tsx` |
| TTS | ✅ REALMENTE FUNCIONAL | `services/audio/speech.ts` (cola de reproducción real, `expo-speech`) |
| Categorías | ✅ REALMENTE FUNCIONAL (contenido fijo) | `constants/categories.ts` — 23 categorías, no editables por adulto |
| Pictogramas | ✅ REALMENTE FUNCIONAL | Emoji por tarjeta, `AacCardVisual.tsx` |
| Fotografías en tarjetas | ✅ REALMENTE FUNCIONAL | `AacCardFormScreen.tsx:46-73` (`expo-image-picker`, galería y cámara) |
| Edición de tarjetas | ✅ REALMENTE FUNCIONAL | `AacCardFormScreen.tsx`, `useAacCards.updateCard` |
| Favoritos | ✅ REALMENTE FUNCIONAL | `useAacCards.toggleFavorite`, categoría virtual `favorites` |
| Recientes | ✅ REALMENTE FUNCIONAL | `AacCategoryScreen.tsx:45-49` (por `lastUsedAt`) |
| Búsqueda | ✅ REALMENTE FUNCIONAL | `AacSearch.tsx` (local, offline) |
| Grabaciones familiares | ❌ NO IMPLEMENTADO | Campo reservado sin UI ni dependencia (`types.ts:24-29`) |
| Perfiles | ✅ REALMENTE FUNCIONAL | `ProfilesContext.tsx`, borrado en cascada de datos del perfil |
| Persistencia (AAC/perfiles/rutinas) | ✅ REALMENTE FUNCIONAL | `AsyncStorage` vía `services/storage/*`, por perfil, sembrado único |
| Mundo Sensorial — 6 minijuegos | ❌ NO IMPLEMENTADO (0%) | `sensory-games/README.md` es el único archivo del módulo |
| Calma 360 — comunicación rápida | ✅ REALMENTE FUNCIONAL | `QuickCommunication.tsx`, 15 frases con TTS inmediato |
| Calma 360 — regulación sensorial/respiración | ❌ NO IMPLEMENTADO | Sin ningún archivo relacionado en el repositorio |
| Modo Adulto — perfiles/tarjetas/rutinas | ✅ REALMENTE FUNCIONAL | `AdultHomeScreen.tsx` |
| Modo Adulto — configuración general de la app | ❌ NO IMPLEMENTADO | No existe pantalla; `AdultHomeScreen` solo gestiona perfiles |
| Home como app comercial | ⚠️ UX DEFICIENTE | Ver sección 6 |

---

## 3. Funcionalidades faltantes (no implementadas)

1. **Mundo Sensorial completo** (los 6 juegos: Revienta burbujas, Pintura
   sensorial, Toca y escucha, Sigue el color, ¿Cómo me siento?, Respira
   conmigo). Solo existe el `README.md` de planificación
   (`src/features/sensory-games/README.md`). No hay ni una sola línea de
   componente, pantalla, ni dependencia de motor de juego
   (`react-native-gesture-handler`, `react-native-reanimated`, `expo-av`
   o `expo-audio` para efectos de sonido, ninguna librería de dibujo/canvas)
   en `package.json`.
2. **Calma 360 como módulo de regulación** (respiración guiada,
   temporizadores visuales, herramientas sensoriales interactivas). Solo
   existe la sub-función de frases rápidas.
3. **Grabación de voz familiar** para tarjetas AAC. El tipo `AacCard`
   reserva `audioUri` (`types.ts:24-29`) pero no hay pantalla de grabación,
   ni permisos de micrófono en `app.json`, ni dependencia de audio de
   grabación instalada.
4. **Selector de idioma** en la interfaz. Existe la constante
   `DEFAULT_SPEECH_LANGUAGE = 'es-ES'` (`shared/constants/app.ts:20`)
   pensada para extenderse, pero no hay ningún control de UI que la use.
5. **Cambio o recuperación de PIN de Modo Adulto.** `PinGateScreen` solo
   sabe "crear la primera vez" o "verificar"; no hay flujo para cambiarlo
   ni para recuperarlo si se olvida.
6. **Ajustes globales de la app**: volumen maestro, política de
   privacidad, exportar/borrar todos los datos, pantalla "Acerca de".
7. **Edición de vocabulario núcleo y de categorías** por parte del adulto
   (nombres, orden, ocultar categorías completas, crear categorías
   nuevas). Ambos son datos fijos en código (`coreVocabulary.ts`,
   `categories.ts`).
8. **Reinicio automático diario de rutinas de Mi Día.** `resetRoutine` solo
   se dispara manualmente (`MyDayScreen.tsx:83`); si un niño marca todos
   los pasos como hechos, la rutina sigue "hecha" al día siguiente hasta
   que un adulto la reinicie a mano.

## 4. Funcionalidades parciales

1. **"Hablar al tocar" / construcción de frase** — funciona, pero solo se
   configura por perfil, no por tarjeta ni por categoría; no hay forma de
   que una tarjeta "hable siempre" aunque el modo esté en construcción de
   frase (p. ej. una tarjeta de emergencia).
2. **Tarjeta activa/inactiva (`active`)** — el modelo de datos y dos
   pantallas (`AacCategoryScreen.tsx:35`, `AacSearch.tsx:30`) ya filtran
   por `card.active !== false`, pero **no existe ningún control en la UI**
   que permita desactivar una tarjeta sin borrarla. Es una funcionalidad a
   medio construir: el "backend" está, el "frontend" no.
3. **Rutinas de Mi Día** — CRUD completo de rutina y pasos, pero los pasos
   solo tienen emoji + texto; no admiten foto ni audio (mencionado como
   pendiente en `docs/AAC_PRO_FASE2_PLAN.md:90-91`), a diferencia de las
   tarjetas AAC que sí tienen foto.
4. **Confirmar antes de borrar** — el ajuste existe y se respeta en
   tarjetas y rutinas (`AacManagerScreen.tsx:33-42`,
   `RoutineManagerScreen.tsx:31-40`), pero no protege el borrado de
   **perfiles completos**, que siempre confirma con un `Alert` fijo sin
   pasar por la preferencia (`AdultHomeScreen.tsx:19-24`) — inconsistencia
   menor pero real.

## 5. Placeholders / funcionalidad simulada

1. **`ComingSoonScreen`** — pantalla genérica que hoy es el destino real
   de "Juega & Regula" (`HomeScreen.tsx:46-52`) y de "Ir a Mundo Sensorial"
   dentro de Calma (`CalmCommunicationScreen.tsx:33-38`). Es honesta en su
   copy ("Esta sección estará disponible próximamente"), pero es la puerta
   de entrada a **dos** botones distintos del producto, lo que hace parecer
   que hay más superficie construida de la que realmente hay.
2. **"Reducir movimiento" (`reduceMotion`)** — toggle real en
   `ProfileFormScreen.tsx:138-140`, se guarda de verdad en
   `ChildProfilePreferences.reduceMotion` (`shared/types/index.ts:20`),
   pero **ningún componente de la app lo lee** (confirmado por búsqueda en
   todo `src/`: las únicas referencias son la definición del tipo, el
   default y el propio formulario). Es un interruptor que no hace nada:
   simulación pura de una función de accesibilidad.
3. **Campo `audioUri` en `AacCard`** — reservado y documentado
   (`types.ts:24-29`) para "grabaciones familiares", nunca leído ni
   escrito por ninguna pantalla. Es infraestructura de datos para una
   función que no existe.
4. **Vocabulario núcleo y categorías "editables"** — se presentan en la UI
   como parte del sistema de tarjetas (mismo look, mismo patrón visual),
   pero en realidad son listas de código estático; un adulto no puede
   tocarlas desde ninguna pantalla, a diferencia de lo que su presentación
   visual sugiere.

## 6. Problemas graves de UX/UI

1. **Fricción de arranque en cada apertura.** `RootNavigator` siempre
   inicia en `Welcome` (`RootNavigator.tsx:31`) y `RootApp.tsx` no tiene
   ninguna lógica para recordar el último perfil activo y saltar
   directo a `Home`. Cada vez que el niño (o el cuidador) abre la app —
   incluso siendo el mismo perfil de siempre — el flujo obligatorio es:
   Bienvenida → "Comenzar" → Selector de perfil → tocar el perfil → recién
   ahí Home. Para una herramienta de uso diario por parte de un niño
   neurodivergente, este es un costo de fricción real, no cosmético.
2. **"Calma" no es alcanzable en un toque desde toda la app**, pese a que
   el propio comentario del código lo promete
   (`AacLayout.tsx:20-25`: "alcanzable en un toque desde cualquier pantalla
   de Mi Voz"). Es cierto solo *dentro* de Mi Voz. Desde `HomeScreen` no
   hay ningún botón de Calma — un niño en crisis que todavía no entró a
   "Mi Voz" tiene que navegar Home → Mi Voz → Calma (mínimo 2 toques,
   más el tiempo de carga de dos pantallas) antes de llegar a una frase de
   auxilio.
3. **Identidad visual inexistente.** `assets/fonts`, `assets/images` y
   `assets/sounds` contienen únicamente un `.gitkeep` cada uno — cero
   tipografía propia, cero ilustraciones, cero sonido propio. Toda la
   interfaz se construye con `Text`/`View`/`Pressable` de React Native,
   fuente del sistema y emojis Unicode como único elemento gráfico
   (`colors.ts` documenta explícitamente que su paleta es "provisional de
   Fase 1"). El resultado se ve — y el usuario ya lo confirmó probándolo
   en dispositivo — como un dashboard interno o un prototipo de Figma, no
   como una app publicada.
4. **Sin onboarding.** No hay ninguna pantalla que explique a un cuidador
   nuevo qué es Modo Adulto, cómo crear el primer perfil, o qué hace cada
   sección. `ProfileSelectorScreen` simplemente dice "Pídele a un adulto
   que cree el primero en Modo Adulto" (`ProfileSelectorScreen.tsx:36`)
   sin ningún enlace directo desde ahí (hay que saber ir a "Modo Adulto"
   por cuenta propia, y de ahí recién a "Agregar perfil").
5. **Sin recuperación de PIN.** Si el adulto olvida el PIN, Modo Adulto —
   y con él toda gestión de tarjetas, rutinas y perfiles — queda
   inaccesible de forma permanente (no hay "olvidé mi PIN", ni pregunta de
   seguridad, ni reinicio desde ajustes del sistema operativo salvo borrar
   los datos de la app).
6. **Áreas táctiles inconsistentes con el propio estándar de la app.** El
   documento de arquitectura fija 64dp como área táctil mínima
   (`shared/theme/spacing.ts:19-20`) y `BigButton` la respeta
   (`BigButton.tsx:68`), pero los botones de icono de
   `AacManagerScreen` (favorito/mover arriba/mover abajo) miden 40×40dp
   (`AacManagerScreen.tsx:208-217`), por debajo del propio estándar
   declarado y de las guías de accesibilidad táctil habituales.

## 7. Problemas de accesibilidad

- **`reduceMotion` no tiene efecto** (ver sección 5) — para una app
  dirigida a niños neurodivergentes, un ajuste de "reducir movimiento" que
  no reduce nada es un problema de accesibilidad real, no solo una
  funcionalidad incompleta.
- **Sin validación con lector de pantalla en dispositivo real.** El código
  usa `accessibilityRole`/`accessibilityLabel`/`accessibilityHint` de forma
  consistente en casi todos los componentes interactivos (buena práctica
  presente), pero el propio `docs/GOOGLE_PLAY_COMPLIANCE.md:56-58` marca
  la validación de lector de pantalla como pendiente de la Fase 11, que no
  se hizo. No hay evidencia en el repositorio de que se haya probado con
  TalkBack/VoiceOver.
- **Sin selector de tamaño de texto a nivel de sistema/app** fuera de Mi
  Voz: el ajuste `textSize` (`AacSettingsScreen.tsx`) solo afecta las
  tarjetas del comunicador, no el resto de la interfaz (Home, Mi Día,
  Modo Adulto usan tamaños fijos).
- **Contraste no auditado formalmente.** La paleta (`colors.ts`) se
  autodescribe como "provisional... el diseño definitivo se cierra en la
  Fase 10" — no hay evidencia de una auditoría de contraste WCAG.
- **Botones de icono por debajo del estándar táctil propio** (ver punto 6
  de la sección anterior) — impacta particularmente a cuidadores con
  dificultades motrices finas.

## 8. Problemas de persistencia

- **Sin backup/exportación de datos.** Todo vive únicamente en
  `AsyncStorage` local (`services/storage/asyncStorage.ts`). Si se
  desinstala la app, se cambia de dispositivo, o se borra la caché del
  sistema, **se pierden perfiles, tarjetas personalizadas, fotos y
  rutinas** sin ningún mecanismo de recuperación. Para una familia que
  invirtió tiempo personalizando el comunicador de su hijo, esto es un
  riesgo serio, no un detalle técnico.
- **PIN en texto plano.** `pinRepository.ts:1-24` guarda el PIN de adulto
  sin ningún hash, documentado como decisión deliberada ("barrera
  parental, no mecanismo criptográfico"). Es una decisión defendible para
  este caso de uso, pero debe quedar explícita también de cara al usuario
  final (hoy no se comunica en ninguna pantalla) y revisarse si en el
  futuro el PIN llega a proteger algo más sensible que "evitar que un niño
  entre por accidente".
- **Datos corruptos se descartan silenciosamente.** `asyncStorage.ts:9-14`
  captura cualquier error de `JSON.parse` y devuelve `null` sin loguear ni
  avisar — un perfil o listado de tarjetas dañado se trata igual que "no
  existe todavía" y dispara el sembrado por defecto, lo que podría borrar
  de hecho el estado real del usuario sin ningún aviso.
- **`active: undefined` vs `active: false`** — al no haber UI para
  desactivar tarjetas, este camino de código nunca se ejercita en
  producción; el día que se active la función habrá que probar
  explícitamente la migración de tarjetas ya guardadas.

## 9. Componentes que deben eliminarse o replantearse

- **Ninguno debe eliminarse por estar mal construido** — el problema del
  repositorio no es código sobrante, sino superficie de producto sin
  construir. Sí hay que **replantear**:
  - El toggle **"Reducir movimiento"** en `ProfileFormScreen` — o se
    implementa de verdad (envolver animaciones/transiciones futuras en un
    check de esta preferencia) o se retira de la UI hasta que exista algo
    que reducir. Dejarlo como está es, literalmente, engañar al cuidador
    que lo activa pensando que protege a su hijo de sobreestimulación.
  - El botón **"Ir a Mundo Sensorial"** dentro de Calma
    (`CalmCommunicationScreen.tsx:33-38`) — hoy duplica el mismo destino
    stub que "Juega & Regula" en Home. Mientras Mundo Sensorial no exista,
    considerar si vale la pena mantener dos caminos distintos al mismo
    "próximamente", o si conviene ocultar temporalmente el enlace desde
    Calma para no inflar la sensación de que el módulo ya está conectado.
  - El campo `active` de `AacCard` — o se expone una acción real
    ("Ocultar tarjeta" en `AacManagerScreen`) o se retira del tipo hasta
    que se implemente, para no dejar código muerto que además ya
    condiciona dos pantallas (`AacCategoryScreen`, `AacSearch`).

## 10. Componentes que pueden conservarse tal cual

- **`services/audio/speech.ts`** — cola de reproducción anti-solapamiento
  bien resuelta; base sólida también para cuando se agregue grabación de
  voz (ya documenta el orden "audio si existe, si no TTS").
- **`PhraseContext` + `PhraseBar`** — patrón de estado local, claro y
  sin sobre-ingeniería.
- **`useAacCards` / `aacCardsRepository` / `useRoutines` /
  `routinesRepository`** — mismo patrón de CRUD + siembra + persistencia
  por perfil, replicable tal cual para el futuro almacenamiento de
  progreso de los juegos sensoriales.
- **`ProfilesContext` + `profileDataRegistry`** — el registro de limpieza
  por perfil (`registerProfileDataCleanup`) es exactamente el mecanismo de
  extensión que va a necesitar Mundo Sensorial y la futura grabación de
  voz, sin tener que tocar `ProfilesContext` cada vez.
- **`BigButton` / `ScreenContainer` / `AacCardVisual` / `ProfileAvatar`**
  — primitivas consistentes, con accesibilidad correctamente cableada
  (`accessibilityRole`, `accessibilityLabel`, `accessibilityHint`) y área
  táctil de 64dp por defecto. La base es buena; lo que falta es una
  segunda pasada puramente visual (tipografía, iconografía, ilustración),
  no una reescritura.

## 11. Propuesta concreta para transformar el producto en una app comercial

*(Propuesta a nivel de producto/arquitectura — no implementar todavía,
según instrucción explícita.)*

1. **Cerrar la brecha visual antes que cualquier feature nueva.** Definir
   una identidad real: tipografía redondeada apta para lectura infantil
   (cargar en `assets/fonts`), un set de iconos/ilustraciones consistente
   (sustituyendo progresivamente los emojis por arte propio en tarjetas y
   categorías clave), y sonidos de confirmación propios (`assets/sounds`).
   Sin esto, aunque se completen Mundo Sensorial y Calma 360, el producto
   seguirá "sintiéndose" como un prototipo.
2. **Construir Mundo Sensorial como módulo real**, empezando por 1–2 juegos
   completos y pulidos (no 6 a medias): elegir motor de interacción
   (`react-native-gesture-handler` + `react-native-reanimated` para
   gestos/animación fluida, `expo-av`/`expo-audio` para efectos de
   sonido), reutilizando el patrón de persistencia por perfil ya validado
   en AAC/Mi Día para guardar progreso o preferencias sensoriales por
   niño.
3. **Rehacer Calma 360 como lo que promete el nombre**: al menos un
   ejercicio de respiración guiada con animación/temporización real, y
   mantener la grilla de frases actual como complemento (no como todo el
   módulo). Conectar el botón "Calma" también desde `HomeScreen`, no solo
   desde dentro de Mi Voz, para cumplir la promesa de "un toque desde
   cualquier lugar".
4. **Completar Modo Adulto** con lo que ya está identificado como
   pendiente en `docs/GOOGLE_PLAY_COMPLIANCE.md`: pantalla de ajustes
   generales (idioma, volumen maestro), cambio de PIN, exportar/borrar
   datos, enlace a política de privacidad — todos ellos bloqueantes para
   publicar en Google Play, no mejoras opcionales.
5. **Resolver la fricción de arranque**: recordar el último perfil activo
   y, si el dispositivo es de un solo niño (caso típico), saltar
   directo a `Home` tras el primer uso, dejando "Bienvenida" y "Selector
   de perfil" para dispositivos compartidos o primer uso.
6. **Cerrar la Fase 11 real** (no solo marcarla): pasar la app completa
   con TalkBack/VoiceOver activado, medir contraste de la paleta actual
   contra WCAG AA, y homogeneizar las áreas táctiles por debajo de 64dp
   detectadas en Modo Adulto.
7. **Resolver backup/portabilidad de datos** antes de cualquier lanzamiento
   público: como mínimo, exportar/importar un `.json` de perfil (tarjetas,
   rutinas, preferencias) para que una familia no pierda meses de
   personalización si cambia de teléfono.
8. **Auditoría de dispositivo real recurrente**: dado que este mismo
   proceso (tsc/eslint/build en verde, producto no listo) ya se repitió
   una vez, conviene agregar una revisión manual en dispositivo físico
   como criterio de salida de cada fase futura, no solo checks
   automatizados.

## 12. Prioridades

**P0 — bloqueante para considerar el producto "usable" en su promesa actual**
- Implementar o retirar el toggle "Reducir movimiento" (hoy engaña al
  cuidador).
- Resolver la fricción de arranque (recordar perfil activo).
- Hacer "Calma" alcanzable desde `HomeScreen`, no solo desde dentro de Mi
  Voz.
- Flujo de cambio/recuperación de PIN de Modo Adulto.
- Backup/exportación mínima de datos (riesgo de pérdida total de
  personalización).

**P1 — bloqueante para publicación comercial (Google Play) y para cumplir
lo prometido explícitamente como "Mundo Sensorial" y "Calma 360"**
- Construir Mundo Sensorial (al menos 1–2 juegos reales, no 6 placeholders).
- Construir el componente de regulación/respiración real de Calma 360.
- Pantalla de ajustes generales de Modo Adulto (idioma, volumen, política
  de privacidad, borrar datos) — ya identificados como pendientes en
  `GOOGLE_PLAY_COMPLIANCE.md`.
- Validación de accesibilidad en dispositivo real (lector de pantalla,
  contraste, áreas táctiles) — Fase 11 declarada pero no ejecutada.
- Pasada de identidad visual (tipografía, iconografía, ilustración,
  sonido propio).

**P2 — mejoras de producto, no bloqueantes**
- Edición de vocabulario núcleo y categorías por el adulto.
- Grabación de voz familiar (`audioUri`).
- Fotos/audio por paso de rutina en Mi Día.
- Reinicio automático diario de rutinas.
- Selector de idioma visible en UI.
- Panel de tendencias de uso para el cuidador (palabras más usadas,
  patrones por horario, etc.).

---

## 13. Porcentaje estimado de cumplimiento funcional real

| Área | % funcional real | Justificación breve |
|---|---:|---|
| Mi Voz AAC (comunicador) | **~78%** | Núcleo sólido y persistente; faltan grabación de voz, edición de vocabulario núcleo/categorías, ocultar tarjeta (`active`), selector de idioma. |
| Mi Día (rutinas) | **~85%** | CRUD completo y usable; falta reinicio automático diario y foto/audio por paso. |
| Calma 360 | **~25%** | Solo la sub-función de frases rápidas existe; el módulo de regulación/respiración que da nombre a "Calma 360" no existe. |
| Mundo Sensorial | **~0%** | Un `README.md`, cero código, cero dependencias de motor de juego. |
| Modo Adulto | **~55%** | Gestión de perfiles/tarjetas/rutinas es real; no hay ajustes globales, cambio/recuperación de PIN, ni cumplimiento de los pendientes de Play Store. |
| Home / Navegación (funcional) | **~90%** | No hay rutas rotas ni callejones sin salida no señalizados; el único destino "falso" (`ComingSoon`) es honesto sobre su estado. |
| Home / Navegación (nivel visual/comercial) | **~25%** | Sin tipografía, ilustración ni sonido propios; se percibe como prototipo, no como app publicada — el hallazgo de la prueba en dispositivo real. |

**Cumplimiento funcional real ponderado del producto completo: ~48–52%.**

La cifra no es "código que falla" — `tsc` y `eslint` están en verde, y la
mayoría de las pantallas que sí existen están bien construidas y persisten
datos de verdad. La cifra baja refleja que **dos de los cinco pilares
anunciados (Mundo Sensorial, y el componente de regulación de Calma 360)
están, en la práctica, en 0–25%**, y que ni Modo Adulto ni la capa visual
llegan todavía al nivel que se espera de una app comercial publicable.
