# Especificación Maestra de Producto — Sense & Play Adventures 360

**Estado:** ESPECIFICACIÓN CERRADA para aprobación. Ningún código, build, `versionCode` o configuración EAS fue modificado para producir este documento.
**Precede a:** `docs/REBUILD_ROADMAP_R1_R10.md`, `docs/DEFINITION_OF_DONE.md`, `docs/UX_UI_SYSTEM_SPEC.md`, `docs/FUNCTIONAL_ACCEPTANCE_MATRIX.md`.
**Basado en:** `docs/POST_V7_PRODUCT_GAP_ANALYSIS.md` (auditoría aceptada).

## 0. Principio obligatorio (rige todo este documento)

> Una función no está terminada porque exista un archivo, una ruta, un botón, una tarjeta, un componente, un CRUD o una pantalla. Está terminada cuando el flujo completo funciona de extremo a extremo, persiste cuando corresponde, tiene estados vacío/error/carga, es accesible, y produce una utilidad real para el usuario.

Cada especificación de esta guía se escribió para poder verificarse así. Donde una especificación no pueda verificarse de esta forma, no está completa como especificación.

## 0.1 Decisión abierta: nombre de marca

El proyecto tiene **tres nombres en uso simultáneo** hoy: `app.json` → "Sense & Play Adventures 360"; el repositorio y el mensaje del usuario → "Neuro 360" / "NEURO-360"; el paquete Android → `com.senseplayadventures.app`. Esta inconsistencia de marca es en sí misma un defecto de percepción comercial (ver auditoría, §6.7).

**Recomendación**: fijar un único nombre público antes de R1 y usarlo en todos los textos de UI, `app.json` (`expo.name`), tienda y documentación. Esta especificación usa **"Sense & Play Adventures 360"** como nombre de trabajo por ser el que ya está en `app.json`/store listing implícito, pero **esta decisión requiere confirmación explícita del usuario antes de R1** — es la única decisión de esta especificación que no se puede inferir del código ni de la auditoría.

---

## 1. Rearquitectura del producto

### 1.1 Los cinco espacios

| Espacio | Código | Quién lo usa | Protegido por PIN |
|---|---|---|---|
| A. Mi Voz AAC | `features/aac-communicator` | Niño (uso), Adulto (edición) | Solo edición |
| B. Mundo Sensorial | `features/sensory-games` (a construir) | Niño | No |
| C. Calma 360 | `features/calm-mode` (a extraer de `aac-communicator`) | Niño (uso), Adulto (config) | Solo config |
| D. Mi Día / Rutinas | `features/daily-routine` | Niño (uso), Adulto (edición) | Solo edición |
| E. Centro de Adultos | `features/parent-mode` (rediseñado) | Adulto | Sí, siempre |

**Decisión de arquitectura**: Calma 360 deja de ser una pantalla anidada dentro de `AacNavigator` (como hoy, `features/aac-communicator/screens/CalmCommunicationScreen.tsx`) y se convierte en su **propio módulo de primer nivel**, montado directamente en `RootNavigator`, exactamente al mismo nivel que Mi Voz, Mundo Sensorial y Mi Día. Esto es la corrección directa del hallazgo de la auditoría §6.1/§1.3: Calma no puede depender de que el usuario ya esté dentro de otro módulo.

### 1.2 Home (Modo Niño) — estructura definitiva

Home dejará de ser una lista vertical de 3 botones (`app/screens/HomeScreen.tsx` actual) y pasa a ser una **grilla de 4 accesos principales de igual jerarquía visual**, más una barra de acceso urgente siempre visible:

```
┌─────────────────────────────────────────┐
│  [Avatar] Nombre del niño     [⚙ cambiar]│  ← franja superior, siempre visible
├─────────────────────────────────────────┤
│                                           │
│   ┌───────────┐        ┌───────────┐    │
│   │ 🗣️ Mi Voz  │        │ 🎮 Mundo   │    │
│   │            │        │ Sensorial  │    │
│   └───────────┘        └───────────┘    │
│                                           │
│   ┌───────────┐        ┌───────────┐    │
│   │ 🗓️ Mi Día  │        │ 😌 Calma   │    │
│   │            │        │            │    │
│   └───────────┘        └───────────┘    │
│                                           │
├─────────────────────────────────────────┤
│         [ 😌 CALMA — botón urgente ]      │  ← barra inferior fija, todas las pantallas de Modo Niño
└─────────────────────────────────────────┘
```

- Las 4 tarjetas tienen **el mismo tamaño y jerarquía visual** (a diferencia de hoy, donde "Mi Voz" es `primary` y el resto `secondary`) — ningún pilar debe insinuar visualmente que otro es secundario, porque hasta que R3/R4 cierren, eso sería mentirle al usuario sobre qué tan terminado está cada uno.
- **Botón universal de Calma**: barra fija (no flotante encima del contenido, para no tapar controles) en la parte inferior de **toda pantalla de Modo Niño** — Home, Mi Voz (todas sus subpantallas), Mundo Sensorial (todas), Mi Día. Un toque, sin excepciones, sin importar en qué pantalla esté el niño. Esto reemplaza el botón "Calma" que hoy solo vive en `AacLayout.tsx:39` y cierra la brecha de UX §6.1 de la auditoría.
- La franja superior con el nombre/avatar del perfil activo es constante en Home; "Cambiar perfil" se mueve a un ícono de engranaje pequeño en esa franja (hoy es un botón de ancho completo al final de la pantalla, `HomeScreen.tsx:63-70`) para no competir visualmente con los 4 accesos principales.

### 1.3 Navegación infantil vs. navegación adulta

Se mantiene el principio ya correcto en el código actual: **ninguna pantalla de Modo Niño importa código de edición** (verificado en la auditoría: `AacHomeScreen`, `AacCategoryScreen`, `MyDayScreen` no importan formularios). Esto se conserva como regla de arquitectura no negociable para todo lo nuevo:

- Todo componente bajo `screens/` de Modo Niño es de solo-interacción (tocar, ver, escuchar, jugar). Cero formularios, cero "editar", cero "eliminar".
- Toda pantalla de creación/edición/eliminación/configuración vive exclusivamente bajo una ruta alcanzable solo después de `PinGateScreen`.
- Regla de lint conceptual para R1: un componente en una carpeta `screens/` de Modo Niño no puede importar nada de una carpeta `screens/` de Modo Adulto del mismo feature, y viceversa no aplica (Modo Adulto sí puede reutilizar componentes visuales de Modo Niño, p. ej. `AacCardTile` para previsualizar).

### 1.4 Retorno seguro a Home

Regla nueva (no existe hoy de forma consistente): **toda pantalla de Modo Niño, sin excepción, debe tener dos salidas alcanzables en un toque**: (1) Volver (a la pantalla anterior) y (2) Home directo. Hoy `MyDayScreen.tsx:93`, `AacLayout.tsx:38` solo ofrecen "Volver"; si un niño navegó varios niveles (p. ej. Mundo Sensorial → un juego → pantalla de resultado), forzarlo a tocar "Volver" 3 veces para llegar a Home es un problema de usabilidad para el público objetivo (tolerancia baja a la frustración, necesidad de salida clara — ver también §9 accesibilidad). Un botón "🏠 Inicio" fijo, junto al botón universal de Calma en la barra inferior, resuelve esto sin rediseñar cada pantalla individualmente.

### 1.5 Comportamiento en tablet vs. teléfono

Hoy el layout es 100% `flexWrap` con anchos de tarjeta fijos en puntos (`cardWidthForBoardSize`, `features/aac-communicator/constants/boardSize.ts`) sin ninguna consulta a `Dimensions`/`useWindowDimensions`. Funciona, pero no aprovecha el espacio de una tablet (donde el público objetivo de terapeutas/aulas es frecuente) ni reacciona a rotación.

**Especificación**:
- Se introduce un hook compartido `useResponsiveColumns()` en `shared/hooks/` que devuelve el número de columnas recomendado según el ancho disponible (`useWindowDimensions`), con puntos de corte: `<400dp` → 2 columnas, `400-700dp` → 3-4 columnas (según `boardSize` del perfil), `700-1000dp` (tablet vertical) → 4-5 columnas, `>1000dp` (tablet horizontal) → 5-6 columnas.
- El `boardSize` configurado por el adulto (`2x2`...`4x4`) sigue siendo el **límite superior deseado**, no un valor absoluto: en pantallas grandes se permite más columnas de las configuradas solo si mejora la legibilidad (nunca menos tarjetas de las que el adulto configuró como mínimo).
- `app.json` fija hoy `orientation: "portrait"` para toda la app. **Se especifica cambiar esto a `default`** (permitir ambas orientaciones) condicionado a que R9 (integración/pulido) verifique que cada pantalla se comporta razonablemente en horizontal — es un cambio de configuración nativa, así que se declara aquí como decisión pero **su ejecución queda fuera del alcance de esta fase de especificación** (no se toca `app.json` hasta la fase de implementación correspondiente, con aprobación).
- Mundo Sensorial (R3) es el módulo más sensible a esto: los juegos de arrastre/trazo necesitan más espacio físico en tablet — su especificación (§3) lo detalla por juego.

---

## 2. Mi Voz AAC — nivel profesional

### 2.1 Qué se conserva de la base actual (ver auditoría §9-10)

El motor de tarjetas (`useAacCards`, `aacCardsRepository`, `AacCardTile`/`AacCardVisual`), categorías, búsqueda, favoritos/recientes/más usados, `PhraseContext`/`PhraseBar` y el aislamiento de datos por perfil ya cumplen el criterio de "terminado" y son la base sobre la que se construye esta sección. No se rehacen desde cero.

### 2.2 Categorías obligatorias (cobertura funcional)

La lista de categorías ya definida en `constants/categories.ts` cubre razonablemente el conjunto pedido. Se fija como **contrato de cobertura mínima** (no se puede quitar ninguna sin decisión explícita):

Necesidades, Emociones, Personas, Lugares, Alimentos y bebidas, Acciones, Dolor/malestar, Escuela, Casa, Baño, Sí/No, Ayuda, Emergencia, Juego, Objetos, Animales, Ropa, Rutinas, Palabras sociales — **más** el vocabulario núcleo siempre visible y las 3 categorías virtuales (Favoritos, Más usados, Recientes).

Cambio respecto a hoy: **Sí/No** no es hoy una categoría ni tarjetas dedicadas de primer nivel — existen como palabras sueltas dentro de "Quiero"/"No quiero" y en el vocabulario núcleo. Se especifica promover "Sí" y "No" a accesos de un toque garantizados desde `AacHomeScreen` (junto al vocabulario núcleo), porque son, junto con "Ayuda", el vocabulario de mayor criticidad funcional en cualquier sistema AAC.

### 2.3 Pictogramas — reemplazo del emoji genérico

**Diagnóstico** (auditoría §1.1, §11.3): hoy el 100% del set visual son emoji Unicode del sistema operativo. Esto no es aceptable como solución AAC profesional porque: (a) el renderizado varía entre fabricantes de Android y puede confundir al niño si cambia de dispositivo; (b) no cubre vocabulario específico/clínico; (c) no es lo que padres/terapeutas esperan de una app AAC seria (el estándar de la industria son sets de pictogramas dedicados: PCS, SymbolStix, ARASAAC, Mulberry, Widgit).

**Especificación de reemplazo**:
1. Adoptar un set de pictogramas de licencia compatible con app **comercial**: se recomienda **Mulberry Symbols** (licencia CC BY — permite uso comercial con atribución) como set primario. **ARASAAC y Sclera quedan descartados como set primario** porque su licencia (CC BY-NC-SA) prohíbe uso comercial sin acuerdo explícito con los autores — esta es una restricción legal real, no una preferencia de diseño, y debe verificarse con el equipo legal/de producto antes de R2 si se considera cualquier alternativa.
2. Empaquetar localmente (offline-first, principio ya vigente) el subconjunto de pictogramas necesario para cubrir el vocabulario semilla + categorías (unas 300-500 imágenes optimizadas, formato SVG o PNG comprimido) bajo `assets/images/pictograms/`.
3. `AacCardVisual` (`features/aac-communicator/components/AacCardVisual.tsx`) gana una tercera fuente de imagen además de foto/emoji: `pictogramId`. Orden de prioridad de renderizado por tarjeta: **foto personalizada** (si existe) → **pictograma del set** (si está asignado) → **emoji** (fallback final, nunca eliminado del todo porque sigue siendo válido para tarjetas creadas ad-hoc por un adulto sin acceso al set completo).
4. El vocabulario semilla (`constants/seedCards.ts`) y el vocabulario núcleo (`data/coreVocabulary.ts`) migran de emoji a `pictogramId` como su representación por defecto.
5. El editor de tarjetas (`AacCardFormScreen`) gana un selector de pictograma (grilla buscable por palabra) como alternativa a "elegir foto"/"tomar foto"/dejar el emoji.

### 2.4 Grabación y reproducción de voz familiar

**Diagnóstico** (auditoría §1.1, §3): `AacCard.audioUri` existe como campo reservado sin ninguna implementación. Es la funcionalidad diferenciadora más valiosa pendiente de un AAC serio (la voz de un familiar, no un TTS genérico, dice la palabra).

**Especificación**:
1. Nueva dependencia: `expo-audio` (API de audio vigente en Expo SDK 57, reemplaza a `expo-av`) para grabar y reproducir.
2. Nuevo permiso declarado en `app.json`: `NSMicrophoneUsageDescription` (iOS) vía el plugin correspondiente, y permiso `RECORD_AUDIO` en Android (gestionado por el plugin de `expo-audio`, mismo patrón que hoy usa `expo-image-picker` — sin declarar permisos "a mano").
3. En `AacCardFormScreen` (solo Modo Adulto, nunca alcanzable desde Modo Niño): botón "🎙️ Grabar voz" → graba, permite escuchar antes de guardar, permite volver a grabar, permite eliminar la grabación y volver a TTS.
4. Los archivos de audio se guardan como archivos reales en el sandbox de la app (`expo-file-system`, directorio de documentos), **no** como blobs en AsyncStorage/JSON — el campo `audioUri` de la tarjeta guarda la ruta del archivo, igual patrón que ya usa `imageUri` con `expo-image-picker`.
5. **Orden de reproducción al tocar una tarjeta en Modo Niño**: si `audioUri` existe y el archivo sigue presente en disco → reproducir ese audio grabado; si no → TTS (comportamiento actual). Este fallback ya está documentado como decisión futura en el comentario de `services/audio/speech.ts` — esta especificación lo cierra formalmente.
6. Límite de duración de grabación (ej. 5 segundos) para evitar grabaciones accidentalmente largas que rompan el ritmo de la comunicación.
7. Al eliminar un perfil, los archivos de audio de ese perfil se borran también (extensión del mismo `profileDataRegistry` que hoy limpia tarjetas AAC).

### 2.5 Tamaño, columnas y orden configurables

Ya funcional hoy (`AacSettingsScreen`, `boardSize`, `textSize`, reordenar con `moveCard`) — se conserva. Se extiende únicamente con el `useResponsiveColumns` de §1.5 para que "tamaño de tablero" sea un límite superior deseado, no una cifra absoluta, en pantallas grandes.

### 2.6 Selector de idioma/voz (nuevo, hoy no implementado)

`DEFAULT_SPEECH_LANGUAGE` fijo en `'es-ES'` (`shared/constants/app.ts:20`) pasa a ser una preferencia de perfil (`ChildProfilePreferences.speechLanguage`), con selector en `AacSettingsScreen` limitado a los idiomas/voces que `expo-speech` reporte disponibles en el dispositivo vía `Speech.getAvailableVoicesAsync()` — no se inventa soporte de idiomas que el motor TTS del dispositivo no tenga instalado.

### 2.7 Contextos rápidos (nuevo, hoy no implementado)

Un "contexto" es un filtro que prioriza un subconjunto de categorías/tarjetas sin duplicar datos: `Casa`, `Escuela`, `Terapia`, `Salidas`. Se implementa como un campo `contexts: string[]` opcional en `AacCard` (tarjeta puede pertenecer a 0, 1 o varios contextos) y un selector de contexto activo en `AacHomeScreen` que, cuando está activo, reordena/resalta primero las tarjetas de ese contexto dentro de cada categoría — no oculta el resto, para no generar la frustración de "no encuentro mi tarjeta".

---

## 3. Mundo Sensorial — seis experiencias reales

Reemplaza por completo el contenido de `features/sensory-games/README.md` (hoy: 6 juegos nombrados, 0 líneas de código). Los seis juegos definitivos:

### Principios comunes a los seis juegos (obligatorios, no negociables)

- **Sin condición de derrota**: ningún juego puede terminar en "perdiste". Como máximo, un juego tiene un estado "completado" o "sigue jugando indefinidamente hasta que el niño sale".
- **Salida inmediata**: botón "🏠 Inicio" y "😌 Calma" (barra universal, §1.2) siempre visibles y funcionales, incluso a mitad de una animación o interacción.
- **Pausa**: todo juego con movimiento/temporizador tiene un botón de pausa explícito que congela el estado (no solo silencia sonido).
- **Reducción de estímulos**: cada juego respeta `reduceMotion` (ver §9 de `UX_UI_SYSTEM_SPEC.md`) desactivando movimiento decorativo, parpadeo, y limitando la velocidad de elementos animados a un modo "estático por pasos" cuando está activo.
- **Sin sonido obligatorio**: respeta `soundEnabled` del perfil; ningún juego depende del audio para ser comprensible (refuerzo visual siempre presente además del sonoro).
- **Sin penalización por error**: tocar "mal" nunca resta puntos, nunca muestra una X roja agresiva ni un sonido de error fuerte; como máximo, una animación neutra de "intenta de nuevo" sin urgencia.
- **Configuración por perfil, desde Centro de Adultos**: velocidad (lento/medio), cantidad de elementos en pantalla, paleta de colores (evitar colores concretos si el niño tiene una sensibilidad conocida), duración de sesión sugerida (solo informativo, no bloquea).
- **Adaptación a tablet**: los juegos de arrastre/trazo (Trazos Calmados, Clasificación Visual) definen su área de juego como porcentaje del `useWindowDimensions` disponible, nunca en puntos fijos, para aprovechar tablets sin objetos microscópicos ni recortados.

### 3.1 Revienta Burbujas

- **Objetivo**: estimulación causa-efecto de baja exigencia cognitiva; regulación por repetición.
- **Interacción**: burbujas de distinto tamaño y color suben lentamente por la pantalla; tocar una la revienta con una animación de partículas suave y un sonido "pop" corto.
- **Mecánica**: sin turnos, sin fin definido — sesión libre hasta que el niño sale. Cada cierto intervalo aparecen nuevas burbujas desde abajo.
- **Estímulos**: color y tamaño configurables; velocidad de ascenso configurable (lenta por defecto).
- **Configuración**: cantidad máxima de burbujas simultáneas en pantalla (para no saturar visualmente), paleta de colores.
- **Dificultad**: no aplica (no es un juego de habilidad) — el único parámetro es ritmo/densidad.
- **Reducción de estímulos**: con `reduceMotion` activo, las burbujas no "suben" — aparecen ya en posición fija y estática, y se revientan igual al tocar, eliminando el movimiento continuo.

### 3.2 Sigue la Luz

- **Objetivo**: atención sostenida y seguimiento visual/motor fino.
- **Interacción**: un punto de luz suave se mueve por la pantalla en trayectorias simples (línea, círculo); el niño arrastra el dedo para "mantenerse" sobre la luz.
- **Mecánica**: no hay "perder el rastro" penalizado — si el dedo se aleja, la luz simplemente espera/ralentiza en vez de desaparecer.
- **Estímulos**: color de la luz, velocidad y patrón de movimiento configurables.
- **Configuración**: patrón (línea horizontal, círculo, forma libre), velocidad.
- **Dificultad**: la velocidad y la complejidad del patrón son los únicos parámetros; sin niveles con puntaje.
- **Reducción de estímulos**: `reduceMotion` cambia el patrón a "la luz aparece en un punto, el niño la toca, aparece en el siguiente punto" (discreto en vez de continuo).

### 3.3 Colores y Formas

- **Objetivo**: discriminación visual y vocabulario de color/forma (con posible cruce a Mi Voz: al acertar, se puede hablar el nombre en voz alta).
- **Interacción**: se muestra una forma/color "modelo" arriba y 3-4 opciones abajo; tocar la que coincide da refuerzo visual+sonoro positivo (nunca negativo si se toca otra).
- **Mecánica**: rondas cortas autoiniciadas por el niño (tocar "otra" para la siguiente), sin temporizador de presión.
- **Estímulos**: set de colores/formas configurable (excluir colores específicos si es necesario).
- **Configuración**: modo "solo color", "solo forma", o "color y forma combinados"; cantidad de opciones simultáneas (2 a 4).
- **Dificultad**: cantidad de opciones y si se combina color+forma.
- **Reducción de estímulos**: sin confeti/parpadeo en el acierto; refuerzo = contorno suave + sonido corto opcional.

### 3.4 Trazos Calmados

- **Objetivo**: regulación sensorial táctil libre, sin objetivo de "acertar" — equivalente digital de dibujar con el dedo en arena.
- **Interacción**: lienzo en pantalla completa; el dedo deja un trazo de color con estela suave que se desvanece lentamente o queda fijo, según preferencia.
- **Mecánica**: sin turnos ni fin; botón "Limpiar lienzo" opcional y explícito (nunca automático, para no generar frustración de "borré sin querer" en un dispositivo compartido).
- **Estímulos**: grosor y color de trazo configurables, textura del trazo (sólido/degradado).
- **Configuración**: paleta de colores disponible, si el trazo se desvanece con el tiempo o permanece.
- **Dificultad**: no aplica.
- **Adaptación a tablet**: el área de lienzo es 100% del espacio disponible tras la barra universal — esta es la experiencia que más se beneficia de una pantalla grande.

### 3.5 Clasificación Visual

- **Objetivo**: categorización y razonamiento visual (agrupar por atributo: tamaño, color, tipo de objeto).
- **Interacción**: objetos aparecen en el centro; el niño los arrastra a una de 2-3 "cestas" o zonas marcadas según la regla activa (p. ej. "grande vs. pequeño").
- **Mecánica**: no hay error terminal — si un objeto se suelta en la cesta incorrecta, vuelve suavemente al centro para reintentar, sin mensaje negativo.
- **Estímulos**: cantidad de categorías simultáneas (2 o 3), tipo de objetos (formas abstractas o iconos de vocabulario AAC, cruzando con Mi Voz).
- **Configuración**: regla de clasificación activa, cantidad de objetos por ronda.
- **Dificultad**: cantidad de categorías y similitud entre objetos.
- **Adaptación a tablet**: zonas de destino más separadas y objetos más grandes en pantallas anchas, para favorecer motricidad gruesa en niños con dificultades de precisión.

### 3.6 Ritmo Suave

- **Objetivo**: regulación auditivo-motora mediante imitación de patrones rítmicos simples y suaves (no un juego de ritmo competitivo tipo "no falles el beat").
- **Interacción**: un elemento visual "late" en un patrón simple (ej. 3 toques); el niño toca la pantalla siguiendo el patrón a su propio ritmo, sin ventana de tiempo estricta.
- **Mecánica**: el patrón se repite hasta que el niño lo reproduce una vez, sin límite de intentos ni penalización por desfase.
- **Estímulos**: sonido suave tipo tambor/campana, nunca percusión agresiva; volumen controlado por el volumen general del dispositivo/perfil.
- **Configuración**: complejidad del patrón (2 a 5 toques), velocidad del patrón modelo.
- **Dificultad**: longitud del patrón únicamente.
- **Reducción de estímulos**: con `soundEnabled` desactivado, el patrón se muestra 100% visual (parpadeo suave sincronizado) sin depender del audio.

---

## 4. Calma 360 — módulo regulatorio real

**Diagnóstico** (auditoría §1.3): hoy es únicamente `QuickCommunication` — una grilla de 15 frases de emergencia con TTS. Se conserva íntegramente (es útil y funcional) pero pasa a ser **una de varias secciones** dentro de un módulo más amplio, no el módulo completo.

### 4.1 Estructura de la pantalla Calma 360

```
Calma 360
├── Respiración guiada          (nuevo)
├── Pantalla de baja estimulación (nuevo)
├── Sonidos calmantes            (nuevo)
├── Frases rápidas de emergencia (existente, se conserva)
└── Acceso a Mundo Sensorial     (existente, se conserva como salida alternativa)
```

### 4.2 Respiración visual guiada (nuevo)

- **Mecánica**: una "burbuja de respiración" que crece y se encoge en pantalla, sincronizada con un patrón de inhalar/sostener/exhalar (por defecto 4-4-4 segundos, configurable).
- **Implementación técnica**: no requiere ninguna librería nueva — `Animated` de React Native (ya incluido en `react-native`, sin dependencia adicional) es suficiente para una interpolación de escala en bucle. Esto resuelve directamente la limitación detectada en la auditoría (§1.3: "no hay ninguna librería de animación instalada") sin necesitar `reanimated` para este caso concreto.
- **Cuenta regresiva y temporizador visual**: número grande superpuesto o marcas alrededor de la burbuja indicando cuánto falta para el siguiente cambio de fase (inhalar → sostener → exhalar).
- **Configurable**: duración de cada fase, número de ciclos objetivo (o "libre" sin límite), con opción de que el adulto fije un preset por perfil desde Centro de Adultos.
- **Reducción de estímulos**: con `reduceMotion` activo, la burbuja no se anima de forma continua — cambia de tamaño en pasos discretos marcados por el temporizador (crece de golpe al empezar cada fase), conservando la utilidad regulatoria sin movimiento fluido continuo.
- **Salida inmediata**: en cualquier momento, un toque fuera de la burbuja o el botón "🏠 Inicio" universal detiene el ejercicio sin pedir confirmación (a diferencia de acciones destructivas, salir de un ejercicio de calma nunca debe tener fricción).

### 4.3 Pantalla de baja estimulación (nuevo)

Una pantalla deliberadamente casi vacía: fondo de un solo color suave (elegible entre 3-4 tonos de la paleta), sin texto salvo un único botón grande de salida, pensada para sobreestimulación severa donde incluso los otros módulos de Calma son "demasiado". Es la opción de menor exigencia cognitiva de todo el producto.

### 4.4 Sonidos calmantes (nuevo)

- 3-5 pistas de audio de ambiente (lluvia suave, olas, tono binaural simple, silencio con temporizador) empaquetadas localmente en `assets/sounds/` (hoy vacío salvo `.gitkeep`).
- Control de volumen dedicado dentro del módulo (independiente del volumen del dispositivo, para que un adulto pueda fijar un tope máximo desde Centro de Adultos si es necesario).
- Reproducción en bucle con `expo-audio`; se detiene automáticamente al salir del módulo (nunca sigue sonando en segundo plano sin que el usuario lo sepa).

### 4.5 Frases rápidas de emergencia (existente, se mantiene)

Se conserva `QuickCommunication`/`EMERGENCY_VOCABULARY` tal cual, con la cobertura ya correcta de la auditoría ("Necesito espacio", "Demasiado ruido", "Necesito ayuda", "Quiero salir", etc. — ya presentes en `data/emergencyVocabulary.ts`). Único cambio: pasa a ser una sub-sección de Calma 360 en vez de la pantalla completa.

### 4.6 Acceso universal (cierre del hallazgo de auditoría)

Como se especifica en §1.2, el acceso a Calma 360 deja de depender de estar dentro de Mi Voz. Esto es, junto con Mundo Sensorial, el cambio de mayor impacto de esta reconstrucción respecto al estado actual.

---

## 5. Mi Día / Rutinas

**Diagnóstico** (auditoría §1.4, §6.2): ya es la funcionalidad más cercana a "terminada" de las cuatro columnas nuevas (~75%). Se extiende, no se reconstruye.

### 5.1 Qué se conserva

Todo el modelo de datos y CRUD actual (`useRoutines`, `routinesRepository`, pasos ordenables, indicador Primero/Después, botón Hecho) — es correcto y se mantiene como base.

### 5.2 Extensiones especificadas

1. **Reinicio automático por día** (cierra el hallazgo §6.2 de la auditoría): cada `DailyRoutine` gana un campo `resetPolicy: 'manual' | 'daily'`. Con `'daily'` (nuevo default para rutinas nuevas), al abrir Mi Día la app compara la fecha del último reinicio (`lastResetAt`) contra la fecha actual del dispositivo; si cambió el día, resetea `step.done = false` automáticamente antes de mostrar la rutina, sin necesidad de que nadie toque "Reiniciar rutina". El botón manual se conserva para el caso `'manual'` y como acción explícita disponible siempre.
2. **Plantillas de franja horaria**: al crear una rutina desde Centro de Adultos, ofrecer plantillas iniciales — Mañana, Escuela, Tarde, Noche — cada una con pasos sugeridos editables (no bloqueados), acelerando la configuración inicial sin quitarle control al adulto.
3. **Fotografías y pictogramas por paso**: hoy cada paso es solo `emoji + texto` (`RoutineStep`, `features/daily-routine/types.ts`). Se añade `imageUri?` (foto tomada/elegida por el adulto, mismo patrón que tarjetas AAC) y `pictogramId?` (reutilizando el set de pictogramas de §2.3) como alternativas al emoji, con la misma prioridad de renderizado que las tarjetas AAC (foto → pictograma → emoji).
4. **Temporizador opcional por paso**: un paso puede tener una duración sugerida (ej. "Cepillarme los dientes — 2 min"); al marcarlo, se muestra un temporizador visual simple (reutiliza el mismo patrón de "burbuja"/cuenta regresiva de Calma 360, §4.2) — no bloquea el avance, es solo apoyo visual.
5. **Recompensa visual opcional al completar la rutina completa** (no por paso individual, para no convertir la rutina en un sistema de puntos): una animación breve y suave (nunca ruidosa) al marcar el último paso, configurable como on/off por perfil desde Centro de Adultos — porque no todos los niños responden bien a un refuerzo visual sorpresivo.

---

## 6. Centro de Adultos

Renombra y expande `parent-mode` ("Modo Adulto" → "Centro de Adultos", nombre que comunica mejor su función de administración integral).

### 6.1 Acceso protegido

- Se conserva el PIN de 4 dígitos (`PinGateScreen`, `pinRepository`) como barrera parental — decisión de diseño ya correcta y documentada en `docs/GOOGLE_PLAY_COMPLIANCE.md`.
- **Recuperación segura de PIN (nuevo, cierra hallazgo P0 de la auditoría)**: al configurar el PIN por primera vez, se pide opcionalmente una "pregunta de respaldo" simple (o, más robusto: un código de recuperación de un solo uso generado en pantalla que el adulto debe guardar fuera de la app — foto, papel). Si el adulto olvida el PIN, `PinGateScreen` ofrece "¿Olvidaste tu PIN?" → valida el código de recuperación → permite fijar un PIN nuevo sin borrar ningún dato del dispositivo. Esto es preferible a un "PIN maestro" fijo de fábrica (que sería un problema de seguridad conocido y buscable en internet) y no requiere backend.

### 6.2 Secciones del Centro de Adultos

```
Centro de Adultos
├── Perfiles                    (existente: alta/edición/eliminación)
├── Mi Voz — Tarjetas            (existente: AacManagerScreen)
├── Mi Voz — Ajustes             (existente: AacSettingsScreen, + idioma/voz nuevo)
├── Mundo Sensorial — Ajustes    (nuevo: velocidad, densidad, colores por juego)
├── Calma 360 — Ajustes          (nuevo: presets de respiración, volumen máximo)
├── Mi Día — Rutinas             (existente: RoutineManagerScreen, + plantillas nuevas)
├── Estadísticas de uso          (nuevo, ver 6.3)
├── Copia de seguridad           (nuevo, ver docs de persistencia §7 y R7)
├── Privacidad y datos           (nuevo, ver 6.4)
├── Acerca de / Soporte          (nuevo, ver 6.5)
└── Cambiar PIN / Cerrar sesión de adulto
```

### 6.3 Estadísticas útiles (nuevo)

No un dashboard de vanidad — datos que un terapeuta/padre realmente usaría: palabras más usadas por semana (ya hay `usageCount`/`lastUsedAt` en el modelo de datos, solo falta agregación y visualización), rachas de rutinas completadas, tiempo aproximado de uso por módulo. Sin ranking competitivo entre perfiles, sin gamificación agresiva — son datos de seguimiento, no un juego para el adulto.

### 6.4 Privacidad y datos (nuevo, cierra hallazgo P0 de la auditoría)

Pantalla con: qué datos se guardan (perfiles, tarjetas, fotos, audios, rutinas — todo listado explícitamente), confirmación de que nada sale del dispositivo (coherente con el principio offline-first ya documentado en `docs/GOOGLE_PLAY_COMPLIANCE.md`), enlace a política de privacidad pública (texto estático embebido en la app además de la URL, para que funcione offline), y **botón de eliminación total de datos** con doble confirmación explícita (borra todos los perfiles, tarjetas, fotos, audios y ajustes del dispositivo — no reversible, se advierte con el mismo peso que cualquier acción destructiva del sistema).

### 6.5 Acerca de / Soporte (nuevo)

Versión de la app, changelog resumido, canal de contacto/soporte (correo o formulario, sin chat en vivo — coherente con el principio "sin chat" de `docs/ARCHITECTURE.md`), créditos del set de pictogramas (requisito de atribución si se adopta Mulberry Symbols, ver §2.3).

### 6.6 Control parental adicional

Habilitar/deshabilitar módulos completos por perfil (ej. desactivar Mundo Sensorial para un perfil donde el terapeuta prefiere que el niño no tenga acceso a juegos en una sesión concreta) — extiende el mismo patrón de toggles que ya existe en `ChildProfilePreferences`.

---

## 7. Datos y persistencia

### 7.1 Diagnóstico

La auditoría (§8) detectó riesgo real de pérdida total: todo vive en `AsyncStorage`, sin backup, sin exportación, con manejo de corrupción que "resuelve" un dato corrupto tratándolo como inexistente y re-sembrando datos por defecto sin avisar al usuario.

### 7.2 Opciones evaluadas

| Opción | Ventajas | Desventajas | Recomendación |
|---|---|---|---|
| **Mantener AsyncStorage tal cual** | Cero costo de migración | No soporta consultas, no es transaccional entre múltiples claves relacionadas (riesgo de estado parcialmente escrito), no escala bien más allá de unos pocos MB, sin motor de migración de esquema | Descartado |
| **`expo-sqlite`** (SQLite embebido) | Transaccional, consultable, motor de migraciones maduro (librerías como `drizzle-orm` o migraciones manuales versionadas), probado en apps offline-first de este tamaño, sin dependencias nativas fuera del ecosistema Expo | Requiere reescribir la capa de repositorios (`services/storage/*`) | **Recomendada** |
| **MMKV** (`react-native-mmkv`) | Muy rápido para pares clave-valor | Mismo problema de fondo que AsyncStorage para datos relacionales (perfiles↔tarjetas↔rutinas); no resuelve el problema real | Descartado como reemplazo principal; válido solo para flags pequeños si se quisiera optimizar lectura en caliente, no prioritario |
| **WatermelonDB / Realm** | Reactivo, pensado para apps offline-first grandes | Mayor complejidad y peso de dependencia de la que el tamaño actual del producto justifica; Realm tiene consideraciones de licencia a revisar | Descartado por sobre-ingeniería para el tamaño de este producto |
| **Backend/cloud propio** | Sincronización multi-dispositivo, backup automático fuera del dispositivo | Contradice el principio offline-first explícito del proyecto (`docs/ARCHITECTURE.md`), introduce superficie de recolección de datos que complica cumplimiento Google Play Families, coste de mantenimiento de servidor | **Descartado para esta reconstrucción**; ver §7.5 como posible fase futura opcional, fuera de alcance |

### 7.3 Arquitectura recomendada

1. **Motor de datos estructurados**: `expo-sqlite`, con un esquema versionado (`schema_version` como tabla de control) y un runner de migraciones simple ejecutado al arrancar `RootApp` antes de montar la navegación.
2. **Medios (fotos, audio)**: se mantienen como archivos reales en `expo-file-system` (documento directory de la app), **nunca** como blobs en la base de datos — la base de datos solo guarda la ruta/URI, igual patrón que ya usa `imageUri` hoy.
3. **Capa de repositorio estable**: `services/storage/*` se reescribe para exponer la misma interfaz pública que ya consumen los hooks (`useAacCards`, `useRoutines`, `ProfilesContext`) — el cambio de motor de persistencia es invisible para los componentes de UI, minimizando el radio de la reescritura.
4. **`AsyncStorage` no desaparece del todo**: se conserva únicamente para 2-3 flags escalares muy pequeños donde una base de datos es sobre-ingeniería (ej. "¿ya se mostró la pantalla de bienvenida?", PIN hasheado si se decide no meterlo en la base relacional).
5. **PIN**: se recomienda además pasar de texto plano (`pinRepository.ts` hoy) a un hash (ej. SHA-256 con salt simple) — sigue sin ser "seguridad criptográfica" de nivel bancario (correcto, no lo necesita), pero elimina la exposición innecesaria de un PIN en texto plano legible por cualquier herramienta de inspección de almacenamiento del dispositivo.

### 7.4 Backup, exportación, importación (nuevo — prioridad P0 de la auditoría)

1. **Formato**: un archivo `.sp360backup` (contenedor ZIP) que incluye un volcado JSON de todas las tablas relevantes (perfiles, tarjetas, rutinas, preferencias, estadísticas) más una carpeta con las fotos y audios referenciados.
2. **Exportar**: desde Centro de Adultos → "Copia de seguridad" → genera el archivo con `expo-file-system` y lo entrega vía la hoja de compartir nativa (`expo-sharing`) para que el adulto lo guarde donde prefiera (Drive, correo, almacenamiento local) — sin subir nada a un servidor propio.
3. **Importar/restaurar**: desde el mismo panel, seleccionar un archivo `.sp360backup` (selector de documentos del sistema) → valida versión de esquema → si es una versión anterior, ejecuta las migraciones necesarias sobre los datos importados antes de escribirlos → reemplaza o combina (a elección explícita del adulto: "reemplazar todo" vs. "agregar como perfiles nuevos") con doble confirmación antes de sobrescribir cualquier dato existente.
4. **Exportación por perfil**: opción de exportar un único perfil (útil para un terapeuta que maneja varios dispositivos de un mismo niño, o para transferir un perfil a un dispositivo nuevo sin llevarse los demás).
5. **Corrupción de datos**: a diferencia del comportamiento silencioso actual (`asyncStorage.ts:9-14`), cualquier error de lectura del motor SQLite o de un archivo de medios referenciado debe **notificarse visiblemente** en Centro de Adultos (no silenciarse ni re-sembrar datos por defecto sin aviso) — esto es un cambio de comportamiento explícito respecto a hoy.

### 7.5 Fuera de alcance de esta reconstrucción

Sincronización en la nube multi-dispositivo, cuentas de usuario, backend propio. Quedan documentados aquí como posible evolución futura opcional, condicionados a una decisión de producto separada que reevalúe el principio offline-first — **no se implementan en R1-R10**.
