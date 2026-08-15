# Sistema de Diseño y Accesibilidad — Sense & Play Adventures 360

**Estado:** ESPECIFICACIÓN CERRADA para aprobación. Ningún token, componente o pantalla fue modificado en el código para producir este documento.
**Complementa:** `docs/PRODUCT_MASTER_SPEC.md`.

## 0. Objetivo de esta especificación

Cerrar la brecha cualitativa detectada en la auditoría (§6.5): "se percibe como scaffolding funcional, no como app comercial pulida". Este documento define el sistema visual e interactivo con la precisión suficiente para que cualquier pantalla nueva construida a partir de R1 sea consistente por defecto, sin que cada desarrollador reinvente espaciado, color o iconografía pantalla por pantalla — que es exactamente lo que causó el problema actual (comparar, por ejemplo, cómo cada screen de hoy define sus propios `StyleSheet.create` casi idénticos con variaciones menores de espaciado).

Identidad **Sense & Play** se conserva (paleta pastel de bajo contraste agresivo, botones grandes, tono cálido) — esta especificación la refina, no la reemplaza.

---

## 1. Fundamentos (tokens)

### 1.1 Tipografía

**Diagnóstico**: hoy `typography.fontFamily` es `undefined` (fuente del sistema por defecto), y la escala solo tiene 4 tamaños (`sm/md/lg/xl`, `shared/theme/typography.ts`). Es funcional pero no distintiva ni óptima para el público objetivo.

**Especificación**:
- **Familia tipográfica**: adoptar **Atkinson Hyperlegible** (diseñada explícitamente para legibilidad en baja visión, licencia SIL Open Font — gratuita, uso comercial permitido) como fuente principal de toda la app. Empaquetada en `assets/fonts/` (hoy vacío) y cargada vía `expo-font` en el arranque de `RootApp`.
- **Escala tipográfica completa** (reemplaza la escala de 4 pasos actual):

| Token | Tamaño | Uso |
|---|---|---|
| `display` | 40sp | Título de Bienvenida únicamente |
| `h1` | 32sp | Título de pantalla (equivalente al `xl` actual) |
| `h2` | 24sp | Título de sección (equivalente al `lg` actual) |
| `bodyLg` | 20sp | Texto de tarjetas AAC en tamaño "grande" |
| `body` | 18sp | Texto estándar (equivalente al `md` actual) |
| `bodySm` | 15sp | Texto secundario (equivalente al `sm` actual) |
| `caption` | 13sp | Etiquetas auxiliares, timestamps, contadores |

- **Line-height**: 1.3× el tamaño de fuente como mínimo en todo texto de más de una línea (requisito de legibilidad, no solo estético).
- **Escalado del sistema operativo**: todo `<Text>` debe permitir `allowFontScaling` (comportamiento por defecto de React Native, **no desactivarlo explícitamente en ningún componente** — se audita en R8 que ningún componente nuevo lo desactive sin justificación documentada).

### 1.2 Color

**Diagnóstico**: la paleta actual (`shared/theme/colors.ts`) es coherente y de bajo contraste agresivo (principio correcto para el público objetivo), pero le faltan tokens semánticos (estados, elevación, foco) y no tiene contraste verificado documentado.

**Especificación**:
- Se conserva la paleta base íntegra (`background #FDF6EC`, `primary #7FB8A4`, etc.) como identidad de marca.
- Se agregan tokens semánticos nuevos:

| Token nuevo | Propósito |
|---|---|
| `surfaceElevated` | Tarjetas/paneles que deben distinguirse de `surface` plano (modales, hojas) |
| `focusRing` | Contorno de foco visible para navegación por teclado/switch externo (accesibilidad motora) |
| `disabledBackground` / `disabledText` | Estado deshabilitado consistente (hoy cada componente define su propia opacidad ad-hoc) |
| `overlayScrim` | Fondo semitransparente detrás de diálogos/confirmaciones |

- **Contraste**: todo par texto/fondo del sistema debe verificarse contra WCAG 2.1 AA (4.5:1 para texto normal, 3:1 para texto grande ≥24sp) antes de R9. Se documenta como tabla de verificación en el checklist de R8/R9 (`REBUILD_ROADMAP_R1_R10.md`), no se asume que la paleta actual ya lo cumple sin medirlo.
- **Modo oscuro**: decisión explícita de **no implementarlo** en esta reconstrucción — el público objetivo (niños con sensibilidad sensorial) se beneficia más de una paleta única, predecible y ya calibrada para bajo contraste agresivo que de alternar entre dos temas. `userInterfaceStyle: "light"` en `app.json` se mantiene.

### 1.3 Espaciado y radio

Se conserva íntegra la escala actual (`shared/theme/spacing.ts`: `xs 4 / sm 8 / md 16 / lg 24 / xl 32 / xxl 48`, radios `sm 8 / md 16 / lg 24 / pill 999`, área táctil mínima `64dp`) — ya es correcta y coherente con buenas prácticas de accesibilidad motora. Se añade únicamente:

| Token nuevo | Valor | Uso |
|---|---|---|
| `hairline` | 1dp | Separadores finos (reemplaza `borderWidth: 1` hardcodeado repetido en cada pantalla) |
| `heroSize` | 96 | Elementos hero (burbuja de respiración de Calma 360, iconos de resultado) |

### 1.4 Iconografía

**Diagnóstico** (auditoría implícita, detectado en revisión de código durante esta especificación): la app mezcla emoji como contenido AAC legítimo (correcto para vocabulario) con emoji como **iconos de interfaz** (`↑`/`↓`/`🗑️`/`⌫` en `AacManagerScreen.tsx`, `RoutineFormScreen.tsx` para "mover arriba/abajo/eliminar"). Usar emoji para controles de interfaz es inconsistente entre plataformas/fabricantes Android y no se percibe como profesional.

**Especificación**:
- Se separa estrictamente: **emoji/pictogramas = contenido AAC** (vocabulario, tarjetas, categorías — se mantiene y se refuerza con el set de pictogramas de `PRODUCT_MASTER_SPEC.md` §2.3); **iconos de interfaz = un set de iconos vectorial consistente**.
- Se adopta `@expo/vector-icons` (ya viene incluido en cualquier proyecto Expo, sin dependencia nueva que instalar), familia `Ionicons` como set principal por su legibilidad a tamaños grandes.
- Reemplazos concretos: mover arriba/abajo → `chevron-up`/`chevron-down`; eliminar → `trash-outline`; editar → `pencil-outline`; favorito → `star`/`star-outline` (el emoji ⭐ se conserva aquí porque ya funciona bien como indicador visual reconocible, es una excepción documentada, no un descuido); volver → `chevron-back`; cerrar → `close`.

### 1.5 Movimiento (motion) y hápticos

**Diagnóstico**: cero librerías de animación en el proyecto hoy; cero hápticos.

**Especificación**:
- Se introduce `Animated` de React Native (sin dependencia nueva) como motor de microinteracciones base: escala sutil al presionar un botón/tarjeta (`0.97` de escala, 100ms), transición de aparición de listas (`fade + translateY` corto).
- Para necesidades más complejas de animación fluida y de alto rendimiento (burbuja de respiración de Calma 360, Mundo Sensorial), se evalúa `react-native-reanimated` como dependencia nueva **solo si** `Animated` demuestra limitaciones reales de rendimiento durante R3/R4 — no se agrega la dependencia de forma preventiva.
- Nueva dependencia: `expo-haptics`, con feedback táctil ligero (`ImpactFeedbackStyle.Light`) en: tocar una tarjeta AAC, completar un paso de rutina, acierto en un juego de Mundo Sensorial. Respeta un nuevo toggle de perfil `hapticsEnabled` (default `true`), independiente de `soundEnabled`.
- **Regla no negociable**: toda animación no esencial (decorativa, de transición, de énfasis) debe consultar `reduceMotion` y desactivarse o sustituirse por un cambio de estado instantáneo cuando está activo. Animaciones que comunican información funcional (p. ej. el avance de un temporizador) se mantienen pero en su variante "por pasos discretos" en vez de interpolación continua (ya especificado por juego en `PRODUCT_MASTER_SPEC.md` §3 y §4.2).

### 1.6 Componentes base (design system)

| Componente | Estado actual | Cambio especificado |
|---|---|---|
| `BigButton` | Funcional, 4 variantes | Se mantiene la API; se añade variante `icon` (para los iconos de §1.4) y estado `loading` explícito (spinner inline en vez de solo `disabled`) |
| `ScreenContainer` | Funcional | Se añade soporte de estados: `loading`, `empty`, `error` como props declarativas en vez de que cada pantalla implemente su propio `ActivityIndicator`/texto suelto (hoy duplicado en `AacManagerScreen`, `RoutineManagerScreen`, `ProfileSelectorScreen`, cada uno con su propio `styles.empty` casi idéntico) |
| `AacCardTile` | Funcional | Se extiende para pictogramas (`PRODUCT_MASTER_SPEC.md` §2.3), sin cambio de API externa |
| `ProfileAvatar` | Funcional | Sin cambios |
| — nuevo: `ConfirmDialog` | No existe (hoy cada pantalla usa `Alert.alert` nativo directamente) | Componente compartido para confirmaciones destructivas, con copy consistente y el mismo patrón visual en toda la app, en vez de depender del estilo nativo del SO (que varía entre Android/iOS y no sigue la identidad visual de la app) |
| — nuevo: `EmptyState` | No existe (cada pantalla define su propio texto+estilo de "todavía no hay X") | Componente compartido: ilustración/emoji + texto + acción sugerida, consistente en Mi Voz, Mi Día, Perfiles, Mundo Sensorial |
| — nuevo: `Toast`/`InlineBanner` | No existe | Para confirmaciones no bloqueantes ("Copia de seguridad guardada") y errores no críticos (corrupción de datos, ver `PRODUCT_MASTER_SPEC.md` §7.4.5) |

---

## 2. Estados obligatorios por pantalla

Toda pantalla nueva o refactorizada a partir de R1 debe definir explícitamente estos cinco estados (no todos aplican a toda pantalla, pero deben evaluarse conscientemente, no omitirse por defecto):

1. **Carga (loading)**: mientras se leen datos async (perfiles, tarjetas, rutinas). Hoy ya presente de forma parcial (`ActivityIndicator` en varias pantallas) — se estandariza vía `ScreenContainer`.
2. **Vacío (empty)**: cuando no hay datos que mostrar (sin perfiles, sin tarjetas, sin rutinas). Ya existe como texto suelto hoy; se estandariza con el componente `EmptyState`.
3. **Error**: cuando una lectura/escritura falla (nuevo — hoy prácticamente no existe manejo de error visible al usuario, ver `PRODUCT_MASTER_SPEC.md` §7.4.5).
4. **Poblado (contenido normal)**: el caso ya cubierto hoy en la mayoría de pantallas.
5. **Confirmación**: para toda acción destructiva (eliminar tarjeta, perfil, rutina, restaurar backup) — hoy usa `Alert.alert` nativo; pasa a usar `ConfirmDialog` (§1.6) de forma consistente.

---

## 3. Feedback e interacción

- **Estados de presión**: todo elemento tocable ya usa el patrón `({ pressed }) => opacity` (correcto, se mantiene) — se añade la micro-escala de `Animated` (§1.5) como refuerzo adicional, no como reemplazo.
- **Estados activo/seleccionado**: donde ya existe (chips de categoría, tamaño de tablero) se mantiene el patrón visual actual (relleno de color) — se documenta como el patrón oficial para cualquier selector nuevo.
- **Confirmaciones no bloqueantes**: usar `Toast`/`InlineBanner` (§1.6) para "Guardado", "Copia de seguridad creada" — nunca un `Alert.alert` para algo que no requiere que el usuario tome una decisión.

---

## 4. Tablet, teléfono y orientación

Ver especificación funcional completa en `PRODUCT_MASTER_SPEC.md` §1.5 (`useResponsiveColumns`). Reglas visuales complementarias:

- Márgenes de pantalla (`ScreenContainer` `padding: spacing.lg` hoy fijo) pasan a ser proporcionales en tablet: se limita el ancho de contenido de texto largo (formularios, listas) a un máximo de ~680dp centrado, para que un formulario no se estire de borde a borde en una tablet de 10".
- Grillas de tarjetas (Mi Voz, Mundo Sensorial, selector de perfiles) sí usan el 100% del ancho disponible con más columnas, porque ahí más contenido visible es una ventaja, no un problema de legibilidad de línea larga.
- Orientación: ver decisión condicionada en `PRODUCT_MASTER_SPEC.md` §1.5 (cambiar `orientation: "portrait"` a `default` en `app.json`, ejecutado en R9 tras validar pantalla por pantalla, no antes).

---

## 5. Accesibilidad

### 5.1 Lo que ya funciona hoy (se conserva como línea base, no se re-litiga)

- Área táctil mínima 64dp consistente (`minTouchTarget`, `BigButton.tsx:68`).
- `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` presentes de forma sistemática en elementos interactivos (verificado en la auditoría en `AacCardTile.tsx`, `PhraseBar.tsx`, `ProfileCard.tsx`, `PinPad.tsx`, entre otros).
- Paleta de bajo contraste agresivo como principio de diseño ya vigente.

### 5.2 Lector de pantalla (TalkBack / VoiceOver)

- **Orden de foco**: se audita explícitamente en R8 que el orden de lectura de cada pantalla siga el orden visual lógico (arriba→abajo, izquierda→derecha) — React Navigation + React Native siguen el orden del árbol por defecto, pero los layouts con `position: 'absolute'` (ej. `stepBadge` en `MyDayScreen.tsx:197-208`, `favorite` en `AacCardTile.tsx:86-91`) deben verificarse manualmente porque el orden del DOM no siempre coincide con el orden visual cuando hay posicionamiento absoluto.
- **Agrupación**: listas de tarjetas/rutinas deben anunciar su posición ("tarjeta 3 de 12") vía `accessibilityValue` donde aplique — no implementado hoy, se añade en R8.
- **Verificación real en dispositivo**: la auditoría fue explícita en que esto **no se puede verificar solo leyendo código** (`POST_V7_PRODUCT_GAP_ANALYSIS.md` §7.4). Se especifica como criterio de aceptación de R8/R10: sesión de prueba manual con TalkBack activado recorriendo el flujo completo de cada uno de los 5 pilares, documentando cualquier elemento no anunciado o mal etiquetado.

### 5.3 Contraste

Verificación cuantitativa (no solo visual) contra WCAG AA para cada combinación texto/fondo del sistema de color (§1.2), documentada como tabla de resultados antes de cerrar R9.

### 5.4 Objetivos táctiles

Ya cumplidos por el token `minTouchTarget = 64dp`; se audita en R8/R9 que ningún componente nuevo (iconos de §1.4, controles de Mundo Sensorial) rompa este mínimo — los iconos de interfaz en particular deben tener un área táctil de 64dp aunque el glifo visual sea más pequeño (padding invisible alrededor del ícono, no reducir el ícono al tamaño del área táctil).

### 5.5 `reduceMotion` real (cierre directo del hallazgo de la auditoría)

**Diagnóstico**: hoy el toggle existe y se persiste (`ChildProfilePreferences.reduceMotion`) pero no se lee en ningún lugar del código — es un placeholder puro (auditoría §5.1, §7.1).

**Especificación de comportamiento real**:
1. Se crea un hook compartido `useReduceMotion()` en `shared/hooks/` que lee la preferencia del perfil activo (con fallback al ajuste de accesibilidad del sistema operativo, `AccessibilityInfo.isReduceMotionEnabled()`, para que la app respete también la preferencia de accesibilidad ya configurada a nivel de SO, no solo la del perfil).
2. Todo punto de animación de la app (transiciones de `Animated` en §1.5, burbuja de respiración en Calma 360, movimiento decorativo en los 6 juegos de Mundo Sensorial) **debe** consultar este hook y aplicar su variante reducida ya especificada individualmente en `PRODUCT_MASTER_SPEC.md` §3 y §4.2.
3. Criterio de aceptación objetivo (verificable, no subjetivo): con `reduceMotion` activo, ninguna animación de la app debe tener una duración continua mayor a la necesaria para un cambio de estado instantáneo — todo movimiento decorativo desaparece o se convierte en cambio discreto de estado.

### 5.6 Reducción de estímulos (más allá de movimiento)

Distinto de `reduceMotion` (que es sobre animación): un perfil puede además marcar `lowStimulationMode` (nuevo) que, activado, reduce simultáneamente: densidad de elementos en pantalla (Mundo Sensorial usa la configuración "mínima" de cada juego por defecto), paleta reducida a tonos neutros donde sea posible, y prioriza siempre mostrar el acceso a la Pantalla de baja estimulación de Calma 360 (`PRODUCT_MASTER_SPEC.md` §4.3) de forma más prominente.

### 5.7 Tolerancia a errores y salida clara

- Ninguna acción del niño debe ser irreversible sin pasar por Modo Adulto (ya cumplido hoy: eliminar/editar solo tras PIN).
- Todo estado "quedé atascado" (perdí el rastro en un juego, no sé cómo volver) tiene una salida de un toque garantizada por la barra universal Inicio/Calma (`PRODUCT_MASTER_SPEC.md` §1.2, §1.4) — este es, en términos de accesibilidad cognitiva, el cambio de mayor impacto de toda la reconstrucción.
- Mensajes de error (§2, estado "Error") deben usar lenguaje simple, sin jerga técnica, con una acción de recuperación clara ("Reintentar", "Volver a Inicio") — nunca un mensaje de error crudo de JavaScript/red visible al usuario.

---

## 6. Checklist de verificación (para R9/R10)

- [ ] Todo texto usa la escala tipográfica de §1.1, ninguna pantalla define tamaños de fuente sueltos.
- [ ] Todo color proviene de los tokens de §1.2, cero valores hex sueltos en `StyleSheet.create` de pantallas de producto.
- [ ] Todo ícono de interfaz (no-AAC) proviene de `@expo/vector-icons`, cero emoji usados como control de UI.
- [ ] Toda pantalla implementa conscientemente los 5 estados de §2 (aunque la decisión sea "no aplica").
- [ ] Toda animación no esencial respeta `useReduceMotion()`.
- [ ] Contraste AA verificado y documentado para cada combinación texto/fondo activa.
- [ ] Sesión manual con TalkBack completada sobre los 5 pilares, sin elementos huérfanos de foco/etiqueta.
- [ ] Barra universal Inicio/Calma presente y funcional en el 100% de las pantallas de Modo Niño.
