# Auditoría de producto post-V7 — Gap Analysis

**Fecha:** 2026-08-15
**Alcance:** estado real de `main` (rama de referencia; esta auditoría se realizó desde `claude/post-v7-product-audit-0i27n7`, que contiene todo `main` y ningún commit adicional de producto). Commit de referencia: `d639687` ("Merge pull request #2... Mi Voz AAC Pro foundation").
**Método:** lectura completa de los 63 archivos TypeScript/TSX de `src/`, seguimiento manual del flujo de navegación pantalla por pantalla, y verificación de qué controles están realmente cableados a lógica/persistencia vs. cuáles son solo interfaz. No se compiló, no se ejecutó build, no se tocó `versionCode` ni configuración EAS, tal como se indicó.

> **Nota de honestidad**: esta auditoría NO se hizo probando la app en un dispositivo físico (no tengo esa capacidad). Es una auditoría de código exhaustiva que reconstruye, línea por línea, qué ocurre realmente cuando se toca cada control — el mismo criterio que pedía la tarea ("qué ocurre realmente cuando toca cada control"), pero verificado por lectura de código en vez de por dispositivo. Donde el código es inequívoco (p. ej. una carpeta con solo un `README.md` y ningún componente), la conclusión es tan confiable como una prueba en dispositivo. Donde depende de percepción subjetiva (calidad visual, "se siente como app comercial"), se marca explícitamente como evaluación cualitativa.

---

## 0. Resumen ejecutivo

El roadmap interno del propio repositorio (`docs/ROADMAP.md`) ya es sincero al respecto: solo las Fases 1–4 están marcadas `[x]`; Fases 5–12 (personalización avanzada, **juegos sensoriales**, **modo adulto ampliado**, **almacenamiento robusto**, **diseño definitivo**, **accesibilidad y pruebas**, **empaquetado Google Play**) siguen `[ ]` sin marcar. Una rama posterior ("Mi Voz AAC Pro — Fase 2", `docs/AAC_PRO_FASE2_PLAN.md`) adelantó bastante trabajo sobre el comunicador, pero **no tocó Mundo Sensorial en absoluto** y lo dice explícitamente en su propio documento (línea 44-48 de ese archivo).

Dicho en los términos de la tarea: **de las cuatro columnas del producto (Mi Voz AAC, Mundo Sensorial, Calma 360, Modo Adulto), solo una (Mi Voz AAC) tiene una implementación que se acerca a "terminada"**. Mundo Sensorial es un stub del 0%. Calma 360 es real pero es una fracción mínima de lo que su nombre promete. Modo Adulto cubre lo esencial pero le faltan piezas que cualquier app comercial para padres/terapeutas necesita (recuperación de PIN, backup/exportación, política de privacidad).

---

## 1. Inventario real de funcionalidades

### 1.1 Mi Voz (AAC) — `src/features/aac-communicator/`

| Funcionalidad | Estado | Evidencia |
|---|---|---|
| Construcción de frases (tocar tarjetas → barra de frase) | **REALMENTE FUNCIONAL** | `context/PhraseContext.tsx:38-46`, `components/PhraseBar.tsx` |
| Texto a voz (TTS) | **REALMENTE FUNCIONAL** | `services/audio/speech.ts` — usa `expo-speech`, cola serializada para evitar audio solapado |
| Quitar una palabra puntual de la frase | **REALMENTE FUNCIONAL** | `PhraseContext.tsx:48-50`, tocar el chip en `PhraseBar.tsx:29-42` |
| Categorías (23 reales + 3 virtuales) | **REALMENTE FUNCIONAL** | `constants/categories.ts:31-61` |
| Pictogramas | **PARCIAL / CALIDAD INSUFICIENTE** | Son emoji Unicode del sistema operativo, no un set profesional de pictogramas AAC (ARASAAC, PCS, SymbolStix). `assets/images/` está vacía (solo `.gitkeep`) — la app no trae ningún pictograma propio |
| Fotografías en tarjetas | **REALMENTE FUNCIONAL** | `screens/AacCardFormScreen.tsx:46-73` (`expo-image-picker`, galería y cámara) |
| Alta/edición/eliminación de tarjetas | **REALMENTE FUNCIONAL** | `hooks/useAacCards.ts:85-160`, persistido en AsyncStorage por perfil |
| Favoritos | **REALMENTE FUNCIONAL** | `useAacCards.ts:122-129`, categoría virtual en `AacCategoryScreen.tsx:38-39` |
| Recientes | **REALMENTE FUNCIONAL** | Ordenado por `lastUsedAt`, `AacCategoryScreen.tsx:45-49` |
| Más usados | **REALMENTE FUNCIONAL** | Ordenado por `usageCount`, `AacCategoryScreen.tsx:40-44` |
| Buscador | **REALMENTE FUNCIONAL** | `components/AacSearch.tsx` — busca en tarjetas del perfil + vocabulario núcleo, local y offline |
| Vocabulario núcleo (24 palabras) | **REALMENTE FUNCIONAL (pero no editable)** | `data/coreVocabulary.ts` — fila fija, siempre visible; no se puede agregar/editar/quitar palabras núcleo desde la UI |
| Grabaciones de voz familiares | **NO IMPLEMENTADO** | `AacCard.audioUri` existe como campo reservado (`types.ts:24-29`) pero **no hay ninguna dependencia de grabación de audio en `package.json`**, ningún permiso de micrófono en `app.json`, ninguna pantalla ni botón de grabar. El propio código lo documenta: "No implementado todavía" |
| Perfiles múltiples con datos aislados | **REALMENTE FUNCIONAL** | Clave por perfil `sense-play/aac/cards/<id>` (`storage/aacCardsRepository.ts:6-8`), limpieza automática al borrar perfil (`services/storage/profileDataRegistry.ts`) |
| Persistencia | **REALMENTE FUNCIONAL** (con matices, ver §8) | AsyncStorage, `services/storage/asyncStorage.ts` |
| Personalización visual (tamaño tablero/texto, qué mostrar) | **REALMENTE FUNCIONAL** | `screens/AacSettingsScreen.tsx`, efectivamente consumida en `AacCategoryScreen.tsx:74-78` y `AacHomeScreen.tsx:29-36` (no es un ajuste decorativo sin efecto) |
| Selector de idioma / voz | **NO IMPLEMENTADO** | `DEFAULT_SPEECH_LANGUAGE = 'es-ES'` fijo (`shared/constants/app.ts:20`); no hay UI para cambiarlo |
| Contextos rápidos (Casa/Escuela/Terapia) | **NO IMPLEMENTADO** | Reconocido en `docs/AAC_PRO_FASE2_PLAN.md:88-89` |

### 1.2 Mundo Sensorial / "Juega & Regula" — `src/features/sensory-games/`

| Funcionalidad | Estado | Evidencia |
|---|---|---|
| Los 6 minijuegos anunciados (Revienta burbujas, Pintura sensorial, Toca y escucha, Sigue el color, ¿Cómo me siento?, Respira conmigo) | **NO IMPLEMENTADO — 0%** | La carpeta `src/features/sensory-games/` contiene **únicamente un `README.md`** describiendo el plan futuro. No hay un solo componente, pantalla, o línea de lógica de juego |
| Botón "Juega & Regula" en Home | **PLACEHOLDER** | `app/screens/HomeScreen.tsx:46-52` navega a `ComingSoonScreen` (`app/screens/ComingSoonScreen.tsx`), la misma pantalla genérica reutilizada para cualquier función no construida |
| Progreso / desbloqueables / dificultad adaptativa | **NO IMPLEMENTADO** | No existe base sobre la cual construir esto |

No hay ambigüedad posible aquí: es un directorio vacío con un archivo de intenciones. Cualquier prueba en dispositivo confirmará que tocar "Juega & Regula" muestra el texto "Esta sección estará disponible próximamente." y nada más.

### 1.3 Calma 360 — `src/features/aac-communicator/screens/CalmCommunicationScreen.tsx`

| Funcionalidad | Estado | Evidencia |
|---|---|---|
| Frases de comunicación rápida en crisis (15 frases predefinidas) | **REALMENTE FUNCIONAL** | `components/QuickCommunication.tsx`, `data/emergencyVocabulary.ts` — cada tarjeta habla al instante vía TTS |
| Ejercicios de respiración guiada ("Respira conmigo") | **NO IMPLEMENTADO** | Ese juego vive en Mundo Sensorial (ver README de `sensory-games`), que no existe; Calma 360 no tiene sustituto propio |
| Temporizadores / animaciones calmantes | **NO IMPLEMENTADO** | No hay ninguna librería de animación en `package.json` (ni `reanimated`, ni `lottie`, ni nada); técnicamente no es posible que exista una animación de respiración hoy |
| Herramientas sensoriales (sonidos, texturas visuales, etc.) | **NO IMPLEMENTADO** | — |
| Acceso en "un toque desde cualquier pantalla" | **FALSO / UX DEFICIENTE** | El propio comentario del código lo promete (`components/AacLayout.tsx:20-26`: "el botón Calma está siempre presente... alcanzable en como máximo un toque desde cualquier pantalla de Mi Voz"), pero el botón **solo existe dentro de `AacLayout`**, es decir, dentro de las pantallas de Mi Voz. Desde `HomeScreen`, desde `MyDayScreen` (rutinas) o desde cualquier pantalla de Modo Adulto **no hay ningún acceso a Calma**. Un niño en medio de una rutina o en la pantalla principal necesita: Volver → Home → Mi Voz → Calma (mínimo 2-3 toques, no 1), lo cual contradice el propósito de una herramienta de crisis |

**Conclusión de esta sección**: "Calma 360" tal como existe hoy es, en la práctica, una única pantalla de 15 frases AAC de emergencia con TTS — una variación temática del propio comunicador, no una herramienta de autorregulación sensorial independiente. El nombre "360" no está justificado por el alcance actual.

### 1.4 Modo Adulto — `src/features/parent-mode/`

| Funcionalidad | Estado | Evidencia |
|---|---|---|
| PIN de acceso (crear/verificar) | **REALMENTE FUNCIONAL** | `screens/PinGateScreen.tsx`, `services/storage/pinRepository.ts` |
| Recuperación / cambio de PIN olvidado | **NO IMPLEMENTADO** | No existe ningún flujo de "olvidé mi PIN"; una vez creado, `AdultHomeScreen.tsx` no ofrece cambiarlo. Si un adulto lo olvida, la única salida es borrar los datos de la app (perdiendo todos los perfiles, tarjetas y rutinas) |
| Gestión de perfiles (alta/edición/eliminación) | **REALMENTE FUNCIONAL** | `screens/AdultHomeScreen.tsx:16-96` |
| Edición de tarjetas AAC por perfil | **REALMENTE FUNCIONAL** | Enlaza a `AacManagerScreen` |
| Ajustes de personalización AAC por perfil | **REALMENTE FUNCIONAL** | Enlaza a `AacSettingsScreen` |
| Gestión de rutinas "Mi Día" | **REALMENTE FUNCIONAL** | Enlaza a `RoutineManagerScreen` |
| Backup / exportación / restauración de datos | **NO IMPLEMENTADO** | No hay ninguna función de exportar/importar. Todo vive únicamente en `AsyncStorage` del dispositivo (ver §8) |
| Política de privacidad / términos / "Acerca de" | **NO IMPLEMENTADO** | El propio `docs/GOOGLE_PLAY_COMPLIANCE.md:48-51` lo reconoce como pendiente ("Fase 8... lugar natural para exponer... enlaces a política de privacidad") |
| Selector de idioma de la app | **NO IMPLEMENTADO** | — |
| Ajustes globales de la app (no por perfil) | **NO IMPLEMENTADO** | Todo ajuste vive dentro de un perfil infantil; no hay pantalla de configuración general de la aplicación |
| Habilitar/deshabilitar juegos por perfil | **NO IMPLEMENTADO** | Mencionado como pendiente en el comentario de `AdultHomeScreen.tsx:11-15` ("La Fase 8 amplía esta pantalla con... juegos habilitados") — no existe todavía porque no hay juegos que habilitar |

### 1.5 Home / Navegación — `src/app/`

| Funcionalidad | Estado | Evidencia |
|---|---|---|
| Bienvenida → selector de perfil → Home | **REALMENTE FUNCIONAL** | `WelcomeScreen.tsx`, `ProfileSelectorScreen.tsx`, `HomeScreen.tsx` |
| Navegación a Mi Voz / Mi Día | **REALMENTE FUNCIONAL** | `HomeScreen.tsx:38-61` |
| Navegación a Juega & Regula | **PLACEHOLDER** | Ver §1.2 |
| Separación Modo Niño / Modo Adulto | **REALMENTE FUNCIONAL** | Ningún componente de Modo Niño importa pantallas de edición (verificado por imports en `AacHomeScreen.tsx`, `AacCategoryScreen.tsx`, `MyDayScreen.tsx`) |
| Identidad visual / branding | **DÉBIL (evaluación cualitativa)** | Logo = un emoji 🌈 dentro de un círculo (`WelcomeScreen.tsx:14-16`); sin ilustraciones, sin iconografía propia, sin splash animado |

---

## 2. Matriz requisito vs. implementación

| Pilar del producto | % estimado de lo prometido que existe | Clasificación |
|---|---|---|
| Mi Voz AAC — motor de comunicación (frases, TTS, categorías, búsqueda, favoritos) | ~85% | Realmente funcional, con huecos de calidad (pictogramas) |
| Mi Voz AAC — personalización y multimedia (fotos, voz familiar, idioma) | ~40% | Fotos sí; voz familiar e idioma no |
| Mundo Sensorial — los 6 juegos | 0% | No implementado |
| Calma 360 — herramienta de autorregulación | ~25% | Solo el sub-caso "frases de emergencia"; falta todo lo sensorial/respiración |
| Mi Día — rutinas visuales | ~75% | Funcional; falta reinicio automático diario, fotos/audio por paso |
| Modo Adulto — administración | ~55% | CRUD de perfiles/tarjetas/rutinas sí; recuperación de PIN, backup, privacidad no |
| Home / navegación / identidad de marca | ~50% (cualitativo) | Estructuralmente sólida, visualmente de prototipo |

---

## 3. Funcionalidades faltantes (NO IMPLEMENTADO)

1. Los 6 minijuegos de Mundo Sensorial, completos (0 líneas de código).
2. Grabación de voz familiar para tarjetas AAC (`audioUri` reservado, sin dependencia, sin UI, sin permisos).
3. Selector de idioma/voz de TTS (fijo en `es-ES`).
4. Contextos rápidos de vocabulario (Casa/Escuela/Terapia).
5. Ejercicios de respiración guiada, temporizadores y animaciones calmantes dentro de Calma 360.
6. Recuperación/cambio de PIN de Modo Adulto.
7. Backup, exportación e importación de datos.
8. Política de privacidad / términos / pantalla "Acerca de" dentro de la app.
9. Reinicio automático diario de las rutinas de "Mi Día" (hoy es 100% manual, ver §6).
10. Edición del vocabulario núcleo desde la UI (hoy es una lista fija en código).
11. Habilitar/deshabilitar juegos por perfil (depende de que existan juegos).
12. Cualquier pantalla de ajustes globales de la aplicación (no ligados a un perfil infantil).

## 4. Funcionalidades parciales (PARCIAL)

1. **Pictogramas**: existen (emoji), pero no son un sistema de símbolos AAC profesional; para uso clínico/educativo real esto es una limitación material, no cosmética.
2. **Calma 360**: existe y funciona, pero es una fracción pequeña (frases de emergencia) de lo que el nombre y el enlace a "Mundo Sensorial" prometen.
3. **Vocabulario núcleo**: visible y funcional, pero no editable ni ampliable por el adulto — es una lista de código, no un dato administrable.
4. **Mi Día**: los pasos y rutinas son reales y persistentes, pero no hay foto/audio por paso (solo emoji+texto) y el reinicio es manual, no automático por día.
5. **Ajuste "Reducir movimiento" (`reduceMotion`)**: ver §5, punto 1 — técnicamente parcial porque se guarda pero no tiene ningún efecto.

## 5. Placeholders (SIMULADO / PLACEHOLDER)

1. **`reduceMotion`** (`shared/types/index.ts:20`, toggle en `ProfileFormScreen.tsx:139`): se guarda en el perfil pero **no se lee en ningún otro lugar del código** (verificado por búsqueda exhaustiva). Es un interruptor que no hace nada — y no podría hacer nada aunque se leyera, porque la app no tiene ninguna librería de animación instalada. Esto es un ajuste **simulado**: el usuario cree que está reduciendo movimiento y no ocurre nada.
2. **`ComingSoonScreen`**: pantalla genérica reutilizada para "Juega & Regula" y para "Mundo Sensorial" (desde Calma). Es, por definición, un placeholder — y el hecho de que sirva para dos "funcionalidades" distintas con el mismo texto genérico refuerza la sensación de prototipo.
3. **Campo `audioUri` en `AacCard`**: existe en el tipo y se documenta como "reservado para cuando se implemente" — es un placeholder de esquema de datos sin funcionalidad asociada.
4. **Botón "Calma" como acceso universal**: el comentario en el código lo describe como si fuera una funcionalidad terminada ("alcanzable en un toque desde cualquier pantalla"), pero el comportamiento real es más limitado (ver §1.3) — esto no es un placeholder técnico, pero sí una **discrepancia entre lo documentado como completo y lo que realmente ocurre**, el tipo de brecha que esta auditoría busca detectar.

## 6. Problemas graves de UX/UI

1. **Calma 360 no es alcanzable en un toque desde Home ni desde Mi Día** — para una herramienta pensada para momentos de crisis/sobreestimulación, esto es un defecto de diseño serio, no cosmético (`HomeScreen.tsx`, `MyDayScreen.tsx` no importan ni enlazan a `AacCalm`).
2. **"Mi Día" no se reinicia solo**: si un niño completa su rutina de la mañana hoy, mañana seguirá mostrando todos los pasos marcados como hechos hasta que un humano toque "Reiniciar rutina" (`hooks/useRoutines.ts:219-229`, `MyDayScreen.tsx:79-85`). Para una agenda diaria, esto rompe el caso de uso principal (repetición diaria) sin que el usuario entienda por qué.
3. **Sin recuperación de PIN**: un adulto que olvida el PIN de 4 dígitos queda bloqueado permanentemente de Modo Adulto sin borrar toda la app.
4. **Cero feedback háptico/sonoro de interfaz**: no hay `expo-haptics` ni sonidos de UI (aparte del TTS) en ningún botón; para una app dirigida a niños neurodivergentes donde el refuerzo sensorial inmediato es valioso, esta ausencia es notable.
5. **Identidad visual mínima**: logo = emoji dentro de un círculo, sin ilustración de marca, sin splash animado, sin transición de bienvenida más allá de un botón "Comenzar". Se percibe como un scaffolding funcional, no como una app comercial pulida (evaluación cualitativa, pero consistente con la ausencia total de `assets/images/*`, `assets/sounds/*`, fuentes personalizadas — ver `assets/*/.gitkeep`).
6. **Reutilización de `ComingSoonScreen` para dos conceptos distintos** ("Juega & Regula" y "Mundo Sensorial") con el mismo mensaje genérico — un usuario que llega ahí desde Calma no sabe si tocó algo roto o si de verdad no existe nada todavía.
7. **Doble nombre para la misma sección**: el botón en Home dice "Juega & Regula" (`HomeScreen.tsx:47`) pero Calma 360 lo llama "Mundo Sensorial" (`CalmCommunicationScreen.tsx:34-38`) y el propio directorio de código se llama `sensory-games` con README "Juega & Regula". Tres nombres para una sección que además no existe — inconsistencia de producto que un usuario notará.
8. **Sin cambio de perfil visible dentro de Mi Voz/Mi Día**: cambiar de perfil solo es accesible desde `HomeScreen` (`styles.footer`, línea 63-70); si un padre está en medio de editar tarjetas y necesita cambiar de niño, debe volver varias pantallas atrás.

## 7. Problemas de accesibilidad

**Lo que sí está bien resuelto** (para no subestimar el trabajo ya hecho):
- Área táctil mínima consistente de 64dp (`shared/theme/spacing.ts:23`, `BigButton.tsx:68`).
- `accessibilityRole`, `accessibilityLabel` y `accessibilityHint` presentes de forma sistemática en botones y tarjetas interactivas (verificado en `AacCardTile.tsx:47-49`, `PhraseBar.tsx:33`, `ProfileCard.tsx:18`, etc.).
- Paleta de bajo contraste agresivo declarada como principio de diseño (`shared/theme/colors.ts:1-6`).

**Lo que falta o es dudoso**:
1. **`reduceMotion` no tiene efecto real** (ver §5) — un usuario que activa esta preferencia por sensibilidad al movimiento no obtiene ninguna protección real, lo cual es peor que no ofrecer el ajuste en absoluto, porque genera una falsa sensación de seguridad.
2. **Sin soporte de tamaño de texto del sistema operativo** (Dynamic Type / escalado de fuente del SO): los tamaños están fijados en píxeles absolutos (`shared/theme/typography.ts:9-14`), no hay uso de `allowFontScaling` gestionado explícitamente ni verificación de que la app respete el ajuste de accesibilidad del teléfono.
3. **Sin modo de alto contraste** más allá de la única paleta pastel; no hay alternativa para usuarios con baja visión.
4. **No se verificó (ni es verificable sin dispositivo) el comportamiento real con lector de pantalla** (TalkBack/VoiceOver) más allá de que las props de accesibilidad estén presentes en el código — esto es una limitación explícita de esta auditoría basada en código, no una afirmación de que funciona.
5. **El propio roadmap reconoce que la Fase 11 ("Accesibilidad y pruebas") no se ha hecho** (`ROADMAP.md:24`), y el propio `GOOGLE_PLAY_COMPLIANCE.md:56-58` lista "validar tamaños de toque, contraste y navegación con lector de pantalla" como pendiente — es decir, el propio equipo nunca declaró esto como cerrado.

## 8. Problemas de persistencia

1. **Sin backup/exportación**: todos los datos (perfiles, tarjetas AAC personalizadas, fotos, rutinas) viven exclusivamente en `AsyncStorage` del dispositivo (`services/storage/asyncStorage.ts`). Si se desinstala la app, se pierde el teléfono, o se limpia la caché del sistema operativo, **todo el trabajo de meses de un padre/terapeuta configurando el comunicador de un niño se pierde sin posibilidad de recuperación**. Esto es crítico para el caso de uso real de una app AAC.
2. **Corrupción silenciosa**: `getItem` en `asyncStorage.ts:9-14` captura cualquier error de `JSON.parse` y devuelve `null` silenciosamente. Esto evita que la app crashee, pero significa que un dato corrupto se trata igual que "nunca se guardó nada" — para tarjetas AAC esto dispara la siembra del vocabulario por defecto de nuevo (`hooks/useAacCards.ts:23-31`), lo cual podría **sobrescribir silenciosamente** el hecho de que había datos (corruptos) previos, sin ningún aviso al usuario de que "se perdió algo".
3. **PIN en texto plano**: `pinRepository.ts` guarda el PIN de 4 dígitos sin ningún hashing (`services/storage/pinRepository.ts:17-19`). El propio comentario del código lo justifica correctamente como "barrera parental, no mecanismo de seguridad criptográfica" — una decisión de diseño razonable y explícita, no un descuido, pero vale la pena que quede registrado en esta auditoría por si el criterio cambia al ir a producción comercial.
4. **Sin versionado/migración de esquema**: los campos opcionales (`usageCount?`, `active?`, `audioUri?`, todos los de `ChildProfilePreferences`) se resuelven con `??` en tiempo de lectura en vez de una migración explícita. Funciona hoy, pero no escala bien a más de 2-3 rondas de cambios de esquema sin una estrategia de versión de datos.
5. **Fotos referenciadas por URI de caché del sistema**: `imageUri`/`avatarUri` guardan la URI que devuelve `expo-image-picker`, que en Android puede apuntar a una ubicación de caché temporal. No se verificó (haría falta un dispositivo) si esas imágenes sobreviven reinicios largos o limpiezas de caché del SO — riesgo de fotos "rotas" con el tiempo si la URI no es persistente.

## 9. Componentes que deben eliminarse

1. **`ComingSoonScreen` como destino final de producto** — no debe eliminarse el componente en sí (es útil durante desarrollo), pero **no debería llegar a manos de usuarios reales** apuntando a "Juega & Regula"/"Mundo Sensorial" en una versión comercial. O se implementa el contenido real, o se oculta la entrada del menú hasta que exista.
2. **El botón "Juega & Regula" en `HomeScreen`** debería quitarse temporalmente (no solo dejarlo apuntando a un stub) si el objetivo es lanzar una versión comercial antes de construir los juegos — mostrar una función central del producto que no hace nada daña más la percepción de calidad que no mostrarla.
3. **El toggle "Reducir movimiento" en `ProfileFormScreen`** debería ocultarse hasta que tenga un efecto real, por la razón de accesibilidad explicada en §5 y §7.

## 10. Componentes que pueden conservarse

1. Todo el motor de tarjetas AAC (`useAacCards`, `aacCardsRepository`, `AacCardTile`/`AacCardVisual`, categorías, búsqueda, favoritos/recientes/más usados) — es sólido, bien aislado por perfil, y es la base correcta sobre la que construir el resto.
2. `PhraseContext`/`PhraseBar` — el constructor de frases con cola de TTS serializada es una solución correcta a un problema real (audio solapado).
3. El sistema de perfiles y su aislamiento de datos (`ProfilesContext`, `profileDataRegistry`) — el patrón de registro de limpieza es una buena decisión de arquitectura, extensible a futuros módulos (juegos, grabaciones) sin acoplar `profiles` a cada feature.
4. `Mi Día` (rutinas) en su totalidad — con el único ajuste del reinicio automático (§6), es una funcionalidad completa y coherente.
5. El PIN de Modo Adulto y la separación Niño/Adulto a nivel de navegación — la arquitectura (ningún import cruzado de pantallas de edición hacia Modo Niño) es correcta y debe mantenerse como principio al construir lo que falta.
6. `services/storage/*` como capa base — el wrapper tipado sobre AsyncStorage y el patrón de claves por perfil es reutilizable para todo lo que falta (grabaciones, progreso de juegos).

## 11. Propuesta concreta para transformar el producto actual en una aplicación comercial profesional

No se implementa nada de esto todavía (instrucción explícita); se deja como hoja de ruta para autorización posterior.

1. **Cerrar la brecha de Mundo Sensorial antes que cualquier otra cosa.** Es el 25% del producto (una de cuatro columnas) y hoy es 0%. Empezar por 1-2 juegos simples y realmente pulidos (p. ej. "Revienta burbujas" y "Respira conmigo", que además resuelve directamente el hueco de Calma 360) antes que los 6 a la vez.
2. **Rediseñar Calma 360 como su propia pestaña de primer nivel**, accesible con un botón fijo desde Home (y opcionalmente flotante desde cualquier pantalla de Modo Niño), no enterrada dentro de Mi Voz. Añadir al menos un ejercicio de respiración guiado con temporizador visual simple (no necesita animación compleja: un círculo que crece/decrece con `Animated` de React Native, sin dependencias nuevas, ya resolvería el 80% del valor).
3. **Sustituir/complementar los emoji por un set de pictogramas reales.** Evaluar ARASAAC (licencia libre, ampliamente usado en apps AAC) como fuente de imágenes, manteniendo el emoji como fallback rápido para tarjetas creadas por el usuario.
4. **Backup/exportación de datos como prioridad P0 comercial**, no P2: exportar/importar un JSON (o compartir por el sistema nativo) de perfiles+tarjetas+rutinas. Sin esto, cualquier terapeuta u organización que configure decenas de tarjetas personalizadas corre el riesgo de perder ese trabajo por completo.
5. **Flujo de recuperación de PIN** (p. ej. pregunta de seguridad simple, o un correo/código de recuperación si en algún momento se agrega cualquier identidad — hoy no hay ninguna, así que probablemente la vía más simple es un "PIN maestro" fijo de fábrica documentado en la política de privacidad, o un flujo de "restablecer y perder datos" con confirmación fuerte).
6. **Grabación de voz familiar**: es una funcionalidad diferenciadora real para AAC (la voz de mamá/papá diciendo la palabra en vez de un TTS genérico). Requiere `expo-audio` + permiso de micrófono; el campo `audioUri` ya está reservado en el modelo de datos, así que el costo de implementación es acotado.
7. **Pulido de identidad visual**: encargar/generar iconografía e ilustraciones propias (más allá de un solo emoji de logo), un splash real, y considerar una fuente accesible dedicada (la carpeta `assets/fonts/` ya existe, vacía).
8. **Pantalla "Acerca de / Privacidad" dentro de Modo Adulto**, requisito no solo de percepción profesional sino de cumplimiento de Google Play para apps infantiles (ya señalado como pendiente en `docs/GOOGLE_PLAY_COMPLIANCE.md`).
9. **Unificar el nombre de la sección de juegos** en un solo término en toda la app y el código (hoy: "Juega & Regula" en Home, "Mundo Sensorial" en Calma, `sensory-games` en código).
10. **Auto-reinicio diario de rutinas de Mi Día**, con opción de que el adulto elija si el reinicio es automático a medianoche o manual.

## 12. Prioridades

### P0 (bloquean una versión comercial mínima creíble)
- Implementar al menos 2-3 juegos reales de Mundo Sensorial (o retirar la entrada de menú hasta tenerlos).
- Backup/exportación de datos (riesgo de pérdida total de trabajo del usuario).
- Acceso a Calma 360 en un toque real desde cualquier pantalla (cumplir lo que el propio código dice que ya cumple).
- Recuperación/cambio de PIN de Modo Adulto.
- Pantalla de privacidad/términos en Modo Adulto (requisito de tienda para apps infantiles).

### P1 (necesarios para percepción de calidad comercial y accesibilidad real)
- Reemplazar/complementar emoji por pictogramas AAC reales.
- Auto-reinicio diario de rutinas de Mi Día.
- Hacer funcional (o eliminar) el ajuste "Reducir movimiento".
- Verificación real en dispositivo con lector de pantalla (TalkBack/VoiceOver) — Fase 11 nunca ejecutada.
- Unificar nomenclatura "Juega & Regula" / "Mundo Sensorial".
- Feedback háptico/sonoro básico en interacciones clave.

### P2 (mejoran el producto pero no bloquean un lanzamiento)
- Grabación de voz familiar.
- Selector de idioma/voz de TTS.
- Contextos rápidos de vocabulario (Casa/Escuela/Terapia).
- Edición del vocabulario núcleo desde la UI.
- Fotos/audio por paso de rutina en Mi Día.
- Identidad visual de marca (ilustraciones, splash, fuente propia).
- Completar los 3 juegos restantes de Mundo Sensorial (una vez validados los primeros).

---

## 13. Porcentaje estimado de cumplimiento funcional real

### Metodología

Se calcula como el promedio simple de las cuatro columnas de producto que la propia auditoría pidió evaluar (Mi Voz AAC, Mundo Sensorial, Calma 360, Modo Adulto/Home), asumiendo que cada una pesa aproximadamente igual en la promesa de marca del producto — es el criterio más defendible sin datos de negocio sobre qué pilar es más importante para el usuario final. Los porcentajes por pilar están justificados con evidencia de código en las secciones §1-§2.

| Pilar | % | Base |
|---|---|---|
| Mi Voz AAC | ~70% | Motor de comunicación sólido (85%) lastrado por ausencia de pictogramas reales, voz familiar e idioma (§1.1) |
| Mundo Sensorial | 0% | Carpeta vacía salvo README (§1.2) |
| Calma 360 | ~25% | Solo el sub-caso de frases de emergencia; sin respiración, sin temporizador, sin acceso real de "un toque" (§1.3) |
| Modo Adulto / Home | ~55% | CRUD funcional pero sin backup, recuperación de PIN, ni privacidad; navegación sólida pero visualmente de prototipo (§1.4, §1.5) |

**Promedio: ≈ 37-40% de cumplimiento funcional real** respecto a lo que el conjunto del producto (Mi Voz + Mundo Sensorial + Calma 360 + Modo Adulto, como fue declarado "técnicamente completo" tras 7A-7K) necesitaría para considerarse una aplicación comercial terminada.

Esto es consistente con lo que ya reconoce el propio repositorio: `docs/ROADMAP.md` marca como pendientes las fases de juegos (6-7), modo adulto ampliado (8), almacenamiento robusto (9), diseño definitivo (10) y accesibilidad/pruebas (11) — cinco de las doce fases planeadas, y precisamente las que más pesan en la brecha detectada aquí. **El hecho de que TypeScript/ESLint/navegación/build pasen no contradice este número: esas herramientas verifican que el código compila y no tiene errores de tipo, no que el producto cumpla su promesa funcional** — que es exactamente la distinción que esta auditoría tenía instrucción de hacer.

---

*Fin de la auditoría. Sin cambios de código, build, versionCode ni configuración EAS, según lo solicitado. A la espera de autorización para priorizar e implementar.*
